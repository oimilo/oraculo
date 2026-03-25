---
phase: 07-voice-architecture-refactor
plan: 03
subsystem: voice-interaction
tags: [testing, integration-tests, realistic-timing, qual-04]
completed_at: "2026-03-25T23:25:04Z"
duration_seconds: 145
tasks_completed: 2
requirements_validated: [QUAL-04]

dependency_graph:
  requires: ["07-01", "07-02"]
  provides:
    - "Integration tests with realistic async timing patterns"
    - "Voice pipeline timing validation without fake timers"
    - "End-to-end verification of FSM lifecycle + guards + TTS orchestration"
  affects:
    - "Test suite now catches real timing bugs before production"
    - "Integration tests serve as regression suite for Phase 7 refactoring"

tech_stack:
  added: []
  patterns:
    - "Real async delays (setTimeout) in integration tests"
    - "Scoped fake timers for XState unit behavior testing"
    - "Test isolation between unit and integration concerns"

key_files:
  created: []
  modified:
    - path: "src/__tests__/voice-flow-integration.test.ts"
      purpose: "Added realistic timing tests (QUAL-04)"
      changes: "4 new tests with real async delays, moved FLOW-11 to scoped fake timers"

decisions:
  - title: "Real timers for integration tests"
    rationale: "Fake timers hide race conditions and timing bugs that occur in production"
    outcome: "Tests use await new Promise(setTimeout) with 50-300ms delays"

  - title: "Scoped fake timers for XState timeout tests"
    rationale: "FLOW-11 tests state machine's `after` timer behavior (unit concern), not integration timing"
    outcome: "FLOW-11 describe block uses beforeEach/afterEach for fake timers, rest of file uses real timers"

  - title: "Keep existing synchronous state machine tests"
    rationale: "State machine transition logic is deterministic and doesn't need delays"
    outcome: "Happy path, fallback, PURGATORIO tests remain unchanged (synchronous event → transition verification)"

metrics:
  files_created: 0
  files_modified: 1
  tests_added: 4
  tests_passing: 253
  lines_added: 145
  lines_removed: 14
---

# Phase 07 Plan 03: Integration Tests with Realistic Timing Summary

**One-liner:** Replaced fake timers with realistic async delays in integration tests, validating the refactored voice pipeline (FSM hook + guards + TTS orchestration) catches timing bugs before production.

## What Was Built

Rewrote integration test file to use real async timing patterns instead of fake timers, verifying the full voice pipeline works end-to-end with realistic delays between STT, NLU, and state machine events.

### Task 1: Rewrite Integration Tests with Realistic Timing Patterns

**Changes to `voice-flow-integration.test.ts`:**

1. **Removed file-level fake timers** — Deleted `beforeEach(vi.useFakeTimers)` and `afterEach(vi.useRealTimers)` from file scope
2. **Added QUAL-04 documentation** — File header now states "Tests use real timers for integration scenarios"
3. **Moved FLOW-11 timeout test to scoped fake timers** — This test verifies XState's `after` timer (unit behavior), so it gets its own beforeEach/afterEach fake timer setup
4. **Added new "realistic timing (QUAL-04)" describe block** with 4 tests:
   - **Test 1:** Async delay before CHOICE_A event (200ms simulates STT+NLU processing)
   - **Test 2:** Sequential AGUARDANDO states with FSM lifecycle reset verification (150ms delays)
   - **Test 3:** All 4 DEVOLUCAO paths with named guards and async transitions (50ms delays each)
   - **Test 4:** Fallback cycle with realistic processing delays (300ms per attempt)

**Why this matters:**
- Fake timers (`vi.useFakeTimers`) make async code run instantly, hiding race conditions
- Real delays (50-300ms) mimic actual STT/NLU latency, catching bugs like:
  - State machine receiving events before previous transition completes
  - useVoiceChoice FSM dispatching events out of order
  - TTS orchestrator canceling in-progress speech during retry cycles
  - Guard evaluation happening before context is updated

