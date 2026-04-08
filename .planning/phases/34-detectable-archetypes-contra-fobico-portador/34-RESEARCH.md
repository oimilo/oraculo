# Phase 34: Detectable Archetypes (CONTRA_FOBICO + PORTADOR) - Research

**Researched:** 2026-04-07
**Domain:** XState guard implementation + archetype pattern matching
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AR-02 | CONTRA_FOBICO archetype — guard `isContraFobico` (trigger: `q1==='B' && q2==='B' && q1b==='A'`), DEVOLUCAO_CONTRA_FOBICO script + MP3s, priority order: ESPELHO → CONTRA_FOBICO → PORTADOR → 8 existing | Guard implementation pattern verified in patternMatching.ts + oracleMachine.ts setup.guards, DEVOLUCAO.always insertion pattern verified from Phase 33 ESPELHO |
| AR-03 | PORTADOR archetype — guard `isPortador` (trigger: `q4==='A' && q5==='A' && q5b==='A'`), DEVOLUCAO_PORTADOR script + MP3s | Same guard + machine patterns as AR-02, timing budget allows 22-25s per archetype |

</phase_requirements>

## Executive Summary

Phase 34 extends the archetype detection system to leverage branch-choice data from Phases 31-33. Two new archetypes (CONTRA_FOBICO + PORTADOR) are inserted at DEVOLUCAO.always[1] and [2], between ESPELHO_SILENCIOSO and the 8 existing archetypes.

**Primary recommendation:** Follow Phase 33's 3-wave pattern exactly — (1) SCRIPT + types, (2) guards + machine + UI + tests, (3) audio + timing + roteiro. CONTEXT.md D-01 to D-31 lock all structural decisions. Research confirms current code state matches CONTEXT expectations.

**Key findings:**
1. **Code state baseline verified:** patternMatching.ts exports ARCHETYPE_GUARDS const (8 guards), DEVOLUCAO.always has ESPELHO at [0] followed by 8 existing archetypes, pickLongestDevolucao currently checks ESPELHO + 8 baseline
2. **Insertion mechanics mapped:** Exact line ranges identified for all 5 insertion sites (patternMatching.ts, oracleMachine.ts DEVOLUCAO.always, oracleMachine.ts top-level states, OracleExperience.tsx getScriptKey, validate-timing.ts pickLongestDevolucao)
3. **Test baseline confirmed:** 698/714 tests passing (16 known failures documented as out-of-scope). Phase 34 adds ~12-15 new tests, updates 1 assertion (fallback-tts SCRIPT count 80→82)
4. **Timing budget validated:** Current max-path 7:01.2 min with 28.8s headroom under 7:30 budget. Target each new devolução at 22-25s to preserve headroom
5. **POL-02 explicitly relaxed:** Phase 31-33 maintained byte-identity of patternMatching.ts. Phase 34 MUST edit it per AR-02/AR-03 requirement text. The deeper invariant (no regression of 8 existing archetype tests) is preserved by using separate choiceMap-reading logic

## Code State Verification

### patternMatching.ts (src/machines/guards/patternMatching.ts)

**Current ARCHETYPE_GUARDS export (lines 141-150):**
```typescript
export const ARCHETYPE_GUARDS = {
  isSeeker: createArchetypeGuard('SEEKER'),
  isGuardian: createArchetypeGuard('GUARDIAN'),
  isContradicted: createArchetypeGuard('CONTRADICTED'),
  isPivotEarly: createArchetypeGuard('PIVOT_EARLY'),
  isPivotLate: createArchetypeGuard('PIVOT_LATE'),
  isDepthSeeker: createArchetypeGuard('DEPTH_SEEKER'),
  isSurfaceKeeper: createArchetypeGuard('SURFACE_KEEPER'),
  isMirror: createArchetypeGuard('MIRROR'),
} as const;
```

**Status:** ✓ 8 baseline guards only, no CONTRA_FOBICO or PORTADOR yet

**PatternContext interface (lines 7-9):**
```typescript
interface PatternContext {
  choices: ChoicePattern;
}
```

**Status:** Does NOT include `choiceMap?: ChoiceMap` — Phase 34 MUST extend per D-02

**Guard factory pattern (lines 113-117):**
```typescript
export function createArchetypeGuard(
  archetype: DevolucaoArchetype
): ({ context }: { context: PatternContext }) => boolean {
  return ({ context }) => determineArchetype(context.choices) === archetype;
}
```

**Status:** Tied to positional `context.choices` + `determineArchetype()` — NOT reusable for new guards that read `context.choiceMap`. New guards must be bespoke functions per D-01.

