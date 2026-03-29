# Requirements: O Oraculo

**Defined:** 2026-03-29
**Core Value:** Experiencia seamless e imersiva como um jogo — o visitante fala, ouve, e e transformado.

## v5.0 Requirements

Requirements for Tester UI Polish milestone. Upgrade the visual layer for psychoanalyst testers — audio-reactive visuals, mic indicators, polished debug overlay, and refined dark-theme UX.

### Visual (Background & Atmosphere)

- [ ] **VIS-01**: Full-screen audio-reactive equalizer/particle background that responds to TTS playback intensity
- [ ] **VIS-02**: Background visual style changes per narrative phase (Inferno=red/fire, Purgatorio=blue/mist, Paraiso=gold/light)
- [ ] **VIS-03**: Smooth visual transitions between phases (crossfade matching the 3s audio crossfade)
- [ ] **VIS-04**: Idle state has subtle ambient animation (not static black screen)

### Microphone (Listening State)

- [ ] **MIC-01**: Redesigned mic-active indicator — intuitive visual cue that the Oracle is listening (not just pulsing bars)
- [ ] **MIC-02**: Mic indicator responds to actual audio input level (real-time visual feedback)
- [ ] **MIC-03**: Clear visual transition between "Oracle speaking" and "your turn" states

### Debug (Tester Overlay)

- [ ] **DBG-01**: Debug overlay redesigned as elegant status display with phase name, question number, and choice trail
- [ ] **DBG-02**: Toggle via keyboard shortcut AND visible toggle button (testers won't know Ctrl+Shift+D)
- [ ] **DBG-03**: Shows current narrative phase visually (not raw JSON state)

### UX (Flow & Interaction)

- [ ] **UX-01**: Start button redesigned with more presence and visual appeal
- [ ] **UX-02**: Skip/Next button clearly visible during testing (not hidden in corner)
- [ ] **UX-03**: Choice buttons (A/B) visually polished with hover/press states
- [ ] **UX-04**: Permission screen refined with consistent design language

### Polish (Theme & Consistency)

- [ ] **POL-01**: Consistent typography hierarchy (Cormorant for titles, Georgia/system for body)
- [ ] **POL-02**: Smooth entry/exit animations for all UI elements (no abrupt appear/disappear)
- [ ] **POL-03**: All components use consistent opacity, blur, and shadow language

## v4.0 Requirements (Complete)

All 16 requirements satisfied. See `.planning/milestones/` for details.

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
| 3D WebGL effects | Overkill for testing phase, performance risk on event laptops |
| Sound design / new ambient tracks | Already have 4 ambient MP3s, audio layer complete |
| Script or narrative changes | v4.0 script is final — this is purely visual |
| Mobile responsive layout | Desktop laptop + headphone setup for Bienal |
| Custom font loading (beyond Cormorant) | Keep load times fast, 2 fonts max |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 30 | Pending |
| VIS-02 | Phase 30 | Pending |
| VIS-03 | Phase 30 | Pending |
| VIS-04 | Phase 30 | Pending |
| MIC-01 | Phase 31 | Pending |
| MIC-02 | Phase 31 | Pending |
| MIC-03 | Phase 31 | Pending |
| DBG-01 | Phase 32 | Pending |
| DBG-02 | Phase 32 | Pending |
| DBG-03 | Phase 32 | Pending |
| UX-01 | Phase 33 | Pending |
| UX-02 | Phase 33 | Pending |
| UX-03 | Phase 33 | Pending |
| UX-04 | Phase 33 | Pending |
| POL-01 | Phase 33 | Pending |
| POL-02 | Phase 33 | Pending |
| POL-03 | Phase 33 | Pending |

**Coverage:**
- v5.0 requirements: 17 total
- Mapped to phases: 17/17 (100%)
- Unmapped: 0

**Phase breakdown:**
- Phase 30 (Visual System): 4 requirements
- Phase 31 (Mic Indicators): 3 requirements
- Phase 32 (Debug Overlay): 3 requirements
- Phase 33 (UX Polish): 7 requirements

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after v5.0 roadmap creation*
