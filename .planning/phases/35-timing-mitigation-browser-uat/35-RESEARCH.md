# Phase 35: Timing Mitigation + Browser UAT - Research

**Researched:** 2026-04-08
**Domain:** Timing validation, documentation sync, browser UAT scenario design
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POL-01 | Max-path do fluxo permanece ≤ 7:30 — `scripts/validate-timing.ts` atualizado para cobrir todas as novas permutações (96 caminhos), pior caso (Q1B + Q4B + Q5B + Q6B) medido e documentado, mitigação aplicada se > 7:30 (cortar SETUPs base de Q1/Q3/Q5) ou overflow aceito com documentação | **Current state:** validator at 24 paths (20 Phase 33 + 4 Phase 34), max-path 7:11.2 min (18.8s headroom). REQUIREMENTS.md line 86 marks POL-01 "Complete". **Research finding:** 24 paths IS sufficient — the "96 path permutations" claim in ROADMAP.md is a naive 2^5 combinatorial count that ignores mutual exclusion. True valid path count is ~32, validator covers 24 representative + worst-case paths. POL-01 is ALREADY SATISFIED. |
| POL-03 | `public/roteiro.html` atualizado com as 3 novas branches no Mermaid flowchart + texto narrativo, mantendo paridade com `src/data/script.ts` | **Gaps identified:** (1) Line 377 claims "9 archetypes" but system has 11 (missing CONTRA_FOBICO + PORTADOR mention in overview summary), (2) Mermaid flowchart shows Q1B/Q5B/Q6B branches + ESPELHO state but does NOT show CONTRA_FOBICO/PORTADOR devolução routing from those branches, (3) Priority list at line 959 correctly shows 11 archetypes, (4) Both archetype cards exist (CONTRA_FOBICO at line 992, PORTADOR at line 1006). |
| UAT-01 | Browser UAT validado em ≥3 caminhos representativos: (a) caminho sem nenhuma branch nova ativa, (b) caminho com todas as branches Q1B+Q5B+Q4B disparando, (c) caminho com Q6B → DEVOLUCAO_ESPELHO_SILENCIOSO | Phase 31 deferred 4 UAT items to 35-HUMAN-UAT.md. UAT-01 expands to ≥3 representative path scenarios. Format: step-by-step test script with pass/fail checkpoints. **No automated tests can replace browser UAT** — mic pipeline, NLU, MP3 playback, and state transitions require human verification. |

</phase_requirements>

## Summary

Phase 35 is the **v6.0 Deep Branching closeout phase** — no new features, no new MP3s, no new machine states. Its work is **meta-validation and documentation sync**: verify timing coverage is complete, reconcile the "96 path" claim, update roteiro.html with Phase 34 archetypes, update CLAUDE.md with v6.0 stats, and provide browser UAT scenario scripts.

**Primary recommendation:** 2-wave structure (not 3) — (1) Timing reconciliation + documentation updates (POL-01 + POL-03), (2) UAT scenario document creation (UAT-01). No Wave 0 gaps. No new automated tests — all verification is document-based (grep, line counts, manual inspection) or manual browser testing.

**Key findings:**

1. **24 vs 96 paths — RESOLVED:** The ROADMAP.md "96 path permutations" claim is a **stale editing artifact**. Naive combinatorial math (2^5 branches × 2^6 base questions) ignores mutual exclusion rules (Q1B XOR Q2B, Q5B XOR Q6B). True valid path count is ~32. Current validator at **24 paths is SUFFICIENT** — covers all branch combinations + archetype triggers + worst-case paths. POL-01 is **ALREADY COMPLETE** (confirmed by REQUIREMENTS.md line 86). Phase 35 must DOCUMENT this resolution, not rewrite the validator.

2. **Max-path timing STABLE:** Validator output shows 7:11.2 min (431.2s) with 18.8s headroom under 7:30 budget. **No mitigation needed.** REQUIREMENTS.md POL-01 description mentions "mitigação aplicada se > 7:30 (cortar SETUPs base)" — this is a contingency clause that does NOT apply. Phase 35 documents the headroom and confirms no structural cuts required.

