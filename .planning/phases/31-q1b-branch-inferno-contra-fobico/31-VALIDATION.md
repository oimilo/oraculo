---
phase: 31
slug: q1b-branch-inferno-contra-fobico
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x + Testing Library |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/machines/__tests__/oracleMachine.test.ts src/data/__tests__/script.test.ts src/types/__tests__/question-meta.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | quick ~10s, full ~60s |

---

## Sampling Rate

- **After every task commit:** Run quick command (machine + script + question-meta)
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

> Plan IDs and task IDs are placeholders here — gsd-planner fills the actual IDs into PLAN.md.
> Mapping is by **layer**, not task number, so the planner can split work freely.

| Layer | Wave | Requirement | Test Type | Automated Command |
|-------|------|-------------|-----------|-------------------|
| script.ts entries (Q1B 8 keys) | 1 | BR-01 | unit | `npx vitest run src/data/__tests__/script.test.ts` |
| QUESTION_META[9] entry | 1 | BR-01 | unit | `npx vitest run src/types/__tests__/question-meta.test.ts` |
| ChoiceMap type extension (q1b?, q5b?, q6b?) | 1 | POL-02 | type-check | `npx tsc --noEmit` |
| `shouldBranchQ1B` guard + Q1B_* states | 2 | BR-01 | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts` |
| Branch path test (q1=B, q2=B → Q1B path) | 2 | BR-01 | integration | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q1B"` |
| OracleExperience helpers (6 funcs + buildChoiceConfig(9)) | 2 | BR-01 | unit | `npx vitest run src/components/experience/__tests__/OracleExperience.test.tsx` |
| MP3 generation (8 new files) | 3 | BR-01 | manual | `npx ts-node scripts/generate-audio-v3.ts` then `ls public/audio/oracle/q1b_*.mp3 | wc -l` should be 8 |
| validate-timing.ts permutations (4 → 8 paths) | 3 | BR-01 | script | `npx ts-node scripts/validate-timing.ts` (must list Q1B paths and stay ≤7:30) |
| roteiro.html updated with Q1B (Mermaid + text) | 3 | BR-01 | grep | `grep -c "Q1B\|A Porta no Fundo" public/roteiro.html` should be ≥3 |
| ChoiceMap backward compat (8 archetypes still match) | 2 | POL-02 | regression | `npx vitest run src/machines/__tests__/patternMatching.test.ts` |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No new framework or infrastructure setup required. v4.0 baseline already provides:

- [x] vitest + Testing Library configured
- [x] Existing test patterns for guards, branches, script keys, OracleExperience helpers
- [x] `scripts/generate-audio-v3.ts` and `scripts/validate-timing.ts` already in place

If existing test files don't yet have stubs for the new layers, the planner should add them in Wave 1 (not Wave 0) since the patterns are already established.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Q1B audio plays end-to-end in browser with NLU branching working | BR-01 | Full voice pipeline (mic → Whisper → NLU → ElevenLabs MP3 fallback) requires headphones + browser | 1) Set NEXT_PUBLIC_USE_REAL_APIS=true. 2) Open Oracle. 3) Choose B for Q1, choose B for Q2. 4) Verify Q1B SETUP audio plays. 5) Choose Q1B option and verify RESPOSTA audio plays. 6) Verify path completes through PURGATORIO. (Defer full UAT to Phase 35.) |
| MP3 voice quality matches existing 61 MP3s (same voice, no artifacts) | BR-01 | Audio quality is subjective | After generation, listen to 2-3 of the 8 new MP3s and confirm voice ID PznTnBc8X6pvixs9UkQm matches |

---

## Validation Sign-Off

- [ ] All tasks have automated verify command OR are listed in Manual-Only table
- [ ] Sampling continuity: every task touches a layer with an automated command in this map
- [ ] Wave 0 covers all MISSING references (none required for Phase 31)
- [ ] No watch-mode flags (all commands use `vitest run`, not `vitest`)
- [ ] Feedback latency < 60s (quick command ~10s)
- [ ] `nyquist_compliant: true` set in frontmatter once planner aligns plan tasks

**Approval:** pending — gsd-planner to fill task-level details and flip frontmatter
