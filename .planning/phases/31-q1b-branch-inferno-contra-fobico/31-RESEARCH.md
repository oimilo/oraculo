# Phase 31: Q1B Branch (Inferno contra-fobico) - Research

**Researched:** 2026-04-06
**Domain:** XState v5 conditional branching, PT-BR script expansion, ElevenLabs v3 audio generation
**Confidence:** HIGH

## Summary

Phase 31 adds the first of three new conditional branches to the Oracle state machine. Q1B "A Porta no Fundo" triggers when the visitor shows a contra-fóbico profile (`q1==='B' && q2==='B'`) — they left the comfortable room AND stayed staring at the repulsive thing. This branch tests whether their courage extends to crossing emptiness.

The implementation follows an established pattern from Q2B and Q4B (v4.0 baseline). All necessary infrastructure exists — this phase adds 8 script entries, 1 QUESTION_META entry, 4 machine states, 1 guard function, extends 6 OracleExperience.tsx helper functions, generates 8 MP3s, and updates public/roteiro.html. The pattern is proven and well-tested (496 tests passing in v4.0).

**Primary recommendation:** Follow the Q2B spelling pattern exactly. Add Q1B states after `Q2_RESPOSTA_B` (mirror of how Q2B branches after `Q2_RESPOSTA_A`). Both Q1B paths rejoin at the INFERNO→PURGATORIO transition. Script content and QUESTION_META are fully specified in the milestone blueprint.

## User Constraints (from Milestone Blueprint)

**Note:** No CONTEXT.md exists for Phase 31 — user approved the full v6.0 milestone blueprint with autonomous implementation mode. All decisions are locked in `.planning/REQUIREMENTS.md` and `memory/next-milestone-v5-deep-branching.md`.

### Locked Decisions

1. **Q1B trigger condition:** `q1==='B' && q2==='B'` (visitor left the room AND stayed staring at the thing)
2. **Q1B branches FROM:** `Q2_RESPOSTA_B` state (after visitor chose B in Q2)
3. **Q1B rejoins at:** INFERNO→PURGATORIO transition (both RESPOSTA_A and RESPOSTA_B paths)
4. **Script structure:** 8 keys total: SETUP (3 segments), PERGUNTA (1), RESPOSTA_A (2), RESPOSTA_B (2), FALLBACK (1), TIMEOUT (1)
5. **QUESTION_META index:** Position 9 in the QUESTION_META map
6. **Implementation order:** Q1B first (Phase 31), then Q5B (Phase 32), then Q6B+ESPELHO_SILENCIOSO (Phase 33)
7. **Time budget overflow:** Accepted for ~1-3% of visitors who trigger all branches — max-path may reach ~7:20
8. **ChoiceMap extension:** Happens in this phase (POL-02) — add optional `q1b?`, `q5b?`, `q6b?` fields to `ChoiceMap` type

### Claude's Discretion

- Task granularity (single wave vs. multi-wave)
- Test coverage depth (minimum: guard test, branch path test, timing validation update)
- Order of file edits within the phase

### Deferred Ideas (OUT OF SCOPE)

- CONTRA_FOBICO archetype detection (Phase 34, requires q1b choice data)
- Q5B and Q6B branches (Phases 32-33)
- Timing mitigation (Phase 35)
- Browser UAT (Phase 35)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BR-01 | Visitor com `q1='B' && q2='B'` ouve a branch Q1B "A Porta no Fundo" — 8 entries no script, QUESTION_META[9], guard `shouldBranchQ1B`, estados Q1B_* na máquina, OracleExperience extended, 8 MP3s gerados | Q2B pattern (v4.0) shows exact implementation path: guard → states → OracleExperience helpers → script → QUESTION_META → MP3s → tests |
| POL-02 | ChoiceMap context type extended em `oracleMachine.types.ts` com campos opcionais `q1b?`, `q5b?`, `q6b?` sem quebrar arquétipos existentes (testes v4.0 continuam passando) | Existing `ChoiceMap` is `Partial<Record<QuestionId, ChoiceAB>>` — adding optional fields is type-safe, no archetype guards reference these fields |

## Standard Stack

### Core

