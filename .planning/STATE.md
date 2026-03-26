---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Voice Capture Debug & Fix
status: Defining requirements
last_updated: "2026-03-26T12:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# State: O Oráculo

## Project Reference

**Core Value:** Experiência seamless e imersiva como um jogo — o visitante fala, ouve, e é transformado. Se a voz, o roteiro e as transições funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v1.3 Voice Capture Debug & Fix

**Current Focus:** Defining requirements

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-03-26 — Milestone v1.3 started

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

**Milestone v1.2 (Complete):**

- Phases completed: 3/3 (Phases 07-09)
- Plans completed: 6/6
- Requirements validated: 4/19 (QUAL-01 through QUAL-04)
- Focus: Voice architecture refactor, flow sequencing, STT/NLU pipeline

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

### Known Bugs (CRITICAL — v1.3 target)

- **Mic never activates in AGUARDANDO states** — user forced to click buttons manually
- Root cause suspected: MockTTSService → `waitForVoices()` hangs when SpeechSynthesis has no voices → `ttsComplete` stays false → `micShouldActivate` never becomes true
- Secondary: zero observability of pipeline state in browser (no debug panel)
- Tertiary: mock STT returns fixed "vozes" — impossible to test real voice in mock mode

### Active TODOs

- [ ] Debug panel to trace pipeline state in browser
- [ ] Fix MockTTSService SpeechSynthesis reliability
- [ ] Browser validation of full voice flow
- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Pre-recorded audio files (25 MP3s) — DONE via ElevenLabs
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Known Blockers

**Current:**

- None

## Session Continuity

**What just happened:**

- Milestone v1.3 started — Voice Capture Debug & Fix
- Deep code investigation identified root cause: MockTTSService depends on browser SpeechSynthesis which can hang, preventing ttsComplete from becoming true, blocking mic activation
- Key files analyzed: useVoiceChoice.ts, useMicrophone.ts, OracleExperience.tsx, MockTTSService, speechSynthesis.ts

**What's next:**

- Define requirements for v1.3
- Create roadmap
- Execute phases to fix voice capture

---
*Last updated: 2026-03-26 — Milestone v1.3 started*
