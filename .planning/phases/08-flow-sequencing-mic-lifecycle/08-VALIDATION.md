---
phase: 8
slug: flow-sequencing-mic-lifecycle
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.1.8 + @testing-library/react 16.1.0 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- src/__tests__/flow-sequencing.test.ts src/__tests__/mic-lifecycle.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/__tests__/flow-sequencing.test.ts src/__tests__/mic-lifecycle.test.ts`
- **After every plan wave:** Run `npm test -- src/__tests__/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | FLOW-01 | integration | `npm test -- src/__tests__/flow-sequencing.test.ts` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | FLOW-02 | integration | `npm test -- src/__tests__/flow-sequencing.test.ts` | ❌ W0 | ⬜ pending |
| 08-01-03 | 01 | 1 | FLOW-04 | integration | `npm test -- src/__tests__/flow-sequencing.test.ts` | ❌ W0 | ⬜ pending |
| 08-01-04 | 01 | 1 | FLOW-05 | integration | `npm test -- src/__tests__/flow-sequencing.test.ts` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | MIC-01 | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts` | ❌ W0 | ⬜ pending |
| 08-02-02 | 02 | 2 | MIC-02 | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts` | ❌ W0 | ⬜ pending |
| 08-02-03 | 02 | 2 | MIC-04 | integration | `npm test -- src/__tests__/mic-lifecycle.test.ts` | ❌ W0 | ⬜ pending |
| 08-xx-xx | xx | x | FLOW-03 | integration | `npm test -- src/__tests__/voice-flow-integration.test.ts` | ✅ | ⬜ pending |
| 08-xx-xx | xx | x | MIC-03 | unit | `npm test -- src/hooks/__tests__/useMicrophone.test.ts` | ✅ | ⬜ pending |
| 08-xx-xx | xx | x | MIC-05 | unit | `npm test -- src/hooks/__tests__/useMicrophone.test.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/flow-sequencing.test.ts` — stubs for FLOW-01, FLOW-02, FLOW-04, FLOW-05
- [ ] `src/__tests__/mic-lifecycle.test.ts` — stubs for MIC-01, MIC-02, MIC-04

*Existing tests cover FLOW-03, MIC-03, MIC-05.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio overlaps at decision points | FLOW-04 | Requires real audio playback in browser | Play full experience, listen at INFERNO/PURGATORIO/PARAISO transitions for overlapping audio |
| Mic indicator timing | MIC-02 | Visual indicator timing relative to TTS | Watch for mic indicator appearing while question audio still playing |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
