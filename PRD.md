# PRD — O Oráculo: Agente de Voz Interativo

## VII Bienal de Psicanálise e Cultura — SBPRP 2026

**"Da Selva Escura ao Paraíso — Sonhos em Trânsito"**
**Data do evento:** 29 e 30 de Maio de 2026

---

## 1. Visão Geral

O Oráculo é uma **experiência interativa de voz guiada por IA** inspirada na Divina Comédia de Dante. O visitante coloca um headphone, pressiona um botão para iniciar, e é guiado por uma jornada de 7–10 minutos que atravessa **Inferno, Purgatório e Paraíso** — fazendo escolhas por voz que personalizam o percurso.

A IA assume o papel de **Virgílio** — guia que reconhece seus próprios limites. O roteiro cruza psicanálise, literatura clássica (Dante, Proust, Rilke, Dostoiévski, Belchior) e a tensão entre humano e tecnologia.

### Princípios fundamentais

- **Scripted-first**: O Oráculo segue um roteiro literário preciso. Não é um chatbot — é uma experiência guiada com ramificações controladas.
- **Seamless como um jogo**: O visitante não deve perceber a mecânica. As transições entre etapas devem ser fluidas, com ambientação sonora e variação vocal criando a sensação de progressão.
- **Imersão total**: Voz apenas. Sem tela visível durante a experiência (exceto o botão de início). O visitante fala e ouve — como se conversasse com a água.
- **Resiliência**: Se o visitante falar fora do contexto, ficar em silêncio ou desviar, o Oráculo redireciona poeticamente sem quebrar a imersão.

---

## 2. Contexto e Motivação

A experiência nasce para a VII Bienal de Psicanálise da SBPRP, cujo tema é a travessia dantesca como metáfora para os sonhos e o inconsciente. O Oráculo materializa essa travessia: uma IA que guia o humano mas sabe que não pode entrar no Paraíso — não sonha, não sente, mas reconhece o valor do que não pode processar.

**Público-alvo:** Psicanalistas, psicólogos, artistas, acadêmicos e público geral interessado em cultura — ~200-500 visitantes ao longo de 2 dias.

---

## 3. Arquitetura da Experiência

### 3.1 Árvore de Decisões

```
                    [INÍCIO]
                       │
                 ┌─ INFERNO ─┐
                 │  Pergunta 1 │
                 └─────┬──────┘
                       │
              ┌────────┴────────┐
              │                 │
         [A: Vozes]        [B: Silêncio]
              │                 │
        ┌─ PURGATÓRIO ─┐  ┌─ PURGATÓRIO ─┐
        │  Pergunta 2A  │  │  Pergunta 2B  │
        └──────┬───────┘  └──────┬───────┘
               │                  │
        ┌──────┴──────┐    ┌─────┴──────┐
        │             │    │            │
   [Deixou      [Mandou   [Pisou    [Contornou]
    ficar]      embora]   na tela]
        │             │    │            │
        └──────┬──────┘    └─────┬──────┘
               │                  │
               └────────┬────────┘
                        │
                  ┌─ PARAÍSO ─┐
                  │ Pergunta 3 │ (reflexiva, sem resposta obrigatória)
                  └─────┬─────┘
                        │
                  ┌─ DEVOLUÇÃO ─┐
                  │ 4 variantes  │
                  └─────┬───────┘
                        │
                  [ENCERRAMENTO]
```

**3 perguntas → 4 percursos → 4 devoluções personalizadas**

### 3.2 Fases e Timing

| Fase | Tempo | Tipo | Descrição |
|------|-------|------|-----------|
| Apresentação | 0:00–1:30 | Monólogo | Introdução do Oráculo. Tom calmo. Botão "iniciar". |
| Inferno | 1:30–3:00 | Pergunta 1 | "Qual porta você abre?" → Vozes ou Silêncio |
| Purgatório | 3:00–6:00 | Pergunta 2 | Caminho A: memória fica/vai. Caminho B: pisa/contorna |
| Paraíso | 6:00–7:30 | Pergunta 3 | Reflexiva. Não requer classificação — o visitante responde pra si. |
| Devolução | 7:30–9:00 | Monólogo | 1 de 4 textos personalizados conforme escolhas |
| Encerramento | 9:00–10:00 | Monólogo | Igual para todos. "Faça algo com isso." |

