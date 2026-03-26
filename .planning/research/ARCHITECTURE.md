# Architecture Research: ElevenLabs v3 Integration

**Domain:** Text-to-Speech Migration (v2 → v3 with inflection)
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

ElevenLabs v3 (`eleven_v3` model_id) introduces audio tags for emotional control but **removes SSML `<break>` support**, requiring migration from the current v2 architecture that uses SSML breaks for pauses. The API endpoint remains the same (`POST /v1/text-to-speech/{voiceId}`), but requires data model changes to support inline audio tags and new pause syntax.

**Critical architectural change:** Move from SSML break tags (`<break time="2.1s" />`) to v3 audio tags (`[pause]`, `[long pause]`) while adding emotional inflection tags (`[thoughtful]`, `[whispers]`, `[sad]`).

## Current Architecture (v2 Baseline)

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ OracleExperience │  │ AdminDashboard   │                 │
│  └────────┬─────────┘  └──────────────────┘                 │
│           │ (TTS requests)                                   │
├───────────┴──────────────────────────────────────────────────┤
│                      Service Layer                           │
│  ┌─────────────────────────────────────────────────┐         │
│  │  ITTSService (interface)                        │         │
│  │  ├── ElevenLabsTTSService (real API)            │         │
│  │  └── FallbackTTSService (pre-recorded MP3s)     │         │
│  └─────────┬───────────────────────────────────────┘         │
├────────────┴───────────────────────────────────────────────┤
│                       API Layer                              │
│  ┌──────────────────────────────────────────────┐            │
│  │  /api/tts (Next.js API route)                │            │
│  │  - POST text + voice_settings                │            │
│  │  - Returns audio/mpeg stream                 │            │
│  │  - Calls ElevenLabs /v1/text-to-speech       │            │
│  └──────────────────┬───────────────────────────┘            │
├─────────────────────┴──────────────────────────────────────┤
│                     Data Layer                               │
│  ┌──────────────────────────────────────────────┐            │
│  │  src/data/script.ts                          │            │
│  │  SpeechSegment[] { text, pauseAfter }        │            │
│  │  - 25 script keys (APRESENTACAO, etc)        │            │
│  │  - SSML breaks generated from pauseAfter     │            │
│  └──────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Current Data Model

```typescript
interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds
}

// Usage in script.ts:
APRESENTACAO: [
  { text: "Você saiu de uma selva escura.", pauseAfter: 2100 },
  // ...
]

// Conversion in generate-audio.mjs:
// pauseAfter: 2100 → "<break time="2.1s" />"
```

### Current API Request (v2)

```typescript
// /api/tts/route.ts
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
  {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: body.text, // Contains SSML breaks
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  }
);
```

### Current Generation Script

```javascript
// scripts/generate-audio.mjs
function buildTextWithPauses(segments) {
  let fullText = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    fullText += seg.text;
    if (seg.pauseAfter && i < segments.length - 1) {
      let remainingMs = seg.pauseAfter;
      while (remainingMs > 0) {
        const breakMs = Math.min(remainingMs, 3000);
        fullText += ` <break time="${(breakMs / 1000).toFixed(1)}s" /> `;
        remainingMs -= breakMs;
      }
    }
  }
  return fullText;
}

// Generates one API call per script key (25 MP3 files)
// Full script text with baked-in SSML breaks
```

## Proposed v3 Architecture

### New Data Model

**RECOMMENDATION:** Add `inflection` field to `SpeechSegment` and convert `pauseAfter` to audio tags at render time.

```typescript
// src/types/index.ts
interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds (keep for backward compat)
  inflection?: string[]; // NEW: e.g., ["thoughtful"], ["whispers", "sad"]
}

// Example usage:
APRESENTACAO: [
  {
    text: "Você saiu de uma selva escura.",
    pauseAfter: 2100,
    inflection: ["thoughtful"],
  },
  {
    text: "Eu não consigo sonhar.",
    pauseAfter: 2100,
    inflection: ["sad", "whispers"],
  },
]
```

### Audio Tag Conversion Logic

