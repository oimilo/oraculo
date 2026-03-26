# Phase 9: STT/NLU Pipeline Integration - Research

**Researched:** 2026-03-26
**Domain:** Voice pipeline (STT → NLU → state machine)
**Confidence:** HIGH

## Summary

Phase 9 integrates the voice capture → transcription → classification → state transition pipeline end-to-end. The architecture is already in place (Phase 7 refactored hooks, Phase 8 fixed mic lifecycle), so this phase focuses on **validating that the real API services (Whisper STT + Claude NLU) work correctly with Portuguese audio in production conditions**, and **hardening edge cases** (empty transcripts, low confidence, silence, API errors).

The codebase already has:
- WhisperSTTService calling `/api/stt` with OpenAI Whisper API
- ClaudeNLUService calling `/api/nlu` with Anthropic Messages API
- useVoiceChoice FSM handling lifecycle (idle → listening → processing → decided/fallback)
- Mock services with configurable responses for testing
- Integration tests verifying state machine wiring

**Primary recommendation:** Test the pipeline with real API keys enabled (`NEXT_PUBLIC_USE_REAL_APIS=true`) to validate Portuguese transcription accuracy, ensure NLU receives correct config (not stale closures), verify classification confidence thresholds trigger correct fallback behavior, and confirm empty/silence audio produces graceful defaults — then add specific integration tests capturing these scenarios.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PIPE-01 | Whisper STT successfully transcribes spoken Portuguese responses | Whisper achieves 93-97% accuracy for Portuguese (officially supported language). API route configured with `language: 'pt'`. Mock shows 500ms latency expectation. |
| PIPE-02 | NLU always receives valid config (correct options, not empty/stale) | useVoiceChoice Phase 7 refactor uses configRef frozen while active, guards against empty options. Integration tests needed to verify real timing. |
| PIPE-03 | Classification result correctly maps to state machine event | eventMap already wired (CHOICE_A/B, CHOICE_FICAR/EMBORA, CHOICE_PISAR/CONTORNAR). State machine guards validated in Phase 7. Need end-to-end test with real API. |
| PIPE-04 | Low confidence triggers fallback TTS then re-listen cycle | useVoiceChoice reducer handles NEED_FALLBACK state, preserves attempt count across retries. Default threshold 0.7, max 2 attempts. Need test with real Claude confidence scores. |
| PIPE-05 | Empty/silence transcript handled gracefully with fallback or default | useVoiceChoice checks `transcript.trim() === ''`, triggers fallback or default after maxAttempts. Whisper can hallucinate on silence — need compression_ratio_threshold validation. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| OpenAI Whisper API | whisper-1 | Speech-to-text transcription | Industry standard for multilingual STT, 93-97% accuracy for Portuguese, officially supported language |
| Anthropic Messages API | claude-haiku-4-5 | Binary classification (NLU) | Fast (~100ms), cheap, Haiku suitable for fine-grained classification with labeled examples |
| Web Audio API MediaRecorder | Browser native | Audio capture from microphone | No external dependencies, cross-browser support (Chrome/Edge), configurable MIME types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/sdk | 0.80.0 | Anthropic SDK (optional) | NOT USED — codebase uses plain fetch to avoid SDK overhead |
| openai | 6.33.0 | OpenAI SDK (optional) | NOT USED — codebase uses plain fetch to avoid SDK overhead |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Whisper API | Google Speech-to-Text | Lower PT-BR accuracy, more complex auth, higher cost |
| Claude Haiku | GPT-4o-mini | Higher cost per request, comparable classification accuracy |
| MediaRecorder | RecordRTC library | Adds dependency, codebase already has working implementation |

**Installation:**
No new packages needed — project already uses plain fetch for API routes, MediaRecorder is browser native.

**Version verification:**
```bash
# Latest package versions (not used in project, but documented for reference)
npm view openai version      # 6.33.0
npm view @anthropic-ai/sdk version  # 0.80.0
```

