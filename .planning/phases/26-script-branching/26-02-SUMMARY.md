---
phase: 26-script-branching
plan: 02
subsystem: state-machine
tags:
  - pattern-matching
  - timing-validation
  - branching
  - percentage-thresholds
requires:
  - 26-01
provides:
  - percentage-based-archetype-classification
  - branch-aware-timing-validation
affects:
  - src/machines/guards/patternMatching.ts
  - scripts/validate-timing.ts
tech_stack:
  added: []
  patterns:
    - "Percentage-based thresholds (0.66 for SEEKER/GUARDIAN, 0.4 for PIVOT)"
    - "Thirds-based PIVOT detection for variable-length arrays"
    - "4-path permutation calculation (6Q, 7Q+Q2B, 7Q+Q4B, 8Q+both)"
key_files:
  created: []
  modified:
    - path: "src/machines/guards/patternMatching.ts"
      changes: "Replaced absolute value checks with percentage-based thresholds, thirds-based PIVOT detection"
      lines_changed: 60
    - path: "src/machines/guards/__tests__/patternMatching.test.ts"
      changes: "Added 27 new tests for 8-choice, 7-choice, and variable-length edge cases"
      lines_changed: 111
    - path: "scripts/validate-timing.ts"
      changes: "Replaced single max-path with 4-path calculation, removed min-path function"
      lines_changed: 152
decisions:
  - decision: "Use 66% threshold for SEEKER/GUARDIAN to maintain backward compatibility with 6-choice patterns (4/6 = 67%)"
    rationale: "Ensures existing tests pass while supporting variable-length arrays"
  - decision: "Add 40% overall representation requirement for PIVOT patterns"
    rationale: "Distinguishes true pivots from lopsided SEEKER/GUARDIAN patterns with trailing opposites (e.g., AAAAABB)"
  - decision: "PIVOT checks take precedence over SEEKER/GUARDIAN"
    rationale: "Directional change is more semantically meaningful than simple percentage dominance"
  - decision: "Calculate all 4 branch permutations instead of min/max extrapolation"
    rationale: "Branch content may have non-linear timing impact, explicit calculation is more accurate"
metrics:
  duration_seconds: 394
  completed_date: "2026-03-29T00:10:21Z"
  tasks_completed: 2
  files_modified: 3
  tests_added: 27
  commits: 2
---

# Phase 26 Plan 02: Pattern Matching & Timing for Branching Summary

Upgraded pattern matching to percentage-based archetype classification and extended timing validation to calculate all 4 branch path permutations.

## Tasks Completed

### Task 1: Upgrade pattern matching to percentage-based thresholds (TDD)

**RED Phase:**
- Added 27 new test cases for variable-length choice arrays
- Tests for 8-choice arrays (both branches): DEPTH_SEEKER, SURFACE_KEEPER, MIRROR, SEEKER (75% A), GUARDIAN (75% B), PIVOT_LATE, PIVOT_EARLY, CONTRADICTED
- Tests for 7-choice arrays (single branch): DEPTH_SEEKER, SURFACE_KEEPER, MIRROR, SEEKER (71% A)
- Backward compatibility tests for 6-choice arrays
- Edge cases: 5 valid choices, 10 choices (theoretical max)
- Tests initially failed as expected (existing implementation used absolute values)

**GREEN Phase:**
- Replaced absolute value checks (`aCount === 6`, `aCount >= 4`) with percentage-based thresholds (`aPercent === 1`, `aPercent >= 0.66`)
- Replaced fixed halves (`slice(0, 3)`, `slice(3, 6)`) with dynamic thirds (`Math.floor(total / 3)`)
- Added 40% overall representation requirement for PIVOT patterns to avoid false positives on lopsided patterns like `AAAAABB`
- PIVOT detection now checks: `firstThirdPercent >= 0.66 && lastThirdPercent <= 0.33 && bPercent >= 0.4`
- All 59 tests pass (32 original + 27 new)

