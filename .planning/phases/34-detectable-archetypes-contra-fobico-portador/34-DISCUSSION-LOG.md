# Phase 34: Detectable Archetypes (CONTRA_FOBICO + PORTADOR) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 34-detectable-archetypes-contra-fobico-portador
**Mode:** `--auto` (Claude selected recommended defaults — no interactive Q&A with user)
**Areas auto-discussed:** Guard location, Priority order, Script content, State machine structure, Helper extensions, Audio generation, Timing validation, Roteiro sync, Test coverage, Wave structure

---

## Auto-Selection Rationale

The user invoked `/gsd:next` which routed to `/gsd:discuss-phase 34 --auto`. Per `MEMORY.md`:
> "Full autonomy mode: User wants Claude to make ALL decisions without interaction. Go to end of implementation."

Claude analyzed all gray areas internally and selected the recommended option for each, grounding decisions in:
1. REQUIREMENTS.md AR-02/AR-03 specs (hard constraints)
2. Phase 31/32/33 verification reports (established patterns)
3. PROJECT.md decisions log (architectural commitments)
4. Existing source code (`patternMatching.ts`, `oracleMachine.ts`, `script.ts`)

---

## Guard Implementation Location

| Option | Description | Selected |
|--------|-------------|----------|
| Add to `patternMatching.ts` `ARCHETYPE_GUARDS` | Per AR-02 requirement text. Extends `PatternContext` interface to include `choiceMap`. Returns to pre-Phase-31 architecture. | ✓ |
| Add to `oracleMachine.ts setup.guards` (inline) | Pattern used by Phase 31/32/33 for POL-02 byte-identity. But POL-02 was scoped to Phases 31-33 only. | |
| Create new file `archetypeGuards.ts` | Cleaner separation but creates indirection without benefit. | |

**Claude's choice:** `patternMatching.ts ARCHETYPE_GUARDS`
**Notes:** AR-02 requirement text explicitly says "guard `isContraFobico` em `patternMatching.ts`". POL-02 invariant is satisfied (Phase 33 verification confirms it), so Phase 34 can edit the file freely as long as the 8 baseline archetype tests stay GREEN.

---

## DEVOLUCAO.always Priority Order

| Option | Description | Selected |
|--------|-------------|----------|
| ESPELHO → CONTRA_FOBICO → PORTADOR → 8 existing | Per AR-02 requirement text. Rare profiles first, then baseline. | ✓ |
| ESPELHO → PORTADOR → CONTRA_FOBICO → 8 existing | Reverse the two new ones — but AR-02 explicitly states the order. | |
| Insert at end (after CONTRADICTED) | Would never trigger because CONTRADICTED is unguarded fallthrough at end. | |

**Claude's choice:** ESPELHO → CONTRA_FOBICO → PORTADOR → MIRROR → DEPTH_SEEKER → SURFACE_KEEPER → PIVOT_EARLY → PIVOT_LATE → SEEKER → GUARDIAN → CONTRADICTED
**Notes:** This is locked by REQUIREMENTS.md AR-02: "ordem nos `always` do DEVOLUCAO: ESPELHO_SILENCIOSO → CONTRA_FOBICO → PORTADOR → 8 atuais"

---

## Script Content — Length

| Option | Description | Selected |
|--------|-------------|----------|
| 5-7 segments, 22-25s target | Matches existing 8 archetypes' rhythm. Conservative timing to preserve max-path headroom. | ✓ |
| 6 segments, 24s target (mirror ESPELHO) | ESPELHO is the meta-archetype with bespoke 6-segment open form — not a template. | |
| Long form 8-10 segments, 30s+ | Would risk blowing 7:30 max-path budget (currently 28.8s headroom). | |

**Claude's choice:** 5-7 segments, 22-25s target
**Notes:** Wave 3 timing validator must exit 0. If a draft blows the budget, trim a segment before closing the phase.

---

## Script Content — Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Echo Q1B/Q5B branch imagery without recap | Mirror gesture established in branch SETUP/RESPOSTA segments. Most consistent with v3.1 absorption principle. | ✓ |
| Quote Winnicott/Lacan/Bion frameworks | Violates v3.0 "zero explicit references" decision (PROJECT.md). | |
| Use new imagery unrelated to branch | Loses thematic coherence — visitor would feel disconnect. | |

**Claude's choice:** Echo branch imagery, absorb (don't quote) frameworks, preserve open form
**Notes:** v3.1 gold-phrase absorption principle still applies. CONTRA_FOBICO echoes "porta no fundo / atravessar o vazio". PORTADOR echoes "memória que pesa / carregar".

---

## State Machine Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 2 new top-level sibling states (clone ESPELHO_SILENCIOSO state shape) | Matches Phase 33 + all 8 existing devoluções. NARRATIVA_DONE → ENCERRAMENTO + 5-min idle reset. | ✓ |
| Compound states with sub-segments | Over-engineered. Devoluções are pure narration with no interaction. | |
| Reuse existing devolução states with branching | Would require adding choice points or context-aware text — violates "static SCRIPT key per state" pattern. | |

**Claude's choice:** 2 new top-level states, structurally identical to DEVOLUCAO_ESPELHO_SILENCIOSO
**Notes:** Direct copy-paste-rename of the Phase 33 state template.

---

## OracleExperience Helper Extensions

