import { describe, expect, it } from 'vitest';
import { availableExercises, generateWorkout } from './generator';
import type { Profile } from '../types';

const people: Profile[] = [
  { id: 'oliver', name: 'Oliver', level: 'regular', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'katrin', name: 'Katrin', level: 'beginner', createdAt: '2026-08-24T00:00:00.000Z' },
];

describe('workout generator', () => {
  it('uses only bodyweight exercises when no equipment is selected', () => {
    expect(availableExercises([]).every((exercise) => exercise.equipment.length === 0)).toBe(true);
    const workout = generateWorkout(people, '3x3', [], 'bodyweight');
    const bodyweightIds = new Set(availableExercises([]).map((exercise) => exercise.id));
    expect(workout.blocks.flatMap((block) => block.rows).every((row) => bodyweightIds.has(row.exerciseId))).toBe(true);
  });

  it.each([
    ['3x3', 3, 3],
    ['4x3', 4, 3],
    ['4x2', 4, 2],
  ] as const)('creates the %s format', (format, blocks, rows) => {
    const workout = generateWorkout(people, format, ['kettlebell'], format);
    expect(workout.blocks).toHaveLength(blocks);
    expect(workout.blocks.every((block) => block.rows.length === rows)).toBe(true);
  });

  it('personalizes prescriptions by profile level', () => {
    const workout = generateWorkout(people, '3x3', [], 'levels');
    const rows = workout.blocks.flatMap((block) => block.rows);
    expect(rows.some((row) => row.prescriptions.oliver !== row.prescriptions.katrin)).toBe(true);
  });

  it('does not place the same movement back-to-back', () => {
    const workout = generateWorkout(people, '4x3', [], 'movement-balance');
    const exerciseById = new Map(availableExercises([]).map((exercise) => [exercise.id, exercise]));
    const movements = workout.blocks.flatMap((block) => block.rows).map((row) => exerciseById.get(row.exerciseId)?.movement);
    movements.slice(1).forEach((movement, index) => expect(movement).not.toBe(movements[index]));
  });
});
