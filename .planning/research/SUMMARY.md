# Project Research Summary

**Project:** O Oráculo — Milestone v2.0 Narração Realista
**Domain:** Text-to-Speech Migration (v2 to v3 with emotional inflection)
**Researched:** 2026-03-26
**Confidence:** MEDIUM-HIGH

## Executive Summary

ElevenLabs v3 with audio tags enables emotionally expressive PT-BR narration for the Oráculo voice experience but requires significant architectural changes. The v3 model introduces inflection control through inline tags like `[thoughtful]`, `[whispers]`, and `[pause]`, but **removes SSML `<break>` support** that the current v2 implementation relies on. This migration requires converting pause logic from SSML to audio tags, adding inflection markup to all 25 script segments, and regenerating MP3 files with 3.3x higher cost (~$15 vs $4.50).

The recommended approach is a two-phase migration: (1) API compatibility layer that converts existing SSML breaks to v3 audio tags without script changes, enabling testing; (2) manual script annotation with emotional tags and full regeneration. The cloned voice `AcSHc9S7hdxvGEJVWFzo` must be verified as IVC (Instant Voice Clone) rather than PVC (Professional Voice Clone), as PVC is not yet optimized for v3 features. PT-BR punctuation requires careful normalization (travessão, abbreviations, accent marks) to avoid robotic delivery.

Key risks include audio tag overuse causing instability, tag/voice mismatch if cloned voice lacks emotional range, and the 5,000 character limit requiring script segmentation. Mitigation strategies involve conservative tag application (1-2 per segment), pre-testing all tags with the cloned voice, and maintaining character count margins. The pre-recorded MP3 approach eliminates runtime API costs, making v3's higher generation cost acceptable for the event scale (300 visitors).

## Key Findings

### Recommended Stack

**Model migration:** Upgrade from `eleven_multilingual_v2` to `eleven_v3` to unlock audio tag support. The v3 model interprets emotional context through inline tags while maintaining PT-BR language fidelity. Same API endpoint (`/v1/text-to-speech/{voiceId}`), only the `model_id` parameter changes.

**Core technologies:**
- **ElevenLabs v3 API** (`eleven_v3` model_id): Expressive TTS with audio tag support — enables dramatic tone shifts (grave/intimate/whispered) essential for Dante narrative progression
- **Audio tags** (`[thoughtful]`, `[whispers]`, `[pause]`): Inline inflection control — replaces SSML breaks and adds emotional depth unavailable in v2
- **Instant Voice Clone (IVC)**: Recommended voice type for v3 — PVC not yet optimized, may produce lower quality with tag support
- **PT-BR language_code parameter**: Enforces Brazilian Portuguese pronunciation — prevents European accent mixing
- **192kbps MP3 output**: Minimum quality for event playback — default 128kbps too compressed for headphone delivery

**Voice settings adjustments:**
- Lower stability from 0.65-0.80 → 0.40-0.70 (enables Natural mode expressiveness)
- Remove `speaker_boost` (not supported in v3)
- Keep similarity_boost and style parameters (unchanged behavior)
- Remove `speed` parameter (v3 infers pacing from tags and text)

### Expected Features

**Must have (table stakes):**
- **Emotion control per segment**: Literary script requires mood shifts (calm → thoughtful → determined) to match narrative arc — v3 audio tags provide this
- **Natural pause handling**: Pauses carry meaning in literary narration. v3 tags `[pause]`, `[long pause]` replace SSML breaks
- **PT-BR accent fidelity**: Brazilian Portuguese distinct pronunciation and rhythm — v3 supports 70+ languages including PT-BR
- **Segment-level voice direction**: Each phase has different delivery (grave/intimate/whispered) — tags persist until reset
- **Punctuation-driven pacing**: Em-dashes (—), ellipsis (...), capitalization affect delivery rhythm — v3 interprets semantically

**Should have (competitive):**
- **Reaction sounds (sighs, breaths)**: Humanizes AI guide with non-verbal storytelling — `[sigh]`, `[gasps]` tags available
- **Cognitive pauses (hesitates, stammers)**: AI acknowledges limits naturally — `[hesitates]` adds vulnerability
- **Tone layering (multiple tags)**: Combine emotional state + delivery for complex moments — `[nervously][whispers]` supported
- **Rhythm variation per phase**: Layer `[rushed]`, `[drawn out]` with existing speed settings

