# Phase 17: State Machine & Data - Research

**Researched:** 2026-03-27
**Domain:** XState v5 state machine architecture, pattern-matching algorithms, voice pipeline integration
**Confidence:** HIGH

## Summary

Phase 17 redesigns the Oracle state machine from a 3-choice branching architecture (17 states, 4 paths) to a 6-choice linear architecture (~28 states, 8-12 pattern-based paths). The current v2 machine uses cascading branches where choice1 determines whether you see PURGATORIO_A or PURGATORIO_B, creating 4 combinatorial paths (A+FICAR, A+EMBORA, B+PISAR, B+CONTORNAR). The v3 machine makes all 6 choices linear — every visitor experiences Q1 through Q6 in sequence — and uses pattern-matching to route to 8-12 devolução archetypes based on the shape of the 6 choices.

**Current architecture (v2):**
- 17 states: IDLE → APRESENTACAO → INFERNO (5 substates) → PURGATORIO_A/B (5 substates each) → PARAISO → DEVOLUCAO → 4 DEVOLUCAO_* states → ENCERRAMENTO → FIM
- 2 choices create 4 paths: choice1 (A/B) branches to PURGATORIO_A or PURGATORIO_B, then choice2 (FICAR/EMBORA or PISAR/CONTORNAR)
- Routing via compound guards checking choice1+choice2 combinations
- Context: `{ sessionId, choice1, choice2, fallbackCount, currentPhase }`

**v3 architecture (target):**
- ~28 states: IDLE → APRESENTACAO → INFERNO_INTRO → 2x(SETUP→PERGUNTA→AGUARDANDO→RESPOSTA_A/B) → PURGATORIO_INTRO → 2x(SETUP→PERGUNTA→AGUARDANDO→RESPOSTA_A/B) → PARAISO_INTRO → 2x(SETUP→PERGUNTA→AGUARDANDO→RESPOSTA_A/B) → DEVOLUCAO → 8 DEVOLUCAO_* states → ENCERRAMENTO → FIM
- 6 choices, all linear: every visitor goes through Q1→Q2→Q3→Q4→Q5→Q6
- Context: `{ sessionId, choices: [A/B/null, A/B/null, A/B/null, A/B/null, A/B/null, A/B/null], fallbackCount, currentPhase }`
- Routing via pattern-matching function that reads the array of 6 choices and returns archetype name

**Primary recommendation:** Use XState v5 `always` transitions with a single pattern-matching guard function instead of 8-12 compound guards. Implement `determineArchetype(choices: ChoiceAB[]): DevolucaoArchetype` utility that reads the shape of the 6 choices and returns one of 8 archetype keys (SEEKER, GUARDIAN, CONTRADICTED, PIVOT_EARLY, PIVOT_LATE, DEPTH_SEEKER, SURFACE_KEEPER, MIRROR).

## User Constraints (from ROADMAP.md)

### Phase Requirements (MUST address)
- **SMV3-01 (linear flow):** Machine has ~28 states with 6 linear choice points — all visitors experience all 6 questions in sequence, not branching
- **SMV3-02 (pattern tracking):** Context tracks choices as `ChoiceAB[]` array of 6 entries (not separate choice1/choice2 fields)
- **SMV3-03 (devolução routing):** Devolução routing uses pattern-matching function that reads the shape of the 6 choices, not combinatorial guards

### Project Constraints (from CLAUDE.md)
- Core value: seamless and immersive like a game — voice, script, and transitions must work perfectly
- Pattern-based devoluções read SHAPE of 6 choices across Movement/Stillness and Toward/Away axes
- Zero explicit references to authors — psychoanalytic depth felt, not declared
- Frozen config snapshots prevent stale closures in async pipeline (established in Phase 9)
- TTS-gated state transitions via ttsComplete flag (established in Phase 8)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| xstate | 5.29.0 | State machine runtime | Official XState v5 with setup() API, always guards, and TypeScript-first design |
| @xstate/react | 5.0.5 | React integration | Official React bindings with useMachine hook for XState v5 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 2.1.8 | Test framework | Already established for machine tests — use createActor and vi.useFakeTimers for state machine testing |
| @testing-library/react | 16.1.0 | Component testing | Test OracleExperience integration with machine |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| xstate 5.x | zustand / jotai | State machines provide explicit state modeling, impossible state prevention, and timeout/guard semantics — essential for voice pipeline sequencing |
| Pattern-matching function | 64 compound guards (one per path) | Pattern function = 8-12 routes maintainable, compound guards = 64 routes unmaintainable |

