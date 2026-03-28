---
phase: 21-script-audit-framework-integration
plan: 01
subsystem: narrative
tags: [script-audit, framework-analysis, psychoanalytic-depth, Lacanian, Winnicottian, Bionian]
dependency_graph:
  requires: [v3-script, framework-proposals, research-synthesis]
  provides: [per-segment-depth-ratings, framework-anchor-map, escalation-assessment, integration-priorities]
  affects: [22-script-rewrite-devolutions, 22-script-rewrite-choices, 23-script-polish]
tech_stack:
  added: []
  patterns: [systematic-analysis, depth-rating-scale, cross-framework-integration]
key_files:
  created:
    - .planning/phases/21-script-audit-framework-integration/21-01-framework-analysis.md
  modified: []
decisions:
  - title: "5-level depth rating scale"
    rationale: "Objective scale from 1 (generic) to 5 (multi-framework integration) provides clear target for Phase 22 rewrites"
    alternatives: ["3-level (low/med/high)", "qualitative only"]
    chosen: "5-level quantitative + qualitative gaps"
  - title: "Framework anchor point mapping"
    rationale: "Identifying WHERE each framework currently lives (with exact text) enables surgical improvements rather than wholesale rewrites"
  - title: "Cross-framework integration as priority metric"
    rationale: "Bienal-worthy depth = 2+ frameworks felt simultaneously, not stated — ranked top 10 opportunities by impact"
metrics:
  duration_minutes: 7
  completed_date: "2026-03-28"
  segments_analyzed: 47
  depth_average_current: 2.8
  depth_target: 4.0
  framework_anchors_identified: 38
  integration_opportunities_ranked: 10
---

# Phase 21 Plan 01: Script Audit & Framework Integration — SUMMARY

**One-liner:** Systematic per-segment depth analysis of v3 script (47 segments) against 3 psychoanalytic frameworks + 4 research clusters, revealing avg depth 2.8/5 (below Bienal threshold), with roadmap to 4.0+ via 10 ranked integration opportunities

## What Was Built

### Framework Analysis Document (469 lines)

Created comprehensive audit of O Oráculo v3 script (`src/data/script.ts`) evaluating every segment against:
- **3 Theoretical Frameworks:** Lacanian (desire, Real, jouissance), Winnicottian (holding, true self, play), Bionian (container-contained, O, reverie)
- **4 Research Clusters:** Underground Self (Dostoevsky, Pessoa, Beckett, Clarice), Desire/Loss (Freud, Proust, Sophocles), Power/Freedom (Orwell, Huxley, Shakespeare, Milton), Transformation/Wisdom (Hesse, Rilke, Drummond, Galeano)
- **9 Gold Phrases:** From psychoanalyst notes (`frases_poeticas_jornada.docx`)

### Key Deliverables

1. **Per-Segment Depth Table (47 rows)**
   - Depth rating 1-5 for each segment
   - Primary/secondary framework identification
   - Specific gaps (not generic "needs more depth")
   - Current avg: **2.8/5** (target: 4.0+ for Bienal-worthy)

2. **Framework Anchor Point Mapping**
   - **Lacanian:** 7 anchors identified (WEAK — needs 20+)
   - **Winnicottian:** 19 anchors (DOMINANT — balanced)
   - **Bionian:** 12 anchors (MEDIUM — needs 15+)
   - Each anchor includes: segment, principle, exact text, quality rating

3. **Escalation Curve Assessment**
   - **What works:** Q1→Q2 (Light→Medium), Inferno voice density
   - **What flattens:** Q3→Q4 (Medium→Deep feels same weight), Q5→Q6 (Deep→Profound lacks stakes)
   - **Voice gaps:** Purgatório and Paraíso voices need differentiation (currently same density as Inferno)

4. **Top 10 Cross-Framework Integration Opportunities**
   - Ranked by impact for Phase 22 rewrites
   - Each includes: current depth, target depth, which frameworks to add, specific fixes
   - **Priority 1:** Q4 (Two Waters) — 3→5, add Lacanian memory-as-desire + Bionian metabolization images
   - **Priority 2:** All 8 Devoluções — 2-3→4-5, add Lacanian analytic act + Bionian transformation + Winnicott true/false self

5. **Gold Phrase Integration Check**
   - 5.5/9 phrases currently absorbed
   - Missing: "travessia interior trocada por atalhos de dopamina"
   - Recommendation: integrate into Q1_RESPOSTA_A or Q3_RESPOSTA_B

## Key Insights

### Framework Balance Issues

**Current distribution:**
- Winnicottian: 19 segments (40% of script) — DOMINANT
- Bionian: 12 segments (25%) — adequate
- Lacanian: 3 segments (6%) — **CRITICALLY THIN**
- Mixed: 6 segments (13%)
- None: 7 segments (15%) — generic/atmospheric

**Implication:** Script currently feels more therapeutic/holding (Winnicott) than structurally revealing (Lacan). For Bienal psychoanalysts, Lacanian depth is non-negotiable.

### Escalation Curve Diagnosis

**Q1→Q2 works** because type of question changes:
- Q1: Cognitive (comfort vs freedom)
- Q2: Somatic (body recoil vs presence)

