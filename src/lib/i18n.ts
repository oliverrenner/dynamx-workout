import { EXERCISES } from '../data/exercises';
import type { EquipmentId, Level } from '../types';
import type { Movement } from '../data/exercises';

export type Language = 'de' | 'en';

const LANGUAGE_KEY = 'dynamx-workout-language';

export interface Copy {
  loginTitle: string;
  loginIntro: string;
  continueWithGoogle: string;
  editPerson: string;
  addPerson: string;
  close: string;
  name: string;
  level: string;
  delete: string;
  saving: string;
  save: string;
  create: string;
  workouts: string;
  workout: string;
  history: string;
  actions: string;
  mainNavigation: string;
  signOut: string;
  people: string;
  format: string;
  equipment: string;
  bodyweight: string;
  selectPerson: string;
  generateWorkout: string;
  workoutInProgress: string;
  building: string;
  preview: string;
  previewChange: string;
  saveWorkout: string;
  savingWorkout: string;
  backToSetup: string;
  backToWorkouts: string;
  ready: string;
  active: string;
  readyWorkouts: string;
  activeWorkouts: string;
  finishedWorkouts: string;
  noSavedWorkouts: string;
  savedOn: string;
  finished: string;
  inProgress: string;
  readyToStart: string;
  finishedLocked: string;
  savingChange: string;
  saved: string;
  editCells: string;
  print: string;
  regenerate: string;
  starting: string;
  startWorkout: string;
  finishing: string;
  finishWorkout: string;
  exercise: string;
  block: string;
  noFinishedWorkouts: string;
  noWorkoutEdits: string;
  errorSelectPerson: string;
  errorFinishActive: string;
  errorCreateWorkout: string;
  errorSaveWorkout: string;
  errorSaveChange: string;
  errorStartWorkout: string;
  errorFinishWorkout: string;
  levels: Record<Level, string>;
  selectedCount: (count: number) => string;
  editPersonLabel: (name: string) => string;
  exerciseLabel: (row: number, block: number) => string;
  prescriptionLabel: (person: string, exercise: string, block: number) => string;
}

