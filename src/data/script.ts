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
    { text: "Você nunca sofreu aqui.", pauseAfter: 1800, inflection: ['gentle'] },
    { text: "Mas você percebe uma coisa: não tem porta.", pauseAfter: 2500 },
  ],

  INFERNO_Q1_PERGUNTA: [
    { text: "Você fica — ou procura uma saída?" },
  ],

  // Q1 RESPOSTA A — Ficar (conforto sobre agencia)
  INFERNO_Q1_RESPOSTA_A: [
    { text: "Você fica.", pauseAfter: 1200 },
    { text: "A sala aceita. O conforto se aprofunda. A ausência da porta deixa de incomodar — porque você parou de olhar pra onde ela deveria estar.", pauseAfter: 2200, inflection: ['thoughtful'] },
    { text: "Tem gente que constrói essa sala sozinha e chama de paz.", pauseAfter: 2000 },
    { text: "A segurança comprada com soberania é a mais cara que existe. Mas o preço vem depois.", pauseAfter: 1800 },
  ],

  // Q1 RESPOSTA B — Procurar saida (desconforto como prova de vida)
  INFERNO_Q1_RESPOSTA_B: [
    { text: "Você levanta.", pauseAfter: 1200 },
    { text: "As paredes são lisas. Não tem fresta, não tem brecha. Mas você toca cada centímetro, procurando.", pauseAfter: 2200 },
    { text: "Prazer sem escolha é anestesia. Você sentiu isso antes de pensar.", pauseAfter: 2000, inflection: ['determined'] },
    { text: "A porta não apareceu. Mas o fato de você ter procurado já mudou a sala.", pauseAfter: 1800 },
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
    { text: "Mas o que é recusado não desaparece. Fica na parede, esperando a próxima vez.", pauseAfter: 2000, inflection: ['serious'] },
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
  // Transicao. O ar muda. Subida. Aqui se espera.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_INTRO: [],

  // ═══════════════════════════════════════════════════════════════
  // Q3 — O JARDIM QUE VAI QUEIMAR (Medium)
  // Apego vs Protecao. A beleza que ja esta morrendo.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q3_SETUP: [],
  PURGATORIO_Q3_PERGUNTA: [],
  PURGATORIO_Q3_RESPOSTA_A: [],
  PURGATORIO_Q3_RESPOSTA_B: [],

  // ═══════════════════════════════════════════════════════════════
  // Q4 — AS DUAS AGUAS (Deep)
  // Memoria vs Apagamento. Os dois rios.
  // ═══════════════════════════════════════════════════════════════
  PURGATORIO_Q4_SETUP: [],
  PURGATORIO_Q4_PERGUNTA: [],
  PURGATORIO_Q4_RESPOSTA_A: [],
  PURGATORIO_Q4_RESPOSTA_B: [],

  // ═══════════════════════════════════════════════════════════════
  // PARAISO — INTRO (Plan 02)
  // ═══════════════════════════════════════════════════════════════
  PARAISO_INTRO: [],

  // Q5 — A PERGUNTA SEM RESPOSTA (Deep) — Plan 02
  PARAISO_Q5_SETUP: [],
  PARAISO_Q5_PERGUNTA: [],
  PARAISO_Q5_RESPOSTA_A: [],
  PARAISO_Q5_RESPOSTA_B: [],

  // Q6 — O FIM DO JOGO (Profound) — Plan 02
  PARAISO_Q6_SETUP: [],
  PARAISO_Q6_PERGUNTA: [],
  PARAISO_Q6_RESPOSTA_A: [],
  PARAISO_Q6_RESPOSTA_B: [],

  // ═══════════════════════════════════════════════════════════════
  // DEVOLUCOES — 8 arquetipos baseados em padrao (Plan 02)
  // ═══════════════════════════════════════════════════════════════
  DEVOLUCAO_SEEKER: [],
  DEVOLUCAO_GUARDIAN: [],
  DEVOLUCAO_CONTRADICTED: [],
  DEVOLUCAO_PIVOT_EARLY: [],
  DEVOLUCAO_PIVOT_LATE: [],
  DEVOLUCAO_DEPTH_SEEKER: [],
  DEVOLUCAO_SURFACE_KEEPER: [],
  DEVOLUCAO_MIRROR: [],

  // ═══════════════════════════════════════════════════════════════
  // ENCERRAMENTO (Plan 02)
  // ═══════════════════════════════════════════════════════════════
  ENCERRAMENTO: [],

  // ═══════════════════════════════════════════════════════════════
  // FALLBACKS — 1 por pergunta (Plan 02)
  // ═══════════════════════════════════════════════════════════════
  FALLBACK_Q1: [],
  FALLBACK_Q2: [],
  FALLBACK_Q3: [],
  FALLBACK_Q4: [],
  FALLBACK_Q5: [],
  FALLBACK_Q6: [],

  // ═══════════════════════════════════════════════════════════════
  // TIMEOUTS — 1 por pergunta (Plan 02)
  // ═══════════════════════════════════════════════════════════════
  TIMEOUT_Q1: [],
  TIMEOUT_Q2: [],
  TIMEOUT_Q3: [],
  TIMEOUT_Q4: [],
  TIMEOUT_Q5: [],
  TIMEOUT_Q6: [],
};