**Installation:**
All dependencies already installed. No new packages required.

**Version verification:**
```bash
npm list xstate @xstate/react
# xstate@5.29.0
# @xstate/react@5.0.5
```
Verified 2026-03-27. XState v5 stable, no breaking changes expected.

## Architecture Patterns

### Recommended State Structure (v3)
```
states:
  IDLE
  APRESENTACAO

  INFERNO_INTRO
  INFERNO_Q1_SETUP
  INFERNO_Q1_PERGUNTA
  INFERNO_Q1_AGUARDANDO (timeout → INFERNO_Q1_TIMEOUT)
    ├─ INFERNO_Q1_TIMEOUT
    ├─ INFERNO_Q1_RESPOSTA_A
    └─ INFERNO_Q1_RESPOSTA_B
  INFERNO_Q2_SETUP
  INFERNO_Q2_PERGUNTA
  INFERNO_Q2_AGUARDANDO (timeout → INFERNO_Q2_TIMEOUT)
    ├─ INFERNO_Q2_TIMEOUT
    ├─ INFERNO_Q2_RESPOSTA_A
    └─ INFERNO_Q2_RESPOSTA_B

  PURGATORIO_INTRO
  PURGATORIO_Q3_SETUP
  PURGATORIO_Q3_PERGUNTA
  PURGATORIO_Q3_AGUARDANDO (timeout → PURGATORIO_Q3_TIMEOUT)
    ├─ PURGATORIO_Q3_TIMEOUT
    ├─ PURGATORIO_Q3_RESPOSTA_A
    └─ PURGATORIO_Q3_RESPOSTA_B
  PURGATORIO_Q4_SETUP
  PURGATORIO_Q4_PERGUNTA
  PURGATORIO_Q4_AGUARDANDO (timeout → PURGATORIO_Q4_TIMEOUT)
    ├─ PURGATORIO_Q4_TIMEOUT
    ├─ PURGATORIO_Q4_RESPOSTA_A
    └─ PURGATORIO_Q4_RESPOSTA_B

  PARAISO_INTRO
  PARAISO_Q5_SETUP
  PARAISO_Q5_PERGUNTA
  PARAISO_Q5_AGUARDANDO (timeout → PARAISO_Q5_TIMEOUT)
    ├─ PARAISO_Q5_TIMEOUT
    ├─ PARAISO_Q5_RESPOSTA_A
    └─ PARAISO_Q5_RESPOSTA_B
  PARAISO_Q6_SETUP
  PARAISO_Q6_PERGUNTA
  PARAISO_Q6_AGUARDANDO (timeout → PARAISO_Q6_TIMEOUT)
    ├─ PARAISO_Q6_TIMEOUT
    ├─ PARAISO_Q6_RESPOSTA_A
    └─ PARAISO_Q6_RESPOSTA_B

  DEVOLUCAO (routing state, no speech)
  DEVOLUCAO_SEEKER
  DEVOLUCAO_GUARDIAN
  DEVOLUCAO_CONTRADICTED
  DEVOLUCAO_PIVOT_EARLY
  DEVOLUCAO_PIVOT_LATE
  DEVOLUCAO_DEPTH_SEEKER
  DEVOLUCAO_SURFACE_KEEPER
  DEVOLUCAO_MIRROR

  ENCERRAMENTO
  FIM
```

Total: ~34 states (not 28 — 6 TIMEOUT states + 6 AGUARDANDO + 12 RESPOSTA + 3 INTRO + 6 SETUP + 6 PERGUNTA + 8 DEVOLUCAO + IDLE + APRESENTACAO + DEVOLUCAO routing + ENCERRAMENTO + FIM = 51 states if flat, or ~28 top-level with nested substates)

