import type { Workout } from '../types';

export function startWorkout(workout: Workout, startedAt = new Date().toISOString()): Workout {
  if (workout.finishedAt) throw new Error('Workout is already finished.');
  if (workout.startedAt) throw new Error('Workout is already in progress.');
  if (!Number.isFinite(Date.parse(startedAt))) throw new Error('Invalid start time.');
  return { ...structuredClone(workout), startedAt };
}

export function finishWorkout(workout: Workout, finishedAt = new Date().toISOString()): Workout {
  if (!workout.startedAt) throw new Error('Start the workout before finishing it.');
  if (workout.finishedAt) throw new Error('Workout is already finished.');

  const start = Date.parse(workout.startedAt);
  const finish = Date.parse(finishedAt);
  if (!Number.isFinite(start) || !Number.isFinite(finish) || finish < start) throw new Error('Invalid workout duration.');

  return {
    ...structuredClone(workout),
    finishedAt,
    durationSeconds: Math.max(1, Math.floor((finish - start) / 1000)),
  };
}