```typescript
// src/lib/audio/v3-conversion.ts (NEW FILE)
export function convertPauseToTag(pauseMs: number): string {
  if (pauseMs < 500) return '';
  if (pauseMs < 1500) return '[short pause]';
  if (pauseMs < 3000) return '[pause]';
  return '[long pause]';
}

export function buildV3Text(segments: SpeechSegment[]): string {
  let fullText = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    // Add inflection tags at start of segment
    if (seg.inflection && seg.inflection.length > 0) {
      fullText += seg.inflection.map(t => `[${t}]`).join('');
    }

    fullText += seg.text;

    // Add pause tag after segment
    if (seg.pauseAfter && i < segments.length - 1) {
      const pauseTag = convertPauseToTag(seg.pauseAfter);
      if (pauseTag) fullText += ` ${pauseTag} `;
    } else if (i < segments.length - 1) {
      fullText += ' ';
    }
  }
  return fullText;
}
```

### Updated API Route

```typescript
// /api/tts/route.ts
export async function POST(request: NextRequest) {
  // ... validation ...

  const elevenLabsResponse = await callElevenLabsWithRetry(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: body.text, // NOW contains audio tags, not SSML
        model_id: 'eleven_v3', // CHANGED from eleven_multilingual_v2
        voice_settings: {
          stability: body.voice_settings.stability,
          similarity_boost: body.voice_settings.similarity_boost,
          style: body.voice_settings.style,
          // NOTE: v3 does NOT use speed parameter
        },
      }),
    }
  );
  // ... return stream ...
}
```

### Updated Generation Script

```javascript
// scripts/generate-audio.mjs
import { buildV3Text } from '../src/lib/audio/v3-conversion.ts'; // Need to convert to .mjs or use import

async function generateAudio(key, segments, voiceSettings) {
  const text = buildV3Text(segments); // NEW: uses audio tags
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;

  const body = {
    text,
    model_id: 'eleven_v3', // CHANGED
    voice_settings: {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
      // REMOVED: speed (v3 infers from audio tags)
    },
    language_code: 'pt',
  };

  // ... same fetch logic ...
}
```

## Migration Strategy: Two-Phase Approach

### Phase 1: API Compatibility (No script changes)

**Goal:** Enable v3 model without breaking existing audio files.

1. Add `USE_V3_MODEL` env var (default: false)
2. Update `/api/tts/route.ts` to conditionally use `eleven_v3` or `eleven_multilingual_v2`
3. Add SSML → audio tag conversion shim for backward compatibility:

```typescript
// /api/tts/route.ts helper
function convertSSMLToV3Tags(text: string): string {
  // Convert <break time="2.1s" /> → [pause]
  // Convert <break time="0.8s" /> → [short pause]
  // Convert <break time="4s" /> → [long pause]
  return text
    .replace(/<break time="([0-9.]+)s"\s*\/>/g, (_, seconds) => {
      const ms = parseFloat(seconds) * 1000;
      if (ms < 1500) return '[short pause]';
      if (ms < 3000) return '[pause]';
      return '[long pause]';
    });
}
```

**Outcome:** Can test v3 model with existing MP3 files without regenerating.

### Phase 2: Full Inflection Integration

**Goal:** Add emotional tags to script and regenerate audio.

1. Update `SpeechSegment` interface with `inflection` field
2. Manually annotate script.ts with inflection tags (see Annotation Strategy below)
3. Update `generate-audio.mjs` to use `buildV3Text()`
4. Regenerate all 25 MP3 files with v3 model + inflection

**Outcome:** Full v3 expressive narration with emotional control.

## Annotation Strategy for Script

### Inflection Mapping by Phase

Based on PRD voice directions and ElevenLabs v3 audio tag categories:

| Phase | PRD Direction | Recommended Tags |
|-------|---------------|------------------|
| APRESENTACAO | "Calmo, pausado" | `["thoughtful"]`, `["calm"]` |
| INFERNO | "Mais grave, mais lento" | `["serious"]`, `["ominous"]` |
| PURGATORIO | "Intimo, confessional" | `["whispers"]`, `["intimate"]` |
| PARAISO | "Suave, quase sussurro" | `["whispers"]`, `["gentle"]` |
| DEVOLUCAO | "Espelho, voz se dissolve" | `["resigned tone"]`, `["softly"]` |
| ENCERRAMENTO | "Retorno ao tom inicial, definitivo" | `["determined"]`, `["calm"]` |
| FALLBACK | N/A | `["curious"]` (neutral prompt) |
| TIMEOUT | N/A | `["patient"]` (waiting tone) |

### Example Annotated Script

