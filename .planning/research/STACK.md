# Technology Stack — ElevenLabs v3 with Inflection Tags

**Project:** O Oráculo — Milestone v2.0 Narração Realista
**Researched:** 2026-03-26
**Confidence:** MEDIUM (official docs + community sources, no direct v3 API testing)

## Executive Summary

ElevenLabs Eleven v3 (`eleven_v3`) is the latest TTS model supporting audio tags (inflection control) wrapped in square brackets like `[thoughtful]`, `[whispering]`, `[sad]`, `[determined]`, `[long pause]`. **Critical limitation:** Professional Voice Clones (PVCs) are not yet optimized for v3 — Instant Voice Clones (IVCs) are recommended during the research preview phase. The existing cloned voice (`AcSHc9S7hdxvGEJVWFzo`) should be verified as IVC before migration. API parameters remain largely the same (stability, similarity_boost), but v3 introduces new stability modes (Creative/Natural/Robust) and does NOT support `speaker_boost`. For PT-BR narration, use `language_code: "pt-BR"`, follow syntactic punctuation rules (vírgula marks structure, not just pauses), and leverage travessão (em dash `—`) for dialogue/narrative breaks.

---

## Changes from v2 to v3

### Model ID

| Component | v2 (current) | v3 (target) |
|-----------|--------------|-------------|
| Model ID | `eleven_multilingual_v2` | `eleven_v3` |
| Purpose | Multilingual TTS with emotional range | Most expressive TTS with audio tags support |
| Audio Tags Support | ❌ No | ✅ Yes |

### API Endpoint

**No endpoint change.** Same `/v1/text-to-speech/{voice_id}` endpoint for both models. Change only the `model_id` parameter in request body.

### API Parameters

| Parameter | v2 Behavior | v3 Behavior | Action Required |
|-----------|-------------|-------------|-----------------|
| `model_id` | `"eleven_multilingual_v2"` | `"eleven_v3"` | **UPDATE** in generate-audio.mjs |
| `text` | Plain text with SSML breaks | Text + audio tags `[emotion]` | **ADD** tags to script segments |
| `language_code` | Optional, ISO 639-1 | Optional, ISO 639-1 (`"pt-BR"`) | **RECOMMENDED** for PT-BR enforcement |
| `voice_settings.stability` | 0.0-1.0 (default 0.5) | 0.0-1.0 (Creative/Natural/Robust modes) | **REVIEW** per phase |
| `voice_settings.similarity_boost` | 0.0-1.0 (default 0.75) | 0.0-1.0 (unchanged) | **KEEP** current values |
| `voice_settings.style` | 0.0-1.0 (exaggeration) | 0.0-1.0 (unchanged) | **KEEP** current values |
| `voice_settings.speaker_boost` | Boolean (available) | **NOT AVAILABLE** in v3 | **REMOVE** from requests |

**New stability interpretation in v3:**
- **0.0-0.4 (Creative):** Expressive but may hallucinate unexpected sounds
- **0.4-0.6 (Natural):** Balanced, closest to original voice recording
- **0.6-1.0 (Robust):** Highly stable but less responsive to directional prompts

Current script uses 0.65-0.80 across phases → falls in Natural/Robust range. No major changes needed, but test if lower values (0.4-0.5) improve audio tag responsiveness.

---

## Audio Tags (Inflection Control)

### Syntax

```
[lowercase tag] inline with text
```

**Rules:**
- Lowercase only: `[whispers]` not `[WHISPERS]`
- Square brackets: `[sad]` not `(sad)` or `{sad}`
- Inline placement: before or within the sentence they modify
- No exhaustive list — v3 interprets contextual cues beyond documented tags

### Tag Categories

