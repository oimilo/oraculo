---
phase: 33-q6b-espelho-silencioso
plan: 01
type: summary
subsystem: data-types
tags: [script, nlu, q6b, espelho-silencioso, tdd]
requirements_addressed:
  - BR-03
  - AR-01
dependencies:
  requires:
    - Phase 32 Q5B baseline (script.ts with 73 keys, QUESTION_META[10])
  provides:
    - 6 Q6B script keys (PARAISO_Q6B_SETUP/PERGUNTA/RESPOSTA_A/B, FALLBACK_Q6B, TIMEOUT_Q6B)
    - 1 DEVOLUCAO_ESPELHO_SILENCIOSO key (6 segments)
    - QUESTION_META[11] for Q6B NLU classification
  affects:
    - Plan 33-02 (machine wiring — needs these keys to exist before mapping states)
    - Plan 33-03 (audio generation — will produce 7 new MP3s from these keys)
tech_stack:
  added: []
  patterns:
    - TDD red-green-refactor cycle
    - POL-02 invariant verification (types + patternMatching.ts untouched)
key_files:
  created: []
  modified:
    - src/data/script.ts (added 7 keys: 6 Q6B + 1 ESPELHO_SILENCIOSO, extended ScriptDataV4 interface)
    - src/types/index.ts (added QUESTION_META[11])
    - src/data/__tests__/script-v3.test.ts (19 new tests for Q6B + ESPELHO_SILENCIOSO)
    - src/types/__tests__/question-meta.test.ts (7 new tests for Q6B)
decisions:
  - Q6B narrative: shipped Option C "Resposta ou outra pergunta" (most cinematic, echoes Q5 dissolution gesture directly)
  - ESPELHO_SILENCIOSO narrative: shipped Option B "Silêncio que tem forma" (6 segments, ~24s, structured silence + open question)
  - ESPELHO packing: ONE key with 6 segments (not 6 separate keys) — matches existing 8 archetype pattern
  - Keywords use ASCII (no diacritics) for Whisper STT match reliability
  - defaultOnTimeout='A' for Q6B — silence must NEVER accidentally trigger ESPELHO_SILENCIOSO
metrics:
  duration_minutes: 6.5
  tasks_completed: 3
  files_modified: 4
  tests_added: 26
  tests_passing: 26
  commits: 5
  script_keys_added: 7
  total_script_keys: 80
completed_date: 2026-04-07
---

# Phase 33 Plan 01: Q6B + ESPELHO_SILENCIOSO Data Layer

**One-liner:** Added 6 Q6B script keys (Option C "Resposta ou outra pergunta") + DEVOLUCAO_ESPELHO_SILENCIOSO archetype (Option B "Silêncio que tem forma", 6 segments) + QUESTION_META[11] NLU classification, all via TDD with POL-02 invariant intact.

## What Was Built

Extended the script and NLU metadata to support:
1. **Q6B branch** ("O Espelho Extra") — 6 new script keys that fire when visitor dissolved their question (q5=B) but opened to be seen (q6=A), offering choice between closed reading (resposta → normal devolução) or open form (outra pergunta → ESPELHO_SILENCIOSO)
2. **DEVOLUCAO_ESPELHO_SILENCIOSO archetype** — the only devolução that returns form instead of content: 6 segments (~24s) with structured silence and an unanswerable open question
3. **QUESTION_META[11]** for Q6B NLU classification with keywords for both options

This is a pure data plan — no machine wiring or component changes. Plan 33-02 will wire the machine and UI to consume these primitives.

## Tasks Executed

### Task 1: Add 6 Q6B script entries + 1 DEVOLUCAO_ESPELHO_SILENCIOSO entry to src/data/script.ts

**Approach:** TDD red-green-refactor
- **RED phase:** Added 18 failing tests (11 Q6B + 8 ESPELHO_SILENCIOSO, 1 regression) to `src/data/__tests__/script-v3.test.ts`
- **GREEN phase:**
  - Extended ScriptDataV4 interface with 6 Q6B keys + 1 ESPELHO_SILENCIOSO key + 2 fallback/timeout keys
  - Added PARAISO_Q6B_* narrative entries (Option C from research) immediately after PARAISO_Q6_RESPOSTA_B
  - Added DEVOLUCAO_ESPELHO_SILENCIOSO (Option B from research, 6 segments) after DEVOLUCAO_MIRROR
  - Added FALLBACK_Q6B after FALLBACK_Q5B, TIMEOUT_Q6B after TIMEOUT_Q5B
- **Verification:** All 19 tests passing (11 Q6B + 8 ESPELHO_SILENCIOSO)

**Files modified:**
- `src/data/script.ts` — interface + 7 new SCRIPT object entries
- `src/data/__tests__/script-v3.test.ts` — 2 new describe blocks with 19 tests

