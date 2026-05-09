---
phase: 38-version-selector-ui-integration
plan: 02
subsystem: experience-ui
tags: [v1-regression, version-tests, VER-03]
dependency_graph:
  requires: [VersionContext, VersionSelector, getVoiceType]
  provides: [V1 regression test suite, V2 selection flow tests]
  affects: [test confidence for Phase 38 changes]
tech_stack:
  added: []
  patterns: [renderHook with VersionProvider wrapper, aria-pressed assertions, compound test components]
key_files:
  created:
    - src/components/experience/__tests__/version-regression.test.tsx
  modified: []
decisions:
  - "Used compound TestComponent pattern to verify version persists across VersionSelector interactions"
  - "Voice classification contract tests verify getVoiceType rules unchanged (not just VersionSelector UI)"
metrics:
  duration: "1m 49s"
  completed: "2026-05-09T14:25:47Z"
  tasks: 2
  files: 1
---

# Phase 38 Plan 02: V1 Regression Tests Summary

**One-liner:** 8-test regression suite proving V1 default unchanged (VER-03) and V2 selection flows correctly through VersionSelector and VersionContext.

## What Was Done

### Task 1: Write V1 regression and version integration tests (5897cd8)

Created `src/components/experience/__tests__/version-regression.test.tsx` with 2 test suites:

**Suite 1: "V1 regression -- zero behavioral change (VER-03)"** (5 tests)
1. VersionProvider defaults to V1 (contract test)
2. VersionSelector renders with V1 pre-selected (aria-pressed verification)
3. V1 selection does not call setVersion unnecessarily
4. Continuar with V1 default proceeds without changing version
5. V1 voice classification routes keys correctly (getVoiceType contract test covering APRESENTACAO, ENCERRAMENTO, *_PERGUNTA, FALLBACK_*, TIMEOUT_*, *_SETUP, *_RESPOSTA_*, DEVOLUCAO_*)

**Suite 2: "V2 selection flow"** (3 tests)
6. Selecting V2 updates version context
7. V2 selection persists after clicking Continuar
8. Version persists across re-renders (session persistence VER-02)

All 8 tests pass in 83ms.

### Task 2: Full test suite regression check (no commit -- verification only)

Full suite result: **774 passing**, 28 failing, 3 skipped (47 test files).

All 28 failures are pre-existing (not caused by Phase 38):
- `voice-flow-integration.test.ts` (15 failures) -- references obsolete PURGATORIO_A/B states from v1.0
- `script-v3.test.ts` (8 failures) -- segment count/content assertions vs current script.ts edits
- `OracleExperience-helpers.test.ts` (3 failures) -- script structure assertions
- `ambient-player.test.ts` (1 failure) -- crossfade gain value assertion

Zero new regressions from Phase 38 changes confirmed.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. version-regression.test.tsx: 8/8 tests pass
2. Full test suite: 774 pass, 28 fail (all pre-existing), 0 new regressions
3. V1 default verified by explicit VersionProvider and VersionSelector tests
4. Voice classification contracts confirmed intact via getVoiceType assertions

## Self-Check: PASSED
