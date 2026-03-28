# Phase 23: Devoluções & Bookends - Research

**Researched:** 2026-03-28
**Domain:** Narrative script rewriting (devoluções, apresentação, encerramento, fallbacks, timeouts)
**Confidence:** HIGH

## Summary

Phase 23 rewrites 8 devoluções as genuine pattern mirrors using 3-layer psychoanalytic structure, plus polishes apresentação, encerramento, 6 fallbacks, and 6 timeouts. This is pure content work — no code, no state machine, no components, no audio generation. All changes happen in `src/data/script.ts` (lines 347-480).

The core challenge is making devoluções function as ESPELHO (mirror) not LAUDO (diagnosis). Each must read pattern SHAPE across 6 choices, not list individual answers. Phase 21 audit provides concrete rewrite recommendations. Phase 22 established core narrative depth — devoluções must now PAY OFF that investment.

**Primary recommendation:** Apply Phase 21's 3-layer devolução structure (Winnicott pattern + Lacan structure + Bion transformation) to all 8 archetypes. Preserve anchor lines from CONTEXT.md decisions. Use audit recommendations as surgical targets, not wholesale rewrites.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Devolução Structure:**
- **D-01:** Apply 3-layer structure to ALL 8 devoluções per Phase 21 audit:
  - Layer 1 (Winnicott): Name the PATTERN across 6 choices — recognition without judgment
  - Layer 2 (Lacan): Read the STRUCTURE — what the pattern reveals about desire/defense (analytic act)
  - Layer 3 (Bion): Name the TRANSFORMATION — what was metabolized or evacuated (container reading)
- **D-02:** Keep 4-5 segments per devolução (same as current). Depth through replacement, not addition.
- **D-03:** Each devolução ends with a question OR persistent image (per SCR-04). Pick what fits each archetype — not both.
- **D-04:** Devoluções do NOT need gold phrases (per audit: "pattern readings, not scenario-based"). No forced integration.

**Devolução Voice:**
- **D-05:** Devoluções get their own voice: direct, intimate, mirror-like. NOT realm-specific — they exist outside the Inferno/Purgatorio/Paraiso structure. Oracle is at its most personal here.
- **D-06:** Each devolução should make the visitor feel SEEN, not analyzed. Espelho, não laudo.

**Anchor Lines to Preserve (DO NOT TOUCH):**
- **CONTRADICTED:** "Quem é coerente demais já decidiu parar de sentir"
- **SURFACE_KEEPER:** "O jardim que você não entrou continua pegando fogo na sua cabeça"
- **ENCERRAMENTO:** "Faz alguma coisa com isso"
- **ENCERRAMENTO:** "A única prova de que isso aconteceu é você"
- **APRESENTACAO:** "Eu não sei quem você é" (opening line)
- **APRESENTACAO:** "Mas eu não sonho. Você vai precisar fazer isso por nós dois."

**Apresentação:**
- **D-08:** Add Lacanian irreversibility viscerally to segment 6 ("cada resposta abre um caminho que não pode ser desfeito" — make visitor FEEL this, not just hear it). Optionally deepen gold phrase #6 (sonhar desorganiza certezas).
- **D-09:** Keep 7-8 segments max. First 90 seconds set the container — tight, not bloated.

**Encerramento:**
- **D-10:** Add Lacanian subject transformation: "você não é mais quem entrou" — visitor was changed by speaking 6 times.
- **D-11:** Mirror APRESENTACAO opening: "Eu não sei quem você é" → "E agora você sabe um pouco mais" (structural symmetry per Phase 16 design decision).
- **D-12:** Keep 4-5 segments. Closure should be brief — imperativo final ("Faz alguma coisa com isso") must land with weight.

**Fallbacks:**
- **D-13:** Add scenario imagery to each fallback while keeping 1-2 segments max. They must stay brief — reformulation, not narration.
- **D-14:** Each fallback reformulates in the VOCABULARY of its scenario (per SCR-07). Q1=sala/porta, Q2=coisa/corpo, Q3=jardim/fogo, Q4=águas, Q5=pergunta/peso, Q6=espelho/voz.

