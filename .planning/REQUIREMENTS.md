# Requirements: O Oráculo

**Defined:** 2026-03-24
**Core Value:** Experiência seamless e imersiva como um jogo — voz, roteiro e transições funcionando perfeitamente.

## v1.0 Requirements (Complete)

All 41 v1.0 requirements implemented with mock services. See MILESTONES.md for details.

## v1.1 Requirements (Paused — Phase 6 deferred)

Requirements para conectar APIs reais substituindo mocks. Phases 4-5 complete, Phase 6 (Supabase) deferred.

### API Routes (Complete)

- [x] **API-01**: POST `/api/tts` aceita texto + voice settings e retorna audio stream do ElevenLabs
- [x] **API-02**: POST `/api/stt` aceita audio blob e retorna transcrição JSON do Whisper
- [x] **API-03**: POST `/api/nlu` aceita transcript + context + options e retorna classificação

### Real Services (Complete)

- [x] **RTTS-01**: ElevenLabsTTSService implementa TTSService e chama `/api/tts`
- [x] **RTTS-02**: Voice parameters variam por fase conforme PHASE_VOICE_SETTINGS
- [x] **RSTT-01**: WhisperSTTService implementa STTService e envia audio para `/api/stt`
- [x] **RSTT-02**: Transcrição forçada para português (language=pt)
- [x] **RNLU-01**: ClaudeNLUService implementa NLUService e envia transcript+context para `/api/nlu`
- [x] **RNLU-02**: Classificação retorna choice A/B com confidence e reasoning

### Configuration (Complete)

- [x] **CFG-01**: `.env.example` documenta todas as variáveis de ambiente
- [x] **CFG-02**: `NEXT_PUBLIC_USE_REAL_APIS=true` ativa implementações reais
- [x] **CFG-03**: API keys ficam server-side only

### Supabase Analytics (Deferred to post-v1.2)

- [ ] **SUP-01**: Tabela `sessions` no Supabase com dados anônimos
- [ ] **SUP-02**: Políticas RLS (inserts anônimos, reads autenticados)
- [ ] **SUP-03**: SupabaseAnalyticsService com persistência no Supabase
- [ ] **SUP-04**: Admin dashboard lê métricas do Supabase

## v1.2 Requirements — Voice Flow Stabilization

Corrigir e refatorar fluxo de voz end-to-end: TTS → mic → STT → NLU → state machine.

### Flow Sequencing (FLOW)

- [x] **FLOW-01**: TTS narration completes fully before microphone opens for listening
- [x] **FLOW-02**: Question TTS plays in PERGUNTA state, before entering AGUARDANDO
- [x] **FLOW-03**: TIMEOUT_REDIRECT text only plays after 15s timeout, not as primary question
- [x] **FLOW-04**: No TTS audio overlaps at any point during the experience
- [x] **FLOW-05**: State transitions wait for TTS completion before proceeding

### Microphone Lifecycle (MIC)

- [x] **MIC-01**: Microphone recording starts only when entering AGUARDANDO state
- [x] **MIC-02**: Recording starts only after all TTS audio has finished playing
- [x] **MIC-03**: Recording duration captures full visitor response (configurable)
- [x] **MIC-04**: Audio blob from previous AGUARDANDO is never processed in a new state
- [x] **MIC-05**: Microphone stops cleanly on state exit (no orphaned streams)

### STT/NLU Pipeline (PIPE)

- [ ] **PIPE-01**: Whisper STT successfully transcribes spoken Portuguese responses
- [ ] **PIPE-02**: NLU always receives valid config (correct options, not empty/stale)
- [ ] **PIPE-03**: Classification result correctly maps to state machine event
- [ ] **PIPE-04**: Low confidence triggers fallback TTS then re-listen cycle
- [ ] **PIPE-05**: Empty/silence transcript handled gracefully with fallback or default

### Code Quality (QUAL)

- [x] **QUAL-01**: useVoiceChoice refactored with clear lifecycle phases (idle/listening/processing/decided)
- [x] **QUAL-02**: TTS orchestration decoupled from voice choice logic (no shared mutable state)
- [x] **QUAL-03**: State machine choice points are generic/extensible for future branches
- [x] **QUAL-04**: All voice flow integration tests pass with real service timing patterns

## v2 Requirements

Deferred para pós-evento ou iteração futura.

### Enhancements

- **ENH-01**: Detecção de retorno do visitante
- **ENH-02**: Análise de emoção na voz
- **ENH-03**: Suporte multi-idioma
- **ENH-04**: Variantes generativas do roteiro
- **ENH-05**: Override manual do operador via admin

## Out of Scope

| Feature | Reason |
|---------|--------|
| Chat livre com a IA | Experiência é guiada/scripted, não conversacional |
| Texto do roteiro na tela | Quebra imersão — tudo por áudio |
| App mobile nativo | Webapp no browser do laptop é suficiente |
| Sensor de toque na água | Complexidade de hardware desnecessária |
| Coleta de dados pessoais | LGPD compliance total |
| Interrupção de voz (barge-in) | Visitante não deve interromper o Oráculo |
| Display de transcrição | Mostra bastidores, destrói imersão |
| SDKs externos para ElevenLabs/Whisper/Claude | Plain fetch é suficiente |
| ElevenLabs WebSocket streaming | REST POST suficiente para v1 |

## Traceability

### v1.0 (Complete)

| Requirement | Phase | Status |
|-------------|-------|--------|
| FLOW-01 to FLOW-12 | Phases 1-2 | Complete |
| TTS-01 to TTS-04 | Phase 2 | Complete |
| STT-01 to STT-05 | Phase 2 | Complete |
| AMB-01 to AMB-04 | Phase 2 | Complete |
| UI-01 to UI-06 | Phases 1-2 | Complete |
| RES-01 to RES-05 | Phases 1,3 | Complete |
| ANA-01 to ANA-05 | Phase 3 | Complete |

### v1.1 (Paused)

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 to API-03 | Phase 4 | Complete |
| CFG-01 to CFG-03 | Phase 4 | Complete |
| RTTS-01 to RTTS-02 | Phase 5 | Complete |
| RSTT-01 to RSTT-02 | Phase 5 | Complete |
| RNLU-01 to RNLU-02 | Phase 5 | Complete |
| SUP-01 to SUP-04 | Phase 6 | Deferred |

### v1.2 (Active)

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUAL-01 | Phase 7 | Complete |
| QUAL-02 | Phase 7 | Complete |
| QUAL-03 | Phase 7 | Complete |
| QUAL-04 | Phase 7 | Complete |
| FLOW-01 | Phase 8 | Complete |
| FLOW-02 | Phase 8 | Complete |
| FLOW-03 | Phase 8 | Complete |
| FLOW-04 | Phase 8 | Complete |
| FLOW-05 | Phase 8 | Complete |
| MIC-01 | Phase 8 | Complete |
| MIC-02 | Phase 8 | Complete |
| MIC-03 | Phase 8 | Complete |
| MIC-04 | Phase 8 | Complete |
| MIC-05 | Phase 8 | Complete |
| PIPE-01 | Phase 9 | Pending |
| PIPE-02 | Phase 9 | Pending |
| PIPE-03 | Phase 9 | Pending |
| PIPE-04 | Phase 9 | Pending |
| PIPE-05 | Phase 9 | Pending |

**Coverage:**
- v1.2 requirements: 19 total
- Mapped to phases: 19/19 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-25 — v1.2 roadmap created*
