/**
 * Real-time audio effects chain for the Oracle's voice.
 * Applies per-phase EQ, convolution reverb, random echo bursts, and robot bursts
 * via Web Audio API — no MP3 regeneration needed.
 *
 * Signal flow:
 *   TTS source → effectsInput → lowShelf EQ → highShelf EQ →┬→ dryGain ──────────────→ gainNode → destination
 *                                                             ├→ convolver → wetGain ───→↑
 *                                                             ├→ stutter delay ⇄ fb → stutterWet →↑
 *                                                             └→ robotGain (×osc) → robotWet ───→↑
 *
 * Echo bursts: A separate delay node that randomly activates for 1-2s every 8-15s
 * during narration, creating unpredictable "glitch oracle" echo moments.
 *
 * Robot bursts: Ring modulation (signal × oscillator) that randomly activates for 0.6-1.4s
 * every 12-22s, creating brief metallic/robotic voice moments.
 *
 * The analyser (for the reactive orb) taps gainNode, so it sees the effected signal.
 * Ambient audio bypasses this chain entirely (connects direct to destination).
 */

import type { NarrativePhase } from '@/types';
import { getAudioContext, getGainNode, getEffectsInput } from '@/lib/audio/audioContext';

interface PhasePreset {
  bassGain: number;       // dB, low-shelf at 200Hz
  trebleGain: number;     // dB, high-shelf at 4000Hz
  reverbDuration: number; // IR length in seconds
  reverbDecay: number;    // exponential decay power (higher = faster decay)
  reverbWet: number;      // 0-1 wet gain
  reverbDry: number;      // 0-1 dry gain
}

const PRESETS: Record<NarrativePhase, PhasePreset> = {
  // Base oracle voice. Cathedral reverb, warm bass, slightly rolled-off treble.
  // All other phases are subtle variations from this.
  APRESENTACAO: {
    bassGain: 3, trebleGain: -2,
    reverbDuration: 3.5, reverbDecay: 2.5, reverbWet: 0.32, reverbDry: 0.78,
  },
  // Slightly darker — a touch more bass, bit less treble.
  INFERNO: {
    bassGain: 4, trebleGain: -3,
    reverbDuration: 3.0, reverbDecay: 2.8, reverbWet: 0.30, reverbDry: 0.78,
  },
  // Slightly cooler — neutral bass, gentle high-cut.
  PURGATORIO: {
    bassGain: 2, trebleGain: -2.5,
    reverbDuration: 3.5, reverbDecay: 2.6, reverbWet: 0.31, reverbDry: 0.78,
  },
  // Slightly brighter/airier — less bass, touch more treble.
  PARAISO: {
    bassGain: 1, trebleGain: -1,
    reverbDuration: 3.8, reverbDecay: 2.3, reverbWet: 0.34, reverbDry: 0.76,
  },
  // Close to base — warm and present.
  DEVOLUCAO: {
    bassGain: 3, trebleGain: -1.5,
    reverbDuration: 3.0, reverbDecay: 2.5, reverbWet: 0.29, reverbDry: 0.80,
  },
  // Drying out — less reverb, returning to reality.
  ENCERRAMENTO: {
    bassGain: 1, trebleGain: -1,
    reverbDuration: 2.0, reverbDecay: 3.0, reverbWet: 0.18, reverbDry: 0.88,
  },
};

// ── Echo burst config ────────────────────────────────────────────
// Random echo bursts fire during narration to reinforce the "not human" feel.
// Each burst activates the stutter delay for a short window, then fades out.

/** Min/max seconds between echo bursts */
const BURST_INTERVAL_MIN = 8;
const BURST_INTERVAL_MAX = 15;
/** How long the echo stays active (seconds) */
const BURST_DURATION_MIN = 0.8;
const BURST_DURATION_MAX = 1.8;
/** Delay time range for echo bursts (seconds) */
const BURST_DELAY_MIN = 0.12;
const BURST_DELAY_MAX = 0.35;
/** Feedback range (0-1) — how many repeats */
const BURST_FEEDBACK_MIN = 0.25;
const BURST_FEEDBACK_MAX = 0.45;
/** Wet level when burst is active */
const BURST_WET = 0.18;
/** Ramp time to fade burst in/out (seconds) */
const BURST_RAMP = 0.15;

