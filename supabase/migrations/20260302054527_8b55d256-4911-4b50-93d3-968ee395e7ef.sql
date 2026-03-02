
-- Add status column
ALTER TABLE plan_participants
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can view their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can insert participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can insert their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can update participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can delete participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can delete their participation" ON plan_participants;

-- SELECT: invited user & plan creator can view
CREATE POLICY "View participation"
ON plan_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM hiking_plans
    WHERE hiking_plans.id = plan_participants.plan_id
    AND hiking_plans.creator_id = auth.uid()
  )
);

-- INSERT: any authenticated user
CREATE POLICY "Insert participation"
ON plan_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: invited user can accept/decline
CREATE POLICY "Update own participation"
ON plan_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: user can cancel
CREATE POLICY "Delete own participation"
ON plan_participants
FOR DELETE
USING (user_id = auth.uid());
