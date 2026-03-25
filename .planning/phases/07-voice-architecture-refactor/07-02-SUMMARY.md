---
phase: 07-voice-architecture-refactor
plan: 02
subsystem: state-machine
tags: [refactoring, xstate-v5, guards, type-safety, extensibility]
completed_at: "2026-03-25T23:09:54Z"
duration_seconds: 208
tasks_completed: 2
requirements_validated: [QUAL-03]

dependency_graph:
  requires: []
  provides:
    - "Generic guard factory for choice point routing"
    - "XState v5 setup() pattern in oracleMachine"
    - "Type-safe named guards for DEVOLUCAO routing"
  affects:
    - "Future choice point additions now require minimal code"
    - "Guards independently testable in isolation"

tech_stack:
  added: []
  patterns:
    - "XState v5 setup() with typed guards"
    - "Factory pattern for guard generation"
    - "Compound guard composition"

key_files:
  created:
    - path: "src/machines/guards/createChoiceGuard.ts"
      purpose: "Generic guard factory for choice point routing"
      exports: ["createChoiceGuard", "createCompoundGuard", "PATH_GUARDS"]
    - path: "src/machines/guards/__tests__/createChoiceGuard.test.ts"
      purpose: "Unit tests for guard factory"
      tests: 16

  modified:
    - path: "src/machines/oracleMachine.ts"
      changes: "Refactored to use setup() with named guards"
      impact: "Replaced 4 inline anonymous guards with string references"
    - path: "src/machines/oracleMachine.test.ts"
      changes: "Added QUAL-03 test verifying named guards"
      tests: 33

decisions:
  - title: "Use setup() instead of createMachine"
    rationale: "XState v5 setup() enables type-safe named guards and better testability"
    outcome: "All guards defined once in setup({ guards: {...} }), referenced by string"

  - title: "Pre-build PATH_GUARDS for DEVOLUCAO routing"
    rationale: "4 DEVOLUCAO paths are known at design time, pre-building avoids runtime factory calls"
    outcome: "PATH_GUARDS object with isPathAFicar, isPathAEmbora, isPathBPisar, isPathBContornar"

  - title: "Provide both createChoiceGuard and createCompoundGuard"
    rationale: "Single-field guards (createChoiceGuard) are composable; compound guards handle multi-condition routing"
    outcome: "Flexibility for future choice points with complex conditions"

metrics:
  files_created: 2
  files_modified: 2
  tests_added: 17
  tests_passing: 49
  lines_added: 299
  lines_removed: 50
---

# Phase 07 Plan 02: Generic State Machine Guards Summary

**One-liner:** Created generic guard factory with XState v5 setup() pattern, replacing 4 inline anonymous DEVOLUCAO guards with type-safe named string references.

## What Was Built

Refactored oracleMachine to use XState v5 `setup()` pattern with a generic guard factory, eliminating code duplication in choice point routing and enabling independent guard testing.

### Key Components

1. **Guard Factory** (`createChoiceGuard.ts`)
   - `createChoiceGuard(field, value)` — single-field matching guard
   - `createCompoundGuard(conditions)` — multi-field AND logic guard
   - `PATH_GUARDS` — pre-built guards for all 4 DEVOLUCAO routing paths

2. **Machine Refactoring** (`oracleMachine.ts`)
   - Changed from `createMachine()` to `setup().createMachine()`
   - Defined guards in `setup({ guards: {...} })` configuration
   - DEVOLUCAO state uses string guard references instead of inline functions

3. **Test Coverage**
   - 16 unit tests for guard factory (single-field, compound, path guards, mutual exclusivity)
   - All 33 existing state machine tests pass unchanged
   - New QUAL-03 test verifies all 4 paths use named guards

## Deviations from Plan

None. Plan executed exactly as written.

## Technical Decisions

### XState v5 setup() Pattern

**Before:**
```typescript
export const oracleMachine = createMachine({
  id: 'oracle',
  types: {} as { context: OracleContext; events: OracleEvent },
  states: {
    DEVOLUCAO: {
      always: [
        { target: 'X', guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'FICAR' },
        // ... 3 more inline duplicates
      ]
    }
  }
});
```

**After:**
```typescript
export const oracleMachine = setup({
  types: {} as { context: OracleContext; events: OracleEvent },
  guards: {
    isPathAFicar: PATH_GUARDS.isPathAFicar,
    // ... 3 more named guards
  },
}).createMachine({
  id: 'oracle',
  states: {
    DEVOLUCAO: {
      always: [
        { target: 'DEVOLUCAO_A_FICAR', guard: 'isPathAFicar' },
        // ... 3 more string references
      ]
    }
  }
});
```