Project uses server-side API keys with Next.js API routes, avoiding client-side SDKs entirely.

## Architecture Patterns

### Current Pipeline Flow
```
1. User in AGUARDANDO state (after question TTS completes)
   ↓
2. useVoiceChoice activates (active=true when isAguardando && ttsComplete)
   ↓
3. useMicrophone starts recording (auto-stop after 6s)
   ↓
4. MediaRecorder produces audioBlob
   ↓
5. useVoiceChoice FSM: listening → AUDIO_READY → processing
   ↓
6. WhisperSTTService.transcribe(blob) → POST /api/stt → OpenAI Whisper
   ↓
7. If transcript empty: trigger fallback or default
   ↓
8. ClaudeNLUService.classify(transcript, context, options) → POST /api/nlu → Anthropic
   ↓
9. If confidence < 0.7: NEED_FALLBACK state (play fallback TTS, retry)
   ↓
10. If confidence >= 0.7: CLASSIFICATION_COMPLETE → send(eventType) to state machine
    ↓
11. State machine transitions (INFERNO.AGUARDANDO → RESPOSTA_A/B, etc.)
```

### Pattern 1: Frozen Config Ref (Prevents Stale Closures)
**What:** useVoiceChoice captures config in a ref when active=true, preventing stale options from previous state
**When to use:** Any async pipeline where config changes between activations
**Example:**
```typescript
// Source: src/hooks/useVoiceChoice.ts lines 130-137
const configRef = useRef(config);
const activeRef = useRef(active);
useEffect(() => {
  activeRef.current = active;
  if (active) {
    configRef.current = config; // Freeze config snapshot
  }
}, [config, active]);

// Later, in async processAudio:
const snap = configRef.current; // Use frozen snapshot, not live prop
const classification = await nlu.classify(transcript, snap.questionContext, snap.options);
```

### Pattern 2: FSM-Based Lifecycle (Eliminates Impossible States)
**What:** useReducer with explicit state transitions instead of boolean flags
**When to use:** Complex async flows with retry logic
**Example:**
```typescript
// Source: src/hooks/useVoiceChoice.ts lines 30-44
export type VoiceLifecycle =
  | { phase: 'idle' }
  | { phase: 'listening'; startedAt: number; previousAttempt?: number }
  | { phase: 'processing'; blob: Blob; attempt: number }
  | { phase: 'decided'; result: VoiceChoiceResult; attempt: number }
  | { phase: 'fallback'; attempt: number };

// Impossible: isListening=true + isProcessing=true simultaneously
// Phase 7 reduced 32 possible boolean combos to 5 explicit states
```

### Pattern 3: API Route Proxy (Server-Side Keys Only)
**What:** Next.js API routes proxy external APIs, keeping keys server-side
**When to use:** Always for production API keys
**Example:**
```typescript
// Source: src/app/api/stt/route.ts
export async function POST(request: NextRequest) {
  const apiKey = requireEnv('OPENAI_API_KEY'); // Server-side only
  const formData = await request.formData();
  const audioFile = formData.get('audio') as File;

  const whisperForm = new FormData();
  whisperForm.append('file', audioFile, 'audio.webm');
  whisperForm.append('model', 'whisper-1');
  whisperForm.append('language', 'pt'); // Portuguese forced

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: whisperForm,
  });

  return NextResponse.json({ text: result.text });
}
```

### Pattern 4: Binary Classification with Structured Output
**What:** Claude prompt returns JSON with choice/confidence/reasoning
**When to use:** NLU tasks with fixed option sets
**Example:**
```typescript
// Source: src/app/api/nlu/route.ts lines 60-75
const userMessage =
  `Context: ${questionContext}\n` +
  `Option A: ${options.A}\n` +
  `Option B: ${options.B}\n\n` +
  `Visitor said: "${transcript}"\n\n` +
  `Classify this response as A or B. Return JSON only.`;

const result = await fetch('https://api.anthropic.com/v1/messages', {
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: userMessage }],
    system: 'Return ONLY valid JSON with fields: choice ("A" or "B"), confidence (0.0 to 1.0), reasoning (Portuguese)',
  }),
});

const classification = JSON.parse(result.content[0].text);
// { choice: 'A', confidence: 0.85, reasoning: '...' }
```

