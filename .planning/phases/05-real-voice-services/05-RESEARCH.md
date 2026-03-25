# Phase 5: Real Voice Services - Research

**Researched:** 2026-03-25
**Domain:** AI voice service integration (TTS, STT, NLU) with Next.js API routes
**Confidence:** HIGH

## Summary

Phase 5 implements real AI voice services behind existing service interfaces created in v1.0. The architecture is already established: factory functions in `src/services/{tts,stt,nlu}/index.ts` check `NEXT_PUBLIC_USE_REAL_APIS` and return either mock or real implementations. Phase 4 (just completed) created the server-side API routes that Phase 5 services will call.

This phase creates three client-side service classes (`ElevenLabsTTSService`, `WhisperSTTService`, `ClaudeNLUService`) that implement existing interfaces and call Next.js API routes via `fetch()`. The services handle client-side concerns (audio playback, blob creation, error handling) while API routes handle authentication and external API communication.

**Primary recommendation:** Implement services as thin wrappers around fetch calls to `/api/{tts,stt,nlu}` routes, with robust error handling and graceful fallback to existing mock/fallback services. Follow the established pattern in `FallbackTTSService` for audio playback using Web Audio API.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RTTS-01 | ElevenLabsTTSService implements interface TTSService and calls `/api/tts` for each segment of speech | Standard fetch pattern, Web Audio API for playback, blob URL creation |
| RTTS-02 | Voice parameters (stability, similarity_boost, style, speed) vary by phase conforme PHASE_VOICE_SETTINGS | PHASE_VOICE_SETTINGS already defined in `src/services/tts/index.ts`, maps directly to ElevenLabs API parameters |
| RSTT-01 | WhisperSTTService implements interface STTService and sends audio blob to `/api/stt` | MediaRecorder API for blob capture, FormData upload, fetch to API route |
| RSTT-02 | Transcrição é forçada para idioma português (language=pt no Whisper) | API route (Phase 4) already forces `language: 'pt'` in Whisper request |
| RNLU-01 | ClaudeNLUService implements interface NLUService and sends transcript+context to `/api/nlu` | Standard fetch with JSON body, ClassificationResult response parsing |
| RNLU-02 | Classificação retorna choice A/B com confidence score e reasoning via Claude Haiku | API route (Phase 4) returns JSON matching ClassificationResult interface |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Audio API | Browser native | Audio playback from API stream | Industry standard for programmatic audio, already used in FallbackTTSService |
| MediaRecorder API | Browser native | Microphone recording to blob | Standard API for audio capture in browsers, no library needed |
| Fetch API | Browser native | HTTP client for API routes | Native, no dependencies, works server-side and client-side |
| Next.js 15 App Router | ^15.3.3 (installed) | API routes for server-side proxying | Already project standard, API routes created in Phase 4 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^2.1.8 (installed) | Test framework | All service tests (192 tests currently passing) |
| @testing-library/react | ^16.1.0 (installed) | Component testing | If UI components need integration tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain fetch | ElevenLabs SDK (elevenlabs npm package v1.59.0) | SDK adds 200KB+ bundle size, requires API key client-side (security risk), or complex server-side streaming. Plain fetch to Next.js API route is simpler and keeps keys secure. Project explicitly chose "no SDKs" (REQUIREMENTS.md Out of Scope). |
| Plain fetch | OpenAI SDK | Same rationale — API route pattern is lighter and more secure |
| Plain fetch | Anthropic SDK | Same rationale — API route pattern is lighter and more secure |
| Web Audio API | HTML5 `<audio>` element | Web Audio API provides lower latency, programmatic control over playback, crossfading support (already used for ambient audio). Project already committed to this pattern. |

**Installation:**
No new packages needed — all functionality uses browser native APIs and existing Next.js infrastructure.

## Architecture Patterns

