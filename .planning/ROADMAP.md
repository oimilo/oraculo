# Roadmap: O Oraculo

## Milestones

- v1.0 MVP (shipped 2026-03-25)
- v1.1 Real API Integration (Paused -- Phase 6 Supabase deferred)
- v1.2 Voice Flow Stabilization (shipped 2026-03-26)
- v1.3 Voice Capture Debug & Fix (shipped 2026-03-26)
- v2.0 Narração Realista com ElevenLabs v3 (in progress)

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

### v2.0 Narração Realista com ElevenLabs v3 (In Progress)

- [ ] **Phase 13: Voice Infrastructure & v3 Migration** - Verify voice IVC, update API to eleven_v3, convert SSML to audio tags
- [ ] **Phase 14: Script Preparation & Tag Strategy** - PT-BR punctuation audit, inflection tag annotation, character budgeting
- [ ] **Phase 15: Audio Generation & Quality Validation** - Regenerate 25 MP3s with v3, quality validation, A/B comparison

---

## Phase Details

### Phase 13: Voice Infrastructure & v3 Migration
**Goal**: ElevenLabs v3 API integration working with cloned voice, SSML-to-audio-tag conversion, and backward compatibility
**Depends on**: Phase 11 (voice pipeline must be stable)
**Requirements**: VINF-01, VINF-02, VINF-03
**Plans:** 2 plans
Plans:
- [ ] 13-01-PLAN.md -- Data model + v3 audio tag conversion layer (buildV3Text, convertPauseToTag)
- [ ] 13-02-PLAN.md -- API route v2/v3 dual-mode + generation script v3 migration
**Success Criteria** (what must be TRUE):
  1. Voice `AcSHc9S7hdxvGEJVWFzo` verified as IVC and confirmed working with v3 audio tags
  2. API route and generation script use `eleven_v3` model with correct parameters (no `speed`, no `speaker_boost`, `language_code: 'pt-BR'`)
  3. `buildV3Text()` converts `pauseAfter` to audio tags (`[pause]`, `[long pause]`) and prepends inflection tags
  4. Both v2 and v3 paths work via env flag for safe testing

### Phase 14: Script Preparation & Tag Strategy
**Goal**: All 25 script segments annotated with correct PT-BR punctuation and strategic inflection tags
**Depends on**: Phase 13 (voice compatibility must be verified before tagging)
**Requirements**: SCRP-01, SCRP-02, SCRP-03
**Success Criteria** (what must be TRUE):
  1. All script segments pass PT-BR punctuation validation (accents, travessão, vírgulas)
  2. Each segment has inflection tags matching PRD voice directions (calmo/grave/intimo/sussurro/determinado)
  3. Tag density is max 1 per sentence, total tag overhead under 15% of character count per segment

### Phase 15: Audio Generation & Quality Validation
**Goal**: 25 high-quality MP3s with emotional inflection replace v2 pre-recorded audio
**Depends on**: Phase 14 (script must be annotated before generation)
**Requirements**: AGEN-01, AGEN-02, AGEN-03
**Success Criteria** (what must be TRUE):
  1. All 25 MP3s regenerated at 192kbps minimum with `eleven_v3` model
  2. No MP3 has audible static, tag read-aloud artifacts, or robotic delivery
  3. Emotional tone matches PRD directions per phase and voice is consistent across all 25 clips

---

## Progress

**Execution Order:** Phase 13 -> Phase 14 -> Phase 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 13. Voice Infrastructure & v3 Migration | v2.0 | 0/2 | Planning complete | - |
| 14. Script Preparation & Tag Strategy | v2.0 | 0/? | Not started | - |
| 15. Audio Generation & Quality Validation | v2.0 | 0/? | Not started | - |

---

## Dependencies

```
Phase 13: Voice Infrastructure & v3 Migration (verify voice + API compatibility)
    |
Phase 14: Script Preparation & Tag Strategy (annotate script with validated tags)
    |
Phase 15: Audio Generation & Quality Validation (generate final MP3s)
```

---

## Coverage

**Total v2.0 Requirements:** 9

- Voice Infrastructure: 3 (VINF-01 to VINF-03)
- Script Quality: 3 (SCRP-01 to SCRP-03)
- Audio Generation: 3 (AGEN-01 to AGEN-03)

**Mapped to Phases:** 9/9

| Requirement | Phase | Status |
|-------------|-------|--------|
| VINF-01 | Phase 13 | Pending |
| VINF-02 | Phase 13 | Pending |
| VINF-03 | Phase 13 | Pending |
| SCRP-01 | Phase 14 | Pending |
| SCRP-02 | Phase 14 | Pending |
| SCRP-03 | Phase 14 | Pending |
| AGEN-01 | Phase 15 | Pending |
| AGEN-02 | Phase 15 | Pending |
| AGEN-03 | Phase 15 | Pending |

---

*Last updated: 2026-03-26 -- Phase 13 planned (2 plans, 2 waves)*
