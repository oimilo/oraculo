# Phase 34: Detectable Archetypes (CONTRA_FOBICO + PORTADOR) - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning
**Mode:** `--auto` (full autonomy — Claude selected recommended defaults)

<domain>
## Phase Boundary

Add 2 new detectable devolução archetypes that leverage branch-choice data introduced in Phases 31 and 32:

- **CONTRA_FOBICO** — triggered when visitor stayed in the room AND looked at the thing AND crossed the void (`q1='B' && q2='B' && q1b='A'`). Returns the contra-phobic mirror: courage that walks toward what threatens it.
- **PORTADOR** — triggered when visitor remembered everything AND carries the question AND fused the two (`q4='A' && q5='A' && q5b='A'`). Returns the carrier mirror: the question as treasure, not burden.

Both archetypes are detected via NEW guards inserted into `DEVOLUCAO.always` array between ESPELHO_SILENCIOSO (Phase 33, index [0]) and the 8 existing archetypes. Final guard priority becomes: **ESPELHO_SILENCIOSO → CONTRA_FOBICO → PORTADOR → MIRROR → DEPTH_SEEKER → SURFACE_KEEPER → PIVOT_EARLY → PIVOT_LATE → SEEKER → GUARDIAN → CONTRADICTED (fallthrough)**.

**What's NOT in this phase** (belongs to Phase 35):
- Browser UAT validation
- POL-01 96-path timing audit (Phase 35 will validate full matrix)
- POL-03 final roteiro.html sync to all 5 branches + 11 archetypes (Phase 34 syncs only the 2 new archetype cards)
- Any further patternMatching.ts refactor beyond adding the 2 new guards

</domain>

<decisions>
## Implementation Decisions

### Guard Implementation
- **D-01:** Both new guards (`isContraFobico`, `isPortador`) live in `src/machines/guards/patternMatching.ts` per AR-02 / AR-03 requirement text. They are added to the existing `ARCHETYPE_GUARDS` const export so `oracleMachine.ts` picks them up via the `setup({ guards: ARCHETYPE_GUARDS })` injection that already exists for the 8 baseline archetypes.
- **D-02:** Guards must read `context.choiceMap` (named lookup) — NOT positional `context.choices`. This requires extending the local `PatternContext` interface in `patternMatching.ts` to include `choiceMap?: ChoiceMap`. No change to `OracleContextV4` type — it already has `choiceMap`.
- **D-03:** **POL-02 invariant is RELAXED for this phase.** Phase 31-33 maintained byte-identity of `patternMatching.ts` because the milestone plan deferred archetype work to Phase 34. Phase 34 explicitly modifies `patternMatching.ts` per AR-02 requirement. The deeper invariant (no regression of the 8 existing archetype tests) IS preserved — new guards check different fields and cannot interfere with `determineArchetype()`'s positional logic.
- **D-04:** Trigger logic (locked):
  - `isContraFobico`: `choiceMap.q1 === 'B' && choiceMap.q2 === 'B' && choiceMap.q1b === 'A'`
  - `isPortador`: `choiceMap.q4 === 'A' && choiceMap.q5 === 'A' && choiceMap.q5b === 'A'`
- **D-05:** Both guards return `false` when relevant `choiceMap` fields are missing (visitor never entered the branch). No need for null-safe coercion beyond standard `=== 'A'` comparison.

### Guard Priority Order in DEVOLUCAO.always
- **D-06:** Final array structure (insertions at indices [1] and [2]):
  ```typescript
  always: [
    { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' }, // [0] Phase 33
    { target: 'DEVOLUCAO_CONTRA_FOBICO', guard: 'isContraFobico' },           // [1] Phase 34 NEW
    { target: 'DEVOLUCAO_PORTADOR', guard: 'isPortador' },                    // [2] Phase 34 NEW
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },                         // [3] existing
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },              // [4] existing
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },          // [5] existing
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },                // [6] existing
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },                  // [7] existing
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },                         // [8] existing
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },                     // [9] existing
    { target: 'DEVOLUCAO_CONTRADICTED' },                                       // [10] unguarded fallthrough
  ],
  ```
