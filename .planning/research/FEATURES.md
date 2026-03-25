# Feature Research

**Domain:** Interactive Voice-First Art Installation
**Researched:** 2026-03-24
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = experience feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Clear audio feedback** | Users need confirmation the system heard them | LOW | Visual "listening" indicator + audible acknowledgment before response |
| **Graceful failure handling** | Voice recognition fails ~10-20% in real environments | MEDIUM | Cannot just error out — must have poetic/contextual fallback |
| **Predictable response timing** | Silence after speaking creates confusion | MEDIUM | Max 2-3s from speech end to system response start |
| **Ambient noise tolerance** | Museum/event spaces are never silent | MEDIUM | Voice activity detection (VAD) + noise gating to filter background |
| **Consistent voice identity** | Voice changing randomly breaks immersion | LOW | Same voice throughout, but parameters (speed/pitch) can vary by phase |
| **Session continuity** | Experience shouldn't reset mid-flow | LOW | State machine must be resilient to network hiccups |
| **Accessible volume control** | Physical spaces have varying acoustics | LOW | Operator-accessible volume controls per station |
| **Start/restart mechanism** | Users need clear entry point | LOW | Explicit start trigger (button/gesture), not auto-start |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable for this domain.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Intentional pauses as design** | Most systems minimize silence — treating it as content creates dramatic tension | MEDIUM | Requires precise timing control in TTS pipeline, 2-4s gaps between phrases |
| **Adaptive voice parameters** | Voice characteristics shift with narrative phases (Inferno vs Paradise) | MEDIUM | ElevenLabs stability/similarity sliders per phase, not just pitch shift |
| **NLU-based binary classification** | Understanding intent vs keyword matching creates natural conversation | HIGH | Claude Haiku classifies free-form PT-BR speech into binary choices |
| **Poetic fallback narrative** | Most systems say "I didn't understand" — staying in character preserves immersion | HIGH | Pre-scripted fallback that feels like Virgil admitting limits, not error message |
| **Layered ambient soundscape** | Background audio shifts with narrative phases, not just TTS over silence | MEDIUM | 3-5 ambient tracks per phase, crossfade on transitions (2-3s overlap) |
| **Timeout as narrative choice** | Silence becomes a valid answer, not just error state | MEDIUM | Different timeout defaults per phase (Inferno→Silence, Purgatory→contextual) |
| **Anonymous session analytics** | Track patterns without privacy violation | LOW | Session ID + timestamp + path taken, zero PII |
| **Literary reflection variants** | Personalized closing based on path, not generic ending | MEDIUM | 4 pre-written reflections mapped to decision tree outcomes |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems in voice-first installations.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Free-form conversation** | "Real AI would let you talk about anything" | Breaks narrative structure, requires safety guardrails, unpredictable duration | Guided experience with NLU classification of free-form input into structured choices |
| **Visual script display** | "Accessibility for hearing-impaired" | Visitors read ahead, breaks dramatic timing, becomes text experience not voice | Separate accessible mode if needed, not default — maintain voice-first design |
| **Voice interruption/barge-in** | "Let users interrupt the AI" | Narrative is carefully timed, interruption breaks flow, complex state management | Fixed script with clear response windows, visual "listening" indicator |
| **Dynamic content generation** | "AI should create unique responses per user" | Unpredictable quality, latency spikes, loses literary precision | Pre-scripted narrative with NLU-driven branching — quality controlled |
| **Multi-language support** | "Translate to English/Spanish" | TTS quality varies by language, NLU accuracy drops, doubles testing surface | PT-BR only for v1 — quality over breadth |
| **Mobile app native** | "Better than web" | Distribution complexity, install friction at event, platform fragmentation | PWA via browser — zero install, works on any device |
| **Offline-first architecture** | "What if internet fails?" | ElevenLabs/Whisper/Claude are cloud APIs, offline TTS quality is poor | Pre-cache monologues as fallback, accept internet dependency for interactive parts |
| **Real-time transcript display** | "Show what system heard" | Breaks immersion, visitors focus on text accuracy not experience | Visual listening indicator only, no text shown during experience |

