# Phase 23: Devoluções & Bookends - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Rewrite 8 devoluções as genuine pattern mirrors + polish Apresentação, Encerramento, 6 fallbacks, and 6 timeouts. All content in `src/data/script.ts`. No state machine changes, no component changes, no audio generation.

</domain>

<decisions>
## Implementation Decisions

### Devolução Structure
- **D-01:** Apply 3-layer structure to ALL 8 devoluções per Phase 21 audit recommendation:
  - Layer 1 (Winnicott): Name the PATTERN across 6 choices — recognition without judgment
  - Layer 2 (Lacan): Read the STRUCTURE — what the pattern reveals about desire/defense (analytic act)
  - Layer 3 (Bion): Name the TRANSFORMATION — what was metabolized or evacuated (container reading)
- **D-02:** Keep 4-5 segments per devolução (same as current). Depth through replacement, not addition.
- **D-03:** Each devolução ends with a question OR persistent image (per SCR-04). Pick what fits each archetype — not both.
- **D-04:** Devoluções do NOT need gold phrases (per audit: "pattern readings, not scenario-based"). No forced integration.

### Devolução Voice
- **D-05:** Devoluções get their own voice: direct, intimate, mirror-like. NOT realm-specific — they exist outside the Inferno/Purgatorio/Paraiso structure. Oracle is at its most personal here.
- **D-06:** Each devolução should make the visitor feel SEEN, not analyzed. Espelho, não laudo.

### Anchor Lines to Preserve
- **D-07:** These lines are DO NOT TOUCH (from Phase 21 audit):
  - CONTRADICTED: "Quem é coerente demais já decidiu parar de sentir"
  - SURFACE_KEEPER: "O jardim que você não entrou continua pegando fogo na sua cabeça"
  - ENCERRAMENTO: "Faz alguma coisa com isso"
  - ENCERRAMENTO: "A única prova de que isso aconteceu é você"
  - APRESENTACAO: "Eu não sei quem você é" (opening line)
  - APRESENTACAO: "Mas eu não sonho. Você vai precisar fazer isso por nós dois."

### Apresentação
- **D-08:** Add Lacanian irreversibility viscerally to segment 6 ("cada resposta abre um caminho que não pode ser desfeito" — make visitor FEEL this, not just hear it). Optionally deepen gold phrase #6 (sonhar desorganiza certezas).
- **D-09:** Keep 7-8 segments max. First 90 seconds set the container — tight, not bloated.

### Encerramento
- **D-10:** Add Lacanian subject transformation: "você não é mais quem entrou" — visitor was changed by speaking 6 times.
- **D-11:** Mirror APRESENTACAO opening: "Eu não sei quem você é" → "E agora você sabe um pouco mais" (structural symmetry per Phase 16 design decision).
- **D-12:** Keep 4-5 segments. Closure should be brief — imperativo final ("Faz alguma coisa com isso") must land with weight.

### Fallbacks
- **D-13:** Add scenario imagery to each fallback while keeping 1-2 segments max. They must stay brief — reformulation, not narration.
- **D-14:** Each fallback reformulates in the VOCABULARY of its scenario (per SCR-07). Q1=sala/porta, Q2=coisa/corpo, Q3=jardim/fogo, Q4=águas, Q5=pergunta/peso, Q6=espelho/voz.

### Timeouts
- **D-15:** Deepen with scenario imagery, keep 1 segment each. Silence is valid gesture, not failure (per SCR-07).
- **D-16:** TIMEOUT_Q2 ("corpo decidiu primeiro") and TIMEOUT_Q6 ("silêncio no final") already strong — minimal changes only.

### Claude's Discretion
- Exact wording of new/rewritten segments (within framework constraints)
- Segment count per section (within stated maxima)
- Which fallbacks/timeouts need major vs minor revision
- Whether APRESENTACAO gold phrase #6 deepening is worth the added length

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 21 Audit (rewrite guidance)
- `.planning/phases/21-script-audit-framework-integration/21-01-framework-analysis.md` — Per-segment depth analysis, framework anchor points, integration opportunities
- `.planning/phases/21-script-audit-framework-integration/21-02-gold-phrases-and-final-audit.md` — Gold phrase mapping, per-section rewrite recommendations (DEVOLUCOES, APRESENTACAO, ENCERRAMENTO, FALLBACKS, TIMEOUTS sections are critical)

### Requirements
- `.planning/milestones/v3.1-REQUIREMENTS.md` — SCR-04 (devoluções como espelho), SCR-05 (voz do Oráculo), SCR-07 (fallbacks/timeouts com caráter), SCR-08 (9 gold phrases)

### Pattern Matching (archetype definitions)
- `src/machines/guards/patternMatching.ts` — How 8 archetypes are determined from 6 choices (SEEKER, GUARDIAN, CONTRADICTED, PIVOT_EARLY, PIVOT_LATE, DEPTH_SEEKER, SURFACE_KEEPER, MIRROR)

### Current Script
- `src/data/script.ts` — Current state after Phase 22 rewrites. Lines 347-480 contain current devoluções, encerramento, fallbacks, timeouts.

### Research Synthesis
- `scripts/narrative-proposals/RESEARCH-SYNTHESIS.md` — Master doc with 9 gold phrases, 4 clusters, 3 frameworks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SpeechSegment` interface (`src/types/index.ts`): `{ text, pauseAfter?, inflection? }` — same format used throughout
- `ScriptDataV3` interface: 8 DEVOLUCAO keys, 1 ENCERRAMENTO, 6 FALLBACK, 6 TIMEOUT already defined
- Pattern matching in `patternMatching.ts`: archetype determination logic shows what each pattern means

### Established Patterns
- Max 1 inflection tag per segment, sparse (~30-40%)
- pauseAfter range: 1200-2800ms, 0 for section finals
- No sentence >40 words
- Oracle voice: 2nd person, short sentences, more escalpelo than palestra

### Integration Points
- State machine routes to DEVOLUCAO_{archetype} states based on pattern
- Q6_RESPOSTA_A bridges to devolução ("Vou te dizer o que vi"), Q6_RESPOSTA_B provides self-contained closure
- ENCERRAMENTO plays after devolução (or after Q6_RESPOSTA_B if visitor chose "já sabe")

</code_context>

<specifics>
## Specific Ideas

- Phase 21 audit provides CONCRETE rewrite recommendations per devolução (lines 277-288 of 21-02 audit) — planner should use these as starting points, not invent from scratch
- SEEKER devolução needs to distinguish courage from compulsion ("fome" is good start, add Lacanian structure)
- GUARDIAN needs Winnicottian false self ("o que você protege pode ser o que você nunca deixou nascer")
- MIRROR has excellent existing ambiguity — deepen with Lacanian desire reading
- Fallback recommendations in audit lines 313-319 are ready-to-use
- Timeout recommendations in audit lines 331-335 are ready-to-use

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 23-devolucoes-bookends*
*Context gathered: 2026-03-28*
