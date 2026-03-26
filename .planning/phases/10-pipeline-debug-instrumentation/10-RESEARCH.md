# Phase 10: Pipeline Debug Instrumentation - Research

**Researched:** 2026-03-26
**Domain:** React debugging, development tools, real-time state visualization
**Confidence:** HIGH

## Summary

Phase 10 requires building developer-facing instrumentation to diagnose the critical bug: microphone not activating in AGUARDANDO states. The goal is real-time visibility into the voice pipeline state machine (`ttsComplete`, `micShouldActivate`, `voiceLifecycle`, `isRecording`) plus comprehensive console logging with timestamps for every pipeline transition.

This research identifies the standard tooling and patterns for React debug panels: custom hooks with `useDebugValue`, fixed-position overlay components toggled via keyboard shortcuts (`Ctrl+Shift+D`), and structured console logging with high-resolution timestamps using `performance.now()`. The instrumentation must be **zero-impact** on production visitor experience—hidden by default, no performance overhead when inactive, cleanly removable.

**Primary recommendation:** Build a `<DebugPanel>` component with live state display, activated by keyboard shortcut. Enhance existing console.log statements with namespaced prefixes (`[VoiceChoice]`, `[Mic]`, `[TTS]`) and `performance.now()` timestamps for precise timeline reconstruction. Use `useDebugValue` in custom hooks for React DevTools integration.

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|------------------|
| DIAG-01 | Dev debug panel shows pipeline state in real-time (ttsComplete, micShouldActivate, voiceLifecycle phase, isRecording) | Debug panel overlay component + useDebugValue for hooks |
| DIAG-02 | Console logs trace every pipeline transition with timestamps | performance.now() timestamps + namespaced console patterns |
| DIAG-03 | Debug panel is togglable via keyboard shortcut and hidden by default | useKeyboardShortcut hook + Ctrl+Shift+D convention |

</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (built-in) | 19.0.0 (current: 19.2.4) | useDebugValue, useEffect, useState | Built-in hooks for debug instrumentation, zero dependencies |
| performance.now() | Browser API | High-resolution timestamps (microsecond precision) | Standard Web Performance API, better than Date.now() for profiling |
| Next.js (built-in) | 15.3.3 (current: 16.2.1) | Development mode detection via `process.env.NODE_ENV` | Already in project, no new dependencies |

**Current versions verified 2026-03-26:**
- `react@19.2.4` (project uses 19.0.0, compatible)
- `next@16.2.1` (project uses 15.3.3, compatible)

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Chrome DevTools WebAudio | Browser extension | Real-time Web Audio API graph visualization | Optional for deeper TTS/audio debugging beyond Phase 10 scope |
| vitest (installed) | 2.1.8 | Test framework for debug panel unit tests | Test keyboard shortcuts, visibility toggle, state display |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom panel | React DevTools only | DevTools requires browser extension + manual inspection; custom panel provides one-click visibility |
| performance.now() | Date.now() | Date.now() has ~1ms resolution, performance.now() has microsecond precision for timing voice pipeline race conditions |
| Ctrl+Shift+D | Environment variable toggle | Keyboard shortcut allows instant toggle during browser testing without rebuild |
| Built-in React hooks | react-hotkeys-hook library | Library adds dependency for simple useEffect + keydown listener pattern; not needed for single shortcut |

**Installation:**

No new npm packages required. All instrumentation uses built-in React APIs and browser standards.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── debug/
│       ├── DebugPanel.tsx           # Main overlay component
│       ├── PipelineStateDisplay.tsx # Live state table
│       └── __tests__/
│           └── DebugPanel.test.tsx
├── hooks/
│   ├── useKeyboardShortcut.ts       # Keyboard event listener
│   └── useDebugLogger.ts            # Structured console logger
└── lib/
    └── debug/
        └── logger.ts                 # Console log formatter with timestamps
```

### Pattern 1: Debug Panel Overlay Component

**What:** Fixed-position overlay that displays live pipeline state, hidden by default, toggled via keyboard shortcut

**When to use:** Development-only UI that must not interfere with visitor experience

**Example:**

```typescript
// src/components/debug/DebugPanel.tsx
import { useState, useEffect } from 'react';

