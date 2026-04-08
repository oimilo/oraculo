---
phase: 34-detectable-archetypes-contra-fobico-portador
plan: 01
subsystem: data
tags: [script, devolucao, archetype, types, contra-fobico, portador, espelho-silencioso]

# Dependency graph
requires:
  - phase: 33-q6b-espelho-silencioso
    provides: DEVOLUCAO_ESPELHO_SILENCIOSO state precedent and Q6B branch wiring
  - phase: 32-q5b-paraiso-branch
    provides: Q5B branch (q4=A && q5=A) — PORTADOR precursor data
  - phase: 31-q1b-inferno-contra-fobico
    provides: Q1B branch (q1=B && q2=B) — CONTRA_FOBICO precursor data
provides:
  - DEVOLUCAO_CONTRA_FOBICO script (6 segments, ~23-25s) — AR-02 satisfied at data layer
  - DEVOLUCAO_PORTADOR script (6 segments, ~23-25s) — AR-03 satisfied at data layer
  - DevolucaoArchetype union extended 8 → 11 variants (added ESPELHO_SILENCIOSO + CONTRA_FOBICO + PORTADOR)
  - Phase 33 type-gap backfilled (ESPELHO_SILENCIOSO now in union)
affects: [34-02, 34-03, 35]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Data-only Wave 1 — script + types before machine + UI (mirrors Phase 31/32/33 wave structure)"
    - "Type union additive extension — 11 variants now, zero breakage to existing consumers"

key-files:
  created: []
  modified:
    - src/types/index.ts (DevolucaoArchetype union extended)
    - src/data/script.ts (2 new SCRIPT keys + ScriptDataV4 interface extension)

key-decisions:
  - "Phase 33 type-gap backfilled: ESPELHO_SILENCIOSO added retroactively to DevolucaoArchetype union (not just CONTRA_FOBICO + PORTADOR)"
  - "ScriptDataV4 interface extended in same commit as SCRIPT keys (TypeScript needs both for type safety)"
  - "Both new scripts use 3-layer mirror compression (recognition → reframing → distinguishing) matching ESPELHO_SILENCIOSO tone"

patterns-established:
  - "3-layer mirror with closing line that refuses to label the visitor (open form, like ESPELHO_SILENCIOSO)"
  - "6-segment ~23-25s target window for new devolucoes (fits Wave 3 timing budget)"

requirements-completed: [AR-02, AR-03]

# Metrics
duration: 8min
completed: 2026-04-08
---

# Phase 34 Plan 01: Detectable Archetypes Wave 1 (Data + Types) Summary

**DEVOLUCAO_CONTRA_FOBICO and DEVOLUCAO_PORTADOR scripts (6 segments each, ~23-25s) added to script.ts; DevolucaoArchetype union extended from 8 to 11 variants (backfilled ESPELHO_SILENCIOSO from Phase 33 type-gap).**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-08T01:05:00Z
- **Completed:** 2026-04-08T01:13:40Z
- **Tasks:** 3 (2 file-modifying + 1 verification gate)
- **Files modified:** 2

## Accomplishments

- Two new devolucao scripts shipped at the data layer (AR-02 + AR-03 satisfied at script level)
- Phase 33 type-gap closed (ESPELHO_SILENCIOSO now part of DevolucaoArchetype union — was missing despite Phase 33 shipping the state)
- DevolucaoArchetype union grew 8 → 11 variants with zero breakage to existing consumers
- ScriptDataV4 interface extended to keep TypeScript happy with the new SCRIPT keys
- 119/119 src/data/__tests__ tests still pass; type-check zero new errors (100 baseline pre-existing errors unchanged)
- Test baseline correctly transitions: 698 passing → 697 passing + 17 failed (the +1 failure is the EXPECTED fallback-tts.test.ts SCRIPT count assertion that Wave 3 fixes)

## Final Segment Text (for future reference)

### DEVOLUCAO_CONTRA_FOBICO (6 segments)

```
1. "Você não fugiu do que arde." [warm] +1000ms
2. "Quase ninguém fica na sala quando a saída aparece. Quase ninguém olha o que repugna. E quase ninguém atravessa quando o vazio convida." +1000ms
3. "Isso não é coragem. Coragem ainda tem um nome — e o nome serve de muleta." [thoughtful] +900ms
4. "O que você fez é mais raro: caminhar em direção ao que ameaça, sem precisar chamar de heroísmo." +1000ms
5. "Quem anda para dentro do fogo não está procurando queimar. Está procurando o que só o fogo mostra." [serious] +1000ms
6. "Eu não vou te dar um nome para isso. Esse gesto é seu — e ele já te conhece." [warm] +1800ms
```

