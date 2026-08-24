import { EXERCISES, type Exercise } from '../data/exercises';
import type { EquipmentId, Profile, Workout, WorkoutFormat } from '../types';

const FORMAT: Record<WorkoutFormat, { blocks: number; exercises: number }> = {
  '3x3': { blocks: 3, exercises: 3 },
  '4x2': { blocks: 4, exercises: 2 },
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = seed || 1;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function availableExercises(equipment: EquipmentId[]): Exercise[] {
  const available = new Set(equipment);
  return EXERCISES.filter((exercise) => exercise.equipment.every((item) => available.has(item)));
}

export function generateWorkout(
  people: Profile[],
  format: WorkoutFormat,
  equipment: EquipmentId[],
  seed: string = crypto.randomUUID(),
): Workout {
  if (people.length === 0) throw new Error('Select at least one person.');

  const shape = FORMAT[format];
  const candidates = availableExercises(equipment);
  const shuffled = seededShuffle(candidates, hashSeed(`${seed}:${format}:${equipment.sort().join(',')}`));
  const needed = shape.blocks * shape.exercises;
  const chosen: Exercise[] = [];
  const remaining = [...shuffled];

  while (chosen.length < needed) {
    const previous = chosen.at(-1);
    let index = remaining.findIndex((exercise) => exercise.movement !== previous?.movement);
    if (index === -1) {
      remaining.push(...seededShuffle(candidates, hashSeed(`${seed}:${chosen.length}`)));
      index = remaining.findIndex((exercise) => exercise.movement !== previous?.movement);
    }
    chosen.push(remaining.splice(Math.max(index, 0), 1)[0]);
  }

  return {
    id: crypto.randomUUID(),
    format,
    equipment: [...equipment],
    people: people.map(({ id, name, level }) => ({ id, name, level })),
    blocks: Array.from({ length: shape.blocks }, (_, blockIndex) => ({
      number: blockIndex + 1,
      rows: chosen
        .slice(blockIndex * shape.exercises, (blockIndex + 1) * shape.exercises)
        .map((exercise) => ({
          exerciseId: exercise.id,
          exercise: exercise.name,
          prescriptions: Object.fromEntries(people.map((person) => [person.id, exercise.targets[person.level]])),
        })),
    })),
    createdAt: new Date().toISOString(),
  };
}
