# Phase 30: Audio-Reactive Visual System - Research

**Researched:** 2026-03-29
**Domain:** Canvas API audio visualization + Web Audio API AnalyserNode integration
**Confidence:** HIGH

## Summary

Audio-reactive visual systems for web applications are a mature, well-documented domain with established patterns. The Web Audio API's `AnalyserNode` provides real-time frequency and time-domain audio data, while Canvas 2D API enables performant 60fps visualizations. For this phase, the project already has working infrastructure: `useWaveform` hook, `WaveformVisualizer` component, ambient audio crossfader, and phase-specific colors defined in constants.

The research confirms two viable approaches: **(1) Audio equalizer bars** using `getByteFrequencyData()` for vertical frequency bars that respond to TTS playback intensity, or **(2) Particle systems** using time-domain data to animate particles. Equalizer bars are simpler, more performant (Canvas 2D handles 2000+ bars at 60fps), and align better with the "audio-first" design philosophy—visuals should enhance, not compete with the Oracle's voice.

Phase-specific visual themes map cleanly to the existing `PHASE_COLORS` constant: Inferno (red `#4a0e0e` with fire-inspired particle motion), Purgatorio (slate blue `#3d4f5c` with mist/fog gradients), Paraiso (golden `#5c4a2a` with light rays/glow), and idle/bookend phases (black `#000000` with subtle ambient drifting particles). The existing 3-second ambient audio crossfade serves as the timing reference for visual transitions.

**Primary recommendation:** Implement full-screen Canvas equalizer with `getByteFrequencyData()`, phase-specific color gradients, smooth CSS opacity transitions matching the 3s audio crossfade, and idle state ambient particle drift. Test on event hardware (Chrome on Windows laptops) to validate 60fps performance before adding complexity.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Audio API | Browser native | Real-time audio analysis via AnalyserNode | W3C standard, universally supported, zero dependencies |
| Canvas 2D API | Browser native | High-performance 2D rendering | Hardware-accelerated, 60fps capable, mature ecosystem |
| React 19 | 19.0.0 (installed) | Component lifecycle + hooks for animation | Project standard, useEffect/useLayoutEffect for animation loops |
| Vitest + jsdom | 4.1.2 (installed) | Testing framework + DOM environment | Project standard, existing test infrastructure |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest-canvas-mock | 1.1.0 (latest) | Canvas API mock for Vitest | Required for testing Canvas components in jsdom |
| requestAnimationFrame polyfill | N/A (native) | 60fps animation loop | Already available in modern browsers, jsdom mocks it |
| CSS Transitions | Native | Phase transition crossfades | Simpler than JS tweening for opacity/background changes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Canvas 2D | WebGL / Three.js | WebGL handles 100k+ particles but adds 500KB+ bundle size, complexity, and GPU compatibility risk on event laptops. Canvas 2D sufficient for <5000 particles at 60fps. |
| AnalyserNode | Manual FFT calculation | AnalyserNode is hardware-optimized, battle-tested, and requires zero math. Manual FFT adds complexity with no benefit. |
| CSS Transitions | GSAP / Framer Motion | Animation libraries add 50-100KB for features not needed (spring physics, gesture handling). CSS transitions handle opacity/background crossfades natively. |
| Equalizer bars | Particle systems | Particles are visually richer but require more GPU, harder to debug, and may distract from voice. Bars are simpler, more performant, and clearly "audio-reactive." |

**Installation:**
```bash
npm install -D vitest-canvas-mock
```

**Version verification:** Checked 2026-03-29 via npm registry.
- `vitest-canvas-mock@1.1.0` — published 2024-12-13
- All core dependencies (React 19, Vitest 4.1.2) already installed

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── visuals/
│   │   ├── AudioReactiveBackground.tsx    # Full-screen canvas orchestrator
│   │   ├── EqualizerVisualizer.tsx        # Frequency bar visualization
│   │   ├── IdleAnimation.tsx              # Ambient particle drift
│   │   └── __tests__/                     # Component tests
│   └── experience/
│       └── OracleExperience.tsx           # Integrate background here
├── hooks/
│   ├── useAudioAnalyser.ts                # AnalyserNode creation + data fetching
│   ├── useAnimationFrame.ts               # requestAnimationFrame lifecycle hook
│   └── __tests__/                         # Hook tests
├── lib/
│   └── audio/
│       └── visualConfig.ts                # Phase-specific visual themes
└── types/
    └── index.ts                           # Extend with visual theme types
