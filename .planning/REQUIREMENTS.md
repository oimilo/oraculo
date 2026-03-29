# Requirements: O Oraculo

**Defined:** 2026-03-28
**Core Value:** Experiencia seamless e imersiva como um jogo — o visitante fala, ouve, e e transformado.

## v4.0 Requirements

Requirements for Game Flow milestone. Transform the Oracle into a 5-7 min game-like experience with branching paths and more decision points.

### Pacing

- [x] **PACE-01**: Max-path experience duration is 5-7 minutes (down from 10.5 min)
- [x] **PACE-02**: Respostas contain 1-2 segments max (down from 4-5)
- [x] **PACE-03**: Setups contain 1-2 segments max (down from 3-5)
- [x] **PACE-04**: Phase intros reduced to 1 sentence (down from 4-5 sentences)
- [x] **PACE-05**: Bookends (Apresentacao + Encerramento) trimmed for pace while preserving emotional impact

### Branching

- [x] **BRNC-01**: Experience has 8-10 total decision points (up from 6)
- [x] **BRNC-02**: At least 2 branching points where choice determines next scenario
- [x] **BRNC-03**: All branch paths converge before devoluções (no dead ends)
- [x] **BRNC-04**: Branch-specific content maintains psychoanalytic depth

### Machine

- [x] **MACH-01**: XState machine redesigned with conditional transitions for branching
- [x] **MACH-02**: Pattern tracking updated for variable-length choice paths
- [x] **MACH-03**: Devoluçao routing works for all possible branch combinations

### Audio

- [ ] **AUDI-01**: All MP3s regenerated for trimmed/new script via ElevenLabs v3
- [ ] **AUDI-02**: FallbackTTS updated with new audio keys matching new script

### Integration

- [ ] **INTG-01**: OracleExperience component updated for branching flow
- [ ] **INTG-02**: All tests passing with v4.0 structure

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
| New psychoanalytic framework research | 3 frameworks already absorbed in v3.1 — depth preserved via trimming, not adding |
| Voice cloning / new voice creation | Use existing ELEVENLABS_VOICE_ID |
| Mobile optimization | Desktop laptop + headphone setup for Bienal |
| More than 8 archetype devoluções | 8 patterns sufficient for branching; complexity grows exponentially |
| Real-time TTS during experience | Pre-recorded MP3s via FallbackTTS for offline reliability |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PACE-01 | Phase 25 | Complete |
| PACE-02 | Phase 25 | Complete |
| PACE-03 | Phase 25 | Complete |
| PACE-04 | Phase 25 | Complete |
| PACE-05 | Phase 25 | Complete |
| BRNC-01 | Phase 26 | Complete |
| BRNC-02 | Phase 26 | Complete |
| BRNC-03 | Phase 26 | Complete |
| BRNC-04 | Phase 26 | Complete |
| MACH-01 | Phase 27 | Complete |
| MACH-02 | Phase 27 | Complete |
| MACH-03 | Phase 27 | Complete |
| AUDI-01 | Phase 28 | Pending |
| AUDI-02 | Phase 28 | Pending |
| INTG-01 | Phase 29 | Pending |
| INTG-02 | Phase 29 | Pending |

**Coverage:**
- v4.0 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 — v4.0 traceability complete*
