# O Oraculo — Developer Guide

## What This Is

Interactive voice art installation for the VII Bienal de Psicanalise e Cultura (SBPRP 2026, May 29-30). A visitor puts on headphones, the Oracle guides them through a Dante-inspired journey (Inferno → Purgatorio → Paraiso) with 8 branching voice decisions in 5-7 minutes, then delivers a personalized devolucao based on their choice pattern.

**Status:** v4.0 Game Flow complete. All code, script, machine, and 61 MP3s shipped. Pending: browser UAT + event deploy.

## Stack

- **Next.js 15** App Router (API routes as server-side proxies)
- **React 19** (client-side only, `'use client'` everywhere)
- **XState v5** state machine (~54 states, 8 decision points, branching)
- **Tailwind CSS v4** (dark theme, minimal UI — voice is primary)
- **Vitest** + Testing Library (32/34 suites pass, 496 tests)
- **TypeScript 5.7** strict mode, `@/` path alias

## Architecture

### State Machine (single source of truth)

```
IDLE → APRESENTACAO → INFERNO → [Q2B branch?] → PURGATORIO → [Q4B branch?] → PARAISO → DEVOLUCAO → ENCERRAMENTO → FIM
```

- **6 base questions** (Q1-Q6) + **2 conditional branches** (Q2B, Q4B) = 8 max decisions
- Q2B triggers when Q1=A AND Q2=A (both cautious choices in Inferno)
- Q4B triggers when Q3=A AND Q4=A (both engaged choices in Purgatorio)
- 8 devolucao archetypes: SEEKER, GUARDIAN, CONTRADICTED, PIVOT_EARLY, PIVOT_LATE, DEPTH_SEEKER, SURFACE_KEEPER, MIRROR
- Pattern matching uses percentage-based thresholds on variable-length ChoicePattern (6-10 choices)

**Files:** `src/machines/oracleMachine.ts` (machine), `src/machines/oracleMachine.types.ts` (types + context)

### Service Pattern (interface + factory + mock)

Every external service follows: `index.ts` (interface + factory) → `mock.ts` → `{provider}.ts`

| Service | Real Provider | Factory | Toggle |
|---------|--------------|---------|--------|
| TTS | ElevenLabs v3 + FallbackTTS (61 MP3s) | `createTTSService()` | `NEXT_PUBLIC_USE_REAL_APIS` |
| STT | OpenAI Whisper | `createSTTService()` | same |
| NLU | Claude Haiku (keyword pre-match → LLM) | `createNLUService()` | same |
| Analytics | localStorage mock (Supabase deferred) | `createAnalyticsService()` | same |

### Voice Pipeline (AGUARDANDO states)

```
Mic records 4s → Whisper STT → keyword match (instant) or Claude NLU (2s) → 25s timeout
```

- Keywords defined in `QUESTION_META` (`src/types/index.ts`) — fast path, no API call
- NLU sends `questionContext` + option labels to Claude Haiku for binary classification
- Low confidence (< 0.7) → play fallback script, retry (max 2 attempts)
- Timeout → default choice per question

### Script & Audio

- **Script:** `src/data/script.ts` — 61 keys, all PT-BR, with `pauseAfter` timing and `inflection` tags
- **NLU metadata:** `QUESTION_META` in `src/types/index.ts` — 8 questions with keywords, labels, context
- **MP3s:** `public/audio/oracle/` — 61 files, ~17MB total, mp3_44100_192 via ElevenLabs v3
- **Generation:** `scripts/generate-audio-v3.ts` imports from `script.ts` directly
- **Timing validation:** `scripts/validate-timing.ts` checks all 4 branch permutations (max-path: 5:57 min)

### Key Component

`src/components/experience/OracleExperience.tsx` — the orchestrator. Maps machine states to:
- `getScriptKey()` → which SCRIPT entry to play
- `getBreathingDelay()` → pause between states (SHORT/MEDIUM/LONG)
- `getFallbackScript()` → fallback text per AGUARDANDO state
- `activeChoiceConfig` → which ChoiceConfig to use for voice choice pipeline
- 8 `buildChoiceConfig(N)` instances from `QUESTION_META`

## Conventions