### oracleMachine.ts setup.guards (src/machines/oracleMachine.ts:40-56)

**Current guards block:**
```typescript
guards: {
  // Existing archetype guards (uses patternMatching.ts export)
  ...ARCHETYPE_GUARDS,
  // Branch guards (new)
  shouldBranchQ2B: ({ context }) => context.choiceMap.q1 === 'A' && context.choiceMap.q2 === 'A',
  shouldBranchQ4B: ({ context }) => context.choiceMap.q3 === 'A' && context.choiceMap.q4 === 'A',
  shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B', // Phase 31
  shouldBranchQ5B: ({ context }) => context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A', // Phase 32
  shouldBranchQ6B: ({ context }) => context.choiceMap.q5 === 'B' && context.choiceMap.q6 === 'A', // Phase 33
  // Phase 33 — AR-01
  isEspelhoSilencioso: ({ context }) => context.choiceMap.q6b === 'B',
},
```

**Status:** ✓ Spread operator imports ARCHETYPE_GUARDS at top, choiceMap-reading guards (shouldBranchQ1B/Q5B/Q6B, isEspelhoSilencioso) defined inline. Pattern established: Phase 34 CAN add isContraFobico + isPortador to ARCHETYPE_GUARDS in patternMatching.ts, and setup.guards will auto-import via spread.

### DEVOLUCAO.always array (src/machines/oracleMachine.ts:674-688)

**Current structure:**
```typescript
DEVOLUCAO: {
  id: 'DEVOLUCAO',
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    // [0] — HIGHEST PRIORITY (Phase 33, AR-01)
    { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' },
    // [1-8] — Existing 8 archetypes
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    { target: 'DEVOLUCAO_CONTRADICTED' },  // UNGUARDED FALLTHROUGH
  ],
},
```

**Status:** ✓ ESPELHO at [0], 8 existing at [1-8], CONTRADICTED remains unguarded. Phase 34 inserts at indices [1] and [2], pushing existing entries down by 2 slots.

### DEVOLUCAO_ESPELHO_SILENCIOSO state (src/machines/oracleMachine.ts:694-709)

**Template for new states:**
```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: {
  on: { NARRATIVA_DONE: 'ENCERRAMENTO' },
  after: {
    300000: {  // 5-min idle reset
      target: '#oracle.IDLE',
      actions: assign({ sessionId: '', choices: [], choiceMap: {}, fallbackCount: 0, currentPhase: 'APRESENTACAO' }),
    },
  },
},
```

**Status:** ✓ Direct template for DEVOLUCAO_CONTRA_FOBICO and DEVOLUCAO_PORTADOR — copy structure exactly, change state name only.

### OracleExperience.tsx getScriptKey (src/components/experience/OracleExperience.tsx:225-234)

**Current DEVOLUCAO section:**
```typescript
// 9 DEVOLUCAO archetypes (top-level states) — Phase 33 added ESPELHO_SILENCIOSO
if (machineState.matches('DEVOLUCAO_ESPELHO_SILENCIOSO')) return 'DEVOLUCAO_ESPELHO_SILENCIOSO';
if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
if (machineState.matches('DEVOLUCAO_GUARDIAN')) return 'DEVOLUCAO_GUARDIAN';
if (machineState.matches('DEVOLUCAO_CONTRADICTED')) return 'DEVOLUCAO_CONTRADICTED';
if (machineState.matches('DEVOLUCAO_PIVOT_EARLY')) return 'DEVOLUCAO_PIVOT_EARLY';
if (machineState.matches('DEVOLUCAO_PIVOT_LATE')) return 'DEVOLUCAO_PIVOT_LATE';
if (machineState.matches('DEVOLUCAO_DEPTH_SEEKER')) return 'DEVOLUCAO_DEPTH_SEEKER';
if (machineState.matches('DEVOLUCAO_SURFACE_KEEPER')) return 'DEVOLUCAO_SURFACE_KEEPER';
if (machineState.matches('DEVOLUCAO_MIRROR')) return 'DEVOLUCAO_MIRROR';
```

**Status:** ✓ Uses string form `state.matches('STATE_NAME')` for top-level states (per convention established in Phase 33). Phase 34 adds 2 new if-blocks using same pattern. Insertion point: after ESPELHO_SILENCIOSO, before SEEKER (maintain priority order visual hint).

### DevolucaoArchetype union (src/types/index.ts:24-32)