```

### Pattern 1: AnalyserNode Integration with Existing Audio Pipeline
**What:** Connect AnalyserNode to the project's existing `GainNode` (from `audioContext.ts`) to analyze TTS + ambient audio output without modifying the playback chain.

**When to use:** Always—this pattern preserves the existing audio architecture while adding read-only visualization data.

**Example:**
```typescript
// Source: MDN Web Audio API Visualizations
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

import { getAudioContext, getGainNode } from '@/lib/audio/audioContext';

export function useAudioAnalyser(fftSize: number = 256) {
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const audioContext = getAudioContext();
    const gainNode = getGainNode();
    if (!audioContext || !gainNode) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize; // Power of 2: 256, 512, 1024, 2048
    analyser.smoothingTimeConstant = 0.8; // 0-1, higher = smoother
    gainNode.connect(analyser); // Read-only tap, doesn't modify audio
    analyserRef.current = analyser;

    return () => {
      analyser.disconnect();
      analyserRef.current = null;
    };
  }, [fftSize]);

  return analyserRef;
}
```

### Pattern 2: requestAnimationFrame Loop with useLayoutEffect
**What:** Use `useLayoutEffect` (not `useEffect`) for animation loops to ensure cleanup runs synchronously before the next frame, preventing memory leaks.

**When to use:** Any Canvas animation that reads `AnalyserNode` data and draws to Canvas.

**Example:**
```typescript
// Source: CSS-Tricks Using requestAnimationFrame with React Hooks
// https://css-tricks.com/using-requestanimationframe-with-react-hooks/

export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  running: boolean
) {
  const frameIdRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!running) return;

    function animate(currentTime: number) {
      const deltaTime = currentTime - previousTimeRef.current;
      previousTimeRef.current = currentTime;
      callback(deltaTime);
      frameIdRef.current = requestAnimationFrame(animate);
    }

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [running, callback]);
}
```

### Pattern 3: Phase-Specific Visual Themes via Configuration
**What:** Extend the existing `PHASE_COLORS` pattern to include visual parameters (particle count, bar color gradients, motion intensity) per phase.

**When to use:** Map narrative phases to visual styles without hardcoding values in components.

**Example:**
```typescript
// Source: Project convention (PHASE_COLORS in src/types/index.ts)

import type { NarrativePhase } from '@/types';

interface VisualTheme {
  background: string;        // From existing PHASE_COLORS
  primaryColor: string;       // Equalizer bar color
  secondaryColor: string;     // Gradient accent
  particleCount: number;      // Idle state particles
  motionIntensity: number;    // 0-1 multiplier for movement speed
  blurAmount: number;         // px for atmospheric effects
}

export const VISUAL_THEMES: Record<NarrativePhase, VisualTheme> = {
  APRESENTACAO: {
    background: '#000000',
    primaryColor: 'rgba(255, 255, 255, 0.4)',
    secondaryColor: 'rgba(255, 255, 255, 0.1)',
    particleCount: 50,
    motionIntensity: 0.3,
    blurAmount: 0,
  },
  INFERNO: {
    background: '#4a0e0e',
    primaryColor: 'rgba(255, 70, 50, 0.8)',  // Red-orange
    secondaryColor: 'rgba(255, 200, 100, 0.4)', // Yellow
    particleCount: 80,
    motionIntensity: 0.7,
    blurAmount: 2,
  },
  PURGATORIO: {
    background: '#3d4f5c',
    primaryColor: 'rgba(100, 150, 200, 0.6)', // Muted blue
    secondaryColor: 'rgba(200, 220, 240, 0.3)', // Light mist
    particleCount: 60,
    motionIntensity: 0.4,
    blurAmount: 3,
  },
  PARAISO: {
    background: '#5c4a2a',
    primaryColor: 'rgba(255, 215, 100, 0.7)', // Gold
    secondaryColor: 'rgba(255, 245, 200, 0.4)', // Light glow
    particleCount: 40,
    motionIntensity: 0.5,
    blurAmount: 1,
  },
  DEVOLUCAO: {
    background: '#5c4a2a', // Continue Paraiso
    primaryColor: 'rgba(255, 215, 100, 0.7)',
    secondaryColor: 'rgba(255, 245, 200, 0.4)',
    particleCount: 40,
    motionIntensity: 0.5,
    blurAmount: 1,
  },
  ENCERRAMENTO: {
    background: '#000000',
    primaryColor: 'rgba(255, 255, 255, 0.4)',
    secondaryColor: 'rgba(255, 255, 255, 0.1)',
    particleCount: 50,
    motionIntensity: 0.3,
    blurAmount: 0,
  },
};
```

### Pattern 4: Equalizer Bars with getByteFrequencyData
**What:** Draw vertical bars representing frequency bins, scaled to canvas height based on amplitude.

**When to use:** Audio-reactive visualization that clearly shows TTS playback intensity.

**Example:**
```typescript
// Source: MDN AnalyserNode.getByteFrequencyData + Smashing Magazine
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData
// https://www.smashingmagazine.com/2022/03/audio-visualization-javascript-gsap-part1/

