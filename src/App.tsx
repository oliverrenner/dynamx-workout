import { useEffect, useMemo, useState } from 'react';
import { EQUIPMENT, type Exercise, type Movement } from './data/exercises';
import { api } from './lib/api';
import { availableExercises, generateWorkout } from './lib/generator';
import { COPY, detectLanguage, localeFor, localizeActionValue, localizeEquipment, localizeExercise, localizeMovement, localizePrescription, storeLanguage, type Language } from './lib/i18n';
import { prescriptionOptions } from './lib/workout-edit';
import type { EquipmentId, Level, Profile, SessionPayload, Workout, WorkoutAction, WorkoutEdit, WorkoutFormat } from './types';

const FORMATS: { value: WorkoutFormat; label: string }[] = [
  { value: '3x3', label: '3 × 3' },
  { value: '4x2', label: '4 × 2' },
];

type AppView = 'workout' | 'history' | 'actions';

const MOVEMENTS: { id: Movement; label: string }[] = [
  { id: 'squat', label: 'Squat' },
  { id: 'hinge', label: 'Hinge' },
  { id: 'lunge', label: 'Lunge' },
  { id: 'push', label: 'Push' },
  { id: 'pull', label: 'Pull' },
  { id: 'core', label: 'Core' },
  { id: 'carry', label: 'Carry' },
  { id: 'cardio', label: 'Cardio' },
];

function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  return hours > 0
    ? [hours, minutes, remainder].map((value) => String(value).padStart(2, '0')).join(':')
    : [minutes, remainder].map((value) => String(value).padStart(2, '0')).join(':');
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">D<span>×</span></span>;
}