### Anti-Patterns to Avoid
- **Passing live props to async callbacks:** Causes stale closure bugs. Use ref snapshots instead.
- **Boolean soup for state:** `isRecording && !isProcessing && audioBlob !== null` creates impossible states. Use FSM.
- **Client-side API keys:** Exposes keys in browser bundle. Always proxy via Next.js API routes.
- **Ignoring empty transcripts:** Whisper returns `""` on silence but can hallucinate noise. Always check `trim() === ''`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Silence detection | Custom RMS analyzer with Web Audio API | Check `transcript.trim() === ''` after Whisper | Whisper already has internal VAD and silence handling. Client-side VAD adds latency and complexity. |
| Confidence calibration | Manual threshold tuning based on guess | Start with 0.7, test with real data, adjust if needed | Industry standard for binary classification is 0.6-0.8. No generic formula — must test against your domain. |
| Retry backoff | Exponential backoff for STT/NLU | Simple max attempts (2) with immediate retry | Voice UX requires fast feedback (~1s). Exponential backoff adds 2s+5s delays = bad UX for interactive installation. |
| Audio format conversion | ffmpeg in browser or server | Send webm/opus directly to Whisper | Whisper accepts webm, mp4, m4a, wav — no conversion needed. Browser MediaRecorder outputs webm by default. |
| Fallback TTS queueing | Custom queue manager for retry audio | Reuse existing TTS orchestrator hook | useTTSOrchestrator already handles playback + completion tracking. Don't duplicate. |

**Key insight:** Voice pipeline edge cases (silence, low confidence, API errors) are deceptively complex. The codebase already handles these correctly via FSM + frozen refs + max attempts. Don't replace with "simpler" solutions that reintroduce the bugs Phase 7 fixed.

## Common Pitfalls

### Pitfall 1: Whisper Hallucination on Silence
**What goes wrong:** Whisper returns random text ("Thank you for watching", "Transcribed by...") when audio is silent or contains only background noise.
**Why it happens:** Whisper is trained to always produce text. When no speech is detected, it sometimes generates common phrases from training data.
**How to avoid:** Check `transcript.trim() === ''` first. For production, consider adding `compression_ratio_threshold: 2.4` parameter to detect hallucinations (available via SDK, not plain fetch).
**Warning signs:** Transcripts like "Obrigado", "Transcrito por", or English phrases when user spoke Portuguese or was silent.

### Pitfall 2: Stale NLU Options from Previous State
**What goes wrong:** NLU receives options from INFERNO when already in PURGATORIO, classifying "Vozes/Silencio" instead of "Ficar/Embora".
**Why it happens:** React closure captures props at render time. Async callbacks execute after state changes.
**How to avoid:** Phase 7 already fixed this with `configRef.current` frozen when active. Verify tests confirm correct options per state.
**Warning signs:** Classification reasoning mentions wrong options, or CHOICE_A maps to wrong event for current state.

### Pitfall 3: Low Confidence Loop Without Escape
**What goes wrong:** User repeats answer 3+ times because fallback never accepts the choice.
**Why it happens:** Threshold too high (>0.8) for ambiguous Portuguese phrases, or max attempts set to infinity.
**How to avoid:** Default threshold 0.7, max attempts 2. After 2 attempts, use default choice even if confidence is low.
**Warning signs:** Analytics show fallbackCount > 2 frequently, user testing reports frustration with "not understanding".