function drawEqualizer(
  ctx: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  canvas: HTMLCanvasElement,
  theme: VisualTheme
) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray); // 0-255 per frequency bin

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = (dataArray[i] / 255) * canvas.height * 0.8; // Scale to 80% height

    // Gradient from primary to secondary color
    const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
    gradient.addColorStop(0, theme.primaryColor);
    gradient.addColorStop(1, theme.secondaryColor);
    ctx.fillStyle = gradient;

    // Draw bar from bottom up
    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}
```

### Anti-Patterns to Avoid

- **Multiple AnalyserNodes:** Don't create a new AnalyserNode per component—connect once to the main GainNode and share the reference via context or props. Multiple analysers waste CPU.

- **useEffect for Animation Loops:** Use `useLayoutEffect` instead. `useEffect` cleanup runs asynchronously, allowing frames to leak before cleanup. `useLayoutEffect` runs synchronously.

- **Synchronous State Updates in Animation Loop:** Never call `setState` inside `requestAnimationFrame` callback—it triggers React re-renders at 60fps, destroying performance. Mutate refs imperatively, sync state only at animation start/end.

- **Canvas Resize on Every Frame:** Resizing canvas clears it and is expensive. Resize only on window resize events, not in the draw loop.

- **High FFT Sizes for Simple Visuals:** `fftSize: 2048` gives 1024 frequency bins—overkill for equalizer bars. Use 256 or 512 for better performance.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FFT calculation | Custom Fast Fourier Transform in JS | `AnalyserNode.getByteFrequencyData()` | Browser's native FFT is hardware-optimized, handles edge cases (sample rate changes, buffer underruns), and battle-tested across millions of sites. Custom FFT adds 5KB+ code for zero benefit. |
| Smooth animation timing | `setInterval(draw, 16)` or `setTimeout` loops | `requestAnimationFrame(draw)` | `rAF` syncs to browser's 60fps refresh, pauses in background tabs (saves battery), and prevents animation tearing. `setInterval` drifts, wastes CPU when tab inactive. |
| Canvas mocking for tests | Manual `jest.mock('canvas')` stubs | `vitest-canvas-mock` library | Library mocks all Canvas 2D methods (fillRect, drawImage, getImageData, etc.), handles edge cases (toDataURL, getContext('webgl')), and maintained for Vitest compatibility. |
| Phase transition animations | Custom JS tweening (lerp functions, easing) | CSS transitions with `opacity` + `background-color` | CSS transitions are GPU-accelerated, declarative, and require 3 lines of CSS vs. 50+ lines of JS animation logic. Browser optimizes better than userland code. |
| Audio volume normalization | Manual peak detection + gain adjustment | `AnalyserNode.smoothingTimeConstant` | Built-in exponential smoothing prevents rapid spikes, averages over time, and configurable (0-1). Custom normalization requires ring buffers, peak tracking, and is hard to tune. |

**Key insight:** Audio visualization is a solved problem. The Web Audio API provides production-ready primitives (AnalyserNode, FFT, smoothing) and Canvas 2D handles rendering at 60fps. The challenge is integration, not implementation—connecting these APIs cleanly to React lifecycle and existing audio infrastructure.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Uncancelled Animation Frames
**What goes wrong:** `requestAnimationFrame` queues a new frame before component unmounts, causing callbacks to run on unmounted components and leak memory. After 5-10 phase transitions, browser slows to <30fps.

**Why it happens:** `useEffect` cleanup runs *after* the next render, not immediately. By then, `requestAnimationFrame` already queued another frame.

**How to avoid:** Use `useLayoutEffect` for animation loops. Store frame ID in `useRef`, cancel in cleanup with `cancelAnimationFrame(frameIdRef.current)`.

**Warning signs:** Increasing memory usage in DevTools Performance tab, console errors about "setState on unmounted component," stuttering after 5+ minutes of use.

### Pitfall 2: Canvas Dimensions Mismatch (CSS vs. Pixel Resolution)
**What goes wrong:** Canvas renders blurry or stretched. Equalizer bars look pixelated or distorted.

**Why it happens:** Canvas has two sizes: CSS size (display size) and internal resolution (drawing buffer). If `<canvas style="width: 1920px">` but `width={300}` attribute, browser stretches 300px of pixels to 1920px, causing blur.

**How to avoid:** Set canvas pixel dimensions (`width`, `height` attributes) to match CSS size, accounting for `devicePixelRatio` on high-DPI screens:
```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = cssWidth * dpr;
canvas.height = cssHeight * dpr;
ctx.scale(dpr, dpr); // Scale drawing context back to CSS pixels
```

**Warning signs:** Canvas looks sharp in DevTools but blurry in browser, or pixel-perfect at one screen size but blurry at another.

### Pitfall 3: AnalyserNode Connected to Wrong Audio Node
**What goes wrong:** Visualizer shows flat line (no data) or visualizes ambient audio only, ignoring TTS playback.

**Why it happens:** Project has two audio paths: (1) TTS through main GainNode, (2) ambient through separate GainNode. If AnalyserNode connects to ambient-only path, TTS is invisible.

**How to avoid:** Connect AnalyserNode to the *main GainNode* returned by `getGainNode()` from `lib/audio/audioContext.ts`. This node receives both TTS (via FallbackTTS or ElevenLabs) and can optionally include ambient if piped through it.

**Warning signs:** Equalizer animates during ambient intro but goes flat when Oracle speaks. Check audio graph in Chrome DevTools → Performance → Enable "Audio" track.

### Pitfall 4: Triggering React Re-Renders at 60fps
**What goes wrong:** Browser freezes, fan spins up, DevTools shows 100% CPU, animations stutter. Console floods with "Render took 83ms" warnings.

**Why it happens:** Calling `setState` inside `requestAnimationFrame` callback forces React to re-render the entire component tree 60 times per second. React's reconciliation isn't built for this.

**How to avoid:** Never update React state inside animation loop. Mutate `useRef` values imperatively, write directly to canvas, update DOM via `canvasRef.current`. Only sync state on animation start/stop.

**Warning signs:** React DevTools Profiler shows component rendering 60+ times per second, Chrome Task Manager shows 80%+ CPU for renderer process.

### Pitfall 5: FFT Size Too High for Use Case
**What goes wrong:** Visualizer lags, drops frames on event laptops (older hardware). Performance degrades on Firefox.

**Why it happens:** `AnalyserNode.fftSize` determines frequency resolution. `fftSize: 2048` gives 1024 bins but requires more CPU for FFT calculation. Equalizer bars only need 32-128 bars, not 1024.

**How to avoid:** Use smallest FFT size that meets visual needs. For equalizer bars: `fftSize: 256` (128 bins) or `512` (256 bins). For waveform: `2048`. Lower FFT = less CPU, higher frame rate.

**Warning signs:** Performance degrades on laptops but smooth on desktop, Firefox lags more than Chrome, DevTools shows `AnalyserNode` as CPU hotspot.

## Code Examples

Verified patterns from official sources and project architecture:

### Connecting AnalyserNode to Existing Audio Pipeline
```typescript
// Source: Project architecture (lib/audio/audioContext.ts + useWaveform.ts pattern)
// Verified: 2026-03-29