**Optimization:** Nested hierarchical states reduce top-level count:
```typescript
INFERNO: {
  initial: 'INTRO',
  states: {
    INTRO: { on: { NARRATIVA_DONE: 'Q1_SETUP' } },
    Q1_SETUP: { on: { NARRATIVA_DONE: 'Q1_PERGUNTA' } },
    Q1_PERGUNTA: { on: { NARRATIVA_DONE: 'Q1_AGUARDANDO' } },
    Q1_AGUARDANDO: {
      after: { 25000: { target: 'Q1_TIMEOUT', actions: assign({ choices: updateChoice(0, 'A') }) } },
      on: {
        CHOICE_A: { target: 'Q1_RESPOSTA_A', actions: assign({ choices: updateChoice(0, 'A') }) },
        CHOICE_B: { target: 'Q1_RESPOSTA_B', actions: assign({ choices: updateChoice(0, 'B') }) },
      },
    },
    Q1_TIMEOUT: { on: { NARRATIVA_DONE: 'Q1_RESPOSTA_A' } },
    Q1_RESPOSTA_A: { on: { NARRATIVA_DONE: 'Q2_SETUP' } },
    Q1_RESPOSTA_B: { on: { NARRATIVA_DONE: 'Q2_SETUP' } },
    Q2_SETUP: { /* similar */ },
    // ...
  },
}
```

This reduces to ~10 top-level states: IDLE, APRESENTACAO, INFERNO (8 substates), PURGATORIO (8 substates), PARAISO (8 substates), DEVOLUCAO (routing), 8 DEVOLUCAO_* states, ENCERRAMENTO, FIM.

### Pattern 1: Linear Flow with Array Context

**What:** Replace `choice1: Choice1, choice2: Choice2` with `choices: [ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB]`.

**When to use:** When all visitors experience the same sequence of choices, but the combination determines the outcome.

**Example:**
```typescript
// Source: Existing oracleMachine.types.ts + v3 requirements
export interface OracleContextV3 {
  sessionId: string;
  choices: [ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB];
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

// Helper to update a specific choice index
function updateChoice(index: number, value: ChoiceAB) {
  return ({ context }: { context: OracleContextV3 }) => {
    const newChoices = [...context.choices] as [ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB];
    newChoices[index] = value;
    return { choices: newChoices };
  };
}

// Usage in machine
Q1_AGUARDANDO: {
  on: {
    CHOICE_A: {
      target: 'Q1_RESPOSTA_A',
      actions: assign(updateChoice(0, 'A')),
    },
    CHOICE_B: {
      target: 'Q1_RESPOSTA_B',
      actions: assign(updateChoice(0, 'B')),
    },
  },
}
```

### Pattern 2: Pattern-Matching with always Guards

**What:** Use XState v5 `always` transitions with a single guard function instead of multiple compound guards.

**When to use:** When routing depends on analyzing a pattern across multiple context fields, not just checking specific values.

