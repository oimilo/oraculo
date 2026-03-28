# Phase 24: Rhythm, Inflection & Final Validation - Research

**Researched:** 2026-03-28
**Domain:** TTS script optimization (ElevenLabs v3), Portuguese-Brazilian narration timing, TypeScript validation
**Confidence:** MEDIUM-HIGH

## Summary

Phase 24 polishes the script for production audio generation by optimizing timing, inflection tag density, and validating against duration/quality targets. The script (src/data/script.ts, 480 lines, 156 segments, 2228 words) already has basic timing and inflection structure — this phase refines it to meet SCR-06 requirements.

**Current state:**
- 156 total segments, 40 with inflection tags (25.6% density — BELOW 40% target)
- pauseAfter values: 0, 1200-2800ms range (MEETS variability requirement)
- 2228 words ≈ 17 minutes at 130 WPM (EXCEEDS 10-minute target by 70%)
- Longest sentences: 37 words (approaching 40-word limit)

**Primary recommendation:** Duration is the critical blocker. Must reduce word count by ~900 words (40%) to hit 10-minute target. Timing variation and inflection density already meet requirements.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vitest | 2.1.9 | Test framework | Already used for 31 test files; TypeScript-native |
| @testing-library/react | 16.3.2 | Component testing | Project standard for UI tests |
| TypeScript | 5.7.3 | Type safety | Script validation via interfaces |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Node.js built-in | 22.16.0 | Text analysis | String manipulation, regex, word/sentence counting |
| Bash/grep | System | Quick audits | Rapid pattern matching for initial assessment |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual audit | Automated test | Manual = thorough but slow; automated = fast but requires test writing |
| Word count CLI tools | Custom script | CLI tools work but add external dependency; custom script uses existing Node.js |

**Installation:**
```bash
# All dependencies already installed
npm list vitest @testing-library/react
```

**Version verification:** Confirmed via package.json (2026-03-28).

---

## Architecture Patterns

### Recommended Validation Script Structure
```
scripts/
├── validate-script.ts   # Main validator — duration, timing, inflection
├── analyze-timing.ts    # Pause variation analysis
└── word-count.ts        # Duration estimation by section
```

### Pattern 1: TypeScript Script Validation
**What:** Programmatic validation using TypeScript to analyze script structure
**When to use:** When requirements are quantifiable (word count, tag density, pause ranges)
**Example:**
```typescript
// Validate inflection density
const allSegments = Object.values(SCRIPT).flat();
const withInflection = allSegments.filter(s => s.inflection?.length);
const density = withInflection.length / allSegments.length;
expect(density).toBeLessThanOrEqual(0.40); // ≤40%
```

### Pattern 2: Pause Variation Analysis
**What:** Statistical analysis of pauseAfter values to ensure non-uniform timing
**When to use:** To verify "breathing rhythm not metronome" requirement
**Example:**
```typescript
// Calculate coefficient of variation (CV)
const pauses = allSegments.map(s => s.pauseAfter).filter(p => p > 0);
const mean = pauses.reduce((a,b) => a+b) / pauses.length;
const stdDev = Math.sqrt(pauses.map(p => (p-mean)**2).reduce((a,b) => a+b) / pauses.length);
const cv = stdDev / mean; // Should be > 0.15 for good variation
```

### Pattern 3: Duration Estimation by WPM
**What:** Calculate estimated duration using language-specific WPM rate
**When to use:** To validate total experience duration against target
**Example:**
```typescript
const PT_BR_NARRATION_WPM = 130; // Conservative for narrative
const totalWords = allSegments.reduce((sum, s) =>
  sum + s.text.split(/\s+/).length, 0
);
const baseMinutes = totalWords / PT_BR_NARRATION_WPM;
const pauseMinutes = pauses.reduce((a,b) => a+b, 0) / 60000; // ms to min
const totalMinutes = baseMinutes + pauseMinutes;
```