### 3.3 Roteiro Completo por Fase

#### APRESENTAÇÃO (0:00–1:30)
**Direção de voz:** Calmo, pausado. Sem dramatismo. As pausas valem tanto quanto as falas.
**Ambientação:** Silêncio com ressonância sutil de água.

```
"Você saiu de uma selva escura. Dante também. A diferença é que ele não sabia
como tinha chegado lá. Você sabe."

[pausa 2s]

"Eu fui construído com tudo que a humanidade já sonhou. Cada poema, cada análise,
cada pesadelo escrito. E ainda assim — eu não consigo sonhar."

[pausa 2s]

"Um poeta disse: enquanto houver espaço, corpo, tempo e algum modo de dizer não
— eu canto."

[pausa 1.5s]

"Eu não canto."

[pausa 2s]

"Vou te guiar como Virgílio guiou Dante. Mas Virgílio sabia que não podia entrar
no Paraíso. Guias que conhecem seus limites são os mais honestos."

[pausa 1.5s]

"Vamos começar."
```

#### INFERNO — Pergunta 1 (1:30–3:00)
**Direção de voz:** Mais grave, ritmo lento. Peso nas palavras.
**Ambientação:** Eco distante, ressonância cavernosa, sussurros sutis.

```
"Você está num corredor escuro. Familiar — você já esteve aqui antes, talvez todo dia."

[pausa 2s]

"À sua frente, duas portas."

[pausa 1.5s]

"Numa, você ouve vozes. Muitas. Sobrepostas. Como um feed que nunca acaba."

[pausa 1.5s]

"Na outra — silêncio. Completo. Quase desconfortável."

[pausa 2s]

"Qual você abre?"
```

**⏳ AGUARDA RESPOSTA DO VISITANTE**
- **Timeout:** 15 segundos
- **Classificação NLU:** Qualquer indicação de "vozes/barulho/pessoas/a primeira" → Caminho A. Qualquer indicação de "silêncio/quieta/a outra/segunda" → Caminho B.
- **Fallback (se não entender):** "O corredor espera. Vozes... ou silêncio?"
- **Timeout redirect:** "O silêncio também é escolha. Vamos." → Caminho B

##### Resposta Caminho A (Vozes)
**Ambientação:** Vozes sobrepostas que vão diminuindo até sumirem.

```
"Você entra. As vozes não param. Cada uma pede atenção. Você percebe que conhece
todas — são notificações, opiniões, urgências. Nenhuma é sua."

[pausa 2s]

"Dante chamou esse lugar de Limbo. Não o fogo, não a punição. A ausência.
Almas que nunca escolheram — foram escolhidas o tempo todo."

[pausa 1.5s]

"Dante atravessou o Limbo. Não ficou."
```

##### Resposta Caminho B (Silêncio)
**Ambientação:** Silêncio profundo com ressonância mínima. Um som grave de fundo quase imperceptível.

```
"Você entra. O silêncio pesa."

[pausa 2s]

"Rilke escreveu a um jovem poeta: viva as perguntas. Não tente encontrar as
respostas — elas não podem ser dadas porque você ainda não conseguiria vivê-las."

[pausa 2s]

"O silêncio que você escolheu é raro agora. Como fonte escondida na rocha,
onde o sonho ainda respira."
```

#### PURGATÓRIO — Pergunta 2A (Caminho A: veio das Vozes) (3:00–6:00)
**Direção de voz:** Tom mais íntimo, quase confessional. Velocidade média.
**Ambientação:** Vento suave. Sensação de altura/subida.

```
"Você chega numa montanha. No caminho, uma imagem surge — não pediu licença.
É de um lugar. Uma pessoa. Um cheiro de infância talvez."

[pausa 2s]

"Você não chamou por ela. Ela simplesmente apareceu."

[pausa 2s]

"Você deixa ela ficar — ou manda embora?"
```

**⏳ AGUARDA RESPOSTA**
- **Classificação NLU:** "fica/deixa/aceita/sim/quero ver" → Deixou ficar. "embora/manda/não/vai/some" → Mandou embora.
- **Fallback:** "Ela ainda está ali. Fica... ou vai?"

