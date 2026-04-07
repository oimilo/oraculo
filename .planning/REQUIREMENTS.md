# Requirements: O Oraculo

**Defined:** 2026-04-06 (v6.0)
**Core Value:** Experiencia seamless e imersiva como um jogo — o visitante fala, ouve, e e transformado.

## v6.0 Requirements (Active)

Requirements for **Deep Branching** milestone. Adicionar 3 novas branches condicionais (Q1B, Q5B, Q6B) ao fluxo do Oráculo, mais o arquétipo DEVOLUCAO_ESPELHO_SILENCIOSO e 2 arquétipos detectáveis novos (CONTRA_FOBICO, PORTADOR), aprofundando a sensação oracular sem gamificar.

Source of truth: `memory/next-milestone-v5-deep-branching.md` (blueprint completo com scripts, guards, MP3 specs).

### Branching (Conditional Branches)

- [x] **BR-01**: Visitor com `q1='B' && q2='B'` (saiu da sala E ficou olhando a coisa) ouve a branch Q1B "A Porta no Fundo" — **6 SCRIPT keys** (SETUP, PERGUNTA, RESPOSTA_A, RESPOSTA_B, FALLBACK, TIMEOUT — onde SETUP/RESPOSTA são arrays multi-segmento gerando 1 MP3 cada, seguindo o padrão v4.0), QUESTION_META[9], guard `shouldBranchQ1B`, estados Q1B_* na máquina, OracleExperience extended, **6 MP3s** gerados
- [x] **BR-02**: Visitor com `q4='A' && q5='A'` (lembrou tudo E carrega a pergunta) ouve a branch Q5B "O Que Já Não Cabe" — 6 SCRIPT keys (mesmo padrão de BR-01), QUESTION_META[10], guard `shouldBranchQ5B`, estados Q5B_*, OracleExperience extended, 6 MP3s gerados
- [ ] **BR-03**: Visitor com `q5='B' && q6='A'` (dissolveu pergunta MAS pediu leitura) ouve a branch Q6B "O Espelho Extra" — 6 SCRIPT keys (mesmo padrão), QUESTION_META[11], guard `shouldBranchQ6B`, estados Q6B_*, OracleExperience extended, 6 MP3s gerados, transição condicional para DEVOLUCAO normal vs DEVOLUCAO_ESPELHO_SILENCIOSO

### Arquétipos (Devoluções)

- [ ] **AR-01**: DEVOLUCAO_ESPELHO_SILENCIOSO arquetipo criado — 6 segmentos no script (devolve forma em vez de conteúdo, ~22-28s), 6 MP3s, guard `isEspelhoSilencioso` com **highest priority** no `always` do estado DEVOLUCAO (deve verificar antes dos 8 arquétipos atuais), trigger: `q6b === 'B'`
- [ ] **AR-02**: CONTRA_FOBICO arquétipo detectável — guard `isContraFobico` em `patternMatching.ts` (trigger: `q1==='B' && q2==='B' && q1b==='A'`), DEVOLUCAO_CONTRA_FOBICO script + MP3s, ordem nos `always` do DEVOLUCAO: ESPELHO_SILENCIOSO → CONTRA_FOBICO → PORTADOR → 8 atuais
- [ ] **AR-03**: PORTADOR arquétipo detectável — guard `isPortador` (trigger: `q4==='A' && q5==='A' && q5b==='A'`), DEVOLUCAO_PORTADOR script + MP3s

### Polish & Validation

- [ ] **POL-01**: Max-path do fluxo permanece ≤ 7:30 — `scripts/validate-timing.ts` atualizado para cobrir todas as novas permutações (96 caminhos), pior caso (Q1B + Q4B + Q5B + Q6B) medido e documentado, mitigação aplicada se > 7:30 (cortar SETUPs base de Q1/Q3/Q5) ou overflow aceito com documentação
- [x] **POL-02**: ChoiceMap context type extended em `oracleMachine.types.ts` com campos opcionais `q1b?`, `q5b?`, `q6b?` sem quebrar arquétipos existentes (testes v4.0 continuam passando)
- [ ] **POL-03**: `public/roteiro.html` atualizado com as 3 novas branches no Mermaid flowchart + texto narrativo, mantendo paridade com `src/data/script.ts`