// ── Robot burst config ───────────────────────────────────────────
// Ring modulation bursts: multiply voice by a sine oscillator for metallic/robotic moments.
// Staggered timing from echo bursts so they interleave rather than overlap.

/** Min/max seconds between robot bursts */
const ROBOT_INTERVAL_MIN = 12;
const ROBOT_INTERVAL_MAX = 22;
/** How long the robot effect stays active (seconds) */
const ROBOT_DURATION_MIN = 0.6;
const ROBOT_DURATION_MAX = 1.4;
/** Ring modulator carrier frequency range (Hz) — lower = deep robot, higher = metallic */
const ROBOT_FREQ_MIN = 40;
const ROBOT_FREQ_MAX = 150;
/** Wet level when robot burst is active — subtle blend */
const ROBOT_WET = 0.22;
/** Ramp time to fade robot burst in/out (seconds) */
const ROBOT_RAMP = 0.12;

/** Transition time in seconds for smooth parameter crossfade between phases */
const PHASE_RAMP_TIME = 2.0;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

class OracleEffectsChain {
  private ctx: AudioContext;
  private lowShelf: BiquadFilterNode;
  private highShelf: BiquadFilterNode;
  private convolver: ConvolverNode;
  private dryGain: GainNode;
  private wetGain: GainNode;
  // Stutter echo (for random bursts)
  private stutterDelay: DelayNode;
  private stutterFeedback: GainNode;
  private stutterWet: GainNode;
  // Ring modulator (for robot bursts)
  private robotGain: GainNode;
  private robotWet: GainNode;
  private robotOsc: OscillatorNode | null = null;
  private reverbBuffers = new Map<NarrativePhase, AudioBuffer>();
  // Burst scheduling
  private burstTimer: ReturnType<typeof setTimeout> | null = null;
  private burstActive = false;
  private stutterRunning = false;
  // Robot burst scheduling
  private robotTimer: ReturnType<typeof setTimeout> | null = null;
  private robotBurstActive = false;
  private robotRunning = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    // EQ nodes
    this.lowShelf = ctx.createBiquadFilter();
    this.lowShelf.type = 'lowshelf';
    this.lowShelf.frequency.value = 200;

    this.highShelf = ctx.createBiquadFilter();
    this.highShelf.type = 'highshelf';
    this.highShelf.frequency.value = 4000;

    // Reverb (convolution)
    this.convolver = ctx.createConvolver();

    // Dry/wet mix
    this.dryGain = ctx.createGain();
    this.wetGain = ctx.createGain();

    // Stutter echo node (for bursts)
    this.stutterDelay = ctx.createDelay(1.0);
    this.stutterFeedback = ctx.createGain();
    this.stutterWet = ctx.createGain();
    // Start silent — bursts activate it temporarily
    this.stutterFeedback.gain.value = 0;
    this.stutterWet.gain.value = 0;
    this.stutterDelay.delayTime.value = 0.2;

    // Ring modulator node (for robot bursts)
    // Signal passes through robotGain whose gain is modulated by an oscillator.
    // When gain oscillates at audio rate (40-150Hz), it creates ring modulation.
    this.robotGain = ctx.createGain();
    this.robotGain.gain.value = 0; // Silent until burst fires
    this.robotWet = ctx.createGain();
    this.robotWet.gain.value = 0;

    // Pre-generate impulse responses for all phases
    for (const [phase, preset] of Object.entries(PRESETS)) {
      this.reverbBuffers.set(
        phase as NarrativePhase,
        this.createReverbIR(preset.reverbDuration, preset.reverbDecay)
      );
    }

    // Set initial convolver buffer before wiring
    const initialIR = this.reverbBuffers.get('APRESENTACAO');
    if (initialIR) {
      this.convolver.buffer = initialIR;
    }

