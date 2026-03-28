---
phase: 23-devolucoes-bookends
plan: 01
subsystem: narrative-script
tags: [devolicoes, psychoanalytic-depth, pattern-mirrors, script-rewrite]
dependency_graph:
  requires: [22-01, 22-02]
  provides: [8-devolucao-sections-depth-4-5, test-assertions-fixed]
  affects: [24-01]
tech_stack:
  added: []
  patterns: [3-layer-psychoanalytic-structure, winnicott-lacan-bion]
key_files:
  created: []
  modified:
    - src/data/script.ts
    - src/data/__tests__/script-v3.test.ts
decisions:
  - Applied 3-layer structure (Winnicott pattern + Lacan structure + Bion transformation) to all 8 devolucoes
  - Preserved anchor lines from D-07 (CONTRADICTED and SURFACE_KEEPER)
  - Removed scenario listing from all devolucoes (pattern reading, not recap)
  - Kept 4-5 segments per devolucao (depth through replacement, not addition)
metrics:
  duration_seconds: 165
  tasks_completed: 2
  files_modified: 2
  commits: 2
  tests_passing: 51
completed_date: 2026-03-28
---

# Phase 23 Plan 01: Devolucoes 3-Layer Rewrite — Summary

**One-liner:** Rewrote all 8 devolucoes with 3-layer psychoanalytic structure (Winnicott pattern recognition + Lacan structural reading + Bion transformation naming), raising depth from 2-3 to 4-5, removing scenario listing, preserving anchor lines.

## What Was Built

Rewritten 8 DEVOLUCAO sections in `src/data/script.ts` with absorbed psychoanalytic depth per Phase 21 audit recommendations:

**1. DEVOLUCAO_SEEKER (5 segments, depth 2 → 4-5):**
- Layer 1 (Winnicott): "Você entrou em tudo. Nada te parou. Você não recua."
- Layer 2 (Lacan): "Mas fome de quê? O movimento pode ser a última forma de fuga."
- Layer 3 (Bion): "Você transformou o que tocou — ou só acumulou peso?"
- Removed scenario listing (was listing sala, coisa, jardim explicitly)

**2. DEVOLUCAO_GUARDIAN (5 segments, depth 2 → 4-5):**
- Layer 1 (Winnicott): "Você se protegeu em cada encruzilhada. Sua primeira resposta foi preservar."
- Layer 2 (Lacan): "Algo em você sabe: o que você protege pode ser o que você nunca deixou nascer."
- Layer 3 (Bion): "Toda muralha tem dois lados. O que ela impede de entrar — e o que ela impede de sair."
- Removed scenario listing

**3. DEVOLUCAO_CONTRADICTED (4 segments, depth 3 → 4-5):**
- Layer 1 (Winnicott): "Você foi e voltou. Segurou e soltou. Nenhuma direção fixa."
- Layer 2 (Lacan): "Você quer as duas coisas porque desejo nunca é simples. Não é falha — é estrutura."
- ANCHOR PRESERVED: "Quem é coerente demais já decidiu parar de sentir." (D-07)
- Layer 3 (Bion): "Guarda essa oscilação. Ela é mais sua do que qualquer certeza."

**4. DEVOLUCAO_PIVOT_EARLY (5 segments, depth 2 → 4-5):**
- Layer 1 (Winnicott): "Alguma coisa mudou em você no começo. Você virou antes da terceira pergunta."
- Layer 2 (Lacan): "O corpo se moveu antes da mente entender. E quando o corpo lidera, o que aparece não é reação — é verdade."
- Layer 3 (Bion): "Isso é raro. A maioria segura o plano até o fim — mesmo quando ele já não serve."

**5. DEVOLUCAO_PIVOT_LATE (5 segments, depth 3 → 4-5):**
- Layer 1 (Winnicott): "Alguma coisa mudou entre a terceira e a quarta pergunta. A virada veio na metade mais funda."
- Layer 2 (Lacan): "Quem muda tarde muda de verdade. Porque já não é reação — é decisão. Desejo não é linha reta. É curva."
- Layer 3 (Bion): "Esse é o lugar onde algo foi transformado. Não só sentido. Atravessado."

