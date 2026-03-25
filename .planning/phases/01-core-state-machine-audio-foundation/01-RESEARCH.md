# Phase 1: Core State Machine & Audio Foundation - Research

**Researched:** 2026-03-24
**Domain:** State machine orchestration, browser audio APIs, microphone permissions, UI foundation
**Confidence:** HIGH

## Summary

Phase 1 establishes the complete state machine flow using XState v5 to orchestrate the narrative experience, unlocks AudioContext on first user interaction to comply with browser autoplay policies, secures microphone permissions before the experience begins, and provides a minimal UI shell with phase-appropriate visual feedback. The phase simulates voice output using the Browser SpeechSynthesis API (not ElevenLabs) and handles choices via temporary on-screen buttons (not STT) to validate the complete state machine flow end-to-end before Phase 2 integrates real TTS/STT.

**Primary recommendation:** Use XState v5's actor model with hierarchical states for the narrative flow, initialize AudioContext + gain nodes on first click, request microphone permission on a dedicated pre-start screen, leverage Next.js 14 App Router with 'use client' for interactive components, and implement Browser SpeechSynthesis with pt-BR voices as a temporary TTS solution that lets you test the full script timing and transitions.

## User Constraints

<user_constraints>
### Locked Decisions (from CONTEXT.md)

**Audio Playback Strategy:**
- Browser SpeechSynthesis API simulates Oracle voice in Phase 1 — free, instant, lets us hear the full script flow and test timings
- Ambient audio deferred to Phase 2 (AMB-* requirements) — keep audio graph simple in Phase 1
- Full AudioContext + audio graph initialized on first click — gain nodes and routing ready for Phase 2 plug-in
- Full configurable pause system matching PRD [pausa Ns] markers implemented now — critical for flow feel

**Choice Interaction (without STT):**
- On-screen buttons (temporary testing UI) allow visitor to pick choices + timeout auto-advance after 15s
- Timeout always triggers default path matching FLOW-11 behavior (Inferno→Silêncio, Purgatório→default contextual)
- Full state machine with ALL states including fallback and timeout redirect — fallback triggerable via dev tools
- All 4 paths testable end-to-end via button selection — validates entire state machine branching

**UI Shell Design:**
- Full-screen overlay step before start explains what will happen and requests mic permission (matches RES-03)
- Background color shifts implemented now: bordô (Inferno) → azul acinzentado (Purgatório) → dourado (Paraíso) per PRD
- CSS pulse animation on dark background for start button (matches UI-01 "botão pulsante")
- Desktop-only fixed viewport — event uses laptops with headphones, no mobile needed

### Claude's Discretion
- Next.js App Router folder structure and component organization
- XState v5 machine structure (nested vs flat states, action naming)
- Tailwind CSS specific classes and design tokens
- Test strategy and test framework choice
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-01 | Visitante pode iniciar a experiência tocando um botão na tela | Standard Stack: Next.js interactive button component; Web Audio API unlock pattern on click |
| FLOW-02 | Oráculo reproduz monólogo de apresentação completo com pausas intencionais (2-4s entre frases) | SpeechSynthesis API for Phase 1; pause implementation via setTimeout between utterances |
| FLOW-03 | Oráculo apresenta pergunta do Inferno e aguarda resposta por voz (timeout 15s) | XState delayed transitions with 'after' property; temporary button UI for Phase 1 |
| FLOW-05 | Oráculo reproduz narrativa correspondente ao caminho escolhido no Inferno | XState hierarchical states and context to track choice paths |
| FLOW-06 | Oráculo apresenta pergunta do Purgatório (específica ao caminho) e aguarda resposta por voz | XState conditional transitions based on context.choice1 value |
| FLOW-08 | Oráculo reproduz reflexão do Paraíso (pergunta reflexiva, sem classificação necessária) | XState delay-only state with no choice required |
| FLOW-09 | Oráculo reproduz devolução personalizada (1 de 4 variantes baseada nas 2 escolhas) | XState context tracks choice1 + choice2, transitions to variant state |
| FLOW-10 | Oráculo reproduz encerramento igual para todos e retorna ao estado inicial após 5s | XState self-transition from FIM → IDLE after 5s delay |
| FLOW-12 | Experiência completa dura entre 7-10 minutos por visitante | Full state machine with all narrative states + pauses validated via temporary UI |
| RES-03 | Permissão de microfone é solicitada antes do início com tela explicativa | MediaDevices.getUserMedia() called on pre-start screen; Best practices: explain value before prompt |
| RES-04 | AudioContext é desbloqueado no primeiro clique (evita bloqueio de autoplay do browser) | AudioContext.resume() on first user interaction; verify state === 'running' |
| UI-01 | Tela inicial mostra botão pulsante "Toque para começar" sobre fundo escuro com animação sutil de água | Tailwind animate-pulse class; Client Component with 'use client' directive |
| UI-06 | Tela final faz fade para preto e retorna ao início após 5 segundos | CSS transition + XState delayed transition to IDLE |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router framework | Latest stable; SSR, API routes, file-based routing, Server Components |
| React | 19.2.4 | UI library | Required by Next.js 16; concurrent features, hooks |
| XState | 5.29.0 | State machine | Latest stable v5; actor model, hierarchical states, timeout/delay support |
| @xstate/react | 5.1.0+ | React hooks for XState | Provides useMachine, useSelector hooks for v5 |
| TypeScript | 5.6+ | Type safety | Strict mode recommended for Next.js; prevents null reference errors |
| Tailwind CSS | 4.2.2 | Utility-first CSS | Latest stable; animate-pulse, responsive design, minimal bundle |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| standardized-audio-context-mock | Latest | AudioContext mocking | Unit tests for Web Audio API code |
| Vitest | Latest | Testing framework | Fast, Vite-powered, ESM-native; better than Jest for modern Next.js |
| @testing-library/react | Latest | Component testing | User-centric testing for interactive UI components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| XState v5 | Zustand/Jotai | Simpler state libs lack state machine formalism, timeout support, visual tooling |
| Vitest | Jest | Jest slower, requires more config for ESM/TS; Vitest built for Vite ecosystem |
| SpeechSynthesis API | HTML5 Audio + prerecorded MP3s | Prerecorded more reliable but requires voice actor + audio editing upfront |
| Tailwind | CSS Modules | CSS Modules verbose; Tailwind faster for prototyping, smaller bundle with purge |

