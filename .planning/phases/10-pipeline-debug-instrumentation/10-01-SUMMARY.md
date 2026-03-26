---
phase: 10-pipeline-debug-instrumentation
plan: 01
subsystem: testing
tags: [debug, logging, keyboard-shortcuts, react-hooks, vitest]

# Dependency graph
requires:
  - phase: 07-voice-fsm-refactor
    provides: VoiceLifecycle types for debug display
provides:
  - Timestamped namespaced logger utility (createLogger)
  - Reusable keyboard shortcut hook (useKeyboardShortcut)
  - DebugPanel component displaying pipeline state
  - 21 passing tests for debug infrastructure
affects: [11-mock-tts-fix, 12-browser-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "performance.now() for relative timestamps in logs"
    - "useState + useKeyboardShortcut for toggled debug overlays"
    - "data-testid attributes for test isolation"
    - "color-coded boolean values (green/red) for visual debugging"

key-files:
  created:
    - src/lib/debug/logger.ts
    - src/lib/debug/__tests__/logger.test.ts
    - src/hooks/useKeyboardShortcut.ts
    - src/hooks/__tests__/useKeyboardShortcut.test.ts
    - src/components/debug/DebugPanel.tsx
    - src/components/debug/__tests__/DebugPanel.test.tsx
  modified: []

key-decisions:
  - "performance.now() for timestamps (relative to page load, consistent across sessions)"
  - "Ctrl+Shift+D as debug toggle (unlikely to conflict with user interactions)"
  - "Hidden by default (no visual clutter until developer activates)"
  - "Fixed top-right overlay with z-index 9999 (always visible above experience UI)"

patterns-established:
  - "createLogger pattern: factory returning { log, error } with namespace and timestamp"
  - "useKeyboardShortcut pattern: generic hook with modifiers object and cleanup"
  - "DebugPanel pattern: toggleable overlay consuming pipeline state as props"

requirements-completed: [DIAG-01, DIAG-02, DIAG-03]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 10 Plan 01: Pipeline Debug Instrumentation Summary

**Timestamped logger, keyboard shortcut hook, and toggleable debug panel with 21 passing tests**

## Performance

- **Duration:** 3 minutes
- **Started:** 2026-03-26T13:37:35Z
- **Completed:** 2026-03-26T13:40:55Z
- **Tasks:** 2
- **Files modified:** 6 created (3 source + 3 test)

## Accomplishments
- Logger utility with performance.now() timestamps and namespace prefixes
- Keyboard shortcut hook detecting Ctrl+Shift+D with cleanup on unmount
- DebugPanel component displaying 6 pipeline state values with color coding
- 21 tests passing (10 logger/keyboard + 11 DebugPanel)
- Zero new dependencies added

## Task Commits

Each task was committed atomically:

1. **Task 1: Logger utility and keyboard shortcut hook** - `95fa946` (test+feat)
   - Tests + implementation created together (TDD RED+GREEN combined)
   - 10 tests covering logger formatting and keyboard event handling

2. **Task 2: DebugPanel component** - `bb5ed7d` (feat)
   - 11 tests covering visibility toggle, prop display, and color coding

## Files Created/Modified

**Created:**
- `src/lib/debug/logger.ts` - Timestamped namespaced console wrapper using performance.now()
- `src/lib/debug/__tests__/logger.test.ts` - 5 tests for logger formatting and namespace isolation
- `src/hooks/useKeyboardShortcut.ts` - Generic keyboard combo hook with modifiers and cleanup
- `src/hooks/__tests__/useKeyboardShortcut.test.ts` - 5 tests for combo detection and unmount cleanup
- `src/components/debug/DebugPanel.tsx` - Toggleable overlay showing pipeline state (6 values)
- `src/components/debug/__tests__/DebugPanel.test.tsx` - 11 tests for visibility, values, and color coding

**Modified:** None

## Decisions Made

- **Timestamp approach:** performance.now() provides relative timestamps from page load, avoiding date formatting overhead and making log timings more readable (e.g., "1234.56ms" instead of full ISO timestamp)
- **Keyboard shortcut:** Ctrl+Shift+D chosen to avoid conflicts with browser DevTools (F12) and user experience interactions
- **Hidden by default:** Debug panel starts invisible to avoid clutter until developer needs it (DIAG-03 requirement)
- **Color coding:** Green/red for booleans, yellow for lifecycle phase, blue for state, orange for attempt count - visual scanning of pipeline health at a glance

## Deviations from Plan

None - plan executed exactly as written. All test files and implementations created according to spec.

## Issues Encountered

None - TDD workflow smooth, all tests passed on first run after implementation.

## Known Stubs

None - this plan creates pure infrastructure with no data dependencies. The DebugPanel will display real values when wired into OracleExperience in Plan 02.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02 (Wire Debug Panel into Experience):**
- createLogger available for pipeline instrumentation
- useKeyboardShortcut available for debug toggle
- DebugPanel ready to receive live pipeline state props
- Full test coverage ensures debug infrastructure won't break voice flow

**Blockers:** None

**Next steps:** Plan 02 will wire DebugPanel into OracleExperience and add logger calls to voice pipeline entry points.

---
*Phase: 10-pipeline-debug-instrumentation*
*Completed: 2026-03-26*

## Self-Check: PASSED

**Files verified:**
- src/lib/debug/logger.ts: FOUND
- src/lib/debug/__tests__/logger.test.ts: FOUND
- src/hooks/useKeyboardShortcut.ts: FOUND
- src/hooks/__tests__/useKeyboardShortcut.test.ts: FOUND
- src/components/debug/DebugPanel.tsx: FOUND
- src/components/debug/__tests__/DebugPanel.test.tsx: FOUND

**Commits verified:**
- 95fa946: FOUND (test+feat: logger and keyboard shortcut)
- bb5ed7d: FOUND (feat: DebugPanel component)

**Tests verified:**
- Full suite: 328 passing (307 existing + 21 new)