**Current type:**
```typescript
export type DevolucaoArchetype =
  | 'SEEKER'
  | 'GUARDIAN'
  | 'CONTRADICTED'
  | 'PIVOT_EARLY'
  | 'PIVOT_LATE'
  | 'DEPTH_SEEKER'
  | 'SURFACE_KEEPER'
  | 'MIRROR';
```

**Status:** Missing ESPELHO_SILENCIOSO (Phase 33 gap — likely merged incomplete), missing CONTRA_FOBICO + PORTADOR. Phase 34 must add all 3 (to avoid breaking Phase 33 ESPELHO references).

### pickLongestDevolucao (scripts/validate-timing.ts:110-140)

**Current implementation:**
```typescript
function pickLongestDevolucao(hasEspelhoSilencioso: boolean): { segments: SpeechSegment[], key: string } {
  // Phase 33 — ESPELHO_SILENCIOSO pre-empts all other archetypes
  if (hasEspelhoSilencioso) {
    return { key: 'DEVOLUCAO_ESPELHO_SILENCIOSO', segments: SCRIPT.DEVOLUCAO_ESPELHO_SILENCIOSO };
  }

  // Existing 8 archetypes
  const devolucoes = [
    { key: 'DEVOLUCAO_SEEKER', segments: SCRIPT.DEVOLUCAO_SEEKER },
    // ... 7 more
  ];

  // Find longest via loop
  return longest;
}
```

**Status:** ✓ ESPELHO pre-emption logic established. Phase 34 extends the 8-archetype array to include CONTRA_FOBICO + PORTADOR at top (before looping), OR adds conditional pre-checks like ESPELHO.

**Signature:** Takes `hasEspelhoSilencioso: boolean` — Phase 34 COULD extend to `(hasEspelhoSilencioso, hasContraFobico, hasPortador)` OR compute trigger conditions inline from hypothetical choiceMap (D-21 path permutations suggest the latter).

### Test Baseline

**Current counts (from npm test output):**
- Test Files: 41 passed, 2 failed (43 total)
- Tests: 698 passed, 16 failed, 3 skipped (717 total)
- Known failures: voice-flow-integration.test.ts (15), ambient-player.test.ts (2) — documented in CLAUDE.md as out-of-scope

**Key test files for Phase 34:**
- `src/machines/guards/__tests__/patternMatching.test.ts`: 59 tests passing — Phase 34 adds ~6 (2 guards × 3 scenarios each)
- `src/machines/oracleMachine.test.ts`: 118 tests passing (3 skipped) — Phase 34 adds ~6 (priority order, wins scenarios)
- `src/components/experience/__tests__/OracleExperience-helpers.test.ts`: 23 tests passing — Phase 34 adds 2 (getScriptKey for 2 new states)
- `src/services/tts/__tests__/fallback-tts.test.ts`: 7 tests passing — Phase 34 updates 1 assertion (SCRIPT key count 80→82)

**Total new tests:** ~12-15

## Insertion Mechanics

### 1. patternMatching.ts — Extend PatternContext interface

**File:** `src/machines/guards/patternMatching.ts`
**Location:** Line 7 (PatternContext interface)

**Current:**
```typescript
interface PatternContext {
  choices: ChoicePattern;
}
```

**Insert after line 8:**
```typescript
interface PatternContext {
  choices: ChoicePattern;
  choiceMap?: ChoiceMap;  // NEW — Phase 34 (AR-02, AR-03)
}
```

### 2. patternMatching.ts — Add bespoke guards + extend ARCHETYPE_GUARDS

**File:** `src/machines/guards/patternMatching.ts`
**Location:** Insert after line 117 (after createArchetypeGuard function), before ARCHETYPE_GUARDS export

**Insert:**
```typescript
/**
 * Phase 34 — AR-02: CONTRA_FOBICO archetype guard
 * Triggers when visitor stayed in room (q1=B) AND looked at thing (q2=B) AND crossed void (q1b=A).
 * Reads context.choiceMap (named lookup), NOT context.choices (positional).
 * Cannot use createArchetypeGuard() because that factory is tied to determineArchetype().
 */
export function isContraFobico({ context }: { context: PatternContext }): boolean {
  if (!context.choiceMap) return false;
  return (
    context.choiceMap.q1 === 'B' &&
    context.choiceMap.q2 === 'B' &&
    context.choiceMap.q1b === 'A'
  );
}

/**
 * Phase 34 — AR-03: PORTADOR archetype guard
 * Triggers when visitor remembered everything (q4=A) AND carries question (q5=A) AND fused them (q5b=A).
 * Reads context.choiceMap (named lookup), NOT context.choices (positional).
 */
export function isPortador({ context }: { context: PatternContext }): boolean {
  if (!context.choiceMap) return false;
  return (
    context.choiceMap.q4 === 'A' &&
    context.choiceMap.q5 === 'A' &&
    context.choiceMap.q5b === 'A'
  );
}
```