**Installation:**
```bash
npm install next@latest react@latest react-dom@latest xstate@latest @xstate/react@latest
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom standardized-audio-context-mock
npx tailwindcss init -p
```

**Version verification:** Verified via `npm view` on 2026-03-24. Next.js 16.2.1, XState 5.29.0, React 19.2.4, Tailwind 4.2.2 are current stable releases.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main experience page (Server Component wrapper)
│   ├── globals.css         # Tailwind directives
│   └── api/                # (Phase 2: TTS/STT/classify endpoints)
├── components/             # React components
│   ├── ui/                 # Generic UI (Button, Spinner, etc.)
│   └── experience/         # Experience-specific
│       ├── OracleExperience.tsx      # Main client component orchestrator
│       ├── PermissionScreen.tsx      # Microphone permission request
│       ├── StartButton.tsx           # Pulsing start button
│       ├── PhaseBackground.tsx       # Color-shifting background
│       ├── ChoiceButtons.tsx         # Temporary choice UI (Phase 1 only)
│       └── EndFade.tsx               # Fade-to-black ending
├── machines/               # XState state machines
│   ├── oracleMachine.ts    # Main state machine definition
│   ├── oracleMachine.types.ts  # TypeScript types for context/events
│   └── oracleMachine.test.ts   # State machine unit tests
├── lib/                    # Utility functions
│   ├── audio/
│   │   ├── audioContext.ts       # AudioContext singleton + unlock
│   │   ├── speechSynthesis.ts    # SpeechSynthesis wrapper
│   │   └── audioContext.test.ts  # AudioContext tests with mocks
│   └── utils.ts            # General utilities
├── data/                   # Static data
│   └── script.ts           # PRD script content as structured data
└── types/                  # TypeScript type definitions
    └── index.ts
```

### Pattern 1: XState v5 Hierarchical State Machine
**What:** Nested states group related narrative phases; context tracks visitor choices and session metadata.
**When to use:** Complex flows with multiple paths, timeouts, and state-dependent transitions.
**Example:**
```typescript
// Source: https://stately.ai/docs/states (XState official docs)
import { createMachine, assign } from 'xstate';

interface OracleContext {
  sessionId: string;
  choice1: 'A' | 'B' | null;
  choice2: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;
  fallbackCount: number;
  currentPhase: 'APRESENTACAO' | 'INFERNO' | 'PURGATORIO' | 'PARAISO' | 'DEVOLUCAO' | 'ENCERRAMENTO';
}

type OracleEvent =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'TIMEOUT' };