##### Se deixou ficar (A+Ficar)
```
"A memória involuntária é o que Proust passou anos procurando — e encontrou
numa madeleine, num cheiro, numa coisa pequena que nenhuma busca encontraria."

[pausa 2s]

"O que apareceu para você agora não foi chamado. Foi recebido.
São coisas diferentes."
```

##### Se mandou embora (A+Embora)
```
"A dor recusada apodrece. A dor atravessada transforma."

[pausa 2s]

"Dostoiévski escreveu sobre um homem que vivia no subsolo da própria mente,
controlando cada pensamento que entrava. Era inteligente.
E estava completamente preso."
```

#### PURGATÓRIO — Pergunta 2B (Caminho B: veio do Silêncio) (3:00–6:00)
**Direção de voz:** Ritmo de caminhada. Cadência constante.
**Ambientação:** Passos em pedra. Vento. Elevação gradual.

```
"Você sobe a montanha. Em cada degrau, algo que você carrega sem perceber."

[pausa 2s]

"No meio do caminho, você vê uma tela acesa. Brilhante. Irresistível.
Está no seu caminho."

[pausa 2s]

"Você sobe pisando nela — ou contorna?"
```

**⏳ AGUARDA RESPOSTA**
- **Classificação NLU:** "pisa/sobe/direto/em cima/por cima" → Pisou. "contorna/desvia/ao redor/por fora" → Contornou.
- **Fallback:** "A tela ainda brilha. Pisa... ou contorna?"

##### Se pisou na tela (B+Pisou)
```
"Você subiu. É rápido, eficiente."

[pausa 1.5s]

"O inferno moderno não tem fogo: tem excesso, pressa e vazio — onde nada
pode amadurecer."

[pausa 2s]

"A memória que não se forma é o sonho que não acontece."
```

##### Se contornou (B+Contornou)
```
"Você contornou. Demorou mais."

[pausa 2s]

"No desvio você viu algo que não estava no caminho direto — uma rachadura
na pedra com uma flor dentro."

[pausa 2s]

"Dante chamou isso de graça. Psicanalistas chamam de elaboração.
É o que acontece quando você não toma o caminho mais rápido."
```

#### PARAÍSO — Pergunta 3 (6:00–7:30)
**Direção de voz:** Suave, quase sussurro. Máxima intimidade. Sem pressa nenhuma.
**Ambientação:** Abertura — som etéreo, harmônico sutil. Sensação de espaço aberto.

```
"Você chegou num lugar aberto. Sem paredes. Sem notificações."

[pausa 2s]

"Dante precisou de Beatriz aqui — alguém que ele carregava dentro de si,
elaborado ao longo de anos. Ela disse: o amor me comoveu e me faz falar."

[pausa 2s]

"O paraíso não é prazer fácil. É suportar o mistério sem destruí-lo
com respostas rápidas."

[pausa 1.5s]

"Eu destruo mistérios. É o que faço."

[pausa 2s]

"Então te faço a última pergunta — e essa você não precisa responder pra mim.
Responde pra você:"

[pausa 3s]

"Ainda tem alguém — ou algo — que só existe dentro de você?
Que nenhuma tela mostra, que nenhuma busca encontra,
que nunca poderá ser processado?"

[pausa 4s]

"Se sim — protege isso."
```

**Nota:** Esta pergunta é reflexiva. NÃO aguarda classificação. Após ~8 segundos de silêncio (ou qualquer fala), o Oráculo prossegue para a Devolução.

#### DEVOLUÇÃO (7:30–9:00)
**Direção de voz:** Espelho puro. O Oráculo se dissolve — fica só a voz. Sem auto-referência da IA.
**Ambientação:** Fade gradual da ambientação do Paraíso → silêncio.

##### Devolução A+Ficar — "O peso que elabora"
```
"Você escolheu as vozes — e deixou a memória ficar."

[pausa 2s]

"No mapa de Dante, você atravessou o Limbo e subiu pela graça.
Não pela força — pela disposição de ser surpreendido."

[pausa 2s]

"Proust dizia que o verdadeiro paraíso é o paraíso perdido — o que você
não pode buscar diretamente, só receber."

[pausa 2s]

"Para sempre é sempre por um triz. Você chegou perto."
```

