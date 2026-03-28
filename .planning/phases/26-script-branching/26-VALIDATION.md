---
phase: 26
slug: script-branching
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.1.8 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green + `npx tsx scripts/validate-timing.ts` passes
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | BRNC-01, BRNC-02 | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "branching"` | ❌ W0 | ⬜ pending |
| 26-01-02 | 01 | 1 | BRNC-03 | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "convergence"` | ❌ W0 | ⬜ pending |
| 26-01-03 | 01 | 1 | BRNC-04 | unit | `npm test -- src/machines/guards/__tests__/patternMatching.test.ts -t "variable"` | ❌ W0 | ⬜ pending |
| 26-02-01 | 02 | 1 | BRNC-01 | script | `npx tsx scripts/validate-timing.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/machines/__tests__/oracleMachine.test.ts` — branching transition tests (BRNC-01, BRNC-02, BRNC-03)
- [ ] `src/machines/guards/__tests__/patternMatching.test.ts` — variable-length choice array tests (BRNC-04)

*Existing infrastructure (Vitest, validate-timing.ts) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Branch content psychoanalytic depth | BRNC-04 | Subjective quality assessment | Read Q2B/Q4B content, verify depth-4-5 quality against v3.1 benchmarks |
| NLU keyword disambiguation | BRNC-01 | Requires voice input | Test with STT+NLU that Q2B keywords don't collide with Q2 keywords |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