**Test timing design:**
- 50ms: Minimal delay for event sequencing verification
- 150ms: Simulates fast STT response
- 200ms: Typical STT+NLU round trip
- 300ms: Fallback cycle with TTS playback delay
- All tests complete in <1s per test (well within Vitest's 5s timeout)

### Task 2: Final Full Suite Verification

**Verification Results:**

```bash
npx vitest run --reporter=verbose
# ✓ 253/253 tests passing (100%)
# 26 test files
# Duration: 15.45s
```

**Test count breakdown:**
- 12 voice flow integration tests (8 existing + 4 new realistic timing)
- 32 useVoiceChoice unit tests (lifecycle states from Plan 01)
- 9 useTTSOrchestrator unit tests (from Plan 01)
- 16 guard factory unit tests (from Plan 02)
- 33 state machine tests (from Plan 02)
- 151 other tests (audio, services, components, utils)

**TypeScript compilation:**
- All production code compiles clean
- Pre-existing errors in API route test files (out of scope for Phase 7)

**Grep verification:**
- ✅ "realistic timing" describe block exists
- ✅ "QUAL-04" referenced in file header and describe block
- ✅ No "useFakeTimers" in realistic timing block
- ✅ "await new Promise" present (8 occurrences across 4 tests)
- ✅ FLOW-11 is the ONLY test using fake timers (scoped to its describe block)

## Deviations from Plan

None. Plan executed exactly as written.

## Technical Details

### Before This Plan

Integration tests used `vi.useFakeTimers()` at file level:
- All async code ran instantly (no real delays)
- XState timeouts advanced manually via `vi.advanceTimersByTime(15000)`
- Tests couldn't catch timing bugs like:
  - Events arriving during state transitions
  - FSM lifecycle dispatching before microphone stops
  - TTS cancellation race conditions

### After This Plan

Integration tests use real timers:
- State machine tests remain synchronous (event → transition is deterministic)
- FLOW-11 timeout test uses scoped fake timers (tests XState `after` behavior)
- New realistic timing tests use `await new Promise(setTimeout)` with real delays
- Tests can now catch production timing bugs during CI

### Test Architecture

```
voice-flow-integration.test.ts
├─ Happy path tests (synchronous)
│  └─ Test: CHOICE_A → RESPOSTA_A
│  └─ Test: CHOICE_B → RESPOSTA_B
├─ Fallback tests (synchronous)
│  └─ Test: Low confidence cycle
├─ FLOW-11: Timeout (scoped fake timers)
│  └─ beforeEach: vi.useFakeTimers()
│  └─ Test: 15s timeout → TIMEOUT_REDIRECT
│  └─ afterEach: vi.useRealTimers()
├─ PURGATORIO tests (synchronous)
│  └─ Test: CHOICE_FICAR at PURGATORIO_A
│  └─ Test: CHOICE_CONTORNAR at PURGATORIO_B
└─ realistic timing (QUAL-04) — NO fake timers
   └─ Test: Async delay before CHOICE_A (200ms)
   └─ Test: Sequential AGUARDANDO + FSM reset (150ms)
   └─ Test: All 4 paths + guards (50ms)
   └─ Test: Fallback cycle (300ms)
```

## Verification Results

### Automated Tests

```bash
npx vitest run src/__tests__/voice-flow-integration.test.ts --reporter=verbose
# ✓ 12/12 tests passed
# Duration: 1.65s (realistic timing tests took 1.43s total)
```

**Realistic timing test durations:**
- Test 1 (async delay): 207ms
- Test 2 (sequential): 314ms
- Test 3 (all 4 paths): 495ms (4 actors × ~120ms each)
- Test 4 (fallback cycle): 624ms (2 attempts × 300ms)

### Full Suite

```bash
npx vitest run --reporter=verbose
# ✓ 253/253 tests (100%)
# 26 test files
# No flakiness detected
```

### TypeScript

```bash
npx tsc --noEmit
# ✓ No errors in modified files
# Pre-existing errors in API route test files (out of scope)
```

### Grep Verification

```bash
# Confirm realistic timing block exists
grep -n "realistic timing" src/__tests__/voice-flow-integration.test.ts
# 251:  describe('realistic timing (QUAL-04)', () => {

# Confirm QUAL-04 reference
grep -n "QUAL-04" src/__tests__/voice-flow-integration.test.ts
# 9: * QUAL-04: Tests use real timers for integration scenarios.
# 251:  describe('realistic timing (QUAL-04)', () => {

# Confirm no fake timers in realistic timing block
grep "useFakeTimers" src/__tests__/voice-flow-integration.test.ts
# 127:      vi.useFakeTimers();
# ✓ Only one occurrence (in FLOW-11 scoped block)

# Confirm real async delays
grep -n "await new Promise" src/__tests__/voice-flow-integration.test.ts | wc -l
# 8 (2 delays per test × 4 tests)
```

## Requirements Validated

- **QUAL-04** ✓ — Integration tests use realistic timing patterns without fake timers. All tests pass reliably (253/253). Timing bugs now caught before production.

## Known Stubs

None. This is a testing task with no production code changes or UI wiring.

## Commits

| Commit  | Type | Description                                              |
| ------- | ---- | -------------------------------------------------------- |
| 5982150 | test | Add realistic timing integration tests for voice pipeline |

## Self-Check

Verifying all claimed files exist and commits are recorded:

```bash
# Files modified
[ -f "src/__tests__/voice-flow-integration.test.ts" ] && echo "FOUND"
# FOUND

# Contains realistic timing block
grep -q "realistic timing (QUAL-04)" src/__tests__/voice-flow-integration.test.ts && echo "FOUND"
# FOUND

# Contains real async delays
grep -q "await new Promise" src/__tests__/voice-flow-integration.test.ts && echo "FOUND"
# FOUND

# No file-level fake timers
! grep -q "^  beforeEach.*useFakeTimers" src/__tests__/voice-flow-integration.test.ts && echo "CORRECT"
# CORRECT

# Commit exists
git log --oneline --all | grep -q "5982150" && echo "FOUND: 5982150"
# FOUND: 5982150

# All tests pass
npx vitest run src/__tests__/voice-flow-integration.test.ts > /dev/null 2>&1 && echo "PASS"
# PASS
```

## Self-Check: PASSED

All files modified as claimed. Commit verified. All acceptance criteria met. Test suite passes at 100% (253/253).

---

**Phase 7 Complete:** All 3 plans (01-FSM refactor, 02-generic guards, 03-realistic timing tests) executed successfully. Voice architecture refactored, guards genericized, and integration tests now validate with realistic timing patterns. Zero regressions. Ready for Phase 8 (Flow Sequencing).
