---
phase: 22-core-narrative-rewrite
plan: 02
subsystem: narrative
tags: [script, purgatorio, psychoanalytic-depth, lacanian, bionian, winnicottian, gold-phrases]

# Dependency graph
requires:
  - phase: 21-script-audit-framework-integration
    provides: "Framework analysis with depth ratings + gold phrase mapping + per-section rewrite recommendations"
  - phase: 22-core-narrative-rewrite plan 01
    provides: "INFERNO deepened (Q1 depth 4, Q2 depth 4.5) + APRESENTACAO gold phrases integrated"
provides:
  - "PURGATORIO_INTRO at depth 4 with gold phrase #9 metabolized and softer Oracle voice"
  - "PURGATORIO_Q3_RESPOSTA_A at depth 4 with Lacanian objet a"
  - "PURGATORIO_Q3_RESPOSTA_B at depth 4 with Bionian container failure"
  - "PURGATORIO_Q4_SETUP expanded from 3 to 5 segments with Lacanian memory-as-retroactive-construction"
  - "PURGATORIO_Q4_RESPOSTA_A at depth 5 with Lacanian identity-as-fantasy + Bionian metabolization"
  - "PURGATORIO_Q4_RESPOSTA_B at depth 5 with Winnicottian specificity (spontaneous gestures lost)"
  - "Q3-Q4 escalation gap FIXED"
affects: [22-core-narrative-rewrite plan 03, 23-devolucoes-bookends, 24-rhythm-inflection-validation]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Gold phrase absorption: metabolize into Oracle voice rather than quote"]

key-files:
  created: []
  modified:
    - "src/data/script.ts"

key-decisions:
  - "Gold phrase #9 metabolized as 'o que queimou la embaixo virou luz aqui' rather than literal 'sofrimento metabolizado nasce luz simbolica'"
  - "PURGATORIO Oracle voice differentiated from INFERNO: 'Voce sente?' (invitation) vs 'Descemos' (command)"
  - "Q4_SETUP expanded from 3 to 5 segments to fix Q3-Q4 escalation flattening identified in audit"
  - "Q4_RESPOSTA_B uses concrete sensory moments (cheiro, riso, gosto) for Winnicottian specificity instead of abstract 'levou o carinho junto'"

patterns-established:
  - "Escalation fix pattern: expand setup sections to let visitor FEEL weight before choosing"
  - "Framework layering: same segment can carry Lacanian structure + Bionian image + Winnicottian recognition"

requirements-completed: [SCR-01, SCR-02, SCR-03, SCR-05, SCR-08]

# Metrics
duration: 3min
completed: 2026-03-28
---

# Phase 22 Plan 02: PURGATORIO Realm Rewrite Summary

**PURGATORIO deepened from avg depth 3 to 4.5 -- Q3 raised to depth 4 (Lacanian objet a, Bionian container failure) and Q4 raised to depth 5 (all 3 frameworks integrated: memory-as-desire, metabolization, Winnicottian specificity) with Q3-Q4 escalation gap fixed**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-28T11:24:50Z
- **Completed:** 2026-03-28T11:27:55Z
- **Tasks:** 2/2
- **Files modified:** 1

## Accomplishments

- PURGATORIO_INTRO raised from depth 3 to 4: gold phrase #9 ("sofrimento metabolizado = luz simbolica") absorbed as "o que queimou la embaixo virou luz aqui", Oracle voice softened with "Voce sente?" invitation
- Q3 responses raised from depth 3 to 4: RESPOSTA_A gains Lacanian objet a ("nunca vai ser seu"), RESPOSTA_B gains Bionian container failure ("O que nunca foi recebido nao vira memoria. Vira ausencia.")
- Q4 raised from depth 3 to 5 (deepest PURGATORIO moment): SETUP expanded 3->5 segments with Lacanian memory-as-retroactive-construction, RESPOSTA_A adds identity-as-fantasy + Bionian metabolization image, RESPOSTA_B adds Winnicottian specificity (concrete sensory moments lost in evacuation)
- Q3->Q4 escalation flattening (identified as MAJOR GAP in audit) now FIXED -- Q4 setup carries significantly more weight

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite PURGATORIO_INTRO and Q3 responses** - `13563a0` (feat)
2. **Task 2: Deepen Q4 Two Waters to depth 5** - `628db46` (feat)

## Files Created/Modified

- `src/data/script.ts` - PURGATORIO realm sections rewritten (INTRO, Q3_RESPOSTA_A, Q3_RESPOSTA_B, Q4_SETUP, Q4_RESPOSTA_A, Q4_RESPOSTA_B)

## Decisions Made

- Gold phrase #9 metabolized into Oracle voice ("virou luz aqui") rather than quoted literally -- consistent with v3.1 "felt not declared" principle
- PURGATORIO Oracle voice uses "Voce sente?" (invitation) and "Estamos subindo" (shared journey) vs INFERNO's "Descemos" (command) -- creates structural parallel with softer tone
- Q4_SETUP expanded from 3 to 5 segments per audit recommendation -- visitor now FEELS what each water carries before choosing
- Q4_RESPOSTA_B's Winnicottian specificity uses concrete sensory moments ("cheiro de quem partiu, som do riso que ninguem mais lembra, gosto da ultima vez") instead of abstract "levou o carinho junto"
- Q4_RESPOSTA_A separates gold phrase #2 ("dor atravessada transforma") into its own segment for breathing room and impact

## Deviations from Plan

None - plan executed exactly as written.

## Preserved Anchor Lines (Verification)

All DO NOT TOUCH lines verified intact:
- "ferida diferente -- nao de perda, mas de presenca" (Q3_RESPOSTA_A)
- "luto que chega antes da hora" (Q3_RESPOSTA_B)
- "A dor atravessada transforma. A dor recusada so muda de endereco." (Q4_RESPOSTA_A - gold phrase #2)
- "agua que apaga nao escolhe o que leva" (Q4_RESPOSTA_B)
- "sentido apareca sozinho" (PURGATORIO_INTRO - gold phrase #8)

## Gold Phrases Status

| # | Phrase | Status After This Plan |
|---|--------|----------------------|
| 2 | "dor atravessada transforma" | PRESERVED in Q4_RESPOSTA_A |
| 8 | "sentido apareca sozinho" | PRESERVED in PURGATORIO_INTRO |
| 9 | "sofrimento metabolizado = luz simbolica" | NOW ABSORBED in PURGATORIO_INTRO as "virou luz aqui" |

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PURGATORIO realm complete at avg depth 4.5 (INTRO=4, Q3=4, Q4=5)
- Ready for Plan 03: PARAISO realm rewrite (Q5 Unanswerable + Q6 End of Game to depth 5)
- All TypeScript compilation clean -- no new errors introduced

## Self-Check: PASSED

- SUMMARY file: FOUND
- Commit 13563a0 (Task 1): FOUND
- Commit 628db46 (Task 2): FOUND
- src/data/script.ts: FOUND

---
*Phase: 22-core-narrative-rewrite*
*Completed: 2026-03-28*
