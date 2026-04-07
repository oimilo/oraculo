# Phase 32: Q5B Branch (Paraíso Gap Closure) — Research

**Researched:** 2026-04-07
**Domain:** Conditional branch insertion in XState v5 oracle machine — Paraíso phase
**Confidence:** HIGH (Phase 31 just shipped the exact same pattern; this phase mirrors it inside PARAISO)

## Summary

Phase 32 closes the only remaining branching gap in v6.0: **Paraíso has zero conditional depth**, while Inferno (Q1B + Q2B) and Purgatório (Q4B) each have one or two conditional branches. The fix is to insert **Q5B "O Que Já Não Cabe"** — a conditional branch that fires only when the visitor `(q4='A' && q5='A')`, i.e. someone who chose to *remember everything* in Purgatório AND chose to *carry the unanswered question* in Paraíso. That visitor profile is the future PORTADOR archetype (Phase 34): a person who fuses memory with the unanswerable, who turns weight into shape rather than discarding it.

Phase 31 (Q1B) shipped only days ago and is the canonical template — same 3-wave structure, same 6-SCRIPT-key anatomy, same machine-state shape, same 6 OracleExperience helper extensions, same 6 MP3 generation step, same `validate-timing.ts` permutation update, same `roteiro.html` documentation update. This research re-uses Phase 31's proven recipe and adapts it to Paraíso's structural realities (which are simpler than Inferno's because Q5B never crosses a phase boundary).

The single non-trivial difference: Q5B branches off `Q5_RESPOSTA_A` and rejoins `Q6_SETUP` — both within the same PARAISO compound state. Unlike Q1B (which has to qualified-target `#oracle.PURGATORIO`), Q5B's rejoin is a sibling-state target string (`'Q6_SETUP'`).

**Primary recommendation:** Mirror Phase 31's 3-wave structure exactly. Wave 1 = data + types (script keys, QUESTION_META[10], QuestionId already extends — POL-02 done). Wave 2 = machine guard + 6 states + OracleExperience helpers. Wave 3 = 6 MP3s + validate-timing.ts permutation matrix expansion + roteiro.html documentation. Total estimated effort: ~4-6 hours including generation/test cycles.

## User Constraints (from CONTEXT.md)

> No CONTEXT.md exists for Phase 32 — `skip_discuss=true` is set in `.planning/config.json`. Constraints below derived from PROJECT.md, REQUIREMENTS.md, and CLAUDE.md.

### Locked Decisions (from PROJECT.md / REQUIREMENTS.md / v6.0 milestone)

- **BR-02 spec is fixed**: `q4='A' && q5='A'` is the trigger; QUESTION_META index is **10** (Q1B claimed 9 in Phase 31); machine states must be `Q5B_*`; OracleExperience must be extended; 6 MP3s must be generated.
- **Branch theme is locked**: "O Que Já Não Cabe" (the title in REQUIREMENTS.md and v6.0-ROADMAP.md). The semantic axis pairs with the future PORTADOR archetype.
- **POL-02 is already complete** from Phase 31 — `oracleMachine.types.ts` already has `q5b?: ChoiceAB` in `ChoiceMap` and `'q5b'` in `QuestionId`. **Do not re-modify those types**; the planner must verify they're untouched.
- **patternMatching.ts is OFF-LIMITS** — POL-02 invariant says it stays byte-identical to v4.0 (verified in Phase 31 verification). The PORTADOR guard (Phase 34) is the correct place to consume `q5b`, not Phase 32.
- **Voice is `PznTnBc8X6pvixs9UkQm`** (Oracle voice). Working inflection tags: `warm`, `serious`, `gentle`, `determined`, `thoughtful`, `sad`. **Do NOT use `[whispering]`** — confirmed broken with this voice (CLAUDE.md MEMORY note).
- **PT-BR only**, no English in narration.
- **Zero text on screen** during the experience (UI-05): script entries are spoken via TTS, never rendered visually.
- **Max-path budget**: ≤ 450s (7:30 min). Phase 31 left 76s of headroom (376s used / 450s budget). Q5B will eat ~30-45s of that headroom.

### Claude's Discretion

- **Narrative content of the 6 SCRIPT keys** — exact wording, segment count (within Phase 31's anatomy), inflection tag choices, pause durations. Three concrete options proposed below.
- **Keyword sets** for Q5B QUESTION_META[10] — must reflect the chosen narrative direction.
- **Fallback + timeout content** — should rhyme with the branch's emotional register.
- **Whether the rejoin uses sibling-state-name `'Q6_SETUP'` or qualified `#oracle.PARAISO.Q6_SETUP`** — XState v5 supports both; sibling string is idiomatic and matches how Q4_RESPOSTA_A currently transitions internally to Q4_TIMEOUT/Q4B_SETUP.

### Deferred Ideas (OUT OF SCOPE for Phase 32)

- **PORTADOR archetype detection** — Phase 34 (AR-03) work. Phase 32 only writes the data primitive (q5b in choiceMap); detection logic does not change.
- **Updating ChoiceMap type** — already done in Phase 31 (POL-02). Touching it again is regression risk.
- **Browser UAT of Q5B path** — Phase 35 (UAT-01) work.
- **96-permutation validation matrix** — Phase 35 (POL-01) work. Phase 32 only adds Q5B-aware paths to the existing 6→12 permutation matrix in `validate-timing.ts`.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **BR-02** | Visitor com `q4='A' && q5='A'` (lembrou tudo E carrega a pergunta) ouve a branch Q5B "O Que Já Não Cabe" — 6 SCRIPT keys, QUESTION_META[10], guard `shouldBranchQ5B`, estados Q5B_*, OracleExperience extended, 6 MP3s gerados | Sections 2 (pattern from Phase 31), 3 (narrative proposals), 4 (machine integration), 5 (timing impact), 6 (validation), 7 (files), 8 (risks) below |

## 1. Domain Context — Paraíso in the Current Machine

### What Paraíso looks like today (post-Phase 31)

Paraíso is the simplest of the three realms because it has no conditional branches yet. Its structure (from `oracleMachine.ts` lines ~457-590, roughly):

```
PARAISO (id: 'PARAISO', initial: 'INTRO')
├── INTRO            ─NARRATIVA_DONE→ Q5_SETUP
├── Q5_SETUP         ─NARRATIVA_DONE→ Q5_PERGUNTA
├── Q5_PERGUNTA      ─NARRATIVA_DONE→ Q5_AGUARDANDO
├── Q5_AGUARDANDO    ─CHOICE_A→ Q5_RESPOSTA_A  (recordChoice('q5','A'))
│                    ─CHOICE_B→ Q5_RESPOSTA_B  (recordChoice('q5','B'))
│                    ─after 25s→ Q5_TIMEOUT
├── Q5_TIMEOUT       ─NARRATIVA_DONE→ Q5_AGUARDANDO  (retry, with fallbackCount++)
├── Q5_RESPOSTA_A    ─NARRATIVA_DONE→ Q6_SETUP    ← Q5B BRANCH POINT
├── Q5_RESPOSTA_B    ─NARRATIVA_DONE→ Q6_SETUP
├── Q6_SETUP         ─NARRATIVA_DONE→ Q6_PERGUNTA
├── Q6_PERGUNTA      ─NARRATIVA_DONE→ Q6_AGUARDANDO
├── Q6_AGUARDANDO    ─CHOICE_A→ Q6_RESPOSTA_A
│                    ─CHOICE_B→ Q6_RESPOSTA_B
│                    ─after 25s→ Q6_TIMEOUT
├── Q6_TIMEOUT       ─NARRATIVA_DONE→ Q6_AGUARDANDO  (retry)
├── Q6_RESPOSTA_A    ─NARRATIVA_DONE→ #oracle.DEVOLUCAO  (qualified target — exits PARAISO)
└── Q6_RESPOSTA_B    ─NARRATIVA_DONE→ #oracle.DEVOLUCAO
```

### What Q4 and Q5 establish in the visitor's profile

| Question | A choice meaning | B choice meaning | What `A && A` says about visitor |
|----------|------------------|------------------|-----------------------------------|
| **Q4** "Qual água? Lembrar ou esquecer?" | **Lembrar** — carrega a história, identidade tecida de cicatrizes | **Esquecer** — alívio total, ausência | Visitor refused the river of forgetting. They want to be the sum of what they survived. |
| **Q5** "Você carrega a pergunta — ou deixa ela dissolver?" | **Carregar** — o peso do não-saber como companhia | **Deixar dissolver** — confiar que nem tudo precisa ser carregado | Visitor refused to release the unanswerable. They form a vessel out of the question itself. |

**Combined `q4='A' && q5='A'` profile:** *"I remembered everything. Now I carry the unanswerable. Both at once."* That's the **PORTADOR** signature — someone whose identity is built from accumulation rather than release. This is the visitor profile Q5B exists to deepen.

### Where Q5B inserts (the surgical answer)

**Branch point**: The `NARRATIVA_DONE` transition out of `Q5_RESPOSTA_A` (currently unconditional `target: 'Q6_SETUP'`) becomes a guarded array:

```typescript
Q5_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q5B_SETUP', guard: 'shouldBranchQ5B' },  // q4=A AND q5=A
      { target: 'Q6_SETUP' },                              // default fallthrough
    ],
  },
},
```

**Critical**: The guard reads `context.choiceMap.q4` and `context.choiceMap.q5`. By the time `Q5_RESPOSTA_A` fires `NARRATIVA_DONE`, both have already been recorded by `recordChoice('q5','A')` and (earlier) `recordChoice('q4','A')`. So the guard is evaluable — no race condition. (Verified by mirror with Phase 31's `shouldBranchQ1B`, which reads `q1` and `q2` after `Q2_RESPOSTA_B` fires.)

**Rejoin point**: Both Q5B responses (`Q5B_RESPOSTA_A`, `Q5B_RESPOSTA_B`) transition to `'Q6_SETUP'` — a sibling state inside PARAISO. **No qualified target needed** — this is a sibling reference within the same compound state.

> **Difference from Phase 31**: Q1B's rejoin is `#oracle.PURGATORIO` (qualified target — Q1B lives in INFERNO and rejoins PURGATORIO, crossing a phase boundary). Q5B is simpler: it lives in PARAISO and rejoins another PARAISO sibling. No `#oracle.` prefix required.

### `currentPhase` context value

`currentPhase` is set when the realm is entered (`entry: assign({ currentPhase: 'PARAISO' })` on the PARAISO state). Q5B substates inherit that value automatically — **no additional `entry` action needed** on Q5B states. (Verified by checking how Q1B substates work in Phase 31: they inherit `currentPhase: 'INFERNO'` from the parent INFERNO state and never re-assign it.)

## 2. Implementation Pattern from Phase 31 (concrete steps)

Phase 31 shipped Q1B in 3 waves with this exact distribution. Phase 32 should follow it byte-for-byte (substituting Q5B for Q1B and the appropriate file lines).

### Wave 1: Data + Types (~1-1.5h)

**Files modified:**
1. `src/data/script.ts` — Insert 6 new SCRIPT keys after `PARAISO_Q5_RESPOSTA_B`, before `PARAISO_Q6_SETUP`. Use the section header comment block style from Q1B (lines 229-235 in script.ts):
   - `PARAISO_Q5B_SETUP` (multi-segment array, ~3 segments)
   - `PARAISO_Q5B_PERGUNTA` (1 segment, no inflection — questions never have inflection tags in this codebase, verified in script.ts)
   - `PARAISO_Q5B_RESPOSTA_A` (multi-segment array, ~2 segments)
   - `PARAISO_Q5B_RESPOSTA_B` (multi-segment array, ~2 segments)
   - `FALLBACK_Q5B` (1 segment)
   - `TIMEOUT_Q5B` (1 segment)
2. `src/types/index.ts` — Append `QUESTION_META[10]` entry (Q1B is 9, Q5B becomes 10):
   ```typescript
   10: {
     id: 10,
     phase: 'PARAISO',
     // theme + label + keywords (TBD by content choice)
     optionA: 'Fundir',
     optionB: 'Ordenar',
     keywordsA: [/* see content proposals below */],
     keywordsB: [/* see content proposals below */],
     defaultOnTimeout: 'A',
     questionContext: '...',  // PT-BR sentence for Claude Haiku NLU
   },
   ```
3. `src/machines/oracleMachine.types.ts` — **VERIFY ONLY**, do not modify. The `QuestionId` union already contains `'q5b'` (added in Phase 31's POL-02 work). The `recordChoice` helper already supports `q5b` because `ChoiceMap` uses `Partial<Record<QuestionId, ChoiceAB>>`. **Tasks must include a `tsc --noEmit` step that confirms the types still compile cleanly with the new state references.**

**Tests added in Wave 1:**
- `src/data/__tests__/script.test.ts` (or similar) — assert the 6 new keys exist, have correct shape (`SpeechSegment[]`), text is non-empty, inflection tags are from the allowed set.
- `src/types/__tests__/QUESTION_META.test.ts` (or similar) — assert `QUESTION_META[10]` exists with all required fields, keyword arrays non-empty, no overlap with adjacent meta entries.
- TypeScript compilation: `npx tsc --noEmit` must pass.

### Wave 2: Machine + UI Integration (~1.5-2h)

**Files modified:**
1. `src/machines/oracleMachine.ts`
   - Add guard `shouldBranchQ5B` to the `guards` block (next to `shouldBranchQ1B` around line 44):
     ```typescript
     shouldBranchQ5B: ({ context }) => context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A',
     ```
   - Modify `Q5_RESPOSTA_A` (currently around line 512) to use the guarded array transition (see Section 1 above).
   - Add 6 new states inside the `PARAISO.states` block, immediately after `Q5_RESPOSTA_B`, before `Q6_SETUP`:
     ```typescript
     Q5B_SETUP: { on: { NARRATIVA_DONE: 'Q5B_PERGUNTA' } },
     Q5B_PERGUNTA: { on: { NARRATIVA_DONE: 'Q5B_AGUARDANDO' } },
     Q5B_AGUARDANDO: {
       entry: assign({ currentChoiceTimeout: 25000 }),
       on: {
         CHOICE_A: { target: 'Q5B_RESPOSTA_A', actions: 'recordQ5BChoiceA' },
         CHOICE_B: { target: 'Q5B_RESPOSTA_B', actions: 'recordQ5BChoiceB' },
       },
       after: { 25000: { target: 'Q5B_TIMEOUT', actions: 'incrementFallbackCount' } },
     },
     Q5B_TIMEOUT: { on: { NARRATIVA_DONE: 'Q5B_AGUARDANDO' } },
     Q5B_RESPOSTA_A: { on: { NARRATIVA_DONE: 'Q6_SETUP' } },  // sibling target — no #oracle. prefix
     Q5B_RESPOSTA_B: { on: { NARRATIVA_DONE: 'Q6_SETUP' } },
     ```
   - Add the two new actions to the `actions` block (mirror `recordQ1BChoiceA/B`):
     ```typescript
     recordQ5BChoiceA: assign({
       choiceMap: ({ context }) => ({ ...context.choiceMap, q5b: 'A' as ChoiceAB }),
       choices: ({ context }) => [...context.choices, 'A' as ChoiceAB],
     }),
     recordQ5BChoiceB: assign({
       choiceMap: ({ context }) => ({ ...context.choiceMap, q5b: 'B' as ChoiceAB }),
       choices: ({ context }) => [...context.choices, 'B' as ChoiceAB],
     }),
     ```
   > **VERIFY** the exact action shape against Phase 31's `recordQ1BChoiceA/B` in oracleMachine.ts before committing — Phase 31 may have used a slightly different helper function name (`recordChoice('q1b', 'A')`). The planner should grep for `recordQ1BChoiceA` and copy its exact pattern.

2. `src/machines/__tests__/oracleMachine.test.ts` (or similar) — Add ~10-12 tests:
   - **Trigger tests** (4): Q5B fires when q4=A && q5=A; does NOT fire when q4=B && q5=A; does NOT fire when q4=A && q5=B; does NOT fire when q4=B && q5=B.
   - **State sequence tests** (4): Q5B_SETUP → Q5B_PERGUNTA → Q5B_AGUARDANDO → (CHOICE_A | CHOICE_B); Q5B_AGUARDANDO timeout → Q5B_TIMEOUT → Q5B_AGUARDANDO retry.
   - **Rejoin tests** (2): Q5B_RESPOSTA_A → Q6_SETUP; Q5B_RESPOSTA_B → Q6_SETUP.
   - **ChoiceMap tests** (2): After Q5B_AGUARDANDO + CHOICE_A, `context.choiceMap.q5b === 'A'`; after CHOICE_B, `context.choiceMap.q5b === 'B'`.
   - **Backward compat smoke test** (1): A visitor with q4=B (skipping Q5B entirely) goes Q5_RESPOSTA_A → Q6_SETUP without ever entering Q5B states. **Important:** also assert the unrelated v4.0 path tests (496 baseline tests + 18 Q1B tests = 514+) still pass — no regressions to Phase 31 tests.

3. `src/components/experience/OracleExperience.tsx` — 6 helper extensions (mirror lines 161-166, 219-220, 271-272, 285-286, 332-333 where Q1B was added):
   - **`buildChoiceConfig(10)`** at top (line 49 area): `const Q5B_CHOICE = buildChoiceConfig(10);`
   - **`getBreathingDelay`**:
     - Add `if (machineState.matches({ PARAISO: 'Q5B_SETUP' })) return MEDIUM;` (with the other MEDIUM realm setups around lines 113-115)
     - Add `if (machineState.matches({ PARAISO: 'Q5B_RESPOSTA_A' })) return MEDIUM;` (with PARAISO responses; Q5B is intra-realm so MEDIUM, not LONG)
     - Add `if (machineState.matches({ PARAISO: 'Q5B_RESPOSTA_B' })) return MEDIUM;` (same — Q5B rejoins Q6_SETUP within PARAISO, not crossing a phase boundary)
     - Add `if (machineState.matches({ PARAISO: 'Q5B_PERGUNTA' })) return NONE;` (with the other NONE perguntas around lines 121-129)
   - **`getScriptKey`** (around line 192-198): Add 6 mappings:
     ```typescript
     if (machineState.matches({ PARAISO: 'Q5B_SETUP' })) return 'PARAISO_Q5B_SETUP';
     if (machineState.matches({ PARAISO: 'Q5B_PERGUNTA' })) return 'PARAISO_Q5B_PERGUNTA';
     if (machineState.matches({ PARAISO: 'Q5B_RESPOSTA_A' })) return 'PARAISO_Q5B_RESPOSTA_A';
     if (machineState.matches({ PARAISO: 'Q5B_RESPOSTA_B' })) return 'PARAISO_Q5B_RESPOSTA_B';
     if (machineState.matches({ PARAISO: 'Q5B_TIMEOUT' })) return 'TIMEOUT_Q5B';
     ```
     (No Q5B_AGUARDANDO mapping — AGUARDANDO states return null for getScriptKey.)
   - **`getFallbackScript`** (around line 224): Add `if (machineState.matches({ PARAISO: 'Q5B_AGUARDANDO' })) return { segments: SCRIPT.FALLBACK_Q5B, key: 'FALLBACK_Q5B' };`
   - **`activeChoiceConfig` useMemo** (around line 276): Add `if (state.matches({ PARAISO: 'Q5B_AGUARDANDO' })) return Q5B_CHOICE;`
   - **`isAguardando` boolean** (around line 290): Add `state.matches({ PARAISO: 'Q5B_AGUARDANDO' }) ||`
   - **`isPergunta` boolean** (around line 337): Add `state.matches({ PARAISO: 'Q5B_PERGUNTA' }) ||`

   > **Critical**: BOTH the `isAguardando` chain AND the `isPergunta` chain must include Q5B. Phase 31 verified that omitting `isPergunta` causes the mic warm-up to lag and the first ~1s of voice input gets dropped.

4. **Smoke tests for OracleExperience** (~7 tests, mirror Phase 31's 31-02-PLAN.md Wave 2 task 2 tests):
   - `getScriptKey` returns the right key for each Q5B state.
   - `getBreathingDelay` returns expected values for Q5B_* states.
   - `getFallbackScript` returns FALLBACK_Q5B for Q5B_AGUARDANDO.
   - `Q5B_CHOICE` config has correct keywords from QUESTION_META[10].
   - `isAguardando` and `isPergunta` correctly include Q5B states.
   - `activeChoiceConfig` returns Q5B_CHOICE in Q5B_AGUARDANDO and null elsewhere.

### Wave 3: Audio + Timing + Documentation (~1.5-2h)

**Files modified:**
1. **6 MP3s in `public/audio/prerecorded/`** — generated by running:
   ```bash
   npx tsx scripts/generate-audio-v3.ts
   ```
   The script auto-discovers SCRIPT keys (`Object.keys(SCRIPT)` at line 171) and skips files that already exist. So as long as the 6 new keys are spelled with the canonical `paraiso_q5b_*.mp3` / `fallback_q5b.mp3` / `timeout_q5b.mp3` filenames (which the script derives from `${key.toLowerCase()}.mp3`), they will generate automatically without code changes. **No changes to `generate-audio-v3.ts` required.**
   - File names produced (verified by tracing line 199 `${key.toLowerCase()}.mp3`):
     - `paraiso_q5b_setup.mp3`
     - `paraiso_q5b_pergunta.mp3`
     - `paraiso_q5b_resposta_a.mp3`
     - `paraiso_q5b_resposta_b.mp3`
     - `fallback_q5b.mp3`
     - `timeout_q5b.mp3`
   - Phase voice settings for PARAISO: `{ stability: 0.40, similarity_boost: 0.70, style: 0.25 }` (line 56). Q5B inherits these because `getPhaseForKey('PARAISO_Q5B_*')` returns `'PARAISO'` (line 68).
   - Each MP3 generated with rate-limited 1s pause between API calls. Expect ~10-15s total generation time. ~1MB total.
   - Cost: ~$0.30 estimate (well within v6.0 budget).

2. **`scripts/validate-timing.ts`** — Update the path matrix from 6 paths to 12 paths (add Q5B independence dimension):
   - Q5B is **independent** of Q1B and Q2B (they are in INFERNO; Q5B is in PARAISO). Q5B is **independent** of Q4B (Q4B is q3=A && q4=A; Q5B is q4=A && q5=A — they overlap on q4=A but coexist freely).
   - Therefore the new permutation matrix doubles each existing row by adding `hasQ5B: false | true`. Old 6 paths × Q5B yes/no = **12 paths**.
   - Add `hasQ5B: boolean` to `PathConfig` interface (around line 122).
   - Add Q5B path-firing requirements in the comment header: "**Q5B triggers when q4=A AND q5=A**". Note that Q5B is **partially compatible with Q4B** (both want q4=A) — but Q4B requires q3=A which Q5B doesn't constrain. So a path with `hasQ4B: true && hasQ5B: true` is the worst case for Paraíso depth.
   - Insert `Q5B` section after `PARAISO_Q5_RESPOSTA_*` block in `calculatePath` (around line 199):
     ```typescript
     if (config.hasQ5B) {
       sections.push({ name: 'PARAISO_Q5B_SETUP', segments: SCRIPT.PARAISO_Q5B_SETUP });
       sections.push({ name: 'PARAISO_Q5B_PERGUNTA', segments: SCRIPT.PARAISO_Q5B_PERGUNTA });
       const q5b = pickLongerResposta(SCRIPT.PARAISO_Q5B_RESPOSTA_A, SCRIPT.PARAISO_Q5B_RESPOSTA_B);
       sections.push({ name: `PARAISO_Q5B_RESPOSTA_${q5b.choice}`, segments: q5b.segments });
     }
     ```
   - **Update the `ALL_PATHS` array to enumerate all 12 permutations**, with question count incrementing by 1 for each branch added (no branches = 6Q, single branch = 7Q, two branches = 8Q, three branches = 9Q). The new worst case is **Q1B + Q4B + Q5B** at 9 questions (because Q1B and Q2B are mutually exclusive — q1 can't be both A and B).
   - **Update the budget comment**: 5-7:30 minutes remains. The new worst case ought to land ~30-45s above Phase 31's 6:14 max-path → estimated 6:44-6:59 → still under the 7:30 ceiling with comfortable margin. Validate empirically; if it overshoots, run mitigation in Phase 35.
   - The `targetSeconds` comparison `globalMaxTotal >= 300 && globalMaxTotal <= 450` stays unchanged.

3. **`public/roteiro.html`** — Document the new Q5B branch in two places:
   - **Mermaid flowchart** (around line 397-419): Add a Q5B node and conditional edge mirroring how Q4B is rendered. The edge from `Q5` should split based on q5 choice; the Q5B branch should appear on the `q5=A` side conditionally on q4=A. Suggested edit:
     ```
     Q5 -->|"A: Carregar<br/>(se Q4=A)"| Q5B{"<strong>Q5B</strong> &mdash; O Que Já Não Cabe<br/><em>...</em><br/><br/>A: ... &nbsp;|&nbsp; B: ..."}
     Q5 -->|"B: Dissolver"| Q6
     Q5B --> Q6
     ```
     Add `Q5B` to the `class Q1B,Q2B,Q4B branch` line (line 439) → `class Q1B,Q2B,Q4B,Q5B branch`.
   - **Narrative text section** (mirror Q1B's `<!-- Q1B Branch (Phase 31, BR-01) -->` block at line 593): Insert `<!-- Q5B Branch (Phase 32, BR-02) -->` between the Q5 question div and the Q6 question div in the `<section class="phase paraiso">` block. Use a `<div class="branch-indicator">` with the conditional explanation: *"Só aparece se o visitante escolheu **Lembrar** (Q4=A) **E** **Carregar** (Q5=A). [Brief description]."*
   - **Overview list** (line 376): Update the "Ramificações" sentence to mention Q5B: `"Q5B aparece se Q4=A e Q5=A"`.

## 3. Q5B-Specific Content Proposal — Three Narrative Directions

Q5B's job is to honor a visitor who chose **memory + question-carrying**. The branch should:
- Acknowledge that they've now accumulated TWO heavy things (the past + the unanswerable).
- Pose a question about what to *do* with that accumulation — specifically, whether to **fuse** them into one shape, or **order** them as separate burdens.
- The A choice should anticipate the PORTADOR archetype: "you don't carry — you become the weight you carry."
- The B choice should remain dignified — never punish the visitor for choosing differently. (Phase 31's Q1B B response is the model: "Voltar pro que pulsa não é recuo — é reconhecimento.")

**Tonal anchors** (from CLAUDE.md + script.ts):
- Avoid coach/imperative voice ("Respira", "Pronto") — prefer dramatic structure.
- Avoid `[whispering]` (broken with this voice).
- Inflection palette: `thoughtful`, `gentle`, `warm`, `serious`, `sad`. Q5B should lean `thoughtful` and `warm` (PARAISO is the gentlest realm).
- ~2-3 segments per multi-segment array, ~80-180 chars per segment, pauses 800-1200ms.

### Option A: "Forma vs Coleção" (FUSE vs ORDER) — RECOMMENDED

**Theme**: The visitor carries memory and the unanswerable question. Do they let those two things become one shape (fuse → PORTADOR) or do they keep them separate, as inventory (order → still SEEKER-coded but more melancholic)?

**Q5B title**: *"O Que Já Não Cabe"* (the official title from REQUIREMENTS.md — locked).

```typescript
PARAISO_Q5B_SETUP: [
  { text: "Você lembrou. Você carregou.", pauseAfter: 1000, inflection: ['thoughtful'] },
  { text: "E agora descobre — o peso da memória e o peso da pergunta não são dois pesos. Encostam um no outro até virarem a mesma forma.", pauseAfter: 1200, inflection: ['gentle'] },
  { text: "Já não cabem separados.", pauseAfter: 1100 },
],

PARAISO_Q5B_PERGUNTA: [
  { text: "Você deixa eles se fundirem — ou tenta segurar cada um no lugar dele?" },
],

// Q5B RESPOSTA A — Fundir (memória e pergunta viram a mesma forma — PORTADOR seed)
PARAISO_Q5B_RESPOSTA_A: [
  { text: "Você deixa.", pauseAfter: 900 },
  { text: "Quando o que aconteceu e o que não tem resposta param de se distinguir, você não carrega mais — você é a forma que se faz disso.", pauseAfter: 1100, inflection: ['warm'] },
],

// Q5B RESPOSTA B — Ordenar (separar memória e pergunta como inventário)
PARAISO_Q5B_RESPOSTA_B: [
  { text: "Você separa.", pauseAfter: 900 },
  { text: "Manter cada coisa no lugar dela é uma forma de respeito — a memória pede um arquivo, a pergunta pede um silêncio. Cada uma com seu cuidado.", pauseAfter: 1100, inflection: ['gentle'] },
],

FALLBACK_Q5B: [
  { text: "Não precisa de palavra exata. Fundir, ou separar?", pauseAfter: 800 },
],

TIMEOUT_Q5B: [
  { text: "O peso decide por você. Continua.", pauseAfter: 900, inflection: ['warm'] },
],
```

**QUESTION_META[10] keywords for Option A:**
```typescript
optionA: 'Fundir',
optionB: 'Ordenar',
keywordsA: ['fundir', 'fundo', 'misturar', 'junto', 'mesmo', 'um só', 'uma só', 'deixar', 'sim', 'virar', 'forma', 'integrar'],
keywordsB: ['separar', 'ordenar', 'cada', 'lugar', 'segurar', 'arquivar', 'distinguir', 'manter', 'não', 'inventário', 'guardar'],
defaultOnTimeout: 'A',
questionContext: 'O Oráculo perguntou se o visitante deixa a memória e a pergunta sem resposta se fundirem em uma só forma, ou se prefere ordenar cada uma no seu lugar.',
```

**Why this option is recommended:**
- It pairs *exactly* with PORTADOR's Phase 34 archetype line: *"você não carrega — você se transforma no peso"*. Option A's resposta "você é a forma que se faz disso" pre-figures it.
- The fuse/order axis is a real psychoanalytic distinction (Bion: container vs contained; Lacan: structure vs symptom) without naming any framework explicitly — matches the v3.0 "zero explicit references" rule.
- It honors q4=A (memória) and q5=A (carrega) by adding a *third* choice that builds on both, instead of contradicting them.
- B response remains dignified ("uma forma de respeito") — no punishment for ordering instead of fusing.

### Option B: "Câmara vs Vento" (CHAMBER vs WIND)

**Theme**: The visitor has built an internal chamber from memory and unanswered questions. Do they keep that chamber sealed (preserve the integrity of carrying), or open a window so wind moves through it (let the carrying breathe)?

```typescript
PARAISO_Q5B_SETUP: [
  { text: "Você construiu uma câmara dentro de si. Sem perceber, foi guardando — cada cicatriz, cada pergunta sem resposta, cada coisa que pedia para ficar.", pauseAfter: 1100, inflection: ['thoughtful'] },
  { text: "Agora a câmara está cheia. E uma fresta apareceu na parede.", pauseAfter: 1100, inflection: ['gentle'] },
],

PARAISO_Q5B_PERGUNTA: [
  { text: "Você sela a fresta — ou abre uma janela?" },
],

PARAISO_Q5B_RESPOSTA_A: [
  { text: "Você sela.", pauseAfter: 900 },
  { text: "Câmara fechada não é prisão. É promessa de que nada vai se perder. O que você guarda assim te acompanha sem precisar ser explicado.", pauseAfter: 1100, inflection: ['warm'] },
],

PARAISO_Q5B_RESPOSTA_B: [
  { text: "Você abre.", pauseAfter: 900 },
  { text: "O vento entra. Algumas coisas se movem, outras se reorganizam. Você descobre que carregar e respirar não eram opostos.", pauseAfter: 1100, inflection: ['gentle'] },
],

FALLBACK_Q5B: [
  { text: "Selar ou abrir?", pauseAfter: 800 },
],

TIMEOUT_Q5B: [
  { text: "A parede decide por você. Continua.", pauseAfter: 900 },
],
```

**Tradeoffs vs Option A:**
- More vivid imagery (chamber, window, wind) but **the metaphor doesn't pair as cleanly with PORTADOR**. Selar = protect-and-preserve, which is a GUARDIAN trait, not specifically PORTADOR.
- Could create classification ambiguity in Phase 34 — visitor profiles q4=A && q5=A && q5b=A might fit GUARDIAN better than PORTADOR if the A response leans "preserve in chamber" rather than "become the weight."
- **Recommendation**: Use only if Option A's "fuse" verb feels too abstract for PT-BR speakers in user testing. The chamber metaphor is more concrete but mis-targets the future archetype.

### Option C: "Sedimento vs Corrente" (SEDIMENT vs CURRENT)

**Theme**: Memory + unanswerable question are like layers of sediment in still water. Do they let those layers settle and become bedrock (sediment → identity becomes fixed), or stir them into a current that keeps moving (current → identity stays fluid)?

```typescript
PARAISO_Q5B_SETUP: [
  { text: "O que você lembrou e o que você carrega — vão se assentando. Camada por camada.", pauseAfter: 1000, inflection: ['thoughtful'] },
  { text: "Em algum momento, o assentamento vira chão. E aí ou você caminha por cima, ou você mexe na água até tudo virar correnteza de novo.", pauseAfter: 1200 },
],

PARAISO_Q5B_PERGUNTA: [
  { text: "Você deixa virar chão — ou agita até virar movimento?" },
],

PARAISO_Q5B_RESPOSTA_A: [
  { text: "Você deixa assentar.", pauseAfter: 1000 },
  { text: "Quem se permite ser feito de camadas para de discutir consigo mesmo. O peso vira fundamento. E fundamento sustenta — não pesa.", pauseAfter: 1100, inflection: ['warm'] },
],

PARAISO_Q5B_RESPOSTA_B: [
  { text: "Você agita.", pauseAfter: 900 },
  { text: "Manter o que aconteceu em movimento é uma forma de não deixar nada virar pedra. É cansativo. Mas é vivo.", pauseAfter: 1100, inflection: ['gentle'] },
],

FALLBACK_Q5B: [
  { text: "Assentar ou agitar?", pauseAfter: 800 },
],

TIMEOUT_Q5B: [
  { text: "A água decide. Continua.", pauseAfter: 900 },
],
```

**Tradeoffs vs Option A:**
- Strong PT-BR cadence (sedimento, corrente, chão, fundamento — earthy vocabulary).
- Pairs reasonably with PORTADOR ("o peso vira fundamento") but is more poetic and less direct than Option A.
- Sediment metaphor risks reading as DEPTH_SEEKER coded (going deeper) rather than PORTADOR coded (becoming the carried thing).
- **Recommendation**: Use as a fallback if the planner finds Option A too abstract.

### Recommendation Summary

| Option | Pairs with PORTADOR? | Imagery clarity | Risk of archetype confusion | Pick |
|--------|----------------------|-----------------|------------------------------|------|
| **A: Fundir vs Ordenar** | **Strong** — pre-figures "você é a forma" | Medium-abstract | Low | **YES — recommended** |
| B: Câmara vs Vento | Weak (overlaps with GUARDIAN) | High | High (GUARDIAN/PORTADOR collision) | No |
| C: Sedimento vs Corrente | Medium (overlaps with DEPTH_SEEKER) | High | Medium | Fallback |

**Default for the planner**: **Option A**. If user testing in Phase 35 reveals that "fundir" doesn't classify well via NLU keywords, swap to Option C as a planned variant.

## 4. State Machine Integration — Exact Specification

### Guard

```typescript
// In oracleMachine.ts guards block (alongside shouldBranchQ1B, shouldBranchQ2B, shouldBranchQ4B)
shouldBranchQ5B: ({ context }) =>
  context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A',
```

### Modified Q5_RESPOSTA_A

```typescript
// Before:
Q5_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: 'Q6_SETUP',
  },
},

// After:
Q5_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q5B_SETUP', guard: 'shouldBranchQ5B' },
      { target: 'Q6_SETUP' },
    ],
  },
},
```

### Six new states (insert after Q5_RESPOSTA_B, before Q6_SETUP)

```typescript
Q5B_SETUP: {
  on: { NARRATIVA_DONE: 'Q5B_PERGUNTA' },
},
Q5B_PERGUNTA: {
  on: { NARRATIVA_DONE: 'Q5B_AGUARDANDO' },
},
Q5B_AGUARDANDO: {
  entry: assign({ currentChoiceTimeout: 25000 }),  // verify against Q1B_AGUARDANDO actual entry
  on: {
    CHOICE_A: { target: 'Q5B_RESPOSTA_A', actions: 'recordQ5BChoiceA' },
    CHOICE_B: { target: 'Q5B_RESPOSTA_B', actions: 'recordQ5BChoiceB' },
  },
  after: {
    25000: { target: 'Q5B_TIMEOUT', actions: 'incrementFallbackCount' },
  },
},
Q5B_TIMEOUT: {
  on: { NARRATIVA_DONE: 'Q5B_AGUARDANDO' },
},
Q5B_RESPOSTA_A: {
  on: { NARRATIVA_DONE: 'Q6_SETUP' },  // sibling target — within PARAISO
},
Q5B_RESPOSTA_B: {
  on: { NARRATIVA_DONE: 'Q6_SETUP' },
},
```

### Two new actions

```typescript
recordQ5BChoiceA: assign({
  choiceMap: ({ context }) => ({ ...context.choiceMap, q5b: 'A' as const }),
  choices: ({ context }) => [...context.choices, 'A' as const],
}),
recordQ5BChoiceB: assign({
  choiceMap: ({ context }) => ({ ...context.choiceMap, q5b: 'B' as const }),
  choices: ({ context }) => [...context.choices, 'B' as const],
}),
```

> **Important**: The planner MUST grep for `recordQ1BChoiceA` in `oracleMachine.ts` and copy its EXACT shape — including any helper function (e.g. `recordChoice('q1b', 'A')`) Phase 31 may have introduced. The shape above is a best-effort reconstruction; verify before pasting.

### Transition diagram

```
                  ┌─────────────┐
                  │ Q5_RESPOSTA_A│
                  └──────┬──────┘
                         │ NARRATIVA_DONE
                         ▼
              ┌──────────────────────┐
              │ Guard: shouldBranchQ5B│
              │ (q4=='A' && q5=='A') │
              └──────────┬───────────┘
                         │
            ┌────────────┴─────────────┐
            │ true                     │ false
            ▼                          ▼
      ┌──────────┐               ┌──────────┐
      │ Q5B_SETUP│               │ Q6_SETUP │
      └─────┬────┘               └──────────┘
            │ NARRATIVA_DONE
            ▼
      ┌────────────┐
      │Q5B_PERGUNTA│
      └─────┬──────┘
            │ NARRATIVA_DONE
            ▼
      ┌──────────────┐  CHOICE_A  ┌────────────────┐
      │Q5B_AGUARDANDO├───────────►│Q5B_RESPOSTA_A  │
      │              │            │(q5b='A')       │
      │              │            └───────┬────────┘
      │              │  CHOICE_B          │
      │              ├───────────►┌───────▼────────┐
      │              │            │Q5B_RESPOSTA_B  │
      │              │            │(q5b='B')       │
      │              │  after 25s └───────┬────────┘
      │              ├──────►┌────────┐   │
      └──────────────┘       │Q5B_TIMEOUT  │
                             └────┬───┘   │
                                  │       │
                              NARRATIVA_DONE
                                  │       │
                                  ▼       │
                         (back to Q5B_AGUARDANDO)
                                          │
                                          ▼
                                     ┌──────────┐
                                     │ Q6_SETUP │
                                     └──────────┘
```

## 5. Timing Impact

### Phase 31 baseline

- Phase 31 max-path (Q1B + Q4B path, 8 questions): **6:13.9 min (373.9s)**
- Budget: **7:30 min (450s)**
- Headroom remaining: **76.1s**

### Q5B addition estimate

Estimated Q5B section duration (Option A, 8 segments total across 6 keys):
- SETUP: ~3 segments × ~120 chars / 13 cps + ~3.3s pauses ≈ **30-35s**
- PERGUNTA: ~1 segment × ~70 chars / 13 cps + 0s pause ≈ **5-6s**
- RESPOSTA (longer, Option A: A is slightly longer): ~2 segments × ~110 chars / 13 cps + ~2s pauses ≈ **18-22s**
- Listener response time: 1 question × 4s = **4s**
- **Total Q5B segment**: ~57-67s added per Q5B-active path

### Updated max-path forecast

| Path | Phase 31 baseline | + Q5B | Status |
|------|-------------------|-------|--------|
| No branches (6Q) | ~5:00 | ~5:00 (Q5B doesn't fire) | within budget |
| Q1B + Q4B (8Q, 31's max) | 6:13.9 | 6:13.9 (Q5B doesn't fire — Q1B requires q1=B but Q5B requires q4=A; not mutually exclusive but Q1B path doesn't trigger Q5B) | within budget |
| Q4B + Q5B (8Q, new) | n/a | ~6:50-7:00 | **NEW MAX** — within budget with ~30-40s headroom |
| Q1B + Q4B + Q5B (9Q, new max) | n/a | **WAIT** — see below | check |

> **Important question**: Can Q1B + Q4B + Q5B fire together?
> - Q1B fires if `q1='B' && q2='B'`
> - Q4B fires if `q3='A' && q4='A'`
> - Q5B fires if `q4='A' && q5='A'`
> - Q4B and Q5B share the requirement `q4='A'` — **compatible**.
> - Q1B is independent of q3, q4, q5 — **compatible**.
> - **YES**, Q1B + Q4B + Q5B is a real path: `q1=B, q2=B, q3=A, q4=A, q5=A, q6=anything`. This creates a **9-question path** which is the new worst case for Phase 32.

**New max-path estimate**: 6:13.9 (Q1B + Q4B baseline) + ~60s (Q5B) ≈ **7:13-7:20 min**, leaving ~10-17s headroom under the 7:30 ceiling. **Tight but acceptable.**

### Mitigation if Q5B overshoots

If Wave 3's `validate-timing.ts` run reports a max-path > 7:30 (e.g. if the planner picks longer narration than the estimates above), the planner has these levers (in order of preference):

1. **Trim Q5B SETUP to 2 segments** (drop 1 segment, save ~10-12s).
2. **Compress Q5B RESPOSTA pauses** from 1100ms → 900ms (save ~3-4s).
3. **Trim Q5B PERGUNTA to <60 chars** (save ~1-2s).
4. **Defer to Phase 35 POL-01 mitigation** (cut base SETUPs from Q1/Q3/Q5) — last resort.

### Path matrix expansion (`validate-timing.ts`)

Old matrix had 6 paths. New matrix has **12 paths** (each existing path × Q5B yes/no, where Q5B is only enabled when q4=A is implied).

**Concrete enumeration** (the planner should hard-code these in `ALL_PATHS`):

| # | Name | hasQ1B | hasQ2B | hasQ4B | hasQ5B | Q count |
|---|------|--------|--------|--------|--------|---------|
| 1 | No branches (6Q) | F | F | F | F | 6 |
| 2 | Q5B only (7Q) | F | F | F | T | 7 |
| 3 | Q2B only (7Q) | F | T | F | F | 7 |
| 4 | Q1B only (7Q) | T | F | F | F | 7 |
| 5 | Q4B only (7Q) | F | F | T | F | 7 |
| 6 | Q4B + Q5B (8Q) | F | F | T | T | 8 |
| 7 | Q2B + Q5B (8Q) | F | T | F | T | 8 |
| 8 | Q1B + Q5B (8Q) | T | F | F | T | 8 |
| 9 | Q2B + Q4B (8Q) | F | T | T | F | 8 |
| 10 | Q1B + Q4B (8Q) | T | F | T | F | 8 |
| 11 | Q2B + Q4B + Q5B (9Q) | F | T | T | T | 9 |
| 12 | Q1B + Q4B + Q5B (9Q) | T | F | T | T | 9 |

> **Important caveat**: Path #2 (Q5B only, no Q4B) requires `q4='A' && q5='A' && q3='B'` (so Q4B doesn't fire). This is a real path. Path #7 requires `q1='A' && q2='A' && q4='A' && q5='A' && q3='B'` — also real. The planner can verify by computing the choice combinations: with 6 base questions there are 64 visitor profiles, and the 12 path-shapes above cover all valid (firing-rule-respecting) variations.
>
> Important note about **strict path realism vs validation**: in practice, Q5B requires `q4='A'`, and if Q3='A' as well then Q4B *also* fires. So **Path #2 (Q5B only, q3='B', q4='A')** is real. **Path #6 (Q4B+Q5B, q3='A', q4='A', q5='A')** is real. **Path #11 (Q2B+Q4B+Q5B)** is real (q1=A, q2=A, q3=A, q4=A, q5=A). All 12 paths are reachable.

## 6. Validation Architecture (Nyquist)

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.x + @testing-library/react 14.x (verified in Phase 31) |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run src/machines/__tests__/oracleMachine.test.ts` |
| Full suite command | `npm test` |
| Phase gate | All 246+ tests passing (Phase 31 baseline) plus new Q5B tests |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| BR-02 | 6 SCRIPT keys for Q5B exist with correct shape | unit | `npx vitest run src/data/__tests__/script.test.ts -t "Q5B"` | needs new test file or addition |
| BR-02 | QUESTION_META[10] exists with valid shape | unit | `npx vitest run src/types/__tests__/QUESTION_META.test.ts -t "Q5B"` | needs new test or addition |
| BR-02 | `shouldBranchQ5B` guard returns true only when q4=A && q5=A | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "shouldBranchQ5B"` | exists, needs new tests |
| BR-02 | Q5B states reachable in correct sequence | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q5B sequence"` | exists, needs new tests |
| BR-02 | Q5B_RESPOSTA_{A,B} both rejoin Q6_SETUP | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q5B rejoin"` | exists, needs new tests |
| BR-02 | OracleExperience helpers handle Q5B states | unit | `npx vitest run src/components/experience/__tests__/OracleExperience.test.tsx -t "Q5B"` | exists, needs new tests |
| BR-02 | 6 MP3 files exist after generation | smoke | `node -e "['paraiso_q5b_setup','paraiso_q5b_pergunta','paraiso_q5b_resposta_a','paraiso_q5b_resposta_b','fallback_q5b','timeout_q5b'].forEach(k=>{if(!require('fs').existsSync('public/audio/prerecorded/'+k+'.mp3')) throw new Error('missing: '+k)})"` | manual smoke after Wave 3 |
| BR-02 | Max-path stays within 7:30 budget | integration | `npx tsx scripts/validate-timing.ts` (exit 0 = pass) | exists, needs new permutations |
| BR-02 (regression) | Phase 31 + v4.0 tests still pass | regression | `npm test` (full suite, 246+ tests, must pass) | full suite |
| BR-02 (regression) | patternMatching.ts byte-identical to v4.0 | regression | `git diff HEAD~30 -- src/machines/guards/patternMatching.ts` (no output) | manual check |

### Sampling Rate

- **Per task commit**: `npx vitest run src/machines/__tests__/oracleMachine.test.ts` (~3-5s) + `npx tsc --noEmit` (~10-15s)
- **Per wave merge**: `npm test` (full suite, ~30s) + `npx tsx scripts/validate-timing.ts`
- **Phase gate**: Full suite green + timing validation pass + manual MP3 file existence check + 1 grep on patternMatching.ts to confirm POL-02 invariant

### Wave 0 Gaps

- [ ] **None** — existing test infrastructure covers all Phase 32 needs. Phase 31 already established the Q1B test patterns; Phase 32 just adds equivalent Q5B assertions to existing test files. No new test framework, no new conftest, no new fixtures required.

## 7. Files to Modify (Exhaustive List)

### Source files (modified)

| File | Wave | Change | Risk |
|------|------|--------|------|
| `src/data/script.ts` | 1 | +6 SCRIPT keys (PARAISO_Q5B_*, FALLBACK_Q5B, TIMEOUT_Q5B) inserted between Q5_RESPOSTA_B and Q6_SETUP entries | Low — additive |
| `src/types/index.ts` | 1 | +1 QUESTION_META entry at index 10 | Low — additive |
| `src/machines/oracleMachine.ts` | 2 | +1 guard, +6 states, +2 actions, modify Q5_RESPOSTA_A transition | Medium — modifies existing state |
| `src/components/experience/OracleExperience.tsx` | 2 | +1 ChoiceConfig (Q5B_CHOICE), +6 helper extensions (getBreathingDelay, getScriptKey, getFallbackScript, activeChoiceConfig, isAguardando, isPergunta) | Medium — touches 6 functions |

### Source files (verified untouched)

| File | Why | Verification Step |
|------|-----|-------------------|
| `src/machines/oracleMachine.types.ts` | POL-02 invariant — already has q5b in QuestionId | `grep -n "q5b" src/machines/oracleMachine.types.ts` should return existing line; planner does not edit |
| `src/machines/guards/patternMatching.ts` | POL-02 invariant — must remain byte-identical to v4.0 | `git diff HEAD~30 -- src/machines/guards/patternMatching.ts` returns nothing |

### Test files (modified or created)

| File | Wave | Change |
|------|------|--------|
| `src/data/__tests__/script.test.ts` (or wherever script tests live) | 1 | +Q5B key existence + shape assertions (6 new tests) |
| `src/types/__tests__/index.test.ts` (or wherever QUESTION_META tests live) | 1 | +QUESTION_META[10] shape assertion (1-2 new tests) |
| `src/machines/__tests__/oracleMachine.test.ts` | 2 | +10-12 Q5B branch tests (trigger, sequence, rejoin, choiceMap, smoke) |
| `src/components/experience/__tests__/OracleExperience.test.tsx` | 2 | +6-8 Q5B helper tests |

> The planner should grep `git ls-files -- "**/*.test.*"` to confirm exact test file locations before writing tasks. Phase 31 already handled this discovery; the same files exist for Phase 32.

### Generated artifacts (Wave 3)

| Path | Source | Step |
|------|--------|------|
| `public/audio/prerecorded/paraiso_q5b_setup.mp3` | ElevenLabs v3 | `npx tsx scripts/generate-audio-v3.ts` |
| `public/audio/prerecorded/paraiso_q5b_pergunta.mp3` | (same) | (same — auto-discovered) |
| `public/audio/prerecorded/paraiso_q5b_resposta_a.mp3` | (same) | (same) |
| `public/audio/prerecorded/paraiso_q5b_resposta_b.mp3` | (same) | (same) |
| `public/audio/prerecorded/fallback_q5b.mp3` | (same) | (same) |
| `public/audio/prerecorded/timeout_q5b.mp3` | (same) | (same) |

### Documentation files (modified)

| File | Wave | Change |
|------|------|--------|
| `scripts/validate-timing.ts` | 3 | +`hasQ5B` field, +Q5B path section, expand `ALL_PATHS` from 6 → 12 entries, update header comment for v6.0 Phase 32 |
| `public/roteiro.html` | 3 | +Q5B node in Mermaid flowchart, +Q5B narrative block in `<section class="phase paraiso">`, update overview "Ramificações" line |

### NOT modified (verify and document non-edit)

| File | Why |
|------|-----|
| `scripts/generate-audio-v3.ts` | Auto-discovers SCRIPT keys; no code change needed |
| `src/services/tts/fallback-tts.ts` | Loads from `public/audio/prerecorded/`; auto-discovers MP3 files |
| `src/machines/guards/patternMatching.ts` | POL-02 invariant — Phase 34 will add PORTADOR guard here, not Phase 32 |
| `src/services/nlu/claude.ts` | Reads `questionContext` from QUESTION_META; auto-handles new entries |
| `CLAUDE.md` | Phase 35 will update final counts (script entries 67 → 73, states 60 → 66) |
| `.planning/PROJECT.md` | Updated by `/gsd:transition` after Phase 32 completes |

## 8. Risk Areas

### High risk

1. **`recordQ5BChoice{A,B}` action shape mismatch** — Phase 31 may have refactored this into a generic `recordChoice('q1b', 'A')` helper. If the planner copies the literal `assign({ choiceMap: ..., choices: ... })` shape from this research without first grepping for `recordQ1BChoiceA`, they may introduce a divergent pattern that breaks state machine tests. **Mitigation**: Wave 2 task 1 must include a grep step: `grep -n "recordQ1B" src/machines/oracleMachine.ts` and copy the EXACT pattern.

2. **`Q5B_AGUARDANDO` `entry` action** — Same issue. Phase 31's Q1B_AGUARDANDO may set `currentChoiceTimeout` via assign, or it may not exist at all. The shape above is best-effort. **Mitigation**: grep `Q1B_AGUARDANDO` in oracleMachine.ts and copy verbatim.

3. **`isPergunta` mic warm-up bug** — Phase 31 verification logged that omitting Q1B_PERGUNTA from the `isPergunta` chain would cause the mic to lag ~1 second when entering Q1B_AGUARDANDO, dropping the visitor's first words. The same risk applies to Q5B_PERGUNTA. **Mitigation**: include explicit assertion in Wave 2 OracleExperience tests: `expect(isPerguntaForState({ PARAISO: 'Q5B_PERGUNTA' })).toBe(true)`.

### Medium risk

4. **Q5B/Q4B test interleaving** — Q5B's trigger requires `q4='A'`. Q4B's trigger requires `q3='A' && q4='A'`. So **a path with q3=A, q4=A, q5=A fires BOTH Q4B and Q5B**. Phase 31 verification didn't have to handle this kind of branch interleaving (Q1B and Q2B are mutually exclusive). The XState v5 transition order is deterministic — Q4B fires first because Q4_RESPOSTA_A → Q4B_SETUP guard is evaluated as Q4_RESPOSTA_A's NARRATIVA_DONE — but the planner must explicitly TEST the interleaving:
   - Test path: q1=B q2=A q3=A q4=A q5=A q6=A
   - Expected sequence: Q1 → Q2 → Q3 → Q4 → Q4B (fires because q3=A && q4=A) → PARAISO_INTRO → Q5 → Q5B (fires because q4=A && q5=A) → Q6 → DEVOLUCAO
   - Both branches fire on the same visitor. The test must assert both Q4B and Q5B states are visited.
   **Mitigation**: Wave 2 oracleMachine.test.ts must include this exact interleaved-branches test as a regression guard.

5. **Timing budget margin shrinks to ~10-17s** — At max-path Q1B+Q4B+Q5B (9 questions), the forecast is 7:13-7:20, leaving very little headroom under 7:30. Any narration choice 10s longer than estimated tips the build to FAIL. **Mitigation**: After Wave 3 generates MP3s, the planner must run `npx tsx scripts/validate-timing.ts` and confirm exit 0 BEFORE committing. If it fails, apply Section 5 mitigations (trim SETUPs/pauses) before re-running.

6. **Q5_RESPOSTA_A breathing delay change** — Currently `Q5_RESPOSTA_A` returns MEDIUM (line 114 in OracleExperience.tsx). When Q5B may follow it, the breathing delay before transitioning out of Q5_RESPOSTA_A still applies BEFORE the guard fires. Should still be MEDIUM (no change needed) — but test that the visitor doesn't experience a hiccup. **Mitigation**: Manual smoke test step in Wave 3: confirm the audio feels seamless when Q5B fires.

### Low risk

7. **`getScriptKey` mapping for Q5B states** — Six new entries; trivial but easy to typo (e.g. `'PARAISO_Q5B_RESPOSTA_A'` vs `'PARAISO_Q5B_RESPOSTA_a'`). **Mitigation**: Wave 2 OracleExperience tests assert each Q5B state maps to the correct key.

8. **Validate-timing.ts ALL_PATHS expansion** — From 6 → 12 entries, easy to miscount or typo. **Mitigation**: Wave 3 task includes a sanity check: `npx tsx scripts/validate-timing.ts | grep "PATH:"` should print exactly 12 lines.

9. **Roteiro.html Mermaid syntax** — Mermaid is fragile to whitespace and quote escaping. **Mitigation**: After Wave 3 edit, open `public/roteiro.html` in a browser and visually verify the flowchart renders with the new Q5B node. (Phase 31 had this manual check too.)

10. **CLAUDE.md script entry count drift** — CLAUDE.md says "61 keys" (v4.0 number). Phase 31 made it 67. Phase 32 makes it 73. Phase 35 will canonicalize this. **Mitigation**: Phase 32 does NOT update CLAUDE.md; the count update is queued for Phase 35.

### Non-risk (pre-cleared from Phase 31 verification)

- POL-02 invariant: `patternMatching.ts` and `oracleMachine.types.ts` already have q5b support and require zero edits.
- ElevenLabs v3 generation: Phase 31 generated 6 MP3s flawlessly; same workflow for Q5B.
- TTS playback: pre-recorded MP3s loaded by FallbackTTS auto-discover from filename.
- NLU classification: Claude Haiku auto-handles new questionContext from QUESTION_META[10].

## 9. Common Pitfalls (from Phase 31's verification log)

1. **Forgetting to update `isPergunta`** — Causes mic lag (~1s) at the new branch's AGUARDANDO state, dropping visitor's first words.
2. **Forgetting to add the new branch's choice config to `activeChoiceConfig`** — Voice choice config returns the previous question's keywords, classifying wrong.
3. **Using `[whispering]` inflection tag** — Silently broken with this voice (`PznTnBc8X6pvixs9UkQm`); waste of API calls. Use `gentle` or `warm` instead for intimacy.
4. **Single-word imperatives** — Risk sounding like coach voice. Q5B should NOT use lines like "Respira" or "Pronto."
5. **Hand-rolling multi-segment text instead of using arrays** — All SCRIPT entries must be `SpeechSegment[]`, never single strings, even for single-segment keys (PERGUNTA, FALLBACK, TIMEOUT).
6. **Not running validate-timing.ts after script changes** — Always run after editing script.ts to confirm max-path stays in budget.
7. **Forgetting to update roteiro.html in sync** — Client reviews roteiro.html; if it diverges from script.ts the client gets a stale view.

## 10. Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Branch firing logic | Custom ad-hoc condition in component | XState `guard` in machine config (proven in Phase 31) |
| Audio playback | Custom Web Audio loader | Existing `useTTSOrchestrator` + FallbackTTS pre-recorded MP3s |
| NLU classification | Hard-coded keyword if-chain | QUESTION_META keywords + Claude Haiku fallback (existing pipeline) |
| State transitions | useState+effects | XState v5 `useMachine` (already wired) |
| MP3 generation | Manual ElevenLabs API calls | `scripts/generate-audio-v3.ts` (auto-discovers keys, handles rate limits) |
| Path enumeration | Manual duration calc per path | `scripts/validate-timing.ts` (already structured for path matrix) |

## 11. Architecture Patterns (proven in Phase 31)

### Pattern 1: Conditional branch as guarded transition array

```typescript
SOME_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      { target: 'BRANCH_SETUP', guard: 'shouldBranchX' },
      { target: 'NEXT_DEFAULT' },
    ],
  },
},
```

XState v5 evaluates the array in order — first guard that returns true wins; default (no guard) is the fallback. Both targets must be valid sibling-state names within the parent compound state. (Source: Phase 31 31-RESEARCH.md Pattern 1, verified by Phase 31 test pass.)

### Pattern 2: Branch state cluster (6 states)

Each conditional branch needs exactly: SETUP → PERGUNTA → AGUARDANDO → (RESPOSTA_A | RESPOSTA_B | TIMEOUT). TIMEOUT loops back to AGUARDANDO. Both RESPOSTAs target the rejoin point (sibling or `#oracle.X` qualified target).

### Pattern 3: ChoiceMap extension via `assign` action

```typescript
recordXChoiceA: assign({
  choiceMap: ({ context }) => ({ ...context.choiceMap, x: 'A' as const }),
  choices: ({ context }) => [...context.choices, 'A' as const],
}),
```

Both `choiceMap` (named) and `choices` (positional array) get updated atomically. The positional array drives existing pattern-based archetype detection in `patternMatching.ts` without modification.

### Pattern 4: 6-helper OracleExperience extension

For each new branch, exactly 6 places in `OracleExperience.tsx` need additions:
1. `buildChoiceConfig(N)` constant at top
2. `getBreathingDelay` switch
3. `getScriptKey` switch
4. `getFallbackScript` switch
5. `activeChoiceConfig` useMemo
6. `isAguardando` and `isPergunta` boolean chains

Missing any one of these causes a class of bug:
- Missing `buildChoiceConfig` → no choice config for that question
- Missing `getBreathingDelay` → 0ms delay (rushed feel)
- Missing `getScriptKey` → silent state (no TTS)
- Missing `getFallbackScript` → no fallback audio on failed NLU
- Missing `activeChoiceConfig` → wrong keywords used for classification
- Missing `isAguardando` → mic never activates
- Missing `isPergunta` → mic warmup lag, drops first word

## 12. Sources

### Primary (HIGH confidence)
- `C:\Users\USER\Oraculo\.planning\phases\31-q1b-branch-inferno-contra-fobico\31-RESEARCH.md` — canonical pattern document (Phase 31)
- `C:\Users\USER\Oraculo\.planning\phases\31-q1b-branch-inferno-contra-fobico\31-01-PLAN.md`, `31-02-PLAN.md`, `31-03-PLAN.md` — exact wave structure
- `C:\Users\USER\Oraculo\.planning\phases\31-q1b-branch-inferno-contra-fobico\31-VERIFICATION.md` — proven success criteria + failure modes
- `C:\Users\USER\Oraculo\src\machines\oracleMachine.ts` — current machine state (post-Phase 31)
- `C:\Users\USER\Oraculo\src\machines\oracleMachine.types.ts` — confirmed q5b in QuestionId
- `C:\Users\USER\Oraculo\src\machines\guards\patternMatching.ts` — POL-02 invariant baseline
- `C:\Users\USER\Oraculo\src\components\experience\OracleExperience.tsx` — orchestrator helper structure
- `C:\Users\USER\Oraculo\src\data\script.ts` — Q5 baseline + Q1B template
- `C:\Users\USER\Oraculo\src\types\index.ts` — QUESTION_META structure (1-9 occupied)
- `C:\Users\USER\Oraculo\scripts\validate-timing.ts` — current path matrix (6 paths)
- `C:\Users\USER\Oraculo\scripts\generate-audio-v3.ts` — auto-discovery MP3 generator (no edits needed)
- `C:\Users\USER\Oraculo\public\roteiro.html` — Mermaid flowchart + narrative documentation pattern
- `C:\Users\USER\Oraculo\.planning\REQUIREMENTS.md` — BR-02 spec + scope locks
- `C:\Users\USER\Oraculo\.planning\milestones\v6.0-ROADMAP.md` — Phase 32 success criteria
- `C:\Users\USER\Oraculo\CLAUDE.md` — voice ID, inflection tags, conventions
- `C:\Users\USER\Oraculo\.planning\PROJECT.md` — milestone state, decisions log

### Secondary (MEDIUM confidence)
- XState v5 transition array semantics — verified by Phase 31 working code (no external doc lookup needed)
- ElevenLabs v3 MP3 generation behavior — verified by Phase 31 generating 6 MP3s successfully

### Tertiary (LOW confidence)
- None — every claim in this research is anchored to a Phase 31 artifact or current source file.

## 13. Open Questions

1. **Exact `recordQ1BChoiceA` action shape** — Need to verify against actual Phase 31 oracleMachine.ts code before Wave 2 task 1. The shape proposed in Section 4 is best-effort but may diverge slightly from the actual Phase 31 pattern.
   - **Resolution**: Wave 2 task 1 must include `grep -n "recordQ1B" src/machines/oracleMachine.ts` as the FIRST step, then copy the EXACT pattern.

2. **Whether the planner should write Q5B narration in PT-BR before or during Wave 1** — Phase 31 wrote the narration during Wave 1 task 1 (the script editor is the planner who knows the story). Phase 32 should follow the same flow: Wave 1 task 1 = paste narration into script.ts. Option A above is the recommended starting point; planner has discretion to refine wording.
   - **Resolution**: Use Option A as the seed; let the planner refine during Wave 1 if needed.

3. **Whether `Q5B_AGUARDANDO` needs `entry: assign({ currentChoiceTimeout: 25000 })`** — Depends on whether oracleMachine has a global `currentChoiceTimeout` context field. If yes, all AGUARDANDO states already use it; if no, the timeout is hardcoded inline in `after`.
   - **Resolution**: Wave 2 task 1 must verify by reading the existing Q1B_AGUARDANDO state.

## 14. Metadata

**Confidence breakdown:**
- Standard pattern (3-wave structure, 6 helpers, 6 SCRIPT keys): **HIGH** — Phase 31 just shipped it; this is a near-mechanical mirror.
- Q5B narrative content: **MEDIUM** — three options proposed; Option A is recommended but planner may iterate.
- Timing impact (~30-45s addition): **MEDIUM** — based on linear extrapolation from Phase 31; actual will be measured in Wave 3.
- Q4B/Q5B path interleaving (both fire when q3=A && q4=A && q5=A): **HIGH** — verified by reading the guard predicates and trigger conditions.
- 12-permutation matrix realism: **HIGH** — enumerated by exhaustive choice combinations.
- POL-02 invariant non-regression: **HIGH** — patternMatching.ts and types already support q5b; nothing to change.

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 days; v6.0 work is fast-moving but Phase 31 just established the canonical pattern, so research is stable until milestone v7.0)

---

## Ready for Planning

This research provides everything needed for `gsd-planner` to write **3 wave plans (32-01, 32-02, 32-03)** mirroring Phase 31's exact structure:

- **Wave 1 (32-01)**: Data + Types — `script.ts` Q5B keys, `index.ts` QUESTION_META[10], type compilation check. **Estimated 1-1.5h.**
- **Wave 2 (32-02)**: Machine + UI — `oracleMachine.ts` guard+states+actions, `OracleExperience.tsx` 6 helper extensions, ~16-20 new tests. **Estimated 1.5-2h.**
- **Wave 3 (32-03)**: Audio + Timing + Roteiro — generate 6 MP3s, expand `validate-timing.ts` to 12 paths, document Q5B in `roteiro.html`. **Estimated 1.5-2h.**

**Total Phase 32 estimate: 4-6 hours of focused work.** The planner can paste Option A's narration verbatim or refine it.

**Critical for the planner:**
1. Wave 1 task must verify POL-02 invariant: `oracleMachine.types.ts` already has `q5b` in QuestionId (do not edit).
2. Wave 2 task 1 must FIRST grep `recordQ1B` in oracleMachine.ts and copy the action shape verbatim.
3. Wave 2 task 2 must include both `isAguardando` and `isPergunta` Q5B additions (Phase 31 verification log shows this is the most-forgotten step).
4. Wave 3 task 2 must run `validate-timing.ts` and verify the new max-path is < 450s before commit.
5. Wave 3 task 3 must visually verify the Mermaid flowchart renders correctly in `roteiro.html`.
6. **NO changes to `patternMatching.ts`** — POL-02 invariant.