const oracleMachine = createMachine({
  id: 'oracle',
  initial: 'IDLE',
  context: {
    sessionId: '',
    choice1: null,
    choice2: null,
    fallbackCount: 0,
    currentPhase: 'APRESENTACAO',
  } as OracleContext,
  states: {
    IDLE: {
      on: { START: 'APRESENTACAO' },
    },
    APRESENTACAO: {
      entry: assign({ currentPhase: 'APRESENTACAO' }),
      on: { NARRATIVA_DONE: 'INFERNO' },
    },
    INFERNO: {
      initial: 'NARRATIVA',
      entry: assign({ currentPhase: 'INFERNO' }),
      states: {
        NARRATIVA: {
          on: { NARRATIVA_DONE: 'PERGUNTA' },
        },
        PERGUNTA: {
          on: { NARRATIVA_DONE: 'AGUARDANDO' },
        },
        AGUARDANDO: {
          after: {
            15000: 'TIMEOUT_REDIRECT', // 15s timeout
          },
          on: {
            CHOICE_A: {
              target: 'RESPOSTA_A',
              actions: assign({ choice1: 'A' }),
            },
            CHOICE_B: {
              target: 'RESPOSTA_B',
              actions: assign({ choice1: 'B' }),
            },
          },
        },
        TIMEOUT_REDIRECT: {
          entry: assign({ choice1: 'B' }), // Default to Silêncio
          after: { 2000: 'RESPOSTA_B' },
        },
        RESPOSTA_A: {
          on: { NARRATIVA_DONE: '#oracle.PURGATORIO_A' },
        },
        RESPOSTA_B: {
          on: { NARRATIVA_DONE: '#oracle.PURGATORIO_B' },
        },
      },
    },
    PURGATORIO_A: {
      id: 'PURGATORIO_A',
      // Similar nested structure...
    },
    PURGATORIO_B: {
      id: 'PURGATORIO_B',
      // Similar nested structure...
    },
    PARAISO: {
      // Reflexive question with delay, no choice required
      after: { 8000: 'DEVOLUCAO' },
    },
    DEVOLUCAO: {
      // Conditional state selection based on context.choice1 + context.choice2
      always: [
        { target: 'DEVOLUCAO_A_FICAR', guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'FICAR' },
        { target: 'DEVOLUCAO_A_EMBORA', guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'EMBORA' },
        { target: 'DEVOLUCAO_B_PISAR', guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'PISAR' },
        { target: 'DEVOLUCAO_B_CONTORNAR', guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'CONTORNAR' },
      ],
    },
    DEVOLUCAO_A_FICAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_A_EMBORA: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_B_PISAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_B_CONTORNAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    ENCERRAMENTO: {
      on: { NARRATIVA_DONE: 'FIM' },
    },
    FIM: {
      after: { 5000: 'IDLE' }, // Auto-reset after 5s
    },
  },
});
```

### Pattern 2: AudioContext Unlock on First Click
**What:** Browser autoplay policy requires AudioContext to be resumed during a user gesture.
**When to use:** Any Web Audio API usage in the app.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay (MDN Autoplay Guide)
// lib/audio/audioContext.ts
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

export async function initAudioContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }

  // Resume if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
}

export function getAudioContext(): AudioContext | null {
  return audioContext;
}

export function getGainNode(): GainNode | null {
  return gainNode;
}

// Usage in component:
// <button onClick={async () => {
//   await initAudioContext(); // MUST be called inside user gesture
//   // Now AudioContext is unlocked and running
// }}>Start Experience</button>
```

### Pattern 3: Microphone Permission Request with Explanation
**What:** Request microphone permission with explanatory UI before showing browser prompt.
**When to use:** Any getUserMedia() usage requiring microphone access.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia (MDN getUserMedia)
// components/experience/PermissionScreen.tsx
'use client';

import { useState } from 'react';

