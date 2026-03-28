# Requirements: O Oraculo

**Defined:** 2026-03-28
**Core Value:** Experiencia seamless e imersiva como um jogo — o visitante fala, ouve, e e transformado.

## v3.2 Requirements

Requirements for Integration & Audio milestone. Connects finalized v3.1 script to UI components and generates production audio.

### Components & Services

- [x] **CMPV3-01**: OracleExperience handles all ~42 states from v3 XState machine
- [x] **CMPV3-02**: FallbackTTS PRERECORDED_URLS updated for ~50 audio keys matching script.ts
- [x] **CMPV3-03**: useVoiceChoice provides 6 ChoiceConfig objects with per-question NLU context

### Audio Generation

- [ ] **AUDV3-01**: ~50 MP3s generated with ElevenLabs v3 and inflection tags from script.ts
- [ ] **AUDV3-02**: Audio quality validated — no artifacts, consistent voice, 192kbps minimum

### Testing

- [ ] **TSTV3-01**: Machine tests cover all 6 choices, pattern tracking, and devolucao routing
- [ ] **TSTV3-02**: Component tests verify script key mapping for OracleExperience + FallbackTTS
- [ ] **TSTV3-03**: All tests pass with no regressions from v3.0/v3.1

## Future Requirements

### Browser UAT (deferred from v1.0)

- **UAT-01**: Multi-station isolation verified in browser
- **UAT-02**: Inactivity timeout 30s → reset verified in browser
- **UAT-03**: 2-3 simultaneous stations verified in browser

### Analytics (deferred from v1.1)

- **ANALYTICS-01**: Supabase analytics backend (Phase 6)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New script content changes | Script finalized in v3.1 — frozen for this milestone |
| Voice cloning / new voice creation | Use existing ELEVENLABS_VOICE_ID — selection happens before Phase 19 |
| Real-time TTS during experience | Pre-recorded MP3s via FallbackTTS for offline reliability |
| Mobile optimization | Desktop laptop + headphone setup for Bienal |

## Checkpoints

| Phase | Gate | Action Required |
|-------|------|-----------------|
| Phase 19 | Pre-generation | Verify ELEVENLABS_VOICE_ID in .env.local is the final chosen voice before generating ~50 MP3s |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CMPV3-01 | Phase 18 | Complete |
| CMPV3-02 | Phase 18 | Complete |
| CMPV3-03 | Phase 18 | Complete |
| AUDV3-01 | Phase 19 | Pending |
| AUDV3-02 | Phase 19 | Pending |
| TSTV3-01 | Phase 20 | Pending |
| TSTV3-02 | Phase 20 | Pending |
| TSTV3-03 | Phase 20 | Pending |

**Coverage:**
- v3.2 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after milestone v3.2 initialization*