**Then update ARCHETYPE_GUARDS (lines 141-150):**
```typescript
export const ARCHETYPE_GUARDS = {
  isSeeker: createArchetypeGuard('SEEKER'),
  isGuardian: createArchetypeGuard('GUARDIAN'),
  isContradicted: createArchetypeGuard('CONTRADICTED'),
  isPivotEarly: createArchetypeGuard('PIVOT_EARLY'),
  isPivotLate: createArchetypeGuard('PIVOT_LATE'),
  isDepthSeeker: createArchetypeGuard('DEPTH_SEEKER'),
  isSurfaceKeeper: createArchetypeGuard('SURFACE_KEEPER'),
  isMirror: createArchetypeGuard('MIRROR'),
  isContraFobico,    // NEW — Phase 34, AR-02
  isPortador,        // NEW — Phase 34, AR-03
} as const;
```

### 3. oracleMachine.ts — Insert DEVOLUCAO.always[1] and [2]

**File:** `src/machines/oracleMachine.ts`
**Location:** Line 678 (after ESPELHO_SILENCIOSO entry, before MIRROR)

**Current line 678:**
```typescript
  { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' },
  { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },  // ← currently at [1]
```

**Change to:**
```typescript
  { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' },
  { target: 'DEVOLUCAO_CONTRA_FOBICO', guard: 'isContraFobico' },  // NEW [1] — Phase 34, AR-02
  { target: 'DEVOLUCAO_PORTADOR', guard: 'isPortador' },           // NEW [2] — Phase 34, AR-03
  { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },              // now [3]
```

**Result:** ESPELHO at [0], CONTRA_FOBICO at [1], PORTADOR at [2], 8 existing at [3-10], CONTRADICTED unguarded at [11].

### 4. oracleMachine.ts — Add top-level states

**File:** `src/machines/oracleMachine.ts`
**Location:** After DEVOLUCAO_ESPELHO_SILENCIOSO state (line 709), before DEVOLUCAO_SEEKER (line 711)

**Insert:**
```typescript
    // Phase 34 — AR-02 — DEVOLUCAO_CONTRA_FOBICO archetype state
    DEVOLUCAO_CONTRA_FOBICO: {
      on: { NARRATIVA_DONE: 'ENCERRAMENTO' },
      after: {
        300000: {
          target: '#oracle.IDLE',
          actions: assign({ sessionId: '', choices: [], choiceMap: {}, fallbackCount: 0, currentPhase: 'APRESENTACAO' }),
        },
      },
    },

    // Phase 34 — AR-03 — DEVOLUCAO_PORTADOR archetype state
    DEVOLUCAO_PORTADOR: {
      on: { NARRATIVA_DONE: 'ENCERRAMENTO' },
      after: {
        300000: {
          target: '#oracle.IDLE',
          actions: assign({ sessionId: '', choices: [], choiceMap: {}, fallbackCount: 0, currentPhase: 'APRESENTACAO' }),
        },
      },
    },
```

### 5. OracleExperience.tsx — Extend getScriptKey

**File:** `src/components/experience/OracleExperience.tsx`
**Location:** Line 226 (after ESPELHO_SILENCIOSO, before SEEKER)

**Current:**
```typescript
if (machineState.matches('DEVOLUCAO_ESPELHO_SILENCIOSO')) return 'DEVOLUCAO_ESPELHO_SILENCIOSO';
if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
```

**Change to:**
```typescript
if (machineState.matches('DEVOLUCAO_ESPELHO_SILENCIOSO')) return 'DEVOLUCAO_ESPELHO_SILENCIOSO';
if (machineState.matches('DEVOLUCAO_CONTRA_FOBICO')) return 'DEVOLUCAO_CONTRA_FOBICO';  // NEW — Phase 34, AR-02
if (machineState.matches('DEVOLUCAO_PORTADOR')) return 'DEVOLUCAO_PORTADOR';            // NEW — Phase 34, AR-03
if (machineState.matches('DEVOLUCAO_SEEKER')) return 'DEVOLUCAO_SEEKER';
```

### 6. validate-timing.ts — Extend pickLongestDevolucao

**File:** `scripts/validate-timing.ts`
**Location:** Line 117-126 (devolucoes array inside pickLongestDevolucao)

