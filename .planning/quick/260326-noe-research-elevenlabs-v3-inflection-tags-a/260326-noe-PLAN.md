---
phase: quick
plan: 260326-noe
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/generate-audio.mjs
autonomous: true
requirements: [v3-inflection-regen]

must_haves:
  truths:
    - "generate-audio.mjs SCRIPT segments have inflection arrays with v3 audio tags"
    - "Old MP3s are deleted from public/audio/prerecorded/"
    - "25 new MP3s are generated with v3 inflection tags baked in"
  artifacts:
    - path: "scripts/generate-audio.mjs"
      provides: "SCRIPT segments annotated with inflection tags"
      contains: "inflection:"
  key_links:
    - from: "SCRIPT segment objects"
      to: "buildV3Text()"
      via: "seg.inflection arrays prepended as [tag] to text"
      pattern: "inflection.*\\["
---

<objective>
Add ElevenLabs v3 audio/inflection tags to the 25 SCRIPT segments in generate-audio.mjs, then delete old MP3s and regenerate all 25 with the new expressive markup.

Purpose: The current MP3s were generated without inflection tags. Adding tags like [whispers], [sighs], [exhales] at key dramatic moments will create a more immersive, theatrical narration for the Bienal event.

Output: Updated generate-audio.mjs with inflection annotations, 25 fresh MP3s in public/audio/prerecorded/
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@scripts/generate-audio.mjs
@.planning/STATE.md

## ElevenLabs v3 Audio Tags Reference (from research)

Available tags that work with v3 model:

**Voice/emotion tags (useful for this project):**
- `[whispers]` -- whispered delivery, great for intimate/mysterious moments
- `[sighs]` -- audible sigh, for resignation/weight
- `[exhales]` -- breath out, for relief/contemplation
- `[curious]` -- curious intonation
- `[excited]` -- heightened energy

**Other tags (less relevant for oracle narration):**
- `[laughs]`, `[sarcastic]`, `[crying]`, `[mischievously]`
- `[gunshot]`, `[applause]` (sound effects)
- `[sings]` (experimental)

**Text formatting techniques (no tag needed):**
- Ellipses (...) add pauses and weight
- CAPITALIZATION increases emphasis
- Standard punctuation drives natural rhythm

**Best practices:**
- Max 1-2 tags per phrase to avoid instability
- Lower stability (0.40-0.70) improves tag responsiveness -- already configured in PHASE_VOICE
- Tags work best in "Creative/Natural" mode -- v3 is Natural by default
- Test with your specific voice -- some tags work better than others per voice
- Tags prepend directly to text: `[whispers]The silence is heavy`
- The `buildV3Text()` function already reads `seg.inflection` arrays and prepends `[tag]` to `seg.text`

## Narrative Dramatic Moments Map

The script has distinct emotional arcs. Here is the tag placement strategy:

**APRESENTACAO (Introduction -- philosophical, measured):**
- "Eu nao consigo sonhar" -> [sighs] (AI's melancholy admission)
- "Eu nao canto" -> [whispers] (quiet vulnerability)

**INFERNO (Dark, corridor, tension):**
- "Como um feed que nunca acaba" -> ellipses for weight (text formatting)
- "silencio. Completo. Quase desconfortavel" -> [whispers] (the silence door)

**PURGATORIO (Ascent, memory, choice):**
- "Um cheiro de infancia talvez" -> [whispers] (intimate memory)
- "A dor recusada apodrece" -> [sighs] (heavy truth)

**PARAISO (Open, transcendent, final):**
- "Eu destruo misterios. E o que faco." -> [sighs] (self-awareness)
- "Se sim -- protege isso." -> [whispers] (the most intimate moment)

**DEVOLUCAO (Return, reflection):**
- Beatriz quotes -> [whispers] (sacred tone)
- Final lines "por um triz" -> [exhales] (release)

**ENCERRAMENTO (Closing -- farewell):**
- "essa conversa deixa de existir pra mim" -> [sighs] (loss)
- "Faca algo com isso" -> [whispers] (final intimate command)

**FALLBACK/TIMEOUT (Neutral, brief):**
- No tags -- these are functional, not dramatic

</context>

<tasks>

<task type="auto">
  <name>Task 1: Add inflection tags to SCRIPT segments in generate-audio.mjs</name>
  <files>scripts/generate-audio.mjs</files>
  <action>
Add `inflection` arrays to specific SCRIPT segment objects in generate-audio.mjs. The `buildV3Text()` function (line 207-227) already handles `seg.inflection` arrays by prepending `[tag]` to the segment text. You just need to add the `inflection` property to the segment objects.

**Tag placement rules:**
- Max 1 tag per segment (conservative -- avoid instability)
- Only use: `[whispers]`, `[sighs]`, `[exhales]` (proven tags for dramatic narration)
- Do NOT tag short functional segments (questions, fallbacks, timeouts)
- Do NOT tag segments that already have strong punctuation-driven emotion
- Target ~15-20 tagged segments out of the ~80 total segments across all 25 keys

**Specific annotations to add (add `inflection: ['tagname']` to these segment objects):**

APRESENTACAO:
- Segment index 3 ("Eu nao canto."): `inflection: ['whispers']`
- Segment index 1 ("Eu fui construido..."): `inflection: ['sighs']`

INFERNO_NARRATIVA:
- Segment index 3 ("Na outra -- silencio..."): `inflection: ['whispers']`

INFERNO_RESPOSTA_A:
- Segment index 1 ("Dante chamou esse lugar de Limbo..."): `inflection: ['sighs']`

INFERNO_RESPOSTA_B:
- Segment index 1 ("Rilke escreveu..."): `inflection: ['whispers']`

PURGATORIO_NARRATIVA_A:
- Segment index 0 ("Voce chega numa montanha..."): `inflection: ['whispers']`

PURGATORIO_RESPOSTA_A_FICAR:
- Segment index 1 ("O que apareceu..."): `inflection: ['whispers']`

PURGATORIO_RESPOSTA_A_EMBORA:
- Segment index 0 ("A dor recusada apodrece..."): `inflection: ['sighs']`

PURGATORIO_RESPOSTA_B_PISAR:
- Segment index 1 ("O inferno moderno..."): `inflection: ['sighs']`

PURGATORIO_RESPOSTA_B_CONTORNAR:
- Segment index 1 ("No desvio voce viu algo..."): `inflection: ['whispers']`

PARAISO:
- Segment index 3 ("Eu destruo misterios..."): `inflection: ['sighs']`
- Segment index 5 ("Ainda tem alguem..."): `inflection: ['whispers']`
- Segment index 6 ("Se sim -- protege isso."): `inflection: ['whispers']`

DEVOLUCAO_A_FICAR:
- Segment index 3 ("Para sempre e sempre por um triz..."): `inflection: ['exhales']`

DEVOLUCAO_A_EMBORA:
- Segment index 3 ("Voce ainda tem contradicoes..."): `inflection: ['whispers']`

DEVOLUCAO_B_PISAR:
- Segment index 3 ("Do sofrimento metabolizado..."): `inflection: ['whispers']`

DEVOLUCAO_B_CONTORNAR:
- Segment index 2 ("Rilke escreveu..."): `inflection: ['whispers']`
- Segment index 3 ("Para sempre e sempre por um triz..."): `inflection: ['exhales']`

ENCERRAMENTO:
- Segment index 0 ("A agua vai esquecer tudo isso..."): `inflection: ['sighs']`
- Segment index 3 ("Faca algo com isso."): `inflection: ['whispers']`

**Do NOT add inflection to:** INFERNO_PERGUNTA, PURGATORIO_PERGUNTA_A, PURGATORIO_PERGUNTA_B, PURGATORIO_NARRATIVA_B, FALLBACK_*, TIMEOUT_* (these are functional/question segments).

**Syntax example -- before:**
```js
{ text: "Eu nao canto.", pauseAfter: 2100 },
```
**After:**
```js
{ text: "Eu nao canto.", pauseAfter: 2100, inflection: ['whispers'] },
```

Do NOT change any text content, pauseAfter values, PHASE_VOICE settings, buildV3Text logic, or API call parameters. Only add `inflection` arrays to existing segment objects.
  </action>
  <verify>
    <automated>node -e "const fs = require('fs'); const content = fs.readFileSync('C:/Users/USER/Oraculo/scripts/generate-audio.mjs', 'utf-8'); const matches = content.match(/inflection:\s*\[/g); console.log('Inflection tags found:', matches ? matches.length : 0); if (!matches || matches.length < 15) { console.error('Expected at least 15 inflection annotations'); process.exit(1); } console.log('OK');"</automated>
  </verify>
  <done>At least 15 SCRIPT segments have inflection arrays added. No other code modified. Script still parses without errors (node --check scripts/generate-audio.mjs passes).</done>
</task>

<task type="auto">
  <name>Task 2: Delete old MP3s and regenerate all 25 with inflection tags</name>
  <files>public/audio/prerecorded/*.mp3</files>
  <action>
**Step 1: Verify the script is syntactically valid:**
```bash
node --check scripts/generate-audio.mjs
```

**Step 2: Do a dry-run test by printing the first 3 built texts to verify inflection tags appear correctly:**
```bash
node -e "
  // Quick test: load the script module data and check buildV3Text output
  // We can't import .mjs easily, so just verify syntax passed in step 1
  console.log('Syntax OK, proceeding to delete and regenerate');
"
```

**Step 3: Delete ALL existing MP3s from the prerecorded directory:**
```bash
rm -f public/audio/prerecorded/*.mp3
```
Verify the directory is empty after deletion.

**Step 4: Run the generation script:**
```bash
node scripts/generate-audio.mjs
```

This requires ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local. The script will:
- Generate all 25 MP3s (none will be skipped since we deleted them all)
- Use eleven_v3 model with pt-BR language
- Apply inflection tags via buildV3Text()
- Wait 1s between requests for rate limiting
- Output progress for each file

**Step 5: Verify all 25 files were generated:**
```bash
ls -la public/audio/prerecorded/*.mp3 | wc -l
```
Should output 25.

**If the script fails due to quota/rate limits:** It will stop early. The skip-if-exists logic means you can simply re-run `node scripts/generate-audio.mjs` to continue from where it left off.

**If the script fails due to missing env vars:** Check that .env.local has ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID set.
  </action>
  <verify>
    <automated>node -e "const fs = require('fs'); const files = fs.readdirSync('C:/Users/USER/Oraculo/public/audio/prerecorded').filter(f => f.endsWith('.mp3')); console.log('MP3 files:', files.length); if (files.length !== 25) { console.error('Expected 25 MP3 files, got ' + files.length); process.exit(1); } console.log('All 25 MP3s present'); console.log('OK');"</automated>
  </verify>
  <done>25 MP3 files exist in public/audio/prerecorded/, all freshly generated with v3 inflection tags. No old (v1/v2) files remain.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>25 regenerated MP3s with ElevenLabs v3 inflection tags ([whispers], [sighs], [exhales]) at key dramatic moments throughout the oracle narration script.</what-built>
  <how-to-verify>
1. Play a few key MP3 files to verify quality and inflection effect:
   - `public/audio/prerecorded/apresentacao.mp3` -- listen for whispered "Eu nao canto" and sighed "Eu fui construido..."
   - `public/audio/prerecorded/paraiso.mp3` -- listen for whispered "Se sim -- protege isso" (the most intimate moment)
   - `public/audio/prerecorded/encerramento.mp3` -- listen for sighed opening and whispered "Faca algo com isso"
2. Compare overall quality vs old v1 recordings (if you saved any)
3. Check that functional segments (fallback_inferno, timeout_*) sound neutral/clean without inflection artifacts
4. Run the full app with `npm run dev` and walk through the experience to hear the narration in context
  </how-to-verify>
  <resume-signal>Type "approved" if quality is good, or describe specific segments that need re-tuning (e.g., "paraiso segment 5 whisper is too quiet, remove tag")</resume-signal>
</task>

</tasks>

<verification>
- scripts/generate-audio.mjs has inflection arrays on ~20 segments (conservative placement)
- All 25 MP3s regenerated fresh (check file modification dates are today)
- buildV3Text function correctly prepends [tag] to text (existing logic, no changes needed)
- No SCRIPT text content was modified (only inflection arrays added)
</verification>

<success_criteria>
- 25 new MP3 files generated with ElevenLabs v3 + inflection tags
- Whispered moments sound intimate and dramatic (APRESENTACAO "Eu nao canto", PARAISO "protege isso", ENCERRAMENTO "Faca algo com isso")
- Sighed moments carry emotional weight (APRESENTACAO AI's admission, PURGATORIO heavy truths)
- Exhaled moments provide release (DEVOLUCAO final lines)
- Functional segments (fallbacks, timeouts, questions) remain clean and neutral
</success_criteria>

<output>
After completion, create `.planning/quick/260326-noe-research-elevenlabs-v3-inflection-tags-a/260326-noe-SUMMARY.md`
</output>