export interface DebugPanelProps {
  ttsComplete: boolean;
  micShouldActivate: boolean;
  voiceLifecyclePhase: string;
  isRecording: boolean;
}

export default function DebugPanel(props: DebugPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-xl z-[9999] font-mono text-xs">
      <h3 className="font-bold mb-2">Voice Pipeline Debug</h3>
      <table className="border-collapse">
        <tbody>
          <tr>
            <td className="pr-4 text-gray-400">ttsComplete:</td>
            <td className={props.ttsComplete ? 'text-green-400' : 'text-red-400'}>
              {String(props.ttsComplete)}
            </td>
          </tr>
          <tr>
            <td className="pr-4 text-gray-400">micShouldActivate:</td>
            <td className={props.micShouldActivate ? 'text-green-400' : 'text-red-400'}>
              {String(props.micShouldActivate)}
            </td>
          </tr>
          <tr>
            <td className="pr-4 text-gray-400">voiceLifecycle:</td>
            <td className="text-yellow-400">{props.voiceLifecyclePhase}</td>
          </tr>
          <tr>
            <td className="pr-4 text-gray-400">isRecording:</td>
            <td className={props.isRecording ? 'text-green-400' : 'text-red-400'}>
              {String(props.isRecording)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-gray-500 text-[10px]">Press Ctrl+Shift+D to hide</p>
    </div>
  );
}
```

**Source:** [React onKeyDown Event - GeeksforGeeks](https://www.geeksforgeeks.org/reactjs/react-onkeydown-event/), [Implementing Keyboard Shortcuts with React Hooks](https://www.fullstack.com/labs/resources/blog/keyboard-shortcuts-with-react-hooks)

### Pattern 2: Structured Console Logging with Timestamps

**What:** Prefix-namespaced console logs with `performance.now()` timestamps for precise timeline reconstruction

**When to use:** Tracing async pipeline transitions (TTS start/end, mic open/close, STT/NLU API calls)

**Example:**

```typescript
// src/lib/debug/logger.ts
const LOG_START_TIME = performance.now();