**Defer (v2+ implementation):**
- **Real-time TTS via API route**: Pre-recorded MP3s sufficient for event — dynamic generation adds cost/complexity without value
- **Admin UI tag editor**: Fixed script for v1.0 event — future milestone could add tag autocomplete
- **Phoneme pronunciation control**: PT-BR handled natively — only needed for proper nouns if mispronounced

### Architecture Approach

Migration requires data model changes (add `inflection?: string[]` to `SpeechSegment` interface), conversion utilities (`buildV3Text()` to transform segments into tagged text), and updated generation script (switch model_id, remove SSML logic). Fallback to pre-recorded MP3s remains unchanged — v3 audio replaces v2 files in `public/audio/prerecorded/` with no runtime architecture impact.

**Major components:**
1. **Data Model (`src/types/index.ts`)**: Add `inflection` field to `SpeechSegment` for per-segment emotional tags — maintains backward compatibility with `pauseAfter`
2. **Conversion Layer (`src/lib/audio/v3-conversion.ts`)**: Transform `pauseAfter` milliseconds to audio tags (`[pause]`, `[long pause]`) and prepend inflection tags — replaces SSML break generation
3. **Generation Script (`scripts/generate-audio.mjs`)**: Call ElevenLabs v3 API with tagged text, handle 5,000 character limit via segmentation, validate output audio quality
4. **API Route (`src/app/api/tts/route.ts`)**: Support both v2 (SSML) and v3 (audio tags) via env flag for testing — SSML-to-tag shim enables gradual migration

**Key patterns:**
- **Two-phase migration**: Phase 1 adds v3 compatibility without script changes (SSML→tag conversion), Phase 2 adds inflection tags and regenerates
- **Tag allowlist approach**: Pre-test all planned tags with cloned voice, document which work reliably before scripting
- **Character count budgeting**: Keep tag overhead under 15% of script length to control costs
- **Quality validation**: Automated RMS noise floor checks post-generation to catch v3 static bug

### Critical Pitfalls

1. **Audio tag overuse creates instability**: Using too many tags causes AI to speed up unnaturally, introduce vocal artifacts (clicks/pops), or read tags aloud as text. Limit to 1-2 tags per phrase, use ellipses for pauses when possible, generate multiple versions and A/B test.

2. **Cloned voice + inflection tags mismatch**: Tags work unpredictably with cloned voices if training samples lack emotional range. IVC recommended over PVC (not optimized for v3). Test each tag separately before production use — if tag doesn't work, rely on text/punctuation instead.

3. **PT-BR punctuation traps**: Travessão (—), abbreviations ("Dr.", "R$"), accent marks, and currency formats can cause robotic delivery or mispronunciations. Normalize before API calls (expand abbreviations, standardize quotes, validate accents with spell checker).

4. **v3 character limit (5,000) requires segmentation**: Long narrative sections hit limit, requiring splits that create concatenation artifacts (audible seams, pitch mismatches). Segment at natural boundaries (sentence/paragraph breaks), target 4,500 chars max, test transitions for smooth flow.

5. **v3 stability settings don't transfer from v2**: v2 settings produce poor results in v3. Use "Natural" mode for balanced expressiveness, "Creative" only when tags needed (risks hallucinations like "uh"), avoid "Robust" (disables tag responsiveness). Re-tune similarity to 60-70% for v3.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Infrastructure & Voice Validation
**Rationale:** Verify voice compatibility before investing in script annotation. API compatibility layer enables testing without regeneration. Foundational work blocks all subsequent phases.

**Delivers:**
- Voice type verification (IVC vs PVC check via API)
- Updated data model with `inflection` field
- `v3-conversion.ts` utility with pause-to-tag logic
- API route supporting both v2/v3 via env flag
- SSML-to-tag shim for backward compatibility

**Addresses:**
- Cloned voice + tags mismatch pitfall (test before committing)
- v3 stability settings (establish baseline with cloned voice)