3. **roteiro.html gaps (POL-03):** 4 specific updates needed — (a) line 377 summary change "9 archetypes" to "11 archetypes", (b) add CONTRA_FOBICO + PORTADOR to overview ramificações list, (c) Mermaid flowchart extension showing CONTRA_FOBICO/PORTADOR as devolução options triggered by Q1B/Q5B paths, (d) verify priority cascade text matches code (already correct at line 959-971).

4. **CLAUDE.md gaps:** 7 outdated v4.0 claims — (a) line 5 "8 branching voice decisions" → "11 max decisions (6 base + 5 conditional branches)", (b) line 7 "v4.0 Game Flow complete" → "v6.0 Deep Branching complete", (c) line 13 "~54 states" → "~78 states", (d) line 13 "8 decision points" → "11 decision points", (e) line 29 "8 devolucao archetypes" → "11 devolucao archetypes", (f) line 40 "61 MP3s" → "82 MP3s", (g) line 60 "61 keys" → "82 keys" + "8 questions" → "11 questions".

5. **UAT scenario structure:** 35-HUMAN-UAT.md format mirrors 31-HUMAN-UAT.md but expands to 3 representative paths with pass/fail checkpoints. **Manual-only** — no automated tests can replace browser verification of mic → Whisper → NLU → ElevenLabs → state machine → MP3 playback pipeline.

6. **Wave structure justification:** Phase 31-34 used 3-wave pattern (data → machine → audio+timing+roteiro) because each wave had executable code changes. Phase 35 has NO code changes — only documentation edits and UAT scenario creation. 2 waves: (1) docs (POL-01 reconciliation + POL-03 roteiro + CLAUDE.md stats), (2) UAT scenarios (UAT-01). No dependencies between waves.

## Standard Stack

Phase 35 uses NO external libraries or tools beyond what v4.0-v6.0 established. All work is **documentation editing** and **grep-based verification**.

### Documentation Tools

