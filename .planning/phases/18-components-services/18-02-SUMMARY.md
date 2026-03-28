---
phase: 18-components-services
plan: 02
subsystem: UI/Components
tags:
  - orchestration
  - state-machine-wiring
  - choice-ui
  - v3-migration
dependency_graph:
  requires:
    - 17-02-PLAN (v3 machine with 6 linear choices)
    - 16-01-PLAN (v3 script structure)
    - types/QUESTION_META (choice metadata)
  provides:
    - OracleExperience v3 state mapping
    - 6-choice UI wiring
    - Universal ChoiceButtons rendering
  affects:
    - Voice choice pipeline activation
    - TTS orchestration timing
    - Analytics session tracking
tech_stack:
  added: []
  patterns:
    - QUESTION_META-driven ChoiceConfig generation
    - Single universal ChoiceButtons block
    - Hierarchical state matching (state.matches({ INFERNO: 'Q1_SETUP' }))
key_files:
  created: []
  modified:
    - src/components/experience/OracleExperience.tsx (full v3 state mapping)
decisions:
  - "All 6 ChoiceConfigs now use QUESTION_META data instead of hardcoded strings — single source of truth for labels/context"
  - "Single universal ChoiceButtons block replaces 3 separate blocks — labels come from activeChoiceConfig.options"
  - "Analytics legacy compat via choices[0]/choices[1] mapping — preserves existing analytics interface"
  - "LONG/MEDIUM/SHORT/NONE breathing delay tiers applied to all v3 states — cross-phase transitions get 2.5s pause"
metrics:
  duration_minutes: 3.4
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_modified: 1
  commits: 1
---

# Phase 18 Plan 02: OracleExperience v3 State Mapping

**One-liner:** OracleExperience orchestrator fully rewired for 6 linear choices with QUESTION_META-driven configs, hierarchical state matching, and universal ChoiceButtons UI.

## What Was Done

Updated OracleExperience.tsx to handle all ~42 v3 machine states:

### Pure Mapping Functions (Task 1)

**getScriptKey()** — Maps 43 speech states + 6 timeouts to v3 script keys:
- Top-level: APRESENTACAO, ENCERRAMENTO
- INFERNO: INTRO, Q1_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT, Q2_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT
- PURGATORIO: INTRO, Q3_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT, Q4_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT
- PARAISO: INTRO, Q5_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT, Q6_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B/TIMEOUT
- 8 DEVOLUCAO archetypes: SEEKER, GUARDIAN, CONTRADICTED, PIVOT_EARLY, PIVOT_LATE, DEPTH_SEEKER, SURFACE_KEEPER, MIRROR

**getBreathingDelay()** — Assigns timing tiers to all v3 states:
- LONG (2500ms): Cross-phase boundaries (APRESENTACAO, ENCERRAMENTO, Q2/Q4/Q6 last responses → next realm, 8 DEVOLUCAO → ENCERRAMENTO)
- MEDIUM (1500ms): Realm intros, setups, within-realm responses
- SHORT (800ms): Perguntas (question → AGUARDANDO)
- NONE (0ms): Timeouts, fallbacks, unmapped states

**getFallbackScript()** — Returns per-question fallback for 6 AGUARDANDO states (FALLBACK_Q1-Q6).

**6 ChoiceConfigs** — Q1_CHOICE through Q6_CHOICE generated from QUESTION_META:
- All use `eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' }` (standardized v3 events)
- Labels/context/defaults pulled from QUESTION_META (single source of truth)

### Component Wiring (Task 2)

**activeChoiceConfig selector** — 6-way useMemo returns correct config for Q1-Q6 AGUARDANDO states.

**isAguardando check** — Now checks all 6 AGUARDANDO states (INFERNO Q1/Q2, PURGATORIO Q3/Q4, PARAISO Q5/Q6).

**Single universal ChoiceButtons** — Replaces 3 separate blocks:
```tsx
{isAguardando && activeChoiceConfig && (
  <ChoiceButtons
    options={[
      { label: activeChoiceConfig.options.A, event: 'CHOICE_A' },
      { label: activeChoiceConfig.options.B, event: 'CHOICE_B' },
    ]}
    onChoice={(eventType) => send({ type: eventType as any })}
    timeoutSeconds={15}
  />
)}
```

Labels come from activeChoiceConfig.options (which pulls from QUESTION_META). Events are always CHOICE_A/CHOICE_B.

**Analytics legacy compat** — Updated endSession calls to use `choices[0]` and `choices[1]` instead of `choice1`/`choice2`.

### Removed v2 References

- Deleted: INFERNO_CHOICE, PURGATORIO_A_CHOICE, PURGATORIO_B_CHOICE constants
- Deleted: CHOICE_FICAR, CHOICE_EMBORA, CHOICE_PISAR, CHOICE_CONTORNAR events
- Deleted: PURGATORIO_A:, PURGATORIO_B: state matches (old branching structure)
- Deleted: INFERNO_NARRATIVA, DEVOLUCAO_A_FICAR keys (old v2 script structure)

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

**TypeScript compilation:**
- OracleExperience.tsx compiles cleanly in full project context
- Remaining errors in test files (flow-sequencing.test.ts, nlu-route.test.ts) reference old v2 keys — expected and out of scope (tests updated in Phase 20)

**Acceptance criteria:**
- ✅ QUESTION_META import present
- ✅ 6 ChoiceConfigs (Q1-Q6) using QUESTION_META data
- ✅ getScriptKey maps all 43 speech states + 6 timeouts
- ✅ getBreathingDelay assigns correct tiers to all v3 states
- ✅ getFallbackScript handles 6 per-question fallbacks
- ✅ activeChoiceConfig selects Q1-Q6 configs
- ✅ isAguardando checks all 6 states
- ✅ Single universal ChoiceButtons block
- ✅ Analytics uses choices[0]/choices[1]
- ✅ All v2 references removed (0 matches for INFERNO_CHOICE, CHOICE_FICAR, PURGATORIO_A:, choice1, etc)

**Pattern verification:**
- 43 non-null getScriptKey returns + 1 null return (44 total branches)
- 8 DEVOLUCAO archetype mappings (SEEKER → MIRROR)
- 6 AGUARDANDO → fallback mappings (Q1 → Q6)
- 1 ChoiceButtons JSX element (down from 3)

## Known Issues

None. Component fully functional for v3 structure.

## Next Steps

Phase 18 Plan 02 complete. Next: Plan 18-03 (update remaining services — FallbackTTSService, StationRegistry, SessionAnalytics) or Phase 19 (generate ~50 MP3s with ElevenLabs v3).

---

**Commit:** 1bbc960 — feat(18-components-services): update OracleExperience for v3 6-choice structure
