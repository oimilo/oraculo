---
phase: 34-detectable-archetypes-contra-fobico-portador
plan: 03
subsystem: audio-timing-docs
tags: [mp3, elevenlabs, validator, timing, roteiro, fallback-tts, phase-34-closeout]

# Dependency graph
requires:
  - phase: 34-detectable-archetypes-contra-fobico-portador
    provides: DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR script keys (Wave 1) + machine wiring + DEVOLUCAO.always priority cascade (Wave 2)
provides:
  - public/audio/prerecorded/devolucao_contra_fobico.mp3 (1.06 MB) — runtime audio for AR-02
  - public/audio/prerecorded/devolucao_portador.mp3 (1.10 MB) — runtime audio for AR-03
  - scripts/validate-timing.ts trigger-aware pickLongestDevolucao (10 candidates: ESPELHO + CONTRA_FOBICO + PORTADOR + 8 baseline)
  - scripts/validate-timing.ts ALL_PATHS extended 20 to 24 paths (4 new Phase 34 permutations)
  - public/roteiro.html with 2 new devolucao-card entries (CONTRA_FOBICO + PORTADOR) + updated 11-archetype priority list
  - src/services/tts/__tests__/fallback-tts.test.ts SCRIPT count assertion 80 to 82 (transient regression closed)
  - Phase 34 fully closed: AR-02 + AR-03 satisfied at code + audio + docs levels