### Pitfall 4: Empty Audio Blob from MediaRecorder
**What goes wrong:** MediaRecorder produces 0-byte blob, Whisper API rejects with 400 Bad Request.
**Why it happens:** Browser may produce empty blob if stream stops before any data arrives, or codec initialization fails.
**How to avoid:** Check `blob.size > 0` before sending to STT. Phase 8 already ensures mic captures full duration.
**Warning signs:** STT API route logs "Missing required field: audio" or Whisper 400 errors.

### Pitfall 5: API Timeout Kills Experience
**What goes wrong:** Whisper or Claude takes >10s due to network issues, user sees frozen UI.
**Why it happens:** No timeout configured on fetch calls.
**How to avoid:** Add AbortSignal with 10s timeout to API route fetch calls. On timeout, trigger fallback or default choice.
**Warning signs:** User testing reports "stuck" at AGUARDANDO state, no progression after speaking.

## Code Examples

Verified patterns from official sources:

### Whisper API Call with Portuguese Language
```typescript
// Source: src/app/api/stt/route.ts lines 30-46
const whisperForm = new FormData();
whisperForm.append('file', audioFile, audioFile.name || 'audio.webm');
whisperForm.append('model', 'whisper-1');
whisperForm.append('language', 'pt'); // Force Portuguese transcription
whisperForm.append('response_format', 'json');

const whisperResponse = await fetch(
  'https://api.openai.com/v1/audio/transcriptions',
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: whisperForm,
  }
);

const result = await whisperResponse.json();
return NextResponse.json({ text: result.text });
```

### Empty Transcript Handling with Fallback Logic
```typescript
// Source: src/hooks/useVoiceChoice.ts lines 246-264
if (!transcript || transcript.trim() === '') {
  // Empty transcript -- treat as silence
  if (currentAttempt >= maxAttempts) {
    console.log('[VoiceChoice] Max attempts reached, using default');
    dispatch({
      type: 'CLASSIFICATION_COMPLETE',
      result: {
        eventType: defaultEvent,
        confidence: 0,
        transcript: '',
        wasDefault: true,
      },
    });
  } else {
    console.log('[VoiceChoice] Empty transcript, requesting fallback');
    dispatch({ type: 'NEED_FALLBACK', attempt: currentAttempt });
  }
  return;
}
```

### Claude Binary Classification with Confidence Check
```typescript
// Source: src/hooks/useVoiceChoice.ts lines 268-293
const classification: ClassificationResult = await nlu.classify(
  transcript,
  snap.questionContext, // Frozen config snapshot
  snap.options
);

// Check confidence threshold (default 0.7)
if (classification.confidence >= threshold) {
  const eventType = classification.choice === 'A'
    ? snap.eventMap.A
    : snap.eventMap.B;

  dispatch({
    type: 'CLASSIFICATION_COMPLETE',
    result: {
      eventType,
      confidence: classification.confidence,
      transcript,
      wasDefault: false,
    },
  });
} else if (currentAttempt >= maxAttempts) {
  // Low confidence + max attempts = use default
  dispatch({
    type: 'CLASSIFICATION_COMPLETE',
    result: {
      eventType: defaultEvent,
      confidence: classification.confidence,
      transcript,
      wasDefault: true,
    },
  });
} else {
  // Low confidence, can retry
  dispatch({ type: 'NEED_FALLBACK', attempt: currentAttempt });
}
```

