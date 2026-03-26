---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: milestone
status: Ready to plan
last_updated: "2026-03-26T00:27:24.342Z"
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 5
  completed_plans: 5
---

# State: O Oráculo

## Project Reference

**Core Value:** Experiência seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.2 Voice Flow Stabilization

**Current Focus:** Phase 08 — flow-sequencing-mic-lifecycle

## Current Position

Phase: 9
Plan: Not started

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

- Phases completed: 1/3 (Phase 07 complete)
- Plans completed: 3/3
- Requirements validated: 4/19 (QUAL-01, QUAL-02, QUAL-03, QUAL-04)

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
10. **Real timers for integration tests (QUAL-04)** — Catch production timing bugs in CI instead of hiding them with fake timers

### Known Bugs (from v1.1 testing)

- STT not capturing voice responses during AGUARDANDO states
- TTS voices overlapping at decision points
- Flow sequence: question plays at TIMEOUT_REDIRECT instead of before AGUARDANDO
- NLU receives empty options due to stale closure in useVoiceChoice (partially patched)
- Unclear microphone lifecycle: when it opens, records, processes

### Active TODOs

- [x] Phase 7 (Voice Architecture Refactor) — COMPLETE (Plans 01-03)
- [x] useVoiceChoice refactored to useReducer FSM (QUAL-01)
- [x] TTS orchestration decoupled into useTTSOrchestrator (QUAL-02)
- [x] Generic guard factory with XState v5 setup() (QUAL-03)
- [x] Integration tests with realistic timing (QUAL-04)
- [ ] Plan Phase 8 (Flow Sequencing + Microphone Lifecycle)
- [ ] Plan Phase 9 (Voice Pipeline Integration)
- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Pre-recorded audio files (25 MP3s) need studio recording before event
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Known Blockers

**Current:**

- None

## Session Continuity

**What just happened:**

- Phase 07 (Voice Architecture Refactor) completed — all 3 plans executed successfully
- Plan 07-01: useVoiceChoice refactored to useReducer FSM, TTS extracted to useTTSOrchestrator
- Plan 07-02: Generic guard factory created, oracleMachine migrated to XState v5 setup()
- Plan 07-03: Integration tests rewritten with realistic async timing patterns
- All 253 tests passing, zero regressions
- Requirements validated: QUAL-01, QUAL-02, QUAL-03, QUAL-04

**What's next:**

- Run `/gsd:verify-phase 07` to validate Phase 7 completion
- Plan Phase 8 (Flow Sequencing + Microphone Lifecycle) to fix flow bugs
- Plan Phase 9 (Voice Pipeline Integration) to fix STT/NLU integration

**Context for next session:**

- This is a STABILIZATION milestone — fixing voice flow bugs that prevent the experience from working
- QUAL requirements (refactoring) intentionally placed first to clean architecture before bug fixes
- Flow sequencing (Phase 8) and pipeline integration (Phase 9) depend on clean foundation from Phase 7
- Real API services already wired (v1.1 Phases 4-5) — this milestone fixes the orchestration layer

**Last session ended:** 2026-03-25 (Phase 07 execution — Plan 03 complete)

**Next recommended command:**

`/gsd:verify-phase 07`

---
*Last updated: 2026-03-25T23:26:26Z — Phase 07 complete, ready for verification*
