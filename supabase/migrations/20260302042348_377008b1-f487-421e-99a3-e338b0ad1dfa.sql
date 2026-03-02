
-- Hiking Plans table
CREATE TABLE public.hiking_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  mountain_id INTEGER NOT NULL,
  trail_name TEXT,
  planned_date DATE NOT NULL,
  start_time TIME,
  notes TEXT,
  invite_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plan Participants table
CREATE TABLE public.plan_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.hiking_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(plan_id, user_id)
);

-- Plan Notifications table
CREATE TABLE public.plan_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.hiking_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hiking_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_notifications ENABLE ROW LEVEL SECURITY;

-- RLS for hiking_plans
CREATE POLICY "Users can view plans they created or participate in" ON public.hiking_plans
  FOR SELECT USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM public.plan_participants WHERE plan_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create plans" ON public.hiking_plans
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their plans" ON public.hiking_plans
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their plans" ON public.hiking_plans
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS for plan_participants
CREATE POLICY "Users can view participants of their plans" ON public.plan_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.hiking_plans WHERE id = plan_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.plan_participants pp WHERE pp.plan_id = plan_id AND pp.user_id = auth.uid())))
  );

CREATE POLICY "Plan creators can invite participants" ON public.plan_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.hiking_plans WHERE id = plan_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can update their own participation" ON public.plan_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Plan creators can remove participants" ON public.plan_participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.hiking_plans WHERE id = plan_id AND creator_id = auth.uid())
    OR auth.uid() = user_id
  );

-- RLS for plan_notifications
CREATE POLICY "Users can view their own notifications" ON public.plan_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON public.plan_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications" ON public.plan_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_hiking_plans_updated_at
  BEFORE UPDATE ON public.hiking_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