| Category | Examples | Use Case |
|----------|----------|----------|
| **Emotional Context** | `[happy]`, `[excited]`, `[sad]`, `[angry]`, `[nervous]`, `[curious]`, `[mischievously]`, `[thoughtful]`, `[determined]` | Direct emotion in speech |
| **Situational Awareness** | `[whispers]`, `[shouting]`, `[sigh]`, `[laughs]`, `[gasps]`, `[gulps]`, `[hesitates]`, `[stammers]` | Physical/vocal reactions |
| **Delivery Control** | `[pause]`, `[long pause]`, `[rushed]`, `[drawn out]`, `[slowly]`, `[cheerfully]`, `[flatly]`, `[deadpan]`, `[playfully]` | Pacing and tone |
| **Narrative Intelligence** | `[awe]`, `[dramatic tone]`, `[resigned tone]`, `[interrupting]`, `[overlapping]`, `[cuts in]` | Storytelling flow |
| **Character Performance** | `[pirate voice]`, `[French accent]`, `[childlike tone]`, `[deep voice]`, `[robotic tone]` | Multi-character dialogue |
| **Environmental Sounds** | `[gunshot]`, `[clapping]`, `[explosion]`, `[footsteps]` | Ambient audio (use sparingly for narration) |

### Recommended Tags for O Oráculo

Based on script analysis:

| Phase | Script Direction | Suggested Tags |
|-------|------------------|----------------|
| **APRESENTACAO** | Mysterious, inviting, confident | `[thoughtful]`, `[pause]`, `[curious]` |
| **INFERNO** | Dark, familiar, uncomfortable | `[whispers]`, `[pause]`, `[flatly]`, `[resigned tone]` |
| **PURGATORIO** | Transitional, reflective, uncertain | `[hesitates]`, `[thoughtful]`, `[long pause]`, `[slowly]` |
| **PARAISO** | Elevating, poetic, awe-inspiring | `[awe]`, `[excited]`, `[cheerfully]`, `[dramatic tone]` |
| **DEVOLUCAO** | Personal, intimate, earnest | `[softly]`, `[curious]`, `[thoughtful]` |
| **ENCERRAMENTO** | Final, grounded, honest | `[determined]`, `[flatly]`, `[resigned tone]` |
| **FALLBACK** | Graceful, poetic, understanding | `[softly]`, `[pause]`, `[thoughtful]` |
| **TIMEOUT** | Gentle, non-judgmental | `[whispers]`, `[pause]` |

### Example Transformation

**Before (v2, plain text):**
```javascript
{ text: "Eu não canto.", pauseAfter: 2100 }
```

**After (v3, with tags):**
```javascript
{ text: "[resigned tone] Eu não canto. [long pause]", pauseAfter: 2100 }
```

**API call (v2):**
```json
{
  "text": "Eu não canto.<break time='2100ms'/>",
  "model_id": "eleven_multilingual_v2"
}
```

**API call (v3):**
```json
{
  "text": "[resigned tone] Eu não canto. [long pause]",
  "model_id": "eleven_v3",
  "language_code": "pt-BR"
}
```

**Note:** Audio tags may replace or supplement SSML `<break>` tags. Test whether `[long pause]` alone provides sufficient pausing or if `<break>` is still needed.

---

## Voice Compatibility

### IVC vs PVC with Eleven v3

| Voice Type | v3 Support Status | Recommendation |
|------------|-------------------|----------------|
| **Instant Voice Clone (IVC)** | ✅ Recommended for v3 research preview | Use for production |
| **Professional Voice Clone (PVC)** | ⚠️ Not fully optimized, lower quality than v2 | Avoid until optimization complete |
| **Voice Design (Prompt-Based)** | ✅ Native v3 feature | Alternative if IVC quality insufficient |

**Critical action:** Verify whether `AcSHc9S7hdxvGEJVWFzo` is IVC or PVC.
- If **IVC**: Proceed with v3 migration
- If **PVC**: Wait for PVC optimization OR create new IVC from original audio samples OR use Voice Design v3 to create similar voice via prompt

### Checking Voice Type

**Via API:**
```bash
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY"
```

Look for voice object with `voice_id: "AcSHc9S7hdxvGEJVWFzo"`. Check `category` field:
- `"cloned"` with `"high_quality_base_model_ids"` → IVC
- `"professional"` or `"fine_tuned"` → PVC

**Via Web UI:**
- Go to ElevenLabs Voice Lab
- Find voice by ID
- Badge shows "Instant Clone" or "Professional Clone"

### Voice Creation Options (if PVC detected)