**Avoids:**
- Wasting generation credits on unsupported voice type
- Breaking existing functionality (backward compatible approach)

### Phase 2: Script Preparation & Tag Strategy
**Rationale:** Literary judgment required to select appropriate emotional tags. PT-BR punctuation audit prevents delivery issues. Character budgeting controls costs. Cannot proceed to generation without validated script.

**Delivers:**
- PT-BR punctuation normalization (expand abbreviations, validate accents)
- Script annotated with inflection tags (conservative approach: 1-2 per segment)
- Tag allowlist based on Phase 1 voice testing
- Character count audit (<4,500 per segment, <15% tag overhead)
- Phase-level emotion mapping (APRESENTACAO: thoughtful, INFERNO: grave, etc.)

**Addresses:**
- PT-BR punctuation traps (preventive normalization)
- Audio tag overuse (strategic placement with density limits)
- Cost explosion from tag overhead (character budgeting)

**Uses:**
- Recommended tags from STACK.md (thoughtful, whispers, sad, resigned tone)
- Phase voice directions from FEATURES.md

**Avoids:**
- Robotic delivery from poor punctuation
- Over-tagging causing instability
- Unexpected cost overruns

### Phase 3: Audio Generation & Quality Validation
**Rationale:** Generate audio only after script validated. Quality checks catch v3 static bug. Fallback strategy mitigates event risk. Full regeneration of 25 MP3s is expensive (time + cost), should happen once.

**Delivers:**
- Updated `generate-audio.mjs` with v3 model_id and tag integration
- 25 regenerated MP3s with emotional inflection (192kbps minimum)
- Automated audio quality validation (RMS noise floor checks)
- A/B comparison with v2 baseline
- Backup v2 audio library

**Implements:**
- buildV3Text() conversion logic from Phase 1
- Tag-annotated script from Phase 2

**Addresses:**
- v3 character limit segmentation (enforced in script)
- Audio quality degradation (output format validation)
- v3 static noise bug (automated quality checks + retry logic)

**Avoids:**
- Wasting generation time on unvalidated tags
- Serving noisy audio at event
- Missing event deadline (backup v2 audio as failover)

### Phase Ordering Rationale

- **Phase 1 first (Infrastructure)**: Voice compatibility is a go/no-go decision. If cloned voice is PVC or doesn't support tags, entire approach changes (must create new IVC or use Voice Design). API compatibility layer enables safe testing before committing to full migration.

- **Phase 2 before Phase 3 (Script before Generation)**: Script annotation requires literary judgment and native PT-BR review. Cannot generate audio without knowing which tags to use. Tag strategy (conservative vs expressive) influences generation settings. Character counting prevents hitting 5,000 limit mid-generation.

- **Phase 3 last (Generation)**: Most expensive phase in time and cost (~25 min generation + $15 credits). Should only run once with validated script. Quality checks prevent re-generation due to noise bugs. Backup v2 audio de-risks event dependency on v3 stability.

**Dependency chain:** Voice validation → Script annotation → Audio generation (linear, no parallelization possible)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Voice API check is straightforward (curl request), but tag testing requires empirical validation with cloned voice — allocate time for experimentation
- **Phase 2:** PT-BR punctuation normalization may uncover edge cases not documented in TTS guides — consider native speaker review before finalizing

Phases with standard patterns (skip research-phase):
- **Phase 3:** ElevenLabs API calls are well-documented, generation script follows established batch processing pattern — implementation is mechanical once script ready

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official ElevenLabs docs confirm model_id, endpoint, parameter changes. Multiple sources consistent on IVC/PVC recommendation. |
| Features | HIGH | Audio tag categories documented in official blog posts. Table stakes features align with PRD script requirements. |
| Architecture | HIGH | Data model changes straightforward. Conversion logic well-defined. API differences explicitly documented by ElevenLabs. |
| Pitfalls | MEDIUM | Tag overuse and voice mismatch warnings from official troubleshooting docs. PT-BR punctuation impact inferred from general TTS linguistics (not PT-BR-specific v3 testing). |

**Overall confidence:** MEDIUM-HIGH

