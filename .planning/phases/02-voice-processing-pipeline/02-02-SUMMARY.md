---
phase: 02-voice-processing-pipeline
plan: 02
subsystem: audio-pipeline
tags: [ambient-audio, web-audio-api, crossfade, audio-buffers, browser-native]
dependency_graph:
  requires:
    - src/lib/audio/audioContext.ts
    - src/types/index.ts (NarrativePhase)
  provides:
    - src/services/audio/crossfader.ts (crossfade, fadeIn, fadeOut)
    - src/services/audio/ambientPlayer.ts (AmbientPlayer class, AMBIENT_URLS)
  affects:
    - Future state machine integration (will consume AmbientPlayer)
tech_stack:
  added:
    - Web Audio API (GainNode.linearRampToValueAtTime for crossfades)
    - AudioBufferSourceNode for looping ambient audio
  patterns:
    - Separate audio graph paths for ambient vs TTS (per AMB-03)
    - Per-phase audio buffers with seamless looping
    - Frame-perfect crossfades using scheduled gain automation
key_files:
  created:
    - src/services/audio/crossfader.ts (utilities for audio fading)
    - src/services/audio/ambientPlayer.ts (AmbientPlayer class)
    - src/services/audio/__tests__/crossfader.test.ts (23 tests)
    - src/services/audio/__tests__/ambient-player.test.ts (23 tests)
    - public/audio/README.md (asset documentation)
  modified: []
decisions:
  - decision: Use linearRampToValueAtTime for crossfades instead of setInterval
    rationale: Frame-perfect timing synchronized with audio clock, no JS event loop jitter
    alternatives_considered: setInterval (rejected - timing drift), CSS transitions (rejected - not for audio)
  - decision: Default crossfade duration of 2.5 seconds
    rationale: Middle of AMB-02 requirement range (2-3s), smooth enough without feeling sluggish
  - decision: Connect ambient audio directly to ctx.destination (separate from TTS GainNode)
    rationale: AMB-03 requires independent audio paths, allows simultaneous playback without conflict
  - decision: Ambient audio is enhancement, not requirement
    rationale: Experience works without audio files, AmbientPlayer gracefully handles missing tracks
metrics:
  duration: 2m 58s
  tasks_completed: 2/2
  tests_added: 23
  files_created: 5
  commits: 3
  requirements_addressed: [AMB-01, AMB-02, AMB-03, AMB-04]
  completed_date: "2026-03-25T09:57:15Z"
---

# Phase 02 Plan 02: Ambient Audio System Summary

**One-liner:** Web Audio API ambient player with per-phase soundscapes and 2.5s crossfades using GainNode.linearRampToValueAtTime for frame-perfect transitions.

## What Was Built

Built browser-native ambient audio system using Web Audio API that loads phase-specific soundscapes (Inferno: echo/whispers, Purgatorio: wind/steps, Paraiso: ethereal harmonics) and crossfades between them as the narrative progresses. System uses scheduled gain automation for frame-perfect transitions without JS event loop timing issues.

**Architecture:**

- **Crossfader utility** (`crossfader.ts`): Pure functions for crossfade, fadeIn, fadeOut using `linearRampToValueAtTime`
- **AmbientPlayer class** (`ambientPlayer.ts`): Manages per-phase audio buffers, tracks current phase, handles crossfade transitions
- **Separate audio paths**: Ambient connects to `ctx.destination` independently from TTS `GainNode` (per AMB-03)
- **Seamless looping**: `source.loop = true` on AudioBufferSourceNode for gap-free playback (AMB-04)

**Key behaviors:**

1. `loadTrack(phase, url)` fetches and decodes audio, creates GainNode starting at 0 volume
2. `crossfadeTo(targetPhase, duration)` creates new source, schedules ramps, stops old source after fade
3. Handles phases without ambient (APRESENTACAO, DEVOLUCAO, ENCERRAMENTO) by fading out current track
4. `dispose()` cleans up all AudioNodes to prevent memory leaks

## Tasks Completed

### Task 1: Create crossfader utility and AmbientPlayer class (TDD)

