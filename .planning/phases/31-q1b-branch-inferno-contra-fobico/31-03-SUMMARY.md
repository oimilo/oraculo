---
phase: 31-q1b-branch-inferno-contra-fobico
plan: 03
subsystem: audio assets + timing validation + client docs
tags: [elevenlabs, mp3, validate-timing, roteiro, q1b, contra-fobico, br-01, phase-close]
status: complete
wave: 3
requirements:
  - BR-01
requires:
  - "31-01"  # script.ts Q1B keys, QUESTION_META[9], types
  - "31-02"  # oracleMachine guard + 6 Q1B states + OracleExperience helpers
provides:
  - 6 Q1B MP3 files (~1.5 MB total)
  - validate-timing.ts modeling 6 path permutations with Q1B/Q2B mutual exclusivity
  - public/roteiro.html Q1B branch documentation (TOC + intro + Mermaid + narrative)
affects:
  - public/audio/prerecorded/ (6 new MP3s, total 61 -> 67)
  - scripts/validate-timing.ts (PathConfig + ALL_PATHS + calculatePath + budget ceiling)
  - public/roteiro.html (TOC + intro + Mermaid + Q1B narrative HTML block)
tech-stack:
  added: []
  patterns:
    - "ElevenLabs v3 generation via auto-discovery (Object.keys(SCRIPT)) — same pipeline as v4.0"
    - "ALL_PATHS permutation matrix respecting mutual exclusivity (6 entries, not 8)"
    - "Roteiro narrative block mirrors Q2B HTML structure for visual consistency"
key-files:
  created:
    - public/audio/prerecorded/inferno_q1b_setup.mp3 (414 KB)
    - public/audio/prerecorded/inferno_q1b_pergunta.mp3 (144 KB)
    - public/audio/prerecorded/inferno_q1b_resposta_a.mp3 (348 KB)
    - public/audio/prerecorded/inferno_q1b_resposta_b.mp3 (318 KB)
    - public/audio/prerecorded/fallback_q1b.mp3 (167 KB)
    - public/audio/prerecorded/timeout_q1b.mp3 (78 KB)
    - .planning/phases/31-q1b-branch-inferno-contra-fobico/31-03-SUMMARY.md (this file)
  modified:
    - scripts/validate-timing.ts (header docblock + PathConfig + ALL_PATHS + calculatePath + budget ceiling 420->450)
    - public/roteiro.html (TOC line + intro count line + Mermaid Q1B node/edge/classDef + new Q1B narrative HTML block)
decisions:
  - "Q1B and Q2B treated as mutually exclusive in ALL_PATHS — no Q1B+Q2B permutation, matrix grew 4 -> 6 (not 8)"
  - "Budget ceiling raised from 420s to 450s to honor v6.0 milestone overflow tolerance (~1-3% visitors)"
  - "Max-path measured at 373.9s (6:13.9 min) — well within 450s ceiling, no Phase 35 mitigation needed yet"
  - "Roteiro Q1B narrative text matches src/data/script.ts verbatim (CLAUDE.md sync invariant)"
metrics:
  duration_min: 7
  tasks_completed: 3
  tests_added: 0  # tests for Q1B were all in 31-02
  tests_passing: 175  # 10 question-meta + 7 helpers + 89 script-v3 + 69 oracleMachine
  files_created: 7  # 6 MP3s + this SUMMARY
  files_modified: 2  # validate-timing.ts + roteiro.html
  commits: 3  # 9d8bf99 mp3s + 9bc4cec timing + 3170a2b roteiro
  date_completed: 2026-04-07
  api_cost_estimate_usd: 0.50  # 6 ElevenLabs v3 generations
  audio_total_mb_after: 18.0
---

# Phase 31 Plan 03: Q1B Audio + Timing + Roteiro Summary

Wave 3 of Phase 31 — closes the Q1B "A Porta no Fundo" branch end-to-end by generating the 6 audible artifacts, extending the timing validation tool to model the new path permutations, and updating the client-facing roteiro to document the new branch. After this plan, BR-01 is structurally complete (pending only the Phase 35 browser UAT smoke test).

