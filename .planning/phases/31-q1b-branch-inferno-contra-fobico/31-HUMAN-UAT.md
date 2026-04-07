---
status: partial
phase: 31-q1b-branch-inferno-contra-fobico
source: [31-VERIFICATION.md]
started: 2026-04-07T11:35:00.000Z
updated: 2026-04-07T11:35:00.000Z
deferred_to: 35-timing-mitigation-uat
---

## Current Test

[awaiting human testing — formally deferred to Phase 35 (Timing Mitigation + Browser UAT)]

## Tests

### 1. Full Q1B walkthrough in browser
expected: Start `npm run dev`, navigate to main page, use mic to answer Q1='procurar/sair' and Q2='ficar olhando/observar' (both B choices). Oracle narrates Q1B_SETUP ("Você não recua. Continua olhando. E aí — sem aviso — uma porta aparece..."), asks the Q1B_PERGUNTA ("Você atravessa essa fresta..."), mic opens, visitor answers, hears correct RESPOSTA_A or RESPOSTA_B, then transitions into PURGATORIO_INTRO.
result: [pending]

### 2. Voice quality matching (A/B listen)
expected: New Q1B MP3s match Oracle baseline timbre/pacing/intimacy (voice ID PznTnBc8X6pvixs9UkQm, INFERNO settings stability=0.65, similarity_boost=0.80, style=0.40). Subjectively indistinguishable from v4.0 MP3s.
result: [pending]

### 3. Q2B regression smoke (audible)
expected: Walk through Q1='A', Q2='A' → Q2B branch fires unchanged. State-machine regression already PASSED via automated test, but audible confirmation belongs to Phase 35.
result: [pending]

### 4. FallbackTTS with Q1B keys
expected: Set `NEXT_PUBLIC_USE_REAL_APIS=false`, trigger Q1B branch. FallbackTTS finds and plays `inferno_q1b_*.mp3`, `fallback_q1b.mp3`, `timeout_q1b.mp3` files from `public/audio/prerecorded/`.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

None — all items are deferred to Phase 35 by design (per v6.0 roadmap and 31-VALIDATION.md). Phase 31 has zero code/artifact gaps; 8/8 must-haves verified, 246/246 tests passing, both requirements (BR-01, POL-02) satisfied.
