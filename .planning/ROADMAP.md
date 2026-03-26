# Roadmap: O Oraculo

## Milestones

- v1.0 MVP (shipped 2026-03-25)
- v1.1 Real API Integration (Paused -- Phase 6 Supabase deferred)
- v1.2 Voice Flow Stabilization (shipped 2026-03-26)
- v1.3 Voice Capture Debug & Fix (in progress)

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

### v1.3 Voice Capture Debug & Fix (In Progress)

- [x] **Phase 10: Pipeline Debug Instrumentation** - Dev debug panel + console logging for pipeline visibility (completed 2026-03-26)
- [ ] **Phase 11: TTS Reliability & Voice Pipeline Fix** - Fix root causes: waitForVoices timeout, MockTTS resolution, mic activation
- [ ] **Phase 12: Browser End-to-End Validation** - Validate full flow in real browser with mock and real APIs

---

## Phase Details

### Phase 10: Pipeline Debug Instrumentation
**Goal**: Developers can see exactly where the voice pipeline breaks in real-time
**Depends on**: Phase 9 (pipeline architecture must be stable before adding instrumentation)
**Requirements**: DIAG-01, DIAG-02, DIAG-03
**Plans:** 2/2 plans complete

Plans:
- [x] 10-01-PLAN.md -- Debug infrastructure: logger utility, keyboard shortcut hook, DebugPanel component + tests
- [x] 10-02-PLAN.md -- Wiring: DebugPanel into OracleExperience + structured logging in all pipeline hooks

**Success Criteria** (what must be TRUE):
  1. Developer can see ttsComplete, micShouldActivate, voiceLifecycle phase, and isRecording values updating live in the browser
  2. Developer can read console logs that trace every pipeline transition (TTS start/end, mic open/close, STT send/receive, NLU classify) with timestamps
  3. Debug panel is hidden by default and togglable via keyboard shortcut without affecting the visitor experience

### Phase 11: TTS Reliability & Voice Pipeline Fix
**Goal**: Voice pipeline activates the microphone reliably in every AGUARDANDO state without manual intervention
**Depends on**: Phase 10 (debug instrumentation needed to verify fixes)
**Requirements**: TTSR-01, TTSR-02, TTSR-03, VPIPE-01, VPIPE-02, VPIPE-03
**Plans:** 2 plans

Plans:
- [ ] 11-01-PLAN.md -- TTS reliability: waitForVoices timeout, MockTTSService bounded resolution, FallbackTTSService timeout guard
- [ ] 11-02-PLAN.md -- Voice pipeline verification: ttsComplete verification logging, activation timing, integration tests for all AGUARDANDO states

**Success Criteria** (what must be TRUE):
  1. MockTTSService resolves its speak() promise within bounded time even when browser SpeechSynthesis has no voices or hangs
  2. ttsComplete is verified as true before mic activates -- no AGUARDANDO state ever opens mic while TTS is still pending
  3. Microphone recording starts within 500ms of entering each of the 3 AGUARDANDO states (Inferno, Purgatorio A, Purgatorio B)
  4. Voice pipeline produces a choiceResult (A or B or fallback) from recorded audio in all 3 AGUARDANDO states
  5. Pipeline handles empty transcripts, API errors, and low confidence without freezing or leaving the user stuck

### Phase 12: Browser End-to-End Validation
**Goal**: Full Oraculo experience works end-to-end in a real browser from APRESENTACAO through FIM using voice
**Depends on**: Phase 11 (pipeline must be fixed before validation)
**Requirements**: BVAL-01, BVAL-02, BVAL-03
**Success Criteria** (what must be TRUE):
  1. User completes the full journey (APRESENTACAO through FIM) in Chrome/Edge using mock APIs with voice input at all 3 choice points
  2. User completes the full journey using real APIs (ElevenLabs TTS, Whisper STT, Claude NLU) with voice input
  3. Voice choice correctly sends CHOOSE_A or CHOOSE_B event to state machine and transitions away from AGUARDANDO within expected time
**Plans**: TBD

---

## Progress

**Execution Order:** Phase 10 -> Phase 11 -> Phase 12

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. Pipeline Debug Instrumentation | v1.3 | 2/2 | Complete    | 2026-03-26 |
| 11. TTS Reliability & Voice Pipeline Fix | v1.3 | 0/2 | Not started | - |
| 12. Browser End-to-End Validation | v1.3 | 0/? | Not started | - |

---

## Dependencies

```
Phase 10: Pipeline Debug Instrumentation (visibility first)
    |
Phase 11: TTS Reliability & Voice Pipeline Fix (fix with visibility)
    |
Phase 12: Browser End-to-End Validation (validate the fixes)
```

---

## Coverage

**Total v1.3 Requirements:** 12

- Diagnostics: 3 (DIAG-01 to DIAG-03)
- TTS Reliability: 3 (TTSR-01 to TTSR-03)
- Voice Pipeline Fix: 3 (VPIPE-01 to VPIPE-03)
- Browser Validation: 3 (BVAL-01 to BVAL-03)

**Mapped to Phases:** 12/12

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIAG-01 | Phase 10 | Pending |
| DIAG-02 | Phase 10 | Pending |
| DIAG-03 | Phase 10 | Pending |
| TTSR-01 | Phase 11 | Pending |
| TTSR-02 | Phase 11 | Pending |
| TTSR-03 | Phase 11 | Pending |
| VPIPE-01 | Phase 11 | Pending |
| VPIPE-02 | Phase 11 | Pending |
| VPIPE-03 | Phase 11 | Pending |
| BVAL-01 | Phase 12 | Pending |
| BVAL-02 | Phase 12 | Pending |
| BVAL-03 | Phase 12 | Pending |

---

*Last updated: 2026-03-26 -- Phase 11 planned (2 plans)*
