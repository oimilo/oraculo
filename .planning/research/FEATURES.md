# Feature Landscape: Realistic AI Narration with ElevenLabs v3

**Domain:** Text-to-speech narration for literary voice experience
**Researched:** 2026-03-26
**Context:** Dante-inspired interactive voice journey for art event. 25 MP3s pre-recorded with eleven_multilingual_v2 + SSML breaks. Voice cloned (AcSHc9S7hdxvGEJVWFzo). PT-BR script with literary references.

---

## Table Stakes

Features users expect from realistic AI narration. Missing = narration feels robotic or flat.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Emotion control per segment** | Literary script requires mood shifts (calm → thoughtful → determined) | Medium | v3 audio tags: `[calm]`, `[thoughtful]`, `[determined]`. Replace v2's monotone output. |
| **Natural pause handling** | Pauses carry meaning in literary narration. "..." vs dialog break vs reflection pause | Low-Medium | v3: `[pause]`, `[short pause]`, `[long pause]` replace SSML `<break>`. PT-BR ellipsis (...) already signals pause naturally. |
| **PT-BR accent fidelity** | Brazilian Portuguese has distinct rhythm/pronunciation from European | Low | v3 supports 70+ languages including PT-BR. Use `language_code: 'pt'` in API. Already implemented. |
| **Segment-level voice direction** | Each phase has different delivery: grave (Inferno), intimate (Purgatorio), whispered (Paraiso) | Medium | v3 audio tags persistent until new tag. Apply `[whispers]` at Paraiso start, persists through segment. |
| **Punctuation-driven pacing** | Em-dashes (—), ellipsis (...), capitalization affect delivery rhythm | Low | v3 interprets punctuation semantically. Already in script. No code change needed. |

**Dependencies:**
- Existing: voice_id (cloned voice), script.ts with text segments, PHASE_VOICE settings
- New: Migrate `eleven_multilingual_v2` → v3 model, replace SSML breaks with audio tags

---

## Differentiators

Features that set narration apart. Not expected, but valued for literary/artistic context.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Reaction sounds (sighs, breaths)** | Humanizes AI guide. "Eu não consigo sonhar [sigh]" conveys vulnerability | Low | v3: `[sigh]`, `[gasps]`, `[gulps]`. Add 2-3 strategic reactions per phase. Non-verbal storytelling. |
| **Cognitive pauses (hesitates, stammers)** | AI acknowledges limits: "Eu... [hesitates] não sei o que te moveu" | Medium | v3: `[hesitates]`, `[stammers]`, `[pauses]`. Requires script revision to find natural insertion points. |
| **Tone layering (multiple tags)** | Combine emotional state + delivery: `[nervously][whispers]` for complex moments | Medium | v3 supports tag stacking. Test how cloned voice handles combinations. May require experimentation. |
| **Rhythm variation per phase** | Inferno: grave/slow. Purgatorio: natural pacing. Paraiso: whispered/drawn out | Medium | v3: `[rushed]`, `[drawn out]`. Layer with existing speed settings (0.80-0.90). |
| **Situational awareness (context-driven delivery)** | "Virgílio sabia que não podia entrar no Paraíso [resigned tone]" | High | v3 interprets context from surrounding text. Requires careful tag placement + testing. May be voice-dependent. |

**Dependencies:**
- Script revision to insert audio tags at narratively appropriate moments
- Voice testing: cloned voice must support target emotions (some voices handle `[whispers]` better than `[SHOUTING]`)
- Iteration budget: v3 is nondeterministic, may need 2-3 generations per segment to find best take

---

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **SSML `<break>` tags in v3** | v3 dropped SSML support. Will be ignored or cause errors. | Use `[pause]`, `[short pause]`, `[long pause]` audio tags. Migrate existing pauseAfter logic to tags. |
| **Excessive audio tags** | Over-directing kills naturalness. "The model will still speak out the emotional delivery guides" — tags appear in output. | Use tags sparingly (1-2 per 2-3 sentences). Trust v3's contextual interpretation + punctuation. |
| **Phoneme/IPA pronunciation tags** | v3 handles PT-BR natively. Micro-managing pronunciation breaks flow. | Only use for proper nouns/neologisms if TTS mispronounces. Test first. |
| **Multi-speaker dialogue API** | Oráculo is single narrator. Text-to-Dialogue endpoint adds complexity for zero benefit. | Single voice, multiple emotions. Use audio tags for variety. |
| **Tag persistence without reset** | Audio tags persist until new tag applied. Forgetting to reset causes emotional bleed. | Explicitly reset tags between phases: `[calm] Você chegou num lugar aberto...` after `[resigned tone]` in prior segment. |