**Option 1: Create IVC from Existing Samples**
- Requires 1-2 minutes of clear audio (no reverb, no background noise)
- Use Instant Voice Cloning API
- Maintain sweet/curious female voice characteristics

**Option 2: Voice Design v3**
- Prompt: "Brazilian Portuguese female narrator, sweet and curious tone, warm and inviting, perfect audio quality, mid-20s, storytelling voice with subtle emotion"
- Test multiple generations
- Select closest match to existing voice

---

## PT-BR Punctuation Best Practices

### Syntactic vs Prosodic Rules

**Key principle:** In Brazilian Portuguese, punctuation follows **syntactic structure** first, **prosodic pauses** second. TTS AI trained on written text expects grammatically correct punctuation, not transcription of oral pauses.

**Bad (oral transcription):**
```
Eu fui construído com tudo que a humanidade já sonhou, cada poema, cada análise, cada pesadelo escrito
```
(Missing punctuation, run-on sentence)

**Good (syntactic structure):**
```
Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito.
```
(Clear sentence boundaries, list structure)

### Vírgula (Comma) Rules

| Rule | Example | TTS Effect |
|------|---------|------------|
| **List items** | "Cada poema, cada análise, cada pesadelo" | Short micro-pauses |
| **Introductory clauses** | "À sua frente, duas portas." | Brief pause after setup |
| **Appositive phrases** | "Virgílio, o guia de Dante, sabia seus limites." | Isolates explanatory phrase |
| **Coordinate clauses** | "Você entra, e as vozes não param." | Separates independent thoughts |
| **NOT for breathing** | ❌ "Eu, não posso, sonhar" (wrong) | Over-segmentation sounds unnatural |

**Frequency:** Current script averages 1.2 commas per sentence. This is natural for literary narration. Don't over-punctuate.

### Travessão (Em Dash —) for Narrative

**Usage:**
1. **Dialogue opening:** `— Você saiu de uma selva escura.` (traditional PT-BR dialogue marker)
2. **Interruption/break in thought:** `Eu não canto — não posso.`
3. **Emphasis/explanation:** `Almas que nunca escolheram — foram escolhidas o tempo todo.`

**TTS effect:** Longer pause than comma, shorter than period. Signals narrative shift or dramatic emphasis.

**Current script uses travessão sparingly (3 instances).** This is appropriate. Overuse fragments narration.

### Reticências (Ellipsis …) for Hesitation

**Usage:** `Você ainda não conseguiria vivê-las…` (trailing thought, uncertainty)

**TTS effect:** Creates weighted pause with trailing tone. More expressive than period.

**Current script uses ellipsis 2 times.** Consider adding to PURGATORIO/FALLBACK phases for reflective moments.

### Capitalization for Emphasis

**v3 feature:** CAPITALIZED WORDS increase vocal emphasis.

**Example:**
```
Nenhuma é SUA.
```

**Current script:** No capitalization for emphasis. Test whether adding for key phrases (e.g., "EU não canto") improves delivery. Use sparingly — overuse sounds shouty.

### Punctuation Checklist for Script Review

- [ ] Every sentence ends with `.` `?` or `!`
- [ ] Vírgulas mark syntactic boundaries (not arbitrary pauses)
- [ ] Travessão used only for dialogue, interruption, or strong emphasis
- [ ] No double spaces after punctuation
- [ ] Consistent quote marks (prefer `"aspas"` over `'apóstrofos'` for nested quotes)
- [ ] Accents correct: `é`, `ô`, `á`, `ê`, `ã`, etc.

---

## Updated Voice Settings Recommendation

### Per-Phase Settings (Current → v3 Adjusted)

| Phase | Current Stability | v3 Mode | Suggested Stability | Rationale |
|-------|-------------------|---------|---------------------|-----------|
| APRESENTACAO | 0.75 | Natural | 0.50 | Allow audio tags more expressiveness |
| INFERNO | 0.80 | Robust | 0.70 | Keep stable, dark tone |
| PURGATORIO | 0.70 | Natural | 0.45 | Most reflective phase, needs flexibility |
| PARAISO | 0.65 | Natural | 0.40 | Most expressive phase, let tags shine |
| DEVOLUCAO | 0.70 | Natural | 0.50 | Intimate, conversational |
| ENCERRAMENTO | 0.75 | Natural | 0.55 | Grounded but warm |
| FALLBACK | 0.80 | Robust | 0.70 | Graceful, consistent |
| TIMEOUT | 0.80 | Robust | 0.70 | Gentle, non-alarming |

