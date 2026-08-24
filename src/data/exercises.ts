import type { EquipmentId, Level } from '../types';

export type Movement = 'squat' | 'hinge' | 'lunge' | 'push' | 'pull' | 'core' | 'carry' | 'cardio';

export interface Exercise {
  id: string;
  name: string;
  movement: Movement;
  equipment: EquipmentId[];
  targets: Record<Level, string>;
}

export const EQUIPMENT: { id: EquipmentId; label: string; short: string }[] = [
  { id: 'kettlebell', label: 'Kettlebell', short: 'KB' },
  { id: 'dumbbells', label: 'Dumbbells', short: 'DB' },
  { id: 'bands', label: 'Bands', short: 'Band' },
  { id: 'pullup-bar', label: 'Pull-up bar', short: 'Bar' },
  { id: 'bench-box', label: 'Bench / box', short: 'Box' },
  { id: 'jump-rope', label: 'Jump rope', short: 'Rope' },
];

export const EXERCISES: Exercise[] = [
  { id: 'air-squat', name: 'Air squat', movement: 'squat', equipment: [], targets: { beginner: '10 reps', regular: '15 reps', advanced: '20 reps' } },
  { id: 'tempo-squat', name: 'Tempo squat', movement: 'squat', equipment: [], targets: { beginner: '8 reps', regular: '10 reps', advanced: '12 reps' } },
  { id: 'reverse-lunge', name: 'Reverse lunge', movement: 'lunge', equipment: [], targets: { beginner: '6 / side', regular: '8 / side', advanced: '12 / side' } },
  { id: 'lateral-lunge', name: 'Lateral lunge', movement: 'lunge', equipment: [], targets: { beginner: '6 / side', regular: '8 / side', advanced: '10 / side' } },
  { id: 'push-up', name: 'Push-up', movement: 'push', equipment: [], targets: { beginner: '6 reps', regular: '10 reps', advanced: '15 reps' } },
  { id: 'pike-push-up', name: 'Pike push-up', movement: 'push', equipment: [], targets: { beginner: '5 reps', regular: '8 reps', advanced: '12 reps' } },
  { id: 'glute-bridge', name: 'Glute bridge', movement: 'hinge', equipment: [], targets: { beginner: '12 reps', regular: '18 reps', advanced: '24 reps' } },
  { id: 'single-leg-bridge', name: 'Single-leg bridge', movement: 'hinge', equipment: [], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'dead-bug', name: 'Dead bug', movement: 'core', equipment: [], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'bird-dog', name: 'Bird dog', movement: 'core', equipment: [], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'shoulder-tap', name: 'Plank shoulder tap', movement: 'core', equipment: [], targets: { beginner: '8 total', regular: '16 total', advanced: '24 total' } },
  { id: 'hollow-hold', name: 'Hollow hold', movement: 'core', equipment: [], targets: { beginner: '15 sec', regular: '25 sec', advanced: '40 sec' } },
  { id: 'mountain-climber', name: 'Mountain climber', movement: 'cardio', equipment: [], targets: { beginner: '20 total', regular: '30 total', advanced: '40 total' } },
  { id: 'high-knees', name: 'High knees', movement: 'cardio', equipment: [], targets: { beginner: '20 sec', regular: '30 sec', advanced: '45 sec' } },
  { id: 'squat-jump', name: 'Squat jump', movement: 'cardio', equipment: [], targets: { beginner: '6 reps', regular: '10 reps', advanced: '15 reps' } },
  { id: 'skater-hop', name: 'Skater hop', movement: 'cardio', equipment: [], targets: { beginner: '8 total', regular: '16 total', advanced: '24 total' } },
  { id: 'calf-raise', name: 'Calf raise', movement: 'hinge', equipment: [], targets: { beginner: '12 reps', regular: '20 reps', advanced: '30 reps' } },
  { id: 'superman', name: 'Superman', movement: 'pull', equipment: [], targets: { beginner: '8 reps', regular: '12 reps', advanced: '18 reps' } },
  { id: 'kb-swing', name: 'Kettlebell swing', movement: 'hinge', equipment: ['kettlebell'], targets: { beginner: '10 reps', regular: '15 reps', advanced: '20 reps' } },
  { id: 'kb-goblet-squat', name: 'Goblet squat', movement: 'squat', equipment: ['kettlebell'], targets: { beginner: '8 reps', regular: '12 reps', advanced: '16 reps' } },
  { id: 'kb-press', name: 'KB single-arm press', movement: 'push', equipment: ['kettlebell'], targets: { beginner: '5 / side', regular: '8 / side', advanced: '12 / side' } },
  { id: 'kb-row', name: 'KB bent-over row', movement: 'pull', equipment: ['kettlebell'], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'kb-deadlift', name: 'Kettlebell deadlift', movement: 'hinge', equipment: ['kettlebell'], targets: { beginner: '10 reps', regular: '15 reps', advanced: '20 reps' } },
  { id: 'db-thruster', name: 'Dumbbell thruster', movement: 'push', equipment: ['dumbbells'], targets: { beginner: '6 reps', regular: '10 reps', advanced: '14 reps' } },
  { id: 'db-rdl', name: 'Dumbbell RDL', movement: 'hinge', equipment: ['dumbbells'], targets: { beginner: '8 reps', regular: '12 reps', advanced: '16 reps' } },
  { id: 'db-floor-press', name: 'DB floor press', movement: 'push', equipment: ['dumbbells'], targets: { beginner: '8 reps', regular: '12 reps', advanced: '16 reps' } },
  { id: 'db-renegade-row', name: 'Renegade row', movement: 'pull', equipment: ['dumbbells'], targets: { beginner: '5 / side', regular: '8 / side', advanced: '12 / side' } },
  { id: 'db-farmer-carry', name: 'Farmer carry', movement: 'carry', equipment: ['dumbbells'], targets: { beginner: '30 sec', regular: '45 sec', advanced: '60 sec' } },
  { id: 'band-pull-apart', name: 'Band pull-apart', movement: 'pull', equipment: ['bands'], targets: { beginner: '10 reps', regular: '15 reps', advanced: '20 reps' } },
  { id: 'band-row', name: 'Band row', movement: 'pull', equipment: ['bands'], targets: { beginner: '10 reps', regular: '15 reps', advanced: '20 reps' } },
  { id: 'pallof-press', name: 'Pallof press', movement: 'core', equipment: ['bands'], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'band-glute-walk', name: 'Band glute walk', movement: 'lunge', equipment: ['bands'], targets: { beginner: '8 / side', regular: '12 / side', advanced: '16 / side' } },
  { id: 'pull-up', name: 'Pull-up', movement: 'pull', equipment: ['pullup-bar'], targets: { beginner: '3 reps', regular: '6 reps', advanced: '10 reps' } },
  { id: 'hanging-knee-raise', name: 'Hanging knee raise', movement: 'core', equipment: ['pullup-bar'], targets: { beginner: '5 reps', regular: '10 reps', advanced: '15 reps' } },
  { id: 'dead-hang', name: 'Dead hang', movement: 'pull', equipment: ['pullup-bar'], targets: { beginner: '15 sec', regular: '30 sec', advanced: '50 sec' } },
  { id: 'box-step-up', name: 'Box step-up', movement: 'lunge', equipment: ['bench-box'], targets: { beginner: '6 / side', regular: '10 / side', advanced: '14 / side' } },
  { id: 'incline-push-up', name: 'Incline push-up', movement: 'push', equipment: ['bench-box'], targets: { beginner: '8 reps', regular: '12 reps', advanced: '18 reps' } },
  { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', movement: 'lunge', equipment: ['bench-box'], targets: { beginner: '5 / side', regular: '8 / side', advanced: '12 / side' } },
  { id: 'box-jump', name: 'Box jump', movement: 'cardio', equipment: ['bench-box'], targets: { beginner: '5 reps', regular: '8 reps', advanced: '12 reps' } },
  { id: 'jump-rope', name: 'Jump rope', movement: 'cardio', equipment: ['jump-rope'], targets: { beginner: '30 sec', regular: '45 sec', advanced: '60 sec' } },
  { id: 'rope-high-knees', name: 'Rope high knees', movement: 'cardio', equipment: ['jump-rope'], targets: { beginner: '20 sec', regular: '30 sec', advanced: '45 sec' } },
];
