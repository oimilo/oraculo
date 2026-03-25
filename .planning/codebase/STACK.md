# Technology Stack

**Analysis Date:** 2025-03-25

## Languages

**Primary:**
- TypeScript ^5.7.3 - All source code (`src/**/*.ts`, `src/**/*.tsx`)
- Strict mode enabled (`tsconfig.json` `"strict": true`)
- Target: ES2017, Module: ESNext, Module Resolution: Bundler

**Secondary:**
- CSS (Tailwind v4) - Styling via `src/app/globals.css` (`@import "tailwindcss"`)
- JSON - Configuration and data

## Runtime

**Environment:**
- Node.js (no version pinning file detected - no `.nvmrc`, `.node-version`, or `.tool-versions`)
- Browser: Desktop only (Web Audio API, MediaRecorder API, SpeechSynthesis API)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js ^15.3.3 - App Router, SSR/CSR hybrid
  - Config: `next.config.ts` (empty/default)
  - Entry: `src/app/page.tsx` (main experience), `src/app/admin/page.tsx` (admin dashboard)
  - API Routes: `src/app/api/tts/route.ts`, `src/app/api/stt/route.ts`, `src/app/api/nlu/route.ts`
- React ^19.0.0 - UI components
- React DOM ^19.0.0 - DOM rendering

**State Management:**
- XState ^5.20.0 - Finite state machine for narrative flow (`src/machines/oracleMachine.ts`)
- @xstate/react ^5.0.0 - React bindings (`useMachine` hook)

**Styling:**
- Tailwind CSS ^4.0.0 - Utility-first CSS
- @tailwindcss/postcss ^4.2.2 - PostCSS plugin
- PostCSS ^8 - CSS processing
- Config: `tailwind.config.ts`, `postcss.config.mjs`

**Testing:**
- Vitest ^2.1.8 - Test runner
  - Config: `vitest.config.ts`
  - Environment: jsdom
  - Setup: `src/test/setup.ts`
- @testing-library/react ^16.1.0 - Component testing
- @testing-library/jest-dom ^6.6.3 - DOM matchers (imported via vitest setup)
- jsdom ^25.0.1 - Browser environment simulation
- standardized-audio-context-mock ^9.7.28 - Web Audio API mocking
- @vitest/ui ^2.1.8 - Visual test UI

**Build/Dev:**
- @vitejs/plugin-react ^4.3.4 - React support for Vite/Vitest
- ESLint ^9 - Linting
- eslint-config-next ^15.3.3 - Next.js ESLint rules

## Key Dependencies

**Critical (production):**
| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.3.3 | App framework, routing, API routes, SSR |
| `react` | ^19.0.0 | UI library |
| `react-dom` | ^19.0.0 | DOM rendering |
| `xstate` | ^5.20.0 | State machine (17 states, 4 branching paths) |
| `@xstate/react` | ^5.0.0 | React-XState integration (`useMachine`) |

**Infrastructure (dev):**
| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.7.3 | Type checking |
| `tailwindcss` | ^4.0.0 | Styling |
| `vitest` | ^2.1.8 | Testing |
| `eslint` | ^9 | Code quality |

**Notable absences (by design):**
- No `@supabase/supabase-js` - Supabase integration planned but not yet added
- No `axios` or HTTP client - All external API calls use native `fetch`
- No CSS-in-JS library - Pure Tailwind
- No form library - No forms in the experience
- No i18n library - Hardcoded pt-BR

## Configuration

**TypeScript (`tsconfig.json`):**
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- JSX: preserve (handled by Next.js)
- Incremental compilation enabled
- Next.js plugin active

**Tailwind (`tailwind.config.ts`):**
- Content: `src/pages/**`, `src/components/**`, `src/app/**`
- Custom colors: `background` and `foreground` via CSS variables
- No plugins

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss`

**Vitest (`vitest.config.ts`):**
- Environment: jsdom
- Globals: true (no explicit imports needed for `describe`, `it`, `expect`)
- Setup: `src/test/setup.ts` (imports jest-dom matchers)
- Include: `src/**/*.test.{ts,tsx}`
- Path alias: `@` to `./src`

**ESLint:**
- Uses `eslint-config-next` (no custom `.eslintrc` file detected)
- Run via `next lint`

**Environment Variables:**
- `.env.example` present - template for `.env.local`
- Toggle: `NEXT_PUBLIC_USE_REAL_APIS` (client-exposed, controls mock vs real services)
- Server-only keys: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Planned: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Build & Deploy

**Scripts (`package.json`):**
```bash
npm run dev          # next dev (development server)
npm run build        # next build (production build)
npm run start        # next start (production server)
npm run lint         # next lint (ESLint)
npm run test         # vitest run (single run)
npm run test:watch   # vitest (watch mode)
npm run test:ui      # vitest --ui (visual UI)
```

**Deployment:**
- No Dockerfile, docker-compose, vercel.json, or `.github/workflows` detected
- No deployment configuration present
- Target: Standard Next.js deployment (Vercel-compatible)
- Event context: Bienal event, 29-30 May 2026

## Browser APIs Used

**Web Audio API:**
- `AudioContext` - Global singleton via `src/lib/audio/audioContext.ts`
- `AudioBufferSourceNode` - Playback of decoded audio
- `GainNode` - Volume control and crossfading
- `decodeAudioData` - MP3/audio decoding

**MediaRecorder API:**
- `navigator.mediaDevices.getUserMedia` - Microphone access (`src/hooks/useMicrophone.ts`)
- `MediaRecorder` - Audio recording with MIME fallback chain
- Supported MIME types: `audio/webm;codecs=opus` > `audio/webm` > `audio/mp4` > `audio/wav`

**SpeechSynthesis API:**
- `window.speechSynthesis` - Browser TTS as ultimate fallback (`src/lib/audio/speechSynthesis.ts`)
- `SpeechSynthesisUtterance` - Per-segment utterance with pt-BR voice

**Other Browser APIs:**
- `localStorage` - Analytics mock storage, station heartbeat registry
- `crypto.randomUUID()` - Session ID generation
- `navigator.onLine` - Offline detection for fallback TTS
- `URL.createObjectURL / revokeObjectURL` - Audio blob handling

## Platform Requirements

**Development:**
- Node.js (version not pinned, requires support for Next.js 15)
- npm
- Modern browser with Web Audio API and MediaRecorder support

**Production:**
- Desktop browser (Chrome/Edge/Firefox recommended)
- Microphone access required
- Internet connection optional (fallback TTS with pre-recorded audio)

---

*Stack analysis: 2025-03-25*