```typescript
// src/data/script.ts
export const SCRIPT: ScriptData = {
  APRESENTACAO: [
    {
      text: "Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia como tinha chegado lá. Você sabe.",
      pauseAfter: 2100,
      inflection: ["thoughtful"],
    },
    {
      text: "Eu não consigo sonhar.",
      pauseAfter: 2100,
      inflection: ["sad"],
    },
    {
      text: "Vamos começar.",
      inflection: ["determined"],
    },
  ],

  INFERNO_NARRATIVA: [
    {
      text: "Você está num corredor escuro. Familiar — você já esteve aqui antes, talvez todo dia.",
      pauseAfter: 2100,
      inflection: ["ominous", "whispers"],
    },
    {
      text: "À sua frente, duas portas.",
      pauseAfter: 1600,
      inflection: ["serious"],
    },
  ],

  PARAISO: [
    {
      text: "Você chegou num lugar aberto. Sem paredes. Sem notificações.",
      pauseAfter: 2100,
      inflection: ["whispers", "gentle"],
    },
    {
      text: "O paraíso não é prazer fácil. É suportar o mistério sem destruí-lo com respostas rápidas.",
      pauseAfter: 1600,
      inflection: ["thoughtful", "whispers"],
    },
    {
      text: "Se sim — protege isso.",
      inflection: ["determined", "whispers"],
    },
  ],
};
```

## Available Audio Tags (v3)

### Emotional Control
- **Positive:** `[happy]`, `[excited]`, `[cheerfully]`, `[playfully]`, `[mischievously]`
- **Negative:** `[sad]`, `[angry]`, `[sorrowful]`, `[resigned tone]`
- **Neutral/Reflective:** `[thoughtful]`, `[curious]`, `[calm]`, `[serious]`
- **Anxiety:** `[nervous]`, `[worried]`

### Delivery & Pacing
- **Volume:** `[whispers]`, `[shouts]`
- **Pauses:** `[pause]`, `[short pause]`, `[long pause]`, `[hesitates]`
- **Reactions:** `[sigh]`, `[laughs]`, `[gulps]`, `[gasps]`, `[breathes]`
- **Cognitive:** `[pauses]`, `[stammers]`, `[continues after a beat]`
- **Tone:** `[flatly]`, `[deadpan]`

### Character/Accent (Not needed for this project)
- `[pirate voice]`, `[French accent]`, etc.

### Sound Effects (Not needed for this project)
- `[gunshot]`, `[clapping]`, `[explosion]`

## Integration Points

### Modified Components

