import { describe, expect, it } from 'vitest';
import { EXERCISES } from './exercises';
import { EXERCISE_INSTRUCTIONS, exerciseInstruction } from './exercise-instructions';

describe('exercise instructions', () => {
  it('has one concise instruction in both languages for every exercise', () => {
    expect(Object.keys(EXERCISE_INSTRUCTIONS).sort()).toEqual(EXERCISES.map((exercise) => exercise.id).sort());

    for (const exercise of EXERCISES) {
      for (const language of ['de', 'en'] as const) {
        const instruction = exerciseInstruction(exercise.id, language);
        expect(instruction.length).toBeGreaterThan(0);
        expect(instruction.length).toBeLessThanOrEqual(64);
      }
    }
  });
});