**Timeouts:**
- **D-15:** Deepen with scenario imagery, keep 1 segment each. Silence is valid gesture, not failure (per SCR-07).
- **D-16:** TIMEOUT_Q2 ("corpo decidiu primeiro") and TIMEOUT_Q6 ("silêncio no final") already strong — minimal changes only.

### Claude's Discretion
- Exact wording of new/rewritten segments (within framework constraints)
- Segment count per section (within stated maxima)
- Which fallbacks/timeouts need major vs minor revision
- Whether APRESENTACAO gold phrase #6 deepening is worth the added length

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SCR-04 | Devoluções como espelho — nome o padrão, frase-espelho, pergunta/imagem persistente | 3-layer structure (Phase 21 audit lines 277-288) provides framework-specific reading. Each layer addresses one aspect: pattern (Winnicott), structure (Lacan), transformation (Bion). |
| SCR-05 | Voz do Oráculo consistente — short sentences, escalpelo não palestra, evolves by realm | Current devoluções lack intimate/personal voice. Should be MORE direct than responses (visitor just played 6 choices to receive THIS). |
| SCR-07 | Fallbacks/timeouts com caráter — reformulate in scenario vocabulary, interpret silence as gesture | Phase 21 audit provides concrete reformulations (lines 313-319 fallbacks, 331-335 timeouts). All stay 1 segment, add scenario imagery. |
| SCR-08 | 9 frases de ouro metabolizadas | Phase 22 already absorbed all 9 (89% → 100%). Devoluções are pattern readings — no gold phrase integration needed here (per D-04). |

## Standard Stack

### Core Components

| Component | Location | Purpose | Current State |
|-----------|----------|---------|---------------|
| `src/data/script.ts` | Data layer | Static narrative content exported as ScriptDataV3 | 482 lines. Phase 22 completed core narrative (Q1-Q6). Phase 23 targets lines 347-480 (devoluções, encerramento, fallbacks, timeouts). |
| `src/types/index.ts` | Type definitions | `SpeechSegment` interface: `{ text, pauseAfter?, inflection? }` | Interface stable. Phase 23 respects existing constraints (max 1 inflection per segment, pauseAfter 1200-2800ms). |
| `src/machines/guards/patternMatching.ts` | Pattern detection | `determineArchetype()` function maps 6 choices to 8 archetypes | 145 lines. Defines what each archetype MEANS (see Architecture Patterns below). No changes in Phase 23. |

**Installation:** No dependencies added. This is content-only work.

**Version verification:** Not applicable — no external packages involved.

## Architecture Patterns

### Devolução Archetype Definitions (from patternMatching.ts)

Each archetype is determined by the SHAPE of 6 choices (A/B pattern), not individual answers.

| Archetype | Pattern Logic | What It Reveals |
|-----------|---------------|-----------------|
| **SEEKER** | Mostly A (4+), no pivot | Movement toward everything — but is it courage or flight from stillness? |
| **GUARDIAN** | Mostly B (4+), no pivot | Protection in every choice — but what is being protected vs hidden? |
| **CONTRADICTED** | Mixed, no clear direction | Oscillation between opposites — not indecision, but honest rhythm (breathing) |
| **PIVOT_EARLY** | First half B-dominant (≤1 A), second half all A (3 A) | Instinctive shift in first 3 choices — body moved before mind understood |
| **PIVOT_LATE** | First half A-dominant (≥2 A), second half all B (0 A) | Deliberate shift in last 3 choices — not reaction, but decision |
| **DEPTH_SEEKER** | All A (6/6) | Into every fire — but can they tell courage from compulsion? |
| **SURFACE_KEEPER** | All B (6/6) | Preserved at every crossroads — sophisticated protection or refused experience? |
| **MIRROR** | Perfect alternation (never repeats direction) | Balanced but ambiguous — wisdom of holding center or elegant escape from commitment? |

