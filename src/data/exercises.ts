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

const levelTargets = (level1: string, level2: string, level3: string, level4: string, level5: string): Record<Level, string> => ({
  level1,
  level2,
  level3,
  level4,
  level5,
});

export const EXERCISES: Exercise[] = [
  { id: 'air-squat', name: 'Air squat', movement: 'squat', equipment: [], targets: levelTargets('10 reps', '12 reps', '15 reps', '18 reps', '20 reps') },
  { id: 'tempo-squat', name: 'Tempo squat', movement: 'squat', equipment: [], targets: levelTargets('8 reps', '9 reps', '10 reps', '11 reps', '12 reps') },
  { id: 'reverse-lunge', name: 'Reverse lunge', movement: 'lunge', equipment: [], targets: levelTargets('6 / side', '7 / side', '8 / side', '10 / side', '12 / side') },
  { id: 'lateral-lunge', name: 'Lateral lunge', movement: 'lunge', equipment: [], targets: levelTargets('6 / side', '7 / side', '8 / side', '9 / side', '10 / side') },
  { id: 'push-up', name: 'Push-up', movement: 'push', equipment: [], targets: levelTargets('6 reps', '8 reps', '10 reps', '12 reps', '15 reps') },
  { id: 'pike-push-up', name: 'Pike push-up', movement: 'push', equipment: [], targets: levelTargets('5 reps', '6 reps', '8 reps', '10 reps', '12 reps') },
  { id: 'glute-bridge', name: 'Glute bridge', movement: 'hinge', equipment: [], targets: levelTargets('12 reps', '15 reps', '18 reps', '21 reps', '24 reps') },
  { id: 'single-leg-bridge', name: 'Single-leg bridge', movement: 'hinge', equipment: [], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'dead-bug', name: 'Dead bug', movement: 'core', equipment: [], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'bird-dog', name: 'Bird dog', movement: 'core', equipment: [], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'shoulder-tap', name: 'Plank shoulder tap', movement: 'core', equipment: [], targets: levelTargets('8 total', '12 total', '16 total', '20 total', '24 total') },
  { id: 'hollow-hold', name: 'Hollow hold', movement: 'core', equipment: [], targets: levelTargets('15 sec', '20 sec', '25 sec', '30 sec', '40 sec') },
  { id: 'mountain-climber', name: 'Mountain climber', movement: 'cardio', equipment: [], targets: levelTargets('20 total', '25 total', '30 total', '35 total', '40 total') },
  { id: 'high-knees', name: 'High knees', movement: 'cardio', equipment: [], targets: levelTargets('20 sec', '25 sec', '30 sec', '40 sec', '45 sec') },
  { id: 'squat-jump', name: 'Squat jump', movement: 'cardio', equipment: [], targets: levelTargets('6 reps', '8 reps', '10 reps', '12 reps', '15 reps') },
  { id: 'skater-hop', name: 'Skater hop', movement: 'cardio', equipment: [], targets: levelTargets('8 total', '12 total', '16 total', '20 total', '24 total') },
  { id: 'calf-raise', name: 'Calf raise', movement: 'hinge', equipment: [], targets: levelTargets('12 reps', '16 reps', '20 reps', '25 reps', '30 reps') },
  { id: 'superman', name: 'Superman', movement: 'pull', equipment: [], targets: levelTargets('8 reps', '10 reps', '12 reps', '15 reps', '18 reps') },
  { id: 'kb-swing', name: 'Kettlebell swing', movement: 'hinge', equipment: ['kettlebell'], targets: levelTargets('10 reps', '12 reps', '15 reps', '18 reps', '20 reps') },
  { id: 'kb-goblet-squat', name: 'Goblet squat', movement: 'squat', equipment: ['kettlebell'], targets: levelTargets('8 reps', '10 reps', '12 reps', '14 reps', '16 reps') },
  { id: 'kb-press', name: 'KB single-arm press', movement: 'push', equipment: ['kettlebell'], targets: levelTargets('5 / side', '6 / side', '8 / side', '10 / side', '12 / side') },
  { id: 'kb-row', name: 'KB bent-over row', movement: 'pull', equipment: ['kettlebell'], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'kb-deadlift', name: 'Kettlebell deadlift', movement: 'hinge', equipment: ['kettlebell'], targets: levelTargets('10 reps', '12 reps', '15 reps', '18 reps', '20 reps') },
  { id: 'db-thruster', name: 'Dumbbell thruster', movement: 'push', equipment: ['dumbbells'], targets: levelTargets('6 reps', '8 reps', '10 reps', '12 reps', '14 reps') },
  { id: 'db-rdl', name: 'Dumbbell RDL', movement: 'hinge', equipment: ['dumbbells'], targets: levelTargets('8 reps', '10 reps', '12 reps', '14 reps', '16 reps') },
  { id: 'db-floor-press', name: 'DB floor press', movement: 'push', equipment: ['dumbbells'], targets: levelTargets('8 reps', '10 reps', '12 reps', '14 reps', '16 reps') },
  { id: 'db-renegade-row', name: 'Renegade row', movement: 'pull', equipment: ['dumbbells'], targets: levelTargets('5 / side', '6 / side', '8 / side', '10 / side', '12 / side') },
  { id: 'db-farmer-carry', name: 'Farmer carry', movement: 'carry', equipment: ['dumbbells'], targets: levelTargets('30 sec', '35 sec', '45 sec', '50 sec', '60 sec') },
  { id: 'band-pull-apart', name: 'Band pull-apart', movement: 'pull', equipment: ['bands'], targets: levelTargets('10 reps', '12 reps', '15 reps', '18 reps', '20 reps') },
  { id: 'band-row', name: 'Band row', movement: 'pull', equipment: ['bands'], targets: levelTargets('10 reps', '12 reps', '15 reps', '18 reps', '20 reps') },
  { id: 'pallof-press', name: 'Pallof press', movement: 'core', equipment: ['bands'], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'band-glute-walk', name: 'Band glute walk', movement: 'lunge', equipment: ['bands'], targets: levelTargets('8 / side', '10 / side', '12 / side', '14 / side', '16 / side') },
  { id: 'pull-up', name: 'Pull-up', movement: 'pull', equipment: ['pullup-bar'], targets: levelTargets('3 reps', '4 reps', '6 reps', '8 reps', '10 reps') },
  { id: 'hanging-knee-raise', name: 'Hanging knee raise', movement: 'core', equipment: ['pullup-bar'], targets: levelTargets('5 reps', '8 reps', '10 reps', '12 reps', '15 reps') },
  { id: 'dead-hang', name: 'Dead hang', movement: 'pull', equipment: ['pullup-bar'], targets: levelTargets('15 sec', '20 sec', '30 sec', '40 sec', '50 sec') },
  { id: 'box-step-up', name: 'Box step-up', movement: 'lunge', equipment: ['bench-box'], targets: levelTargets('6 / side', '8 / side', '10 / side', '12 / side', '14 / side') },
  { id: 'incline-push-up', name: 'Incline push-up', movement: 'push', equipment: ['bench-box'], targets: levelTargets('8 reps', '10 reps', '12 reps', '15 reps', '18 reps') },
  { id: 'bulgarian-split-squat', name: 'Bulgarian split squat', movement: 'lunge', equipment: ['bench-box'], targets: levelTargets('5 / side', '6 / side', '8 / side', '10 / side', '12 / side') },
  { id: 'box-jump', name: 'Box jump', movement: 'cardio', equipment: ['bench-box'], targets: levelTargets('5 reps', '6 reps', '8 reps', '10 reps', '12 reps') },
  { id: 'jump-rope', name: 'Jump rope', movement: 'cardio', equipment: ['jump-rope'], targets: levelTargets('30 sec', '35 sec', '45 sec', '50 sec', '60 sec') },
  { id: 'rope-high-knees', name: 'Rope high knees', movement: 'cardio', equipment: ['jump-rope'], targets: levelTargets('20 sec', '25 sec', '30 sec', '40 sec', '45 sec') },
];
