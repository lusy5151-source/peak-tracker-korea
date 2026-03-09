
-- Hiking groups / clubs
CREATE TABLE public.hiking_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hiking_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups viewable by everyone" ON public.hiking_groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON public.hiking_groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update groups" ON public.hiking_groups FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete groups" ON public.hiking_groups FOR DELETE USING (auth.uid() = creator_id);

-- Group members
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.hiking_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Shared completions
CREATE TABLE public.shared_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.hiking_plans(id) ON DELETE SET NULL,
  mountain_id INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  group_id UUID REFERENCES public.hiking_groups(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared completions viewable by authenticated" ON public.shared_completions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create shared completions" ON public.shared_completions FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Shared completion participants
CREATE TABLE public.shared_completion_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shared_completion_id UUID NOT NULL REFERENCES public.shared_completions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  UNIQUE(shared_completion_id, user_id)
);

ALTER TABLE public.shared_completion_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by authenticated" ON public.shared_completion_participants FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can add themselves" ON public.shared_completion_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can verify themselves" ON public.shared_completion_participants FOR UPDATE USING (auth.uid() = user_id);

-- Add group_id, is_public, meeting_location to hiking_plans
ALTER TABLE public.hiking_plans ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.hiking_groups(id) ON DELETE SET NULL;
ALTER TABLE public.hiking_plans ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.hiking_plans ADD COLUMN IF NOT EXISTS meeting_location TEXT;

-- Activity feed table
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  mountain_id INTEGER,
  plan_id UUID REFERENCES public.hiking_plans(id) ON DELETE SET NULL,
  shared_completion_id UUID REFERENCES public.shared_completions(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  participant_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feed viewable by authenticated" ON public.activity_feed FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can create feed items" ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;
