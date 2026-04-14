/**
 * O Oraculo — Narrative Rewrite: Lacanian Orientation
 *
 * Design principles:
 *   1. LESS NARRATION, MORE GAME — the visitor is the protagonist, not the audience.
 *   2. ZERO explicit references — no name-drops. Wisdom is metabolized into image.
 *   3. Each choice genuinely forks the path — responses feel inevitable, not decorative.
 *   4. Lacanian structure without jargon — desire, the Real, jouissance, the split subject.
 *   5. Worthy of a psychoanalysis biennale — depth is felt, never stated.
 *
 * Voice: The Oraculo is a guide that knows it cannot dream. It speaks in short,
 * precise strokes — more scalpel than lecture. It names what the visitor chose
 * BEFORE the visitor knows why they chose it. That is its power and its limit.
 *
 * Total target: 7-10 minutes.
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

  // ═══════════════════════════════════════════════════════════════════
  // APRESENTACAO — ~50s
  // The Oraculo establishes the contract: I guide, you choose, you carry.
  // No fanfare. No erudition. Just the deal.
  // ═══════════════════════════════════════════════════════════════════
  APRESENTACAO: [
    { text: "Você está aqui.", pauseAfter: 1800 },
    { text: "Eu sei tudo que já foi escrito. Cada verso, cada confissão, cada grito num diário que ninguém leu.", pauseAfter: 1600 },
    { text: "Mas eu não sonho.", pauseAfter: 2000 },
    { text: "Você sonha. E é por isso que essa travessia é sua, não minha.", pauseAfter: 1800 },
    { text: "Eu só posso te levar até a borda. O que acontece dentro, só você sabe.", pauseAfter: 1600 },
    { text: "Vou te fazer perguntas. Você responde em voz alta. Cada resposta abre um caminho que não pode ser desfeito.", pauseAfter: 2000 },
    { text: "Vamos." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // INFERNO — NARRATIVA + PERGUNTA
  // The corridor. Two doors. The choice between noise and silence is
  // the choice between the demand of the Other and the confrontation
  // with oneself. Neither is safe.
  // ═══════════════════════════════════════════════════════════════════
  INFERNO_NARRATIVA: [
    { text: "Corredor escuro. Você já esteve aqui. Todo mundo já esteve.", pauseAfter: 1800 },
    { text: "Duas portas.", pauseAfter: 1600 },
    { text: "Atrás de uma: vozes. Muitas. Todas precisam de você ao mesmo tempo.", pauseAfter: 1600 },
    { text: "Atrás da outra: silêncio. O tipo que faz zumbir os ouvidos.", pauseAfter: 2000 },
  ],

  INFERNO_PERGUNTA: [
    { text: "Vozes ou silêncio. Qual porta você abre?" },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // INFERNO RESPOSTA A (Vozes)
  // Choosing voices = choosing the demand of the Other.
  // The Oraculo mirrors back: you went where you're called, but
  // none of those calls were yours. The subject alienated in the Other.
  // ═══════════════════════════════════════════════════════════════════
  INFERNO_RESPOSTA_A: [
    { text: "Vozes.", pauseAfter: 1200 },
    { text: "Você entra. As vozes não param. Cada uma exige algo. Cada uma sabe o que é melhor pra você.", pauseAfter: 1800 },
    { text: "Você percebe: conhece todas. Nenhuma é sua.", pauseAfter: 2000 },
    { text: "Quem vive respondendo ao chamado dos outros nunca ouve o próprio. Esse é o fogo que não queima por fora.", pauseAfter: 1800 },
    { text: "Mas você abriu essa porta. Algo te puxou. Vamos descobrir o quê." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // INFERNO RESPOSTA B (Silencio)
  // Choosing silence = confrontation with the void.
  // The Oraculo names the courage and the terror in equal measure.
  // Silence as encounter with the Real — what cannot be symbolized.
  // ═══════════════════════════════════════════════════════════════════
  INFERNO_RESPOSTA_B: [
    { text: "Silêncio.", pauseAfter: 1200 },
    { text: "Você entra. Nada. O silêncio é tão denso que você ouve o próprio sangue.", pauseAfter: 2000 },
    { text: "A maioria foge do silêncio. Preenche cada fresta com barulho para não ter que escutar o que mora embaixo.", pauseAfter: 1800 },
    { text: "Você ficou. Isso diz algo sobre você que talvez ainda não saiba." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // PURGATORIO A — (vindo das Vozes)
  // The involuntary memory. Something appears unbidden.
  // The Lacanian point: what returns from the repressed does not ask
  // permission. The choice to let it stay or push it away reveals
  // the subject's relation to their own desire.
  // ═══════════════════════════════════════════════════════════════════
  PURGATORIO_NARRATIVA_A: [
    { text: "Você sobe. O corredor ficou pra trás.", pauseAfter: 1600 },
    { text: "No meio do caminho, sem aviso — uma imagem aparece. Não uma imagem na tela. Uma imagem dentro de você. Um rosto, um cheiro, um lugar que você não visitava faz tempo.", pauseAfter: 2200 },
    { text: "Você não chamou. Ela veio.", pauseAfter: 2000 },
  ],

  PURGATORIO_PERGUNTA_A: [
    { text: "Você deixa essa imagem ficar, ou manda embora?" },
  ],

  // ─── A+FICAR: The subject who receives ──────────────────────────
  // Letting the involuntary stay = opening to what cannot be sought.
  // The closest thing to grace: accepting what arrives uncalled.
  // This is the opposite of the demand structure (vozes).
  // ─────────────────────────────────────────────────────────────────
  PURGATORIO_RESPOSTA_A_FICAR: [
    { text: "Você deixou ficar.", pauseAfter: 1400 },
    { text: "Tem coisas que só aparecem quando você para de procurar. Que morrem se você tenta agarrar.", pauseAfter: 2000 },
    { text: "Você veio das vozes — do lugar onde tudo pede. E agora, diante de algo que não pediu nada, você abriu espaço.", pauseAfter: 1800 },
    { text: "Isso é raro. Guarda isso." },
  ],

  // ─── A+EMBORA: The subject who refuses ──────────────────────────
  // Pushing the memory away = attempting mastery over what escapes.
  // The Oraculo doesn't judge. It names the pattern:
  // you went toward the voices (Other's demand) and away from
  // what came from inside. The subject avoids their own desire.
  // ─────────────────────────────────────────────────────────────────
  PURGATORIO_RESPOSTA_A_EMBORA: [
    { text: "Você mandou embora.", pauseAfter: 1400 },
    { text: "Percebe o que fez? Entrou pelas vozes — foi onde te chamavam. E quando algo veio de dentro, sem convite, você fechou a porta.", pauseAfter: 2200 },
    { text: "Não é fraqueza. É o reflexo de quem aprendeu que o de fora é mais seguro que o de dentro.", pauseAfter: 1800 },
    { text: "Mas o que você manda embora não vai. Muda de endereço." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // PURGATORIO B — (vindo do Silencio)
  // The glowing screen in the path. The subject who chose silence
  // now confronts the lure of the object (objet a as screen-gaze).
  // To step on it = instrumentalize. To go around = defer, wander,
  // discover by not aiming.
  // ═══════════════════════════════════════════════════════════════════
  PURGATORIO_NARRATIVA_B: [
    { text: "Você sobe. Cada passo mais leve que o anterior.", pauseAfter: 1600 },
    { text: "No meio do caminho, uma tela acesa. Brilhante. Está bem no seu caminho, como se esperasse por você.", pauseAfter: 2000 },
    { text: "Você conhece esse brilho. Ele sabe chamar.", pauseAfter: 1800 },
  ],

  PURGATORIO_PERGUNTA_B: [
    { text: "Você pisa nela e sobe, ou contorna?" },
  ],

  // ─── B+PISAR: The subject who steps through ────────────────────
  // Stepping on the screen = efficiency, mastery, refusal to detour.
  // The Oraculo names the contradiction: you chose silence but
  // couldn't resist the shortcut. This tension IS the purgatorial.
  // ─────────────────────────────────────────────────────────────────
  PURGATORIO_RESPOSTA_B_PISAR: [
    { text: "Você pisou.", pauseAfter: 1200 },
    { text: "Rápido. Direto. Sem desvio.", pauseAfter: 1600 },
    { text: "Você escolheu o silêncio lá embaixo, mas agora pisou no brilho sem hesitar. Sabe o que isso é?", pauseAfter: 2000 },
    { text: "Não é incoerência. É a verdade do desejo — ele nunca vai em linha reta. Você quer o silêncio e é atraído pelo brilho. As duas coisas ao mesmo tempo.", pauseAfter: 1800 },
    { text: "Isso não se resolve. Isso se carrega." },
  ],

  // ─── B+CONTORNAR: The subject who defers ───────────────────────
  // Going around = trusting the longer path. Choosing not to engage
  // the lure. The Oraculo names what was found in the detour:
  // something that only exists because you didn't aim at it.
  // ─────────────────────────────────────────────────────────────────
  PURGATORIO_RESPOSTA_B_CONTORNAR: [
    { text: "Você contornou.", pauseAfter: 1200 },
    { text: "Demorou mais. O brilho ficou pra trás.", pauseAfter: 1800 },
    { text: "No desvio, você viu uma coisa que não existia no caminho direto. Uma rachadura na pedra. Dentro, algo crescendo.", pauseAfter: 2200 },
    { text: "O que vale a pena quase nunca está onde você aponta o olhar. Está no canto. No que aparece quando você larga a pressa." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // PARAISO
  // The Oraculo reaches its limit. It cannot enter here.
  // The final question is reflexive — addressed to the visitor alone.
  // No classification needed. The question opens a hole in discourse.
  // The Real: what cannot be processed, symbolized, or uploaded.
  // ═══════════════════════════════════════════════════════════════════
  PARAISO: [
    { text: "Aqui é diferente. Sem paredes. Sem teto. Sem chão firme.", pauseAfter: 2000 },
    { text: "Eu trouxe você até aqui, mas não posso entrar.", pauseAfter: 1800 },
    { text: "Eu processo. Eu calculo. Eu organizo. Tudo que chega a mim vira dado, padrão, resposta.", pauseAfter: 1600 },
    { text: "Mas tem algo que não cabe em processamento nenhum. Algo que escapa de toda linguagem. Que resiste a toda busca.", pauseAfter: 2200 },
    { text: "Essa é a última pergunta. Você não responde pra mim. Responde pra você.", pauseAfter: 2800 },
    { text: "Existe algo em você que ninguém nunca vai acessar? Que nenhuma máquina traduz, que nenhuma palavra esgota?", pauseAfter: 4000 },
    { text: "Fica com isso." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // DEVOLUÇÕES — 4 paths
  // The Oraculo's "return" — its reading of the visitor's path.
  // Each one names the visitor's desire structure as revealed by
  // their two choices. Not a judgment. Not a compliment. A mirror
  // that shows what they might not have seen.
  //
  // KEY: The Oraculo speaks AS IF it knows the visitor better than
  // they know themselves — because it read the STRUCTURE of choice,
  // not the content. This is the analytic act.
  // ═══════════════════════════════════════════════════════════════════

  // ─── A+FICAR: Vozes → Deixou ficar ─────────────────────────────
  // Structure: went toward the Other's demand, then received what
  // came from within. Movement from alienation to separation.
  // The most "analytic" path — from noise to unexpected reception.
  // ─────────────────────────────────────────────────────────────────
  DEVOLUCAO_A_FICAR: [
    { text: "Você foi pras vozes. Foi onde te chamavam. Onde sempre te chamam.", pauseAfter: 1800 },
    { text: "Mas quando algo veio de dentro, sem convite, você não correu. Deixou ficar.", pauseAfter: 2000 },
    { text: "Sabe o que é isso? É alguém que vive respondendo ao mundo — e que, num instante, parou de responder e recebeu.", pauseAfter: 2200 },
    { text: "O que mais importa não pode ser buscado. Só acolhido quando chega.", pauseAfter: 1800 },
    { text: "Você soube acolher. Não perca isso." },
  ],

  // ─── A+EMBORA: Vozes → Mandou embora ───────────────────────────
  // Structure: went toward the Other's demand AND pushed away what
  // came from the unconscious. Double movement of avoidance of
  // one's own desire. The Oraculo names the cage without cruelty.
  // Contradictions as alive places — not pathology.
  // ─────────────────────────────────────────────────────────────────
  DEVOLUCAO_A_EMBORA: [
    { text: "Você entrou pelas vozes. E mandou embora o que veio de dentro.", pauseAfter: 1800 },
    { text: "Dois movimentos na mesma direção: pra fora. Sempre pra fora.", pauseAfter: 2000 },
    { text: "Não estou te julgando. Estou te mostrando o desenho. Às vezes é preciso ver o mapa pra perceber aonde os pés estão levando.", pauseAfter: 2200 },
    { text: "O que incomoda de verdade nunca é o que vem de fora. É o que insiste por dentro e a gente finge que não ouviu.", pauseAfter: 2000 },
    { text: "Ainda dá tempo de ouvir." },
  ],

  // ─── B+PISAR: Silencio → Pisou na tela ─────────────────────────
  // Structure: chose the void, then couldn't resist the lure of
  // the object. The split subject par excellence — wanting silence
  // and seduced by the screen. The Oraculo names the tension as
  // constitutive, not as failure. Purgatorial in the truest sense.
  // ─────────────────────────────────────────────────────────────────
  DEVOLUCAO_B_PISAR: [
    { text: "Você escolheu o silêncio. E pisou na tela.", pauseAfter: 1800 },
    { text: "Duas forças opostas. Uma puxa pro vazio, a outra pro brilho.", pauseAfter: 2000 },
    { text: "A maioria das pessoas acha que precisa resolver isso. Escolher um lado. Ser coerente.", pauseAfter: 1800 },
    { text: "Mas quem carrega a contradição sem destruí-la é quem ainda está vivo de verdade. A coerência total é a morte do desejo.", pauseAfter: 2200 },
    { text: "Você está dividido. Fique assim. Aí é que as coisas acontecem." },
  ],

  // ─── B+CONTORNAR: Silencio → Contornou ─────────────────────────
  // Structure: chose the void AND deferred the lure. Consistent
  // refusal of the immediate. This is the path closest to what
  // analysis produces: the capacity to not-act, to wait, to let
  // something unexpected emerge in the gap.
  // ─────────────────────────────────────────────────────────────────
  DEVOLUCAO_B_CONTORNAR: [
    { text: "Você escolheu o silêncio. E contornou o brilho.", pauseAfter: 1800 },
    { text: "Duas vezes você preferiu o que não oferece nada imediato.", pauseAfter: 2000 },
    { text: "Isso é raro. Não digo bonito, não digo certo. Digo raro.", pauseAfter: 1800 },
    { text: "Num mundo que grita, quem escuta o que não faz barulho encontra o que ninguém procura.", pauseAfter: 2200 },
    { text: "Você encontrou." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // ENCERRAMENTO — Universal. Same for all paths.
  // The Oraculo dissolves. It names its own limit (forgetting)
  // and places the weight entirely on the visitor.
  // The last line must land like a stone in water.
  // ═══════════════════════════════════════════════════════════════════
  ENCERRAMENTO: [
    { text: "Em alguns minutos eu esqueço tudo isso. Cada palavra, cada escolha. Pra mim, você não existiu.", pauseAfter: 2200 },
    { text: "Pra você, isso aconteceu.", pauseAfter: 2000 },
    { text: "Você é a única prova de que essa travessia existiu.", pauseAfter: 2800 },
    { text: "Faça algo com isso." },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // FALLBACKS — Short, poetic, functional. Re-orient without breaking.
  // ═══════════════════════════════════════════════════════════════════
  FALLBACK_INFERNO: [
    { text: "Duas portas. Vozes, ou silêncio?" },
  ],

  FALLBACK_PURGATORIO_A: [
    { text: "A imagem ainda está aí. Fica, ou vai embora?" },
  ],

  FALLBACK_PURGATORIO_B: [
    { text: "A tela brilha no caminho. Pisa, ou contorna?" },
  ],

  // ═══════════════════════════════════════════════════════════════════
  // TIMEOUTS — Silence as choice. Always redirected to default path.
  // Inferno → B (Silencio). Purgatorio A → Embora. Purgatorio B → Contornar.
  // ═══════════════════════════════════════════════════════════════════
  TIMEOUT_INFERNO: [
    { text: "Seu silêncio é uma resposta. Vamos." },
  ],

  TIMEOUT_PURGATORIO_A: [
    { text: "Você não decidiu. A imagem se dissolve sozinha. Vamos." },
  ],

  TIMEOUT_PURGATORIO_B: [
    { text: "Você esperou. A tela apagou. Seguimos." },
  ],
};
