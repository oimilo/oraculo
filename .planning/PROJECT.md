# O Oráculo

## What This Is

Agente de voz interativo que guia visitantes por uma jornada inspirada na Divina Comédia de Dante, para a VII Bienal de Psicanálise e Cultura da SBPRP 2026. A IA assume o papel de guia — reconhece seus limites — conduzindo cada pessoa por Inferno, Purgatório e Paraíso em 5-7 minutos, com ~8-10 escolhas por voz (incluindo caminhos ramificados) que revelam padrões psíquicos do visitante, culminando numa devolução personalizada. Ritmo de jogo: mais decisões, menos monólogo.

## Core Value

A experiência deve ser seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

## Current Milestone: v6.0 Deep Branching

**Goal:** Adicionar 3 novas branches condicionais (Q1B, Q5B, Q6B) ao fluxo do Oráculo, mais o arquétipo DEVOLUCAO_ESPELHO_SILENCIOSO e 2 arquétipos detectáveis novos (CONTRA_FOBICO, PORTADOR), aprofundando a sensação oracular sem gamificar.

**Target features:**
- Q1B "A Porta no Fundo" — branch contra-fóbica no Inferno (trigger: q1=B && q2=B), espelho do Q2B
- Q5B "O Que Já Não Cabe" — branch no Paraíso (trigger: q4=A && q5=A), fecha gap de branching no Paraíso
- Q6B "O Espelho Extra" — branch raríssima pré-devolução (trigger: q5=B && q6=A)
- DEVOLUCAO_ESPELHO_SILENCIOSO — novo arquétipo: devolve estrutura aberta em vez de diagnóstico fechado
- CONTRA_FOBICO — arquétipo detectável quando q1b=A (atravessou o vazio)
- PORTADOR — arquétipo detectável quando q5b=A (fundiu memória + pergunta)
- ~24 MP3s novos via ElevenLabs v3, ~78 estados na máquina total
- Mitigation de overflow temporal (max-path ~7:20) + browser UAT em ≥3 caminhos

**Previous milestones:**
- v5.0 Tester UI Polish (shipped 2026-04-06, ad-hoc closeout) — Phase 30 R3F audio-reactive visuals + ambient audio + voice pipeline fixes + intro delay + roteiro page (work shipped via direct commits, never formally closed via /gsd:complete-milestone)
- v4.0 Game Flow (shipped 2026-03-29) — 8 branching decisions, 61 MP3s, 54-state machine, 5-7 min experience
- v3.2 Integration & Audio (shipped 2026-03-28) — components updated for 6-choice, 49 MP3s generated
- v3.1 Script Mastery (shipped 2026-03-28) — script elevated to production quality with 3 frameworks absorbed
- v3.0 Narrative Redesign (shipped 2026-03-28) — first draft script + XState v5 rewrite

## Requirements

### Validated

- [x] Fluxo scripted completo com 3 perguntas, 4 caminhos e 4 devoluções personalizadas — *Validated in Phase 1*
- [x] Voz gerada via ElevenLabs TTS com variação de tom/ritmo por fase — *Validated in Phase 2 (mock/interface ready)*
- [x] Captura de voz do visitante + transcrição (Whisper) — *Validated in Phase 2 (mock/interface ready)*
- [x] Classificação inteligente de escolhas (Claude Haiku NLU) — *Validated in Phase 2 (mock/interface ready)*
- [x] Ambientação sonora por fase com crossfade — *Validated in Phase 2*
- [x] UI mínima: botão de início, feedback visual por fase, indicador de escuta — *Validated in Phases 1+2*
- [x] Fallback poético quando não entende + timeout redirect — *Validated in Phase 2*
- [x] Analytics: sessões, caminhos escolhidos, tempos, taxas de fallback — *Validated in Phase 3 (localStorage mock)*
- [x] Suporte a 2-3 estações simultâneas — *Validated in Phase 3 (browser UAT pending)*
- [x] Painel admin com métricas e status das estações — *Validated in Phase 3*
- [x] Fallback offline com áudios pré-gravados — *Validated in Phase 3 (audio files pending studio recording)*
- [x] Inactivity timeout 30s → reset to IDLE — *Validated in Phase 3*
- [x] v3 audio tag conversion (buildV3Text, convertPauseToTag) — *Validated in Phase 13*
- [x] API route v2/v3 dual-mode via USE_V3_MODEL env flag — *Validated in Phase 13*
- [x] Voice IVC compatibility documented — *Phase 13*

### Shipped (v6.0 — Deep Branching, in progress)