export const COPY: Record<Language, Copy> = {
  en: {
    loginTitle: 'Workout generator',
    loginIntro: 'Generate and track simple training sheets.',
    continueWithGoogle: 'Continue with Google',
    editPerson: 'Edit person',
    addPerson: 'Add person',
    close: 'Close',
    name: 'Name',
    level: 'Level',
    delete: 'Delete',
    saving: 'Saving…',
    save: 'Save',
    create: 'Create',
    workouts: 'Workouts',
    workout: 'Workout',
    history: 'History',
    actions: 'Actions',
    mainNavigation: 'Main navigation',
    signOut: 'Sign out',
    people: 'People',
    format: 'Format',
    equipment: 'Equipment',
    bodyweight: 'Bodyweight',
    selectPerson: 'Select a person',
    generateWorkout: 'Generate workout',
    workoutInProgress: 'Workout in progress',
    building: 'Building…',
    preview: 'Preview',
    previewChange: 'Changes will be saved with this workout',
    saveWorkout: 'Save workout',
    savingWorkout: 'Saving workout…',
    backToSetup: 'Back to setup',
    backToWorkouts: 'Back to workouts',
    ready: 'Ready',
    active: 'Active',
    readyWorkouts: 'Ready',
    activeWorkouts: 'Active',
    finishedWorkouts: 'Finished',
    noSavedWorkouts: 'No saved workouts.',
    savedOn: 'Saved',
    finished: 'Finished',
    inProgress: 'In progress',
    readyToStart: 'Ready to start',
    finishedLocked: 'Finished workouts are locked',
    savingChange: 'Saving change…',
    saved: 'Saved',
    editCells: 'Click any cell to edit',
    print: 'Print',
    regenerate: 'Regenerate',
    starting: 'Starting…',
    startWorkout: 'Start workout',
    finishing: 'Finishing…',
    finishWorkout: 'Finish workout',
    exercise: 'Exercise',
    block: 'Block',
    noFinishedWorkouts: 'No finished workouts.',
    noWorkoutEdits: 'No workout edits.',
    errorSelectPerson: 'Select at least one person.',
    errorFinishActive: 'Finish the active workout before generating another.',
    errorCreateWorkout: 'Could not create the workout.',
    errorSaveWorkout: 'Could not save the workout.',
    errorSaveChange: 'Could not save the change.',
    errorStartWorkout: 'Could not start the workout.',
    errorFinishWorkout: 'Could not finish the workout.',
    levels: { beginner: 'Beginner', regular: 'Regular', advanced: 'Advanced' },
    selectedCount: (count) => `${count || 'None'} selected`,
    editPersonLabel: (name) => `Edit ${name}`,
    exerciseLabel: (row, block) => `Exercise ${row} in block ${block}`,
    prescriptionLabel: (person, exercise, block) => `${person} prescription for ${exercise} in block ${block}`,
  },
  de: {
    loginTitle: 'Workout-Generator',
    loginIntro: 'Einfache Trainingspläne erstellen und speichern.',
    continueWithGoogle: 'Mit Google fortfahren',
    editPerson: 'Person bearbeiten',
    addPerson: 'Person hinzufügen',
    close: 'Schließen',
    name: 'Name',
    level: 'Niveau',
    delete: 'Löschen',
    saving: 'Speichert…',
    save: 'Speichern',
    create: 'Erstellen',
    workouts: 'Workouts',
    workout: 'Workout',
    history: 'Verlauf',
    actions: 'Änderungen',
    mainNavigation: 'Hauptnavigation',
    signOut: 'Abmelden',
    people: 'Personen',
    format: 'Format',
    equipment: 'Ausrüstung',
    bodyweight: 'Körpergewicht',
    selectPerson: 'Person auswählen',
    generateWorkout: 'Workout erstellen',
    workoutInProgress: 'Workout läuft',
    building: 'Erstellt…',
    preview: 'Vorschau',
    previewChange: 'Änderungen werden mit diesem Workout gespeichert',
    saveWorkout: 'Workout speichern',
    savingWorkout: 'Workout wird gespeichert…',
    backToSetup: 'Zurück zur Auswahl',
    backToWorkouts: 'Zurück zu Workouts',
    ready: 'Bereit',
    active: 'Aktiv',
    readyWorkouts: 'Bereit',
    activeWorkouts: 'Aktiv',
    finishedWorkouts: 'Beendet',
    noSavedWorkouts: 'Keine gespeicherten Workouts.',
    savedOn: 'Gespeichert',
    finished: 'Beendet',
    inProgress: 'Läuft',
    readyToStart: 'Startbereit',
    finishedLocked: 'Beendete Workouts sind gesperrt',
    savingChange: 'Änderung wird gespeichert…',
    saved: 'Gespeichert',
    editCells: 'Zelle anklicken zum Ändern',
    print: 'Drucken',
    regenerate: 'Neu erstellen',
    starting: 'Startet…',
    startWorkout: 'Workout starten',
    finishing: 'Beendet…',
    finishWorkout: 'Workout beenden',
    exercise: 'Übung',
    block: 'Block',
    noFinishedWorkouts: 'Keine beendeten Workouts.',
    noWorkoutEdits: 'Keine Änderungen.',
    errorSelectPerson: 'Mindestens eine Person auswählen.',
    errorFinishActive: 'Aktives Workout zuerst beenden.',
    errorCreateWorkout: 'Workout konnte nicht erstellt werden.',
    errorSaveWorkout: 'Workout konnte nicht gespeichert werden.',
    errorSaveChange: 'Änderung konnte nicht gespeichert werden.',
    errorStartWorkout: 'Workout konnte nicht gestartet werden.',
    errorFinishWorkout: 'Workout konnte nicht beendet werden.',
    levels: { beginner: 'Einsteiger', regular: 'Mittel', advanced: 'Fortgeschritten' },
    selectedCount: (count) => count ? `${count} ausgewählt` : 'Keine ausgewählt',
    editPersonLabel: (name) => `${name} bearbeiten`,
    exerciseLabel: (row, block) => `Übung ${row} in Block ${block}`,
    prescriptionLabel: (person, exercise, block) => `${person}: Vorgabe für ${exercise} in Block ${block}`,
  },
};

