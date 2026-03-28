---
phase: 23-devolucoes-bookends
plan: 02
subsystem: narrative-script
tags: [bookends, apresentacao, encerramento, fallbacks, timeouts, lacanian-irreversibility, structural-symmetry, scenario-character]
requires: []
provides: [polished-apresentacao, polished-encerramento, scenario-fallbacks, scenario-timeouts]
affects: [src/data/script.ts]
decisions:
  - "D-08: Lacanian irreversibility made visceral in APRESENTACAO segment 6 - visitor FEELS stakes not just hears them"
  - "D-10: Added Lacanian subject transformation to ENCERRAMENTO - 'voce nao e mais quem entrou'"
  - "D-11: ENCERRAMENTO mirrors APRESENTACAO opening - structural symmetry via 'Eu nao sei quem voce e'"
  - "D-14: All 6 fallbacks reformulated in scenario vocabulary (sala/porta, coisa/corpo, jardim/fogo, aguas, pergunta/peso, espelho/voz)"
  - "D-15: All 6 timeouts interpret silence as valid gesture not failure"
  - "D-16: TIMEOUT_Q2 and TIMEOUT_Q6 preserved minimal changes (already strong)"
tech_stack:
  added: []
  patterns: [lacanian-irreversibility, structural-mirroring, scenario-vocabulary-matching, silence-as-gesture]
key_files:
  created: []
  modified:
    - path: src/data/script.ts
      changes: ["APRESENTACAO segment 6 expanded with percussive irreversibility", "ENCERRAMENTO expanded from 4 to 5 segments with subject transformation", "All 6 FALLBACK sections deepened with scenario imagery", "All 6 TIMEOUT sections deepened with scenario character"]
metrics:
  duration_minutes: 2
  tasks_completed: 2
  files_modified: 1
  lines_changed: 14
  tests_added: 0
  tests_passing: 51
completed: 2026-03-28T17:42:49Z
---

# Phase 23 Plan 02: Apresentação, Encerramento, Fallbacks & Timeouts Summary

**One-liner:** Lacanian irreversibility made visceral in opening, structural symmetry closing with subject transformation, and all 12 edge cases (fallbacks/timeouts) infused with scenario character.

## What Was Built

Polished the narrative frame that holds the 6 choices and devolucoes together:

1. **APRESENTACAO** — Added visceral Lacanian irreversibility to segment 6
2. **ENCERRAMENTO** — Expanded to 5 segments with subject transformation + structural symmetry
3. **6 FALLBACKS** — Reformulated each in its scenario vocabulary (per SCR-07)
4. **6 TIMEOUTS** — Deepened with scenario imagery, interpreting silence as gesture

All changes in `src/data/script.ts`. No state machine, no components, no audio generation.

## Tasks Completed

### Task 1: Polish Apresentacao and Encerramento

**Commit:** `1f140a3`

**APRESENTACAO changes (per D-08, D-09):**
- Segment 6 expanded from "cada resposta abre um caminho que nao pode ser desfeito" to add three percussive sentences:
  - "Nao tem replay."
  - "Nao tem voltar."
  - "O que voce escolher, voce carrega."
- Increased `pauseAfter` from 1800ms to 2200ms (heavier content needs heavier pause)
- Result: Irreversibility FELT viscerally (Lacanian symbolic act as irreversible cut)
- Kept 7 segments total (within D-09 constraint of 7-8 max)
- All anchor lines preserved (D-07): "Eu nao sei quem voce e", "Mas eu nao sonho"

**ENCERRAMENTO changes (per D-10, D-11, D-12):**
- Segment 2: REPLACED "Daqui a um minuto eu nao vou saber seu nome..." with Lacanian subject transformation:
  - "Mas voce nao e mais quem entrou. Voce falou seis vezes. E cada vez que voce falou, algo mudou. Nao volta."
- Segment 4: NEW — mirrors APRESENTACAO opening per D-11:
  - "Eu nao sei quem voce e. E agora voce sabe um pouco mais." with inflection `['warm']`
- Now 5 segments (was 4, within D-12 constraint of 4-5)
- Structural symmetry: "Eu nao sei quem voce e" opens AND closes the experience
- All anchor lines preserved (D-07): "A unica prova de que isso aconteceu e voce", "Faz alguma coisa com isso"
- Final segment has no `pauseAfter` — imperativo lands with weight

**Verification:** All 51 tests pass.

### Task 2: Rewrite 6 fallbacks and 6 timeouts with scenario character

**Commit:** `6e4fdf2`