- [x] Q1B "A Porta no Fundo" branch contra-fobica (BR-01) — script + QUESTION_META[9] + shouldBranchQ1B guard + 6 machine states + OracleExperience helpers + 6 MP3s + timing-validation matrix + roteiro.html docs — *Validated in Phase 31*
- [x] Q5B "O Que Já Não Cabe" branch no Paraíso (BR-02) — script + QUESTION_META[10] + shouldBranchQ5B guard (q4=A && q5=A) + 6 machine states + OracleExperience helpers + 6 MP3s + 12-path timing matrix + roteiro.html sync — *Validated in Phase 32*
- [x] Q6B "O Espelho Extra" branch pré-devolução (BR-03) — script + QUESTION_META[11] + shouldBranchQ6B guard (q5=B && q6=A) + 6 machine states with qualified #oracle.DEVOLUCAO rejoin + OracleExperience helpers + 6 MP3s + 20-path timing matrix + roteiro.html sync — *Validated in Phase 33*
- [x] DEVOLUCAO_ESPELHO_SILENCIOSO archetype (AR-01) — script (6 segments, ~24s) + isEspelhoSilencioso guard + DEVOLUCAO.always[0] HIGHEST priority insertion + top-level state + OracleExperience helpers + 1 MP3 — *Validated in Phase 33*
- [x] DEVOLUCAO_CONTRA_FOBICO archetype (AR-02) — script (6 segments) + isContraFobico guard (q1=B && q2=B && q1b=A) + DEVOLUCAO.always[1] priority + top-level state + OracleExperience.getScriptKey + 1 MP3 (1.06 MB) + roteiro card — *Validated in Phase 34*
- [x] DEVOLUCAO_PORTADOR archetype (AR-03) — script (6 segments) + isPortador guard (q4=A && q5=A && q5b=A) + DEVOLUCAO.always[2] priority + top-level state + OracleExperience.getScriptKey + 1 MP3 (1.10 MB) + roteiro card — *Validated in Phase 34*
- [x] POL-02 ChoiceMap extension without modifying patternMatching.ts — *Validated in Phases 31, 32, 33, and 34*

### Shipped (v3.2 — Integration & Audio)

- [x] OracleExperience updated for 6 choice points — *Validated in Phase 18*
- [x] FallbackTTS updated for ~50 audio keys — *Validated in Phase 18*
- [x] 49 MP3s generated with ElevenLabs v3 (27 MB, mp3_44100_192) — *Phase 19*

### Shipped (v4.0 — Game Flow)

- [x] All segments trimmed to 5-7 min max-path (pacing validated at 5:00.1 min) — *Validated in Phase 25*
- [x] Branch content Q2B + Q4B with psychoanalytic depth, variable-length ChoicePattern, percentage-based archetype matching — *Validated in Phase 26*
- [x] XState v4 machine with conditional Q2B/Q4B branching, choiceMap named tracking, 12 new states — *Validated in Phase 27*
- [x] 61 MP3s regenerated via ElevenLabs v3 (17 MB, mp3_44100_192), FallbackTTS dynamic coverage — *Validated in Phase 28*
- [x] OracleExperience Q2B/Q4B branching UI integration (8 AGUARDANDO states, script keys, fallbacks, breathing delays) — *Validated in Phase 29*
- [x] Test suite aligned for v4 structure (496/521 tests, 32/34 suites, 18 new Q2B/Q4B tests) — *Validated in Phase 29*

### Shipped (v3.1 — Script Mastery)

- [x] Script audited against 3 theoretical frameworks + 9 gold phrases — *v3.1 Phase 21*
- [x] 6 choices rewritten with absorbed psychoanalytic depth — *v3.1 Phase 22*
- [x] 8 devoluções rewritten as genuine pattern mirrors — *v3.1 Phase 23*
- [x] Apresentação/Encerramento/fallbacks/timeouts polished — *v3.1 Phase 23*
- [x] Rhythm, inflection & timing validated (≤10 min) — *v3.1 Phase 24*

### Shipped (v3.0 — Structure)

- [x] First draft script with 6 choices, 8 devoluções, inflection tags — *Phase 16*
- [x] XState machine redesigned for 6 linear choices (~42 states) — *Phase 17*
- [x] Pattern tracking in machine context (ChoiceAB[] array) — *Phase 17*
- [x] Devolução routing via pattern-matching function (8 archetypes) — *Phase 17*

### Out of Scope

- Bacia de água com sensor de toque — substituído por botão digital simples
- Chat livre com a IA — é experiência guiada, não chatbot
- Coleta de dados pessoais — LGPD compliance total
- App mobile nativo — webapp acessado via browser no laptop
- Múltiplos idiomas — apenas português brasileiro