Tagline: **Q1B contra-fobico branch — audible, validated, documented. Phase 31 ready to close.**

## What Changed

### Task 1 — Generate 6 Q1B MP3s via ElevenLabs v3

Ran `npx tsx scripts/generate-audio-v3.ts` which auto-discovered the 6 new SCRIPT keys (added in Plan 31-01) and generated MP3s for each via the ElevenLabs v3 API using voice ID `PznTnBc8X6pvixs9UkQm` (Oracle voice) with INFERNO phase voice settings (stability=0.65, similarity_boost=0.80, style=0.40). The 61 pre-existing MP3s were skipped — no `--force` or `--clean` flag used.

| File                                 | Size       | Phase    | Notes                                      |
| ------------------------------------ | ---------- | -------- | ------------------------------------------ |
| `inferno_q1b_setup.mp3`              | 414 KB     | INFERNO  | 3-segment SETUP (porta no fundo, fresta)   |
| `inferno_q1b_pergunta.mp3`           | 144 KB     | INFERNO  | Binary choice prompt                       |
| `inferno_q1b_resposta_a.mp3`         | 348 KB     | INFERNO  | Atravessar (coragem servindo pro vazio)    |
| `inferno_q1b_resposta_b.mp3`         | 318 KB     | INFERNO  | Voltar (medo escolhido como interlocutor)  |
| `fallback_q1b.mp3`                   | 167 KB     | FALLBACK | Low-confidence NLU fallback                |
| `timeout_q1b.mp3`                    | 78 KB      | TIMEOUT  | 25s default (visitor hesita)               |
| **Total**                            | **~1.5 MB** |          |                                            |

Project audio total: **61 → 67 MP3s** (~17 MB → ~18 MB).

API outcome: 6/6 successful, 0 failures, 0 retries needed. Estimated cost: ~$0.50.

**Commit:** `9d8bf99` feat(31-03): generate 6 Q1B MP3s via ElevenLabs v3 (BR-01)

### Task 2 — Extend `scripts/validate-timing.ts` for Q1B path permutations

Updated the timing validation tool to model the new branch:

- **Header docblock** — bumped from "V4.0" to "V6.0", target range from "5-7 minutes (300-420 seconds)" to "5-7:30 minutes (300-450 seconds) — v6.0 budget with branch overflow tolerance", and listed all 6 paths with mutual exclusivity note.
- **PathConfig interface** — added `hasQ1B: boolean` field with comment referencing Phase 31 / BR-01.
- **ALL_PATHS array** — grew from 4 to **6 entries** (not 8) because Q1B and Q2B are mutually exclusive (q1 cannot be both 'A' and 'B'):
  1. No branches (6Q)
  2. Q2B only (7Q)        — q1=A, q2=A
  3. **Q1B only (7Q)**    — q1=B, q2=B  ← NEW
  4. Q4B only (7Q)
  5. Q2B + Q4B (8Q)
  6. **Q1B + Q4B (8Q)**   — NEW
- **`calculatePath()`** — added a new conditional Q1B section block immediately after the existing Q2B block, mirroring its structure (`pickLongerResposta` + push 3 sections SETUP/PERGUNTA/RESPOSTA).
- **Budget ceiling** — both the validation `pass` predicate and the recommendations branch updated from `420` to `450` seconds (300-450s acceptable range).
- **`main()` banner** — bumped from "V4.0" to "V6.0".

**Measured timings (all 6 paths):**

| Path                | Total      | vs 450s |
| ------------------- | ---------- | ------- |
| No branches (6Q)    | 4:59.2 min | -150.8s |
| Q2B only (7Q)       | 5:24.3 min | -125.7s |
| Q1B only (7Q)       | 5:42.1 min | -107.9s |
| Q4B only (7Q)       | 5:31.0 min | -119.0s |
| Q2B + Q4B (8Q)      | 5:56.2 min |  -93.8s |
| **Q1B + Q4B (8Q)**  | **6:13.9 min** |  **-76.1s** |

