---
phase: 16-script-writing
plan: 01
subsystem: narrative
tags: [pt-br, creative-writing, elevenlabs-v3, inflection-tags, psychoanalysis, speech-segments]

# Dependency graph
requires:
  - phase: 13-elevenlabs-v3
    provides: "ElevenLabs v3 inflection tag format and SpeechSegment interface"
provides:
  - "ScriptDataV3 interface with all 47 keys for v3 narrative"
  - "APRESENTACAO (7 segments) — Oracle introduction and game contract"
  - "INFERNO realm — Q1 Comfortable Prison (Light) + Q2 Thing on Floor (Medium)"
  - "PURGATORIO realm — Q3 Garden That Will Burn (Medium) + Q4 Two Waters (Deep)"
  - "Empty stubs for Plan 02 content (PARAISO, devoluções, encerramento, fallbacks, timeouts)"
affects: [16-02-PLAN, 17-state-machine, 18-components, 19-audio]

# Tech tracking
tech-stack:
  added: []
  patterns: ["ScriptDataV3 interface replaces ScriptData for v3 narrative structure"]

key-files:
  created:
    - "src/data/__tests__/script-v3.test.ts"
  modified:
    - "src/data/script.ts"

key-decisions:
  - "ScriptDataV3 exports both interface and SCRIPT const for consumption by state machine and TTS"
  - "Inflection tags sparse: max 2-3 per section, max 1 per SpeechSegment, using ElevenLabs v3 format"
  - "pauseAfter values range 1200-2500ms normal, 2500ms+ for dramatic moments, 0/undefined for section finals"
  - "PERGUNTA segments have no pauseAfter (system waits for voice input)"
  - "Psychoanalytic phrases absorbed into metaphor without any author attribution"

patterns-established:
  - "Choice structure pattern: SETUP (2-4 segments) + PERGUNTA (1 segment) + RESPOSTA_A (3-5 segments) + RESPOSTA_B (3-5 segments)"
  - "Escalation curve: Light (Q1) -> Medium (Q2, Q3) -> Deep (Q4) visible in vocabulary weight and existential depth"
  - "Oracle voice: second person, short punchy sentences, game-like, knows its limits"

requirements-completed: [SCRV3-01, SCRV3-03]

# Metrics
duration: 6min
completed: 2026-03-27
---

# Phase 16 Plan 01: Script Writing (First Half) Summary

**ScriptDataV3 with 4 complete choice scenarios in PT-BR: Comfortable Prison, Thing on Floor, Garden That Will Burn, Two Waters -- zero author references, sparse ElevenLabs v3 inflection tags, depth escalation from Light to Deep**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-27T23:16:02Z
- **Completed:** 2026-03-27T23:22:46Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- ScriptDataV3 interface with all 47 keys defined, replacing old ScriptData
- APRESENTACAO (7 segments): Oracle self-awareness, game contract, "Vamos" closing
- INFERNO realm: Q1 Comfortable Prison (Light, comfort vs freedom) + Q2 Thing on the Floor (Medium, disgust vs presence)
- PURGATORIO realm: Q3 Garden That Will Burn (Medium, attachment vs protection) + Q4 Two Waters (Deep, memory vs erasure)
- 51 tests passing covering structure, PT-BR content, no author references, inflection tag rules
- Stubs (empty arrays) for all Plan 02 content ready to fill

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): Failing tests for ScriptDataV3** - `0721100` (test)
2. **Task 1 (TDD GREEN): ScriptDataV3 + APRESENTACAO + INFERNO Q1+Q2** - `5147638` (feat)
3. **Task 2: PURGATORIO realm Q3+Q4** - `85ed145` (feat)

## Files Created/Modified
- `src/data/script.ts` - Complete v3 script with ScriptDataV3 interface, APRESENTACAO, INFERNO (Q1, Q2), PURGATORIO (Q3, Q4), and stubs for Plan 02
- `src/data/__tests__/script-v3.test.ts` - 51 tests validating structure, content, formatting rules, author reference checks, inflection tag sparsity

## Decisions Made
- Used FINAL.ts as voice reference for Oracle tone (calm, knowing, slightly ironic, second person)
- Absorbed psychoanalyst gold phrases into metaphor without attribution: "seguranca comprada com soberania", "dor atravessada transforma", "luto antecipado"
- Kept inflection tags deliberately sparse (2-3 per section) to avoid ElevenLabs v3 voice instability
- Q4 Two Waters is the deepest PURGATORIO choice -- existential weight on memory/erasure with sensory river imagery

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

The following empty arrays are intentional Plan 02 stubs:

| Key | File | Reason |
|-----|------|--------|
| PARAISO_INTRO, Q5_*, Q6_* | src/data/script.ts | Plan 16-02 will fill PARAISO realm |
| DEVOLUCAO_* (8 keys) | src/data/script.ts | Plan 16-02 will write pattern-based devoluções |
| ENCERRAMENTO | src/data/script.ts | Plan 16-02 will write closing |
| FALLBACK_Q1-Q6 | src/data/script.ts | Plan 16-02 will write per-question fallbacks |
| TIMEOUT_Q1-Q6 | src/data/script.ts | Plan 16-02 will write per-question timeouts |

These stubs are tracked and will be completed in Plan 16-02.

## Issues Encountered

- Pre-existing TypeScript errors in `src/__tests__/flow-sequencing.test.ts` (references old v2 key names like `INFERNO_NARRATIVA`) -- these are out of scope, will be resolved in Phase 17 (state machine redesign)
- `npx tsc --noEmit src/data/script.ts` fails due to path alias `@/types` not resolved in standalone mode -- used project-level `npx tsc --noEmit` which resolves aliases correctly and confirms zero errors in script.ts

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 16-02 can fill PARAISO, devoluções, encerramento, fallbacks, and timeouts
- Script structure is typed and tested -- adding content just fills empty arrays
- Voice tone and escalation pattern established for Plan 02 to maintain consistency

## Self-Check: PASSED

- All files exist (src/data/script.ts, src/data/__tests__/script-v3.test.ts, 16-01-SUMMARY.md)
- All commits verified (0721100, 5147638, 85ed145)
- 51 tests passing
- TypeScript compiles clean (script.ts)

---
*Phase: 16-script-writing*
*Completed: 2026-03-27*
