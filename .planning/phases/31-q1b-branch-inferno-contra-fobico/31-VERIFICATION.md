---
phase: 31-q1b-branch-inferno-contra-fobico
verified: 2026-04-07T08:20:00Z
status: human_needed
score: 8/8 must-haves verified (browser UAT deferred to Phase 35)
requirements_satisfied:
  - BR-01
  - POL-02
human_verification:
  - test: "Click through full Q1B branch in browser (Q1=B, Q2=B)"
    expected: "Hear INFERNO_Q1B_SETUP → INFERNO_Q1B_PERGUNTA → mic opens → CHOICE_A/B → RESPOSTA → rejoin at PURGATORIO. Voice quality matches Oracle baseline."
    why_human: "Requires browser + headphones + subjective voice quality judgment; formal browser UAT is Phase 35 scope per VALIDATION.md"
  - test: "Confirm Q2B branch (Q1=A, Q2=A) still works unchanged"
    expected: "Visitor with q1=A, q2=A still hears Q2B branch (not Q1B); no regression in existing v4.0 path"
    why_human: "Full regression smoke requires interactive mic/NLU chain; covered automatically at state-machine level (11 regression tests passed) but end-to-end audible verification is Phase 35"
  - test: "FallbackTTS plays Q1B MP3s when NEXT_PUBLIC_USE_REAL_APIS=false"
    expected: "With APIs disabled, FallbackTTS finds inferno_q1b_*.mp3 in public/audio/prerecorded/ and plays them"
    why_human: "Requires running dev server + toggling env var + listening to audio; deferred to Phase 35 UAT"
---

# Phase 31: Q1B Branch (Inferno contra-fobico) Verification Report

**Phase Goal:** Add "A Porta no Fundo" branch — triggered when q1=B && q2=B (contra-fobico/destemido profile), tests courage against emptiness. Adds 6 SCRIPT keys, QUESTION_META[9], shouldBranchQ1B guard, 6 machine states, OracleExperience helper extensions, 6 MP3s, timing validation update, and roteiro.html documentation.

**Verified:** 2026-04-07T08:20:00Z
**Status:** human_needed (all automated checks pass; browser UAT deferred to Phase 35)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SCRIPT has 6 new Q1B keys (SETUP, PERGUNTA, RESPOSTA_A, RESPOSTA_B, FALLBACK_Q1B, TIMEOUT_Q1B) with verbatim PT-BR text | VERIFIED | `src/data/script.ts` lines 110-121 (interface) + lines 236-256 (narrative block) + lines 555-568 (FALLBACK/TIMEOUT). All text matches blueprint verbatim including "Você não recua. Continua olhando." |
| 2 | QUESTION_META[9] exists with optionA='Atravessar', optionB='Voltar', keywords covering NLU vocabulary | VERIFIED | `src/types/index.ts` lines 152-160. keywordsA includes atravessar/fresta/luz; keywordsB includes voltar/pulsar/reconhecer; defaultOnTimeout='A'; questionContext mentions "porta sem maçaneta" and "fresta de luz" |
| 3 | Machine has shouldBranchQ1B guard and 6 Q1B states wired into INFERNO with rejoin at PURGATORIO | VERIFIED | `src/machines/oracleMachine.ts` line 44 (guard), lines 253-294 (6 states), line 201 (guarded array transition from Q2_RESPOSTA_B). Both RESPOSTA_A/B target #oracle.PURGATORIO |
| 4 | Q1B triggers ONLY when q1='B' AND q2='B' (contra-fóbico profile); skipped in all other combinations | VERIFIED | Guard logic `context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B'` (line 44). Tests 2,3 in the Q1B describe block explicitly verify skip behavior for q1=A/q2=B and q1=B/q2=A combinations. All 69 oracleMachine tests pass. |
| 5 | OracleExperience helpers recognize Q1B states and route to correct script keys, fallback, choice config, mic gating | VERIFIED | `src/components/experience/OracleExperience.tsx` — Q1B_CHOICE const (line 49), getBreathingDelay (lines 77-78, 105, 124), getScriptKey (lines 162-166), getFallbackScript (line 220), activeChoiceConfig useMemo (line 272), isAguardando (line 286), isPergunta (line 333). All 6 extension points wired. |
| 6 | 6 new MP3s exist in public/audio/prerecorded/ matching the SCRIPT keys (lowercased), all non-empty | VERIFIED | 6 files found: inferno_q1b_setup.mp3 (414 KB), inferno_q1b_pergunta.mp3 (144 KB), inferno_q1b_resposta_a.mp3 (348 KB), inferno_q1b_resposta_b.mp3 (318 KB), fallback_q1b.mp3 (167 KB), timeout_q1b.mp3 (78 KB). Total project MP3s: 61 → 67. |
| 7 | validate-timing.ts models Q1B path permutations respecting Q1B/Q2B mutual exclusivity; max-path within ≤450s budget | VERIFIED | `scripts/validate-timing.ts` has `hasQ1B` field in PathConfig, 6-entry ALL_PATHS array (no Q1B+Q2B permutation), conditional Q1B block in calculatePath (lines 165-172). Running `npx tsx scripts/validate-timing.ts` → MAX-PATH: "Q1B + Q4B (8Q)" = 373.9s = 6:13.9 min (well under 450s); STATUS: PASS; exit 0. |
| 8 | roteiro.html documents Q1B branch in TOC, intro, Mermaid flowchart, and narrative block matching script.ts | VERIFIED | `public/roteiro.html` line 361 (TOC: "Inferno (Q1, Q2, Q1B, Q2B)"), lines 375-376 (intro: "3 perguntas condicionais"), line 397 (Mermaid Q1B node "A Porta no Fundo"), line 400 (Q1B → PURG edge), line 439 (classDef: "class Q1B,Q2B,Q4B branch"), lines 593-640 (Q1B narrative HTML block with all 4 segment texts matching script.ts verbatim) |

