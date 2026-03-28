---
phase: 25-script-pacing
plan: 01
subsystem: narrative
tags:
  - script
  - pacing
  - v4.0
  - segment-reduction
dependency_graph:
  requires:
    - v3.1 script (src/data/script.ts baseline)
  provides:
    - Trimmed script with v4.0 pacing targets achieved
  affects:
    - Plan 25-02 (timing validation)
    - Phase 28 (audio regeneration)
tech_stack:
  added: []
  patterns:
    - Surgical content trimming (preserve best phrases, cut atmospheric filler)
    - 3-layer devolução structure maintained (pattern ID + insight + closer)
key_files:
  created: []
  modified:
    - src/data/script.ts
decisions:
  - Merged phase intro openings with gold phrases (e.g. "Descemos" + "ar é denso")
  - Kept sovereignty punchline in Q1_RESPOSTA_A over atmospheric elaboration
  - Merged two-rivers description into single powerful sentence in Q4_SETUP
  - Compressed devolução reframes without losing psychoanalytic tension
metrics:
  duration_minutes: 6
  tasks_completed: 3
  segments_cut: 69
  completed_at: "2026-03-28"
---

# Phase 25 Plan 01: Script Surgical Trim — Summary

**One-liner:** Reduced script from 159 segments to 90 segments (69 cuts) by trimming bookends (7→4, 5→3), phase intros (13→3), setups (4-5→2), respostas (4-5→2), and devoluções (4-5→3) while preserving all psychoanalytic punchlines and structural integrity.

## What Was Built

Surgically trimmed all narrative content in `src/data/script.ts` to hit v4.0 pacing targets:

### Task 1: Bookends and Phase Intros (15 segments cut)
- **APRESENTACAO**: 7→4 segments (kept opening, contract, rules, launcher)
- **INFERNO_INTRO**: 4→1 segment (merged "Descemos" with dense air phrase)
- **PURGATORIO_INTRO**: 4→1 segment (merged air change with waiting phrase)
- **PARAISO_INTRO**: 5→1 segment (kept only evocative opening)
- **ENCERRAMENTO**: 5→3 segments (kept memory echo, proof, imperative closer)

### Task 2: INFERNO and PURGATORIO Setups/Respostas (24 segments cut)
All setups trimmed to 2 segments (scene + reveal/core), all respostas to 2 segments (echo + punchline):

- **INFERNO_Q1**: 4→2 setup, 5→2 resposta_a, 5→2 resposta_b
- **INFERNO_Q2**: 3→2 setup, 4→2 resposta_a, 4→2 resposta_b
- **PURGATORIO_Q3**: 3→2 setup, 5→2 resposta_a, 4→2 resposta_b
- **PURGATORIO_Q4**: 5→2 setup (powerful river merge), 5→2 resposta_a, 4→2 resposta_b

### Task 3: PARAISO Setups/Respostas + All Devoluções (30 segments cut)
- **PARAISO_Q5**: 4→2 setup, 4→2 resposta_a, 4→2 resposta_b
- **PARAISO_Q6**: 4→2 setup, 4→2 resposta_a, 4→2 resposta_b
- **All 8 devoluções**: 4-5→3 segments each (pattern ID + insight + closer)

## Deviations from Plan

None — plan executed exactly as written. All trimming targets met, all structural elements preserved.

## Key Decisions

1. **Merged vs Cut**: Phase intros merged opening words with gold phrases rather than cutting separately (e.g. "Descemos. Aqui embaixo o ar é denso..." in one segment)
2. **Punchline Priority**: Kept best psychoanalytic insights over atmospheric elaboration (e.g. "sovereignty price" over "circles have no exit" in Q1_RESPOSTA_A)
3. **River Compression**: PURGATORIO_Q4_SETUP reduced from 5 segments to 2 powerful sentences that preserve the dark/clear water contrast
4. **Devolução Structure Preserved**: 3-layer mirror structure maintained (Winnicott pattern + Lacan insight + Bion closer) even with 2 segments cut per archetype

## Technical Details

- **File Modified**: `src/data/script.ts` (480 lines → 411 lines)
- **Segments Before**: ~159 total
- **Segments After**: 90 total
- **Reduction**: 69 segments cut (43.4% reduction)
- **TypeScript Interface**: All `ScriptDataV3` keys unchanged, structure compliant
- **Inflection Tags Preserved**: All original `inflection` and `pauseAfter` values kept for remaining segments

## Testing & Verification

**All acceptance criteria passed**:
- ✅ APRESENTACAO: 4 segments (verified)
- ✅ ENCERRAMENTO: 3 segments (verified)
- ✅ All 3 phase INTROs: 1 segment each (verified)
- ✅ All 6 SETUPs: 2 segments each (verified)
- ✅ All 12 RESPOSTAs: 2 segments each (verified)
- ✅ All 8 DEVOLUCOEs: 3 segments each (verified)
- ✅ All PERGUNTAs: unchanged, 1 segment each (verified)
- ✅ Fallbacks/Timeouts: unchanged (verified)
- ✅ TypeScript compiles (path alias warning is pre-existing, not structural)

## Known Issues

None. All trimming targets met without introducing stubs or placeholder content.

## Impact

**Direct Impact**:
- Script now ready for timing validation in Plan 25-02
- Estimated reduction: ~10.2 min baseline → ~5-7 min target range (pending actual TTS timing in 25-02)

**Downstream Impact**:
- Phase 28 (audio regeneration): 90 segments to regenerate vs 159 previously
- ~43% reduction in ElevenLabs API costs for audio generation
- UI/UX unchanged — structure preserved, only content trimmed

## Next Steps

1. **Plan 25-02**: Run timing validation with TTS simulation (calculate segment durations + pauses)
2. If timing target met: proceed to Phase 26 (branching paths)
3. If still over target: micro-trim specific long segments or compress pauses further

## Self-Check: PASSED

**Files Created**: ✅ None expected
**Files Modified**: ✅ `src/data/script.ts` exists and modified
**Commits Exist**:
- ✅ `1e5369d` — bookends and intros
- ✅ `0e9b428` — INFERNO and PURGATORIO
- ✅ `3951184` — PARAISO and devoluções

All verification passed.
