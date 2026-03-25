---
phase: 04-api-routes-configuration
plan: 02
subsystem: configuration
tags: [environment-variables, factory-pattern, service-toggle, developer-setup]

# Dependency graph
requires:
  - phase: 01-state-machine-script
    provides: Service factory pattern with mock implementations
  - phase: 02-voice-services
    provides: TTS/STT/NLU service interfaces and PHASE_VOICE_SETTINGS
  - phase: 03-admin-offline
    provides: FallbackTTSService for offline audio playback
provides:
  - .env.example template with all required API keys and setup URLs
  - Factory functions prepared for real service imports (Phase 5)
  - Graceful fallback behavior when NEXT_PUBLIC_USE_REAL_APIS=true
  - Server-side API key architecture documented
affects: [05-voice-services, developer-onboarding, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Environment variable naming: NEXT_PUBLIC_ prefix only for client-side vars"
    - "API keys server-side only (no NEXT_PUBLIC_ prefix)"
    - "Factory functions with TODO(Phase 5) markers for future implementation"
    - "console.warn for graceful degradation messaging"

key-files:
  created:
    - .env.example
  modified:
    - src/services/tts/index.ts
    - src/services/stt/index.ts
    - src/services/nlu/index.ts

key-decisions:
  - "API keys (ELEVENLABS, OPENAI, ANTHROPIC) are server-side only - no NEXT_PUBLIC_ prefix"
  - "NEXT_PUBLIC_USE_REAL_APIS is client-side accessible for factory logic"
  - "Supabase vars commented out in .env.example (Phase 6 scope)"
  - "Factory functions log warnings instead of throwing errors when real services unavailable"

patterns-established:
  - "Pattern 1: .env.example documents all env vars with setup URLs and instructions"
  - "Pattern 2: Factory functions use TODO(Phase N) comments for future implementation points"
  - "Pattern 3: Graceful degradation with console.warn when feature not yet available"

requirements-completed: [CFG-01, CFG-02]

# Metrics
duration: 95s
completed: 2026-03-25
---

# Phase 04 Plan 02: Environment Configuration & Factory Preparation Summary

**Environment variable template created with server-side API keys, and factory functions updated to gracefully fall back to mocks until Phase 5 real service implementation**

## Performance

- **Duration:** 1min 35s
- **Started:** 2026-03-25T15:05:02Z
- **Completed:** 2026-03-25T15:06:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created .env.example with all required API keys (ElevenLabs, OpenAI, Anthropic), setup URLs, and Supabase vars (commented for Phase 6)
- Removed throw errors from STT and NLU factories that would crash app when toggle enabled
- Added TODO(Phase 5) markers in all three service factories for real implementation insertion points
- All 177 tests pass without modification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create .env.example with all environment variables documented** - `f935a5f` (chore)
2. **Task 2: Update factory functions to prepare for real service imports** - `1a3959f` (feat)

## Files Created/Modified
- `.env.example` - Template with ELEVENLABS_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY (server-side only), NEXT_PUBLIC_USE_REAL_APIS toggle, ELEVENLABS_VOICE_ID, and commented Supabase vars for Phase 6
- `src/services/tts/index.ts` - Added TODO(Phase 5) marker for ElevenLabsTTSService, console.warn for graceful degradation
- `src/services/stt/index.ts` - Removed throw error, added TODO(Phase 5) marker for WhisperSTTService, console.warn fallback
- `src/services/nlu/index.ts` - Removed throw error, added TODO(Phase 5) marker for ClaudeNLUService, console.warn fallback

## Decisions Made
- **API key security pattern:** ELEVENLABS_API_KEY, OPENAI_API_KEY, and ANTHROPIC_API_KEY do NOT use NEXT_PUBLIC_ prefix because they must remain server-side only (consumed by Next.js API routes in Phase 5). Only NEXT_PUBLIC_USE_REAL_APIS and future Supabase vars (anon key is safe for client) use the prefix.
- **Graceful degradation strategy:** Factory functions log console.warn and return mock/fallback services when NEXT_PUBLIC_USE_REAL_APIS=true but real services not yet implemented. This prevents app crashes and allows incremental testing.
- **Phase 5 insertion points:** TODO(Phase 5) comments clearly mark where to import and instantiate real service classes (ElevenLabsTTSService, WhisperSTTService, ClaudeNLUService).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

**Developers must create .env.local before Phase 5 testing.** The .env.example file documents:
- ELEVENLABS_API_KEY (get from https://elevenlabs.io/app/settings/api-keys)
- ELEVENLABS_VOICE_ID (default: Rachel 21m00Tcm4TlvDq8ikWAM)
- OPENAI_API_KEY (get from https://platform.openai.com/api-keys)
- ANTHROPIC_API_KEY (get from https://console.anthropic.com/settings/keys)
- NEXT_PUBLIC_USE_REAL_APIS=false (set to true to enable real services once Phase 5 complete)

Supabase configuration (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) commented out - required for Phase 6.

## Next Phase Readiness

**Ready for Phase 5: Real Voice Services Implementation**
- .env.example documents all required API keys with setup instructions
- Factory functions have clear TODO(Phase 5) markers showing where to add real service imports
- Graceful fallback behavior tested and working (no crashes when toggle enabled)
- All existing tests (177) pass - real service implementations can be added without breaking existing mock behavior

**No blockers:** Developer just needs to copy .env.example to .env.local and fill in API keys before Phase 5 testing.

## Known Stubs

None - this phase only creates configuration template and factory preparation. No runtime stubs introduced.

## Self-Check: PASSED

All files and commits verified:
- FOUND: .env.example
- FOUND: f935a5f (Task 1 commit)
- FOUND: 1a3959f (Task 2 commit)

---
*Phase: 04-api-routes-configuration*
*Completed: 2026-03-25*
