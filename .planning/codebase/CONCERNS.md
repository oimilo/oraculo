# Codebase Concerns

**Analysis Date:** 2026-03-29

## Tech Debt

**Stale v1 Integration Tests (HIGH):**
- Issue: 2 test files from v1.0 reference states/events that no longer exist in v4 machine
- Files: `src/__tests__/flow-sequencing.test.ts`, `src/__tests__/voice-flow-integration.test.ts`
- Impact: 25 failing tests pollute test output, masking real regressions
- Fix approach: Delete both files. The v4 machine tests in `src/machines/oracleMachine.test.ts` (1034 lines, 60+ tests) fully cover the equivalent flows.

**Deprecated v2/v3 Types Still Exported (LOW):**
- Issue: `oracleMachine.types.ts` exports deprecated `OracleContext`, `OracleEvent`, `OracleContextV3`, `OracleEventV3`, `INITIAL_CONTEXT`, `INITIAL_CONTEXT_V3`, `updateChoice` alongside current v4 types
- Files: `src/machines/oracleMachine.types.ts` (lines 52-151)
- Impact: Confusion for new code; no current consumers but still importable
- Fix approach: Remove all deprecated exports. Grep for `OracleContext ` (without V4), `OracleEvent ` (without V4), `updateChoice`, `INITIAL_CONTEXT_V3` to confirm no consumers.

**Legacy Choice Types in `src/types/index.ts` (LOW):**
- Issue: `Choice1`, `Choice2`, `ExperiencePath` types are deprecated but exported
- Files: `src/types/index.ts` (lines 36-40)
- Impact: Minimal; marked with `@deprecated`
- Fix approach: Remove after confirming no consumers

**OracleExperience.tsx God Component (MEDIUM):**
- Issue: 570-line component with 7 effects, 5 hooks, state-to-script mapping, breathing delays, fallback handling, and all UI rendering
- Files: `src/components/experience/OracleExperience.tsx`
- Impact: Hard to test (no unit tests exist), hard to modify without risk of breaking adjacent logic
- Fix approach: Extract `getScriptKey()`, `getBreathingDelay()`, `getFallbackScript()`, and `buildChoiceConfig()` into a separate `src/machines/stateMapping.ts` utility. Extract effects into custom hooks.

**Duplicated Context Reset Logic (LOW):**
- Issue: The context reset `{ sessionId: '', choices: [], choiceMap: {}, fallbackCount: 0, currentPhase: 'APRESENTACAO' }` is copy-pasted ~12 times across the machine for inactivity timeouts and FIM transition
- Files: `src/machines/oracleMachine.ts` (lines 60-65, 78-85, 96-103, etc.)
- Impact: If a new context field is added, all 12 reset blocks must be updated
- Fix approach: Extract to a shared `RESET_CONTEXT` constant or a `resetContext()` action creator

**useTTSOrchestrator Missing scriptKey Pass-Through (LOW):**
- Issue: The `speak` function signature in `useTTSOrchestrator.ts` does not accept `scriptKey`, but `OracleExperience.tsx` calls `tts.speak(segments, phase, scriptKey)`. The third arg is silently ignored at the hook level but the underlying service receives it.
- Files: `src/hooks/useTTSOrchestrator.ts` (line 40 vs line 8)
- Impact: Works by accident because the hook passes args to `ttsRef.current.speak()` which accepts them, but TypeScript types don't reflect this
- Fix approach: Add `scriptKey?: string` to the hook's `speak` signature

## Known Bugs

**FallbackTTS findScriptKey Ambiguity (FIXED but fragile):**
- Symptoms: When two script entries share the same first text segment, `findScriptKey()` returns the wrong key
- Files: `src/services/tts/fallback.ts` (lines 151-164)
- Trigger: Script entries like `INFERNO_Q1_RESPOSTA_A` and another entry both starting with "Voce fica."
- Workaround: `scriptKey` parameter was added to `speak()` to bypass text-based lookup. The `findScriptKey()` method is now only used as fallback when `scriptKey` is not provided.
- Remaining risk: If any caller omits `scriptKey`, the ambiguity returns. Consider removing `findScriptKey()` entirely.

## Security Considerations

**API Keys Properly Server-Side:**
- All API keys (ELEVENLABS, OPENAI, ANTHROPIC) are server-side only via `requireEnv()`
- Client never sees keys; fetches go through Next.js API routes
- `.env.local` is gitignored
- Current mitigation: adequate

**No Rate Limiting on API Routes:**
- Risk: Public API routes (`/api/tts`, `/api/stt`, `/api/nlu`) have no authentication or rate limiting
- Files: `src/app/api/tts/route.ts`, `src/app/api/stt/route.ts`, `src/app/api/nlu/route.ts`
- Current mitigation: TTS has internal concurrency limiter (max 2 parallel), but no per-client throttling
- Recommendations: Add rate limiting middleware before production deployment. The installation runs on a closed network, but any web-accessible deployment needs protection.

