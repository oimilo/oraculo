---
phase: 9
slug: stt-nlu-pipeline-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/__tests__/stt-nlu-pipeline.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/stt-nlu-pipeline.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | PIPE-01..05 | integration | `npx vitest run src/__tests__/stt-nlu-pipeline.test.ts` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | PIPE-01..05 | implementation | `npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/stt-nlu-pipeline.test.ts` — integration tests for PIPE-01 through PIPE-05

*Existing test infrastructure (vitest, jsdom, mocks) covers all framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Portuguese transcription accuracy | PIPE-01 | Requires real Whisper API + spoken input | Record 5 Portuguese phrases, run through API, verify >90% accuracy |
| Real-world latency check | PIPE-01 | Requires network conditions | Time STT+NLU roundtrip, verify <3s |
| Booth ambient noise handling | PIPE-05 | Requires physical environment | Record silence in booth, verify no hallucination |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