export default function PermissionScreen({ onGranted }: { onGranted: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  async function requestMicrophone() {
    setIsRequesting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Store stream reference if needed, or just verify permission granted
      stream.getTracks().forEach(track => track.stop()); // Stop immediately; we'll reopen when needed
      onGranted();
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Permissão negada. Precisamos do microfone para ouvir suas respostas.');
        } else if (err.name === 'NotFoundError') {
          setError('Nenhum microfone encontrado.');
        } else {
          setError('Erro ao acessar o microfone.');
        }
      }
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-2xl text-white mb-4">Bem-vindo ao Oráculo</h2>
        <p className="text-gray-300 mb-6">
          Vamos precisar do seu microfone para ouvir suas respostas.
          Suas palavras não são gravadas — apenas processadas no momento.
        </p>
        <button
          onClick={requestMicrophone}
          disabled={isRequesting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {isRequesting ? 'Aguardando permissão...' : 'Permitir microfone'}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}
```

### Pattern 4: SpeechSynthesis API with Pauses (Phase 1 TTS Simulation)
**What:** Use Browser SpeechSynthesis API to simulate Oracle voice with configurable pauses between utterances.
**When to use:** Phase 1 only — replaced by ElevenLabs in Phase 2.
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis (MDN SpeechSynthesis)
// lib/audio/speechSynthesis.ts
export interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds
}

export async function speakWithPauses(
  segments: SpeechSegment[],
  voiceLang: string = 'pt-BR',
  rate: number = 0.9,
  pitch: number = 1.0
): Promise<void> {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang.startsWith(voiceLang)) || voices[0];

  for (const segment of segments) {
    await new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(segment.text);
      utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.onend = () => resolve();
      utterance.onerror = (err) => reject(err);
      synth.speak(utterance);
    });

    // Pause after utterance if specified
    if (segment.pauseAfter) {
      await new Promise(resolve => setTimeout(resolve, segment.pauseAfter));
    }
  }
}

// Usage:
// const apresentacaoScript: SpeechSegment[] = [
//   { text: 'Você saiu de uma selva escura. Dante também.', pauseAfter: 2000 },
//   { text: 'A diferença é que ele não sabia como tinha chegado lá.', pauseAfter: 2000 },
//   { text: 'Você sabe.', pauseAfter: 1500 },
// ];
// await speakWithPauses(apresentacaoScript);
```

### Pattern 5: XState React Integration
**What:** Use useMachine hook to bind XState actor to React component lifecycle.
**When to use:** Main orchestrator component that drives the experience.
**Example:**
```typescript
// Source: https://stately.ai/docs/xstate-react (@xstate/react official docs)
// components/experience/OracleExperience.tsx
'use client';

import { useMachine } from '@xstate/react';
import { oracleMachine } from '@/machines/oracleMachine';

export default function OracleExperience() {
  const [state, send] = useMachine(oracleMachine);

  // Access current state
  const isIdle = state.matches('IDLE');
  const isInfernoPergunta = state.matches({ INFERNO: 'PERGUNTA' });

  // Access context
  const { choice1, currentPhase } = state.context;

  return (
    <div className={`phase-${currentPhase.toLowerCase()}`}>
      {isIdle && <StartButton onClick={() => send({ type: 'START' })} />}
      {isInfernoPergunta && (
        <ChoiceButtons
          onChoiceA={() => send({ type: 'CHOICE_A' })}
          onChoiceB={() => send({ type: 'CHOICE_B' })}
        />
      )}
      {/* Render UI based on state.matches() ... */}
    </div>
  );
}
```

### Pattern 6: Next.js 14 App Router with Client Components
**What:** Server Components by default; mark interactive components with 'use client'.
**When to use:** Any component using useState, useEffect, event handlers, or browser APIs.
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// app/page.tsx (Server Component - default)
import OracleExperience from '@/components/experience/OracleExperience';

export default function HomePage() {
  return (
    <main>
      <OracleExperience />
    </main>
  );
}

// components/experience/OracleExperience.tsx (Client Component - needs 'use client')
'use client';

import { useMachine } from '@xstate/react';
// ... interactive logic
```

### Anti-Patterns to Avoid
- **Flat state machine with 20+ top-level states:** Use hierarchical states to group related phases (e.g., INFERNO with nested NARRATIVA/PERGUNTA/AGUARDANDO/RESPOSTA).
- **Using useState for complex flow logic:** XState provides timeout, context, guards — don't reinvent with useEffect + setTimeout.
- **AudioContext creation without user gesture:** Browsers will suspend it; always call resume() inside click handler.
- **Calling getUserMedia() without explaining why:** Show explanatory UI first; then trigger browser prompt on button click.
- **Testing with real AudioContext:** Use standardized-audio-context-mock for unit tests; real AudioContext requires browser environment.
- **Overusing 'use client':** Default to Server Components; only add 'use client' to leaves of component tree that need interactivity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine with timeouts | Custom setTimeout + useReducer | XState 'after' property | Race conditions, cleanup complexity, no visualization tooling |
| Audio playback sequencing | Promise chains + setTimeout | XState actions + delayed transitions | Hard to test, error-prone pause timing, no state visualization |
| Microphone permission flow | Manual localStorage + try/catch | Standard getUserMedia() pattern | Browser handles permission persistence; custom logic misses edge cases (NotFoundError, NotReadableError) |
| Voice synthesis queue | Manual queue + callbacks | SpeechSynthesis API with Promise wrappers | Browser handles voice engine lifecycle, cross-platform quirks |
| Test mocks for AudioContext | Manual global.AudioContext = jest.fn() | standardized-audio-context-mock | Incomplete mocks miss WebAudio graph behavior; mock lib handles GainNode, AnalyserNode, etc. |

**Key insight:** State machines with delays and audio sequencing are deceptively complex — race conditions during cleanup, pause timing bugs, and error recovery make custom solutions fragile. XState + Web APIs handle these edge cases; focus implementation effort on narrative content and UX polish, not low-level orchestration.

## Common Pitfalls

### Pitfall 1: AudioContext State Not Checked After Resume
**What goes wrong:** Calling audioContext.resume() without awaiting can leave AudioContext in 'suspended' state, causing audio to fail silently.
**Why it happens:** Browser autoplay policy is asynchronous; resume() returns a Promise that resolves when state changes to 'running'.
**How to avoid:** Always await audioContext.resume() and verify state === 'running' before playing audio.
**Warning signs:** Audio plays in development but fails in production; audio works on second click but not first.
**Source:** [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Pitfall 2: SpeechSynthesis Voices Not Loaded on First Render
**What goes wrong:** speechSynthesis.getVoices() returns empty array on first call; voice selection fails.
**Why it happens:** Browser loads voices asynchronously; voiceschanged event fires when ready.
**How to avoid:** Wait for voiceschanged event before calling getVoices(), or use a fallback to voices[0].
**Warning signs:** Voice selection works after reload but not on first visit; no voices available on initial render.
**Code example:**
```typescript
let voicesLoaded = false;
window.speechSynthesis.onvoiceschanged = () => {
  voicesLoaded = true;
};

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}
```
**Source:** [Chrome Blog: Web Apps that Talk](https://developer.chrome.com/blog/web-apps-that-talk-introduction-to-the-speech-synthesis-api)

### Pitfall 3: XState Timeout Not Firing After Manual Transition
**What goes wrong:** After sending event that transitions out of timeout state and back in, timeout doesn't restart.
**Why it happens:** XState v5 clears timers when exiting states; re-entry restarts timers, but if you transition to a parent state and back down, nesting matters.
**How to avoid:** Use explicit exit/entry actions if you need to restart timers; avoid self-transitions on timeout states.
**Warning signs:** First timeout works; subsequent timeouts in same session don't fire.
**Source:** [Stately Docs: Delayed Transitions](https://stately.ai/docs/xstate-v4/transitions-and-events/delayed-transitions)

### Pitfall 4: Microphone Permission Prompt on Page Load
**What goes wrong:** getUserMedia() called immediately on mount causes permission prompt before user interaction; high denial rate.
**Why it happens:** Developers call getUserMedia() in useEffect(() => {}, []) without user gesture.
**How to avoid:** Always show explanatory screen first; call getUserMedia() inside button onClick handler.
**Warning signs:** Users report intrusive permission prompts; high NotAllowedError rate in logs.
**Source:** [Digital Thrive: Get Microphone Permission Best Practices](https://digitalthriveai.com/en-us/resources/docs/ui-ux/get-microphone-permission/)

### Pitfall 5: Overcomplicating State Machine with Too Many Nested Levels
**What goes wrong:** 4+ levels of nested states make machine hard to test, visualize, and debug.
**Why it happens:** Developers nest every conditional as a child state instead of using guards and context.
**How to avoid:** Use guards for simple conditionals; nest states only when child states share entry/exit actions or should only exist when parent is active.
**Warning signs:** State path strings like 'INFERNO.PERGUNTA.AGUARDANDO.TENTATIVA_2.FALLBACK' are 4+ levels deep.
**Source:** [Kyle Shevlin: Guidelines for State Machines and XState](https://kyleshevlin.com/guidelines-for-state-machines-and-xstate/)

### Pitfall 6: Not Stopping MediaStream Tracks After Permission Check
**What goes wrong:** After getUserMedia() grants permission, leaving tracks running consumes resources and shows "recording" indicator.
**Why it happens:** Developers forget to call stream.getTracks().forEach(track => track.stop()) after permission check.
**How to avoid:** On permission screen, stop all tracks immediately after verifying permission granted; reopen stream when actually needed.
**Warning signs:** Browser shows "camera/microphone in use" indicator even when experience is idle.
**Source:** [MDN: Getting Browser Microphone Permission](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs/Connect_peers/Get_microphone_permission)

## Code Examples

### Complete State Machine with Timeouts and Context
```typescript
// Source: https://stately.ai/docs/xstate-react (@xstate/react official docs)
// machines/oracleMachine.ts
import { createMachine, assign } from 'xstate';

