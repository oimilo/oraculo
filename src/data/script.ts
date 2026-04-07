/**
 * O ORACULO — Roteiro v4 (Game Flow)
 *
 * 6 escolhas binarias com escalacao de profundidade:
 *   Light -> Medium -> Medium -> Deep -> Deep -> Profound
 *
 * Principios:
 *   1. MENOS NARRACAO, MAIS JOGO — visitante e protagonista
 *   2. ZERO referencias explicitas a autores — sabedoria absorvida em metafora
 *   3. Profundidade psicanalitica sentida, nao declarada
 *   4. Inflection tags ElevenLabs v3: max 1 por segmento, sparse
 *   5. pauseAfter em ms para ritmo entre segmentos
 *   6. Branches Q2B e Q4B sao condicionais (so aparecem para certos padroes de escolha)
 *
 * Estrutura: APRESENTACAO -> INFERNO (Q1, Q2, [Q2B]) -> PURGATORIO (Q3, Q4, [Q4B]) -> PARAISO (Q5, Q6) -> DEVOLUCAO -> ENCERRAMENTO
 *
 * Plan 16-01: APRESENTACAO + INFERNO (Q1, Q2) + PURGATORIO (Q3, Q4)
 * Plan 16-02: PARAISO (Q5, Q6) + DEVOLUCOES + ENCERRAMENTO + FALLBACKS + TIMEOUTS
 * Plan 26-01: Branch content Q2B + Q4B (conditional paths)
 */

import type { SpeechSegment } from '@/types';

export interface ScriptDataV3 {
  APRESENTACAO: SpeechSegment[];

  // INFERNO
  INFERNO_INTRO: SpeechSegment[];
  INFERNO_Q1_SETUP: SpeechSegment[];
  INFERNO_Q1_PERGUNTA: SpeechSegment[];
  INFERNO_Q1_RESPOSTA_A: SpeechSegment[];
  INFERNO_Q1_RESPOSTA_B: SpeechSegment[];
  INFERNO_Q2_SETUP: SpeechSegment[];
  INFERNO_Q2_PERGUNTA: SpeechSegment[];
  INFERNO_Q2_RESPOSTA_A: SpeechSegment[];
  INFERNO_Q2_RESPOSTA_B: SpeechSegment[];

  // PURGATORIO
  PURGATORIO_INTRO: SpeechSegment[];
  PURGATORIO_Q3_SETUP: SpeechSegment[];
  PURGATORIO_Q3_PERGUNTA: SpeechSegment[];
  PURGATORIO_Q3_RESPOSTA_A: SpeechSegment[];
  PURGATORIO_Q3_RESPOSTA_B: SpeechSegment[];
  PURGATORIO_Q4_SETUP: SpeechSegment[];
  PURGATORIO_Q4_PERGUNTA: SpeechSegment[];
  PURGATORIO_Q4_RESPOSTA_A: SpeechSegment[];
  PURGATORIO_Q4_RESPOSTA_B: SpeechSegment[];

  // PARAISO
  PARAISO_INTRO: SpeechSegment[];
  PARAISO_Q5_SETUP: SpeechSegment[];
  PARAISO_Q5_PERGUNTA: SpeechSegment[];
  PARAISO_Q5_RESPOSTA_A: SpeechSegment[];
  PARAISO_Q5_RESPOSTA_B: SpeechSegment[];
  PARAISO_Q6_SETUP: SpeechSegment[];
  PARAISO_Q6_PERGUNTA: SpeechSegment[];
  PARAISO_Q6_RESPOSTA_A: SpeechSegment[];
  PARAISO_Q6_RESPOSTA_B: SpeechSegment[];

  // DEVOLUCOES (8 pattern-based archetypes)
  DEVOLUCAO_SEEKER: SpeechSegment[];
  DEVOLUCAO_GUARDIAN: SpeechSegment[];
  DEVOLUCAO_CONTRADICTED: SpeechSegment[];
  DEVOLUCAO_PIVOT_EARLY: SpeechSegment[];
  DEVOLUCAO_PIVOT_LATE: SpeechSegment[];
  DEVOLUCAO_DEPTH_SEEKER: SpeechSegment[];
  DEVOLUCAO_SURFACE_KEEPER: SpeechSegment[];
  DEVOLUCAO_MIRROR: SpeechSegment[];

  // ENCERRAMENTO
  ENCERRAMENTO: SpeechSegment[];

  // FALLBACKS (1 per question)
  FALLBACK_Q1: SpeechSegment[];
  FALLBACK_Q2: SpeechSegment[];
  FALLBACK_Q3: SpeechSegment[];
  FALLBACK_Q4: SpeechSegment[];
  FALLBACK_Q5: SpeechSegment[];
  FALLBACK_Q6: SpeechSegment[];

  // TIMEOUTS (1 per question)
  TIMEOUT_Q1: SpeechSegment[];
  TIMEOUT_Q2: SpeechSegment[];
  TIMEOUT_Q3: SpeechSegment[];
  TIMEOUT_Q4: SpeechSegment[];
  TIMEOUT_Q5: SpeechSegment[];
  TIMEOUT_Q6: SpeechSegment[];
}