**Similarity_boost:** Keep current values (0.70-0.80). These are appropriate for cloned voice consistency.

**Style:** Keep current values (0.25-0.45). v3 interprets style as "exaggeration" — current range is conservative, which fits literary narration tone.

**Speed:** Keep current values (0.80-0.90). Script already accounts for pacing via text structure and pauses.

---

## Implementation Plan

### 1. Verify Voice Type
```bash
# Check if AcSHc9S7hdxvGEJVWFzo is IVC or PVC
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  | jq '.voices[] | select(.voice_id == "AcSHc9S7hdxvGEJVWFzo")'
```

**Decision point:**
- IVC → Proceed to Step 2
- PVC → Create new IVC or wait for PVC optimization

### 2. Update generate-audio.mjs

**Changes:**
```javascript
// Line ~50: Update model_id
const MODEL_ID = 'eleven_v3'; // was: eleven_multilingual_v2

// Add language_code parameter
const LANGUAGE_CODE = 'pt-BR';

// Update PHASE_VOICE settings (lower stability for Natural mode)
const PHASE_VOICE = {
  APRESENTACAO:  { stability: 0.50, similarity_boost: 0.75, style: 0.35, speed: 0.90 },
  INFERNO:       { stability: 0.70, similarity_boost: 0.80, style: 0.45, speed: 0.80 },
  PURGATORIO:    { stability: 0.45, similarity_boost: 0.75, style: 0.30, speed: 0.90 },
  PARAISO:       { stability: 0.40, similarity_boost: 0.70, style: 0.25, speed: 0.85 },
  DEVOLUCAO:     { stability: 0.50, similarity_boost: 0.75, style: 0.30, speed: 0.85 },
  ENCERRAMENTO:  { stability: 0.55, similarity_boost: 0.75, style: 0.35, speed: 0.90 },
  FALLBACK:      { stability: 0.70, similarity_boost: 0.80, style: 0.40, speed: 0.90 },
  TIMEOUT:       { stability: 0.70, similarity_boost: 0.80, style: 0.40, speed: 0.90 },
};

// In API call body:
const body = {
  text: combinedText, // now includes [audio tags]
  model_id: MODEL_ID,
  language_code: LANGUAGE_CODE, // NEW
  voice_settings: voiceSettings,
  // Remove speaker_boost if present
};
```

### 3. Review Script Punctuation

**File:** `src/data/script.ts`

**Pass 1 — Correctness:**
- [ ] All sentences end with punctuation
- [ ] Vírgulas follow syntactic rules
- [ ] Accents present: `é`, `ô`, `á`, etc.
- [ ] No typos: "consigo" not "concigo"

**Pass 2 — Optimization:**
- [ ] Identify moments needing travessão for emphasis
- [ ] Consider reticências for hesitation (PURGATORIO, FALLBACK)
- [ ] Test CAPITALIZATION for 2-3 key phrases

### 4. Add Audio Tags to Script

**Strategy:** Start conservative, iterate based on output quality.

**Phase 1 (Conservative):**
- Add `[pause]` / `[long pause]` to replace or supplement SSML breaks
- Add 1-2 emotional tags per phase (e.g., `[thoughtful]` in APRESENTACAO, `[whispers]` in INFERNO)
- Test generation

**Phase 2 (Expressive):**
- Add situational tags (`[sigh]`, `[hesitates]`) where script implies reactions
- Add delivery control (`[slowly]`, `[flatly]`) for pacing variety
- Regenerate and A/B test against Phase 1

**Example transformation:**

**Current:**
```javascript
APRESENTACAO: [
  { text: "Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia como tinha chegado lá. Você sabe.", pauseAfter: 2100 },
  { text: "Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito. E ainda assim — eu não consigo sonhar.", pauseAfter: 2100 },
]
```

