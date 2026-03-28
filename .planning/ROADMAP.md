# Roadmap: O Oraculo

## Milestones

- v1.0 MVP (shipped 2026-03-25)
- v1.1 Real API Integration (Paused -- Phase 6 Supabase deferred)
- v1.2 Voice Flow Stabilization (shipped 2026-03-26)
- v1.3 Voice Capture Debug & Fix (shipped 2026-03-26)
- v2.0 Narração Realista com ElevenLabs v3 (shipped 2026-03-27)
- v3.0 Narrative Redesign — 6 Choices (structure shipped 2026-03-28)
- v3.1 Script Mastery (in progress)
- v3.2 Integration & Audio (pending — after v3.1)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-3) - SHIPPED 2026-03-25</summary>

- [x] **Phase 1: State Machine & Core Flow** - XState v5 machine with 17 states, 4 branching paths
- [x] **Phase 2: Voice Services & UI** - TTS, STT, NLU services with mock pattern + ambient audio + UI
- [x] **Phase 3: Analytics, Multi-Station & Resilience** - Analytics, admin dashboard, offline fallback, timeouts

</details>

<details>
<summary>v1.1 Real API Integration (Phases 4-6) - PAUSED</summary>

- [x] **Phase 4: API Routes & Configuration** - Server-side API routes for ElevenLabs, Whisper, Claude
- [x] **Phase 5: Real Voice Services** - ElevenLabs TTS, Whisper STT, Claude NLU implementations
- [ ] **Phase 6: Supabase Analytics** - Deferred to post-event

</details>

<details>
<summary>v1.2 Voice Flow Stabilization (Phases 7-9) - SHIPPED 2026-03-26</summary>

- [x] **Phase 7: Voice Architecture Refactor** - useReducer FSM, generic guards, decoupled TTS
- [x] **Phase 8: Flow Sequencing & Mic Lifecycle** - TTS gating, mic activation gating, stream cleanup
- [x] **Phase 9: STT/NLU Pipeline Integration** - Pipeline integration tests, edge case hardening

</details>

<details>
<summary>v1.3 Voice Capture Debug & Fix (Phases 10-11) - SHIPPED 2026-03-26</summary>

- [x] **Phase 10: Pipeline Debug Instrumentation** - Dev debug panel + console logging for pipeline visibility (completed 2026-03-26)
- [x] **Phase 11: TTS Reliability & Voice Pipeline Fix** - Fix root causes: waitForVoices timeout, MockTTS resolution, mic activation (completed 2026-03-26)
- ~~Phase 12: Browser End-to-End Validation~~ - Dropped (manual browser testing sufficient)

</details>

<details>
<summary>v2.0 Narração Realista com ElevenLabs v3 (Phase 13) - SHIPPED 2026-03-27</summary>

- [x] **Phase 13: Voice Infrastructure & v3 Migration** - Verify voice IVC, update API to eleven_v3, convert SSML to audio tags (completed 2026-03-26)
- ~~Phase 14: Script Preparation & Tag Strategy~~ - Absorbed into v3.0 Phase 16
- ~~Phase 15: Audio Generation & Quality Validation~~ - Absorbed into v3.0 Phase 19

</details>

<details>
<summary>v3.0 Narrative Redesign — Structure (Phases 16-17) - SHIPPED 2026-03-28</summary>

- [x] **Phase 16: Script Writing** - First draft PT-BR script with 6 choices, 12 responses, 8 devoluções, inflection tags (completed 2026-03-27)
- [x] **Phase 17: State Machine & Data** - XState redesign for 6 linear choices (~42 states), pattern tracking, NLU keyword maps (completed 2026-03-28)

</details>

### v3.1 Script Mastery (In Progress)

- [x] **Phase 21: Script Audit & Framework Integration** - Análise profunda do script vs. 3 frameworks teóricos + 9 frases de ouro. Audit com recomendações por seção. (completed 2026-03-28)
  Plans:
  - [x] 21-01-PLAN.md — Framework depth analysis (per-segment table + anchor points + escalation curve)
  - [x] 21-02-PLAN.md — Gold phrase mapping + consolidated audit with per-section recommendations
- [ ] **Phase 22: Core Narrative Rewrite** - Reescrita/refinamento das 6 escolhas (setups + perguntas + 12 respostas) com profundidade psicanalítica absorvida.
  **Plans:** 3 plans
  Plans:
  - [x] 22-01-PLAN.md — INFERNO realm rewrite (INTRO + Q1 Comfortable Prison + Q2 Resposta A deepened)
  - [ ] 22-02-PLAN.md — PURGATORIO realm rewrite (INTRO + Q3 Garden responses + Q4 Two Waters to depth 5)
  - [ ] 22-03-PLAN.md — PARAISO realm rewrite (INTRO + Q5 Unanswerable + Q6 End of Game to depth 5)
- [ ] **Phase 23: Devoluções & Bookends** - Reescrita das 8 devoluções, Apresentação, Encerramento, fallbacks e timeouts.
- [ ] **Phase 24: Rhythm, Inflection & Final Validation** - Timing, inflection tags, read-through completo, validação contra 10 minutos.

### v3.2 Integration & Audio (Pending — after v3.1)