interface OracleContext {
  sessionId: string;
  choice1: 'A' | 'B' | null;
  choice2: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;
  fallbackCount: number;
  currentPhase: 'APRESENTACAO' | 'INFERNO' | 'PURGATORIO' | 'PARAISO' | 'DEVOLUCAO' | 'ENCERRAMENTO';
}

type OracleEvent =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'CHOICE_FICAR' }
  | { type: 'CHOICE_EMBORA' }
  | { type: 'CHOICE_PISAR' }
  | { type: 'CHOICE_CONTORNAR' };

export const oracleMachine = createMachine({
  id: 'oracle',
  types: {} as {
    context: OracleContext;
    events: OracleEvent;
  },
  initial: 'IDLE',
  context: {
    sessionId: '',
    choice1: null,
    choice2: null,
    fallbackCount: 0,
    currentPhase: 'APRESENTACAO',
  },
  states: {
    IDLE: {
      on: {
        START: {
          target: 'APRESENTACAO',
          actions: assign({ sessionId: () => crypto.randomUUID() }),
        },
      },
    },
    APRESENTACAO: {
      entry: assign({ currentPhase: 'APRESENTACAO' }),
      on: { NARRATIVA_DONE: 'INFERNO' },
    },
    INFERNO: {
      initial: 'NARRATIVA',
      entry: assign({ currentPhase: 'INFERNO' }),
      states: {
        NARRATIVA: {
          on: { NARRATIVA_DONE: 'PERGUNTA' },
        },
        PERGUNTA: {
          on: { NARRATIVA_DONE: 'AGUARDANDO' },
        },
        AGUARDANDO: {
          after: {
            15000: {
              target: 'TIMEOUT_REDIRECT',
              actions: assign({ choice1: 'B' }), // Default to Silêncio
            },
          },
          on: {
            CHOICE_A: {
              target: 'RESPOSTA_A',
              actions: assign({ choice1: 'A' }),
            },
            CHOICE_B: {
              target: 'RESPOSTA_B',
              actions: assign({ choice1: 'B' }),
            },
          },
        },
        TIMEOUT_REDIRECT: {
          after: { 2000: 'RESPOSTA_B' },
        },
        RESPOSTA_A: {
          on: { NARRATIVA_DONE: '#oracle.PURGATORIO_A' },
        },
        RESPOSTA_B: {
          on: { NARRATIVA_DONE: '#oracle.PURGATORIO_B' },
        },
      },
    },
    PURGATORIO_A: {
      id: 'PURGATORIO_A',
      initial: 'NARRATIVA',
      entry: assign({ currentPhase: 'PURGATORIO' }),
      states: {
        NARRATIVA: {
          on: { NARRATIVA_DONE: 'PERGUNTA' },
        },
        PERGUNTA: {
          on: { NARRATIVA_DONE: 'AGUARDANDO' },
        },
        AGUARDANDO: {
          after: {
            15000: {
              target: 'RESPOSTA_FICAR',
              actions: assign({ choice2: 'FICAR' }),
            },
          },
          on: {
            CHOICE_FICAR: {
              target: 'RESPOSTA_FICAR',
              actions: assign({ choice2: 'FICAR' }),
            },
            CHOICE_EMBORA: {
              target: 'RESPOSTA_EMBORA',
              actions: assign({ choice2: 'EMBORA' }),
            },
          },
        },
        RESPOSTA_FICAR: {
          on: { NARRATIVA_DONE: '#oracle.PARAISO' },
        },
        RESPOSTA_EMBORA: {
          on: { NARRATIVA_DONE: '#oracle.PARAISO' },
        },
      },
    },
    PURGATORIO_B: {
      id: 'PURGATORIO_B',
      initial: 'NARRATIVA',
      entry: assign({ currentPhase: 'PURGATORIO' }),
      states: {
        NARRATIVA: {
          on: { NARRATIVA_DONE: 'PERGUNTA' },
        },
        PERGUNTA: {
          on: { NARRATIVA_DONE: 'AGUARDANDO' },
        },
        AGUARDANDO: {
          after: {
            15000: {
              target: 'RESPOSTA_CONTORNAR',
              actions: assign({ choice2: 'CONTORNAR' }),
            },
          },
          on: {
            CHOICE_PISAR: {
              target: 'RESPOSTA_PISAR',
              actions: assign({ choice2: 'PISAR' }),
            },
            CHOICE_CONTORNAR: {
              target: 'RESPOSTA_CONTORNAR',
              actions: assign({ choice2: 'CONTORNAR' }),
            },
          },
        },
        RESPOSTA_PISAR: {
          on: { NARRATIVA_DONE: '#oracle.PARAISO' },
        },
        RESPOSTA_CONTORNAR: {
          on: { NARRATIVA_DONE: '#oracle.PARAISO' },
        },
      },
    },
    PARAISO: {
      id: 'PARAISO',
      entry: assign({ currentPhase: 'PARAISO' }),
      after: { 8000: 'DEVOLUCAO' }, // Reflexive pause, no choice
    },
    DEVOLUCAO: {
      entry: assign({ currentPhase: 'DEVOLUCAO' }),
      always: [
        {
          target: 'DEVOLUCAO_A_FICAR',
          guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'FICAR',
        },
        {
          target: 'DEVOLUCAO_A_EMBORA',
          guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'EMBORA',
        },
        {
          target: 'DEVOLUCAO_B_PISAR',
          guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'PISAR',
        },
        {
          target: 'DEVOLUCAO_B_CONTORNAR',
          guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'CONTORNAR',
        },
      ],
    },
    DEVOLUCAO_A_FICAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_A_EMBORA: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_B_PISAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    DEVOLUCAO_B_CONTORNAR: { on: { NARRATIVA_DONE: 'ENCERRAMENTO' } },
    ENCERRAMENTO: {
      entry: assign({ currentPhase: 'ENCERRAMENTO' }),
      on: { NARRATIVA_DONE: 'FIM' },
    },
    FIM: {
      after: { 5000: 'IDLE' },
    },
  },
});
```

### Pulsing Start Button with Tailwind
```tsx
// Source: https://tailwindcss.com/docs/animation (Tailwind CSS animation docs)
// components/experience/StartButton.tsx
'use client';