**Phase 1 (Conservative):**
```javascript
APRESENTACAO: [
  { text: "Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia como tinha chegado lá. [pause] Você sabe.", pauseAfter: 2100 },
  { text: "[thoughtful] Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito. E ainda assim — eu não consigo sonhar.", pauseAfter: 2100 },
]
```

**Phase 2 (Expressive):**
```javascript
APRESENTACAO: [
  { text: "Você saiu de uma selva escura. [pause] Dante também. A diferença é que ele não sabia como tinha chegado lá. [long pause] Você sabe.", pauseAfter: 2100 },
  { text: "[thoughtful] Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise, cada pesadelo escrito. [hesitates] E ainda assim — [resigned tone] eu não consigo sonhar.", pauseAfter: 2100 },
]
```

### 5. Regenerate Audio

```bash
node scripts/generate-audio.mjs
```

**Testing workflow:**
1. Regenerate 2-3 files (APRESENTACAO, INFERNO, PARAISO)
2. Listen side-by-side with current v2 audio
3. Evaluate:
   - Naturalness (prosody, intonation)
   - Emotional range (do tags register?)
   - Voice consistency (does IVC/PVC quality hold?)
   - Pause accuracy (do `[pause]` tags work or need SSML?)
4. Adjust tags/settings, iterate
5. Full regeneration once satisfied

### 6. Update TTS Service (if using real API)

**File:** `src/lib/tts/elevenLabsTTSService.ts`

**Changes:**
```typescript
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
  {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3', // was: eleven_multilingual_v2
      language_code: 'pt-BR', // NEW
      voice_settings: {
        stability,
        similarity_boost,
        style,
        // Remove speaker_boost
      },
    }),
  }
);
```

