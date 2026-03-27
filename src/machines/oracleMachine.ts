import { setup, assign } from 'xstate';
import type { OracleContext, OracleEvent } from './oracleMachine.types';
import { INITIAL_CONTEXT } from './oracleMachine.types';
import { PATH_GUARDS } from './guards/createChoiceGuard';

/**
 * Oracle State Machine - Complete narrative flow per PRD Section 6
 *
 * This machine implements the entire interactive voice experience:
 * - IDLE → APRESENTACAO → INFERNO → PURGATORIO → PARAISO → DEVOLUCAO → ENCERRAMENTO → FIM → IDLE
 * - 2 choices → 4 paths → 4 personalized endings
 * - Timeouts and fallbacks at decision points
 * - Context tracking for session analytics
 */
export const oracleMachine = setup({
  types: {} as {
    context: OracleContext;
    events: OracleEvent;
  },
  guards: {
    isPathAFicar: PATH_GUARDS.isPathAFicar,
    isPathAEmbora: PATH_GUARDS.isPathAEmbora,
    isPathBPisar: PATH_GUARDS.isPathBPisar,
    isPathBContornar: PATH_GUARDS.isPathBContornar,
  },
}).createMachine({
  id: 'oracle',
  initial: 'IDLE',
  context: INITIAL_CONTEXT,
    on: {
      FALLBACK_USED: {
        actions: assign({
          fallbackCount: ({ context }) => context.fallbackCount + 1,
        }),
      },
    },
    states: {
      IDLE: {
        on: {
          START: {
            target: 'APRESENTACAO',
            actions: assign({
              sessionId: () => crypto.randomUUID(),
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      APRESENTACAO: {
        entry: assign({ currentPhase: 'APRESENTACAO' }),
        on: {
          NARRATIVA_DONE: 'INFERNO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      INFERNO: {
        initial: 'NARRATIVA',
        entry: assign({ currentPhase: 'INFERNO' }),
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
        states: {
          NARRATIVA: {
            on: {
              NARRATIVA_DONE: 'PERGUNTA',
            },
          },
          PERGUNTA: {
            on: {
              NARRATIVA_DONE: 'AGUARDANDO',
            },
          },
          AGUARDANDO: {
            after: {
              25000: {
                target: 'TIMEOUT_REDIRECT',
                actions: assign({ choice1: 'B' }),
              },
            },
            on: {
              CHOICE_A: {
                target: 'RESPOSTA_A',
                actions: assign({ choice1: 'A' }),
              },
              CHOICE_B: {
                target: 'RESPOSTA_B',
                actions: assign({ choice1: 'B' }),
              },
            },
          },
          TIMEOUT_REDIRECT: {
            on: {
              NARRATIVA_DONE: 'RESPOSTA_B',
            },
          },
          RESPOSTA_A: {
            on: {
              NARRATIVA_DONE: '#oracle.PURGATORIO_A',
            },
          },
          RESPOSTA_B: {
            on: {
              NARRATIVA_DONE: '#oracle.PURGATORIO_B',
            },
          },
        },
      },

      PURGATORIO_A: {
        id: 'PURGATORIO_A',
        initial: 'NARRATIVA',
        entry: assign({ currentPhase: 'PURGATORIO' }),
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
        states: {
          NARRATIVA: {
            on: {
              NARRATIVA_DONE: 'PERGUNTA',
            },
          },
          PERGUNTA: {
            on: {
              NARRATIVA_DONE: 'AGUARDANDO',
            },
          },
          AGUARDANDO: {
            after: {
              25000: {
                target: 'RESPOSTA_FICAR',
                actions: assign({ choice2: 'FICAR' }),
              },
            },
            on: {
              CHOICE_FICAR: {
                target: 'RESPOSTA_FICAR',
                actions: assign({ choice2: 'FICAR' }),
              },
              CHOICE_EMBORA: {
                target: 'RESPOSTA_EMBORA',
                actions: assign({ choice2: 'EMBORA' }),
              },
            },
          },
          RESPOSTA_FICAR: {
            on: {
              NARRATIVA_DONE: '#oracle.PARAISO',
            },
          },
          RESPOSTA_EMBORA: {
            on: {
              NARRATIVA_DONE: '#oracle.PARAISO',
            },
          },
        },
      },

      PURGATORIO_B: {
        id: 'PURGATORIO_B',
        initial: 'NARRATIVA',
        entry: assign({ currentPhase: 'PURGATORIO' }),
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
        states: {
          NARRATIVA: {
            on: {
              NARRATIVA_DONE: 'PERGUNTA',
            },
          },
          PERGUNTA: {
            on: {
              NARRATIVA_DONE: 'AGUARDANDO',
            },
          },
          AGUARDANDO: {
            after: {
              25000: {
                target: 'RESPOSTA_CONTORNAR',
                actions: assign({ choice2: 'CONTORNAR' }),
              },
            },
            on: {
              CHOICE_PISAR: {
                target: 'RESPOSTA_PISAR',
                actions: assign({ choice2: 'PISAR' }),
              },
              CHOICE_CONTORNAR: {
                target: 'RESPOSTA_CONTORNAR',
                actions: assign({ choice2: 'CONTORNAR' }),
              },
            },
          },
          RESPOSTA_PISAR: {
            on: {
              NARRATIVA_DONE: '#oracle.PARAISO',
            },
          },
          RESPOSTA_CONTORNAR: {
            on: {
              NARRATIVA_DONE: '#oracle.PARAISO',
            },
          },
        },
      },

      PARAISO: {
        id: 'PARAISO',
        entry: assign({ currentPhase: 'PARAISO' }),
        on: {
          NARRATIVA_DONE: 'DEVOLUCAO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      DEVOLUCAO: {
        entry: assign({ currentPhase: 'DEVOLUCAO' }),
        always: [
          { target: 'DEVOLUCAO_A_FICAR', guard: 'isPathAFicar' },
          { target: 'DEVOLUCAO_A_EMBORA', guard: 'isPathAEmbora' },
          { target: 'DEVOLUCAO_B_PISAR', guard: 'isPathBPisar' },
          { target: 'DEVOLUCAO_B_CONTORNAR', guard: 'isPathBContornar' },
        ],
      },

      DEVOLUCAO_A_FICAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      DEVOLUCAO_A_EMBORA: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      DEVOLUCAO_B_PISAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      DEVOLUCAO_B_CONTORNAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      ENCERRAMENTO: {
        entry: assign({ currentPhase: 'ENCERRAMENTO' }),
        on: {
          NARRATIVA_DONE: 'FIM',
        },
        after: {
          120000: {
            target: '#oracle.IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },

      FIM: {
        after: {
          5000: {
            target: 'IDLE',
            actions: assign({
              sessionId: '',
              choice1: null,
              choice2: null,
              fallbackCount: 0,
              currentPhase: 'APRESENTACAO',
            }),
          },
        },
      },
    },
  });