**6. DEVOLUCAO_DEPTH_SEEKER (4 segments, depth 3 → 4-5):**
- Layer 1 (Winnicott): "Você foi em direção a cada fogo. Não recuou. Em nenhum."
- Layer 2 (Lacan): "A questão é se você sabe a diferença entre coragem e compulsão."
- Layer 3 (Bion): "Você recebeu tudo. Mas receber não é o mesmo que digerir. Fundo sem ar mata igual."
- Removed scenario listing (was listing coisa, jardim, água explicitly)

**7. DEVOLUCAO_SURFACE_KEEPER (5 segments, depth 3 → 4-5):**
- Layer 1 (Winnicott): "Você se manteve inteiro. Em cada encruzilhada, escolheu o caminho que preserva."
- Layer 2 (Lacan): "Mas a proteção tem um custo que não aparece na hora."
- ANCHOR PRESERVED: "O jardim que você não entrou continua pegando fogo na sua cabeça." (D-07)
- Layer 3 (Bion): "Não como memória — como coisa que nunca foi recebida. E o que não é recebido não some. Insiste."

**8. DEVOLUCAO_MIRROR (5 segments, depth 3 → 4-5):**
- Layer 1 (Winnicott): "Equilíbrio perfeito. Você nunca repetiu a mesma direção duas vezes. Você segurou o centro."
- Layer 2 (Lacan): "Pode ser sabedoria — sentir os dois lados sem perder o eixo. Ou a última forma de nunca se comprometer de verdade com nenhum desejo."
- Layer 3 (Bion): "Só você sabe se o centro é uma conquista ou um refúgio. Fica com essa pergunta."
- Ends with question (per D-03)

**Test fixes:**
- Updated `script-v3.test.ts` to accept 2-4 segments for PURGATORIO_INTRO (was 2-3, Phase 22 expanded to 4)
- Updated `script-v3.test.ts` to accept 2-5 segments for PURGATORIO_Q4_SETUP (was 2-4, Phase 22 expanded to 5)

## Success Criteria Met

- [x] All 8 devolucoes rewritten with 3-layer structure (Winnicott + Lacan + Bion)
- [x] Each devolucao: 4-5 segments, ends with question OR persistent image
- [x] Anchor lines from D-07 preserved exactly (CONTRADICTED, SURFACE_KEEPER)
- [x] No scenario listing in any devolucao (pattern reading, not recap)
- [x] Oracle voice: direct, intimate, mirror-like, short sentences (<25 words in mirror segments)
- [x] All 51 script-v3 tests pass (including 2 fixed from Phase 22)
- [x] TypeScript compiles without errors in script.ts

## Deviations from Plan

None — plan executed exactly as written.

## Key Technical Decisions

1. **3-layer structure application:** Each devolucao now performs three acts:
   - Winnicott: Names pattern without judgment (recognition)
   - Lacan: Reads what pattern reveals about desire/defense (analytic act)
   - Bion: Names what was metabolized or evacuated (container reading)

2. **Depth through replacement, not addition:** Existing segments replaced with deeper content. No devolucao exceeded 5 segments.

3. **Scenario abstraction:** All scenario names (sala, coisa, jardim, água) removed from devolucoes. Pattern language now abstract ("entrou em tudo" not "entrou na sala, jardim").

4. **Anchor line preservation:** CONTRADICTED and SURFACE_KEEPER anchor lines kept exactly as-is, with new segments built around them.

## Performance

- **Duration:** 165 seconds (~2.75 minutes)
- **Tasks completed:** 2/2
- **Commits:** 2 (test fixes + devolucoes rewrite)
- **Tests passing:** 51/51 script-v3 tests
- **Files modified:** 2 (script.ts + script-v3.test.ts)

## Known Issues / Limitations

None. All acceptance criteria met.

## Self-Check

**Files created/modified:**
- [x] `src/data/script.ts` — verified present, lines 347-418 contain rewritten devolucoes
- [x] `src/data/__tests__/script-v3.test.ts` — verified present, test assertions updated

**Commits exist:**
- [x] `97e6928` — test(23-01): fix script test assertions for Phase 22 expansions
- [x] `bdcedf0` — feat(23-01): rewrite 8 devolucoes with 3-layer psychoanalytic structure

**SELF-CHECK: PASSED** — All files present, all commits exist, all tests pass.

---

**Next:** Phase 23 Plan 02 — Apresentação, Encerramento, Fallbacks, Timeouts polish