**Backward Compatibility Verified:**
- 6-choice pattern `AAABBB`: firstThird = [A,A] (100% >= 66%), lastThird = [B,B] (0% <= 33%), bPercent = 50% >= 40% → PIVOT_LATE ✓
- 6-choice pattern `AAAAAB`: aPercent = 83% >= 66% → SEEKER ✓
- 6-choice pattern `ABABAB`: perfect alternation → MIRROR ✓
- All original tests pass unchanged

**Files Modified:**
- `src/machines/guards/patternMatching.ts`: Updated `determineArchetype()` function with percentage logic, updated JSDoc to mention variable-length support
- `src/machines/guards/__tests__/patternMatching.test.ts`: Added 4 new `describe` blocks with 27 test cases

**Commit:** `f2771ec` (test + implementation combined)

---

### Task 2: Extend timing validation for branch-aware path calculation

**Implementation:**
- Replaced single `calculateMaxPath()` with unified `calculatePath(config: PathConfig)` function
- Added `PathConfig` interface: `{ name, hasQ2B, hasQ4B, questionCount }`
- Defined `ALL_PATHS` array with 4 permutations:
  1. No branches (6Q)
  2. Q2B only (7Q)
  3. Q4B only (7Q)
  4. Both Q2B+Q4B (8Q)
- Removed old `calculateMinPath()` function (no longer needed)
- Updated `main()` to iterate all 4 paths, calculate durations, report max/min/avg

**Timing Results:**
```
MAX-PATH: Both Q2B+Q4B (8Q) — 357.1s = 5:57.1 min
MIN-PATH: No branches (6Q) — 300.1s = 5:00.1 min
AVG-PATH: 328.6s = 5:28.6 min
```

**Validation:** STATUS: PASS (all paths within 300-420 seconds target)

**Branch Content Impact:**
- Q2B adds: ~21.2s (9.7s setup + 2.0s pergunta + 9.5s resposta + 4s listener = 25.2s, but offset by different path timing)
- Q4B adds: ~31.9s (13.7s setup + 4.4s pergunta + 9.8s resposta + 4s listener)
- Both branches add: ~57.0s total (325.3s + 332.0s - 300.1s)

**Files Modified:**
- `scripts/validate-timing.ts`: Rewrote path calculation logic, updated header comment to mention "BRANCH-AWARE", added PathConfig interface

**Commit:** `a92cb62`

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Verification Results

**Automated Tests:**
- `npm test -- --run src/machines/guards/__tests__/patternMatching.test.ts`: 59/59 passed
- `npx tsx scripts/validate-timing.ts`: Exit code 0 (PASS)

**Acceptance Criteria Met:**
- ✅ patternMatching.ts contains `const aPercent = aCount / total` (percentage-based)
- ✅ patternMatching.ts contains `Math.floor(total / 3)` (thirds-based PIVOT detection)
- ✅ patternMatching.ts contains `aPercent >= 0.66` (SEEKER threshold)
- ✅ patternMatching.ts contains `bPercent >= 0.66` (GUARDIAN threshold)
- ✅ patternMatching.ts does NOT contain `aCount === 6` (old absolute check)
- ✅ patternMatching.ts does NOT contain `slice(0, 3)` with hardcoded 3 for halves
- ✅ patternMatching.test.ts contains `describe('variable-length choice arrays`
- ✅ patternMatching.test.ts contains at least 3 test cases with 8-element arrays (8 total)
- ✅ patternMatching.test.ts contains at least 2 test cases with 7-element arrays (4 total)
- ✅ All tests pass (npm test exits 0)
- ✅ All original 6-choice tests still pass (backward compatibility)
- ✅ scripts/validate-timing.ts contains `BRANCH-AWARE` in file header
- ✅ scripts/validate-timing.ts contains `calculatePath` function
- ✅ scripts/validate-timing.ts contains `ALL_PATHS` array with 4 entries
- ✅ scripts/validate-timing.ts contains `hasQ2B` and `hasQ4B` properties
- ✅ scripts/validate-timing.ts contains `INFERNO_Q2B_SETUP` in path calculation
- ✅ scripts/validate-timing.ts contains `PURGATORIO_Q4B_SETUP` in path calculation
- ✅ scripts/validate-timing.ts output contains "Both Q2B+Q4B" path
- ✅ scripts/validate-timing.ts output contains "STATUS: PASS"
- ✅ scripts/validate-timing.ts exits with code 0 (max-path within 300-420s)
- ✅ Does NOT contain old `calculateMaxPath()` or `calculateMinPath()` functions

