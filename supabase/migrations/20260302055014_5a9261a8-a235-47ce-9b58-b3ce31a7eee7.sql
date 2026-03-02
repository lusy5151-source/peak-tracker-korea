
-- Fix the infinite recursion in hiking_plans SELECT policy
-- The bug: plan_participants.plan_id = plan_participants.id (self-reference)
-- Should be: plan_participants.plan_id = hiking_plans.id

-- Create a security definer function to check participation
CREATE OR REPLACE FUNCTION public.is_plan_participant(_user_id uuid, _plan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.plan_participants
    WHERE plan_id = _plan_id AND user_id = _user_id
  );
$$;

-- Drop the broken policy
DROP POLICY IF EXISTS "Users can view plans they created or participate in" ON hiking_plans;

-- Recreate with security definer function to avoid recursion
CREATE POLICY "Users can view plans they created or participate in"
ON hiking_plans
FOR SELECT
USING (
  auth.uid() = creator_id
  OR public.is_plan_participant(auth.uid(), id)
);
