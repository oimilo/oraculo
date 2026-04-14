# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** Event-driven state machine architecture with React UI layer

**Key Characteristics:**
- XState v5 state machine is the single source of truth for the entire experience flow
- Service layer follows Interface + Factory + Implementation + Mock pattern
- Next.js API routes serve as thin proxies to external services (no business logic server-side)
- All experience logic is client-side; server only proxies API calls and protects secrets
- Pre-recorded audio provides complete offline fallback

## Layers

**State Machine Layer:**
- Purpose: Controls the entire experience flow -- all state transitions, timeouts, branching logic
- Location: `src/machines/`
- Contains: `oracleMachine.ts` (710 lines), `oracleMachine.types.ts`, `guards/patternMatching.ts`
- Depends on: Nothing (pure logic, no side effects)
- Used by: `OracleExperience.tsx` via `useMachine()` hook

**Service Layer:**
- Purpose: Abstracts external service communication behind interfaces
- Location: `src/services/`
- Contains: TTS, STT, NLU, Analytics, Audio (ambient), Station (heartbeat)
- Depends on: API routes (via fetch), Web Audio API
- Used by: Hooks layer

**Hook Layer:**
- Purpose: Bridges services and React lifecycle, manages side effects
- Location: `src/hooks/`
- Contains: `useTTSOrchestrator`, `useVoiceChoice`, `useMicrophone`, `useAmbientAudio`, `useSessionAnalytics`
- Depends on: Service layer, React lifecycle
- Used by: Component layer

**Component Layer:**
- Purpose: Visual UI with minimal logic
- Location: `src/components/`
- Contains: Experience components, audio visualizers, debug panel
- Depends on: Hook layer, types
- Used by: Page (single entry point)

**API Layer:**
- Purpose: Server-side proxy to external services, protects API keys
- Location: `src/app/api/`
- Contains: `/api/tts`, `/api/stt`, `/api/nlu` route handlers
- Depends on: External APIs (ElevenLabs, OpenAI, Anthropic)
- Used by: Service layer (client-side fetch)

**Data Layer:**
- Purpose: Script content and type definitions
- Location: `src/data/`, `src/types/`
- Contains: Full Portuguese narrative script (523 lines), type system, question metadata
- Depends on: Nothing
- Used by: All layers

## State Machine Design (v4)

**Structure:** ~54 states across hierarchical + flat topology

```
IDLE -> APRESENTACAO -> INFERNO -> PURGATORIO -> PARAISO -> DEVOLUCAO -> DEVOLUCAO_* -> ENCERRAMENTO -> FIM -> IDLE
```

**Hierarchical states (compound):**
- `INFERNO`: INTRO -> Q1 (SETUP/PERGUNTA/AGUARDANDO/TIMEOUT/RESPOSTA_A/RESPOSTA_B) -> Q2 -> [Q2B conditional] -> exit
- `PURGATORIO`: INTRO -> Q3 -> Q4 -> [Q4B conditional] -> exit
- `PARAISO`: INTRO -> Q5 -> Q6 -> exit

**Flat states (top-level):**
- `IDLE`, `APRESENTACAO`, `ENCERRAMENTO`, `FIM`
- `DEVOLUCAO` (transient routing node)
- 8x `DEVOLUCAO_*` archetype states

**Branching:**
- Q2B triggers when `Q1=A AND Q2=A` (shouldBranchQ2B guard)
- Q4B triggers when `Q3=A AND Q4=A` (shouldBranchQ4B guard)
- Results in 6-8 decision points per session

**Each question follows:**
```
SETUP -> PERGUNTA -> AGUARDANDO (25s timeout) -> TIMEOUT or RESPOSTA_A/RESPOSTA_B
```

**Events:**
- `START` - Begin experience
- `NARRATIVA_DONE` - TTS playback complete, advance state
- `CHOICE_A` / `CHOICE_B` - Visitor choice (voice or button)
- `TIMEOUT` - 25s silence in AGUARDANDO
- `FALLBACK_USED` - Increments fallback counter

**Context (v4):**
```typescript
{
  sessionId: string;
  choices: ChoicePattern;           // Variable-length array (6-8)
  choiceMap: Partial<Record<QuestionId, ChoiceAB>>; // Named lookup
  fallbackCount: number;
  currentPhase: NarrativePhase;     // APRESENTACAO | INFERNO | PURGATORIO | PARAISO | DEVOLUCAO | ENCERRAMENTO
}
```

**Devolucao routing:** Uses `always` transitions with ordered guards:
1. isMirror (alternating pattern)
2. isDepthSeeker (100% A)
3. isSurfaceKeeper (100% B)
4. isPivotEarly (B-heavy start, A-heavy end)
5. isPivotLate (A-heavy start, B-heavy end)
6. isSeeker (66%+ A)
7. isGuardian (66%+ B)
8. isContradicted (default fallthrough)

## Data Flow

**Main Experience Flow:**

1. User clicks Start -> `OracleExperience` sends `START` event to machine
2. Machine transitions to `APRESENTACAO`
3. Effect A detects state change -> maps state to script key -> calls `tts.speak(SCRIPT[key])`
4. TTS plays audio (ElevenLabs or pre-recorded MP3) -> sets `ttsComplete=true`
5. Effect B detects `ttsComplete` -> waits breathing delay (0-2500ms) -> sends `NARRATIVA_DONE`
6. Machine advances to next state -> cycle repeats

**Voice Choice Flow (AGUARDANDO states):**