const GERMAN_EXERCISES: Record<string, string> = {
  'air-squat': 'Kniebeuge',
  'tempo-squat': 'Tempo-Kniebeuge',
  'reverse-lunge': 'Rückwärts-Ausfallschritt',
  'lateral-lunge': 'Seitlicher Ausfallschritt',
  'push-up': 'Liegestütz',
  'pike-push-up': 'Pike-Liegestütz',
  'glute-bridge': 'Hüftbrücke',
  'single-leg-bridge': 'Einbeinige Hüftbrücke',
  'dead-bug': 'Dead Bug',
  'bird-dog': 'Bird Dog',
  'shoulder-tap': 'Schultertippen im Plank',
  'hollow-hold': 'Hollow Hold',
  'mountain-climber': 'Bergsteiger',
  'high-knees': 'Kniehebelauf',
  'squat-jump': 'Sprungkniebeuge',
  'skater-hop': 'Skater-Sprung',
  'calf-raise': 'Wadenheben',
  superman: 'Superman',
  'kb-swing': 'Kettlebell Swing',
  'kb-goblet-squat': 'Goblet Squat',
  'kb-press': 'Einarmiges Kettlebell-Drücken',
  'kb-row': 'Vorgebeugtes Kettlebell-Rudern',
  'kb-deadlift': 'Kettlebell-Kreuzheben',
  'db-thruster': 'Kurzhantel-Thruster',
  'db-rdl': 'Kurzhantel RDL',
  'db-floor-press': 'Kurzhantel-Bodendrücken',
  'db-renegade-row': 'Renegade Row',
  'db-farmer-carry': 'Farmer Carry',
  'band-pull-apart': 'Band Pull-apart',
  'band-row': 'Rudern mit Band',
  'pallof-press': 'Pallof Press',
  'band-glute-walk': 'Seitgang mit Band',
  'pull-up': 'Klimmzug',
  'hanging-knee-raise': 'Hängendes Knieheben',
  'dead-hang': 'Dead Hang',
  'box-step-up': 'Box Step-up',
  'incline-push-up': 'Erhöhter Liegestütz',
  'bulgarian-split-squat': 'Bulgarische Kniebeuge',
  'box-jump': 'Box-Sprung',
  'jump-rope': 'Seilspringen',
  'rope-high-knees': 'Kniehebelauf mit Seil',
};

const GERMAN_EQUIPMENT: Record<EquipmentId, string> = {
  kettlebell: 'Kettlebell',
  dumbbells: 'Kurzhanteln',
  bands: 'Bänder',
  'pullup-bar': 'Klimmzugstange',
  'bench-box': 'Bank / Box',
  'jump-rope': 'Springseil',
};

const GERMAN_MOVEMENTS: Record<Movement, string> = {
  squat: 'Kniebeuge',
  hinge: 'Hüftbeuge',
  lunge: 'Ausfallschritt',
  push: 'Drücken',
  pull: 'Ziehen',
  core: 'Rumpf',
  carry: 'Tragen',
  cardio: 'Ausdauer',
};

const exerciseIdByEnglishName = new Map(EXERCISES.map((exercise) => [exercise.name, exercise.id]));

export function resolveLanguage(stored: string | null, browserLanguage?: string): Language {
  if (stored === 'de' || stored === 'en') return stored;
  return browserLanguage?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function detectLanguage(): Language {
  let stored: string | null = null;
  try { stored = window.localStorage.getItem(LANGUAGE_KEY); } catch { /* Browser preference still works without storage. */ }
  return resolveLanguage(stored, navigator.languages?.[0] || navigator.language);
}

export function storeLanguage(language: Language): void {
  try { window.localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Keep the in-memory choice for this visit. */ }
}

export function localeFor(language: Language): string {
  return language === 'de' ? 'de-AT' : 'en-GB';
}

export function localizeExercise(exerciseId: string, fallback: string, language: Language): string {
  return language === 'de' ? GERMAN_EXERCISES[exerciseId] || fallback : fallback;
}

export function localizeEquipment(equipmentId: EquipmentId, fallback: string, language: Language): string {
  return language === 'de' ? GERMAN_EQUIPMENT[equipmentId] : fallback;
}

export function localizeMovement(movement: Movement, fallback: string, language: Language): string {
  return language === 'de' ? GERMAN_MOVEMENTS[movement] : fallback;
}

export function localizePrescription(value: string, language: Language): string {
  if (language === 'en') return value;
  return value
    .replace(/\breps\b/g, 'Wdh.')
    .replace(/\bsec\b/g, 'Sek.')
    .replace(/\/ side\b/g, '/ Seite')
    .replace(/\btotal\b/g, 'gesamt');
}

export function localizeActionValue(value: string, language: Language): string {
  const exerciseId = exerciseIdByEnglishName.get(value);
  return exerciseId ? localizeExercise(exerciseId, value, language) : localizePrescription(value, language);
}