### UAT

- [ ] **UAT-01**: Browser UAT validado em ≥3 caminhos representativos: (a) caminho sem nenhuma branch nova ativa, (b) caminho com todas as branches Q1B+Q5B+Q4B disparando, (c) caminho com Q6B → DEVOLUCAO_ESPELHO_SILENCIOSO

## v5.0 Tester UI Polish (Informally Shipped)

Phase 30 R3F audio-reactive visuals shipped via direct commits + subsequent ad-hoc work (ambient audio, voice pipeline 9 fixes, intro delay, roteiro page). Never formally closed via `/gsd:complete-milestone`.

### Visual

- [x] **VIS-01**: Full-screen audio-reactive R3F background (Phase 30) — Shipped
- [x] **VIS-02**: Background visual style per narrative phase — Shipped (per recent commits)
- [~] **VIS-03**: Smooth visual transitions between phases — Shipped via ad-hoc work
- [~] **VIS-04**: Idle state ambient animation — Shipped via ad-hoc work

### Microphone, Debug, UX, Polish

VIS/MIC/DBG/UX/POL requirements from v5.0 dropped or absorbed into ad-hoc work. See git history for actual delivered scope (commits 5c121a1, ac8d8b7, 3273b38, 4499327, 92eeb36).

## v4.0 Game Flow (Complete)

All 16 requirements satisfied (PACE-01 through INTG-02). See `.planning/MILESTONES.md` and STATE.md history.

## Future Requirements

### Browser UAT (deferred from v1.0)

- **UAT-MULTI-01**: Multi-station isolation verified in browser
- **UAT-INACT-01**: Inactivity timeout 30s → reset verified in browser
- **UAT-MULTI-02**: 2-3 simultaneous stations verified in browser

### Analytics (deferred from v1.1)

- **ANALYTICS-01**: Supabase analytics backend (Phase 6)

## Out of Scope (v6.0)

| Feature | Reason |
|---------|--------|
| Branches Q3B, Q6B-mainline | Out of scope for v6.0 — apenas Q1B, Q5B e Q6B-pre-devolução nesta milestone |
| Arquétipo PORTADOR_DE_PERGUNTA (variante de PORTADOR) | Diferenciação muito sutil para o Bienal — uma única forma é suficiente |
| Cortar SETUPs base de Q1/Q3/Q5 | Só se POL-01 falhar — primeira opção é aceitar overflow ~1-3% visitantes |
| Translation/i18n da nova branch para outros idiomas | PT-BR only — Bienal SBPRP é evento brasileiro |
| Refactor da arquitetura de guards atual | Manter padrão existente — adicionar guards segue o pattern já estabelecido |
| Visual feedback diferente quando branch dispara | Branching deve sentir-se ORACULAR, não gamificado — visitante não vê "branch unlocked" |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BR-01 | Phase 31 | Complete |
| BR-02 | Phase 32 | Complete |
| BR-03 | Phase 33 | Pending |
| AR-01 | Phase 33 | Pending |
| AR-02 | Phase 34 | Pending |
| AR-03 | Phase 34 | Pending |
| POL-01 | Phase 35 | Pending |
| POL-02 | Phase 31 | Complete |
| POL-03 | Phase 35 | Pending |
| UAT-01 | Phase 35 | Pending |

**Coverage:**
- v6.0 requirements: 10 total
- Mapped to phases: 10/10 (100%)
- Unmapped: 0 ✓

**Phase breakdown:**
- Phase 31 (Q1B Branch): BR-01, POL-02 (ChoiceMap extension starts here)
- Phase 32 (Q5B Branch): BR-02
- Phase 33 (Q6B + ESPELHO_SILENCIOSO): BR-03, AR-01
- Phase 34 (Detectable Archetypes): AR-02, AR-03
- Phase 35 (Timing Mitigation + UAT): POL-01, POL-03, UAT-01

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 — v6.0 Deep Branching milestone start*
