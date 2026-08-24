import { useEffect, useMemo, useState } from 'react';
import { EQUIPMENT, type Exercise, type Movement } from './data/exercises';
import { api } from './lib/api';
import { availableExercises, generateWorkout } from './lib/generator';
import { prescriptionOptions } from './lib/workout-edit';
import type { EquipmentId, Level, Profile, SessionPayload, Workout, WorkoutAction, WorkoutEdit, WorkoutFormat } from './types';

const FORMATS: { value: WorkoutFormat; label: string; note: string }[] = [
  { value: '3x3', label: '3 × 3', note: '3 blocks · 3 moves' },
  { value: '4x2', label: '4 × 2', note: '4 blocks · 2 moves' },
];

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

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">D<span>×</span></span>;
}

function Login() {
  return (
    <main className="login-shell">
      <div className="login-wordmark"><BrandMark /><span>Dynamx Workout</span></div>
      <div className="login-copy">
        <p className="eyebrow">Workout generator</p>
        <h1>Everyone gets<br />their line.</h1>
        <p>Pick the people. Pick what’s around. Get one tight training sheet.</p>
        <a className="google-button" href="/api/auth/login">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.01v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.87A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.87V7.51H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.49l3.35-2.62Z"/><path fill="#EA4335" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51l3.35 2.62C7.18 7.76 9.39 6 12 6Z"/></svg>
          Continue with Google
        </a>
      </div>
      <div className="login-grid" aria-hidden="true">
        <span>EXERCISE</span><span>OLIVER</span><span>KATRIN</span>
        <strong>Air squat</strong><strong>15 reps</strong><strong>10 reps</strong>
        <strong>Push-up</strong><strong>10 reps</strong><strong>6 reps</strong>
        <strong>Dead bug</strong><strong>10 / side</strong><strong>6 / side</strong>
      </div>
    </main>
  );
}