`MAX-PATH: Q1B + Q4B (8Q) = 373.9s = 6:13.9 min` — well within the 450s ceiling. **STATUS: PASS, exit 0.** Q1B is on average ~17.8s longer than Q2B (more substantive setup + responses), as expected from the blueprint character counts. No Phase 35 mitigation needed yet — Phase 32 (Q5B) and Phase 33 (Q6B) will revisit the budget as they land.

**Commit:** `9bc4cec` feat(31-03): extend validate-timing.ts with Q1B path permutations (BR-01)

### Task 3 — Update `public/roteiro.html` with Q1B branch

The client-facing script document is the source of truth for what the SBPRP team reviews before the event. CLAUDE.md memory enforces an invariant: roteiro.html and src/data/script.ts text must stay in sync. This task closes the gap left by Plans 31-01 and 31-02 (which only touched the runtime code).

Sections updated:

1. **Table of contents** (line ~361) — `Inferno (Q1, Q2, Q2B)` → `Inferno (Q1, Q2, Q1B, Q2B)`
2. **Visão geral list** (line ~375-376):
   - "6 perguntas binárias + **2** perguntas condicionais (**Q2B, Q4B**)" → "6 perguntas binárias + **3** perguntas condicionais (**Q1B, Q2B, Q4B**)"
   - Added Q1B trigger explanation: "Q1B aparece se Q1=B e Q2=B (perfil contra-fóbico)."
3. **Mermaid flowchart** (lines ~394-398):
   - Added new edge `Q2 -->|"B: Ficar olhando<br/>(se Q1=B)"| Q1B{...}` defining the Q1B node "A Porta no Fundo / Porta sem maçaneta, fresta de luz / A: Atravessar | B: Voltar"
   - Renamed the existing pure-B path to `Q2 -->|"B: Ficar olhando<br/>(se Q1=A)"| PURG` so the diagram disambiguates the two B-path destinations
   - Added `Q1B --> PURG` rejoin edge (mirroring `Q2B --> PURG`)
4. **Mermaid classDef** (line ~437) — `class Q2B,Q4B branch` → `class Q1B,Q2B,Q4B branch`
5. **New Q1B narrative HTML block** (~50 new lines) — inserted immediately after the existing Q2B question block, before `</section>` of Inferno. Mirrors the Q2B HTML structure (`branch-indicator` div + `question` div with header/title/setup/pergunta/choices). Embeds the verbatim PT-BR text from `src/data/script.ts` `INFERNO_Q1B_SETUP`/`PERGUNTA`/`RESPOSTA_A`/`RESPOSTA_B`.

**Structural counts (before → after):**
- `<div class="branch-indicator">` count: 2 → **3**
- `<div class="question">` count: 8 → **9**
- "Q1B" mentions in file: 0 → **9**

**Commit:** `3170a2b` docs(31-03): update roteiro.html with Q1B branch (Mermaid + narrative)

## Verification Results

### Automated 12-check verification (Task 3)

All 12 regex checks pass:
- OK: Q1B mentioned in TOC
- OK: Intro mentions 3 condicionais
- OK: Intro mentions Q1B trigger condition (q1=B AND q2=B)
- OK: Mermaid Q1B node defined
- OK: Mermaid Q1B → PURG edge present
- OK: Mermaid classDef branch includes Q1B
- OK: Q1B branch indicator div present
- OK: Q1B question title "A Porta no Fundo"
- OK: Q1B SETUP text matches script.ts ("não recua. Continua olhando")
- OK: Q1B PERGUNTA text ("atravessa essa fresta")
- OK: Q1B RESPOSTA A meaning ("Coragem servindo pra atravessar o vazio")
- OK: Q1B RESPOSTA B meaning ("Medo escolhido como interlocutor")

### Targeted test suites (zero v4.0 regression)

