# Roadmap: O Oraculo

## Milestones

- v1.0 MVP (shipped 2026-03-25)
- v1.1 Real API Integration (Paused -- Phase 6 Supabase deferred)
- v1.2 Voice Flow Stabilization (shipped 2026-03-26)
- v1.3 Voice Capture Debug & Fix (shipped 2026-03-26)
- v2.0 Narração Realista com ElevenLabs v3 (shipped 2026-03-27)
- v3.0 Narrative Redesign — 6 Choices (shipped 2026-03-28)
- v3.1 Script Mastery (shipped 2026-03-28)
- v3.2 Integration & Audio (pending)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-3) - SHIPPED 2026-03-25</summary>

- [x] **Phase 1: State Machine & Core Flow** - XState v5 machine with 17 states, 4 branching paths
- [x] **Phase 2: Voice Services & UI** - TTS, STT, NLU services with mock pattern + ambient audio + UI
- [x] **Phase 3: Analytics, Multi-Station & Resilience** - Analytics, admin dashboard, offline fallback, timeouts

</details>

<details>
<summary>v1.1 Real API Integration (Phases 4-6) - PAUSED</summary>

- [x] **Phase 4: API Routes & Configuration** - Server-side API routes for ElevenLabs, Whisper, Claude
- [x] **Phase 5: Real Voice Services** - ElevenLabs TTS, Whisper STT, Claude NLU implementations
- [ ] **Phase 6: Supabase Analytics** - Deferred to post-event

</details>

<details>
<summary>v1.2 Voice Flow Stabilization (Phases 7-9) - SHIPPED 2026-03-26</summary>

- [x] **Phase 7: Voice Architecture Refactor** - useReducer FSM, generic guards, decoupled TTS
- [x] **Phase 8: Flow Sequencing & Mic Lifecycle** - TTS gating, mic activation gating, stream cleanup
- [x] **Phase 9: STT/NLU Pipeline Integration** - Pipeline integration tests, edge case hardening

</details>

<details>
<summary>v1.3 Voice Capture Debug & Fix (Phases 10-11) - SHIPPED 2026-03-26</summary>

- [x] **Phase 10: Pipeline Debug Instrumentation** - Dev debug panel + console logging for pipeline visibility
- [x] **Phase 11: TTS Reliability & Voice Pipeline Fix** - Fix root causes: waitForVoices timeout, MockTTS resolution, mic activation
- ~~Phase 12: Browser End-to-End Validation~~ - Dropped (manual browser testing sufficient)

</details>

<details>
<summary>v2.0 Narração Realista com ElevenLabs v3 (Phase 13) - SHIPPED 2026-03-27</summary>

- [x] **Phase 13: Voice Infrastructure & v3 Migration** - Verify voice IVC, update API to eleven_v3, convert SSML to audio tags
- ~~Phase 14: Script Preparation & Tag Strategy~~ - Absorbed into v3.0 Phase 16
- ~~Phase 15: Audio Generation & Quality Validation~~ - Absorbed into v3.0 Phase 19

</details>

<details>
<summary>v3.0 Narrative Redesign — Structure (Phases 16-17) - SHIPPED 2026-03-28</summary>

- [x] **Phase 16: Script Writing** - First draft PT-BR script with 6 choices, 12 responses, 8 devoluções, inflection tags
- [x] **Phase 17: State Machine & Data** - XState redesign for 6 linear choices (~42 states), pattern tracking, NLU keyword maps

</details>

<details>
<summary>v3.1 Script Mastery (Phases 21-24) - SHIPPED 2026-03-28</summary>

- [x] **Phase 21: Script Audit & Framework Integration** - 3 frameworks + 9 gold phrases audited (2 plans)
- [x] **Phase 22: Core Narrative Rewrite** - 6 choices deepened to depth 4-5 (3 plans)
- [x] **Phase 23: Devoluções & Bookends** - 8 devoluções + bookends + fallbacks/timeouts (2 plans)
- [x] **Phase 24: Rhythm, Inflection & Validation** - Timing optimized to 10.498 min, 60 tests (1 plan)

See: `.planning/milestones/v3.1-ROADMAP.md`

</details>

### v3.2 Integration & Audio (Pending)

- [x] **Phase 18: Components & Services** - OracleExperience.tsx, FallbackTTS, useVoiceChoice updates for 6 choice points (completed 2026-03-28)
- [x] **Phase 19: Audio Generation** - 49 MP3s generated with ElevenLabs v3 (completed 2026-03-28)
- [ ] **Phase 20: Testing** - Update all tests for new 6-choice structure

---

## Phase Details

### Phase 18: Components & Services (v3.2)
**Goal**: All UI components and services updated for 6-choice flow
**Depends on**: Phase 24 (script must be final)
**Requirements**: CMPV3-01, CMPV3-02, CMPV3-03
**Plans:** 2/2 plans complete

Plans:
- [x] 18-01-PLAN.md — FallbackTTS PRERECORDED_URLS dynamic derivation from SCRIPT keys
- [x] 18-02-PLAN.md — OracleExperience v3 state mapping, ChoiceConfigs, UI wiring

**Success Criteria**:
  1. OracleExperience handles all ~42 states
  2. FallbackTTS PRERECORDED_URLS updated for ~50 audio keys
  3. 6 ChoiceConfig objects with per-question NLU context

### Phase 19: Audio Generation (v3.2) — COMPLETE
**Goal**: Generate all MP3s for final script using ElevenLabs v3
**Depends on**: Phase 24 (script text final), Phase 18 (PRERECORDED_URLS)
**Requirements**: AUDV3-01, AUDV3-02
**Voice ID**: PznTnBc8X6pvixs9UkQm (confirmed by user)
**Results**: 49 MP3s, 27 MB total, mp3_44100_192 format
**Script**: scripts/generate-audio-v3.ts (imports from src/data/script.ts directly)
**Success Criteria**:
  1. ✅ 49 MP3s generated with eleven_v3 and inflection tags
  2. ✅ 192kbps format (mp3_44100_192), consistent voice

### Phase 20: Testing (v3.2)
**Goal**: All tests updated and passing for v3 structure
**Depends on**: Phase 18 (all code changes complete)
**Requirements**: TSTV3-01, TSTV3-02, TSTV3-03
**Success Criteria**:
  1. Machine tests cover all 6 choices, pattern tracking, devolução routing
  2. Component tests verify script key mapping
  3. All tests pass (no regressions)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 18. Components & Services | v3.2 | 2/2 | Complete    | 2026-03-28 |
| 19. Audio Generation | v3.2 | 1/1 | Complete | 2026-03-28 |
| 20. Testing | v3.2 | - | Not started | - |

## Dependencies

```
v3.1 Script Mastery (shipped):
  Phase 24: Polish (DONE)
                |
v3.2 Integration & Audio:
  Phase 18: Components → Phase 19: Audio → Phase 20: Testing
```

---

*Last updated: 2026-03-28 — Phase 19 complete (49 MP3s generated)*