---

## Known Stubs

None - all pattern matching logic is fully implemented with production-quality classification. Timing validation calculates actual script content, no mocked durations.

---

## Key Technical Insights

**1. Percentage Thresholds vs Absolute Values:**
The shift from absolute counts to percentages allows the same classification logic to work across 6-10 choice arrays. The 66% threshold was chosen to maintain backward compatibility (4/6 = 67% rounds to SEEKER, same as absolute >= 4).

**2. PIVOT Detection Edge Case:**
Pattern `AAAAABB` (7 choices) initially triggered PIVOT_LATE because firstThird=[A,A] (100%) and lastThird=[B,B] (0%). Adding the `bPercent >= 0.4` constraint ensures PIVOT only triggers when there's substantial representation of both choices, avoiding classification of "mostly A with trailing Bs" as a pivot.

**3. Branch Timing Non-Linearity:**
The timing impact of branches is not perfectly additive due to variable resposta lengths. Explicit 4-path calculation revealed:
- No branches: 300.1s
- +Q2B: 325.3s (+25.2s)
- +Q4B: 332.0s (+31.9s)
- +Both: 357.1s (+57.0s, not 300.1 + 25.2 + 31.9 = 357.2s due to rounding)

**4. Test Coverage Strategy:**
Tests cover:
- All 8 archetypes for 6-choice (existing)
- All 8 archetypes for 8-choice (new)
- 4 archetypes for 7-choice (representative sample)
- Edge cases: <6 valid, 10 choices, all nulls

This ensures classification works for any path length (6-10) without exhaustive combinatorial testing.

---

## Impact on Downstream Systems

**State Machine (Phase 27):**
- Machine context will track variable-length `ChoicePattern` array (6-10 elements)
- Pattern matching guards already support this via `determineArchetype()`
- No machine changes needed for pattern analysis

**Audio Generation (Phase 28):**
- 8 additional audio files needed (4 branch sections × 2 respostas)
- Timing script confirms max-path stays within 7-minute TTS API limit

**Integration (Phase 29):**
- Components need to handle 7-8 question flows (currently expect 6)
- Branch triggering logic needs implementation (Q1=A && Q2=A → Q2B)

---

## Self-Check: PASSED

**Created files exist:**
- (None created, only modified existing files)

**Modified files exist:**
- ✅ `src/machines/guards/patternMatching.ts` exists
- ✅ `src/machines/guards/__tests__/patternMatching.test.ts` exists
- ✅ `scripts/validate-timing.ts` exists

**Commits exist:**
- ✅ `f2771ec` found in git log
- ✅ `a92cb62` found in git log

**Tests pass:**
- ✅ Pattern matching tests: 59/59 passed
- ✅ Timing validation: Exit 0 (PASS)

**Key functions present:**
```bash
$ grep -n "const aPercent" src/machines/guards/patternMatching.ts
49:  const aPercent = aCount / total;

$ grep -n "Math.floor(total / 3)" src/machines/guards/patternMatching.ts
58:  const oneThird = Math.floor(total / 3);

$ grep -n "ALL_PATHS" scripts/validate-timing.ts
110:const ALL_PATHS: PathConfig[] = [

$ grep -n "hasQ2B" scripts/validate-timing.ts
104:  hasQ2B: boolean;
111:  { name: 'No branches (6Q)', hasQ2B: false, hasQ4B: false, questionCount: 6 },
112:  { name: 'Q2B only (7Q)', hasQ2B: true, hasQ4B: false, questionCount: 7 },
114:  { name: 'Both Q2B+Q4B (8Q)', hasQ2B: true, hasQ4B: true, questionCount: 8 },
```

All verifications passed. Plan complete.