- [ ] **Phase 18: Components & Services** - OracleExperience.tsx, FallbackTTS, useVoiceChoice updates for 6 choice points
- [ ] **Phase 19: Audio Generation** - Generate ~50 MP3s with ElevenLabs v3 for final script
- [ ] **Phase 20: Testing** - Update all tests for new 6-choice structure

---

## Phase Details

### Phase 21: Script Audit & Framework Integration
**Goal**: Mapear o que da pesquisa está absorvido no script e o que falta. Audit com recomendações concretas.
**Depends on**: Nothing (first phase of v3.1)
**Requirements**: SCR-01, SCR-02, SCR-08
**Plans:** 2/2 plans complete
**Success Criteria**:
  1. Cada segmento avaliado em tabela (profundidade 1-5, framework predominante, gaps)
  2. As 9 frases de ouro mapeadas (absorvida vs. ausente, onde poderia entrar)
  3. Os 3 frameworks com pontos de ancoragem atuais + oportunidades
  4. Audit document com recomendações concretas por seção

### Phase 22: Core Narrative Rewrite
**Goal**: Reescrever/refinar 6 escolhas com profundidade psicanalítica metabolizada
**Depends on**: Phase 21 (audit guides the rewrite)
**Requirements**: SCR-01, SCR-02, SCR-03, SCR-05, SCR-08
**Plans:** 1/3 plans executed
**Success Criteria**:
  1. 6 perguntas criam tensão genuína (nenhuma tem resposta "óbvia")
  2. 12 respostas validam escolha E revelam custo/sombra
  3. Escalação Light→Medium→Deep→Profound perceptível na progressão
  4. Cada framework tem ≥2 pontos de ancoragem verificáveis
  5. Voz do Oráculo consistente mas evolui entre reinos

### Phase 23: Devoluções & Bookends
**Goal**: Reescrever 8 devoluções como espelho genuíno + refinar Apresentação/Encerramento/fallbacks/timeouts
**Depends on**: Phase 22 (core narrative defines what patterns mean)
**Requirements**: SCR-04, SCR-05, SCR-07, SCR-08
**Success Criteria**:
  1. Cada devolução nomeia PADRÃO (não lista escolhas)
  2. Cada devolução termina com pergunta/imagem persistente
  3. Apresentação estabelece contrato + limites do Oráculo
  4. Encerramento dissolve Oráculo + imperativo final
  5. Fallbacks reformulam no vocabulário do cenário
  6. Timeouts interpretam silêncio como gesto

### Phase 24: Rhythm, Inflection & Final Validation
**Goal**: Polish final — timing, inflection tags, read-through, 10-min target
**Depends on**: Phase 23 (all content final)
**Requirements**: SCR-06
**Success Criteria**:
  1. pauseAfter varia 1200-2800ms (não uniforme)
  2. Inflection tags em ≤40% dos segmentos
  3. Word count ≤10 minutos (~130 wpm PT-BR)
  4. Nenhuma frase >40 palavras
  5. Testes TypeScript passam
  6. Script "read-through ready"

### Phase 18: Components & Services (v3.2)
**Goal**: All UI components and services updated for 6-choice flow
**Depends on**: Phase 24 (script must be final)
**Requirements**: CMPV3-01, CMPV3-02, CMPV3-03
**Success Criteria**:
  1. OracleExperience handles all ~42 states
  2. FallbackTTS PRERECORDED_URLS updated for ~50 audio keys
  3. 6 ChoiceConfig objects with per-question NLU context

### Phase 19: Audio Generation (v3.2)
**Goal**: Generate all MP3s for final script using ElevenLabs v3
**Depends on**: Phase 24 (script text final), Phase 18 (PRERECORDED_URLS)
**Requirements**: AUDV3-01, AUDV3-02
**Success Criteria**:
  1. ~50 MP3s generated with eleven_v3 and inflection tags
  2. No audible artifacts, consistent voice

### Phase 20: Testing (v3.2)
**Goal**: All tests updated and passing for v3 structure
**Depends on**: Phase 18 (all code changes complete)
**Requirements**: TSTV3-01, TSTV3-02, TSTV3-03
**Success Criteria**:
  1. Machine tests cover all 6 choices, pattern tracking, devolução routing
  2. Component tests verify script key mapping
  3. All tests pass (no regressions)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 16. Script Writing (draft) | v3.0 | 2/2 | Complete | 2026-03-27 |
| 17. State Machine & Data | v3.0 | 2/2 | Complete | 2026-03-28 |
| 21. Script Audit | v3.1 | 2/2 | Complete   | 2026-03-28 |
| 22. Core Narrative Rewrite | v3.1 | 1/3 | In Progress|  |
| 23. Devoluções & Bookends | v3.1 | - | Not started | - |
| 24. Rhythm & Validation | v3.1 | - | Not started | - |
| 18. Components & Services | v3.2 | - | Not started | - |
| 19. Audio Generation | v3.2 | - | Not started | - |
| 20. Testing | v3.2 | - | Not started | - |

## Dependencies

```
v3.0 (shipped):
  Phase 16: Script Draft → Phase 17: State Machine
                                        |
v3.1 Script Mastery:                    |
  Phase 21: Audit → Phase 22: Rewrite → Phase 23: Devoluções → Phase 24: Polish
                                                                    |
v3.2 Integration & Audio:                                           |
  Phase 18: Components → Phase 19: Audio → Phase 20: Testing
```

---

*Last updated: 2026-03-28 — Phase 22 planned (3 plans), v3.1 in progress*