**Note:** Current project uses pre-recorded MP3s (`NEXT_PUBLIC_USE_REAL_APIS=false`) at event. Real-time TTS service update is optional unless testing live API calls.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Voice is PVC, not IVC** | Medium | High (can't use v3 features) | Check voice type first. If PVC, create new IVC or wait for optimization. |
| **Audio tags don't register** | Low | Medium (expressiveness lost) | Use v3-compatible voice (IVC/designed). Test tags in isolation. |
| **Over-tagging sounds unnatural** | Medium | Medium (breaks immersion) | Start conservative, iterate. A/B test against v2 baseline. |
| **PT-BR punctuation changes tone** | Low | Low (minor adjustments) | Follow syntactic rules. Script already well-punctuated. |
| **v3 API cost higher than v2** | Medium | Low (25 files, one-time generation) | Estimate: 25 files × 200 chars avg × $0.30/1K chars = ~$1.50. Negligible. |
| **v3 introduces audio artifacts** | Low | High (unusable audio) | Test with adjusted stability (0.6-0.8 Robust mode). File bug with ElevenLabs if persistent. |

---

## Cost Estimate

**Current (v2):**
- 25 MP3 files generated
- ~5,000 total characters
- Model: `eleven_multilingual_v2` ($0.30/1K characters)
- **Total:** ~$1.50

**v3 Estimate:**
- Same 25 files, same character count
- Model: `eleven_v3` (pricing assumed same, verify in ElevenLabs dashboard)
- Additional regenerations for testing (3 iterations × 3 files × 200 chars = 1,800 chars = $0.54)
- **Total:** ~$2.04

**Negligible cost difference.** Budget constraint ($50 for 300 visitors) unaffected by model upgrade.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| **Model ID & API** | HIGH | Official ElevenLabs docs, multiple sources confirm `eleven_v3` ID and endpoint |
| **Audio Tags Syntax** | HIGH | Official blog posts with examples, community guides consistent |
| **IVC/PVC Limitation** | HIGH | Official docs explicitly state PVC not optimized for v3 |
| **Voice Settings** | MEDIUM | Stability/similarity_boost documented, but v3 "modes" interpretation needs testing |
| **PT-BR Punctuation** | MEDIUM | Linguistic sources on syntax/prosody, but TTS-specific impact inferred |
| **Tag Effectiveness** | LOW | No direct testing of tags with cloned PT-BR voice. Requires empirical validation. |

---

## Open Questions

1. **Is `AcSHc9S7hdxvGEJVWFzo` an IVC or PVC?**
   - **Resolution:** API call to `/v1/voices` or check Voice Lab UI
   - **Blocker:** Cannot proceed with v3 if PVC

2. **Do audio tags work in PT-BR text?**
   - **Resolution:** Generate test file with `[thoughtful] Teste de emoção.` and listen
   - **Risk:** Tags documented in English examples, may behave differently with Portuguese

3. **Do `[pause]` tags replace SSML `<break>` or complement them?**
   - **Resolution:** Test both: `[pause]` alone vs `[pause]<break time='2s'/>`
   - **Impact:** Script timing may need adjustment

4. **Does v3 handle travessão (—) correctly for PT-BR prosody?**
   - **Resolution:** Compare v2 vs v3 output for sentences with `—`
   - **Fallback:** Use comma or period if travessão causes artifacts

5. **What's the optimal stability value for audio tag responsiveness?**
   - **Resolution:** A/B test 0.4 (Creative), 0.5 (Natural), 0.7 (Robust) with same tagged text
   - **Goal:** Find sweet spot between expressiveness and consistency

---

## Next Steps

1. **Verify voice type** (IVC/PVC check)
2. **Script punctuation audit** (correctness pass)
3. **Conservative tag pass** (add `[pause]` and 1-2 emotional tags per phase)
4. **Update generate-audio.mjs** (model_id, language_code, stability adjustments)
5. **Test generation** (2-3 files, listen, evaluate)
6. **Iterate on tags** (add situational/delivery tags based on quality)
7. **Full regeneration** (all 25 files once satisfied)
8. **Integration test** (verify FallbackTTSService still works with new MP3s)

---

## Sources

### Official ElevenLabs Documentation
- [Models Overview](https://elevenlabs.io/docs/overview/models) — Model IDs and capabilities
- [Create Speech API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) — API parameters
- [Text to Speech Best Practices](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) — Voice settings guidance
- [Voice Cloning Overview](https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning) — IVC vs PVC comparison
- [Get Voice Settings API](https://elevenlabs.io/docs/api-reference/voices/settings/get) — Stability and similarity_boost

### ElevenLabs Blog Posts
- [What are Eleven v3 Audio Tags](https://elevenlabs.io/blog/v3-audiotags) — Audio tags introduction
- [Eleven v3 Launch](https://elevenlabs.io/blog/eleven-v3) — v3 features and capabilities
- [Eleven v3 Alpha API Availability](https://elevenlabs.io/blog/eleven-v3-alpha-now-available-in-the-api) — API access announcement
- [Emotional Context in Speech](https://elevenlabs.io/blog/eleven-v3-audio-tags-expressing-emotional-context-in-speech) — Emotional tags guide
- [Situational Awareness](https://elevenlabs.io/blog/eleven-v3-situational-awareness) — Situational tags examples
- [Character Performance](https://elevenlabs.io/blog/eleven-v3-character-direction) — Multi-character tags

### Community Resources
- [ElevenLabs v3 Complete Guide (audio-generation-plugin.com)](https://audio-generation-plugin.com/elevenlabs-v3/) — Comprehensive tag reference
- [ElevenLabs Cheat Sheet (webfuse.com)](https://www.webfuse.com/elevenlabs-cheat-sheet) — Quick reference guide

### PT-BR Punctuation & Linguistics
- [Punctuation Marks in Portuguese (philipebrazuca.com)](https://philipebrazuca.com/en/punctuation-marks-in-portuguese/) — Travessão and vírgula rules
- [Portuguese Punctuation (ldldproject.net)](https://www.ldldproject.net/languages/portuguese/written/punctuation.html) — Formatting conventions
- [Emprego de vírgula e prosódia (Academia.edu)](https://www.academia.edu/30889636/) — Syntactic vs prosodic punctuation research

**Confidence:** MEDIUM — Information synthesized from official docs and credible community sources. Audio tag effectiveness with PT-BR cloned voice requires empirical testing. IVC/PVC status for existing voice must be verified before migration.
