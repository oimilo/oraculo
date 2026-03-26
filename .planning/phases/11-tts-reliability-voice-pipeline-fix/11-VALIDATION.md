---
phase: 11
slug: tts-reliability-voice-pipeline-fix
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-26
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | TTSR-01 | unit | `npx vitest run src/lib/audio/__tests__/speechSynthesis.test.ts` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | TTSR-02, TTSR-03 | unit | `npx vitest run src/services/tts/__tests__/tts-service.test.ts` | ✅ | ⬜ pending |
| 11-02-01 | 02 | 2 | VPIPE-01, VPIPE-02 | integration | `npx vitest run src/__tests__/voice-flow-integration.test.ts` | ✅ | ⬜ pending |
| 11-02-02 | 02 | 2 | VPIPE-03 | integration | `npx vitest run src/__tests__/stt-nlu-pipeline.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mic activates within 500ms of AGUARDANDO entry | VPIPE-01 | Requires real browser with mic permission | Open app, reach AGUARDANDO state, verify debug panel shows isRecording=true within 500ms |
| Voice choice produces result in all 3 AGUARDANDO states | VPIPE-02 | End-to-end browser flow | Complete full experience, verify choiceResult appears for Inferno, Purgatorio A, Purgatorio B |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
