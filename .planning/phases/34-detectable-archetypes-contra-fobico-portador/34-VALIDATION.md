---
phase: 34
slug: detectable-archetypes-contra-fobico-portador
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 34 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Sourced from `34-RESEARCH.md` §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.1.8 + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test src/machines/guards/__tests__/patternMatching.test.ts src/machines/oracleMachine.test.ts src/components/experience/__tests__/OracleExperience-helpers.test.ts -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~25 seconds (quick), ~75 seconds (full) |

---

## Sampling Rate

- **After every task commit:** Run quick run command (guard + machine + helpers suites)
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green (698 → 712 expected, 16 known failures unchanged)
- **Max feedback latency:** ~25 seconds (quick), ~75 seconds (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 34-01-* | 01 | 1 | AR-02, AR-03 | type-check | `npx tsc --noEmit` | ✅ existing | ⬜ pending |
| 34-01-* | 01 | 1 | AR-02, AR-03 | unit (script keys) | `npm test src/data/__tests__ -- --run` | ✅ existing | ⬜ pending |
| 34-02-* | 02 | 2 | AR-02 | unit (guard) | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "isContraFobico" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-03 | unit (guard) | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "isPortador" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-02 | integration (priority) | `npm test src/machines/oracleMachine.test.ts -t "CONTRA_FOBICO wins" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-03 | integration (priority) | `npm test src/machines/oracleMachine.test.ts -t "PORTADOR wins" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-02, AR-03 | integration (mutual) | `npm test src/machines/oracleMachine.test.ts -t "CONTRA_FOBICO wins over PORTADOR" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-01 (regression) | integration (ESPELHO trumps) | `npm test src/machines/oracleMachine.test.ts -t "ESPELHO_SILENCIOSO wins over CONTRA_FOBICO" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-02 | unit (helper) | `npm test src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "DEVOLUCAO_CONTRA_FOBICO" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | AR-03 | unit (helper) | `npm test src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "DEVOLUCAO_PORTADOR" -- --run` | ❌ Wave 2 creates | ⬜ pending |
| 34-02-* | 02 | 2 | POL-02 (deeper) | regression | `npm test src/machines/guards/__tests__/patternMatching.test.ts -t "determineArchetype" -- --run` | ✅ 59 existing | ⬜ pending |
| 34-03-* | 03 | 3 | AR-02, AR-03 | file existence | `test -f public/audio/oracle/devolucao_contra_fobico.mp3 && test -f public/audio/oracle/devolucao_portador.mp3` | ❌ Wave 3 creates | ⬜ pending |
| 34-03-* | 03 | 3 | AR-02, AR-03 | timing | `npx ts-node scripts/validate-timing.ts` (must exit 0; max-path ≤ 7:30) | ✅ existing | ⬜ pending |
| 34-03-* | 03 | 3 | AR-02, AR-03 | SCRIPT count update | `npm test src/services/tts/__tests__/fallback-tts.test.ts -- --run` (asserts SCRIPT count = 82) | ✅ existing (1 update) | ⬜ pending |
| 34-03-* | 03 | 3 | AR-02, AR-03 | full regression | `npm test -- --run` (≥712 passing, ≤16 known failures) | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

Vitest is installed, all test suites referenced exist, no new test files needed (Phase 34 adds tests to 3 existing files: patternMatching.test.ts, oracleMachine.test.ts, OracleExperience-helpers.test.ts; updates 1 assertion in fallback-tts.test.ts).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New devolução scripts feel coherent with existing 8 + ESPELHO archetype tone (no "added on" feeling) | AR-02, AR-03 (artistic quality) | Subjective tone matching cannot be automated; requires reading aloud and comparing to reference archetypes | Read DEVOLUCAO_MIRROR (script.ts:565-570), DEVOLUCAO_ESPELHO_SILENCIOSO (580-587), then DEVOLUCAO_CONTRA_FOBICO and DEVOLUCAO_PORTADOR aloud. Verify same tone, no framework names, no declarative diagnosis, no gamified language. |
| MP3 audio quality matches Phase 33 ESPELHO_SILENCIOSO output (voice consistency, inflection rendering) | AR-02, AR-03 | Audio quality requires human listening | Play `devolucao_contra_fobico.mp3` and `devolucao_portador.mp3` after Wave 3 generation; compare against `devolucao_espelho_silencioso.mp3`. Confirm voice ID consistency, inflection tags rendering correctly. |
| roteiro.html cards visually consistent with 8 baseline + ESPELHO cards (color, typography, spacing) | AR-02, AR-03 (POL-03 partial) | HTML rendering quality | Open `public/roteiro.html` in browser after Wave 3, scroll to devoluções section, verify 2 new cards match existing card layout. |

**Note:** Browser UAT and full 96-path timing audit are explicitly DEFERRED to Phase 35 per CONTEXT D-domain ("What's NOT in this phase").

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none — existing infrastructure sufficient)
- [ ] No watch-mode flags (all commands use `-- --run` for one-shot execution)
- [ ] Feedback latency < 25s (quick) / 75s (full)
- [ ] `nyquist_compliant: true` set in frontmatter (after planner consumes this strategy)

**Approval:** pending