All dependencies already installed and verified in v4.0 baseline. No new packages required.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| XState | 5.x | State machine with conditional transitions | Powers all 54 existing states + guards for Q2B/Q4B branching |
| TypeScript | 5.7 | Strict typing for machine context and events | Catches type errors in ChoiceMap extension |
| Vitest | Latest | Test framework with jsdom environment | 496 tests passing, covers machine + components |
| ElevenLabs API | v3 | PT-BR audio generation with inflection tags | 61 MP3s already generated with voice ID `PznTnBc8X6pvixs9UkQm` |

### Supporting

No additional libraries needed — this is a branch addition using existing infrastructure.

### Alternatives Considered

None — this phase extends existing patterns, no architectural decisions required.

**Installation:** N/A (all dependencies present)

**Version verification:** Not applicable (no new packages)

## Architecture Patterns

### Recommended File Edit Order

Based on dependency flow (types → machine → components → scripts):

```
1. src/machines/oracleMachine.types.ts     # Extend QuestionId union, ChoiceMap type (POL-02)
2. src/data/script.ts                      # Add 8 script entries (keys from blueprint)
3. src/types/index.ts                      # Add QUESTION_META[9]
4. src/machines/oracleMachine.ts           # Add guard + 4 states (Q1B_SETUP/PERGUNTA/AGUARDANDO/TIMEOUT, RESPOSTA_A/B)
5. src/components/experience/OracleExperience.tsx  # Extend 6 helpers
6. scripts/validate-timing.ts              # Add Q1B permutations (4 paths → 8 paths)
7. public/roteiro.html                     # Add Q1B narrative + update Mermaid flowchart
8. Generate 8 MP3s via scripts/generate-audio-v3.ts
9. Add tests for guard, branch path, timing validation
```

### Pattern 1: Conditional Branch State Machine Spelling

**What:** Q2B establishes the pattern for adding conditional branches to the XState v5 machine.

**When to use:** Any time a branch triggers based on previous choices (guard function + conditional transition).

**Example from Q2B (existing baseline):**

```typescript
// In oracleMachine.ts

// 1. Guard definition (setup block)
guards: {
  shouldBranchQ2B: ({ context }) => context.choiceMap.q1 === 'A' && context.choiceMap.q2 === 'A',
  // Q1B will mirror this pattern:
  // shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B',
}

// 2. States within INFERNO hierarchical state
states: {
  Q2_RESPOSTA_A: {
    on: {
      NARRATIVA_DONE: [
        { target: 'Q2B_SETUP', guard: 'shouldBranchQ2B' },  // Conditional first
        { target: '#oracle.PURGATORIO' },                   // Fallback to next phase
      ],
    },
  },
  Q2B_SETUP: {
    on: { NARRATIVA_DONE: 'Q2B_PERGUNTA' },
  },
  Q2B_PERGUNTA: {
    on: { NARRATIVA_DONE: 'Q2B_AGUARDANDO' },
  },
  Q2B_AGUARDANDO: {
    after: {
      25000: {
        target: 'Q2B_TIMEOUT',
        actions: assign(recordChoice('q2b', 'A')),  // Default on timeout
      },
    },
    on: {
      CHOICE_A: {
        target: 'Q2B_RESPOSTA_A',
        actions: assign(recordChoice('q2b', 'A')),
      },
      CHOICE_B: {
        target: 'Q2B_RESPOSTA_B',
        actions: assign(recordChoice('q2b', 'B')),
      },
    },
  },
  Q2B_TIMEOUT: {
    on: { NARRATIVA_DONE: 'Q2B_RESPOSTA_A' },
  },
  Q2B_RESPOSTA_A: {
    on: { NARRATIVA_DONE: '#oracle.PURGATORIO' },  // Rejoin main path
  },
  Q2B_RESPOSTA_B: {
    on: { NARRATIVA_DONE: '#oracle.PURGATORIO' },  // Rejoin main path
  },
}
```

**Q1B adaptation:**

- Branch FROM `Q2_RESPOSTA_B` instead of `Q2_RESPOSTA_A` (mirror trigger)
- Guard checks `q1==='B' && q2==='B'` (opposite conditions)
- Both Q1B paths rejoin at `#oracle.PURGATORIO` (same destination)

### Pattern 2: OracleExperience.tsx Helper Function Extension

**What:** Six helper functions map machine states to script keys, delays, fallbacks, and choice configs. Every new branch extends all six.

**When to use:** Any time new states are added to the machine.

**Example — functions to extend:**