| Option | Description | Selected |
|--------|-------------|----------|
| Extend only `getScriptKey` (string-form matchers for top-level states) | Devoluções don't have choice points, fallbacks, or special breathing. Only the script key needs mapping. | ✓ |
| Extend `getScriptKey` + `getBreathingDelay` | Existing devoluções don't customize breathing — no precedent for variance here. | |
| Add ChoiceConfig for archetypes | Archetypes are not questions. No mic activation. No NLU. Wrong abstraction. | |

**Claude's choice:** Extend only `getScriptKey` with two `state.matches('DEVOLUCAO_*')` string-form entries
**Notes:** Mirrors line 226 of OracleExperience.tsx where DEVOLUCAO_ESPELHO_SILENCIOSO is wired with the same pattern.

---

## Audio Generation

| Option | Description | Selected |
|--------|-------------|----------|
| 2 MP3s via `generate-audio-v3.ts` auto-discovery (1 per SCRIPT key) | Matches Phase 33 ESPELHO generation (1 SCRIPT key → 1 MP3). Identical voice/model/format. | ✓ |
| Sub-segment MP3s (one per segment) | Diverges from existing devolução pattern. Not how generate-audio-v3.ts works. | |
| Skip generation, use FallbackTTS only | Violates v2.0 commitment to ElevenLabs v3 narration quality. | |

**Claude's choice:** 2 new MP3s via existing generation script, voice ID `PznTnBc8X6pvixs9UkQm`, eleven_v3, mp3_44100_192
**Notes:** Run script after Wave 1 SCRIPT entries are committed. Total MP3 count: 80 → 82.

---

## Timing Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Extend `pickLongestDevolucao()` + add 4 new path permutations | Phase 33 introduced this helper exactly for this case. Conservative path expansion (20 → ~24). | ✓ |
| Audit full 96-path matrix | Belongs to Phase 35 POL-01 (deferred per CONTEXT.md decision D-22). | |
| Skip timing validation entirely | Risks breaking 7:30 budget silently. Validator must exit 0. | |

**Claude's choice:** Extend pickLongestDevolucao + add 4 new permutations covering Q1B+CONTRA_FOBICO and Q5B+PORTADOR
**Notes:** If max-path > 7:30 after generation, Wave 3 trims segments. Phase 34 cannot close with a failing validator.

---

## Roteiro.html Sync

| Option | Description | Selected |
|--------|-------------|----------|
| 2 new archetype cards + counter update (no Mermaid changes) | Devoluções are not flowchart nodes. Cards are the existing pattern for archetype documentation. | ✓ |
| Full 5-branch + 11-archetype coherence pass | Belongs to Phase 35 POL-03 (deferred). | |
| No roteiro update this phase | Breaks parity rule from MEMORY.md ("After script changes, also update roteiro.html"). | |

**Claude's choice:** 2 new archetype cards + counter text update, no flowchart changes
**Notes:** Phase 35 POL-03 will do the full coherence pass.

---

## Test Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| TDD-per-task (tests inline with each plan) | Pattern from Phase 31/32/33. Tests live alongside the code change in the same wave. | ✓ |
| Separate test plan (Wave 4) | Adds a wave for no benefit. Phase 31/32/33 didn't need this. | |
| Defer all tests to Phase 35 UAT | Violates "no regression of Phase 31/32/33 tests" invariant. | |

**Claude's choice:** TDD-per-task across Waves 1-3, fallback-tts.test.ts baseline updated to 82 in Wave 3
**Notes:** New test count target: ~12-15 tests across patternMatching, oracleMachine, OracleExperience-helpers.

---

## Wave Structure

| Option | Description | Selected |
|--------|-------------|----------|
| 3 waves: data → machine+ui → audio+timing+docs | Matches Phase 31/32/33 exactly. Proven pattern. | ✓ |
| 2 waves: data+machine → audio+ui+docs | Couples machine work with data, leaves UI for last. Risky — UI tests fail without machine wiring. | |
| 4+ waves with separated test wave | Over-decomposed. Each wave should be self-verifying. | |

**Claude's choice:** 3 waves matching Phase 31/32/33 cadence
**Notes:** Plan files will be 34-01-PLAN.md (Wave 1), 34-02-PLAN.md (Wave 2), 34-03-PLAN.md (Wave 3).

---

## Claude's Discretion (delegated decisions)

The following decisions are intentionally NOT pre-locked and will be made by the planner/executor:

1. **Exact wording of CONTRA_FOBICO segments** — drafted in Wave 1, calibrated against ESPELHO_SILENCIOSO tone
2. **Exact wording of PORTADOR segments** — same calibration
3. **Inflection tag selection per segment** — guided by MEMORY.md compatibility list (`warm`, `serious`, `gentle`, `thoughtful`, `sad` confirmed; `whispering` does NOT render with current voice)
4. **`pauseAfter` values** — within established 800-2000ms range
5. **roteiro.html card styling details** — match existing card layout, no new design

---

## Deferred Ideas

- Browser UAT for new archetypes → Phase 35 (UAT-01)
- Full 96-path timing audit + structural mitigation → Phase 35 (POL-01)
- Final POL-03 roteiro coherence pass → Phase 35
- PORTADOR_DE_PERGUNTA variant → Out of scope per REQUIREMENTS.md
- ARCHETYPE_GUARDS unified `choiceMap` refactor → Future cleanup phase

---

*Auto-discussion completed: 2026-04-07*
*Next: `/gsd:plan-phase 34 --auto` (auto-advance enabled)*
