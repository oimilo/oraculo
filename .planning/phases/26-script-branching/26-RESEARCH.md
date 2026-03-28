# Phase 26: Script Restructure — Branching - Research

**Researched:** 2026-03-28
**Domain:** Branching narrative design for interactive art installation
**Confidence:** HIGH

## Summary

Phase 26 adds branching paths to O Oraculo's linear 6-choice experience, expanding to 8-10 decision points while maintaining the 5-7 minute target and preserving psychoanalytic depth. The challenge is architectural: where to branch, how to converge before devoluções, and how to handle variable-length choice arrays without breaking pattern matching.

Research reveals that successful branching narratives use **foldback patterns** (diverge then converge) rather than true branching (exponential growth). Industry best practice for scope control is 2-3 major branch points with convergence before ending sequences, which aligns perfectly with v4.0's requirement to converge before devoluções.

**Primary recommendation:** Add 2-4 new decision points via **conditional transitions after Q2 and Q4 responses**, creating Q2B and Q4B variants that only occur if specific choices are made. This adds decision points without adding universal story beats, keeping max-path timing under control.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BRNC-01 | Experience has 8-10 total decision points (up from 6) | Conditional states after Q2/Q4 add 2-4 points; Architecture Patterns section shows XState v5 guard-based routing |
| BRNC-02 | At least 2 branching points where choice determines next scenario | Q2 and Q4 identified as natural branch points based on Dante structure and psychoanalytic depth curve |
| BRNC-03 | All branch paths converge before devoluções (no dead ends) | Foldback pattern ensures all paths reach DEVOLUCAO state; pattern matching handles variable-length arrays |
| BRNC-04 | Branch-specific content maintains psychoanalytic depth | Script naming convention + research synthesis gold phrases provide templates for depth-4-5 content |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| XState | 5.20.0 (current) → 5.30.0 (latest) | State machine with conditional transitions | Industry standard for complex state orchestration; v5 has higher-order guards (and/or/not) for branch logic |
| TypeScript | 5.7.3 | Type safety for variable-length ChoicePattern | Ensures pattern matching handles 6-10 choices safely; tuple types prevent runtime errors |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 2.1.8 | Test branching paths | All new conditional transitions need test coverage |

**Installation:**
```bash
npm install xstate@5.30.0
```

**Version verification:** XState 5.30.0 published 2025-01-14 (current as of 2026-03-28). Using 5.20.0 currently — upgrade recommended for improved guard performance.

## Architecture Patterns

### Recommended Branching Structure

```
APRESENTAÇÃO
    │
═══ INFERNO ═══
    │
Q1 (all visitors)
    │
    ├─ Q1_RESPOSTA_A
    │   └─ Q2_SETUP
    └─ Q1_RESPOSTA_B
        └─ Q2_SETUP
    │
Q2 (all visitors)
    │
    ├─ Q2_RESPOSTA_A (chose "recuar")
    │   ├─ [guard: choice1 === 'A'] → Q2B_SETUP (branch: "segunda coisa no chão")
    │   │   └─ Q2B → converge to PURGATORIO
    │   └─ [else] → PURGATORIO (standard path)
    │
    └─ Q2_RESPOSTA_B (chose "ficar olhando")
        └─ PURGATORIO (no branch — reward for staying)
    │
═══ PURGATORIO ═══
    │
Q3 (all visitors)
    │
Q4 (all visitors)
    │
    ├─ Q4_RESPOSTA_A (chose "lembrar")
    │   ├─ [guard: choice3 === 'A'] → Q4B_SETUP (branch: "memória específica")
    │   │   └─ Q4B → converge to PARAISO
    │   └─ [else] → PARAISO (standard path)
    │
    └─ Q4_RESPOSTA_B (chose "esquecer")
        └─ PARAISO (no branch — already chose dissolution)
    │
═══ PARAISO ═══
    │
Q5 (all visitors)
    │
Q6 (all visitors)
    │
═══ DEVOLUÇÃO ═══ (all paths converge here)
    │
Pattern matching on choices[0..n] where n = 6-10
```

