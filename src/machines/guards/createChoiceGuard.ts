import type { OracleContext } from '../oracleMachine.types';

/**
 * Generic guard factory for state machine choice point routing.
 * Creates a guard function that checks if a context field matches an expected value.
 *
 * @param field - The context field to check ('choice1' or 'choice2')
 * @param expectedValue - The value to match against
 * @returns Guard function compatible with XState v5 setup() guards
 */
export function createChoiceGuard(
  field: 'choice1' | 'choice2',
  expectedValue: string
): ({ context }: { context: OracleContext }) => boolean {
  return ({ context }) => context[field] === expectedValue;
}

/**
 * Creates a compound guard that checks multiple context fields.
 * All conditions must be true (AND logic).
 */
export function createCompoundGuard(
  conditions: Array<{ field: 'choice1' | 'choice2'; value: string }>
): ({ context }: { context: OracleContext }) => boolean {
  return ({ context }) =>
    conditions.every(({ field, value }) => context[field] === value);
}

/**
 * Pre-built compound guards for all 4 DEVOLUCAO routing paths.
 * Used in oracleMachine setup() guards configuration.
 */
export const PATH_GUARDS = {
  isPathAFicar: createCompoundGuard([
    { field: 'choice1', value: 'A' },
    { field: 'choice2', value: 'FICAR' },
  ]),
  isPathAEmbora: createCompoundGuard([
    { field: 'choice1', value: 'A' },
    { field: 'choice2', value: 'EMBORA' },
  ]),
  isPathBPisar: createCompoundGuard([
    { field: 'choice1', value: 'B' },
    { field: 'choice2', value: 'PISAR' },
  ]),
  isPathBContornar: createCompoundGuard([
    { field: 'choice1', value: 'B' },
    { field: 'choice2', value: 'CONTORNAR' },
  ]),
} as const;