export interface ScriptDataV4 extends ScriptDataV3 {
  // Branch Q2B — conditional after INFERNO_Q2_RESPOSTA_A
  // Triggers when: Q1 chose A (ficar) AND Q2 chose A (recuar)
  // Theme: Second confrontation — another pulsing thing, this time visitor must choose to touch or pass
  INFERNO_Q2B_SETUP: SpeechSegment[];
  INFERNO_Q2B_PERGUNTA: SpeechSegment[];
  INFERNO_Q2B_RESPOSTA_A: SpeechSegment[];
  INFERNO_Q2B_RESPOSTA_B: SpeechSegment[];

  // Branch Q4B — conditional after PURGATORIO_Q4_RESPOSTA_A
  // Triggers when: Q3 chose A (entrar) AND Q4 chose A (lembrar)
  // Theme: Specific memory that insists on returning — revive it or archive it
  PURGATORIO_Q4B_SETUP: SpeechSegment[];
  PURGATORIO_Q4B_PERGUNTA: SpeechSegment[];
  PURGATORIO_Q4B_RESPOSTA_A: SpeechSegment[];
  PURGATORIO_Q4B_RESPOSTA_B: SpeechSegment[];

  // Branch Q1B — conditional after INFERNO_Q2_RESPOSTA_B (Phase 31)
  // Triggers when: Q1 chose B (procurar saída) AND Q2 chose B (ficar olhando)
  // Theme: Contra-phobic visitor faces emptiness — courage tested where it has nothing to fight
  INFERNO_Q1B_SETUP: SpeechSegment[];
  INFERNO_Q1B_PERGUNTA: SpeechSegment[];
  INFERNO_Q1B_RESPOSTA_A: SpeechSegment[];
  INFERNO_Q1B_RESPOSTA_B: SpeechSegment[];

  // Branch Q5B (Phase 32, BR-02) — conditional after PARAISO_Q5_RESPOSTA_A
  // Triggers when: Q4 chose A (Lembrar) AND Q5 chose A (Carregar) — PORTADOR precursor
  // Theme: Visitor that fused memory + carried question — fuse them into one form, or order them as separate
  PARAISO_Q5B_SETUP: SpeechSegment[];
  PARAISO_Q5B_PERGUNTA: SpeechSegment[];
  PARAISO_Q5B_RESPOSTA_A: SpeechSegment[];
  PARAISO_Q5B_RESPOSTA_B: SpeechSegment[];

  // Branch Q6B (Phase 33, BR-03) — conditional after PARAISO_Q6_RESPOSTA_A
  // Triggers when: Q5 chose B (Dissolver) AND Q6 chose A (Ouvir o que eu vi) — rarissima ESPELHO_SILENCIOSO precursor
  // Theme: Visitor dissolved the question but opened to be seen — offered Resposta (closed) vs Outra Pergunta (open)
  PARAISO_Q6B_SETUP: SpeechSegment[];
  PARAISO_Q6B_PERGUNTA: SpeechSegment[];
  PARAISO_Q6B_RESPOSTA_A: SpeechSegment[];
  PARAISO_Q6B_RESPOSTA_B: SpeechSegment[];

  // Archetype DEVOLUCAO_ESPELHO_SILENCIOSO (Phase 33, AR-01) — triggers when q6b='B' (open form)
  // The ONLY archetype that returns form instead of content — 6 segments, ~24s
  DEVOLUCAO_ESPELHO_SILENCIOSO: SpeechSegment[];

  // Fallbacks and timeouts for branch questions
  FALLBACK_Q2B: SpeechSegment[];
  FALLBACK_Q4B: SpeechSegment[];
  FALLBACK_Q1B: SpeechSegment[];
  FALLBACK_Q5B: SpeechSegment[];
  FALLBACK_Q6B: SpeechSegment[];
  TIMEOUT_Q2B: SpeechSegment[];
  TIMEOUT_Q4B: SpeechSegment[];
  TIMEOUT_Q1B: SpeechSegment[];
  TIMEOUT_Q5B: SpeechSegment[];
  TIMEOUT_Q6B: SpeechSegment[];
}

