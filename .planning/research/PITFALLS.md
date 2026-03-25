# Pitfalls Research

**Domain:** Live Voice-Interactive Installation
**Researched:** 2026-03-24
**Confidence:** MEDIUM (based on browser API specifications, TTS/STT system behavior patterns, and live event failure modes from training data through Jan 2025)

## Critical Pitfalls

### Pitfall 1: Browser Autoplay Policy Blocking TTS on First Interaction

**What goes wrong:**
Visitor presses "start" button, state machine advances, but no audio plays. The experience appears broken. TTS audio is silently blocked by browser autoplay policy because user interaction didn't directly trigger audio playback — it triggered an async TTS API call that *later* tried to play audio.

**Why it happens:**
Browsers require user interaction to be directly synchronous with audio playback. Async chain breaks the gesture: Click → API call → Response arrives → Play audio = BLOCKED. The browser considers the play() attempt to be "not user-initiated" because too much time elapsed between the click and the play.

**How to avoid:**
1. **Workaround pattern:** Create AudioContext on user click, play silent audio immediately to "unlock" audio capabilities
2. **Implementation:**
```javascript
// On first user click
const audioContext = new AudioContext();
const silentBuffer = audioContext.createBuffer(1, 1, 22050);
const source = audioContext.createBufferSource();
source.buffer = silentBuffer;
source.connect(audioContext.destination);
source.start(); // This unlocks audio playback

// Now subsequent TTS playback will work
```
3. **Test across browsers:** Chrome, Edge, Firefox have different autoplay policies
4. **Fallback UI:** Show "Click to enable audio" button if AudioContext.state === 'suspended'

**Warning signs:**
- TTS works in dev (localhost exempt from autoplay policy) but fails in production
- First TTS utterance silent, subsequent ones work
- console.error: "play() failed because the user didn't interact with the document first"

**Phase to address:**
Phase 1 (Core State Machine) — Audio system initialization must be bulletproof before building conversation flow

---

### Pitfall 2: Microphone Permission Prompt Breaks Immersion

**What goes wrong:**
Visitor clicks start, immediately sees browser permission dialog asking to allow microphone access. Many visitors:
- Dismiss the dialog (experience ends immediately)
- Are confused about why a "psychoanalysis experience" needs their microphone
- Take 10-15 seconds to read and approve, breaking the dramatic entrance
- On denial, webapp has no second chance — must refresh page to retry

**Why it happens:**
`navigator.mediaDevices.getUserMedia()` triggers native browser permission dialog. No way to style it, delay it, or provide context first. Once denied, permission persists until manually reset in browser settings.

**How to avoid:**
1. **Pre-permission screen:** Before "Start" button, show screen explaining "This experience uses your voice. Please allow microphone access when prompted."
2. **Permission request flow:**
```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Success path
} catch (err) {
  if (err.name === 'NotAllowedError') {
    // Show recovery UI: "Microphone access denied. Refresh page and click Allow."
  }
  if (err.name === 'NotFoundError') {
    // Show error: "No microphone detected. Check headphones are connected."
  }
}
```
3. **Test permission state before starting:**
```javascript
const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
if (permissionStatus.state === 'denied') {
  // Show "blocked" state UI before visitor clicks start
}
```
4. **Operator checklist:** Before event, manually test each station to grant permissions once (persists across sessions)

**Warning signs:**
- High bounce rate (visitors leave without completing)
- Operators report "people keep clicking and nothing happens"
- Multiple refresh attempts per station

**Phase to address:**
Phase 1 (Core State Machine) — Microphone initialization is first-run critical path

---

### Pitfall 3: Network Latency Destroying Conversational Flow

**What goes wrong:**
Visitor speaks response. 3-5 seconds of silence. Then TTS responds. The rhythm feels broken and robotic. At 10+ seconds (poor venue WiFi), visitors assume it's broken and walk away.

**Why it happens:**
Sequential API calls create cumulative latency:
1. STT (Whisper): 800-2000ms depending on audio length
2. NLU (Claude Haiku): 200-800ms for classification
3. TTS (ElevenLabs): 400-1200ms for first chunk