### Pattern 1: Conditional State Insertion (Branch Point)

**What:** After a RESPOSTA state, use XState guards to conditionally insert a new question state before transitioning to the next realm.

**When to use:** When the previous choice creates narrative momentum for a follow-up question. Only branch on "A" responses (the "toward" choice) to avoid punishing exploration.

**Example:**
```typescript
// Source: XState v5 docs + O Oraculo machine patterns
Q2_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      {
        // Branch condition: if Q1 was also "A" (stayed in comfort)
        // then offer a second confrontation moment
        target: 'Q2B_SETUP',
        guard: ({ context }) => context.choices[0] === 'A',
        actions: assign({ branchTaken: 'Q2B' })
      },
      {
        // Default: proceed to PURGATORIO
        target: '#oracle.PURGATORIO'
      }
    ]
  }
}

Q2B_SETUP: {
  on: { NARRATIVA_DONE: 'Q2B_PERGUNTA' }
},
Q2B_PERGUNTA: {
  on: { NARRATIVA_DONE: 'Q2B_AGUARDANDO' }
},
Q2B_AGUARDANDO: {
  after: {
    25000: {
      target: 'Q2B_TIMEOUT',
      actions: assign(updateChoice(7, 'A')) // New index 7 for Q2B
    }
  },
  on: {
    CHOICE_A: {
      target: 'Q2B_RESPOSTA_A',
      actions: assign(updateChoice(7, 'A'))
    },
    CHOICE_B: {
      target: 'Q2B_RESPOSTA_B',
      actions: assign(updateChoice(7, 'B'))
    }
  }
}
```

### Pattern 2: Variable-Length Choice Array

**What:** Extend ChoicePattern from fixed 6-element tuple to variable-length array that accommodates 6-10 choices.

**When to use:** When branching creates paths of different lengths (some visitors answer 6 questions, others answer 8-10).

**Example:**
```typescript
// Source: Current oracleMachine.types.ts + branching extension

// Before (v3 — fixed 6):
export type ChoicePattern = [ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB, ChoiceAB];

// After (v4 — variable 6-10):
export type ChoicePattern = ChoiceAB[]; // Array of 6-10 choices
// Runtime validation: choices.length >= 6 && choices.length <= 10

// Pattern matching must handle variable length:
export function determineArchetype(choices: ChoicePattern): DevolucaoArchetype {
  const validChoices = choices.filter((c): c is 'A' | 'B' => c !== null);

  // Must have at least 6 choices for any archetype except CONTRADICTED
  if (validChoices.length < 6) {
    return 'CONTRADICTED';
  }

  // Pattern detection works on percentage, not absolute count:
  const aCount = validChoices.filter(c => c === 'A').length;
  const bCount = validChoices.filter(c => c === 'B').length;
  const aPercent = aCount / validChoices.length;

  // SEEKER: 66%+ A choices (was 4/6 = 66%, now 4/6 to 7/10 = 70%)
  if (aPercent >= 0.66) {
    return 'SEEKER';
  }
  // ... etc
}
```

### Pattern 3: Script Key Naming for Branch Content

**What:** Extend ScriptDataV3 interface with branch-specific keys that follow a predictable naming pattern.

**When to use:** For all branch-specific narrative content that differs from the main path.