- **D-07:** Mutual-exclusion analysis (informational, not enforced — guards naturally compose):
  - ESPELHO_SILENCIOSO requires `q6b='B'`. CONTRA_FOBICO and PORTADOR cannot fire alongside it because the array is first-match-wins.
  - CONTRA_FOBICO and PORTADOR can BOTH be true (e.g. `q1=B,q2=B,q1b=A,q4=A,q5=A,q5b=A`). When both fire, CONTRA_FOBICO wins because it's at index [1]. This is intentional — the contra-phobic gesture is the rarer and more dramatic profile.

### Script Content
- **D-08:** Two new top-level SCRIPT keys:
  - `DEVOLUCAO_CONTRA_FOBICO: SpeechSegment[]`
  - `DEVOLUCAO_PORTADOR: SpeechSegment[]`
- **D-09:** Each devolução is **5-7 segments**, target duration **22-28 seconds**, matching the existing 8 archetypes' rhythm. NOT ESPELHO_SILENCIOSO's 6-segment "open form" structure (that's reserved for the meta-archetype).
- **D-10:** Tone follows the established v3.1 3-layer mirror pattern:
  - **CONTRA_FOBICO theme**: courage that walks toward what threatens. Echoes Q1B "A Porta no Fundo" — the visitor who stayed in the burning room AND chose to look AND chose to cross. Mirror the gesture: walking toward emptiness is a form of love. NOT bravado. NOT heroism. The Oracle recognizes the rare profile that confronts what most flee. Use existing inflection vocabulary (`warm`, `serious`, `thoughtful`, `gentle`, `determined`).
  - **PORTADOR theme**: the question as treasure. Echoes Q5B "O Que Já Não Cabe" — the visitor who remembered everything AND carries the question AND fused them into one weight. Mirror the gesture: some questions are not problems to solve, they're cargo you were born to carry. The Oracle names the carrier without diagnosing the load.
- **D-11:** Both scripts MUST avoid: framework names (Winnicott, Lacan, Bion), declarative diagnosis ("Você é..."), gamified language ("você desbloqueou..."). Both scripts MUST contain: at least one moment of `warm` or `gentle` inflection, a closing line that mirrors gesture without prescribing meaning.
- **D-12:** **Claude's discretion** — exact wording is not pre-decided in this CONTEXT. The planner/executor will draft the segments inline during Wave 1. Drafts should be reviewed by reading them aloud against ESPELHO_SILENCIOSO's tone for consistency.

### State Machine Structure
- **D-13:** Two new top-level states `DEVOLUCAO_CONTRA_FOBICO` and `DEVOLUCAO_PORTADOR`, sibling of `DEVOLUCAO_MIRROR` etc. Each state has identical structure to existing devoluções:
  ```typescript
  DEVOLUCAO_CONTRA_FOBICO: {
    on: { NARRATIVA_DONE: 'ENCERRAMENTO' },
    after: {
      300000: {  // 5-min idle reset
        target: '#oracle.IDLE',
        actions: assign({ sessionId: '', choices: [], choiceMap: {}, fallbackCount: 0, currentPhase: 'APRESENTACAO' }),
      },
    },
  },
  ```
- **D-14:** No new compound states, no new sub-machines. These are leaf devolução states that lead to ENCERRAMENTO like all 8 + ESPELHO_SILENCIOSO before them.

### OracleExperience Helper Extensions
- **D-15:** `getScriptKey` — add 2 entries using top-level `state.matches('DEVOLUCAO_CONTRA_FOBICO')` and `state.matches('DEVOLUCAO_PORTADOR')` (string form because they're top-level, mirroring how DEVOLUCAO_ESPELHO_SILENCIOSO is referenced at line 226 of OracleExperience.tsx).
- **D-16:** No changes to `getBreathingDelay`, `getFallbackScript`, `activeChoiceConfig`, `isAguardando`, `isPergunta` — these states are pure narration with no choice point.
- **D-17:** No new `buildChoiceConfig(N)` constants — no QUESTION_META entry for archetypes.

### Audio Generation
- **D-18:** 2 new MP3s generated via `npx ts-node scripts/generate-audio-v3.ts` (auto-discovers from `script.ts`):
  - `devolucao_contra_fobico.mp3`
  - `devolucao_portador.mp3`
- **D-19:** Same generation parameters as Phase 33 ESPELHO_SILENCIOSO: voice ID `PznTnBc8X6pvixs9UkQm`, `eleven_v3` model, `mp3_44100_192` format, inflection tags inlined per segment. Expected size: ~0.5-0.8 MB each (matches ESPELHO_SILENCIOSO at 0.64 MB).
- **D-20:** Total MP3 count after Phase 34: **82 MP3s** (80 from Phase 33 + 2 new).

### Timing Validation
- **D-21:** Update `scripts/validate-timing.ts`:
  - Extend `pickLongestDevolucao()` (added in Phase 33) to consider `DEVOLUCAO_CONTRA_FOBICO` and `DEVOLUCAO_PORTADOR` when their trigger conditions match.
  - Add new path permutations that exercise the new archetypes:
    - Path: Q1B + CONTRA_FOBICO devolução (q1=B, q2=B, q1b=A, then any compatible Q3-Q6 pattern that doesn't trip ESPELHO)
    - Path: Q5B + PORTADOR devolução (q4=A, q5=A, q5b=A, then any compatible Q6 that doesn't trip ESPELHO)
    - Path: Q1B + Q5B + CONTRA_FOBICO (when both trigger, CONTRA_FOBICO wins)
  - Estimated new total: 20 → ~24 paths (4 new permutations).
- **D-22:** **Max-path budget tolerance:** Currently 7:01.2 min with 28.8s headroom under 7:30 budget (Phase 33 result). New devoluções are SUBSTITUTIONS for whatever existing archetype the same choice pattern would have triggered (typically MIRROR, PIVOT_EARLY, or DEPTH_SEEKER for these branchy paths). If the new devolução is significantly LONGER than the displaced one, max-path could exceed 7:30. **Decision: write the scripts targeting 22-25s (3-6s headroom vs ESPELHO at 24s) to give the timing validator slack.** If validator fails, Phase 34 mitigates by trimming one segment. POL-01's full 96-path audit + structural mitigation remains Phase 35's job.
- **D-23:** Validator must still exit 0 at end of Phase 34. If max-path exceeds 7:30, Wave 3 must trim before Phase 34 closes.

### Roteiro Sync
- **D-24:** Update `public/roteiro.html`:
  - Add 2 new archetype cards in the devoluções section (matching the existing card layout used for the 8 baseline + ESPELHO).
  - Update any "ramificações" / archetype counter text to reflect 11 archetypes total (was 9 after Phase 33: 8 original + ESPELHO).
  - **No Mermaid flowchart changes** — devoluções are not nodes in the flowchart, only branches are.
- **D-25:** Card content: title (CONTRA_FOBICO / PORTADOR), trigger description in plain Portuguese ("quem ficou olhando o fogo e atravessou o vazio" / "quem lembrou tudo e carrega a pergunta como tesouro"), 1-2 sentence excerpt from the script, color/styling consistent with existing cards.

### Test Coverage
- **D-26:** New tests in `src/machines/guards/__tests__/patternMatching.test.ts`:
  - `isContraFobico` returns `true` for `{q1:'B',q2:'B',q1b:'A'}` and false for negation cases.
  - `isPortador` returns `true` for `{q4:'A',q5:'A',q5b:'A'}` and false for negation cases.
  - Both guards return `false` when `choiceMap` is empty / fields missing.
  - Existing `determineArchetype()` tests MUST remain GREEN (POL-02 spirit: no regression of pattern logic).
- **D-27:** New tests in `src/machines/oracleMachine.test.ts`:
  - `DEVOLUCAO.always` priority test: ESPELHO_SILENCIOSO wins over CONTRA_FOBICO when both trigger.
  - CONTRA_FOBICO wins over MIRROR/SEEKER/etc. when its trigger is set.
  - PORTADOR wins over MIRROR/SEEKER/etc. when its trigger is set.
  - CONTRA_FOBICO wins over PORTADOR when both triggers fire (priority order test).
  - Visitor that doesn't trip any new guard still routes through one of the 8 baseline archetypes.
- **D-28:** New tests in `src/components/experience/__tests__/OracleExperience-helpers.test.ts`:
  - `getScriptKey` returns `'DEVOLUCAO_CONTRA_FOBICO'` for the new top-level state.
  - `getScriptKey` returns `'DEVOLUCAO_PORTADOR'` for the new top-level state.
- **D-29:** Update `src/services/tts/__tests__/fallback-tts.test.ts` baseline from 80 → 82 SCRIPT keys.
- **D-30:** Total baseline target after Phase 34: previous 696/714 passing + ~12-15 new tests, all GREEN. Known failures (`voice-flow-integration.test.ts`, `ambient-player.test.ts`) remain out of scope.

### Wave Structure (Plan Shape)
- **D-31:** Phase 34 follows the **3-wave pattern** established by Phases 31, 32, 33:
  - **Wave 1 (34-01) — Data + Types:** SCRIPT keys (`DEVOLUCAO_CONTRA_FOBICO`, `DEVOLUCAO_PORTADOR`), `Script` interface extension, `DevolucaoArchetype` union extension to include `'CONTRA_FOBICO'` and `'PORTADOR'`. POL-02 verification: existing 8 archetype tests still GREEN. No machine changes yet.
  - **Wave 2 (34-02) — Guards + Machine + UI:** Add `isContraFobico` + `isPortador` to `patternMatching.ts` `ARCHETYPE_GUARDS`. Insert 2 new states in `oracleMachine.ts`. Insert 2 new entries at `DEVOLUCAO.always[1]` and `[2]`. Extend `OracleExperience.tsx` `getScriptKey`. Add machine + helper tests. Verify Phase 31/32/33 regression suite still GREEN.
  - **Wave 3 (34-03) — Audio + Timing + Roteiro:** Generate 2 new MP3s. Extend `validate-timing.ts` with new paths and updated `pickLongestDevolucao`. Update `public/roteiro.html` with 2 new archetype cards. Update `fallback-tts.test.ts` baseline. Final regression run.

### Folded Todos
[None — `gsd-tools todo match-phase 34` returned 0 matches.]

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Vision, milestones, key decisions (especially v6.0 deep branching rationale, line 142-143)
- `.planning/REQUIREMENTS.md` §v6.0 Requirements — AR-02 (lines 21-22), AR-03 (line 22) define the trigger logic and priority order constraints
- `.planning/ROADMAP.md` §Phase 34 (lines 165-170) — phase goal statement
- `.planning/STATE.md` — current progress and dependencies

### Prior Phase Verification (Phase 34 builds on top of these)
- `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-VERIFICATION.md` — Q1B branch shipped, choiceMap.q1b populated by Q1B_AGUARDANDO
- `.planning/phases/32-q5b-branch-paraiso-gap-closure/32-VERIFICATION.md` — Q5B branch shipped, choiceMap.q5b populated by Q5B_AGUARDANDO
- `.planning/phases/33-q6b-espelho-silencioso/33-VERIFICATION.md` — Q6B + ESPELHO_SILENCIOSO shipped, DEVOLUCAO.always[0] insertion pattern, top-level state pattern, `pickLongestDevolucao` introduced in `validate-timing.ts`

### Source Code Anchors (read before modifying)
- `src/machines/guards/patternMatching.ts` — existing 8 archetype guards using positional `context.choices`. New guards extend `ARCHETYPE_GUARDS` const export but read `context.choiceMap` instead.
- `src/machines/oracleMachine.ts:48-55` — Phase 31/33 guards (`shouldBranchQ1B`, `shouldBranchQ6B`, `isEspelhoSilencioso`) showing `context.choiceMap` access pattern
- `src/machines/oracleMachine.ts:674-688` — DEVOLUCAO.always array (Phase 33) — insertion site for new guards at indices [1] and [2]
- `src/machines/oracleMachine.ts:694-709` — top-level `DEVOLUCAO_ESPELHO_SILENCIOSO` state — template for new states
- `src/data/script.ts:565-570` — `DEVOLUCAO_MIRROR` — template for tone/length of new archetype scripts
- `src/data/script.ts:580-587` — `DEVOLUCAO_ESPELHO_SILENCIOSO` — template for inflection tag usage
- `src/components/experience/OracleExperience.tsx:226` — top-level state matcher pattern for devoluções
- `src/types/index.ts` — `DevolucaoArchetype` union (must extend) and `ChoiceMap` type (already has q1b/q5b/q6b after POL-02)
- `scripts/generate-audio-v3.ts` — auto-discovery from script.ts (no script changes needed, just run after Wave 1)
- `scripts/validate-timing.ts` — `pickLongestDevolucao()` helper added in Phase 33 (must be extended)

### Conventions (from CLAUDE.md)
- `CLAUDE.md` §Common Tasks "Change script text" — workflow for SCRIPT key + MP3 regeneration
- `CLAUDE.md` §Conventions — naming, test placement, type style
- `MEMORY.md` §Patterns Learned — voice ID + inflection tag compatibility (`whispering` doesn't render — use `warm`/`gentle` instead)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`ARCHETYPE_GUARDS` const in patternMatching.ts** — already wired into `oracleMachine.ts` via `setup({ guards: ... })`. Adding new keys to this object automatically makes them available as guard names in machine config.
- **`createArchetypeGuard()` factory in patternMatching.ts** — NOT reusable for new guards because it's tied to `determineArchetype()` (positional logic). New guards are bespoke functions that read `choiceMap` directly.
- **`pickLongestDevolucao()` in validate-timing.ts** (added Phase 33) — must be extended to consider new archetypes. Currently picks the worst-case devolução across the 8 baseline + ESPELHO. New version picks across 8 + ESPELHO + CONTRA_FOBICO + PORTADOR.
- **`buildChoiceConfig()` in OracleExperience.tsx** — NOT used for archetypes. Skip.
- **`SpeechSegment[]` type and inflection tag inlining** — directly reusable for new SCRIPT entries.
- **DEVOLUCAO_ESPELHO_SILENCIOSO state shape (`oracleMachine.ts:694-709`)** — direct template for both new states. Copy structure exactly, change names.

### Established Patterns
- **Guard injection**: Adding to `ARCHETYPE_GUARDS` export → automatically picked up by `setup({ guards: ARCHETYPE_GUARDS })` in machine. Phase 31/32/33 used `oracleMachine.ts setup.guards` inline because of POL-02 byte-identity rule. Phase 34 returns to the original pattern (extend `patternMatching.ts`).
- **DEVOLUCAO state shape**: All devolução states are top-level siblings, all transition `NARRATIVA_DONE → ENCERRAMENTO`, all have 5-min idle reset. No exceptions.
- **OracleExperience helper convention**: nested states use `state.matches({ COMPOUND: 'CHILD' })` object syntax; top-level states use `state.matches('STATE_NAME')` string syntax.
- **TDD-per-task**: Phase 31/32/33 wrote tests alongside implementation in each plan, not as a separate test plan. Phase 34 follows suit.
- **Wave 1 → Wave 2 → Wave 3 sequencing**: data → machine+ui → audio+timing+docs. Each wave includes its own regression run before commit.

### Integration Points
- `oracleMachine.ts` `setup({ guards })` block — expanding `ARCHETYPE_GUARDS` automatically registers new names; oracleMachine.ts reads from the `ARCHETYPE_GUARDS` import (no manual wiring needed beyond the machine config that uses `'isContraFobico'` / `'isPortador'` strings in the always array).
- `DEVOLUCAO.always` array — insertion at indices [1] and [2], pushing existing entries down by 2. This is a structural change that 33-VERIFICATION.md's structural test will need updating.
- `script.ts` exports the entire `SCRIPT` const — `generate-audio-v3.ts` walks all top-level keys and generates one MP3 per key. No registration step.
- `roteiro.html` is static HTML — manual edit, no template engine.

### Key Constraints (from prior phases)
- **No regression of POL-02 spirit**: existing 8 archetype tests in `patternMatching.test.ts` (59 currently passing) MUST stay GREEN. New guards do not call `determineArchetype()`, so positional logic is untouched.
- **No regression of Phase 31/32/33 tests**: machine tests (118), helpers tests (23), question-meta tests (30), script-v3 tests, fallback-tts (7) — all must stay GREEN. fallback-tts test asserts SCRIPT key count → must be bumped from 80 to 82.
- **Max-path ≤ 7:30 min**: validator must exit 0 after Phase 34. Currently at 7:01.2 with 28.8s headroom — new devoluções must not blow this. Target each new script at 22-25s.
- **POL-02 rule (Phase 31-33)**: byte-identity of `patternMatching.ts`. **Phase 34 explicitly relaxes this** because the requirement text for AR-02 instructs editing this file. The deeper invariant (no breaking the 8 archetypes) is preserved.

</code_context>

<specifics>
## Specific Ideas

### CONTRA_FOBICO content directions (Claude's discretion to draft)
- The Q1B branch already established the imagery: "porta no fundo", "câmara que ainda está queimando", "atravessar o vazio". The CONTRA_FOBICO devolução should ECHO this imagery without recapping it.
- The mirror gesture: "Você não foge do que arde. Isso não é coragem. É outra coisa — algo mais raro." (illustrative, not locked)
- Closing should refuse to name the visitor — preserve the open form even while delivering content (unlike SEEKER/GUARDIAN which name).
- Contrast with PIVOT_EARLY: PIVOT_EARLY pivots toward depth across the journey. CONTRA_FOBICO walks INTO depth from the very first choice. Different gesture, different mirror.

### PORTADOR content directions (Claude's discretion to draft)
- The Q5B branch established: "memória inteira que pesa", "pergunta que não cabe no jardim", "carregar". The PORTADOR devolução echoes this weight without repeating the words.
- The mirror gesture: "Algumas perguntas não são problemas. São cargas." (illustrative, not locked)
- Closing should distinguish PORTADOR from GUARDIAN — both are protective profiles, but GUARDIAN holds against, PORTADOR holds for. The carrier IS the inheritance.

### Reference for tone calibration
Read DEVOLUCAO_MIRROR (script.ts:565-570), DEVOLUCAO_GUARDIAN, DEVOLUCAO_DEPTH_SEEKER aloud before drafting. The new devoluções should feel like they could have been there from the start — not "added on" by a later phase.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
[None — no todos surfaced for Phase 34.]

### Out of Phase 34 scope
- **Browser UAT for new archetypes** — deferred to Phase 35 (UAT-01)
- **Full 96-path timing audit + structural mitigation** — deferred to Phase 35 (POL-01 full)
- **Final POL-03 roteiro.html sync** (5 branches + 11 archetypes coherence pass) — deferred to Phase 35
- **PORTADOR_DE_PERGUNTA variant** — declared out of scope in REQUIREMENTS.md ("Diferenciação muito sutil para o Bienal — uma única forma é suficiente")
- **More than 2 new archetypes** — milestone scope is fixed at 2 (CONTRA_FOBICO + PORTADOR). No additional archetypes (e.g., FUGITIVO, OBSERVADOR) regardless of how interesting branch combinations look.
- **Refactor ARCHETYPE_GUARDS to use a unified `choiceMap` interface** — deferred. Phase 34 keeps the dual-shape (positional `choices` for the 8 baseline + named `choiceMap` for the 2 new) to minimize blast radius. Refactor candidate for future cleanup phase.

</deferred>

---

*Phase: 34-detectable-archetypes-contra-fobico-portador*
*Context gathered: 2026-04-07*
*Auto mode: Claude selected recommended defaults — review decisions D-01 through D-31 before planning*