**Current:**
```typescript
const devolucoes = [
  { key: 'DEVOLUCAO_SEEKER', segments: SCRIPT.DEVOLUCAO_SEEKER },
  { key: 'DEVOLUCAO_GUARDIAN', segments: SCRIPT.DEVOLUCAO_GUARDIAN },
  // ... 6 more
];
```

**Extend to:**
```typescript
const devolucoes = [
  { key: 'DEVOLUCAO_CONTRA_FOBICO', segments: SCRIPT.DEVOLUCAO_CONTRA_FOBICO },    // NEW — Phase 34
  { key: 'DEVOLUCAO_PORTADOR', segments: SCRIPT.DEVOLUCAO_PORTADOR },              // NEW — Phase 34
  { key: 'DEVOLUCAO_SEEKER', segments: SCRIPT.DEVOLUCAO_SEEKER },
  { key: 'DEVOLUCAO_GUARDIAN', segments: SCRIPT.DEVOLUCAO_GUARDIAN },
  // ... 6 more (total 10 now)
];
```

**Note:** No signature change needed. The function already picks the longest among all candidates — adding 2 more to the array is sufficient. If CONTRA_FOBICO or PORTADOR is triggered by a path's choiceMap pattern, the validator will compare their duration vs ESPELHO + 8 baseline.

### 7. types/index.ts — Extend DevolucaoArchetype union

**File:** `src/types/index.ts`
**Location:** Line 24-32 (DevolucaoArchetype type)

**Current:**
```typescript
export type DevolucaoArchetype =
  | 'SEEKER'
  | 'GUARDIAN'
  | 'CONTRADICTED'
  | 'PIVOT_EARLY'
  | 'PIVOT_LATE'
  | 'DEPTH_SEEKER'
  | 'SURFACE_KEEPER'
  | 'MIRROR';
```

**Change to:**
```typescript
export type DevolucaoArchetype =
  | 'SEEKER'
  | 'GUARDIAN'
  | 'CONTRADICTED'
  | 'PIVOT_EARLY'
  | 'PIVOT_LATE'
  | 'DEPTH_SEEKER'
  | 'SURFACE_KEEPER'
  | 'MIRROR'
  | 'ESPELHO_SILENCIOSO'   // Phase 33 (missing from current code — add to avoid break)
  | 'CONTRA_FOBICO'        // Phase 34, AR-02
  | 'PORTADOR';            // Phase 34, AR-03
```

## Test Baseline & Expected Deltas

### Current Baseline (2026-04-07)

**Test Files:** 41 passed, 2 failed (43 total)
**Tests:** 698 passed, 16 failed, 3 skipped (717 total)
**Known failures (out of scope):**
- `voice-flow-integration.test.ts`: 15 failures (v1.0 PURGATORIO_A/B states obsolete)
- `ambient-player.test.ts`: 2 failures (Phase 30 working copy modifications)

### Phase 34 Test Additions

#### 1. patternMatching.test.ts — Guard unit tests

**Location:** `src/machines/guards/__tests__/patternMatching.test.ts`
**Current:** 59 tests passing
**Add:** ~6 tests

**New test scenarios:**
```typescript
describe('isContraFobico', () => {
  it('returns true when q1=B && q2=B && q1b=A', () => {
    const context = { choices: [], choiceMap: { q1: 'B', q2: 'B', q1b: 'A' } };
    expect(isContraFobico({ context })).toBe(true);
  });

  it('returns false when q1b is missing', () => {
    const context = { choices: [], choiceMap: { q1: 'B', q2: 'B' } };
    expect(isContraFobico({ context })).toBe(false);
  });

  it('returns false when choiceMap is empty', () => {
    const context = { choices: [], choiceMap: {} };
    expect(isContraFobico({ context })).toBe(false);
  });
});

describe('isPortador', () => {
  // Same 3 scenarios: positive, missing field, empty choiceMap
});
```

**Expected result:** 59 → 65 tests passing

#### 2. oracleMachine.test.ts — Priority order tests

**Location:** `src/machines/oracleMachine.test.ts`
**Current:** 118 tests passing (3 skipped)
**Add:** ~6 tests

