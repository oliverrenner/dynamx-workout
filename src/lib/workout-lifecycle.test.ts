import { describe, expect, it } from 'vitest';
import type { Profile } from '../types';
import { generateWorkout } from './generator';
import { finishWorkout, startWorkout } from './workout-lifecycle';

const person: Profile = { id: 'oliver', name: 'Oliver', level: 'regular', createdAt: '2026-08-24T00:00:00.000Z' };

describe('workout lifecycle', () => {
  it('starts and finishes a workout with a server-derived duration', () => {
    const draft = generateWorkout([person], '3x3', [], 'lifecycle');
    const started = startWorkout(draft, '2026-08-24T10:00:00.000Z');
    const finished = finishWorkout(started, '2026-08-24T10:27:14.900Z');

    expect(started.startedAt).toBe('2026-08-24T10:00:00.000Z');
    expect(finished).toMatchObject({
      startedAt: '2026-08-24T10:00:00.000Z',
      finishedAt: '2026-08-24T10:27:14.900Z',
      durationSeconds: 1634,
    });
    expect(draft.startedAt).toBeUndefined();
  });

  it('does not finish an unstarted workout', () => {
    const draft = generateWorkout([person], '3x3', [], 'unstarted');
    expect(() => finishWorkout(draft)).toThrow('Start the workout');
  });

  it('does not start or finish a workout twice', () => {
    const draft = generateWorkout([person], '3x3', [], 'once');
    const started = startWorkout(draft, '2026-08-24T10:00:00.000Z');
    const finished = finishWorkout(started, '2026-08-24T10:01:00.000Z');

    expect(() => startWorkout(started)).toThrow('already in progress');
    expect(() => finishWorkout(finished)).toThrow('already finished');
  });
});