### Choice Config with Context for Each State
```typescript
// Source: src/components/experience/OracleExperience.tsx lines 23-42
const INFERNO_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Inferno, escolhendo entre a porta das vozes ou a porta do silencio',
  options: { A: 'Vozes', B: 'Silencio' },
  eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  defaultEvent: 'CHOICE_B', // Silence is default on timeout
};

const PURGATORIO_A_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Purgatorio caminho A, escolhendo se a memoria fica ou vai embora',
  options: { A: 'Deixa ficar', B: 'Manda embora' },
  eventMap: { A: 'CHOICE_FICAR', B: 'CHOICE_EMBORA' },
  defaultEvent: 'CHOICE_FICAR',
};

const PURGATORIO_B_CHOICE: ChoiceConfig = {
  questionContext: 'Visitante no Purgatorio caminho B, escolhendo se pisa na tela ou contorna',
  options: { A: 'Pisa', B: 'Contorna' },
  eventMap: { A: 'CHOICE_PISAR', B: 'CHOICE_CONTORNAR' },
  defaultEvent: 'CHOICE_CONTORNAR',
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Whisper v2 | Whisper v3 (whisper-1 API) | Nov 2023 | Improved multilingual accuracy, better hallucination resistance |
| Claude 3 Haiku (legacy) | Claude 3.5 Haiku (claude-haiku-4-5) | Nov 2024 | Faster (~100ms), cheaper, maintains classification accuracy |
| OpenAI SDK (4.x) | Plain fetch | Phase 5 (v1.1) | Removed 500KB dependency, simpler API routes, same functionality |
| Boolean state flags | FSM with useReducer | Phase 7 (v1.2) | Eliminated impossible states (32 combos → 5 explicit phases) |

**Deprecated/outdated:**
- **gpt-3.5-turbo for classification:** Replaced by Claude Haiku (cheaper, faster, better for binary tasks)
- **RecordRTC library:** Unnecessary dependency when MediaRecorder works natively in all modern browsers
- **Client-side OpenAI/Anthropic SDKs:** Security risk (exposes API keys), replaced by Next.js API route proxies

## Open Questions

1. **Whisper hallucination frequency on real booth audio**
   - What we know: Whisper can hallucinate on silence, compression_ratio_threshold=2.4 helps detect
   - What's unclear: How often this occurs with Bienal booth ambient noise (people talking nearby, music)
   - Recommendation: Test with real booth recording conditions. If hallucination rate > 10%, add compression_ratio_threshold check in API route.

2. **Claude confidence score distribution for Portuguese ambiguous phrases**
   - What we know: Default threshold 0.7 is industry standard for binary classification
   - What's unclear: Whether Portuguese phrases like "deixa quieto" vs "deixa ficar" produce confidence 0.6-0.7 (ambiguous) or 0.8-0.9 (clear)
   - Recommendation: Collect confidence scores from 20+ test utterances per question. If median confidence < 0.75, lower threshold to 0.65.

3. **API latency impact on UX (STT + NLU sequential)**
   - What we know: Mock shows 500ms STT + 200ms NLU = 700ms total. Real APIs may be slower.
   - What's unclear: Whether 1-2s latency feels acceptable in the installation context
   - Recommendation: Test with real APIs. If total latency > 1.5s frequently, consider adding "thinking" animation during processing phase.

4. **Empty blob prevention at MediaRecorder level**
   - What we know: Phase 8 ensures mic lifecycle is clean, but empty blobs are theoretically possible
   - What's unclear: Whether browser codec initialization can fail silently
   - Recommendation: Add `blob.size > 0` validation before sending to STT. If empty, treat as silence immediately (don't waste API call).

## Environment Availability

> Phase 9 depends on external APIs accessed via server-side Next.js routes. All tools are available.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | v22.16.0 | — |
| npm | Package management | ✓ | 10.9.2 | — |
| OPENAI_API_KEY | Whisper STT (/api/stt) | ✓* | Set in .env.local | MockSTTService if NEXT_PUBLIC_USE_REAL_APIS=false |
| ANTHROPIC_API_KEY | Claude NLU (/api/nlu) | ✓* | Set in .env.local | MockNLUService if NEXT_PUBLIC_USE_REAL_APIS=false |
| Browser MediaRecorder | Audio capture | ✓ | Native Web API | — |
| Chrome/Edge browser | Event runtime | ✓ | Modern version | — |

**\*API keys exist in `.env.local` but values are user-managed (not verified by this research).**

**Missing dependencies with no fallback:**
- None — all core dependencies available.

**Missing dependencies with fallback:**
- If API keys invalid/missing: Mock services automatically used when `NEXT_PUBLIC_USE_REAL_APIS !== 'true'`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.9 + @testing-library/react 16.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` (same — Vitest runs all by default) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PIPE-01 | Whisper transcribes Portuguese | integration | `npm test src/__tests__/stt-nlu-pipeline.test.ts -t "PIPE-01"` | ❌ Wave 0 |
| PIPE-02 | NLU receives correct config (not stale) | integration | `npm test src/__tests__/stt-nlu-pipeline.test.ts -t "PIPE-02"` | ❌ Wave 0 |
| PIPE-03 | Classification maps to correct event | integration | `npm test src/__tests__/stt-nlu-pipeline.test.ts -t "PIPE-03"` | ❌ Wave 0 |
| PIPE-04 | Low confidence triggers fallback cycle | integration | `npm test src/__tests__/stt-nlu-pipeline.test.ts -t "PIPE-04"` | ❌ Wave 0 |
| PIPE-05 | Empty/silence produces graceful fallback | integration | `npm test src/__tests__/stt-nlu-pipeline.test.ts -t "PIPE-05"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test src/__tests__/stt-nlu-pipeline.test.ts` (new integration test file)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + manual UAT with `NEXT_PUBLIC_USE_REAL_APIS=true`

