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
- v4.0 Game Flow (active)

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

<details>
<summary>v3.2 Integration & Audio (Phases 18-20) - SHIPPED 2026-03-28</summary>

- [x] **Phase 18: Components & Services** - OracleExperience.tsx, FallbackTTS, useVoiceChoice updates for 6 choice points (completed 2026-03-28)
- [x] **Phase 19: Audio Generation** - 49 MP3s generated with ElevenLabs v3 (completed 2026-03-28)
- [ ] **Phase 20: Testing** - Update all tests for new 6-choice structure (skipped for v4.0 pivot)

</details>

### v4.0 Game Flow (Active)

- [x] **Phase 25: Script Restructure — Pacing** - Trim all segments to 5-7 min target (completed 2026-03-28)
- [ ] **Phase 26: Script Restructure — Branching** - Design and write 8-10 decision points with branching paths
- [ ] **Phase 27: State Machine Redesign** - XState v5 with conditional transitions for branching
- [ ] **Phase 28: Audio Regeneration** - Generate all MP3s for trimmed/branching script
- [ ] **Phase 29: Integration & Validation** - Update components/services, verify all tests pass

---

## Phase Details

### Phase 18: Components & Services (v3.2) - COMPLETE
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

### Phase 19: Audio Generation (v3.2) - COMPLETE
**Goal**: Generate all MP3s for final script using ElevenLabs v3
**Depends on**: Phase 24 (script text final), Phase 18 (PRERECORDED_URLS)
**Requirements**: AUDV3-01, AUDV3-02
**Voice ID**: PznTnBc8X6pvixs9UkQm (confirmed by user)
**Results**: 49 MP3s, 27 MB total, mp3_44100_192 format
**Script**: scripts/generate-audio-v3.ts (imports from src/data/script.ts directly)
**Success Criteria**:
  1. 49 MP3s generated with eleven_v3 and inflection tags
  2. 192kbps format (mp3_44100_192), consistent voice

### Phase 20: Testing (v3.2) - SKIPPED
**Goal**: All tests updated and passing for v3 structure
**Depends on**: Phase 18 (all code changes complete)
**Requirements**: TSTV3-01, TSTV3-02, TSTV3-03
**Status**: Skipped for v4.0 pivot — testing will be done in Phase 29
**Success Criteria**:
  1. Machine tests cover all 6 choices, pattern tracking, devolução routing
  2. Component tests verify script key mapping
  3. All tests pass (no regressions)

### Phase 25: Script Restructure — Pacing (v4.0)
**Goal**: Experience runs 5-7 minutes with trimmed segments preserving psychoanalytic depth
**Depends on**: Phase 24 (v3.1 script as baseline)
**Requirements**: PACE-01, PACE-02, PACE-03, PACE-04, PACE-05
**Plans:** 2/2 plans complete

Plans:
- [x] 25-01-PLAN.md — Surgical trim of all script sections (bookends, intros, setups, respostas, devoluções)
- [x] 25-02-PLAN.md — Timing validation script + duration adjustment to hit 5-7 min target

**Success Criteria** (what must be TRUE):
  1. Max-path experience duration is 5-7 minutes when audio is generated
  2. All respostas contain 1-2 segments maximum (down from 4-5)
  3. All setups contain 1-2 segments maximum (down from 3-5)
  4. Phase intros reduced to 1 sentence each
  5. Bookends trimmed while preserving emotional impact and structural symmetry

### Phase 26: Script Restructure — Branching (v4.0)
**Goal**: Experience offers 8-10 decision points with branching paths that converge before devoluções
**Depends on**: Phase 25 (trimmed script as foundation)
**Requirements**: BRNC-01, BRNC-02, BRNC-03, BRNC-04
**Success Criteria** (what must be TRUE):
  1. Experience has 8-10 total decision points (up from 6)
  2. At least 2 branching points where choice A leads to different scenario than choice B
  3. All branch paths converge before devoluções (no orphaned endings)
  4. Branch-specific content maintains depth 4-5 psychoanalytic quality
  5. NLU keyword maps updated for all new decision points
**Plans**: TBD
**UI hint**: yes

### Phase 27: State Machine Redesign (v4.0)
**Goal**: XState machine handles conditional branching transitions and variable-length choice paths
**Depends on**: Phase 26 (branching structure finalized)
**Requirements**: MACH-01, MACH-02, MACH-03
**Success Criteria** (what must be TRUE):
  1. XState machine uses conditional transitions (guards) to route based on previous choices
  2. Pattern tracking context updated to handle variable-length paths (6-10 choices)
  3. Devoluçao routing function works for all possible branch combinations
  4. Machine tests cover all branching scenarios and pattern variations
**Plans**: TBD

### Phase 28: Audio Regeneration (v4.0)
**Goal**: All MP3s regenerated for trimmed/branching script with consistent voice quality
**Depends on**: Phase 27 (final script keys known)
**Requirements**: AUDI-01, AUDI-02
**Success Criteria** (what must be TRUE):
  1. All MP3s regenerated using ElevenLabs v3 (voice ID PznTnBc8X6pvixs9UkQm)
  2. FallbackTTS PRERECORDED_URLS updated to match new script keys
  3. Audio format consistent (mp3_44100_192, 192kbps)
  4. Total audio size reasonable for browser loading
**Plans**: TBD

### Phase 29: Integration & Validation (v4.0)
**Goal**: All components updated for branching flow with passing tests
**Depends on**: Phase 28 (audio files ready)
**Requirements**: INTG-01, INTG-02
**Success Criteria** (what must be TRUE):
  1. OracleExperience component handles conditional branching UI states
  2. useVoiceChoice hook updated for variable-length choice sequences
  3. All machine tests pass (branching transitions, pattern tracking, devolução routing)
  4. All component tests pass (script key mapping, UI state rendering)
  5. Manual browser verification confirms 5-7 min experience with branching
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 18. Components & Services | v3.2 | 2/2 | Complete    | 2026-03-28 |
| 19. Audio Generation | v3.2 | 1/1 | Complete | 2026-03-28 |
| 20. Testing | v3.2 | - | Skipped | - |
| 25. Script Pacing | v4.0 | 2/2 | Complete   | 2026-03-28 |
| 26. Script Branching | v4.0 | 0/? | Not started | - |
| 27. State Machine | v4.0 | 0/? | Not started | - |
| 28. Audio Regen | v4.0 | 0/? | Not started | - |
| 29. Integration | v4.0 | 0/? | Not started | - |

## Dependencies

```
v3.1 Script Mastery (shipped):
  Phase 24: Polish (DONE)
                |
v3.2 Integration & Audio (shipped):
  Phase 18: Components → Phase 19: Audio → Phase 20: Testing (skipped)
                |
v4.0 Game Flow (active):
  Phase 25: Pacing → Phase 26: Branching → Phase 27: Machine → Phase 28: Audio → Phase 29: Integration
```

---

*Last updated: 2026-03-28 — Phase 25 planned (2 plans)*
