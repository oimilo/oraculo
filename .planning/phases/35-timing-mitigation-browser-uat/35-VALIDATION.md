---
phase: 35
slug: timing-mitigation-browser-uat
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-08
---

# Phase 35 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Phase 35 is **documentation-only** — no executable code changes — so the
> sampling surface is grep-based text verification, the existing timing
> validator script, and manual visual QA. There are no new automated tests.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual grep + wc + visual QA + existing `validate-timing.ts` |
| **Config file** | None — documentation edits only |
| **Quick run command** | `npx tsx scripts/validate-timing.ts` (timing) + targeted `grep -nE 'pattern' file` (docs) |
| **Full suite command** | `npx vitest run && npx tsx scripts/validate-timing.ts` (regression baseline + timing) |
| **Estimated runtime** | ~90 seconds (vitest ~80s + validator ~5s + grep batch ~5s) |

---

## Sampling Rate

- **After every documentation task:** Run the grep command listed in the task's `<acceptance_criteria>` block. Spot-check the rendered file in the editor.
- **After Wave 1 completes:** Run the full grep batch from Code Examples §"Grep Verification Pattern", then `npx tsx scripts/validate-timing.ts` to confirm 24-path output unchanged, then open `public/roteiro.html` in Chrome for visual QA of the Mermaid flowchart.
- **After Wave 2 completes:** Verify `35-HUMAN-UAT.md` exists with ≥3 scenarios via grep, and that each scenario contains the keyword markers from the table below.
- **Before `/gsd:verify-work`:** Full regression baseline (`npx vitest run` matches 733p/16f/3s) + timing validator green + all grep checks pass + roteiro.html renders correctly.
- **Max feedback latency:** ~90 seconds (full pass) or ~5 seconds (per-task grep).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 35-01-01 | 01 | 1 | POL-01 | script exit code | `npx tsx scripts/validate-timing.ts` (expect exit 0, "All 24 paths fall within acceptable range") | ✅ existing | ⬜ pending |
| 35-01-02 | 01 | 1 | POL-03 | grep | `grep -n "11 arqu" public/roteiro.html` (expect line 377-area match) + visual Mermaid QA | ✅ existing | ⬜ pending |
| 35-01-03 | 01 | 1 | POL-03 | grep | `grep -c "v6\.0 Deep Branching\|~78 states\|82 MP3s\|11 decision\|11 devolu" CLAUDE.md` (expect ≥6 lines) | ✅ existing | ⬜ pending |
| 35-02-01 | 02 | 2 | UAT-01 | file existence + grep | `test -f .planning/phases/35-timing-mitigation-browser-uat/35-HUMAN-UAT.md && grep -c "## Scenario" $_` (expect ≥3) | ❌ Wave 2 creates | ⬜ pending |
| 35-02-02 | 02 | 2 | UAT-01 | grep | `grep -E "(No branches \(6Q\)|Q1B.*Q4B.*Q5B|ESPELHO_SILENCIOSO)" 35-HUMAN-UAT.md` (expect 3 distinct matches) | ❌ Wave 2 creates | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Cross-phase regression baseline (always run before merge):**
- `npx vitest run` → 733 passing / 16 failing / 3 skipped (matches Phase 34 baseline; the 16 failures are pre-existing v1.0 + Phase 30 issues, not new regressions).

---

## Wave 0 Requirements

None. Phase 35 introduces no new test files, no new framework dependencies, no new tooling. All verification surfaces (`grep`, `wc`, `npx tsx`, `npx vitest`, browser) are already present from the Phase 1-34 baseline.

*Wave 0 status:* `wave_0_complete: true`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `public/roteiro.html` Mermaid flowchart renders correctly with all 5 branches and 11 devolução targets visible | POL-03 | Mermaid diagrams render client-side via JS — cannot grep the rendered SVG output | 1. Open `public/roteiro.html` in Chrome (or `http://localhost:3000/roteiro.html` if dev server is running). 2. Scroll to flowchart section. 3. Verify Q1B, Q5B, Q6B branches appear as labeled nodes. 4. Verify ESPELHO_SILENCIOSO, CONTRA_FOBICO, and PORTADOR appear as devolução targets. 5. Verify routing edges from Q1B → CONTRA_FOBICO and Q5B → PORTADOR. 6. Confirm nothing in the flowchart still says "9 archetypes" or shows only 8 baseline devoluções. |
| `CLAUDE.md` stats are internally consistent across every prose mention | POL-03 (cross-check) | Stats appear in narrative paragraphs across multiple sections — full-text consistency requires a human read, not a single grep | 1. Read CLAUDE.md sections "What This Is", "Stack", "Architecture", "Script & Audio", "Project Structure". 2. Verify every stat mention agrees: 11 max decisions (6 base + 5 branches), ~78 states, 82 MP3s, 82 SCRIPT keys, 11 devolução archetypes, v6.0 Deep Branching status. 3. Search case-insensitively for any orphaned "v4.0" claim or "61 MP3s" / "~54 states" / "8 decision" remnants. 4. Confirm the status banner reads "v6.0 Deep Branching complete" (not "v4.0 Game Flow complete"). |
| Browser UAT scenarios execute correctly with the real voice pipeline | UAT-01 | The full mic → Whisper → NLU → ElevenLabs → state-machine → MP3 pipeline requires human ears + judgment for voice quality, NLU classification accuracy, and timing perception | Phase 35's deliverable is the **scenario document** (`35-HUMAN-UAT.md`), not the execution results. After Phase 35 completes, the human runs the 3 scenarios in Chrome with real mic + headphones and records pass/fail per checkpoint. Voice quality, NLU accuracy, branch firing, and devolução routing are all human-verified. |

---

## Validation Sign-Off

- [ ] All tasks have grep-based or script-based `<acceptance_criteria>` (no subjective language)
- [ ] Sampling continuity: every wave ends with the full grep batch + validator
- [ ] Wave 0 covers all MISSING references (none required for Phase 35)
- [ ] No watch-mode flags in any verification command
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter once all tasks pass

**Approval:** pending
