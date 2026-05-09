# Phase 37: Dual-Voice Service Layer - Research

**Researched:** 2026-05-08
**Domain:** TTS service routing, API route parameterization, FallbackTTS dual-directory MP3 resolution
**Confidence:** HIGH

## Summary

Phase 37 wires the data layer from Phase 36 (voice classification + version context) into the actual audio service stack: the `/api/tts` server-side route, the `ElevenLabsTTSService` client-side class, and the `FallbackTTSService` pre-recorded MP3 resolver. The scope is surgical -- three files modified (`route.ts`, `elevenlabs.ts`, `fallback.ts`), one interface extended (`TTSService`), and the orchestrator hook (`useTTSOrchestrator.ts`) updated to thread voice routing information from the React component tree down to the service layer.

The key architectural question is how version + voiceType information flows from `VersionContext` (React tree) through `useTTSOrchestrator` into the TTS service's `speak()` call and ultimately to the ElevenLabs API. The existing call chain is: `OracleExperience` -> `tts.speak(segments, phase, scriptKey)` -> `useTTSOrchestrator` -> `TTSService.speak(segments, voiceSettings, scriptKey)` -> `/api/tts` (for ElevenLabs) or local MP3 fetch (for Fallback). The voice ID must be injected at the right level without breaking V1 behavior.

**Primary recommendation:** Add an optional `voiceId` parameter to the `/api/tts` request body (server-side route uses it to select which ElevenLabs voice to call). On the client side, extend the `TTSService.speak()` signature to accept an optional `voiceId` parameter. `useTTSOrchestrator.speak()` gains a `voiceId` parameter that flows through. `OracleExperience` derives the correct voiceId using `getVoiceType(scriptKey)` + `getVoiceId(version, voiceType)` from Phase 36's classification functions + `useVersion()` context. For FallbackTTS, the `speak()` method uses `voiceType` to select between `public/audio/prerecorded/` (V1 or V2 questions) and `public/audio/prerecorded/v2/` (V2 narrative) directories.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VOZ-03 | API route `/api/tts` aceita parametro de voice ID (V1 vs V2) baseado na versao e tipo de segmento | API route already uses `voiceId` from env var in URL path. Adding optional `voice_id` field to request body is a 3-line change. See Architecture Pattern 1 and Code Example 1. |
| VOZ-04 | FallbackTTS na V2 busca MP3 narrativos em `public/audio/prerecorded/v2/`, perguntas continuam na raiz | FallbackTTS currently derives all URLs as `/audio/prerecorded/${key.toLowerCase()}.mp3`. Extending `speak()` to accept version+voiceType and conditionally prefix `/v2/` for narrative segments is straightforward. See Architecture Pattern 2 and Code Example 2. |
| VOZ-05 | Na V2, segmentos PERGUNTA usam Voz 1 (atual) e segmentos narrativos usam Voz 2 (soturna) | Achieved by combining Phase 36's `getVoiceType()` + `getVoiceId()` with the service-layer routing. `OracleExperience` calls `getVoiceType(scriptKey)` to classify, then `getVoiceId(version, voiceType)` to get the right voice ID, passes it through `tts.speak()`. See Architecture Pattern 3. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Voice ID selection (which voice for which segment) | Frontend Server (API route) | Browser / Client | API route uses voice_id to call ElevenLabs; client derives it from version context + classification |
| Voice classification (PERGUNTA vs NARRATIVA) | Browser / Client | -- | `getVoiceType()` runs client-side, classification is from key name pattern matching (pure function) |
| Version context (V1 vs V2) | Browser / Client | -- | React Context, set by user on home page, consumed by component tree |
| MP3 directory routing (FallbackTTS) | Browser / Client | CDN / Static | Client-side FallbackTTS constructs URL path; files served from public/ directory (static) |
| ElevenLabs API proxy | Frontend Server (API route) | -- | `/api/tts` is a Next.js API route that proxies to ElevenLabs, hiding API keys server-side |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15 | App Router, API routes | Already in use; API route pattern established [VERIFIED: codebase] |
| React | 19 | Client components, hooks, context | Already in use; VersionContext from Phase 36 [VERIFIED: codebase] |
| ElevenLabs REST API | v1 | TTS voice synthesis | Already integrated via `/api/tts` proxy [VERIFIED: route.ts line 123] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | (existing) | Unit tests for route, services, integration | All new behavior needs tests [VERIFIED: codebase] |