**Example:**
```typescript
// Source: XState v5 docs + v3 requirements
import type { DevolucaoArchetype, ChoiceAB } from '@/types';

// Pattern-matching utility
export function determineArchetype(choices: ChoiceAB[]): DevolucaoArchetype {
  const validChoices = choices.filter((c): c is 'A' | 'B' => c !== null);
  if (validChoices.length < 6) return 'CONTRADICTED'; // incomplete pattern

  // Count A vs B
  const aCount = validChoices.filter(c => c === 'A').length;
  const bCount = validChoices.filter(c => c === 'B').length;

  // Check for perfect alternation (MIRROR)
  const isAlternating = validChoices.every((c, i) => {
    if (i === 0) return true;
    return c !== validChoices[i - 1];
  });
  if (isAlternating) return 'MIRROR';

  // Check for pivot (direction change)
  const firstHalf = validChoices.slice(0, 3);
  const secondHalf = validChoices.slice(3, 6);
  const firstHalfA = firstHalf.filter(c => c === 'A').length;
  const secondHalfA = secondHalf.filter(c => c === 'A').length;

  if (Math.abs(firstHalfA - secondHalfA) >= 2) {
    return firstHalfA > secondHalfA ? 'PIVOT_LATE' : 'PIVOT_EARLY';
  }

  // All A or all B
  if (aCount === 6) return 'DEPTH_SEEKER';
  if (bCount === 6) return 'SURFACE_KEEPER';

  // Mostly A (toward + movement)
  if (aCount >= 4) return 'SEEKER';

  // Mostly B (away + stillness)
  if (bCount >= 4) return 'GUARDIAN';

  // Mixed with no clear pattern
  return 'CONTRADICTED';
}

// Guard factory
export function createArchetypeGuard(archetype: DevolucaoArchetype) {
  return ({ context }: { context: OracleContextV3 }) => {
    return determineArchetype(context.choices) === archetype;
  };
}

// Usage in machine setup
export const oracleMachineV3 = setup({
  guards: {
    isSeeker: createArchetypeGuard('SEEKER'),
    isGuardian: createArchetypeGuard('GUARDIAN'),
    isContradicted: createArchetypeGuard('CONTRADICTED'),
    isPivotEarly: createArchetypeGuard('PIVOT_EARLY'),
    isPivotLate: createArchetypeGuard('PIVOT_LATE'),
    isDepthSeeker: createArchetypeGuard('DEPTH_SEEKER'),
    isSurfaceKeeper: createArchetypeGuard('SURFACE_KEEPER'),
    isMirror: createArchetypeGuard('MIRROR'),
  },
}).createMachine({
  // ...
  states: {
    DEVOLUCAO: {
      always: [
        { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
        { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
        { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
        { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
        { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
        { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
        { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
        { target: 'DEVOLUCAO_CONTRADICTED' }, // fallback
      ],
    },
  },
});
```

### Pattern 3: NLU Keyword Maps per Question

**What:** Define per-question NLU metadata including keywords, context, and default timeout choice.

**When to use:** Voice choice pipeline needs to know what keywords map to A vs B for each of the 6 questions.

**Example:**
```typescript
// Source: Existing types/index.ts QUESTION_META + v3 script
export const QUESTION_META_V3: Record<number, QuestionMeta> = {
  1: {
    questionContext: 'Visitante numa sala confortável, escolhendo entre ficar no conforto ou procurar a porta de saída',
    optionA: 'Ficar',
    optionB: 'Procurar a porta',
    keywordsA: ['ficar', 'fico', 'aqui', 'conforto', 'confortável', 'fica', 'permanecer', 'sim'],
    keywordsB: ['porta', 'sair', 'saída', 'procurar', 'ir', 'embora', 'abrir', 'não'],
    defaultOnTimeout: 'A',
  },
  2: {
    questionContext: 'Visitante vê algo no chão que causa repulsa, escolhendo entre recuar ou ficar parado olhando',
    optionA: 'Recuar',
    optionB: 'Ficar olhando',
    keywordsA: ['recuar', 'recuo', 'afastar', 'sair', 'embora', 'fugir', 'não', 'nojo'],
    keywordsB: ['ficar', 'olhar', 'olhando', 'parar', 'fico', 'ver', 'sim', 'perto'],
    defaultOnTimeout: 'A',
  },
  // ... 3, 4, 5, 6
};
```

**Already exists in types/index.ts** — verified 2026-03-27, all 6 questions defined with keywords and defaults.

### Anti-Patterns to Avoid

- **Cascading branches:** Don't create separate PURGATORIO_A/B states based on earlier choices. Use linear flow where Q1→Q2→Q3→Q4→Q5→Q6 for everyone.
- **Combinatorial guards:** Don't create 64 guards for choice combinations. Use pattern-matching function to reduce to 8-12 archetypes.
- **Mutable array updates:** Don't mutate context.choices directly. Use `assign(updateChoice(index, value))` helper that returns new array.
- **Timeout without default:** Every AGUARDANDO state must have an `after` timeout that assigns the appropriate defaultOnTimeout choice.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Pattern classification from 6 choices | 64 compound guards checking all combinations | Single `determineArchetype()` function with if/else logic | Pattern function is O(n) readable code, compound guards are O(2^n) unmaintainable configuration |
| Nested state hierarchy | Flat 51-state machine | XState hierarchical states (INFERNO: { states: { Q1_SETUP, Q1_PERGUNTA, ... } }) | Hierarchical states group related substates, reduce top-level count, and enable shared timeouts/entry actions |
| Choice array updates | Manual index mutation | `updateChoice(index, value)` assign helper | Helper enforces immutability, TypeScript tuple typing, and prevents index errors |
| Per-question routing | 6 separate CHOICE_Q1_A/B, CHOICE_Q2_A/B events | Generic CHOICE_A/B events + index-based context update | Generic events reduce event type explosion from 12 to 2 |