Total: 1.4-4 seconds minimum, often 5-8 seconds on slow connections.

**How to avoid:**
1. **Stream TTS immediately:** Use ElevenLabs streaming endpoint, start playback on first chunk (saves 1-2 seconds perceived latency)
2. **Parallel where possible:** Start preparing TTS request while waiting for NLU response
3. **Optimistic classification:** For binary choices, prepare BOTH response audios in advance, play the correct one immediately after classification
4. **Visual feedback:** Show "listening" → "thinking" → "responding" states so silence feels intentional
5. **Timeout strategy:**
   - If STT > 3s, show "having trouble hearing" visual feedback
   - If total latency > 8s, trigger fallback response ("The connection to the oracle wavers...")
6. **Pre-generate fallback audio:** Timeout responses should be pre-recorded MP3s (no API dependency)

**Warning signs:**
- Testers report "feels sluggish" or "not responsive"
- Event WiFi speed test shows >200ms latency or <5Mbps bandwidth
- ElevenLabs API monitoring shows p95 latency >1.5s

**Phase to address:**
Phase 2 (Voice Integration) — Latency optimization is core to voice UX quality

---

### Pitfall 4: ElevenLabs Rate Limiting During Event Peak Hours

**What goes wrong:**
Event opening (10am), lunchtime (1pm), or popular session end times create usage spikes. All 3 stations simultaneously serving 3 visitors. ElevenLabs returns 429 (rate limit exceeded). TTS fails. Visitors see error state or stuck loading.

**Why it happens:**
ElevenLabs free tier: 10k chars/month. Paid starter tier: often 30k chars/month with rate limit of ~X requests/second. Your script has ~2000 characters per complete journey × 300 visitors = 600k characters needed. With 3 concurrent stations, you can hit per-second rate limits even on paid tier.

**How to avoid:**
1. **Verify tier limits BEFORE event:**
   - Contact ElevenLabs support to confirm concurrent request limits
   - Load test with 3 simultaneous requests to measure actual throttling
   - Upgrade to tier with guaranteed concurrency for your scale
2. **Implement request queue:**
```javascript
// Limit concurrent TTS requests across all stations
const ttsQueue = new PQueue({ concurrency: 2, interval: 1000, intervalCap: 2 });

async function requestTTS(text) {
  return ttsQueue.add(() => elevenLabsAPI.textToSpeech(text));
}
```
3. **Pre-generate common audio:**
   - Opening monologue (same for everyone) → pre-recorded MP3
   - Fallback responses → pre-recorded MP3
   - Question prompts → pre-recorded MP3
   - Only generate personalized responses via API
4. **Fallback strategy:**
   - If TTS fails, play pre-recorded generic version
   - Log failure for operator dashboard
   - Continue journey rather than error out
5. **Cost estimation:**
   - 600k characters at $0.30/1k chars = $180 for event
   - Budget $50/day for dev testing + buffer

**Warning signs:**
- 429 errors in API logs during testing
- ElevenLabs dashboard shows "approaching quota"
- Response times spike during concurrent testing

**Phase to address:**
Phase 2 (Voice Integration) for implementation, Phase 3 (Polish & Resilience) for failover testing

---

### Pitfall 5: Whisper Transcription Accuracy Failure on Short/Whispered PT-BR Utterances

**What goes wrong:**
Visitor whispers "sim" (yes). Whisper transcribes as "si" or "são" or empty string. Claude Haiku receives gibberish, classification fails. System triggers fallback response. After 2 fallback responses, visitor assumes system is broken and leaves.

**Why it happens:**
- Short utterances (<0.5s) have insufficient audio context for accurate transcription
- Whispered speech lacks acoustic energy in key frequency bands
- PT-BR has phonetic ambiguity in short words ("sim" vs. "sem" vs. "cem")
- Background noise at event venue (200-500 people, ambient music) masks quiet speech
- Headphone mic quality varies — cheap mics have poor low-frequency response