```
src/types/__tests__/question-meta.test.ts                              10/10 passing
src/components/experience/__tests__/OracleExperience-helpers.test.ts    7/7 passing
src/data/__tests__/script-v3.test.ts                                  89/89 passing
src/machines/oracleMachine.test.ts                                    69/69 passing
```

**Total: 175/175 passing** in 1.24s. Includes the 11 Q1B machine tests and 7 Q1B helper smoke tests added in Plan 31-02 — all still green after this plan's text/asset changes.

### TypeScript compilation

`npx tsc --noEmit` — same pre-existing error set as 31-02 SUMMARY (NextRequest mocks in API route tests, useVoiceChoice mock signature drift, voice-flow-integration v1.0 broken file, script-v3.test parameter typing). **Zero new errors caused by Plan 31-03 edits.** All Plan 31-03 source changes (validate-timing.ts) compile cleanly.

### Sanity greps

```bash
grep -c "hasQ1B" scripts/validate-timing.ts            # 8 (interface + 6 ALL_PATHS + calculatePath conditional)
grep -c "INFERNO_Q1B" scripts/validate-timing.ts       # 4 (SETUP, PERGUNTA, RESPOSTA_A, RESPOSTA_B refs)
find public/audio/prerecorded -name "*q1b*.mp3" | wc   # 6
ls public/audio/prerecorded | wc -l                    # 67
grep -c "Q1B\|A Porta no Fundo" public/roteiro.html    # 9
```

### Live validation script run

```
=== V6.0 TIMING VALIDATION (BRANCH-AWARE) ===
... (all 6 paths printed) ...
=== SUMMARY ===
MAX-PATH: Q1B + Q4B (8Q) — 373.9s = 6:13.9 min
MIN-PATH: No branches (6Q) — 299.2s = 4:59.2 min
AVG-PATH: 336.5s = 5:36.5 min
TARGET: 5-7:30 minutes (300-450 seconds) — v6.0 budget with branch overflow tolerance
STATUS: PASS (max-path 6:13.9 min)

All paths fall within acceptable range.
```

## Deviations from Plan

None — the 3 tasks executed exactly as written. No bugs found, no missing critical functionality, no blocking issues, no architectural decisions needed.

**Two minor process notes:**

1. **Stash isolation for roteiro.html.** Before Task 3 started, the working tree contained an unrelated pre-existing edit to the APRESENTACAO narration text in `public/roteiro.html` (4 lines, swapping a "Vou te fazer perguntas..." block for "Vou te perguntar..."). To keep the Plan 31-03 commit clean and isolate Q1B changes, that edit was stashed (`git stash push -m "31-03-prework: pre-existing roteiro.html APRESENTACAO edits" -- public/roteiro.html`) before Task 3, and `git stash pop` restored it after Task 3 committed cleanly. The Q1B commit `3170a2b` contains only the Q1B-related diff. The APRESENTACAO edit is back in the working tree as untracked noise — out of scope for this plan, will be addressed by whoever owns that script revision.

2. **Verify regex tweak.** The plan's automated verify command used regex placeholders like `n.{1,4}o recua` to match accented PT-BR, but HTML entities (`n&atilde;o`, 7 chars) overflow the `{1,4}` quantifier. Fixed locally during Task 3 by switching to literal entity strings (`n&atilde;o recua`) and `condicional Q1B` for the branch-indicator check. Both checks then passed; the underlying HTML content was correct from the first edit. Verify script was a temp file deleted after use — no impact on the codebase.

## Authentication Gates

None encountered. ElevenLabs API key was already configured in `.env.local` (verified pre-flight via `grep -c ELEVENLABS_API_KEY .env.local && grep -c ELEVENLABS_VOICE_ID .env.local` returning ≥1 each). All 6 API calls in Task 1 succeeded on first attempt.

## Phase 31 Closeout

Plan 31-03 is the **final wave of Phase 31**. After this plan, BR-01 (Q1B contra-fobico branch) is structurally complete:

