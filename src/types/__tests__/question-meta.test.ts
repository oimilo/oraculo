import { describe, it, expect } from 'vitest';
import { QUESTION_META } from '@/types';

/**
 * QUESTION_META Tests — Phase 31 (Q1B addition)
 * Verifies the NLU metadata table has all expected entries with correct labels and keywords.
 */
describe('QUESTION_META — base questions (regression)', () => {
  it('Q1 (index 1) optionA is Ficar', () => {
    expect(QUESTION_META[1].optionA).toBe('Ficar');
  });
  it('Q2B (index 7) optionA is Tocar', () => {
    expect(QUESTION_META[7].optionA).toBe('Tocar');
  });
  it('Q4B (index 8) optionA is Reviver', () => {
    expect(QUESTION_META[8].optionA).toBe('Reviver');
  });
});

describe('QUESTION_META — Q1B branch (Phase 31, BR-01)', () => {
  it('Q1B (index 9) is defined', () => {
    expect(QUESTION_META[9]).toBeDefined();
  });

  it('Q1B optionA is Atravessar', () => {
    expect(QUESTION_META[9].optionA).toBe('Atravessar');
  });

  it('Q1B optionB is Voltar', () => {
    expect(QUESTION_META[9].optionB).toBe('Voltar');
  });

  it('Q1B keywordsA includes core verbs (atravessar, fresta, luz)', () => {
    expect(QUESTION_META[9].keywordsA).toContain('atravessar');
    expect(QUESTION_META[9].keywordsA).toContain('fresta');
    expect(QUESTION_META[9].keywordsA).toContain('luz');
  });

  it('Q1B keywordsB includes core verbs (voltar, pulsar, reconhecer)', () => {
    expect(QUESTION_META[9].keywordsB).toContain('voltar');
    expect(QUESTION_META[9].keywordsB).toContain('pulsar');
    expect(QUESTION_META[9].keywordsB).toContain('reconhecer');
  });

  it('Q1B defaultOnTimeout is A (Atravessar)', () => {
    expect(QUESTION_META[9].defaultOnTimeout).toBe('A');
  });

  it('Q1B questionContext mentions porta sem maçaneta and fresta de luz', () => {
    expect(QUESTION_META[9].questionContext).toContain('porta sem maçaneta');
    expect(QUESTION_META[9].questionContext).toContain('fresta de luz');
  });
});

describe('QUESTION_META — Q5B branch (Phase 32, BR-02)', () => {
  it('Q5B (index 10) is defined', () => {
    expect(QUESTION_META[10]).toBeDefined();
  });

  it('Q5B optionA is Fundir', () => {
    expect(QUESTION_META[10].optionA).toBe('Fundir');
  });

  it('Q5B optionB is Ordenar', () => {
    expect(QUESTION_META[10].optionB).toBe('Ordenar');
  });

  it('Q5B keywordsA includes core verbs (fundir, misturar, integrar)', () => {
    expect(QUESTION_META[10].keywordsA).toContain('fundir');
    expect(QUESTION_META[10].keywordsA).toContain('misturar');
    expect(QUESTION_META[10].keywordsA).toContain('integrar');
  });

  it('Q5B keywordsB includes core verbs (separar, ordenar, arquivar)', () => {
    expect(QUESTION_META[10].keywordsB).toContain('separar');
    expect(QUESTION_META[10].keywordsB).toContain('ordenar');
    expect(QUESTION_META[10].keywordsB).toContain('arquivar');
  });

  it('Q5B defaultOnTimeout is A (Fundir)', () => {
    expect(QUESTION_META[10].defaultOnTimeout).toBe('A');
  });

  it('Q5B questionContext mentions memoria and pergunta sem resposta', () => {
    expect(QUESTION_META[10].questionContext).toContain('memoria');
    expect(QUESTION_META[10].questionContext).toContain('pergunta sem resposta');
  });
});

describe('QUESTION_META — Phase 31 entries unchanged (regression)', () => {
  it('Q1B (index 9) optionA still Atravessar', () => {
    expect(QUESTION_META[9].optionA).toBe('Atravessar');
  });

  it('Q1B (index 9) optionB still Voltar', () => {
    expect(QUESTION_META[9].optionB).toBe('Voltar');
  });
});