### Anti-Patterns to Avoid
- **Uniform timing:** Using same pauseAfter across sections kills emotional pacing
- **Inflection tag overload:** >1 tag per segment or >40% density causes instability (ElevenLabs v3 limitation)
- **Ignoring pauses in duration calc:** pauseAfter adds ~2-3 minutes to total experience
- **English WPM for Portuguese:** PT-BR is faster (160-180 WPM conversational) but narration is slower (~130 WPM)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Script duration estimation | Custom WPM calculator with complex heuristics | Simple formula: `(words / 130) + (sum(pauses) / 60000)` | Over-engineering adds no value; formula is industry standard |
| Portuguese language detection | NLP library for language ID | Manual verification (script already PT-BR) | Overkill for single-language project |
| Sentence boundary detection | Complex regex or ML model | Split on `.?!` with basic lookahead | Portuguese punctuation is regular enough |

**Key insight:** Script validation is arithmetic and pattern matching. Complexity comes from defining correct thresholds (130 WPM, 40% inflection, 1200-2800ms pauses), not from implementation.

---

## Common Pitfalls

### Pitfall 1: Underestimating Pause Contribution to Duration
**What goes wrong:** Calculate duration using only word count, ignore pauseAfter values, result is 30-40% shorter than actual playback
**Why it happens:** Pauses feel "free" but add significant time (current script has ~5 minutes of pauses)
**How to avoid:** Always sum `pauseAfter` values and convert to minutes: `sum(pauses) / 60000`
**Warning signs:** Manual playback test feels much longer than word-count estimate

### Pitfall 2: Treating Inflection Tag Density as Per-Section
**What goes wrong:** Ensure each section has <40% density but miss that OVERALL density matters for ElevenLabs API
**Why it happens:** Requirement says "≤40% dos segmentos" — sounds global but some interpret as per-section
**How to avoid:** Calculate global density across ALL segments, not section-by-section
**Warning signs:** Some sections have 0% (TIMEOUTS), others 60% (PARAISO) — average is what matters

### Pitfall 3: False Precision in WPM Rates
**What goes wrong:** Use highly specific WPM (e.g., 137.4) based on research, but actual narration varies by emotion/pacing
**Why it happens:** Research reports averages; TTS with inflection tags varies by ±20%
**How to avoid:** Use conservative estimate (130 WPM for PT-BR narration), validate with actual generated audio
**Warning signs:** Generated audio duration differs from estimate by >15%

### Pitfall 4: Ignoring Sentence Length Edge Cases
**What goes wrong:** Focus on longest sentence (37 words) but miss that 3-4 sentences >35 words also harm readability
**Why it happens:** Requirement says "<40 palavras" — binary pass/fail thinking
**How to avoid:** Aim for 25-30 word average, flag any sentence >30 words for review
**Warning signs:** TTS output has unnatural phrasing or runs out of breath mid-sentence

---

## Code Examples

Verified patterns from existing test infrastructure:

### Word Count and Sentence Length Validation
```typescript
// Source: Adapted from src/data/__tests__/script-v3.test.ts pattern
import { SCRIPT } from '@/data/script';

function validateSentenceLengths() {
  const allSegments = Object.values(SCRIPT).flat();
  const longSentences: Array<{key: string, words: number, text: string}> = [];

  allSegments.forEach(seg => {
    const words = seg.text.split(/\s+/).filter(w => w.length > 0).length;
    if (words > 40) {
      longSentences.push({ key: 'segment', words, text: seg.text.substring(0, 60) });
    }
  });

  return {
    maxWords: Math.max(...allSegments.map(s => s.text.split(/\s+/).length)),
    longSentences,
    pass: longSentences.length === 0
  };
}
```

### Inflection Density Check
```typescript
// Source: Adapted from script-v3.test.ts line 244-278
function validateInflectionDensity() {
  const allSegments = Object.values(SCRIPT).flat();
  const withInflection = allSegments.filter(s => s.inflection && s.inflection.length > 0);
  const density = withInflection.length / allSegments.length;

  // Check no segment has >1 inflection tag
  const multiTag = allSegments.filter(s => s.inflection && s.inflection.length > 1);

  return {
    totalSegments: allSegments.length,
    withInflection: withInflection.length,
    density: (density * 100).toFixed(1) + '%',
    passRate: density <= 0.40,
    passMaxTags: multiTag.length === 0,
    multiTagViolations: multiTag
  };
}
```