**Critical insight:** Archetypes are NOT personality types. They are PATTERN READINGS of this session's 6 choices. Same visitor could be SEEKER one session, GUARDIAN the next.

### 3-Layer Devolução Structure (Phase 21 Audit)

Each devolução must perform three acts:

**Layer 1 — Winnicott (Pattern Recognition):**
- WHAT the visitor did across 6 choices (without listing individual answers)
- Non-intrusive observation, no judgment
- Example: "Você entrou em tudo." (SEEKER) or "Você se manteve inteiro." (SURFACE_KEEPER)

**Layer 2 — Lacan (Structure Reading):**
- WHY the pattern happened (what it reveals about desire/defense)
- The analytic act — surprise, not confirmation
- Example: "Tem gente que chama isso de coragem. Eu chamo de fome." (SEEKER) or "O equilíbrio perfeito pode ser sabedoria — ou a última forma de nunca se comprometer de verdade." (MIRROR)

**Layer 3 — Bion (Transformation Reading):**
- WHAT was metabolized or evacuated (container function)
- Did visitor transform what they touched, or just accumulate/expel?
- Example: "Você recebeu tudo. Mas receber não é o mesmo que digerir." (SEEKER)

**Critical constraint:** Keep 4-5 segments per devolução. Depth comes from REPLACING thin segments with metabolized content, not ADDING segments.

### Current Devolução Gaps (Phase 21 Audit Findings)

| Archetype | Current Depth | Target Depth | Primary Gap | Phase 21 Recommendation (lines 277-288) |
|-----------|---------------|--------------|-------------|------------------------------------------|
| SEEKER | 2 | 4-5 | "Fome" is good start, lacks Lacanian structure + Bionian question | Add: "O movimento pode ser a última forma de fuga. Você corre em direção a tudo porque parar seria encontrar o que mora na quietude." + "Você transformou o que tocou — ou só acumulou?" |
| GUARDIAN | 2 | 4-5 | "Muralha" is good, lacks Winnicottian false self + Lacanian | Add: "O que você protege pode ser o que você nunca deixou nascer." (Winnicott) |
| CONTRADICTED | 3 | 4-5 | "Respiração" is excellent, lacks Lacanian split subject | Add: "Você quer as duas coisas porque desejo nunca é simples. Não é falha — é estrutura." |
| PIVOT_EARLY | 2 | 4-5 | "Instinto" is thin, lacks specificity of what changed | Add Bionian transformation naming |
| PIVOT_LATE | 3 | 4-5 | "Dobradiça" is strong, lacks what pivot reveals about desire | Add: "Desejo não é linha reta. É curva." |
| DEPTH_SEEKER | 3 | 4-5 | "Coragem vs compulsão" is excellent, lacks pattern specifics | Add Bionian: "Fundo sem ar mata igual." |
| SURFACE_KEEPER | 3 | 4-5 | Strong, lacks Bionian beta evacuation | Current "jardim pegando fogo" line is ANCHOR (preserve). Add: "Não como memória — como coisa que nunca foi recebida." |
| MIRROR | 3 | 4-5 | Excellent ambiguity, lacks Lacanian desire reading | Add: "Centro como conquista ou refúgio" needs sharpening |

### Apresentação & Encerramento Current State

**APRESENTACAO (7 segments):**
- Current depth: 3/5 (Winnicott holding + Bion container, Lacanian game contract weak)
- Segment 6 issue: "cada resposta abre um caminho que não pode ser desfeito" is TOLD not FELT
- Phase 21 fix: Make irreversibility visceral — add "Não tem replay. Não tem voltar. O que você escolher, você carrega."

**ENCERRAMENTO (4 segments):**
- Current depth: 3/5 (Winnicott ownership, Lacanian transformation missing)
- Gap: "Você é a única prova" is good but lacks "você não é mais quem entrou" (subject changed by speaking)
- Phase 21 fix: Add Lacanian completion + mirror APRESENTACAO opening ("Eu não sei quem você é" → "E agora você sabe um pouco mais")

