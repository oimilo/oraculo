# Phase 32 Deferred Items

Items discovered during Phase 32 execution that are **out of scope** for the Q5B branch work. They are logged here and NOT fixed as part of Phase 32 per GSD scope boundary rules.

## Pre-existing test failures (unrelated to Q5B)

### 1. `src/__tests__/voice-flow-integration.test.ts` — v1.0 legacy

**Status:** Known broken, documented in `CLAUDE.md` under "Known" section.
**Symptom:** Tests reference obsolete `PURGATORIO_A` / `PURGATORIO_B` states that were removed during v4.0 Game Flow machine rewrite.
**Scope:** Pre-dates Phase 31/32 — not caused by Q5B changes.
**Recommendation:** Rewrite entire test file for v4.0 machine shape. Track as separate maintenance phase.

### 2. `src/services/audio/__tests__/ambient-player.test.ts` — v5.0 ambient audio drift

**Status:** Modified in working tree before Phase 32 started (present in git status at session start, never committed).
**Symptom:** Tests expect `linearRampToValueAtTime(0.7, 2.0)` but implementation calls with `(1, 2)`. Likely drift from v5.0 ambient volume tuning work.
**Scope:** Pre-dates Phase 32 — unrelated to Q5B state machine or script changes.
**Recommendation:** Decide whether test expectations or player implementation is the source of truth, then align. Track as ambient audio follow-up.

## Notes

- Both files were failing before Phase 32 execution started
- Phase 32 introduced only one test regression (`fallback-tts.test.ts` hardcoded key count 67 → 73), which was auto-fixed as Rule 1 deviation in Plan 32-03
- All Phase 32 artifacts (script, machine, UI, audio, timing, roteiro) pass their own test suites
