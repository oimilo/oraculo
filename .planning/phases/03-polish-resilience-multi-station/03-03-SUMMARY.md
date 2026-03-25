---
phase: 03-polish-resilience-multi-station
plan: 03
subsystem: ui, infra
tags: [next.js, xstate, localStorage, admin-dashboard, multi-station, heartbeat]

requires:
  - phase: 03-polish-resilience-multi-station/plan-02
    provides: SessionRecord types and AnalyticsService for dashboard consumption
provides:
  - Station registry with heartbeat-based online/offline detection
  - Admin dashboard at /admin with station status, session metrics, path distribution
  - Multi-station isolation via per-tab XState instances and query parameter tagging
  - OracleExperience heartbeat wiring every 10 seconds
affects: []

tech-stack:
  added: []
  patterns: [singleton-registry, polling-dashboard, heartbeat-timeout]

key-files:
  created:
    - src/types/station.ts
    - src/services/station/index.ts
    - src/services/station/registry.ts
    - src/services/station/__tests__/station-registry.test.ts
    - src/app/admin/page.tsx
    - src/app/admin/components/StationCard.tsx
    - src/app/admin/components/SessionMetrics.tsx
    - src/app/admin/components/PathDistribution.tsx
  modified:
    - src/components/experience/OracleExperience.tsx

key-decisions:
  - "StationRegistry singleton with localStorage persistence and 15s heartbeat timeout"
  - "Admin dashboard polls every 5s, station heartbeats every 10s"
  - "Multi-station isolation via per-tab component instances and ?station=station-N query param"

patterns-established:
  - "Singleton registry: StationRegistry.getInstance() for cross-component shared state"
  - "Heartbeat pattern: 10s intervals, 15s timeout for offline detection"
  - "Admin route: /admin with polling-based dashboard, no auth required for MVP"

requirements-completed: [ANA-03, ANA-04, ANA-05]

duration: 4min
completed: 2026-03-25
---

# Plan 03-03: Multi-Station & Admin Dashboard Summary

**Station registry with heartbeat tracking, admin dashboard at /admin showing station status + session metrics + path distribution**

## Performance

- **Duration:** ~4 min
- **Tasks:** 3 (2 implementation + 1 checkpoint)
- **Files created:** 8
- **Files modified:** 1

## Accomplishments
- StationRegistry singleton with heartbeat-based online/offline detection (15s timeout)
- Admin dashboard at /admin with 3 components: StationCard, SessionMetrics, PathDistribution
- Dashboard auto-refreshes every 5 seconds
- OracleExperience sends heartbeats every 10 seconds with station ID
- Multi-station isolation: per-tab XState + AudioContext + ?station= query param

## Task Commits

1. **Task 1: Station types and registry** - `4fb11e0` (test RED), `40e6da4` (feat GREEN)
2. **Task 2: Admin dashboard + heartbeat wiring** - `dae97a7` (feat)
3. **Task 3: Visual verification checkpoint** - auto-approved (autonomy mode)

## Files Created/Modified
- `src/types/station.ts` - StationInfo type with id, status, lastHeartbeat, activeSessionId
- `src/services/station/index.ts` - StationService interface and factory
- `src/services/station/registry.ts` - StationRegistry singleton with heartbeat/timeout logic
- `src/services/station/__tests__/station-registry.test.ts` - 7 tests for registry
- `src/app/admin/page.tsx` - Admin dashboard page with polling
- `src/app/admin/components/StationCard.tsx` - Station status card with online/offline indicator
- `src/app/admin/components/SessionMetrics.tsx` - Aggregated session metrics display
- `src/app/admin/components/PathDistribution.tsx` - Bar chart for path distribution
- `src/components/experience/OracleExperience.tsx` - Added heartbeat wiring

## Decisions Made
- StationRegistry uses singleton pattern for cross-component access
- Heartbeat timeout at 15s (1.5x the 10s interval) balances responsiveness with tolerance
- Admin dashboard has no auth for MVP — will need protection for production

## Deviations from Plan
None - plan executed as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 3 requirements complete (RES-01, RES-02, RES-05, ANA-01 through ANA-05)
- System ready for multi-station deployment at Bienal event
- Pre-recorded audio files need to be recorded in studio and placed at mapped URLs

---
*Phase: 03-polish-resilience-multi-station*
*Completed: 2026-03-25*