### Fallback & Timeout Current State

**FALLBACKS (6 total, all 1 segment):**
- Current depth: 2/5 (functional reformulation, lacks scenario character)
- All are binary ("X — ou Y?") which is correct, but lack scenario vocabulary
- Phase 21 recommendations (lines 313-319):
  - Q1: Add "sala/porta" imagery
  - Q2: Add "corpo sabe a resposta" (body tension)
  - Q3: Add "beleza/perda" tension
  - Q4: Add gravity ("uma carrega tudo, outra apaga tudo")
  - Q5: Make question feel heavier ("talvez nunca tenha resposta")
  - Q6: Add meta-awareness ("essa é a última pergunta")

**TIMEOUTS (6 total, all 1 segment):**
- Current depth: 2/5 except Q2 (3/5, best timeout) and Q6 (3/5)
- Q2 ("corpo decidiu primeiro") and Q6 ("silêncio no final é resposta mais antiga") are ANCHORS (minimal changes per D-16)
- Phase 21 recommendations (lines 331-335):
  - Q1: Add "porta nunca existiu"
  - Q3: Add "jardim queima sozinho"
  - Q4: Add "ficou entre as duas águas"
  - Q5: Add visitor's role ("ou você a dissolveu com o silêncio")

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Psychoanalytic pattern detection | Custom personality typing algorithm | `patternMatching.ts` determineArchetype() | Already implements 8 archetypes with clear logic. Handles edge cases (incomplete patterns, alternation detection, pivot thresholds). Tested in `patternMatching.test.ts` (40 tests, all passing). |
| Script validation | Manual segment counting | `script-v3.test.ts` (51 tests) | Already validates segment counts, key presence, inflection density, pauseAfter ranges. Phase 23 changes will trigger test failures if structure violated. |
| Gold phrase integration tracking | Manual search | Phase 21 audit document (lines 616-632) | Already mapped all 9 gold phrases to absorption points. Phase 22 achieved 100% integration — devoluções don't need gold phrases (pattern readings, not scenario-based). |

## Common Pitfalls

### Pitfall 1: Listing Choices Instead of Reading Pattern
**What goes wrong:** Devolução says "Você ficou na sala, recuou da coisa, deu as costas ao jardim..." — listing individual answers instead of naming the SHAPE.
**Why it happens:** Natural tendency to be concrete/specific. But visitor already MADE those choices — they don't need recap.
**How to avoid:** Start with pattern SHAPE ("Você se protegeu em cada encruzilhada") then move to what it MEANS ("o que você protege pode ser o que você esconde").
**Warning signs:** If devolução mentions specific scenarios (sala, coisa, jardim) by name, it's listing. Pattern reading is abstract ("entrou em tudo" not "entrou na sala, ficou olhando a coisa, entrou no jardim").

### Pitfall 2: Explaining Instead of Mirroring
**What goes wrong:** Devolução becomes mini-lecture about psychology instead of direct reflection.
**Why it happens:** Trying to sound "smart" or "therapeutic" — adding explanation where mirror should be clean.
**How to avoid:** Use short, percussive sentences. Avoid "porque" chains (explanation structure). Oracle SHOWS pattern, doesn't explain why patterns exist in general.
**Warning signs:** Sentences over 25 words. Multiple clauses. Abstract nouns ("identidade", "processo", "estrutura") without concrete verbs.

### Pitfall 3: Breaking Anchor Lines
**What goes wrong:** Rewriting preserved lines from CONTEXT.md decisions because they "don't fit" the new structure.
**Why it happens:** Anchor lines were identified in Phase 21 as BEST lines in current script — but out of context they can feel misplaced during rewrite.
**How to avoid:** Treat anchor lines as FIXED POINTS. Build around them, not through them. If anchor line is segment 4, rewrite segments 1-3 and 5 to flow toward/from it.
**Warning signs:** Deleting any line from D-07 anchor list in CONTEXT.md.