## Feature Dependencies

```
[State Machine Flow Control]
    └──requires──> [Audio Playback System]
                       └──requires──> [TTS Generation]
    └──requires──> [Transition Timing Logic]
                       └──requires──> [Pause/Crossfade System]

[Voice Input Classification]
    └──requires──> [STT Transcription]
                       └──requires──> [Voice Activity Detection]
    └──requires──> [NLU Binary Classifier]
    └──requires──> [Timeout Handler]

[Ambient Audio System]
    └──requires──> [Multi-track Audio Mixer]
    └──requires──> [Crossfade Controller]
    └──enhances──> [State Machine Flow] (phase transitions trigger audio shifts)

[Fallback Handling]
    └──requires──> [NLU Confidence Scoring]
    └──requires──> [Pre-scripted Fallback Content]
    └──requires──> [Retry Counter] (max 1-2 retries before default choice)

[Session Analytics]
    └──requires──> [State Machine Events]
    └──requires──> [Anonymous Session ID]
    └──requires──> [Database Persistence]

[Multi-station Support]
    └──requires──> [Session Isolation] (state per station)
    └──requires──> [Admin Dashboard] (monitor all stations)
    └──conflicts──> [Shared State] (each session must be independent)
```

### Dependency Notes

- **State Machine requires Pause/Crossfade:** Intentional pauses are narrative beats, not just gaps — state machine must control timing precisely
- **NLU requires STT:** Cannot classify speech until transcribed, but transcription alone is insufficient (need intent classification)
- **Ambient Audio enhances State Machine:** Phase transitions drive audio crossfades, creating seamless narrative flow
- **Fallback requires Confidence Scoring:** Need to know when NLU is uncertain to trigger poetic fallback vs accepting classification
- **Multi-station conflicts with Shared State:** Each visitor's session must be isolated — no crosstalk between stations
- **Timeout Handler is critical path:** Cannot block indefinitely on user input — silence must resolve to default choice after 8-12s

## MVP Definition

### Launch With (v1 — May 2026)

Minimum viable product for Bienal event.

- [x] **State machine with full scripted flow** — 3 questions, 4 paths, 4 reflections mapped to decision tree
- [x] **TTS with variable voice parameters** — ElevenLabs streaming, stability/similarity settings per phase
- [x] **STT + NLU binary classification** — Whisper PT-BR transcription → Claude Haiku intent classification
- [x] **Ambient audio layering** — 3-5 tracks per phase, crossfade on transitions (2-3s overlap)
- [x] **Intentional pause system** — 2-4s gaps between phrases, controlled via state machine timing
- [x] **Poetic fallback handling** — Pre-scripted Virgil response when NLU confidence low, max 1 retry
- [x] **Timeout with default choice** — 8-12s silence → default path (Inferno→Silence, Purgatory→contextual)
- [x] **Minimal visual UI** — Start button, phase indicator, listening feedback, abstract animation
- [x] **Anonymous session analytics** — Session ID, timestamp, path taken, fallback count, duration
- [x] **Multi-station support** — 2-3 simultaneous isolated sessions
- [x] **Admin dashboard** — Real-time station status, session metrics, error monitoring

### Add After Validation (v1.x)

Features to add once core experience is validated at event.

- [ ] **Pre-cached monologue fallbacks** — Trigger: If API failures occur during event (>5% sessions impacted)
- [ ] **Voice adaptation based on ambient noise** — Trigger: Operators report difficulty hearing in noisy periods
- [ ] **A/B test different timeout durations** — Trigger: Analytics show >30% timeout rate (too short) or <5% (too long)
- [ ] **Enhanced admin controls** — Trigger: Operators request mid-session intervention (pause/restart/skip)
- [ ] **Session replay for debugging** — Trigger: Unexpected flow branches or classification errors in production

### Future Consideration (v2+)

Features to defer until post-event analysis.

