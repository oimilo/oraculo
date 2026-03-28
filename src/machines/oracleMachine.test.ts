import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { oracleMachine } from './oracleMachine';

describe('oracleMachine v3 (smoke)', () => {
  it('starts in IDLE and transitions to APRESENTACAO on START', () => {
    const actor = createActor(oracleMachine).start();
    expect(actor.getSnapshot().value).toBe('IDLE');
    actor.send({ type: 'START' });
    expect(actor.getSnapshot().value).toBe('APRESENTACAO');
    actor.stop();
  });

  it('reaches INFERNO.INTRO after APRESENTACAO NARRATIVA_DONE', () => {
    const actor = createActor(oracleMachine).start();
    actor.send({ type: 'START' });
    actor.send({ type: 'NARRATIVA_DONE' });
    expect(actor.getSnapshot().value).toEqual({ INFERNO: 'INTRO' });
    actor.stop();
  });

  it('has v3 context shape with choices array', () => {
    const actor = createActor(oracleMachine).start();
    actor.send({ type: 'START' });
    const ctx = actor.getSnapshot().context;
    expect(ctx.choices).toHaveLength(6);
    expect(ctx.choices.every((c: unknown) => c === null)).toBe(true);
    expect(ctx.sessionId).toBeTruthy();
    actor.stop();
  });
});
