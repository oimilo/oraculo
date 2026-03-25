---
phase: 7
slug: voice-architecture-refactor
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- {changed file test}` (< 5s)
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | QUAL-01 | unit | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts -t "lifecycle states"` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | QUAL-01 | unit | `npm test -- src/hooks/__tests__/useVoiceChoice.test.ts -t "transitions"` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | QUAL-02 | unit | `npm test -- src/hooks/__tests__/useTTSOrchestrator.test.ts` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 1 | QUAL-03 | unit | `npm test -- src/machines/__tests__/createChoiceGuard.test.ts` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 1 | QUAL-03 | unit | `npm test -- src/machines/oracleMachine.test.ts -t "generic guards"` | ✅ extend | ⬜ pending |
| 07-04-01 | 04 | 2 | QUAL-04 | integration | `npm test -- src/__tests__/voice-flow-integration.test.ts -t "realistic timing"` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/hooks/__tests__/useVoiceChoice.test.ts` — add FSM lifecycle state tests (idle→listening→processing→decided transitions)
- [ ] `src/hooks/__tests__/useTTSOrchestrator.test.ts` — new file for extracted TTS hook
- [ ] `src/machines/__tests__/createChoiceGuard.test.ts` — test generic guard factory
- [ ] Extend `src/__tests__/voice-flow-integration.test.ts` — add MSW realistic delay tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No fake timers in integration tests | QUAL-04 | Code review check | grep for useFakeTimers in voice-flow-integration.test.ts — must be absent |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
