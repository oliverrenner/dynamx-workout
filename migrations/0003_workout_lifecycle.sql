ALTER TABLE workouts ADD COLUMN started_at TEXT;
ALTER TABLE workouts ADD COLUMN finished_at TEXT;
ALTER TABLE workouts ADD COLUMN duration_seconds INTEGER;

CREATE INDEX workouts_user_finished_idx
  ON workouts(user_id, finished_at DESC)
  WHERE finished_at IS NOT NULL;
