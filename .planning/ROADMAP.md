# Roadmap: O Oraculo

## Milestones

- v1.0 MVP (shipped 2026-03-25)
- v1.1 Real API Integration (Paused -- Phase 6 Supabase deferred)
- v1.2 Voice Flow Stabilization (shipped 2026-03-26)
- v1.3 Voice Capture Debug & Fix (shipped 2026-03-26)
- v2.0 Narração Realista com ElevenLabs v3 (shipped 2026-03-27)
- v3.0 Narrative Redesign — 6 Choices (in progress)

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

- [x] **Phase 10: Pipeline Debug Instrumentation** - Dev debug panel + console logging for pipeline visibility (completed 2026-03-26)
- [x] **Phase 11: TTS Reliability & Voice Pipeline Fix** - Fix root causes: waitForVoices timeout, MockTTS resolution, mic activation (completed 2026-03-26)
- ~~Phase 12: Browser End-to-End Validation~~ - Dropped (manual browser testing sufficient)

</details>

<details>
<summary>v2.0 Narração Realista com ElevenLabs v3 (Phase 13) - SHIPPED 2026-03-27</summary>

- [x] **Phase 13: Voice Infrastructure & v3 Migration** - Verify voice IVC, update API to eleven_v3, convert SSML to audio tags (completed 2026-03-26)
- ~~Phase 14: Script Preparation & Tag Strategy~~ - Absorbed into v3.0 Phase 16
- ~~Phase 15: Audio Generation & Quality Validation~~ - Absorbed into v3.0 Phase 19

</details>

### v3.0 Narrative Redesign — 6 Choices (In Progress)

- [x] **Phase 16: Script Writing** - Complete PT-BR script with 6 choices, 12 responses, 8-12 devoluções, inflection tags (completed 2026-03-27)
  **Plans:** 2 plans
  Plans:
  - [x] 16-01-PLAN.md — ScriptDataV3 interface + APRESENTACAO + INFERNO (Q1, Q2) + PURGATORIO (Q3, Q4)
  - [x] 16-02-PLAN.md — PARAISO (Q5, Q6) + 8 devoluções + ENCERRAMENTO + fallbacks + timeouts
- [ ] **Phase 17: State Machine & Data** - XState redesign for 6 linear choices (~28 states), pattern tracking, NLU keyword maps
  **Plans:** 2 plans
  Plans:
  - [x] 17-01-PLAN.md — v3 types (OracleContextV3, events, updateChoice) + pattern matching utility (determineArchetype, 8 archetype guards)
  - [ ] 17-02-PLAN.md — Rewrite oracleMachine.ts for v3 linear flow (INFERNO Q1+Q2, PURGATORIO Q3+Q4, PARAISO Q5+Q6, 8 devolucao routes) + tests
- [ ] **Phase 18: Components & Services** - OracleExperience.tsx, FallbackTTS, useVoiceChoice updates for 6 choice points
- [ ] **Phase 19: Audio Generation** - Generate ~50 MP3s with ElevenLabs v3 for new script
- [ ] **Phase 20: Testing** - Update all tests for new 6-choice structure

---

## Phase Details

### Phase 16: Script Writing
**Goal**: Complete narrative script with 6 binary choices across Inferno/Purgatório/Paraíso, pattern-based devoluções, and ElevenLabs v3 inflection tags
**Depends on**: Research synthesis (complete)
**Requirements**: SCRV3-01 (6 choices), SCRV3-02 (devoluções), SCRV3-03 (inflection tags)
**Plans:** 2/2 plans complete
**Success Criteria**:
  1. All 6 choice scenarios written in PT-BR with escalating depth (Light->Medium->Deep->Profound)
  2. 8-12 pattern-based devoluções covering Seeker/Guardian/Contradicted/Pivot archetypes
  3. All segments annotated with v3 inflection tags, max 1 per sentence
  4. Script data structure matches new ScriptDataV3 interface

### Phase 17: State Machine & Data
**Goal**: XState v5 machine redesigned for 6 linear choices with pattern tracking
**Depends on**: Phase 16 (script must exist for state mapping)
**Requirements**: SMV3-01 (linear flow), SMV3-02 (pattern tracking), SMV3-03 (devolução routing)
**Plans:** 1/2 plans executed
**Success Criteria**:
  1. Machine has ~28 states: 6x(SETUP->PERGUNTA->AGUARDANDO->RESPOSTA_A/B) + intro/devolução/encerramento
  2. Context tracks choices as ChoiceAB[] array of 6 entries
  3. Devolução routing uses pattern-matching function (not combinatorial guards)
  4. NLU keyword maps defined per question

### Phase 18: Components & Services
**Goal**: All UI components and services updated for 6-choice flow
**Depends on**: Phase 17 (machine must be defined)
**Requirements**: CMPV3-01 (OracleExperience), CMPV3-02 (FallbackTTS), CMPV3-03 (ChoiceButtons)
**Success Criteria**:
  1. OracleExperience getScriptKey/getBreathingDelay/getFallbackScript handle all ~28 states
  2. FallbackTTS PRERECORDED_URLS updated for ~50 audio keys
  3. 6 ChoiceConfig objects with per-question NLU context and keywords

### Phase 19: Audio Generation
**Goal**: Generate all MP3s for new script using ElevenLabs v3
**Depends on**: Phase 16 (script text), Phase 18 (PRERECORDED_URLS)
**Requirements**: AUDV3-01 (generation), AUDV3-02 (quality)
**Success Criteria**:
  1. ~50 MP3s generated with eleven_v3 model and inflection tags
  2. No audible artifacts, consistent voice across all clips

### Phase 20: Testing
**Goal**: All tests updated and passing for v3 structure
**Depends on**: Phase 18 (all code changes complete)
**Requirements**: TSTV3-01 (machine tests), TSTV3-02 (component tests), TSTV3-03 (integration)
**Success Criteria**:
  1. State machine tests cover all 6 choice points, pattern tracking, devolução routing
  2. OracleExperience tests verify script key mapping and breathing delays
  3. All existing tests pass (no regressions)

---

## Progress

**Execution Order:** Phase 16 -> Phase 17 -> Phase 18 -> Phase 19 -> Phase 20

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 16. Script Writing | v3.0 | 2/2 | Complete    | 2026-03-27 |
| 17. State Machine & Data | v3.0 | 1/2 | In Progress|  |
| 18. Components & Services | v3.0 | - | Not started | - |
| 19. Audio Generation | v3.0 | - | Not started | - |
| 20. Testing | v3.0 | - | Not started | - |

---

## Dependencies

```
Phase 16: Script Writing (narrative content)
    |
Phase 17: State Machine & Data (XState + types)
    |
Phase 18: Components & Services (wire everything)
    |
Phase 19: Audio Generation (MP3s from script)
    |
Phase 20: Testing (validate all)
```

---

*Last updated: 2026-03-27 — Phase 17 planned (2 plans), v3.0 in progress*
