---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: milestone
status: Ready to execute
last_updated: "2026-03-25T23:11:03.353Z"
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 3
  completed_plans: 1
---

# State: O Oráculo

## Project Reference

**Core Value:** Experiência seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.2 Voice Flow Stabilization

**Current Focus:** Phase 07 — voice-architecture-refactor

## Current Position

Phase: 07 (voice-architecture-refactor) — EXECUTING
Plan: 2 of 3

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

- Phases completed: 0/3
- Plans completed: 0/0
- Requirements validated: 0/19

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
9. **QUAL requirements first** — Refactor architecture (Phase 7) before bug fixes (Phases 8-9)

### Known Bugs (from v1.1 testing)

- STT not capturing voice responses during AGUARDANDO states
- TTS voices overlapping at decision points
- Flow sequence: question plays at TIMEOUT_REDIRECT instead of before AGUARDANDO
- NLU receives empty options due to stale closure in useVoiceChoice (partially patched)
- Unclear microphone lifecycle: when it opens, records, processes

### Active TODOs

- [ ] Plan Phase 7 (Voice Architecture Refactor)
- [ ] Identify specific refactoring targets in useVoiceChoice and TTS orchestration
- [ ] Review integration test suite for timing flakiness patterns
- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Pre-recorded audio files (25 MP3s) need studio recording before event
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Known Blockers

**Current:**

- None

## Session Continuity

**What just happened:**

- Milestone v1.2 initialized
- Roadmap created with 3 phases derived from 19 requirements
- All requirements mapped to phases with 100% coverage
- Phase structure: 7 (Refactor) → 8 (Flow+Mic) → 9 (Pipeline)

**What's next:**

- Run `/gsd:plan-phase 7` to decompose Voice Architecture Refactor
- Begin refactoring useVoiceChoice lifecycle states (QUAL-01)
- Decouple TTS orchestration from voice choice state (QUAL-02)

**Context for next session:**

- This is a STABILIZATION milestone — fixing voice flow bugs that prevent the experience from working
- QUAL requirements (refactoring) intentionally placed first to clean architecture before bug fixes
- Flow sequencing (Phase 8) and pipeline integration (Phase 9) depend on clean foundation from Phase 7
- Real API services already wired (v1.1 Phases 4-5) — this milestone fixes the orchestration layer

**Last session ended:** 2026-03-25 (roadmap creation)

**Next recommended command:**

`/gsd:plan-phase 7`

---
*Last updated: 2026-03-25 — Roadmap created for milestone v1.2*
