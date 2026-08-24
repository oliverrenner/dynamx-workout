import { describe, expect, it } from 'vitest';
import type { Workout } from '../types';
import { groupWorkouts, workoutStatus } from './workout-collection';

const base: Workout = {
  id: 'workout',
  format: '3x3',
  equipment: [],
  people: [],
  blocks: [],
  createdAt: '2026-08-24T10:00:00.000Z',
  savedAt: '2026-08-24T10:01:00.000Z',
};

describe('workout collection', () => {
  it('separates ready, active, and finished workouts', () => {
    const ready = { ...base, id: 'ready' };
    const active = { ...base, id: 'active', startedAt: '2026-08-24T10:02:00.000Z' };
    const finished = { ...active, id: 'finished', finishedAt: '2026-08-24T10:22:00.000Z', durationSeconds: 1200 };

    expect(workoutStatus(ready)).toBe('ready');
    expect(workoutStatus(active)).toBe('active');
    expect(workoutStatus(finished)).toBe('finished');
    expect(groupWorkouts([finished, ready, active])).toEqual({ ready: [ready], active: [active], finished: [finished] });
  });
});
