# Phase 18: Components & Services - Research

**Researched:** 2026-03-28
**Domain:** React component updates, service pattern mapping, XState v5 machine integration
**Confidence:** HIGH

## Summary

Phase 18 connects the finalized v3.1 script (6 choices, 8 devoluções, ~50 audio keys) to the existing component architecture built during v3.0. The core challenge is updating three interconnected pieces: OracleExperience (state mapping), FallbackTTSService (audio URL mapping), and useVoiceChoice (NLU context configuration).

The machine state structure from v3.0 Phase 17 is already correct (~42 states) and the script from v3.1 Phase 24 is frozen. This phase is purely **mechanical mapping work** — no architectural redesign, no new patterns. The patterns (service factory, frozen config refs, lifecycle FSMs) are already proven and in production.

**Primary recommendation:** Use direct state-to-key mapping tables. Update OracleExperience.getScriptKey() for all ~42 states, regenerate FallbackTTSService.PRERECORDED_URLS from script keys, create 6 ChoiceConfig objects with QUESTION_META. All TypeScript-verified, all test coverage from existing patterns.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CMPV3-01 | OracleExperience handles all ~42 states from v3 XState machine | State-to-script mapping pattern (getScriptKey function) already proven in codebase |
| CMPV3-02 | FallbackTTS PRERECORDED_URLS updated for ~50 audio keys matching script.ts | Pre-recorded URL mapping pattern exists, needs regeneration from script.ts keys |
| CMPV3-03 | useVoiceChoice provides 6 ChoiceConfig objects with per-question NLU context | QUESTION_META in types/index.ts already defines all 6 questions' NLU metadata |

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| XState | 5.20.0 | State machine orchestration | Type-safe state management, proven in v3.0 Phase 17 |
| @xstate/react | 5.0.0 | React integration for XState | Official XState React bindings |
| React | 19.0.0 | Component framework | Next.js 15 App Router requirement |
| TypeScript | 5.7.3 | Type safety | Catches state mapping errors at compile time |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 2.1.8 | Testing framework | Component tests (TSTV3-02 in Phase 20) |
| @testing-library/react | 16.1.0 | React component testing | Testing OracleExperience state mapping |

**Installation:**
All dependencies already installed. No `npm install` required.

**Version verification:**
```bash
# Verified from package.json 2026-03-28
xstate@5.20.0 (published 2025-11-20)
@xstate/react@5.0.0 (published 2025-11-15)
react@19.0.0 (published 2024-12-05)
typescript@5.7.3 (published 2024-12-19)
```

## Architecture Patterns

### Pattern 1: State-to-Script Key Mapping (OracleExperience)

**What:** A pure function that maps XState state value to script.ts key.

**When to use:** Every time machine transitions to a narrative state (non-AGUARDANDO, non-IDLE).

**Existing implementation:**
```typescript
// src/components/experience/OracleExperience.tsx (lines 103-125)
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';
  if (machineState.matches({ INFERNO: 'NARRATIVA' })) return 'INFERNO_NARRATIVA';
  // ... OLD 3-choice mappings (19 keys) ...
  return null; // IDLE, AGUARDANDO, FIM -- no speech
}
```

**What needs updating:**
1. Hierarchical state matching for 6 questions across 3 realms (INFERNO Q1-Q2, PURGATORIO Q3-Q4, PARAISO Q5-Q6)
2. All ~42 machine states must map to script keys or return null (AGUARDANDO states have no speech)
3. 8 devolução states (DEVOLUCAO_SEEKER, DEVOLUCAO_GUARDIAN, etc.) map to corresponding script keys

**New implementation structure:**
```typescript
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  // Top-level states
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';
  if (machineState.matches('ENCERRAMENTO')) return 'ENCERRAMENTO';

  // INFERNO substates (Q1, Q2)
  if (machineState.matches({ INFERNO: 'INTRO' })) return 'INFERNO_INTRO';
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return 'INFERNO_Q1_SETUP';
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return 'INFERNO_Q1_PERGUNTA';
  // ... Q1_RESPOSTA_A, Q1_RESPOSTA_B, Q1_TIMEOUT ...
  // ... Q2 states ...

  // PURGATORIO substates (Q3, Q4)
  if (machineState.matches({ PURGATORIO: 'INTRO' })) return 'PURGATORIO_INTRO';
  // ... Q3, Q4 states ...

  // PARAISO substates (Q5, Q6)
  if (machineState.matches({ PARAISO: 'INTRO' })) return 'PARAISO_INTRO';
  // ... Q5, Q6 states ...

  // DEVOLUCAO routing states (8 archetypes)
  if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
  // ... all 8 archetypes ...

  return null; // AGUARDANDO, IDLE, FIM, DEVOLUCAO (routing state)
}
```