### Recommended Project Structure
```
src/services/
├── tts/
│   ├── index.ts              # Factory + interface (existing)
│   ├── mock.ts               # MockTTSService (existing)
│   ├── fallback.ts           # FallbackTTSService (existing)
│   ├── elevenlabs.ts         # NEW: ElevenLabsTTSService
│   └── __tests__/
│       ├── tts-service.test.ts      (existing)
│       └── elevenlabs-tts.test.ts   (NEW)
├── stt/
│   ├── index.ts              # Factory + interface (existing)
│   ├── mock.ts               # MockSTTService (existing)
│   ├── whisper.ts            # NEW: WhisperSTTService
│   └── __tests__/
│       ├── stt-service.test.ts      (existing)
│       └── whisper-stt.test.ts      (NEW)
├── nlu/
│   ├── index.ts              # Factory + interface (existing)
│   ├── mock.ts               # MockNLUService (existing)
│   ├── claude.ts             # NEW: ClaudeNLUService
│   └── __tests__/
│       ├── nlu-service.test.ts      (existing)
│       └── claude-nlu.test.ts       (NEW)
```

### Pattern 1: Client-Side Service → API Route → External API
**What:** Three-layer architecture where client services call Next.js API routes, which call external APIs
**When to use:** When API keys must remain server-side (security requirement CFG-03)
**Example:**
```typescript
// Client-side service (src/services/tts/elevenlabs.ts)
export class ElevenLabsTTSService implements TTSService {
  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    const text = segments.map(s => s.text).join(' ');

    // Call Next.js API route (server-side)
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_settings: voiceSettings }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Response is audio/mpeg stream
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Play using Web Audio API (pattern from FallbackTTSService)
    await this.playAudioUrl(audioUrl);
    URL.revokeObjectURL(audioUrl);
  }
}
```

### Pattern 2: Graceful Fallback Chain
**What:** Try real service → catch error → fallback to mock/fallback service
**When to use:** Production resilience — experience must not crash if API fails
**Example:**
```typescript
// Factory function (src/services/tts/index.ts)
export function createTTSService(): TTSService {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true') {
    try {
      return new ElevenLabsTTSService(); // Phase 5
    } catch (error) {
      console.warn('[TTS] Real service failed to initialize, using fallback');
      return new FallbackTTSService();
    }
  }
  return new MockTTSService();
}
```

### Pattern 3: Web Audio API Playback
**What:** Convert audio blob to AudioBuffer and play programmatically
**When to use:** All TTS services (existing pattern in FallbackTTSService)
**Example:**
```typescript
// Source: src/services/tts/fallback.ts (lines 187-219)
private async playBuffer(buffer: AudioBuffer): Promise<void> {
  if (!this.audioContext) {
    throw new Error('Audio context not initialized');
  }

  return new Promise((resolve, reject) => {
    if (this.cancelled) {
      reject(new Error('Speech cancelled'));
      return;
    }

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);

    this.currentSource = source;

    source.onended = () => {
      this.currentSource = null;
      if (this.cancelled) {
        reject(new Error('Speech cancelled'));
      } else {
        resolve();
      }
    };

    try {
      source.start();
    } catch (error) {
      reject(error);
    }
  });
}
```

### Pattern 4: MediaRecorder for STT
**What:** Capture microphone audio as WebM blob, upload to API route
**When to use:** WhisperSTTService implementation (standard browser audio recording)
**Example:**
```typescript
// Conceptual example for WhisperSTTService
async transcribe(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await fetch('/api/stt', {
    method: 'POST',
    body: formData, // fetch automatically sets Content-Type: multipart/form-data
  });

  if (!response.ok) {
    throw new Error(`STT API error: ${response.status}`);
  }

  const result = await response.json();
  return result.text;
}
```

