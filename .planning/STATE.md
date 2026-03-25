---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: real-api-connections
status: defining requirements
last_updated: "2026-03-25"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State: O Oráculo

## Project Reference

**Core Value:** Experiência seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.1 Real API Connections

**Current Focus:** Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-25 — Milestone v1.1 started

## Performance Metrics

**Milestone v1.0 (Complete):**

- Phases completed: 3/3
- Plans completed: 13/13
- Requirements validated: 41/41
- Days: 1 (2026-03-24 to 2026-03-25)

**Milestone v1.1:**

- Phases completed: 0/?
- Plans completed: 0/?
- Requirements validated: 0/?

## Accumulated Context

### Key Decisions

1. **ElevenLabs TTS (não Conversational AI)** — Controle total do fluxo orquestrado por nós, não SDK deles
2. **Whisper para STT** — Melhor accuracy em PT-BR para falas curtas/sussurradas
3. **Claude Haiku para NLU** — Classificação binária rápida e barata (~100ms)
4. **XState para state machine** — Controle preciso de estados, transições e timeouts para fluxo guiado
5. **Next.js + Supabase** — SSR, API routes integradas, analytics persistidos, deploy Vercel
6. **API keys server-side only** — Chaves ficam em Next.js API routes, nunca expostas ao cliente
7. **Plain fetch (sem SDKs)** — fetch direto para ElevenLabs/Whisper/Claude, só @supabase/supabase-js

### Active TODOs

- [ ] Define v1.1 requirements
- [ ] Create v1.1 roadmap
- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Pre-recorded audio files (25 MP3s) need studio recording before event

### Known Blockers

**Current:**

- None

**Anticipated:**

- ElevenLabs API key required for TTS integration
- OpenAI API key required for Whisper STT
- Anthropic API key required for Claude NLU
- Supabase project URL + anon key required for analytics

### Recent Changes

**2026-03-25:**

- Milestone v1.0 completed — 3 phases, 13 plans, 41 requirements all implemented with mocks
- Milestone v1.1 initialized — Real API Connections

## Session Continuity

**Last session ended:** 2026-03-25 (milestone v1.1 initialization)

**If returning after context loss, check:**

1. Current phase number (see "Current Position" above)
2. Active plan file (`.planning/phases/phase-{N}/PLAN.md`)
3. Recent blockers (see "Known Blockers" above)
4. Latest PROJECT.md decisions (Key Decisions table)

**Next recommended command:**

- Continue with requirements definition and roadmap creation

---
*Last updated: 2026-03-25 after milestone v1.1 initialization*