- **Components:** PascalCase, default export, `'use client'` directive
- **Services:** `create{X}Service()` factory, `Mock{X}Service` / `{Provider}{X}Service`
- **Hooks:** `use{X}.ts`, lazy service init via `useRef` + `useCallback`
- **Types:** union types over enums, `| null` over `| undefined`
- **Constants:** `UPPER_SNAKE_CASE` (SCRIPT, PHASE_COLORS, QUESTION_META)
- **Tests:** `{name}.test.ts` next to source or in `__tests__/`, use `data-testid`
- **Imports:** `@/` alias for cross-directory, relative for same directory
- **Styling:** Tailwind only, inline `style={}` for dynamic values

## Common Tasks

### Change script text
1. Edit `src/data/script.ts` (find the key, change `.text`)
2. If NLU options/keywords changed: update `QUESTION_META` in `src/types/index.ts`
3. Regenerate MP3: `npx ts-node scripts/generate-audio-v3.ts` (needs `ELEVENLABS_API_KEY`)
4. Run tests: `npm test`

### Add a new question/branch
1. Add script entries in `src/data/script.ts` (SETUP, PERGUNTA, RESPOSTA_A/B, FALLBACK, TIMEOUT)
2. Add `QUESTION_META` entry in `src/types/index.ts`
3. Add states in `src/machines/oracleMachine.ts` with guards if conditional
4. Extend `OracleExperience.tsx`: getScriptKey, getBreathingDelay, getFallbackScript, activeChoiceConfig, isAguardando
5. Generate MP3s, update tests

### Run tests
```bash
npm test              # all tests (32/34 suites, 496 tests)
npm run test:watch    # watch mode
npx vitest run src/data/  # specific directory
```

**Known:** 2 test files from v1.0 (`voice-flow-integration.test.ts`, `flow-sequencing.test.ts`) reference obsolete PURGATORIO_A/B states. They need rewrite for v4.0 machine.

## Environment Variables

```bash
NEXT_PUBLIC_USE_REAL_APIS=true  # false = FallbackTTS + mocks
ELEVENLABS_API_KEY=sk_...       # server-side only
ELEVENLABS_VOICE_ID=PznTnBc8X6pvixs9UkQm  # Oracle voice
USE_V3_MODEL=true               # eleven_v3 with audio tags
OPENAI_API_KEY=sk-proj-...      # Whisper STT
ANTHROPIC_API_KEY=sk-ant-...    # Claude Haiku NLU
```

## Project Structure

```
src/
  app/
    page.tsx                    # Main experience (renders OracleExperience)
    admin/page.tsx              # Admin dashboard
    api/tts/route.ts            # ElevenLabs proxy
    api/stt/route.ts            # Whisper proxy
    api/nlu/route.ts            # Claude Haiku proxy
  components/experience/
    OracleExperience.tsx        # THE orchestrator component
    PermissionScreen.tsx        # Mic permission UI
    StartButton.tsx             # Start button
    ChoiceButtons.tsx           # Voice choice fallback buttons
  components/audio/
    WaveformVisualizer.tsx      # Canvas waveform
    ListeningIndicator.tsx      # Mic active indicator
  machines/
    oracleMachine.ts            # XState v5 machine (~54 states)
    oracleMachine.types.ts      # Context, events, types
  data/
    script.ts                   # Full PT-BR script (61 keys)
  types/
    index.ts                    # Core types + QUESTION_META
  hooks/
    useVoiceChoice.ts           # Voice choice pipeline hook
    useMicrophone.ts            # Mic recording hook
  services/
    tts/                        # TTS: interface, mock, elevenlabs, fallback
    stt/                        # STT: interface, mock, whisper
    nlu/                        # NLU: interface, mock, claude
    analytics/                  # Analytics: interface, mock
    audio/                      # Ambient audio, crossfader
    station/                    # Multi-station registry
  lib/audio/
    audioContext.ts             # AudioContext singleton
scripts/
  generate-audio-v3.ts         # MP3 generation via ElevenLabs
  validate-timing.ts           # Duration validation (4 branch paths)
public/audio/oracle/           # 61 pre-recorded MP3s (~17MB)
```

## Important Constraints

- **Audio-only experience** — UI shows abstract visuals, NEVER text from script
- **LGPD compliance** — zero personal data stored, audio discarded after classification
- **Offline fallback** — FallbackTTS plays pre-recorded MP3s when APIs unavailable
- **Event hardware** — 2-3 laptops + headphones, Chrome browser, HTTPS required
- **Budget** — ~$50 for 300 visitors across ElevenLabs + Whisper + Claude APIs
- **PT-BR only** — all script, NLU, keywords in Brazilian Portuguese
