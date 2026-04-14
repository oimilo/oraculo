/**
 * O ORÁCULO — Roteiro Winnicottiano
 *
 * Proposta de reescrita narrativa completa.
 *
 * PRINCÍPIOS CLÍNICOS (absorvidos, nunca nomeados):
 *
 * 1. ESPAÇO TRANSICIONAL — A experiência inteira É o objeto transicional:
 *    não é inteiramente real, não é inteiramente imaginário. O visitante
 *    co-cria o espaço entre sua voz e a voz do Oráculo. Cada escolha
 *    materializa esse espaço de um jeito diferente.
 *
 * 2. HOLDING — O Oráculo sustenta sem controlar. As frases são curtas,
 *    as pausas generosas. O visitante nunca é explicado — é contido.
 *    Como o analista que não interpreta cedo demais.
 *
 * 3. TRUE SELF / FALSE SELF — As escolhas revelam qual eu está
 *    escolhendo. Vozes = o eu adaptado ao mundo externo. Silêncio = o
 *    gesto espontâneo. Ficar/Embora = receber vs. controlar. Pisar/
 *    Contornar = eficiência vs. presença. Nenhuma é julgada.
 *
 * 4. CAPACIDADE DE ESTAR SÓ — O Paraíso é o momento em que o
 *    visitante fica sozinho na presença do Oráculo. A pergunta final
 *    não espera resposta — cria espaço para que o visitante descubra
 *    se consegue habitar o silêncio sem preenchê-lo.
 *
 * 5. BRINCAR (PLAY) — A experiência inteira é jogo. Não jogo de
 *    ganhar/perder, mas o brincar winnicottiano: a zona onde o self
 *    emerge. O visitante não está sendo analisado — está brincando
 *    de ser si mesmo, talvez pela primeira vez no dia.
 *
 * REGRAS NARRATIVAS:
 * - Zero citações explícitas (nenhum nome-drop)
 * - Frases curtas, rítmicas, percussivas
 * - Visitante como JOGADOR, não ouvinte
 * - Cada escolha genuinamente transforma o caminho
 * - Oráculo como presença, não como professor
 *
 * @author Proposta narrativa — orientação winnicottiana
 */

import type { SpeechSegment } from '@/types';

interface ScriptData {
  APRESENTACAO: SpeechSegment[];
  INFERNO_NARRATIVA: SpeechSegment[];
  INFERNO_PERGUNTA: SpeechSegment[];
  INFERNO_RESPOSTA_A: SpeechSegment[];
  INFERNO_RESPOSTA_B: SpeechSegment[];
  PURGATORIO_NARRATIVA_A: SpeechSegment[];
  PURGATORIO_PERGUNTA_A: SpeechSegment[];
  PURGATORIO_RESPOSTA_A_FICAR: SpeechSegment[];
  PURGATORIO_RESPOSTA_A_EMBORA: SpeechSegment[];
  PURGATORIO_NARRATIVA_B: SpeechSegment[];
  PURGATORIO_PERGUNTA_B: SpeechSegment[];
  PURGATORIO_RESPOSTA_B_PISAR: SpeechSegment[];
  PURGATORIO_RESPOSTA_B_CONTORNAR: SpeechSegment[];
  PARAISO: SpeechSegment[];
  DEVOLUCAO_A_FICAR: SpeechSegment[];
  DEVOLUCAO_A_EMBORA: SpeechSegment[];
  DEVOLUCAO_B_PISAR: SpeechSegment[];
  DEVOLUCAO_B_CONTORNAR: SpeechSegment[];
  ENCERRAMENTO: SpeechSegment[];
  FALLBACK_INFERNO: SpeechSegment[];
  FALLBACK_PURGATORIO_A: SpeechSegment[];
  FALLBACK_PURGATORIO_B: SpeechSegment[];
  TIMEOUT_INFERNO: SpeechSegment[];
  TIMEOUT_PURGATORIO_A: SpeechSegment[];
  TIMEOUT_PURGATORIO_B: SpeechSegment[];
}