    this.wireChain();
    this.applyPreset('APRESENTACAO', true);
  }

  /**
   * Generate a synthetic impulse response for convolution reverb.
   * Uses exponential-decay noise with early reflections.
   */
  private createReverbIR(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Exponential decay envelope
        const envelope = Math.pow(1 - t, decay);
        // Early reflections in first 50ms — adds spatial cues
        const earlyZone = sampleRate * 0.05;
        const early = i < earlyZone
          ? Math.sin(i * 0.1) * 0.3 * (1 - i / earlyZone)
          : 0;
        data[i] = ((Math.random() * 2 - 1) * envelope + early) * 0.5;
      }
    }

    return buffer;
  }

  /**
   * Wire effects between effectsInput and gainNode.
   * Disconnects the default passthrough and inserts the full chain.
   */
  private wireChain() {
    const effectsInput = getEffectsInput();
    const gainNode = getGainNode();
    if (!effectsInput || !gainNode) return;

    // Remove default passthrough (effectsInput → gainNode)
    effectsInput.disconnect();

    // EQ: effectsInput → lowShelf → highShelf
    effectsInput.connect(this.lowShelf);
    this.lowShelf.connect(this.highShelf);

    // Dry path: highShelf → dryGain → gainNode
    this.highShelf.connect(this.dryGain);
    this.dryGain.connect(gainNode);

    // Wet path (reverb): highShelf → convolver → wetGain → gainNode
    this.highShelf.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(gainNode);

    // Stutter echo path: highShelf → stutterDelay → stutterFeedback → stutterDelay (loop)
    //                                             → stutterWet → gainNode
    this.highShelf.connect(this.stutterDelay);
    this.stutterDelay.connect(this.stutterFeedback);
    this.stutterFeedback.connect(this.stutterDelay);
    this.stutterDelay.connect(this.stutterWet);
    this.stutterWet.connect(gainNode);

    // Ring modulator path: highShelf → robotGain (gain modulated by osc) → robotWet → gainNode
    this.highShelf.connect(this.robotGain);
    this.robotGain.connect(this.robotWet);
    this.robotWet.connect(gainNode);
  }

  /**
   * Apply a phase preset. Parameters ramp smoothly over PHASE_RAMP_TIME seconds.
   * On init (immediate=true), values are set instantly.
   */
  private applyPreset(phase: NarrativePhase, immediate = false) {
    const preset = PRESETS[phase];
    const now = this.ctx.currentTime;

    if (immediate) {
      this.lowShelf.gain.setValueAtTime(preset.bassGain, now);
      this.highShelf.gain.setValueAtTime(preset.trebleGain, now);
      this.dryGain.gain.setValueAtTime(preset.reverbDry, now);
      this.wetGain.gain.setValueAtTime(preset.reverbWet, now);
    } else {
      // Cancel any in-progress ramps first
      this.lowShelf.gain.cancelScheduledValues(now);
      this.highShelf.gain.cancelScheduledValues(now);
      this.dryGain.gain.cancelScheduledValues(now);
      this.wetGain.gain.cancelScheduledValues(now);

      // Set current value as starting point for ramp
      this.lowShelf.gain.setValueAtTime(this.lowShelf.gain.value, now);
      this.highShelf.gain.setValueAtTime(this.highShelf.gain.value, now);
      this.dryGain.gain.setValueAtTime(this.dryGain.gain.value, now);
      this.wetGain.gain.setValueAtTime(this.wetGain.gain.value, now);

      // Ramp to new values
      this.lowShelf.gain.linearRampToValueAtTime(preset.bassGain, now + PHASE_RAMP_TIME);
      this.highShelf.gain.linearRampToValueAtTime(preset.trebleGain, now + PHASE_RAMP_TIME);
      this.dryGain.gain.linearRampToValueAtTime(preset.reverbDry, now + PHASE_RAMP_TIME);
      this.wetGain.gain.linearRampToValueAtTime(preset.reverbWet, now + PHASE_RAMP_TIME);
    }

    // Swap reverb IR (takes effect on new audio; old tail continues naturally)
    const ir = this.reverbBuffers.get(phase);
    if (ir) {
      this.convolver.buffer = ir;
    }
  }

  // ── Echo burst system ────────────────────────────────────────

  /** Fire a single echo burst: ramp stutter in → hold → ramp out */
  private fireBurst() {
    if (this.burstActive) return;
    this.burstActive = true;

    const now = this.ctx.currentTime;
    const delayTime = rand(BURST_DELAY_MIN, BURST_DELAY_MAX);
    const feedback = rand(BURST_FEEDBACK_MIN, BURST_FEEDBACK_MAX);
    const duration = rand(BURST_DURATION_MIN, BURST_DURATION_MAX);

    // Set delay parameters
    this.stutterDelay.delayTime.setValueAtTime(delayTime, now);

    // Ramp in
    this.stutterFeedback.gain.cancelScheduledValues(now);
    this.stutterWet.gain.cancelScheduledValues(now);
    this.stutterFeedback.gain.setValueAtTime(0, now);
    this.stutterWet.gain.setValueAtTime(0, now);
    this.stutterFeedback.gain.linearRampToValueAtTime(feedback, now + BURST_RAMP);
    this.stutterWet.gain.linearRampToValueAtTime(BURST_WET, now + BURST_RAMP);

    // Ramp out after duration
    const endTime = now + duration;
    this.stutterFeedback.gain.setValueAtTime(feedback, endTime);
    this.stutterWet.gain.setValueAtTime(BURST_WET, endTime);
    this.stutterFeedback.gain.linearRampToValueAtTime(0, endTime + BURST_RAMP);
    this.stutterWet.gain.linearRampToValueAtTime(0, endTime + BURST_RAMP);

    // Mark burst as done after full duration + tail
    setTimeout(() => {
      this.burstActive = false;
    }, (duration + BURST_RAMP * 2) * 1000);
  }

  /** Schedule the next random echo burst */
  private scheduleNextBurst() {
    if (!this.stutterRunning) return;

    const interval = rand(BURST_INTERVAL_MIN, BURST_INTERVAL_MAX);
    this.burstTimer = setTimeout(() => {
      if (!this.stutterRunning) return;
      this.fireBurst();
      this.scheduleNextBurst();
    }, interval * 1000);
  }

  /** Start random echo bursts (call when narration begins) */
  startEchoBursts() {
    if (this.stutterRunning) return;
    this.stutterRunning = true;
    this.scheduleNextBurst();
  }

  /** Stop random echo bursts (call when narration stops / AGUARDANDO / FIM) */
  stopEchoBursts() {
    this.stutterRunning = false;
    if (this.burstTimer) {
      clearTimeout(this.burstTimer);
      this.burstTimer = null;
    }
    // Fade out any active burst immediately
    if (this.burstActive) {
      const now = this.ctx.currentTime;
      this.stutterFeedback.gain.cancelScheduledValues(now);
      this.stutterWet.gain.cancelScheduledValues(now);
      this.stutterFeedback.gain.setValueAtTime(this.stutterFeedback.gain.value, now);
      this.stutterWet.gain.setValueAtTime(this.stutterWet.gain.value, now);
      this.stutterFeedback.gain.linearRampToValueAtTime(0, now + BURST_RAMP);
      this.stutterWet.gain.linearRampToValueAtTime(0, now + BURST_RAMP);
      this.burstActive = false;
    }
  }

  // ── Robot burst system ──────────────────────────────────────

  /**
   * Fire a single robot burst: create oscillator → ramp ring mod in → hold → ramp out → destroy oscillator.
   * Each burst creates a fresh OscillatorNode at a random frequency.
   */
  private fireRobotBurst() {
    if (this.robotBurstActive) return;
    this.robotBurstActive = true;

    const now = this.ctx.currentTime;
    const freq = rand(ROBOT_FREQ_MIN, ROBOT_FREQ_MAX);
    const duration = rand(ROBOT_DURATION_MIN, ROBOT_DURATION_MAX);

    // Create a fresh oscillator for this burst
    this.robotOsc = this.ctx.createOscillator();
    this.robotOsc.type = 'sine';
    this.robotOsc.frequency.setValueAtTime(freq, now);
    // Connect oscillator to modulate robotGain's gain parameter (ring modulation)
    this.robotOsc.connect(this.robotGain.gain);
    this.robotOsc.start(now);

    // Ramp wet in (the robotGain.gain is being oscillated, robotWet controls output level)
    this.robotWet.gain.cancelScheduledValues(now);
    this.robotWet.gain.setValueAtTime(0, now);
    this.robotWet.gain.linearRampToValueAtTime(ROBOT_WET, now + ROBOT_RAMP);

    // Ramp out after duration
    const endTime = now + duration;
    this.robotWet.gain.setValueAtTime(ROBOT_WET, endTime);
    this.robotWet.gain.linearRampToValueAtTime(0, endTime + ROBOT_RAMP);

    // Clean up oscillator after burst completes
    const totalMs = (duration + ROBOT_RAMP * 2) * 1000;
    setTimeout(() => {
      if (this.robotOsc) {
        this.robotOsc.stop();
        this.robotOsc.disconnect();
        this.robotOsc = null;
      }
      this.robotBurstActive = false;
    }, totalMs);
  }

  /** Schedule the next random robot burst */
  private scheduleNextRobotBurst() {
    if (!this.robotRunning) return;

    const interval = rand(ROBOT_INTERVAL_MIN, ROBOT_INTERVAL_MAX);
    this.robotTimer = setTimeout(() => {
      if (!this.robotRunning) return;
      this.fireRobotBurst();
      this.scheduleNextRobotBurst();
    }, interval * 1000);
  }

  /** Start random robot bursts (call when narration begins) */
  startRobotBursts() {
    if (this.robotRunning) return;
    this.robotRunning = true;
    this.scheduleNextRobotBurst();
  }

  /** Stop random robot bursts */
  stopRobotBursts() {
    this.robotRunning = false;
    if (this.robotTimer) {
      clearTimeout(this.robotTimer);
      this.robotTimer = null;
    }
    // Fade out any active robot burst immediately
    if (this.robotBurstActive) {
      const now = this.ctx.currentTime;
      this.robotWet.gain.cancelScheduledValues(now);
      this.robotWet.gain.setValueAtTime(this.robotWet.gain.value, now);
      this.robotWet.gain.linearRampToValueAtTime(0, now + ROBOT_RAMP);
      // Clean up oscillator
      setTimeout(() => {
        if (this.robotOsc) {
          this.robotOsc.stop();
          this.robotOsc.disconnect();
          this.robotOsc = null;
        }
        this.robotBurstActive = false;
      }, ROBOT_RAMP * 1000);
    }
  }

  /** Switch to a new phase's effects preset with smooth crossfade. */
  setPhase(phase: NarrativePhase) {
    this.applyPreset(phase, false);
  }
}

// ── Singleton API ──────────────────────────────────────────────

let instance: OracleEffectsChain | null = null;

/** Initialize the effects chain. Call after initAudioContext(). */
export function initEffectsChain(): void {
  const ctx = getAudioContext();
  if (!ctx || instance) return;
  instance = new OracleEffectsChain(ctx);
}

/** Switch effects to a new phase. Smooth 2s crossfade. */
export function setEffectsPhase(phase: NarrativePhase): void {
  if (instance) {
    instance.setPhase(phase);
  }
}

/** Start random echo bursts during narration. */
export function startEchoBursts(): void {
  if (instance) {
    instance.startEchoBursts();
  }
}

/** Stop random echo bursts (during silence, AGUARDANDO, FIM). */
export function stopEchoBursts(): void {
  if (instance) {
    instance.stopEchoBursts();
  }
}

/** Start random robot bursts during narration. */
export function startRobotBursts(): void {
  if (instance) {
    instance.startRobotBursts();
  }
}

/** Stop random robot bursts. */
export function stopRobotBursts(): void {
  if (instance) {
    instance.stopRobotBursts();
  }
}