**Key insight:** State machines excel at preventing impossible states, but combinatorial explosions are the enemy. Pattern-matching functions compress 64 paths into 8-12 semantic categories, making the system maintainable and testable.

## Common Pitfalls

### Pitfall 1: Forgetting to Initialize choices Array
**What goes wrong:** Context has `choices: ChoiceAB[]` type but no initial value — runtime error when trying to update choices[0].
**Why it happens:** TypeScript allows `ChoiceAB[]` to be empty array, but v3 logic expects exactly 6 entries.
**How to avoid:** Use tuple type `[ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB]` and initialize with `[null, null, null, null, null, null]` in INITIAL_CONTEXT.
**Warning signs:** "Cannot set property 0 of undefined" error when first CHOICE_A is sent.

### Pitfall 2: Pattern Function Returns Wrong Archetype Order
**What goes wrong:** `always` guards are evaluated in order — if CONTRADICTED comes before MIRROR, it catches all patterns because CONTRADICTED is the fallback.
**Why it happens:** XState evaluates guards top-to-bottom and takes the first match.
**How to avoid:** Order `always` guards from most specific to least specific: MIRROR (exact alternation) → DEPTH_SEEKER (all A) → SURFACE_KEEPER (all B) → PIVOT_EARLY/LATE → SEEKER/GUARDIAN → CONTRADICTED (fallback).
**Warning signs:** All visitors routed to CONTRADICTED regardless of actual pattern.

### Pitfall 3: Timeout Assigns Wrong Index
**What goes wrong:** Q2_AGUARDANDO timeout assigns `choices: updateChoice(0, 'A')` instead of `updateChoice(1, 'A')` — Q1 is overwritten by Q2 default.
**Why it happens:** Copy-paste error when creating similar states for Q1-Q6.
**How to avoid:** Use a state machine generator or extract timeout configuration to a shared `createQuestionStates(index, defaultChoice)` factory.
**Warning signs:** Choice array has duplicate entries at wrong indices, pattern classification returns nonsense archetypes.

### Pitfall 4: OracleExperience getScriptKey Doesn't Handle v3 States
**What goes wrong:** `getScriptKey(machineState)` returns `null` for new states like `INFERNO_Q1_SETUP` because it only knows about v2 state names.
**Why it happens:** OracleExperience.tsx has hardcoded mapping from machine states to script keys — must be updated for v3.
**How to avoid:** Update `getScriptKey()` to map all ~34 v3 states to corresponding ScriptDataV3 keys. Write tests that verify every reachable state has a script key.
**Warning signs:** TTS orchestrator skips narration in v3 states, leaving silent gaps.

### Pitfall 5: Breathing Delays Not Updated for v3 States
**What goes wrong:** `getBreathingDelay(machineState)` returns NONE for v3 states because it only checks v2 state names — every transition feels rushed.
**Why it happens:** Same as Pitfall 4 — hardcoded mapping needs updating.
**How to avoid:** Update `getBreathingDelay()` to recognize v3 state patterns: LONG for phase boundaries (RESPOSTA→INTRO), MEDIUM for INTRO→SETUP and SETUP→PERGUNTA, SHORT for PERGUNTA→AGUARDANDO, NONE for TIMEOUT.
**Warning signs:** Experience feels rushed, no pauses between narrative segments.

