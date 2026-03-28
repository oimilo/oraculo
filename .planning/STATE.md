---
gsd_state_version: 1.0
milestone: v3.0
milestone_name: Narrative Redesign — 6 Choices
status: executing
stopped_at: Completed 17-01-PLAN.md (Type contracts + pattern matching)
last_updated: "2026-03-28T00:34:45.587Z"
last_activity: 2026-03-28
progress:
  total_phases: 5
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
  percent: 0
---

# State: O Oraculo

## Project Reference

**Core Value:** Experiencia seamless e imersiva como um jogo -- o visitante fala, ouve, e e transformado. Se a voz, o roteiro e as transicoes funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v2.0 Narração Realista com ElevenLabs v3

**Current Focus:** Phase 17 — state-machine-data

## Current Position

Phase: 17 (state-machine-data) — EXECUTING
Plan: 2 of 2
Status: Ready to execute
Last activity: 2026-03-28

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Milestone v1.0 (Complete):**

- Phases: 3/3, Plans: 13/13, Reqs: 41/41
- Duration: 1 day (2026-03-24 to 2026-03-25)

**Milestone v1.1 (Paused):**

- Phases: 2/3 (Phase 6 Supabase deferred)
- Plans: 4/4

**Milestone v1.2 (Complete):**

- Phases: 3/3 (Phases 7-9), Plans: 6/6
- Duration: 1 day (2026-03-25 to 2026-03-26)

**Milestone v1.3 (Complete):**

- Phases: 2/2 (Phases 10-11, Phase 12 dropped), Plans: 4/4
- Duration: 1 day (2026-03-26)
- Phase 12 (Browser E2E) dropped — manual testing sufficient

**Milestone v2.0 (Active):**

- Phases: 0/3, Plans: 0/?
- Target: Narração realista com ElevenLabs v3 + inflexão inteligente

## Accumulated Context

### Decisions

Recent decisions affecting current work:

- [Phase 9]: Frozen config snapshots prevent stale closures in async pipeline
- [Phase 9]: 10s AbortController timeout on STT/NLU API calls
- [Phase 8]: TTS-gated state transitions via ttsComplete flag
- [Phase 8]: micShouldActivate = isAguardando && ttsComplete
- [Phase 11]: waitForVoices timeout resolves with empty array (not reject) for graceful fallback
- [Phase 11]: Activation logging uses separate createLogger('Activation') namespace
- [Phase 13]: Pause thresholds: <500ms=none, 500-1500ms=[pause], >1500ms=[long pause] for v3 audio tags
- [Phase 13]: Inflection tags prepend directly to text without space: [tag]Text
- [Phase 13]: v2/v3 toggle via USE_V3_MODEL env var for safe testing
- [Phase 13]: v3 mode omits speed and use_speaker_boost (not supported by eleven_v3)
- [Phase 13]: Generation script reimplements convertPauseToTag inline (mjs cannot import ts)
- [Phase quick-260326-noe]: eleven_v3 does not support language_code param -- removed, v3 auto-detects language
- [Phase 16]: ScriptDataV3 replaces ScriptData with 47 keys for v3 narrative (6 choices, 8 devoluções, fallbacks, timeouts)
- [Phase 16]: Oracle voice: calm, knowing, slightly ironic, second person, short punchy sentences, game-like, zero author references
- [Phase 16]: Inflection tags sparse: max 2-3 per section, max 1 per SpeechSegment; pauseAfter 1200-2500ms normal, 0 for section finals and perguntas
- [Phase 16]: Devoluções read pattern SHAPE across Movement/Stillness and Toward/Away axes, not individual choices
- [Phase 16]: ENCERRAMENTO mirrors APRESENTACAO opening for structural symmetry; closes with imperative (Faz alguma coisa com isso)
- [Phase 16]: Q6 RESPOSTA_A bridges to devolução, Q6 RESPOSTA_B provides self-contained closure
- [Phase 17-01]: PIVOT detection requires strong dominance in both halves for clean direction change
- [Phase 17-01]: updateChoice helper encapsulates immutable tuple updates for XState assign()

### v2.0 Research Highlights

- ElevenLabs v3 replaces SSML `<break>` with audio tags (`[pause]`, `[thoughtful]`, etc.)
- Cloned voice must be IVC (not PVC) for v3 tag support
- Lower stability from 0.65-0.80 → 0.40-0.70 for Natural mode
- Remove `speaker_boost` and `speed` params (not supported in v3)
- Tag density: max 1-2 per phrase to avoid instability
- PT-BR punctuation needs normalization (travessão, abbreviations, accents)
- 192kbps minimum output for headphone delivery
- 5,000 char limit requires segment-aware generation

### Active TODOs

- [ ] 3 browser UAT items from v1.0 (multi-station, isolation, inactivity timeout)
- [ ] Phase 6 Supabase analytics (deferred from v1.1)

### Blockers

None.

## Session Continuity

Last session: 2026-03-28T00:34:45.584Z
Stopped at: Completed 17-01-PLAN.md (Type contracts + pattern matching)
Resume: /gsd:plan-phase 13