**New test scenarios:**
```typescript
describe('DEVOLUCAO.always priority (Phase 34)', () => {
  it('CONTRA_FOBICO wins when triggered (ESPELHO not triggered)', () => {
    // Context: q1=B, q2=B, q1b=A, q6b=undefined
    // Expect: transition to DEVOLUCAO_CONTRA_FOBICO (not MIRROR/SEEKER)
  });

  it('PORTADOR wins when triggered (CONTRA_FOBICO not triggered)', () => {
    // Context: q4=A, q5=A, q5b=A, q1b=undefined
    // Expect: transition to DEVOLUCAO_PORTADOR
  });

  it('CONTRA_FOBICO wins over PORTADOR when both triggered', () => {
    // Context: q1=B, q2=B, q1b=A, q4=A, q5=A, q5b=A
    // Expect: CONTRA_FOBICO (index [1] beats index [2])
  });

  it('ESPELHO_SILENCIOSO wins over CONTRA_FOBICO when both triggered', () => {
    // Context: q1=B, q2=B, q1b=A, q6b=B
    // Expect: ESPELHO (index [0] beats all)
  });

  it('Existing archetypes still work when new guards do not fire', () => {
    // Context: q1=A, q2=A, q1b=undefined (no new guards)
    // Expect: one of the 8 baseline archetypes (e.g. SEEKER if choices are 66%+ A)
  });

  it('DEVOLUCAO routes to new states and transitions to ENCERRAMENTO', () => {
    // Full state transition: enter DEVOLUCAO_CONTRA_FOBICO, send NARRATIVA_DONE, expect ENCERRAMENTO
  });
});
```

**Expected result:** 118 → 124 tests passing (3 skipped)

#### 3. OracleExperience-helpers.test.ts — getScriptKey tests

**Location:** `src/components/experience/__tests__/OracleExperience-helpers.test.ts`
**Current:** 23 tests passing
**Add:** 2 tests

**New test scenarios:**
```typescript
it('returns DEVOLUCAO_CONTRA_FOBICO for top-level CONTRA_FOBICO state', () => {
  const state = { matches: (s: string) => s === 'DEVOLUCAO_CONTRA_FOBICO', value: 'DEVOLUCAO_CONTRA_FOBICO' };
  expect(getScriptKey(state)).toBe('DEVOLUCAO_CONTRA_FOBICO');
});

it('returns DEVOLUCAO_PORTADOR for top-level PORTADOR state', () => {
  const state = { matches: (s: string) => s === 'DEVOLUCAO_PORTADOR', value: 'DEVOLUCAO_PORTADOR' };
  expect(getScriptKey(state)).toBe('DEVOLUCAO_PORTADOR');
});
```

**Expected result:** 23 → 25 tests passing

#### 4. fallback-tts.test.ts — Update SCRIPT key count assertion

**Location:** `src/services/tts/__tests__/fallback-tts.test.ts`
**Current:** 7 tests passing (lines 45-89 visible, assertion likely around line 60-80)
**Update:** 1 assertion (SCRIPT key count)

**Expected change:**
```typescript
// Find test like "should have prerecorded URLs for all SCRIPT keys"
// Current assertion:
expect(Object.keys(SCRIPT).length).toBe(80);

// Change to:
expect(Object.keys(SCRIPT).length).toBe(82);  // Phase 34: 80 + CONTRA_FOBICO + PORTADOR
```

**Expected result:** 7 tests still passing (no new tests, just update count)

### Total Expected Baseline After Phase 34

**Test Files:** 41 passed (same)
**Tests:** 698 + 14 = 712 passed, 16 failed, 3 skipped (731 total)

## Risk Assessment

### 1. POL-02 Relaxation — Guard Isolation Risk

**Risk:** New guards (`isContraFobico`, `isPortador`) read `context.choiceMap`, while existing 8 guards read `context.choices` via `determineArchetype()`. Could choiceMap-reading guards interfere with positional logic?

**Mitigation:**
- D-03 explicitly relaxes POL-02 byte-identity rule for this phase
- New guards check DIFFERENT fields (`q1b`, `q5b`) vs `determineArchetype()` which reads positional `choices[0]`, `choices[1]`, etc.
- No code path where `isContraFobico()` or `isPortador()` calls `determineArchetype()` or vice versa
- Test strategy includes "existing archetypes still work" regression test (verifies no interference)

**Confidence:** HIGH — Guards are structurally isolated. Only shared surface is `context` object, which has both `choices` and `choiceMap` as independent fields.

### 2. Max-Path Timing Budget

**Current state:** 7:01.2 min with 28.8s headroom under 7:30 budget
**New devoluções:** 2 archetypes, target 22-25s each

**Scenario analysis:**

