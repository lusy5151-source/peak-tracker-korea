
-- Add invited_by column to plan_participants
ALTER TABLE plan_participants
ADD COLUMN IF NOT EXISTS invited_by uuid;
