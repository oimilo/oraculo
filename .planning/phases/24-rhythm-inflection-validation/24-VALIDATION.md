---
phase: 24
slug: rhythm-inflection-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/data/__tests__/script-v3.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/data/__tests__/script-v3.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | SCR-06(a) | unit | `npx vitest run -- -t "pause variation"` | ❌ W0 | ⬜ pending |
| 24-01-02 | 01 | 1 | SCR-06(b) | unit | `npx vitest run -- -t "inflection density"` | ✅ | ⬜ pending |
| 24-01-03 | 01 | 1 | SCR-06(c) | unit | `npx vitest run -- -t "no segment has more than 1"` | ✅ | ⬜ pending |
| 24-01-04 | 01 | 1 | SCR-06(d) | unit | `npx vitest run -- -t "duration"` | ❌ W0 | ⬜ pending |
| 24-01-05 | 01 | 1 | Implicit | unit | `npx vitest run -- -t "sentence length"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Add pause variation test to `src/data/__tests__/script-v3.test.ts` — SCR-06(a)
- [ ] Add duration estimation test to `src/data/__tests__/script-v3.test.ts` — SCR-06(d)
- [ ] Add sentence length test to `src/data/__tests__/script-v3.test.ts` — Implicit requirement

*Existing inflection density and max-tags-per-segment tests already cover SCR-06(b) and SCR-06(c).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Script "read-through ready" | Phase goal | Subjective quality assessment | Read full script aloud, verify natural flow |
| Inflection tag emotional fit | SCR-06 | Tag appropriateness is subjective | Review each tagged segment for tonal match |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