- [ ] **Visitor return detection** — Why defer: Requires persistent identifier (privacy concern), unclear value for one-time event
- [ ] **Voice emotion analysis** — Why defer: Adds latency, unclear how to use emotionally in current script
- [ ] **Multi-language support** — Why defer: PT-BR quality critical for v1, translation doubles testing surface
- [ ] **Generative narrative variants** — Why defer: Literary quality must be controlled, unpredictable latency
- [ ] **Physical interaction sensors** — Why defer: Original water basin idea cut, no other physical triggers defined

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| State machine with full flow | HIGH | HIGH | P1 |
| TTS with variable parameters | HIGH | MEDIUM | P1 |
| STT + NLU classification | HIGH | HIGH | P1 |
| Poetic fallback handling | HIGH | MEDIUM | P1 |
| Timeout with default choice | HIGH | MEDIUM | P1 |
| Ambient audio layering | MEDIUM | MEDIUM | P1 |
| Intentional pause system | MEDIUM | LOW | P1 |
| Minimal visual UI | MEDIUM | LOW | P1 |
| Anonymous session analytics | MEDIUM | LOW | P1 |
| Multi-station support | HIGH | MEDIUM | P1 |
| Admin dashboard | MEDIUM | MEDIUM | P1 |
| Pre-cached fallbacks | LOW | MEDIUM | P2 |
| Voice adaptation to noise | LOW | HIGH | P2 |
| A/B timeout testing | LOW | LOW | P2 |
| Enhanced admin controls | MEDIUM | MEDIUM | P2 |
| Session replay debugging | LOW | MEDIUM | P2 |
| Visitor return detection | LOW | MEDIUM | P3 |
| Voice emotion analysis | LOW | HIGH | P3 |
| Multi-language support | MEDIUM | HIGH | P3 |
| Generative narrative variants | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (May 2026 Bienal)
- P2: Should have, add when possible (post-event iteration)
- P3: Nice to have, future consideration (v2+ if experience expands)

## Implementation Complexity Notes

### High Complexity Features

**State Machine with Full Flow (P1)**
- **Why complex:** 3 questions × binary choices = 4 distinct paths + Paradise question (no classification) + 4 reflection variants
- **Challenges:** Timeout handling per question, fallback retry logic, transition timing, ambient audio sync
- **Mitigation:** Use XState for visualization + testing, comprehensive state chart before coding

**STT + NLU Classification (P1)**
- **Why complex:** Real-time PT-BR transcription → intent classification → binary choice mapping
- **Challenges:** Whisper latency (~1-2s), Claude Haiku classification (~100-200ms), confidence thresholding, fallback triggers
- **Mitigation:** Pipeline optimization (parallel where possible), pre-tested confidence thresholds, comprehensive fallback coverage

**Voice Emotion Analysis (P3)**
- **Why complex:** Real-time emotion detection adds latency, requires additional API, unclear narrative integration
- **Challenges:** PT-BR emotion models less accurate, adds 200-500ms latency, how to adapt script dynamically
- **Mitigation:** Defer until v2+, focus on scripted excellence first

### Medium Complexity Features

**TTS with Variable Parameters (P1)**
- **Why medium:** ElevenLabs supports stability/similarity/style settings, need per-phase configuration
- **Challenges:** Finding right settings per phase (Inferno vs Paradise), streaming vs pre-generation tradeoff
- **Mitigation:** Pre-test voice settings, pre-generate monologues, stream only interactive responses

**Ambient Audio Layering (P1)**
- **Why medium:** 3-5 tracks per phase, crossfade on transitions, volume balancing with TTS
- **Challenges:** Web Audio API mixing, crossfade timing (2-3s overlap), ducking TTS vs ambient
- **Mitigation:** Use Howler.js or Tone.js for robust audio management, pre-test crossfade curves

**Poetic Fallback Handling (P1)**
- **Why medium:** Pre-scripted fallback must feel like Virgil character, not error message
- **Challenges:** Max 1 retry before default choice, maintaining immersion, timeout coordination
- **Mitigation:** Literary fallback script (already written), confidence threshold tuning, user testing

**Timeout with Default Choice (P1)**
- **Why medium:** Different timeout durations per question, different default choices per phase
- **Challenges:** Finding right timeout (8-12s typical), contextual defaults (Inferno→Silence, Purgatory varies)
- **Mitigation:** A/B test timeout durations in rehearsal, analytics to validate production settings

