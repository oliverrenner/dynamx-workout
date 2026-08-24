import type { Workout } from '../types';

export type WorkoutStatus = 'ready' | 'active' | 'finished';

export function workoutStatus(workout: Workout): WorkoutStatus {
  if (workout.finishedAt) return 'finished';
  if (workout.startedAt) return 'active';
  return 'ready';
}

export function groupWorkouts(workouts: Workout[]): Record<WorkoutStatus, Workout[]> {
  return workouts.reduce<Record<WorkoutStatus, Workout[]>>((groups, workout) => {
    groups[workoutStatus(workout)].push(workout);
    return groups;
  }, { ready: [], active: [], finished: [] });
}
