# O Oráculo

## What This Is

Agente de voz interativo que guia visitantes por uma jornada inspirada na Divina Comédia de Dante, para a VII Bienal de Psicanálise e Cultura da SBPRP 2026. A IA assume o papel de Virgílio — guia que reconhece seus limites — conduzindo cada pessoa por Inferno, Purgatório e Paraíso em ~10 minutos, com escolhas por voz que personalizam o percurso entre 4 finais distintos.

## Core Value

A experiência deve ser seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

## Current Milestone: v1.0 O Oráculo — MVP para Bienal

**Goal:** Entregar o agente de voz funcional para 2-3 estações simultâneas no evento de 29-30 Mai 2026.

**Target features:**
- State machine controlando fluxo scripted completo (3 perguntas, 4 caminhos, 4 devoluções)
- TTS via ElevenLabs com voz variável por fase
- STT via Whisper + classificação NLU via Claude Haiku
- Sistema de ambientação sonora com crossfade entre fases
- UI minimalista (botão de início + feedback visual sutil)
- Fallback poético + timeout handling
- Analytics no Supabase
- Painel admin para operadores

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Fluxo scripted completo com 3 perguntas, 4 caminhos e 4 devoluções personalizadas
- [ ] Voz gerada via ElevenLabs TTS com variação de tom/ritmo por fase
- [ ] Captura de voz do visitante + transcrição (Whisper)
- [ ] Classificação inteligente de escolhas (Claude Haiku NLU)
- [ ] Ambientação sonora por fase com crossfade
- [ ] UI mínima: botão de início, feedback visual por fase, indicador de escuta
- [ ] Fallback poético quando não entende + timeout redirect
- [ ] Analytics: sessões, caminhos escolhidos, tempos, taxas de fallback
- [ ] Suporte a 2-3 estações simultâneas
- [ ] Painel admin com métricas e status das estações

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

**Roteiro:** Literário, preciso, com referências a Dante, Proust, Rilke, Dostoiévski, Belchior. Cada frase foi escolhida com cuidado. O PRD.md contém o roteiro completo com marcações de pausa e direção de voz.

**Decisões de UX já tomadas:**
- Input por voz apenas (NLU inteligente, não keywords)
- Redirecionamento poético quando não entende (não repetir pergunta seca)
- Silêncio prolongado = escolha default (Inferno→Silêncio, Purgatório→default contextual)
- A pergunta do Paraíso é reflexiva — não requer classificação
- Tela mostra apenas feedback visual abstrato, nunca texto do roteiro

## Constraints

- **Timeline**: Evento em 29-30 Mai 2026 — MVP deve estar pronto com margem para testes
- **Hardware**: Laptop + headphone com mic embutido. Browser moderno (Chrome/Edge)
- **Conectividade**: Internet necessária para APIs (ElevenLabs, Whisper, Claude). Backup offline para monólogos pré-gravados.
- **Privacidade (LGPD)**: Zero dados pessoais. Áudio descartado imediatamente após classificação. Sessões anônimas.
- **Custo**: APIs devem caber em ~$50 para 300 visitantes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ElevenLabs TTS (não Conversational AI) | Controle total do fluxo — somos nós que orquestramos, não o SDK deles | — Pending |
| Whisper para STT | Melhor accuracy em PT-BR para falas curtas/sussurradas | — Pending |
| Claude Haiku para NLU | Classificação binária rápida e barata (~100ms) | — Pending |
| XState para state machine | Controle preciso de estados, transições e timeouts para fluxo guiado | — Pending |
| Next.js + Supabase | SSR, API routes integradas, analytics persistidos, deploy Vercel | — Pending |

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
*Last updated: 2026-03-24 after milestone v1.0 initialization*
