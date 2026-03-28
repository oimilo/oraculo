# O Oráculo

## What This Is

Agente de voz interativo que guia visitantes por uma jornada inspirada na Divina Comédia de Dante, para a VII Bienal de Psicanálise e Cultura da SBPRP 2026. A IA assume o papel de guia — reconhece seus limites — conduzindo cada pessoa por Inferno, Purgatório e Paraíso em ~10 minutos, com 6 escolhas binárias por voz que revelam padrões psíquicos do visitante, culminando numa devolução personalizada baseada no desenho total das escolhas.

## Core Value

A experiência deve ser seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

## Current Milestone: v3.0 Narrative Redesign — 6 Choices

**Goal:** Reescrever toda a narrativa do Oráculo com 6 escolhas binárias (em vez de 3), devoluções baseadas em padrões, e profundidade psicanalítica absorvida em metáfora.

**Target features:**
- 6 escolhas binárias com escalação de profundidade (Light→Medium→Deep→Profound)
- Devoluções baseadas em padrões (Seeker/Guardian/Contradicted/Pivot) — leem a FORMA das 6 escolhas
- Zero referências explícitas a autores — tudo absorvido em metáfora
- Menos narração, mais decisão — cara de JOGO
- ~50 MP3s com ElevenLabs v3 e inflection tags
- State machine linear (não cascading): todos passam por todas as 6 escolhas

**Research basis:** 20 obras analisadas, 4 clusters temáticos, 24 cenários gerados, 6 selecionados.
See: `scripts/narrative-proposals/RESEARCH-SYNTHESIS.md`

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

### Active (v3.0)

- [ ] 6 binary choices with depth escalation across Inferno/Purgatório/Paraíso — *Phase 16*
- [ ] Pattern-based devoluções reading shape of 6 choices — *Phase 16*
- [ ] XState machine redesigned for 6 linear choices (~28 states) — *Phase 17*
- [ ] Pattern tracking in machine context (ChoiceAB[] array) — *Phase 17*
- [ ] Devolução routing via pattern-matching function — *Phase 17*
- [ ] OracleExperience updated for 6 choice points — *Phase 18*
- [ ] FallbackTTS updated for ~50 audio keys — *Phase 18*
- [ ] ~50 MP3s generated with ElevenLabs v3 — *Phase 19*
- [ ] All tests passing with new v3 structure — *Phase 20*

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

**Roteiro v3:** 6 escolhas binárias com escalação de profundidade, baseadas em pesquisa de 20 obras psicanalíticas. Padrões revelados na devolução: Seeker, Guardian, Contradicted, Pivot. Cada frase absorve profundidade psicanalítica em metáfora — ZERO referências explícitas.

**Decisões de UX já tomadas:**
- Input por voz apenas (NLU inteligente, não keywords)
- Redirecionamento poético quando não entende (não repetir pergunta seca)
- Silêncio prolongado = escolha default (contextual por pergunta)
- Tela mostra apenas feedback visual abstrato, nunca texto do roteiro
- Fluxo LINEAR: todos passam por todas as 6 escolhas (não cascading)

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

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-27 — v3.0 milestone created*