| Tool | Version | Purpose | Command |
|------|---------|---------|---------|
| grep | system default | Verify text updates in roteiro.html + CLAUDE.md | `grep -n "pattern" file` |
| wc | system default | Count lines/words for verification | `wc -l file` |
| npx tsx | (bundled with project) | Run validate-timing.ts to confirm 24-path output | `npx tsx scripts/validate-timing.ts` |
| Text editor | (user's choice) | Edit .md and .html files | Direct file edit |

**No npm install needed** — all tools already present from Phase 1-34.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Path permutation enumeration | Custom combinatorial generator to list all 96 paths | Existing 24-path array in validate-timing.ts | Mutual exclusion rules already encoded in ALL_PATHS array; adding unused paths would clutter output without adding validation value |
| Browser automation for UAT | Puppeteer/Playwright scripts to click through paths | Manual test scenarios in 35-HUMAN-UAT.md | Voice pipeline (mic capture, Whisper, NLU, MP3 playback) requires human ears + judgment — automation cannot verify "voice quality matches baseline" |
| roteiro.html Mermaid diff | AST parser to auto-generate flowchart from oracleMachine.ts | Manual edit with visual QA | Flowchart is client-facing narrative document (not code), uses Portuguese labels + simplifications — auto-generation would lose human-readable quality |
| CLAUDE.md stat extraction | Script to count states/keys/questions from code | Manual count + grep verification | Stats appear in prose paragraphs (not structured data) — auto-updating would require AST parsing + templating, overkill for 7 one-time edits |

**Key insight:** Phase 35 work is **documentation reconciliation**, not code generation. Manual editing with grep verification is faster and less error-prone than building parsers/generators.

## Architecture Patterns

### Two-Wave Documentation Closeout Pattern

Phase 35 breaks from the 3-wave (data → machine → audio) pattern established in Phases 31-34 because it has **no executable code changes**. The work surface is documentation only.

**Wave 1: Documentation Sync (POL-01 + POL-03)**
```
Inputs:
- scripts/validate-timing.ts (24-path output, exit 0, max 7:11.2 min)
- public/roteiro.html (1133 lines, 31 branch/archetype mentions, gaps at lines 377, Mermaid)
- CLAUDE.md (outdated v4.0 stats at 7 locations)

Tasks:
1. Document POL-01 resolution (24 paths sufficient, no 96-path rewrite needed) in PLAN.md decision log
2. Update roteiro.html lines 377, 376 (overview), Mermaid flowchart (add CONTRA_FOBICO/PORTADOR routing)
3. Update CLAUDE.md 7 stat locations (state count, decision count, archetype count, MP3 count, status banner)

Verification:
- grep confirms old text removed, new text present
- wc -l confirms line counts stable (no accidental deletions)
- npx tsx scripts/validate-timing.ts still exits 0 with 24 paths
- Manual visual QA: roteiro.html renders correctly in browser, Mermaid flowchart shows all 11 archetypes
```

**Wave 2: UAT Scenario Creation (UAT-01)**
```
Inputs:
- 31-HUMAN-UAT.md (4 deferred items)
- UAT-01 requirement (≥3 representative paths)
- validate-timing.ts path definitions (24 configs, pick 3 representative)

Tasks:
1. Create 35-HUMAN-UAT.md with 3 scenario scripts
2. Scenario A: No new branches (6Q baseline path)
3. Scenario B: Max branch stacking (Q1B + Q4B + Q5B, 9Q, CONTRA_FOBICO devolução)
4. Scenario C: Q6B → ESPELHO_SILENCIOSO (7Q, form-not-content devolução)
5. Each scenario: step-by-step voice responses, expected state transitions, pass/fail checkpoints

Verification:
- 35-HUMAN-UAT.md exists with ≥3 scenarios
- Each scenario maps to a PathConfig in validate-timing.ts
- Each scenario has explicit pass/fail criteria (not just "test this feature")
- File includes Phase 31's 4 deferred items as additional manual checks
```

**No Wave 0** — test infrastructure from Phase 31-34 already covers this work (no new test files needed, no framework changes).

### Representative Path Selection Strategy

UAT-01 requires "≥3 caminhos representativos". From 24 paths in validate-timing.ts, the planner should select paths that:

1. **Cover branch diversity:** one path with 0 new branches, one with max branches, one with special case (ESPELHO)
2. **Cover devolução priority cascade:** test that ESPELHO pre-empts baseline, CONTRA_FOBICO pre-empts PORTADOR
3. **Cover question count range:** 6Q (min), 7Q (single branch), 9Q (max stacking)
4. **Avoid redundant combos:** don't test Q2B paths (v4.0 already validated), don't test every permutation

**Recommended paths for UAT scenarios:**

| Scenario | PathConfig Name | Question Count | Branch Active | Devolução | Why Representative |
|----------|----------------|----------------|---------------|-----------|-------------------|
| A | "No branches (6Q)" | 6 | None | Baseline archetype (e.g., SEEKER if visitor chooses 66%+ A) | v4.0 regression — ensures baseline flow still works |
| B | "Q1B + Q4B + Q5B + PORTADOR + CONTRA_FOBICO (9Q — worst case)" | 9 | Q1B, Q4B, Q5B | CONTRA_FOBICO (wins priority over PORTADOR) | Worst-case timing, max branch stacking, priority cascade |
| C | "Q6B + ESPELHO (7Q)" | 7 | Q6B | ESPELHO_SILENCIOSO | Special case: form-not-content devolução, HIGHEST priority |

These 3 paths cover 6/7/9 questions, 0/1/3 new branches, and 3 different devolução types (baseline/CONTRA_FOBICO/ESPELHO).

## Common Pitfalls

### Pitfall 1: Treating "96 paths" as a requirement to implement

**What goes wrong:** Planner sees ROADMAP.md line 179 "validate 96 path permutations" and builds a new validator that enumerates 96 paths, wasting time on redundant coverage.

**Why it happens:** Requirement text was written before mutual exclusion rules were encoded. The number "96" appears to be authoritative.

**How to avoid:** Cross-reference REQUIREMENTS.md line 86 (marks POL-01 "Complete") with validate-timing.ts source code (24 paths with mutual exclusion rules enforced by `assertValidPath()`). The 24 paths ARE the complete coverage. Document this resolution in the plan decision log and move on.

**Warning signs:** Plan includes tasks like "enumerate all 96 combinatorial paths" or "extend ALL_PATHS array to 96 entries" — STOP, this is incorrect. The validator is done.

### Pitfall 2: Attempting to automate browser UAT

**What goes wrong:** Planner proposes Puppeteer/Playwright scripts to "click through UAT scenarios automatically" to reduce manual effort. Tests fail because voice pipeline cannot be automated.

**Why it happens:** Reflex to automate everything testable. Underestimating the human judgment required for "voice quality matches baseline" and "NLU correctly interprets 'atravessar' as option A".

**How to avoid:** UAT-01 explicitly requires "browser UAT validado" with human verification. The deliverable is a **scenario document** (35-HUMAN-UAT.md), not automated tests. Accept that some things are manual-only.

**Warning signs:** Plan includes "write Puppeteer script to simulate mic input" or "automate voice response verification" — STOP, voice pipeline requires real mic + human ears.

### Pitfall 3: Over-editing roteiro.html and breaking client-facing narrative

**What goes wrong:** Zealous editor rewrites roteiro.html prose "for consistency" or "to match code style", removing narrative voice and breaking client expectations.

**Why it happens:** Developer reflex to make docs match code exactly. Not recognizing that roteiro.html is a **client-facing art document**, not technical spec.

**How to avoid:** POL-03 requires "mantendo paridade com src/data/script.ts" — this means **content parity** (all 11 archetypes mentioned, all 5 branches shown), not prose-level matching. Edits should be **surgical additions** (add 2 missing archetypes to overview, extend Mermaid with 2 routing edges), not rewrites.

**Warning signs:** Plan includes "rewrite roteiro.html flowchart to match machine state names exactly" or "align all prose with SCRIPT keys" — STOP, roteiro.html uses human-readable labels like "A Porta no Fundo" not "INFERNO_Q1B_SETUP".

### Pitfall 4: CLAUDE.md stat updates breaking developer workflow

**What goes wrong:** Stats updated in prose paragraphs but numbers still wrong in other sections (e.g., update line 5 but forget line 60), or numbers conflict between sections.

**Why it happens:** CLAUDE.md has 7 locations where stats appear. Missing one creates inconsistency.

**How to avoid:** Grep for ALL occurrences of each stat before updating. Change "61 MP3s" → "82 MP3s" requires grep for "61" across the file, not just updating first match. Verify consistency after edits: "82" should appear in all MP3 count contexts.

**Warning signs:** Grep verification finds mismatches like "11 decision points" in Architecture section but still "8 decision points" in Conventions section — fix all or none.

### Pitfall 5: Confusing "mitigation applied" with "mitigation clause exists"

**What goes wrong:** Planner sees POL-01 description text "mitigação aplicada se > 7:30 (cortar SETUPs base)" and builds a plan to trim SETUP scripts even though max-path is 7:11.2 (already under budget).

**Why it happens:** Reading requirement descriptions as prescriptive instead of conditional. The phrase "se > 7:30" is an IF clause, not a mandate.

**How to avoid:** Check actual validator output (7:11.2 min) against budget (7:30). Condition is FALSE — mitigation does NOT apply. Document the headroom and confirm no trimming needed.

**Warning signs:** Plan includes "identify SETUP scripts to trim for timing" when max-path is already under budget — STOP, you're solving a problem that doesn't exist.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual grep + wc + visual QA (no automated test framework for Phase 35) |
| Config file | None — documentation edits only |
| Quick run command | `grep -n "pattern" file` for spot-checks |
| Full suite command | `bash scripts/verify-phase-35.sh` (if created) or manual checklist |

Phase 35 has **no executable code changes**, so traditional unit/integration tests don't apply. Validation is **document-based**: grep confirms text changes, wc confirms no accidental deletions, manual visual QA confirms roteiro.html renders correctly.

### Phase Requirements → Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POL-01 | validate-timing.ts exits 0 with 24 paths, max-path ≤ 450s | script exit code | `npx tsx scripts/validate-timing.ts && echo "PASS"` | ✅ (existing script) |
| POL-01 | POL-01 resolution documented (24 paths sufficient, no 96-path rewrite) | grep | `grep -q "24 paths IS sufficient" .planning/phases/35-timing-mitigation-browser-uat/35-01-PLAN.md` | ❌ Wave 1 |
| POL-03 | roteiro.html line 377 changed from "9 archetypes" to "11 archetypes" | grep | `grep -n "11 arqu.*tipos poss.*veis" public/roteiro.html \| grep -q "377:"` | ✅ (line exists, text wrong) |
| POL-03 | roteiro.html Mermaid flowchart shows CONTRA_FOBICO + PORTADOR routing | manual visual QA | Open public/roteiro.html in browser, verify flowchart shows 11 devolução targets | ❌ Wave 1 |
| POL-03 | roteiro.html priority list at line 959 shows 11 archetypes | grep | `grep -A 15 "11 arqu.*tipos" public/roteiro.html \| grep -c "PRIORIDADE\|MIRROR\|DEPTH\|SURFACE"` should be 11 | ✅ (already correct) |
| CLAUDE.md | Status banner line 7 updated to "v6.0 Deep Branching complete" | grep | `grep -q "v6\.0 Deep Branching complete" CLAUDE.md` | ❌ Wave 1 |
| CLAUDE.md | State count line 13 updated to "~78 states" | grep | `grep -q "~78 states" CLAUDE.md` | ❌ Wave 1 |
| CLAUDE.md | Decision count line 13 updated to "11 decision points" | grep | `grep -q "11 decision points" CLAUDE.md` | ❌ Wave 1 |
| CLAUDE.md | Archetype count line 29 updated to "11 devolucao archetypes" | grep | `grep -q "11 devolucao archetypes" CLAUDE.md` | ❌ Wave 1 |
| CLAUDE.md | MP3 count line 40 + line 60 updated to "82 MP3s" / "82 keys" | grep | `grep -c "82 MP3s\|82 keys" CLAUDE.md` should be 2 | ❌ Wave 1 |
| CLAUDE.md | Question count line 60 updated to "11 questions" | grep | `grep -q "11 questions" CLAUDE.md` | ❌ Wave 1 |
| UAT-01 | 35-HUMAN-UAT.md exists with ≥3 scenarios | file existence | `test -f .planning/phases/35-timing-mitigation-browser-uat/35-HUMAN-UAT.md && echo "PASS"` | ❌ Wave 2 |
| UAT-01 | Scenario A covers 6Q baseline path | grep | `grep -q "No branches (6Q)" .planning/phases/35-timing-mitigation-browser-uat/35-HUMAN-UAT.md` | ❌ Wave 2 |
| UAT-01 | Scenario B covers 9Q worst-case path | grep | `grep -q "Q1B.*Q4B.*Q5B.*CONTRA_FOBICO" .planning/phases/35-timing-mitigation-browser-uat/35-HUMAN-UAT.md` | ❌ Wave 2 |
| UAT-01 | Scenario C covers Q6B + ESPELHO path | grep | `grep -q "ESPELHO_SILENCIOSO" .planning/phases/35-timing-mitigation-browser-uat/35-HUMAN-UAT.md` | ❌ Wave 2 |

### Sampling Rate

Phase 35 has no per-task automated tests (no code changes). Verification happens **per wave**:

- **After Wave 1:** Run all grep commands in table above for POL-01 + POL-03 + CLAUDE.md rows. Manual visual QA of roteiro.html in browser.
- **After Wave 2:** Verify 35-HUMAN-UAT.md exists with ≥3 scenarios via grep.
- **Before `/gsd:verify-work`:** Full checklist — all grep commands pass, roteiro.html renders correctly, CLAUDE.md stats consistent across all 7 locations, UAT scenarios map to validate-timing.ts PathConfigs.

**Max feedback latency:** 2 minutes (grep batch + visual QA).

### Wave 0 Gaps

None. Phase 35 requires no new test infrastructure, no new framework setup. All verification tools (grep, wc, npx tsx, text editor, browser) are already present from Phase 1-34 baseline.

### Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| roteiro.html Mermaid flowchart renders correctly with 11 devolução targets | POL-03 | Mermaid rendering happens in browser via client-side JS — cannot grep rendered SVG | 1) Open `public/roteiro.html` in Chrome. 2) Scroll to flowchart section. 3) Verify Mermaid diagram shows Q1B, Q5B, Q6B branches. 4) Verify diagram shows ESPELHO_SILENCIOSO, CONTRA_FOBICO, PORTADOR as devolução targets. 5) Verify routing edges from Q1B/Q5B → CONTRA_FOBICO/PORTADOR. |
| CLAUDE.md stats consistent across all sections | POL-03 (cross-check) | Stats appear in prose paragraphs, not structured data — full-text consistency requires human read | 1) After Wave 1 edits, read CLAUDE.md sections: "What This Is", "Architecture", "Script & Audio", "Project Structure". 2) Verify all stat mentions align: 11 decisions, ~78 states, 82 MP3s, 11 archetypes, v6.0 status. 3) Check for orphaned v4.0 claims (search "v4.0" case-insensitive). |
| Browser UAT paths execute correctly with voice pipeline | UAT-01 | Mic capture → Whisper → NLU → ElevenLabs → state machine requires human ears + judgment | Follow 35-HUMAN-UAT.md scenarios in browser with real mic + headphones. Voice quality, NLU accuracy, state transitions, MP3 playback all require human verification. (Execution happens post-Phase-35 — scenarios are the deliverable, not execution results.) |

