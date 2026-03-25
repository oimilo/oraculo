# Roadmap: O Oraculo v1.1

**Milestone:** v1.1 Real API Connections
**Target:** Connect ElevenLabs, Whisper, Claude, and Supabase to replace mock services
**Granularity:** Standard
**Created:** 2026-03-25

## Phases

- [ ] **Phase 4: API Routes & Configuration** - Server-side API endpoints for TTS/STT/NLU, environment configuration template
- [ ] **Phase 5: Real Voice Services** - ElevenLabs TTS, Whisper STT, Claude NLU implementations behind existing interfaces
- [ ] **Phase 6: Supabase Analytics** - Database migration, RLS policies, persistent analytics service, admin dashboard integration

## Phase Details

### Phase 4: API Routes & Configuration
**Goal**: Server-side API infrastructure is in place and services can authenticate against external APIs securely

**Depends on**: Nothing (first phase of v1.1, builds on v1.0 service interfaces)

**Requirements**: API-01, API-02, API-03, CFG-01, CFG-02, CFG-03

**Success Criteria** (what must be TRUE):
1. POST `/api/tts` accepts text and voice settings, returns ElevenLabs audio stream with proper error handling
2. POST `/api/stt` accepts audio blob and returns Whisper transcription JSON with language=pt forced
3. POST `/api/nlu` accepts transcript with context and returns Claude Haiku classification with confidence score
4. `.env.example` file documents all required API keys with clear descriptions and example values
5. Developer can toggle between mock and real services by setting `NEXT_PUBLIC_USE_REAL_APIS=true` without code changes

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — API route handlers for TTS/STT/NLU with env validation and tests
- [ ] 04-02-PLAN.md — Environment template (.env.example) and factory function preparation

---

### Phase 5: Real Voice Services
**Goal**: Visitor receives real AI-generated voice responses and their speech is transcribed and classified by production APIs

**Depends on**: Phase 4 (requires API routes to be functional)

**Requirements**: RTTS-01, RTTS-02, RSTT-01, RSTT-02, RNLU-01, RNLU-02

**Success Criteria** (what must be TRUE):
1. Visitor hears ElevenLabs voice speak each narrative segment with phase-appropriate voice parameters (grave in Inferno, soft in Paradise)
2. Voice parameters (stability, similarity_boost, style, speed) automatically vary per phase according to PHASE_VOICE_SETTINGS
3. Visitor's spoken response is transcribed by Whisper with Portuguese language detection within 2 seconds
4. Transcribed text is classified by Claude Haiku into correct narrative branch (A or B) with confidence score and reasoning
5. Service factory functions switch between mock and real implementations based on `NEXT_PUBLIC_USE_REAL_APIS` env var
6. When API calls fail, system gracefully falls back to error state without crashing the experience

**Plans**: TBD

**UI hint**: yes

---

### Phase 6: Supabase Analytics
**Goal**: Session data persists to database with proper anonymity controls and admin dashboard displays real session metrics

**Depends on**: Phase 5 (can run independently but best tested with real sessions)

**Requirements**: SUP-01, SUP-02, SUP-03, SUP-04

**Success Criteria** (what must be TRUE):
1. Database table `sessions` stores anonymous session data (id, station_id, path, duration, fallback_count, timestamps) without any personal information
2. Row-level security policies allow anonymous inserts for session creation and authenticated reads for admin dashboard
3. SupabaseAnalyticsService implements AnalyticsService interface and persists all 7 analytics methods to Supabase
4. Admin dashboard at `/admin` displays live session metrics from Supabase when real APIs are enabled
5. Session analytics survive browser refresh and are queryable across multiple stations

**Plans**: TBD

**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 4. API Routes & Configuration | 0/2 | Planning complete | - |
| 5. Real Voice Services | 0/? | Not started | - |
| 6. Supabase Analytics | 0/? | Not started | - |

## Dependencies

```
Phase 4: API Routes & Configuration
    |
Phase 5: Real Voice Services
    |
Phase 6: Supabase Analytics (can run parallel to Phase 5 but tested after)
```

## Coverage

**Total v1.1 Requirements:** 16

- API Routes: 3 (API-01 to API-03)
- Real TTS: 2 (RTTS-01 to RTTS-02)
- Real STT: 2 (RSTT-01 to RSTT-02)
- Real NLU: 2 (RNLU-01 to RNLU-02)
- Supabase Analytics: 4 (SUP-01 to SUP-04)
- Configuration: 3 (CFG-01 to CFG-03)

**Mapped to Phases:** 16/16 ✓

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 4 | Pending |
| API-02 | Phase 4 | Pending |
| API-03 | Phase 4 | Pending |
| CFG-01 | Phase 4 | Pending |
| CFG-02 | Phase 4 | Pending |
| CFG-03 | Phase 4 | Pending |
| RTTS-01 | Phase 5 | Pending |
| RTTS-02 | Phase 5 | Pending |
| RSTT-01 | Phase 5 | Pending |
| RSTT-02 | Phase 5 | Pending |
| RNLU-01 | Phase 5 | Pending |
| RNLU-02 | Phase 5 | Pending |
| SUP-01 | Phase 6 | Pending |
| SUP-02 | Phase 6 | Pending |
| SUP-03 | Phase 6 | Pending |
| SUP-04 | Phase 6 | Pending |

## Research Flags

**All phases use standard integration patterns:**

- Phase 4: Next.js 15 App Router API routes (standard REST endpoints)
- Phase 5: Plain fetch to external APIs (ElevenLabs REST, OpenAI Whisper, Anthropic Messages)
- Phase 6: Supabase client library (@supabase/supabase-js) + SQL migrations

No additional research needed — patterns are well-documented.

---
*Last updated: 2026-03-25 after Phase 4 planning*