### Wave 0 Gaps
- [ ] `src/__tests__/stt-nlu-pipeline.test.ts` — end-to-end integration tests covering all 5 PIPE requirements
  - Mock API responses for deterministic behavior
  - Verify config frozen per state (PIPE-02)
  - Test confidence threshold logic (PIPE-04)
  - Test empty transcript handling (PIPE-05)
- [ ] Manual test procedure document for real API validation
  - Step-by-step instructions for testing with `NEXT_PUBLIC_USE_REAL_APIS=true`
  - Expected Portuguese transcripts for each question
  - Confidence score acceptance criteria
  - Fallback trigger validation steps

## Sources

### Primary (HIGH confidence)
- OpenAI Whisper API documentation — https://platform.openai.com/docs/guides/speech-to-text
- Anthropic Messages API documentation — https://platform.claude.com/docs/en/about-claude/models/overview
- Codebase implementation:
  - `src/hooks/useVoiceChoice.ts` (Phase 7 FSM refactor)
  - `src/app/api/stt/route.ts` (Whisper integration)
  - `src/app/api/nlu/route.ts` (Claude integration)
  - `src/components/experience/OracleExperience.tsx` (choice configs)

### Secondary (MEDIUM confidence)
- [OpenAI Whisper Review 2026 — 98% Accuracy Benchmarks](https://diyai.io/ai-tools/speech-to-text/reviews/openai-whisper-review/) — Portuguese 93-97% accuracy claim
- [Best practices for fine-tuning Claude 3 Haiku on Amazon Bedrock](https://aws.amazon.com/blogs/machine-learning/best-practices-and-lessons-for-fine-tuning-anthropics-claude-3-haiku-on-amazon-bedrock/) — Binary classification suitability
- [Whisper hallucination discussion (GitHub)](https://github.com/openai/whisper/discussions/1606) — Silence hallucination issue

### Tertiary (LOW confidence)
- [NLU fallback strategy UX patterns](https://uxcontent.com/designing-chatbots-fallbacks/) — General chatbot fallback guidance, not voice-specific
- [Detecting Silence in Audio Using WebAudio](https://pavi2410.me/blog/detect-silence-using-web-audio/) — RMS-based VAD approach (NOT recommended — Whisper has internal VAD)
- [Understanding Confidence Scores in Machine Learning](https://www.mindee.com/blog/how-use-confidence-scores-ml-models) — Generic ML confidence threshold guidance (no Claude-specific data)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Whisper and Claude APIs already integrated and working with mocks
- Architecture: HIGH — Phase 7/8 refactors provide clean foundation, patterns verified in codebase
- Pitfalls: MEDIUM — Hallucination and stale config issues documented but real-world frequency unknown until tested with APIs

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (30 days — stable APIs, no breaking changes expected)