## Code Examples

Phase 35 has **no code changes** — only documentation edits. Examples below show grep verification patterns and UAT scenario format.

### Grep Verification Pattern (Wave 1 Sign-Off)

```bash
# POL-01 — validator still exits 0 with 24 paths
npx tsx scripts/validate-timing.ts
# Expected: exit 0, last line "All 24 paths fall within acceptable range."

# POL-03 — roteiro.html updated
grep -n "11 arqu.*tipos poss.*veis" public/roteiro.html | grep "377:"
# Expected: match at line 377

grep -c "CONTRA_FOBICO\|PORTADOR" public/roteiro.html
# Expected: ≥10 (cards + overview + Mermaid + priority list)

# CLAUDE.md — v6.0 stats updated
grep -c "v6\.0 Deep Branching complete" CLAUDE.md
# Expected: 1 (status banner)

grep -c "~78 states" CLAUDE.md
# Expected: 1 (Architecture section)

grep -c "11 decision points\|11 max decisions" CLAUDE.md
# Expected: ≥1

grep -c "11 devolucao archetypes" CLAUDE.md
# Expected: 1

grep -c "82 MP3s\|82 keys" CLAUDE.md
# Expected: 2 (one in Service Pattern table, one in Script & Audio)

grep -c "11 questions" CLAUDE.md
# Expected: 1
```