| Layer                                          | Plan       | Status                |
| ---------------------------------------------- | ---------- | --------------------- |
| Script primitives (script.ts + types)          | 31-01      | ✅ shipped            |
| QUESTION_META[9] (NLU keywords + labels)       | 31-01      | ✅ shipped            |
| State machine (guard + 6 Q1B states)           | 31-02      | ✅ shipped            |
| OracleExperience helpers (6 extensions)        | 31-02      | ✅ shipped            |
| Audio assets (6 MP3s, ~1.5 MB)                 | **31-03**  | ✅ shipped            |
| Timing validation tool (6-path matrix)         | **31-03**  | ✅ shipped            |
| Client-facing roteiro doc                      | **31-03**  | ✅ shipped            |
| **Browser UAT** (full Q1=B Q2=B walkthrough)   | Phase 35   | ⏳ deferred per VALIDATION.md |

A visitor with q1='B' AND q2='B' will now hear the full Q1B branch end-to-end in the actual installation. The pattern matcher (`patternMatching.ts`) was deliberately untouched (POL-02 compliance — Q1B does not yet feed the CONTRA_FOBICO archetype detection). Archetype detection is Phase 34 work.

**Total Phase 31 deltas:**
- 3 plans, all complete
- 18 new tests (11 machine + 7 helper smoke), 175 total tests passing, zero v4.0 regressions
- 6 new MP3 files (~1.5 MB), 67 total project audio
- ~78 estimated states in oracleMachine (was 54 v4.0; +24 Q1B + Q5B + Q6B planned across phases 31/32/33; this phase added 6)
- Max-path duration: 5:57 → 6:14 (+17s, well within 450s ceiling)

## Ready Signal for Phase 32

Phase 31 is closeable. **Phase 32 (Q5B "O Que Já Não Cabe" — Paraíso branch)** can begin immediately. Q5B will mirror Q1B structurally:

- Same 3-wave pattern: data primitives → machine + UI wiring → MP3 + validation + roteiro
- Same SCRIPT key naming (`PARAISO_Q5B_SETUP/PERGUNTA/RESPOSTA_A/RESPOSTA_B`, `FALLBACK_Q5B`, `TIMEOUT_Q5B`)
- Same QUESTION_META index growth pattern (will become `QUESTION_META[10]` if Q1B took [9])
- Same machine guard pattern (`shouldBranchQ5B: q4=A AND q5=A`)
- Same OracleExperience helper checklist (6 extension points)
- Same validate-timing.ts ALL_PATHS expansion (Q5B is independent of Q1B/Q2B/Q4B → matrix grows from 6 to ~12 entries)
- Same roteiro.html update pattern (Mermaid + narrative block in Paraíso section)

The structural template Q5B mirrors is now battle-tested. Phase 31 can be transitioned via `/gsd:transition` and Phase 32 planning started via `/gsd:plan-phase 32`.

## Self-Check: PASSED

Files created (verified):
- FOUND: `public/audio/prerecorded/inferno_q1b_setup.mp3` (414 KB)
- FOUND: `public/audio/prerecorded/inferno_q1b_pergunta.mp3` (144 KB)
- FOUND: `public/audio/prerecorded/inferno_q1b_resposta_a.mp3` (348 KB)
- FOUND: `public/audio/prerecorded/inferno_q1b_resposta_b.mp3` (318 KB)
- FOUND: `public/audio/prerecorded/fallback_q1b.mp3` (167 KB)
- FOUND: `public/audio/prerecorded/timeout_q1b.mp3` (78 KB)
- FOUND: `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-03-SUMMARY.md` (this file)

Files modified (verified via git log):
- FOUND: `scripts/validate-timing.ts` (committed in `9bc4cec`)
- FOUND: `public/roteiro.html` (committed in `3170a2b`)

Commits exist:
- FOUND: `9d8bf99` feat(31-03): generate 6 Q1B MP3s via ElevenLabs v3 (BR-01)
- FOUND: `9bc4cec` feat(31-03): extend validate-timing.ts with Q1B path permutations (BR-01)
- FOUND: `3170a2b` docs(31-03): update roteiro.html with Q1B branch (Mermaid + narrative)