**Q3→Q4 flattens** because:
- Both are symbolic/existential
- Q4_PERGUNTA too brief ("Qual água?") — visitor doesn't feel weight before choosing
- Solution: Add 4-5 lines between setup and pergunta to make visitor FEEL what's in each water

**Q5→Q6 weak** because:
- Q6 is meta (profound) but STAKES unclear
- Visitor doesn't understand this choice is ABOUT THE GAME, not another scenario
- Solution: Q6_SETUP needs to establish "this is different — I'm asking if you want me to show you what I saw"

### Devolução Crisis

All 8 devoluções rated **2-3/5** (atmospheric to implicit depth). This is CRITICAL failure because:
- Devoluções are the PAYOFF (visitor played 6 choices to receive this)
- Currently they DESCRIBE the pattern but don't perform ANALYTIC ACT (Lacanian)
- Missing: Structure reading (what pattern reveals about desire), transformation naming (what was metabolized or evacuated)

**Example fix for SEEKER devolução:**
1. Name pattern: "Você entrou em tudo" [Winnicott: recognition]
2. Read structure: "Fome de quê? Você corre em direção a tudo porque parar seria encontrar o que mora na quietude" [Lacan: desire structure]
3. Name transformation: "Você recebeu tudo. Mas receber não é o mesmo que digerir" [Bion: container reading]

### Strongest Segments (Depth 4)

Only **2 segments** achieved depth 4:
1. **INFERNO_Q2_SETUP** — Clarice's G.H. absorbed, "coisa viva" as beta element, body recoil as alpha function resisted (Bionian + Winnicottian)
2. **INFERNO_Q2_RESPOSTA_B** — "Algo dentro de você responde: ainda não" = excellent true self moment (Winnicottian + Bionian)

**No segments achieved depth 5** (multi-framework integration felt not stated).

## Deviations from Plan

### None — Plan Executed Exactly as Written

All acceptance criteria met:
- [x] File exists at correct path
- [x] Contains "## Per-Segment Depth Analysis" section
- [x] Table with 47 rows (all segment keys from ScriptDataV3)
- [x] Each row has depth rating 1-5
- [x] Each row has framework name
- [x] Contains "## Framework Anchor Points" section
- [x] Subsections for all 3 frameworks
- [x] Each framework has 2+ current anchors with segment references
- [x] Each framework has 2+ missing opportunities with specific segment + principle
- [x] Contains "## Escalation Curve Assessment" section
- [x] Contains "## Cross-Framework Integration Gaps" section with 10 ranked opportunities

## Recommendations for Phase 22-23

### Phase 22 Rewrite Priority (Plans 22-01, 22-02)

**Must-fix for Bienal:**
1. **All 8 Devoluções** (22-02) — Add 3-layer depth: pattern + structure + transformation
2. **Q4 (Two Waters)** — Deepen to 5, add Lacanian memory-as-desire frame
3. **Q5 (Unanswerable)** — Deepen to 5, add Lacanian jouissance + Bionian O
4. **Q6 (End of Game)** — Deepen to 5, set up analytic act explicitly
5. **Q1 (Comfortable Prison)** — Add Lacanian alienation + Winnicott false self
6. **APRESENTACAO + ENCERRAMENTO** — Frame the game with irreversibility (Lacan)

### Phase 23 Polish Priority (Plans 23-01, 23-02)

1. **All 6 PERGUNTAS** — Make visitor FEEL stakes before choosing (currently too brief)
2. **3 Realm INTROS** — Differentiate Oracle voice (Inferno=dense, Purg=open, Paraiso=translucent)
3. **6 FALLBACKS** — Add scenario character (maintain immersion)
4. **6 TIMEOUTS** — Deepen interpretation of silence (currently thin except Q2)

### Success Criteria for v3.1 Script Completion

- [ ] Average depth across 47 segments: **4.0+** (currently 2.8)
- [ ] At least **10 segments at depth 5** (currently 0)
- [ ] All **8 devoluções at depth 4+** (currently 2-3)
- [ ] **6 questions** make visitor feel stakes (currently only Q1-Q3 work)
- [ ] **Escalation curve** perceptible at each transition (currently flattens Q3→Q4)
- [ ] **Oracle voice** differentiated across 3 realms (currently same density)
- [ ] **All 9 gold phrases** integrated (currently 5.5/9)
- [ ] **Framework balance:** Lacanian 20+ segments, Winnicottian 20+ segments, Bionian 15+ segments (currently: L=3, W=19, B=12)

## Commits

- `c8af94e` — docs(21-01): complete per-segment framework depth analysis

## Self-Check: PASSED

**Files created:**
```bash
$ ls -la .planning/phases/21-script-audit-framework-integration/21-01-framework-analysis.md
-rw-r--r-- 1 USER 197121 66818 Mar 28 10:16 .planning/phases/21-script-audit-framework-integration/21-01-framework-analysis.md
```

**Commits verified:**
```bash
$ git log --oneline -1
c8af94e docs(21-01): complete per-segment framework depth analysis
```

**Content verified:**
- 469 lines total
- 91 table rows (47 main segments + framework anchor tables + integration gap tables)
- All 3 frameworks analyzed
- All 4 research clusters referenced
- Top 10 integration opportunities ranked
- Concrete Phase 22-23 recommendations provided

✓ All deliverables present and substantive.
