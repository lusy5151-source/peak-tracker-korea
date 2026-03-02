
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view participants of their plans" ON plan_participants;
DROP POLICY IF EXISTS "Plan creators can invite participants" ON plan_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON plan_participants;
DROP POLICY IF EXISTS "Plan creators can remove participants" ON plan_participants;
DROP POLICY IF EXISTS "Users can view their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can insert their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON plan_participants;
DROP POLICY IF EXISTS "Users can delete their participation" ON plan_participants;

-- SELECT: own participation only
CREATE POLICY "Users can view their own participation"
ON plan_participants FOR SELECT
USING (user_id = auth.uid());

-- INSERT: own participation only
CREATE POLICY "Users can insert their participation"
ON plan_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: RSVP changes
CREATE POLICY "Users can update their participation"
ON plan_participants FOR UPDATE
USING (user_id = auth.uid());

-- DELETE: cancel participation
CREATE POLICY "Users can delete their participation"
ON plan_participants FOR DELETE
USING (user_id = auth.uid());
