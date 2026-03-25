---
phase: 05-real-voice-services
plan: 01
subsystem: voice-services
tags: [tts, stt, nlu, api-integration, web-audio]
dependency_graph:
  requires:
    - "04-01: API routes infrastructure (/api/tts, /api/stt, /api/nlu)"
  provides:
    - "ElevenLabsTTSService with Web Audio API playback"
    - "WhisperSTTService with FormData upload"
    - "ClaudeNLUService with binary classification"
  affects:
    - "src/services/tts/index.ts (factory will use real services)"
    - "src/services/stt/index.ts (factory will use real services)"
    - "src/services/nlu/index.ts (factory will use real services)"
tech_stack:
  added:
    - "Web Audio API (AudioContext, decodeAudioData, createBufferSource)"
    - "FormData API (multipart/form-data for audio upload)"
  patterns:
    - "Fetch-based API client services (no external SDKs)"
    - "Fallback chain: ElevenLabs → FallbackTTS → SpeechSynthesis"
    - "Error handling with graceful degradation"
key_files:
  created:
    - src/services/tts/elevenlabs.ts
    - src/services/tts/__tests__/elevenlabs-tts.test.ts
    - src/services/stt/whisper.ts
    - src/services/stt/__tests__/whisper-stt.test.ts
    - src/services/nlu/claude.ts
    - src/services/nlu/__tests__/claude-nlu.test.ts
  modified: []
decisions:
  - key: "ElevenLabs TTS via Web Audio API"
    rationale: "Direct audio playback with decodeAudioData ensures low latency and precise timing control vs HTMLAudioElement"
    alternatives: ["HTMLAudioElement (simpler but less control)", "Howler.js (external dependency)"]
  - key: "Fallback chain for TTS"
    rationale: "Graceful degradation — if API fails, use pre-recorded audio; if that fails, use browser SpeechSynthesis"
    alternatives: ["Hard fail on API error (bad UX)", "Queue and retry (adds complexity)"]
  - key: "No Content-Type header on STT FormData"
    rationale: "Browser must set Content-Type with multipart boundary — manually setting it breaks the upload"
    alternatives: ["Set manually (breaks upload)", "Use Blob URL (requires server-side fetch)"]
metrics:
  duration_seconds: 334
  tasks_completed: 2
  tests_added: 21
  files_created: 6
  commits: 2
  requirements_validated:
    - RTTS-01
    - RTTS-02
    - RSTT-01
    - RSTT-02
    - RNLU-01
    - RNLU-02
completed_date: "2026-03-25"
---

# Phase 05 Plan 01: Real Voice Services Summary

**One-liner:** Real AI services (ElevenLabs TTS, Whisper STT, Claude NLU) via Next.js API routes with Web Audio playback and fallback chains

Real AI service implementations (ElevenLabsTTSService, WhisperSTTService, ClaudeNLUService) calling Next.js API routes with comprehensive test coverage, Web Audio API playback, and graceful fallback chains.

## What Was Built

### Task 1: ElevenLabsTTSService (c5f6cc6)

**Implementation:**
- Calls `/api/tts` with JSON body containing `text` and `voice_settings` (stability, similarity_boost, style, speed)
- Receives audio/mpeg blob from API
- Converts blob to ArrayBuffer and decodes via `audioContext.decodeAudioData()`
- Plays audio using Web Audio API (`createBufferSource` → `connect` → `start`)
- Cleans up with `URL.revokeObjectURL()` after playback
- Falls back to `FallbackTTSService` on any error (network, HTTP, decode)
- Supports cancellation via `cancel()` method with proper cleanup

**RTTS-02 Compliance:** All 4 voice parameters from `PHASE_VOICE_SETTINGS` are forwarded to the API route:
- `stability` (0-1)
- `similarity_boost` (0-1)
- `style` (0-1)
- `speed` (0.5-2.0)

**Tests (9):**
1. Interface compliance (speak, cancel methods)
2. Fetch POST call with correct headers/body
3. PHASE_VOICE_SETTINGS parameter forwarding (RTTS-02)
4. Web Audio API playback chain
5. URL.revokeObjectURL cleanup
6. Fallback on HTTP error
7. Fallback on network error
8. Cancel stops currentSource
9. Reject with "Speech cancelled" during playback

### Task 2: WhisperSTTService and ClaudeNLUService (b5c3c94)

**WhisperSTTService:**
- Creates FormData with `audio` field (filename: `recording.webm`)
- Calls `/api/stt` with POST method (no Content-Type header — browser sets it)
- Returns `result.text` string from API response
- Throws error on HTTP failure or network error

**ClaudeNLUService:**
- Calls `/api/nlu` with JSON body: `{ transcript, questionContext, options }`
- Returns `ClassificationResult`: `{ choice, confidence, reasoning }`
- Throws error on HTTP failure or network error

**Tests (12 total):**

STT (6):
1. Interface compliance (transcribe method)
2. FormData creation with audio field
3. No Content-Type header (browser sets boundary)
4. Return transcript text from response
5. Throw on HTTP error
6. Throw on network error

NLU (6):
1. Interface compliance (classify method)
2. Fetch POST with JSON body
3. Return ClassificationResult structure
4. Parse choice B with high confidence
5. Throw on HTTP error
6. Throw on network error

## Deviations from Plan

None — plan executed exactly as written. All tasks completed successfully with comprehensive test coverage.

## Test Results

**New tests added:** 21 (9 TTS + 6 STT + 6 NLU)

**Full suite:** 213 tests passing (up from 192)

**Coverage:**
- ElevenLabsTTSService: 9 test cases covering interface, API calls, Web Audio playback, fallback, cancellation
- WhisperSTTService: 6 test cases covering interface, FormData upload, error handling
- ClaudeNLUService: 6 test cases covering interface, JSON API calls, classification parsing, error handling

**TypeScript:** Clean compilation (no errors in new files; pre-existing API route test errors out of scope)

## Known Stubs

None. All services are fully implemented and call real API routes.

## Integration Notes

**Factory integration (Phase 5 Plan 2):**
The factory functions in `src/services/{tts,stt,nlu}/index.ts` still return mock services. Plan 02 will wire these real services into the factories when `NEXT_PUBLIC_USE_REAL_APIS=true`.

**API key requirements:**
- `ELEVENLABS_API_KEY` — for /api/tts route
- `OPENAI_API_KEY` — for /api/stt route (Whisper)
- `ANTHROPIC_API_KEY` — for /api/nlu route (Claude Haiku)

These are already validated by the API routes (Phase 04-01). Missing keys return 500 with "service not configured" error.

## Self-Check

### Created Files
- [x] src/services/tts/elevenlabs.ts — FOUND
- [x] src/services/tts/__tests__/elevenlabs-tts.test.ts — FOUND
- [x] src/services/stt/whisper.ts — FOUND
- [x] src/services/stt/__tests__/whisper-stt.test.ts — FOUND
- [x] src/services/nlu/claude.ts — FOUND
- [x] src/services/nlu/__tests__/claude-nlu.test.ts — FOUND

### Commits
- [x] c5f6cc6 — FOUND: "test(05-01): add failing tests for ElevenLabsTTSService"
- [x] b5c3c94 — FOUND: "feat(05-01): implement WhisperSTTService and ClaudeNLUService"

### Tests
- [x] All 21 new tests passing
- [x] Full suite (213 tests) passing
- [x] TypeScript compiles clean (new files)

## Self-Check: PASSED

All files created, commits exist, tests green, TypeScript clean.
