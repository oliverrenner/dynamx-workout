import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../data/exercises';
import { availableExercises, generateWorkout } from './generator';
import { LEVELS, normalizeLevel, type Profile } from '../types';

const people: Profile[] = [
  { id: 'oliver', name: 'Oliver', level: 'level3', createdAt: '2026-08-24T00:00:00.000Z' },
  { id: 'katrin', name: 'Katrin', level: 'level1', createdAt: '2026-08-24T00:00:00.000Z' },
];

describe('workout generator', () => {
  it('uses only bodyweight exercises when no equipment is selected', () => {
    expect(availableExercises([]).every((exercise) => exercise.equipment.length === 0)).toBe(true);
    const workout = generateWorkout(people, '3x3', [], 'bodyweight');
    const bodyweightIds = new Set(availableExercises([]).map((exercise) => exercise.id));
    expect(workout.blocks.flatMap((block) => block.rows).every((row) => bodyweightIds.has(row.exerciseId))).toBe(true);
  });

  it('only unlocks ball and cable exercises when that equipment is selected', () => {
    const bodyweightIds = availableExercises([]).map((exercise) => exercise.id);
    const ballIds = availableExercises(['exercise-ball']).map((exercise) => exercise.id);
    const cableIds = availableExercises(['cable-machine']).map((exercise) => exercise.id);

    expect(bodyweightIds).not.toContain('ball-glute-bridge');
    expect(bodyweightIds).not.toContain('lat-pulldown-hold');
    expect(ballIds).toContain('ball-glute-bridge');
    expect(ballIds).not.toContain('lat-pulldown-hold');
    expect(cableIds).toContain('lat-pulldown-hold');
    expect(cableIds).toContain('lat-pulldown-leg-extension');
    expect(cableIds).not.toContain('ball-glute-bridge');
  });

  it.each([
    ['3x3', 3, 3],
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

  it('provides a distinct curated prescription for all five levels', () => {
    expect(EXERCISES).toHaveLength(54);
    for (const exercise of EXERCISES) {
      expect(Object.keys(exercise.targets)).toEqual([...LEVELS]);
      expect(new Set(Object.values(exercise.targets))).toHaveLength(LEVELS.length);
      const quantities = LEVELS.map((level) => Number.parseInt(exercise.targets[level], 10));
      expect(quantities).toEqual([...quantities].sort((left, right) => left - right));
    }
  });

  it('maps legacy profile levels to the equivalent neutral tiers', () => {
    expect(normalizeLevel('beginner')).toBe('level1');
    expect(normalizeLevel('regular')).toBe('level3');
    expect(normalizeLevel('advanced')).toBe('level5');
  });

  it('does not place the same movement back-to-back', () => {
    const workout = generateWorkout(people, '4x2', [], 'movement-balance');
    const exerciseById = new Map(availableExercises([]).map((exercise) => [exercise.id, exercise]));
    const movements = workout.blocks.flatMap((block) => block.rows).map((row) => exerciseById.get(row.exerciseId)?.movement);
    movements.slice(1).forEach((movement, index) => expect(movement).not.toBe(movements[index]));
  });
});