```typescript
// 1. getScriptKey() — maps state to SCRIPT key
function getScriptKey(machineState: any): keyof typeof SCRIPT | null {
  // Add Q1B mappings:
  if (machineState.matches({ INFERNO: 'Q1B_SETUP' })) return 'INFERNO_Q1B_SETUP';
  if (machineState.matches({ INFERNO: 'Q1B_PERGUNTA' })) return 'INFERNO_Q1B_PERGUNTA';
  if (machineState.matches({ INFERNO: 'Q1B_RESPOSTA_A' })) return 'INFERNO_Q1B_RESPOSTA_A';
  if (machineState.matches({ INFERNO: 'Q1B_RESPOSTA_B' })) return 'INFERNO_Q1B_RESPOSTA_B';
  if (machineState.matches({ INFERNO: 'Q1B_TIMEOUT' })) return 'TIMEOUT_Q1B';
  // ...
}

// 2. getBreathingDelay() — pause before NARRATIVA_DONE event
function getBreathingDelay(machineState: any): number {
  // Q1B follows same timing as Q2B:
  if (machineState.matches({ INFERNO: 'Q1B_SETUP' })) return MEDIUM;  // 1500ms
  if (machineState.matches({ INFERNO: 'Q1B_PERGUNTA' })) return NONE;  // 0ms (mic opens immediately)
  if (machineState.matches({ INFERNO: 'Q1B_RESPOSTA_A' })) return LONG;  // 2500ms (crosses to PURGATORIO)
  if (machineState.matches({ INFERNO: 'Q1B_RESPOSTA_B' })) return LONG;  // 2500ms (crosses to PURGATORIO)
  // ...
}

// 3. getFallbackScript() — fallback text when NLU fails
function getFallbackScript(machineState: any): { segments: SpeechSegment[]; key: string } | null {
  if (machineState.matches({ INFERNO: 'Q1B_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q1B, key: 'FALLBACK_Q1B' };
  // ...
}

// 4. activeChoiceConfig — which ChoiceConfig for current AGUARDANDO state
// Build Q1B_CHOICE constant at top of file:
const Q1B_CHOICE = buildChoiceConfig(9);  // QUESTION_META index 9

// Then in component:
const activeChoiceConfig = useMemo(() => {
  // ...
  if (state.matches({ INFERNO: 'Q1B_AGUARDANDO' })) return Q1B_CHOICE;
  // ...
}, [state.value]);

// 5. isAguardando check (for ListeningIndicator component)
const isAguardando =
  state.matches({ INFERNO: 'Q1_AGUARDANDO' }) ||
  state.matches({ INFERNO: 'Q2_AGUARDANDO' }) ||
  state.matches({ INFERNO: 'Q2B_AGUARDANDO' }) ||
  state.matches({ INFERNO: 'Q1B_AGUARDANDO' }) ||  // Add this line
  // ... other AGUARDANDO states
```

All 6 helpers follow this additive pattern — no existing logic changes.

### Pattern 3: Script Entry Spelling

**What:** Each branch question follows the 8-key anatomy: SETUP (3 segments), PERGUNTA (1), RESPOSTA_A (2), RESPOSTA_B (2), FALLBACK (1), TIMEOUT (1).

**When to use:** Adding any new question or branch to the script.

**Blueprint specifies Q1B content:**

```typescript
// From next-milestone-v5-deep-branching.md (lines 29-45):

INFERNO_Q1B_SETUP: [
  { text: "Você não recua. Continua olhando.", pauseAfter: 1000 },
  { text: "E aí — sem aviso — uma porta aparece no fundo do corredor. Não é a que você procurava antes. Essa não tem maçaneta, não tem moldura.", pauseAfter: 1100, inflection: ['thoughtful'] },
  { text: "Tem só uma fresta de luz por baixo.", pauseAfter: 900 },
],

INFERNO_Q1B_PERGUNTA: [
  { text: "Você atravessa essa fresta — ou volta pra coisa no chão, que ainda pulsa atrás de você?" },
],

INFERNO_Q1B_RESPOSTA_A: [  // Atravessar a fresta
  { text: "Você vai.", pauseAfter: 900 },
  { text: "Do outro lado, não tem ameaça. Não tem nada. E descobrir que a coragem também serve pra atravessar o vazio é uma das aprendizagens mais difíceis.", pauseAfter: 1100, inflection: ['serious'] },
],

INFERNO_Q1B_RESPOSTA_B: [  // Voltar pra coisa no chão
  { text: "Você volta.", pauseAfter: 800 },
  { text: "Quem é destemido escolhe seus medos como se escolhe um interlocutor. Voltar pro que pulsa não é recuo — é reconhecimento.", pauseAfter: 1000, inflection: ['warm'] },
],

FALLBACK_Q1B: [
  { text: "Eu não ouvi. Atravessar a fresta — ou voltar pro que pulsa?" },
],

TIMEOUT_Q1B: [
  { text: "Você hesita. Vou escolher por você." },
],
```

