---
phase: 39-audio-generation-polish
plan: 01
subsystem: scripts
tags: [audio-generation, dual-voice, v2, script-fix]
dependency_graph:
  requires:
    - "36-01 (getVoiceType function, ELEVENLABS_VOICE_ID_V2 env var)"
  provides:
    - "generate-audio-v3.ts with --v2 dual-voice mode"
    - "script.ts ENCERRAMENTO faca fix committed"
    - ".env.local ELEVENLABS_VOICE_ID_V2 canonical name"
  affects:
    - "39-02 (V2 MP3 generation depends on this script extension)"
tech_stack:
  added: []
  patterns:
    - "CLI flag (--v2) for mode selection in generation script"
    - "Voice classification import for narrative key filtering"
key_files:
  created: []
  modified:
    - "scripts/generate-audio-v3.ts"
    - "src/data/script.ts"
    - ".env.local (local-only, gitignored)"
decisions:
  - "D-01: getVoiceType imported from voiceClassification.ts (reuse, not duplicate)"
  - "D-02: V2 output directory is public/audio/prerecorded/v2/ (subdirectory, not separate root)"
  - "D-03: generateAudio accepts voiceId parameter instead of using module-level constant"
metrics:
  duration: "3 minutes"
  completed: "2026-05-09"
  tasks: 2
  files_modified: 3
---

# Phase 39 Plan 01: Audio Generation Script Extension Summary

Dual-voice generation support via --v2 flag plus ENCERRAMENTO text fix and env var correction

## What Was Done

### Task 1: Fix .env.local env var name and commit script.ts text fix
**Commit:** `5110ad8`

1. **Verified .env.local** already had the correct canonical name `ELEVENLABS_VOICE_ID_V2` (previously renamed from `ELEVENLABS_VOICE_ID2`). Confirmed no old name remains.
2. **Committed script.ts fix** -- ENCERRAMENTO text changed from "Faz alguma coisa com isso." to "Faca alguma coisa com isso." (imperative form correction). Comment also updated to match.

**Files:** `src/data/script.ts` (committed), `.env.local` (verified, gitignored)

### Task 2: Extend generate-audio-v3.ts with --v2 dual-voice mode
**Commit:** `64d50c9`

Surgical extension of the generation script with 7 changes, preserving all V1 behavior:

1. **Added `getVoiceType` import** from `@/lib/voice/voiceClassification` -- reuses existing classification logic
2. **Added `--v2` CLI flag detection** with `isV2Mode` constant at module level
3. **Added `VOICE_ID_V2` resolution** from `ELEVENLABS_VOICE_ID_V2` env var, with error exit if missing in V2 mode
4. **Split `OUTPUT_DIR`** into `OUTPUT_DIR_V1` and `OUTPUT_DIR_V2` constants, selected in `main()` based on mode
5. **Added key filtering** -- V2 mode filters to `VOZ_NARRATIVA` keys only (47 of 82), V1 uses all keys
6. **Added `voiceId` parameter** to `generateAudio()` function -- no longer hardcoded to module-level `VOICE_ID`
7. **Added V2 banner output** showing mode, V2 voice ID, and narrative key count

**Verification results:**
- `--v2 --dry-run`: 47 narrative keys, V2 voice ID `GIuLCSVfgJaUuh7hYOY8`, output to `prerecorded/v2/`
- `--dry-run` (V1): 82 total keys, V1 voice ID `PznTnBc8X6pvixs9UkQm`, output to `prerecorded/` -- zero regression

**Files:** `scripts/generate-audio-v3.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] .env.local already had correct name**
- **Found during:** Task 1
- **Issue:** Plan expected `.env.local` to contain `ELEVENLABS_VOICE_ID2` needing rename, but it already had `ELEVENLABS_VOICE_ID_V2` (correct canonical name)
- **Fix:** Verified correctness, no edit needed. Proceeded to commit the script.ts fix only.
- **Files modified:** None (verification only)

**2. [Rule 2 - Missing] cleanOldFiles needed outputDir parameter**
- **Found during:** Task 2
- **Issue:** `cleanOldFiles()` used the old module-level `OUTPUT_DIR` constant which no longer exists after splitting into V1/V2 variants
- **Fix:** Added `outputDir: string` parameter to `cleanOldFiles()`, passed `OUTPUT_DIR` from `main()`
- **Files modified:** `scripts/generate-audio-v3.ts`

## Verification Results

| Check | Result |
|-------|--------|
| `--v2 --dry-run` shows 47 narrative keys | PASS |
| `--dry-run` (V1) shows 82 total keys | PASS |
| `.env.local` contains `ELEVENLABS_VOICE_ID_V2` | PASS |
| `.env.local` does NOT contain `ELEVENLABS_VOICE_ID2=` | PASS |
| ENCERRAMENTO text contains "Faca" | PASS |
| `generateAudio` accepts `voiceId` parameter | PASS |
| `getVoiceType` import present | PASS |
| V2 output directory `public/audio/prerecorded/v2` in script | PASS |

## Self-Check: PASSED

- [x] `scripts/generate-audio-v3.ts` exists
- [x] `src/data/script.ts` exists
- [x] `39-01-SUMMARY.md` exists
- [x] Commit `5110ad8` found in git log
- [x] Commit `64d50c9` found in git log
- [x] No unexpected file deletions
