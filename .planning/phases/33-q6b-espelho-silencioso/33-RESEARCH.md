# Phase 33: Q6B + ESPELHO_SILENCIOSO — Research

**Researched:** 2026-04-07
**Domain:** Conditional pre-DEVOLUCAO branch insertion + new top-level archetype state with highest-priority guard
**Confidence:** HIGH (Phases 31 and 32 shipped the exact branch-insertion pattern; the only novelty is one new top-level DEVOLUCAO_* state and one new highest-priority `always` entry)

## Summary

Phase 33 closes two requirements at once: **BR-03** (the Q6B "O Espelho Extra" branch — a rarissima conditional branch that fires when `q5='B' && q6='A'`, i.e. the visitor *dissolved their question* but then *asked the Oracle to be seen*) and **AR-01** (the new `DEVOLUCAO_ESPELHO_SILENCIOSO` archetype — the only devolução in the system that returns *form* instead of *content*: an open question or structured silence rather than a 4-segment psychoanalytic mirror).

The Q6B portion is mechanically identical to Phases 31 and 32 — same 3-wave structure, same 6-SCRIPT-key anatomy, same guard pattern, same OracleExperience extension, same MP3 generation step. The novelty is what happens *after* Q6B: the routing into DEVOLUCAO must consider whether the visitor said "yes" (`q6b='A'`, opens to receive the silent mirror) or "no" (`q6b='B'`, refuses even the open form). Per REQUIREMENTS.md AR-01, the trigger is `q6b === 'B'` — but read carefully: the visitor in Q6B is being asked whether they want a *closed reading* or an *open shape*, and `B` (open shape) triggers ESPELHO_SILENCIOSO.

The guard `isEspelhoSilencioso` must occupy **the highest-priority slot** in the `DEVOLUCAO.always` array (above all 8 existing archetype guards). The mathematical guarantee that Q6B is a strict subset of all visitors who reach DEVOLUCAO means this guard never preempts a normal devolução for visitors who didn't traverse Q6B — only Q6B-traversers can have `q6b` defined in `choiceMap`.

**The single non-trivial architectural decision: where does `isEspelhoSilencioso` live?** Phase 31's POL-02 invariant locks `src/machines/guards/patternMatching.ts` byte-identical. But `patternMatching.ts` reads only `context.choices` (the positional `ChoicePattern` array), while `isEspelhoSilencioso` needs `context.choiceMap.q6b` (the named map). **Resolution: the new guard MUST live in `oracleMachine.ts` setup guards block (alongside `shouldBranchQ1B`, `shouldBranchQ5B`), NOT in `patternMatching.ts`.** This is the same pattern Phases 31 and 32 used for branch guards. POL-02 is preserved.

**Primary recommendation:** Mirror the Phase 31/32 3-wave structure exactly. Wave 1 = data + types (12 SCRIPT keys: 6 Q6B + 6 ESPELHO_SILENCIOSO, QUESTION_META[11], no types changes — `q6b` already in `QuestionId`). Wave 2 = machine guards + 6 Q6B states + 1 new DEVOLUCAO_ESPELHO_SILENCIOSO state + DEVOLUCAO `always` modification + 6 OracleExperience helper extensions + tests. Wave 3 = 12 MP3s + validate-timing.ts permutation expansion + roteiro.html documentation + end-to-end timing verification. Total estimated effort: ~6-9 hours including test cycles (50% larger than Phase 32 because of the second deliverable AR-01).

## User Constraints (from CONTEXT.md)

> No CONTEXT.md exists for Phase 33 — `skip_discuss=true` is set in `.planning/config.json`. Constraints below derived from PROJECT.md, REQUIREMENTS.md, CLAUDE.md, MEMORY.md, and the v6.0 milestone blueprint.

### Locked Decisions (from PROJECT.md / REQUIREMENTS.md / v6.0 milestone)

- **BR-03 spec is fixed**: `q5='B' && q6='A'` is the trigger for Q6B. QUESTION_META index is **11** (Q1B claimed 9 in Phase 31, Q5B claimed 10 in Phase 32). Machine states must be `Q6B_*`. OracleExperience must be extended. 6 MP3s must be generated.
- **Branch theme is locked**: "O Espelho Extra" (the title in REQUIREMENTS.md and v6.0-ROADMAP.md). Semantic axis: visitor who dissolved their question but then opened to be seen — the rarissima profile that earns an *additional* mirror beyond the standard devolução.
- **AR-01 spec is fixed**: New archetype `DEVOLUCAO_ESPELHO_SILENCIOSO` — 6 segmentos no script (target ~22-28s, *shorter* than the typical 30-45s archetype), 6 MP3s, guard `isEspelhoSilencioso` with **highest priority** in `DEVOLUCAO.always`, trigger: `q6b === 'B'` (B = open form, not A = closed reading — see Section 3 narrative discussion below).
- **Devolve forma, não conteúdo**: The PROJECT.md decision (`v6.0`) states "ESPELHO_SILENCIOSO devolve forma, não conteúdo — quando visitante dissolve a própria pergunta + pede leitura, Oráculo devolve estrutura aberta como respeito ao gesto original". The 6 segments must be structured around an *open question* or *named pause*, not a 3-layer Winnicott/Lacan/Bion mirror.
- **POL-02 invariant remains intact**: `src/machines/guards/patternMatching.ts` stays byte-identical. The `q6b` field in `QuestionId` and `ChoiceMap` was added in Phase 31 (POL-02 work). Phase 33 does NOT touch types or patternMatching.ts. **The new `isEspelhoSilencioso` guard lives in `oracleMachine.ts` setup.guards block** (alongside `shouldBranchQ6B`).
- **Voice is `PznTnBc8X6pvixs9UkQm`** (Oracle voice). Working inflection tags: `warm`, `serious`, `gentle`, `determined`, `thoughtful`, `sad`. **Do NOT use `[whispering]`** — confirmed broken with this voice (CLAUDE.md MEMORY note).
- **PT-BR only**, no English in narration.
- **Zero text on screen** during the experience (UI-05): script entries are spoken via TTS, never rendered visually.
- **Max-path budget**: ≤ 450s (7:30 min). Phase 32 left 36s of headroom (414s used / 450s budget after Q1B+Q4B+Q5B path). Q6B + ESPELHO_SILENCIOSO worst case eats ~50-70s → likely overflow into the documented "1-3% visitor overflow accepted" zone (PROJECT.md decision).
- **Aceitar overflow temporal**: PROJECT.md decision: "Aceitar overflow temporal (~7:20 max-path) para 1-3% dos visitantes — preferível a cortar SETUPs base". Phase 33 may push max-path to ~7:00-7:20. POL-01 mitigation (cortar SETUPs) is explicitly Phase 35 work, not Phase 33.
- **Phase 33 implementation order**: Wave 1 (data) → Wave 2 (machine + UI) → Wave 3 (audio + timing + docs). No deviation from Phases 31/32 template.

### Claude's Discretion

- **Narrative content of the 12 SCRIPT keys** (6 Q6B + 6 ESPELHO_SILENCIOSO) — exact wording, segment count, inflection tags, pause durations. Three concrete options proposed in Section 3 below for each.
- **Keyword sets** for Q6B QUESTION_META[11] — must reflect the chosen narrative direction (Q6B options likely "Sim, deixa entrar / Não, deixa em forma" or similar).
- **Fallback + timeout content** — should rhyme with the branch's intimate register (visitor was asked something tender; fallback/timeout must not feel transactional).
- **Whether ESPELHO_SILENCIOSO uses 6 segments or fewer-but-longer segments** — REQUIREMENTS.md says "6 segmentos no script (~22-28s)" so default to 6 short segments. But the *form* (open question, structured pause) may justify 4 longer segments — Section 3 explores both.
- **The exact placement of the new guard line in `oracleMachine.ts` setup.guards** — by convention it goes after `shouldBranchQ5B` (Phase 32 added line 46) at line 47-48, with a comment mirroring Phase 31's style.
- **The exact placement of `DEVOLUCAO_ESPELHO_SILENCIOSO` state declaration** — by convention it goes immediately after the `DEVOLUCAO` parent state (line ~633) and before `DEVOLUCAO_SEEKER` (line 635), or grouped with the other 8 archetype states. Either is valid; first is cleaner because the new state is *primary* (highest priority).

### Deferred Ideas (OUT OF SCOPE for Phase 33)

- **CONTRA_FOBICO and PORTADOR archetype detection** — Phase 34 (AR-02, AR-03) work. Those guards DO need to live in `patternMatching.ts` (they read positional `choices`). Phase 33 does NOT touch patternMatching.ts.
- **Modifying ChoiceMap or QuestionId types** — already done in Phase 31 (POL-02). The `q6b` key is already valid. Touching types is regression risk.
- **Browser UAT of Q6B path** — Phase 35 (UAT-01) work. Phase 33 stops at unit tests + timing validation + roteiro.html sync.
- **POL-01 timing mitigation** (cutting Q1/Q3/Q5 SETUPs to fit overflow) — Phase 35 work. Phase 33 only *measures* the overflow and documents it.
- **96-permutation full validation matrix** — Phase 35 work. Phase 33 expands the existing 12-path matrix to ~18-24 paths covering Q6B and ESPELHO_SILENCIOSO permutations.
- **Visual/UI affordance for Q6B branch** — REQUIREMENTS.md OUT OF SCOPE: "Visual feedback diferente quando branch dispara — Branching deve sentir-se ORACULAR, não gamificado". Q6B uses the existing AGUARDANDO visual treatment.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **BR-03** | Visitor com `q5='B' && q6='A'` (dissolveu pergunta MAS pediu leitura) ouve a branch Q6B "O Espelho Extra" — 6 SCRIPT keys, QUESTION_META[11], guard `shouldBranchQ6B`, estados Q6B_*, OracleExperience extended, 6 MP3s gerados, transição condicional para DEVOLUCAO normal vs DEVOLUCAO_ESPELHO_SILENCIOSO | Sections 1, 2, 3 (Q6B narrative options), 4 (machine integration — Q6B subsection), 5 (timing), 6 (validation), 7 (files), 8 (risks) |
| **AR-01** | DEVOLUCAO_ESPELHO_SILENCIOSO arquetipo criado — 6 segmentos no script (~22-28s), 6 MP3s, guard `isEspelhoSilencioso` com highest priority no `always` do estado DEVOLUCAO, trigger: `q6b === 'B'` | Sections 1 (DEVOLUCAO area), 3 (ESPELHO_SILENCIOSO narrative options), 4 (machine integration — guard insertion + state subsection), 5 (timing), 6 (validation), 7 (files), 8 (risks — `always` ordering criticality) |

## 1. Domain Context — Q6 Area + DEVOLUCAO in the Current Machine

### What the Q6 area looks like today (post-Phase 32)

`oracleMachine.ts` lines 527-617 contain Paraíso Q6 + Q5B (Phase 32). The relevant lines:

```
PARAISO (id: 'PARAISO', initial: 'INTRO')          [line 460]
├── INTRO            ─NARRATIVA_DONE→ Q5_SETUP
├── Q5_SETUP/PERGUNTA/AGUARDANDO/TIMEOUT/RESPOSTA_A/B (lines 481-526)
├── Q5_RESPOSTA_A    ─NARRATIVA_DONE→ [
│                       { target: 'Q5B_SETUP', guard: 'shouldBranchQ5B' },  ← Phase 32 added
│                       { target: 'Q6_SETUP' }
│                     ] (lines 514-521)
├── Q6_SETUP         ─NARRATIVA_DONE→ Q6_PERGUNTA       (lines 527-530)
├── Q6_PERGUNTA      ─NARRATIVA_DONE→ Q6_AGUARDANDO     (lines 532-535)
├── Q6_AGUARDANDO    ─CHOICE_A→ Q6_RESPOSTA_A (recordChoice('q6','A'))   ← Q6B BRANCH POINT
│                    ─CHOICE_B→ Q6_RESPOSTA_B (recordChoice('q6','B'))
│                    ─after 25s→ Q6_TIMEOUT  (recordChoice('q6','B'))    (lines 537-553)
├── Q6_TIMEOUT       ─NARRATIVA_DONE→ Q6_RESPOSTA_B     (lines 555-559)
├── Q6_RESPOSTA_A    ─NARRATIVA_DONE→ '#oracle.DEVOLUCAO'  ← MUST BECOME GUARDED  (lines 560-564)
├── Q6_RESPOSTA_B    ─NARRATIVA_DONE→ '#oracle.DEVOLUCAO'  ← UNTOUCHED  (lines 565-569)
└── Q5B_SETUP/.../RESPOSTA_B (Phase 32) (lines 570-616)
```