No new dependencies required. Phase 37 modifies existing files only.

## Architecture Patterns

### System Architecture Diagram

```
User selects V1/V2
        |
        v
[VersionContext] ---> useVersion() hook
        |
        v
[OracleExperience]
        |
        | getScriptKey(state) --> scriptKey
        | getVoiceType(scriptKey) --> VOZ_PERGUNTA | VOZ_NARRATIVA
        | getVoiceId(version, voiceType) --> voiceId string
        |
        v
[useTTSOrchestrator.speak(segments, phase, scriptKey, voiceId)]
        |
        v
[TTSService.speak(segments, voiceSettings, scriptKey, voiceId)]
        |
       / \
      /   \
     v     v
[ElevenLabsTTSService]          [FallbackTTSService]
     |                               |
     | POST /api/tts                  | voiceType --> directory
     | body: { text, voice_settings,  | VOZ_PERGUNTA: /audio/prerecorded/{key}.mp3
     |         voice_id }             | VOZ_NARRATIVA (V2): /audio/prerecorded/v2/{key}.mp3
     v                                | VOZ_NARRATIVA (V1): /audio/prerecorded/{key}.mp3
[API Route /api/tts]                  v
     |                           [Fetch MP3 from public/]
     | voice_id ?? env default
     v
[ElevenLabs API]
  /v1/text-to-speech/{voiceId}/stream
```

### Component Responsibilities

