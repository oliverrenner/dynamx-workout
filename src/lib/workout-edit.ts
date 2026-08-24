import { EXERCISES } from '../data/exercises';
import type { Workout, WorkoutAction, WorkoutEdit } from '../types';

const exerciseById = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

export function prescriptionOptions(exerciseId: string): string[] {
  const exercise = exerciseById.get(exerciseId);
  return exercise ? [...new Set(Object.values(exercise.targets))] : [];
}

export function applyWorkoutEdit(workout: Workout, edit: WorkoutEdit): { workout: Workout; action: WorkoutAction } {
  if (!Number.isInteger(edit.blockNumber) || !Number.isInteger(edit.rowIndex) || edit.blockNumber < 1 || edit.rowIndex < 0) {
    throw new Error('Invalid workout position.');
  }

  const next = structuredClone(workout);
  const block = next.blocks.find((item) => item.number === edit.blockNumber);
  const row = block?.rows[edit.rowIndex];
  if (!block || !row) throw new Error('Workout row not found.');

  const base = {
    id: crypto.randomUUID(),
    workoutId: workout.id,
    type: edit.type,
    blockNumber: edit.blockNumber,
    rowIndex: edit.rowIndex,
    createdAt: new Date().toISOString(),
  };

  let action: WorkoutAction;
  if (edit.type === 'exercise') {
    const exercise = exerciseById.get(edit.exerciseId);
    if (!exercise || !exercise.equipment.every((item) => next.equipment.includes(item))) {
      throw new Error('Exercise is not available with this equipment.');
    }
    if (exercise.id === row.exerciseId) throw new Error('Choose a different exercise.');

    action = { ...base, type: 'exercise', from: row.exercise, to: exercise.name };
    row.exerciseId = exercise.id;
    row.exercise = exercise.name;
    row.prescriptions = Object.fromEntries(next.people.map((person) => [person.id, exercise.targets[person.level]]));
  } else if (edit.type === 'prescription') {
    const person = next.people.find((item) => item.id === edit.personId);
    const options = prescriptionOptions(row.exerciseId);
    if (!person || !options.includes(edit.value)) throw new Error('Prescription is not available for this exercise.');

    const previous = row.prescriptions[person.id];
    if (!previous) throw new Error('Prescription not found.');
    if (previous === edit.value) throw new Error('Choose a different prescription.');

    action = {
      ...base,
      type: 'prescription',
      personId: person.id,
      personName: person.name,
      from: previous,
      to: edit.value,
    };
    row.prescriptions[person.id] = edit.value;
  } else {
    throw new Error('Invalid workout edit.');
  }

  next.actions = [...(next.actions || []), action];
  return { workout: next, action };
}