---

## Feature Dependencies

```
Emotion control per segment → Script revision (insert tags)
                            → Model migration (v2 → v3)

Natural pause handling → Script revision (SSML → audio tags)
                       → Test ellipsis behavior (may be sufficient without tags)

Segment-level voice direction → Tag persistence verification
                              → Phase boundary tag resets

Reaction sounds → Script revision (identify 5-10 insertion points)
                → Voice testing (does cloned voice handle [sigh]?)

Tone layering → Emotion control (foundation)
              → Experimentation budget (non-deterministic output)

Rhythm variation per phase → Existing speed settings (already differentiated)
                            → Audio tags as overlay ([drawn out])
```

---

## MVP Recommendation

Prioritize:

1. **Model migration (v2 → v3)** — Foundation for all other features. Change `model_id: 'eleven_multilingual_v2'` → `'eleven_turbo_v3'` or `'eleven_multilingual_v3'` in generate-audio.mjs.

2. **Replace SSML breaks with audio tags** — v3 doesn't support `<break>`. Replace `buildTextWithPauses()` logic:
   ```javascript
   // OLD (v2):
   text += ` <break time="2.1s" /> `;

   // NEW (v3):
   text += ` [long pause] `;
   // or preserve ellipsis + let v3 interpret naturally
   ```

3. **Basic emotion tags per phase** — One tag per phase establishes mood:
   - APRESENTACAO: `[calm]`
   - INFERNO: `[grave]` (test if supported, else `[serious]`)
   - PURGATORIO: `[thoughtful]`
   - PARAISO: `[whispers]`
   - DEVOLUCAO: `[warm]` or `[calm]`

4. **PT-BR punctuation review** — Verify script uses:
   - Em-dash (—) for dialog/interruption (already correct in script)
   - Ellipsis (...) for pauses (already correct)
   - Proper accent marks (já, você, Paraíso) — v3 interprets these for pronunciation

Defer:

- **Reaction sounds ([sigh], [gasps])** — Nice-to-have. Requires script revision + testing. Add in Phase 2 if time permits after core migration works.
- **Tone layering ([nervously][whispers])** — Complex. Non-deterministic. High risk of over-directing. Only attempt if basic emotions work perfectly.
- **Cognitive pauses ([hesitates])** — Subtle. May not add enough value vs. simple `[pause]`. Test after core features validated.

---

## PT-BR Specific Considerations

### What Works Well
- **Native PT-BR support:** v3's 70+ language model includes Brazilian Portuguese. No special configuration beyond `language_code: 'pt'`.
- **Accent marks:** Properly rendered in script (já, você, Paraíso, Virgílio) signal correct pronunciation.
- **Ellipsis (...):** PT-BR uses ellipsis for trailing thought/pause. v3 interprets this naturally without explicit `[pause]` tag.
- **Em-dash (—):** Used for direct speech in PT-BR (instead of quotation marks). Script already uses correctly: "— você atravessou."

### Potential Issues
- **Diacritical marks in tag context:** If inserting audio tags mid-sentence near accented words, verify spacing doesn't break pronunciation. Test: `"Você [pause] saiu"` vs `"Você[pause] saiu"`.
- **Contractions:** PT-BR informal speech (cê = você, pra = para). Script uses formal literary style. No issue.
- **European vs Brazilian accent confusion:** Some TTS mixes accents. ElevenLabs v3 with cloned Brazilian voice should avoid this. Validate in first generation.
- **Literary vocabulary:** Words like "elaborado," "metabolizado," "limiar" are formal/rare. v3 should handle via context, but spot-check pronunciation in generated audio.

---

## Quality Validation Strategy

### Objective Metrics
1. **Mean Opinion Score (MOS):** 5-point scale (1=robotic, 5=human-like). Target: 4.0+ average across 25 clips.
   - Measure naturalness, intelligibility, expressiveness
   - Use open-source tools: WVMOS, UTMOS for automated MOS estimation
2. **Pause accuracy:** Compare intended pause duration (script annotations) vs actual silence in waveform. Tolerance: ±300ms.
3. **Emotion tag effectiveness:** A/B test segments with/without tags. Blind listener survey: "Which sounds more [thoughtful/grave/calm]?"