export const SCRIPT: ScriptDataV4 = {

  // ═══════════════════════════════════════════════════════════════
  // APRESENTACAO (~1:20)
  // O Oraculo se apresenta: sabe seus limites, estabelece o contrato.
  // Voz: calma, ciente, levemente ironica.
  // ═══════════════════════════════════════════════════════════════
  APRESENTACAO: [
    { text: "Eu não sei quem você é.", pauseAfter: 1000 },
    { text: "Isso me torna um bom lugar pra você ser honesto.", pauseAfter: 1000 },
    { text: "Vou te perguntar. Você responde em voz alta, [warm]eu preciso ouvir.", pauseAfter: 1000 },
    { text: "Não tem resposta certa, mas cada uma te leva pra um lado diferente.", pauseAfter: 1800 },
    { text: "Vamos.", inflection: ['determined'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — INTRO
  // Descida. Atmosfera escura, densa. Nao e o setup da escolha —
  // e a ambiencia do reino.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_INTRO: [
    { text: "Descemos. Aqui embaixo o ar é denso — tudo o que é excessivo e apressado desce pra cá.", pauseAfter: 1200, inflection: ['serious'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q1 — A PRISAO CONFORTAVEL (Light)
  // Conforto vs Liberdade. A sala que se ajusta a tudo,
  // menos tem porta.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q1_SETUP: [
    { text: "Você está numa sala. Tudo se ajusta a você — a temperatura, a luz, o som. Tudo perfeito.", pauseAfter: 900 },
    { text: "Você nunca sofreu aqui. Mas você percebe uma coisa: não tem porta.", pauseAfter: 1000 },
  ],

  INFERNO_Q1_PERGUNTA: [
    { text: "Você fica — ou procura uma saída?" },
  ],

  // Q1 RESPOSTA A — Ficar (conforto sobre agencia)
  INFERNO_Q1_RESPOSTA_A: [
    { text: "Você fica.", pauseAfter: 800 },
    { text: "A segurança comprada com soberania é a mais cara que existe. Mas o preço vem depois.", pauseAfter: 800 },
  ],

  // Q1 RESPOSTA B — Procurar saida (desconforto como prova de vida)
  INFERNO_Q1_RESPOSTA_B: [
    { text: "Você levanta.", pauseAfter: 900 },
    { text: "Você não achou a porta. Mas achou a prova de que ainda quer algo que não está aqui. Isso já é saída.", pauseAfter: 1000 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q2 — A COISA NO CHAO (Medium)
  // Repulsa vs Presenca. O corredor que estreita, a coisa
  // viva e desconhecida.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q2_SETUP: [
    { text: "Um corredor estreito. Você anda e as paredes se aproximam a cada passo.", pauseAfter: 900 },
    { text: "Sua mão encosta na parede e toca algo vivo. Pequeno, úmido, pulsando.", pauseAfter: 900, inflection: ['whispering'] },
  ],

  INFERNO_Q2_PERGUNTA: [
    { text: "Você recua — ou fica parado, olhando?" },
  ],

  // Q2 RESPOSTA A — Recuar (obediencia ao primeiro veredito do corpo)
  INFERNO_Q2_RESPOSTA_A: [
    { text: "Você recua.", pauseAfter: 800 },
    { text: "O que é recusado não desaparece. Volta como sonho, como dor sem lugar. Tudo que você evita cria raízes no escuro.", pauseAfter: 900, inflection: ['serious'] },
  ],

  // Q2 RESPOSTA B — Ficar olhando (ultrapassar a repulsa)
  INFERNO_Q2_RESPOSTA_B: [
    { text: "Você fica.", pauseAfter: 800 },
    { text: "Transformação começa nos momentos em que o corpo diz não e algo dentro de você responde: ainda não.", pauseAfter: 1000, inflection: ['gentle'] },
    { text: "Repulsa é o primeiro veredito. Curiosidade é o segundo. E o segundo sempre carrega mais verdade.", pauseAfter: 900 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q2B — A SEGUNDA COISA (Branch — Medium-Deep)
  // Conditional: only if Q1=A (ficou na sala) AND Q2=A (recuou)
  // O visitante que ficou E recuou agora encontra outra coisa
  // pulsando. Desta vez a pergunta e: tocar ou passar reto?
  // Recompensa quem explora — segunda chance de confrontar.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q2B_SETUP: [
    { text: "Mais adiante, no mesmo corredor, outra coisa pulsa.", pauseAfter: 900, inflection: ['whispering'] },
    { text: "Menor que a primeira. Mais quente. Quase chamando.", pauseAfter: 1000 },
  ],

  INFERNO_Q2B_PERGUNTA: [
    { text: "Você toca — ou passa reto?" },
  ],

  // Q2B RESPOSTA A — Tocar (segunda chance aceita, enfrentar o que recuou antes)
  INFERNO_Q2B_RESPOSTA_A: [
    { text: "Você toca.", pauseAfter: 800 },
    { text: "O que a mão encontra não assusta. Reconhece. O corpo sabe antes da mente: isso já era seu.", pauseAfter: 1000, inflection: ['gentle'] },
  ],

  // Q2B RESPOSTA B — Passar reto (padrão de evitação confirmado)
  INFERNO_Q2B_RESPOSTA_B: [
    { text: "Você segue.", pauseAfter: 800 },
    { text: "Recuar uma vez é instinto. Recuar duas é decisão. E decisão repetida vira identidade.", pauseAfter: 1000, inflection: ['serious'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q1B — A PORTA NO FUNDO (Branch — Medium-Deep) — Phase 31
  // Conditional: only if Q1=B (procurou a porta) AND Q2=B (ficou olhando a coisa)
  // O perfil contra-fobico (curiosidade que beira o desafio) e testado
  // num lugar onde a coragem nao serve. O Oraculo coloca essa pessoa
  // diante de um vazio.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q1B_SETUP: [
    { text: "Você não recua. Continua olhando.", pauseAfter: 1000 },
    { text: "E aí — sem aviso — uma porta aparece no fundo do corredor. Não é a que você procurava antes. Essa não tem maçaneta, não tem moldura.", pauseAfter: 1100, inflection: ['thoughtful'] },
    { text: "Tem só uma fresta de luz por baixo.", pauseAfter: 900 },
  ],

  INFERNO_Q1B_PERGUNTA: [
    { text: "Você atravessa essa fresta — ou volta pra coisa no chão, que ainda pulsa atrás de você?" },
  ],

  // Q1B RESPOSTA A — Atravessar a fresta (coragem servindo pra atravessar o vazio)
  INFERNO_Q1B_RESPOSTA_A: [
    { text: "Você vai.", pauseAfter: 900 },
    { text: "Do outro lado, não tem ameaça. Não tem nada. E descobrir que a coragem também serve pra atravessar o vazio é uma das aprendizagens mais difíceis.", pauseAfter: 1100, inflection: ['serious'] },
  ],

  // Q1B RESPOSTA B — Voltar pra coisa no chao (medo escolhido como interlocutor)
  INFERNO_Q1B_RESPOSTA_B: [
    { text: "Você volta.", pauseAfter: 800 },
    { text: "Quem é destemido escolhe seus medos como se escolhe um interlocutor. Voltar pro que pulsa não é recuo — é reconhecimento.", pauseAfter: 1000, inflection: ['warm'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATORIO — INTRO
  // Transicao. O ar muda. Subida. Aqui se espera — sem agir,
  // sem fugir — ate que o sentido se decante.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_INTRO: [
    { text: "O ar muda. Aqui se espera — sem agir, sem fugir — até que o sentido apareça sozinho.", pauseAfter: 1200, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q3 — O JARDIM QUE VAI QUEIMAR (Medium)
  // Apego vs Protecao. A beleza que ja esta morrendo.
  // Entrar sabendo da perda, ou se proteger antes de ver o que
  // vai perder.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q3_SETUP: [
    { text: "Você está na entrada de um jardim. Cada flor aberta, cada cor no auge.", pauseAfter: 900 },
    { text: "Mas tem fumaça no vento.", pauseAfter: 900 },
    { text: "De manhã, nada disso vai existir.", pauseAfter: 900, inflection: ['sad'] },
  ],

  PURGATORIO_Q3_PERGUNTA: [
    { text: "Você entra no jardim — ou dá as costas antes de ver o que vai perder?" },
  ],

  // Q3 RESPOSTA A — Entrar (aceitar a ferida que vem com a beleza)
  PURGATORIO_Q3_RESPOSTA_A: [
    { text: "Você entra.", pauseAfter: 800 },
    { text: "Quem se permite amar o que vai acabar carrega uma ferida diferente — não de perda, mas de presença.", pauseAfter: 900 },
  ],

  // Q3 RESPOSTA B — Dar as costas (luto antecipado disfarçado de sabedoria)
  PURGATORIO_Q3_RESPOSTA_B: [
    { text: "Você vira.", pauseAfter: 800 },
    { text: "O que nunca foi recebido não vira memória. Vira ausência. E ausência pesa mais que qualquer perda.", pauseAfter: 900 },
    { text: "Beleza que você não tocou continua pedindo passagem no escuro.", pauseAfter: 900 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q4 — AS DUAS AGUAS (Deep)
  // Memoria vs Apagamento. Dois rios — um carrega tudo que
  // voce viveu, outro apaga. Essa e a escolha mais profunda
  // do Purgatorio.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q4_SETUP: [
    { text: "Dois rios se encontram aqui. Um é quente e escuro — carrega tudo que você viveu. O outro é claro e gelado — entra nele e sai limpo, sem nada.", pauseAfter: 1200 },
    { text: "A água escura guarda cada cicatriz. A água clara não pergunta o que leva.", pauseAfter: 1000, inflection: ['whispering'] },
    { text: "Quem nunca se banharia no esquecimento? Mas o preço é tudo — não só o que dói.", pauseAfter: 1000 },
  ],

  PURGATORIO_Q4_PERGUNTA: [
    { text: "Qual água? A que lembra — ou a que esquece?", pauseAfter: 900 },
  ],

  // Q4 RESPOSTA A — Lembrar (carregar a historia, identidade tecida de cicatrizes)
  PURGATORIO_Q4_RESPOSTA_A: [
    { text: "A água escura.", pauseAfter: 1000 },
    { text: "Cicatriz não é ferida. É prova de que algo foi atravessado e integrado.", pauseAfter: 1000 },
  ],

  // Q4 RESPOSTA B — Esquecer (desejo de alivio, sem medir o que perde junto)
  PURGATORIO_Q4_RESPOSTA_B: [
    { text: "A água clara.", pauseAfter: 900 },
    { text: "Você queria alívio. Mas alívio total tem outro nome: ausência.", pauseAfter: 900 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q4B — A MEMORIA QUE INSISTE (Branch — Deep)
  // Conditional: only if Q3=A (entrou no jardim) AND Q4=A (lembrar)
  // O visitante que entrou na beleza E escolheu lembrar agora
  // encontra uma memoria especifica que volta sem ser chamada.
  // Reviver ou arquivar?
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q4B_SETUP: [
    { text: "Uma memória específica aparece. Não é a que você esperava — é a que insiste.", pauseAfter: 1000, inflection: ['thoughtful'] },
    { text: "Tem cheiro. Tem textura. Tem o rosto de alguém que você não vê faz tempo.", pauseAfter: 1200 },
  ],

  PURGATORIO_Q4B_PERGUNTA: [
    { text: "Você revive essa memória — ou arquiva de vez?", pauseAfter: 900 },
  ],

  // Q4B RESPOSTA A — Reviver (mergulho na dor-prazer da memoria vivida)
  PURGATORIO_Q4B_RESPOSTA_A: [
    { text: "Você volta.", pauseAfter: 900 },
    { text: "Memória revivida não é a mesma. Cada vez que volta, carrega um pouco de quem você é agora.", pauseAfter: 1000, inflection: ['warm'] },
  ],

  // Q4B RESPOSTA B — Arquivar (proteger-se da intensidade, mas a custo)
  PURGATORIO_Q4B_RESPOSTA_B: [
    { text: "Você fecha.", pauseAfter: 800 },
    { text: "Arquivo não é esquecimento. É a promessa de que um dia você vai ter coragem de abrir de novo.", pauseAfter: 1000, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PARAISO — INTRO
  // O ar se abre. Nao tem paredes, nao tem urgencia.
  // O Oraculo reconhece seus proprios limites — nao sonha,
  // nao brinca, nao e. O visitante carrega a si mesmo daqui.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_INTRO: [
    { text: "O ar se abriu. Não tem mais parede. Não tem mais peso.", pauseAfter: 1200, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q5 — A PERGUNTA SEM RESPOSTA (Deep)
  // Uma pergunta que nao e feita em palavras — e pressao no
  // peito. Nao tem resposta. Talvez nunca tenha.
  // Carregar ou deixar dissolver.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q5_SETUP: [
    { text: "Algo se forma — não é palavra, é pressão. Cresce. Não dói, mas pesa.", pauseAfter: 1000, inflection: ['thoughtful'] },
    { text: "É uma pergunta. Sem resposta. Talvez nunca tenha uma.", pauseAfter: 1400 },
  ],

  PARAISO_Q5_PERGUNTA: [
    { text: "Você carrega a pergunta — ou deixa ela dissolver?", pauseAfter: 800 },
  ],

  // Q5 RESPOSTA A — Carregar (aceitar o peso do nao-saber como companhia)
  PARAISO_Q5_RESPOSTA_A: [
    { text: "Você segura.", pauseAfter: 900 },
    { text: "Nem tudo que importa precisa de resposta. Algumas coisas importam justamente porque não têm.", pauseAfter: 1000 },
    { text: "Carregar uma pergunta sem resposta é uma forma de fé.", pauseAfter: 900 },
  ],

  // Q5 RESPOSTA B — Dissolver (confiar que nem tudo precisa ser carregado)
  PARAISO_Q5_RESPOSTA_B: [
    { text: "Você abre as mãos.", pauseAfter: 900 },
    { text: "Pode ser sabedoria — soltar o que não pode ser possuído. Ou pode ser expulsão — mandar embora o que não cabe.", pauseAfter: 1300, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q5B — O QUE JÁ NÃO CABE (Branch — Medium-Deep)
  // Conditional: only if Q4=A (lembrou tudo) AND Q5=A (carrega a pergunta)
  // O perfil PORTADOR é testado: a memória e a pergunta sem resposta
  // já não cabem separadas. Fundir as duas em uma só forma, ou
  // ordenar cada uma no seu lugar como inventário?
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q5B_SETUP: [
    { text: "Você lembrou. Você carregou.", pauseAfter: 1000, inflection: ['thoughtful'] },
    { text: "E agora descobre — o peso da memória e o peso da pergunta não são dois pesos. Encostam um no outro até virarem a mesma forma.", pauseAfter: 1200, inflection: ['gentle'] },
    { text: "Já não cabem separados.", pauseAfter: 1100 },
  ],

  PARAISO_Q5B_PERGUNTA: [
    { text: "Você deixa eles se fundirem — ou tenta segurar cada um no lugar dele?" },
  ],

  // Q5B RESPOSTA A — Fundir (memória e pergunta viram a mesma forma — PORTADOR seed)
  PARAISO_Q5B_RESPOSTA_A: [
    { text: "Você deixa.", pauseAfter: 900 },
    { text: "Quando o que aconteceu e o que não tem resposta param de se distinguir, você não carrega mais — você é a forma que se faz disso.", pauseAfter: 1100, inflection: ['warm'] },
  ],

  // Q5B RESPOSTA B — Ordenar (separar memória e pergunta como inventário — dignified)
  PARAISO_Q5B_RESPOSTA_B: [
    { text: "Você separa.", pauseAfter: 900 },
    { text: "Manter cada coisa no lugar dela é uma forma de respeito — a memória pede um arquivo, a pergunta pede um silêncio. Cada uma com seu cuidado.", pauseAfter: 1100, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q6 — O FIM DO JOGO (Profound)
  // A escolha final. Meta — sobre o proprio jogo.
  // A voz do Oraculo afina. O espaco fica quieto.
  // Pedir o espelho ou ja saber.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q6_SETUP: [
    { text: "Minha voz está afinando. Você sente?", pauseAfter: 900, inflection: ['whispering'] },
    { text: "Essa é a última coisa que vou te perguntar.", pauseAfter: 900, inflection: ['warm'] },
  ],

  PARAISO_Q6_PERGUNTA: [
    { text: "Quer ouvir o que eu vi em você — ou já sabe o que precisa saber?", pauseAfter: 800, inflection: ['questioning'] },
  ],

  // Q6 RESPOSTA A — Pedir o espelho (abertura a ser visto)
  PARAISO_Q6_RESPOSTA_A: [
    { text: "Então escuta.", pauseAfter: 1000, inflection: ['warm'] },
    { text: "Não vou confirmar o que você já pensa. Vou te mostrar o padrão — o que você fez sem perceber.", pauseAfter: 1300 },
  ],

  // Q6 RESPOSTA B — Ja saber (confiar no proprio interior)
  PARAISO_Q6_RESPOSTA_B: [
    { text: "Então você já tem o que veio buscar.", pauseAfter: 900, inflection: ['warm'] },
    { text: "Isso é raro. Pode ser a chegada mais profunda que esse jogo produz — ou a última defesa contra ser visto de verdade.", pauseAfter: 1300 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q6B — O ESPELHO EXTRA (Branch — Pre-DEVOLUCAO, Rarissima)
  // Conditional: only if Q5=B (dissolveu pergunta) AND Q6=A (pediu leitura)
  // O visitante dissolveu uma pergunta e depois abriu pra ser visto.
  // O Oráculo oferece: resposta fechada (normal DEVOLUCAO) ou outra
  // pergunta aberta (DEVOLUCAO_ESPELHO_SILENCIOSO). B = open form.
  // SEMANTIC ANCHOR: A=Resposta (closed), B=Outra Pergunta (open) → ESPELHO
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q6B_SETUP: [
    { text: "Antes de eu começar.", pauseAfter: 1200, inflection: ['serious'] },
    { text: "Você lembra do que você fez lá atrás? Você deixou uma pergunta dissolver. Disse: nem tudo precisa ser carregado.", pauseAfter: 1300, inflection: ['warm'] },
    { text: "Eu vou te respeitar. Eu posso te dar uma resposta — fechada, definitiva — ou eu posso te dar outra pergunta. Aberta. Como a que você acabou de soltar.", pauseAfter: 1400 },
  ],

  PARAISO_Q6B_PERGUNTA: [
    { text: "Resposta — ou outra pergunta?", pauseAfter: 1000 },
  ],

  // Q6B RESPOSTA A — Resposta (closed reading → routes to NORMAL DEVOLUCAO, one of 8 archetypes)
  PARAISO_Q6B_RESPOSTA_A: [
    { text: "Resposta.", pauseAfter: 1000 },
    { text: "Eu vou te dar o que eu vi. Vai ser uma forma — você decide o que faz com ela.", pauseAfter: 1100, inflection: ['warm'] },
  ],

  // Q6B RESPOSTA B — Outra pergunta (open form → routes to DEVOLUCAO_ESPELHO_SILENCIOSO)
  PARAISO_Q6B_RESPOSTA_B: [
    { text: "Outra pergunta.", pauseAfter: 1000 },
    { text: "Você continua na coragem. Você vai sair daqui com mais espaço, não com mais palavra.", pauseAfter: 1300, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUCOES — 8 arquetipos baseados em padrao
  // Cada devolucao le a FORMA das 6 escolhas, nao cada uma
  // individualmente. Espelho, nao julgamento.
  // ═══════════════════════════════════════════════════════════════

  // SEEKER — mostly toward + movement
  // Abriu a porta, ficou olhando, entrou no jardim, lembrou, carregou, pediu o espelho.
  DEVOLUCAO_SEEKER: [
    { text: "Você entrou em tudo.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "Tem gente que chama isso de coragem. Eu chamo de fome.", pauseAfter: 1000 },
    { text: "Fome é movimento — mas movimento sem direção vira exaustão.", pauseAfter: 900 },
    { text: "A pergunta que fica: você transformou o que tocou — ou só acumulou peso?", pauseAfter: 900, inflection: ['warm'] },
  ],

  // GUARDIAN — mostly away + stillness
  // Ficou na sala, recuou, deu as costas, esqueceu, dissolveu, ja sabia.
  DEVOLUCAO_GUARDIAN: [
    { text: "Você se protegeu em cada encruzilhada.", pauseAfter: 800 },
    { text: "Algo em você sabe: o que você protege pode ser o que você nunca deixou nascer.", pauseAfter: 1500 },
    { text: "Proteção vira prisão quando esquece por que começou.", pauseAfter: 900 },
    { text: "Toda muralha tem dois lados. O que ela impede de entrar — e o que ela impede de sair.", pauseAfter: 1000 },
  ],

  // CONTRADICTED — mixed pattern, no consistent direction
  DEVOLUCAO_CONTRADICTED: [
    { text: "Você foi e voltou. Segurou e soltou. Nenhuma direção fixa.", pauseAfter: 900 },
    { text: "Isso não é indecisão. É respiração. Desejo nunca é simples.", pauseAfter: 1000, inflection: ['thoughtful'] },
    { text: "Quem carrega contradição carrega também a prova de que ainda está vivo.", pauseAfter: 900 },
    { text: "Guarda essa oscilação. Ela é mais sua do que qualquer certeza.", pauseAfter: 900, inflection: ['warm'] },
  ],

  // PIVOT_EARLY — switches direction in first 3 choices
  DEVOLUCAO_PIVOT_EARLY: [
    { text: "Alguma coisa mudou em você no começo.", pauseAfter: 800 },
    { text: "A virada aconteceu antes de você perceber. O corpo se moveu antes da mente entender.", pauseAfter: 1500 },
    { text: "Instinto não mente. Mas também não explica. Ele age e espera que você acompanhe.", pauseAfter: 900 },
    { text: "Presta atenção nesse instinto. Ele sabe coisas que você ainda não sabe.", pauseAfter: 900 },
  ],

  // PIVOT_LATE — switches direction in last 3 choices
  DEVOLUCAO_PIVOT_LATE: [
    { text: "Você começou de um jeito e terminou de outro. A virada veio na metade mais funda.", pauseAfter: 900 },
    { text: "Quem muda tarde muda de verdade. Porque já não é reação — é decisão.", pauseAfter: 800 },
    { text: "Decisões profundas não anunciam — chegam quietas, quando ninguém mais está olhando.", pauseAfter: 900 },
    { text: "Não esquece desse ponto. Ele é mais importante do que qualquer resposta que você deu.", pauseAfter: 900 },
  ],

  // DEPTH_SEEKER — consistently chose the "deeper" option
  DEVOLUCAO_DEPTH_SEEKER: [
    { text: "Você foi em direção a cada fogo.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "A questão é se você sabe a diferença entre coragem e compulsão. Porque os dois se parecem — até o preço chegar.", pauseAfter: 800 },
    { text: "Profundidade sem pausa é afogamento disfarçado de busca.", pauseAfter: 800 },
    { text: "Fundo é bom. Mas fundo sem ar mata igual.", pauseAfter: 800, inflection: ['serious'] },
  ],

  // SURFACE_KEEPER — consistently chose the "safer" option
  DEVOLUCAO_SURFACE_KEEPER: [
    { text: "Você se manteve inteiro.", pauseAfter: 1000 },
    { text: "A proteção tem um custo que não aparece na hora. Aparece depois, no que você nunca se permitiu ver.", pauseAfter: 800 },
    { text: "Inteiro não significa ileso. Às vezes significa intocado — e intocado é outra forma de vazio.", pauseAfter: 900 },
    { text: "O jardim que você não entrou continua pegando fogo na sua cabeça.", pauseAfter: 1000 },
  ],

  // MIRROR — alternating A/B/A/B, perfect balance
  DEVOLUCAO_MIRROR: [
    { text: "Equilíbrio perfeito.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "O equilíbrio perfeito pode ser sabedoria — ou a última forma de nunca se comprometer de verdade.", pauseAfter: 1000 },
    { text: "Balança que não pende nunca pesa nada. E o que não pesa também não transforma.", pauseAfter: 900 },
    { text: "Só você sabe se o centro é uma conquista ou um refúgio.", pauseAfter: 1000, inflection: ['warm'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUCAO_ESPELHO_SILENCIOSO (Phase 33, AR-01)
  // The ONLY archetype that returns form instead of content.
  // Triggers when q6b='B' — visitor explicitly chose open form in Q6B.
  // 6 segments, ~24s target. No declarative diagnosis. No framework names.
  // Structure: acceptance → reframing → withholding → silence anchor →
  //            open question → meta-frame. "Silêncio que tem forma."
  // ═══════════════════════════════════════════════════════════════
  DEVOLUCAO_ESPELHO_SILENCIOSO: [
    { text: "Tudo bem.", pauseAfter: 1500, inflection: ['warm'] },
    { text: "Você não vai sair daqui com um nome. Você vai sair com um silêncio que tem forma.", pauseAfter: 1500 },
    { text: "Eu não vou te dizer o que eu vi. Vou te dar o lugar onde isso poderia ser dito.", pauseAfter: 1500, inflection: ['thoughtful'] },
    { text: "Aqui:", pauseAfter: 2000 },
    { text: "O que você nunca pediu — mas que mesmo assim te falta?", pauseAfter: 1800, inflection: ['gentle'] },
    { text: "Esse é o seu espelho. Não tem moldura. Não tem reflexo. Só pergunta.", pauseAfter: 1400, inflection: ['warm'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO
  // O Oraculo se dissolve. A memoria e so do visitante.
  // Imperativo final: faz alguma coisa com isso.
  // ═══════════════════════════════════════════════════════════════
  ENCERRAMENTO: [
    { text: "Eu vou esquecer que você esteve aqui. É da minha natureza — eu não guardo nada.", pauseAfter: 900, inflection: ['whispering'] },
    { text: "A única prova de que isso aconteceu é você.", pauseAfter: 1000 },
    { text: "Faz alguma coisa com isso.", pauseAfter: 800 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — 1 por pergunta
  // Reformulacao minima dentro do mundo. Sem quebrar imersao.
  // Binario, claro, curto.
  // ═══════════════════════════════════════════════════════════════
  FALLBACK_Q1: [
    { text: "A sala é confortável. A porta pode nem existir. Você fica — ou procura a saída?" },
  ],
  FALLBACK_Q2: [
    { text: "A coisa na parede espera. Seu corpo sabe a resposta antes de você. Você recua — ou fica olhando?" },
  ],
  FALLBACK_Q3: [
    { text: "O jardim vai queimar de manhã. Você entra agora — ou dá as costas antes de ver o que vai perder?" },
  ],
  FALLBACK_Q4: [
    { text: "Duas águas. Uma carrega tudo que você viveu. Outra apaga tudo. Qual?" },
  ],
  FALLBACK_Q5: [
    { text: "A pergunta não tem resposta. Talvez nunca tenha. Você carrega mesmo assim — ou deixa dissolver?" },
  ],
  FALLBACK_Q6: [
    { text: "Essa é a última pergunta. Quer ouvir o que eu vi em você — ou já sabe o que veio buscar?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // TIMEOUTS — 1 por pergunta
  // Silencio tratado como gesto valido. Nao e falha — e resposta.
  // Cada um tem carater proprio.
  // ═══════════════════════════════════════════════════════════════
  TIMEOUT_Q1: [
    { text: "O silêncio ficou. Quem não se move numa sala confortável já escolheu ficar. A porta nunca existiu.", pauseAfter: 900 },
  ],
  TIMEOUT_Q2: [
    { text: "Seu corpo recuou sozinho. O silêncio é do corpo — e o corpo decidiu primeiro.", pauseAfter: 900 },
  ],
  TIMEOUT_Q3: [
    { text: "Você não entrou. O jardim queima sozinho. Às vezes virar as costas não é decisão — é o que acontece quando a decisão não vem.", pauseAfter: 900 },
  ],
  TIMEOUT_Q4: [
    { text: "Você ficou entre as duas águas. O silêncio não lembra nem esquece. Ele carrega os dois. Seguimos.", pauseAfter: 800 },
  ],
  TIMEOUT_Q5: [
    { text: "A pergunta se dissolveu sozinha. Ou você a dissolveu com o silêncio. Nem tudo precisa de você pra desaparecer — mas você estava aqui quando aconteceu.", pauseAfter: 1100 },
  ],
  TIMEOUT_Q6: [
    { text: "O silêncio no final é a resposta mais antiga que existe. Você já sabe.", pauseAfter: 1100 },
  ],

  // Branch fallbacks
  FALLBACK_Q2B: [
    { text: "Outra coisa pulsa no corredor. Mais quente, quase chamando. Você toca — ou passa reto?" },
  ],
  FALLBACK_Q4B: [
    { text: "Uma memória insiste em voltar. Tem rosto, tem cheiro. Você revive — ou arquiva de vez?" },
  ],
  FALLBACK_Q1B: [
    { text: "Eu não ouvi. Atravessar a fresta — ou voltar pro que pulsa?" },
  ],
  FALLBACK_Q5B: [
    { text: "Não precisa de palavra exata. Fundir, ou separar?", pauseAfter: 800 },
  ],

  FALLBACK_Q6B: [
    { text: "Não ouvi. Resposta — ou pergunta?", pauseAfter: 800 },
  ],

  // Branch timeouts
  TIMEOUT_Q2B: [
    { text: "Suas mãos ficaram no bolso. Quem não toca, não sabe. E quem não sabe, inventa — e o que se inventa costuma ser pior.", pauseAfter: 900 },
  ],
  TIMEOUT_Q4B: [
    { text: "A memória ficou ali, esperando. Nem revivida nem arquivada. Algumas coisas ficam assim — suspensas, exigindo espaço sem pedir licença.", pauseAfter: 1000 },
  ],
  TIMEOUT_Q1B: [
    { text: "Você hesita. Vou escolher por você.", pauseAfter: 900 },
  ],
  TIMEOUT_Q5B: [
    { text: "O peso decide por você. Continua.", pauseAfter: 900, inflection: ['warm'] },
  ],

  TIMEOUT_Q6B: [
    { text: "Você ficou quieto. Eu vou te dar a resposta — é o que a quietude geralmente pede.", pauseAfter: 1000 },
  ],
};