import { useEffect, useRef } from 'react';
import { getAudioContext, getGainNode } from '@/lib/audio/audioContext';

export function useAudioAnalyser(fftSize: number = 256) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const audioContext = getAudioContext();
    const gainNode = getGainNode();
    if (!audioContext || !gainNode) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = 0.8; // Smooth out rapid changes
    gainNode.connect(analyser); // AnalyserNode doesn't modify audio

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    return () => {
      analyser.disconnect();
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [fftSize]);

  return { analyserRef, dataArrayRef };
}
```

### Full-Screen Audio-Reactive Equalizer Component
```typescript
// Source: MDN Visualizations + Smashing Magazine Audio Visualization
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

'use client';

import { useRef, useLayoutEffect } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

interface EqualizerVisualizerProps {
  phase: NarrativePhase;
  isPlaying: boolean;
}

export default function EqualizerVisualizer({ phase, isPlaying }: EqualizerVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number | null>(null);
  const { analyserRef, dataArrayRef } = useAudioAnalyser(512); // 256 frequency bins

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!canvas || !analyser || !dataArray || !isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = VISUAL_THEMES[phase];

    function draw() {
      if (!analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const bufferLength = dataArray.length;
      const barWidth = (canvas!.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas!.height * 0.8;

        const gradient = ctx!.createLinearGradient(0, canvas!.height - barHeight, 0, canvas!.height);
        gradient.addColorStop(0, theme.primaryColor);
        gradient.addColorStop(1, theme.secondaryColor);
        ctx!.fillStyle = gradient;

        ctx!.fillRect(x, canvas!.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      frameIdRef.current = requestAnimationFrame(draw);
    }

    frameIdRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [phase, isPlaying, analyserRef, dataArrayRef]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="equalizer-canvas"
      width={1920}
      height={1080}
      className="fixed inset-0 w-full h-full"
      style={{ background: VISUAL_THEMES[phase].background }}
      aria-hidden="true"
    />
  );
}
```

### Idle State Ambient Particle Animation
```typescript
// Source: freefrontend.com JavaScript Background Effects + MDN Canvas Tutorial
// https://freefrontend.com/javascript-background-effects/

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

export function drawIdleParticles(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  particles: Particle[],
  theme: VisualTheme,
  deltaTime: number
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    // Update position
    p.x += p.vx * theme.motionIntensity * deltaTime * 0.01;
    p.y += p.vy * theme.motionIntensity * deltaTime * 0.01;

    // Wrap around edges
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // Draw particle
    ctx.fillStyle = theme.primaryColor.replace(/[\d.]+\)$/, `${p.opacity})`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Initialize particles once
export function createParticles(canvas: HTMLCanvasElement, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.3 + 0.1,
  }));
}
```

### Phase Transition with CSS Crossfade
```tsx
// Source: MDN CSS Transitions + project ambient crossfader pattern
// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions

interface AudioReactiveBackgroundProps {
  phase: NarrativePhase;
  isPlaying: boolean;
}

export default function AudioReactiveBackground({ phase, isPlaying }: AudioReactiveBackgroundProps) {
  return (
    <div
      className="fixed inset-0 transition-all duration-[3000ms] ease-in-out"
      style={{ backgroundColor: VISUAL_THEMES[phase].background }}
    >
      {isPlaying ? (
        <EqualizerVisualizer phase={phase} isPlaying={isPlaying} />
      ) : (
        <IdleAnimation phase={phase} />
      )}
    </div>
  );
}

// In global CSS or Tailwind config:
// .transition-all { transition-property: all; }
// duration-[3000ms] matches the 3s audio crossfade (from ambientPlayer.ts)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setInterval` for animations | `requestAnimationFrame` | ~2012 (Chrome 10) | Browser-synced 60fps, automatic throttling in background tabs, no tearing |
| Manual smoothing of audio data | `AnalyserNode.smoothingTimeConstant` | Web Audio API v1 (2015) | Built-in exponential averaging, configurable 0-1, hardware-optimized |
| `useEffect` for animation cleanup | `useLayoutEffect` | React 16.8+ (2019) | Synchronous cleanup prevents frame leaks, better for DOM mutations |
| `getByteTimeDomainData` for bars | `getByteFrequencyData` | Always coexisted | Frequency data better for equalizer bars (percussive/tonal separation), time-domain better for waveforms |
| `devicePixelRatio` ignored | Always account for high-DPI | ~2013 (Retina displays) | Canvas sharpness on modern screens, 2x-3x pixel density |
| Canvas resizing in draw loop | Resize on window events only | Performance best practice | Resizing clears canvas and is expensive—only resize when window changes |

