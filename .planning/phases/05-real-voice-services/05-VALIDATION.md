---
phase: 5
slug: real-voice-services
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/services/{tts,stt,nlu}/__tests__/ --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/services/{tts,stt,nlu}/__tests__/ --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | RTTS-01, RTTS-02 | unit | `npx vitest run src/services/tts/__tests__/elevenlabs-tts.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | RSTT-01, RSTT-02 | unit | `npx vitest run src/services/stt/__tests__/whisper-stt.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | RNLU-01, RNLU-02 | unit | `npx vitest run src/services/nlu/__tests__/claude-nlu.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | RTTS-01, RSTT-01, RNLU-01 | integration | `npx vitest run src/services/{tts,stt,nlu}/__tests__/` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. vitest already configured, service test patterns established in v1.0.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visitor hears ElevenLabs voice with phase-appropriate parameters | RTTS-01, RTTS-02 | Requires real API key + audio playback | Set NEXT_PUBLIC_USE_REAL_APIS=true, fill .env.local, start app, trigger narrative |
| Visitor speech transcribed within 2 seconds | RSTT-01 | Requires microphone + real API key | Speak into mic during voice choice, verify transcript appears |
| Classification returns correct A/B for clear responses | RNLU-01 | Requires real NLU API | Say clear "A" or "B" response, verify correct branch selected |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
