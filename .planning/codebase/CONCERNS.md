# Codebase Concerns

**Analysis Date:** 2026-03-25

## Security Concerns

**CRITICAL: Real API Keys in Unstaged `.env.example`:**
- Risk: The working copy of `.env.example` contains real API keys for ElevenLabs, OpenAI, and Anthropic. While the committed version at HEAD uses placeholder values (`your_elevenlabs_api_key_here`, etc.), the local file has been modified with real `sk_*`, `sk-proj-*`, and `sk-ant-*` keys.
- Files: `.env.example` (unstaged changes)
- Impact: If accidentally committed and pushed, all three API keys are exposed to anyone with repo access. Keys could be used to incur charges or abuse quotas.
- Fix approach: Immediately revert `.env.example` to placeholder values (`git checkout -- .env.example`). Store real keys only in `.env.local` (which is correctly gitignored). Consider adding a pre-commit hook that rejects commits containing `sk_`, `sk-proj-`, or `sk-ant-` patterns.

**No API Route Authentication/Rate Limiting:**
- Risk: The API routes (`/api/tts`, `/api/stt`, `/api/nlu`) are publicly accessible with no authentication, rate limiting, or origin validation.
- Files: `src/app/api/tts/route.ts`, `src/app/api/stt/route.ts`, `src/app/api/nlu/route.ts`
- Impact: Anyone who discovers the deployment URL can call these endpoints repeatedly, consuming ElevenLabs/OpenAI/Anthropic API credits. The TTS route has a concurrency limiter (MAX_CONCURRENT=2) but this limits parallelism, not total request volume.
- Current mitigation: Only the TTS route has retry/backoff for 429 responses from ElevenLabs.
- Recommendations:
  1. Add a Next.js middleware (`src/middleware.ts`) that validates requests come from the same origin or include a session token.
  2. Add per-IP or per-session rate limiting (e.g., max 10 TTS calls per minute).
  3. For the event deployment (2 stations), consider restricting by IP allowlist or adding a simple shared secret header.

**No CORS or Content Security Policy:**
- Risk: No middleware.ts exists. No `Content-Security-Policy` headers are configured. The `next.config.ts` has zero security-related configuration.
- Files: `next.config.ts`, no `src/middleware.ts`
- Impact: API routes are callable from any origin. No XSS mitigation via CSP.
- Recommendations: Add security headers in `next.config.ts` using the `headers()` config. For an installation deployment, restrict API access to known origins.

**No Input Sanitization on NLU Route:**
- Risk: User-provided `transcript` and `questionContext` are interpolated directly into the Claude API prompt without sanitization.
- Files: `src/app/api/nlu/route.ts` (lines 53-58)
- Impact: A crafted transcript could attempt prompt injection on the Claude classification call, potentially altering classification results.
- Current mitigation: The impact is limited since the output is binary (A or B) with confidence scoring, and malformed JSON falls back to `choice: 'A', confidence: 0.5`.
- Recommendations: Add input length limits (e.g., max 500 chars for transcript). Strip control characters from inputs before sending to Claude.