export function createLogger(namespace: string) {
  return {
    log: (message: string, ...args: any[]) => {
      const elapsed = (performance.now() - LOG_START_TIME).toFixed(2);
      console.log(`[${elapsed}ms] [${namespace}] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      const elapsed = (performance.now() - LOG_START_TIME).toFixed(2);
      console.error(`[${elapsed}ms] [${namespace}] ${message}`, ...args);
    },
  };
}

// Usage in hooks:
const logger = createLogger('VoiceChoice');
logger.log('startListening, duration:', listeningDuration);
logger.log('STT result:', JSON.stringify(transcript));
```

**Why timestamps matter:** The bug involves race conditions between `ttsComplete` flag and mic activation. `performance.now()` provides microsecond precision to detect timing issues that `Date.now()` (1ms resolution) would miss.

**Source:** [Structured Logging in NextJS with OpenTelemetry | SigNoz](https://signoz.io/blog/opentelemetry-nextjs-logging/), [Console.log Timestamps in Chrome](https://www.xjavascript.com/blog/console-log-timestamps-in-chrome/), [Performance Timing in Chrome DevTools](https://www.telerik.com/blogs/perf-timing-in-chrome-devtools-console-time-performance-mark)

### Pattern 3: useDebugValue for Custom Hook Inspection

**What:** React hook that adds custom labels to hooks in React DevTools

**When to use:** Debugging `useVoiceChoice`, `useMicrophone`, `useTTSOrchestrator` lifecycle state

**Example:**

```typescript
// src/hooks/useVoiceChoice.ts (enhancement)
import { useDebugValue } from 'react';

export function useVoiceChoice(config: ChoiceConfig, active: boolean): UseVoiceChoiceReturn {
  const [lifecycle, dispatch] = useReducer(voiceLifecycleReducer, { phase: 'idle' });

  // Add debug label visible in React DevTools
  useDebugValue(
    active ? `${lifecycle.phase} (active)` : 'inactive',
    (value) => `VoiceChoice: ${value}`
  );

  // ... rest of hook
}
```

**Restriction:** `useDebugValue` only works inside custom hooks, not in component bodies.

**Source:** [useDebugValue – React (official docs)](https://react.dev/reference/react/useDebugValue), [Improve custom Hook debugging with useDebugValue - LogRocket](https://blog.logrocket.com/improve-custom-hook-debugging-with-usedebugvalue/)

### Pattern 4: Keyboard Shortcut Hook

**What:** Reusable hook for detecting key combinations

**When to use:** Debug panel toggle, dev skip buttons, admin shortcuts

**Example:**

```typescript
// src/hooks/useKeyboardShortcut.ts
import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrlMatch = modifiers?.ctrl === undefined || e.ctrlKey === modifiers.ctrl;
      const shiftMatch = modifiers?.shift === undefined || e.shiftKey === modifiers.shift;
      const altMatch = modifiers?.alt === undefined || e.altKey === modifiers.alt;
      const keyMatch = e.key === key;

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifiers]);
}

// Usage:
useKeyboardShortcut('D', () => setDebugVisible(prev => !prev), { ctrl: true, shift: true });
```

**Best practice:** Use `onKeyDown` (not deprecated `onKeyPress`) for modifier key support.

**Source:** [How to add keyboard shortcuts to your React app - Devtrium](https://devtrium.com/posts/how-keyboard-shortcut), [Creating a Keyboard Shortcut Hook in React - Tania Rascia](https://www.taniarascia.com/keyboard-shortcut-hook-react/)

### Anti-Patterns to Avoid

- **Logging to console in production:** Check `process.env.NODE_ENV === 'development'` before verbose logging
- **Expensive useDebugValue formatters:** Second argument (formatter function) should be cheap; defer expensive JSON.stringify
- **Global event listeners without cleanup:** Always `removeEventListener` in useEffect cleanup to prevent memory leaks
- **Debug panel blocking interactions:** Use `pointer-events-none` on overlay container, `pointer-events-auto` only on panel itself
- **Hard-coded visibility state:** Toggle via keyboard, not environment variable (requires rebuild to change)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time measurement for profiling | Manual `Date.now()` subtraction | `performance.now()` or `console.time()`/`console.timeEnd()` | Microsecond precision, automatic formatting, standardized |
| React component state inspection | Custom state logging system | `useDebugValue` + React DevTools | Browser extension shows all state/props, official API |
| Keyboard event normalization | Cross-browser key code mapping | Modern `e.key` property (not deprecated `e.keyCode`) | All modern browsers support `e.key`, no polyfill needed |
| Structured logging library | Custom Winston/Pino integration | Simple console wrapper with namespaces | Zero dependencies, dev-only feature, removed in production |

**Key insight:** Debugging infrastructure should be lightweight and removable. Adding Pino/Winston for dev-only logging creates bundle size overhead and production complexity. A 20-line logger utility with `performance.now()` timestamps covers 100% of Phase 10 requirements.

## Common Pitfalls

### Pitfall 1: Debug Panel Not Showing in Production Build

**What goes wrong:** Debug panel renders in dev but disappears in production build

**Why it happens:** Tree-shaking removes unreferenced code; Tailwind purges unused classes

**How to avoid:**
- Wrap debug components in `if (process.env.NODE_ENV === 'development')` at **component instantiation** (not just render)
- Add `safelist` to Tailwind config for debug panel classes if needed
- Test production build locally: `npm run build && npm start`

**Warning signs:** Panel works in `npm run dev`, missing in deployed build

### Pitfall 2: Keyboard Shortcut Conflicts

**What goes wrong:** Debug shortcut (`Ctrl+Shift+D`) conflicts with browser DevTools or OS shortcuts

**Why it happens:** Chrome uses `Ctrl+Shift+I` for DevTools, Windows uses `Win+Shift+S` for screenshots; conflicts vary by OS

**How to avoid:**
- Test shortcut on all target platforms (Windows, macOS, Linux)
- Use `e.preventDefault()` to block browser default behavior
- Document shortcut in debug panel UI ("Press Ctrl+Shift+D to hide")
- Fallback: Add secondary trigger (URL query param `?debug=true`)

**Warning signs:** Shortcut opens browser feature instead of debug panel

### Pitfall 3: Stale State in Debug Panel

**What goes wrong:** Debug panel shows outdated `ttsComplete` or `isRecording` values

**Why it happens:** Props passed once at mount time, not updated on state change

**How to avoid:**
- Pass state values as **props** to `<DebugPanel>`, not via context/ref
- Ensure parent component re-renders when watched state changes
- Verify with React DevTools Profiler that OracleExperience re-renders on state updates

**Warning signs:** Panel shows `ttsComplete: false` while audio is clearly playing

### Pitfall 4: Console Log Spam

**What goes wrong:** Hundreds of logs per second from high-frequency events (audio processing, render loops)

**Why it happens:** Logging inside `useEffect` without proper dependencies, or in render function

**How to avoid:**
- Log only **state transitions**, not state reads (e.g., log when `isRecording` changes from `false → true`, not every render)
- Use `useEffect` with proper dependencies to detect changes
- Throttle logs for continuous events (e.g., waveform updates)

**Warning signs:** Browser console freezes, DevTools unusable, page stutters

### Pitfall 5: Memory Leaks from Event Listeners

**What goes wrong:** Debug panel removed but keyboard listener remains active, causing multiple handlers

**Why it happens:** `useEffect` cleanup not called, or listener attached to wrong scope

**How to avoid:**
- Always return cleanup function from `useEffect`: `return () => window.removeEventListener(...)`
- Attach listener to `window`, not `document` (React synthetic events don't capture global shortcuts)
- Verify cleanup with React DevTools: unmount component, trigger shortcut, check for errors

**Warning signs:** Pressing shortcut toggles panel multiple times, console shows duplicate logs

## Code Examples

Verified patterns from official sources and current project code:

### Example 1: Integrating Debug Panel into OracleExperience

```typescript
// src/components/experience/OracleExperience.tsx (addition)
import DebugPanel from '@/components/debug/DebugPanel';

export default function OracleExperience() {
  const [state, send] = useMachine(oracleMachine);
  const [ttsComplete, setTtsComplete] = useState(false);
  const voiceChoice = useVoiceChoice(activeChoiceConfig || {...}, micShouldActivate);

  return (
    <PhaseBackground phase={state.context.currentPhase}>
      {/* Existing UI */}

      {/* Debug panel (dev-only) */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          ttsComplete={ttsComplete}
          micShouldActivate={micShouldActivate}
          voiceLifecyclePhase={voiceChoice.lifecycle.phase}
          isRecording={voiceChoice.isRecording}
        />
      )}
    </PhaseBackground>
  );
}
```

**Source:** Current project architecture from `OracleExperience.tsx`

### Example 2: Enhanced Console Logging in useVoiceChoice

```typescript
// src/hooks/useVoiceChoice.ts (enhancement)
import { createLogger } from '@/lib/debug/logger';

const logger = createLogger('VoiceChoice');

export function useVoiceChoice(config: ChoiceConfig, active: boolean): UseVoiceChoiceReturn {
  // Existing code...

  const startListening = useCallback(async () => {
    logger.log('startListening START', { duration: listeningDuration, active });
    setError(null);
    dispatch({ type: 'START_LISTENING' });
    await startRecording(listeningDuration);
    logger.log('startListening END');
  }, [startRecording, listeningDuration]);

  // In processAudio function:
  logger.log('Processing audio blob START', { size: blob.size, attempt: currentAttempt });
  const transcript = await stt.transcribe(blob);
  logger.log('STT complete', { transcript, length: transcript.length });
  const classification = await nlu.classify(transcript, snap.questionContext, snap.options);
  logger.log('NLU complete', { choice: classification.choice, confidence: classification.confidence });
}
```

**Source:** Current console.log pattern in `useVoiceChoice.ts`, enhanced with structured logger

### Example 3: TTS Complete Tracking Log

```typescript
// src/components/experience/OracleExperience.tsx (in TTS effect)
import { createLogger } from '@/lib/debug/logger';

const logger = createLogger('TTS');

useEffect(() => {
  const scriptKey = getScriptKey(state);
  if (!scriptKey) return;

  logger.log('TTS effect START', { scriptKey, state: JSON.stringify(state.value) });
  tts.cancel();
  setTtsComplete(false);

  let cancelled = false;
  speakTimeoutRef.current = setTimeout(() => {
    if (cancelled) return;

    logger.log('TTS speak START', { phase: state.context.currentPhase });
    tts.speak(SCRIPT[scriptKey], state.context.currentPhase)
      .then(() => {
        if (!cancelled) {
          logger.log('TTS speak END', { success: true });
          setTtsComplete(true);
        }
      })
      .catch((err) => {
        logger.error('TTS speak FAILED', { error: err.message });
        if (!cancelled && err.message !== 'Speech cancelled') {
          setTtsComplete(true);
        }
      });
  }, 0);

  return () => {
    logger.log('TTS effect CLEANUP', { cancelled: !cancelled });
    cancelled = true;
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
    tts.cancel();
  };
}, [state.value]);
```

**Source:** Current TTS orchestration pattern in `OracleExperience.tsx`

### Example 4: Microphone Lifecycle Logging

```typescript
// src/hooks/useMicrophone.ts (enhancement)
import { createLogger } from '@/lib/debug/logger';

const logger = createLogger('Mic');

export function useMicrophone(): UseMicrophoneReturn {
  const startRecording = useCallback(async (maxDuration?: number) => {
    logger.log('startRecording START', { maxDuration });

    // Existing code...
    const stream = await navigator.mediaDevices.getUserMedia({...});
    logger.log('getUserMedia SUCCESS', { streamId: stream.id });

    const recorder = new MediaRecorder(stream, options);
    recorder.onstop = () => {
      logger.log('MediaRecorder onstop', { blobSize: blob.size });
      setAudioBlob(blob);
      releaseStream();
    };

    recorder.start();
    logger.log('MediaRecorder started', { state: recorder.state });
    setIsRecording(true);

    if (maxDuration) {
      autoStopRef.current = setTimeout(() => {
        logger.log('Auto-stop timer FIRED');
        if (mediaRecorderRef.current === recorder && recorder.state === 'recording') {
          recorder.stop();
        }
      }, maxDuration);
    }
  }, [releaseStream, stopRecording]);

  const stopRecording = useCallback(() => {
    logger.log('stopRecording', {
      hasRecorder: !!mediaRecorderRef.current,
      state: mediaRecorderRef.current?.state
    });
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      logger.log('Auto-stop timer CLEARED');
    }
    // Existing code...
  }, []);

  return { isRecording, audioBlob, error, startRecording, stopRecording };
}
```

**Source:** Current microphone hook pattern in `useMicrophone.ts`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| console.log() everywhere | Namespaced logger with performance.now() | 2024-2025 | Searchable logs, precise timing for async debugging |
| React DevTools only | Custom debug panels + DevTools | 2023-2024 | Faster iteration, no browser extension required |
| Date.now() for timing | performance.now() or console.time() | 2020+ | Microsecond precision, immune to system clock changes |
| keyCode property | key property | 2018+ | Modern standard, no key code lookup tables |
| Class components + refs | Hooks + useDebugValue | 2019+ | Cleaner debug instrumentation, better DevTools integration |

**Deprecated/outdated:**
- `onKeyPress` event: Replaced by `onKeyDown` (supports modifier keys)
- `event.keyCode`: Replaced by `event.key` (human-readable strings)
- Heavy logging libraries for dev-only needs: Simple wrappers sufficient for debug instrumentation

## Open Questions

1. **Should debug panel show XState machine state tree?**
   - What we know: `state.value` is a nested object representing hierarchical state (e.g., `{ INFERNO: 'AGUARDANDO' }`)
   - What's unclear: Whether exposing full machine context (`state.context`) is useful vs. noisy
   - Recommendation: Start with 4 core pipeline flags (DIAG-01), add machine state in Phase 11 if needed

2. **Should logs persist across page refresh?**
   - What we know: Console logs vanish on refresh; localStorage could persist timeline
   - What's unclear: Whether persistence is worth the complexity for a 2-3 minute experience
   - Recommendation: Skip persistence, use Chrome DevTools "Preserve log" checkbox instead

3. **Should debug panel include manual trigger buttons (force TTS complete, force mic start)?**
   - What we know: Manual override could bypass the pipeline for testing
   - What's unclear: Whether this creates false confidence (tests pass but real flow still broken)
   - Recommendation: Defer to Phase 11 after root cause identified; premature overrides mask bugs

## Validation Architecture

> Phase 10 has no external dependencies (code/config-only changes to add debug instrumentation)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 2.1.8 + @testing-library/react 16.1.0 |
| Config file | `vitest.config.ts` (already configured) |
| Quick run command | `npm test -- src/components/debug` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIAG-01 | Debug panel displays pipeline state (ttsComplete, micShouldActivate, voiceLifecyclePhase, isRecording) | unit | `npm test -- src/components/debug/DebugPanel.test.tsx -x` | ❌ Wave 0 |
| DIAG-02 | createLogger adds timestamps and namespaces to console output | unit | `npm test -- src/lib/debug/logger.test.ts -x` | ❌ Wave 0 |
| DIAG-03 | useKeyboardShortcut detects Ctrl+Shift+D and toggles panel visibility | unit | `npm test -- src/hooks/useKeyboardShortcut.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/components/debug` (quick, <5s)
- **Per wave merge:** `npm test` (full suite, 307 tests, ~30s)
- **Phase gate:** Full suite green + manual browser test (verify shortcut works, panel updates live)

### Wave 0 Gaps

- [ ] `src/components/debug/__tests__/DebugPanel.test.tsx` — covers DIAG-01 (panel renders, displays props, hides when not visible)
- [ ] `src/lib/debug/__tests__/logger.test.ts` — covers DIAG-02 (createLogger returns log/error functions, formats with timestamp+namespace)
- [ ] `src/hooks/__tests__/useKeyboardShortcut.test.ts` — covers DIAG-03 (callback fires on Ctrl+Shift+D, preventDefault called, cleanup removes listener)

## Sources

### Primary (HIGH confidence)

- [useDebugValue – React (official docs)](https://react.dev/reference/react/useDebugValue) - useDebugValue API reference
- [performance.now() - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) - High-resolution timestamp API
- [React Developer Tools – React (official)](https://react.dev/learn/react-developer-tools) - DevTools usage patterns
- [console - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/console) - Console API reference
- [Next.js config: logging](https://nextjs.org/docs/app/api-reference/config/next-config-js/logging) - Next.js logging configuration

### Secondary (MEDIUM confidence)

- [Structured Logging in NextJS with OpenTelemetry | SigNoz](https://signoz.io/blog/opentelemetry-nextjs-logging/) - Timestamp patterns for Next.js
- [Improve custom Hook debugging with useDebugValue - LogRocket](https://blog.logrocket.com/improve-custom-hook-debugging-with-usedebugvalue/) - useDebugValue real-world usage
- [How to add keyboard shortcuts to your React app - Devtrium](https://devtrium.com/posts/how-keyboard-shortcut) - Keyboard shortcut implementation patterns
- [Creating a Keyboard Shortcut Hook in React - Tania Rascia](https://www.taniarascia.com/keyboard-shortcut-hook-react/) - useKeyboardShortcut hook pattern
- [React onKeyDown Event - GeeksforGeeks](https://www.geeksforgeeks.org/reactjs/react-onkeydown-event/) - Keyboard event best practices
- [WebAudio: View WebAudio API metrics | Chrome DevTools](https://developer.chrome.com/docs/devtools/webaudio) - Web Audio debugging tools (optional)
- [Console.log Timestamps in Chrome](https://www.xjavascript.com/blog/console-log-timestamps-in-chrome/) - Browser console timestamp patterns
- [Performance Timing in Chrome DevTools](https://www.telerik.com/blogs/perf-timing-in-chrome-devtools-console-time-performance-mark) - console.time() vs performance.now()

### Tertiary (LOW confidence - informational only)

- [Implementing Keyboard Shortcuts with React Hooks](https://www.fullstack.com/labs/resources/blog/keyboard-shortcuts-with-react-hooks) - General keyboard patterns
- [Next.js Logging Best Practices - Prateeksha](https://prateeksha.com/blog/next-js-logs-and-error-tracking-tools-and-best-practices) - Logging strategies (dated, pre-App Router)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All built-in React/browser APIs, verified in project package.json
- Architecture: HIGH - Patterns sourced from React official docs + verified in existing codebase structure
- Pitfalls: HIGH - Common debug panel issues documented across multiple sources, tested patterns

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (30 days - stable browser/React APIs, unlikely to change)

**Research complete.** Planner can now create PLAN.md files for Wave 0 (test infrastructure) and Wave 1 (debug panel implementation).