### Pause Variation Analysis
```typescript
// Source: New pattern based on SCR-06(a) requirement
function validatePauseVariation() {
  const allSegments = Object.values(SCRIPT).flat();
  const pauses = allSegments
    .map(s => s.pauseAfter)
    .filter((p): p is number => p !== undefined && p > 0);

  const uniquePauses = [...new Set(pauses)].sort((a,b) => a-b);
  const min = Math.min(...pauses);
  const max = Math.max(...pauses);

  // Coefficient of variation (CV = stdDev / mean)
  const mean = pauses.reduce((a,b) => a+b) / pauses.length;
  const variance = pauses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pauses.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  return {
    range: `${min}-${max}ms`,
    uniqueValues: uniquePauses,
    coefficientOfVariation: cv.toFixed(2),
    passRange: min >= 1200 && max <= 2800,
    passVariation: cv > 0.15 // Good variation if CV > 15%
  };
}
```

### Duration Estimation
```typescript
// Source: Industry standard WPM formula
function estimateDuration() {
  const PT_BR_NARRATION_WPM = 130;
  const allSegments = Object.values(SCRIPT).flat();

  const totalWords = allSegments.reduce((sum, s) =>
    sum + s.text.split(/\s+/).filter(w => w.length > 0).length,
    0
  );

  const totalPauseMs = allSegments.reduce((sum, s) =>
    sum + (s.pauseAfter || 0),
    0
  );

  const speechMinutes = totalWords / PT_BR_NARRATION_WPM;
  const pauseMinutes = totalPauseMs / 60000;
  const totalMinutes = speechMinutes + pauseMinutes;

  return {
    totalWords,
    speechMinutes: speechMinutes.toFixed(1),
    pauseMinutes: pauseMinutes.toFixed(1),
    totalMinutes: totalMinutes.toFixed(1),
    passTarget: totalMinutes <= 10
  };
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SSML `<break>` tags | ElevenLabs v3 audio tags `[pause]` | v3 model (2024) | More natural pauses, integrated with inflection |
| Fixed stability 0.65-0.80 | Variable 0.40-0.70 (Creative/Natural modes) | eleven_v3 launch | Tag responsiveness improved |
| Unlimited tag density | Sparse tags (1 per segment, ~30-40%) | v3 best practices | Prevents audio instability |
| English WPM assumptions | Language-specific rates | Always varied | PT-BR at 130 WPM narration vs 150 English |

**Deprecated/outdated:**
- `speaker_boost` and `speed` params: Not supported in eleven_v3 model
- PVC (Professional Voice Clone): Not optimized for v3 tags; IVC (Instant Voice Clone) required
- Dense tag usage: v2 tolerated 3-4 tags per phrase; v3 becomes unstable >1 tag per segment

---

## Open Questions

1. **What is the exact tolerance for 10-minute target?**
   - What we know: Requirement says "≤10 minutos (~130 wpm PT-BR)"
   - What's unclear: Is 10:00 hard limit or does 10:30 pass? Does pauseAfter count?
   - Recommendation: Target 9:30 to leave buffer for generation variability

2. **Should inflection density be uniform across realms?**
   - What we know: Global density must be ≤40%
   - What's unclear: Can PARAISO have 50% if INFERNO has 20%, averaging to 35%?
   - Recommendation: Allow per-realm variation as long as global ≤40%; emotional weight justifies it

3. **Do FALLBACK/TIMEOUT segments count toward limits?**
   - What we know: They're part of SCRIPT object, have segments
   - What's unclear: User might only hear 1-2 of 12 fallbacks/timeouts in a session
   - Recommendation: Include in global metrics (they're still generated audio)

---

## Environment Availability

**Skip condition met:** Phase 24 has no external dependencies beyond existing Node.js/npm/TypeScript toolchain. All validation can be done with built-in JavaScript/TypeScript string manipulation and existing vitest framework. No new tools, services, or runtimes required.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 2.1.9 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts (existing) |
| Quick run command | `npm test src/data/__tests__/script-v3.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCR-06(a) | pauseAfter varia 1200-2800ms (não uniforme) | unit | `npm test -- --grep "pause variation"` | ❌ Wave 0 |
| SCR-06(b) | Inflection tags em ≤40% dos segmentos | unit | `npm test -- --grep "inflection density"` | ✅ (script-v3.test.ts:244) |
| SCR-06(c) | Nenhum segmento >1 inflection tag | unit | `npm test -- --grep "no segment has more than 1"` | ✅ (script-v3.test.ts:260) |
| SCR-06(d) | Experiência completa ≤10 minutos | unit | `npm test -- --grep "duration"` | ❌ Wave 0 |
| Implicit | Nenhuma frase >40 palavras | unit | `npm test -- --grep "sentence length"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test src/data/__tests__/script-v3.test.ts -x` (fast validation)
- **Per wave merge:** `npm test` (full suite including machine/component tests)
- **Phase gate:** Full suite green + manual script read-through before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/data/__tests__/script-validation.test.ts` — covers SCR-06(a), SCR-06(d), sentence length
- [ ] Update `script-v3.test.ts` — add duration and pause variation tests to existing suite
- [ ] `scripts/validate-script.ts` — CLI tool for quick validation during editing (optional but useful)

---

## Sources

### Primary (HIGH confidence)
- [ElevenLabs v3 Audio Tags: More control over AI Voices](https://elevenlabs.io/blog/v3-audiotags) - Tag types and usage
- [ElevenLabs Best Practices Documentation](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices) - Stability settings, tag density warnings
- Package.json and vitest.config.ts (2026-03-28) - Confirmed framework versions

### Secondary (MEDIUM confidence)
- [Voices.com: Languages in USA Speaking Rates](https://www.voices.com/blog/languages-in-usa-speaking-rates-per-minute/) - Portuguese at 181 WPM average
- [SciELO: Brazilian vs European Portuguese Fluency](https://www.scielo.br/j/codas/a/qmx9ZHvdqBV7TRLpnxSpGZJ/?lang=en) - Brazilian Portuguese slower than European
- [Narration Box: Control Pacing Pauses and Emotion](https://narrationbox.com/blog/how-to-control-pacing-pauses-emotion-ai-voiceover) - Pause timing for emotional weight
- [Script Timer Tools](https://script-timer.com/) - Industry standard WPM calculators

### Tertiary (LOW confidence)
- Generic TTS sentence length recommendations (15-18 words) - Not Portuguese-specific, not verified for v3

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All tools already in package.json, versions confirmed
- Architecture: HIGH - Patterns adapted from existing test suite (script-v3.test.ts)
- Duration estimation: MEDIUM - WPM rates vary by source (130-181); conservative 130 chosen
- ElevenLabs v3 tag density: MEDIUM - Official docs don't specify exact "40%" but warn against overuse
- Pitfalls: MEDIUM-HIGH - Based on common TTS/narration issues but not Phase 24 specific

**Research date:** 2026-03-28
**Valid until:** 2026-04-30 (30 days; ElevenLabs v3 API stable)

---

## Critical Finding: Duration Blocker

**ALERT:** Current script is **2228 words**, estimating **~17 minutes** with pauses. Requirement is **≤10 minutes**.

**Math:**
- Speech: 2228 words ÷ 130 WPM = 17.1 minutes
- Pauses: Sum of pauseAfter ≈ 240 seconds = 4 minutes
- **Total: ~21 minutes** (includes pauses)

**To hit 10 minutes:**
- Target: 1300 words (10 min × 130 WPM)
- **Must cut: ~930 words (42% reduction)**

This is a **CONTENT** issue, not a validation issue. Phase 24 can validate the constraints, but hitting 10 minutes requires aggressive editing from prior phases (21-23) OR descoping sections.

**Options:**
1. Edit existing content to be more concise (preserve all sections)
2. Remove 1-2 devoluções (8 archetypes may be excessive)
3. Shorten SETUP segments (currently 3-5 per question)
4. Revise requirement to 15 minutes (more realistic for depth achieved)

This must be addressed in Wave 0 or Plan refinement.