| File | Current Role | Phase 37 Change |
|------|-------------|-----------------|
| `src/app/api/tts/route.ts` | Proxies TTS to ElevenLabs with env voice ID | Accept optional `voice_id` in request body; use it instead of env default when provided |
| `src/services/tts/index.ts` | TTSService interface + factory | Add optional `voiceId?: string` parameter to `speak()` signature |
| `src/services/tts/elevenlabs.ts` | Client-side ElevenLabs TTS | Pass `voice_id` in POST body to `/api/tts` |
| `src/services/tts/fallback.ts` | Plays pre-recorded MP3s | Accept voiceId, derive URL path based on whether key is narrative + V2 voice |
| `src/services/tts/mock.ts` | SpeechSynthesis mock | Add voiceId param to signature (ignored -- mock doesn't use voice routing) |
| `src/hooks/useTTSOrchestrator.ts` | TTS lifecycle management | Thread `voiceId` parameter through to `TTSService.speak()` |
| `src/components/experience/OracleExperience.tsx` | Experience orchestrator | Import `useVersion()`, call `getVoiceType()` + `getVoiceId()`, pass voiceId to `tts.speak()` |

### Pattern 1: API Route Voice ID Parameterization (VOZ-03)

**What:** The `/api/tts` route accepts an optional `voice_id` field in the POST body. When present, it overrides the env var default.

**When to use:** Every time a TTS request originates from a V2 narrative segment.

**Why this approach:** The voice ID is already in the URL path of the ElevenLabs API call (`/v1/text-to-speech/{voiceId}/stream`). Currently the route reads `voiceId` from `process.env.ELEVENLABS_VOICE_ID`. Adding a `voice_id` field to the request body lets the client specify which voice to use per-request. The env var remains the fallback (V1 default). [VERIFIED: route.ts line 98]

**Current code (line 98):**
```typescript
const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
```

**After change:**
```typescript
// Source: existing route.ts pattern + VOZ-03 requirement
const voiceId = body.voice_id
  || process.env.ELEVENLABS_VOICE_ID
  || '21m00Tcm4TlvDq8ikWAM';
```

### Pattern 2: FallbackTTS Dual-Directory Resolution (VOZ-04)

**What:** FallbackTTS resolves MP3 URLs conditionally based on voice type and version.

**When to use:** When FallbackTTS receives a voiceId that matches the V2 somber voice AND the script key is a narrative segment.

**Design options considered:**

1. **Pass `voiceId` and derive directory from it** -- FallbackTTS checks if `voiceId === ELEVENLABS_VOICE_ID_V2` to decide `/v2/` prefix. Problem: FallbackTTS runs client-side, but `ELEVENLABS_VOICE_ID_V2` is server-side only (no `NEXT_PUBLIC_` prefix). This would require exposing the V2 voice ID to the client or adding a new env var.

2. **Pass `version` + `voiceType` explicitly** -- FallbackTTS gets `ExperienceVersion` and `VoiceType` as parameters. When `version === 'V2'` and `voiceType === 'VOZ_NARRATIVA'`, use `/audio/prerecorded/v2/` path. Otherwise use `/audio/prerecorded/`. This is cleaner because it uses the same types Phase 36 defined, no env var exposure needed.

3. **Use a `useV2NarrativeVoice` boolean** -- Simplest possible signal. Problem: loses type safety and explicit semantics.

**Recommendation:** Option 2. Pass `version` and `voiceType` as optional parameters to `speak()`. FallbackTTS uses them to compute the URL path. This avoids exposing server-side env vars client-side and leverages Phase 36's type system.

**URL resolution logic:**
```typescript
// Source: VOZ-04 requirement + existing fallback.ts pattern
function getPrerecordedUrl(key: string, version?: ExperienceVersion, voiceType?: VoiceType): string {
  const base = '/audio/prerecorded';
  if (version === 'V2' && voiceType === 'VOZ_NARRATIVA') {
    return `${base}/v2/${key.toLowerCase()}.mp3`;
  }
  return `${base}/${key.toLowerCase()}.mp3`;
}
```

**Key insight:** V2 PERGUNTA keys still load from the root `/audio/prerecorded/` directory because they use Voice 1 (same MP3s as V1). Only narrative segments in V2 need different MP3s (generated with the somber voice in Phase 39).

### Pattern 3: OracleExperience Voice Routing Integration (VOZ-05)

**What:** OracleExperience derives the correct voiceId from version context + script key classification.

**How it flows:**
1. `useVersion()` provides `version` (V1 or V2) from React Context
2. `getScriptKey(state)` provides the current script key
3. `getVoiceType(scriptKey)` classifies the key as VOZ_PERGUNTA or VOZ_NARRATIVA
4. `getVoiceId(version, voiceType)` returns the correct ElevenLabs voice ID string
5. `tts.speak(segments, phase, scriptKey, voiceId)` passes it through

**V1 behavior guaranteed:** When `version === 'V1'`, `getVoiceId('V1', anyType)` always returns `ELEVENLABS_VOICE_ID` (the current default). The API route falls back to this env var when no `voice_id` is provided in the body. FallbackTTS uses root directory. Zero regression. [VERIFIED: voiceClassification.ts lines 35-36]

### Anti-Patterns to Avoid

- **Do NOT put version/voiceType logic inside the state machine:** The state machine (XState) is version-agnostic. It handles the same states for V1 and V2. The only difference is audio routing, which belongs in the component/service layer.
- **Do NOT create separate TTS service instances for V2:** One service instance handles both versions. The voice routing is per-`speak()` call, not per-instance.
- **Do NOT expose `ELEVENLABS_VOICE_ID_V2` client-side:** It's server-side only (no `NEXT_PUBLIC_` prefix). The client sends the voiceId string (obtained from `getVoiceId()` which reads `process.env` -- but this runs server-side in `getVoiceId`).

**Critical correction on `getVoiceId` runtime context:**

`getVoiceId()` in `src/lib/voice/voiceClassification.ts` reads `process.env.ELEVENLABS_VOICE_ID` and `process.env.ELEVENLABS_VOICE_ID_V2`. Since `OracleExperience` is a `'use client'` component, `process.env` access only works for `NEXT_PUBLIC_*` vars on the client side. The non-prefixed env vars (`ELEVENLABS_VOICE_ID`, `ELEVENLABS_VOICE_ID_V2`) are only available server-side.

**However**, looking at the existing API route (line 98): `const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';` -- this already reads the env var server-side within the route handler. The client-side `ElevenLabsTTSService` does NOT read `ELEVENLABS_VOICE_ID` directly; it just calls `/api/tts` and the route handles it.

**Therefore:** The `getVoiceId()` function as written (reading `process.env` directly) cannot run client-side for the actual voice IDs. There are two solutions:

**Solution A (recommended):** Move voice ID resolution to the API route. The client sends `version` and `voiceType` (or just `scriptKey` + `version`) to the API route. The route calls `getVoiceId()` server-side where env vars are available. This keeps secrets server-side.

**Solution B:** Use `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` and `NEXT_PUBLIC_ELEVENLABS_VOICE_ID_V2` to expose voice IDs client-side. Voice IDs are not secrets (they're public identifiers in ElevenLabs). But this contradicts the existing convention where `ELEVENLABS_VOICE_ID` has no public prefix.

**Solution C (pragmatic):** For FallbackTTS (offline/local MP3s), the client doesn't need the actual voice ID string at all -- it just needs version + voiceType to pick the right directory. For ElevenLabsTTS (online), the client sends version + voiceType to the API route, which resolves the voice ID server-side. This is the cleanest separation.

**Final recommendation: Solution C.** The API route gains `version` and `voice_type` (or `script_key` + `version`) fields. The route calls `getVoiceId(version, getVoiceType(scriptKey))` server-side. FallbackTTS receives version + voiceType from the orchestrator for directory resolution. No env var exposure needed.

### Revised System Architecture (Solution C)

```
[OracleExperience]
  | version = useVersion().version
  | scriptKey = getScriptKey(state)
  | voiceType = getVoiceType(scriptKey)  // pure function, runs client-side fine
  |
  v
[useTTSOrchestrator.speak(segments, phase, scriptKey, version, voiceType)]
  |
  v
[TTSService.speak(segments, voiceSettings, scriptKey, version?, voiceType?)]
  |
 / \
v   v
[ElevenLabsTTSService]              [FallbackTTSService]
  | POST /api/tts                      | version + voiceType --> directory
  | body: { text, voice_settings,      |   V1 or PERGUNTA: /audio/prerecorded/{key}.mp3
  |         script_key, version }      |   V2+NARRATIVA: /audio/prerecorded/v2/{key}.mp3
  v                                    v
[API Route /api/tts]              [Fetch MP3]
  | const voiceType = getVoiceType(body.script_key)
  | const voiceId = getVoiceId(body.version, voiceType)
  v
[ElevenLabs API /v1/text-to-speech/{voiceId}/stream]
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice type classification | Custom classification in service layer | `getVoiceType()` from Phase 36 | Already tested (21 tests), covers all 82 keys [VERIFIED: voiceClassification.ts] |
| Voice ID resolution | Hardcoded voice IDs in route | `getVoiceId()` from Phase 36 | Centralizes V1/V2 routing logic, reads from env vars [VERIFIED: voiceClassification.ts] |
| Version state management | Prop drilling or service-level state | `useVersion()` from Phase 36 | React Context already wired in page.tsx [VERIFIED: page.tsx] |
| MP3 URL generation | Manual URL string building per file | Extend existing `PRERECORDED_URLS` pattern | Already dynamically generates from SCRIPT keys [VERIFIED: fallback.ts lines 10-15] |

**Key insight:** Phase 36 delivered ALL the decision logic. Phase 37 is purely about threading that logic through the service interfaces and letting each layer use the right piece.

## Common Pitfalls

### Pitfall 1: Client-Side process.env Access for Non-Public Vars
**What goes wrong:** `getVoiceId()` reads `process.env.ELEVENLABS_VOICE_ID_V2` which has no `NEXT_PUBLIC_` prefix. If called from a `'use client'` component, it returns empty string.
**Why it happens:** Next.js only exposes `NEXT_PUBLIC_*` env vars to client bundles. The existing `ELEVENLABS_VOICE_ID` similarly has no public prefix.
**How to avoid:** Never call `getVoiceId()` client-side for actual voice ID strings. Either: (a) resolve voice ID server-side in the API route, or (b) pass version + voiceType to the route and let it resolve. FallbackTTS doesn't need actual voice IDs -- just version + voiceType.
**Warning signs:** Tests pass but production returns empty string for voice IDs when using real APIs.

### Pitfall 2: Breaking V1 Fallback Behavior
**What goes wrong:** Changing `TTSService.speak()` signature breaks existing callers that don't pass the new parameters.
**Why it happens:** The interface is consumed by MockTTSService, FallbackTTSService, ElevenLabsTTSService, and all tests.
**How to avoid:** Make new parameters OPTIONAL (`version?: ExperienceVersion, voiceType?: VoiceType`). When omitted, behavior is identical to current V1 (default voice ID, default directory). All existing tests pass without modification.
**Warning signs:** TypeScript compile errors in tests or components that don't pass new params.

### Pitfall 3: FallbackTTS Cache Key Collision
**What goes wrong:** FallbackTTS caches AudioBuffers by script key (`audioBufferCache.set(resolvedKey, buffer)`). If V1 and V2 use different MP3s for the same key but share the cache, V2 might play V1 audio.
**Why it happens:** Cache key is just the script key string, not version-aware.
**How to avoid:** When version='V2' and voiceType='VOZ_NARRATIVA', use a versioned cache key like `v2:${resolvedKey}`. Or include version in the cache key for all lookups.
**Warning signs:** V2 plays the original voice for narrative segments instead of the somber voice.

### Pitfall 4: Missing V2 MP3 Files Before Phase 39
**What goes wrong:** FallbackTTS in V2 tries to fetch from `public/audio/prerecorded/v2/` but no MP3s exist there yet (generated in Phase 39).
**Why it happens:** Phase 37 wires the routing; Phase 39 generates the actual MP3 files.
**How to avoid:** FallbackTTS should gracefully fall back to the V1 MP3 (or SpeechSynthesis) when V2 MP3 fetch returns 404. This is already handled by the existing `catch` block that falls back to `fallbackToSpeechSynthesis()`.
**Warning signs:** 404 errors in browser console when testing V2 before Phase 39 completes. Expected and acceptable.

### Pitfall 5: ElevenLabsTTS Fallback Service Not Getting Voice Parameters
**What goes wrong:** `ElevenLabsTTSService` internally creates a `FallbackTTSService` instance and calls `this.fallbackService.speak(segments, voiceSettings, scriptKey)` on API failure. If the fallback service also needs version/voiceType for V2 directory routing, those parameters must be forwarded too.
**Why it happens:** The internal fallback is constructed in the constructor with no parameters.
**How to avoid:** When `ElevenLabsTTSService.speak()` catches an error and falls back, pass all parameters including version/voiceType to the fallback's `speak()` call.
**Warning signs:** V2 fails to use ElevenLabs API, falls back to FallbackTTS, but plays V1 MP3s instead of V2 narrative MP3s.

## Code Examples

### Example 1: API Route Voice ID from Request Body (VOZ-03)

```typescript
// Source: existing route.ts + VOZ-03 requirement
// File: src/app/api/tts/route.ts

import { getVoiceType, getVoiceId } from '@/lib/voice/voiceClassification';

interface TTSRequestBody {
  text: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed?: number;
  };
  // Phase 37: optional voice routing
  version?: 'V1' | 'V2';
  script_key?: string;
}

// Inside POST handler, replace line 98:
const version = (body.version || 'V1') as ExperienceVersion;
const voiceType = body.script_key ? getVoiceType(body.script_key) : 'VOZ_PERGUNTA';
const voiceId = getVoiceId(version, voiceType)
  || process.env.ELEVENLABS_VOICE_ID
  || '21m00Tcm4TlvDq8ikWAM';
```

### Example 2: FallbackTTS Dual-Directory URL Resolution (VOZ-04)

```typescript
// Source: existing fallback.ts + VOZ-04 requirement
// File: src/services/tts/fallback.ts

import type { ExperienceVersion, VoiceType } from '@/types';
import { getVoiceType } from '@/lib/voice/voiceClassification';

// Replace static PRERECORDED_URLS with a function
function getPrerecordedUrl(
  key: string,
  version: ExperienceVersion = 'V1',
  voiceType?: VoiceType
): string {
  const resolvedVoiceType = voiceType ?? getVoiceType(key);
  if (version === 'V2' && resolvedVoiceType === 'VOZ_NARRATIVA') {
    return `/audio/prerecorded/v2/${key.toLowerCase()}.mp3`;
  }
  return `/audio/prerecorded/${key.toLowerCase()}.mp3`;
}
```

### Example 3: Extended TTSService Interface

```typescript
// Source: existing index.ts + Phase 37 requirements
// File: src/services/tts/index.ts

import type { ExperienceVersion, VoiceType } from '@/types';

export interface TTSService {
  speak(
    segments: SpeechSegment[],
    voiceSettings: VoiceSettings,
    scriptKey?: string,
    version?: ExperienceVersion,
    voiceType?: VoiceType,
  ): Promise<void>;
  cancel(): void;
}
```

### Example 4: ElevenLabsTTSService Sending Version to API Route

```typescript
// Source: existing elevenlabs.ts + VOZ-03 requirement
// Inside ElevenLabsTTSService.speak():

const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text,
    voice_settings: {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
      ...(voiceSettings.speed != null ? { speed: voiceSettings.speed } : {}),
    },
    // Phase 37: voice routing
    ...(version ? { version } : {}),
    ...(scriptKey ? { script_key: scriptKey } : {}),
  }),
});
```

### Example 5: OracleExperience Integration

```typescript
// Source: existing OracleExperience.tsx + Phase 36 APIs
// File: src/components/experience/OracleExperience.tsx

