import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../data/exercises';
import type { Profile } from '../types';
import { generateWorkout } from './generator';
import { applyWorkoutEdit, prescriptionOptions } from './workout-edit';

const people: Profile[] = [
  { id: 'oliver', name: 'Oliver', level: 'level3', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'katrin', name: 'Katrin', level: 'level1', createdAt: '2026-08-24T00:00:00.000Z' },
];

describe('workout editing', () => {
  it('changes an exercise, resets its prescriptions, and records the action', () => {
    const workout = generateWorkout(people, '3x3', [], 'edit-exercise');
    const original = workout.blocks[0].rows[0];
    const replacement = EXERCISES.find((exercise) => exercise.equipment.length === 0 && exercise.id !== original.exerciseId)!;

    const result = applyWorkoutEdit(workout, { type: 'exercise', blockNumber: 1, rowIndex: 0, exerciseId: replacement.id });
    const changed = result.workout.blocks[0].rows[0];

    expect(changed.exerciseId).toBe(replacement.id);
    expect(changed.prescriptions).toEqual({ oliver: replacement.targets.level3, katrin: replacement.targets.level1 });
    expect(result.action).toMatchObject({ type: 'exercise', from: original.exercise, to: replacement.name, blockNumber: 1, rowIndex: 0 });
    expect(workout.blocks[0].rows[0].exerciseId).toBe(original.exerciseId);
  });

  it('changes one prescription using curated options and records the person', () => {
    const workout = generateWorkout(people, '3x3', [], 'edit-prescription');
    const row = workout.blocks[0].rows[0];
    const current = row.prescriptions.oliver;
    const replacement = prescriptionOptions(row.exerciseId).find((option) => option !== current)!;

    const result = applyWorkoutEdit(workout, { type: 'prescription', blockNumber: 1, rowIndex: 0, personId: 'oliver', value: replacement });

    expect(result.workout.blocks[0].rows[0].prescriptions.oliver).toBe(replacement);
    expect(result.workout.blocks[0].rows[0].prescriptions.katrin).toBe(row.prescriptions.katrin);
    expect(result.action).toMatchObject({ type: 'prescription', personId: 'oliver', personName: 'Oliver', from: current, to: replacement });
  });

  it('rejects arbitrary prescription text', () => {
    const workout = generateWorkout(people, '3x3', [], 'invalid-prescription');
    expect(() => applyWorkoutEdit(workout, {
      type: 'prescription', blockNumber: 1, rowIndex: 0, personId: 'oliver', value: '999 reps',
    })).toThrow('Prescription is not available');
  });

  it('rejects an exercise when its equipment is unavailable', () => {
    const workout = generateWorkout(people, '3x3', [], 'invalid-equipment');
    expect(() => applyWorkoutEdit(workout, {
      type: 'exercise', blockNumber: 1, rowIndex: 0, exerciseId: 'kb-swing',
    })).toThrow('Exercise is not available');
  });

  it('keeps a finished workout immutable', () => {
    const workout = { ...generateWorkout(people, '3x3', [], 'finished'), finishedAt: '2026-08-24T10:30:00.000Z' };
    expect(() => applyWorkoutEdit(workout, {
      type: 'prescription', blockNumber: 1, rowIndex: 0, personId: 'oliver', value: '999 reps',
    })).toThrow('Finished workouts cannot be edited');
  });
});