**No Input Sanitization on NLU:**
- Risk: User transcript is passed directly to Claude prompt without sanitization
- Files: `src/app/api/nlu/route.ts` (line 148)
- Current mitigation: Claude is robust to prompt injection; max_tokens is 256; response is validated for structure
- Recommendations: Low risk for art installation context but add input length limit

## Performance Bottlenecks

**No Pre-loading of Next MP3:**
- Problem: Each state change triggers a fresh `fetch()` for the MP3 file
- Files: `src/services/tts/fallback.ts`
- Cause: Audio buffers are cached after first fetch, but the first play of each file requires a network round-trip
- Improvement path: `FallbackTTSService.preloadAll()` method exists but is never called. Wire it into `handleStart()` to preload all 61 MP3s on experience start.

**OracleExperience Re-renders:**
- Problem: Large component with many state dependencies re-renders frequently
- Files: `src/components/experience/OracleExperience.tsx`
- Cause: `state.value` changes trigger re-render of entire component including all effects
- Improvement path: Split into smaller components with focused dependencies. Memoize sub-components.

## Fragile Areas

**State-to-Script Mapping (`getScriptKey`):**
- Files: `src/components/experience/OracleExperience.tsx` (lines 129-196)
- Why fragile: Manual 65-line switch statement mapping machine states to script keys. Adding a new state requires updating this function, `getBreathingDelay()`, `getFallbackScript()`, and `activeChoiceConfig`.
- Safe modification: Always update all 4 mapping functions together. Consider a data-driven approach.
- Test coverage: No direct unit tests (embedded in 570-line component)

**Breathing Delay Mapping (`getBreathingDelay`):**
- Files: `src/components/experience/OracleExperience.tsx` (lines 59-124)
- Why fragile: 65-line function with explicit `state.matches()` for every state. Easy to miss a state.
- Test coverage: None

## Scaling Limits

**localStorage for Analytics and Station Registry:**
- Current capacity: Adequate for single-kiosk installation
- Limit: localStorage is per-origin, 5-10MB depending on browser. Multi-station requires shared backend.
- Scaling path: Replace `MockAnalyticsService` with Supabase (env vars already templated in `.env.example`)

**In-Memory Audio Buffer Cache:**
- Current capacity: 61 MP3s cached in Map (~17MB decoded audio)
- Limit: Browser memory; fine for kiosk use
- Scaling path: Not needed for current use case

## Dependencies at Risk

**None critical.** All dependencies are stable, well-maintained packages:
- Next.js 15, React 19, XState 5, Tailwind 4 are all current major versions
- ElevenLabs v3 API is stable
- Claude Haiku model ID (`claude-haiku-4-5-20251001`) is pinned

## Missing Critical Features

**No Persistence:**
- Problem: Session data exists only in memory. Page refresh loses everything.
- Blocks: Post-event analytics, session replay, multi-session tracking
- Note: For a 5-7 min kiosk experience, this may be acceptable

**No E2E Tests:**
- Problem: No Playwright/Cypress tests covering the full user journey
- Blocks: Confidence in deployment; regression detection for voice pipeline
- Note: The voice pipeline is inherently hard to E2E test due to microphone input

**Ambient Audio Files Missing:**
- Problem: `AmbientPlayer` expects files at `public/audio/ambient-{inferno,purgatorio,paraiso}.mp3` but these may not exist
- Files: `src/services/audio/ambientPlayer.ts` (line 13)
- Note: Failure is non-fatal (logged as warning, experience continues)

## Test Coverage Gaps

**OracleExperience.tsx (570 lines, 0 tests):**
- What's not tested: TTS-to-state-advance pipeline, breathing delays, fallback handling, choice dispatch, mic activation logic
- Files: `src/components/experience/OracleExperience.tsx`
- Risk: The most critical orchestration logic has no direct tests
- Priority: HIGH -- extract pure functions into testable utilities

**getScriptKey / getBreathingDelay / getFallbackScript (0 tests):**
- What's not tested: State-to-script mapping correctness
- Files: Functions inside `src/components/experience/OracleExperience.tsx`
- Risk: A missed mapping silently skips a narrative segment
- Priority: HIGH -- extract and test

**useAmbientAudio (0 tests):**
- What's not tested: Crossfade logic, phase transitions, cleanup
- Files: `src/hooks/useAmbientAudio.ts`
- Risk: LOW -- ambient audio is non-critical enhancement
- Priority: LOW

**Admin Dashboard (0 tests):**
- What's not tested: Station monitoring, metrics display
- Files: `src/app/admin/page.tsx`, `src/app/admin/components/*.tsx`
- Risk: LOW -- dev/monitoring tool only
- Priority: LOW

---

*Concerns audit: 2026-03-29*