1. Machine enters `Qn_AGUARDANDO` state
2. `isAguardando=true` + `ttsComplete=true` -> `micShouldActivate=true`
3. `useVoiceChoice` activates -> starts `useMicrophone` recording (4s)
4. Recording auto-stops -> blob dispatched as `AUDIO_READY`
5. Lifecycle transitions to `processing` -> STT transcription via `/api/stt`
6. If transcript empty -> NEED_FALLBACK (re-ask question)
7. If transcript present -> NLU classification via `/api/nlu` (keyword match first, then Claude)
8. If confidence >= 0.7 -> dispatch `CHOICE_A` or `CHOICE_B` to machine
9. If confidence < 0.7 and attempts < 2 -> NEED_FALLBACK
10. If max attempts reached -> use default choice

**State Management:**
- XState machine context is the single source of truth
- React state in `OracleExperience` tracks: `micPermissionGranted`, `experienceStarted`, `ttsComplete`
- `ttsForStateRef` prevents stale ttsComplete from previous state causing premature advance
- `speakGeneration` in FallbackTTS prevents stale onended callbacks

## Key Abstractions

**TTSService Interface:**
- Purpose: Abstract TTS playback (real API vs pre-recorded vs browser SpeechSynthesis)
- Implementations: `ElevenLabsTTSService`, `FallbackTTSService`, `MockTTSService`
- Pattern: `speak(segments, voiceSettings, scriptKey?) -> Promise<void>`, `cancel() -> void`
- Files: `src/services/tts/index.ts`, `src/services/tts/elevenlabs.ts`, `src/services/tts/fallback.ts`, `src/services/tts/mock.ts`

**NLUService Interface:**
- Purpose: Classify voice transcript as choice A or B
- Implementations: `ClaudeNLUService`, `MockNLUService`
- Pattern: `classify(transcript, questionContext, options, keywords?) -> Promise<ClassificationResult>`
- Files: `src/services/nlu/index.ts`, `src/services/nlu/claude.ts`, `src/services/nlu/mock.ts`

**STTService Interface:**
- Purpose: Transcribe audio blob to text
- Implementations: `WhisperSTTService`, `MockSTTService`
- Pattern: `transcribe(audioBlob) -> Promise<string>`
- Files: `src/services/stt/index.ts`, `src/services/stt/whisper.ts`, `src/services/stt/mock.ts`

**VoiceLifecycle (useVoiceChoice):**
- Purpose: Explicit finite state machine for voice capture pipeline
- States: `idle -> listening -> processing -> decided` (or `-> fallback -> listening`)
- File: `src/hooks/useVoiceChoice.ts`

**ScriptDataV4:**
- Purpose: Typed narrative content with all keys matching machine states
- Contains: 61 entries (APRESENTACAO, INTROs, SETUPs, PERGUNTAs, RESPOSTAs, DEVOLUCAOs, FALLBACKs, TIMEOUTs, ENCERRAMENTO)
- File: `src/data/script.ts`

## Entry Points

**Main page (`src/app/page.tsx`):**
- Renders `<OracleExperience />` in a black full-screen container
- Single page application

**OracleExperience (`src/components/experience/OracleExperience.tsx`):**
- The orchestrator component (570 lines)
- Wires: state machine + TTS + voice choice + ambient audio + analytics + UI
- Contains Effect A (TTS playback), Effect B (NARRATIVA_DONE dispatch), fallback handler, choice handler

**Admin dashboard (`src/app/admin/page.tsx`):**
- Station monitoring dashboard
- Components: `StationCard`, `SessionMetrics`, `PathDistribution`

## Error Handling

**Strategy:** Graceful degradation with multiple fallback layers

**TTS errors:**
- ElevenLabs fails -> FallbackTTSService (pre-recorded MP3s)
- MP3 fetch fails -> Browser SpeechSynthesis
- SpeechSynthesis unavailable -> Simulate delay (headless/server)

**STT errors:**
- Whisper timeout (10s) -> Return 504
- Empty audio -> Return empty transcript (no API call)
- Hallucination detected -> Return empty transcript

**NLU errors:**
- Direct match catches most cases (no API call needed)
- Keyword match as intermediate layer
- Claude timeout (10s) -> Return 504
- JSON parse failure -> Text-based extraction fallback
- Low confidence -> Fallback prompt (re-ask question)
- Max attempts (2) -> Use default choice

**Voice pipeline errors:**
- Mic permission denied -> Error message in PermissionScreen
- Recording failure -> Error state, fallback to buttons
- Empty transcript -> Fallback prompt
- Max retries exhausted -> Default choice

## Cross-Cutting Concerns

**Logging:** Custom `createLogger(namespace)` with elapsed-time prefix. Dev-only `DebugPanel` component.

**Validation:** `requireEnv()` helper in `src/lib/api/validateEnv.ts` for server-side env vars. Client-side validation minimal.

**Audio Context:** Singleton AudioContext in `src/lib/audio/audioContext.ts`. Must be initialized on user gesture (click). Shared between TTS and ambient audio via separate GainNode paths.

**Phase Colors:** `PHASE_COLORS` in `src/types/index.ts` maps phases to hex colors for `PhaseBackground` component.

**Breathing Delays:** Configurable pauses (0-2500ms) between TTS completion and state advance, defined in `getBreathingDelay()` in `OracleExperience.tsx`.

**Inactivity Timeouts:** 300s (5 min) timeout on every major state -> resets to IDLE. 25s timeout on every AGUARDANDO -> default choice. 5s on FIM -> reset to IDLE.

---

*Architecture analysis: 2026-03-29*
