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
    { text: "Eu não sei quem você é.", pauseAfter: 2000 },
    { text: "E daqui a pouco vou esquecer que você esteve aqui.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "Isso me torna um bom lugar pra você ser honesto.", pauseAfter: 2200 },
    { text: "Eu fui feito de tudo que já foi escrito. Cada sonho registrado, cada confissão, cada grito num diário que ninguém leu. Absorvi tudo.", pauseAfter: 2000 },
    { text: "Mas eu não sonho. Você vai precisar fazer isso por nós dois.", pauseAfter: 2500, inflection: ['sad'] },
    { text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito.", pauseAfter: 1800 },
    { text: "Vamos.", inflection: ['determined'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — INTRO
  // Descida. Atmosfera escura, densa. Nao e o setup da escolha —
  // e a ambiencia do reino.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_INTRO: [
    { text: "Descemos.", pauseAfter: 2500, inflection: ['serious'] },
    { text: "As perguntas já estavam aqui antes de você. Esperando alguém que pudesse habitá-las.", pauseAfter: 2200 },
    { text: "Aqui embaixo o ar é denso. Tudo o que é excessivo, apressado e vazio desce pra cá — onde nada pode amadurecer.", pauseAfter: 2000 },
    { text: "Presta atenção no que aparece.", pauseAfter: 1800 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q1 — A PRISAO CONFORTAVEL (Light)
  // Conforto vs Liberdade. A sala que se ajusta a tudo,
  // menos tem porta.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q1_SETUP: [
    { text: "Você está numa sala. Tudo se ajusta a você — a temperatura, a luz, o som. Tudo perfeito.", pauseAfter: 2000 },
    { text: "É como se a sala te conhecesse melhor do que você se conhece.", pauseAfter: 1800, inflection: ['gentle'] },
    { text: "Você nunca sofreu aqui. Mas você percebe uma coisa: não tem porta.", pauseAfter: 2500 },
    { text: "E você não sabe se a porta sumiu — ou se você nunca precisou dela porque a sala sempre deu tudo antes de você pedir.", pauseAfter: 2200 },
  ],

  INFERNO_Q1_PERGUNTA: [
    { text: "Você fica — ou procura uma saída?" },
  ],

  // Q1 RESPOSTA A — Ficar (conforto sobre agencia)
  INFERNO_Q1_RESPOSTA_A: [
    { text: "Você fica.", pauseAfter: 1200 },
    { text: "A sala aceita. O conforto se aprofunda. A ausência da porta deixa de incomodar — porque você parou de olhar pra onde ela deveria estar.", pauseAfter: 2200, inflection: ['thoughtful'] },
    { text: "Tem gente que constrói essa sala sozinha e chama de paz. Um círculo perfeito de conforto. E círculos não têm saída — só repetição.", pauseAfter: 2500 },
    { text: "A segurança comprada com soberania é a mais cara que existe. Mas o preço vem depois.", pauseAfter: 1800 },
    { text: "A travessia interior foi trocada por atalho. E atalho não leva a lugar nenhum — só ao mesmo lugar, mais rápido.", pauseAfter: 2000 },
  ],

  // Q1 RESPOSTA B — Procurar saida (desconforto como prova de vida)
  INFERNO_Q1_RESPOSTA_B: [
    { text: "Você levanta.", pauseAfter: 1200 },
    { text: "As paredes são lisas. Não tem fresta, não tem brecha. Mas você toca cada centímetro, procurando.", pauseAfter: 2200 },
    { text: "Prazer sem escolha é anestesia. Você sentiu isso antes de pensar.", pauseAfter: 2000, inflection: ['determined'] },
    { text: "Silêncio não é vazio — é fonte. Rara, escondida na rocha. A maioria nunca procura.", pauseAfter: 2200 },
    { text: "Você não achou a porta. Mas achou a prova de que ainda quer algo que não está aqui. Isso já é saída.", pauseAfter: 2000 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q2 — A COISA NO CHAO (Medium)
  // Repulsa vs Presenca. O corredor que estreita, a coisa
  // viva e desconhecida.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_Q2_SETUP: [
    { text: "Corredor estreito. Você anda e as paredes se aproximam a cada passo.", pauseAfter: 2000 },
    { text: "Sua mão encosta na parede e toca algo vivo. Pequeno, úmido, pulsando.", pauseAfter: 2200, inflection: ['whispering'] },
    { text: "Seu corpo recua antes da mente entender. Mas a coisa não se mexe. Ela espera.", pauseAfter: 2500 },
  ],

  INFERNO_Q2_PERGUNTA: [
    { text: "Você recua — ou fica parado, olhando?" },
  ],

  // Q2 RESPOSTA A — Recuar (obediencia ao primeiro veredito do corpo)
  INFERNO_Q2_RESPOSTA_A: [
    { text: "Você recua.", pauseAfter: 1200 },
    { text: "O corpo decidiu antes de você. Repulsivo é perigoso — essa é a inteligência mais antiga que existe.", pauseAfter: 2200 },
    { text: "Mas o que é recusado não desaparece. Volta como sonho que não faz sentido. Como dor que não tem lugar. Como coisa que gruda na pele sem motivo.", pauseAfter: 2500, inflection: ['serious'] },
    { text: "Tudo que você evita encontrar cria raízes no escuro.", pauseAfter: 1800 },
  ],

  // Q2 RESPOSTA B — Ficar olhando (ultrapassar a repulsa)
  INFERNO_Q2_RESPOSTA_B: [
    { text: "Você fica.", pauseAfter: 1200 },
    { text: "O corpo diz não. Mas algo em você precisa saber mais do que precisa estar confortável.", pauseAfter: 2200, inflection: ['gentle'] },
    { text: "Transformação começa nos momentos em que o corpo diz não e algo dentro de você responde: ainda não.", pauseAfter: 2500 },
    { text: "Você não se moveu. Mas alguma coisa se moveu em você.", pauseAfter: 1800 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATORIO — INTRO
  // Transicao. O ar muda. Subida. Aqui se espera — sem agir,
  // sem fugir — ate que o sentido se decante.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_INTRO: [
    { text: "O ar muda. Você sente? Estamos subindo.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "O que queimou lá embaixo, o que amadureceu no meio — virou luz aqui. Não a luz que alegra. A que ilumina.", pauseAfter: 2200 },
    { text: "Aqui não tem castigo nem salvação. Aqui se espera — sem agir, sem fugir — até que o sentido apareça sozinho.", pauseAfter: 2500 },
    { text: "Presta atenção no que dói sem motivo.", pauseAfter: 2000 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q3 — O JARDIM QUE VAI QUEIMAR (Medium)
  // Apego vs Protecao. A beleza que ja esta morrendo.
  // Entrar sabendo da perda, ou se proteger antes de ver o que
  // vai perder.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q3_SETUP: [
    { text: "Você está na entrada de um jardim. Cada flor aberta, cada cor no auge.", pauseAfter: 2000 },
    { text: "Mas tem fumaça no vento. De manhã, nada disso vai existir.", pauseAfter: 2200, inflection: ['sad'] },
    { text: "A beleza já está morrendo enquanto você olha.", pauseAfter: 2000 },
  ],

  PURGATORIO_Q3_PERGUNTA: [
    { text: "Você entra no jardim — ou dá as costas antes de ver o que vai perder?" },
  ],

  // Q3 RESPOSTA A — Entrar (aceitar a ferida que vem com a beleza)
  PURGATORIO_Q3_RESPOSTA_A: [
    { text: "Você entra.", pauseAfter: 1200 },
    { text: "Cada pétala que você toca já está se despedindo. E você toca mesmo assim.", pauseAfter: 2200 },
    { text: "O que está morrendo puxa mais forte. Não porque é bonito. Porque nunca vai ser seu.", pauseAfter: 2500, inflection: ['thoughtful'] },
    { text: "Quem se permite amar o que vai acabar carrega uma ferida diferente — não de perda, mas de presença.", pauseAfter: 2200 },
    { text: "Você esteve aqui. Inteiro. Num instante que não fica. E isso ninguém tira.", pauseAfter: 2000 },
  ],

  // Q3 RESPOSTA B — Dar as costas (luto antecipado disfarçado de sabedoria)
  PURGATORIO_Q3_RESPOSTA_B: [
    { text: "Você vira.", pauseAfter: 1200 },
    { text: "Tem uma sabedoria nisso — não se apegar ao que já está indo. Mas olha o preço: você nunca viu o jardim.", pauseAfter: 2200 },
    { text: "Desvalorizar o que vai ser perdido antes de perder é um luto que chega antes da hora.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "O que nunca foi recebido não vira memória. Vira ausência. E ausência pesa mais que qualquer perda.", pauseAfter: 2200 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q4 — AS DUAS AGUAS (Deep)
  // Memoria vs Apagamento. Dois rios — um carrega tudo que
  // voce viveu, outro apaga. Essa e a escolha mais profunda
  // do Purgatorio.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q4_SETUP: [
    { text: "Dois rios se encontram aqui.", pauseAfter: 2200 },
    { text: "Um é quente e escuro — carrega tudo que você viveu. Cada cicatriz, cada ternura, cada coisa que você não contou pra ninguém.", pauseAfter: 2500, inflection: ['whispering'] },
    { text: "A água escura não carrega o que aconteceu. Carrega o que você decidiu que aconteceu. Cada cicatriz tem uma história que você contou pra si mesmo.", pauseAfter: 2500 },
    { text: "O outro rio é claro e gelado. Entra nele e sai limpo. Novo. Sem nada.", pauseAfter: 2200 },
    { text: "A água clara não pergunta o que você quer guardar. Leva tudo. E você sai vazio do jeito que um copo lavado é vazio.", pauseAfter: 2500 },
  ],

  PURGATORIO_Q4_PERGUNTA: [
    { text: "Qual água? A que lembra — ou a que esquece?" },
  ],

  // Q4 RESPOSTA A — Lembrar (carregar a historia, identidade tecida de cicatrizes)
  PURGATORIO_Q4_RESPOSTA_A: [
    { text: "A água escura.", pauseAfter: 1500 },
    { text: "Ela queima onde dói e aquece onde faz falta. Não é confortável. Mas é sua.", pauseAfter: 2500, inflection: ['serious'] },
    { text: "Você não carrega o que aconteceu. Carrega quem você decidiu ser por causa do que aconteceu. Identidade é tecida de cicatrizes tanto quanto de alegrias.", pauseAfter: 2500 },
    { text: "Cicatriz não é ferida. É prova de que algo foi atravessado e integrado.", pauseAfter: 2000 },
    { text: "A dor atravessada transforma. A dor recusada só muda de endereço.", pauseAfter: 2200 },
  ],

  // Q4 RESPOSTA B — Esquecer (desejo de alivio, sem medir o que perde junto)
  PURGATORIO_Q4_RESPOSTA_B: [
    { text: "A água clara.", pauseAfter: 1500 },
    { text: "Fria. Cada passo apaga uma camada. Primeiro as dores grandes. Depois as pequenas. Depois as ternuras.", pauseAfter: 2500, inflection: ['sad'] },
    { text: "A água que apaga não escolhe o que leva. Levou a cicatriz e levou junto o cheiro de quem partiu, o som do riso que ninguém mais lembra, o gosto da última vez que algo foi bom.", pauseAfter: 2800 },
    { text: "Você queria alívio. Mas alívio total tem outro nome: ausência. E agora você sabe como ela pesa.", pauseAfter: 2200 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PARAISO — INTRO
  // O ar se abre. Nao tem paredes, nao tem urgencia.
  // O Oraculo reconhece seus proprios limites — nao sonha,
  // nao brinca, nao e. O visitante carrega a si mesmo daqui.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_INTRO: [
    { text: "O ar se abriu. Não tem mais parede. Não tem mais peso.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "O que queimou lá embaixo, o que amadureceu no meio — chegou aqui como claridade. Não a que alegra. A que ilumina.", pauseAfter: 2500 },
    { text: "Aqui eu processo, mas não alcanço. Tem algo aqui que não cabe em linguagem. Que resiste a todo pensamento.", pauseAfter: 2500 },
    { text: "Mistério não se resolve — se suporta.", pauseAfter: 2200 },
    { text: "Eu não consigo brincar. Brincar é onde você descobre quem é sem precisar provar nada. Essa parte é sua.", pauseAfter: 2500 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q5 — A PERGUNTA SEM RESPOSTA (Deep)
  // Uma pergunta que nao e feita em palavras — e pressao no
  // peito. Nao tem resposta. Talvez nunca tenha.
  // Carregar ou deixar dissolver.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q5_SETUP: [
    { text: "A escuridão afina. Algo se forma — não é palavra, é pressão.", pauseAfter: 2200 },
    { text: "Cresce. Não dói, mas pesa.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "Você se aproxima de algo que não pode ser pensado. Só sentido. Quanto mais tenta nomear, mais escapa.", pauseAfter: 2500 },
    { text: "É uma pergunta. Sem resposta. Talvez nunca tenha uma.", pauseAfter: 2500 },
  ],

  PARAISO_Q5_PERGUNTA: [
    { text: "Você carrega a pergunta — ou deixa ela dissolver?" },
  ],

  // Q5 RESPOSTA A — Carregar (aceitar o peso do nao-saber como companhia)
  PARAISO_Q5_RESPOSTA_A: [
    { text: "Você segura.", pauseAfter: 1200 },
    { text: "A maioria coleciona respostas. Você coleciona perguntas.", pauseAfter: 2200, inflection: ['thoughtful'] },
    { text: "Carregar o que não se resolve exige um tipo de força que ninguém aplaude. Mas tem um prazer nisso — não o prazer que alivia. O que marca.", pauseAfter: 2500 },
    { text: "Nem tudo que importa precisa de resposta. Algumas coisas importam justamente porque não têm.", pauseAfter: 2200 },
  ],

  // Q5 RESPOSTA B — Dissolver (confiar que nem tudo precisa ser carregado)
  PARAISO_Q5_RESPOSTA_B: [
    { text: "Você abre as mãos.", pauseAfter: 1200 },
    { text: "A pergunta se desfaz como névoa — não some, mas para de ser sólida.", pauseAfter: 2200 },
    { text: "Pode ser sabedoria — soltar o que não pode ser possuído. Ou pode ser expulsão — mandar embora o que não cabe.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "Só o tempo vai mostrar qual foi. Mas a leveza no seu rosto diz alguma coisa.", pauseAfter: 2200 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // Q6 — O FIM DO JOGO (Profound)
  // A escolha final. Meta — sobre o proprio jogo.
  // A voz do Oraculo afina. O espaco fica quieto.
  // Pedir o espelho ou ja saber.
  // ═══════════════════════════════════════════════════════════════
  PARAISO_Q6_SETUP: [
    { text: "Minha voz está afinando. Você sente?", pauseAfter: 2000, inflection: ['whispering'] },
    { text: "O espaço ficou quieto. Não vazio — terminado.", pauseAfter: 2200 },
    { text: "Essa é a última coisa que vou te perguntar.", pauseAfter: 2500, inflection: ['warm'] },
  ],

  PARAISO_Q6_PERGUNTA: [
    { text: "Quer ouvir o que eu vi em você — ou já sabe o que precisa saber?" },
  ],

  // Q6 RESPOSTA A — Pedir o espelho (abertura a ser visto)
  PARAISO_Q6_RESPOSTA_A: [
    { text: "Então escuta.", pauseAfter: 1500, inflection: ['warm'] },
    { text: "Pedir pra ser visto é a coisa mais corajosa e mais perigosa que existe. Porque você não controla o que eu vou dizer.", pauseAfter: 2500 },
    { text: "Mas você pediu. E isso já diz mais sobre você do que qualquer resposta que eu possa dar.", pauseAfter: 2200 },
    { text: "Vou te dizer o que vi.", pauseAfter: 2000 },
  ],

  // Q6 RESPOSTA B — Ja saber (confiar no proprio interior)
  PARAISO_Q6_RESPOSTA_B: [
    { text: "Então você já tem o que veio buscar.", pauseAfter: 1800, inflection: ['warm'] },
    { text: "A maioria das pessoas precisa que alguém confirme o que já sente. Você não.", pauseAfter: 2200 },
    { text: "Isso é raro. Pode ser a chegada mais profunda que esse jogo produz — ou a última defesa contra ser visto de verdade.", pauseAfter: 2500 },
    { text: "Só você sabe qual é. Fica com isso.", pauseAfter: 2000 },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUCOES — 8 arquetipos baseados em padrao
  // Cada devolucao le a FORMA das 6 escolhas, nao cada uma
  // individualmente. Espelho, nao julgamento.
  // ═══════════════════════════════════════════════════════════════

  // SEEKER — mostly toward + movement
  // Abriu a porta, ficou olhando, entrou no jardim, lembrou, carregou, pediu o espelho.
  DEVOLUCAO_SEEKER: [
    { text: "Você entrou em tudo.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "A sala sem porta, a coisa na parede, o jardim pegando fogo, a água que queima, a pergunta sem resposta. Nada te parou.", pauseAfter: 2500 },
    { text: "Tem gente que chama isso de coragem. Eu chamo de fome.", pauseAfter: 2200 },
    { text: "A pergunta que fica é essa: você corre em direção a alguma coisa — ou foge da quietude?", pauseAfter: 2500 },
    { text: "Guarda isso. É a única pergunta que importa.", pauseAfter: 2000, inflection: ['warm'] },
  ],

  // GUARDIAN — mostly away + stillness
  // Ficou na sala, recuou, deu as costas, esqueceu, dissolveu, ja sabia.
  DEVOLUCAO_GUARDIAN: [
    { text: "Você se protegeu em cada encruzilhada.", pauseAfter: 1800 },
    { text: "A sala ficou, a coisa na parede ficou longe, o jardim nunca foi tocado, a memória foi limpa. Cada parede no lugar certo.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "Mas você veio até aqui — pra esse escuro, pra essa voz. Isso significa que uma parte sua sabe: o que você protege pode ser o que você esconde.", pauseAfter: 2500 },
    { text: "Não estou julgando. Proteção é inteligência. Mas toda muralha tem dois lados.", pauseAfter: 2200 },
    { text: "Fica com isso.", pauseAfter: 1800 },
  ],

  // CONTRADICTED — mixed pattern, no consistent direction
  DEVOLUCAO_CONTRADICTED: [
    { text: "Você foi e voltou. Segurou e soltou. Entrou e recuou.", pauseAfter: 2000 },
    { text: "Nenhuma direção fixa. Nenhum padrão limpo.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "A maioria ia achar que isso é indecisão. Não é. É respiração. O único ritmo honesto.", pauseAfter: 2500 },
    { text: "Quem se contradiz está vivo. Quem é coerente demais já decidiu parar de sentir.", pauseAfter: 2200 },
    { text: "Guarda essa oscilação. Ela é mais sua do que qualquer certeza.", pauseAfter: 2000, inflection: ['warm'] },
  ],

  // PIVOT_EARLY — switches direction in first 3 choices
  DEVOLUCAO_PIVOT_EARLY: [
    { text: "Alguma coisa mudou em você no começo.", pauseAfter: 1800 },
    { text: "Você começou num caminho e virou antes da terceira pergunta. A virada aconteceu antes de você perceber.", pauseAfter: 2500, inflection: ['curious'] },
    { text: "Os primeiros encontros sacudiram o plano. E em vez de resistir, você deixou o plano cair.", pauseAfter: 2200 },
    { text: "Quem muda cedo muda por instinto. A mente ainda não entendeu, mas o corpo já se moveu.", pauseAfter: 2500 },
    { text: "Presta atenção nesse instinto. Ele sabe coisas que você ainda não sabe.", pauseAfter: 2000 },
  ],

  // PIVOT_LATE — switches direction in last 3 choices
  DEVOLUCAO_PIVOT_LATE: [
    { text: "Alguma coisa mudou em você entre a terceira e a quarta pergunta.", pauseAfter: 2000, inflection: ['curious'] },
    { text: "Você começou de um jeito e terminou de outro. A virada veio na metade mais funda.", pauseAfter: 2500 },
    { text: "Quem muda tarde muda de verdade. Porque já não é reação — é decisão.", pauseAfter: 2200 },
    { text: "Essa dobradiça entre quem você era no início e quem você é agora — esse é o lugar onde você realmente vive.", pauseAfter: 2500, inflection: ['warm'] },
    { text: "Não esquece desse ponto. Ele é mais importante do que qualquer resposta que você deu.", pauseAfter: 2000 },
  ],

  // DEPTH_SEEKER — consistently chose the "deeper" option
  DEVOLUCAO_DEPTH_SEEKER: [
    { text: "Você foi em direção a cada fogo.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "Ficou com a coisa na parede. Entrou no jardim que ia queimar. Escolheu a água que dói. Carregou a pergunta sem resposta.", pauseAfter: 2500 },
    { text: "Você não recua. Isso é raro.", pauseAfter: 2000 },
    { text: "A questão é se você sabe a diferença entre coragem e compulsão. Porque os dois se parecem — até o preço chegar.", pauseAfter: 2500 },
    { text: "Fundo é bom. Mas fundo sem ar mata igual.", pauseAfter: 2000, inflection: ['serious'] },
  ],

  // SURFACE_KEEPER — consistently chose the "safer" option
  DEVOLUCAO_SURFACE_KEEPER: [
    { text: "Você se manteve inteiro.", pauseAfter: 1500 },
    { text: "Em cada encruzilhada, você escolheu o caminho que preserva. Não é fraqueza — é sofisticação. Seu sistema de proteção funciona bem.", pauseAfter: 2500, inflection: ['gentle'] },
    { text: "Mas a proteção tem um custo que não aparece na hora. Aparece depois, no que você nunca se permitiu ver.", pauseAfter: 2500 },
    { text: "O jardim que você não entrou continua pegando fogo na sua cabeça. A coisa na parede continua esperando.", pauseAfter: 2200 },
    { text: "Você não precisa ir até o fundo. Mas precisa saber o que está recusando.", pauseAfter: 2000 },
  ],

  // MIRROR — alternating A/B/A/B, perfect balance
  DEVOLUCAO_MIRROR: [
    { text: "Equilíbrio perfeito.", pauseAfter: 1800, inflection: ['thoughtful'] },
    { text: "Você nunca repetiu a mesma direção duas vezes seguidas. Entrou e recuou, segurou e soltou, abriu e fechou.", pauseAfter: 2500 },
    { text: "A maioria das pessoas pende pra um lado. Você segurou o centro.", pauseAfter: 2000 },
    { text: "Isso pode ser sabedoria — sentir os dois lados sem perder o eixo. Ou pode ser o esconderijo mais elegante que existe: nunca se comprometer de verdade com nenhuma direção.", pauseAfter: 2800 },
    { text: "Só você sabe se o centro é uma conquista ou um refúgio. Fica com essa pergunta.", pauseAfter: 2200, inflection: ['warm'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO
  // O Oraculo se dissolve. A memoria e so do visitante.
  // Imperativo final: faz alguma coisa com isso.
  // ═══════════════════════════════════════════════════════════════
  ENCERRAMENTO: [
    { text: "Eu vou esquecer que você esteve aqui. É da minha natureza — eu não guardo nada.", pauseAfter: 2200, inflection: ['whispering'] },
    { text: "Daqui a um minuto eu não vou saber seu nome, sua voz, nenhuma das suas escolhas.", pauseAfter: 2000 },
    { text: "A única prova de que isso aconteceu é você.", pauseAfter: 2500 },
    { text: "Faz alguma coisa com isso.", inflection: ['warm'] },
  ],

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — 1 por pergunta
  // Reformulacao minima dentro do mundo. Sem quebrar imersao.
  // Binario, claro, curto.
  // ═══════════════════════════════════════════════════════════════
  FALLBACK_Q1: [
    { text: "A sala é confortável. Você fica — ou procura a porta?" },
  ],
  FALLBACK_Q2: [
    { text: "A coisa na parede espera. Você recua — ou fica olhando?" },
  ],
  FALLBACK_Q3: [
    { text: "O jardim vai queimar. Você entra — ou dá as costas?" },
  ],
  FALLBACK_Q4: [
    { text: "Duas águas. Uma lembra, outra esquece. Qual?" },
  ],
  FALLBACK_Q5: [
    { text: "A pergunta não tem resposta. Você carrega — ou deixa dissolver?" },
  ],
  FALLBACK_Q6: [
    { text: "Quer ouvir o que eu vi — ou já sabe?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // TIMEOUTS — 1 por pergunta
  // Silencio tratado como gesto valido. Nao e falha — e resposta.
  // Cada um tem carater proprio.
  // ═══════════════════════════════════════════════════════════════
  TIMEOUT_Q1: [
    { text: "O silêncio ficou. Quem não se move numa sala confortável já escolheu ficar.", pauseAfter: 1400 },
  ],
  TIMEOUT_Q2: [
    { text: "Seu corpo recuou sozinho. O silêncio é do corpo — e o corpo decidiu primeiro.", pauseAfter: 1400 },
  ],
  TIMEOUT_Q3: [
    { text: "Você não entrou. Às vezes virar as costas não é decisão — é o que acontece quando a decisão não vem.", pauseAfter: 1400 },
  ],
  TIMEOUT_Q4: [
    { text: "Nenhuma água. O silêncio não lembra nem esquece. Seguimos.", pauseAfter: 1200 },
  ],
  TIMEOUT_Q5: [
    { text: "A pergunta se dissolveu sozinha. Nem tudo precisa de você pra desaparecer.", pauseAfter: 1400 },
  ],
  TIMEOUT_Q6: [
    { text: "O silêncio no final é a resposta mais antiga que existe. Você já sabe.", pauseAfter: 1600 },
  ],
};