### Pitfall 6: Voice Choice Pipeline Doesn't Know Which Question
**What goes wrong:** useVoiceChoice needs to know "is this Q1, Q2, Q3, Q4, Q5, or Q6?" to select the correct ChoiceConfig (keywords, context, defaultEvent) — but machineState value is generic AGUARDANDO.
**Why it happens:** v2 has 3 distinct AGUARDANDO states (INFERNO.AGUARDANDO, PURGATORIO_A.AGUARDANDO, PURGATORIO_B.AGUARDANDO), but v3 has 6 AGUARDANDO states that look similar.
**How to avoid:** OracleExperience must detect which question by matching hierarchical state: `machineState.matches({ INFERNO: 'Q1_AGUARDANDO' })` → use QUESTION_META_V3[1]. Create 6 ChoiceConfig objects, one per question.
**Warning signs:** NLU always uses Q1 keywords/context regardless of actual question number, misclassifications spike for Q2-Q6.

## Code Examples

Verified patterns from existing codebase and XState v5 documentation:

### Context Type and Initial Value
```typescript
// Source: src/machines/oracleMachine.types.ts (to be updated)
import type { ChoiceAB, NarrativePhase } from '@/types';

export interface OracleContextV3 {
  sessionId: string;
  choices: [ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB];
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

export const INITIAL_CONTEXT_V3: OracleContextV3 = {
  sessionId: '',
  choices: [null, null, null, null, null, null],
  fallbackCount: 0,
  currentPhase: 'APRESENTACAO',
};
```

### Event Types
```typescript
// Source: src/machines/oracleMachine.types.ts (to be updated)
export type OracleEventV3 =
  | { type: 'START' }
  | { type: 'NARRATIVA_DONE' }
  | { type: 'CHOICE_A' }
  | { type: 'CHOICE_B' }
  | { type: 'TIMEOUT' }
  | { type: 'FALLBACK_USED' };

// Note: No per-question events like CHOICE_Q1_A — use generic CHOICE_A/B + index-based context update
```

### Hierarchical Question States (Factory Pattern)
```typescript
// Source: XState v5 hierarchical states pattern
function createQuestionStates(
  questionNum: number,
  defaultChoice: 'A' | 'B'
): Record<string, any> {
  const index = questionNum - 1; // choices array is 0-indexed

  return {
    [`Q${questionNum}_SETUP`]: {
      on: { NARRATIVA_DONE: `Q${questionNum}_PERGUNTA` },
    },
    [`Q${questionNum}_PERGUNTA`]: {
      on: { NARRATIVA_DONE: `Q${questionNum}_AGUARDANDO` },
    },
    [`Q${questionNum}_AGUARDANDO`]: {
      after: {
        25000: {
          target: `Q${questionNum}_TIMEOUT`,
          actions: assign(updateChoice(index, defaultChoice)),
        },
      },
      on: {
        CHOICE_A: {
          target: `Q${questionNum}_RESPOSTA_A`,
          actions: assign(updateChoice(index, 'A')),
        },
        CHOICE_B: {
          target: `Q${questionNum}_RESPOSTA_B`,
          actions: assign(updateChoice(index, 'B')),
        },
      },
    },
    [`Q${questionNum}_TIMEOUT`]: {
      on: { NARRATIVA_DONE: `Q${questionNum}_RESPOSTA_${defaultChoice}` },
    },
    [`Q${questionNum}_RESPOSTA_A`]: {
      on: { NARRATIVA_DONE: questionNum < 6 ? `Q${questionNum + 1}_SETUP` : '#oracle.DEVOLUCAO' },
    },
    [`Q${questionNum}_RESPOSTA_B`]: {
      on: { NARRATIVA_DONE: questionNum < 6 ? `Q${questionNum + 1}_SETUP` : '#oracle.DEVOLUCAO' },
    },
  };
}

// Usage:
INFERNO: {
  initial: 'INTRO',
  states: {
    INTRO: { on: { NARRATIVA_DONE: 'Q1_SETUP' } },
    ...createQuestionStates(1, 'A'),
    ...createQuestionStates(2, 'A'),
  },
}
```

### Pattern Matching Guard Order
```typescript
// Source: XState v5 always transitions + determineArchetype logic
DEVOLUCAO: {
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    // Most specific first
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    // Fallback last
    { target: 'DEVOLUCAO_CONTRADICTED' },
  ],
}
```