**How to avoid:**
1. **Prompt design workaround:** Don't ask yes/no questions. Ask for elaborated responses.
   - BAD: "Você aceita seguir?"
   - GOOD: "O que você escolhe: luz ou escuridão?"
   - (Forces multi-word response with more phonetic content)
2. **Whisper optimization:**
   - Use `language: 'pt'` parameter explicitly
   - Use `prompt` parameter with expected vocabulary: "sim, não, luz, escuridão, medo, coragem"
   - Set `temperature: 0` for deterministic output
3. **Audio preprocessing:**
   - Apply noise reduction filter before sending to Whisper
   - Normalize audio volume (boost quiet recordings)
   - Require minimum 1-second recording before sending to STT
4. **NLU resilience:**
   - Claude Haiku prompt includes phonetic alternatives: "Classify even if transcription is partial: 'si', 'sim', 's' → YES"
   - Semantic classification vs. keyword matching: "Words related to acceptance, light, courage → Option A"
5. **Microphone quality control:**
   - Test headphones BEFORE event with actual Whisper API
   - Reject headphones where "sim" transcribes incorrectly >20% of test attempts
   - Budget for good quality wired headsets with boom mics (not earbuds)
6. **Operator intervention:**
   - Admin dashboard shows transcription quality per station
   - If transcription confidence <0.7, operator can manually advance state machine

**Warning signs:**
- Testing reveals transcription accuracy <80% for target phrases
- Fallback responses triggered >30% of the time
- Operators report "people have to repeat themselves"

**Phase to address:**
Phase 2 (Voice Integration) for Whisper setup, Phase 3 (Polish & Resilience) for preprocessing and fallback refinement

---

### Pitfall 6: State Machine Race Conditions from Double-Click or Rapid Speech

**What goes wrong:**
Visitor double-clicks "Start" button. Two sessions initialize simultaneously. State machine receives overlapping transitions. Audio plays twice (overlapping/cacophony). Analytics records duplicate session. Or: Visitor speaks response while previous TTS is still playing. System captures TTS output as visitor speech, sends it to Whisper, creates feedback loop.

**Why it happens:**
- UI doesn't disable button during async initialization
- No mutex/lock preventing concurrent state transitions
- Microphone remains active during TTS playback (echo cancellation not perfect)
- Event handlers don't check "already in progress" flag

**How to avoid:**
1. **Button state management:**
```javascript
const [isInitializing, setIsInitializing] = useState(false);

async function handleStart() {
  if (isInitializing) return; // Guard clause
  setIsInitializing(true);

  try {
    await initializeSession();
  } finally {
    setIsInitializing(false);
  }
}
```
2. **XState guards:**
```javascript
guards: {
  canTransition: (context) => {
    return !context.isTransitioning && !context.isSpeaking;
  }
}
```
3. **Microphone muting during TTS:**
```javascript
function playTTS(audio) {
  stopMicrophone(); // Mute mic before playing
  audio.onended = () => {
    startMicrophone(); // Re-enable after playback complete
  };
}
```
4. **Session ID locking:**
   - Generate unique session ID on first user click
   - All API calls tagged with session ID
   - Analytics rejects duplicate session IDs within 1-hour window
5. **Debouncing user input:**
   - Ignore speech input during first 500ms after enabling microphone (prevents TTS tail capture)
   - Require minimum audio energy threshold before considering "speech detected"

**Warning signs:**
- Duplicate entries in analytics dashboard
- Operators report "sometimes audio plays twice"
- Testing reveals clicking "Start" rapidly creates chaos
- Echo/feedback in recordings

**Phase to address:**
Phase 1 (Core State Machine) for transition guards, Phase 3 (Polish & Resilience) for edge case testing

---

### Pitfall 7: Browser Tab Backgrounding Throttles Timers and Audio

**What goes wrong:**
Operator switches browser tab to check admin dashboard. Visitor is mid-journey. When operator returns to visitor tab, audio is choppy/stuttering, or timeouts fired all at once, or state machine is stuck. Journey breaks.

**Why it happens:**
Browsers throttle background tabs:
- `setTimeout`/`setInterval` minimum interval increases to 1000ms
- `requestAnimationFrame` stops entirely
- Audio playback may pause or glitch
- Web Audio API nodes may disconnect