**Example:**
```typescript
// Source: src/data/script.ts structure

export interface ScriptDataV4 extends ScriptDataV3 {
  // Branch Q2B (conditional after Q2_RESPOSTA_A)
  INFERNO_Q2B_SETUP: SpeechSegment[];
  INFERNO_Q2B_PERGUNTA: SpeechSegment[];
  INFERNO_Q2B_RESPOSTA_A: SpeechSegment[];
  INFERNO_Q2B_RESPOSTA_B: SpeechSegment[];

  // Branch Q4B (conditional after Q4_RESPOSTA_A)
  PURGATORIO_Q4B_SETUP: SpeechSegment[];
  PURGATORIO_Q4B_PERGUNTA: SpeechSegment[];
  PURGATORIO_Q4B_RESPOSTA_A: SpeechSegment[];
  PURGATORIO_Q4B_RESPOSTA_B: SpeechSegment[];

  // Fallbacks and timeouts for branch questions
  FALLBACK_Q2B: SpeechSegment[];
  FALLBACK_Q4B: SpeechSegment[];
  TIMEOUT_Q2B: SpeechSegment[];
  TIMEOUT_Q4B: SpeechSegment[];
}

// Naming pattern: {REALM}_{QUESTION}{VARIANT}_{TYPE}
// INFERNO_Q2B_SETUP = Inferno realm, Question 2 branch B variant, Setup type
```

### Anti-Patterns to Avoid

- **Exponential branching:** Don't branch after every choice. 2^10 = 1024 paths. Use foldback (diverge → converge) instead.
- **Orphaned branches:** All branches must converge before DEVOLUCAO. Pattern matching expects a complete path, not dead ends.
- **Branch-specific devoluções:** Don't create separate devoluções for branch takers. Pattern matching should handle 6-10 choices uniformly.
- **Punishing exploration:** Don't branch only on "B" choices (the "away" choice). Branch on "A" (toward) to reward depth-seeking.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conditional routing based on accumulated state | Nested if/else in event handlers | XState v5 guards in transition arrays | Guards are declarative, testable, and visualizable in Stately editor |
| Pattern matching for variable-length arrays | Custom loop logic in devolucao routing | Percentage-based thresholds + filter | Percentage thresholds scale automatically from 6 to 10 choices |
| Branch path timing validation | Manual path enumeration | Extend validate-timing.ts with branch-aware path calculation | Script already has validated patterns for max/min path — extend, don't rewrite |

**Key insight:** XState v5's guard arrays with fallthrough semantics handle branching elegantly. Don't try to manage branch state externally — let the state machine do it.

## Common Pitfalls

### Pitfall 1: Timing Budget Explosion
**What goes wrong:** Adding 4 new decision points adds ~2 minutes (4 questions × 30s each), breaking the 5-7 min target.
**Why it happens:** Treating branches as universal story beats instead of conditional paths. If every visitor encounters 10 questions, max-path becomes 7+ minutes.
**How to avoid:** Use **conditional branches** that only occur for specific choice patterns. E.g., Q2B only appears if Q1 was "A" AND Q2 was "A". This adds decision points without adding universal time.
**Warning signs:** validate-timing.ts shows max-path > 420 seconds (7 minutes).