**Multi-station Support (P1)**
- **Why medium:** 2-3 simultaneous sessions, isolated state, shared admin dashboard
- **Challenges:** Session ID management, database concurrency, real-time dashboard updates
- **Mitigation:** Supabase handles concurrency, WebSocket for real-time, session ID in URL param

**Admin Dashboard (P1)**
- **Why medium:** Real-time station status, session metrics, error monitoring
- **Challenges:** Real-time updates without polling overhead, operator-friendly UX
- **Mitigation:** Supabase real-time subscriptions, simple table-based UI

### Low Complexity Features

**Intentional Pause System (P1)**
- **Why low:** State machine controls timing, TTS generation includes SSML pauses
- **Implementation:** XState delayed transitions (2-4s), ElevenLabs SSML `<break time="2s"/>` tags

**Minimal Visual UI (P1)**
- **Why low:** Start button, phase indicator, listening feedback, abstract animation
- **Implementation:** React components, Web Audio API visualizer, CSS animations

**Anonymous Session Analytics (P1)**
- **Why low:** Session ID + timestamp + path + metrics, zero PII
- **Implementation:** Supabase insert on state transitions, no user tracking

## Competitor Feature Analysis

| Feature | Museum Audio Guides | Voice Games (Alexa Skills) | Art Installations | Our Approach |
|---------|---------------------|----------------------------|-------------------|--------------|
| **Scripted Flow** | Linear narration, GPS-triggered | Branching dialogue trees, keyword choices | Fixed narrative or generative | Branching with NLU classification, fixed literary script |
| **Voice Input** | Rare (mostly playback) | Keywords or simple phrases | Often absent or generative chat | Free-form PT-BR → NLU binary classification |
| **Ambient Audio** | Music/SFX on narration tracks | Music loops, simple SFX | Spatial audio, multi-channel | Layered tracks per phase, crossfade on transitions |
| **Failure Handling** | N/A (no input) | "I didn't understand, try again" | System restarts or loops | Poetic fallback in character, max 1 retry |
| **Timeout** | N/A (no input) | 5-8s → prompt repeat or exit | Variable or none | 8-12s → contextual default choice |
| **Analytics** | Basic playback tracking | Utterance logs, intent metrics | Often none | Anonymous session path + metrics |
| **Multi-user** | One guide per device | One skill per device | Often single-user or shared space | 2-3 isolated sessions, admin dashboard |

**Key Differentiators:**
1. **NLU-based classification** — Voice games use keywords, we use intent understanding for natural PT-BR speech
2. **Poetic fallback** — Staying in character (Virgil) vs generic error messages
3. **Intentional pauses** — Designed silences vs minimizing dead air
4. **Layered ambient audio** — Narrative soundscape vs background music
5. **Timeout as choice** — Silence is valid answer vs error state

## Sources

**Research approach:**
- Analysis based on established patterns in voice-first interactive experiences (museum audio guides, voice-controlled games, conversational AI installations)
- Industry standards for voice UI design (VUI best practices, timeout handling, fallback strategies)
- Web Audio API capabilities for ambient audio layering and crossfading
- ElevenLabs TTS documentation for voice parameter control
- Whisper + NLU pipeline patterns for speech-to-intent classification

**Confidence: MEDIUM**
- HIGH confidence: Core voice UI patterns (timeout, fallback, VAD) are well-established
- MEDIUM confidence: Specific implementation details for art installation context (less documented than commercial voice apps)
- LOW confidence: PT-BR NLU accuracy expectations (language-specific performance data limited in training)

**Limitations:**
- WebSearch unavailable — relied on training data for voice UI patterns, museum installation practices, and conversational AI design
- No access to recent 2025-2026 art installation case studies
- ElevenLabs streaming API specifics may have evolved since training cutoff (Jan 2025)

---
*Feature research for: O Oráculo — Interactive Voice-First Art Installation*
*Researched: 2026-03-24*
*Confidence: MEDIUM (established patterns, limited recent case studies)*