**Source:** Existing pattern from OracleExperience.tsx lines 103-125, machine structure from oracleMachine.ts.

### Pattern 2: Pre-recorded Audio URL Mapping (FallbackTTSService)

**What:** A static Record mapping script keys to MP3 file paths.

**When to use:** FallbackTTSService.speak() uses this to load correct audio file when USE_REAL_APIS=false.

**Existing implementation:**
```typescript
// src/services/tts/fallback.ts (lines 10-36)
const PRERECORDED_URLS: Record<string, string> = {
  APRESENTACAO: '/audio/prerecorded/apresentacao.mp3',
  INFERNO_NARRATIVA: '/audio/prerecorded/inferno_narrativa.mp3',
  // ... OLD 3-choice keys (26 URLs) ...
};
```

**What needs updating:**
Regenerate all ~50 keys from script.ts. Pattern: `SCRIPT_KEY: '/audio/prerecorded/{lowercase_key}.mp3'`

**Generation strategy:**
```typescript
// All keys from ScriptDataV3 interface in src/data/script.ts
const scriptKeys = [
  'APRESENTACAO',
  'INFERNO_INTRO', 'INFERNO_Q1_SETUP', 'INFERNO_Q1_PERGUNTA',
  'INFERNO_Q1_RESPOSTA_A', 'INFERNO_Q1_RESPOSTA_B',
  'INFERNO_Q2_SETUP', 'INFERNO_Q2_PERGUNTA',
  'INFERNO_Q2_RESPOSTA_A', 'INFERNO_Q2_RESPOSTA_B',
  // ... PURGATORIO (10 keys), PARAISO (10 keys) ...
  'DEVOLUCAO_SEEKER', 'DEVOLUCAO_GUARDIAN', /* ... 8 total ... */,
  'ENCERRAMENTO',
  'FALLBACK_Q1', /* ... 6 fallbacks ... */,
  'TIMEOUT_Q1', /* ... 6 timeouts ... */,
];

const PRERECORDED_URLS = Object.fromEntries(
  scriptKeys.map(key => [key, `/audio/prerecorded/${key.toLowerCase()}.mp3`])
);
```

**Source:** Existing pattern from fallback.ts lines 10-36, keys from script.ts lines 22-86 (ScriptDataV3 interface).

### Pattern 3: ChoiceConfig Objects (useVoiceChoice)

**What:** 6 frozen configuration objects passed to useVoiceChoice hook, one per question.

**When to use:** When machine enters Q1_AGUARDANDO, Q2_AGUARDANDO, Q3_AGUARDANDO, Q4_AGUARDANDO, Q5_AGUARDANDO, Q6_AGUARDANDO.

**Existing implementation:**
```typescript
// src/components/experience/OracleExperience.tsx (lines 28-47)
const INFERNO_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Inferno, escolhendo entre a porta das vozes ou a porta do silencio',
  options: { A: 'Vozes', B: 'Silencio' },
  eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  defaultEvent: 'CHOICE_B',
};
// ... OLD: 3 choice configs (PURGATORIO_A, PURGATORIO_B) ...
```

**What needs updating:**
Replace 3 old configs with 6 new configs. Source all metadata from `QUESTION_META` in types/index.ts (lines 86-135).

**New implementation structure:**
```typescript
const Q1_CHOICE: ChoiceConfig = {
  questionContext: QUESTION_META[1].questionContext,
  options: { A: QUESTION_META[1].optionA, B: QUESTION_META[1].optionB },
  eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  defaultEvent: `CHOICE_${QUESTION_META[1].defaultOnTimeout}`,
};

const Q2_CHOICE: ChoiceConfig = { /* same pattern for Q2 */ };
// ... Q3, Q4, Q5, Q6 ...

// Active config selector in useMemo
const activeChoiceConfig = useMemo(() => {
  if (state.matches({ INFERNO: 'Q1_AGUARDANDO' })) return Q1_CHOICE;
  if (state.matches({ INFERNO: 'Q2_AGUARDANDO' })) return Q2_CHOICE;
  if (state.matches({ PURGATORIO: 'Q3_AGUARDANDO' })) return Q3_CHOICE;
  // ... Q4, Q5, Q6 ...
  return null;
}, [state.value]);
```

**Source:** Existing pattern from OracleExperience.tsx lines 28-47, metadata from types/index.ts lines 86-135.

### Pattern 4: Frozen Config Refs (Stale Closure Prevention)