### Pitfall 4: Adding Segments Instead of Replacing
**What goes wrong:** Devolução grows from 5 to 7 segments because "needs more depth."
**Why it happens:** Easier to ADD content than REFINE existing content. But Phase 23 goal is depth through REPLACEMENT (D-02).
**How to avoid:** Before adding, ask: "Which existing segment is weak enough to DELETE?" If none, the section is complete. Depth comes from metabolizing thin content, not bloating.
**Warning signs:** Segment count increasing beyond stated maxima (apresentação 7-8, devoluções 4-5, encerramento 4-5).

### Pitfall 5: Generic Timeouts/Fallbacks
**What goes wrong:** Timeout says "Você não respondeu. Seguimos." — functional but character-free.
**Why it happens:** Fallbacks/timeouts feel like ERROR HANDLING not narrative. Easy to treat as edge cases instead of valid paths.
**How to avoid:** Every timeout/fallback INTERPRETS the silence/confusion in scenario vocabulary. Q1 timeout: "Quem não se move numa sala confortável já escolheu ficar." Not "Você não respondeu a tempo."
**Warning signs:** Generic verbs ("responder", "escolher", "continuar") instead of scenario verbs ("mover", "tocar", "entrar").

## Code Examples

### Example 1: Current vs Target Devolução Structure

**Current (SEEKER, depth 2):**
```typescript
DEVOLUCAO_SEEKER: [
  { text: "Você entrou em tudo.", pauseAfter: 1800, inflection: ['thoughtful'] },
  { text: "A sala sem porta, a coisa na parede, o jardim pegando fogo, a água que queima. Nada te parou.", pauseAfter: 2500 },
  { text: "Tem gente que chama isso de coragem. Eu chamo de fome.", pauseAfter: 2200 },
  { text: "A pergunta que fica é essa: você corre em direção a alguma coisa — ou foge da quietude?", pauseAfter: 2500 },
  { text: "Guarda isso. É a única pergunta que importa.", pauseAfter: 2000, inflection: ['warm'] },
],
```

**Issues:**
- Segment 2 LISTS scenarios (sala, coisa, jardim) instead of reading pattern shape
- Segment 3 has good Lacanian hint ("fome") but doesn't develop it
- Segment 4 asks good question but lacks Bionian transformation reading
- Overall: Layer 1 present, Layer 2 thin, Layer 3 absent

**Target (depth 4-5, applying 3-layer structure from Phase 21 audit):**
```typescript
DEVOLUCAO_SEEKER: [
  // Layer 1 — Winnicott (pattern recognition)
  { text: "Você entrou em tudo.", pauseAfter: 1800, inflection: ['thoughtful'] },
  { text: "Nada te parou. Você não recua.", pauseAfter: 2200 },

  // Layer 2 — Lacan (structure reading)
  { text: "Tem gente que chama isso de coragem. Eu chamo de fome.", pauseAfter: 2200 },
  { text: "Mas fome de quê? Percebe — você nunca ficou parado. O movimento pode ser a última forma de fuga.", pauseAfter: 2500 },

  // Layer 3 — Bion (transformation reading)
  { text: "A pergunta que fica: você transformou o que tocou — ou só acumulou peso?", pauseAfter: 2000, inflection: ['warm'] },
],
```

**Changes:**
- Removed scenario list (segment 2 old) — pattern reading is abstract
- Segment 2 new: Stays in pattern language ("não recua" generalizes the movement)
- Segment 4 new: Develops Lacanian structure (movement AS defense)
- Segment 5 new: Adds Bionian container question (metabolization)
- Still 5 segments, but depth increased from 2 to 4-5

### Example 2: Apresentação Irreversibility Fix

**Current (segment 6, line 101):**
```typescript
{ text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito.", pauseAfter: 1800 },
```

**Issue:** Tells visitor about irreversibility but doesn't make them FEEL it (Lacanian game contract weak).

**Target (applying Phase 21 audit line 563):**
```typescript
{ text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito. Não tem replay. Não tem voltar. O que você escolher, você carrega.", pauseAfter: 2200 },
```