**FALLBACK rewrites (per D-13, D-14, Phase 21 audit):**

Each fallback reformulated in VOCABULARY of its scenario (D-14 mapping: Q1=sala/porta, Q2=coisa/corpo, Q3=jardim/fogo, Q4=aguas, Q5=pergunta/peso, Q6=espelho/voz).

- **Q1:** Added "A porta pode nem existir" (room imagery — visitor's trapped comfort)
- **Q2:** Added "Seu corpo sabe a resposta antes de voce" (body tension per audit)
- **Q3:** Added "de manha" (temporal specificity) + "antes de ver o que vai perder" (names the loss)
- **Q4:** Replaced "Uma lembra, outra esquece" with "Uma carrega tudo que voce viveu. Outra apaga tudo." (gravity)
- **Q5:** Added "Talvez nunca tenha" (makes question feel heavier) + "mesmo assim" (acknowledges weight)
- **Q6:** Added "Essa e a ultima pergunta" (meta-awareness)

All remain 1 segment each (per D-13 "1-2 segments max"). No `pauseAfter` on fallbacks (they lead to listening).

**TIMEOUT rewrites (per D-15, D-16, Phase 21 audit):**

Each timeout interprets silence as valid gesture, not failure (per SCR-07, D-15).

- **Q1:** Added "A porta nunca existiu." (scenario imagery — silence means portal was never real)
- **Q2:** MINIMAL change per D-16 — kept exactly as is (already strong: "corpo decidiu primeiro")
- **Q3:** Added "O jardim queima sozinho." (scenario imagery — garden burns regardless)
- **Q4:** Replaced "Nenhuma agua..." with "Voce ficou entre as duas aguas. O silencio nao lembra nem esquece. Ele carrega os dois. Seguimos." (silence as third option)
- **Q5:** Added "Ou voce a dissolveu com o silencio" + "mas voce estava aqui quando aconteceu" (visitor as agent)
- **Q6:** MINIMAL change per D-16 — kept exactly as is (already strong: "resposta mais antiga")

All remain 1 segment each (per D-15). `pauseAfter` preserved in same range (1200-1600ms).

**Verification:** All 51 tests pass.

## Deviations from Plan

None. Plan executed exactly as written. All changes aligned with decisions D-08 through D-16 from CONTEXT.md.

## Technical Decisions

1. **Percussive irreversibility (D-08):** Three short sentences create visceral impact better than one long explanation
2. **Structural mirroring (D-11):** "Eu nao sei quem voce e" as bookends creates ceremonial closure — visitor hears same words transformed
3. **Scenario vocabulary matching (D-14):** Each fallback uses EXACT imagery from its question setup (sala/porta, coisa/corpo, etc.)
4. **Silence as gesture (D-15):** Timeouts avoid generic error language ("voce nao respondeu"), interpret silence in scenario terms
5. **Anchor preservation (D-07):** All 6 preserved lines maintained verbatim — no edits to strongest existing content

## Known Stubs

None. This phase is pure content polish (text in script.ts). All content is final — no hardcoded placeholders, no data wiring gaps.

## Self-Check: PASSED

**Created files exist:**
- `.planning/phases/23-devolucoes-bookends/23-02-SUMMARY.md` — this file

**Modified files verified:**
```bash
$ git log --oneline -2
6e4fdf2 feat(23-02): rewrite 6 fallbacks and 6 timeouts with scenario character
1f140a3 feat(23-02): add visceral irreversibility to APRESENTACAO and structural symmetry to ENCERRAMENTO
```

**Commits exist:**
```bash
$ git log --oneline --all | grep -E "1f140a3|6e4fdf2"
6e4fdf2 (HEAD -> master) feat(23-02): rewrite 6 fallbacks and 6 timeouts with scenario character
1f140a3 feat(23-02): add visceral irreversibility to APRESENTACAO and structural symmetry to ENCERRAMENTO
```

**Tests passing:**
```bash
$ npx vitest run src/data/__tests__/script-v3.test.ts
✓ src/data/__tests__/script-v3.test.ts (51 tests) 21ms
```

All checks passed.

---

**Phase 23 Plan 02 complete.** Apresentacao, Encerramento, fallbacks, and timeouts polished. APRESENTACAO segment 6 now makes Lacanian irreversibility visceral. ENCERRAMENTO mirrors opening with structural symmetry and names subject transformation. All 6 fallbacks reformulated in scenario vocabulary. All 6 timeouts interpret silence as valid gesture. All anchor lines preserved. All tests pass.