**What:** `useEffect` hook that freezes config snapshot when `active` flag becomes true.

**When to use:** Prevents stale closures in async voice pipeline (already implemented in useVoiceChoice).

**Existing implementation:**
```typescript
// src/hooks/useVoiceChoice.ts (lines 136-144)
const configRef = useRef(config);
const activeRef = useRef(active);
useEffect(() => {
  activeRef.current = active;
  if (active) {
    configRef.current = config; // Freeze snapshot
  }
}, [config, active]);

// Later in processAudio:
const snap = configRef.current; // Use frozen snapshot, not live prop
```

**What needs updating:** Nothing. Pattern already handles dynamic config changes correctly.

**Source:** Phase 9 fix from v1.2 milestone (TTSR-03), implemented in useVoiceChoice.ts lines 136-144.

### Pattern 5: Breathing Delays Between States

**What:** Configurable pauses between TTS completion and NARRATIVA_DONE event.

**When to use:** Already implemented — no changes needed. Delays are state-specific (LONG for phase transitions, MEDIUM for narratives, SHORT for questions).

**Existing implementation:**
```typescript
// src/components/experience/OracleExperience.tsx (lines 59-98)
function getBreathingDelay(machineState: any): number {
  const LONG = 2500;   // Phase transitions
  const MEDIUM = 1500; // Narratives
  const SHORT = 800;   // Questions
  const NONE = 0;      // Timeouts/fallbacks

  if (machineState.matches('APRESENTACAO')) return LONG;
  // ... state-specific delays ...
}
```

**What needs updating:** Add breathing delay mappings for new states (Q1-Q6 SETUP/PERGUNTA/RESPOSTA, TIMEOUT states).

**Source:** Existing pattern from OracleExperience.tsx lines 59-98.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Script key extraction | Manual string parsing from script.ts | TypeScript `keyof typeof SCRIPT` | Compile-time verification, auto-completion |
| State matching | String comparison `state.value === 'X'` | XState `.matches()` API | Works with hierarchical states, type-safe |
| Audio URL generation | Runtime string concatenation | Static Record at module level | Faster lookup, pre-verified paths |
| Choice config routing | Switch/if chains in render | `useMemo` selector with state.matches | Single source of truth, automatic reactivity |
| NLU context strings | Hardcoded strings in components | Import from QUESTION_META | Single source of truth, already defined |

**Key insight:** TypeScript + XState provides compile-time guarantees. A typo in state name or script key causes build failure, not runtime error. Lean into this — use types as truth, not documentation.

## Common Pitfalls

### Pitfall 1: Forgetting Hierarchical State Matching

**What goes wrong:** Using `state.matches('Q1_SETUP')` instead of `state.matches({ INFERNO: 'Q1_SETUP' })` returns false even when machine is in that state.

**Why it happens:** XState v5 hierarchical states require object notation for substates.