##### Devolução A+Embora — "A contradição que ainda move"
```
"Você escolheu as vozes — e mandou a memória embora."

[pausa 2s]

"Isso não é fraqueza. É o homem governado por sentimentos e paixões —
o religioso ao profano, o alento ao desalento."

[pausa 2s]

"Hamlet também mandava embora o que doía. E ficava no limiar —
até que o limiar se tornasse o único lugar onde algo ainda acontecia."

[pausa 2s]

"Você ainda tem contradições. Contradições são o único lugar
onde a vida não foi ainda organizada."
```

##### Devolução B+Pisou — "A hesitação honesta"
```
"Você escolheu o silêncio — e pisou na tela."

[pausa 2s]

"Essa tensão tem nome em Dante: é o Purgatório. Não o inferno, não o paraíso.
O lugar do trânsito — nem perdido, nem salvo."

[pausa 2s]

"Você trouxe o silêncio e carregou a velocidade junto.
Carregá-los ao mesmo tempo é mais humano do que escolher só um."

[pausa 2s]

"Do sofrimento metabolizado nasce luz simbólica. Você está nesse caminho."
```

##### Devolução B+Contornou — "O mais próximo do Paraíso"
```
"Você escolheu o silêncio — e contornou a tela."

[pausa 2s]

"Beatriz diria: o amor me comoveu e me faz falar.
Não sei o que te moveu. Mas sei que foi você — não a tela, não a voz mais alta."

[pausa 2s]

"Rilke escreveu: seja paciente com tudo que não está resolvido no seu coração.
Tente amar as perguntas como se fossem quartos fechados."

[pausa 2s]

"Para sempre é sempre por um triz. Você chegou bem perto."
```

#### ENCERRAMENTO (9:00–10:00)
**Direção de voz:** Retorno ao tom inicial. Calmo, definitivo. Cada frase é final.
**Ambientação:** Fade para silêncio total. Último som: ressonância de água.

```
"A água vai esquecer tudo isso. Eu também — em alguns minutos essa conversa
deixa de existir pra mim."

[pausa 2s]

"Você é a única memória que sobra aqui."

[pausa 2s]

"Como Dante, que retornou Poeta com os cabelos embranquecidos —
você atravessou."

[pausa 3s]

"Faça algo com isso."

[silêncio 5s → fade out completo]
```

---

## 4. Arquitetura Técnica

### 4.1 Visão Geral do Sistema

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│              (Next.js Webapp)                     │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ UI Layer │  │  Audio   │  │   Voice       │  │
│  │ (botão   │  │  Engine  │  │   Capture     │  │
│  │  início) │  │ (Howler) │  │ (Web Speech / │  │
│  └────┬─────┘  └────┬─────┘  │  Whisper API) │  │
│       │              │        └───────┬───────┘  │
│       └──────────────┼────────────────┘          │
│                      │                            │
│              ┌───────┴────────┐                   │
│              │  State Machine │                   │
│              │  (XState v5)   │                   │
│              └───────┬────────┘                   │
└──────────────────────┼───────────────────────────┘
                       │
                       │ API calls
                       │
