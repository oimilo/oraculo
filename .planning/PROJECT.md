# O Oráculo

## What This Is

Agente de voz interativo que guia visitantes por uma jornada inspirada na Divina Comédia de Dante, para a VII Bienal de Psicanálise e Cultura da SBPRP 2026. A IA assume o papel de Virgílio — guia que reconhece seus limites — conduzindo cada pessoa por Inferno, Purgatório e Paraíso em ~10 minutos, com escolhas por voz que personalizam o percurso entre 4 finais distintos.

## Core Value

A experiência deve ser seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

## Current Milestone: v1.1 Real API Connections

**Goal:** Substituir serviços mock por integrações reais com ElevenLabs, Whisper, Claude e Supabase via API routes server-side.

**Target features:**
- ElevenLabs TTS: API route `/api/tts` + `ElevenLabsTTSService` com PHASE_VOICE_SETTINGS
- Whisper STT: API route `/api/stt` + `WhisperSTTService` (language=pt)
- Claude NLU: API route `/api/nlu` + `ClaudeNLUService` (Haiku, classificação binária)
- Supabase Analytics: `SupabaseAnalyticsService` + sessions table migration + RLS
- `.env.example` com template de todas as chaves necessárias
- Toggle `NEXT_PUBLIC_USE_REAL_APIS` para alternar mock↔real

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

### Active

(v1.1 requirements — see REQUIREMENTS.md for full list)

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
| ElevenLabs TTS (não Conversational AI) | Controle total do fluxo — somos nós que orquestramos, não o SDK deles | ✓ Good |
| Whisper para STT | Melhor accuracy em PT-BR para falas curtas/sussurradas | ✓ Good |
| Claude Haiku para NLU | Classificação binária rápida e barata (~100ms) | ✓ Good |
| XState para state machine | Controle preciso de estados, transições e timeouts para fluxo guiado | ✓ Good |
| Next.js + Supabase | SSR, API routes integradas, analytics persistidos, deploy Vercel | ✓ Good |
| API keys server-side only | Segurança — chaves de API ficam em API routes do Next.js, nunca no cliente | ✓ Good |
| Plain fetch (sem SDKs externos) | Simplicidade — fetch direto para ElevenLabs/Whisper/Claude, só @supabase/supabase-js | ✓ Good |

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
*Last updated: 2026-03-25 after Phase 05 completion — Real voice services (ElevenLabs TTS, Whisper STT, Claude NLU) wired and tested*
