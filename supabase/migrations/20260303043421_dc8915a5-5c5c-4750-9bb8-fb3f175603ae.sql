
-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by everyone"
ON public.badges FOR SELECT
USING (true);

-- Create challenges table
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'personal',
  goal_value numeric NOT NULL DEFAULT 1,
  goal_type text NOT NULL DEFAULT 'count',
  start_date date,
  end_date date,
  badge_id uuid REFERENCES public.badges(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone"
ON public.challenges FOR SELECT
USING (true);

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenges"
ON public.user_challenges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
ON public.user_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
ON public.user_challenges FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
ON public.user_challenges FOR DELETE
USING (auth.uid() = user_id);