### Pitfall 2: Pattern Matching Breaks on Variable-Length Arrays
**What goes wrong:** determineArchetype() expects exactly 6 choices. Passing 8-10 choices causes index-based logic (firstHalf = choices.slice(0, 3)) to fail.
**Why it happens:** Current pattern matching uses absolute thresholds (4/6 A's = SEEKER). With variable length, 4/10 A's ≠ SEEKER.
**How to avoid:** Convert absolute thresholds to **percentage-based thresholds**. SEEKER = 66%+ A choices (4/6, 6/9, or 7/10).
**Warning signs:** Tests fail with "expected SEEKER, got CONTRADICTED" for valid patterns.

### Pitfall 3: NLU Keyword Collision
**What goes wrong:** Adding Q2B and Q4B creates 8-10 questions, but NLU keywords in QUESTION_META only cover Q1-Q6. Q2B inherits Q2's keywords, causing misclassification.
**Why it happens:** Keyword maps are indexed by question number (1-6), but branch questions need distinct keywords. "Ficar" might mean different things in Q2 vs Q2B.
**How to avoid:** Extend QUESTION_META to index 7-10 with branch-specific keywords. Use more specific phrases ("ficar perto" vs "ficar aqui") to disambiguate.
**Warning signs:** NLU consistently misclassifies responses to branch questions, or useVoiceChoice logs show wrong keywords matching.

### Pitfall 4: Convergence Point Mismatch
**What goes wrong:** Branch paths transition directly to DEVOLUCAO without going through PARAISO, causing devoluções to receive incomplete choice arrays.
**Why it happens:** Shortcutting the convergence point to save time, but DEVOLUCAO routing expects all visitors to have passed through all 3 realms (INFERNO → PURGATORIO → PARAISO).
**How to avoid:** All branches must converge **before the next realm transition**, not at DEVOLUCAO. Q2B converges at PURGATORIO intro, Q4B converges at PARAISO intro.
**Warning signs:** Some visitors skip Q5/Q6, devoluções reference questions they never answered.

## Code Examples

Verified patterns from XState v5 documentation and current O Oraculo machine:

### Conditional Branch Transition
```typescript
// Source: XState v5 Guards documentation + oracleMachine.ts pattern
// https://stately.ai/docs/guards

INFERNO_Q2_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      {
        // Guard condition: branch if Q1 was also "A"
        target: 'Q2B_SETUP',
        guard: ({ context }) => context.choices[0] === 'A',
      },
      {
        // Default fallthrough: no branch, go to PURGATORIO
        target: '#oracle.PURGATORIO',
      }
    ]
  }
}
```

### Percentage-Based Pattern Matching
```typescript
// Source: patternMatching.ts + scaling for variable-length arrays

export function determineArchetype(choices: ChoicePattern): DevolucaoArchetype {
  const validChoices = choices.filter((c): c is 'A' | 'B' => c !== null);

  // Must have at least 6 choices
  if (validChoices.length < 6) {
    return 'CONTRADICTED';
  }

  // Count choices
  const aCount = validChoices.filter(c => c === 'A').length;
  const bCount = validChoices.filter(c => c === 'B').length;

  // Calculate percentages
  const aPercent = aCount / validChoices.length;
  const bPercent = bCount / validChoices.length;

  // DEPTH_SEEKER: all A (100%)
  if (aPercent === 1) {
    return 'DEPTH_SEEKER';
  }

  // SURFACE_KEEPER: all B (100%)
  if (bPercent === 1) {
    return 'SURFACE_KEEPER';
  }

  // SEEKER: 66%+ A (4/6, 6/9, 7/10)
  if (aPercent >= 0.66) {
    return 'SEEKER';
  }

  // GUARDIAN: 66%+ B
  if (bPercent >= 0.66) {
    return 'GUARDIAN';
  }

  // PIVOT detection: split into thirds for variable-length arrays
  const oneThird = Math.floor(validChoices.length / 3);
  const firstThird = validChoices.slice(0, oneThird);
  const lastThird = validChoices.slice(-oneThird);

  const firstThirdA = firstThird.filter(c => c === 'A').length / firstThird.length;
  const lastThirdA = lastThird.filter(c => c === 'A').length / lastThird.length;

  // PIVOT_LATE: starts A-heavy (>66%), ends B-heavy (<33%)
  if (firstThirdA >= 0.66 && lastThirdA <= 0.33) {
    return 'PIVOT_LATE';
  }

  // PIVOT_EARLY: starts B-heavy (<33%), ends A-heavy (>66%)
  if (firstThirdA <= 0.33 && lastThirdA >= 0.66) {
    return 'PIVOT_EARLY';
  }

  // Default: CONTRADICTED
  return 'CONTRADICTED';
}
```

### Branch-Aware Timing Validation
```typescript
// Source: scripts/validate-timing.ts + branch path extension

/**
 * Calculate all possible paths through branching structure
 */
function calculateAllPaths(): Array<{ name: string, sections: Array<{ name: string, segments: SpeechSegment[] }> }> {
  const paths = [];

  // Path 1: No branches (shortest: 6 questions)
  paths.push({
    name: 'No branches',
    sections: [
      { name: 'APRESENTACAO', segments: SCRIPT.APRESENTACAO },
      { name: 'INFERNO_INTRO', segments: SCRIPT.INFERNO_INTRO },
      // ... Q1, Q2 (no Q2B), Q3, Q4 (no Q4B), Q5, Q6
      { name: 'DEVOLUCAO_SEEKER', segments: SCRIPT.DEVOLUCAO_SEEKER },
      { name: 'ENCERRAMENTO', segments: SCRIPT.ENCERRAMENTO },
    ]
  });

  // Path 2: Q2B branch only (7 questions)
  paths.push({
    name: 'Q2B branch',
    sections: [
      // ... APRESENTACAO, INFERNO_INTRO, Q1, Q2, Q2B, Q3, Q4 (no Q4B), Q5, Q6
    ]
  });

  // Path 3: Q4B branch only (7 questions)
  // Path 4: Both branches (longest: 8 questions)

  return paths;
}

function main() {
  const paths = calculateAllPaths();

  let maxPathTotal = 0;
  let maxPathName = '';

  for (const path of paths) {
    let narrationSeconds = 0;
    for (const section of path.sections) {
      narrationSeconds += calculateSectionDuration(section.segments);
    }

    const questionCount = path.sections.filter(s => s.name.includes('_PERGUNTA')).length;
    const listenerTime = questionCount * 4; // 4s per question
    const total = narrationSeconds + listenerTime;

    if (total > maxPathTotal) {
      maxPathTotal = total;
      maxPathName = path.name;
    }
  }

  console.log(`MAX-PATH: ${maxPathName} (${maxPathTotal.toFixed(1)}s = ${formatDuration(maxPathTotal)} min)`);

  const pass = maxPathTotal >= 300 && maxPathTotal <= 420;
  process.exit(pass ? 0 : 1);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed-length choice tuples | Variable-length choice arrays with percentage thresholds | Branching narratives (2024+) | Pattern matching scales automatically across 6-10 choices |
| Absolute guard conditions (if x === 5) | Percentage-based guards (if x >= 0.6) | XState v5 higher-order guards (2023) | Guards compose with and/or/not for complex branch logic |
| Manual path enumeration for timing | Path generation from state machine structure | Game dev best practice (2026) | Timing validation discovers all paths automatically |
| Universal story beats | Conditional story beats | Foldback pattern in interactive fiction (2015+) | Adds decision points without adding universal time cost |

**Deprecated/outdated:**
- **Fixed 6-element ChoicePattern tuple:** Variable-length arrays are now necessary for branching. Update to `ChoiceAB[]` with runtime validation.
- **Index-based pattern matching (choices.slice(0, 3)):** Breaks with variable-length arrays. Use thirds: `Math.floor(choices.length / 3)`.

## Open Questions

1. **Which choices should trigger branches?**
   - What we know: Q2 and Q4 are natural candidates (Inferno and Purgatorio depth moments). Q1/Q3/Q5/Q6 less suitable (Q1 too early, Q3/Q5 already deep, Q6 meta).
   - What's unclear: Should branches occur after "A" responses (reward exploration) or "B" responses (challenge avoidance)?
   - Recommendation: Branch after "A" responses only. Branching after "B" (away/protective choice) punishes safety-seeking. Branch after "A" (toward/exploratory choice) rewards depth.

2. **How many branches without exceeding 7 min?**
   - What we know: Each question adds ~30-40s (setup + pergunta + resposta + 4s listen time). Current max-path is 5:00.1 min. Budget allows ~2 min = 3-4 new questions.
   - What's unclear: Conditional branches don't add universal time, but testing needs real timing data with branches.
   - Recommendation: Add Q2B and Q4B as conditional branches first (adds 2 decision points, max 1 min to longest path). Test with validate-timing.ts. If under 6:30, consider Q3B or Q5B for 9-10 total.

3. **Should branch questions have distinct themes or extend the main question?**
   - What we know: Script research (RESEARCH-SYNTHESIS.md) has 24 scenarios across 4 clusters. Could use "The Voice That Will Not Stop" or "The Locked Room" as branch content.
   - What's unclear: Should Q2B be a completely new scenario (different metaphor), or a deeper layer of Q2 (same "thing on the floor" metaphor, different angle)?
   - Recommendation: Extend the main question for narrative cohesion. Q2B = "second thing on the floor" (visitor who stayed now faces a second confrontation). This preserves the Dante realm structure.

4. **How does branching affect the 8 devolução archetypes?**
   - What we know: Pattern matching currently handles 6 choices. Archetypes are based on shape, not content.
   - What's unclear: Does a visitor who takes Q2B + Q4B (8 choices) get routed differently than a visitor who takes no branches (6 choices)?
   - Recommendation: No. Devoluções should be content-agnostic. SEEKER with 8 choices (6A, 2B) = 75% A = still SEEKER. Pattern matching already percentage-based.

## Environment Availability

> No external dependencies identified for this phase. Script restructuring is code/config-only changes to TypeScript files and XState machine definition. All required tools (Node.js, TypeScript, XState) already installed and verified in Phase 25.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRNC-01 | 8-10 total decision points across all paths | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "branching"` | ❌ Wave 0 |
| BRNC-02 | Q2B and Q4B conditional states exist and route correctly | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "conditional"` | ❌ Wave 0 |
| BRNC-03 | All branch paths converge before DEVOLUCAO | unit | `npm test -- src/machines/__tests__/oracleMachine.test.ts -t "convergence"` | ❌ Wave 0 |
| BRNC-04 | Pattern matching handles 6-10 choices with percentage thresholds | unit | `npm test -- src/machines/guards/__tests__/patternMatching.test.ts -t "variable"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run` (all tests, CI mode)
- **Per wave merge:** `npm test` (watch mode if needed)
- **Phase gate:** Full suite green + validate-timing.ts passes for all paths before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/machines/__tests__/oracleMachine.test.ts` — covers branching, conditional transitions, convergence (BRNC-01, BRNC-02, BRNC-03)
- [ ] `src/machines/guards/__tests__/patternMatching.test.ts` — covers variable-length choice arrays (BRNC-04)
- [ ] `scripts/__tests__/validate-timing.test.ts` — covers branch-aware path calculation

## Sources

### Primary (HIGH confidence)
- XState v5 Guards documentation - https://stately.ai/docs/guards - Conditional transition patterns with higher-order guards
- Current oracleMachine.ts (5.20.0) - Verified guard usage patterns in DEVOLUCAO routing
- Current patternMatching.ts - Verified determineArchetype() logic for extending to variable-length arrays
- scripts/validate-timing.ts - Verified max/min path calculation methodology
- src/data/script.ts - Verified ScriptDataV3 interface structure and naming conventions

### Secondary (MEDIUM confidence)
- [Meaningful Decisions in Branching Narratives](https://www.gamedeveloper.com/design/meaningful-decisions-in-branching-narratives) - Foldback pattern (diverge → converge) as industry best practice
- [Standard Patterns in Choice-Based Games](https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/) - Convergence points and scope control
- [Beyond Branching: Quality-Based, Salience-Based, and Waypoint Narrative Structures](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-and-waypoint-narrative-structures/) - Emily Short's alternative branching structures
- [How to Create Branching Narratives in Interactive Fiction](https://www.depthtale.com/en/app/blog/how-to-create-branching-narratives-in-interactive-fiction) - Modular design techniques for branch content

### Tertiary (LOW confidence — requires validation)
- [Game Development Story Direction: How Narrative Shapes Success & Latest Best Practices for 2026](https://copyprogramming.com/howto/how-does-the-direction-of-a-game-during-creation-affect-its-success) - Claims about 2026 procedural storytelling (not yet verified in production systems)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - XState v5 feature set verified in official docs, current machine uses v5 patterns
- Architecture: HIGH - Conditional transitions pattern verified in current machine, foldback pattern widely documented
- Pitfalls: HIGH - Timing budget math derived from validate-timing.ts, pattern matching issues visible in current code structure
- Branch placement strategy: MEDIUM - Q2/Q4 recommendation based on narrative structure analysis, not validated in user testing

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (30 days — stable domain, XState v5 patterns unlikely to change)