| Path Pattern | Old Archetype (typical) | New Archetype (if triggered) | Duration Delta | Risk |
|--------------|-------------------------|------------------------------|----------------|------|
| Q1B + CONTRA_FOBICO trigger (q1=B, q2=B, q1b=A) | MIRROR (24s typical) or SEEKER (26s) | CONTRA_FOBICO (target 22-25s) | -1 to +1s | LOW |
| Q5B + PORTADOR trigger (q4=A, q5=A, q5b=A) | DEPTH_SEEKER (28s longest) or PIVOT_EARLY (27s) | PORTADOR (target 22-25s) | -3 to -2s | NONE (faster) |
| Both triggers (q1=B, q2=B, q1b=A, q4=A, q5=A, q5b=A) | DEPTH_SEEKER (28s) | CONTRA_FOBICO (22-25s — wins priority) | -3 to -6s | NONE (faster) |

**Key insight:** New archetypes are SUBSTITUTIONS, not ADDITIONS. They replace whatever archetype the same choice pattern would have triggered. Since CONTRA_FOBICO/PORTADOR are targeting 22-25s (shorter than DEPTH_SEEKER's 28s and comparable to MIRROR's 24s), they are unlikely to increase max-path.

**Mitigation strategy (D-22, D-23):**
- Target scripts at 22-25s (3-5s headroom vs ESPELHO at 24s)
- Wave 3 runs `validate-timing.ts` — if max-path > 7:30, trim one segment before phase closeout
- POL-01 full 96-path audit + structural mitigation remains Phase 35's job

**Confidence:** HIGH — Replacement logic + conservative target duration give substantial buffer.

### 3. Script Tone Consistency

**Risk:** New devoluções feel "added on" rather than part of original set.

**Mitigation (from CONTEXT D-10, D-11, D-12):**
- Follow existing v3.1 3-layer mirror pattern: recognition → reframing → gesture naming
- Use established inflection vocabulary only (`warm`, `serious`, `thoughtful`, `gentle`, `determined` — not experimental tags like `whispering` which doesn't render)
- Avoid framework names, declarative diagnosis, gamified language (matches existing 8 + ESPELHO constraints)
- D-12 grants Claude discretion on exact wording — planner/executor will draft inline during Wave 1
- Reference DEVOLUCAO_MIRROR (script.ts:565-570) and DEVOLUCAO_ESPELHO_SILENCIOSO (580-587) for tone calibration

**Confidence:** MEDIUM — Script quality depends on execution discipline (reading aloud, comparing to reference archetypes). CONTEXT provides strong guardrails but cannot guarantee artistic coherence without human review.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 + @testing-library/react |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AR-02 | isContraFobico guard returns true when q1=B && q2=B && q1b=A | unit | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "isContraFobico"` | ❌ Wave 2 |
| AR-02 | CONTRA_FOBICO wins priority over PORTADOR/MIRROR when triggered | integration | `npm test src/machines/oracleMachine.test.ts -t "CONTRA_FOBICO wins"` | ❌ Wave 2 |
| AR-02 | getScriptKey returns DEVOLUCAO_CONTRA_FOBICO for top-level state | unit | `npm test src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "CONTRA_FOBICO"` | ❌ Wave 2 |
| AR-03 | isPortador guard returns true when q4=A && q5=A && q5b=A | unit | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "isPortador"` | ❌ Wave 2 |
| AR-03 | PORTADOR wins priority over 8 baseline archetypes when triggered | integration | `npm test src/machines/oracleMachine.test.ts -t "PORTADOR wins"` | ❌ Wave 2 |
| AR-03 | getScriptKey returns DEVOLUCAO_PORTADOR for top-level state | unit | `npm test src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "PORTADOR"` | ❌ Wave 2 |
| POL-02 (deeper invariant) | Existing 8 archetype tests remain GREEN after patternMatching.ts edits | regression | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "determineArchetype"` | ✅ (59 existing tests) |

### Sampling Rate

- **Per task commit:** `npm test src/machines/guards/__tests__/patternMatching.test.ts src/machines/oracleMachine.test.ts src/components/experience/__tests__/OracleExperience-helpers.test.ts` (guard + machine + helpers suites only)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green (698 → 712 passing, 16 known failures unchanged) before `/gsd:verify-work`

### Wave 2 Gaps

- [ ] `src/machines/guards/__tests__/patternMatching.test.ts` — add `isContraFobico` + `isPortador` guard tests (6 new tests)
- [ ] `src/machines/oracleMachine.test.ts` — add DEVOLUCAO.always priority tests for new archetypes (6 new tests)
- [ ] `src/components/experience/__tests__/OracleExperience-helpers.test.ts` — add getScriptKey tests for 2 new states (2 new tests)
- [ ] `src/services/tts/__tests__/fallback-tts.test.ts` — update SCRIPT key count assertion from 80 to 82 (0 new tests, 1 update)

**Note:** Wave 1 (script + types) has no test gaps — SCRIPT keys are declarative data with no test coverage, DevolucaoArchetype union extension is a type-only change.

### Edge Cases to Exercise

1. **Empty choiceMap:** Guard returns false when `context.choiceMap` is `{}` or `undefined`
2. **Both new guards true:** CONTRA_FOBICO wins (index [1] beats index [2]) when both `isContraFobico()` and `isPortador()` return true
3. **ESPELHO trumps both:** When `q6b=B` AND one of the new guards fires, ESPELHO wins (index [0] beats all)
4. **Baseline archetype still works:** Visitor with `q1=A, q2=A, q1b=undefined` (no new guard triggered) routes to one of the 8 baseline archetypes via `determineArchetype()`
5. **Partial trigger (missing field):** CONTRA_FOBICO guard returns false when `q1=B, q2=B` but `q1b=undefined` (visitor never entered Q1B branch)

## Open Questions for Planner

**None.** CONTEXT.md D-01 to D-31 lock all structural decisions. D-12 grants Claude discretion on exact script wording (to be drafted inline during Wave 1 execution). Research confirms all insertion sites are well-defined and code state matches CONTEXT expectations.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/34-detectable-archetypes-contra-fobico-portador/34-CONTEXT.md` — D-01 to D-31 locked decisions (verified 2026-04-07)
- `src/machines/guards/patternMatching.ts` — Current ARCHETYPE_GUARDS export (8 baseline guards, lines 141-150)
- `src/machines/oracleMachine.ts` — DEVOLUCAO.always structure (lines 674-688), ESPELHO state template (694-709), setup.guards pattern (40-56)
- `src/components/experience/OracleExperience.tsx` — getScriptKey top-level state pattern (lines 225-234)
- `scripts/validate-timing.ts` — pickLongestDevolucao implementation (lines 110-140), current max-path 7:01.2 min
- `.planning/phases/33-q6b-espelho-silencioso/33-VERIFICATION.md` — Phase 33 test baseline (698/714 passing), POL-02 verification protocol

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — AR-02 / AR-03 requirement text (lines 21-22)
- `CLAUDE.md` — Project conventions (lines 73-82), Common Tasks workflow (85-97)
- `MEMORY.md` — Inflection tag compatibility notes (voice ID `PznTnBc8X6pvixs9UkQm` supports `warm`, `gentle`, NOT `whispering`)

## Metadata

**Confidence breakdown:**
- Code state verification: HIGH — All 8 insertion sites mapped with exact line references
- Insertion mechanics: HIGH — Diff-style snippets provided for each site
- Test strategy: HIGH — Baseline counts verified, delta calculations match CONTEXT expectations
- Timing budget: HIGH — Current headroom (28.8s) exceeds target script duration (22-25s × 2)
- Script tone: MEDIUM — Quality depends on execution discipline, not research verification

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 days — stable domain, XState v5 + project conventions unlikely to change before Bienal event)

