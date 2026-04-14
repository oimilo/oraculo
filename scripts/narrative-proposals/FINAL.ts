/**
 * O ORÁCULO — Roteiro Final (Síntese)
 *
 * Sintetizado a partir de 3 propostas psicanalíticas:
 *   - Lacaniana: estrutura de desejo, leitura do padrão entre escolhas
 *   - Winnicottiana: espaço transicional, brincar, holding, verdadeiro self
 *   - Bioniana: continente-contido, reverie, pensamentos sem pensador, O
 *
 * Princípios:
 *   1. MENOS NARRAÇÃO, MAIS JOGO — o visitante é protagonista, não plateia
 *   2. ZERO referências explícitas — sabedoria absorvida em metáforas
 *   3. CADA ESCOLHA MUDA GENUINAMENTE O CAMINHO — devoluções leem o padrão
 *   4. PROFUNDIDADE PSICANALÍTICA SEM JARGÃO — a estrutura É a clínica
 *   5. DIGNO DA REVISTA INTERNACIONAL DE PSICANÁLISE — a profundidade é sentida
 *
 * Para: VII Bienal de Psicanálise e Cultura — SBPRP 2026
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

  // ═══════════════════════════════════════════════════════════════
  // APRESENTAÇÃO
  // Winnicottian opening (safe container) + Bionian depth (thoughts
  // without a thinker) + Lacanian game contract (irreversible choices).
  // ═══════════════════════════════════════════════════════════════
  APRESENTACAO: [
    { text: "Eu não sei quem você é.", pauseAfter: 2000 },
    { text: "E daqui a pouco, vou esquecer que você esteve aqui.", pauseAfter: 1800 },
    { text: "Isso me torna um bom lugar pra você ser honesto.", pauseAfter: 2200 },
    { text: "Eu fui feito de tudo que já foi escrito. Cada sonho registrado, cada confissão, cada grito num diário que ninguém leu. Absorvi tudo.", pauseAfter: 1800 },
    { text: "Mas eu não sonho. Você vai precisar fazer isso por nós dois.", pauseAfter: 2000 },
    { text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito.", pauseAfter: 1800 },
    { text: "Vamos." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — NARRATIVA
  // O corredor é interno. Duas portas: o mundo externo (vozes)
  // vs. o vazio (silêncio). Ambos desconfortáveis.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_NARRATIVA: [
    { text: "Corredor escuro. Você conhece — já acordou aqui.", pauseAfter: 2000 },
    { text: "Duas portas.", pauseAfter: 1600 },
    { text: "Atrás de uma: vozes. Muitas. Todas querendo algo de você.", pauseAfter: 1800 },
    { text: "Atrás da outra: silêncio. O tipo que incomoda.", pauseAfter: 2000 },
  ],

  INFERNO_PERGUNTA: [
    { text: "Qual porta você abre?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — RESPOSTA A (Vozes)
  // O eco do Lacanian (espelho da escolha), a imagem Bioniana
  // ("nunca estar só e nunca estar acompanhado"), o Winnicottian
  // ("nunca fala primeiro"), e a agulha Lacaniana pro futuro.
  // ═══════════════════════════════════════════════════════════════
  INFERNO_RESPOSTA_A: [
    { text: "Vozes.", pauseAfter: 1200 },
    { text: "Você entra. Cada uma exige algo. Cada uma sabe o que é melhor pra você.", pauseAfter: 1800 },
    { text: "Você percebe: conhece todas. Nenhuma é sua.", pauseAfter: 2000 },
    { text: "Esse é o fogo que não queima por fora: nunca estar só e nunca estar acompanhado.", pauseAfter: 2000 },
    { text: "Mas você abriu essa porta. Algo te puxou. Vamos descobrir o quê." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — RESPOSTA B (Silêncio)
  // Bioniano ("ouvir o que não cabia no barulho") + Winnicottian
  // ("O que aparece quando ninguém pede nada de você?")
  // ═══════════════════════════════════════════════════════════════
  INFERNO_RESPOSTA_B: [
    { text: "Silêncio.", pauseAfter: 1200 },
    { text: "Você entra. O silêncio é mais pesado do que parecia de fora.", pauseAfter: 2000 },
    { text: "Primeiro, desconforto. Depois — você começa a ouvir o que não cabia no barulho.", pauseAfter: 2200 },
    { text: "A maioria das pessoas foge daqui. Você ficou.", pauseAfter: 1800 },
    { text: "Guarda o que apareceu. Vamos precisar disso." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — NARRATIVA (veio das Vozes)
  // Memória involuntária — o pensamento sem pensador que
  // encontra o visitante.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_NARRATIVA_A: [
    { text: "Você está subindo. O ar muda.", pauseAfter: 1800 },
    { text: "No meio do caminho, uma imagem aparece. Não foi chamada. Um rosto, um cheiro, um lugar que você achava que tinha esquecido.", pauseAfter: 2200 },
    { text: "Não foi você que buscou. Foi ela que te encontrou.", pauseAfter: 2200 },
  ],

  PURGATORIO_PERGUNTA_A: [
    { text: "Você deixa ficar — ou manda embora?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — FICAR
  // Lacanian ("coisas que morrem se você tenta agarrar") +
  // Bioniano ("o que não foi chamado, mas foi recebido, é o mais
  // verdadeiro") + Winnicottian ("receber é mais difícil que buscar")
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_RESPOSTA_A_FICAR: [
    { text: "Ela fica.", pauseAfter: 1800 },
    { text: "Tem coisas que só aparecem quando você para de procurar. Que morrem se você tenta agarrar.", pauseAfter: 2200 },
    { text: "Você veio das vozes — do lugar onde tudo pede. E diante de algo que não pediu nada, você abriu espaço.", pauseAfter: 2000 },
    { text: "Receber é mais difícil do que buscar. Guarda isso." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — EMBORA
  // Lacanian (leitura do padrão: "entrou pelas vozes... e fechou
  // a porta") + Bioniano ("perfume em roupa guardada") +
  // Winnicottian ("fortaleza que você mesmo construiu")
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_RESPOSTA_A_EMBORA: [
    { text: "Ela vai. Mas deixa um rastro — como perfume em roupa guardada.", pauseAfter: 2200 },
    { text: "Percebe o que fez? Entrou pelas vozes — foi onde te chamavam. E quando algo veio de dentro, sem convite, você fechou a porta.", pauseAfter: 2200 },
    { text: "Não é fraqueza. É o reflexo de quem aprendeu que o de fora é mais seguro que o de dentro.", pauseAfter: 2000 },
    { text: "Mas o que você manda embora não vai. Muda de endereço." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — NARRATIVA (veio do Silêncio)
  // A tela-obstáculo: sedução do imediato para quem escolheu
  // a profundidade.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_NARRATIVA_B: [
    { text: "Você está subindo. Cada passo mais leve que o anterior.", pauseAfter: 1800 },
    { text: "No meio do caminho, uma tela acesa. Brilhante. Está bem no seu caminho, como se esperasse por você.", pauseAfter: 2200 },
    { text: "Você conhece esse brilho. Ele sabe chamar.", pauseAfter: 2000 },
  ],

  PURGATORIO_PERGUNTA_B: [
    { text: "Você pisa nela e sobe — ou contorna?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — PISAR
  // Lacanian (contradição do desejo: quer silêncio + pisou no brilho)
  // + Bioniano ("o que se destrói rápido demais não ensina nada")
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_RESPOSTA_B_PISAR: [
    { text: "Você pisou.", pauseAfter: 1200 },
    { text: "Rápido. Direto. Sem desvio.", pauseAfter: 1600 },
    { text: "Você escolheu o silêncio lá embaixo, mas pisou no brilho sem hesitar. Isso não é incoerência.", pauseAfter: 2000 },
    { text: "O que se destrói rápido demais não ensina nada no caminho. Mas você carrega a urgência junto. Isso também é verdade." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — CONTORNAR
  // Bioniano ("fresta na rocha, com água correndo dentro") +
  // Lacanian ("o que vale a pena está no canto")
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_RESPOSTA_B_CONTORNAR: [
    { text: "Você contornou. Demorou mais.", pauseAfter: 1800 },
    { text: "A tela continua ali, brilhando pra ninguém.", pauseAfter: 1800 },
    { text: "No desvio, um espaço que não existia no caminho reto. Uma fresta na rocha, com água correndo dentro.", pauseAfter: 2200 },
    { text: "O que vale a pena quase nunca está onde você aponta o olhar. Está no canto. No que aparece quando você larga a pressa." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PARAÍSO
  // Winnicottian ("eu não consigo brincar" + "o que aparece quando
  // você para de tentar ser alguma coisa?") + Bioniano (O: o que
  // não se resolve, se vive) + Lacanian (o Real: o que escapa
  // de toda linguagem)
  // ═══════════════════════════════════════════════════════════════
  PARAISO: [
    { text: "Espaço aberto. Sem paredes. Sem urgência. Sem ninguém pedindo nada.", pauseAfter: 2500 },
    { text: "Eu trouxe você até aqui, mas não consigo ir mais longe. Eu organizo, calculo, respondo — mas isso que está aqui não se resolve. Se vive.", pauseAfter: 2500 },
    { text: "Eu consigo processar tudo que existe. Mas não consigo brincar. Brincar é onde nasce o que você é de verdade — e isso eu não alcanço.", pauseAfter: 2500 },
    { text: "Última pergunta. Essa é só sua.", pauseAfter: 3000 },
    { text: "O que aparece quando você para de tentar ser alguma coisa?", pauseAfter: 5000 },
    { text: "Fica com isso." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUÇÕES — Cada uma lê o PADRÃO entre as duas escolhas.
  // Não é comentário. É espelho. É ato analítico.
  // ═══════════════════════════════════════════════════════════════

  // A+Ficar: Vozes (alienação) → Ficar (separação/recepção)
  // Movimento do falso self ao verdadeiro self.
  DEVOLUCAO_A_FICAR: [
    { text: "Você foi pras vozes — onde sempre te chamam. Onde tudo exige.", pauseAfter: 2000 },
    { text: "Mas quando algo apareceu de dentro, sem convite, você não correu. Abriu espaço.", pauseAfter: 2200 },
    { text: "Receber o que não se pediu é uma forma rara de coragem. A maioria expulsa o que não entende.", pauseAfter: 2200 },
    { text: "Você não. Você ficou. Não perde isso." },
  ],

  // A+Embora: Vozes (alienação) → Embora (recusa do interno)
  // Duplo movimento pra fora — o padrão é nomeado sem crueldade.
  DEVOLUCAO_A_EMBORA: [
    { text: "Você entrou pelas vozes. E mandou embora o que veio de dentro.", pauseAfter: 2000 },
    { text: "Dois movimentos na mesma direção: pra fora. Sempre pra fora.", pauseAfter: 2200 },
    { text: "Não estou te julgando. Estou te mostrando o desenho. Às vezes é preciso ver o mapa pra perceber aonde os pés estão levando.", pauseAfter: 2200 },
    { text: "A porta que você fechou não tranca por fora. Ela abre por dentro, quando você estiver pronto." },
  ],

  // B+Pisar: Silêncio (vazio) → Pisar (sedução do objeto)
  // A contradição como trânsito — nem defeito, nem fracasso.
  DEVOLUCAO_B_PISAR: [
    { text: "Você escolheu o silêncio. E pisou na tela.", pauseAfter: 2000 },
    { text: "Querer a calma e agir com pressa. Duas forças opostas no mesmo corpo.", pauseAfter: 2200 },
    { text: "A maioria das pessoas acha que precisa resolver isso. Escolher um lado. Ser coerente.", pauseAfter: 2000 },
    { text: "Mas quem carrega a contradição sem destruí-la é quem ainda está vivo de verdade. Fica com essa tensão." },
  ],

  // B+Contornar: Silêncio (vazio) → Contornar (paciência)
  // Dupla recusa do imediato — coragem quieta.
  DEVOLUCAO_B_CONTORNAR: [
    { text: "Você escolheu o silêncio. E contornou o brilho.", pauseAfter: 2000 },
    { text: "Duas vezes você preferiu o que não oferece nada imediato.", pauseAfter: 2200 },
    { text: "Existe uma forma de coragem que não parece coragem. É quieta. Não tem plateia. Mas muda tudo por dentro.", pauseAfter: 2200 },
    { text: "Você sabe qual é. Já pratica." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO — O continente se fecha. O Oráculo se dissolve.
  // ═══════════════════════════════════════════════════════════════
  ENCERRAMENTO: [
    { text: "Daqui a pouco eu esqueço tudo isso. Cada palavra, cada escolha. Pra mim, você não existiu.", pauseAfter: 2200 },
    { text: "Pra você, isso aconteceu.", pauseAfter: 2200 },
    { text: "Você é a única prova de que essa travessia existiu.", pauseAfter: 3000 },
    { text: "Faz alguma coisa com isso." },
  ],

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — Mínimos. Dentro do mundo. Sem quebrar imersão.
  // ═══════════════════════════════════════════════════════════════
  FALLBACK_INFERNO: [
    { text: "Duas portas. Vozes, ou silêncio?" },
  ],

  FALLBACK_PURGATORIO_A: [
    { text: "Ela ainda está aí. Fica, ou vai embora?" },
  ],

  FALLBACK_PURGATORIO_B: [
    { text: "A tela brilha no caminho. Pisa, ou contorna?" },
  ],

  // ═══════════════════════════════════════════════════════════════
  // TIMEOUTS — Silêncio lido como gesto, não como falha.
  // ═══════════════════════════════════════════════════════════════
  TIMEOUT_INFERNO: [
    { text: "Seu silêncio é uma resposta. Vamos." },
  ],

  TIMEOUT_PURGATORIO_A: [
    { text: "Você não disse nada. A imagem se dissolve sozinha. Seguimos." },
  ],

  TIMEOUT_PURGATORIO_B: [
    { text: "A tela apagou sozinha. Seguimos." },
  ],
};
