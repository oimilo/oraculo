---
phase: 29-integration-validation
plan: 01
subsystem: integration
tags:
  - ui
  - branching
  - state-mapping
  - v4
dependency_graph:
  requires:
    - 27-01 (machine Q2B/Q4B states)
    - 26-01 (QUESTION_META indices 7-8)
    - 28-01 (FALLBACK_Q2B/Q4B audio keys)
  provides:
    - OracleExperience Q2B/Q4B UI support
    - 8 AGUARDANDO state coverage
    - Complete branching UI pipeline
  affects:
    - src/components/experience/OracleExperience.tsx
tech_stack:
  added: []
  patterns:
    - State mapping extension pattern (6 functions updated)
    - Choice config parameterization (buildChoiceConfig)
key_files:
  created: []
  modified:
    - src/components/experience/OracleExperience.tsx
decisions:
  - key: Q2_RESPOSTA_A / Q4_RESPOSTA_A breathing delay
    choice: Changed from LONG to MEDIUM
    rationale: These states may branch (within-realm) OR cross to next phase, so MEDIUM is safer default
    alternatives: Keep LONG (always assume cross-phase), but would feel rushed when branching
  - key: Q2B/Q4B final response delays
    choice: Set to LONG (cross-phase boundary)
    rationale: After branch, always cross to next phase (Q2B → PURGATORIO, Q4B → PARAISO)
    alternatives: MEDIUM (but cross-phase needs dramatic pause)
metrics:
  duration_seconds: 21
  tasks_completed: 1
  files_modified: 1
  lines_added: 32
  lines_removed: 2
  tests_added: 0
  tests_passing: 28
  completed_date: 2026-03-29
---

# Phase 29 Plan 01: Q2B/Q4B Branching UI Integration Summary

**One-liner:** Extended OracleExperience to handle all Q2B/Q4B branching states with complete UI support for 8 AGUARDANDO decision points.

## What Was Built

Added comprehensive UI support for the two conditional branching paths (Q2B in INFERNO, Q4B in PURGATORIO) to complete the v4.0 game flow experience. Extended all 6 state-mapping functions to handle branch states.

## Implementation

### Task 1: Add Q2B/Q4B Choice Configs and Extend State Mapping

**Files modified:**
- `src/components/experience/OracleExperience.tsx`

**Changes made:**
1. **Added branch choice configs** (lines 46-47):
   - `Q2B_CHOICE = buildChoiceConfig(7)` → uses QUESTION_META[7] (tocar/passar)
   - `Q4B_CHOICE = buildChoiceConfig(8)` → uses QUESTION_META[8] (reviver/arquivar)

2. **Extended getBreathingDelay()** for Q2B/Q4B timing:
   - Q2B_SETUP, Q4B_SETUP → MEDIUM (1500ms, within-realm narrative)
   - Q2B_PERGUNTA, Q4B_PERGUNTA → SHORT (800ms, question ends)
   - Q2B_RESPOSTA_A/B, Q4B_RESPOSTA_A/B → LONG (2500ms, cross-phase)
   - Changed Q2_RESPOSTA_A and Q4_RESPOSTA_A from LONG to MEDIUM (may branch within-realm)

3. **Extended getScriptKey()** for Q2B/Q4B TTS mapping:
   - Added 10 new mappings: Q2B_SETUP, Q2B_PERGUNTA, Q2B_RESPOSTA_A/B, Q2B_TIMEOUT
   - Added 10 new mappings: Q4B_SETUP, Q4B_PERGUNTA, Q4B_RESPOSTA_A/B, Q4B_TIMEOUT

4. **Extended getFallbackScript()** for branch fallbacks:
   - Q2B_AGUARDANDO → FALLBACK_Q2B
   - Q4B_AGUARDANDO → FALLBACK_Q4B

5. **Extended activeChoiceConfig memo** for branch choice configs:
   - Q2B_AGUARDANDO → Q2B_CHOICE
   - Q4B_AGUARDANDO → Q4B_CHOICE

6. **Extended isAguardando** boolean:
   - Added Q2B_AGUARDANDO and Q4B_AGUARDANDO checks

**Verification:**
- All component tests pass (28/28)
- Duration: 1.15s

## Deviations from Plan

None. Plan executed exactly as written. All 6 mapping functions extended with Q2B/Q4B state support.

## Key Technical Decisions

### 1. Breathing Delay Adjustment for Conditional Transitions
**Context:** Q2_RESPOSTA_A and Q4_RESPOSTA_A have conditional guards — they may branch within the current realm (Q2B/Q4B) OR cross to the next phase (PURGATORIO/PARAISO).

**Decision:** Changed breathing delay from LONG (2500ms) to MEDIUM (1500ms).

