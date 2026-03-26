# Roadmap: O Oráculo

**Milestone:** v1.2 Voice Flow Stabilization
**Phases:** 3
**Granularity:** Standard
**Coverage:** 19/19 requirements mapped

---

## Phases

- [x] **Phase 7: Voice Architecture Refactor** - Clean up hook orchestration and state machine coupling
- [ ] **Phase 8: Flow Sequencing & Mic Lifecycle** - Fix TTS/mic timing and state transitions
- [ ] **Phase 9: STT/NLU Pipeline Integration** - End-to-end voice capture to classification

---

## Phase Details

### Phase 7: Voice Architecture Refactor
**Goal**: Clean hook architecture and state machine coupling to support reliable voice flow
**Depends on**: Nothing (refactoring existing code)
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. useVoiceChoice has explicit lifecycle states (idle/listening/processing/decided) with no ambiguous transitions
  2. TTS orchestration state and voice choice state are fully decoupled (no shared mutable variables)
  3. State machine choice points use generic handlers that accept any option set (extensible for future branches)
  4. Integration tests run against real service timing patterns (async delays, blob processing) without flakiness
**Plans:** 3 plans

Plans:
- [x] 07-01-PLAN.md — Refactor useVoiceChoice to FSM + extract useTTSOrchestrator (QUAL-01, QUAL-02)
- [x] 07-02-PLAN.md — Generic guard factory + refactor oracleMachine to setup() (QUAL-03)
- [x] 07-03-PLAN.md — Integration tests with realistic timing patterns (QUAL-04)

### Phase 8: Flow Sequencing & Mic Lifecycle
**Goal**: Ensure narration -> question -> listen -> response sequence with no overlaps or timing issues
**Depends on**: Phase 7
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, MIC-01, MIC-02, MIC-03, MIC-04, MIC-05
**Success Criteria** (what must be TRUE):
  1. User hears narration TTS fully complete before microphone opens for response
  2. Question TTS plays in PERGUNTA state, then mic opens only after question completes
  3. Timeout redirect text plays only after 15s silence timeout, not as default question
  4. No audio overlaps occur at any decision point (Inferno/Purgatorio/Paraiso)
  5. Microphone recording captures full visitor response and stops cleanly on state exit with no orphaned streams
**Plans:** 2 plans

Plans:
- [ ] 08-01-PLAN.md — TTS-gated state transitions + flow sequencing tests (FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05)
- [ ] 08-02-PLAN.md — Microphone lifecycle tests + stream cleanup hardening (MIC-01, MIC-02, MIC-03, MIC-04, MIC-05)

### Phase 9: STT/NLU Pipeline Integration
**Goal**: Voice capture produces accurate transcription and classification that drives correct state transitions
**Depends on**: Phase 8
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05
**Success Criteria** (what must be TRUE):
  1. User speaks Portuguese response and Whisper transcribes with acceptable accuracy
  2. NLU receives correct choice options matching current state (never stale/empty config)
  3. Classification result (A/B) triggers correct state machine event and narrative branch
  4. Low confidence responses trigger fallback TTS followed by re-listen cycle (not silent failure)
  5. Silent or empty audio produces graceful fallback behavior (timeout or default choice)
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Voice Architecture Refactor | 3/3 | Complete | 2026-03-25 |
| 8. Flow Sequencing & Mic Lifecycle | 0/2 | Planning complete | - |
| 9. STT/NLU Pipeline Integration | 0/0 | Not started | - |

---

## Dependencies

```
Phase 7: Voice Architecture Refactor (foundation) [COMPLETE]
    |
Phase 8: Flow Sequencing & Mic Lifecycle (clean mic lifecycle depends on refactored hooks)
    |
Phase 9: STT/NLU Pipeline Integration (valid audio blobs depend on Phase 8)
```

---

## Coverage

**Total v1.2 Requirements:** 19

- Flow Sequencing: 5 (FLOW-01 to FLOW-05)
- Microphone Lifecycle: 5 (MIC-01 to MIC-05)
- STT/NLU Pipeline: 5 (PIPE-01 to PIPE-05)
- Code Quality: 4 (QUAL-01 to QUAL-04)

**Mapped to Phases:** 19/19 ✓

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUAL-01 | Phase 7 | Complete |
| QUAL-02 | Phase 7 | Complete |
| QUAL-03 | Phase 7 | Complete |
| QUAL-04 | Phase 7 | Complete |
| FLOW-01 | Phase 8 | Pending |
| FLOW-02 | Phase 8 | Pending |
| FLOW-03 | Phase 8 | Pending |
| FLOW-04 | Phase 8 | Pending |
| FLOW-05 | Phase 8 | Pending |
| MIC-01 | Phase 8 | Pending |
| MIC-02 | Phase 8 | Pending |
| MIC-03 | Phase 8 | Pending |
| MIC-04 | Phase 8 | Pending |
| MIC-05 | Phase 8 | Pending |
| PIPE-01 | Phase 9 | Pending |
| PIPE-02 | Phase 9 | Pending |
| PIPE-03 | Phase 9 | Pending |
| PIPE-04 | Phase 9 | Pending |
| PIPE-05 | Phase 9 | Pending |

---

*Last updated: 2026-03-25 — Phase 8 plans created*