### OracleExperience getScriptKey Update
```typescript
// Source: src/components/experience/OracleExperience.tsx (to be updated)
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  if (machineState.matches('APRESENTACAO')) return 'APRESENTACAO';

  // INFERNO
  if (machineState.matches({ INFERNO: 'INTRO' })) return 'INFERNO_INTRO';
  if (machineState.matches({ INFERNO: 'Q1_SETUP' })) return 'INFERNO_Q1_SETUP';
  if (machineState.matches({ INFERNO: 'Q1_PERGUNTA' })) return 'INFERNO_Q1_PERGUNTA';
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_A' })) return 'INFERNO_Q1_RESPOSTA_A';
  if (machineState.matches({ INFERNO: 'Q1_RESPOSTA_B' })) return 'INFERNO_Q1_RESPOSTA_B';
  if (machineState.matches({ INFERNO: 'Q1_TIMEOUT' })) return 'TIMEOUT_Q1';
  // Repeat for Q2, PURGATORIO Q3/Q4, PARAISO Q5/Q6

  // DEVOLUCAO
  if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
  if (machineState.matches('DEVOLUCAO_GUARDIAN')) return 'DEVOLUCAO_GUARDIAN';
  // ... 6 more archetypes

  if (machineState.matches('ENCERRAMENTO')) return 'ENCERRAMENTO';
  return null; // IDLE, AGUARDANDO, FIM, DEVOLUCAO routing -- no speech
}
```

### ChoiceConfig Array for 6 Questions
```typescript
// Source: src/components/experience/OracleExperience.tsx (to be updated)
const CHOICE_CONFIGS: Record<number, ChoiceConfig> = {
  1: {
    questionContext: QUESTION_META_V3[1].questionContext,
    options: { A: QUESTION_META_V3[1].optionA, B: QUESTION_META_V3[1].optionB },
    eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
    defaultEvent: QUESTION_META_V3[1].defaultOnTimeout === 'A' ? 'CHOICE_A' : 'CHOICE_B',
    listeningDurationMs: 4000,
  },
  // ... 2, 3, 4, 5, 6
};

// In OracleExperience, detect which question number:
function getCurrentQuestionNumber(machineState: any): number | null {
  if (machineState.matches({ INFERNO: 'Q1_AGUARDANDO' })) return 1;
  if (machineState.matches({ INFERNO: 'Q2_AGUARDANDO' })) return 2;
  if (machineState.matches({ PURGATORIO: 'Q3_AGUARDANDO' })) return 3;
  if (machineState.matches({ PURGATORIO: 'Q4_AGUARDANDO' })) return 4;
  if (machineState.matches({ PARAISO: 'Q5_AGUARDANDO' })) return 5;
  if (machineState.matches({ PARAISO: 'Q6_AGUARDANDO' })) return 6;
  return null;
}

// Use in voice choice activation
const questionNum = getCurrentQuestionNumber(state);
if (questionNum !== null && isAguardando && ttsComplete) {
  const config = CHOICE_CONFIGS[questionNum];
  activateVoiceChoice(config);
}
```

## State of the Art

| Old Approach (v2) | Current Approach (v3) | When Changed | Impact |
|-------------------|----------------------|--------------|--------|
| Cascading branches (choice1 → PURGATORIO_A/B) | Linear flow (Q1→Q2→Q3→Q4→Q5→Q6 for all) | 2026-03-27 (v3.0) | All visitors see all 6 questions, richer pattern data for devolução |
| 4 combinatorial paths (2 choices × 2 outcomes) | 8-12 pattern-based archetypes (shape of 6 choices) | 2026-03-27 (v3.0) | Pattern matching reads FORM of choices (movement/stillness, toward/away) instead of individual values |
| choice1/choice2 separate fields | choices: [ChoiceAB × 6] array | 2026-03-27 (v3.0) | Scalable to N choices, enables pattern functions |
| Compound guards per path (isPathAFicar, isPathBPisar) | Single determineArchetype() function | 2026-03-27 (v3.0) | Maintainable — 1 function vs 64 guards |