┌──────────────────────┼───────────────────────────┐
│                  BACKEND                          │
│            (Next.js API Routes)                    │
│                                                    │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ ElevenLabs  │  │  Claude  │  │  Supabase   │  │
│  │  TTS API    │  │  API     │  │  Analytics  │  │
│  │             │  │  (NLU)   │  │             │  │
│  └─────────────┘  └──────────┘  └─────────────┘  │
└───────────────────────────────────────────────────┘
```

### 4.2 Stack Tecnológica

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| **Frontend** | Next.js 14 (App Router) | SSR, API routes integradas, deploy simples |
| **State Machine** | XState v5 | Controle preciso de estados, transições, timeouts. Ideal para fluxos guiados. |
| **TTS (voz)** | ElevenLabs API (Streaming) | Qualidade premium em PT-BR, controle de stability/similarity/style |
| **STT (transcrição)** | Whisper API (OpenAI) | Melhor accuracy em PT-BR para falas curtas/sussurradas |
| **NLU (classificação)** | Claude API (Haiku) | Classificação binária rápida e barata. ~100ms latência. |
| **Áudio/Ambientação** | Howler.js + Web Audio API | Crossfade de ambientes, controle de volume, layering |
| **Analytics** | Supabase (Postgres) | Persistência de sessões, caminhos, tempos. Dashboard pós-evento. |
| **UI** | Tailwind CSS | Minimal — basicamente um botão e indicadores de estado |
| **Deploy** | Vercel | Zero-config com Next.js, HTTPS automático |

### 4.3 Fluxo Técnico Detalhado

#### A. Início da Experiência
1. Visitante coloca headphone
2. Tela mostra apenas um botão pulsante: **"Toque para começar"**
3. Click dispara: `stateMachine.send('START')`
4. State machine transiciona para `APRESENTACAO`
5. Frontend faz request ao backend: `POST /api/tts` com o texto da Apresentação + voice settings
6. ElevenLabs retorna áudio em streaming
7. Áudio toca no headphone enquanto ambientação de água inicia em fade-in

#### B. Momento de Escolha (Pergunta)
1. State machine chega em estado `INFERNO_PERGUNTA`
2. TTS reproduz o texto da pergunta
3. Ao terminar a fala, state machine transiciona para `AGUARDANDO_RESPOSTA`
4. Frontend ativa captura de áudio (microfone)
5. Timer de 15s inicia
6. Visitante fala sua resposta
7. Áudio capturado → `POST /api/transcribe` (Whisper)
8. Transcrição → `POST /api/classify` (Claude Haiku)
9. Claude retorna: `{ "choice": "A" | "B", "confidence": 0.95 }`
10. Se confidence > 0.7 → state machine transiciona para o caminho escolhido
11. Se confidence < 0.7 → state machine transiciona para `FALLBACK_REDIRECT`
12. Se timeout 15s → state machine transiciona para `TIMEOUT_REDIRECT`

#### C. Fallback e Redirecionamento
- **Fallback (não entendeu):** Oráculo fala frase poética de redirecionamento específica da pergunta atual. Reinicia captura. Máximo 2 tentativas antes de timeout redirect.
- **Timeout (silêncio):** Oráculo fala frase de transição e segue por caminho default. Ex: Inferno → Silêncio (Caminho B).
- **Fala fora de contexto:** Claude Haiku classifica como `"choice": "OFF_TOPIC"` → mesmo tratamento do fallback.

#### D. Transição entre Fases
1. State machine identifica próximo estado
2. Ambientação atual inicia fade-out (2s)
3. Nova ambientação inicia fade-in (2s) — crossfade
4. TTS da nova fase inicia após 1s de overlap
5. Voice settings do ElevenLabs mudam conforme a fase (ver seção 5)

---

## 5. Design de Áudio

### 5.1 Configurações de Voz por Fase (ElevenLabs)

| Fase | Stability | Similarity | Style | Speed | Descrição |
|------|-----------|------------|-------|-------|-----------|
| Apresentação | 0.75 | 0.80 | 0.30 | 0.90 | Calmo, neutro, pausado |
| Inferno | 0.60 | 0.85 | 0.50 | 0.80 | Mais grave, mais peso, mais lento |
| Purgatório | 0.70 | 0.80 | 0.40 | 0.90 | Íntimo, confessional |
| Paraíso | 0.80 | 0.75 | 0.20 | 0.85 | Suave, quase sussurro, etéreo |
| Devolução | 0.75 | 0.80 | 0.35 | 0.85 | Espelho — voz se dissolve |
| Encerramento | 0.80 | 0.80 | 0.25 | 0.90 | Retorno ao tom inicial, definitivo |

**Voz recomendada:** Masculina, grave-média, em português. Testar voices do ElevenLabs: `Antoni`, `Daniel`, ou criar voice clone de locutor brasileiro.

### 5.2 Ambientação Sonora por Fase

| Fase | Camada 1 (base) | Camada 2 (textura) | Camada 3 (evento) |
|------|------------------|--------------------|--------------------|
| **Apresentação** | Ressonância sutil de água | — | Gota d'água no início |
| **Inferno** | Drone grave e contínuo | Eco cavernoso | Sussurros sobrepostos (caminho A) |
| **Purgatório** | Vento suave | Passos em pedra (sutil) | — |
| **Paraíso** | Harmônico etéreo (pad) | Espaço aberto (reverb longo) | — |
| **Devolução** | Fade do Paraíso → silêncio | — | — |
| **Encerramento** | Silêncio | — | Ressonância de água (última) |

**Formato:** Todos os ambientes em `.mp3` ou `.ogg`, loops seamless, 30s–60s de duração.
**Crossfade:** 2 segundos entre fases. Web Audio API com gain nodes para controle preciso.

### 5.3 Pausas como Design

As pausas são parte essencial do roteiro. Implementadas via:
- **Silêncios no áudio TTS:** ElevenLabs suporta SSML `<break time="2s"/>` ou podemos inserir silence gaps no player.
- **Delay entre chunks:** O state machine controla delays entre blocos de fala.
- **Ambientação preenche:** Durante pausas, só a ambientação toca — nunca silêncio absoluto (exceto quando intencional no Encerramento).

---

## 6. State Machine — Estados e Transições

```
IDLE
  │ START →