**How to avoid:**
1. **Page Visibility API monitoring:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause journey, show "Tab backgrounded, please return" on screen
    pauseSession();
  } else {
    // Resume from paused state (don't skip ahead)
    resumeSession();
  }
});
```
2. **Dedicated station tabs:**
   - Each station = one dedicated browser window (not tab)
   - Operator dashboard = separate device or window
   - Train operators: never switch away from visitor window
3. **Web Audio API vs. HTML5 Audio:**
   - Web Audio API more resilient to backgrounding
   - Use `AudioContext.resume()` on visibility return
4. **Fullscreen mode:**
   - Launch webapp in fullscreen (F11) to prevent accidental tab switching
   - Operator training: "Do not press Alt+Tab or click other windows"

**Warning signs:**
- Testers report "sometimes the experience freezes"
- Audio glitches when window loses focus
- Timeouts fire incorrectly after returning to tab

**Phase to address:**
Phase 3 (Polish & Resilience) — Testing with realistic operator workflow patterns

---

### Pitfall 8: Internet Connection Drop Mid-Journey with No Recovery Path

**What goes wrong:**
Venue WiFi drops connection (common at conferences with 200-500 attendees on shared network). Visitor is mid-journey. Next TTS request fails. System shows error or infinite loading. Visitor stuck. Operator must manually refresh page, losing entire session progress.

**Why it happens:**
- No offline fallback for TTS audio
- No retry logic for API failures
- State machine assumes APIs always succeed
- No UX for "connection lost, attempting reconnection"

**How to avoid:**
1. **Offline-first critical path:**
   - Pre-record all non-personalized audio (opening, questions, fallbacks) as MP3 files
   - Store in `/public/audio/` directory (served statically, no API dependency)
   - Only dynamic responses require API
2. **Graceful degradation:**
```javascript
async function getTTS(text, fallbackAudioPath) {
  try {
    return await elevenLabsAPI.textToSpeech(text);
  } catch (error) {
    console.error('TTS failed, using fallback audio', error);
    return fallbackAudioPath; // Play pre-recorded generic version
  }
}
```
3. **Connection monitoring:**
```javascript
window.addEventListener('online', () => {
  // Connection restored, retry failed requests
});