### Subjective Assessment
1. **Native PT-BR speaker review:** Does accent sound Brazilian (not European)? Any mispronunciations?
2. **Literary flow:** Read script aloud while listening to TTS. Does pacing feel natural for poetry/literary prose?
3. **Emotional coherence:** Do phase transitions feel smooth? Does `[calm]` → `[thoughtful]` → `[whispers]` progression support narrative arc?
4. **AI character consistency:** Does voice sound like the same "Virgílio guide" across all 25 clips despite emotion shifts?

### Red Flags
- **Robotic monotone:** If v3 tags don't affect output, cloned voice may be too stable. Lower stability setting (0.75 → 0.65).
- **Tag bleed:** Emotion from previous segment persists incorrectly. Solution: Explicit tag reset at phase boundaries.
- **Over-acting:** Tags make delivery sound theatrical/fake. Solution: Remove excessive tags, trust punctuation + context.
- **Pronunciation errors:** Rare words mispronounced. Solution: Phoneme tags (last resort) or rephrase if possible.

---

## Implementation Notes

### Migration Checklist
- [ ] Update `generate-audio.mjs`: `model_id: 'eleven_multilingual_v2'` → `'eleven_turbo_v3'` (faster) or `'eleven_multilingual_v3'` (highest quality)
- [ ] Refactor `buildTextWithPauses()` function:
  - Remove SSML `<break>` generation
  - Add audio tag insertion based on pauseAfter duration:
    - < 1s: no tag (natural pause)
    - 1-2s: `[short pause]`
    - 2-3s: `[pause]`
    - 3s+: `[long pause]`
- [ ] Insert phase emotion tags at segment[0] of each phase key in SCRIPT
- [ ] Test single file generation before batch (avoid quota waste on errors)
- [ ] Validate output: listen to 3 samples (APRESENTACAO, INFERNO, PARAISO) before generating all 25

### Cost Considerations
- **v3 pricing:** Same as v2 (character-based). Existing $50 budget for 300 visitors still applies.
- **Re-generation cost:** v3 nondeterministic = may need 2-3 takes per segment. Budget 1.5x generation cost vs v2.
- **Testing strategy:** Generate 5 samples first (1 per phase), validate quality, then batch-generate remaining 20.

---

## Sources

### High Confidence (Official Documentation)
- [ElevenLabs v3 Audio Tags Overview](https://elevenlabs.io/blog/v3-audiotags) — Tag syntax, categories, examples
- [ElevenLabs Best Practices for TTS](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) — v3 vs v2 differences, SSML deprecation
- [ElevenLabs SSML and v3 Support](https://help.elevenlabs.io/hc/en-us/articles/24352686926609-Do-pauses-and-SSML-phoneme-tags-work-with-the-API) — "Eleven v3 does not support SSML break tags"
- [ElevenLabs Pause Control Guide](https://help.elevenlabs.io/hc/en-us/articles/13416374683665-How-can-I-add-pauses) — v3 pause alternatives

### Medium Confidence (Third-Party Reviews + Official Sources)
- [ElevenLabs v3 Model Overview](https://elevenlabs.io/blog/eleven-v3) — 70+ languages, emotion control
- [ElevenLabs Models Documentation](https://elevenlabs.io/docs/overview/models) — Model IDs, language support
- [ElevenLabs v3 Quality Assessment 2026](https://hackceleration.com/elevenlabs-review/) — MOS metrics, naturalness testing
- [TTS Benchmark 2025: MOS Validation](https://smallest.ai/blog/tts-benchmark-2025-smallestai-vs-elevenlabs-report) — WVMOS/UTMOS tools

### Low Confidence (WebSearch Only — Validate Before Production)
- [Audio Tag Complete Guide (third-party)](https://audio-generation-plugin.com/elevenlabs-v3/) — Claims 1806+ tags. Unverified count, but categories align with official docs.
- [PT-BR TTS Challenges Discussion](https://community.openai.com/t/text-to-speech-modulating-between-european-and-brazilian-portuguese/829695) — Accent mixing reports (OpenAI TTS, not ElevenLabs). Relevant as general PT-BR concern.
- [Portuguese Punctuation Guide](https://philipebrazuca.com/en/punctuation-marks-in-portuguese/) — Em-dash and ellipsis usage. Standard PT-BR grammar, not TTS-specific.
