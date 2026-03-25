---
phase: 1
slug: core-state-machine-audio-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FLOW-01 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FLOW-02 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FLOW-03 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | FLOW-05 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | FLOW-06 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | FLOW-08 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 1 | FLOW-09 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-08 | 01 | 1 | FLOW-10 | unit | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-09 | 01 | 1 | FLOW-12 | integration | `npx vitest run src/__tests__/state-machine.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | RES-04 | unit | `npx vitest run src/__tests__/audio.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | RES-03 | unit | `npx vitest run src/__tests__/permissions.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | UI-01 | manual | Browser visual check | N/A | ⬜ pending |
| 01-03-02 | 03 | 2 | UI-06 | manual | Browser visual check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest` + `@testing-library/react` + `jsdom` — test framework install
- [ ] `vitest.config.ts` — vitest config with jsdom environment
- [ ] `src/__tests__/state-machine.test.ts` — stubs for FLOW-* requirements
- [ ] `src/__tests__/audio.test.ts` — stubs for RES-04 (AudioContext)
- [ ] `src/__tests__/permissions.test.ts` — stubs for RES-03 (mic permission)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Start button pulsating animation | UI-01 | Visual CSS animation | Open browser, verify button has pulse animation on dark bg |
| Phase color transitions | UI-01 | Visual gradient changes | Run through full flow, verify bg colors change per phase |
| Fade to black ending | UI-06 | Visual transition | Complete experience, verify fade-to-black + return to idle |
| AudioContext unlock on click | RES-04 | Browser security policy | Click start, verify no autoplay warning in console |
| Mic permission explanatory screen | RES-03 | UX flow verification | Fresh browser, verify permission screen shows before prompt |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