**Deprecated/outdated:**
- **v2 context shape:** `{ choice1, choice2 }` replaced by `{ choices: [6 entries] }`
- **v2 event types:** `CHOICE_FICAR`, `CHOICE_EMBORA`, `CHOICE_PISAR`, `CHOICE_CONTORNAR` replaced by generic `CHOICE_A`, `CHOICE_B` + index-based updates
- **v2 state names:** `PURGATORIO_A`, `PURGATORIO_B` replaced by unified `PURGATORIO` with Q3/Q4 substates

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 2.1.8 + @testing-library/react 16.1.0 |
| Config file | vitest.config.ts (existing) |
| Quick run command | `npm test -- src/machines/oracleMachine.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SMV3-01 | Linear flow: Q1→Q2→Q3→Q4→Q5→Q6 for all visitors | unit | `npm test -- src/machines/oracleMachine.test.ts -t "linear flow"` | ❌ Wave 0 |
| SMV3-02 | Context tracks choices as [A/B/null × 6] array | unit | `npm test -- src/machines/oracleMachine.test.ts -t "choice array"` | ❌ Wave 0 |
| SMV3-03 | Devolução routing via determineArchetype() | unit | `npm test -- src/machines/guards/__tests__/patternMatching.test.ts` | ❌ Wave 0 |
| SMV3-03 | All 8 archetypes route correctly | unit | `npm test -- src/machines/oracleMachine.test.ts -t "devolucao routing"` | ❌ Wave 0 |
| (integration) | OracleExperience getScriptKey handles v3 states | integration | `npm test -- src/components/experience/__tests__/OracleExperience.test.tsx` | ❌ Wave 0 |
| (integration) | getCurrentQuestionNumber returns 1-6 | integration | `npm test -- src/components/experience/__tests__/OracleExperience.test.tsx -t "question detection"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- src/machines/oracleMachine.test.ts -x` (stop on first failure)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + manual browser UAT for voice choice pipeline integration

### Wave 0 Gaps
- [ ] `src/machines/guards/__tests__/patternMatching.test.ts` — test determineArchetype() with all 8 archetypes + edge cases (incomplete patterns, null values)
- [ ] `src/machines/oracleMachine.test.ts` — update for v3: test linear flow (Q1→Q2→...→Q6), test choice array updates at correct indices, test devolução routing to all 8 states
- [ ] `src/components/experience/__tests__/OracleExperience.test.tsx` — NEW FILE: test getScriptKey() returns correct keys for v3 states, test getCurrentQuestionNumber() returns 1-6, test ChoiceConfig selection per question
- [ ] `src/types/__tests__/index.test.ts` — NEW FILE (optional): test ChoicePattern type guards, test QUESTION_META_V3 has 6 entries

## Sources

### Primary (HIGH confidence)
- XState v5 official docs (https://statenode.com/docs) — setup() API, always transitions, hierarchical states, guards, assign actions
- Verified in codebase: src/machines/oracleMachine.ts — existing v2 machine with setup(), guards, hierarchical states (INFERNO/PURGATORIO substates), assign actions
- Verified in codebase: src/types/index.ts — existing types (ChoiceAB, NarrativePhase, DevolucaoArchetype, QUESTION_META for 6 questions)
- Verified in codebase: src/data/script.ts — ScriptDataV3 interface with 47 keys including 8 DEVOLUCAO_* variants
- Verified in codebase: src/components/experience/OracleExperience.tsx — existing getScriptKey(), getBreathingDelay(), CHOICE_CONFIGS pattern

### Secondary (MEDIUM confidence)
- XState v5 migration guide (https://statenode.com/docs/migration) — breaking changes from v4 to v5, setup() replaces Machine()
- Vitest docs (https://vitest.dev) — createActor, vi.useFakeTimers for state machine testing

### Tertiary (LOW confidence)
- None — all research verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - XState 5.29.0 and @xstate/react 5.0.5 verified installed, no breaking changes expected
- Architecture: HIGH - Patterns verified in existing v2 machine, directly applicable to v3 with updated state names
- Pattern matching: HIGH - determineArchetype() logic is straightforward if/else, no external dependencies
- Integration: MEDIUM - OracleExperience updates are mechanical but require careful state name matching across ~34 states

**Research date:** 2026-03-27
**Valid until:** 2026-06-27 (90 days — XState v5 is stable, no major version expected before Bienal event)