export default function StartButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <button
        onClick={onClick}
        className="
          bg-blue-600 hover:bg-blue-700
          text-white text-xl font-medium
          px-12 py-6 rounded-full
          animate-pulse
          transition-transform hover:scale-105
        "
      >
        Toque para começar
      </button>
    </div>
  );
}
```

### Phase Background Color Shifts
```tsx
// Source: PRD Section 8.2 + Tailwind CSS utilities
// components/experience/PhaseBackground.tsx
'use client';

interface PhaseBackgroundProps {
  phase: 'APRESENTACAO' | 'INFERNO' | 'PURGATORIO' | 'PARAISO' | 'DEVOLUCAO' | 'ENCERRAMENTO';
}

const phaseColors: Record<PhaseBackgroundProps['phase'], string> = {
  APRESENTACAO: 'bg-black',
  INFERNO: 'bg-[#4a0e0e]', // Bordô (dark red)
  PURGATORIO: 'bg-[#3d4f5c]', // Azul acinzentado (slate blue)
  PARAISO: 'bg-[#5c4a2a]', // Dourado/âmbar (golden brown)
  DEVOLUCAO: 'bg-[#5c4a2a]', // Continue Paraíso color
  ENCERRAMENTO: 'bg-black',
};

export default function PhaseBackground({ phase }: PhaseBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 transition-colors duration-[2000ms] ${phaseColors[phase]}`}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XState v4 with createMachine() + interpret() | XState v5 with createMachine() + useMachine() (auto-lifecycle) | Dec 2023 (v5 release) | Simpler React integration; no manual actor.start()/stop() |
| navigator.getUserMedia() callback API | navigator.mediaDevices.getUserMedia() Promise API | 2016 (deprecated in 2021) | Standard Promise-based flow; old API unsupported in modern browsers |
| AudioContext without autoplay policy | AudioContext.resume() on user gesture | 2018 (Chrome 70) | All browsers now suspend AudioContext by default; manual resume required |
| Next.js Pages Router | Next.js App Router | Nov 2022 (Next.js 13+) | File-based routing in app/ directory; Server Components by default |
| XState 'after' as array | XState 'after' as object only | Dec 2023 (XState v5) | Breaking change: after: [{ delay: 1000, target: 'foo' }] no longer supported |

**Deprecated/outdated:**
- **navigator.getUserMedia()**: Use navigator.mediaDevices.getUserMedia() — old API removed from standards.
- **XState v4 'invoke' with callback syntax**: XState v5 uses 'invoke' with actor logic (fromPromise, fromCallback, etc.).
- **Next.js getServerSideProps in App Router**: Use React Server Components and async component functions instead.
- **Tailwind JIT mode flag**: JIT is now default in Tailwind CSS 3+; no need for mode: 'jit' in config.

## Open Questions

1. **Portuguese Brazil Voice Quality in Browser SpeechSynthesis**
   - What we know: SpeechSynthesis API supports pt-BR voices; availability varies by OS/browser.
   - What's unclear: Voice quality and naturalness sufficient for Phase 1 testing, or will robotic quality harm user testing feedback?
   - Recommendation: Test on Windows (Microsoft David/Maria), macOS (Luciana), and Chrome (Google pt-BR voices) early in Wave 1. If quality is too poor, fallback to prerecorded MP3s read by project team member for Phase 1 testing. Document voice quality assessment in Wave 1 review.

2. **Microphone Permission Persistence Across Sessions**
   - What we know: Browser persists permission decision per-origin; subsequent visits don't re-prompt if granted.
   - What's unclear: Does the permission screen need to be shown every time, or can we skip it if permission already granted?
   - Recommendation: Check navigator.permissions.query({ name: 'microphone' }) on mount; skip permission screen if state === 'granted'. Show screen only if 'prompt' or 'denied'. (Note: Permissions API support varies; fallback to always showing screen if query() fails.)

3. **SpeechSynthesis utterance.onend Timing Reliability**
   - What we know: utterance.onend fires when voice finishes speaking.
   - What's unclear: Does onend timing vary across browsers? Are there race conditions between onend and setTimeout pauses?
   - Recommendation: Add 100ms buffer to pause timings (e.g., [pausa 2s] → setTimeout 2100ms) to account for onend timing jitter. Test on Chrome, Firefox, Edge in Wave 1.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Development/build | ✓ | 22.16.0 | — |
| npm | Package management | ✓ | 10.9.2 | — |
| Modern browser (Chrome/Edge/Firefox) | Runtime (AudioContext, SpeechSynthesis, getUserMedia) | ✓ | Assumed | — |
| HTTPS | getUserMedia() requirement | — | TBD (localhost works) | Use localhost for dev; Vercel provides HTTPS for production |

**Missing dependencies with no fallback:**
- None identified — all core dependencies available.

**Missing dependencies with fallback:**
- HTTPS for production (Vercel deployment provides this automatically).

**Notes:**
- getUserMedia() requires secure context (HTTPS or localhost). Development on localhost works; production requires HTTPS.
- SpeechSynthesis API is widely supported (Chrome 33+, Firefox 49+, Edge 14+, Safari 16+). No fallback needed for Phase 1.
- AudioContext is universally supported in modern browsers. No fallback needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest stable) |
| Config file | vitest.config.ts — Wave 0 task |
| Quick run command | `npm test -- --run --reporter=verbose` |
| Full suite command | `npm test -- --run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLOW-01 | Start button triggers state machine START event | unit | `npm test machines/oracleMachine.test.ts -t "transitions from IDLE to APRESENTACAO on START"` | ❌ Wave 0 |
| FLOW-02 | Apresentação state plays full monologue with pauses | integration | `npm test components/experience/OracleExperience.test.tsx -t "plays apresentacao with pauses"` | ❌ Wave 0 |
| FLOW-03 | Inferno pergunta transitions to AGUARDANDO with 15s timeout | unit | `npm test machines/oracleMachine.test.ts -t "INFERNO.AGUARDANDO timeout after 15s"` | ❌ Wave 0 |
| FLOW-05 | Choice A transitions to RESPOSTA_A and then PURGATORIO_A | unit | `npm test machines/oracleMachine.test.ts -t "CHOICE_A path flows to PURGATORIO_A"` | ❌ Wave 0 |
| FLOW-06 | Purgatório pergunta is contextual to choice1 | unit | `npm test machines/oracleMachine.test.ts -t "PURGATORIO_A when choice1 is A"` | ❌ Wave 0 |
| FLOW-08 | Paraíso state delays 8s without requiring choice | unit | `npm test machines/oracleMachine.test.ts -t "PARAISO delays 8s to DEVOLUCAO"` | ❌ Wave 0 |
| FLOW-09 | Devolução variant selected based on choice1 + choice2 | unit | `npm test machines/oracleMachine.test.ts -t "DEVOLUCAO selects variant"` | ❌ Wave 0 |
| FLOW-10 | FIM state transitions to IDLE after 5s | unit | `npm test machines/oracleMachine.test.ts -t "FIM transitions to IDLE after 5s"` | ❌ Wave 0 |
| FLOW-12 | Complete 4-path flow duration is 7-10 minutes | integration | Manual timing test — not automated | Manual only |
| RES-03 | Microphone permission requested with explanatory screen | integration | `npm test components/experience/PermissionScreen.test.tsx -t "requests microphone on button click"` | ❌ Wave 0 |
| RES-04 | AudioContext unlocked on first click | unit | `npm test lib/audio/audioContext.test.ts -t "initAudioContext resumes suspended context"` | ❌ Wave 0 |
| UI-01 | Start button has animate-pulse class | unit | `npm test components/experience/StartButton.test.tsx -t "renders with animate-pulse"` | ❌ Wave 0 |
| UI-06 | Fade-to-black on FIM state | integration | `npm test components/experience/EndFade.test.tsx -t "applies fade transition"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run --reporter=verbose` (tests related to changed files)
- **Per wave merge:** `npm test -- --run --coverage` (full suite with coverage report)
- **Phase gate:** Full suite green + manual timing test for FLOW-12 before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — Vitest configuration for src/ path aliases and React Testing Library setup
- [ ] `machines/oracleMachine.test.ts` — State machine unit tests (transitions, timeouts, context updates)
- [ ] `lib/audio/audioContext.test.ts` — AudioContext unlock tests with standardized-audio-context-mock
- [ ] `components/experience/OracleExperience.test.tsx` — Integration test for main orchestrator component
- [ ] `components/experience/PermissionScreen.test.tsx` — getUserMedia() flow test with mocked navigator.mediaDevices
- [ ] `components/experience/StartButton.test.tsx` — UI snapshot test for pulsing button
- [ ] `components/experience/EndFade.test.tsx` — Fade transition test
- [ ] Framework install: `npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom standardized-audio-context-mock`

## Sources

### Primary (HIGH confidence)
- [XState v5 Official Docs - States](https://stately.ai/docs/states) - State machine patterns, nested states
- [XState v5 Official Docs - @xstate/react](https://stately.ai/docs/xstate-react) - React hooks (useMachine, useSelector)
- [XState v5 Official Docs - Delayed Transitions](https://stately.ai/docs/xstate-v4/transitions-and-events/delayed-transitions) - 'after' property, timeout patterns
- [MDN: Autoplay Guide for Media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) - AudioContext unlock requirements
- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) - Microphone permission API
- [MDN: SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) - Browser TTS API
- [Next.js Official Docs - Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - App Router component model
- [Next.js Official Docs - Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - App Router folder conventions
- [Tailwind CSS Official Docs - Animation](https://tailwindcss.com/docs/animation) - animate-pulse and animation utilities
- npm registry versions verified 2026-03-24 (Next.js 16.2.1, XState 5.29.0, React 19.2.4, Tailwind 4.2.2)

### Secondary (MEDIUM confidence)
- [Stately Blog: XState v5 is here](https://stately.ai/blog/2023-12-01-xstate-v5) - XState v5 release notes and migration
- [Chrome Blog: Autoplay Policy](https://developer.chrome.com/blog/autoplay) - Browser autoplay policy details
- [Chrome Blog: Web Audio and Autoplay](https://developer.chrome.com/blog/web-audio-autoplay) - AudioContext autoplay specifics
- [Digital Thrive: Get Microphone Permission Best Practices](https://digitalthriveai.com/en-us/resources/docs/ui-ux/get-microphone-permission/) - UX patterns for permission requests
- [Kyle Shevlin: Guidelines for State Machines and XState](https://kyleshevlin.com/guidelines-for-state-machines-and-xstate/) - XState design anti-patterns
- [Stately Docs: Testing](https://stately.ai/docs/testing) - XState testing strategies
- [standardized-audio-context-mock npm package](https://www.npmjs.com/package/standardized-audio-context-mock) - AudioContext mocking for tests

### Tertiary (LOW confidence)
- [DEV Community: Best Practices for Organizing Next.js 15](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) - Next.js folder structure opinions (2025 article, not official docs)
- [StateMachine.app: Common Pitfalls](https://statemachine.app/article/Common_pitfalls_to_avoid_when_working_with_state_machines.html) - General state machine pitfalls (not XState-specific)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm registry versions verified; Next.js, XState, Tailwind are mature, stable releases
- Architecture: HIGH - Patterns sourced from official XState, MDN, Next.js documentation; widely adopted in production
- Pitfalls: MEDIUM-HIGH - Based on official docs + community experience; some edge cases require Wave 1 validation (e.g., SpeechSynthesis voice quality, onend timing)
- Environment availability: HIGH - Node.js 22.16.0 and npm 10.9.2 confirmed available; browser APIs universally supported

**Research date:** 2026-03-24
**Valid until:** ~30 days (2026-04-23) — Next.js, XState, and Tailwind are stable; browser APIs unchanged since 2018 autoplay policy
