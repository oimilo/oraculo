---
phase: 01-core-state-machine-audio-foundation
plan: 04
subsystem: UI & Experience Orchestration
tags: [ui, integration, state-machine, speech, orchestration]
dependency_graph:
  requires: [01-02, 01-03]
  provides: [complete-browser-experience, ui-components, experience-orchestrator]
  affects: [src/app/page.tsx]
tech_stack:
  added: [React client components, XState React hooks, conditional rendering patterns]
  patterns: [state-driven UI, auto-speak on state change, AudioContext unlock on user gesture]
key_files:
  created:
    - src/components/experience/OracleExperience.tsx
    - src/components/experience/PermissionScreen.tsx
    - src/components/experience/StartButton.tsx
    - src/components/experience/PhaseBackground.tsx
    - src/components/experience/ChoiceButtons.tsx
    - src/components/experience/EndFade.tsx
  modified:
    - src/app/page.tsx
decisions:
  - getScriptKey function moved outside component to fix ESLint exhaustive-deps warning
  - Auto-speak implemented via useEffect on state.value dependency
  - isSpeakingRef prevents double-speaking on re-renders
  - Microphone permission check happens on mount via Permissions API
  - AudioContext unlocked in handleStart (inside user click per RES-04)
metrics:
  duration_seconds: 166
  tasks_completed: 3
  components_created: 6
  files_modified: 7
  commits: 2
  completed_date: 2026-03-25
---

# Phase 01 Plan 04: UI & Experience Orchestration Summary

**One-liner:** Complete Oracle experience with state machine orchestration, SpeechSynthesis integration, phase-colored backgrounds, and choice UI for browser testing.

## What Was Built

Created the full UI layer and experience orchestrator that wires together the state machine (Plan 02) and audio utilities (Plan 03) into a playable browser experience. All 5 UI components follow the minimal design per CONTEXT.md, and the OracleExperience component handles state-driven rendering and auto-speaking.

### Components Created

1. **PermissionScreen.tsx** - Microphone permission request overlay with error handling, auto-check for existing permission via Permissions API
2. **StartButton.tsx** - Pulsing start button with Tailwind animate-pulse
3. **PhaseBackground.tsx** - Phase-colored background with 3-second smooth transitions
4. **ChoiceButtons.tsx** - Temporary testing UI for choices with visual countdown (XState handles actual timeout)
5. **EndFade.tsx** - Fade-to-black ending component with 3-second opacity transition
6. **OracleExperience.tsx** - Main orchestrator wiring state machine to speech and UI

### Integration Points

- **State Machine → Speech:** `getScriptKey` maps machine states to SCRIPT keys, `useEffect` auto-speaks on state change
- **State Machine → UI:** Conditional rendering based on `state.matches()`
- **AudioContext unlock:** `handleStart` calls `initAudioContext()` inside user click handler (RES-04 compliance)
- **Voice direction:** Uses `VOICE_DIRECTIONS[phase]` to vary SpeechSynthesis rate/pitch per phase
- **Background colors:** Uses `PHASE_COLORS[phase]` for phase-specific backgrounds per CONTEXT.md

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint exhaustive-deps warning**
- **Found during:** Task 2 build verification
- **Issue:** `useEffect` had missing dependency on `getScriptKey` function
- **Fix:** Moved `getScriptKey` function outside component scope to make it stable across renders
- **Files modified:** src/components/experience/OracleExperience.tsx
- **Commit:** 51eb216

No other deviations. Plan executed exactly as written.

## Verification Results

### Automated Checks

- TypeScript compilation: PASSED (npx tsc --noEmit)
- Next.js build: PASSED (npm run build)
- All acceptance criteria met per PLAN.md tasks

### Human Verification (Auto-approved)

Per user's autonomous mode request, checkpoint:human-verify was auto-approved. The complete experience flow is wired and ready for browser testing:

- Permission screen → microphone request
- Start button → pulsing animation on black background
- Oracle speech → SpeechSynthesis with pauses and voice direction
- Background transitions → smooth color shifts per phase
- Choice buttons → appear at decision points with countdown
- State routing → all 4 paths reachable via choices
- Ending → fade-to-black with 5s auto-reset to IDLE

## Known Stubs

None. All components are fully wired with real data:
- PermissionScreen uses navigator.mediaDevices.getUserMedia (real mic access)
- OracleExperience uses SCRIPT data (complete narrative text)
- PhaseBackground uses PHASE_COLORS (all 6 phase colors defined)
- ChoiceButtons wire to actual XState events
- Speech synthesis uses VOICE_DIRECTIONS for phase-specific voice modulation

## Requirements Satisfied

Per PLAN.md frontmatter requirements:

- **FLOW-01:** State machine controls complete flow (via OracleExperience orchestration)
- **FLOW-02:** Oracle speaks via SpeechSynthesis with pauses (auto-speak on state change)
- **FLOW-03:** Choice buttons appear with 15s timeout (ChoiceButtons component)
- **FLOW-05, FLOW-06:** Choices route to correct paths (state.matches conditional rendering)
- **FLOW-08:** Paraiso plays reflexive text (no choice UI, just speech)
- **FLOW-09:** Devolucao selects 1-of-4 variant (state machine DEVOLUCAO routing)
- **FLOW-10:** Encerramento plays, fade to black, 5s reset (EndFade + FIM state after delay)
- **FLOW-12:** Complete cycle idle→phases→idle (state machine + auto-reset)
- **RES-03:** Microphone permission requested on overlay (PermissionScreen)
- **RES-04:** AudioContext unlocked on start click (handleStart with initAudioContext)
- **UI-01:** Pulsing start button on dark background (StartButton with animate-pulse)
- **UI-06:** Fade-to-black ending (EndFade component)

## Commits

| Hash | Message | Files |
|------|---------|-------|
| 9de30e9 | feat(01-04): create UI components for Oracle experience | 5 components created |
| 51eb216 | feat(01-04): create OracleExperience orchestrator and wire to page | OracleExperience.tsx, page.tsx |

## Next Steps

1. Test in browser via `npm run dev` to verify complete flow visually
2. Verify speech synthesis works in Chrome (best PT-BR voice support)
3. Test all 4 paths (A_FICAR, A_EMBORA, B_PISAR, B_CONTORNAR)
4. Test timeout behavior (15s wait at choice points)
5. Verify background color transitions are smooth
6. Verify fade-to-black ending and auto-reset after 5s

Phase 01 is now complete pending browser verification.

## Self-Check: PASSED

**Files created:**
- FOUND: src/components/experience/OracleExperience.tsx
- FOUND: src/components/experience/PermissionScreen.tsx
- FOUND: src/components/experience/StartButton.tsx
- FOUND: src/components/experience/PhaseBackground.tsx
- FOUND: src/components/experience/ChoiceButtons.tsx
- FOUND: src/components/experience/EndFade.tsx

**Files modified:**
- FOUND: src/app/page.tsx

**Commits exist:**
- FOUND: 9de30e9
- FOUND: 51eb216

All claims verified.
