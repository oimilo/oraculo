---
phase: 23
slug: devolucoes-bookends
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 23 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x + ts-jest |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npx jest src/data/__tests__/script-v3.test.ts --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx jest src/data/__tests__/script-v3.test.ts --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 23-01-01 | 01 | 1 | SCR-04 | unit | `npx jest script-v3 --no-coverage` | ✅ | ⬜ pending |
| 23-01-02 | 01 | 1 | SCR-05 | unit | `npx jest script-v3 --no-coverage` | ✅ | ⬜ pending |
| 23-02-01 | 02 | 1 | SCR-07 | unit | `npx jest script-v3 --no-coverage` | ✅ | ⬜ pending |
| 23-02-02 | 02 | 1 | SCR-08 | unit | `npx jest script-v3 --no-coverage` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. `script-v3.test.ts` has 51 tests covering segment counts, inflection density, sentence length, TypeScript compilation, and structural integrity.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Devolução names pattern (not choices) | SCR-04 | Semantic — cannot be checked via grep alone | Read each devolução, verify it describes PATTERN shape, not individual Q1-Q6 choices |
| Devolução ends with question OR image | SCR-04 | Content quality | Check last segment of each devolução for question or persistent image |
| Oracle voice consistency | SCR-05 | Subjective voice quality | Read-through all new content, verify 2nd person, short sentences, escalpelo tone |
| Fallbacks use scenario vocabulary | SCR-07 | Semantic | Each fallback must reference its scenario's imagery (sala/porta, coisa/corpo, etc.) |
| Timeouts treat silence as valid | SCR-07 | Semantic | Each timeout must frame silence as meaningful gesture, not error |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
