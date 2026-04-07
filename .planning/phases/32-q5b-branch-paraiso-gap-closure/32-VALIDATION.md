---
phase: 32
slug: q5b-branch-paraiso-gap-closure
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-07
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Mirrors Phase 31 (Q1B) — Q5B is structurally identical but in Paraíso.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.x + @testing-library/react 14.x |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run src/machines/__tests__/oracleMachine.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30s full suite, ~3-5s machine-only |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` on the touched test file (machine, script, types, OracleExperience) — ~3-5s feedback
- **After every plan wave:** Run `npm test` (full suite, ~30s)
- **Before `/gsd:verify-work`:** Full suite green + `npx tsx scripts/validate-timing.ts` exit 0
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | BR-02 | unit | `npx vitest run src/data/__tests__/script.test.ts -t "Q5B"` | ✅ exists, add Q5B assertions | ⬜ pending |
| 32-01-02 | 01 | 1 | BR-02 | unit | `npx vitest run src/types/__tests__` (or wherever QUESTION_META lives) | ✅ exists, add idx 10 assertions | ⬜ pending |
| 32-02-01 | 02 | 2 | BR-02 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "shouldBranchQ5B"` | ✅ exists, add new tests | ⬜ pending |
| 32-02-02 | 02 | 2 | BR-02 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q5B sequence"` | ✅ exists, add new tests | ⬜ pending |
| 32-02-03 | 02 | 2 | BR-02 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q5B rejoin Q6_SETUP"` | ✅ exists, add new tests | ⬜ pending |
| 32-02-04 | 02 | 2 | BR-02 | unit | `npx vitest run src/components/experience/__tests__/OracleExperience.test.tsx -t "Q5B"` | ✅ exists, add new tests | ⬜ pending |
| 32-03-01 | 03 | 3 | BR-02 | smoke | MP3 file existence check (6 files in `public/audio/prerecorded/`) | manual smoke after run | ⬜ pending |
| 32-03-02 | 03 | 3 | BR-02 | integration | `npx tsx scripts/validate-timing.ts` (exit 0 = pass, max-path ≤ 7:30) | ✅ exists, add 6 new permutations | ⬜ pending |
| 32-03-03 | 03 | 3 | BR-02 | regression | `npm test` (full suite, all 246+ tests must pass) | ✅ baseline 246/246 | ⬜ pending |
| 32-03-04 | 03 | 3 | BR-02 (POL-02 invariant) | regression | `git diff master..HEAD -- src/machines/guards/patternMatching.ts` returns nothing | ✅ no edit allowed | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None* — existing test infrastructure covers all Phase 32 needs. Phase 31 already established Q1B test patterns; Phase 32 mirrors them for Q5B in the same files. No new framework, no new fixtures, no new config required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice quality and emotional fidelity of 6 new MP3s | BR-02 | ElevenLabs output is non-deterministic per generation; no automated tonal validation | After Wave 3 task `generate-audio-v3.ts` completes, listen to all 6 MP3s in headphones, verify voice ID PznTnBc8X6pvixs9UkQm consistency, no audible glitches, inflection tags rendered |
| Browser-rendered Q5B branch end-to-end | UAT-01 (Phase 35) | Requires real mic + Whisper STT roundtrip | DEFERRED to Phase 35 (UAT) — same as Phase 31 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or are explicit manual smoke
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Wave 0 not needed — empty)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter (will be set when planner approves task map)

**Approval:** pending — set after planner finalizes task IDs in PLAN files
