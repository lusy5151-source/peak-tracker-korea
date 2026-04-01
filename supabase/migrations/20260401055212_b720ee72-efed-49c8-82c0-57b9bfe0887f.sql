
-- Reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'comment', 'journal'
  target_id UUID NOT NULL,
  reason TEXT NOT NULL, -- 'spam', 'inappropriate', 'harassment', 'other'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- User blocks table
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others" ON public.user_blocks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id AND blocker_id != blocked_id);

CREATE POLICY "Users can view own blocks" ON public.user_blocks
  FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON public.user_blocks
  FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- Account deletion requests table
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can request own deletion" ON public.account_deletion_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own deletion request" ON public.account_deletion_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can cancel own deletion" ON public.account_deletion_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Helper function to check if a user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_blocks
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  )
$$;