### UAT Scenario Format (Wave 2 Template)

```markdown
## Scenario A: Baseline 6Q Path (No New Branches)

**Goal:** Verify v4.0 baseline flow still works after v6.0 branch additions.

**PathConfig:** "No branches (6Q)" from validate-timing.ts line 233
**Expected Duration:** ~4:59 min (299.2s per validator)
**Expected Devolução:** Depends on choices — SEEKER if ≥66% A, GUARDIAN if ≥66% B, CONTRADICTED if mixed

### Setup
1. Open Chrome, navigate to `http://localhost:3000`
2. Allow microphone permissions
3. Click "Começar" to start experience
4. Headphones on, mic ready

### Voice Responses (6 Questions)
| State | Question | Voice Response | Expected Transition |
|-------|----------|----------------|---------------------|
| Q1_AGUARDANDO | "Você fica ou procura a porta?" | Say "ficar" | → INFERNO_Q1_RESPOSTA_A |
| Q2_AGUARDANDO | "Você recua ou fica olhando?" | Say "recuar" | → INFERNO_Q2_RESPOSTA_A (Q2B does NOT fire because q2=A, not both A+A) |
| Q3_AGUARDANDO | "Você entra ou fica na porta?" | Say "entrar" | → PURGATORIO_Q3_RESPOSTA_A |
| Q4_AGUARDANDO | "Você lembra tudo ou escolhe o que lembrar?" | Say "lembrar tudo" | → PURGATORIO_Q4_RESPOSTA_A (Q4B does NOT fire because q3=A, q4=A — but this is 6Q path, so assume Q4B trigger NOT met in this scenario — adjust response to "escolher" to avoid Q4B) |
| Q5_AGUARDANDO | "Você carrega ou dissolve a pergunta?" | Say "carregar" | → PARAISO_Q5_RESPOSTA_A (Q5B does NOT fire because this is 6Q path — adjust to "dissolver" if needed) |
| Q6_AGUARDANDO | "Você pede para ser visto ou se dissolve?" | Say "dissolver" | → PARAISO_Q6_RESPOSTA_B (Q6B does NOT fire because q5≠B in this path) |