function LanguageToggle({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return (
    <div className="language-toggle" aria-label="Language / Sprache">
      {(['de', 'en'] as Language[]).map((value) => (
        <button key={value} className={language === value ? 'active' : ''} aria-pressed={language === value} onClick={() => onChange(value)}>{value.toUpperCase()}</button>
      ))}
    </div>
  );
}

function Login({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  const copy = COPY[language];
  return (
    <main className="login-shell">
      <div className="login-panel">
        <div className="login-top"><div className="login-wordmark"><BrandMark /><span>Dynamx Workout</span></div><LanguageToggle language={language} onChange={onLanguageChange} /></div>
        <h1>{copy.loginTitle}</h1>
        <p>{copy.loginIntro}</p>
        <a className="google-button" href="/api/auth/login">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.01v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.87A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.62Z"/><path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z"/></svg>
          {copy.continueWithGoogle}
        </a>
      </div>
    </main>
  );
}

interface ProfileEditorProps {
  profile?: Profile;
  language: Language;
  onClose: () => void;
  onSave: (name: string, level: Level) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function ProfileEditor({ profile, language, onClose, onSave, onDelete }: ProfileEditorProps) {
  const copy = COPY[language];
  const [name, setName] = useState(profile?.name || '');
  const [level, setLevel] = useState<Level>(profile?.level || 'regular');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await onSave(name.trim(), level).finally(() => setBusy(false));
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="profile-modal" onSubmit={submit}>
        <div className="modal-head"><h2>{profile ? copy.editPerson : copy.addPerson}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={copy.close}>×</button></div>
        <label>{copy.name}<input autoFocus maxLength={32} value={name} onChange={(event) => setName(event.target.value)} placeholder={copy.name} /></label>
        <fieldset>
          <legend>{copy.level}</legend>
          <div className="level-options">
            {(['beginner', 'regular', 'advanced'] as Level[]).map((value) => (
              <label key={value} className={level === value ? 'selected' : ''}>
                <input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value)} />
                {copy.levels[value]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="modal-actions">
          {onDelete && <button type="button" className="text-danger" onClick={onDelete}>{copy.delete}</button>}
          <button className="save-button" disabled={busy || !name.trim()}>{busy ? copy.saving : copy.save}</button>
        </div>
      </form>
    </div>
  );
}

interface WorkoutSheetProps {
  workout: Workout;
  language: Language;
  onAgain: () => void;
  onEdit: (edit: WorkoutEdit) => Promise<void>;
  onStart: () => Promise<void>;
  onFinish: () => Promise<void>;
  editStatus: 'idle' | 'saving' | 'saved';
  editError: string;
  lifecycleBusy: boolean;
  lifecycleError: string;
}

function WorkoutSheet({ workout, language, onAgain, onEdit, onStart, onFinish, editStatus, editError, lifecycleBusy, lifecycleError }: WorkoutSheetProps) {
  const copy = COPY[language];
  const exercises = availableExercises(workout.equipment);
  const running = Boolean(workout.startedAt && !workout.finishedAt);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running, workout.startedAt]);

  const elapsed = workout.finishedAt
    ? workout.durationSeconds || 0
    : workout.startedAt
      ? Math.max(0, Math.floor((now - Date.parse(workout.startedAt)) / 1000))
      : 0;
  const stateLabel = workout.finishedAt
    ? `${copy.finished} · ${formatDuration(elapsed)}`
    : running
      ? `${copy.inProgress} · ${formatDuration(elapsed)}`
      : copy.readyToStart;
  const editMessage = workout.finishedAt
    ? copy.finishedLocked
    : editError || (editStatus === 'saving' ? copy.savingChange : editStatus === 'saved' ? copy.saved : copy.editCells);

  return (
    <section className="workout-sheet" aria-live="polite">
      <div className="sheet-heading">
        <div>
          <h2>{workout.format.replace('x', ' × ')}</h2>
          <p className={`workout-state ${running ? 'running' : workout.finishedAt ? 'finished' : ''}`}><span />{stateLabel}</p>
          <p className={`edit-hint ${editStatus}`}>{editMessage}</p>
        </div>
        <div className="sheet-actions">
          <button className="quiet-button" onClick={() => window.print()}>{copy.print}</button>
          {!running && <button className="quiet-button" onClick={onAgain}>{copy.regenerate}</button>}
          {!workout.startedAt && <button className="workout-button" disabled={lifecycleBusy} onClick={() => void onStart()}>{lifecycleBusy ? copy.starting : copy.startWorkout}</button>}
          {running && <button className="workout-button finish" disabled={lifecycleBusy} onClick={() => void onFinish()}>{lifecycleBusy ? copy.finishing : copy.finishWorkout}</button>}
        </div>
      </div>
      {lifecycleError && <p className="lifecycle-error">{lifecycleError}</p>}
      <div className="table-wrap">
        <table className={`editable-table ${workout.people.length > 2 ? 'many-people' : ''}`}>
          <thead><tr><th>{copy.exercise}</th>{workout.people.map((person) => <th key={person.id}>{person.name}</th>)}</tr></thead>
          <tbody>
            {workout.blocks.map((block) => (
              <BlockRows key={block.number} block={block} people={workout.people} exercises={exercises} language={language} disabled={editStatus === 'saving' || Boolean(workout.finishedAt)} locked={Boolean(workout.finishedAt)} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface BlockRowsProps {
  block: Workout['blocks'][number];
  people: Workout['people'];
  exercises: Exercise[];
  language: Language;
  disabled: boolean;
  locked: boolean;
  onEdit: (edit: WorkoutEdit) => Promise<void>;
}

function BlockRows({ block, people, exercises, language, disabled, locked, onEdit }: BlockRowsProps) {
  const copy = COPY[language];
  return (
    <>
      <tr className="block-row"><th colSpan={people.length + 1}>{copy.block} {block.number}</th></tr>
      {block.rows.map((row, rowIndex) => (
        <tr key={`${block.number}-${rowIndex}`}>
          <th>
            <span className={`cell-select exercise-cell ${locked ? 'locked' : ''}`}>
              <select
                aria-label={copy.exerciseLabel(rowIndex + 1, block.number)}
                value={row.exerciseId}
                disabled={disabled}
                onChange={(event) => void onEdit({ type: 'exercise', blockNumber: block.number, rowIndex, exerciseId: event.target.value })}
              >
                {MOVEMENTS.map((movement) => {
                  const options = exercises.filter((exercise) => exercise.movement === movement.id);
                  return options.length > 0 && <optgroup key={movement.id} label={localizeMovement(movement.id, movement.label, language)}>{options.map((exercise) => <option key={exercise.id} value={exercise.id}>{localizeExercise(exercise.id, exercise.name, language)}</option>)}</optgroup>;
                })}
              </select>
            </span>
          </th>
          {people.map((person) => {
            const current = row.prescriptions[person.id];
            const options = [...new Set([current, ...prescriptionOptions(row.exerciseId)])];
            return (
              <td key={person.id}>
                <span className={`cell-select prescription-cell ${locked ? 'locked' : ''}`}>
                  <select
                    aria-label={copy.prescriptionLabel(person.name, localizeExercise(row.exerciseId, row.exercise, language), block.number)}
                    value={current}
                    disabled={disabled}
                    onChange={(event) => void onEdit({ type: 'prescription', blockNumber: block.number, rowIndex, personId: person.id, value: event.target.value })}
                  >
                    {options.map((option) => <option key={option} value={option}>{localizePrescription(option, language)}</option>)}
                  </select>
                </span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

interface HistoryViewProps {
  history: Workout[];
  language: Language;
  onOpen: (workout: Workout) => void;
}

function HistoryView({ history, language, onOpen }: HistoryViewProps) {
  const copy = COPY[language];
  return (
    <section className="view-section history-view">
      <div className="view-heading">
        <h1>{copy.history}</h1>
        <span>{history.length}</span>
      </div>
      {history.length === 0 ? <p className="empty-state">{copy.noFinishedWorkouts}</p> : <div className="history-list">
        {history.map((item) => (
          <button key={item.id} onClick={() => onOpen(item)}>
            <time dateTime={item.finishedAt || item.createdAt}>{new Intl.DateTimeFormat(localeFor(language), { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.finishedAt || item.createdAt))}</time>
            <strong>{item.people.map((person) => person.name).join(' + ')}</strong>
            <span>{item.format.replace('x', ' × ')} · {formatDuration(item.durationSeconds || 0)}</span>
          </button>
        ))}
      </div>}
    </section>
  );
}

interface ActionEntry {
  action: WorkoutAction;
  workout: Workout;
}

function ActionsView({ workouts, language }: { workouts: Workout[]; language: Language }) {
  const copy = COPY[language];
  const entries = workouts.flatMap((workout) => (workout.actions || []).map((action) => ({ action, workout })))
    .sort((left, right) => Date.parse(right.action.createdAt) - Date.parse(left.action.createdAt));

  return (
    <section className="view-section actions-view">
      <div className="view-heading">
        <h1>{copy.actions}</h1>
        <span>{entries.length}</span>
      </div>
      {entries.length === 0 ? <p className="empty-state">{copy.noWorkoutEdits}</p> : <ol className="action-list">
        {entries.map(({ action, workout }: ActionEntry) => (
          <li key={action.id}>
            <time dateTime={action.createdAt}>{new Intl.DateTimeFormat(localeFor(language), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(action.createdAt))}</time>
            <div><strong>{action.personName || copy.exercise} · {copy.block} {action.blockNumber}</strong><small>{workout.people.map((person) => person.name).join(' + ')}</small></div>
            <span>{localizeActionValue(action.from, language)}<i>→</i>{localizeActionValue(action.to, language)}</span>
          </li>
        ))}
      </ol>}
    </section>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [session, setSession] = useState<SessionPayload | null | undefined>();
  const [view, setView] = useState<AppView>('workout');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<EquipmentId[]>([]);
  const [format, setFormat] = useState<WorkoutFormat>('3x3');
  const [editor, setEditor] = useState<Profile | 'new' | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [history, setHistory] = useState<Workout[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editStatus, setEditStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editError, setEditError] = useState('');
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const [lifecycleError, setLifecycleError] = useState('');
  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    api.session().then((payload) => {
      setSession(payload);
      if (payload) {
        setProfiles(payload.profiles);
        setSelected(payload.profiles.slice(0, 2).map((profile) => profile.id));
        api.workouts().then((workouts) => {
          setHistory(workouts.filter((item) => item.finishedAt));
          const active = workouts.find((item) => item.startedAt && !item.finishedAt);
          if (active) setWorkout(active);
        }).catch(() => undefined);
      }
    }).catch((caught) => { setError(caught.message); setSession(null); });
  }, []);

  const selectedPeople = useMemo(() => profiles.filter((profile) => selected.includes(profile.id)), [profiles, selected]);
  const visibleWorkouts = useMemo(() => {
    const unique = new Map(history.map((item) => [item.id, item]));
    if (workout) unique.set(workout.id, workout);
    return [...unique.values()];
  }, [history, workout]);
  const actionCount = useMemo(() => visibleWorkouts.reduce((total, item) => total + (item.actions?.length || 0), 0), [visibleWorkouts]);

  if (session === undefined) return <div className="loading"><BrandMark /></div>;
  if (!session) return <Login language={language} onLanguageChange={(next) => { setLanguage(next); storeLanguage(next); }} />;

  const saveProfile = async (name: string, level: Level) => {
    if (editor === 'new') {
      const profile = await api.addProfile(name, level);
      setProfiles((current) => [...current, profile]);
      setSelected((current) => [...current, profile.id]);
    } else if (editor) {
      const profile = await api.updateProfile(editor.id, name, level);
      setProfiles((current) => current.map((item) => item.id === profile.id ? profile : item));
    }
    setEditor(null);
  };

  const deleteProfile = async () => {
    if (!editor || editor === 'new') return;
    await api.deleteProfile(editor.id);
    setProfiles((current) => current.filter((profile) => profile.id !== editor.id));
    setSelected((current) => current.filter((id) => id !== editor.id));
    setEditor(null);
  };

  const makeWorkout = async () => {
    if (!selectedPeople.length) { setError(copy.errorSelectPerson); return; }
    if (workout?.startedAt && !workout.finishedAt) { setError(copy.errorFinishActive); return; }
    setBusy(true);
    setError('');
    try {
      const next = generateWorkout(selectedPeople, format, equipment);
      await api.saveWorkout(next);
      setWorkout(next);
      setEditStatus('idle');
      setEditError('');
      setLifecycleError('');
      requestAnimationFrame(() => document.querySelector('.workout-sheet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (caught) {
      setError(language === 'en' && caught instanceof Error ? caught.message : copy.errorCreateWorkout);
    } finally { setBusy(false); }
  };

  const editWorkout = async (edit: WorkoutEdit) => {
    if (!workout || editStatus === 'saving') return;
    setEditStatus('saving');
    setEditError('');
    try {
      const result = await api.updateWorkout(workout.id, edit);
      const next = { ...result.workout, actions: [...(workout.actions || []), result.action] };
      setWorkout(next);
      setHistory((current) => current.map((item) => item.id === next.id ? next : item));
      setEditStatus('saved');
      window.setTimeout(() => setEditStatus('idle'), 1400);
    } catch (caught) {
      setEditError(language === 'en' && caught instanceof Error ? caught.message : copy.errorSaveChange);
      setEditStatus('idle');
    }
  };

  const startCurrentWorkout = async () => {
    if (!workout || lifecycleBusy) return;
    setLifecycleBusy(true);
    setLifecycleError('');
    try {
      const next = await api.startWorkout(workout.id);
      setWorkout({ ...next, actions: workout.actions || [] });
    } catch (caught) {
      setLifecycleError(language === 'en' && caught instanceof Error ? caught.message : copy.errorStartWorkout);
    } finally { setLifecycleBusy(false); }
  };

  const finishCurrentWorkout = async () => {
    if (!workout || lifecycleBusy) return;
    setLifecycleBusy(true);
    setLifecycleError('');
    try {
      const next = { ...await api.finishWorkout(workout.id), actions: workout.actions || [] };
      setWorkout(next);
      setHistory((current) => [next, ...current.filter((item) => item.id !== next.id)].slice(0, 20));
    } catch (caught) {
      setLifecycleError(language === 'en' && caught instanceof Error ? caught.message : copy.errorFinishWorkout);
    } finally { setLifecycleBusy(false); }
  };

  const openWorkout = (item: Workout) => {
    setWorkout(item);
    setEditStatus('idle');
    setEditError('');
    setLifecycleError('');
    setView('workout');
    requestAnimationFrame(() => document.querySelector('.workout-sheet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="app-shell">
      <header>
        <a className="wordmark" href="/" aria-label="Dynamx Workout"><BrandMark /><span>Workout</span></a>
        <nav className="app-nav" aria-label={copy.mainNavigation}>
          <button className={view === 'workout' ? 'active' : ''} aria-current={view === 'workout' ? 'page' : undefined} onClick={() => setView('workout')}>{copy.workout}</button>
          <button className={view === 'history' ? 'active' : ''} aria-current={view === 'history' ? 'page' : undefined} onClick={() => setView('history')}>{copy.history} <span>{history.length}</span></button>
          <button className={view === 'actions' ? 'active' : ''} aria-current={view === 'actions' ? 'page' : undefined} onClick={() => setView('actions')}>{copy.actions} <span>{actionCount}</span></button>
        </nav>
        <div className="header-tools"><LanguageToggle language={language} onChange={(next) => { setLanguage(next); storeLanguage(next); }} /><div className="account"><span>{session.user.name}</span>{session.user.picture ? <img src={session.user.picture} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{session.user.name.charAt(0)}</span>}<a href="/api/auth/logout">{copy.signOut}</a></div></div>
      </header>

      <main>
        {view === 'workout' && <>
          <section className="builder">
          <div className="view-heading"><h1>{copy.workout}</h1></div>

          <div className="setup-row">
            <div className="setup-label"><h2>{copy.people}</h2><span>{copy.selectedCount(selected.length)}</span></div>
            <div className="choice-list people-list">
              {profiles.map((profile) => (
                <div className={`person-choice ${selected.includes(profile.id) ? 'selected' : ''}`} key={profile.id}>
                  <button onClick={() => setSelected((current) => current.includes(profile.id) ? current.filter((id) => id !== profile.id) : [...current, profile.id])}>
                    <span className="person-initial">{profile.name.charAt(0)}</span><span><strong>{profile.name}</strong><small>{copy.levels[profile.level]}</small></span><span className="check">✓</span>
                  </button>
                  <button className="edit-person" onClick={() => setEditor(profile)} aria-label={copy.editPersonLabel(profile.name)}>•••</button>
                </div>
              ))}
              {profiles.length < 8 && <button className="add-choice" onClick={() => setEditor('new')}><span>+</span>{copy.addPerson}</button>}
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-label"><h2>{copy.format}</h2></div>
            <div className="format-list">
              {FORMATS.map((item) => <button key={item.value} className={format === item.value ? 'selected' : ''} onClick={() => setFormat(item.value)}><strong>{item.label}</strong></button>)}
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-label"><h2>{copy.equipment}</h2><span>{equipment.length ? copy.selectedCount(equipment.length) : copy.bodyweight}</span></div>
            <div className="equipment-list">
              {EQUIPMENT.map((item) => <button key={item.id} className={equipment.includes(item.id) ? 'selected' : ''} onClick={() => setEquipment((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}><span>{item.short}</span>{localizeEquipment(item.id, item.label, language)}<i>✓</i></button>)}
            </div>
          </div>

          <div className="generate-row">
            <div>{error && <p className="error">{error}</p>}<p>{selectedPeople.map((person) => person.name).join(' + ') || copy.selectPerson} · {format.replace('x', ' × ')} · {equipment.length ? equipment.map((id) => EQUIPMENT.find((item) => item.id === id)?.short).join(', ') : copy.bodyweight}</p></div>
            <button className="generate-button" onClick={makeWorkout} disabled={busy || !selectedPeople.length || Boolean(workout?.startedAt && !workout.finishedAt)}>{workout?.startedAt && !workout.finishedAt ? copy.workoutInProgress : busy ? copy.building : copy.generateWorkout}</button>
          </div>
        </section>

        {workout && <WorkoutSheet workout={workout} language={language} onAgain={makeWorkout} onEdit={editWorkout} onStart={startCurrentWorkout} onFinish={finishCurrentWorkout} editStatus={editStatus} editError={editError} lifecycleBusy={lifecycleBusy} lifecycleError={lifecycleError} />}
        </>}
        {view === 'history' && <HistoryView history={history} language={language} onOpen={openWorkout} />}
        {view === 'actions' && <ActionsView workouts={visibleWorkouts} language={language} />}
      </main>

      {editor && <ProfileEditor profile={editor === 'new' ? undefined : editor} language={language} onClose={() => setEditor(null)} onSave={saveProfile} onDelete={editor === 'new' ? undefined : deleteProfile} />}
    </div>
  );
}

export default App;