interface ProfileEditorProps {
  profile?: Profile;
  onClose: () => void;
  onSave: (name: string, level: Level) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function ProfileEditor({ profile, onClose, onSave, onDelete }: ProfileEditorProps) {
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
        <div className="modal-head"><h2>{profile ? 'Edit person' : 'Add person'}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
        <label>Name<input autoFocus maxLength={32} value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></label>
        <fieldset>
          <legend>Level</legend>
          <div className="level-options">
            {(['beginner', 'regular', 'advanced'] as Level[]).map((value) => (
              <label key={value} className={level === value ? 'selected' : ''}>
                <input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value)} />
                {value}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="modal-actions">
          {onDelete && <button type="button" className="text-danger" onClick={onDelete}>Delete</button>}
          <button className="save-button" disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

interface WorkoutSheetProps {
  workout: Workout;
  onAgain: () => void;
  onEdit: (edit: WorkoutEdit) => Promise<void>;
  editStatus: 'idle' | 'saving' | 'saved';
  editError: string;
}

function WorkoutSheet({ workout, onAgain, onEdit, editStatus, editError }: WorkoutSheetProps) {
  const exercises = availableExercises(workout.equipment);
  return (
    <section className="workout-sheet" aria-live="polite">
      <div className="sheet-heading">
        <div>
          <p className="eyebrow">Today’s workout</p>
          <h2>{workout.format.replace('x', ' × ')}</h2>
          <p className={`edit-hint ${editStatus}`}>{editError || (editStatus === 'saving' ? 'Saving change…' : editStatus === 'saved' ? 'Saved' : 'Click any cell to edit')}</p>
        </div>
        <div className="sheet-actions"><button className="quiet-button" onClick={() => window.print()}>Print</button><button className="quiet-button" onClick={onAgain}>Regenerate</button></div>
      </div>
      <div className="table-wrap">
        <table className={`editable-table ${workout.people.length > 2 ? 'many-people' : ''}`}>
          <thead><tr><th>Exercise</th>{workout.people.map((person) => <th key={person.id}>{person.name}</th>)}</tr></thead>
          <tbody>
            {workout.blocks.map((block) => (
              <BlockRows key={block.number} block={block} people={workout.people} exercises={exercises} disabled={editStatus === 'saving'} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
      <ActionLog actions={workout.actions || []} />
    </section>
  );
}

interface BlockRowsProps {
  block: Workout['blocks'][number];
  people: Workout['people'];
  exercises: Exercise[];
  disabled: boolean;
  onEdit: (edit: WorkoutEdit) => Promise<void>;
}

function BlockRows({ block, people, exercises, disabled, onEdit }: BlockRowsProps) {
  return (
    <>
      <tr className="block-row"><th colSpan={people.length + 1}>Block {block.number}</th></tr>
      {block.rows.map((row, rowIndex) => (
        <tr key={`${block.number}-${rowIndex}`}>
          <th>
            <span className="cell-select exercise-cell">
              <select
                aria-label={`Exercise ${rowIndex + 1} in block ${block.number}`}
                value={row.exerciseId}
                disabled={disabled}
                onChange={(event) => void onEdit({ type: 'exercise', blockNumber: block.number, rowIndex, exerciseId: event.target.value })}
              >
                {MOVEMENTS.map((movement) => {
                  const options = exercises.filter((exercise) => exercise.movement === movement.id);
                  return options.length > 0 && <optgroup key={movement.id} label={movement.label}>{options.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</optgroup>;
                })}
              </select>
            </span>
          </th>
          {people.map((person) => {
            const current = row.prescriptions[person.id];
            const options = [...new Set([current, ...prescriptionOptions(row.exerciseId)])];
            return (
              <td key={person.id}>
                <span className="cell-select prescription-cell">
                  <select
                    aria-label={`${person.name} prescription for ${row.exercise} in block ${block.number}`}
                    value={current}
                    disabled={disabled}
                    onChange={(event) => void onEdit({ type: 'prescription', blockNumber: block.number, rowIndex, personId: person.id, value: event.target.value })}
                  >
                    {options.map((option) => <option key={option} value={option}>{option}</option>)}
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

function ActionLog({ actions }: { actions: WorkoutAction[] }) {
  return (
    <section className="action-log" aria-label="Workout action log">
      <div className="action-log-heading">
        <div><p className="eyebrow">Changes</p><h3>Action log</h3></div>
        <span>{actions.length} {actions.length === 1 ? 'change' : 'changes'}</span>
      </div>
      {actions.length === 0 ? <p className="empty-log">No edits yet.</p> : (
        <ol>
          {[...actions].reverse().map((action) => (
            <li key={action.id}>
              <time dateTime={action.createdAt}>{new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(action.createdAt))}</time>
              <strong>Block {action.blockNumber} · {action.personName || 'Exercise'}</strong>
              <span>{action.from}<i>→</i>{action.to}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function App() {
  const [session, setSession] = useState<SessionPayload | null | undefined>();
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

  useEffect(() => {
    api.session().then((payload) => {
      setSession(payload);
      if (payload) {
        setProfiles(payload.profiles);
        setSelected(payload.profiles.slice(0, 2).map((profile) => profile.id));
        api.workouts().then(setHistory).catch(() => undefined);
      }
    }).catch((caught) => { setError(caught.message); setSession(null); });
  }, []);

  const selectedPeople = useMemo(() => profiles.filter((profile) => selected.includes(profile.id)), [profiles, selected]);

  if (session === undefined) return <div className="loading"><BrandMark /></div>;
  if (!session) return <Login />;

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
    if (!selectedPeople.length) { setError('Select at least one person.'); return; }
    setBusy(true);
    setError('');
    try {
      const next = generateWorkout(selectedPeople, format, equipment);
      await api.saveWorkout(next);
      setWorkout(next);
      setEditStatus('idle');
      setEditError('');
      setHistory((current) => [next, ...current].slice(0, 8));
      requestAnimationFrame(() => document.querySelector('.workout-sheet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the workout.');
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
      setEditError(caught instanceof Error ? caught.message : 'Could not save the change.');
      setEditStatus('idle');
    }
  };

  return (
    <div className="app-shell">
      <header>
        <a className="wordmark" href="/" aria-label="Dynamx Workout"><BrandMark /><span>Workout</span></a>
        <div className="account"><span>{session.user.name}</span>{session.user.picture ? <img src={session.user.picture} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{session.user.name.charAt(0)}</span>}<a href="/api/auth/logout">Sign out</a></div>
      </header>

      <main>
        <section className="builder">
          <div className="builder-intro"><p className="eyebrow">New workout</p><h1>Build today’s sheet.</h1><p>Choose who trains and what you have. Bodyweight is always available.</p></div>

          <div className="setup-row">
            <div className="setup-label"><span>01</span><div><h2>People</h2><p>{selected.length || 'No'} selected</p></div></div>
            <div className="choice-list people-list">
              {profiles.map((profile) => (
                <div className={`person-choice ${selected.includes(profile.id) ? 'selected' : ''}`} key={profile.id}>
                  <button onClick={() => setSelected((current) => current.includes(profile.id) ? current.filter((id) => id !== profile.id) : [...current, profile.id])}>
                    <span className="person-initial">{profile.name.charAt(0)}</span><span><strong>{profile.name}</strong><small>{profile.level}</small></span><span className="check">✓</span>
                  </button>
                  <button className="edit-person" onClick={() => setEditor(profile)} aria-label={`Edit ${profile.name}`}>•••</button>
                </div>
              ))}
              {profiles.length < 8 && <button className="add-choice" onClick={() => setEditor('new')}><span>+</span>Add person</button>}
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-label"><span>02</span><div><h2>Format</h2><p>Blocks × moves</p></div></div>
            <div className="format-list">
              {FORMATS.map((item) => <button key={item.value} className={format === item.value ? 'selected' : ''} onClick={() => setFormat(item.value)}><strong>{item.label}</strong><small>{item.note}</small></button>)}
            </div>
          </div>

          <div className="setup-row">
            <div className="setup-label"><span>03</span><div><h2>Equipment</h2><p>{equipment.length ? `${equipment.length} selected` : 'Bodyweight only'}</p></div></div>
            <div className="equipment-list">
              {EQUIPMENT.map((item) => <button key={item.id} className={equipment.includes(item.id) ? 'selected' : ''} onClick={() => setEquipment((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}><span>{item.short}</span>{item.label}<i>✓</i></button>)}
            </div>
          </div>

          <div className="generate-row">
            <div>{error && <p className="error">{error}</p>}<p>{selectedPeople.map((person) => person.name).join(' + ') || 'Select a person'} · {format.replace('x', ' × ')} · {equipment.length ? equipment.map((id) => EQUIPMENT.find((item) => item.id === id)?.short).join(', ') : 'Bodyweight'}</p></div>
            <button className="generate-button" onClick={makeWorkout} disabled={busy || !selectedPeople.length}>{busy ? 'Building…' : 'Generate workout'}<span>↗</span></button>
          </div>
        </section>

        {workout && <WorkoutSheet workout={workout} onAgain={makeWorkout} onEdit={editWorkout} editStatus={editStatus} editError={editError} />}

        {!workout && history.length > 0 && (
          <section className="history"><div><p className="eyebrow">Recent</p><h2>Saved workouts</h2></div><div className="history-list">{history.slice(0, 5).map((item) => <button key={item.id} onClick={() => { setWorkout(item); setEditStatus('idle'); setEditError(''); }}><span>{new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(new Date(item.createdAt))}</span><strong>{item.people.map((person) => person.name).join(' + ')}</strong><small>{item.format.replace('x', ' × ')}</small></button>)}</div></section>
        )}
      </main>

      {editor && <ProfileEditor profile={editor === 'new' ? undefined : editor} onClose={() => setEditor(null)} onSave={saveProfile} onDelete={editor === 'new' ? undefined : deleteProfile} />}
    </div>
  );
}

export default App;