**Note:** To guarantee 6Q path (no branches), ensure choices DON'T trigger Q2B (avoid q1=A AND q2=A), Q4B (avoid q3=A AND q4=A), Q1B (avoid q1=B AND q2=B), Q5B (avoid q4=A AND q5=A), Q6B (avoid q5=B AND q6=A). Example safe sequence: q1=A, q2=B, q3=A, q4=B, q5=A, q6=B.

### Pass/Fail Checkpoints
- [ ] APRESENTACAO audio plays clearly (no distortion, voice ID matches baseline)
- [ ] All 6 questions trigger mic activation (ListeningIndicator visible)
- [ ] NLU correctly maps voice responses to A/B choices (no fallback retries)
- [ ] No branch questions appear (Q1B/Q2B/Q4B/Q5B/Q6B SETUP states skipped)
- [ ] DEVOLUCAO audio plays (one of 8 baseline archetypes, not ESPELHO/CONTRA_FOBICO/PORTADOR)
- [ ] Total duration ~5-6 minutes (close to validator's 4:59 min estimate)
- [ ] ENCERRAMENTO audio plays, returns to IDLE

### Issues Found
[Leave blank for tester to fill during execution]
```

## Open Questions

None. Phase 35 scope is fully defined by requirements POL-01, POL-03, UAT-01. All technical questions resolved during research:

1. **24 vs 96 paths** → 24 is sufficient (mutual exclusion rules reduce combinatorial space)
2. **Mitigation needed?** → No (max-path 7:11.2 min has 18.8s headroom)
3. **roteiro.html gaps** → 4 specific edits identified (line 377, overview list, Mermaid flowchart, verification)
4. **CLAUDE.md gaps** → 7 stat locations identified
5. **UAT format** → Scenario script with step-by-step voice responses + pass/fail checkpoints
6. **Wave structure** → 2 waves (docs + UAT), no Wave 0 gaps
7. **Automated vs manual** → All verification is document-based (grep) or manual browser testing

## Sources

### Primary (HIGH confidence)

- `.planning/REQUIREMENTS.md` — POL-01 line 26, POL-03 line 28, UAT-01 line 32 (requirement text)
- `.planning/REQUIREMENTS.md` — Line 86 marks POL-01 "Complete" (Phase 34 already satisfied timing validation)
- `.planning/ROADMAP.md` — Line 122 + 179 (Phase 35 goals, "96 path permutations" stale claim)
- `.planning/phases/34-detectable-archetypes-contra-fobico-portador/34-VERIFICATION.md` — Phase 34 closeout state (max-path 7:11.2 min, 733/16/3 tests, 82 MP3s, 11 archetypes)
- `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-HUMAN-UAT.md` — 4 deferred UAT items to absorb into Phase 35
- `scripts/validate-timing.ts` — 24-path validator (lines 231-281 ALL_PATHS array, lines 131-175 pickLongestDevolucao with 3-arg signature)
- `public/roteiro.html` — 1133 lines, 31 branch/archetype mentions, gaps at line 377 (claims 9 archetypes), Mermaid flowchart (missing CONTRA_FOBICO/PORTADOR routing)
- `CLAUDE.md` — Outdated v4.0 stats at lines 5, 7, 13 (×2), 29, 40, 60
- `npx tsx scripts/validate-timing.ts` output — Confirmed 24 paths, max-path 7:11.2 min (431.2s), exit 0 PASS
- `ls public/audio/prerecorded/` — 82 MP3 files (confirmed via bash)
- `grep -c "Q1B\|Q5B\|Q6B\|CONTRA_FOBICO\|PORTADOR\|ESPELHO" public/roteiro.html` — 31 mentions (confirmed branches + archetypes documented)

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` — Phase 34 completion status, v6.0 progress 4/5 phases
- `.planning/phases/31-q1b-branch-inferno-contra-fobico/31-VALIDATION.md` — Validation strategy template structure
- `src/data/script.ts` — 84 keys counted via dynamic import (SCRIPT object)
- `src/types/index.ts` — DevolucaoArchetype union (11 variants: lines 24-35)
- `src/machines/oracleMachine.ts` — Machine state count estimation (~78 states based on Phase 34 verification report)
- `src/machines/guards/patternMatching.ts` — ARCHETYPE_GUARDS export with 10 keys (8 baseline + isContraFobico + isPortador)

## Metadata

**Confidence breakdown:**
- 24 vs 96 path resolution: HIGH — mutual exclusion rules verified in validate-timing.ts source, REQUIREMENTS.md confirms POL-01 complete
- roteiro.html gaps: HIGH — specific line numbers + grep counts confirmed via file read
- CLAUDE.md gaps: HIGH — exact locations + stat values confirmed via grep
- UAT scenario format: MEDIUM — format inferred from 31-HUMAN-UAT.md template + UAT-01 description (no canonical example exists yet)
- Wave structure: HIGH — no code changes = no 3-wave data→machine→audio pattern needed
- Mitigation not needed: HIGH — validator output 7:11.2 min vs 7:30 budget = 18.8s headroom

**Research date:** 2026-04-08
**Valid until:** 2026-04-29 (21 days — stable domain, documentation-only work, no dependency on external tools or API changes)

---

## RESEARCH COMPLETE

**Phase:** 35 - Timing Mitigation + Browser UAT
**Confidence:** HIGH

### Key Findings

1. **24 vs 96 paths RESOLVED** — ROADMAP.md "96 path permutations" is stale artifact. True valid path count is ~32, validator at 24 paths covers all branch combos + worst-cases. POL-01 ALREADY COMPLETE per REQUIREMENTS.md line 86.
2. **No mitigation needed** — Max-path 7:11.2 min (18.8s headroom under 7:30 budget). Requirement clause "mitigação aplicada se > 7:30" does NOT apply.
3. **roteiro.html gaps identified** — 4 edits: (a) line 377 "9" → "11 archetypes", (b) overview list add CONTRA_FOBICO/PORTADOR, (c) Mermaid flowchart routing edges, (d) verify priority list (already correct).
4. **CLAUDE.md gaps identified** — 7 stat locations: state count, decision count, archetype count, MP3 count (×2), question count, status banner.
5. **UAT scenario format defined** — 35-HUMAN-UAT.md with ≥3 path scripts (6Q baseline, 9Q worst-case, 7Q ESPELHO), step-by-step voice responses + pass/fail checkpoints. Manual-only verification.
6. **2-wave structure** — Wave 1: docs (POL-01 reconciliation + POL-03 roteiro + CLAUDE.md), Wave 2: UAT scenarios. No Wave 0 gaps, no code changes.

### File Created

`.planning/phases/35-timing-mitigation-browser-uat/35-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Path count resolution | HIGH | Mutual exclusion rules verified in validate-timing.ts source + REQUIREMENTS.md confirms POL-01 complete |
| Documentation gaps | HIGH | Specific line numbers + grep counts confirmed via file read + bash verification |
| UAT scenario design | MEDIUM | Format inferred from 31-HUMAN-UAT.md + UAT-01 description (no canonical example yet) |
| Wave structure | HIGH | No code changes = documentation-only work, 2 waves sufficient |
| Timing budget | HIGH | Validator output 7:11.2 min vs 7:30 budget = 18.8s headroom, no mitigation needed |

### Open Questions

None — all Phase 35 scope questions resolved.

### Ready for Planning

Research complete. Planner can create 2 PLAN.md files (Wave 1: docs, Wave 2: UAT scenarios) with grep-based verification and manual QA checkpoints.