## Context

**Evento:** VII Bienal de Psicanálise e Cultura — SBPRP 2026. Tema: "Da Selva Escura ao Paraíso — Sonhos em Trânsito". Dias 29-30 de maio de 2026.

**Público:** Psicanalistas, psicólogos, artistas, acadêmicos e público geral. ~200-500 visitantes ao longo de 2 dias.

**Setup físico:** 2-3 laptops com headphone (mic embutido). Webapp rodando no browser. Um operador por estação para instruir visitantes e ajustar volume.

**Roteiro v4.0 (branching):** 6 base + 2 conditional branch questions (Q2B, Q4B) = 8 max decision points. 3 frameworks absorbed. 8 devoluções with 3-layer mirror. Max-path: 5:57.1 min (validated across 4 branch permutations). Timing script: `scripts/validate-timing.ts`.

**Decisões de UX já tomadas:**
- Input por voz apenas (NLU inteligente, não keywords)
- Redirecionamento poético quando não entende (não repetir pergunta seca)
- Silêncio prolongado = escolha default (contextual por pergunta)
- Tela mostra apenas feedback visual abstrato, nunca texto do roteiro
- Fluxo com BRANCHING: 6 base + 2 conditional branches (Q2B, Q4B) = 8 decision points max

## Constraints

- **Timeline**: Evento em 29-30 Mai 2026 — MVP deve estar pronto com margem para testes
- **Hardware**: Laptop + headphone com mic embutido. Browser moderno (Chrome/Edge)
- **Conectividade**: Internet necessária para APIs (ElevenLabs, Whisper, Claude). Backup offline para monólogos pré-gravados.
- **Privacidade (LGPD)**: Zero dados pessoais. Áudio descartado imediatamente após classificação. Sessões anônimas.
- **Custo**: APIs devem caber em ~$50 para 300 visitantes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ElevenLabs TTS (não Conversational AI) | Controle total do fluxo — somos nós que orquestramos, não o SDK deles | Good |
| Whisper para STT | Melhor accuracy em PT-BR para falas curtas/sussurradas | Good |
| Claude Haiku para NLU | Classificação binária rápida e barata (~100ms) | Good |
| XState para state machine | Controle preciso de estados, transições e timeouts para fluxo guiado | Good |
| useReducer FSM for voice choice | Explicit 5-state lifecycle eliminates impossible states | Good — Phase 7 |
| Frozen config snapshots | configRef.current frozen when active=true prevents stale closures | Good — Phase 9 |
| API timeout protection | 10s AbortController timeout on STT/NLU API calls | Good — Phase 9 |
| 6 linear choices (not cascading) | All visitors experience all 6 choices — richer pattern data for devolução | Good — v3.0 |
| Pattern-based devoluções | Read SHAPE of 6 choices instead of combinatorial paths (64→8-12 variants) | Good — v3.0 |
| Zero explicit references | Psychoanalytic depth felt, not declared — absorb into metaphor | Good — v3.0 |
| 3-layer devolução structure | Winnicott pattern + Lacan structure + Bion transformation — each framework reads different aspect | Good — v3.1 |
| Gold phrase absorption (not quotation) | Metabolize essences into Oracle voice — "circulos" becomes "circulo perfeito de conforto" | Good — v3.1 |
| Pause compression 800-2000ms | Reduced from 1200-2800ms to fit 10.5-min target while preserving relative emotional weight | Good — v3.1 |
| Branching paths over linear flow | More game-like engagement, choices feel consequential, replayability increases | — v4.0 |
| 5-7 min target (down from 10.5) | Bienal foot traffic demands shorter sessions; game pacing keeps engagement high | — v4.0 |
| Deep branching com 5 conditional branches | Recompensa perfis extremos com camada extra ORACULAR; mantém max-path em ~7:20 (overflow ~1-3% visitantes) | — v6.0 |
| ESPELHO_SILENCIOSO devolve forma, não conteúdo | Quando visitante dissolve a própria pergunta + pede leitura, Oráculo devolve estrutura aberta como respeito ao gesto original | — v6.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 — Phase 34 Detectable Archetypes complete (AR-02 + AR-03 satisfied; isContraFobico + isPortador guards wired into oracleMachine at DEVOLUCAO.always[1]+[2] priority below ESPELHO_SILENCIOSO, 2 new top-level devolução states, 2 new MP3s, 24-path timing matrix max 7:11.2 min within 7:30 budget with 18.8s headroom; POL-02 deeper invariant preserved via field-isolated choiceMap reads — 78/78 patternMatching tests pass; 14/14 must-haves verified; browser UAT deferred to Phase 35)*