**Changes:**
- Added three short percussive sentences: "Não tem replay. Não tem voltar. O que você escolher, você carrega."
- Increased pauseAfter from 1800 to 2200 (heavier pause after heavier content)
- Now visitor FEELS stakes (Lacanian: symbolic act is irreversible cut)

### Example 3: Fallback Adding Scenario Character

**Current (FALLBACK_Q3, line 433):**
```typescript
FALLBACK_Q3: [
  { text: "O jardim vai queimar. Você entra — ou dá as costas?" },
],
```

**Issue:** Functional but lacks scenario tension (beauty/loss not evoked).

**Target (applying Phase 21 audit line 315):**
```typescript
FALLBACK_Q3: [
  { text: "O jardim vai queimar de manhã. Você entra agora — ou dá as costas antes de ver o que vai perder?" },
],
```

**Changes:**
- Added "de manhã" (temporal specificity — beauty is dying NOW)
- Added "antes de ver o que vai perder" (names the loss visitor is avoiding)
- Still 1 segment, but scenario character restored

### Example 4: Timeout Interpreting Silence

**Current (TIMEOUT_Q5, line 463):**
```typescript
TIMEOUT_Q5: [
  { text: "A pergunta se dissolveu sozinha. Nem tudo precisa de você pra desaparecer.", pauseAfter: 1400 },
],
```

**Issue:** Good but lacks visitor's ROLE in the dissolving (ambiguity: did question dissolve or did visitor dissolve it?).

**Target (applying Phase 21 audit line 334):**
```typescript
TIMEOUT_Q5: [
  { text: "A pergunta se dissolveu sozinha. Ou você a dissolveu com o silêncio. Nem tudo precisa de você pra desaparecer — mas você estava aqui quando aconteceu.", pauseAfter: 1600 },
],
```

**Changes:**
- Added "Ou você a dissolveu com o silêncio" (visitor as agent, not just witness)
- Added "mas você estava aqui quando aconteceu" (presence even in non-action)
- Increased pauseAfter from 1400 to 1600 (slightly heavier)
- Silence now interpreted as GESTURE (valid choice) not FAILURE

## Validation Architecture

