# O Oráculo

## What This Is

Agente de voz interativo que guia visitantes por uma jornada inspirada na Divina Comédia de Dante, para a VII Bienal de Psicanálise e Cultura da SBPRP 2026. A IA assume o papel de guia — reconhece seus limites — conduzindo cada pessoa por Inferno, Purgatório e Paraíso em 5-7 minutos, com ~8-10 escolhas por voz (incluindo caminhos ramificados) que revelam padrões psíquicos do visitante, culminando numa devolução personalizada. Ritmo de jogo: mais decisões, menos monólogo.

## Core Value

A experiência deve ser seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

## Current Milestone: v4.0 Game Flow (Complete)

**Goal:** Transform the Oracle into a 5-7 min game-like experience with ~8-10 branching decision points, trimmed narration, and regenerated audio.

**Previous milestones:**
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

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-29 — Phase 29 complete (v4.0 Game Flow milestone done — all 5 phases shipped)*