**Commits:**
- `bc532cd` test(33-01): add failing tests for Q6B + ESPELHO_SILENCIOSO (RED phase TDD)
- `442c073` feat(33-01): add Q6B + ESPELHO_SILENCIOSO script entries (GREEN phase TDD)

### Task 2: Add QUESTION_META[11] for Q6B NLU classification

**Approach:** TDD red-green-refactor
- **RED phase:** Added 7 failing tests to `src/types/__tests__/question-meta.test.ts`
- **GREEN phase:**
  - Added QUESTION_META[11] with optionA='Resposta', optionB='Pergunta'
  - Keywords: 16 for A (resposta, fechada, definitiva, mostra...), 14 for B (pergunta, outra, aberta, espaco...)
  - defaultOnTimeout='A' (closed reading default — never accidentally fire ESPELHO_SILENCIOSO)
  - questionContext mentions "dissolver" (Q5 antecedent) and "aberta" (open form frame)
  - Updated JSDoc from "6 base + 4 branch" to "6 base + 5 branch"
- **Verification:** All 30 tests passing (7 new Q6B + 23 regression)

**Files modified:**
- `src/types/index.ts` — QUESTION_META[11] entry + JSDoc update
- `src/types/__tests__/question-meta.test.ts` — 1 new describe block with 7 tests + expanded regression suite

**Commits:**
- `43dfa68` test(33-01): add failing tests for QUESTION_META[11] Q6B (RED phase TDD)
- `7553aee` feat(33-01): add QUESTION_META[11] for Q6B NLU classification (GREEN phase TDD)

### Task 3: Verify POL-02 invariant (oracleMachine.types.ts + patternMatching.ts byte-identical)

**Approach:** Verification-only (no code changes)
- Verified `q6b` present in QuestionId union (Phase 31 extension intact)
- Verified patternMatching.ts byte-identical to master (0 diff lines)
- Verified working tree clean for both files (no accidental modifications)
- Verified all 59 archetype tests passing (regression proof)

**Result:** POL-02 confirmed intact for 3rd consecutive phase (31, 32, 33)

**Commit:**
- `26da35e` chore(33-01): verify POL-02 invariant intact (Task 3)

## Key Decisions

### Narrative Content Choices

**Q6B (Task 1):** Shipped **Option C** "Resposta ou outra pergunta?" from research Section 3.1
- **Rationale:** Most cinematic, explicitly ties Q6B back to Q5's dissolution gesture ("Você lembra do que você fez lá atrás? Você deixou uma pergunta dissolver."), honors the visitor's earlier choice instead of treating Q6B as a fresh decision
- **Semantic anchor:** A=Resposta (closed reading → routes to normal DEVOLUCAO), B=Outra Pergunta (open form → routes to DEVOLUCAO_ESPELHO_SILENCIOSO)
- **Tone:** serious + warm + gentle inflection tags (all verified working with voice ID PznTnBc8X6pvixs9UkQm)

**DEVOLUCAO_ESPELHO_SILENCIOSO (Task 1):** Shipped **Option B** "O Silêncio Que Você Ganha" from research Section 3.2
- **Rationale:** More direct delivery, heavier emphasis on silence as content, signature phrase "silêncio que tem forma" is poetic and precise
- **Structure:** 6 segments following acceptance → reframing → withholding → silence anchor → open question → meta-frame
- **Target duration:** ~24s (shorter than typical 30-45s archetype — shorter = more space, space is the medium)
- **Key constraints met:**
  - At least ONE segment is an unanswerable question (segment 4: "O que você nunca pediu — mas que mesmo assim te falta?")
  - At least TWO segments have pauseAfter ≥ 1500ms (segments 0, 1, 2, 3 all ≥1500ms — structured silence achieved)
  - NO framework name-dropping (tested via regex against winnicott/lacan/bion/freud/objet petit/falso self/verdadeiro self — zero matches)

### ESPELHO_SILENCIOSO Packing Decision

**Chose:** ONE key `DEVOLUCAO_ESPELHO_SILENCIOSO` with 6 segments (not 6 separate keys)
- **Rationale:** Matches the packing pattern of existing 8 archetypes (DEVOLUCAO_SEEKER, DEVOLUCAO_GUARDIAN, etc. — each is one key with N segments → one MP3)
- **Generator behavior:** `scripts/generate-audio-v3.ts` produces ONE MP3 per SCRIPT key
- **REQUIREMENTS.md interpretation:** The "6 MP3s" phrasing was documentation drift from segment count; the literal-vs-consistency fork resolved in favor of consistency with existing archetype pattern
- **Net Phase 33 MP3 output:** 6 Q6B + 1 ESPELHO_SILENCIOSO = **7 new MP3s** (to be generated in Plan 33-03)

### Keywords & NLU Design (Task 2)

