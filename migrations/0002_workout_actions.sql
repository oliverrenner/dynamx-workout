CREATE TABLE workout_actions (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('exercise', 'prescription')),
  block_number INTEGER NOT NULL,
  row_index INTEGER NOT NULL,
  person_id TEXT,
  person_name TEXT,
  from_value TEXT NOT NULL,
  to_value TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX workout_actions_workout_created_idx ON workout_actions(workout_id, created_at);
CREATE INDEX workout_actions_user_id_idx ON workout_actions(user_id);