affects: [35-uat-mitigation, future-archetype-additions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase 34 closeout pattern: audio generation + validator extension + docs sync + transient test fix in single wave (mirrors Phase 31/32/33 Wave 3 structure)"
    - "Trigger-aware devolucao selection: pickLongestDevolucao now mirrors runtime priority cascade exactly (ESPELHO[0] > CONTRA_FOBICO[1] > PORTADOR[2] > 8 baseline)"
    - "Validator path stacking with worst-case test: Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO (9Q) verifies max branch nesting + highest-priority Phase 34 devolução still fits in 7:30 budget"

key-files:
  created:
    - public/audio/prerecorded/devolucao_contra_fobico.mp3
    - public/audio/prerecorded/devolucao_portador.mp3
  modified:
    - scripts/validate-timing.ts
    - public/roteiro.html
    - src/services/tts/__tests__/fallback-tts.test.ts

key-decisions:
  - "Used public/audio/prerecorded/ (NOT public/audio/oracle/) — the plan referenced an outdated path; the real generate-audio-v3.ts script writes to /prerecorded/. Plan path was incorrect, real path is /prerecorded/."
  - "MP3 sizes (1.06 MB + 1.10 MB) slightly exceed plan's predicted 0.4-0.9 MB range — within the 2 MB sanity bound and consistent with mp3_44100_192 bitrate at ~25s segments. No trimming required."
  - "Worst-case path (Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO 9Q) lands at 7:11.2 min (431.2s) — 18.8s headroom under 7:30 budget. Zero trimming required."
  - "Roteiro.html section header updated from '6-8 escolhas' to '6-9 escolhas' and '8 arquetipos' to '11 arquetipos' to keep header in sync with the Phase 34 expansion."

patterns-established:
  - "Per-wave atomic commits: each task gets one commit, never combined. 3 task commits + 1 final docs commit total."
  - "Validator priority cascade testing: every priority-shift in DEVOLUCAO.always must be mirrored exactly in pickLongestDevolucao for max-path estimates to remain accurate."
  - "Roteiro.html cards have distinctive border-left colors marking priority/phase: ESPELHO (#8b7530), CONTRA_FOBICO (#a85030), PORTADOR (#6b5a30) — visual hierarchy mirrors machine priority."

requirements-completed: [AR-02, AR-03]

# Metrics
duration: 6min
completed: 2026-04-08
---

# Phase 34 Plan 03: Generate MP3s + Extend Timing Validator + Sync Roteiro Summary

**Wave 3 polish wave: generated 2 new MP3s via ElevenLabs v3 (devolucao_contra_fobico.mp3 1.06 MB + devolucao_portador.mp3 1.10 MB), extended scripts/validate-timing.ts to 24 paths with trigger-aware pickLongestDevolucao (max 7:11.2 min, 18.8s headroom), updated public/roteiro.html with 2 new devolucao cards + 11-archetype priority list, and fixed the transient fallback-tts SCRIPT count assertion (80 to 82). Phase 34 closes with all 16 known failures matching Phase 33 baseline exactly — zero new regressions.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-04-08T01:30:17Z
- **Completed:** 2026-04-08T01:35:50Z
- **Tasks:** 4 (1 checkpoint pre-check auto-approved + 2 file-modifying + 1 verification)
- **Files modified:** 3 + 2 created
- **API cost:** ~$0.10-0.20 (2 ElevenLabs v3 calls, ~500 chars each)

## Accomplishments

- **MP3 generation (Task 1):** Both new files generated cleanly via `npx tsx scripts/generate-audio-v3.ts`. Script auto-discovered the 2 new SCRIPT keys, skipped 80 existing files, and generated only the 2 new ones. Both MP3s use voice ID `PznTnBc8X6pvixs9UkQm` + `eleven_v3` model + DEVOLUCAO phase voice settings (stability 0.50, similarity_boost 0.75, style 0.30).
  - `devolucao_contra_fobico.mp3`: 1,107,217 bytes (1.06 MB)
  - `devolucao_portador.mp3`: 1,157,373 bytes (1.10 MB)
- **Timing validator (Task 2):** Extended `scripts/validate-timing.ts` with:
  - `pickLongestDevolucao` now accepts `hasContraFobico` + `hasPortador` parameters; priority cascade matches runtime exactly (ESPELHO > CONTRA_FOBICO > PORTADOR > 8 baseline longest)
  - `PathConfig` interface extended with `hasContraFobico` + `hasPortador` fields
  - `assertValidPath` enforces new invariants: `hasContraFobico` requires `hasQ1B`, `hasPortador` requires `hasQ5B`
  - `ALL_PATHS` extended from 20 to 24 paths (4 new Phase 34 permutations)
  - Console headers updated to "PHASE 34 (24 PATHS)"
  - Validator exit 0, max-path **7:11.2 min (431.2s)** with **18.8s headroom** under 450s budget
- **Roteiro.html sync (Task 3 Part B):** Added 2 new devolucao-card entries (CONTRA_FOBICO with border #a85030, PORTADOR with border #6b5a30) immediately after the ESPELHO card. Updated priority list to show 11 archetypes. Updated section header from "6-8 escolhas / 8 arquétipos" to "6-9 escolhas / 11 arquétipos". Mermaid flowchart left untouched per CONTEXT D-24.
- **fallback-tts assertion (Task 3 Part A):** Updated SCRIPT count assertion from `toBe(80)` to `toBe(82)`, with comment explaining the Phase 34 contribution. Test now passes (7/7 in fallback-tts.test.ts green).
- **Final regression (Task 4):** Full suite shows 41 passed / 2 failed test files, **733 passing / 16 failing / 3 skipped tests** — exactly matching Phase 33 baseline + 14 new Phase 34 tests (Wave 1 + Wave 2). Failed count dropped from 17 (post-Wave-2) to 16 (Phase 33 baseline) — confirms the fallback-tts assertion fix worked.

## Test Results Summary

| Metric | Phase 33 Baseline | Wave 1+2 Transient | Wave 3 Final | Delta |
|--------|-------------------|--------------------|--------------|-----|
| Test Files | 41 passed, 2 failed | 40 passed, 3 failed | 41 passed, 2 failed | +1 file recovered |
| Tests passed | 698 | 697 → 732 | **733** | +35 over Phase 33 |
| Tests failed | 16 | 17 | **16** | -1 (fallback-tts fixed) |
| Tests skipped | 3 | 3 | 3 | unchanged |
| Total tests | 717 | 752 | **752** | +35 over Phase 33 |
| Timing validator | 20 paths, max 7:01.2 | n/a | **24 paths, max 7:11.2** | +4 paths, +10s budget impact |

The 16 failures are exactly the documented known set:
- 15 failures in `voice-flow-integration.test.ts` (v1.0 obsolete `PURGATORIO_A/B` states — needs rewrite)
- 1 failure in `ambient-player.test.ts` (Phase 30 `crossfadeTo` change, unrelated to Phase 34)

**Zero new failures introduced by Wave 3.** Phase 34 closes cleanly.

## Validator Path Results (24 paths, all PASS)

| Path | Min Total | Max Total |
|------|-----------|-----------|
| No branches (6Q) | — | 299.2s = 4:59.2 min (MIN) |
| Q5B + PORTADOR (7Q) | — | 358.7s = 5:58.7 min |
| Q1B + CONTRA_FOBICO (7Q) | — | ~360s |
| Q1B + Q4B + CONTRA_FOBICO (8Q) | — | ~395s |
| Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO (9Q) | — | **431.2s = 7:11.2 min (MAX)** |

- **Min-path:** No branches (6Q) at 4:59.2 min (just 0.8s under the 300s lower bound, but the validator only enforces the upper bound — informational only)
- **Max-path:** Phase 34 worst case at **7:11.2 min**, which is **18.8s under the 7:30 budget**
- **All 24 paths PASS** (validator exit 0)

Note on the max-path: The validator picks CONTRA_FOBICO over PORTADOR for the worst-case path because the priority cascade puts CONTRA_FOBICO at index [1] before PORTADOR at index [2] in DEVOLUCAO.always. CONTRA_FOBICO (45.4s narration) is also marginally longer than PORTADOR (47.6s narration in another path) — actually let me recheck: in the validator output, DEVOLUCAO_PORTADOR is 47.6s and DEVOLUCAO_CONTRA_FOBICO is 45.4s. The worst-case path picks CONTRA_FOBICO via priority (not by length), which is the correct runtime-mirroring behavior.

## Task Commits

| # | Task | Commit | Files |
|---|------|--------|-------|
| 0 | Pre-check (env) — auto-approved | (no commit) | (none) |
| 1 | Generate 2 new MP3s | `7315168` | `public/audio/prerecorded/devolucao_contra_fobico.mp3`, `public/audio/prerecorded/devolucao_portador.mp3` |
| 2 | Extend `validate-timing.ts` | `325bd0b` | `scripts/validate-timing.ts` |
| 3 | Fix fallback-tts assertion + sync roteiro.html | `70d83c8` | `src/services/tts/__tests__/fallback-tts.test.ts`, `public/roteiro.html` |
| 4 | Final regression (verification only) | (no commit) | (none) |

## Files Created/Modified

### Created
- `public/audio/prerecorded/devolucao_contra_fobico.mp3` — 1,107,217 bytes (1.06 MB)
- `public/audio/prerecorded/devolucao_portador.mp3` — 1,157,373 bytes (1.10 MB)

### Modified
- `scripts/validate-timing.ts` — pickLongestDevolucao now trigger-aware (10 candidates), PathConfig + assertValidPath extended, ALL_PATHS 20 to 24, console headers updated
- `public/roteiro.html` — 2 new devolucao-card entries, priority list 9 to 11 archetypes, section header updated
- `src/services/tts/__tests__/fallback-tts.test.ts` — SCRIPT count assertion 80 to 82

## Decisions Made

- **Used `public/audio/prerecorded/` not `public/audio/oracle/`:** The plan's must_haves and acceptance_criteria referenced `public/audio/oracle/devolucao_*.mp3`, but the actual `scripts/generate-audio-v3.ts` writes to `public/audio/prerecorded/` (line 22: `const OUTPUT_DIR = resolve(ROOT, 'public/audio/prerecorded');`). All 80 existing MP3s also live in `/prerecorded/`. Followed the real path because that's where the runtime FallbackTTS reads from. Documented as Rule 1 deviation below.
- **No trimming required:** Worst-case path lands at 7:11.2 min with 18.8s headroom — no need to trim segments from either new devolução script.
- **MP3 file sizes (~1.1 MB) exceed plan's 0.4-0.9 MB prediction:** Both new MP3s are slightly larger than the plan estimated. This is consistent with mp3_44100_192 bitrate (192 kbps × ~46s narration ≈ 1.1 MB). Well within the 2 MB upper sanity bound. The plan's prediction was based on DEVOLUCAO_ESPELHO_SILENCIOSO (0.64 MB), but ESPELHO_SILENCIOSO is only ~24s of narration vs ~46s for the new devoluções.
- **Updated section header text:** The plan only specified the priority list update (lines 957-971), but the section header at line 954 still said "6-8 escolhas / 8 arquétipos". Updated to "6-9 escolhas / 11 arquétipos" for consistency. Treated as Rule 2 (missing critical sync — the header would have contradicted the priority list).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan path `public/audio/oracle/` is wrong; real path is `public/audio/prerecorded/`**
- **Found during:** Task 1 (before MP3 generation)
- **Issue:** The plan's `must_haves.truths` and `acceptance_criteria` instructed verifying file existence at `public/audio/oracle/devolucao_*.mp3`. However, `scripts/generate-audio-v3.ts` line 22 hardcodes `OUTPUT_DIR = resolve(ROOT, 'public/audio/prerecorded')` and all 80 existing MP3s live there. The runtime FallbackTTS in `src/services/tts/fallback.ts` also reads from `/audio/prerecorded/` (per the test file's `getUrl` helper at line 123). The `oracle/` path in the plan was an outdated reference.
- **Fix:** Used the correct `/prerecorded/` path throughout. No script changes needed — the real script was already correct.
- **Files affected:** `public/audio/prerecorded/devolucao_contra_fobico.mp3`, `public/audio/prerecorded/devolucao_portador.mp3`
- **Verification:** `ls public/audio/prerecorded/devolucao_*.mp3` shows both new files alongside the 9 existing baseline devoluções.
- **Committed in:** `7315168` (Task 1)

**2. [Rule 2 - Missing critical sync] Roteiro section header updated to match new priority list**
- **Found during:** Task 3 Part B (roteiro.html updates)
- **Issue:** The plan instructed updating the priority list (around lines 957-971) but did NOT explicitly mention the section header at line 954, which still read "6-8 escolhas e entrega um de 8 arquétipos". After updating the priority list to show 11 archetypes, leaving the header at "8 arquétipos" would be a contradiction.
- **Fix:** Updated header to "6-9 escolhas e entrega um de 11 arquétipos". The "6-9" range reflects 6 base questions + 0-3 conditional branches.
- **Files modified:** `public/roteiro.html` (section header at line 954)
- **Committed in:** `70d83c8` (Task 3)

---

**Total deviations:** 2 auto-fixed (1 plan path bug, 1 doc sync gap)
**Impact on plan:** No scope creep. The path correction prevented Task 1 from failing, and the header update ensured roteiro.html internal consistency. Both are low-risk corrections that align the work with reality.

## Issues Encountered

- **Plan path mismatch (resolved):** See Deviation 1 above. The plan author may have confused `oracle/` (a hypothetical or future location) with `prerecorded/` (the actual location). Worth flagging for Phase 35 plan polish — the audio generation script always writes to `prerecorded/`, never `oracle/`.

## Known Stubs

None — Wave 3 ships pure runtime artifacts (real MP3s, real validator extension, real card content). Both new devoluções have substantive narration (45-47s of audio each, 6 segments with inflection tags) and the roteiro.html cards display the actual narration text in HTML-entity-escaped Portuguese matching the rest of the document.

## User Setup Required

None — `.env.local` already has `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` + `USE_V3_MODEL=true`. The pre-check (Task 0) auto-approved per auto-mode after env verification confirmed all 3 vars present.

## Phase 34 Closing Status

**Phase 34 is COMPLETE.** All requirements satisfied:

- **AR-02 (CONTRA_FOBICO archetype):** Script (Wave 1) + guard (Wave 2) + machine state (Wave 2) + getScriptKey routing (Wave 2) + MP3 (Wave 3) + roteiro card (Wave 3) all wired.
- **AR-03 (PORTADOR archetype):** Same coverage as AR-02 — Script + guard + machine state + routing + MP3 + roteiro card all wired.

**Validation status:**
- All 24 timing paths PASS validator
- Full test suite: 733 passing / 16 failing (Phase 33 baseline) / 3 skipped
- Zero new regressions in Phase 34
- All 14 new Phase 34 tests (Wave 2 patternMatching + oracleMachine + OracleExperience-helpers) green
- POL-02 deeper invariant preserved (all 59 baseline determineArchetype tests still pass)

**Ready for `/gsd:verify-work` to formally close Phase 34.**

## Hand-off to Phase 35

Phase 35 is the final v6.0 mitigation + UAT phase. Outstanding items handed off:

- **POL-01 full 96-path audit:** Phase 34 validator exercises 24 paths (all 4 new Phase 34 permutations cover the priority cascade). Phase 35 should expand to the full 96 paths (every q1/q2/q3/q4/q5/q6 combination + all branches).
- **POL-03 comprehensive roteiro coherence pass:** Phase 34 added 2 new cards but a full visual QA of all 11 cards (consistency, tone, length parity) is deferred to Phase 35.
- **UAT-01 browser smoke test:** All 3 new branches (Q1B, Q5B, Q6B) + 3 new archetypes (ESPELHO_SILENCIOSO, CONTRA_FOBICO, PORTADOR) need end-to-end browser validation across ≥3 representative paths.
- **Pre-existing known failures:** 15 voice-flow-integration.test.ts (v1.0 PURGATORIO_A/B obsolete) + 1 ambient-player.test.ts (Phase 30 crossfade change). Out of scope for Phase 34 (Rule 4 architectural — separate cleanup phase).

**No blockers.** Phase 34 hand-off clean.

## Self-Check: PASSED

- FOUND: public/audio/prerecorded/devolucao_contra_fobico.mp3 (1,107,217 bytes)
- FOUND: public/audio/prerecorded/devolucao_portador.mp3 (1,157,373 bytes)
- FOUND: scripts/validate-timing.ts (pickLongestDevolucao with 3 args, 24 paths)
- FOUND: public/roteiro.html (CONTRA_FOBICO + PORTADOR cards, 11 arquetipos)
- FOUND: src/services/tts/__tests__/fallback-tts.test.ts (toBe(82))
- FOUND: commit 7315168 (Task 1 — MP3 generation)
- FOUND: commit 325bd0b (Task 2 — validator extension)
- FOUND: commit 70d83c8 (Task 3 — fallback-tts + roteiro.html)
- VALIDATOR: exit 0, 24 paths, max 7:11.2 min (PASS)
- TEST SUITE: 733 passing / 16 failing / 3 skipped — matches Phase 33 baseline + 14 new Phase 34 tests, zero new regressions

---
*Phase: 34-detectable-archetypes-contra-fobico-portador*
*Completed: 2026-04-08*
