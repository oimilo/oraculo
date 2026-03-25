# Requirements: O Oráculo

**Defined:** 2026-03-24
**Core Value:** Experiência seamless e imersiva como um jogo — voz, roteiro e transições funcionando perfeitamente.

## v1 Requirements

Requirements para o MVP da Bienal (29-30 Mai 2026). Cada um mapeia para fases do roadmap.

### State Machine e Fluxo

- [ ] **FLOW-01**: Visitante pode iniciar a experiência tocando um botão na tela
- [ ] **FLOW-02**: Oráculo reproduz monólogo de apresentação completo com pausas intencionais (2-4s entre frases)
- [ ] **FLOW-03**: Oráculo apresenta pergunta do Inferno e aguarda resposta por voz (timeout 15s)
- [ ] **FLOW-04**: Resposta do visitante é classificada em escolha binária (Caminho A: Vozes / Caminho B: Silêncio)
- [ ] **FLOW-05**: Oráculo reproduz narrativa correspondente ao caminho escolhido no Inferno
- [ ] **FLOW-06**: Oráculo apresenta pergunta do Purgatório (específica ao caminho) e aguarda resposta por voz
- [ ] **FLOW-07**: Resposta do Purgatório é classificada em escolha binária (2 opções por caminho)
- [ ] **FLOW-08**: Oráculo reproduz reflexão do Paraíso (pergunta reflexiva, sem classificação necessária)
- [ ] **FLOW-09**: Oráculo reproduz devolução personalizada (1 de 4 variantes baseada nas 2 escolhas)
- [ ] **FLOW-10**: Oráculo reproduz encerramento igual para todos e retorna ao estado inicial após 5s
- [ ] **FLOW-11**: Silêncio prolongado (timeout) é tratado como escolha default com fala de transição poética
- [ ] **FLOW-12**: Experiência completa dura entre 7-10 minutos por visitante

### Voz — TTS

- [ ] **TTS-01**: Texto do roteiro é convertido em fala via ElevenLabs com streaming (latência < 1.5s para início do áudio)
- [ ] **TTS-02**: Voz muda de parâmetros por fase (mais grave no Inferno, mais suave no Paraíso, definitiva no Encerramento)
- [ ] **TTS-03**: Pausas intencionais de 1.5-4s são inseridas entre blocos de fala conforme roteiro
- [ ] **TTS-04**: Voz é consistente (mesma identidade vocal) ao longo de toda a experiência

### Voz — STT e NLU

- [ ] **STT-01**: Fala do visitante é capturada via microfone do headphone e transcrita via Whisper em PT-BR
- [ ] **STT-02**: Transcrição é classificada por Claude Haiku em escolha binária com confiança > 0.7
- [ ] **STT-03**: Se confiança < 0.7 ou fala fora de contexto, Oráculo faz redirecionamento poético e reescuta (máx 2 tentativas)
- [ ] **STT-04**: Latência total entre fim da fala e início da resposta do Oráculo é < 3 segundos
- [ ] **STT-05**: Indicador visual de "ouvindo" aparece quando o microfone está ativo

### Ambientação Sonora

- [ ] **AMB-01**: Cada fase tem ambientação sonora própria (Inferno: eco/sussurros, Purgatório: vento/passos, Paraíso: harmônico etéreo)
- [ ] **AMB-02**: Transições entre fases usam crossfade de 2-3 segundos (sem gaps audíveis)
- [ ] **AMB-03**: Ambientação toca simultaneamente com a voz TTS sem conflito de áudio
- [ ] **AMB-04**: Áudios de ambientação são loops seamless pré-carregados

### UI e Feedback Visual

- [ ] **UI-01**: Tela inicial mostra botão pulsante "Toque para começar" sobre fundo escuro com animação sutil de água
- [ ] **UI-02**: Durante a experiência, fundo muda sutilmente de cor por fase (bordô → azul acinzentado → dourado)
- [ ] **UI-03**: Animação central abstrata reage ao áudio (waveform sutil)
- [ ] **UI-04**: Indicador "ouvindo..." aparece como onda pulsante quando aguardando resposta
- [ ] **UI-05**: Nenhum texto do roteiro aparece na tela — tudo é por áudio
- [ ] **UI-06**: Tela final faz fade para preto e retorna ao início após 5 segundos

### Resiliência e Offline

- [ ] **RES-01**: Todos os monólogos do roteiro têm áudios pré-gravados como fallback se ElevenLabs cair
- [ ] **RES-02**: Se a internet cair, experiência continua com áudios pré-gravados para as falas fixas
- [ ] **RES-03**: Permissão de microfone é solicitada antes do início com tela explicativa
- [ ] **RES-04**: AudioContext é desbloqueado no primeiro clique (evita bloqueio de autoplay do browser)
- [ ] **RES-05**: Sessão que trava por qualquer motivo retorna ao IDLE após 30s de inatividade

### Analytics e Admin

- [ ] **ANA-01**: Cada sessão registra: estação, caminho escolhido, duração, contagem de fallbacks, se completou
- [ ] **ANA-02**: Zero dados pessoais são coletados (LGPD) — sem áudio persistido, sem transcrições salvas
- [ ] **ANA-03**: Painel admin em `/admin` mostra: sessões ativas, total de visitantes, distribuição de caminhos, tempo médio
- [ ] **ANA-04**: Painel admin mostra status online/offline de cada estação
- [ ] **ANA-05**: 2-3 estações podem rodar sessões simultâneas sem interferência

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

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FLOW-01 | Phase 1 | Pending |
| FLOW-02 | Phase 1 | Pending |
| FLOW-03 | Phase 1 | Pending |
| FLOW-04 | Phase 2 | Pending |
| FLOW-05 | Phase 1 | Pending |
| FLOW-06 | Phase 1 | Pending |
| FLOW-07 | Phase 2 | Pending |
| FLOW-08 | Phase 1 | Pending |
| FLOW-09 | Phase 1 | Pending |
| FLOW-10 | Phase 1 | Pending |
| FLOW-11 | Phase 2 | Pending |
| FLOW-12 | Phase 1 | Pending |
| TTS-01 | Phase 2 | Pending |
| TTS-02 | Phase 2 | Pending |
| TTS-03 | Phase 2 | Pending |
| TTS-04 | Phase 2 | Pending |
| STT-01 | Phase 2 | Pending |
| STT-02 | Phase 2 | Pending |
| STT-03 | Phase 2 | Pending |
| STT-04 | Phase 2 | Pending |
| STT-05 | Phase 2 | Pending |
| AMB-01 | Phase 2 | Pending |
| AMB-02 | Phase 2 | Pending |
| AMB-03 | Phase 2 | Pending |
| AMB-04 | Phase 2 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| UI-04 | Phase 2 | Pending |
| UI-05 | Phase 2 | Pending |
| UI-06 | Phase 1 | Pending |
| RES-01 | Phase 3 | Pending |
| RES-02 | Phase 3 | Pending |
| RES-03 | Phase 1 | Pending |
| RES-04 | Phase 1 | Pending |
| RES-05 | Phase 3 | Pending |
| ANA-01 | Phase 3 | Pending |
| ANA-02 | Phase 3 | Pending |
| ANA-03 | Phase 3 | Pending |
| ANA-04 | Phase 3 | Pending |
| ANA-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after roadmap creation*