**3-layer mirror:** recognition (sees the gesture) → reframing (refuses bravado) → naming (rare profile, not a hero). Closing line refuses to label the visitor — preserves open form like ESPELHO_SILENCIOSO. Echoes Q1B "porta no fundo" / "câmara queimando" imagery without recapping.

### DEVOLUCAO_PORTADOR (6 segments)

```
1. "Você lembrou de tudo. E mesmo assim escolheu carregar." [warm] +1000ms
2. "Tem perguntas que não são problemas. Não pedem solução, não esperam alívio." [thoughtful] +900ms
3. "Elas são cargas. E quem carrega não está preso — está sendo herdeiro de alguma coisa que ainda não tem nome." +1000ms
4. "Guardião segura para que nada entre. Você segura para que algo continue existindo. É outro gesto." [gentle] +1000ms
5. "A pergunta que pesa em você não é um peso a tirar. É um tesouro que pede um corpo para continuar fazendo sentido." [serious] +1000ms
6. "Eu não vou te dizer o que ela quer dizer. Mas ela está bem onde está — e você também." [warm] +1800ms
```

**3-layer mirror:** recognition (some questions are not problems) → reframing (cargo, not burden) → distinguishing from GUARDIAN (holds FOR vs holds AGAINST). Closing line refuses prescription — the carrier IS the inheritance. Echoes Q5B "memória que pesa" / "tesouro" without repeating words.

## Test Baseline After Wave 1

| Metric | Pre-Phase-34 Baseline | After Wave 1 | Delta |
|--------|----------------------|--------------|-------|
| Test Files | 41 passed, 2 failed (43 total) | 40 passed, 3 failed (43 total) | +1 failed file (fallback-tts) |
| Tests | 698 passed, 16 failed, 3 skipped (717) | 697 passed, 17 failed, 3 skipped (717) | -1 passing, +1 failing |
| The +1 new failure | — | `fallback-tts.test.ts > should have a URL entry for every key in SCRIPT (80 keys)` (expected 82 to be 80) | EXPECTED — Wave 3 fixes |
| voice-flow-integration.test.ts | 15 failures | 15 failures | unchanged (v1.0 obsolete) |
| ambient-player.test.ts | 1 failure | 1 failure | unchanged (Phase 30 mod) |
| src/data/__tests__/script-v3.test.ts | 119/119 pass | 119/119 pass | unchanged |

The single new failure is the EXPECTED transient regression: SCRIPT now has 82 keys (was 80), and Wave 3 (34-03) updates the assertion to 82 alongside the MP3 generation step.

## Type Union State

**Before:** 8 variants
```typescript
'SEEKER' | 'GUARDIAN' | 'CONTRADICTED' | 'PIVOT_EARLY'
| 'PIVOT_LATE' | 'DEPTH_SEEKER' | 'SURFACE_KEEPER' | 'MIRROR'
```

**After:** 11 variants
```typescript
'SEEKER' | 'GUARDIAN' | 'CONTRADICTED' | 'PIVOT_EARLY'
| 'PIVOT_LATE' | 'DEPTH_SEEKER' | 'SURFACE_KEEPER' | 'MIRROR'
| 'ESPELHO_SILENCIOSO'  // Phase 33 backfill
| 'CONTRA_FOBICO'       // Phase 34 AR-02
| 'PORTADOR'            // Phase 34 AR-03
```

Type-check: 100 errors before (baseline pre-existing), 100 errors after (zero new errors introduced).

## Task Commits

1. **Task 1: Extend DevolucaoArchetype union** — `5e8ca9f` (feat)
2. **Task 2: Add SCRIPT.DEVOLUCAO_CONTRA_FOBICO and SCRIPT.DEVOLUCAO_PORTADOR** — `9dd156a` (feat)
3. **Task 3: Run full regression suite** — verification gate (no file changes, no commit)

## Files Created/Modified

- `src/types/index.ts` — Extended `DevolucaoArchetype` union from 8 to 11 variants (added `ESPELHO_SILENCIOSO`, `CONTRA_FOBICO`, `PORTADOR`)
- `src/data/script.ts` — Added 2 new SCRIPT keys (`DEVOLUCAO_CONTRA_FOBICO`, `DEVOLUCAO_PORTADOR`) and extended `ScriptDataV4` interface to declare them