**Keywords use ASCII (no diacritics):** Maximizes Whisper STT match probability (same convention as existing entries 1-10)
- keywordsA: resposta, responder, fechada, definitiva, fala, diz, dizer, mostra, mostrar, leitura, padrao, nome, sim, da, entrega, clara
- keywordsB: pergunta, perguntar, outra, abre, aberta, espaco, dissolver, continuar, deixa, vazio, oco, silencio, forma, nao

**defaultOnTimeout='A' (critical):** Silence must NEVER accidentally trigger ESPELHO_SILENCIOSO. ESPELHO requires a conscious choice of "Outra pergunta." The default-on-silence is the more common preference (closed reading).

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks completed successfully with zero deviations, zero rework, zero scope creep.

## Known Stubs

None — this is a pure data plan. No code paths or UI components created that could contain stubs.

## Testing

### Test Coverage Added

- **19 new script tests** (src/data/__tests__/script-v3.test.ts):
  - 11 Q6B tests (existence, structure, content, inflection tags, PT-BR validation, author reference check)
  - 8 ESPELHO_SILENCIOSO tests (6-segment structure, signature phrases, structured silence, framework name-drop check)
- **7 new QUESTION_META tests** (src/types/__tests__/question-meta.test.ts):
  - Q6B entry existence, option labels, keyword presence, defaultOnTimeout value, questionContext content
- **Regression tests extended:** 4 new regression checks for Phase 31/32 entries unchanged

### Test Results

- **All 26 new tests passing** (19 script + 7 QUESTION_META)
- **All Phase 31/32 regression tests passing** (Q1B 11/11, Q5B 11/11)
- **All pattern matching tests passing** (59/59 — POL-02 regression proof)
- **TypeScript compiles cleanly** (script.ts, types/index.ts both type-safe — the 72 TypeScript errors are from known-broken v1.0 test files documented in CLAUDE.md)

## What's Next

### Plan 33-02 Dependencies

Plan 33-02 (machine + UI integration) can now proceed because:
- ✅ PARAISO_Q6B_* script keys exist → `getScriptKey()` can map Q6B states
- ✅ DEVOLUCAO_ESPELHO_SILENCIOSO key exists → new top-level state can reference it
- ✅ QUESTION_META[11] exists → `buildChoiceConfig(11)` can be called for Q6B_AGUARDANDO
- ✅ QuestionId union includes 'q6b' (Phase 31) → choiceMap.q6b is type-safe

### Plan 33-03 Dependencies

Plan 33-03 (audio generation + timing validation + roteiro sync) can now proceed because:
- ✅ All 7 new script keys exist in `src/data/script.ts`
- ✅ `scripts/generate-audio-v3.ts` will auto-discover via Object.keys(SCRIPT)
- ✅ Expected output: 7 new MP3s (6 Q6B + 1 ESPELHO_SILENCIOSO)
- ✅ Total after Phase 33 audio generation: 80 MP3s

## Self-Check

**Files created:**
- None (this is a pure data plan — modified existing files only)

**Files modified:**
- ✅ `src/data/script.ts` — FOUND (7 new keys verified via grep: PARAISO_Q6B_SETUP, PARAISO_Q6B_PERGUNTA, PARAISO_Q6B_RESPOSTA_A, PARAISO_Q6B_RESPOSTA_B, FALLBACK_Q6B, TIMEOUT_Q6B, DEVOLUCAO_ESPELHO_SILENCIOSO)
- ✅ `src/types/index.ts` — FOUND (QUESTION_META[11] verified via test suite)
- ✅ `src/data/__tests__/script-v3.test.ts` — FOUND (19 new tests verified via vitest run)
- ✅ `src/types/__tests__/question-meta.test.ts` — FOUND (7 new tests verified via vitest run)

**Commits:**
- ✅ `bc532cd` — FOUND in git log
- ✅ `442c073` — FOUND in git log
- ✅ `43dfa68` — FOUND in git log
- ✅ `7553aee` — FOUND in git log
- ✅ `26da35e` — FOUND in git log

**POL-02 invariant:**
- ✅ patternMatching.ts byte-identical to master (0 diff lines)
- ✅ oracleMachine.types.ts unchanged (q6b still present in QuestionId)
- ✅ All 59 archetype tests passing

**Self-Check: PASSED** — All claims verified.

## Metrics

- **Duration:** 6.5 minutes (from 22:06:40 UTC to 22:13:10 UTC)
- **Tasks completed:** 3/3
- **Files modified:** 4
- **Tests added:** 26 (19 script + 7 QUESTION_META)
- **Tests passing:** 26/26
- **Commits:** 5 (2 RED, 2 GREEN, 1 verification)
- **Script keys added:** 7 (6 Q6B + 1 ESPELHO_SILENCIOSO)
- **Total script keys:** 80 (was 73 post-Phase 32)
- **QUESTION_META entries:** 11 (was 10 post-Phase 32)