**Inflection tags:** Only `thoughtful`, `serious`, `warm` used (verified working with voice ID `PznTnBc8X6pvixs9UkQm`).

**QUESTION_META entry:**

```typescript
// From blueprint (lines 48-56):
9: {
  questionContext: 'Visitante destemido encontra uma porta sem maçaneta com fresta de luz, escolhendo entre atravessar o vazio ou voltar pra coisa pulsante atras dele',
  optionA: 'Atravessar',
  optionB: 'Voltar',
  keywordsA: ['atravessar', 'atravesso', 'passar', 'ir', 'fresta', 'luz', 'sim', 'porta', 'frente'],
  keywordsB: ['voltar', 'volto', 'coisa', 'recuar', 'nao', 'atras', 'pulsar', 'reconhecer'],
  defaultOnTimeout: 'A',
},
```

### Anti-Patterns to Avoid

- **Don't mutate existing state transitions:** Q1B must be ADDITIVE only — existing Q2_RESPOSTA_B transition to PURGATORIO becomes a guarded array
- **Don't forget roteiro.html:** User explicitly notes it must stay in sync with script.ts (client reviews this file)
- **Don't change OracleExperience helper function signatures:** Extensions are internal additions, not refactors
- **Don't skip validate-timing.ts update:** Currently validates 4 paths, must expand to 8 paths with Q1B permutations

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timing validation for new branch permutations | Custom duration calculator | Extend existing `scripts/validate-timing.ts` with Q1B paths | Script already handles branch-aware path enumeration, just add Q1B to the combinatorics |
| MP3 generation for new script keys | Manual ElevenLabs API calls | Run `scripts/generate-audio-v3.ts` (imports from script.ts) | Script auto-detects new keys, applies correct voice settings per phase, handles inflection tags |
| Test helpers for Q1B path | New test utilities | Extend existing `advanceToQ2Aguardando` pattern in `oracleMachine.test.ts` | Established pattern for navigating to branch points, just add Q1B variant |

**Key insight:** v4.0 infrastructure already handles variable-length choice arrays (6-8 decisions), conditional guards, and branch-aware timing. This phase is purely additive — no architecture changes needed.

## Common Pitfalls

### Pitfall 1: Forgetting to Update All 6 OracleExperience Helpers

**What goes wrong:** New Q1B states work in the machine, but UI breaks because `getScriptKey()` returns `null` for Q1B states, or mic doesn't activate because `isAguardando` doesn't include `Q1B_AGUARDANDO`.

**Why it happens:** OracleExperience.tsx has 6 separate helper functions that all need Q1B entries. Easy to update 3-4 and miss the others.

**How to avoid:** Checklist approach. After adding Q1B states to machine, grep for "Q2B" in OracleExperience.tsx and add Q1B equivalent for every match.

**Warning signs:**
- Browser console error: "No script key for state INFERNO.Q1B_SETUP"
- Mic doesn't activate during Q1B question
- Breathing delay missing (immediate transition feels rushed)

### Pitfall 2: ChoiceMap Type Extension Breaking Existing Archetypes

**What goes wrong:** Adding `q1b?` field to ChoiceMap causes TypeScript errors in archetype guards (patternMatching.ts) or breaks existing v4.0 tests.

**Why it happens:** Fear that extending the type will require updating all 8 archetype guard functions.

**How to avoid:** `ChoiceMap` is already `Partial<Record<QuestionId, ChoiceAB>>`. Adding `'q1b' | 'q5b' | 'q6b'` to the `QuestionId` union makes these fields automatically optional. No archetype guards reference them — they only use base questions (q1-q6) and existing branches (q2b, q4b).

**Proof:** Existing archetype guards in `src/machines/guards/patternMatching.ts` only check `context.choices[]` array (percentage-based thresholds) — they don't access `choiceMap` at all. The `choiceMap` is used by branch guards (`shouldBranchQ2B`, `shouldBranchQ4B`, `shouldBranchQ1B`) only.