**Deprecated/outdated:**
- **`webkitAudioContext`**: Use `AudioContext` (unprefixed), supported since Chrome 35+ (2014). Prefix only for Safari <14.
- **`<audio>` tag with `mozSetup()`/`webkitSetup()`**: Use Web Audio API's `AnalyserNode` instead. Vendor-prefixed audio hacks removed ~2015.
- **Flash-based visualizers**: Dead. Canvas + Web Audio replaced ActionScript for all modern audio visualization.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Web Audio API | AnalyserNode audio analysis | ✓ | Native (Chrome 111+) | — |
| Canvas 2D API | Visual rendering | ✓ | Native (all browsers) | — |
| requestAnimationFrame | 60fps animation loop | ✓ | Native (all browsers) | — |
| CSS Transitions | Phase crossfade | ✓ | Native (all browsers) | — |
| Chrome DevTools | Audio graph debugging | ✓ | Native (Chrome) | Manual audio node logging |
| vitest-canvas-mock | Canvas testing in jsdom | ✗ | 1.1.0 (npm) | Install in Wave 0 |
| Event laptops (2-3 Windows) | Target hardware | ✓ | Windows 11 Pro | — |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- `vitest-canvas-mock` — install via `npm install -D vitest-canvas-mock`, add to `vitest.config.ts` setupFiles

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm test -- src/components/visuals/` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-01 | Full-screen audio-reactive equalizer responds to TTS intensity | integration | `npm test -- src/components/visuals/EqualizerVisualizer.test.tsx -x` | ❌ Wave 0 |
| VIS-02 | Background visual style changes per phase (red/blue/gold) | unit | `npm test -- src/lib/audio/visualConfig.test.ts -x` | ❌ Wave 0 |
| VIS-03 | Smooth visual transitions match 3s audio crossfade | integration | `npm test -- src/components/visuals/AudioReactiveBackground.test.tsx -x` | ❌ Wave 0 |
| VIS-04 | Idle state shows subtle ambient animation | unit | `npm test -- src/components/visuals/IdleAnimation.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- src/components/visuals/ src/hooks/useAudioAnalyser.test.ts`
- **Per wave merge:** `npm test` (full suite, 32/34 suites must pass)
- **Phase gate:** Full suite green + manual browser test on event hardware (Chrome, 1920x1080, verify 60fps in DevTools Performance)

### Wave 0 Gaps
- [ ] `vitest-canvas-mock` install + config — `npm install -D vitest-canvas-mock`, add to `vitest.config.ts` setupFiles
- [ ] `src/components/visuals/__tests__/EqualizerVisualizer.test.tsx` — covers VIS-01 (Canvas rendering, AnalyserNode connection)
- [ ] `src/hooks/__tests__/useAudioAnalyser.test.ts` — covers hook lifecycle, cleanup
- [ ] `src/lib/audio/__tests__/visualConfig.test.ts` — covers VIS-02 (theme constants, phase mapping)
- [ ] `src/components/visuals/__tests__/AudioReactiveBackground.test.tsx` — covers VIS-03 (phase transitions, CSS class changes)
- [ ] `src/components/visuals/__tests__/IdleAnimation.test.tsx` — covers VIS-04 (particle creation, animation loop)

## Sources

### Primary (HIGH confidence)
- [MDN Web Audio API - Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) - AnalyserNode usage, getByteFrequencyData examples
- [MDN AnalyserNode API Reference](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) - fftSize, smoothingTimeConstant, buffer methods
- [MDN Canvas API - Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) - Performance best practices, devicePixelRatio
- [CSS-Tricks - Using requestAnimationFrame with React Hooks](https://css-tricks.com/using-requestanimationframe-with-react-hooks/) - useLayoutEffect pattern, cleanup, refs
- [MDN requestAnimationFrame API](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) - Browser sync, 60fps timing
- Project codebase: `src/hooks/useWaveform.ts`, `src/services/audio/ambientPlayer.ts`, `src/types/index.ts` (PHASE_COLORS)

### Secondary (MEDIUM confidence)
- [Smashing Magazine - Audio Visualization with JavaScript and GSAP Part 1](https://www.smashingmagazine.com/2022/03/audio-visualization-javascript-gsap-part1/) - Equalizer patterns, gradient techniques
- [DEV Community - Visualizing Audio as a Waveform in React](https://dev.to/ssk14/visualizing-audio-as-a-waveform-in-react-o67) - React integration examples
- [Free Frontend - JavaScript Background Effects](https://freefrontend.com/javascript-background-effects/) - Particle system examples, ambient motion
- [Free Frontend - JavaScript Audio Visualizers](https://freefrontend.com/javascript-audio-visualizer/) - 5 different visualization patterns
- [Dave Pagurek - Fire Particles for HTML5 Canvas](https://www.davepagurek.com/blog/fire-particles-for-html5-canvas/) - Fire effect technique (Inferno phase inspiration)

### Secondary (Canvas Testing - MEDIUM confidence)
- [GitHub - vitest-canvas-mock](https://github.com/wobsoriano/vitest-canvas-mock) - Official library for Canvas mocking in Vitest
- [NPM - vitest-canvas-mock 1.1.0](https://www.npmjs.com/package/vitest-canvas-mock) - Package docs, installation
- [The Koi - Vitest How to Mock A Canvas](https://www.the-koi.com/projects/vitest-how-to-mock-a-canvas/) - Setup tutorial

### Tertiary (Performance Context - LOW confidence, requires validation)
- [BSWEN - How to Optimize Canvas Performance for Cross-Device Rendering](https://docs.bswen.com/blog/2026-02-21-canvas-performance-optimization/) - Claims offscreen canvas + batch rendering for mobile
- [Audio Reactive Visuals - Particle Systems](https://audioreactivevisuals.com/particle-systems.html) - Claims WebGL handles 100k+ particles (not verified with benchmarks)
- [DEV Community - Why Your React App Lags but This Canvas Game Runs at 60FPS](https://dev.to/yzbkaka_dev/why-your-react-app-lags-but-this-canvas-game-runs-at-60fps-2h1d) - React anti-patterns for animation (setState in rAF)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies are native browser APIs (Web Audio, Canvas, rAF) or already installed (React 19, Vitest). Only addition is `vitest-canvas-mock` (well-documented, 1.1.0 stable).
- Architecture: HIGH - Patterns verified from MDN official docs, existing project code (`useWaveform.ts`, `ambientPlayer.ts`), and established React animation practices. AnalyserNode integration matches existing `audioContext.ts` architecture.
- Pitfalls: HIGH - Common mistakes documented in MDN, CSS-Tricks, and validated against project's existing hooks (useEffect/useLayoutEffect distinction already present in `useWaveform.ts`).
- Visual themes: MEDIUM - Phase colors exist in codebase (`PHASE_COLORS`), but specific visual styles (fire particles, mist gradients) derived from web search examples, not tested on event hardware yet.
- Performance claims: MEDIUM - 60fps Canvas 2D animations verified on modern browsers, but event laptop hardware not tested. Should validate on actual Windows laptops before shipping.

**Research date:** 2026-03-29
**Valid until:** ~60 days (2026-05-28) — Browser APIs stable, React patterns established, but test library versions may update.

**Confidence by requirement:**
- VIS-01 (audio-reactive equalizer): HIGH — AnalyserNode + Canvas pattern battle-tested, existing `useWaveform.ts` proves feasibility
- VIS-02 (phase-specific visuals): HIGH — `PHASE_COLORS` constant already exists, extension straightforward
- VIS-03 (smooth transitions): HIGH — Ambient crossfader proves 3s transitions work, CSS handles visual crossfade
- VIS-04 (idle animation): MEDIUM — Particle patterns well-documented, but performance on event hardware unverified