window.addEventListener('offline', () => {
  // Switch to degraded mode, show "connection lost" indicator
});
```
4. **Retry logic with exponential backoff:**
```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```
5. **State machine persistence:**
   - Save current state to localStorage every transition
   - On page reload, offer "Resume journey" vs. "Start over"
6. **Physical backup plan:**
   - Mobile hotspot (4G/5G) as WiFi backup
   - Test failover before event: disconnect WiFi, verify hotspot seamlessly takes over

**Warning signs:**
- Venue WiFi speed test shows packet loss >5%
- Event organizers report "WiFi was unreliable at last year's event"
- Testing API calls from venue (pre-event) shows intermittent failures

**Phase to address:**
Phase 3 (Polish & Resilience) — Failover strategy must be tested under realistic network conditions

---

### Pitfall 9: Audio Context Suspension on Mobile (if any mobile testing planned)

**What goes wrong:**
If testing on tablet/mobile devices, AudioContext automatically suspends to save battery. Audio doesn't play despite no errors. Calling `play()` silently fails.

**Why it happens:**
Mobile browsers aggressively suspend AudioContext when page is inactive or user hasn't interacted recently.

**How to avoid:**
1. **Resume AudioContext before playback:**
```javascript
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```
2. **Check context state in state machine guards:**
```javascript
guards: {
  canPlayAudio: () => audioContext.state === 'running'
}
```
3. **Note:** Since project specifies laptops + Chrome/Edge, this is lower priority but worth awareness for testing

**Warning signs:**
- Works on desktop, silent on mobile
- AudioContext.state shows 'suspended' in console

**Phase to address:**
Phase 1 (Core State Machine) if mobile testing is in scope, otherwise defer

---

### Pitfall 10: LGPD Violation Through Unintended Audio Persistence

**What goes wrong:**
Browser cache stores audio blobs. DevTools Network tab shows recorded audio available for playback. Audio lingers in memory after session end. Analytics accidentally logs transcription text. LGPD compliance violated.

**Why it happens:**
- Blob URLs created from MediaRecorder aren't explicitly revoked
- Audio data stored in React state persists beyond session
- Supabase analytics logs include `transcription` field when should only log `classification_result`
- Browser memory not cleared between visitors

**How to avoid:**
1. **Explicit audio cleanup:**
```javascript
function cleanupSession() {
  // Revoke all blob URLs
  if (audioBlobUrl) {
    URL.revokeObjectURL(audioBlobUrl);
  }

  // Clear audio from state
  setAudioBlob(null);
  setTranscription(null);

  // Stop all media tracks
  mediaStream.getTracks().forEach(track => track.stop());
}
```
2. **Analytics schema enforcement:**
```sql
-- Supabase table should NOT have transcription column
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  path_chosen TEXT, -- "inferno", "purgatorio", etc.
  fallback_count INTEGER,
  completion_status TEXT,
  -- NO transcription, NO audio_url
);
```
3. **Memory-only processing:**
   - Audio blob → Whisper API → Classification → Discard blob immediately
   - Never write audio to disk, IndexedDB, or localStorage
   - Never send audio to analytics
4. **Session boundary enforcement:**
   - On session end, call `cleanupSession()`
   - On new session start, verify state is clean
5. **Operator training:**
   - "Never open DevTools on station laptops during event"
   - "Do not screenshot or record visitor sessions"

**Warning signs:**
- Code review finds `localStorage.setItem('audio', ...)`
- Analytics database contains transcription text
- DevTools shows audio blobs persisting after session end

**Phase to address:**
Phase 1 (Core State Machine) for architecture, Phase 3 (Polish & Resilience) for audit/verification

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using HTML5 `<audio>` tag instead of Web Audio API | Simpler code, faster implementation | Less control over playback, harder to implement crossfade, worse reliability with autoplay policies | Never — Web Audio API is necessary for professional audio experience |
| Storing TTS responses in Supabase for reuse | Reduces API costs, faster playback for repeated phrases | Storage costs, LGPD risk if visitor-specific, cache invalidation complexity | Only for static content (questions, fallbacks) with careful LGPD review |
| Skipping retry logic for API calls | Faster development | Event failure from transient network issues | Never — retry logic is critical for live event resilience |
| Using keyword matching instead of NLU | Cheaper (no Claude API calls), faster (~50ms vs 500ms) | Brittle, fails on synonyms/typos, poor UX when visitor uses unexpected phrasing | Acceptable for MVP testing, must upgrade to NLU before production |
| Hardcoding audio file paths instead of CMS | Faster development, no database dependency | Requires code deploy to update content, operators can't fix issues day-of | Acceptable for v1.0 (content is fixed), problematic if roteiro evolves during event |
| Skipping session resumption on page refresh | Simpler state management | Visitor must restart journey if browser crashes or operator refreshes | Acceptable if sessions are <10min and browser crashes are rare |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ElevenLabs TTS | Sending entire paragraph at once (2000+ chars) | Chunk into sentences, stream responses, start playback on first chunk |
| Whisper STT | Sending raw MediaRecorder blob (might be webm/unsupported format) | Convert to WAV or MP3, verify format compatibility, send with correct MIME type |
| Claude Haiku NLU | Generic prompt "classify this: {transcription}" | Structured prompt with examples, expected categories, fallback handling: "Classify as A or B. Transcription may be imperfect due to STT errors. A = words related to light, courage, acceptance. B = words related to darkness, fear, denial. Respond JSON: {choice: 'A' or 'B', confidence: 0-1}" |
| Supabase Analytics | Sending analytics after user action (loses data on crash) | Send analytics before state transition, use upsert pattern, include session_id for deduplication |
| MediaRecorder API | Starting recording without checking `state` property | Always check `mediaRecorder.state !== 'recording'` before calling `start()` |
| AudioContext | Creating new AudioContext for each playback | Create once globally, reuse throughout session, check `state` before use |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Creating new AudioContext for each TTS playback | Memory leak, audio glitches after 10+ utterances | Singleton pattern, create once on app init | After 10-15 playback cycles |
| Not cleaning up MediaStream tracks | Microphone LED stays on, memory grows, browser slows | Call `track.stop()` on all tracks when session ends | After 3-5 sessions without cleanup |
| Loading all pre-recorded audio files on page load | Slow initial load, wasted bandwidth if visitor doesn't complete | Lazy load audio, prefetch only next expected state's audio | When total audio >10MB |
| Sending full audio blob to analytics | Supabase storage costs explode, slow inserts, LGPD violation | Never send audio to analytics, only metadata (duration, classification result) | Immediately (LGPD violation + cost) |
| Polling for session status every 100ms | CPU spike, battery drain, unnecessary network requests | Use WebSocket for real-time updates or poll at 5s intervals | With 3 concurrent stations + operator dashboard = ~50 req/s |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API keys in client-side code | ElevenLabs/Claude API keys stolen, abused, unlimited charges to your account | All API calls through Next.js API routes, keys in server-side env vars only |
| No rate limiting on session creation endpoint | Malicious user creates thousands of sessions, drains API quota | Implement rate limiting (max 10 sessions per IP per hour) using middleware |
| Storing audio in publicly-accessible Supabase bucket | Audio URLs guessable, LGPD violation if visitor audio accessible | Never store visitor audio; if storing pre-recorded audio, use private bucket with signed URLs |
| CORS misconfiguration allowing any origin | Third-party sites can call your API endpoints, waste quota | Whitelist only your domain in CORS policy |
| No HTTPS enforcement | Man-in-the-middle attacks, microphone permission blocked by browsers on HTTP | Enforce HTTPS via Vercel config, test locally with `localhost` (exempt from HTTPS requirement) |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback during 3-8s API latency | Visitor assumes it's broken, clicks away | Show animated "listening" → "thinking" → "responding" states with progress indication |
| Fallback response repeats the same error message | After 2nd identical fallback, visitor knows it's broken and leaves | Have 3 variations of fallback responses, escalating in poeticness, 3rd one gracefully ends session |
| No indication of how far into journey | Visitor doesn't know if 2min or 8min remaining, anxiety builds | Subtle visual progress indicator (e.g., 3 circles representing Inferno/Purgatorio/Paraíso, current one highlighted) |
| Error messages in English | Breaks immersion for Portuguese-speaking audience | All error states in Portuguese, poetic/in-character (e.g., "O véu entre mundos se desfaz..." instead of "Connection error") |
| Abrupt session end after final question | Anti-climactic, visitor confused if experience is over | Clear closing sequence: final TTS → 3s pause → fade to black → "Sua jornada se completa" → reset screen |
| No way to restart if visitor wants to try different path | Visitor must ask operator for help | After completion, show "Recomeçar jornada" button with 10s delay (prevents accidental clicks) |

## "Looks Done But Isn't" Checklist

- [ ] **Audio playback:** Tested autoplay policy unlock in production (not just localhost)
- [ ] **Microphone permissions:** Tested permission denial flow, recovery UX works
- [ ] **Network resilience:** Disconnected WiFi during session, verified fallback audio plays
- [ ] **Rate limiting:** Sent 10 concurrent TTS requests, verified no 429 errors or graceful handling
- [ ] **LGPD compliance:** Audited all code paths, confirmed audio never persists beyond session
- [ ] **Cross-browser testing:** Tested on Chrome, Edge, Firefox on Windows (event laptop OS)
- [ ] **State machine edge cases:** Tested double-click start, rapid speech during TTS, browser back button
- [ ] **Analytics accuracy:** Verified session counts match expectations, no duplicates, no PII leaked
- [ ] **Operator workflow:** Tested admin dashboard + visitor station simultaneously, verified no interference
- [ ] **Audio quality:** Tested with actual event headphones (not developer's high-end headset)
- [ ] **Venue simulation:** Tested with background noise (play crowd ambience during testing)
- [ ] **Multi-station isolation:** Ran 3 stations simultaneously, verified no shared state or interference
- [ ] **Timeout handling:** Waited 30s without speaking, verified graceful timeout behavior
- [ ] **Error states:** Manually triggered every error condition, verified UI shows something sensible (not white screen or console errors only)
- [ ] **Session cleanup:** Completed 5 sessions back-to-back, verified no memory leaks (check DevTools Memory tab)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Autoplay policy blocking audio | LOW | Operator instructs visitor to click anywhere on page, audio unlocks, continue session |
| Microphone permission denied | MEDIUM | Operator refreshes page, instructs visitor to click "Allow" when prompted, restart session |
| Network connection lost mid-session | LOW | System automatically plays fallback audio, session continues in degraded mode (generic responses instead of personalized) |
| TTS API rate limit hit | MEDIUM | Switch to pre-recorded audio for all stations, continue with reduced personalization |
| STT consistently mis-transcribing | HIGH | Operator switches to manual mode: listens to visitor, clicks classification button on admin panel (requires admin UI feature) |
| State machine stuck/crashed | HIGH | Operator refreshes page, session lost, visitor restarts (under 10min so acceptable loss) |
| Browser completely frozen | MEDIUM | Force quit browser, relaunch, visitor restarts journey, usually under 30s downtime |
| All 3 stations experiencing issues | CRITICAL | Operator announces "technical difficulty, 5-minute pause", checks internet connection, restarts stations, worst case: mobile hotspot failover |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Autoplay policy blocking | Phase 1: Core State Machine | Test production build on remote device (not localhost), first TTS plays successfully |
| Microphone permission issues | Phase 1: Core State Machine | Test permission denial flow, recovery UX works without page refresh |
| Network latency issues | Phase 2: Voice Integration | Measure p95 latency <3s for full response cycle, test on throttled connection (DevTools Network: Fast 3G) |
| ElevenLabs rate limiting | Phase 2: Voice Integration | Load test 3 concurrent sessions, monitor for 429 errors, verify cost projections |
| Whisper transcription accuracy | Phase 2: Voice Integration | Test accuracy >80% for target phrases, including whispered speech with background noise |
| State machine race conditions | Phase 1: Core State Machine + Phase 3: Polish & Resilience | Rapidly click all UI elements, speak during TTS, verify no duplicate sessions or crashes |
| Browser backgrounding | Phase 3: Polish & Resilience | Switch tabs during session, return, verify audio resumes correctly |
| Internet connection drop | Phase 3: Polish & Resilience | Disconnect WiFi mid-session, verify fallback audio plays and journey continues |
| LGPD compliance | Phase 1: Core State Machine + Phase 3: Polish & Resilience | Code audit + DevTools inspection, zero audio persistence, analytics contains no PII |
| Mobile AudioContext suspension | Phase 1: Core State Machine (if mobile in scope) | Test on mobile device, verify audio plays after app backgrounded |

## Sources

- MDN Web Docs: Web Audio API, MediaStream Recording API, Autoplay Policy (training data through Jan 2025)
- Browser vendor documentation: Chrome/Edge/Firefox autoplay policies and microphone permission flows
- ElevenLabs API documentation patterns (training data)
- Whisper API behavior patterns for short-form speech (training data)
- LGPD compliance requirements for audio data (training data)
- Common live event technical failure modes (training data synthesis)

**Confidence note:** All findings based on documented browser API specifications and TTS/STT system behavior patterns from training data through January 2025. Browser APIs are stable specifications (Web Audio API, MediaStream API). ElevenLabs/Whisper patterns based on documented API behavior. Live event failure modes based on established technical patterns.

**Recommended verification:** Before event, test all critical paths (autoplay, microphone, network failover) in production environment with actual hardware.

---
*Pitfalls research for: Live Voice-Interactive Installation (O Oráculo)*
*Researched: 2026-03-24*
*Confidence: MEDIUM (specifications-based, pre-verification recommended)*
