
-- Add max_participants to hiking_plans
ALTER TABLE public.hiking_plans ADD COLUMN IF NOT EXISTS max_participants integer DEFAULT 10;

-- Create plan_applications table
CREATE TABLE public.plan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.hiking_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(plan_id, user_id)
);

ALTER TABLE public.plan_applications ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view applications for plans they created or their own applications
CREATE POLICY "Users can view own applications" ON public.plan_applications
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.hiking_plans WHERE id = plan_applications.plan_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can apply to plans" ON public.plan_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update applications" ON public.plan_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.hiking_plans WHERE id = plan_applications.plan_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can delete own applications" ON public.plan_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Create plan_messages table
CREATE TABLE public.plan_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.hiking_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_messages ENABLE ROW LEVEL SECURITY;

-- Create a security definer function for plan chat access
CREATE OR REPLACE FUNCTION public.can_access_plan_chat(_user_id uuid, _plan_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.hiking_plans WHERE id = _plan_id AND creator_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.plan_applications WHERE plan_id = _plan_id AND user_id = _user_id AND status = 'accepted'
  ) OR EXISTS (
    SELECT 1 FROM public.plan_participants WHERE plan_id = _plan_id AND user_id = _user_id AND rsvp_status = 'going'
  )
$$;

CREATE POLICY "Chat participants can view messages" ON public.plan_messages
  FOR SELECT USING (public.can_access_plan_chat(auth.uid(), plan_id));

CREATE POLICY "Chat participants can send messages" ON public.plan_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_access_plan_chat(auth.uid(), plan_id));

-- Make public plans viewable by all authenticated users
CREATE POLICY "Public plans viewable by all" ON public.hiking_plans
  FOR SELECT USING (is_public = true AND auth.uid() IS NOT NULL);

-- Enable realtime for plan_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_messages;