**Warning signs:**
- TypeScript error in patternMatching.ts after QuestionId extension → You accidentally touched archetype guard code (don't)
- Existing v4.0 tests fail after type change → ChoiceMap initial state wasn't backward-compatible (verify `INITIAL_CONTEXT_V4` still works)

### Pitfall 3: Timing Validation Not Updated for Q1B Permutations

**What goes wrong:** Phase ships, but max-path duration is unknown. Might accidentally exceed 7:30 budget without realizing.

**Why it happens:** `scripts/validate-timing.ts` currently validates 4 paths (no branches, Q2B only, Q4B only, both). Adding Q1B doubles the permutations to 8, but script doesn't auto-detect new branches.

**How to avoid:** Update the permutation enumeration logic in validate-timing.ts. Current structure:

```typescript
// Existing (4 paths):
const paths = [
  { name: '6Q (no branches)', choices: [q1, q2, q3, q4, q5, q6] },
  { name: '7Q (Q2B only)', choices: [q1, q2, q2b, q3, q4, q5, q6] },
  { name: '7Q (Q4B only)', choices: [q1, q2, q3, q4, q4b, q5, q6] },
  { name: '8Q (Q2B + Q4B)', choices: [q1, q2, q2b, q3, q4, q4b, q5, q6] },
];

// After Q1B (8 paths — add Q1B variants):
const paths = [
  // No branches
  { name: '6Q (no branches)', choices: [...] },
  // Single branch
  { name: '7Q (Q1B only)', choices: [q1, q2, q1b, q3, q4, q5, q6] },
  { name: '7Q (Q2B only)', choices: [q1, q2, q2b, q3, q4, q5, q6] },
  { name: '7Q (Q4B only)', choices: [q1, q2, q3, q4, q4b, q5, q6] },
  // Double branches
  { name: '8Q (Q1B + Q4B)', choices: [q1, q2, q1b, q3, q4, q4b, q5, q6] },
  { name: '8Q (Q2B + Q4B)', choices: [q1, q2, q2b, q3, q4, q4b, q5, q6] },
  // Triple branch (Q1B and Q2B are mutually exclusive — can't both trigger)
  // Max path is Q1B + Q4B (both Bs in Inferno, both As in Purgatorio)
];
```

**Note:** Q1B and Q2B are mutually exclusive (Q1B needs `q1=B, q2=B`, Q2B needs `q1=A, q2=A`). Max permutations = 8, not 16.

**Warning signs:**
- Script passes but only reports 4 paths → Not updated
- Max-path reported is same as v4.0 (5:57) → Q1B duration not included

### Pitfall 4: public/roteiro.html Not Updated

**What goes wrong:** Client reviews roteiro.html and sees it's missing the new Q1B branch. Erodes trust in deliverable completeness.

**Why it happens:** Roteiro update feels like "nice to have" documentation, not critical path.

**How to avoid:** Treat roteiro.html as source of truth for client communication. User memory explicitly notes: "When updating script.ts content: also update public/roteiro.html (client-facing) to keep them in sync. Roteiro is what client reviews — must match what plays."

**Steps:**
1. Add Q1B narrative text to the HTML (mirror script.ts structure)
2. Update Mermaid flowchart to show Q1B branch from Q2_RESPOSTA_B → Q1B → PURGATORIO
3. Test the HTML file renders correctly in browser

**Warning signs:**
- Roteiro.html last-modified date is before Phase 31 completion
- Mermaid diagram still shows only Q2B and Q4B branches

## Code Examples

Verified patterns from v4.0 baseline:

### Adding a Guard and Branch States

```typescript
// Source: src/machines/oracleMachine.ts (Q2B existing pattern)

// 1. Guard definition (setup block)
guards: {
  shouldBranchQ2B: ({ context }) => context.choiceMap.q1 === 'A' && context.choiceMap.q2 === 'A',
  shouldBranchQ4B: ({ context }) => context.choiceMap.q3 === 'A' && context.choiceMap.q4 === 'A',
  // Add Q1B:
  shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B',
}

// 2. Modify Q2_RESPOSTA_B to conditionally branch
Q2_RESPOSTA_B: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q1B_SETUP', guard: 'shouldBranchQ1B' },  // New conditional
      { target: '#oracle.PURGATORIO' },                    // Existing fallback
    ],
  },
},

// 3. Add Q1B states (4 total: SETUP, PERGUNTA, AGUARDANDO, TIMEOUT + 2 RESPOSTAs)
Q1B_SETUP: {
  on: { NARRATIVA_DONE: 'Q1B_PERGUNTA' },
},
Q1B_PERGUNTA: {
  on: { NARRATIVA_DONE: 'Q1B_AGUARDANDO' },
},
Q1B_AGUARDANDO: {
  after: {
    25000: {
      target: 'Q1B_TIMEOUT',
      actions: assign(recordChoice('q1b', 'A')),  // Default on timeout
    },
  },
  on: {
    CHOICE_A: {
      target: 'Q1B_RESPOSTA_A',
      actions: assign(recordChoice('q1b', 'A')),
    },
    CHOICE_B: {
      target: 'Q1B_RESPOSTA_B',
      actions: assign(recordChoice('q1b', 'B')),
    },
  },
},
Q1B_TIMEOUT: {
  on: { NARRATIVA_DONE: 'Q1B_RESPOSTA_A' },
},
Q1B_RESPOSTA_A: {
  on: { NARRATIVA_DONE: '#oracle.PURGATORIO' },
},
Q1B_RESPOSTA_B: {
  on: { NARRATIVA_DONE: '#oracle.PURGATORIO' },
},
```

### Extending ChoiceMap Type (POL-02)

```typescript
// Source: src/machines/oracleMachine.types.ts (current v4.0 types)

// BEFORE (v4.0):
export type QuestionId = 'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6';

export interface OracleContextV4 {
  sessionId: string;
  choices: ChoicePattern;
  choiceMap: Partial<Record<QuestionId, ChoiceAB>>;  // Already Partial — optional fields
  fallbackCount: number;
  currentPhase: NarrativePhase;
}

// AFTER (v6.0 Phase 31):
export type QuestionId = 'q1' | 'q2' | 'q2b' | 'q3' | 'q4' | 'q4b' | 'q5' | 'q6' | 'q1b' | 'q5b' | 'q6b';
// ChoiceMap automatically includes optional q1b, q5b, q6b fields
// No other changes needed — backward compatible
```

**Impact:** Zero breaking changes. Existing guards and tests continue to work because `Partial<>` makes all fields optional.

### Test Pattern for New Branch

```typescript
// Source: src/machines/oracleMachine.test.ts (Q2B test pattern)

describe('Q1B Conditional Branch', () => {
  it('triggers Q1B when q1=B AND q2=B', () => {
    const actor = createActor(oracleMachine);
    actor.start();

    // Advance to Q2_AGUARDANDO
    actor.send({ type: 'START' });
    actor.send({ type: 'NARRATIVA_DONE' }); // APRESENTACAO
    actor.send({ type: 'NARRATIVA_DONE' }); // INFERNO.INTRO
    actor.send({ type: 'NARRATIVA_DONE' }); // Q1_SETUP
    actor.send({ type: 'NARRATIVA_DONE' }); // Q1_PERGUNTA
    actor.send({ type: 'NARRATIVA_DONE' }); // Q1_AGUARDANDO

    // Choose B for Q1 (left the room)
    actor.send({ type: 'CHOICE_B' });
    actor.send({ type: 'NARRATIVA_DONE' }); // Q1_RESPOSTA_B
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2_SETUP
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2_PERGUNTA
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2_AGUARDANDO

    // Choose B for Q2 (stayed staring at the thing)
    actor.send({ type: 'CHOICE_B' });
    actor.send({ type: 'NARRATIVA_DONE' }); // Q2_RESPOSTA_B

    // Should transition to Q1B_SETUP (not PURGATORIO)
    expect(actor.getSnapshot().matches({ INFERNO: 'Q1B_SETUP' })).toBe(true);

    // Verify choiceMap
    expect(actor.getSnapshot().context.choiceMap.q1).toBe('B');
    expect(actor.getSnapshot().context.choiceMap.q2).toBe('B');
  });

  it('skips Q1B when guard condition not met', () => {
    const actor = createActor(oracleMachine);
    actor.start();

    // Advance to Q2_AGUARDANDO with q1=A (stayed in room)
    // ... (similar setup)
    actor.send({ type: 'CHOICE_A' }); // Q1=A
    actor.send({ type: 'NARRATIVA_DONE' });
    actor.send({ type: 'NARRATIVA_DONE' });
    actor.send({ type: 'NARRATIVA_DONE' });
    actor.send({ type: 'NARRATIVA_DONE' });

    actor.send({ type: 'CHOICE_B' }); // Q2=B
    actor.send({ type: 'NARRATIVA_DONE' });

    // Should skip Q1B and go directly to PURGATORIO (guard fails: q1=A)
    expect(actor.getSnapshot().matches('PURGATORIO')).toBe(true);
  });
});
```

## Environment Availability

**SKIPPED** — Phase 31 has no external dependencies beyond those already verified in v4.0 baseline. All required tools are confirmed present:

- Node.js (for tsx script runner)
- TypeScript compiler
- Vitest test framework
- ElevenLabs API access (ELEVENLABS_API_KEY in .env.local)

No new environment setup required.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (latest) + @testing-library/react |
| Config file | `vitest.config.ts` (existing) |
| Quick run command | `npm test -- src/machines/oracleMachine.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BR-01 | Guard `shouldBranchQ1B` returns true when q1=B && q2=B | unit | `npm test -- src/machines/oracleMachine.test.ts -t "Q1B"` | ✅ (extend existing) |
| BR-01 | Q1B states transition correctly (SETUP→PERGUNTA→AGUARDANDO→RESPOSTA) | integration | `npm test -- src/machines/oracleMachine.test.ts -t "Q1B path"` | ✅ (extend existing) |
| BR-01 | OracleExperience maps Q1B states to correct script keys | integration | `npm test -- src/components/experience/OracleExperience.test.tsx -t "Q1B"` | ❌ Wave 0 (create) |
| BR-01 | Timing validation includes Q1B permutations (8 paths total) | script | `npm test -- scripts/validate-timing.test.ts` | ❌ Wave 0 (create) |
| POL-02 | ChoiceMap extension doesn't break existing archetype guards | regression | `npm test -- src/machines/guards/__tests__/patternMatching.test.ts` | ✅ (existing suite) |
| POL-02 | Existing v4.0 tests pass after QuestionId extension | regression | `npm test` | ✅ (full suite) |

### Sampling Rate

- **Per task commit:** `npm test -- src/machines/oracleMachine.test.ts` (machine tests only, ~20s)
- **Per wave merge:** `npm test` (full suite, 496 tests, ~45s)
- **Phase gate:** Full suite green + manual browser check (Q1B path plays correct audio) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/experience/__tests__/OracleExperience-Q1B.test.tsx` — covers BR-01 helper function extensions
- [ ] `scripts/__tests__/validate-timing.test.ts` — covers BR-01 timing validation with 8 paths

*(If no gaps: existing test files `oracleMachine.test.ts` and `patternMatching.test.ts` cover most requirements — only 2 new test files needed)*

## Sources

### Primary (HIGH confidence)

- `src/machines/oracleMachine.ts` (v4.0 baseline) — Q2B/Q4B guard and state pattern
- `src/machines/oracleMachine.types.ts` (v4.0 baseline) — QuestionId union, ChoiceMap type, recordChoice helper
- `src/components/experience/OracleExperience.tsx` (v4.0 baseline) — 6 helper functions to extend
- `src/data/script.ts` (v4.0 baseline) — 61 existing keys, Q2B/Q4B script structure
- `src/types/index.ts` (v4.0 baseline) — QUESTION_META map, 8 existing entries
- `scripts/generate-audio-v3.ts` (v4.0 baseline) — MP3 generation script (auto-imports from script.ts)
- `scripts/validate-timing.ts` (v4.0 baseline) — 4-path timing validation logic
- `memory/next-milestone-v5-deep-branching.md` — Complete Q1B script text, QUESTION_META, machine spec (blueprint authority)
- `.planning/REQUIREMENTS.md` — BR-01 and POL-02 requirement specs
- `CLAUDE.md` — "Add a new question/branch" recipe (lines 92-97)

### Secondary (MEDIUM confidence)

- User memory notes — Patterns learned (inflection tags, script sync, timing validation)

### Tertiary (LOW confidence)

None — all research findings verified against codebase or milestone blueprint.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All dependencies verified in v4.0 (496 tests passing)
- Architecture: HIGH — Q2B/Q4B pattern established and proven
- Pitfalls: HIGH — Common mistakes documented from v4.0 experience
- Script content: HIGH — Fully specified in milestone blueprint (verified PT-BR quality)
- Timing impact: MEDIUM — Blueprint estimates ~30-45s per branch, actual MP3 duration will be measured after generation

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (30 days — stable domain, no fast-moving dependencies)
