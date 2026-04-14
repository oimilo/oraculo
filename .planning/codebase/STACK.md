# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript ^5.7.3 - All source code, tests, and configuration
- PT-BR - All script content, user-facing text, NLU prompts

**Secondary:**
- CSS (Tailwind v4) - Styling via utility classes
- JavaScript (ESM) - `postcss.config.mjs`, `scripts/generate-audio.mjs`

## Runtime

**Environment:**
- Node.js (no `.nvmrc`; assumed latest LTS)
- Browser: Web Audio API, MediaRecorder API, SpeechSynthesis API

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js ^15.3.3 - App Router, API routes as proxy to external services
- React ^19.0.0 - UI components (client-side only rendering)
- XState ^5.20.0 + @xstate/react ^5.0.0 - State machine (oracle flow control)

**Testing:**
- Vitest ^2.1.8 - Test runner with jsdom environment
- @testing-library/react ^16.1.0 - Component testing
- @testing-library/jest-dom ^6.6.3 - DOM matchers
- @vitest/ui ^2.1.8 - Visual test UI (dev)

**Build/Dev:**
- Tailwind CSS ^4.0.0 via @tailwindcss/postcss ^4.2.2
- PostCSS ^8
- @vitejs/plugin-react ^4.3.4 - React support in Vitest
- ESLint ^9 + eslint-config-next ^15.3.3

## Key Dependencies

**Critical (runtime):**
- `xstate` ^5.20.0 - 710-line state machine driving the entire 5-7 min experience
- `@xstate/react` ^5.0.0 - `useMachine` hook binding machine to React component
- `next` ^15.3.3 - App Router for 3 API routes proxying external services
- `react` ^19.0.0 - UI rendering (single page app, client-side)

**Dev/Test:**
- `jsdom` ^25.0.1 - Browser simulation for Vitest
- `standardized-audio-context-mock` ^9.7.28 - AudioContext mocking in tests
- `typescript` ^5.7.3 - Type checking (strict mode)

## Configuration

**TypeScript (`tsconfig.json`):**
- `strict: true`
- `target: "ES2017"`
- `module: "esnext"`, `moduleResolution: "bundler"`
- Path alias: `@/*` -> `./src/*`

**Vitest (`vitest.config.ts`):**
- Environment: `jsdom`
- Globals: `true`
- Setup: `./src/test/setup.ts`
- Include: `src/**/*.test.{ts,tsx}`

**ESLint (`.eslintrc.json`):**
- Extends: `next/core-web-vitals` only

**Tailwind (`tailwind.config.ts`):**
- Content: `./src/{pages,components,app}/**/*.{js,ts,jsx,tsx,mdx}`
- Custom CSS variable colors: `background`, `foreground`

**Environment (`.env.example`):**
- `NEXT_PUBLIC_USE_REAL_APIS` - `"true"` for real APIs; anything else uses FallbackTTS + mocks
- `ELEVENLABS_API_KEY` - TTS (server-side)
- `ELEVENLABS_VOICE_ID` - Voice clone ID (default: `21m00Tcm4TlvDq8ikWAM`)
- `USE_V3_MODEL` - `"true"` for `eleven_v3` model with audio tags
- `OPENAI_API_KEY` - Whisper STT (server-side)
- `ANTHROPIC_API_KEY` - Claude Haiku NLU (server-side)

## Build Commands

```bash
npm run dev          # Next.js dev server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run test         # vitest run (single pass)
npm run test:watch   # vitest (watch mode)
npm run test:ui      # vitest --ui (visual)
```

## Platform Requirements

**Development:**
- Node.js + npm
- Chrome/Edge/Firefox with Web Audio API and MediaRecorder
- Microphone access for voice input testing

**Production:**
- Any Node.js host (Vercel recommended for Next.js)
- HTTPS required (MediaRecorder requires secure context)
- API keys: ElevenLabs, OpenAI Whisper, Anthropic Claude
- 61 pre-recorded MP3 files in `public/audio/prerecorded/` (~17MB)
- 3 ambient audio loops expected in `public/audio/` (inferno, purgatorio, paraiso)

---

*Stack analysis: 2026-03-29*