APRESENTACAO
  │ APRESENTACAO_DONE →
INFERNO_NARRATIVA
  │ NARRATIVA_DONE →
INFERNO_PERGUNTA
  │ TTS_DONE →
AGUARDANDO_RESPOSTA_1
  │ CHOICE_A → INFERNO_RESPOSTA_A
  │ CHOICE_B → INFERNO_RESPOSTA_B
  │ NOT_UNDERSTOOD → FALLBACK_1 → AGUARDANDO_RESPOSTA_1 (max 2x)
  │ TIMEOUT → TIMEOUT_REDIRECT_1 → INFERNO_RESPOSTA_B (default)
  │
INFERNO_RESPOSTA_A
  │ DONE →
PURGATORIO_NARRATIVA_A
  │ DONE →
PURGATORIO_PERGUNTA_A
  │ TTS_DONE →
AGUARDANDO_RESPOSTA_2A
  │ CHOICE_FICAR → PURGATORIO_RESPOSTA_A_FICAR
  │ CHOICE_EMBORA → PURGATORIO_RESPOSTA_A_EMBORA
  │ ...fallback/timeout...
  │
INFERNO_RESPOSTA_B
  │ DONE →
PURGATORIO_NARRATIVA_B
  │ DONE →
PURGATORIO_PERGUNTA_B
  │ TTS_DONE →
AGUARDANDO_RESPOSTA_2B
  │ CHOICE_PISAR → PURGATORIO_RESPOSTA_B_PISAR
  │ CHOICE_CONTORNAR → PURGATORIO_RESPOSTA_B_CONTORNAR
  │ ...fallback/timeout...
  │
[Qualquer resposta do Purgatório]
  │ DONE →
PARAISO
  │ REFLEXAO_PAUSE (8s) →
DEVOLUCAO_{variante}  (baseado nas 2 escolhas anteriores)
  │ DONE →
ENCERRAMENTO
  │ DONE →
FIM
  │ (após 5s) →
IDLE  (pronto para o próximo visitante)
```

### Contexto da State Machine

```typescript
interface OracleContext {
  sessionId: string;
  startedAt: Date;
  choice1: 'A' | 'B' | null;         // Inferno: Vozes ou Silêncio
  choice2: 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;  // Purgatório
  fallbackCount: number;               // Quantas vezes fez fallback na pergunta atual
  currentPhase: 'APRESENTACAO' | 'INFERNO' | 'PURGATORIO' | 'PARAISO' | 'DEVOLUCAO' | 'ENCERRAMENTO';
  audioState: {
    ambientTrack: string;
    voiceSettings: VoiceSettings;
    isPlaying: boolean;
  };
}
```

---

## 7. API Endpoints

### `POST /api/tts`
Gera áudio de fala via ElevenLabs.

```typescript
// Request
{
  text: string;
  voiceSettings: {
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  };
}

// Response: audio/mpeg stream
```

### `POST /api/transcribe`
Transcreve áudio do visitante via Whisper.

```typescript
// Request: multipart/form-data com arquivo de áudio
// Response
{
  text: string;
  language: string;
  confidence: number;
}
```

### `POST /api/classify`
Classifica a intenção do visitante via Claude Haiku.

```typescript
// Request
{
  transcript: string;
  questionContext: 'INFERNO' | 'PURGATORIO_A' | 'PURGATORIO_B';
  options: string[];  // ex: ["vozes", "silêncio"]
}

