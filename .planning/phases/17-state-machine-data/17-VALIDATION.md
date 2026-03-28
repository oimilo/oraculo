---
phase: 17
slug: state-machine-data
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.8 + @testing-library/react 16.1.0 |
| **Config file** | vitest.config.ts (existing) |
| **Quick run command** | `npm test -- src/machines/oracleMachine.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/machines/oracleMachine.test.ts -x`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 17-01-01 | 01 | 1 | SMV3-01 | unit | `npm test -- src/machines/oracleMachine.test.ts -t "linear flow"` | ❌ W0 | ⬜ pending |
| 17-01-02 | 01 | 1 | SMV3-02 | unit | `npm test -- src/machines/oracleMachine.test.ts -t "choice array"` | ❌ W0 | ⬜ pending |
| 17-01-03 | 01 | 1 | SMV3-03 | unit | `npm test -- src/machines/guards/__tests__/patternMatching.test.ts` | ❌ W0 | ⬜ pending |
| 17-02-01 | 02 | 2 | SMV3-03 | unit | `npm test -- src/machines/oracleMachine.test.ts -t "devolucao routing"` | ❌ W0 | ⬜ pending |
| 17-02-02 | 02 | 2 | (integration) | integration | `npm test -- src/components/experience/__tests__/OracleExperience.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/machines/guards/__tests__/patternMatching.test.ts` — test determineArchetype() with all 8 archetypes + edge cases
- [ ] `src/machines/oracleMachine.test.ts` — update for v3: linear flow, choice array, devolução routing
- [ ] `src/components/experience/__tests__/OracleExperience.test.tsx` — getScriptKey v3, getCurrentQuestionNumber, ChoiceConfig

*Existing infrastructure covers test framework and config.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Voice choice pipeline integration | SMV3-01 | Browser mic + audio API required | Start experience, speak choices at each of 6 questions, verify correct routing |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