---

## RESEARCH COMPLETE

**Phase:** 34 - Detectable Archetypes (CONTRA_FOBICO + PORTADOR)
**Confidence:** HIGH

### Key Findings

1. **Code state verified:** patternMatching.ts exports ARCHETYPE_GUARDS (8 baseline), DEVOLUCAO.always has ESPELHO at [0] + 8 existing, pickLongestDevolucao checks ESPELHO + 8 baseline
2. **Insertion mechanics mapped:** 7 insertion sites with exact line ranges + diff-style snippets
3. **Test baseline confirmed:** 698/714 passing (16 known failures out-of-scope), Phase 34 adds ~12-15 tests
4. **Timing budget validated:** 28.8s headroom, target 22-25s per archetype (substitution not addition)
5. **POL-02 explicitly relaxed:** Guards structurally isolated (choiceMap vs choices), existing 8 archetypes cannot regress

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Code insertion sites | HIGH | All 7 sites mapped with line references + surrounding context |
| Guard implementation | HIGH | Pattern established by Phase 31-33 guards (shouldBranchQ1B/Q5B/Q6B, isEspelhoSilencioso) |
| Test strategy | HIGH | Baseline verified, delta calculations match CONTEXT expectations |
| Timing budget | HIGH | Conservative target (22-25s) vs current headroom (28.8s) |
| Script tone | MEDIUM | Quality depends on execution, not research verification |

### Open Questions

None — CONTEXT.md D-01 to D-31 lock all structural decisions.

### Ready for Planning

Research complete. Planner can create PLAN.md files following Phase 33's 3-wave pattern (Wave 1: SCRIPT + types, Wave 2: guards + machine + UI + tests, Wave 3: audio + timing + roteiro).