**Score: 8/8 truths verified.**

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/script.ts` | 6 new SCRIPT keys (SETUP, PERGUNTA, RESPOSTA_A, RESPOSTA_B, FALLBACK_Q1B, TIMEOUT_Q1B) with PT-BR text | VERIFIED | Interface extended (lines 110-121), narrative block added (lines 236-256), FALLBACK/TIMEOUT added (lines 555-568). All substantive multi-segment entries with inflection tags (thoughtful, serious, warm — all confirmed working for voice ID PznTnBc8X6pvixs9UkQm per CLAUDE.md memory). |
| `src/types/index.ts` | QUESTION_META[9] for Q1B NLU classification | VERIFIED | Lines 152-160, well-formed QuestionMeta object. NLU context mentions "porta sem maçaneta" and "fresta de luz". Keywords arrays non-empty (9 A-keywords, 8 B-keywords). |
| `src/machines/oracleMachine.types.ts` | QuestionId union extended with q1b, q5b, q6b | VERIFIED | Line 8: `'q1' \| 'q2' \| 'q2b' \| 'q3' \| 'q4' \| 'q4b' \| 'q5' \| 'q6' \| 'q1b' \| 'q5b' \| 'q6b'`. Forward compat for Phases 32/33. |
| `src/machines/oracleMachine.ts` | shouldBranchQ1B guard + 6 Q1B states + modified Q2_RESPOSTA_B | VERIFIED | Guard line 44, 6 states lines 253-294, Q2_RESPOSTA_B converted to guarded array at line 201. All transitions rejoin at #oracle.PURGATORIO. |
| `src/components/experience/OracleExperience.tsx` | 6 helper extensions (getScriptKey, getBreathingDelay, getFallbackScript, activeChoiceConfig, isAguardando, isPergunta) + Q1B_CHOICE const | VERIFIED | 14 Q1B references in file (const + 4 breathingDelay + 5 scriptKey + 1 fallback + 1 activeChoiceConfig + 1 isAguardando + 1 isPergunta). All wired correctly. |
| `public/audio/prerecorded/inferno_q1b_setup.mp3` | 3-segment SETUP MP3 | VERIFIED | 423,854 bytes (414 KB), non-empty |
| `public/audio/prerecorded/inferno_q1b_pergunta.mp3` | Binary choice prompt MP3 | VERIFIED | 147,374 bytes (144 KB), non-empty |
| `public/audio/prerecorded/inferno_q1b_resposta_a.mp3` | Atravessar response MP3 | VERIFIED | 356,772 bytes (348 KB), non-empty |
| `public/audio/prerecorded/inferno_q1b_resposta_b.mp3` | Voltar response MP3 | VERIFIED | 326,052 bytes (318 KB), non-empty |
| `public/audio/prerecorded/fallback_q1b.mp3` | Low-confidence NLU fallback MP3 | VERIFIED | 170,571 bytes (167 KB), non-empty |
| `public/audio/prerecorded/timeout_q1b.mp3` | 25s default fallback MP3 | VERIFIED | 80,292 bytes (78 KB), non-empty |
| `scripts/validate-timing.ts` | Updated ALL_PATHS with Q1B permutations and mutual exclusivity | VERIFIED | hasQ1B field in PathConfig, 6-entry ALL_PATHS (not 8), conditional Q1B block in calculatePath, budget ceiling raised to 450s. Script runs clean, exits 0. |
| `public/roteiro.html` | Q1B branch documented in TOC, intro, Mermaid, narrative | VERIFIED | 9 Q1B mentions in file. TOC, intro list, Mermaid node + edge + classDef, and full narrative HTML block all present. Text matches script.ts verbatim (CLAUDE.md sync invariant honored). |

**All 12 artifacts: VERIFIED (exist + substantive + wired + data flows through wiring)**

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| ScriptDataV4 interface | 6 new SCRIPT literal entries | TypeScript interface compliance | WIRED | `npx tsc --noEmit` passes on script.ts; all 6 keys present in both interface declaration and SCRIPT object literal |
| Q2_RESPOSTA_B state | Q1B_SETUP state | Conditional NARRATIVA_DONE transition array with shouldBranchQ1B guard | WIRED | Line 201 `{ target: 'Q1B_SETUP', guard: 'shouldBranchQ1B' }` followed by fallback `{ target: '#oracle.PURGATORIO' }` — exact mirror of Q2B branch pattern |
| OracleExperience.getScriptKey | INFERNO_Q1B_* SCRIPT keys | `machineState.matches({ INFERNO: 'Q1B_*' })` | WIRED | Lines 162-166 — 5 matching conditions returning 5 different script keys |
| OracleExperience activeChoiceConfig | Q1B_CHOICE built from QUESTION_META[9] | `buildChoiceConfig(9)` | WIRED | Line 49 const declaration + line 272 useMemo assignment |
| Q1B_RESPOSTA_A/B | #oracle.PURGATORIO | NARRATIVA_DONE transition | WIRED | Lines 287-289, 292-294 — both responses rejoin main path |
| generate-audio-v3.ts auto-discovery | 6 inferno_q1b_*.mp3 files | Object.keys(SCRIPT).map toLowerCase() | WIRED | All 6 MP3s present in public/audio/prerecorded/ with correct filename mapping |
| validate-timing.ts ALL_PATHS | Q1B path entries | PathConfig with hasQ1B flag | WIRED | 2 Q1B-bearing entries ("Q1B only", "Q1B + Q4B"); mutual exclusivity enforced by omission of Q1B+Q2B permutation |
| roteiro.html Mermaid flowchart | Q1B node | `Q2 -->|"B: Ficar olhando (se Q1=B)"| Q1B` edge | WIRED | Line 397 defines node, line 400 rejoins PURG, line 439 assigns branch class |

**All 8 key links: WIRED**

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| OracleExperience helpers | `SCRIPT.INFERNO_Q1B_*` | Imported from `@/data/script` — static PT-BR text with inflection tags | Yes (3-segment setup, 1-segment pergunta, 2-segment responses) | FLOWING |
| OracleExperience activeChoiceConfig | `Q1B_CHOICE` | `buildChoiceConfig(9)` reads `QUESTION_META[9]` (9 + 8 keywords) | Yes (real NLU keywords from blueprint) | FLOWING |
| Machine Q1B_AGUARDANDO guard action | `context.choiceMap.q1b` | `assign(recordChoice('q1b', 'A' \| 'B'))` on CHOICE_A/B events | Yes (union type extended, assign action present) | FLOWING |
| FallbackTTS script key lookup | 6 Q1B MP3 files | Filesystem `public/audio/prerecorded/inferno_q1b_*.mp3` etc. | Yes (all 6 MP3s exist with real audio bytes from ElevenLabs v3) | FLOWING |
| validate-timing.ts calculatePath | SCRIPT.INFERNO_Q1B_SETUP/PERGUNTA/RESPOSTA | Direct import of SCRIPT from script.ts | Yes (373.9s max-path measured from real segment character counts) | FLOWING |

**All dynamic data flows verified — no stubs, no hardcoded empties, no disconnected wiring.**

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All Q1B machine states reachable via correct guard | `npx vitest run src/machines/oracleMachine.test.ts` | 69/69 passing (includes 11 Q1B tests + 58 v4.0 regression) | PASS |
| Q1B helper contracts satisfied at runtime | `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts` | 7/7 passing | PASS |
| QUESTION_META[9] well-formed | `npx vitest run src/types/__tests__/question-meta.test.ts` | 10/10 passing (7 Q1B + 3 regression for Q1/Q2B/Q4B) | PASS |
| QuestionId type extension doesn't break ChoiceMap | `npx vitest run src/machines/__tests__/oracleMachine-types.test.ts` | 5/5 passing | PASS |
| Q1B script entries pass PT-BR + verbatim blueprint checks | `npx vitest run src/data/__tests__/script-v3.test.ts` | 89/89 passing | PASS |
| POL-02 regression: archetype guards unbroken | `npx vitest run src/machines/guards/__tests__/patternMatching.test.ts` | 59/59 passing | PASS |
| FallbackTTS script key count updated to 67 | `npx vitest run src/services/tts/__tests__/fallback-tts.test.ts` | 7/7 passing | PASS |
| Timing validation within v6.0 budget | `npx tsx scripts/validate-timing.ts` | STATUS: PASS, MAX-PATH 373.9s (6:13.9 min) < 450s ceiling, exit 0 | PASS |

**All 8 behavioral checks: PASS (246 total tests across targeted suites)**

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| **BR-01** | 31-01, 31-02, 31-03 | Q1B "A Porta no Fundo" branch — 6 SCRIPT keys, QUESTION_META[9], guard, machine states, OracleExperience helpers, 6 MP3s | **SATISFIED** | All 8 deliverables present: 6 script keys (verified), QUESTION_META[9] (verified), shouldBranchQ1B guard (verified), 6 machine states (verified), 6 OracleExperience helper extensions (verified), 6 MP3s (verified). Timing budget preserved at 6:13.9 min (well within 450s ceiling). roteiro.html documents branch (POL-03 partial coverage). |
| **POL-02** | 31-01 (type extension) | ChoiceMap context type extended with optional q1b/q5b/q6b without breaking archetype tests | **SATISFIED** | `src/machines/oracleMachine.types.ts` line 8 QuestionId union now includes 'q1b'/'q5b'/'q6b'. `src/machines/guards/patternMatching.ts` is BYTE-IDENTICAL to baseline (`git diff ec96ac7..HEAD -- src/machines/guards/patternMatching.ts` returns empty — no commits touched it since Phase 26-02). All 59 archetype guard tests still pass. |

**No orphaned requirements** — both BR-01 and POL-02 are the only requirements assigned to Phase 31 per REQUIREMENTS.md line 97: "Phase 31 (Q1B Branch): BR-01, POL-02 (ChoiceMap extension starts here)".

**Status after Phase 31:** BR-01 → Complete, POL-02 → Complete (per REQUIREMENTS.md lines 80, 87). REQUIREMENTS.md checkboxes already reflect these as `[x]` on lines 14 and 27.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | No TODO/FIXME/placeholder comments in Phase 31 files. No empty handlers. No hardcoded empty data. No stub returns. All script entries are substantive PT-BR text. All MP3s are non-empty. |

**Scan results:** Clean. All modified files contain real implementations, not stubs.

---

### Human Verification Required

Phase 31 completes all automated goal-backward checks. The following items require human/browser testing and are **formally deferred to Phase 35 (Timing Mitigation + Browser UAT)** per `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-VALIDATION.md`:

#### 1. Browser UAT: Full Q1B walkthrough

**Test:** Start dev server with `npm run dev`, navigate to main page, use mic to answer Q1='procurar/sair' and Q2='ficar olhando/observar' (both B choices)
**Expected:** Oracle narrates Q1B_SETUP ("Você não recua. Continua olhando. E aí — sem aviso — uma porta aparece..."), asks the Q1B_PERGUNTA ("Você atravessa essa fresta..."), mic opens, visitor answers, hears correct RESPOSTA_A or RESPOSTA_B, then transitions into PURGATORIO_INTRO
**Why human:** Requires browser + microphone + headphones + listening to voice quality subjectively; NLU classification with real STT; Phase 35 owns this formal UAT

#### 2. Voice quality matching

**Test:** A/B listen to new Q1B MP3s vs existing v4.0 MP3s
**Expected:** New Q1B voice matches Oracle baseline (same timbre, pacing, intimacy — voice ID PznTnBc8X6pvixs9UkQm + INFERNO voice settings stability=0.65, similarity_boost=0.80, style=0.40)
**Why human:** Subjective voice quality judgment, deferred to Phase 35

#### 3. Regression smoke (Q2B path still works)

**Test:** Walk through Q1='A', Q2='A' → expect Q2B branch to fire
**Expected:** Q2B narrative plays unchanged (no regression from Q1B addition)
**Why human:** Full end-to-end audible regression; state-machine level regression PASSED (test #11 in Q1B describe block explicitly verifies this), but audible confirmation is Phase 35

#### 4. FallbackTTS behavior with Q1B keys

**Test:** Set `NEXT_PUBLIC_USE_REAL_APIS=false`, trigger Q1B branch
**Expected:** FallbackTTS finds and plays `inferno_q1b_*.mp3` files from `public/audio/prerecorded/`
**Why human:** Requires env toggle + interactive flow; Phase 35 UAT

---

### Gaps Summary

**No code or artifact gaps.** All 8 observable truths verified, all 12 artifacts present and wired, all 8 key links connected, all behavioral spot-checks pass, both requirements satisfied.

The only outstanding items are the human verification items above, which are **formally scoped to Phase 35** per the v6.0 roadmap decision log. Phase 31 produced everything it promised.

---

## Phase 31 Closeout Confidence

| Layer | Status | Evidence |
|-------|--------|----------|
| Script primitives (6 keys) | ✅ shipped | src/data/script.ts lines 110-121, 236-256, 555-568 |
| QUESTION_META[9] NLU metadata | ✅ shipped | src/types/index.ts lines 152-160 |
| QuestionId type extension | ✅ shipped | src/machines/oracleMachine.types.ts line 8 |
| State machine (guard + 6 states + Q2_RESPOSTA_B mod) | ✅ shipped | src/machines/oracleMachine.ts lines 44, 201, 253-294 |
| OracleExperience helpers (6 extensions) | ✅ shipped | src/components/experience/OracleExperience.tsx 14 Q1B refs |
| 6 audio MP3 files | ✅ shipped | public/audio/prerecorded/inferno_q1b_*.mp3 + fallback/timeout (~1.5 MB) |
| Timing validation tool update | ✅ shipped | scripts/validate-timing.ts 6-path matrix, MAX 373.9s ≤ 450s |
| Client roteiro.html docs | ✅ shipped | public/roteiro.html TOC + intro + Mermaid + narrative |
| POL-02 backward compat | ✅ shipped | patternMatching.ts byte-identical; 59 archetype tests pass |
| **Browser UAT** | ⏳ Phase 35 | Deferred per VALIDATION.md manual section |

**Test counts:**
- Phase 31 targeted suites: 170 tests passing (89 script + 59 patternMatching + 10 question-meta + 7 helper smoke + 5 type extension)
- Machine + services: 76 tests passing (69 machine + 7 fallback-tts)
- **Total verified in this report: 246/246 passing across all Phase 31-related suites**

**Git commits (Phase 31):**
- 31-01: 4368acc, 6b618c9, 292a470, 9933a69, 10d36aa, fe3f98a, 2dfd537 (6 TDD + 1 docs)
- 31-02: bf214ff, 01e3264, f3ab5fd, 2368021, 26465e0, ec96ac7 (4 TDD + 2 docs)
- 31-03: 9d8bf99, 9bc4cec, 3170a2b, 2e7c54c, 53e2ddb (3 impl + 1 docs + 1 test fix)

All 3 plans complete, all 3 SUMMARY.md files exist on disk, all commits verifiable in git log.

---

_Verified: 2026-04-07T08:20:00Z_
_Verifier: Claude (gsd-verifier)_
_Phase 31 verification status: ALL AUTOMATED CHECKS PASS. Browser UAT deferred to Phase 35._