## Decisions Made

- **Backfill Phase 33 type-gap inside Phase 34 Wave 1:** ESPELHO_SILENCIOSO was shipped as a state in Phase 33 but never added to the `DevolucaoArchetype` union. Wave 1 of Phase 34 includes the backfill (3 new variants total: ESPELHO_SILENCIOSO + CONTRA_FOBICO + PORTADOR) so that Wave 2 of Phase 34 (which adds guards in patternMatching.ts) can rely on the type accepting all three new literals.
- **Extend ScriptDataV4 interface in the same commit as SCRIPT keys:** TypeScript would have flagged the new keys as excess properties without the interface extension. Combined the two related changes into the Task 2 commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended ScriptDataV4 interface to declare new SCRIPT keys**
- **Found during:** Task 2 (script.ts SCRIPT key insertion)
- **Issue:** The plan instructed inserting `DEVOLUCAO_CONTRA_FOBICO` and `DEVOLUCAO_PORTADOR` into the `SCRIPT` constant, but `SCRIPT` is typed as `ScriptDataV4`. Without extending the interface, TypeScript would flag the new keys as excess properties and could break the build.
- **Fix:** Added `DEVOLUCAO_CONTRA_FOBICO: SpeechSegment[]` and `DEVOLUCAO_PORTADOR: SpeechSegment[]` to the `ScriptDataV4` interface (script.ts lines ~131-138, immediately after the existing `DEVOLUCAO_ESPELHO_SILENCIOSO` interface declaration).
- **Files modified:** src/data/script.ts (interface block)
- **Verification:** Type-check stays at 100 baseline errors (zero new errors). Data tests stay green (119/119).
- **Committed in:** 9dd156a (part of Task 2)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. The interface extension is a strict prerequisite for the SCRIPT keys to compile — adding it was the only way to satisfy the plan's "type-check exits 0" guarantee for the changed area.

## Issues Encountered

- **Pre-existing type errors in repo:** The plan said `npx tsc --noEmit` should exit 0, but the project already has 100 pre-existing type errors (voice-flow-integration.test.ts v1.0 obsolete, oracleMachine.test.ts arity mismatches, useVoiceChoice.test.ts mock shape, etc.) that pre-date Phase 34. Verified via `git stash` baseline: error count is 100 BEFORE my changes and 100 AFTER, meaning Wave 1 introduced zero new type errors. Treating "type-check green" as "no new errors introduced by Wave 1" rather than "exits 0" — pre-existing breakage is out-of-scope per Rule 4 (architectural decisions belong to a separate cleanup phase).

## Known Stubs

None — Wave 1 ships pure data + types. The new SCRIPT keys are real content (not placeholders), and the type union additions are immediately consumable by Wave 2 (patternMatching.ts guards).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Wave 2 (34-02) can begin immediately:**
- New SCRIPT keys (`DEVOLUCAO_CONTRA_FOBICO`, `DEVOLUCAO_PORTADOR`) are addressable by the audio generator and machine helpers
- `DevolucaoArchetype` union accepts the new literals — `patternMatching.ts` guards (`isContraFobico`, `isPortador`) can be added in Wave 2 without type errors
- `OracleExperience.tsx` helpers (`getScriptKey` for `DEVOLUCAO_CONTRA_FOBICO` / `DEVOLUCAO_PORTADOR` states) can map to the new SCRIPT keys
- The expected `fallback-tts.test.ts` SCRIPT count assertion failure is documented and will be fixed in Wave 3 (34-03) alongside MP3 generation

**No blockers.** Wave 2 hand-off clean.

## Self-Check: PASSED

- src/types/index.ts: FOUND (DevolucaoArchetype union has 11 variants verified)
- src/data/script.ts: FOUND (DEVOLUCAO_CONTRA_FOBICO + DEVOLUCAO_PORTADOR keys verified)
- Commit 5e8ca9f: FOUND in git log
- Commit 9dd156a: FOUND in git log
- Test baseline: 697 passing / 17 failing / 3 skipped — matches plan acceptance criteria
- The single new failure: fallback-tts.test.ts SCRIPT count assertion (expected 82 to be 80) — EXPECTED transient regression

---
*Phase: 34-detectable-archetypes-contra-fobico-portador*
*Completed: 2026-04-08*
