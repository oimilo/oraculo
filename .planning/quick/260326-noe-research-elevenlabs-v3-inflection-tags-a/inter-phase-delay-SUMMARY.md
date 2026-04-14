# Inter-Phase Breathing Delay Summary

## One-liner
Configurable breathing delays (0-2500ms) between TTS completion and NARRATIVA_DONE state transitions to prevent rushed phase changes.

## Changes

### File Modified
- `src/components/experience/OracleExperience.tsx`

### What was added

**`getBreathingDelay(machineState)` function** (lines 59-98) — Maps each state machine state to a delay tier:

| Tier | Delay | States | Rationale |
|------|-------|--------|-----------|
| Long | 2500ms | APRESENTACAO, PARAISO, DEVOLUCAO_*, ENCERRAMENTO, INFERNO.RESPOSTA_*, PURGATORIO_*.RESPOSTA_* | Major phase transitions need breathing room |
| Medium | 1500ms | INFERNO.NARRATIVA, PURGATORIO_A.NARRATIVA, PURGATORIO_B.NARRATIVA | Narration-to-question beats |
| Short | 800ms | INFERNO.PERGUNTA, PURGATORIO_A.PERGUNTA, PURGATORIO_B.PERGUNTA | Question-to-waiting, shouldn't feel slow |
| None | 0ms | TIMEOUT_REDIRECT, FALLBACK, unmapped states | Functional prompts, no delay needed |

**Effect B modification** (lines 337-371) — Wraps `send({ type: 'NARRATIVA_DONE' })` in a `setTimeout` with:
- Proper cleanup via `cancelled` flag and `clearTimeout` on effect cleanup
- `breathingTimeoutRef` to track the timeout ID
- Immediate send for 0ms delay (no setTimeout overhead)
- Console logging of delay duration for debugging

### What was NOT modified
- `oracleMachine.ts` — state machine untouched
- TTS services — no changes
- No new dependencies

## Verification

- TypeScript compiles clean (no errors in OracleExperience.tsx; pre-existing errors in unrelated test files only)
- 368/369 tests pass (1 pre-existing failure in tts-service.test.ts unrelated to this change)

## Commit
- `6eb0f26`: feat: add configurable inter-phase breathing delay before NARRATIVA_DONE

## Deviations from Plan
None -- plan executed exactly as written.

## Known Stubs
None.