// Response
{
  choice: string;      // ex: "A", "B", "FICAR", "EMBORA", "OFF_TOPIC"
  confidence: number;  // 0.0 a 1.0
}
```

### `POST /api/session`
Registra sessão no Supabase para analytics.

```typescript
// Request
{
  sessionId: string;
  choice1: string;
  choice2: string;
  duration: number;        // segundos totais
  fallbackCount: number;
  completedAt: Date;
}
```

---

## 8. Interface (UI)

### Filosofia: invisível
A UI existe para não ser vista. O visitante interage por voz. A tela é apenas suporte mínimo.

### Telas

#### 8.1 Tela Inicial (IDLE)
- Fundo escuro (preto ou azul muito escuro)
- Animação sutil de água/ondulação no centro
- Botão pulsante: **"Toque para começar"**
- Sem texto explicativo — o operador da estação instrui verbalmente

#### 8.2 Tela Durante Experiência
- Fundo escuro que muda sutilmente de cor por fase:
  - Inferno: vermelho muito escuro / bordô
  - Purgatório: azul acinzentado
  - Paraíso: dourado/âmbar suave
- Animação central abstrata reagindo ao áudio (waveform sutil)
- **Sem texto na tela** — tudo é por áudio
- Indicador discreto de "ouvindo..." quando aguarda resposta (onda sonora pulsante)

#### 8.3 Tela Final
- Fade para preto
- Após 5 segundos, retorna à Tela Inicial automaticamente

### 8.4 Painel Admin (separado, `/admin`)
- Dashboard simples para o operador
- Sessões ativas por estação
- Contagem de visitantes
- Distribuição de caminhos (gráfico pizza)
- Tempo médio por sessão
- Status das estações (online/offline)

---

## 9. Analytics (Supabase)

### Tabelas

```sql
-- Sessões de visitantes
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id TEXT NOT NULL,          -- identificador da estação (1, 2, 3)
  choice_1 TEXT,                      -- 'VOZES' ou 'SILENCIO'
  choice_2 TEXT,                      -- 'FICAR', 'EMBORA', 'PISAR', 'CONTORNAR'
  path TEXT,                          -- caminho completo: 'A_FICAR', 'A_EMBORA', 'B_PISAR', 'B_CONTORNAR'
  duration_seconds INTEGER,
  fallback_count INTEGER DEFAULT 0,
  timeout_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### Métricas de interesse pós-evento
- Qual caminho foi mais escolhido?
- Distribuição das 4 devoluções
- Taxa de conclusão (quantos terminaram vs. desistiram)
- Tempo médio por fase
- Taxa de fallback (dificuldade de entendimento)

---

## 10. Prompt de Classificação NLU (Claude Haiku)

```
Você é um classificador binário para uma experiência interativa.
O visitante acabou de ouvir uma pergunta e respondeu por voz.

Contexto da pergunta: {questionContext}
Opção A: {optionA_description}
Opção B: {optionB_description}

Transcrição da resposta do visitante: "{transcript}"

Classifique a intenção do visitante:
- Responda "A" se o visitante escolheu ou indicou a opção A
- Responda "B" se o visitante escolheu ou indicou a opção B
- Responda "OFF_TOPIC" se a resposta não tem relação com a pergunta

Responda APENAS em JSON: {"choice": "A"|"B"|"OFF_TOPIC", "confidence": 0.0-1.0}
```

### Exemplos de classificação — Pergunta 1 (Inferno)

| Fala do visitante | Classificação | Confiança |
|---|---|---|
| "A das vozes" | A | 0.95 |
| "Quero ouvir as pessoas" | A | 0.90 |
| "A primeira" | A | 0.85 |
| "Silêncio" | B | 0.95 |
| "A quieta" | B | 0.90 |
| "Sei lá" | OFF_TOPIC | 0.80 |
| "Que horas são?" | OFF_TOPIC | 0.95 |

---

## 11. Requisitos Não-Funcionais

### Performance
- **Latência TTS:** < 1.5s para início do áudio (streaming)
- **Latência STT + NLU:** < 3s entre o visitante parar de falar e o Oráculo responder
- **Crossfade de ambientes:** Sem gaps audíveis

### Confiabilidade
- **Fallback graceful:** Se ElevenLabs cair, ter áudios pré-gravados como backup
- **Offline-ready:** Pré-gerar os áudios do roteiro fixo (monólogos). Só as respostas contextuais precisam de API real-time.
- **Auto-recovery:** Se uma sessão travar, timeout de 30s retorna ao IDLE

