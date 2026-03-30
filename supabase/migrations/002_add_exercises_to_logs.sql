-- Make workout_id nullable so logs can exist without a template (Quick Logs)
ALTER TABLE workout_logs ALTER COLUMN workout_id DROP NOT NULL;

-- Add exercises column to store the specific session's performance
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '[]'::jsonb;

-- Remove the unique constraint to allow logging the same workout multiple times a day
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_user_id_workout_id_date_key;