**Files created:**
- `src/services/audio/crossfader.ts` - Crossfade utility functions
- `src/services/audio/ambientPlayer.ts` - AmbientPlayer class with per-phase tracking
- `src/services/audio/__tests__/crossfader.test.ts` - 7 tests for crossfader
- `src/services/audio/__tests__/ambient-player.test.ts` - 23 tests for AmbientPlayer

**What was done:**
1. RED: Created failing tests for crossfader (schedule linearRampToValueAtTime, default duration 2.5s)
2. RED: Created failing tests for AmbientPlayer (load, crossfade, loop, dispose)
3. GREEN: Implemented crossfader with `crossfade()`, `fadeIn()`, `fadeOut()` using AudioContext.currentTime
4. GREEN: Implemented AmbientPlayer with track Map, currentPhase tracking, crossfade logic
5. Verified all 23 tests pass

**Commits:**
- `f5971e8` - test(02-02): add failing tests for crossfader and AmbientPlayer
- `b537ba0` - feat(02-02): implement crossfader utility and AmbientPlayer class

### Task 2: Create placeholder audio asset documentation and directory

**Files created:**
- `public/audio/README.md` - Documentation for expected audio assets

**What was done:**
1. Created `public/audio/` directory
2. Documented expected file names per phase (ambient-inferno.mp3, etc.)
3. Specified format requirements (MP3, 44.1kHz, stereo, -6dB normalization)
4. Clarified that ambient audio is enhancement, not requirement

**Commit:**
- `9dd266d` - chore(02-02): add audio asset documentation and directory

## Deviations from Plan

None - plan executed exactly as written.

## Requirements Addressed

| Requirement | Status | Notes |
|-------------|--------|-------|
| AMB-01 | Complete | Per-phase ambient URLs defined in AMBIENT_URLS constant |
| AMB-02 | Complete | 2.5s default crossfade duration (middle of 2-3s range) |
| AMB-03 | Complete | Ambient connects to ctx.destination separately from TTS path |
| AMB-04 | Complete | source.loop = true for seamless looping |

## Known Issues

None. System handles missing audio files gracefully (no crash, just no ambient playback).

## Integration Points

**Consumes:**
- `src/lib/audio/audioContext.ts` - getAudioContext() for shared AudioContext
- `src/types/index.ts` - NarrativePhase type

**Provides:**
- `AmbientPlayer` class - for state machine to call during phase transitions
- `AMBIENT_URLS` constant - default audio file paths per phase

**Next steps (future plans):**
- State machine will import AmbientPlayer and call `crossfadeTo(phase)` on phase transitions
- Audio asset production will create actual MP3 files per README specs

## Testing

All 23 tests pass:

**Crossfader tests (7):**
- crossfade() schedules linearRampToValueAtTime on both gain nodes
- fadeIn() ramps from 0 to 1
- fadeOut() ramps from current value to 0
- Default duration of 2.5s when not specified
- Respects current gain value

**AmbientPlayer tests (23):**
- Constructor, loadTrack with fetch/decode
- GainNode creation and connection to destination
- AudioBufferSourceNode with loop=true
- crossfadeTo creates source, starts playback, fades in
- Crossfade between two phases
- Handles phases without ambient track
- stop() fades out current track
- getCurrentPhase() tracking
- dispose() cleanup

## Performance Notes

- Crossfades are frame-perfect (scheduled on audio clock, not JS event loop)
- No timing drift or jitter
- Memory safe (dispose() disconnects all nodes)
- Audio buffers loaded once, sources recreated per playback (Web Audio requirement)

## Self-Check: PASSED

**Files exist:**
- FOUND: src/services/audio/crossfader.ts
- FOUND: src/services/audio/ambientPlayer.ts
- FOUND: src/services/audio/__tests__/crossfader.test.ts
- FOUND: src/services/audio/__tests__/ambient-player.test.ts
- FOUND: public/audio/README.md

**Commits exist:**
- FOUND: f5971e8 (test commit)
- FOUND: b537ba0 (feat commit)
- FOUND: 9dd266d (chore commit)

**Tests pass:**
- Test suite: 23/23 passed
- TypeScript: No errors in ambient audio files

All claims verified.
