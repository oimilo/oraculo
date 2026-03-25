---
status: partial
phase: 03-polish-resilience-multi-station
source: [03-VERIFICATION.md]
started: 2026-03-25T08:00:00Z
updated: 2026-03-25T08:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Multi-station real-time dashboard test
expected: Open http://localhost:3000/?station=station-1 in tab 1, start session. Open ?station=station-2 in tab 2, start session. Open http://localhost:3000/admin in tab 3. Admin should show both stations as 'Online' with green pulsing dot. Close station-1 tab. Wait 20 seconds. Station-1 should show 'Offline' with red dot.
result: [pending]

### 2. Multi-station isolation test
expected: Open 3 tabs with ?station=station-1/2/3. Start sessions in all 3 simultaneously. Each should play audio independently with no crosstalk. Verify each state machine operates independently (choices in one tab don't affect others).
result: [pending]

### 3. Inactivity timeout test
expected: Open station tab, start experience, wait 30 seconds without interaction. Experience should auto-reset to IDLE state with start button visible.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
