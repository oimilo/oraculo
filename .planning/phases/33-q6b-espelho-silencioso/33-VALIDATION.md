---
phase: 33
slug: q6b-espelho-silencioso
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-07
---

# Phase 33 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Mirrors Phase 31/32 (Q1B/Q5B branch insertion) AND adds the new DEVOLUCAO_ESPELHO_SILENCIOSO archetype routing — the first time the v6.0 milestone touches the DEVOLUCAO `always` array.

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

- **After every task commit:** Run `npx vitest run` on the touched test file (machine, script, types, OracleExperience helpers) — ~3-5s feedback
- **After every plan wave:** Run `npm test` (full suite, ~30s)
- **Before `/gsd:verify-work`:** Full suite green + `npx tsx scripts/validate-timing.ts` exit 0 + manual MP3 spot-check
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 33-01-01 | 01 | 1 | BR-03 | unit | `npx vitest run src/data/__tests__/script.test.ts -t "Q6B"` | ✅ exists, add Q6B assertions | ⬜ pending |
| 33-01-02 | 01 | 1 | AR-01 | unit | `npx vitest run src/data/__tests__/script.test.ts -t "ESPELHO_SILENCIOSO"` | ✅ exists, add archetype assertions | ⬜ pending |
| 33-01-03 | 01 | 1 | BR-03 | unit | `npx vitest run src/types/__tests__/index.test.ts -t "QUESTION_META 11"` | ✅ exists, add idx 11 assertions | ⬜ pending |
| 33-01-04 | 01 | 1 | POL-02 (verify) | regression | `git diff master -- src/machines/oracleMachine.types.ts src/machines/guards/patternMatching.ts` returns nothing for patternMatching.ts | ✅ no edit allowed | ⬜ pending |
| 33-02-01 | 02 | 2 | BR-03 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "shouldBranchQ6B"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-02 | 02 | 2 | BR-03 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B sequence"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-03 | 02 | 2 | BR-03 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B rejoin"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-04 | 02 | 2 | AR-01 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "isEspelhoSilencioso"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-05 | 02 | 2 | AR-01 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO routing"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-06 | 02 | 2 | AR-01 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO highest priority"` | ✅ exists, regex/source check on always[0] | ⬜ pending |
| 33-02-07 | 02 | 2 | AR-01 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO closes to ENCERRAMENTO"` | ✅ exists, add new tests | ⬜ pending |
| 33-02-08 | 02 | 2 | BR-03 + AR-01 | unit | `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "Q6B"` | ✅ exists, add Q6B helper tests | ⬜ pending |
| 33-02-09 | 02 | 2 | AR-01 | unit | `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "ESPELHO"` | ✅ exists, add ESPELHO helper tests | ⬜ pending |
| 33-03-01 | 03 | 3 | BR-03 | smoke | `ls public/audio/prerecorded/paraiso_q6b_*.mp3 fallback_q6b.mp3 timeout_q6b.mp3 \| wc -l` returns 6 | manual smoke after generate-audio-v3 run | ⬜ pending |
| 33-03-02 | 03 | 3 | AR-01 | smoke | `ls public/audio/prerecorded/devolucao_espelho_silencioso*.mp3` returns ≥1 file | manual smoke after generate-audio-v3 run | ⬜ pending |
| 33-03-03 | 03 | 3 | BR-03 + AR-01 | integration | `npx tsx scripts/validate-timing.ts` (exit 0 = pass, max-path ≤ 7:30) | ✅ exists, must add Q6B + ESPELHO permutations to ALL_PATHS | ⬜ pending |
| 33-03-04 | 03 | 3 | BR-03 + AR-01 | regression | `npm test` (full suite, all 246+Phase31/32 tests must pass) | ✅ baseline 246/246 from Phase 32 | ⬜ pending |
| 33-03-05 | 03 | 3 | POL-02 (invariant) | regression | `git diff master -- src/machines/guards/patternMatching.ts` returns nothing | ✅ no edit allowed | ⬜ pending |
| 33-03-06 | 03 | 3 | BR-03 | smoke | `grep -c "Q6B" public/roteiro.html` returns ≥1 | ✅ existing file | ⬜ pending |
| 33-03-07 | 03 | 3 | AR-01 | smoke | `grep -ci "espelho" public/roteiro.html` returns ≥1 | ✅ existing file | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None* — existing test infrastructure covers all Phase 33 needs:

- `src/data/__tests__/script.test.ts` — confirmed exists (extended for Q1B in Phase 31, Q5B in Phase 32; extend for Q6B + ESPELHO_SILENCIOSO in Wave 1)
- `src/types/__tests__/index.test.ts` — confirmed exists (extended for QUESTION_META[9] and [10]; extend for [11] in Wave 1)
- `src/machines/__tests__/oracleMachine.test.ts` — confirmed exists (extended for Q1B/Q5B branching; extend for Q6B branching + ESPELHO routing in Wave 2)
- `src/components/experience/__tests__/OracleExperience-helpers.test.ts` — confirmed exists (extended for Q1B/Q5B helpers; extend for Q6B + ESPELHO helpers in Wave 2)
- Vitest already in `package.json`; no install needed
- `scripts/generate-audio-v3.ts` auto-discovers SCRIPT keys; no code change needed

If any of the four test files turn out to be missing during Wave 1 task 1's read step, the planner must add a Wave 0 step to create them with the standard "key non-empty" baseline assertions before proceeding. Phase 32 confirmed all four exist.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice quality and emotional fidelity of new MP3s (6 Q6B + 1-6 ESPELHO_SILENCIOSO) | BR-03, AR-01 | ElevenLabs output is non-deterministic per generation; no automated tonal validation | After Wave 3 task `generate-audio-v3.ts` completes, listen to all new MP3s in headphones, verify voice ID PznTnBc8X6pvixs9UkQm consistency, no audible glitches, inflection tags rendered, ESPELHO_SILENCIOSO ends with audible question (rising intonation) |
| Mermaid flowchart renders correctly with new Q6B node | BR-03 | Mermaid syntax fragility — only browser can confirm | After Wave 3 roteiro.html edit, open `public/roteiro.html` in a browser and visually verify Q6B node renders with correct edges and the new branch class color |
| Browser-rendered Q6B branch + ESPELHO_SILENCIOSO end-to-end | UAT-01 (Phase 35) | Requires real mic + Whisper STT roundtrip + full audio playback | DEFERRED to Phase 35 (UAT) — same as Phase 31/32 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or are explicit manual smoke
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Wave 0 not needed — empty)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter (will be set when planner approves task IDs)

**Approval:** pending — set after planner finalizes task IDs in PLAN files
