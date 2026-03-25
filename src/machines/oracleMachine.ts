import { createMachine, assign } from 'xstate';
import type { OracleContext, OracleEvent } from './oracleMachine.types';
import { INITIAL_CONTEXT } from './oracleMachine.types';

/**
 * Oracle State Machine - Complete narrative flow per PRD Section 6
 *
 * This machine implements the entire interactive voice experience:
 * - IDLE → APRESENTACAO → INFERNO → PURGATORIO → PARAISO → DEVOLUCAO → ENCERRAMENTO → FIM → IDLE
 * - 2 choices → 4 paths → 4 personalized endings
 * - Timeouts and fallbacks at decision points
 * - Context tracking for session analytics
 */
export const oracleMachine = createMachine(
  {
    id: 'oracle',
    initial: 'IDLE',
    types: {} as {
      context: OracleContext;
      events: OracleEvent;
    },
    context: INITIAL_CONTEXT,
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
      },

      INFERNO: {
        initial: 'NARRATIVA',
        entry: assign({ currentPhase: 'INFERNO' }),
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
              15000: {
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
            after: {
              2000: 'RESPOSTA_B',
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
              15000: {
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
              15000: {
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
      },

      DEVOLUCAO: {
        entry: assign({ currentPhase: 'DEVOLUCAO' }),
        always: [
          {
            target: 'DEVOLUCAO_A_FICAR',
            guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'FICAR',
          },
          {
            target: 'DEVOLUCAO_A_EMBORA',
            guard: ({ context }) => context.choice1 === 'A' && context.choice2 === 'EMBORA',
          },
          {
            target: 'DEVOLUCAO_B_PISAR',
            guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'PISAR',
          },
          {
            target: 'DEVOLUCAO_B_CONTORNAR',
            guard: ({ context }) => context.choice1 === 'B' && context.choice2 === 'CONTORNAR',
          },
        ],
      },

      DEVOLUCAO_A_FICAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
      },

      DEVOLUCAO_A_EMBORA: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
      },

      DEVOLUCAO_B_PISAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
      },

      DEVOLUCAO_B_CONTORNAR: {
        on: {
          NARRATIVA_DONE: 'ENCERRAMENTO',
        },
      },

      ENCERRAMENTO: {
        entry: assign({ currentPhase: 'ENCERRAMENTO' }),
        on: {
          NARRATIVA_DONE: 'FIM',
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
  }
);