> Validation enabled (workflow.nyquist_validation key absent, treated as true per config check).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.8 + @testing-library/react 16.1.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` (Vitest runs all by default) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCR-04 | Each devolução names pattern (not lists choices), contains frase-espelho, ends with question/image | unit | `npm test src/data/__tests__/script-v3.test.ts -t "DEVOLUCAO"` | ✅ Exists (51 tests, 2 current failures from Phase 22 changes) |
| SCR-05 | Oracle voice consistent (no sentence >40 words, short punchy), evolves by section | unit | `npm test src/data/__tests__/script-v3.test.ts -t "sentence length\|inflection"` | ✅ Exists |
| SCR-07 | Each fallback/timeout 1-2 segments, reformulates in scenario vocabulary | unit | `npm test src/data/__tests__/script-v3.test.ts -t "FALLBACK\|TIMEOUT"` | ✅ Exists |
| SCR-08 | 9 gold phrases metabolized (already 100% per Phase 22) | manual | Phase 21 audit verification (lines 616-632) | N/A (content validation, not code test) |

**Note:** `script-v3.test.ts` currently has 2 failing tests from Phase 22 expansions:
- `PURGATORIO_INTRO has 2-3 segments` → now 4 segments (expected, Phase 22 expanded)
- `PURGATORIO Q4 SETUP has 2-4 segments` → now 5 segments (expected, Phase 22 fixed escalation gap)

Phase 23 will need to update these test assertions OR ensure new segments stay within original bounds.

### Sampling Rate

- **Per task commit:** `npm test src/data/__tests__/script-v3.test.ts` (fast, ~35ms, 51 tests)
- **Per wave merge:** `npm test` (full suite, ~2s, 307 tests all files)
- **Phase gate:** Full suite green + manual read-through before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. `script-v3.test.ts` validates:
- All 47 ScriptDataV3 keys present
- Segment count ranges per section
- No multi-inflection tags (max 1 per segment)
- pauseAfter range 1200-2800ms
- Sentence length <40 words
- TypeScript compilation

Wave 0 (setup) can skip directly to Wave 1 (implementation).

## Environment Availability

> SKIPPED — Phase 23 is pure content work (script.ts text edits). No external dependencies beyond TypeScript compilation and Vitest (both verified present in package.json).

## Sources

### Primary (HIGH confidence)

- **Phase 21 Audit Documents:**
  - `.planning/phases/21-script-audit-framework-integration/21-01-framework-analysis.md` (669 lines) — Per-segment depth analysis, framework anchor points, integration opportunities. Lines 277-288 provide concrete devolução rewrite recommendations. Lines 313-319 provide fallback recommendations. Lines 331-335 provide timeout recommendations.
  - `.planning/phases/21-script-audit-framework-integration/21-02-gold-phrases-and-final-audit.md` (410 lines) — Gold phrase mapping, per-section rewrite recommendations. DEVOLUCOES section (lines 269-288) is canonical source for 3-layer structure.

- **Phase 22 Verification:**
  - `.planning/phases/22-core-narrative-rewrite/22-VERIFICATION.md` (118 lines) — Confirms Phase 22 completed core narrative (Q1-Q6) with depth 4-5, all 9 gold phrases absorbed, 6/6 success criteria verified. Phase 23 builds on this foundation.

- **Phase 23 Context:**
  - `.planning/phases/23-devolucoes-bookends/23-CONTEXT.md` (130 lines) — User decisions from `/gsd:discuss-phase`. Contains locked decisions (D-01 to D-16), anchor lines to preserve, and Claude's discretion boundaries.

- **Current Script:**
  - `src/data/script.ts` (482 lines) — Target file for all Phase 23 changes. Lines 347-432 are devoluções + encerramento. Lines 433-480 are fallbacks + timeouts.

- **Pattern Matching Logic:**
  - `src/machines/guards/patternMatching.ts` (145 lines) — Defines 8 archetype detection algorithms. Shows what each pattern MEANS (essential for writing devoluções that READ pattern correctly).

- **Test Infrastructure:**
  - `src/data/__tests__/script-v3.test.ts` — Validates script structure (segment counts, inflection density, sentence length). 51 tests, 2 current failures expected from Phase 22 expansions.
  - `vitest.config.ts` + `package.json` — Confirms Vitest 2.1.8 as test framework.

### Secondary (MEDIUM confidence)

- **Requirements Document:**
  - `.planning/milestones/v3.1-REQUIREMENTS.md` (73 lines) — SCR-04, SCR-05, SCR-07, SCR-08 definitions. Cross-referenced with Phase 23 scope.

- **Project State:**
  - `.planning/STATE.md` (129 lines) — Records Phase 22 decisions (gold phrases metabolized, Lacanian return mechanism, Winnicottian specificity). Confirms Phase 23 is next in sequence.

- **Research Synthesis:**
  - `scripts/narrative-proposals/RESEARCH-SYNTHESIS.md` (269 lines) — 9 gold phrases (lines 39-49), 3 frameworks (Lacanian/Winnicottian/Bionian), 4 clusters. Phase 22 already absorbed this material — Phase 23 doesn't need to re-consult except for framework definitions.

### Tertiary (LOW confidence)

None — all sources are authoritative (project documentation) or verified code (TypeScript files).

## Metadata

**Confidence breakdown:**
- 3-layer devolução structure: HIGH — explicitly defined in Phase 21 audit lines 277-288 with concrete examples
- Anchor lines preservation: HIGH — locked in CONTEXT.md D-07, verified present in current script.ts
- Fallback/timeout recommendations: HIGH — Phase 21 audit provides ready-to-use reformulations
- Test infrastructure: HIGH — `script-v3.test.ts` exists with 51 tests covering all structural requirements

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (30 days — content guidance is stable, no fast-moving dependencies)