import { useVersion } from '@/contexts/VersionContext';
import { getVoiceType } from '@/lib/voice/voiceClassification';

// Inside OracleExperience():
const { version } = useVersion();

// In Effect A (TTS playback), modify the tts.speak call:
const voiceType = getVoiceType(scriptKey);
tts.speak(SCRIPT[scriptKey], state.context.currentPhase, scriptKey, version, voiceType)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single voice ID from env var | Dynamic voice ID from request body | Phase 37 (this phase) | Enables dual-voice without changing env vars per-request |
| Static PRERECORDED_URLS map | Dynamic URL resolution with version + voiceType | Phase 37 (this phase) | Enables V2 to load narrative MP3s from separate directory |
| `getVoiceId()` called client-side | Voice ID resolved server-side in API route | Phase 37 (this phase) | Avoids exposing non-public env vars to client bundle |

**Deprecated/outdated:**
- Nothing deprecated. All existing behavior preserved as V1 default path.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | FallbackTTS V2 narrative MP3s will be at `public/audio/prerecorded/v2/{key}.mp3` following same naming convention as root | Architecture Patterns | Low -- Phase 39 generates these files; if naming changes, only URL resolution function needs updating |
| A2 | ElevenLabs REST API voice_id parameter in URL path is the only way to specify voice | Architecture Patterns | Low -- confirmed by existing codebase [VERIFIED: route.ts line 123-124] |
| A3 | `getVoiceType()` runs correctly client-side since it's a pure function with no env var access | Pitfall 1 | Low -- it only does string matching on key names [VERIFIED: voiceClassification.ts] |