### Anti-Patterns to Avoid
- **Exposing API keys client-side:** Never use `NEXT_PUBLIC_ELEVENLABS_API_KEY` — keys must stay server-side (CFG-03)
- **Synchronous audio playback:** Audio operations are async — must use Promises and handle cancellation
- **Ignoring errors:** Must catch fetch errors and fallback gracefully (success criterion #6)
- **Multiple audio contexts:** Reuse existing AudioContext from `getAudioContext()` (already established pattern)
- **Opus codec for Whisper:** Whisper API does NOT support Opus — use WebM container with supported codec

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio stream playback | Custom audio chunking/buffering | Web Audio API `decodeAudioData()` + `AudioBufferSourceNode` | Already handles codecs, sample rate conversion, timing. Existing project pattern in FallbackTTSService. |
| Microphone recording | Custom WebRTC implementation | `MediaRecorder` API with `dataavailable` event | Browser-native, handles encoding, cross-platform. Industry standard. |
| FormData multipart upload | Manual boundary construction | `FormData` + `fetch()` | Browser automatically sets correct Content-Type with boundary, handles encoding. |
| Audio format detection | Custom MIME sniffing | `Blob.type` property from MediaRecorder | MediaRecorder outputs correct MIME type (e.g., `audio/webm`), no guessing needed. |
| Retry logic with exponential backoff | Custom retry loops | Catch error → fallback to mock/fallback service | Project pattern prioritizes UX (immediate fallback) over retry attempts. Visitor should not wait for 3 retries. |
| Blob URL management | Manual URL tracking | `URL.createObjectURL()` + `URL.revokeObjectURL()` | Browser manages memory, prevents leaks. Clean pattern: create before play, revoke after. |

**Key insight:** Browser APIs for audio are mature and well-tested. Custom implementations introduce bugs (codec incompatibilities, memory leaks, timing issues) that native APIs have already solved.

## Common Pitfalls

### Pitfall 1: Forgetting to revoke blob URLs
**What goes wrong:** Memory leak — blob URLs persist until page unload, consuming RAM
**Why it happens:** `URL.createObjectURL()` creates a URL that references a blob in memory, but browser doesn't know when you're done with it
**How to avoid:** Call `URL.revokeObjectURL(url)` immediately after audio playback completes or on error
**Warning signs:** DevTools Memory profiler shows increasing "Detached" blobs, browser becomes sluggish after multiple TTS calls

### Pitfall 2: Not handling audio cancellation
**What goes wrong:** Overlapping audio playback when user advances before speech finishes
**Why it happens:** State machine sends NEXT event, new TTS starts before previous finishes, both play simultaneously
**How to avoid:** Implement `cancel()` method that stops current AudioBufferSourceNode and sets cancellation flag (pattern already in FallbackTTSService)
**Warning signs:** Visitor hears two Oracle voices talking at once, "speech cancelled" errors in console during rapid transitions

### Pitfall 3: Assuming Whisper supports Opus codec
**What goes wrong:** API returns 400 "Unsupported audio format" when MediaRecorder outputs `audio/webm;codecs=opus`
**Why it happens:** Whisper supports WebM container but NOT Opus codec — needs VP8/VP9 or other supported codec
**How to avoid:** Check `MediaRecorder.isTypeSupported()` for multiple MIME types, prefer `audio/webm` (generic) or explicitly request supported codec in `mimeType` option
**Warning signs:** STT fails with "unsupported format" only on certain browsers (Chrome defaults to Opus, Firefox may use different codec)

### Pitfall 4: Not initializing AudioContext on user gesture
**What goes wrong:** `audioContext.decodeAudioData()` or `source.start()` fail silently, no audio plays
**Why it happens:** Browsers block AudioContext until user gesture (autoplay policy)
**How to avoid:** Project already has `initAudioContext()` that must be called on button click — ensure ElevenLabsTTSService uses existing context from `getAudioContext()`
**Warning signs:** TTS works in development (hot reload counts as gesture) but fails on first load in production

### Pitfall 5: Treating fetch response as JSON when it's a blob
**What goes wrong:** `response.json()` throws "Unexpected token" error when parsing audio/mpeg stream
**Why it happens:** `/api/tts` returns `Content-Type: audio/mpeg`, not JSON
**How to avoid:** Check response `Content-Type` header or read as blob directly: `await response.blob()`
**Warning signs:** TTS API route returns 200 OK but client throws JSON parse error

### Pitfall 6: Forgetting to handle FormData in tests
**What goes wrong:** Test calls `transcribe()` with `new Blob()` but mocked fetch expects different format
**Why it happens:** FormData is not JSON — requires special handling in test mocks
**How to avoid:** Mock `fetch` to accept FormData, extract blob with `formData.get('audio') as Blob`, verify MIME type
**Warning signs:** Tests pass but real integration fails, "Missing required field: audio" errors in API route tests

## Code Examples

Verified patterns from official sources:

### Client-Side Audio Playback from Fetch Response
```typescript
// Source: Pattern from MDN Web Audio API + existing FallbackTTSService
async playAudioFromResponse(response: Response): Promise<void> {
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  try {
    const arrayBuffer = await fetch(audioUrl).then(r => r.arrayBuffer());
    const audioContext = getAudioContext();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);

    await this.playBuffer(buffer); // Use existing pattern from FallbackTTSService
  } finally {
    URL.revokeObjectURL(audioUrl); // Prevent memory leak
  }
}
```

### MediaRecorder Audio Capture
```typescript
// Source: MDN MediaRecorder API + web.dev patterns
async recordAudio(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);

  return new Promise((resolve, reject) => {
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      stream.getTracks().forEach(track => track.stop()); // Release mic
      resolve(blob);
    };

    mediaRecorder.onerror = (error) => reject(error);

    mediaRecorder.start();

    // Stop after timeout or manual call
    setTimeout(() => mediaRecorder.stop(), 5000);
  });
}
```

### FormData Upload to API Route
```typescript
// Source: MDN Fetch API + Next.js discussions
async uploadAudioBlob(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');

  const response = await fetch('/api/stt', {
    method: 'POST',
    body: formData,
    // DO NOT set Content-Type header — browser sets it with boundary
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'STT request failed');
  }

  const result = await response.json();
  return result.text;
}
```

### Error Handling with Fallback
```typescript
// Source: Existing pattern in src/services/tts/index.ts
export class ElevenLabsTTSService implements TTSService {
  private fallbackService: TTSService;

  constructor() {
    this.fallbackService = new FallbackTTSService();
  }

  async speak(segments: SpeechSegment[], voiceSettings: VoiceSettings): Promise<void> {
    try {
      // Try ElevenLabs API
      const response = await fetch('/api/tts', { /* ... */ });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      await this.playAudioFromResponse(response);
    } catch (error) {
      console.warn('[ElevenLabs] API failed, using fallback:', error);
      // Gracefully fallback to pre-recorded audio
      return this.fallbackService.speak(segments, voiceSettings);
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ElevenLabs SDK (client-side) | Plain fetch to Next.js API route | 2024 (Next.js 13+ App Router) | Eliminates 200KB+ SDK bundle, keeps API keys server-side, simpler error handling. Project decision documented in REQUIREMENTS.md. |
| HTMLAudioElement for TTS playback | Web Audio API with AudioContext | Ongoing (browser support mature) | Lower latency, programmatic control, crossfading support. Project already committed to this pattern (FallbackTTSService, ambient audio). |
| Whisper local model | OpenAI Whisper API | 2023 (API GA) | Better accuracy (93-97% for Portuguese), no local compute needed, <2s latency vs 5-10s local processing. |
| Claude 3 Haiku (March 2024) | Claude 3.5 Haiku (Oct 2024) | 2024-10-22 | Faster (200ms vs 400ms), cheaper ($0.25 vs $0.50 per million tokens), same quality. Model ID: `claude-3-5-haiku-20241022`. |

**Deprecated/outdated:**
- **ElevenLabs WebSocket streaming:** Project explicitly deferred to v2 (REQUIREMENTS.md Out of Scope). v1.1 uses REST POST for simplicity.
- **Claude 3 Haiku (claude-3-haiku-20240307):** Replaced by Claude 3.5 Haiku. Phase 4 API route already uses correct model ID.
- **Opus codec for Whisper:** Never supported, but commonly assumed because MediaRecorder defaults to Opus in Chrome.

## Open Questions

1. **MediaRecorder codec compatibility across browsers**
   - What we know: Chrome defaults to Opus (unsupported), Firefox may use different codec
   - What's unclear: Whether `audio/webm` (generic, no codec specified) works reliably across Chrome/Firefox/Edge
   - Recommendation: Test `MediaRecorder.isTypeSupported('audio/webm')` first. If visitor's browser doesn't support WebM at all, fall back to mock STT (user types instead of speaks — requires UI fallback).

2. **Optimal voice speed parameter mapping**
   - What we know: PHASE_VOICE_SETTINGS defines `speed: 0.8-0.9`, ElevenLabs docs don't document valid range for speed parameter
   - What's unclear: Whether ElevenLabs API accepts `speed` parameter (not mentioned in search results), may be SDK-only or newer API version
   - Recommendation: Test with Phase 4 API route. If ElevenLabs rejects `speed` parameter, remove from request body (stability/similarity_boost/style are confirmed supported).

3. **Audio latency vs quality tradeoff**
   - What we know: ElevenLabs offers `eleven_flash_v2_5` (75ms latency) vs `eleven_multilingual_v2` (higher quality, slower)
   - What's unclear: Whether 75ms latency is worth potential quality drop for this use case (scripted narrative, not real-time conversation)
   - Recommendation: Start with `eleven_multilingual_v2` (Phase 4 API route default). If event testing shows unacceptable latency, switch to Flash model.

## Environment Availability

> Phase 5 depends on external API services, not local tools. Environment audit focuses on browser API support.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Web Audio API | TTS playback | ✓ | Browser native | FallbackTTSService → SpeechSynthesis (existing pattern) |
| MediaRecorder API | STT audio capture | ✓ | Browser native | Mock STT (visitor types instead of speaks — requires UI fallback) |
| Fetch API | All services | ✓ | Browser native | — |
| AudioContext | Audio playback | ✓ | Initialized on user gesture | Existing `initAudioContext()` handles this |
| Next.js API routes | Server-side proxying | ✓ | Phase 4 created routes | — |

**Missing dependencies with no fallback:**
- None — all browser APIs have >95% support in modern browsers (Chrome/Firefox/Edge/Safari)

**Missing dependencies with fallback:**
- **MediaRecorder unsupported:** Rare (only very old browsers), fallback to MockSTTService (visitor types response)
- **AudioContext blocked by autoplay policy:** Handled by existing `initAudioContext()` pattern (user clicks "Iniciar" button)

**External API availability (runtime):**
- **ElevenLabs API down:** Fallback to FallbackTTSService (pre-recorded audio)
- **OpenAI Whisper API down:** Fallback to MockSTTService (UI shows text input field)
- **Anthropic Claude API down:** Fallback to MockNLUService (keyword matching)

All fallbacks preserve experience flow — no blocking errors.

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
| RTTS-01 | ElevenLabsTTSService calls /api/tts and plays audio via Web Audio API | unit | `npx vitest run src/services/tts/__tests__/elevenlabs-tts.test.ts -x` | ❌ Wave 0 |
| RTTS-02 | Voice settings vary per phase from PHASE_VOICE_SETTINGS | unit | `npx vitest run src/services/tts/__tests__/elevenlabs-tts.test.ts -x` | ❌ Wave 0 |
| RSTT-01 | WhisperSTTService uploads audio blob to /api/stt via FormData | unit | `npx vitest run src/services/stt/__tests__/whisper-stt.test.ts -x` | ❌ Wave 0 |
| RSTT-02 | API route forces language=pt (verified in Phase 4 tests) | unit | `npx vitest run src/app/api/stt/__tests__/stt-route.test.ts -x` | ✅ (already exists) |
| RNLU-01 | ClaudeNLUService calls /api/nlu with transcript + context | unit | `npx vitest run src/services/nlu/__tests__/claude-nlu.test.ts -x` | ❌ Wave 0 |
| RNLU-02 | ClassificationResult parsing from API response | unit | `npx vitest run src/services/nlu/__tests__/claude-nlu.test.ts -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Quick test for modified service: `npx vitest run src/services/{tts,stt,nlu}/__tests__/*.test.ts --reporter=verbose`
- **Per wave merge:** Full suite: `npm test`
- **Phase gate:** Full suite green (192+ tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/services/tts/__tests__/elevenlabs-tts.test.ts` — covers RTTS-01, RTTS-02
- [ ] `src/services/stt/__tests__/whisper-stt.test.ts` — covers RSTT-01
- [ ] `src/services/nlu/__tests__/claude-nlu.test.ts` — covers RNLU-01, RNLU-02
- [ ] Update factory functions to import real services (replace `console.warn` + mock return)

**Test patterns to follow:**
- Mock `fetch` globally with `vi.fn()` (existing pattern in Phase 4 API route tests)
- Mock `getAudioContext()` to return mock AudioContext (existing pattern in fallback-tts.test.ts)
- Mock `MediaRecorder` for STT tests (browser API, needs manual mock)
- Verify interface compliance: `expect(service).toHaveProperty('speak')` or `transcribe` or `classify`
- Test error handling: mock fetch rejection, verify fallback called
- Test cancellation: verify `cancel()` stops playback mid-stream

## Sources

### Primary (HIGH confidence)
- [ElevenLabs Text-to-Speech API Docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) - TTS endpoint, voice_settings schema, model IDs
- [OpenAI Whisper API Guide](https://platform.openai.com/docs/guides/speech-to-text) - STT endpoint, language parameter, supported formats
- [Anthropic Claude API Docs](https://docs.anthropic.com/en/api/messages) - Messages API, model IDs, request/response schema
- [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) - Audio recording, dataavailable event, WebM format
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_APIs) - AudioContext, decodeAudioData, AudioBufferSourceNode
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) - App Router API routes, streaming responses

### Secondary (MEDIUM confidence)
- [ElevenLabs API Error Handling](https://help.elevenlabs.io/hc/en-us/articles/19571824571921-API-Error-Code-429) - Rate limits (429), concurrency limits by plan
- [OpenAI Whisper API Limits](https://help.openai.com/en/articles/7031512-audio-api-faq) - 25MB file size limit, supported formats (WebM ✓, Opus ✗)
- [web.dev MediaRecorder Pattern](https://web.dev/patterns/media/microphone-record) - Recording audio from microphone
- [Chrome DevBlog MediaRecorder](https://developer.chrome.com/blog/mediarecorder) - Browser support, MIME types

### Tertiary (LOW confidence)
- [ElevenLabs Cheat Sheet](https://www.webfuse.com/elevenlabs-cheat-sheet) - Unofficial guide, stability/similarity_boost recommendations
- [Whisper Portuguese Accuracy](https://medium.com/@pierre_guillou/speech-to-text-ia-transcreva-qualquer-%C3%A1udio-para-o-portugu%C3%AAs-com-o-whisper-openai-sem-ad0c17384681) - 93-97% WER claimed (unverified source)
- [GitHub ElevenLabs Next.js Example](https://github.com/jtmuller5/elevenlabs-nextjs-stream-example) - Community example of streaming audio

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All browser native APIs, existing Next.js infrastructure, no new dependencies
- Architecture: HIGH - Patterns established in v1.0 (factory functions, FallbackTTSService Web Audio usage), Phase 4 API routes tested
- Pitfalls: MEDIUM-HIGH - MediaRecorder codec issue verified in official docs, others based on common Web Audio API gotchas

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days — APIs are stable, browser features mature)
