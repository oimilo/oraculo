# Requirements: O Oráculo

**Defined:** 2026-03-24
**Core Value:** Experiência seamless e imersiva como um jogo — voz, roteiro e transições funcionando perfeitamente.

## v1.0 Requirements (Complete)

All 41 v1.0 requirements implemented with mock services. See MILESTONES.md for details.

## v1.1 Requirements

Requirements para conectar APIs reais substituindo mocks. Cada um mapeia para fases do roadmap.

### API Routes

- [ ] **API-01**: POST `/api/tts` aceita texto + voice settings e retorna audio stream do ElevenLabs (chave API server-side)
- [ ] **API-02**: POST `/api/stt` aceita audio blob e retorna transcrição JSON do OpenAI Whisper (language=pt)
- [ ] **API-03**: POST `/api/nlu` aceita transcript + question context + options e retorna classificação do Claude Haiku

### Real Services — TTS

- [ ] **RTTS-01**: ElevenLabsTTSService implementa interface TTSService e chama `/api/tts` para cada segmento de fala
- [ ] **RTTS-02**: Voice parameters (stability, similarity_boost, style, speed) variam por fase conforme PHASE_VOICE_SETTINGS

### Real Services — STT

- [ ] **RSTT-01**: WhisperSTTService implementa interface STTService e envia audio blob para `/api/stt`
- [ ] **RSTT-02**: Transcrição é forçada para idioma português (language=pt no Whisper)

### Real Services — NLU

- [ ] **RNLU-01**: ClaudeNLUService implementa interface NLUService e envia transcript+context para `/api/nlu`
- [ ] **RNLU-02**: Classificação retorna choice A/B com confidence score e reasoning via Claude Haiku

### Supabase Analytics

- [ ] **SUP-01**: Tabela `sessions` no Supabase armazena dados anônimos (id, station_id, path, duration_ms, fallback_count, status, started_at, ended_at)
- [ ] **SUP-02**: Políticas RLS permitem inserts anônimos e reads autenticados (admin)
- [ ] **SUP-03**: SupabaseAnalyticsService implementa interface AnalyticsService com persistência no Supabase
- [ ] **SUP-04**: Admin dashboard lê métricas de sessão do Supabase quando NEXT_PUBLIC_USE_REAL_APIS=true

### Configuration

- [x] **CFG-01**: `.env.example` documenta todas as variáveis de ambiente necessárias com descrições
- [x] **CFG-02**: `NEXT_PUBLIC_USE_REAL_APIS=true` ativa implementações reais via factory functions existentes
- [ ] **CFG-03**: Todas as API keys externas (ELEVENLABS_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY) ficam server-side only, nunca expostas ao client bundle

## v2 Requirements

Deferred para pós-evento ou iteração futura.

### Enhancements

- **ENH-01**: Detecção de retorno do visitante (se voltar ao Oráculo)
- **ENH-02**: Análise de emoção na voz para adaptar tom do Oráculo
- **ENH-03**: Suporte multi-idioma (inglês, espanhol)
- **ENH-04**: Variantes generativas do roteiro (IA gera trechos únicos)
- **ENH-05**: Override manual do operador via admin (classificar escolha manualmente se NLU falhar repetidamente)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Chat livre com a IA | Experiência é guiada/scripted, não conversacional |
| Texto do roteiro na tela | Quebra imersão — tudo deve ser por áudio |
| App mobile nativo | Webapp no browser do laptop é suficiente |
| Sensor de toque na água | Complexidade de hardware desnecessária — botão digital |
| Coleta de dados pessoais | LGPD + filosofia do projeto ("a água esquece tudo") |
| Interrupção de voz (barge-in) | Visitante não deve interromper o Oráculo — fluxo é scripted |
| Display de transcrição | Mostra bastidores, destrói imersão |
| SDKs externos para ElevenLabs/Whisper/Claude | Complexidade desnecessária — plain fetch é suficiente |
| ElevenLabs WebSocket streaming | v1.1 usa REST POST, WebSocket streaming fica para v2 se necessário |

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

### v1.1 (Roadmap defined)

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 4 | Pending |
| API-02 | Phase 4 | Pending |
| API-03 | Phase 4 | Pending |
| CFG-01 | Phase 4 | Complete |
| CFG-02 | Phase 4 | Complete |
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

**Coverage:**
- v1.1 requirements: 16 total
- Mapped to phases: 16/16 ✓
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-25 after v1.1 roadmap creation*