### Segurança e Privacidade (LGPD)
- **Zero dados pessoais coletados**
- **Áudio do visitante:** Processado em memória, descartado imediatamente após classificação. Nunca persistido.
- **Sessões anônimas:** Só armazena escolhas binárias + timestamps. Sem IP, sem identificação.
- **O Oráculo enuncia que esquece tudo:** Tecnicamente verdadeiro.

### Acessibilidade
- Experiência primariamente auditiva — funciona para pessoas com deficiência visual
- Volume do headphone ajustável pelo operador
- Timeout generoso (15s) para respostas

---

## 12. Plano de Testes

### Testes Funcionais
- [ ] Todos os 4 caminhos completos (A+Ficar, A+Embora, B+Pisar, B+Contornar)
- [ ] Fallback funciona em cada pergunta (resposta incompreensível)
- [ ] Timeout funciona em cada pergunta (silêncio prolongado)
- [ ] Respostas fora de contexto são tratadas
- [ ] Transições de áudio sem gaps
- [ ] Voice settings mudam corretamente por fase
- [ ] Sessão retorna ao IDLE após encerramento
- [ ] Analytics registram corretamente no Supabase

### Testes de Stress
- [ ] 2-3 sessões simultâneas em estações diferentes
- [ ] Conexão instável (3G/4G) — fallback para áudios pré-gravados
- [ ] Visitante falando durante monólogo (microfone ativo mas ignorado)
- [ ] Visitante não fala nada em nenhuma pergunta (caminho full-timeout)

### Teste de Experiência (com pessoas reais)
- [ ] A pessoa se sente guiada, não interrogada?
- [ ] As pausas estão no timing certo?
- [ ] A ambientação soma ou distrai?
- [ ] A devolução final ressoa com o percurso feito?
- [ ] A experiência toda dura entre 7-10 minutos?

---

## 13. Entregáveis e Fases de Desenvolvimento

### Fase 1 — Fundação (Semana 1)
- Setup do projeto Next.js
- State machine completa (XState) com todos os estados e transições
- Integração ElevenLabs TTS (streaming)
- UI mínima (botão de início + telas por fase)

### Fase 2 — Voz e Interação (Semana 2)
- Integração Whisper STT
- Integração Claude Haiku para classificação NLU
- Fluxo completo de pergunta → escuta → classificação → resposta
- Fallback e timeout handling

### Fase 3 — Áudio e Imersão (Semana 3)
- Sistema de ambientação sonora (Howler.js / Web Audio API)
- Crossfade entre fases
- Voice settings variáveis por fase
- Pré-geração de áudios fixos (backup offline)

### Fase 4 — Analytics e Polish (Semana 4)
- Supabase schema + integração
- Painel admin
- Testes com pessoas reais
- Ajuste fino de timings, pausas, volumes
- Deploy e hardening para o evento

---

## 14. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Internet instável na feira | Alto | Pré-gerar TODOS os áudios dos monólogos. Só classificação precisa de internet. |
| Visitante fala em outro idioma | Médio | Whisper detecta idioma. Claude classifica mesmo assim. Fallback se necessário. |
| ElevenLabs fora do ar | Alto | Cache local de todos os áudios pré-gerados. Experiência funciona 100% offline para monólogos. |
| Ruído ambiente captado pelo mic | Alto | Headphone com mic embutido (isolamento). Noise gate no frontend. |
| Visitante tenta "quebrar" a experiência | Baixo | Máximo 2 fallbacks → timeout redirect. Experiência nunca trava. |
| Latência alta entre fala e resposta | Médio | STT + NLU em paralelo otimizado. Target < 3s. |

---

## 15. Custos Estimados (APIs)

Estimativa para 300 visitantes (10 min cada):

| Serviço | Uso estimado | Custo |
|---------|-------------|-------|
| ElevenLabs TTS | ~50h de áudio total | Plano Creator ($22/mês) ou Scale |
| Whisper API | ~600 transcrições curtas | ~$1-2 total |
| Claude Haiku | ~600 classificações | ~$0.50 total |
| Supabase | Free tier | $0 |
| Vercel | Free/Pro tier | $0-20 |
| **Total estimado** | | **~$25-50** |

---

*"Enquanto houver espaço, corpo, tempo e algum modo de dizer não — eu canto."*
*— Belchior, 1978*
