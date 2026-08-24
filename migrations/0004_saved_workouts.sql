ALTER TABLE workouts ADD COLUMN saved_at TEXT;

-- Workouts that were previously started are already deliberate user records.
-- Leave never-started legacy generator output hidden.
UPDATE workouts
SET saved_at = COALESCE(started_at, created_at)
WHERE started_at IS NOT NULL;

CREATE INDEX workouts_user_saved_idx
  ON workouts(user_id, saved_at DESC)
  WHERE saved_at IS NOT NULL;
