---
phase: 2
slug: voice-processing-pipeline
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 2 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Wave 0 Note

All plans with `tdd="true"` tasks create their test files as the FIRST step of each TDD task (RED phase: write failing tests before implementation). There is no separate Wave 0 plan -- test creation is built into each task's TDD workflow. The executor writes tests first, runs them (they fail), then implements production code to make them pass.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-01 | 01 | 1 | TTS-01, TTS-02, TTS-03, TTS-04 | unit | `npx vitest run src/services/tts/__tests__/tts-service.test.ts` | TDD creates test |
| 02-01-02 | 01 | 1 | STT-01, STT-02, STT-03 | unit | `npx vitest run src/services/stt/__tests__/stt-service.test.ts src/services/nlu/__tests__/nlu-service.test.ts` | TDD creates test |
| 02-02-01 | 02 | 1 | AMB-01, AMB-02, AMB-03, AMB-04 | unit | `npx vitest run src/services/audio/__tests__/ambient-player.test.ts src/services/audio/__tests__/crossfader.test.ts` | TDD creates test |
| 02-02-02 | 02 | 1 | AMB-01 | docs | `npx vitest run src/services/audio --reporter=verbose` | N/A (docs only, verify via audio tests) |
| 02-03-01 | 03 | 1 | STT-04, STT-05 | unit | `npx vitest run src/hooks/__tests__/useMicrophone.test.ts` | TDD creates test |
| 02-03-02 | 03 | 1 | UI-03 | unit | `npx vitest run src/hooks/__tests__/useWaveform.test.ts` | TDD creates test |
| 02-04-01 | 04 | 2 | UI-03 | unit | `npx vitest run src/components/audio/__tests__/WaveformVisualizer.test.tsx` | TDD creates test |
| 02-04-02 | 04 | 2 | UI-04, STT-05, UI-05 | unit | `npx vitest run src/components/audio/__tests__/ListeningIndicator.test.tsx` | TDD creates test |
| 02-05-01 | 05 | 2 | FLOW-04, FLOW-07, FLOW-11, STT-01, STT-02, STT-03, STT-04 | unit | `npx vitest run src/hooks/__tests__/useVoiceChoice.test.ts` | TDD creates test |
| 02-06-01 | 06 | 3 | AMB-01, AMB-02, AMB-03, AMB-04 | wiring | `npx tsc --noEmit` | Type-check only |
| 02-06-02 | 06 | 3 | TTS-01 through TTS-04, UI-02 through UI-05, FLOW-04, FLOW-07, FLOW-11 | integration | `npx tsc --noEmit && npx vitest run --reporter=verbose` | Wiring task |
| 02-06-03 | 06 | 3 | FLOW-04, FLOW-07, FLOW-11, STT-01, STT-04 | integration | `npx vitest run src/__tests__/voice-flow-integration.test.ts` | Created in task |
| 02-06-04 | 06 | 3 | ALL Phase 2 | manual | Browser verification | Checkpoint |

*Status: TDD creates test = test file is created as part of the TDD task's RED phase*

---

## Test File Path Reference

Correct test file paths as declared in plan files_modified:

| Service/Hook/Component | Test File Path |
|------------------------|----------------|
| TTS service | `src/services/tts/__tests__/tts-service.test.ts` |
| STT service | `src/services/stt/__tests__/stt-service.test.ts` |
| NLU service | `src/services/nlu/__tests__/nlu-service.test.ts` |
| Ambient player | `src/services/audio/__tests__/ambient-player.test.ts` |
| Crossfader | `src/services/audio/__tests__/crossfader.test.ts` |
| useMicrophone | `src/hooks/__tests__/useMicrophone.test.ts` |
| useWaveform | `src/hooks/__tests__/useWaveform.test.ts` |
| useVoiceChoice | `src/hooks/__tests__/useVoiceChoice.test.ts` |
| WaveformVisualizer | `src/components/audio/__tests__/WaveformVisualizer.test.tsx` |
| ListeningIndicator | `src/components/audio/__tests__/ListeningIndicator.test.tsx` |
| Voice flow integration | `src/__tests__/voice-flow-integration.test.ts` |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ElevenLabs voice quality by phase | TTS-02 | Subjective voice parameter tuning | Play TTS in each phase, verify tone shifts |
| Ambient crossfade smoothness | AMB-02 | Audio perception quality | Trigger phase transitions, listen for gaps |
| Listening indicator responsiveness | UI-04 | Visual/interactive feedback | Start recording, observe indicator reaction time |
| Waveform visualization accuracy | UI-03 | Visual rendering quality | Play audio, verify waveform matches output |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are TDD tasks that create tests as first step
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 handled via TDD workflow (tests created as first action in each TDD task)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter
- [x] `wave_0_complete: true` set in frontmatter (TDD tasks self-create tests)
- [x] Test file paths match plan files_modified declarations

**Approval:** pending