Research based on official ElevenLabs documentation, but **no direct testing with PT-BR cloned voice and v3 tags**. All architectural recommendations verified from API reference, but tag effectiveness with `AcSHc9S7hdxvGEJVWFzo` voice requires empirical validation in Phase 1.

### Gaps to Address

- **Voice type verification**: Unknown whether `AcSHc9S7hdxvGEJVWFzo` is IVC or PVC. If PVC, must create new IVC or wait for PVC optimization before proceeding. **Handle in Phase 1:** API call to `/v1/voices`, check category field. Blocking issue if PVC.

- **Tag effectiveness in PT-BR**: Audio tags documented with English examples. Unclear if tags like `[thoughtful]` register identically when surrounding text is Portuguese. **Handle in Phase 1:** Generate test samples with 5-10 tags, listen for emotional shifts. Adjust tag selection based on what works.

- **Optimal pause conversion thresholds**: Research suggests `[pause]` vs `[long pause]` mapping, but no documented millisecond thresholds for perceptual equivalence to SSML breaks. **Handle in Phase 2:** A/B test different conversion thresholds (e.g., 1.5s vs 2s for `[pause]`), pick closest match to current audio timing.

- **Cloned voice stability mode**: Unknown whether Natural (0.4-0.6) or Creative (0.0-0.4) mode works better with `AcSHc9S7hdxvGEJVWFzo`. **Handle in Phase 1:** Generate same phrase with three modes, blind listen test, document baseline settings.

- **Cost accuracy**: Estimated $15 for v3 generation based on character count projections. Actual cost may vary if audio tags add more overhead than expected. **Handle in Phase 3:** Monitor API credit consumption during first few generations, adjust budget if needed. $50 total milestone budget has cushion.

## Sources

### Primary (HIGH confidence)
- [ElevenLabs Models Documentation](https://elevenlabs.io/docs/overview/models) — Model IDs, v3 capabilities, language support
- [ElevenLabs Text-to-Speech API Reference](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) — API parameters, request format, character limits
- [ElevenLabs v3 Audio Tags Blog](https://elevenlabs.io/blog/v3-audiotags) — Tag syntax, categories, usage examples
- [ElevenLabs Best Practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) — v2 vs v3 differences, SSML deprecation
- [ElevenLabs Voice Cloning Overview](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning) — IVC vs PVC comparison, v3 optimization status
- [ElevenLabs SSML Support FAQ](https://help.elevenlabs.io/hc/en-us/articles/24352686926609-Do-pauses-and-SSML-phoneme-tags-work-with-the-API) — Explicit confirmation v3 does not support SSML breaks

### Secondary (MEDIUM confidence)
- [ElevenLabs v3 Emotional Context Blog](https://elevenlabs.io/blog/eleven-v3-audio-tags-expressing-emotional-context-in-speech) — Emotional tag examples
- [ElevenLabs v3 Situational Awareness Blog](https://elevenlabs.io/blog/eleven-v3-situational-awareness) — Situational tag examples
- [Audio Generation Plugin v3 Guide](https://audio-generation-plugin.com/elevenlabs-v3/) — Comprehensive tag reference (1806+ tags claimed, unverified count)
- [ElevenLabs Troubleshooting Docs](https://elevenlabs.io/docs/eleven-creative/troubleshooting) — Tag overuse warnings, quality issues
- [Portuguese Punctuation Guide (philipebrazuca.com)](https://philipebrazuca.com/en/punctuation-marks-in-portuguese/) — Travessão and vírgula usage rules
- [TTS Benchmark 2025 (smallest.ai)](https://smallest.ai/blog/tts-benchmark-2025-smallestai-vs-elevenlabs-report) — MOS metrics, quality validation tools

### Tertiary (LOW confidence)
- [ElevenLabs v3 Static Noise Incident (Feb 2026)](https://status.elevenlabs.io/incidents/01KHDRZJ5NGS88YZZRFWBNRZ4S) — Bug report, ~1.5% request failure rate (resolved)
- [PT-BR TTS Challenges Discussion](https://community.openai.com/t/text-to-speech-modulating-between-european-and-brazilian-portuguese/829695) — Accent mixing reports (OpenAI TTS, not ElevenLabs, but relevant as general PT-BR concern)

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