**Rationale:**
- LONG delay appropriate for cross-phase transitions (major structural moment)
- MEDIUM delay appropriate for within-realm narrative beats
- Since the state can go either direction, MEDIUM provides reasonable pause without feeling too rushed when branching

**Alternative considered:** Keep LONG and always assume cross-phase. Rejected because it would create an awkwardly long pause before Q2B_SETUP/Q4B_SETUP.

### 2. Branch Final Responses Always LONG
**Context:** Q2B_RESPOSTA_A/B and Q4B_RESPOSTA_A/B always cross to the next phase (no further branching after branch).

**Decision:** Set breathing delay to LONG (2500ms).

**Rationale:** These are true cross-phase boundaries in all cases. The dramatic pause emphasizes the transition from INFERNO → PURGATORIO or PURGATORIO → PARAISO.

## Validation

### Automated Tests
```bash
npx vitest run src/components/ --reporter=verbose
```
**Result:** ✓ 28 tests passed (3 test files: WaveformVisualizer, DebugPanel, etc.)

### Acceptance Criteria
- [x] OracleExperience.tsx contains `const Q2B_CHOICE = buildChoiceConfig(7)`
- [x] OracleExperience.tsx contains `const Q4B_CHOICE = buildChoiceConfig(8)`
- [x] getScriptKey() contains `INFERNO_Q2B_SETUP` and `PURGATORIO_Q4B_SETUP`
- [x] getFallbackScript() contains `FALLBACK_Q2B` and `FALLBACK_Q4B`
- [x] activeChoiceConfig contains `Q2B_AGUARDANDO` and `Q4B_AGUARDANDO`
- [x] isAguardando contains `Q2B_AGUARDANDO` and `Q4B_AGUARDANDO`
- [x] getBreathingDelay() contains `Q2B_SETUP`, `Q2B_PERGUNTA`, `Q2B_RESPOSTA_A`, `Q4B_SETUP`, `Q4B_PERGUNTA`, `Q4B_RESPOSTA_A`

### Manual Verification
- [x] All 10 Q2B state mappings present (SETUP, PERGUNTA, RESPOSTA_A/B, TIMEOUT, plus AGUARDANDO in fallback/choice)
- [x] All 10 Q4B state mappings present (SETUP, PERGUNTA, RESPOSTA_A/B, TIMEOUT, plus AGUARDANDO in fallback/choice)
- [x] Breathing delay pattern follows realm structure: MEDIUM for setups, SHORT for perguntas, LONG for cross-phase responses

## Commit

**Hash:** eab141a50dc295d77b3493cb87c140fbd8ef3e47

**Message:**
```
feat(29-01): add Q2B/Q4B branching state support to OracleExperience

Extend all 6 mapping functions for branch states: getScriptKey,
getFallbackScript, activeChoiceConfig, isAguardando, getBreathingDelay,
plus Q2B_CHOICE and Q4B_CHOICE configs using QUESTION_META[7] and [8].

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Files changed:**
- src/components/experience/OracleExperience.tsx (32 additions, 2 deletions)

## Known Stubs

None. All branch states map to existing audio keys generated in Phase 28:
- INFERNO_Q2B_SETUP, INFERNO_Q2B_PERGUNTA, INFERNO_Q2B_RESPOSTA_A/B, TIMEOUT_Q2B, FALLBACK_Q2B
- PURGATORIO_Q4B_SETUP, PURGATORIO_Q4B_PERGUNTA, PURGATORIO_Q4B_RESPOSTA_A/B, TIMEOUT_Q4B, FALLBACK_Q4B

All 61 MP3s pre-generated in Phase 28. FallbackTTS PRERECORDED_URLS already updated.

## Integration Points

### Upstream Dependencies
- **Phase 27-01:** XState machine with Q2B/Q4B states and conditional guards
- **Phase 26-01:** QUESTION_META indices 7 and 8 with branch NLU keywords
- **Phase 28-01:** SCRIPT keys and MP3s for all branch states

### Downstream Impact
- **Phase 29-02 (validation):** Component now ready for full branching flow tests
- **Manual browser UAT:** 8 AGUARDANDO states can now be tested end-to-end

## Self-Check: PASSED

**Created files:** None (modification only)

**Modified files:**
```bash
$ [ -f "src/components/experience/OracleExperience.tsx" ] && echo "FOUND: src/components/experience/OracleExperience.tsx" || echo "MISSING"
FOUND: src/components/experience/OracleExperience.tsx
```

**Commits:**
```bash
$ git log --oneline --all | grep -q "eab141a" && echo "FOUND: eab141a" || echo "MISSING: eab141a"
FOUND: eab141a
```

**Tests:**
```bash
$ npx vitest run src/components/ --reporter=verbose 2>&1 | tail -3
 Test Files  3 passed (3)
      Tests  28 passed (28)
   Duration  1.15s
```

All verification steps passed.
