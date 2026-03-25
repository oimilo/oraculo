---
phase: 03-polish-resilience-multi-station
plan: 02
subsystem: analytics
tags: [analytics, privacy, LGPD, session-tracking]
dependencies:
  requires: []
  provides: [analytics-service, session-tracking, privacy-compliant-data]
  affects: [admin-dashboard-data-source]
tech_stack:
  added: [localStorage-persistence]
  patterns: [service-factory, react-hook-abstraction, privacy-by-design]
key_files:
  created:
    - src/types/analytics.ts
    - src/services/analytics/index.ts
    - src/services/analytics/mock.ts
    - src/services/analytics/__tests__/analytics-service.test.ts
    - src/hooks/useSessionAnalytics.ts
    - src/hooks/__tests__/useSessionAnalytics.test.ts
  modified:
    - src/components/experience/OracleExperience.tsx
decisions:
  - "Anonymous-only session data: path, duration, fallback count, status — zero personal data (ANA-02)"
  - "Station ID via query param ?station=X — defaults to station-1 for single-station testing"
  - "Path derived from choice1+choice2 combination — null if session incomplete"
  - "Session status: active|completed|abandoned|timeout — tracks user flow outcomes"
  - "localStorage persistence for MockAnalyticsService — ready for Supabase swap in future"
metrics:
  duration_minutes: 4.6
  tasks_completed: 2
  files_created: 6
  files_modified: 1
  tests_added: 14
  commits: 2
  completed_at: "2026-03-25T10:47:02Z"
---

# Phase 03 Plan 02: Session Analytics Summary

**One-liner:** Anonymous session tracking with localStorage persistence — captures path, duration, fallback count, and completion status for each Oracle experience session without collecting any personal data (LGPD compliant).

## What Was Built

### Analytics Types (ANA-01, ANA-02)

Created `src/types/analytics.ts` with privacy-first types:

- **SessionRecord**: Anonymous session data with explicit LGPD compliance comment
- **SessionStatus**: `active | completed | abandoned | timeout`
- **SessionStartData**: Minimal data needed to start tracking
- **SessionEndData**: Path, fallback count, status on completion

**Critical privacy constraint:** SessionRecord explicitly forbids audio blobs, transcripts, visitor names/IDs, IP addresses — enforced by code comments and test verification.

### Analytics Service

**Service interface** (`src/services/analytics/index.ts`):
- `startSession(data)` — creates new active session
- `endSession(data)` — marks session complete/abandoned/timeout with duration calculation
- `recordFallback(sessionId)` — increments fallback count
- `getSessions()` — returns all sessions
- `getActiveSessions()` — filters active sessions only
- `getSessionsByStation(stationId)` — filters by station
- `clearOldSessions(maxAgeMs)` — cleanup utility

**Mock implementation** (`src/services/analytics/mock.ts`):
- localStorage persistence under key `oraculo_analytics`
- Automatic duration calculation from ISO timestamps
- Graceful SSR handling (no-op when window undefined)
- Following TTS/STT factory pattern for future Supabase swap

### React Hook

**useSessionAnalytics** (`src/hooks/useSessionAnalytics.ts`):
- Lazy-init analytics service via factory
- `startSession(sessionId)` — tracks session start
- `endSession(sessionId, choice1, choice2, fallbackCount, completed)` — derives path and marks session end
- `recordFallback(sessionId)` — increments fallback count
- Station ID extraction from query param `?station=X` (defaults to `station-1`)
- Path derivation logic: `A+FICAR → A_FICAR`, `B+PISAR → B_PISAR`, etc.
- Cleanup effect: marks session as abandoned on component unmount

### OracleExperience Wiring

Added three tracking effects to `src/components/experience/OracleExperience.tsx`:

1. **Session start tracking**: Fires when `sessionId` changes (new session created)
2. **Session completion tracking**: Fires on FIM state → marks session as `completed`
3. **Session timeout tracking**: Fires when machine goes back to IDLE from non-FIM state → marks session as `abandoned`

All session lifecycle events now logged to analytics service.

## Test Coverage

**14 tests passing** across 2 test suites:

**MockAnalyticsService tests** (8 tests):
- startSession stores active session
- endSession updates status and calculates duration
- recordFallback increments count
- getSessions/getActiveSessions/getSessionsByStation filters
- ANA-02 compliance: SessionRecord keys verified against allowed list (no audio, transcript, visitor fields)
- localStorage persistence under correct key

**useSessionAnalytics hook tests** (6 tests):
- startSession calls service with correct sessionId and stationId
- Path derivation: A+FICAR → A_FICAR, B+PISAR → B_PISAR
- Null choices → null path
- recordFallback increments fallback count
- stationId defaults to "station-1"

## Deviations from Plan

None — plan executed exactly as written. All behaviors specified in TDD tests were implemented and pass.

## Requirements Fulfilled

- **ANA-01**: SessionRecord captures stationId, path, durationMs, fallbackCount, status, timestamps ✅
- **ANA-02**: Zero personal data — explicit comments forbid audio/transcript/visitor fields, verified by tests ✅

## Known Stubs

None. Implementation is complete:
- Real localStorage persistence (not mocked)
- Real path derivation logic
- Real duration calculation
- Real session lifecycle tracking
- Ready for Supabase swap (factory pattern in place)

## Next Steps

This plan provides the data layer for **Plan 03: Admin Dashboard**. The dashboard will call `createAnalyticsService().getSessions()` to display:
- Active sessions count
- Completion rate by path
- Average duration
- Fallback rate
- Per-station metrics

---

## Self-Check: PASSED

**Files created:**
- ✅ src/types/analytics.ts exists
- ✅ src/services/analytics/index.ts exists
- ✅ src/services/analytics/mock.ts exists
- ✅ src/services/analytics/__tests__/analytics-service.test.ts exists
- ✅ src/hooks/useSessionAnalytics.ts exists
- ✅ src/hooks/__tests__/useSessionAnalytics.test.ts exists

**Files modified:**
- ✅ src/components/experience/OracleExperience.tsx contains `useSessionAnalytics`

**Commits verified:**
- ✅ 2c3eb52: test(03-02): add failing tests for analytics service
- ✅ 6a532d0: feat(03-02): wire session analytics into OracleExperience

**Tests passing:**
- ✅ 14/14 analytics tests pass
- ✅ TypeScript compiles with no errors
