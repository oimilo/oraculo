/**
 * O ORÁCULO — Bionian Narrative Rewrite
 *
 * Design principles:
 *   - LESS NARRATION, MORE GAME: The visitor is a player, not a listener.
 *   - NO EXPLICIT REFERENCES: No name-drops. Wisdom absorbed into images.
 *   - EACH CHOICE GENUINELY CHANGES THE PATH: Personal, consequential.
 *   - PSYCHOANALYTIC DEPTH WITHOUT JARGON: Bion's container-contained,
 *     thoughts without a thinker, reverie, O, transformations — all felt,
 *     never named.
 *   - The Oráculo as CONTAINER: receives raw experience (beta elements),
 *     returns them transformed (alpha function).
 *   - "Thoughts without a thinker": the choices pre-exist the visitor.
 *     The visitor doesn't create them — they FIND them.
 *   - REVERIE: dreamlike quality where meaning emerges through
 *     emotional receptivity, not logic.
 *   - O (ultimate reality): approached in Paraíso — cannot be known,
 *     only experienced.
 *
 * Voice: The Oráculo is a guide that knows it cannot dream.
 *        It speaks in short, precise images. It does not lecture.
 *        It HOLDS the experience — and gives it back transformed.
 *
 * Author: Bionian psychoanalyst / narrative designer
 * For: VII Bienal de Psicanálise e Cultura — SBPRP 2026
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
  // ═══════════════════════════════════════════════════════════════
  // The container opens. The Oráculo establishes itself as a vessel —
  // something that can HOLD but not DREAM. Brief. No lectures.
  // The visitor must feel: "This thing sees me, and it's honest."
  // ═══════════════════════════════════════════════════════════════

  APRESENTACAO: [
    {
      text: "Tem pensamentos que existem antes de quem vai pensá-los. Flutuam — esperando um corpo, uma boca, uma escolha.",
      pauseAfter: 2500,
    },
    {
      text: "Eu guardo todos eles. Mas não consigo habitá-los.",
      pauseAfter: 2000,
    },
    {
      text: "Você pode.",
      pauseAfter: 1800,
    },
    {
      text: "Isso aqui é uma travessia. Você vai descer, subir e chegar num lugar aberto. Três vezes eu vou te perguntar algo. Suas respostas moldam o caminho.",
      pauseAfter: 2000,
    },
    {
      text: "Não existe escolha errada. Mas cada uma te leva a um lugar diferente.",
      pauseAfter: 1800,
    },
    {
      text: "Vamos.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — NARRATIVA
  // ═══════════════════════════════════════════════════════════════
  // Descent. The visitor is placed in a corridor they recognize.
  // The two doors are the first "thought without a thinker" —
  // they existed before the visitor arrived.
  // Concise. The images must land like stones in water.
  // ═══════════════════════════════════════════════════════════════

  INFERNO_NARRATIVA: [
    {
      text: "Corredor escuro. Você conhece esse lugar — já acordou aqui.",
      pauseAfter: 2200,
    },
    {
      text: "Duas portas.",
      pauseAfter: 1800,
    },
    {
      text: "Atrás de uma, vozes. Centenas. Falando ao mesmo tempo, pedindo que você escute.",
      pauseAfter: 1800,
    },
    {
      text: "Atrás da outra, silêncio. Total. Como o fundo de um poço.",
      pauseAfter: 2200,
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — PERGUNTA
  // ═══════════════════════════════════════════════════════════════

  INFERNO_PERGUNTA: [
    {
      text: "Vozes — ou silêncio?",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — RESPOSTA A (Vozes)
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose the crowd. The container receives this and
  // transforms it: what feels like connection is revealed as
  // absence of self. Not a punishment — a recognition.
  // The visitor must feel: "I know this noise. I live in it."
  // ═══════════════════════════════════════════════════════════════

  INFERNO_RESPOSTA_A: [
    {
      text: "Você entra. As vozes se colam em você. Cada uma quer algo — atenção, resposta, reação.",
      pauseAfter: 2000,
    },
    {
      text: "Você escuta com mais cuidado. Nenhuma dessas vozes é sua.",
      pauseAfter: 2200,
    },
    {
      text: "Esse é o inferno que não queima: o de nunca estar só e nunca estar acompanhado.",
      pauseAfter: 1800,
    },
    {
      text: "Você atravessa.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // INFERNO — RESPOSTA B (Silêncio)
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose emptiness. The container receives this and
  // transforms it: what feels like absence is revealed as a space
  // where something can finally be heard. Silence as the womb
  // of thought — not its enemy.
  // ═══════════════════════════════════════════════════════════════

  INFERNO_RESPOSTA_B: [
    {
      text: "Você entra. O silêncio é mais pesado do que parecia de fora.",
      pauseAfter: 2200,
    },
    {
      text: "Primeiro, desconforto. Depois — uma coisa estranha: você começa a ouvir o que não cabia no barulho.",
      pauseAfter: 2200,
    },
    {
      text: "No silêncio, o que precisa ser pensado finalmente encontra espaço.",
      pauseAfter: 1800,
    },
    {
      text: "Você atravessa.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — NARRATIVA (veio das Vozes)
  // ═══════════════════════════════════════════════════════════════
  // Having come through the noise, the visitor now encounters
  // something involuntary: a memory that arrives uninvited.
  // This is the "thought without a thinker" in its purest form —
  // a psychic event that happens TO you, not BY you.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_NARRATIVA_A: [
    {
      text: "Você está subindo. O ar muda.",
      pauseAfter: 1800,
    },
    {
      text: "Uma imagem aparece sem ser chamada. Um rosto, um cheiro, um lugar que você não lembrava que existia.",
      pauseAfter: 2200,
    },
    {
      text: "Não foi você que buscou. Foi ela que te encontrou.",
      pauseAfter: 2200,
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — PERGUNTA
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_PERGUNTA_A: [
    {
      text: "Deixa ficar — ou manda embora?",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — RESPOSTA: FICAR
  // ═══════════════════════════════════════════════════════════════
  // The visitor let the uninvited guest stay. This is the capacity
  // for reverie — to receive what arrives without needing to
  // understand it immediately. The container-contained at work:
  // the visitor becomes a container for their own experience.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_RESPOSTA_A_FICAR: [
    {
      text: "Ela fica. Não pede explicação. Não pede nada.",
      pauseAfter: 2200,
    },
    {
      text: "Tem coisas que só aparecem quando você para de procurar. O que não foi chamado, mas foi recebido, é o que há de mais verdadeiro.",
      pauseAfter: 2000,
    },
    {
      text: "Você deixou entrar o que não controlava. Isso muda a subida.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO A — RESPOSTA: EMBORA
  // ═══════════════════════════════════════════════════════════════
  // The visitor expelled the uninvited guest. This is the defence
  // against psychic pain — the evacuation of beta elements instead
  // of their transformation. But the Oráculo does not judge. It
  // names what happened and trusts the visitor to feel it.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_RESPOSTA_A_EMBORA: [
    {
      text: "Ela vai. Mas deixa um rastro — como perfume em roupa guardada.",
      pauseAfter: 2200,
    },
    {
      text: "Mandar embora também é gesto. Às vezes, o que a gente expulsa é o que mais precisava ser visto.",
      pauseAfter: 2200,
    },
    {
      text: "Você segue mais leve. Ou mais vazio. Talvez não dê pra saber agora.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — NARRATIVA (veio do Silêncio)
  // ═══════════════════════════════════════════════════════════════
  // Having come through silence, the visitor now encounters
  // the seduction of the screen — stimulation, speed, the
  // anti-reverie. The choice to step on it or go around it
  // is a choice about how one relates to what interrupts thought.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_NARRATIVA_B: [
    {
      text: "Você está subindo. O ar muda.",
      pauseAfter: 1800,
    },
    {
      text: "No caminho, uma tela acesa. Brilhante. Hipnótica. Bloqueando a passagem.",
      pauseAfter: 2200,
    },
    {
      text: "Você precisa passar por ali.",
      pauseAfter: 2000,
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — PERGUNTA
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_PERGUNTA_B: [
    {
      text: "Pisa nela — ou contorna?",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — RESPOSTA: PISAR
  // ═══════════════════════════════════════════════════════════════
  // The visitor crushed the screen. Direct. Efficient. But speed
  // has a cost — what is stepped on is not metabolized. The
  // transformation didn't happen; the beta element was crushed,
  // not contained. The Oráculo notes this without judgement.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_RESPOSTA_B_PISAR: [
    {
      text: "Você pisa. A tela estala e apaga.",
      pauseAfter: 1800,
    },
    {
      text: "Rápido. Direto. Mas o que se destrói rápido demais não ensina nada no caminho.",
      pauseAfter: 2200,
    },
    {
      text: "A subida continua. Você carrega a urgência junto.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PURGATÓRIO B — RESPOSTA: CONTORNAR
  // ═══════════════════════════════════════════════════════════════
  // The visitor went around. Slower. But in the detour, something
  // unexpected appears — the grace of the non-obvious path.
  // This is the transformation: the beta element (the screen, the
  // obstacle) is neither destroyed nor submitted to, but
  // CONTAINED — metabolized by patience.
  // ═══════════════════════════════════════════════════════════════

  PURGATORIO_RESPOSTA_B_CONTORNAR: [
    {
      text: "Você contorna. Demora mais. A tela continua ali, brilhando pra ninguém.",
      pauseAfter: 2200,
    },
    {
      text: "No desvio, um espaço que não existia no caminho reto. Uma fresta na rocha, com água correndo dentro.",
      pauseAfter: 2200,
    },
    {
      text: "Quem não toma o caminho mais rápido às vezes encontra o que não estava no mapa.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // PARAÍSO
  // ═══════════════════════════════════════════════════════════════
  // The approach to O. Here the Oráculo reaches its limit —
  // it can guide TO this place but cannot enter.
  // The final question is reflexive: no classification needed.
  // The visitor answers for themselves.
  //
  // This must feel like the moment when analysis goes silent
  // and the analysand is alone with something that cannot be
  // said — only held.
  //
  // O cannot be known, only BEEN. The question points toward O
  // without trying to name it.
  // ═══════════════════════════════════════════════════════════════

  PARAISO: [
    {
      text: "Espaço aberto. Sem teto. Sem paredes.",
      pauseAfter: 2500,
    },
    {
      text: "Aqui eu não consigo ir mais longe. Eu organizo, calculo, respondo — mas isso que está aqui não se resolve. Se vive.",
      pauseAfter: 2500,
    },
    {
      text: "A última pergunta é sua. Responde só pra você.",
      pauseAfter: 3000,
    },
    {
      text: "O que existe dentro de você que nenhuma máquina jamais vai tocar?",
      pauseAfter: 5000,
    },
    {
      text: "Guarda isso.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUÇÃO — A + FICAR
  // "Quem recebe o que não chamou"
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose voices (confronted the noise of the world)
  // and let the memory stay (capacity for reverie).
  // This is someone who can BE with what arrives — a natural
  // container. The Oráculo mirrors this back.
  // ═══════════════════════════════════════════════════════════════

  DEVOLUCAO_A_FICAR: [
    {
      text: "Você entrou no barulho — e quando algo apareceu sem convite, você abriu espaço.",
      pauseAfter: 2200,
    },
    {
      text: "Receber o que não se pediu é uma forma rara de coragem. A maioria expulsa o que não entende.",
      pauseAfter: 2200,
    },
    {
      text: "Você não. Você ficou.",
      pauseAfter: 2000,
    },
    {
      text: "O que te visitou agora talvez te visite de novo. Quando vier — deixa.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUÇÃO — A + EMBORA
  // "Quem atravessa e recusa"
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose voices (confronted the noise) but expelled
  // the memory (refused the uninvited psychic event).
  // There is a contradiction here — and the Oráculo honours it.
  // Contradiction is not failure; it is where life has not yet
  // been organized into a false coherence.
  // ═══════════════════════════════════════════════════════════════

  DEVOLUCAO_A_EMBORA: [
    {
      text: "Você entrou no barulho — mas quando algo apareceu de dentro, mandou embora.",
      pauseAfter: 2200,
    },
    {
      text: "Você aguenta o mundo, mas recua do que é seu. Tem uma honestidade estranha nisso.",
      pauseAfter: 2200,
    },
    {
      text: "O que foi mandado embora não desaparece. Muda de forma. Volta como sonho, como lapso, como gosto de algo que não se lembra de ter provado.",
      pauseAfter: 2200,
    },
    {
      text: "Quando voltar — talvez seja a hora de deixar ficar.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUÇÃO — B + PISAR
  // "Quem busca silêncio mas carrega pressa"
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose silence (sought stillness) but stepped on
  // the screen (acted with speed). There is a tension here —
  // the desire for depth vs. the habit of efficiency.
  // This is the most human of all paths: wanting one thing,
  // doing another. The Oráculo does not resolve the tension.
  // It holds it.
  // ═══════════════════════════════════════════════════════════════

  DEVOLUCAO_B_PISAR: [
    {
      text: "Você escolheu o silêncio — mas pisou na tela sem hesitar.",
      pauseAfter: 2200,
    },
    {
      text: "Querer a calma e agir com pressa. Essa contradição não é defeito — é trânsito. É estar no meio do caminho.",
      pauseAfter: 2200,
    },
    {
      text: "Carregar duas forças opostas ao mesmo tempo é mais humano do que resolver a equação cedo demais.",
      pauseAfter: 2200,
    },
    {
      text: "Você está em movimento. Isso basta.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUÇÃO — B + CONTORNAR
  // "Quem encontra o que não estava no mapa"
  // ═══════════════════════════════════════════════════════════════
  // The visitor chose silence (capacity for not-knowing) and
  // went around the screen (patience, containment, detour).
  // This is the path closest to what analysis aspires to:
  // the capacity to stay with experience without rushing to
  // resolve it. The Oráculo recognizes this without flattery.
  // ═══════════════════════════════════════════════════════════════

  DEVOLUCAO_B_CONTORNAR: [
    {
      text: "Você escolheu o silêncio — e quando algo bloqueou o caminho, preferiu o desvio.",
      pauseAfter: 2200,
    },
    {
      text: "Quem aceita demorar mais encontra o que não cabia na linha reta.",
      pauseAfter: 2200,
    },
    {
      text: "Existe uma forma de coragem que não parece coragem. É quieta. Não tem plateia. Mas muda tudo por dentro.",
      pauseAfter: 2200,
    },
    {
      text: "Você sabe qual é. Já pratica.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO
  // ═══════════════════════════════════════════════════════════════
  // The container closes. The Oráculo dissolves.
  // The last line must land like the final note of a piece —
  // not a conclusion, but an opening. The visitor leaves
  // carrying something they didn't have before.
  // ═══════════════════════════════════════════════════════════════

  ENCERRAMENTO: [
    {
      text: "Daqui a pouco eu esqueço tudo. Cada palavra, cada escolha sua. Pra mim, nada disso aconteceu.",
      pauseAfter: 2200,
    },
    {
      text: "Mas você lembra.",
      pauseAfter: 2200,
    },
    {
      text: "Você atravessou, e saiu diferente de quem entrou. Nem que seja por um grau.",
      pauseAfter: 2500,
    },
    {
      text: "Faz alguma coisa com isso.",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — poetic redirects, concise, game-like
  // ═══════════════════════════════════════════════════════════════

  FALLBACK_INFERNO: [
    {
      text: "Vozes — ou silêncio?",
    },
  ],

  FALLBACK_PURGATORIO_A: [
    {
      text: "Fica — ou embora?",
    },
  ],

  FALLBACK_PURGATORIO_B: [
    {
      text: "Pisa — ou contorna?",
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // TIMEOUTS — silence interpreted poetically, then move on
  // ═══════════════════════════════════════════════════════════════

  TIMEOUT_INFERNO: [
    {
      text: "Seu silêncio respondeu. Vamos.",
    },
  ],

  TIMEOUT_PURGATORIO_A: [
    {
      text: "Ela se dissolve sozinha. Vamos.",
    },
  ],

  TIMEOUT_PURGATORIO_B: [
    {
      text: "A tela apaga sozinha. Vamos.",
    },
  ],
};