**Benefits:**
- Guards testable in isolation (without spinning up full state machine)
- Type-safe field references (typo in `context.choiceX` caught at compile time)
- Zero runtime behavior change (all 33 existing tests pass)
- Extensible: adding new choice points requires only calling factory, not duplicating logic

### Compound Guard Pattern

Chose to provide both `createChoiceGuard` (single-field) and `createCompoundGuard` (multi-field AND logic) instead of only compound guards. This enables:

1. **Composability** — guards can be built incrementally
2. **Clarity** — simple conditions remain simple
3. **Future flexibility** — complex OR/NOT logic possible via composition

Example future usage:
```typescript
const isSpecialCase = createCompoundGuard([
  { field: 'choice1', value: 'A' },
  { field: 'fallbackCount', value: '0' }, // hypothetical condition
]);
```

## Verification Results

### Automated Tests

```bash
npx vitest run src/machines/guards/__tests__/createChoiceGuard.test.ts
# ✓ 16/16 tests passed

npx vitest run src/machines/oracleMachine.test.ts
# ✓ 33/33 tests passed (including new QUAL-03 test)
```

### TypeScript Compilation

```bash
npx tsc --noEmit
# ✓ No errors in modified files (pre-existing API route test errors out of scope)
```

### Grep Verification

```bash
# Confirm setup() import
grep "import.*setup" src/machines/oracleMachine.ts
# ✓ import { setup, assign } from 'xstate';

# Confirm PATH_GUARDS usage
grep "PATH_GUARDS" src/machines/oracleMachine.ts
# ✓ import { PATH_GUARDS } from './guards/createChoiceGuard';
# ✓ isPathAFicar: PATH_GUARDS.isPathAFicar, (x4)

# Confirm string guard references
grep "guard: 'isPath" src/machines/oracleMachine.ts
# ✓ { target: 'DEVOLUCAO_A_FICAR', guard: 'isPathAFicar' },
# ✓ (x4 total)

# Confirm inline guards removed
grep "({ context }) => context.choice1 ===" src/machines/oracleMachine.ts
# ✓ No matches found
```

## Architecture Impact

### Before This Plan

- 4 inline anonymous guard functions in DEVOLUCAO state
- Guards untestable in isolation
- Adding new choice points required copy-pasting guard logic
- Context field typos only caught at runtime

### After This Plan

- Generic `createChoiceGuard` factory for all choice points
- Guards tested independently (16 unit tests)
- Adding new choice points: call `createChoiceGuard('fieldName', 'value')`, add to setup()
- Context field typos caught at TypeScript compile time
- Machine behavior identical (all existing tests pass)

### Extensibility Example

Adding a hypothetical third choice point in the future:

```typescript
// 1. Add to factory exports
export const THIRD_CHOICE_GUARDS = {
  isOptionX: createChoiceGuard('choice3', 'X'),
  isOptionY: createChoiceGuard('choice3', 'Y'),
};

// 2. Add to machine setup()
setup({
  guards: {
    ...PATH_GUARDS,
    isOptionX: THIRD_CHOICE_GUARDS.isOptionX,
    isOptionY: THIRD_CHOICE_GUARDS.isOptionY,
  },
})

// 3. Use in state config
NEW_STATE: {
  always: [
    { target: 'BRANCH_X', guard: 'isOptionX' },
    { target: 'BRANCH_Y', guard: 'isOptionY' },
  ]
}
```

No duplication, no inline logic, fully testable.

## Requirements Validated

- **QUAL-03** ✓ — Generic guard factory exists, oracleMachine uses XState v5 setup() with named guards, all 4 DEVOLUCAO paths refactored, guards independently testable.

## Known Stubs

None. No hardcoded values, no placeholders. All guards fully wired to actual context fields.

## Commits

| Commit  | Type     | Description                                              |
| ------- | -------- | -------------------------------------------------------- |
| 805c5da | test     | Add failing tests for guard factory (TDD RED+GREEN)     |
| 97aec7f | refactor | Use XState v5 setup() with named guards                 |

## Self-Check

Verifying all claimed files exist and commits are recorded:

```bash
# Files created
[ -f "src/machines/guards/createChoiceGuard.ts" ] && echo "FOUND"
[ -f "src/machines/guards/__tests__/createChoiceGuard.test.ts" ] && echo "FOUND"

# Commits exist
git log --oneline --all | grep -q "805c5da" && echo "FOUND: 805c5da"
git log --oneline --all | grep -q "97aec7f" && echo "FOUND: 97aec7f"
```

## Self-Check: PASSED

All files exist, all commits recorded, all tests passing.
