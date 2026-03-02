
-- Edit history table for collaborative plan editing
CREATE TABLE public.plan_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.hiking_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_edit_history ENABLE ROW LEVEL SECURITY;

-- Anyone who can view the plan can view its edit history
CREATE POLICY "Plan participants can view edit history"
  ON public.plan_edit_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hiking_plans hp
      WHERE hp.id = plan_edit_history.plan_id
      AND (
        hp.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.plan_participants pp
          WHERE pp.plan_id = hp.id AND pp.user_id = auth.uid()
        )
      )
    )
  );

-- Going participants and creator can insert edit history
CREATE POLICY "Going participants can add edit history"
  ON public.plan_edit_history
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.hiking_plans hp
      WHERE hp.id = plan_edit_history.plan_id
      AND (
        hp.creator_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.plan_participants pp
          WHERE pp.plan_id = hp.id AND pp.user_id = auth.uid() AND pp.rsvp_status = 'going'
        )
      )
    )
  );

-- Allow going participants to update hiking plans (not just creator)
CREATE POLICY "Going participants can update plans"
  ON public.hiking_plans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_participants pp
      WHERE pp.plan_id = hiking_plans.id AND pp.user_id = auth.uid() AND pp.rsvp_status = 'going'
    )
  );
