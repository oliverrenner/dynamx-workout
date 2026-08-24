export type Level = 'beginner' | 'regular' | 'advanced';
export type EquipmentId = 'kettlebell' | 'dumbbells' | 'bands' | 'pullup-bar' | 'bench-box' | 'jump-rope';
export type WorkoutFormat = '3x3' | '4x2';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Profile {
  id: string;
  name: string;
  level: Level;
  createdAt: string;
}

export interface WorkoutRow {
  exerciseId: string;
  exercise: string;
  prescriptions: Record<string, string>;
}

export interface WorkoutBlock {
  number: number;
  rows: WorkoutRow[];
}

export type WorkoutEdit =
  | { type: 'exercise'; blockNumber: number; rowIndex: number; exerciseId: string }
  | { type: 'prescription'; blockNumber: number; rowIndex: number; personId: string; value: string };

export interface WorkoutAction {
  id: string;
  workoutId: string;
  type: WorkoutEdit['type'];
  blockNumber: number;
  rowIndex: number;
  personId?: string;
  personName?: string;
  from: string;
  to: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  format: WorkoutFormat;
  equipment: EquipmentId[];
  people: Pick<Profile, 'id' | 'name' | 'level'>[];
  blocks: WorkoutBlock[];
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationSeconds?: number;
  actions?: WorkoutAction[];
}

export interface SessionPayload {
  user: User;
  profiles: Profile[];
}
