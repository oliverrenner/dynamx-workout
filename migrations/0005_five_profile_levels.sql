CREATE TABLE profiles_v2 (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- Legacy values remain accepted for older open clients; the API normalizes them on read and write.
  level TEXT NOT NULL CHECK (level IN ('level1', 'level2', 'level3', 'level4', 'level5', 'beginner', 'regular', 'advanced')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO profiles_v2 (id, user_id, name, level, created_at, updated_at)
SELECT
  id,
  user_id,
  name,
  CASE level
    WHEN 'beginner' THEN 'level1'
    WHEN 'advanced' THEN 'level5'
    ELSE 'level3'
  END,
  created_at,
  updated_at
FROM profiles;

DROP TABLE profiles;
ALTER TABLE profiles_v2 RENAME TO profiles;
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