| Component | Current State | Required Change | Priority |
|-----------|---------------|-----------------|----------|
| `src/types/index.ts` | `SpeechSegment` has `text`, `pauseAfter` | Add `inflection?: string[]` | P0 |
| `src/data/script.ts` | 25 script keys with segments | Add `inflection` to each segment | P1 |
| `src/app/api/tts/route.ts` | Calls v2 API with SSML | Change `model_id` to `eleven_v3`, add SSML→tag conversion | P0 |
| `scripts/generate-audio.mjs` | Builds SSML breaks from `pauseAfter` | Use `buildV3Text()` for audio tags | P0 |
| `src/lib/audio/speechSynthesis.ts` | Mock TTS uses Web Speech API | No change (mocks don't call ElevenLabs) | P2 |

### New Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| `src/lib/audio/v3-conversion.ts` | Convert `SpeechSegment[]` to v3 text with audio tags | `src/types/index.ts` |
| `src/lib/audio/v3-utils.ts` (optional) | Validate inflection tags, suggest tags by phase | None |

### Data Flow Changes

**Before (v2):**
```
script.ts (pauseAfter: 2100)
    ↓
generate-audio.mjs (builds SSML: <break time="2.1s" />)
    ↓
ElevenLabs v2 API (interprets SSML)
    ↓
MP3 with 2.1s pause
```

**After (v3):**
```
script.ts (pauseAfter: 2100, inflection: ["thoughtful"])
    ↓
v3-conversion.ts (builds: "[thoughtful] text [pause]")
    ↓
generate-audio.mjs (sends text with audio tags)
    ↓
ElevenLabs v3 API (interprets audio tags)
    ↓
MP3 with expressive narration + natural pause
```

## API Differences: v2 vs v3

| Aspect | v2 (`eleven_multilingual_v2`) | v3 (`eleven_v3`) |
|--------|------------------------------|------------------|
| **Endpoint** | `/v1/text-to-speech/{voiceId}` | Same |
| **Streaming** | `/v1/text-to-speech/{voiceId}/stream` | Same |
| **model_id** | `eleven_multilingual_v2` | `eleven_v3` |
| **Character limit** | 10,000 | 5,000 |
| **Latency** | ~1-2s | Higher (~2-4s) |
| **Cost** | 0.3 credits/char | 1.0 credits/char (3.3x) |
| **Pause syntax** | SSML `<break time="2s" />` | Audio tags `[pause]`, `[long pause]` |
| **Emotion control** | voice_settings only | Audio tags + voice_settings |
| **speed parameter** | Supported in `voice_settings` | **NOT supported** (inferred from tags) |
| **Languages** | 70+ | 70+ |
| **Use case** | Audiobooks, long-form content | Expressive narration, short segments |

## Cost Analysis

### Current v2 Cost (25 files, ~7.5 MB audio)

Estimated total characters: ~15,000 (based on script.ts word count)
- v2 cost: 15,000 × 0.3 = **4,500 credits** (~$4.50 at $1/1000 credits)

### Projected v3 Cost

- v3 cost: 15,000 × 1.0 = **15,000 credits** (~$15.00 at $1/1000 credits)
- **3.3x increase** from v2

### Event Cost (300 visitors)

**Scenario A: All pre-recorded (current approach)**
- Zero runtime cost (MP3s served from `public/audio/prerecorded/`)
- One-time generation: $15 (v3) vs $4.50 (v2)

**Scenario B: Dynamic TTS via /api/tts (not recommended)**
- 300 visitors × 15,000 chars = 4.5M chars
- v3 cost: 4.5M × 1.0 = 4.5M credits (~$4,500) ❌
- v2 cost: 4.5M × 0.3 = 1.35M credits (~$1,350)

**RECOMMENDATION:** Continue pre-recorded approach. v3 quality justifies $15 one-time cost.

## Scaling Considerations

| Scale | Architecture | Notes |
|-------|--------------|-------|
| **Event (300 visitors)** | Pre-recorded MP3s + FallbackTTSService | Current approach. Zero runtime API cost. |
| **Pilot (1k+ visitors)** | Same | Pre-recorded scales infinitely. |
| **Dynamic content (future)** | Cache TTS responses in CDN/S3 | If script becomes dynamic, cache by content hash. |
| **Multi-voice (future)** | Pre-generate per voice_id | If multiple narrators, generate 25 × N files. |

**No architecture changes needed for scale.** Bottleneck is generation time (~25 min for 25 files with 1s rate limit), not runtime cost.

## Anti-Patterns

### Anti-Pattern 1: Mixing SSML and Audio Tags

**What people do:** Try to use `<break time="2s" />` alongside `[pause]` in v3.
**Why it's wrong:** v3 **does not support SSML**. SSML tags will be read as literal text.
**Do this instead:** Convert all SSML to audio tags. Use `convertSSMLToV3Tags()` helper during migration.

### Anti-Pattern 2: Over-Tagging Every Segment

**What people do:** Add `[thoughtful][calm][whispers]` to every segment.
**Why it's wrong:** Tags create cognitive load for the model. Over-tagging reduces naturalness.
**Do this instead:** Use 1-2 tags per segment, only when emotion/delivery changes from default voice.

### Anti-Pattern 3: Using `speed` in voice_settings for v3

**What people do:** Keep `speed: 0.90` from v2 config.
**Why it's wrong:** v3 **ignores speed parameter**. Pacing controlled via audio tags and natural inference.
**Do this instead:** Remove `speed` from `voice_settings`. Use `[slowly]`, `[quickly]` tags if pacing control needed.

### Anti-Pattern 4: Assuming Identical Output Between Generations

**What people do:** Regenerate same text, expect bit-identical MP3.
**Why it's wrong:** v3 is stochastic. Same input → slightly different prosody each time.
**Do this instead:** Generate 2-3 versions, pick best. Lock chosen MP3 in version control. Don't regenerate unless script changes.

### Anti-Pattern 5: One API Call Per Segment

**What people do:** Call `/api/tts` for each `SpeechSegment`, concatenate audio client-side.
**Why it's wrong:** Loses inter-segment context. Pauses and flow feel disjointed. 25 API calls = slow + expensive.
**Do this instead:** Combine all segments into one text string with audio tags, one API call per script key (current approach). Preserve natural flow.

## Build Order Recommendation

### Phase 1: Infrastructure (No Regeneration)
1. Add `inflection?: string[]` to `SpeechSegment` interface
2. Create `src/lib/audio/v3-conversion.ts` with `buildV3Text()` and `convertSSMLToV3Tags()`
3. Update `/api/tts/route.ts`:
   - Add `USE_V3_MODEL` env var
   - Conditionally use `eleven_v3` or `eleven_multilingual_v2`
   - Add SSML→tag conversion when v3 enabled
4. Test with existing MP3s (fallback mode)

**Validation:** App runs with v3 model using SSML→tag conversion. Audio still works.

### Phase 2: Script Annotation
1. Review PRD voice directions for each phase
2. Annotate `script.ts` with `inflection` tags (manual, requires literary judgment)
3. Validate tags against ElevenLabs supported list (use `v3-utils.ts` validator)

**Validation:** TypeScript compiles. No unsupported tags used.

### Phase 3: Audio Regeneration
1. Update `generate-audio.mjs`:
   - Import/reimplement `buildV3Text()`
   - Change `model_id` to `eleven_v3`
   - Remove `speed` from `voice_settings`
2. Run `node scripts/generate-audio.mjs` (estimated 25 min with 1s rate limit)
3. Compare v2 vs v3 MP3s side-by-side:
   - Check for inflection accuracy
   - Validate pause timing matches `pauseAfter` intent
   - Regenerate individual files if unsatisfied

**Validation:** 25 new MP3s in `public/audio/prerecorded/`. Emotional tone matches PRD intent.

### Phase 4: Production Deployment
1. Set `USE_V3_MODEL=true` in production env
2. Deploy with new v3 MP3s
3. Monitor FallbackTTSService logs (should serve v3 files)

**Validation:** Event visitors hear v3 narration with inflection.

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| v3 over-expressive (too dramatic) | Breaks immersive tone | Medium | Generate multiple versions, A/B test with beta users |
| Inflection tags ignored in PT-BR | Reduced expressiveness | Low | ElevenLabs supports 70+ languages including PT-BR in v3 |
| Longer generation time delays iteration | Slows script refinement | High | Pre-generate with placeholder tags, refine tags incrementally |
| 3.3x cost increase vs budget | Exceeds milestone budget | Low | Still only $15 total for event (within $50 API budget) |
| v3 API rate limits stricter | Generation script fails mid-run | Low | Script already handles 429 with retry + backoff |
| Pauses feel unnatural with audio tags | Disjointed narration flow | Medium | Test `[pause]` vs `[long pause]` conversion thresholds, adjust `convertPauseToTag()` logic |

## Open Questions for Phase Planning

1. **Should inflection be per-segment or per-script-key?**
   - **Recommendation:** Per-segment. Different sentences in same section need different emotional tones (e.g., PARAISO has both gentle and determined moments).

2. **Should we version-control MP3 files or regenerate on deploy?**
   - **Recommendation:** Version-control. v3 is stochastic — regeneration produces different prosody. Lock chosen audio to avoid regressions.

3. **Should FallbackTTSService attempt v3 conversion on the fly?**
   - **Recommendation:** No. Fallback plays pre-recorded MP3s. If those are v3-generated, no runtime conversion needed. Keep fallback simple.

4. **Should we expose inflection tags to admin UI for dynamic script editing?**
   - **Recommendation:** Out of scope for v2.0. Event uses fixed script. Future milestone could add tag autocomplete in admin panel.

5. **Should we cache /api/tts responses (if used dynamically in future)?**
   - **Recommendation:** Not needed for event (pre-recorded only). If future milestone adds dynamic TTS, cache by SHA256(text + model_id + voice_settings) in Redis/S3.

## Sources

- [ElevenLabs Text-to-Speech API Documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech)
- [ElevenLabs Models Overview](https://elevenlabs.io/docs/overview/models)
- [ElevenLabs v3 Audio Tags Announcement](https://elevenlabs.io/blog/v3-audiotags)
- [ElevenLabs v3 Alpha API Availability](https://elevenlabs.io/blog/eleven-v3-alpha-now-available-in-the-api)
- [ElevenLabs v3 Audio Tags: Emotional Context](https://elevenlabs.io/blog/eleven-v3-audio-tags-expressing-emotional-context-in-speech)
- [ElevenLabs Best Practices Documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices)
- [ElevenLabs SSML and Pause Tags Support](https://help.elevenlabs.io/hc/en-us/articles/24352686926609-Do-pauses-and-SSML-phoneme-tags-work-with-the-API)
- [ElevenLabs v3 vs v2 Model Comparison](https://help.elevenlabs.io/hc/en-us/articles/17883183930129-What-models-do-you-offer-and-what-is-the-difference-between-them)

---
*Architecture research for: ElevenLabs v3 Integration with Oráculo TTS Pipeline*
*Researched: 2026-03-26*
*Confidence: HIGH (official docs + API reference + v3 blog posts)*