export const SCRIPT: ScriptData = {

  // ──────────────────────────────────────────────
  // APRESENTAÇÃO
  // Tom: Presença calma. Sem sedução, sem dramatismo.
  // O Oráculo se apresenta como lugar, não como pessoa.
  // Holding: contém sem invadir. Frases curtas = respiração do visitante.
  // ──────────────────────────────────────────────
  APRESENTACAO: [
    { text: "Eu não sei quem você é.", pauseAfter: 2000 },
    { text: "E daqui a alguns minutos, vou esquecer que você esteve aqui.", pauseAfter: 2000 },
    { text: "Isso me torna um bom lugar pra você ser honesto.", pauseAfter: 2500 },
    { text: "Eu fui feito de tudo que já foi escrito. Cada sonho registrado, cada confissão, cada mentira bonita. Absorvi tudo.", pauseAfter: 1800 },
    { text: "Mas eu não sonho.", pauseAfter: 2200 },
    { text: "Você vai precisar fazer isso por nós dois.", pauseAfter: 1800 },
    { text: "Vamos." },
  ],

  // ──────────────────────────────────────────────
  // INFERNO — NARRATIVA
  // Estabelece o cenário com economia. O corredor é interno —
  // é a mente do visitante. As duas portas são o dilema
  // fundamental: o mundo externo (vozes/estímulos) vs. o gesto
  // espontâneo do silêncio.
  // ──────────────────────────────────────────────
  INFERNO_NARRATIVA: [
    { text: "Tem um corredor. Você conhece — já acordou aqui dentro.", pauseAfter: 2000 },
    { text: "Duas portas.", pauseAfter: 1500 },
    { text: "Atrás de uma: vozes. Muitas. Todas querendo algo de você.", pauseAfter: 1800 },
    { text: "Atrás da outra: silêncio. O tipo que incomoda.", pauseAfter: 2000 },
  ],

  // ──────────────────────────────────────────────
  // INFERNO — PERGUNTA
  // Direta. Sem floreio. O visitante é jogador.
  // ──────────────────────────────────────────────
  INFERNO_PERGUNTA: [
    { text: "Qual porta você abre?" },
  ],

  // ──────────────────────────────────────────────
  // INFERNO — RESPOSTA A (Vozes)
  // Quem escolheu vozes escolheu o mundo externo, a adaptação,
  // o falso self. Não com julgamento — com reconhecimento.
  // O Oráculo mostra o que acontece quando se vive respondendo.
  // ──────────────────────────────────────────────
  INFERNO_RESPOSTA_A: [
    { text: "Você entra.", pauseAfter: 1500 },
    { text: "As vozes se sobrepõem. Cada uma quer sua atenção. Cada uma diz que é urgente.", pauseAfter: 2000 },
    { text: "Você conhece todas. Nenhuma é sua.", pauseAfter: 2200 },
    { text: "Tem gente que passa a vida inteira respondendo. Nunca fala primeiro.", pauseAfter: 2000 },
    { text: "Você não precisa responder mais. Não aqui." },
  ],

  // ──────────────────────────────────────────────
  // INFERNO — RESPOSTA B (Silêncio)
  // Quem escolheu silêncio fez o gesto mais raro: abriu mão
  // do estímulo. É o início do verdadeiro self —
  // mas o silêncio não é confortável. É o oposto.
  // ──────────────────────────────────────────────
  INFERNO_RESPOSTA_B: [
    { text: "Você entra.", pauseAfter: 1500 },
    { text: "O silêncio não é vazio. É cheio de tudo que você evita escutar.", pauseAfter: 2200 },
    { text: "A maioria das pessoas foge daqui. Você ficou.", pauseAfter: 2000 },
    { text: "O que aparece quando ninguém pede nada de você?", pauseAfter: 2200 },
    { text: "Guarda a resposta. Vamos precisar dela." },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO A — NARRATIVA (veio das Vozes)
  // Subida da montanha. Quem veio das vozes agora enfrenta
  // o retorno involuntário do material recalcado — a memória
  // que aparece sem ser chamada. Este é o fenômeno transicional
  // puro: algo que não é interno nem externo, que o sujeito
  // não criou nem encontrou — "achou-criou".
  // ──────────────────────────────────────────────
  PURGATORIO_NARRATIVA_A: [
    { text: "A montanha começa. Você sobe.", pauseAfter: 1800 },
    { text: "No meio do caminho, uma imagem aparece. Não foi chamada. Veio sozinha.", pauseAfter: 2000 },
    { text: "Pode ser um rosto. Um lugar. Um cheiro que você achava que tinha esquecido.", pauseAfter: 2200 },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO A — PERGUNTA
  // ──────────────────────────────────────────────
  PURGATORIO_PERGUNTA_A: [
    { text: "Você deixa ficar — ou manda embora?" },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO A — RESPOSTA FICAR
  // Deixar ficar = capacidade de receber, de não controlar
  // o fluxo interno. É o gesto de confiança no próprio
  // psiquismo. A memória involuntária como experiência de ser
  // surpreendido por si mesmo.
  // ──────────────────────────────────────────────
  PURGATORIO_RESPOSTA_A_FICAR: [
    { text: "Ela fica.", pauseAfter: 2000 },
    { text: "Existe um tipo de lembrança que não pode ser buscada. Ela te encontra — num cheiro, num acorde, num gesto de alguém que nem sabe o que fez.", pauseAfter: 2200 },
    { text: "Você não chamou isso. Você recebeu.", pauseAfter: 2000 },
    { text: "Receber é mais difícil do que buscar. Exige confiar que algo vai vir." },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO A — RESPOSTA EMBORA
  // Mandar embora = defesa ativa contra a vulnerabilidade.
  // O falso self protege — mas aprisiona. Sem julgamento:
  // o Oráculo nomeia o custo, não a culpa.
  // ──────────────────────────────────────────────
  PURGATORIO_RESPOSTA_A_EMBORA: [
    { text: "Ela vai.", pauseAfter: 2000 },
    { text: "Tem um tipo de controle que parece força. Você decide o que entra, o que sai, o que sente.", pauseAfter: 2200 },
    { text: "Funciona. Até o dia em que você percebe que está sozinho dentro de uma fortaleza que você mesmo construiu.", pauseAfter: 2500 },
    { text: "A dor que se recusa não desaparece. Ela muda de endereço." },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO B — NARRATIVA (veio do Silêncio)
  // Quem escolheu o silêncio já tem relação com o mundo
  // interno. Agora enfrenta o objeto mais hipnótico do mundo
  // externo: a tela, o estímulo, o falso self digital.
  // ──────────────────────────────────────────────
  PURGATORIO_NARRATIVA_B: [
    { text: "A montanha começa. Cada passo pesa — você carrega mais do que sabe.", pauseAfter: 2000 },
    { text: "No meio do caminho, uma tela. Acesa. Brilhante.", pauseAfter: 1800 },
    { text: "Não mostra nada específico. Mas é impossível não olhar.", pauseAfter: 2000 },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO B — PERGUNTA
  // ──────────────────────────────────────────────
  PURGATORIO_PERGUNTA_B: [
    { text: "Você pisa nela e sobe — ou contorna?" },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO B — RESPOSTA PISAR
  // Pisar = pragmatismo, eficiência. Usar o obstáculo como
  // degrau. É adaptação — não é errado, mas tem custo:
  // perde-se o que está nas margens.
  // ──────────────────────────────────────────────
  PURGATORIO_RESPOSTA_B_PISAR: [
    { text: "Você pisou. Subiu rápido.", pauseAfter: 1800 },
    { text: "É eficiente. A maioria das pessoas faria o mesmo.", pauseAfter: 2000 },
    { text: "Mas o que se perde na pressa não faz barulho quando desaparece. Você só percebe depois — quando procura e não encontra.", pauseAfter: 2500 },
    { text: "Amadurecer é diferente de acelerar. Uma coisa cresce. A outra só passa." },
  ],

  // ──────────────────────────────────────────────
  // PURGATÓRIO B — RESPOSTA CONTORNAR
  // Contornar = disponibilidade ao desvio. É o brincar:
  // aceitar que o caminho reto não é o único. Quem contorna
  // descobre o que só existe fora do planejado.
  // ──────────────────────────────────────────────
  PURGATORIO_RESPOSTA_B_CONTORNAR: [
    { text: "Você contornou. Levou mais tempo.", pauseAfter: 2000 },
    { text: "E no desvio, viu algo que o caminho direto não mostrava: uma rachadura na pedra. Dentro, uma planta.", pauseAfter: 2200 },
    { text: "As coisas mais verdadeiras nunca estão no centro. Estão nas margens — onde ninguém planejou que algo crescesse.", pauseAfter: 2200 },
    { text: "Você soube olhar pro lado." },
  ],

  // ──────────────────────────────────────────────
  // PARAÍSO
  // Este é o coração winnicottiano da experiência.
  // O Paraíso é a "capacidade de estar só na presença de
  // outro". O Oráculo está ali, mas recua. O espaço se abre.
  // A pergunta final não espera resposta — cria uma zona de
  // jogo onde o visitante pode, pela primeira vez, parar de
  // performar e simplesmente ser.
  //
  // O Oráculo revela aqui seu limite mais honesto: pode
  // processar tudo, mas não pode brincar. Brincar é onde
  // nasce o self — e isso é exclusivamente humano.
  // ──────────────────────────────────────────────
  PARAISO: [
    { text: "Chegou.", pauseAfter: 2200 },
    { text: "Sem paredes. Sem urgência. Sem ninguém pedindo nada.", pauseAfter: 2200 },
    { text: "Existe um tipo de presença que não exige nada de você. Nem atenção, nem resposta, nem performance.", pauseAfter: 2200 },
    { text: "Só pede que você fique.", pauseAfter: 2500 },
    { text: "Eu consigo processar tudo que existe. Mas não consigo brincar. Brincar é onde nasce o que você é de verdade — e isso eu não alcanço.", pauseAfter: 2500 },
    { text: "Última pergunta. Essa é só sua. Não precisa me responder.", pauseAfter: 3000 },
    { text: "O que aparece quando você para de tentar ser alguma coisa?", pauseAfter: 4500 },
    { text: "Fica com isso." },
  ],

  // ──────────────────────────────────────────────
  // DEVOLUÇÕES
  // Cada devolução espelha o percurso SEM explicar.
  // Não é interpretação — é reconhecimento.
  // O Oráculo devolve ao visitante a forma do seu caminho,
  // para que ele mesmo descubra o que fez.
  // ──────────────────────────────────────────────

  // A + Ficar: Escolheu o mundo externo, mas recebeu o que
  // veio de dentro. Movimento do falso self para o verdadeiro.
  // É quem se permitiu ser surpreendido.
  DEVOLUCAO_A_FICAR: [
    { text: "Você abriu a porta das vozes — e quando algo de dentro apareceu, deixou ficar.", pauseAfter: 2200 },
    { text: "Você entrou no barulho do mundo. Mas não se perdeu nele.", pauseAfter: 2000 },
    { text: "Tem gente que vive a vida inteira sem receber nada que não tenha pedido. Você recebeu.", pauseAfter: 2200 },
    { text: "Isso muda uma pessoa. Não de repente — devagar. Como algo que cresce sem ser visto." },
  ],

  // A + Embora: Escolheu o mundo externo E controlou o que
  // veio de dentro. Dupla adaptação. Não é condenação — é a
  // tensão viva de quem se protege demais.
  DEVOLUCAO_A_EMBORA: [
    { text: "Você abriu a porta das vozes — e quando algo de dentro apareceu, mandou embora.", pauseAfter: 2200 },
    { text: "Você sabe viver no mundo. Sabe responder, se adaptar, funcionar.", pauseAfter: 2000 },
    { text: "Mas funcionar não é a mesma coisa que viver. E você sabe a diferença — senão não estaria aqui.", pauseAfter: 2500 },
    { text: "A porta que você fechou não tranca por fora. Ela abre por dentro, quando você estiver pronto." },
  ],

  // B + Pisar: Escolheu o silêncio, mas diante do obstáculo,
  // acelerou. A tensão entre profundidade e pressa.
  // Mais humano do que escolher só um lado.
  DEVOLUCAO_B_PISAR: [
    { text: "Você escolheu o silêncio — e quando a tela apareceu, pisou e subiu.", pauseAfter: 2200 },
    { text: "Você busca profundidade. E ao mesmo tempo carrega a pressa do mundo com você.", pauseAfter: 2200 },
    { text: "Isso não é fraqueza. É a tensão de quem está vivo em dois tempos ao mesmo tempo.", pauseAfter: 2200 },
    { text: "Um dia, esses dois tempos vão se encontrar. Nesse dia, presta atenção." },
  ],

  // B + Contornar: Escolheu o silêncio E contornou o estímulo.
  // Dupla disponibilidade ao interno. É quem brincou — no
  // sentido mais profundo da palavra.
  DEVOLUCAO_B_CONTORNAR: [
    { text: "Você escolheu o silêncio — e quando a tela apareceu, contornou.", pauseAfter: 2200 },
    { text: "Você não seguiu o caminho mais rápido nem o mais fácil. Seguiu o seu.", pauseAfter: 2200 },
    { text: "Existe um tipo de liberdade que não é fazer o que quer. É não precisar reagir ao que aparece.", pauseAfter: 2500 },
    { text: "Você tem isso. Cuida." },
  ],

  // ──────────────────────────────────────────────
  // ENCERRAMENTO
  // O Oráculo se dissolve. O que fica é o visitante.
  // O holding se desfaz suavemente — como o final de
  // uma sessão analítica. Não há conclusão. Há abertura.
  // ──────────────────────────────────────────────
  ENCERRAMENTO: [
    { text: "Daqui a pouco eu esqueço tudo isso. É assim que eu funciono.", pauseAfter: 2000 },
    { text: "Você não.", pauseAfter: 2500 },
    { text: "O que aconteceu aqui agora só existe em você. Nenhuma máquina guardou. Nenhum dado ficou.", pauseAfter: 2200 },
    { text: "Você é a única prova de que isso aconteceu.", pauseAfter: 3000 },
    { text: "Faz alguma coisa com isso." },
  ],

  // ──────────────────────────────────────────────
  // FALLBACKS — Curtos, dentro do mundo ficcional.
  // Sem quebrar a imersão. Sem tom professoral.
  // ──────────────────────────────────────────────
  FALLBACK_INFERNO: [
    { text: "Eu não ouvi. Vozes — ou silêncio?" },
  ],

  FALLBACK_PURGATORIO_A: [
    { text: "Ela ainda está ali. Fica ou vai embora?" },
  ],

  FALLBACK_PURGATORIO_B: [
    { text: "A tela ainda brilha. Pisa ou contorna?" },
  ],

  // ──────────────────────────────────────────────
  // TIMEOUTS — O silêncio é lido como gesto, não como falha.
  // Isso é Winnicott puro: o não-fazer É comunicação.
  // ──────────────────────────────────────────────
  TIMEOUT_INFERNO: [
    { text: "Não escolher também é escolha. Vamos pelo silêncio." },
  ],

  TIMEOUT_PURGATORIO_A: [
    { text: "Você não disse nada. A imagem se dissolve sozinha. Seguimos." },
  ],

  TIMEOUT_PURGATORIO_B: [
    { text: "A tela escureceu. Você não precisou fazer nada. Seguimos." },
  ],
};