### The Q6B branch point (lines 560-564)

**Currently** (post-Phase 32):
```typescript
Q6_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: '#oracle.DEVOLUCAO',
  },
},
```

**After Phase 33**:
```typescript
Q6_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q6B_SETUP', guard: 'shouldBranchQ6B' },  // q5=B AND q6=A
      { target: '#oracle.DEVOLUCAO' },                    // default fallthrough
    ],
  },
},
```

**Critical**: The guard reads `context.choiceMap.q5` and `context.choiceMap.q6`. By the time `Q6_RESPOSTA_A` fires `NARRATIVA_DONE`, both have already been recorded (`q5` was set in Q5_AGUARDANDO during Phase 32 — line 503, 506; `q6` was set in Q6_AGUARDANDO line 547). So the guard is evaluable. (Verified by mirror with Phase 31's `shouldBranchQ1B` guard reading `q1` and `q2`.)

**Q6_RESPOSTA_B is UNTOUCHED.** Q6B requires `q6='A'`. Visitors who chose B never reach Q6B regardless of q5.

### What Q5 and Q6 establish in the visitor's profile

| Question | A meaning | B meaning | What `B && A` says |
|----------|-----------|-----------|---------------------|
| **Q5** "Carregar a pergunta — ou deixar dissolver?" | Carregar — peso do não-saber | **Dissolver** — confiar que nem tudo precisa ser carregado | Visitor released the unanswerable. Acceptance, not accumulation. |
| **Q6** "Quer ouvir o que vi em você — ou já sabe?" | **Ouvir** — abertura a ser visto | Já saber — confiança no próprio interior | Visitor opened to receive even after they had let go. |

**Combined `q5='B' && q6='A'` profile:** *"I let the question dissolve. And then, when offered, I still wanted to be seen."* This is the rarissima profile — someone who released attachment to the question but kept openness to mirror. They are *not* a SEEKER (they didn't accumulate). They are *not* a GUARDIAN (they didn't refuse). They earned an *extra* mirror — but the right mirror to give them is one that *honors the dissolution* by not filling the space with content.

### Q6B branch sub-mechanics (the new states)

Q6B asks the visitor a **second pre-devolução question**: do you want a closed reading (a "what I see in you" diagnosis), or do you want an open form (a question or structured silence the Oracle leaves with you)?

**Resposta A — Closed reading**: visitor says "give me the diagnosis." Routes to **normal DEVOLUCAO** (one of the 8 existing archetypes). `q6b='A'`.

**Resposta B — Open form**: visitor says "leave me with the question, not the answer." Routes to **DEVOLUCAO_ESPELHO_SILENCIOSO**. `q6b='B'`.

This is why the AR-01 trigger is `q6b === 'B'` — counterintuitive on first read, but correct: B is the dignified refusal of closure. **The narrative for Q6B PERGUNTA must make this binary clear — see Section 3.**

### Where Q6B inserts (the surgical answer)

**Branch point**: `Q6_RESPOSTA_A.on.NARRATIVA_DONE` becomes a guarded array (above).

**6 new Q6B states** inserted after `Q5B_RESPOSTA_B` (current line 616) and before the closing brace of PARAISO `states:` (current line 617):

```typescript
// Q6B Branch states — conditional, only entered when shouldBranchQ6B guard passes
// Triggers from Q6_RESPOSTA_A when q5='B' AND q6='A' (ESPELHO_SILENCIOSO precursor)
// Both Q6B responses rejoin at #oracle.DEVOLUCAO (qualified — exits PARAISO)
// CRITICAL: target is qualified '#oracle.DEVOLUCAO' (NOT plain) — DEVOLUCAO is sibling of PARAISO at machine root
Q6B_SETUP: {
  on: { NARRATIVA_DONE: 'Q6B_PERGUNTA' },
},
Q6B_PERGUNTA: {
  on: { NARRATIVA_DONE: 'Q6B_AGUARDANDO' },
},
Q6B_AGUARDANDO: {
  after: {
    25000: {
      target: 'Q6B_TIMEOUT',
      actions: assign(recordChoice('q6b', 'A')),  // default-on-timeout: A (closed reading)
    },
  },
  on: {
    CHOICE_A: {
      target: 'Q6B_RESPOSTA_A',
      actions: assign(recordChoice('q6b', 'A')),
    },
    CHOICE_B: {
      target: 'Q6B_RESPOSTA_B',
      actions: assign(recordChoice('q6b', 'B')),
    },
  },
},
Q6B_TIMEOUT: {
  on: { NARRATIVA_DONE: 'Q6B_RESPOSTA_A' },
},
Q6B_RESPOSTA_A: {
  on: { NARRATIVA_DONE: '#oracle.DEVOLUCAO' },
},
Q6B_RESPOSTA_B: {
  on: { NARRATIVA_DONE: '#oracle.DEVOLUCAO' },
},
```

> **Difference from Phase 32**: Q5B's rejoin was plain `'Q6_SETUP'` (sibling inside PARAISO). Q6B's rejoin is qualified `'#oracle.DEVOLUCAO'` because DEVOLUCAO is at machine root, not inside PARAISO. This matches the existing `Q6_RESPOSTA_A`/`Q6_RESPOSTA_B` patterns (lines 562, 567).

### What DEVOLUCAO looks like today (post-Phase 32)

`oracleMachine.ts` lines 620-633:

```typescript
DEVOLUCAO: {
  id: 'DEVOLUCAO',
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    { target: 'DEVOLUCAO_CONTRADICTED' },
  ],
},
```

8 entries: 7 guarded archetypes + 1 unguarded fallthrough (CONTRADICTED). The `always` array is order-sensitive — XState evaluates top-to-bottom and takes the first guard that returns true.

### Where DEVOLUCAO_ESPELHO_SILENCIOSO inserts

**Modified DEVOLUCAO state** (Phase 33):

```typescript
DEVOLUCAO: {
  id: 'DEVOLUCAO',
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    // HIGHEST PRIORITY: ESPELHO_SILENCIOSO must precede all archetype guards
    // because q6b can ONLY be set when visitor traversed Q6B (q5=B && q6=A) AND chose B (open form)
    // Mathematical isolation: no normal devolução visitor can satisfy this guard
    { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' },
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    { target: 'DEVOLUCAO_CONTRADICTED' },
  ],
},
```

**New top-level state** `DEVOLUCAO_ESPELHO_SILENCIOSO` inserted immediately after `DEVOLUCAO` (line ~633) and before `DEVOLUCAO_SEEKER` (line 635):

```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: {
  on: {
    NARRATIVA_DONE: 'ENCERRAMENTO',
  },
  after: {
    300000: {
      target: '#oracle.IDLE',
      actions: assign({
        sessionId: '',
        choices: [],
        choiceMap: {},
        fallbackCount: 0,
        currentPhase: 'APRESENTACAO',
      }),
    },
  },
},
```

This is structurally identical to the 8 existing `DEVOLUCAO_*` states (lines 635-777). It's a leaf state that fires `NARRATIVA_DONE → ENCERRAMENTO` and has the same 5-minute idle reset.

### `currentPhase` context value

`currentPhase` is set to `'DEVOLUCAO'` on entry to the parent `DEVOLUCAO` state (line 622). The new `DEVOLUCAO_ESPELHO_SILENCIOSO` does NOT inherit that automatically because it's a sibling of DEVOLUCAO at machine root, not a child. **The flow `DEVOLUCAO → ESPELHO_SILENCIOSO` works because the `entry` action on DEVOLUCAO fires before the `always` transition resolves and pushes context to ESPELHO_SILENCIOSO.** This is the same mechanism the other 8 DEVOLUCAO_* states rely on — verified by reading lines 635-777 and confirming none of them re-assign `currentPhase`.

### `isPergunta` and `getBreathingDelay` impact

The `Q6B_PERGUNTA` state will need to be added to `OracleExperience.tsx`'s `isPergunta` boolean chain (lines 344-354), so the mic warmup logic fires. Same for `Q6B_AGUARDANDO` in `isAguardando` (lines 296-306).

`getBreathingDelay` (lines 62-139) needs entries for all 6 new Q6B states + 1 new DEVOLUCAO_ESPELHO_SILENCIOSO state. Phase 32's pattern (LONG before SETUP, MEDIUM elsewhere, NONE for the unanswered states) is the template.

## 2. Implementation Pattern from Phases 31/32 (concrete steps)

Phases 31 and 32 shipped Q1B and Q5B in 3 waves with this exact distribution. Phase 33 should follow the template byte-for-byte, with Wave 2 expanded for the additional ESPELHO_SILENCIOSO deliverable.

### Wave 1: Data + Types (~1.5-2h, 50% larger than Phase 32 because 12 SCRIPT keys instead of 6)

**Files modified:**
1. `src/data/script.ts` — Insert **12 new SCRIPT keys**:
   - **6 Q6B keys** after `PARAISO_Q6_RESPOSTA_B` (line 454) and before the DEVOLUCOES comment block (line 456): `PARAISO_Q6B_SETUP`, `PARAISO_Q6B_PERGUNTA`, `PARAISO_Q6B_RESPOSTA_A`, `PARAISO_Q6B_RESPOSTA_B`, `PARAISO_Q6B_FALLBACK`, `PARAISO_Q6B_TIMEOUT`. This grouping keeps Q6 + Q6B visually adjacent in the script file, mirroring how Phase 32 grouped Q5 + Q5B.
   - **6 ESPELHO_SILENCIOSO sub-keys** at the END of the DEVOLUCOES section, after `DEVOLUCAO_MIRROR` (line 526) and before the ENCERRAMENTO comment (line 528). Recommended naming: `DEVOLUCAO_ESPELHO_SILENCIOSO_1` through `DEVOLUCAO_ESPELHO_SILENCIOSO_6`. **Rationale**: REQUIREMENTS.md says "6 segmentos" AND "6 MP3s". Each segment = 1 script key = 1 MP3 (because `scripts/generate-audio-v3.ts` discovers keys via `Object.keys(SCRIPT)` and produces one MP3 per key). The other 8 archetypes pack 4 segments into ONE key, but they each generate ONE MP3 — so to get 6 MP3s for ESPELHO, you need 6 separate keys.
   - **OPEN PLANNER QUESTION**: confirm this naming and structure with `scripts/generate-audio-v3.ts` filename derivation logic (snake_case from key name → `devolucao_espelho_silencioso_1.mp3` etc.). The planner MUST grep `scripts/generate-audio-v3.ts` first to verify the filename derivation.
   - **Alternative**: pack all 6 segments into ONE key `DEVOLUCAO_ESPELHO_SILENCIOSO` (mirroring the other 8 archetypes) → produces ONE MP3 (`devolucao_espelho_silencioso.mp3`). This is simpler and consistent with the existing 8 archetypes, but contradicts REQUIREMENTS.md "6 MP3s" literal reading. **The planner must decide based on whether REQUIREMENTS.md "6 MP3s" is a literal hard requirement or a description of segment count.** Recommendation: ask the user during phase planning, OR default to the literal interpretation (6 keys / 6 MP3s).
2. `src/types/index.ts` — Add `QUESTION_META[11]` (Q6B). Mirror QUESTION_META[10] (Q5B, lines ~157-167). Required fields: `questionContext`, `optionA`, `optionB`, `keywordsA`, `keywordsB`, `defaultOnTimeout`. **Default on timeout = `'A'`** (closed reading, the more common preference and the one that avoids accidentally triggering ESPELHO_SILENCIOSO via silence — since ESPELHO_SILENCIOSO requires conscious choice).
3. **No changes to** `src/machines/oracleMachine.types.ts` — `q6b` already in `QuestionId` from Phase 31. Planner MUST verify with `grep "q6b" src/machines/oracleMachine.types.ts` that line 8 contains `'q6b'`.
4. **No changes to** `src/machines/guards/patternMatching.ts` — POL-02 invariant. Planner MUST verify byte-identical to v4.0 baseline.
5. **No changes to** test infrastructure — existing `oracleMachine-types.test.ts` and `OracleExperience-helpers.test.ts` accept the new keys without modification.

**Tests to add in Wave 1:**
- `src/data/__tests__/script.test.ts` (or wherever script keys are tested) — verify all 12 new keys exist, are non-empty arrays, contain only valid inflection tags, and total estimated duration matches budget (~22-28s for ESPELHO, ~30-45s for Q6B).
- `src/types/__tests__/index.test.ts` (or wherever QUESTION_META is tested) — verify QUESTION_META[11] exists with all required fields and that `defaultOnTimeout` is `'A'`.

### Wave 2: Machine + UI Integration (~2.5-3.5h, larger than Phase 32 because of DEVOLUCAO state mod + new top-level state)

**Files modified:**
1. `src/machines/oracleMachine.ts` — Multiple insertions:
   - **Add guard `shouldBranchQ6B`** in setup.guards block (after line 46 `shouldBranchQ5B`). Mirror Phase 32 line 46 syntax exactly:
     ```typescript
     // Branch guards (new — Phase 33, BR-03)
     shouldBranchQ6B: ({ context }) => context.choiceMap.q5 === 'B' && context.choiceMap.q6 === 'A',
     ```
   - **Add guard `isEspelhoSilencioso`** in the same block (immediately after `shouldBranchQ6B`). This is the highest-priority archetype guard:
     ```typescript
     // Archetype guard (new — Phase 33, AR-01) — HIGHEST PRIORITY in DEVOLUCAO.always
     // Lives here (NOT in patternMatching.ts) because it reads choiceMap.q6b (named lookup)
     // patternMatching.ts only reads context.choices (positional array) per POL-02 invariant
     isEspelhoSilencioso: ({ context }) => context.choiceMap.q6b === 'B',
     ```
   - **Modify `Q6_RESPOSTA_A`** (currently lines 560-564): replace the unconditional `'#oracle.DEVOLUCAO'` target with the guarded array (see Section 1 above).
   - **Add 6 Q6B states** after `Q5B_RESPOSTA_B` (line 615) and before the closing brace of PARAISO `states:` block (line 617). Use the exact code block from Section 1.
   - **Modify `DEVOLUCAO` state's `always` array** (lines 623-632): insert the new highest-priority entry as the FIRST element of the array.
   - **Add new top-level state `DEVOLUCAO_ESPELHO_SILENCIOSO`** after the `DEVOLUCAO` block (line 633) and before `DEVOLUCAO_SEEKER` (line 635). Use the exact code block from Section 1.
2. `src/components/experience/OracleExperience.tsx` — Six helper extensions, mirroring Phases 31/32:
   - **Constants block** (lines 41-50): Add `Q6B_CHOICE` constant. Use index `11` to mirror QUESTION_META[11].
   - **`getBreathingDelay`** (lines 62-139): Add entries for `Q6B_SETUP` (LONG), `Q6B_PERGUNTA` (MEDIUM), `Q6B_AGUARDANDO` (NONE), `Q6B_TIMEOUT` (SHORT), `Q6B_RESPOSTA_A` (MEDIUM), `Q6B_RESPOSTA_B` (MEDIUM), `DEVOLUCAO_ESPELHO_SILENCIOSO` (LONG — same as the other 8 archetypes at lines 93-100).
   - **`getScriptKey`** (lines 144-223): Add entries mapping each Q6B state to its `PARAISO_Q6B_*` script key. For `DEVOLUCAO_ESPELHO_SILENCIOSO`: see "Open architectural question" below.
   - **`getFallbackScript`** (lines 228-240): Map `Q6B_AGUARDANDO` → `PARAISO_Q6B_FALLBACK`.
   - **`activeChoiceConfig` useMemo** (lines 281-293): Add Q6B branch returning `Q6B_CHOICE`.
   - **`isAguardando`** (lines 296-306): Add `Q6B_AGUARDANDO` to the boolean chain.
   - **`isPergunta`** (lines 344-354): Add `Q6B_PERGUNTA` to the boolean chain.

**Open architectural question for the planner**: How does the 6-segment ESPELHO_SILENCIOSO play back as a single state? Three options:
- **Option A — Single composite key**: Concatenate all 6 segments under one script key (e.g., `DEVOLUCAO_ESPELHO_SILENCIOSO`) like the existing 8 archetypes. Generate ONE MP3. Contradicts REQUIREMENTS.md "6 MP3s" but is the simplest.
- **Option B — 6 sub-states**: Create `DEVOLUCAO_ESPELHO_SILENCIOSO_1` through `_6` as nested states inside a parent `DEVOLUCAO_ESPELHO_SILENCIOSO` compound state, each transitioning via NARRATIVA_DONE. 6 MP3s, 6 states, complex.
- **Option C — Single state, sequenced playback**: One state, 6 separate script keys, OracleExperience plays them in sequence using a state-internal counter or `useEffect`. 6 MP3s, 1 state, medium complexity.

**Recommendation: Option A** (single composite key) — cleanest from a state machine perspective and matches the existing 8 archetypes byte-for-byte. The "6 MP3s" line in REQUIREMENTS.md should be reinterpreted as "6 segments" (the more accurate spec). The planner should confirm with the user, but Option A is the path of least resistance and least code-deviation. If user insists on 6 MP3s, fall back to Option B (compound state).

**Tests to add in Wave 2:**
- `src/machines/__tests__/oracleMachine.test.ts` — Q6B branching tests (mirror Phase 32's Q5B tests):
  - `shouldBranchQ6B` returns true only when `q5='B' && q6='A'`
  - `isEspelhoSilencioso` returns true only when `q6b='B'`
  - State machine routes through Q6B when guard passes
  - State machine skips Q6B when guard fails (existing devolução flow preserved)
  - DEVOLUCAO routes to ESPELHO_SILENCIOSO when `q6b='B'`
  - DEVOLUCAO routes to existing 8 archetypes when `q6b` is undefined
  - DEVOLUCAO routes to existing 8 archetypes when `q6b='A'` (visitor took Q6B but chose closed reading)
  - Q6B_TIMEOUT defaults to RESPOSTA_A (closed reading)
- `src/components/experience/__tests__/OracleExperience-helpers.test.ts` — extend with Q6B helper coverage.

### Wave 3: Audio + Timing + Roteiro (~2-3h)

**Files modified:**
1. `scripts/generate-audio-v3.ts` — No changes if it auto-discovers keys via `Object.keys(SCRIPT)`. Planner must verify (Phase 32 verification confirmed this works for Q5B). Run:
   ```bash
   npx tsx scripts/generate-audio-v3.ts
   ```
   Expected output (assuming Option A for ESPELHO_SILENCIOSO): 7 new MP3s in `public/audio/prerecorded/`:
   - `paraiso_q6b_setup.mp3`
   - `paraiso_q6b_pergunta.mp3`
   - `paraiso_q6b_resposta_a.mp3`
   - `paraiso_q6b_resposta_b.mp3`
   - `fallback_q6b.mp3`
   - `timeout_q6b.mp3`
   - `devolucao_espelho_silencioso.mp3`
   - **Total after Phase 33: 73 + 7 = 80 MP3s** (Option A) or **73 + 12 = 85 MP3s** (Option B/C with 6 sub-keys).
2. `scripts/validate-timing.ts` — Expand the 12-path matrix in `ALL_PATHS` (lines 148-167) to cover Q6B and ESPELHO_SILENCIOSO permutations. **New permutation dimensions:**
   - `hasQ6B` boolean (mutually exclusive with `hasQ5B` because Q5B requires `q5='A'` and Q6B requires `q5='B'`)
   - `hasEspelhoSilencioso` boolean (only valid when `hasQ6B === true`)
   - **New path count**: ~18-24 paths (planner determines exact count by exhaustive enumeration of Q1B × Q4B × (Q5B XOR Q6B-with-or-without-ESPELHO) × q6 dimension).
   - The `pickLongestDevolucao()` helper (lines 97-121) needs an additional case: when `hasEspelhoSilencioso === true`, return the ESPELHO_SILENCIOSO key duration instead of the longest of the 8 existing archetypes.
   - **Worst-case path forecast**: Q1B + Q4B + Q6B + ESPELHO_SILENCIOSO (note: Q5B is excluded by mutual exclusion). Estimated max-path: ~7:00-7:20 (above 7:30 budget = 0-20s overflow likely).
3. `public/roteiro.html` — Update Mermaid flowchart and narrative text:
   - **Mermaid flowchart** (lines 386-444): Add Q6B node after Q6 + add DEVOLUCAO_ESPELHO_SILENCIOSO node + add edges. Add `class Q6B branch` line at line 443 area.
   - **Branch indicator HTML** (lines ~597-600 area): Add a "Q6B Branch" indicator block mirroring the Q1B/Q5B blocks.
   - **Narrative text**: Update overview "Ramificações" (line ~376) from current count to current+1.
   - **Devoluções list**: Add ESPELHO_SILENCIOSO to whatever list exists for the 8 archetypes.

**Tests / verification in Wave 3:**
- Run `npm test` — expect zero regressions. Phase 32 baseline: 246+ tests passing.
- Run `npx tsx scripts/validate-timing.ts` — verify all paths fit budget OR document overflow per PROJECT.md decision.
- Manually verify each new MP3 exists in `public/audio/prerecorded/` and is non-empty.
- Visually inspect `public/roteiro.html` rendered in a browser — confirm Mermaid flowchart includes Q6B path and ESPELHO_SILENCIOSO node.


## 3. Narrative Content Proposals

This is the **Claude's Discretion** zone. Three concrete options are proposed for each of the two narrative deliverables (Q6B branch + ESPELHO_SILENCIOSO archetype). The planner picks one or remixes — the Wave 1 task author must commit to a single direction before writing script keys.

### 3.1 Q6B Branch — "O Espelho Extra"

**Setting**: Visitor just heard `PARAISO_Q6_RESPOSTA_A` ("Então escuta. Não vou confirmar o que você já pensa..."). They opened to be seen. But they had also (in Q5) chosen to *let the question dissolve*. Q6B catches them in this paradox: you released attachment, then opened to be seen — what do you actually want from the mirror?

The Q6B PERGUNTA must offer two responses that map cleanly to:
- **A** = closed reading ("show me the diagnosis") → routes to normal devolução (one of 8 archetypes)
- **B** = open form ("leave me with the shape, not the content") → routes to DEVOLUCAO_ESPELHO_SILENCIOSO

**Length target**: ~30-45s total across the 6 keys (matching Q5B's measured ~38s).

#### Option A — "O que você quer ver?"

Direct, almost confessional. Treats the visitor as collaborator in the act of mirroring.

```typescript
PARAISO_Q6B_SETUP: [
  { text: "Espera.", pauseAfter: 1000, inflection: ['thoughtful'] },
  { text: "Você dissolveu a pergunta lá atrás. E agora você abre — quer ouvir o que eu vi.", pauseAfter: 1100, inflection: ['warm'] },
  { text: "Tem duas formas do que eu posso te dar. Você precisa escolher qual.", pauseAfter: 1200 },
],

PARAISO_Q6B_PERGUNTA: [
  { text: "Você quer um nome — algo fechado, que você leva pra casa como um diagnóstico — ou prefere uma forma aberta, uma pergunta que fica te olhando depois que eu calar?", pauseAfter: 900 },
],

PARAISO_Q6B_RESPOSTA_A: [
  { text: "Você quer o nome.", pauseAfter: 900 },
  { text: "Tudo bem. Você merece a clareza que pediu.", pauseAfter: 1100, inflection: ['warm'] },
],

PARAISO_Q6B_RESPOSTA_B: [
  { text: "Você quer a forma.", pauseAfter: 900 },
  { text: "Isso é o que eu mais respeito. Você dissolveu uma pergunta — não vai deixar que eu te entregue outra fechada no lugar.", pauseAfter: 1300, inflection: ['gentle'] },
],

PARAISO_Q6B_FALLBACK: [
  { text: "Eu não consegui ouvir. Posso te oferecer de novo: um nome, ou uma forma?", pauseAfter: 800 },
],

PARAISO_Q6B_TIMEOUT: [
  { text: "O silêncio também escolhe. Eu vou te dar o nome — é o caminho mais direto.", pauseAfter: 1000 },
],
```

**Keywords A**: nome, fechado, diagnóstico, claro, certeza, dizer, falar, mostrar, ver, leia, leitura, padrão
**Keywords B**: forma, aberta, pergunta, silêncio, calar, depois, fica, deixar, abrir, espaço, vazio, respira

#### Option B — "Espelho ou eco?"

More poetic. Uses the metaphor of mirror vs. echo to dramatize the difference between content and form.

```typescript
PARAISO_Q6B_SETUP: [
  { text: "Espera. Tem mais uma coisa.", pauseAfter: 1100, inflection: ['thoughtful'] },
  { text: "Você dissolveu a pergunta. Mas agora abre os olhos pro espelho. Isso é raro — quase ninguém faz os dois.", pauseAfter: 1200, inflection: ['warm'] },
  { text: "Por isso eu vou te oferecer duas formas de espelho. Diferentes.", pauseAfter: 1100 },
],

PARAISO_Q6B_PERGUNTA: [
  { text: "Você quer um espelho que mostra — ou um espelho que pergunta de volta?", pauseAfter: 900 },
],

PARAISO_Q6B_RESPOSTA_A: [
  { text: "Espelho que mostra.", pauseAfter: 900 },
  { text: "Você vai ouvir o padrão. Vai sair com algo nas mãos.", pauseAfter: 1100, inflection: ['gentle'] },
],

PARAISO_Q6B_RESPOSTA_B: [
  { text: "Espelho que pergunta.", pauseAfter: 900 },
  { text: "Você não vai sair com nada nas mãos. Vai sair com algo na boca — uma pergunta que continua aberta.", pauseAfter: 1300, inflection: ['warm'] },
],

PARAISO_Q6B_FALLBACK: [
  { text: "Eu vou repetir, mais devagar. Espelho que mostra — ou espelho que pergunta?", pauseAfter: 800 },
],

PARAISO_Q6B_TIMEOUT: [
  { text: "Quando você silencia, eu escolho mostrar. É o que costumo fazer.", pauseAfter: 1000 },
],
```

**Keywords A**: mostra, mostrar, ver, padrão, fala, dizer, palavra, conteúdo, espelho, leia, conhecer, descobrir
**Keywords B**: pergunta, perguntar, abre, deixa, calar, silêncio, oco, vazio, espaço, depois, continua, fica

#### Option C — "Você já dissolveu uma. Quer outra?" (most cinematic)

Echoes Q5 directly. Slowest and most intimate. Highest emotional stakes.

```typescript
PARAISO_Q6B_SETUP: [
  { text: "Antes de eu começar.", pauseAfter: 1200, inflection: ['serious'] },
  { text: "Você lembra do que você fez lá atrás? Você deixou uma pergunta dissolver. Disse: nem tudo precisa ser carregado.", pauseAfter: 1300, inflection: ['warm'] },
  { text: "Eu vou te respeitar. Eu posso te dar uma resposta — fechada, definitiva — ou eu posso te dar outra pergunta. Aberta. Como a que você acabou de soltar.", pauseAfter: 1400 },
],

PARAISO_Q6B_PERGUNTA: [
  { text: "Resposta — ou outra pergunta?", pauseAfter: 1000 },
],

PARAISO_Q6B_RESPOSTA_A: [
  { text: "Resposta.", pauseAfter: 1000 },
  { text: "Eu vou te dar o que eu vi. Vai ser uma forma — você decide o que faz com ela.", pauseAfter: 1100, inflection: ['warm'] },
],

PARAISO_Q6B_RESPOSTA_B: [
  { text: "Outra pergunta.", pauseAfter: 1000 },
  { text: "Você continua na coragem. Você vai sair daqui com mais espaço, não com mais palavra.", pauseAfter: 1300, inflection: ['gentle'] },
],

PARAISO_Q6B_FALLBACK: [
  { text: "Não ouvi. Resposta — ou pergunta?", pauseAfter: 800 },
],

PARAISO_Q6B_TIMEOUT: [
  { text: "Você ficou quieto. Eu vou te dar a resposta — é o que a quietude geralmente pede.", pauseAfter: 1000 },
],
```

**Keywords A**: resposta, responder, fechada, definitiva, fala, diz, mostra, leitura, padrão, sim, dá, entrega
**Keywords B**: pergunta, perguntar, outra, abre, espaço, dissolver, continuar, deixa, vazio, aberta, oco, silêncio

#### Recommendation

**Option C is the strongest narratively** — it explicitly ties Q6B back to Q5's dissolution gesture, which is the entire reason Q6B exists. It honors the visitor's earlier choice rather than pretending Q6B is a fresh decision. **Recommendation: ship Option C unless the planner has strong stylistic objections.**

Option A is the safest bet (most directly understandable PERGUNTA). Option B has the strongest metaphor but risks confusing the binary if the visitor doesn't catch "espelho que mostra" vs "espelho que pergunta" on first listen.

### 3.2 DEVOLUCAO_ESPELHO_SILENCIOSO — The Form-Not-Content Devolução

**Setting**: Visitor chose Q6B response B ("open form"). They have explicitly refused a closed diagnosis. The Oracle must now deliver a devolução that *honors* that refusal — meaning: NO declarative "this is what you are", NO 4-segment Winnicott/Lacan/Bion mirror, NO accumulating content.

**What the form IS**: An open question, possibly preceded by a brief acknowledgment, possibly followed by a structured pause. The visitor leaves with something they cannot resolve. That is the gift.

**Length target**: ~22-28s total — explicitly *shorter* than the typical 30-45s archetype, because shorter = more space, and space is the medium.

**Structural constraint**: 6 segments (per REQUIREMENTS.md). The 6 segments should NOT all be statements — at least one should be a question, and at least two should be silence anchors (`[pause]` style, achieved via long `pauseAfter`).

#### Option A — "A Pergunta Que Sobra"

A single open question, set up with acknowledgment, framed as a gift the visitor takes home unopened.

```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: [
  { text: "Você não quis o nome.", pauseAfter: 1500, inflection: ['thoughtful'] },
  { text: "Eu respeito isso. É raro.", pauseAfter: 1800, inflection: ['warm'] },
  { text: "Então eu te devolvo o que você me deu — só que invertido.", pauseAfter: 1200 },
  { text: "Você dissolveu uma pergunta lá atrás. Eu vou te dar outra.", pauseAfter: 1300 },
  { text: "Não pra você responder. Pra você carregar do mesmo jeito que carregou aquela primeira — até ela também dissolver.", pauseAfter: 1500, inflection: ['gentle'] },
  { text: "Aqui vai: O que em você ainda não foi feito por ninguém — nem por você?", pauseAfter: 2000, inflection: ['warm'] },
],
```

**Total estimated duration**: ~26s (5 segments narrated + closing question, with long pauses)
**Form**: acknowledgment → respect → contract → setup → instruction → open question
**The question** ("O que em você ainda não foi feito por ninguém — nem por você?") is unanswerable on purpose. It is a Winnicott-adjacent question about "the true self that has not yet been allowed", but framed without naming any framework.

#### Option B — "O Silêncio Que Você Ganha"

Less explicit acknowledgment, more direct delivery. Heavier emphasis on silence as content.

```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: [
  { text: "Tudo bem.", pauseAfter: 1500, inflection: ['warm'] },
  { text: "Você não vai sair daqui com um nome. Você vai sair com um silêncio que tem forma.", pauseAfter: 1500 },
  { text: "Eu não vou te dizer o que eu vi. Vou te dar o lugar onde isso poderia ser dito.", pauseAfter: 1500, inflection: ['thoughtful'] },
  { text: "Aqui:", pauseAfter: 2200 },
  { text: "O que você nunca pediu — mas que mesmo assim te falta?", pauseAfter: 1800, inflection: ['gentle'] },
  { text: "Esse é o seu espelho. Não tem moldura. Não tem reflexo. Só pergunta.", pauseAfter: 1400, inflection: ['warm'] },
],
```

**Total estimated duration**: ~24s
**Form**: acceptance → reframing → withholding → silence anchor → open question → meta-frame
**The question** ("O que você nunca pediu — mas que mesmo assim te falta?") is about *unconscious desire* — also Winnicott-adjacent, also Lacan-adjacent (the "objet petit a"), but never named.

#### Option C — "Forma Sem Nome"

Most minimalist. Two questions instead of one. Lets the visitor pick which one to carry.

```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: [
  { text: "Você dissolveu uma. E pediu forma, não conteúdo.", pauseAfter: 1400, inflection: ['warm'] },
  { text: "Então é assim que termina:", pauseAfter: 1800, inflection: ['serious'] },
  { text: "Duas perguntas. Você escolhe qual leva — ou leva as duas.", pauseAfter: 1200 },
  { text: "Primeira: Onde, em você, a coisa mais importante ainda está esperando alguém perguntar?", pauseAfter: 1800, inflection: ['gentle'] },
  { text: "Segunda: O que em você foi formado por uma pergunta que você nem sabia que tinha sido feita?", pauseAfter: 2000, inflection: ['thoughtful'] },
  { text: "É só isso. Não tem mais. Você vai embora carregando o oco.", pauseAfter: 1500, inflection: ['warm'] },
],
```

**Total estimated duration**: ~28s (longest of the three; right at the upper limit of REQUIREMENTS.md target)
**Form**: contract → frame → instruction → question 1 → question 2 → closing acknowledgment of the void
**The two questions** echo the SEEKER/GUARDIAN duality — one about explicit unmet desire, one about implicit pre-formation. The visitor is asked to *be in* the questions, not to answer them.

#### Recommendation

**Option A is the safest** — single question, clear arc, honors REQUIREMENTS.md exactly. The unanswerable question is an explicit Winnicott reference (absorbed, not quoted) which keeps the psychoanalytic depth without explicit naming.

**Option B is the most poetic** — best for the Bienal psychoanalytic audience. "Silêncio que tem forma" is the kind of phrase the audience will quote. **Recommended for shipping** if Wave 3 timing budget allows.

**Option C is the most ambitious** — two questions risks dilution (visitor may only retain one), but the framing "Você vai embora carregando o oco" is the strongest closing sentence in the entire script. Risk: longest of the three, may push max-path overflow further.

**Final recommendation: ship Option B** — best balance of safety, poetic register, and length. Defer Option C ambition to a future milestone.

### 3.3 Inflection Tag Audit

All three options use ONLY confirmed-working tags from CLAUDE.md MEMORY: `warm`, `thoughtful`, `gentle`, `serious`. **Zero `[whispering]` tags** (broken with voice ID). **Zero unverified tags**.


## 4. State Machine Integration Spec (canonical Phase 33 patch)

This section is the **planner's checklist**. Every diff below must appear in Wave 2's tasks.

### 4.1 Guards block addition (oracleMachine.ts lines ~30-47)

**Before** (post-Phase 32):
```typescript
guards: {
  // Archetype guards (existing)
  isMirror: ARCHETYPE_GUARDS.isMirror,
  isDepthSeeker: ARCHETYPE_GUARDS.isDepthSeeker,
  isSurfaceKeeper: ARCHETYPE_GUARDS.isSurfaceKeeper,
  isPivotEarly: ARCHETYPE_GUARDS.isPivotEarly,
  isPivotLate: ARCHETYPE_GUARDS.isPivotLate,
  isSeeker: ARCHETYPE_GUARDS.isSeeker,
  isGuardian: ARCHETYPE_GUARDS.isGuardian,
  isContradicted: ARCHETYPE_GUARDS.isContradicted,
  // Branch guards (new)
  shouldBranchQ2B: ({ context }) => context.choiceMap.q1 === 'A' && context.choiceMap.q2 === 'A',
  shouldBranchQ4B: ({ context }) => context.choiceMap.q3 === 'A' && context.choiceMap.q4 === 'A',
  // Branch guards (new — Phase 31, BR-01)
  shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B',
  // Branch guards (new — Phase 32, BR-02)
  shouldBranchQ5B: ({ context }) => context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A',
},
```

**After** (Phase 33):
```typescript
guards: {
  // Archetype guards (existing — from patternMatching.ts, POL-02 invariant)
  isMirror: ARCHETYPE_GUARDS.isMirror,
  isDepthSeeker: ARCHETYPE_GUARDS.isDepthSeeker,
  isSurfaceKeeper: ARCHETYPE_GUARDS.isSurfaceKeeper,
  isPivotEarly: ARCHETYPE_GUARDS.isPivotEarly,
  isPivotLate: ARCHETYPE_GUARDS.isPivotLate,
  isSeeker: ARCHETYPE_GUARDS.isSeeker,
  isGuardian: ARCHETYPE_GUARDS.isGuardian,
  isContradicted: ARCHETYPE_GUARDS.isContradicted,
  // Branch guards (new)
  shouldBranchQ2B: ({ context }) => context.choiceMap.q1 === 'A' && context.choiceMap.q2 === 'A',
  shouldBranchQ4B: ({ context }) => context.choiceMap.q3 === 'A' && context.choiceMap.q4 === 'A',
  // Branch guards (new — Phase 31, BR-01)
  shouldBranchQ1B: ({ context }) => context.choiceMap.q1 === 'B' && context.choiceMap.q2 === 'B',
  // Branch guards (new — Phase 32, BR-02)
  shouldBranchQ5B: ({ context }) => context.choiceMap.q4 === 'A' && context.choiceMap.q5 === 'A',
  // Branch guards (new — Phase 33, BR-03)
  shouldBranchQ6B: ({ context }) => context.choiceMap.q5 === 'B' && context.choiceMap.q6 === 'A',
  // Archetype guard (new — Phase 33, AR-01) — HIGHEST PRIORITY in DEVOLUCAO.always
  // Lives here (NOT in patternMatching.ts) because it reads choiceMap.q6b (named lookup)
  // patternMatching.ts only reads context.choices (positional array) per POL-02 invariant
  isEspelhoSilencioso: ({ context }) => context.choiceMap.q6b === 'B',
},
```

### 4.2 Q6_RESPOSTA_A modification (oracleMachine.ts lines 560-564)

**Before**:
```typescript
Q6_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: '#oracle.DEVOLUCAO',
  },
},
```

**After**:
```typescript
Q6_RESPOSTA_A: {
  on: {
    NARRATIVA_DONE: [
      { target: 'Q6B_SETUP', guard: 'shouldBranchQ6B' },  // q5=B AND q6=A → Q6B branch
      { target: '#oracle.DEVOLUCAO' },                    // default fallthrough
    ],
  },
},
```

**`Q6_RESPOSTA_B` (lines 565-569) is UNTOUCHED.**

### 4.3 Six new Q6B states (oracleMachine.ts insertion after line 615, before line 617)

Insert verbatim from Section 1 above. The order matches Phase 32's Q5B insertion order: SETUP → PERGUNTA → AGUARDANDO → TIMEOUT → RESPOSTA_A → RESPOSTA_B.

### 4.4 DEVOLUCAO `always` modification (oracleMachine.ts lines 623-632)

**Before**:
```typescript
DEVOLUCAO: {
  id: 'DEVOLUCAO',
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    { target: 'DEVOLUCAO_CONTRADICTED' },
  ],
},
```

**After**:
```typescript
DEVOLUCAO: {
  id: 'DEVOLUCAO',
  entry: assign({ currentPhase: 'DEVOLUCAO' }),
  always: [
    // HIGHEST PRIORITY (Phase 33, AR-01) — must precede all archetype guards
    // Mathematical isolation: q6b can ONLY be set when visitor reached Q6B (q5=B && q6=A)
    // and chose B. No normal devolução visitor satisfies this guard.
    { target: 'DEVOLUCAO_ESPELHO_SILENCIOSO', guard: 'isEspelhoSilencioso' },
    { target: 'DEVOLUCAO_MIRROR', guard: 'isMirror' },
    { target: 'DEVOLUCAO_DEPTH_SEEKER', guard: 'isDepthSeeker' },
    { target: 'DEVOLUCAO_SURFACE_KEEPER', guard: 'isSurfaceKeeper' },
    { target: 'DEVOLUCAO_PIVOT_EARLY', guard: 'isPivotEarly' },
    { target: 'DEVOLUCAO_PIVOT_LATE', guard: 'isPivotLate' },
    { target: 'DEVOLUCAO_SEEKER', guard: 'isSeeker' },
    { target: 'DEVOLUCAO_GUARDIAN', guard: 'isGuardian' },
    { target: 'DEVOLUCAO_CONTRADICTED' },
  ],
},
```

### 4.5 New top-level state DEVOLUCAO_ESPELHO_SILENCIOSO (insert at line ~634, before DEVOLUCAO_SEEKER)

```typescript
DEVOLUCAO_ESPELHO_SILENCIOSO: {
  on: {
    NARRATIVA_DONE: 'ENCERRAMENTO',
  },
  after: {
    300000: {
      target: '#oracle.IDLE',
      actions: assign({
        sessionId: '',
        choices: [],
        choiceMap: {},
        fallbackCount: 0,
        currentPhase: 'APRESENTACAO',
      }),
    },
  },
},
```

Structurally identical to all 8 existing `DEVOLUCAO_*` states (lines 635-777). The 5-minute idle reset (`after.300000`) is mandatory and must match those states byte-for-byte.

### 4.6 Mutual exclusion proof (formal sketch)

Q5B requires `shouldBranchQ5B` = `q4='A' && q5='A'`.
Q6B requires `shouldBranchQ6B` = `q5='B' && q6='A'`.

These two require *different values of q5* (`'A'` vs `'B'`). q5 is set by `recordChoice('q5', ...)` exactly once per session and is immutable thereafter. Therefore Q5B and Q6B are **mutually exclusive** — no single session can traverse both.

This means: in the validation matrix, `(hasQ5B === true) && (hasQ6B === true)` is an impossible state. The path enumerator can hard-skip it.

## 5. Timing Impact

### 5.1 Current state (post-Phase 32, validated 2026-04-07)

| Path | Duration | Margin |
|------|----------|--------|
| Base (no branches) | ~5:00 | +2:30 |
| Base + Q1B | ~5:30 | +2:00 |
| Base + Q4B | ~5:30 | +2:00 |
| Base + Q5B | ~5:38 | +1:52 |
| Base + Q1B + Q4B | ~6:00 | +1:30 |
| Base + Q1B + Q5B | ~6:08 | +1:22 |
| Base + Q4B + Q5B | ~6:08 | +1:22 |
| Base + Q1B + Q4B + Q5B | **~6:53.7** | **+0:36** |

(Source: Phase 32 verification, 12-path validate-timing.ts run.)

### 5.2 Phase 33 forecast (estimated)

Q6B adds approximately:
- Q6B_SETUP: ~7s (3 segments, similar to Q5B SETUP)
- Q6B_PERGUNTA: ~6s (1 segment + breathing)
- Q6B_RESPOSTA_A or _B: ~5s (2 segments)
- Plus inter-state breathing delays (LONG before SETUP = 1500ms; MEDIUM elsewhere = 800ms)
- **Total Q6B add**: ~22-28s per traversal

ESPELHO_SILENCIOSO replaces a normal devolução. Normal devolução = ~30-45s (averaged across 8 archetypes). ESPELHO_SILENCIOSO target = ~22-28s. **Net delta from swap**: -5 to -15s (i.e., shorter than the average normal devolução).

### 5.3 Worst-case path forecast (Phase 33 max)

**Path: Base + Q1B + Q4B + Q6B + ESPELHO_SILENCIOSO** (note Q5B excluded by mutual exclusion)
- Base + Q1B + Q4B = ~6:00 (from current matrix)
- + Q6B traversal = +22-28s → ~6:22-6:28
- - normal devolução, + ESPELHO_SILENCIOSO = -5 to -15s → ~6:07-6:23
- **Estimated worst case: 6:07-6:28**

This is **comfortably under the 7:30 budget** (margin: +1:00 to +1:23). Phase 33 likely does NOT trigger overflow into the documented 1-3% zone — the overflow concern was conservative.

### 5.4 Best-case path forecast (Phase 33 min)

**Path: Base + Q6B + ESPELHO_SILENCIOSO** (no other branches)
- Base = ~5:00
- + Q6B = ~5:22-5:28
- - normal devolução, + ESPELHO_SILENCIOSO = -5 to -15s → ~5:07-5:23

**Well within budget.**

### 5.5 The Q6B-without-ESPELHO case (visitor takes Q6B but chooses A)

Q6B traversal with normal devolução afterward:
- Base + Q1B + Q4B = ~6:00
- + Q6B = ~6:22-6:28
- + normal devolução (no swap) = ~6:22-6:28 (devolução was already in baseline)
- **Estimated: ~6:22-6:28**

Also within budget.

### 5.6 Validation matrix expansion

Phase 32's 12 paths split by:
- `hasQ1B` × `hasQ4B` × `hasQ5B` (all 3 booleans, but mutual exclusions limit combinations)

Phase 33 adds two new dimensions:
- `hasQ6B` (mutually exclusive with `hasQ5B`)
- `hasEspelhoSilencioso` (only valid when `hasQ6B === true`)

**New path enumeration** (planner's exact count to verify):

| q5 value | hasQ5B | hasQ6B | hasESPELHO | hasQ1B | hasQ4B | Path count |
|----------|--------|--------|------------|--------|--------|-----------|
| A (carregar) | yes | no | no | × {0,1} | × {0,1} | 4 |
| A (carregar) | no | no | no | × {0,1} | × {0,1} | 4 |
| B (dissolver) | no | yes | yes | × {0,1} | × {0,1} | 4 |
| B (dissolver) | no | yes | no | × {0,1} | × {0,1} | 4 |
| B (dissolver) | no | no | no | × {0,1} | × {0,1} | 4 |

**Total: 20 paths** (vs Phase 32's 12).

The enumerator must skip the impossible combinations: `hasQ5B && hasQ6B` (mutual exclusion), and `hasESPELHO && !hasQ6B` (ESPELHO requires Q6B).

### 5.7 `pickLongestDevolucao` modification

Current implementation (lines 97-121 of validate-timing.ts) iterates over 8 archetypes and picks the longest. Phase 33 modification:

```typescript
function pickLongestDevolucao(hasEspelhoSilencioso: boolean): number {
  if (hasEspelhoSilencioso) {
    return durationOfKey('DEVOLUCAO_ESPELHO_SILENCIOSO');  // OR sum of 6 sub-keys if Option B/C
  }
  // existing logic: longest of 8 archetypes
  return Math.max(
    durationOfKey('DEVOLUCAO_SEEKER'),
    durationOfKey('DEVOLUCAO_GUARDIAN'),
    // ... 6 more
  );
}
```

Caller passes the path's `hasEspelhoSilencioso` flag.

## 6. Validation Architecture (Nyquist)

> `workflow.nyquist_validation` is not explicitly set in `.planning/config.json` — treated as **enabled** by default.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.6+ (per package.json) |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run --reporter=basic` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BR-03 | Q6B branch script keys exist | unit | `npx vitest run src/data/__tests__/script.test.ts -t "Q6B"` | ❌ Wave 1 |
| BR-03 | QUESTION_META[11] present with correct shape | unit | `npx vitest run src/types/__tests__/index.test.ts -t "QUESTION_META 11"` | ❌ Wave 1 |
| BR-03 | `shouldBranchQ6B` returns true only when `q5='B' && q6='A'` | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "shouldBranchQ6B"` | ❌ Wave 2 |
| BR-03 | Machine routes Q6_RESPOSTA_A → Q6B_SETUP when guard passes | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B branch enters"` | ❌ Wave 2 |
| BR-03 | Machine routes Q6_RESPOSTA_A → DEVOLUCAO when guard fails | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B branch skipped"` | ❌ Wave 2 |
| BR-03 | Q6B_RESPOSTA_A and _B both rejoin DEVOLUCAO | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B rejoin"` | ❌ Wave 2 |
| BR-03 | Q6B_TIMEOUT defaults to RESPOSTA_A (closed reading) | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "Q6B timeout"` | ❌ Wave 2 |
| BR-03 | OracleExperience helpers extended for Q6B states | unit | `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "Q6B"` | ❌ Wave 2 |
| BR-03 | 6 Q6B MP3s exist in public/audio/prerecorded/ | smoke | `npx tsx scripts/check-mp3-coverage.ts` (Wave 0 may need to add) | ❌ Wave 3 |
| BR-03 | roteiro.html mentions Q6B branch | smoke | `grep -q "Q6B" public/roteiro.html` | ❌ Wave 3 |
| AR-01 | DEVOLUCAO_ESPELHO_SILENCIOSO script keys exist (1 or 6) | unit | `npx vitest run src/data/__tests__/script.test.ts -t "ESPELHO_SILENCIOSO"` | ❌ Wave 1 |
| AR-01 | `isEspelhoSilencioso` returns true only when `q6b='B'` | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "isEspelhoSilencioso"` | ❌ Wave 2 |
| AR-01 | DEVOLUCAO routes to ESPELHO_SILENCIOSO when `q6b='B'` | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO routing"` | ❌ Wave 2 |
| AR-01 | DEVOLUCAO routes to existing 8 archetypes when `q6b` undefined | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO not triggered without q6b"` | ❌ Wave 2 |
| AR-01 | DEVOLUCAO routes to existing 8 archetypes when `q6b='A'` | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO not triggered with q6b A"` | ❌ Wave 2 |
| AR-01 | `isEspelhoSilencioso` is FIRST entry in DEVOLUCAO.always (priority guarantee) | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO highest priority"` | ❌ Wave 2 |
| AR-01 | DEVOLUCAO_ESPELHO_SILENCIOSO state transitions to ENCERRAMENTO | unit | `npx vitest run src/machines/__tests__/oracleMachine.test.ts -t "ESPELHO closes"` | ❌ Wave 2 |
| AR-01 | OracleExperience getBreathingDelay returns LONG for ESPELHO | unit | `npx vitest run src/components/experience/__tests__/OracleExperience-helpers.test.ts -t "ESPELHO breathing"` | ❌ Wave 2 |
| AR-01 | DEVOLUCAO_ESPELHO_SILENCIOSO MP3(s) exist | smoke | `npx tsx scripts/check-mp3-coverage.ts` | ❌ Wave 3 |
| POL-01 (partial) | `validate-timing.ts` covers all 20 paths including Q6B and ESPELHO | smoke | `npx tsx scripts/validate-timing.ts` | ❌ Wave 3 (extension) |
| POL-02 (verify) | `patternMatching.ts` byte-identical to v4.0 baseline | unit | `git diff origin/master -- src/machines/guards/patternMatching.ts | wc -l` should return 0 | ✅ Manual check |

### Sampling Rate

- **Per task commit (Wave N)**: `npx vitest run --reporter=basic --changed` (test only files touched in the commit)
- **Per wave merge**: `npm test` (full suite, ~496 tests + new Phase 33 tests)
- **Phase gate**: Full suite green + `npx tsx scripts/validate-timing.ts` exit 0 + manual MP3 spot check before `/gsd:verify-work`

### Wave 0 Gaps (test infrastructure setup needed before Wave 1)

- [ ] `src/data/__tests__/script.test.ts` — verify if exists; if not, create with shared "all keys non-empty" test
- [ ] `src/types/__tests__/index.test.ts` — verify if exists; if not, create with QUESTION_META coverage
- [ ] `src/machines/__tests__/oracleMachine.test.ts` — confirmed to exist (Phase 32 added Q5B tests there)
- [ ] `src/components/experience/__tests__/OracleExperience-helpers.test.ts` — confirmed to exist
- [ ] No framework install needed — Vitest already in package.json
- [ ] `scripts/check-mp3-coverage.ts` — verify if exists; if not, this is a "nice to have" (manual `ls public/audio/prerecorded/ | grep q6b | wc -l` works as smoke test)

## 7. Files to Modify (exhaustive)

| File | Change Type | Lines (approx) | Wave | Risk |
|------|-------------|----------------|------|------|
| `src/data/script.ts` | INSERT 6 Q6B keys (after line 454) + INSERT ESPELHO_SILENCIOSO key(s) (after line 526) | +30-50 | 1 | LOW |
| `src/types/index.ts` | INSERT QUESTION_META[11] (after current line ~167) | +12 | 1 | LOW |
| `src/machines/oracleMachine.ts` | INSERT 2 guards (lines ~47-50) + MODIFY Q6_RESPOSTA_A (lines 560-564) + INSERT 6 Q6B states (after line 615) + MODIFY DEVOLUCAO.always (lines 623-632) + INSERT DEVOLUCAO_ESPELHO_SILENCIOSO state (after line 633) | +60-80 | 2 | MEDIUM |
| `src/components/experience/OracleExperience.tsx` | INSERT Q6B_CHOICE constant (line ~50) + EXTEND 6 helpers (getBreathingDelay, getScriptKey, getFallbackScript, activeChoiceConfig, isAguardando, isPergunta) + INSERT DEVOLUCAO_ESPELHO_SILENCIOSO entry in getBreathingDelay + getScriptKey | +30-40 | 2 | MEDIUM |
| `src/machines/__tests__/oracleMachine.test.ts` | INSERT Q6B branching test suite + INSERT ESPELHO_SILENCIOSO routing test suite | +100-150 | 2 | LOW |
| `src/components/experience/__tests__/OracleExperience-helpers.test.ts` | EXTEND with Q6B helper coverage | +30-50 | 2 | LOW |
| `src/data/__tests__/script.test.ts` (if exists) | EXTEND with Q6B + ESPELHO key existence/format checks | +20-30 | 1 | LOW |
| `src/types/__tests__/index.test.ts` (if exists) | EXTEND with QUESTION_META[11] checks | +10-15 | 1 | LOW |
| `scripts/validate-timing.ts` | EXTEND ALL_PATHS array (lines 148-167) from 12 → 20 paths + MODIFY pickLongestDevolucao to accept hasEspelhoSilencioso flag | +40-60 | 3 | MEDIUM |
| `public/roteiro.html` | INSERT Q6B node + edges in Mermaid (lines 386-444) + INSERT Q6B class declaration (line ~443) + INSERT Q6B branch indicator HTML block + INSERT ESPELHO_SILENCIOSO mention in devoluções list + UPDATE "Ramificações" count in overview | +30-50 | 3 | LOW |
| `public/audio/prerecorded/*.mp3` | GENERATE 7-12 new MP3s via `npx tsx scripts/generate-audio-v3.ts` | +12 files (or 7 with Option A) | 3 | LOW (mechanized) |
| `scripts/generate-audio-v3.ts` | NO CHANGES (auto-discovers from script.ts) | 0 | 3 | NONE (verify only) |
| `src/machines/oracleMachine.types.ts` | NO CHANGES (q6b already in QuestionId from Phase 31) | 0 | — | NONE (verify only) |
| `src/machines/guards/patternMatching.ts` | **NO CHANGES** (POL-02 invariant) | 0 | — | **CRITICAL** (verify byte-identical) |

**Total file count**: 11 modified, 0 deleted, 1 created (MP3s).
**Total LOC delta estimate**: +350-500 lines added, ~10-20 lines modified/replaced.

## 8. Risk Areas

### 8.1 POL-02 invariant violation (CRITICAL)

**Risk**: A well-meaning planner places `isEspelhoSilencioso` in `patternMatching.ts` because that's "where guards live". This violates POL-02 and breaks Phase 31 verification.

**Mitigation**:
- Section 4.1 above explicitly states the guard goes in `oracleMachine.ts` setup.guards block.
- Wave 2 task description must include: "DO NOT modify `src/machines/guards/patternMatching.ts`. Run `git diff origin/master -- src/machines/guards/patternMatching.ts` and verify zero output before committing."
- The Wave 0 / setup checklist must verify patternMatching.ts checksum or mtime against the v4.0 baseline.

### 8.2 DEVOLUCAO `always` ordering violation (CRITICAL)

**Risk**: A planner inserts `isEspelhoSilencioso` somewhere in the middle of the `always` array instead of at index 0. Then a visitor with both `q6b='B'` AND a profile that matches `isMirror` (impossible by mutual-exclusion logic, but not enforced by code) would route to MIRROR instead of ESPELHO_SILENCIOSO.

**Mitigation**:
- Section 4.4 explicitly shows the new entry as the FIRST element.
- Wave 2 test: assert that `oracleMachine.config.states.DEVOLUCAO.always[0].guard === 'isEspelhoSilencioso'`. (XState v5 may not expose this directly via `.config` — the planner may need to inspect the source AST or write a runtime regression test that constructs a synthetic context with both `q6b='B'` and a MIRROR-pattern `choices` array, and asserts the machine routes to ESPELHO_SILENCIOSO.)
- If runtime verification is impossible, fall back to a unit test that just regex-matches the source file: `expect(fs.readFileSync('src/machines/oracleMachine.ts', 'utf8')).toMatch(/always:\s*\[\s*\{\s*target:\s*'DEVOLUCAO_ESPELHO_SILENCIOSO'/)`. Ugly but reliable.

### 8.3 Q6B trigger semantic confusion (HIGH)

**Risk**: The relationship between Q6B option B and ESPELHO_SILENCIOSO is **semantically inverted** from the visitor's perspective:
- Visitor says "open form, please" → that's option **B** in Q6B
- Option B records `q6b='B'`
- `q6b='B'` triggers `isEspelhoSilencioso`
- ESPELHO_SILENCIOSO is the "open form" devolução

A planner reading REQUIREMENTS.md "trigger: q6b === 'B'" without understanding the semantic might write the Q6B PERGUNTA backwards (offering A=open and B=closed), which would cause `isEspelhoSilencioso` to fire for visitors who wanted closure, not openness.

**Mitigation**:
- Section 1 above explicitly walks through the semantic.
- Section 3 narrative options all consistently treat A=closed, B=open.
- Wave 1 script.ts task description must include: "PARAISO_Q6B_RESPOSTA_A is for visitors who chose CLOSED reading. PARAISO_Q6B_RESPOSTA_B is for visitors who chose OPEN form. ESPELHO_SILENCIOSO triggers from B."
- Wave 2 machine test: explicit comment in test file mapping the semantic to the test fixture.
- Wave 1 test: assert that `QUESTION_META[11].optionA` describes the closed form and `optionB` describes the open form.

### 8.4 ESPELHO_SILENCIOSO segment count vs MP3 count contradiction (MEDIUM)

**Risk**: REQUIREMENTS.md says "6 segmentos no script (~22-28s), 6 MP3s". The other 8 archetypes pack 4 segments into 1 key → 1 MP3. Phase 33 might literally interpret "6 MP3s" and create 6 keys, OR it might interpret "6 MP3s" as a description error and create 1 key. Both interpretations are defensible. The wrong interpretation creates rework.

**Mitigation**:
- Section 2 Wave 1 explicitly flags this as an Open Question for the planner.
- Section 3 narrative options all show ESPELHO_SILENCIOSO as 6 segments inside ONE key (Option A pattern matching the 8 existing archetypes), with a footnote that Option B/C structures (6 sub-keys) are alternatives.
- Recommendation in Section 2: ship Option A (1 key, 1 MP3, 6 segments). The "6 MP3s" line in REQUIREMENTS.md should be treated as a documentation error.
- Wave 1 task should commit to one interpretation in writing before script keys are added.

### 8.5 Mic warmup regression (MEDIUM)

**Risk**: Q6B_PERGUNTA must be added to `isPergunta` (OracleExperience.tsx lines 344-354). If forgotten, mic warmup doesn't fire before Q6B_AGUARDANDO, causing the same ~1s mic delay bug that v5.0 fixed.

**Mitigation**:
- Section 2 Wave 2 helper checklist explicitly lists `isPergunta` as one of the 6 helpers to extend.
- Wave 2 test: assert `isPergunta` returns true for `Q6B_PERGUNTA` state and false for unrelated states.
- Manual verification during Phase 35 browser UAT.

### 8.6 currentPhase value during ESPELHO_SILENCIOSO (LOW)

**Risk**: `DEVOLUCAO_ESPELHO_SILENCIOSO` is at machine root, sibling of `DEVOLUCAO`. The `entry: assign({ currentPhase: 'DEVOLUCAO' })` on the parent DEVOLUCAO state runs before the `always` transition resolves. So when execution reaches ESPELHO_SILENCIOSO, `currentPhase` IS `'DEVOLUCAO'`. This is the same mechanism the other 8 archetypes rely on.

**Mitigation**:
- Section 1 explicitly notes this.
- Wave 2 test: assert `context.currentPhase === 'DEVOLUCAO'` after entering DEVOLUCAO_ESPELHO_SILENCIOSO.
- Visual/UI components that key off `currentPhase` (e.g., AudioReactiveBackground phase tinting) will work correctly without modification.

### 8.7 Timing overflow misreporting (LOW)

**Risk**: validate-timing.ts may report a path under budget when it's actually over (e.g., wrong sum of segment durations).

**Mitigation**:
- Wave 3 task: cross-check at least one path manually (sum durations from script.ts segment arrays + breathing delays + estimated TTS speech rate).
- If overflow detected: document in 33-VERIFICATION.md with PROJECT.md decision quote ("aceitar overflow ~1-3% visitantes").

### 8.8 Tests for the 8 existing archetypes regression (MEDIUM)

**Risk**: Modifying `DEVOLUCAO.always` to insert a new entry at index 0 may break tests that index into `always[0]` expecting MIRROR.

**Mitigation**:
- Wave 2 task: grep for `always[0]` in test files before modifying. If found, update those tests to use `always[1]` or rewrite them to be index-independent.
- Run full `npm test` after Wave 2 changes; expect zero regressions on the 246+ baseline.


## 9. Common Pitfalls

### 9.1 Pitfall: Treating Q6B as a "third Q6 question"

**What goes wrong**: Planner reads Q6B as a separate question with its own SETUP/PERGUNTA/RESPOSTA, but forgets that Q6 already answered. Visitors don't experience Q6B as "the second part of Q6" — they experience it as a single follow-up offered ONLY after they said "yes, I want to be seen". The narrative must acknowledge that Q6 just happened.

**Why it happens**: The state machine encodes Q6B as a fully isolated 6-state subroutine. The planner mirrors that isolation in narrative, producing a Q6B_SETUP that feels disconnected from Q6_RESPOSTA_A.

**How to avoid**: Q6B_SETUP must reference what just happened. All three Section 3 narrative options begin with "Espera" or "Antes de eu começar" or similar — these are explicit acknowledgments that the Oracle is interrupting itself. The Q6B SETUP is structurally a *parenthesis* inside the closing of Q6, not a fresh question.

**Warning signs**: Q6B narrative that starts with "Você está no jardim" or any other declarative scene-setting. That's the wrong register.

### 9.2 Pitfall: Naming the framework explicitly in ESPELHO_SILENCIOSO

**What goes wrong**: Planner writes "Vou te dar uma pergunta winnicottiana sobre seu falso self" or similar. This violates the "absorbed not quoted" decision (PROJECT.md, v3.1).

**Why it happens**: ESPELHO_SILENCIOSO is psychoanalytically rich, and the temptation to name-drop is high.

**How to avoid**: Re-read the 8 existing devoluções (script.ts lines 462-526). NONE of them mention Winnicott, Lacan, or Bion. They use absorbed metaphors. ESPELHO_SILENCIOSO must follow the same rule. Section 3 narrative options all comply.

**Warning signs**: Words like "winnicott", "lacan", "bion", "freud", "objet", "self", "falso", "verdadeiro" (in their psychoanalytic sense — the everyday Portuguese sense is fine).

### 9.3 Pitfall: Filling the silence with content

**What goes wrong**: ESPELHO_SILENCIOSO ends up being 6 segments of declarative wisdom, just like the other 8 archetypes. The visitor leaves with a *closed* mirror, not an *open* one. The whole point is lost.

**Why it happens**: Writing open form is harder than writing closed form. The temptation to "give the visitor something" is strong.

**How to avoid**: At least ONE segment must be an *unanswerable question*. At least TWO segments must have `pauseAfter > 1500` (long, structured silence). The closing segment should NOT be a wise statement — it should be a frame, an acknowledgment of the void, or another question. Section 3 Options A/B/C all comply.

**Warning signs**: ESPELHO_SILENCIOSO that reads like "DEVOLUCAO_MIRROR but shorter". If you can't tell the difference between ESPELHO and MIRROR by reading the script, ESPELHO failed.

### 9.4 Pitfall: Forgetting that Q6B is rarissima

**What goes wrong**: Planner over-engineers Q6B because it feels like a major feature. But Q6B fires for a tiny minority of visitors (`q5='B' && q6='A'` — visitors who dissolved AND opened). For most visitors, Q6B never exists. Tests that account for "common Q6B paths" are wasted effort.

**Why it happens**: Phase 33 is the "Q6B phase" so it gets disproportionate mental weight.

**How to avoid**: The 20-path validation matrix already accounts for this — only 8 of the 20 paths involve Q6B. Tests should focus on correctness (does Q6B happen when conditions match?) rather than coverage (does Q6B appear in the most common path?). Wave 2 test count should be similar to Phase 32's Q5B test count, not 2x.

**Warning signs**: Wave 2 test files exceeding ~150 lines, Phase 33 PR exceeding ~600 LOC delta.

### 9.5 Pitfall: Updating roteiro.html without re-validating Mermaid

**What goes wrong**: Planner adds Q6B node to Mermaid flowchart but introduces a syntax error. Page renders with raw Mermaid source visible to client.

**Why it happens**: Mermaid is strict about node IDs and edge syntax. Phase 32 hit this once.

**How to avoid**: After modifying `public/roteiro.html`, open it in a browser (or use `npx http-server public/` and visit `localhost:8080/roteiro.html`) and visually confirm the Mermaid renders. Git pre-commit hook (if exists) won't catch this.

**Warning signs**: roteiro.html modifications in a commit with no companion screenshot or browser-rendered confirmation.

### 9.6 Pitfall: Generating MP3s before script.ts review is complete

**What goes wrong**: Planner runs `generate-audio-v3.ts` after Wave 1 commit but before user reviews narrative. Then user requests narrative changes. ElevenLabs charges for the wasted MP3s; Wave 3 has to regenerate.

**Why it happens**: The 3-wave flow encourages "generate at end of Wave 3" but Phase 33 has 12 MP3s — that's significant API spend ($1-2 per regeneration cycle).

**How to avoid**: Wave 1 and Wave 2 must be **fully reviewed and committed** before Wave 3 MP3 generation runs. If user is in autonomous mode, generate once at the end of Wave 3 and accept the 1-cycle cost. Do NOT generate twice.

**Warning signs**: `git log --oneline | grep generate-audio` showing two consecutive MP3 commits in Phase 33 history.

### 9.7 Pitfall: ESPELHO_SILENCIOSO as one-segment vs six-segment confusion

See Risk 8.4 above — the literal interpretation of REQUIREMENTS.md "6 MP3s" vs the consistency interpretation (1 key, 1 MP3, 6 segments) is a real fork in the road. Pitfall: making the wrong choice and then not catching it until Wave 3 MP3 generation produces 1 file when 6 were expected (or vice versa).

**Mitigation**: Section 2 Wave 1 explicitly flags this as the planner's first decision. Commit to one interpretation in writing in the Wave 1 plan before proceeding.

## 10. Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Routing visitor to a new devolução archetype | Custom routing component, conditional import in OracleExperience | Add a state to oracleMachine.ts and a guard to setup.guards | The XState machine is the single source of truth; hand-rolled routing creates two truths. |
| Tracking which Q6B answer the visitor gave | A new boolean in component state | Use existing `recordChoice('q6b', 'A'/'B')` action and `context.choiceMap.q6b` | The recordChoice helper is the canonical pattern for v6.0 branches; bypassing it breaks pattern detection in Phase 34 (CONTRA_FOBICO/PORTADOR). |
| Sequencing the 6 ESPELHO_SILENCIOSO segments (if Option B/C chosen) | A custom playback queue in OracleExperience with a `useEffect` loop | Either Option A (single key) OR add 6 nested states inside DEVOLUCAO_ESPELHO_SILENCIOSO that transition via NARRATIVA_DONE | XState handles sequencing natively; React `useEffect` queues create race conditions with the existing TTS pipeline. |
| Validating Q6B was reached during testing | Manually constructing a partial state object | Use `actor.send({ type: 'CHOICE_B' })` etc. and walk the actor through real transitions | XState test pattern from Phase 31/32 — the tests exist to verify the *machine*, not the test scaffolding. |
| Detecting "is this visitor a candidate for Q6B branch?" outside the machine | A helper in OracleExperience that reads choiceMap and decides what to render | The machine's `shouldBranchQ6B` guard does this; OracleExperience just renders whatever state the machine is in | Two sources of truth = guaranteed drift. The machine decides; the UI follows. |
| Generating ESPELHO_SILENCIOSO MP3 with custom ElevenLabs settings | Direct API call from a one-off script | Extend `script.ts` with the new key(s) and run `scripts/generate-audio-v3.ts` | The script auto-discovers keys; manual API calls bypass the centralized voice ID + settings + filename derivation. |
| Updating roteiro.html with Q6B branch documentation | Hand-editing the HTML directly with risk of introducing typos in client-facing copy | Mirror Phase 31's Q1B branch indicator HTML block byte-for-byte and substitute Q6B-specific labels | Phase 31 + Phase 32 already established the pattern; reinventing it loses consistency. |

**Key insight**: Phase 33 is a **mechanical extension** of patterns established in Phases 31 and 32. There is essentially no novel architecture — only one new top-level state and one new guard. Any "creative" solution is a regression risk.

## 11. Architecture Patterns (verified from Phases 31-32 source)

### Pattern 1: Conditional branch via guarded NARRATIVA_DONE array

**Used in**: Q1B (Phase 31), Q5B (Phase 32), and (Phase 33) Q6B.

```typescript
SOURCE_RESPOSTA: {
  on: {
    NARRATIVA_DONE: [
      { target: 'BRANCH_SETUP', guard: 'shouldBranchX' },
      { target: 'NORMAL_NEXT' },
    ],
  },
},
```

XState evaluates top-to-bottom; first matching guard wins. The unguarded fallthrough is the default.

### Pattern 2: 6-state branch subroutine

**Used in**: Q1B, Q4B (legacy v4.0), Q5B, Q6B.

```
{BRANCH}_SETUP → {BRANCH}_PERGUNTA → {BRANCH}_AGUARDANDO ─┬─ CHOICE_A → {BRANCH}_RESPOSTA_A
                                                          ├─ CHOICE_B → {BRANCH}_RESPOSTA_B
                                                          └─ after 25s → {BRANCH}_TIMEOUT → RESPOSTA_X (default)
{BRANCH}_RESPOSTA_A → REJOIN_TARGET
{BRANCH}_RESPOSTA_B → REJOIN_TARGET
```

The rejoin target is sibling-state (plain string) for in-realm branches (Q5B → Q6_SETUP) or qualified (`#oracle.X`) for cross-realm branches (Q1B → PURGATORIO, Q6B → DEVOLUCAO).

### Pattern 3: Highest-priority archetype guard via `always` index 0

**New in Phase 33**. Used by `isEspelhoSilencioso`.

```typescript
DEVOLUCAO: {
  always: [
    { target: 'NEW_HIGHEST', guard: 'isHighestPriority' },  // ← MUST be index 0
    { target: 'EXISTING_1', guard: 'isExisting1' },
    // ...
  ],
},
```

Mathematical isolation (the high-priority guard's trigger is impossible for visitors who would match any lower guard) means there's no functional conflict — but the ordering still matters because XState evaluates top-to-bottom.

### Pattern 4: New top-level archetype state

**New in Phase 33**. Used by `DEVOLUCAO_ESPELHO_SILENCIOSO`.

```typescript
DEVOLUCAO_X: {
  on: { NARRATIVA_DONE: 'ENCERRAMENTO' },
  after: {
    300000: { target: '#oracle.IDLE', actions: assign({ /* reset */ }) },
  },
},
```

5-minute idle reset is mandatory (matches the other 8 archetypes byte-for-byte). New archetypes do NOT re-assign `currentPhase` (they inherit `'DEVOLUCAO'` from the parent state's `entry` action that fired before the `always` transition resolved).

### Pattern 5: Six OracleExperience helper extensions

**Used in**: Q1B (Phase 31), Q5B (Phase 32), and (Phase 33) Q6B + ESPELHO_SILENCIOSO.

For each new state, the planner extends:
1. `Q{N}_CHOICE` constant (only for new question states with choices)
2. `getBreathingDelay` switch
3. `getScriptKey` switch
4. `getFallbackScript` switch (only for AGUARDANDO states)
5. `activeChoiceConfig` useMemo (only for AGUARDANDO states)
6. `isAguardando` boolean chain (only for AGUARDANDO states)
7. `isPergunta` boolean chain (only for PERGUNTA states)

Phase 33 specifically: Q6B states need all 7. DEVOLUCAO_ESPELHO_SILENCIOSO state needs only #2 and #3.

### Pattern 6: MP3 auto-discovery from script.ts

**Used in**: Phase 19 onward (all phases that add SCRIPT keys).

```typescript
// scripts/generate-audio-v3.ts (excerpt)
const allKeys = Object.keys(SCRIPT);
for (const key of allKeys) {
  const filename = `${snakeCase(key)}.mp3`;
  // ... ElevenLabs API call
}
```

Adding a key to script.ts automatically generates a corresponding MP3 on next run. No manual filename mapping required. Phase 33 inherits this for free.

## 12. Sources

### Primary (HIGH confidence — read directly during research)

- `.planning/PROJECT.md` (lines 1-162) — milestone v6.0, decisions, key constraints
- `.planning/REQUIREMENTS.md` (lines 1-105) — BR-03 and AR-01 specs verbatim
- `.planning/STATE.md` (lines 1-137) — current phase position, accumulated context
- `.planning/phases/32-q5b-branch-paraiso-gap-closure/32-RESEARCH.md` (lines 1-120, then full ~898) — canonical template structure
- `.planning/phases/32-q5b-branch-paraiso-gap-closure/32-01-PLAN.md` — Wave 1 plan structure
- `src/machines/oracleMachine.ts` (lines 1-80, 460-820) — current Q6 area, DEVOLUCAO state, all 8 archetype states, recordChoice usage, guard patterns
- `src/machines/oracleMachine.types.ts` (lines 1-152) — confirmed q6b in QuestionId line 8, recordChoice helper signature
- `src/machines/guards/patternMatching.ts` (read in prior session) — POL-02 invariant baseline
- `src/data/script.ts` (lines 405-540) — Q5B template, Q6 baseline, all 8 DEVOLUCAO_* archetypes, ENCERRAMENTO baseline
- `src/types/index.ts` (lines 1-172) — QUESTION_META structure, ChoiceConfig type
- `src/components/experience/OracleExperience.tsx` (lines 1-673) — all 6 helpers, Q5B integration pattern, isPergunta/isAguardando chains
- `scripts/validate-timing.ts` (lines 1-357) — 12-path matrix structure, pickLongestDevolucao pattern
- `public/roteiro.html` (lines 370-650) — Mermaid flowchart syntax, Q5B branch indicator HTML pattern
- `.planning/config.json` — `workflow.skip_discuss=true` confirmation
- `public/audio/prerecorded/` directory listing — 73 current MP3s, Q5B naming convention
- `CLAUDE.md` (project root) — voice ID, working inflection tags, MEMORY notes
- `~/.claude/projects/.../memory/MEMORY.md` — v6.0 milestone notes, Phase 31/32 closeout details

### Secondary (MEDIUM confidence — verified by Phase 31/32 verifications)

- Phase 31's `31-VERIFICATION.md` (read in prior session) — confirms POL-02 byte-identical was verified
- Phase 32's `32-VERIFICATION.md` (read in prior session) — confirms 14/14 must-haves passed, max-path 6:53.7 min
- Phase 32's 32-01/02/03-PLAN.md (read in prior session) — confirms wave structure works for branch insertion

### Tertiary (LOW confidence — derived/assumed)

- ElevenLabs v3 voice ID + tag compatibility — sourced from CLAUDE.md MEMORY which itself references unverified prior art. Assumed accurate because Phase 32 just shipped using these tags successfully.
- Estimated MP3 durations for ESPELHO_SILENCIOSO target (~22-28s for 6 segments) — extrapolated from Q5B segment counts and durations measured during Phase 32 timing validation. Actual durations only knowable post-generation.

### Sources NOT consulted (intentionally)

- XState v5 docs (Context7/web) — no novel patterns needed; Phase 31 and Phase 32 source code is the sufficient reference.
- ElevenLabs v3 API docs — no API changes; auto-discovery script handles everything.
- Vitest docs — no new test patterns needed; mirror existing test files.
- Brazilian psychoanalytic literature on "form vs content" — would be tangential; the framework is "absorbed not quoted" per PROJECT.md decision.

## 13. Open Questions

1. **6 MP3s vs 1 MP3 for ESPELHO_SILENCIOSO**
   - What we know: REQUIREMENTS.md says "6 segmentos no script... 6 MP3s". The other 8 archetypes use 1 key / 1 MP3 / 4 segments.
   - What's unclear: Whether "6 MP3s" is literal or a description error.
   - Recommendation: Default to Option A (1 key, 1 MP3, 6 segments inside the array) for consistency. Wave 1 task description should commit to this in writing. If the user objects post-generation, regenerate (1-cycle cost).

2. **Q6B PERGUNTA narrative direction (3 options proposed)**
   - What we know: Section 3 has 3 viable options (A: direct, B: poetic, C: cinematic).
   - What's unclear: User stylistic preference. Phase 32 used a similarly-tonal "Fundir vs Ordenar" narrative (Option A-equivalent of its 3 proposals).
   - Recommendation: Ship Option C ("Resposta — ou outra pergunta?") for maximum continuity with Q5 dissolution gesture. If the planner has stylistic objections, fall back to Option A.

3. **ESPELHO_SILENCIOSO narrative direction (3 options proposed)**
   - What we know: Section 3 has 3 viable options (A: single open question, B: silence-as-form, C: dual question).
   - What's unclear: Same as above.
   - Recommendation: Ship Option B ("Silêncio que tem forma") for poetic register suited to Bienal psychoanalytic audience.

4. **Test file existence**
   - What we know: `oracleMachine.test.ts` and `OracleExperience-helpers.test.ts` exist (verified). `script.test.ts` and `index.test.ts` (for QUESTION_META) may or may not exist.
   - What's unclear: Which Wave 1 test files need creation vs extension.
   - Recommendation: Wave 1 plan must `ls src/data/__tests__/` and `ls src/types/__tests__/` before writing test tasks. If files don't exist, Wave 1 creates them with minimal scaffold; if they do, Wave 1 extends them.

5. **Timing forecast accuracy**
   - What we know: Section 5 forecasts max-path 6:07-6:28 for Phase 33 worst case. Section 5.2 estimates Q6B adds ~22-28s; ESPELHO_SILENCIOSO is ~22-28s vs ~30-45s normal devolução.
   - What's unclear: Actual measured durations only knowable post-generation. The estimates may be off by ±10s either direction.
   - Recommendation: Wave 3 timing validation is the source of truth. If actual max-path exceeds 7:30, document the overflow per PROJECT.md decision and defer mitigation to Phase 35.

6. **Whether Q6B needs its own visual feedback**
   - What we know: REQUIREMENTS.md OUT OF SCOPE: "Visual feedback diferente quando branch dispara — Branching deve sentir-se ORACULAR, não gamificado". So no.
   - What's unclear: Whether the existing AudioReactiveBackground / phase tinting logic correctly handles Q6B states (which inherit `currentPhase: 'PARAISO'`).
   - Recommendation: No code changes needed. Verified by Phase 32 where Q5B inherits PARAISO and renders correctly. Phase 35 browser UAT will catch any regression.

7. **Whether `getScriptKey` needs special handling for DEVOLUCAO_ESPELHO_SILENCIOSO if Option B/C is chosen**
   - What we know: `getScriptKey` returns one key per state. Option A (1 key) works without modification. Options B/C (6 sub-keys) require either compound state (XState handles it) or sequenced playback (OracleExperience modification).
   - What's unclear: How OracleExperience currently handles compound state children — does `state.value.DEVOLUCAO_ESPELHO_SILENCIOSO.SEGMENT_3` flow correctly into `getScriptKey`?
   - Recommendation: Reading the relevant OracleExperience code area is a Wave 2 task prerequisite if Option B/C is chosen. Otherwise (Option A), no investigation needed.

8. **Phase 34 dependency on Phase 33's choiceMap.q6b**
   - What we know: Phase 34 (AR-02 CONTRA_FOBICO, AR-03 PORTADOR) introduces guards in `patternMatching.ts` that read choiceMap. POL-02 invariant says patternMatching.ts only reads `context.choices` (positional). But CONTRA_FOBICO needs `q1b='A'` (named).
   - What's unclear: Does POL-02 get relaxed in Phase 34, or does CONTRA_FOBICO's guard live in oracleMachine.ts setup.guards (like isEspelhoSilencioso)?
   - Recommendation: NOT a Phase 33 concern. Document for Phase 34 planning. The Phase 33 isEspelhoSilencioso pattern (guard in oracleMachine.ts) is a precedent that Phase 34 may follow.

## 14. Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Phase 31 and Phase 32 just shipped this exact pattern
- Architecture: HIGH — All XState v5 patterns verified in source
- Pitfalls: HIGH — All 7 pitfalls are direct lessons from Phase 31/32 verification
- Narrative content: MEDIUM — User must select from 3 options per deliverable; estimated durations may be ±10s off
- Timing forecast: MEDIUM — Estimates derived from Phase 32 measurements; actual durations only knowable post-MP3 generation
- Test infrastructure: MEDIUM — Wave 0 needs to verify which test files exist before writing test tasks

**Research date:** 2026-04-07
**Valid until:** 2026-04-21 (14 days — voice/script content may shift; codebase patterns are stable)

**Phase scope:** 2 requirements (BR-03, AR-01), 3 waves, ~6-9 hours estimated, ~350-500 LOC delta, 7-12 new MP3s, 11 modified files

**Sister phases:**
- Phase 31 (Q1B / BR-01) — COMPLETE 2026-04-07
- Phase 32 (Q5B / BR-02) — COMPLETE 2026-04-07
- Phase 34 (CONTRA_FOBICO + PORTADOR / AR-02 + AR-03) — pending (Phase 33's `isEspelhoSilencioso` placement establishes precedent)
- Phase 35 (POL-01 + POL-03 + UAT-01) — pending (will validate Phase 33 alongside Phase 31, 32, 34 in browser UAT)

---

## Ready for Planning

This research is **complete and ready for `gsd-planner` to consume**. The following are pre-decided so the planner can move directly to Wave plan authoring:

### Pre-decided architectural choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| `isEspelhoSilencioso` location | `oracleMachine.ts` setup.guards | POL-02 invariant — patternMatching.ts cannot read `choiceMap.q6b` |
| `shouldBranchQ6B` location | `oracleMachine.ts` setup.guards (after `shouldBranchQ5B`) | Phase 31/32 precedent |
| `isEspelhoSilencioso` priority in DEVOLUCAO.always | Index 0 (highest) | REQUIREMENTS.md AR-01 explicit; mathematical isolation guarantees no preemption |
| Q6B branch point | `Q6_RESPOSTA_A.on.NARRATIVA_DONE` becomes guarded array | Q6B trigger requires `q6='A'`, so only RESPOSTA_A can branch |
| Q6B rejoin target | `'#oracle.DEVOLUCAO'` (qualified) | DEVOLUCAO is at machine root, not inside PARAISO |
| New DEVOLUCAO_ESPELHO_SILENCIOSO state location | Top-level, after DEVOLUCAO parent (line ~634), before DEVOLUCAO_SEEKER | Visual primacy + matches existing 8 archetype layout |
| ESPELHO_SILENCIOSO segment encoding | **Option A: 1 key, 1 MP3, 6 segments** (recommend) | Consistency with 8 existing archetypes; planner may overrule with Option B/C |
| Q6B narrative direction | **Option C "Resposta — ou outra pergunta?"** (recommend) | Strongest continuity with Q5 dissolution gesture |
| ESPELHO_SILENCIOSO narrative direction | **Option B "Silêncio que tem forma"** (recommend) | Best poetic register for Bienal audience |
| Wave structure | 3 waves: Wave 1 = data + types; Wave 2 = machine + UI + tests; Wave 3 = MP3s + timing + roteiro | Phase 31 and Phase 32 template, proven |
| Phase 33 effort estimate | ~6-9 hours | 50% larger than Phase 32 due to AR-01 second deliverable |

### Pre-decided test coverage targets

- Phase 32 baseline: 246+ tests passing (zero regression target for Phase 33)
- New Phase 33 tests: ~12-15 (mirror Phase 32's Q5B suite count + 4-5 additional for ESPELHO_SILENCIOSO routing)
- Coverage requirements: every BR-03 and AR-01 sub-requirement gets at least one automated test (see Section 6 table)

### Pre-decided file modifications (planner copies into Wave plan frontmatter)

See Section 7 table — 11 files modified, 0 deleted, 7-12 MP3s added.

### What the planner still needs to decide

1. **Exact narrative wording** — pick from Section 3 options (A/B/C for each of two deliverables) OR mix and match
2. **Whether ESPELHO_SILENCIOSO is 1 key or 6 keys** — defer to user during plan review if uncertain; default Option A
3. **Whether Wave 1 needs to create new test files** — depends on `ls src/data/__tests__/` result
4. **Exact LOC counts and time estimates per wave task** — refine the Section 2 estimates
5. **Whether to include a verification gap closure plan** — Phase 32 used `32-VERIFICATION.md` as gate; Phase 33 should follow same pattern

### What the planner must NOT do

- Modify `src/machines/guards/patternMatching.ts` (POL-02)
- Modify `src/machines/oracleMachine.types.ts` (already complete from Phase 31)
- Place `isEspelhoSilencioso` anywhere except `oracleMachine.ts` setup.guards block
- Place the `isEspelhoSilencioso` `always` entry anywhere except index 0
- Generate MP3s before Wave 1 + Wave 2 are committed and reviewed
- Use `[whispering]` or any unverified inflection tag
- Add visual feedback distinguishing Q6B from normal Q6 (REQUIREMENTS.md OUT OF SCOPE)
- Touch the Q6_RESPOSTA_B path (Q6B requires q6='A' — RESPOSTA_B never branches)
- Skip the roteiro.html update in Wave 3 (POL-03 dependency)
