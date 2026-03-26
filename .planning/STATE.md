---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Narração Realista com ElevenLabs v3
status: planning
stopped_at: v1.3 closed, v2.0 roadmap created
last_updated: "2026-03-26T18:00:00.000Z"
last_activity: 2026-03-26
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# State: O Oraculo

## Project Reference

**Core Value:** Experiencia seamless e imersiva como um jogo -- o visitante fala, ouve, e e transformado. Se a voz, o roteiro e as transicoes funcionarem perfeitamente, tudo funciona.

**Current Milestone:** v2.0 Narração Realista com ElevenLabs v3

**Current Focus:** Planning Phase 13 (Voice Infrastructure & v3 Migration)

## Current Position

Phase: 13 - Voice Infrastructure & v3 Migration
Plan: —
Status: Planning
Last activity: 2026-03-26 — v1.3 closed, v2.0 roadmap created

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

Last session: 2026-03-26
Stopped at: v1.3 closed, v2.0 roadmap created
Resume: /gsd:plan-phase 13
