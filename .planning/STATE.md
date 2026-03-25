---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: voice-flow-stabilization
status: Defining requirements
last_updated: "2026-03-25T22:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State: O Oráculo

## Project Reference

**Core Value:** Experiência seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.2 Voice Flow Stabilization

**Current Focus:** Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-25 — Milestone v1.2 started

## Performance Metrics

**Milestone v1.0 (Complete):**

- Phases completed: 3/3
- Plans completed: 13/13
- Requirements validated: 41/41
- Days: 1 (2026-03-24 to 2026-03-25)

**Milestone v1.1 (Paused — Phase 6 Supabase deferred):**

- Phases completed: 2/3 (Phase 4 API routes, Phase 5 Real voice services)
- Plans completed: 4/4
- Requirements validated: 0/16 (integration issues found during testing)

**Milestone v1.2:**

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
8. **v1.2 before Supabase** — Estabilizar fluxo de voz antes de adicionar analytics

### Known Bugs (from v1.1 testing)

- STT not capturing voice responses during AGUARDANDO states
- TTS voices overlapping at decision points
- Flow sequence: question plays at TIMEOUT_REDIRECT instead of before AGUARDANDO
- NLU receives empty options due to stale closure in useVoiceChoice (partially patched)
- Unclear microphone lifecycle: when it opens, records, processes

### Active TODOs

- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Pre-recorded audio files (25 MP3s) need studio recording before event
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Known Blockers

**Current:**

- None

## Session Continuity

**Last session ended:** 2026-03-25 (v1.2 milestone creation)

**Next recommended command:**

`/gsd:plan-phase 7` (after requirements + roadmap defined)

---
*Last updated: 2026-03-25 — Milestone v1.2 started*
