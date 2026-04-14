# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```
oraculo/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (black bg, pt-BR lang)
│   │   ├── page.tsx                # Home page -> OracleExperience
│   │   ├── globals.css             # Global styles
│   │   ├── admin/                  # Admin dashboard
│   │   │   ├── page.tsx            # Station monitoring page
│   │   │   └── components/         # StationCard, SessionMetrics, PathDistribution
│   │   └── api/                    # API route handlers (server-side proxies)
│   │       ├── tts/route.ts        # ElevenLabs TTS proxy
│   │       ├── stt/route.ts        # OpenAI Whisper STT proxy
│   │       └── nlu/route.ts        # Anthropic Claude NLU proxy
│   ├── components/                 # React UI components
│   │   ├── experience/             # Core experience components
│   │   │   ├── OracleExperience.tsx  # Main orchestrator (570 lines)
│   │   │   ├── PermissionScreen.tsx  # Mic permission request
│   │   │   ├── StartButton.tsx       # Start experience button
│   │   │   ├── PhaseBackground.tsx   # Phase-colored background
│   │   │   ├── ChoiceButtons.tsx     # A/B choice buttons with countdown
│   │   │   └── EndFade.tsx           # End-of-experience fade
│   │   ├── audio/                  # Audio visualization
│   │   │   ├── WaveformVisualizer.tsx
│   │   │   └── ListeningIndicator.tsx
│   │   └── debug/                  # Dev-only debug panel
│   │       └── DebugPanel.tsx
│   ├── machines/                   # XState state machines
│   │   ├── oracleMachine.ts        # v4 machine definition (710 lines)
│   │   ├── oracleMachine.types.ts  # Context, events, helpers (v4 + deprecated v3/v2)
│   │   └── guards/                 # XState guards
│   │       └── patternMatching.ts  # Archetype detection algorithm
│   ├── services/                   # Service layer (interface + factory + impl + mock)
│   │   ├── tts/                    # Text-to-Speech
│   │   │   ├── index.ts            # TTSService interface + factory + voice settings
│   │   │   ├── elevenlabs.ts       # ElevenLabs implementation
│   │   │   ├── fallback.ts         # Pre-recorded MP3 fallback
│   │   │   └── mock.ts             # Test mock
│   │   ├── stt/                    # Speech-to-Text
│   │   │   ├── index.ts            # STTService interface + factory
│   │   │   ├── whisper.ts          # OpenAI Whisper implementation
│   │   │   └── mock.ts             # Test mock
│   │   ├── nlu/                    # Natural Language Understanding
│   │   │   ├── index.ts            # NLUService interface + factory
│   │   │   ├── claude.ts           # Claude Haiku implementation
│   │   │   └── mock.ts             # Test mock
│   │   ├── analytics/              # Session analytics
│   │   │   ├── index.ts            # AnalyticsService interface + factory
│   │   │   └── mock.ts             # localStorage-based mock
│   │   ├── audio/                  # Ambient audio
│   │   │   ├── ambientPlayer.ts    # Phase-based ambient audio player
│   │   │   └── crossfader.ts       # Equal-power crossfade utilities
│   │   └── station/                # Station registry (multi-kiosk)
│   │       ├── index.ts            # Re-export
│   │       └── registry.ts         # localStorage-based heartbeat registry
│   ├── hooks/                      # React hooks
│   │   ├── useVoiceChoice.ts       # Voice capture pipeline (384 lines)
│   │   ├── useTTSOrchestrator.ts   # TTS service lifecycle
│   │   ├── useMicrophone.ts        # MediaRecorder wrapper
│   │   ├── useAmbientAudio.ts      # Ambient audio lifecycle
│   │   ├── useSessionAnalytics.ts  # Analytics hook
│   │   ├── useWaveform.ts          # Waveform visualization
│   │   └── useKeyboardShortcut.ts  # Dev keyboard shortcuts
│   ├── data/                       # Narrative content
│   │   └── script.ts              # Full Portuguese script (523 lines, 61 entries)
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts               # Core types + QUESTION_META + PHASE_COLORS
│   │   ├── analytics.ts           # Analytics types
│   │   └── station.ts             # Station types
│   ├── lib/                       # Shared utilities
│   │   ├── audio/                 # Audio utilities
│   │   │   ├── audioContext.ts    # Singleton AudioContext manager
│   │   │   ├── speechSynthesis.ts # Browser SpeechSynthesis helpers
│   │   │   └── v3-conversion.ts   # ElevenLabs v3 text conversion
│   │   ├── api/
│   │   │   └── validateEnv.ts     # requireEnv() helper
│   │   └── debug/
│   │       └── logger.ts          # createLogger(namespace) utility
│   ├── test/
│   │   └── setup.ts               # Vitest setup (jest-dom matchers)
│   └── __tests__/                 # Integration test files
│       ├── flow-sequencing.test.ts        # STALE: v1 flow tests (FAILING)
│       ├── voice-flow-integration.test.ts # STALE: v1 integration tests (FAILING)
│       ├── mic-lifecycle.test.ts
│       └── stt-nlu-pipeline.test.ts
├── public/
│   └── audio/
│       ├── prerecorded/           # 61 pre-recorded MP3 files
│       │   ├── apresentacao.mp3
│       │   ├── inferno_intro.mp3
│       │   ├── inferno_q1_setup.mp3
│       │   ├── ... (61 files total)
│       │   └── timeout_q4b.mp3
│       └── README.md
├── scripts/                       # Build/utility scripts
│   ├── generate-audio.mjs         # ElevenLabs MP3 generation (v2)
│   ├── generate-audio-v3.ts       # ElevenLabs MP3 generation (v3)
│   ├── validate-timing.ts         # Script timing validation
│   └── narrative-proposals/       # Research materials
│       ├── lacanian.ts
│       ├── winnicottian.ts
│       ├── bionian.ts
│       ├── FINAL.ts
│       └── RESEARCH-SYNTHESIS.md
├── .planning/                     # GSD planning documents
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── .env.example
├── .eslintrc.json
└── PRD.md                         # Product Requirements Document
```

## Directory Purposes

**`src/app/`:**
- Next.js App Router pages and API routes
- `page.tsx` is the single user-facing page
- `admin/page.tsx` is a separate monitoring dashboard
- `api/` contains 3 server-side proxy routes

**`src/components/experience/`:**
- Core experience UI components
- `OracleExperience.tsx` is the main orchestrator (largest component, 570 lines)
- Other components are small, focused UI pieces

**`src/machines/`:**
- XState v5 state machine definition and types
- `oracleMachine.ts` is the heart of the application (710 lines)
- `guards/patternMatching.ts` contains the archetype classification algorithm

**`src/services/`:**
- Each service follows: `index.ts` (interface + factory), `{impl}.ts`, `mock.ts`
- Factory functions check `typeof window` and `NEXT_PUBLIC_USE_REAL_APIS`

**`src/hooks/`:**
- Bridge between services and React
- `useVoiceChoice.ts` is the most complex (384 lines, internal state machine)
- Each hook manages one concern

**`src/data/`:**
- `script.ts` contains the full Portuguese narrative (all 61 script entries)
- Script keys map 1:1 to machine states and MP3 filenames

**`src/types/`:**
- `index.ts` has core types + `QUESTION_META` (NLU context for each question) + `PHASE_COLORS`
- Legacy v2/v3 types are deprecated but still exported for backward compatibility

**`src/lib/`:**
- Shared utilities: AudioContext singleton, logger, env validation, speech synthesis helpers

**`public/audio/prerecorded/`:**
- 61 MP3 files matching script keys (lowercased)
- Pattern: `{script_key}.mp3` -> e.g., `INFERNO_Q1_SETUP` -> `inferno_q1_setup.mp3`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main page (renders OracleExperience)
- `src/app/layout.tsx`: Root layout (metadata, lang="pt-BR")
- `src/components/experience/OracleExperience.tsx`: Main orchestrator

**Configuration:**
- `vitest.config.ts`: Test configuration
- `tsconfig.json`: TypeScript config (strict, path aliases)
- `.env.example`: Environment variable template
- `tailwind.config.ts`: Tailwind content paths and theme

**Core Logic:**
- `src/machines/oracleMachine.ts`: State machine (ALL flow logic)
- `src/machines/guards/patternMatching.ts`: Archetype classification
- `src/data/script.ts`: Narrative content
- `src/types/index.ts`: Type system + question metadata

**Services:**
- `src/services/tts/index.ts`: TTS interface and factory
- `src/services/tts/fallback.ts`: Pre-recorded MP3 player
- `src/services/tts/elevenlabs.ts`: ElevenLabs client
- `src/services/nlu/index.ts`: NLU interface and factory
- `src/app/api/nlu/route.ts`: NLU API route (keyword match + Claude)

**Hooks:**
- `src/hooks/useVoiceChoice.ts`: Voice capture pipeline
- `src/hooks/useTTSOrchestrator.ts`: TTS lifecycle
- `src/hooks/useMicrophone.ts`: MediaRecorder wrapper

**Testing:**
- `src/machines/oracleMachine.test.ts`: Machine tests (1034 lines, 60+ tests)
- `src/machines/guards/__tests__/patternMatching.test.ts`: Archetype tests
- `src/data/__tests__/script-v3.test.ts`: Script validation tests
- `src/test/setup.ts`: Vitest setup

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `OracleExperience.tsx`, `ChoiceButtons.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useVoiceChoice.ts`)
- Services: `camelCase.ts` (e.g., `elevenlabs.ts`, `fallback.ts`, `mock.ts`)
- Types: `camelCase.ts` (e.g., `index.ts`, `analytics.ts`)
- Tests: `{name}.test.ts` or `{name}.test.tsx`
- Machine: `camelCase.ts` (e.g., `oracleMachine.ts`)

**Test directories:**
- `__tests__/` subdirectory adjacent to source (e.g., `src/services/tts/__tests__/`)
- Exception: `src/machines/oracleMachine.test.ts` is co-located

**Directories:**
- All lowercase, singular or descriptive (e.g., `services`, `hooks`, `experience`, `debug`)

## Where to Add New Code

**New question/script content:**
- Add to `src/data/script.ts` (ScriptDataV4 interface + SCRIPT object)
- Add states to `src/machines/oracleMachine.ts`
- Add MP3 to `public/audio/prerecorded/`
- Add script key mapping in `getScriptKey()` in `OracleExperience.tsx`
- Add choice config via `buildChoiceConfig()` if it's an AGUARDANDO state
- Add breathing delay mapping in `getBreathingDelay()` in `OracleExperience.tsx`

**New external service:**
- Create `src/services/{name}/index.ts` (interface + factory)
- Create `src/services/{name}/{impl}.ts` (implementation)
- Create `src/services/{name}/mock.ts` (test mock)
- Add API route in `src/app/api/{name}/route.ts`
- Add env vars to `.env.example`
- Create tests in `src/services/{name}/__tests__/`

**New UI component:**
- Add to `src/components/experience/` (experience-related) or `src/components/audio/` (audio-related)
- Use `'use client'` directive
- Keep components small and focused

**New hook:**
- Add to `src/hooks/` with `use` prefix
- Follow existing pattern: state + refs + callbacks + effects
- Add tests in `src/hooks/__tests__/`

**New type definitions:**
- Add to `src/types/index.ts` for core types
- Create new file in `src/types/` for domain-specific types (e.g., `analytics.ts`)

## Special Directories

**`public/audio/prerecorded/`:**
- 61 MP3 files for offline fallback
- Generated by `scripts/generate-audio-v3.ts`
- Committed to git (required for offline operation)

**`scripts/narrative-proposals/`:**
- Research materials (Lacanian, Winnicottian, Bionian frameworks)
- NOT imported by source code; reference only
- Committed to git

**`.planning/`:**
- GSD workflow planning documents
- Not committed to git (or optionally committed)

---

*Structure analysis: 2026-03-29*