**No Request Body Size Limits:**
- Risk: The STT route accepts audio file uploads via FormData with no size validation.
- Files: `src/app/api/stt/route.ts` (line 19)
- Impact: Large audio files could consume server memory and bandwidth, potentially causing OOM or slow responses.
- Recommendations: Validate `audioFile.size` before forwarding to Whisper. Reject files over 5MB (Whisper's limit is 25MB, but 6 seconds of webm is typically under 1MB).

## Performance Concerns

**TTS Joins All Segments Into Single API Call:**
- Problem: `ElevenLabsTTSService.speak()` concatenates all segments' text into a single ElevenLabs API call, losing per-segment pause timing.
- Files: `src/services/tts/elevenlabs.ts` (line 21: `const text = segments.map(s => s.text).join(' ')`)
- Impact: The `pauseAfter` values defined in `src/data/script.ts` are ignored when using ElevenLabs. The APRESENTACAO phase has 6 segments with pauses of 2100ms, 2100ms, 1600ms, 2100ms, 1600ms. All of this dramatic timing is lost. The entire narration plays as one continuous audio block.
- Fix approach: Either (a) send one API call per segment and insert pauses between playback, or (b) use ElevenLabs SSML-like pauses if supported, or (c) accept the tradeoff for reduced latency and API calls, documenting that pause timing is approximate with ElevenLabs.

**No TTS Response Caching:**
- Problem: Every state transition re-calls ElevenLabs TTS for the same text. The same script segments produce identical audio every time.
- Files: `src/services/tts/elevenlabs.ts`, `src/app/api/tts/route.ts` (line 141: `Cache-Control: no-cache`)
- Impact: Unnecessary API costs and latency. The experience has ~18 distinct script segments. Each session calls TTS for 8-10 of them. With multiple stations running, this multiplies quickly.
- Fix approach: Cache TTS responses on the server side (file system or in-memory Map keyed by text hash). Pregenerate audio for all known script segments at deploy time.

**Concurrency Limiter Uses Module-Level State:**
- Problem: The TTS route's concurrency limiter (`activeCalls`, `queue`) uses module-level variables. In serverless/edge deployments, each instance gets its own limiter, making it ineffective. Additionally, queued requests have no timeout -- if ElevenLabs hangs, the queue blocks indefinitely.
- Files: `src/app/api/tts/route.ts` (lines 15-36)
- Impact: In serverless deployment (e.g., Vercel), the limiter provides no cross-instance protection. Queued requests could wait forever.
- Fix approach: Add a queue timeout (e.g., 10 seconds). For serverless, move to an external rate limiter or accept the per-instance behavior.

**FallbackTTSService Audio Buffer Cache Never Cleared:**
- Problem: `FallbackTTSService` caches decoded `AudioBuffer` objects in a `Map` but never clears them.
- Files: `src/services/tts/fallback.ts` (line 53)
- Impact: Low -- the cache holds at most 25 audio buffers (one per script key). This is bounded and acceptable for the use case.

**No Prerecorded Audio Files Exist:**
- Problem: The `public/audio/prerecorded/` directory does not exist. The `FallbackTTSService` references 25 MP3 files at paths like `/audio/prerecorded/apresentacao.mp3`, but only `public/audio/README.md` exists.
- Files: `src/services/tts/fallback.ts` (lines 10-36), `public/audio/`
- Impact: The offline fallback chain (`ElevenLabs -> prerecorded MP3 -> browser SpeechSynthesis`) will always skip to browser SpeechSynthesis. If the event venue has no internet, the experience degrades to low-quality browser TTS voices.
- Fix approach: Record 25 MP3 files in studio and place them in `public/audio/prerecorded/`. This is noted as a known pre-event task in project docs.

**No Ambient Audio Files Exist:**
- Problem: `AmbientPlayer` references 3 ambient audio files (`/audio/ambient-inferno.mp3`, etc.) that do not exist in `public/audio/`.
- Files: `src/services/audio/ambientPlayer.ts` (lines 12-16), `public/audio/`
- Impact: Ambient soundscapes silently fail to load (non-fatal, as noted in code). The experience works but lacks atmosphere.
- Fix approach: Create or source ambient audio loops for INFERNO, PURGATORIO, and PARAISO phases.

## Tech Debt

**Duplicated Reset Actions in State Machine:**
- Issue: The `assign()` block that resets context (`sessionId: '', choice1: null, ...`) is duplicated 10 times across the state machine -- once for each state's 120-second inactivity timeout, plus IDLE and FIM.
- Files: `src/machines/oracleMachine.ts` (lines 54-60, 74-78, 134-139, 199-204, 252-258, 293-298, 311-316, 329-334, 347-352, 366-370, 380-386)
- Impact: Any change to reset logic (e.g., adding a new context field) requires updating 10+ locations. High risk of inconsistency.
- Fix approach: Extract a reusable `resetContext` action and reference it by name in all timeout transitions.

**`as any` Type Casts in Production Code:**
- Issue: `OracleExperience.tsx` uses `as any` in 4 places to cast event types when sending to the state machine.
- Files: `src/components/experience/OracleExperience.tsx` (lines 248, 298, 308, 318)
- Impact: Loses type safety for event dispatch. If an event name is misspelled, TypeScript will not catch it.
- Fix approach: Use proper XState event type unions or create a typed helper function for dispatching string-based event types.

**ESLint Disable Comments:**
- Issue: Three `eslint-disable` comments suppress exhaustive-deps warnings in hooks.
- Files: `src/components/experience/OracleExperience.tsx` (line 217), `src/hooks/useVoiceChoice.ts` (lines 127, 239)
- Impact: Suppressed warnings may hide real missing dependencies. These are intentional in current code (dependencies deliberately excluded to avoid re-triggering effects), but the intent should be documented.
- Fix approach: Replace comments with explicit documentation explaining why each dependency is excluded, or restructure hooks to avoid the need.

**Analytics Service Factory Has Dead Code Path:**
- Issue: `createAnalyticsService()` checks `NEXT_PUBLIC_USE_REAL_APIS === 'true'` but falls through to the mock regardless -- the Supabase implementation does not exist yet.
- Files: `src/services/analytics/index.ts` (lines 14-19)
- Impact: No functional impact, but misleading. The comment says "Real Supabase implementation (future)".
- Fix approach: Implement `SupabaseAnalyticsService` as part of v1.1 Milestone Phase 6, or remove the dead conditional until ready.

**Admin Dashboard Uses localStorage Only (No Cross-Tab Isolation):**
- Issue: Analytics and station data are stored in localStorage, which is shared across all tabs on the same domain. Multiple stations (tabs) write to the same `oraculo_analytics` and `oraculo_stations` keys.
- Files: `src/services/analytics/mock.ts` (line 4: `STORAGE_KEY = 'oraculo_analytics'`), `src/services/station/registry.ts` (line 3: `STORAGE_KEY = 'oraculo_stations'`)
- Impact: This is the intended multi-station architecture (all tabs share data, admin reads it). However, concurrent writes from multiple tabs could cause race conditions (read-modify-write on JSON in localStorage is not atomic).
- Fix approach: Low priority -- localStorage write conflicts are unlikely in practice with 2-3 stations at 10s heartbeat intervals. The Supabase migration will resolve this.

**Verbose Console Logging in useVoiceChoice:**
- Issue: 20+ `console.log()` statements in `useVoiceChoice.ts` output detailed state transitions, audio blob sizes, STT results, NLU results, and confidence scores to the browser console.
- Files: `src/hooks/useVoiceChoice.ts` (lines 86, 91, 96, 117, 119, 124, 137, 150, 155, 163, 180, 188, 197, 206, 212), `src/hooks/useMicrophone.ts` (lines 87, 96, 101, 112)
- Impact: In production, this clutters the console and could leak visitor interaction details to anyone with DevTools open. Not a PII concern (no personal data), but noise.
- Fix approach: Introduce a debug logger (e.g., `debug('oraculo:voice')`) that is silent in production, or gate logs behind `process.env.NODE_ENV === 'development'`.

**`getScriptKey()` Uses Long If-Chain:**
- Issue: `getScriptKey()` in `OracleExperience.tsx` is an 18-line chain of `if` statements mapping machine states to script keys.
- Files: `src/components/experience/OracleExperience.tsx` (lines 47-69)
- Impact: Fragile -- adding a new state requires updating this function and it is easy to forget. Not a critical issue but increases maintenance burden.
- Fix approach: Use a state-to-scriptKey mapping table or encode the script key in the machine context.

## Pending UAT Items

**3 Browser UAT Items Require Manual Verification:**
- Multi-station isolation: Open 2+ tabs with `?station=station-1` and `?station=station-2`, verify sessions are tracked independently.
- Station isolation: Verify each tab maintains its own state machine and TTS playback.
- Inactivity timeout: Verify 120-second timeouts in all non-IDLE states reset the experience.
- Files: `src/machines/oracleMachine.ts` (120000ms after blocks), `src/components/experience/OracleExperience.tsx`, `src/services/station/registry.ts`
- Status: Tests pass (213/213), but browser-level validation has not been performed.

## Risk Assessment

**Event-Day Reliability (HIGH):**
- Risk: Internet outage at venue breaks TTS (ElevenLabs), STT (Whisper), and NLU (Claude). The fallback chain degrades to browser SpeechSynthesis, which has poor Portuguese voice quality and varies by browser.
- Impact: The core artistic experience (voice quality, dramatic pacing) is degraded.
- Mitigation path:
  1. Record all 25 MP3 files before the event (highest priority pre-event task).
  2. Test offline fallback chain end-to-end.
  3. Have a mobile hotspot as backup internet.
  4. Pre-generate ElevenLabs audio for all script segments and cache locally.

**API Cost Overrun (MEDIUM):**
- Risk: Without rate limiting, each session makes ~8-10 TTS calls, ~2 STT calls, ~2 NLU calls. At Bienal with high foot traffic, costs could spike.
- Impact: ElevenLabs charges per character; Whisper and Claude per request. With no caching and no rate limits, a busy day could exhaust API quotas.
- Mitigation path: Implement server-side TTS caching (text hash -> audio blob). Pre-generate known script audio. Add rate limiting middleware.

**Supabase Analytics Not Implemented (LOW):**
- Risk: Analytics currently use localStorage mock. If the event runs with mock analytics, all session data is lost when browser tabs close.
- Files: `src/services/analytics/index.ts` (falls through to mock), `src/services/analytics/mock.ts`
- Impact: Post-event analytics (visitor paths, completion rates, fallback counts) will be incomplete or lost.
- Mitigation path: Implement `SupabaseAnalyticsService` before event (v1.1 Phase 6), or accept localStorage-only for the event and keep admin dashboard open continuously.

**Browser Compatibility (LOW):**
- Risk: The experience uses `MediaRecorder`, `AudioContext`, `navigator.mediaDevices.getUserMedia()`, `crypto.randomUUID()`, and `navigator.permissions.query()`. All are modern APIs.
- Files: `src/hooks/useMicrophone.ts`, `src/lib/audio/audioContext.ts`, `src/machines/oracleMachine.ts` (line 36), `src/components/experience/PermissionScreen.tsx` (line 16)
- Impact: Will not work on older browsers. Since the installation uses controlled hardware, this is manageable.
- Mitigation path: Test on the exact browser/OS combination that will be used at the event. Chrome on desktop is the safest choice.

## Recommendations

**Priority 1 (Before Event):**
1. Revert `.env.example` to placeholder values. Add a pre-commit hook to catch leaked secrets.
2. Record 25 prerecorded MP3 files and 3 ambient audio files.
3. Add basic rate limiting or origin validation to API routes.
4. Cache TTS responses server-side for known script text.

**Priority 2 (Before Event, Nice-to-Have):**
5. Fix segment-level pause timing in `ElevenLabsTTSService`.
6. Extract duplicated reset actions in state machine.
7. Replace `as any` casts in `OracleExperience.tsx` with proper types.
8. Gate console.log statements behind a debug flag.

**Priority 3 (Post-Event):**
9. Implement `SupabaseAnalyticsService` for persistent analytics.
10. Add Content-Security-Policy headers.
11. Add input sanitization and size limits on API routes.
12. Refactor `getScriptKey()` to use a mapping table.

---

*Concerns audit: 2026-03-25*