**How to avoid:**
- Top-level states: `state.matches('APRESENTACAO')` ✓
- Substates: `state.matches({ INFERNO: 'Q1_SETUP' })` ✓
- Never: `state.matches('INFERNO.Q1_SETUP')` ✗ (string path notation doesn't work in v5)

**Warning signs:** getScriptKey returns null for states you know exist. Test with `console.log(JSON.stringify(state.value))` to see actual structure.

**Source:** XState v5 documentation on state matching, observed in existing codebase patterns.

### Pitfall 2: Stale PRERECORDED_URLS After Script Changes

**What goes wrong:** Script key renamed/added in script.ts, but PRERECORDED_URLS not updated. FallbackTTSService falls back to SpeechSynthesis.

**Why it happens:** Two sources of truth (script.ts keys, fallback.ts URLs) manually kept in sync.

**How to avoid:**
1. Generate PRERECORDED_URLS programmatically from script.ts keys (see Pattern 2)
2. OR: Add test that verifies every script key has a corresponding URL
3. Phase 19 generates actual MP3s — missing URL will surface as 404 in browser

**Warning signs:** Browser console shows "Failed to fetch audio: 404" followed by synthetic voice playing instead of pre-recorded.

**Source:** Phase 13 research on fallback patterns, observed gap during script expansion.

### Pitfall 3: ChoiceConfig Event Mismatch

**What goes wrong:** ChoiceConfig.eventMap specifies 'CHOICE_FICAR' but machine expects 'CHOICE_A'. Voice choice fires but state doesn't advance.

**Why it happens:** v3 standardized all events to CHOICE_A/CHOICE_B (machine handles routing), but old pattern used question-specific events.

**How to avoid:**
- All ChoiceConfig objects use `eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' }` (standardized)
- Machine already expects only these two events per AGUARDANDO state
- Do NOT use CHOICE_FICAR, CHOICE_EMBORA, etc. (v2 pattern, removed in v3)

**Warning signs:** Voice choice completes but machine stays in AGUARDANDO state. Debug panel shows eventType not in machine definition.

**Source:** Phase 17 (v3.0) machine redesign — all events standardized to binary A/B.

### Pitfall 4: Missing State in getBreathingDelay

**What goes wrong:** New state added to machine but not mapped in getBreathingDelay(). Returns NONE (0ms), experience feels rushed.

**Why it happens:** getBreathingDelay is exhaustive enumeration, not derived from machine definition.

**How to avoid:**
1. Add explicit mappings for all new narrative states (INTRO, SETUP, PERGUNTA, RESPOSTA, TIMEOUT)
2. Test max-path timing after changes (should still be ~10.5 min including breathing delays)
3. Log unmapped states: `if (!delay) console.warn('No breathing delay for state:', state.value)`

**Warning signs:** Transitions happen too fast between phases. User feedback: "felt abrupt."

**Source:** Phase 8 (v1.2) breathing delay implementation, refined in Phase 24 rhythm optimization.

### Pitfall 5: AGUARDANDO State in getScriptKey

**What goes wrong:** AGUARDANDO state mapped to script key. TTS tries to play non-existent audio, or plays wrong audio.

**Why it happens:** AGUARDANDO states wait for voice input — they have no narration. Only PERGUNTA state (before AGUARDANDO) has narration.

**How to avoid:**
- getScriptKey should return `null` for all AGUARDANDO states
- Effect B (lines 337-372) already guards: `if (isAguardando) return;` — won't fire NARRATIVA_DONE
- AGUARDANDO → TTS does nothing, voice pipeline activates instead

**Warning signs:** Mic activation delayed. Debug panel shows ttsComplete=false in AGUARDANDO state.

**Source:** Phase 7 (v1.2) voice architecture refactor — explicit gating between TTS and mic activation.

## Code Examples

Verified patterns from existing codebase:

### State Matching with Hierarchical States
```typescript
// Source: src/components/experience/OracleExperience.tsx (lines 103-125)
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  // Top-level states
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';

  // Hierarchical substates (parent: child notation)
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return 'INFERNO_Q1_SETUP';
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return 'INFERNO_Q1_PERGUNTA';

  // AGUARDANDO states return null (no narration)
  if (machineState.matches({ INFERNO: 'Q1_AGUARDANDO' })) return null;

  return null;
}
```

### Generating PRERECORDED_URLS from Script Keys
```typescript
// Source: Derived from fallback.ts pattern + script.ts interface
import { SCRIPT } from '@/data/script';

const PRERECORDED_URLS: Record<string, string> = Object.fromEntries(
  Object.keys(SCRIPT).map(key => [
    key,
    `/audio/prerecorded/${key.toLowerCase()}.mp3`
  ])
);

// Result:
// {
//   APRESENTACAO: '/audio/prerecorded/apresentacao.mp3',
//   INFERNO_INTRO: '/audio/prerecorded/inferno_intro.mp3',
//   ...
// }
```

### ChoiceConfig from QUESTION_META
```typescript
// Source: types/index.ts (QUESTION_META) + OracleExperience.tsx pattern
import { QUESTION_META } from '@/types';

const Q1_CHOICE: ChoiceConfig = {
  questionContext: QUESTION_META[1].questionContext,
  options: {
    A: QUESTION_META[1].optionA,
    B: QUESTION_META[1].optionB
  },
  eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  defaultEvent: `CHOICE_${QUESTION_META[1].defaultOnTimeout}`,
};

// Active config selector
const activeChoiceConfig = useMemo(() => {
  if (state.matches({ INFERNO: 'Q1_AGUARDANDO' })) return Q1_CHOICE;
  if (state.matches({ INFERNO: 'Q2_AGUARDANDO' })) return Q2_CHOICE;
  // ... Q3-Q6 ...
  return null;
}, [state.value]);

// Pass to hook (already handles activation lifecycle)
const voiceChoice = useVoiceChoice(
  activeChoiceConfig || DEFAULT_CONFIG,
  micShouldActivate
);
```

### Breathing Delay Pattern
```typescript
// Source: src/components/experience/OracleExperience.tsx (lines 59-98)
function getBreathingDelay(machineState: any): number {
  const LONG = 2500;   // Phase transitions
  const MEDIUM = 1500; // Within-phase narratives
  const SHORT = 800;   // Question → AGUARDANDO
  const NONE = 0;      // Timeouts, fallbacks

  // Long: Cross-phase transitions
  if (machineState.matches('APRESENTACAO')) return LONG;
  if (machineState.matches({ INFERNO: 'Q2_RESPOSTA_B' })) return LONG; // INFERNO→PURGATORIO

  // Medium: Narrative beats
  if (machineState.matches({ INFERNO: 'INTRO' })) return MEDIUM;
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return MEDIUM;

  // Short: Question ends
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return SHORT;

  // None: Functional prompts
  if (machineState.matches({ INFERNO: 'Q1_TIMEOUT' })) return NONE;

  return NONE;
}
```

## State of the Art

| Old Approach (v2, 3 choices) | Current Approach (v3, 6 choices) | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 3 AGUARDANDO states | 6 AGUARDANDO states | v3.0 Phase 17 | More ChoiceConfig objects, more state mappings |
| Question-specific events (CHOICE_FICAR, CHOICE_PISAR) | Standardized CHOICE_A/CHOICE_B | v3.0 Phase 17 | Simpler eventMap, uniform handling |
| 4 devolução paths | 8 devolução archetypes | v3.0 Phase 17 | Pattern-based routing replaces combinatorial paths |
| 26 audio keys | ~50 audio keys | v3.1 Phase 24 | Larger PRERECORDED_URLS, more MP3s to generate |
| Manual QUESTION_META in components | Centralized QUESTION_META in types | v3.0 Phase 17 | Single source of truth |

**Deprecated/outdated:**
- `CHOICE_FICAR`, `CHOICE_EMBORA`, `CHOICE_PISAR`, `CHOICE_CONTORNAR` events (removed in v3)
- `INFERNO_NARRATIVA`, `PURGATORIO_NARRATIVA_A/B` keys (replaced with INTRO + per-question SETUP)
- `DEVOLUCAO_A_FICAR`, `DEVOLUCAO_B_CONTORNAR` paths (replaced with 8 archetypes)

## Open Questions

None. All information required for planning is available in existing codebase patterns and frozen script.ts.

## Environment Availability

Phase has no external dependencies (code/config-only changes). Skipping environment audit.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.9 + @testing-library/react 16.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CMPV3-01 | OracleExperience maps all ~42 states to correct script keys | unit | `npm test src/components/experience/__tests__/OracleExperience.test.tsx -x` | ❌ Wave 0 |
| CMPV3-02 | FallbackTTS PRERECORDED_URLS maps all script keys to MP3 paths | unit | `npm test src/services/tts/__tests__/fallback-tts.test.ts -x` | ✅ (needs update) |
| CMPV3-03 | 6 ChoiceConfig objects created with correct QUESTION_META mappings | unit | `npm test src/components/experience/__tests__/choice-configs.test.tsx -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test {changed-file}.test.ts*` (unit tests for modified file)
- **Per wave merge:** `npm test` (full suite — 160+ tests in <5s)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/experience/__tests__/OracleExperience.test.tsx` — covers CMPV3-01 (state mapping)
- [ ] `src/components/experience/__tests__/choice-configs.test.tsx` — covers CMPV3-03 (ChoiceConfig generation)
- [ ] Update `src/services/tts/__tests__/fallback-tts.test.ts` — add assertions for new script keys

**Existing test infrastructure:** 160+ tests passing (lines 6-28 of test output). Framework ready, just needs new test files.

## Sources

### Primary (HIGH confidence)
- src/data/script.ts — frozen script with all 50 keys (ScriptDataV3 interface)
- src/machines/oracleMachine.ts — v3 machine with ~42 states (lines 1-596)
- src/components/experience/OracleExperience.tsx — existing state mapping patterns (lines 28-504)
- src/services/tts/fallback.ts — existing PRERECORDED_URLS pattern (lines 10-36)
- src/hooks/useVoiceChoice.ts — existing config freeze pattern (lines 136-144)
- src/types/index.ts — QUESTION_META with all 6 questions (lines 86-135)

### Secondary (MEDIUM confidence)
- package.json — verified dependency versions (2026-03-28 read)
- vitest.config.ts — test infrastructure configuration
- Test output — 160+ tests passing, framework operational

### Tertiary (LOW confidence)
None. All findings verified from codebase source files.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies installed, versions verified from package.json
- Architecture patterns: HIGH — all patterns already proven in production codebase
- State mapping: HIGH — complete machine definition in oracleMachine.ts, script keys in script.ts
- Common pitfalls: HIGH — derived from existing code comments and Phase 7-9 research notes in codebase

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (30 days — stable codebase, frozen script, no external API changes)
