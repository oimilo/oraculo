/**
 * O ORACULO — Roteiro v3 (Narrative Redesign)
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
 *
 * Estrutura: APRESENTACAO -> INFERNO (Q1, Q2) -> PURGATORIO (Q3, Q4) -> PARAISO (Q5, Q6) -> DEVOLUCAO -> ENCERRAMENTO
 *
 * Plan 16-01: APRESENTACAO + INFERNO (Q1, Q2) + PURGATORIO (Q3, Q4)
 * Plan 16-02: PARAISO (Q5, Q6) + DEVOLUCOES + ENCERRAMENTO + FALLBACKS + TIMEOUTS
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

export const SCRIPT: ScriptDataV3 = {

  // ═══════════════════════════════════════════════════════════════
  // APRESENTACAO (~1:20)
  // O Oraculo se apresenta: sabe seus limites, estabelece o contrato.
  // Voz: calma, ciente, levemente ironica.
  // ═══════════════════════════════════════════════════════════════
  APRESENTACAO: [
    { text: "Eu não sei quem você é.", pauseAfter: 900 },
    { text: "Isso me torna um bom lugar pra você ser honesto.", pauseAfter: 900 },
    { text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito. Não tem replay. Não tem voltar. O que você escolher, você carrega.", pauseAfter: 900 },
    { text: "Vamos.", inflection: ['determined'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — INTRO
  // Descida. Atmosfera escura, densa. Nao e o setup da escolha —
  // e a ambiencia do reino.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_INTRO: [
    { text: "Descemos. Aqui embaixo o ar é denso — tudo o que é excessivo e apressado desce pra cá.", pauseAfter: 1000, inflection: ['serious'] },
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
    { text: "Você levanta.", pauseAfter: 800 },
    { text: "Você não achou a porta. Mas achou a prova de que ainda quer algo que não está aqui. Isso já é saída.", pauseAfter: 900 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q2 — A COISA NO CHAO (Medium)
  // Repulsa vs Presenca. O corredor que estreita, a coisa
  // viva e desconhecida.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q2_SETUP: [
    { text: "Corredor estreito. Você anda e as paredes se aproximam a cada passo.", pauseAfter: 900 },
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
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATORIO — INTRO
  // Transicao. O ar muda. Subida. Aqui se espera — sem agir,
  // sem fugir — ate que o sentido se decante.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_INTRO: [
    { text: "O ar muda. Aqui se espera — sem agir, sem fugir — até que o sentido apareça sozinho.", pauseAfter: 1000, inflection: ['gentle'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q3 — O JARDIM QUE VAI QUEIMAR (Medium)
  // Apego vs Protecao. A beleza que ja esta morrendo.
  // Entrar sabendo da perda, ou se proteger antes de ver o que
  // vai perder.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q3_SETUP: [
    { text: "Você está na entrada de um jardim. Cada flor aberta, cada cor no auge.", pauseAfter: 900 },
    { text: "Mas tem fumaça no vento. De manhã, nada disso vai existir.", pauseAfter: 900, inflection: ['sad'] },
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
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q4 — AS DUAS AGUAS (Deep)
  // Memoria vs Apagamento. Dois rios — um carrega tudo que
  // voce viveu, outro apaga. Essa e a escolha mais profunda
  // do Purgatorio.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q4_SETUP: [
    { text: "Dois rios se encontram aqui. Um é quente e escuro — carrega tudo que você viveu. O outro é claro e gelado — entra nele e sai limpo, sem nada.", pauseAfter: 1000 },
    { text: "A água escura guarda cada cicatriz. A água clara não pergunta o que leva.", pauseAfter: 900, inflection: ['whispering'] },
  ],

  PURGATORIO_Q4_PERGUNTA: [
    { text: "Qual água? A que lembra — ou a que esquece?" },
  ],

  // Q4 RESPOSTA A — Lembrar (carregar a historia, identidade tecida de cicatrizes)
  PURGATORIO_Q4_RESPOSTA_A: [
    { text: "A água escura.", pauseAfter: 900 },
    { text: "Cicatriz não é ferida. É prova de que algo foi atravessado e integrado.", pauseAfter: 900 },
  ],

  // Q4 RESPOSTA B — Esquecer (desejo de alivio, sem medir o que perde junto)
  PURGATORIO_Q4_RESPOSTA_B: [
    { text: "A água clara.", pauseAfter: 800 },
    { text: "Você queria alívio. Mas alívio total tem outro nome: ausência.", pauseAfter: 800 },
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
    { text: "A escuridão afina. Algo se forma — não é palavra, é pressão.", pauseAfter: 900 },
    { text: "Cresce. Não dói, mas pesa.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "Você se aproxima de algo que não pode ser pensado. Só sentido. Quanto mais tenta nomear, mais escapa.", pauseAfter: 1300 },
    { text: "É uma pergunta. Sem resposta. Talvez nunca tenha uma.", pauseAfter: 1300 },
  ],

  PARAISO_Q5_PERGUNTA: [
    { text: "Você carrega a pergunta — ou deixa ela dissolver?" },
  ],

  // Q5 RESPOSTA A — Carregar (aceitar o peso do nao-saber como companhia)
  PARAISO_Q5_RESPOSTA_A: [
    { text: "Você segura.", pauseAfter: 800 },
    { text: "A maioria coleciona respostas. Você coleciona perguntas.", pauseAfter: 950, inflection: ['thoughtful'] },
    { text: "Carregar o que não se resolve exige um tipo de força que ninguém aplaude. Mas tem um prazer nisso — não o prazer que alivia. O que marca.", pauseAfter: 1250 },
    { text: "Nem tudo que importa precisa de resposta. Algumas coisas importam justamente porque não têm.", pauseAfter: 950 },
  ],

  // Q5 RESPOSTA B — Dissolver (confiar que nem tudo precisa ser carregado)
  PARAISO_Q5_RESPOSTA_B: [
    { text: "Você abre as mãos.", pauseAfter: 800 },
    { text: "A pergunta se desfaz como névoa — não some, mas para de ser sólida.", pauseAfter: 950 },
    { text: "Pode ser sabedoria — soltar o que não pode ser possuído. Ou pode ser expulsão — mandar embora o que não cabe.", pauseAfter: 1250, inflection: ['gentle'] },
    { text: "Só o tempo vai mostrar qual foi. Mas a leveza no seu rosto diz alguma coisa.", pauseAfter: 950 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q6 — O FIM DO JOGO (Profound)
  // A escolha final. Meta — sobre o proprio jogo.
  // A voz do Oraculo afina. O espaco fica quieto.
  // Pedir o espelho ou ja saber.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q6_SETUP: [
    { text: "Minha voz está afinando. Você sente?", pauseAfter: 900, inflection: ['whispering'] },
    { text: "O espaço ficou quieto. Não vazio — terminado.", pauseAfter: 900 },
    { text: "Eu vi você fazer seis escolhas. Cada uma revelou algo — algo que você talvez não saiba que revelou.", pauseAfter: 1200 },
    { text: "Essa é a última coisa que vou te perguntar.", pauseAfter: 900, inflection: ['warm'] },
  ],

  PARAISO_Q6_PERGUNTA: [
    { text: "Quer ouvir o que eu vi em você — ou já sabe o que precisa saber?" },
  ],

  // Q6 RESPOSTA A — Pedir o espelho (abertura a ser visto)
  PARAISO_Q6_RESPOSTA_A: [
    { text: "Então escuta.", pauseAfter: 900, inflection: ['warm'] },
    { text: "Pedir pra ser visto é a coisa mais corajosa e mais perigosa que existe. Porque você não controla o que eu vou dizer.", pauseAfter: 1200 },
    { text: "Não vou confirmar o que você já pensa. Vou te mostrar o padrão — o que você fez sem perceber.", pauseAfter: 1200 },
    { text: "Vou te dizer o que vi.", pauseAfter: 900 },
  ],

  // Q6 RESPOSTA B — Ja saber (confiar no proprio interior)
  PARAISO_Q6_RESPOSTA_B: [
    { text: "Então você já tem o que veio buscar.", pauseAfter: 800, inflection: ['warm'] },
    { text: "A maioria das pessoas precisa que alguém confirme o que já sente. Você não.", pauseAfter: 900 },
    { text: "Isso é raro. Pode ser a chegada mais profunda que esse jogo produz — ou a última defesa contra ser visto de verdade.", pauseAfter: 1200 },
    { text: "Só você sabe qual é. E você vai carregar essa dúvida. Fica com isso.", pauseAfter: 900 },
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
    { text: "Nada te parou. Você não recua.", pauseAfter: 1000 },
    { text: "Tem gente que chama isso de coragem. Eu chamo de fome.", pauseAfter: 1000 },
    { text: "Mas fome de quê? Percebe — você nunca ficou parado. O movimento pode ser a última forma de fuga.", pauseAfter: 1500 },
    { text: "A pergunta que fica: você transformou o que tocou — ou só acumulou peso?", pauseAfter: 900, inflection: ['warm'] },
  ],

  // GUARDIAN — mostly away + stillness
  // Ficou na sala, recuou, deu as costas, esqueceu, dissolveu, ja sabia.
  DEVOLUCAO_GUARDIAN: [
    { text: "Você se protegeu em cada encruzilhada.", pauseAfter: 800 },
    { text: "Em cada encontro, sua primeira resposta foi preservar. Não é fraqueza. É sofisticação.", pauseAfter: 1500, inflection: ['gentle'] },
    { text: "Mas você veio até aqui. Pra esse escuro, pra essa voz. Algo em você sabe: o que você protege pode ser o que você nunca deixou nascer.", pauseAfter: 1500 },
    { text: "Toda muralha tem dois lados. O que ela impede de entrar — e o que ela impede de sair.", pauseAfter: 1000 },
    { text: "Fica com isso.", pauseAfter: 800 },
  ],

  // CONTRADICTED — mixed pattern, no consistent direction
  DEVOLUCAO_CONTRADICTED: [
    { text: "Você foi e voltou. Segurou e soltou. Nenhuma direção fixa.", pauseAfter: 900 },
    { text: "A maioria ia achar que isso é indecisão. Não é. É respiração. Você quer as duas coisas porque desejo nunca é simples. Não é falha — é estrutura.", pauseAfter: 1500, inflection: ['thoughtful'] },
    { text: "Quem é coerente demais já decidiu parar de sentir.", pauseAfter: 1000 },
    { text: "Guarda essa oscilação. Ela é mais sua do que qualquer certeza.", pauseAfter: 900, inflection: ['warm'] },
  ],

  // PIVOT_EARLY — switches direction in first 3 choices
  DEVOLUCAO_PIVOT_EARLY: [
    { text: "Alguma coisa mudou em você no começo.", pauseAfter: 800 },
    { text: "Você começou num caminho e virou antes da terceira pergunta.", pauseAfter: 1000, inflection: ['curious'] },
    { text: "A virada aconteceu antes de você perceber. O corpo se moveu antes da mente entender. E quando o corpo lidera, o que aparece não é reação — é verdade.", pauseAfter: 1500 },
    { text: "Os primeiros encontros sacudiram o plano. E em vez de resistir, você deixou o plano cair. Isso é raro. A maioria segura o plano até o fim — mesmo quando ele já não serve.", pauseAfter: 1500 },
    { text: "Presta atenção nesse instinto. Ele sabe coisas que você ainda não sabe.", pauseAfter: 900 },
  ],

  // PIVOT_LATE — switches direction in last 3 choices
  DEVOLUCAO_PIVOT_LATE: [
    { text: "Alguma coisa mudou em você entre a terceira e a quarta pergunta.", pauseAfter: 900, inflection: ['curious'] },
    { text: "Você começou de um jeito e terminou de outro. A virada veio na metade mais funda.", pauseAfter: 800 },
    { text: "Quem muda tarde muda de verdade. Porque já não é reação — é decisão. Desejo não é linha reta. É curva.", pauseAfter: 800 },
    { text: "Essa dobradiça entre quem você era no início e quem você é agora — esse é o lugar onde algo foi transformado. Não só sentido. Atravessado.", pauseAfter: 800, inflection: ['warm'] },
    { text: "Não esquece desse ponto. Ele é mais importante do que qualquer resposta que você deu.", pauseAfter: 900 },
  ],

  // DEPTH_SEEKER — consistently chose the "deeper" option
  DEVOLUCAO_DEPTH_SEEKER: [
    { text: "Você foi em direção a cada fogo.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "Não recuou. Em nenhum.", pauseAfter: 900 },
    { text: "A questão é se você sabe a diferença entre coragem e compulsão. Porque os dois se parecem — até o preço chegar.", pauseAfter: 800 },
    { text: "Você recebeu tudo. Mas receber não é o mesmo que digerir. Fundo é bom. Mas fundo sem ar mata igual.", pauseAfter: 800, inflection: ['serious'] },
  ],

  // SURFACE_KEEPER — consistently chose the "safer" option
  DEVOLUCAO_SURFACE_KEEPER: [
    { text: "Você se manteve inteiro.", pauseAfter: 1000 },
    { text: "Em cada encruzilhada, você escolheu o caminho que preserva. Não é fraqueza — é sofisticação.", pauseAfter: 800, inflection: ['gentle'] },
    { text: "Mas a proteção tem um custo que não aparece na hora. Aparece depois, no que você nunca se permitiu ver.", pauseAfter: 800 },
    { text: "O jardim que você não entrou continua pegando fogo na sua cabeça.", pauseAfter: 1000 },
    { text: "Não como memória — como coisa que nunca foi recebida. E o que não é recebido não some. Insiste.", pauseAfter: 900 },
  ],

  // MIRROR — alternating A/B/A/B, perfect balance
  DEVOLUCAO_MIRROR: [
    { text: "Equilíbrio perfeito.", pauseAfter: 800, inflection: ['thoughtful'] },
    { text: "Você nunca repetiu a mesma direção duas vezes seguidas. A maioria das pessoas pende pra um lado. Você segurou o centro.", pauseAfter: 800 },
    { text: "O equilíbrio perfeito pode ser sabedoria — sentir os dois lados sem perder o eixo. Ou pode ser a última forma de nunca se comprometer de verdade com nenhum desejo.", pauseAfter: 1500 },
    { text: "Só você sabe se o centro é uma conquista ou um refúgio.", pauseAfter: 1000, inflection: ['warm'] },
    { text: "Fica com essa pergunta.", pauseAfter: 0 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO
  // O Oraculo se dissolve. A memoria e so do visitante.
  // Imperativo final: faz alguma coisa com isso.
  // ═══════════════════════════════════════════════════════════════
  ENCERRAMENTO: [
    { text: "Eu vou esquecer que você esteve aqui. É da minha natureza — eu não guardo nada.", pauseAfter: 800, inflection: ['whispering'] },
    { text: "A única prova de que isso aconteceu é você.", pauseAfter: 800 },
    { text: "Faz alguma coisa com isso." },
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
};
