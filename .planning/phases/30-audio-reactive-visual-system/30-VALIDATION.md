---
phase: 30
slug: audio-reactive-visual-system
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-29
---

# Phase 30 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- src/components/visuals/ src/hooks/__tests__/useAudioAnalyser.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/components/visuals/ src/hooks/__tests__/useAudioAnalyser.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 30-01-01 | 01 | 1 | VIS-02 | unit | `npm test -- src/lib/audio/__tests__/visualConfig.test.ts` | W0 | pending |
| 30-01-02 | 01 | 1 | VIS-01 | unit | `npm test -- src/hooks/__tests__/useAudioAnalyser.test.ts` | W0 | pending |
| 30-02-01 | 02 | 2 | VIS-01, VIS-04 | unit | `npm test -- src/components/visuals/__tests__/EqualizerVisualizer.test.tsx src/components/visuals/__tests__/IdleAnimation.test.tsx` | W0 | pending |
| 30-02-02a | 02 | 2 | VIS-03 | unit | `npm test -- src/components/visuals/__tests__/AudioReactiveBackground.test.tsx` | W0 | pending |
| 30-02-02b | 02 | 2 | VIS-01 | integration | `npm test -- src/components/visuals/__tests__/EqualizerVisualizer.integration.test.tsx` | W0 | pending |
| 30-02-03 | 02 | 2 | VIS-01..04 | smoke | `npx vitest run src/components/visuals/ src/hooks/__tests__/useAudioAnalyser.test.ts src/hooks/__tests__/useAnimationFrame.test.ts src/lib/audio/__tests__/visualConfig.test.ts` | W0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest-canvas-mock` — Canvas API mock for jsdom
- [ ] Add `vitest-canvas-mock` to `vitest.config.ts` setupFiles
- [ ] `src/components/visuals/__tests__/EqualizerVisualizer.test.tsx` — stubs for VIS-01 (unit)
- [ ] `src/components/visuals/__tests__/EqualizerVisualizer.integration.test.tsx` — VIS-01 full pipeline integration
- [ ] `src/hooks/__tests__/useAudioAnalyser.test.ts` — stubs for hook lifecycle
- [ ] `src/lib/audio/__tests__/visualConfig.test.ts` — stubs for VIS-02
- [ ] `src/components/visuals/__tests__/AudioReactiveBackground.test.tsx` — stubs for VIS-03
- [ ] `src/components/visuals/__tests__/IdleAnimation.test.tsx` — stubs for VIS-04

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 60fps performance on event hardware | VIS-01 | Hardware-specific, cannot simulate in jsdom | Open Chrome DevTools -> Performance tab -> Record 30s -> Verify frame rate > 55fps average |
| Visual aesthetics match Dante themes | VIS-02 | Subjective visual quality | Compare Inferno (red/fire), Purgatorio (blue/mist), Paraiso (gold/light) against design intent |
| Phase transition crossfade feels smooth | VIS-03 | Perceptual smoothness | Navigate full experience, verify no visual jarring during phase transitions |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] Checkpoint task (30-02-03) has automated smoke test gate before human verification
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
