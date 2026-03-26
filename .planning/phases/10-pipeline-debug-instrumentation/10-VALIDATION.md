---
phase: 10
slug: pipeline-debug-instrumentation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.8 + @testing-library/react 16.1.0 |
| **Config file** | `vitest.config.ts` (already configured) |
| **Quick run command** | `npm test -- src/components/debug src/lib/debug src/hooks/__tests__/useKeyboardShortcut` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/components/debug src/lib/debug`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DIAG-02 | unit | `npm test -- src/lib/debug` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | DIAG-03 | unit | `npm test -- src/hooks/__tests__/useKeyboardShortcut` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | DIAG-01 | unit | `npm test -- src/components/debug` | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | DIAG-01,02 | integration | `npm test -- src/components/debug` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/debug/__tests__/DebugPanel.test.tsx` — covers DIAG-01 (panel renders, displays props, hides when not visible)
- [ ] `src/lib/debug/__tests__/logger.test.ts` — covers DIAG-02 (createLogger formats with timestamp+namespace)
- [ ] `src/hooks/__tests__/useKeyboardShortcut.test.ts` — covers DIAG-03 (callback fires on Ctrl+Shift+D, cleanup removes listener)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Debug panel updates live in browser during experience | DIAG-01 | Requires running browser with voice pipeline active | 1. Start dev server 2. Press Ctrl+Shift+D 3. Navigate through states 4. Verify values update in real-time |
| Console logs visible with timestamps during pipeline transitions | DIAG-02 | Requires browser DevTools console inspection | 1. Open Chrome DevTools Console 2. Start experience 3. Verify [TTS], [Mic], [VoiceChoice] logs appear with timestamps |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
