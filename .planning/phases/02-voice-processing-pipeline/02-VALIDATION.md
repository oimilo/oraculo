---
phase: 2
slug: voice-processing-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 2 — Validation Strategy

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

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TTS-01 | unit | `npx vitest run src/services/__tests__/tts-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | TTS-02 | unit | `npx vitest run src/services/__tests__/tts-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | TTS-03 | unit | `npx vitest run src/services/__tests__/tts-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | TTS-04 | unit | `npx vitest run src/services/__tests__/tts-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | STT-01 | unit | `npx vitest run src/services/__tests__/stt-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | STT-02 | unit | `npx vitest run src/services/__tests__/stt-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | STT-03 | unit | `npx vitest run src/services/__tests__/stt-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | STT-04 | unit | `npx vitest run src/services/__tests__/stt-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | STT-05 | unit | `npx vitest run src/services/__tests__/stt-service.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | AMB-01 | unit | `npx vitest run src/audio/__tests__/ambient-player.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | AMB-02 | unit | `npx vitest run src/audio/__tests__/ambient-player.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | AMB-03 | unit | `npx vitest run src/audio/__tests__/ambient-player.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-04 | 03 | 2 | AMB-04 | unit | `npx vitest run src/audio/__tests__/ambient-player.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | UI-02 | integration | `npx vitest run src/components/__tests__/voice-ui.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 2 | UI-03 | integration | `npx vitest run src/components/__tests__/voice-ui.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-03 | 04 | 2 | UI-04 | integration | `npx vitest run src/components/__tests__/voice-ui.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-04 | 04 | 2 | UI-05 | integration | `npx vitest run src/components/__tests__/voice-ui.test.ts` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | FLOW-04 | integration | `npx vitest run src/__tests__/voice-flow.test.ts` | ❌ W0 | ⬜ pending |
| 02-05-02 | 05 | 3 | FLOW-07 | integration | `npx vitest run src/__tests__/voice-flow.test.ts` | ❌ W0 | ⬜ pending |
| 02-05-03 | 05 | 3 | FLOW-11 | integration | `npx vitest run src/__tests__/voice-flow.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/services/__tests__/tts-service.test.ts` — stubs for TTS-01 through TTS-04
- [ ] `src/services/__tests__/stt-service.test.ts` — stubs for STT-01 through STT-05
- [ ] `src/audio/__tests__/ambient-player.test.ts` — stubs for AMB-01 through AMB-04
- [ ] `src/components/__tests__/voice-ui.test.ts` — stubs for UI-02 through UI-05
- [ ] `src/__tests__/voice-flow.test.ts` — stubs for FLOW-04, FLOW-07, FLOW-11

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ElevenLabs voice quality by phase | TTS-02 | Subjective voice parameter tuning | Play TTS in each phase, verify tone shifts |
| Ambient crossfade smoothness | AMB-02 | Audio perception quality | Trigger phase transitions, listen for gaps |
| Listening indicator responsiveness | UI-03 | Visual/interactive feedback | Start recording, observe indicator reaction time |
| Waveform visualization accuracy | UI-04 | Visual rendering quality | Play audio, verify waveform matches output |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