## Open Questions

1. **V2 directory creation timing**
   - What we know: Phase 37 routes to `public/audio/prerecorded/v2/` but Phase 39 creates the MP3s
   - What's unclear: Should Phase 37 create an empty `v2/` directory with a `.gitkeep` or leave it uncreated?
   - Recommendation: Create empty `v2/` directory with `.gitkeep` so the routing code can be tested without 404 noise. FallbackTTS already handles missing files gracefully.

2. **Cache key strategy for FallbackTTS**
   - What we know: Current cache uses script key as cache key
   - What's unclear: Should we use `${version}:${key}` as cache key for all versions, or only prefix for V2?
   - Recommendation: Use `${version}:${key}` for all versions. Simpler, prevents any cross-version contamination. Tiny memory cost (duplicating V1 PERGUNTA entries that are identical).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (existing) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/services/tts/__tests__/ src/app/api/tts/__tests__/` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VOZ-03 | API route accepts voice_id/version/script_key params | unit | `npx vitest run src/app/api/tts/__tests__/tts-route.test.ts -x` | Exists, needs extension |
| VOZ-04 | FallbackTTS V2 narrative loads from /v2/ directory | unit | `npx vitest run src/services/tts/__tests__/fallback-tts.test.ts -x` | Exists, needs extension |
| VOZ-05 | V2 segments use correct voice per type | integration | `npx vitest run src/services/tts/__tests__/elevenlabs-tts.test.ts -x` | Exists, needs extension |

### Sampling Rate
- **Per task commit:** `npx vitest run src/services/tts/__tests__/ src/app/api/tts/__tests__/`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] New test cases in `src/app/api/tts/__tests__/tts-route.test.ts` -- covers VOZ-03 (version/script_key routing)
- [ ] New test cases in `src/services/tts/__tests__/fallback-tts.test.ts` -- covers VOZ-04 (V2 directory routing)
- [ ] New test cases in `src/services/tts/__tests__/elevenlabs-tts.test.ts` -- covers VOZ-05 (voice_id pass-through)

No new test files or framework install needed -- all existing test files gain new `describe` blocks.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- no auth in this app |
| V3 Session Management | No | N/A -- stateless sessions |
| V4 Access Control | No | N/A -- no authorization needed |
| V5 Input Validation | Yes | Validate `version` is 'V1' or 'V2', `script_key` is a valid SCRIPT key |
| V6 Cryptography | No | N/A |

### Known Threat Patterns for API Route

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Arbitrary voice_id injection | Tampering | Resolve voice ID server-side from version+voiceType, not from client-supplied voice_id. Client cannot inject arbitrary ElevenLabs voice IDs. |
| Invalid script_key causing unexpected behavior | Tampering | `getVoiceType()` defaults to VOZ_NARRATIVA for unrecognized keys; `getVoiceId()` defaults to V1 voice ID. Both are safe fallbacks. |

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/app/api/tts/route.ts` (lines 60-164) -- API route structure, voice ID usage, request body schema
- Codebase inspection: `src/services/tts/fallback.ts` (lines 1-252) -- FallbackTTS URL generation, cache, playback
- Codebase inspection: `src/services/tts/elevenlabs.ts` (lines 1-128) -- ElevenLabs client, fetch call, fallback chain
- Codebase inspection: `src/services/tts/index.ts` (lines 1-38) -- TTSService interface, VoiceSettings, factory
- Codebase inspection: `src/lib/voice/voiceClassification.ts` (lines 1-41) -- Phase 36 getVoiceType/getVoiceId
- Codebase inspection: `src/contexts/VersionContext.tsx` (lines 1-37) -- Phase 36 VersionProvider
- Codebase inspection: `src/hooks/useTTSOrchestrator.ts` (lines 1-78) -- TTS orchestration hook
- Codebase inspection: `src/components/experience/OracleExperience.tsx` (lines 1-695) -- orchestrator component

### Secondary (MEDIUM confidence)
- Phase 36 verification report (`36-VERIFICATION.md`) -- confirmed all Phase 36 artifacts exist and tests pass

### Tertiary (LOW confidence)
- None -- all findings verified via codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, extending existing code
- Architecture: HIGH -- all integration points inspected, data flow traced end-to-end
- Pitfalls: HIGH -- identified from actual code inspection (env var scope, cache keys, fallback chain)

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (stable -- no external dependency changes expected)
