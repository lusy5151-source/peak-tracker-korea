
-- Hiking journal entries (DB-backed social posts)
CREATE TABLE public.hiking_journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mountain_id INTEGER NOT NULL,
  course_name TEXT,
  course_starting_point TEXT,
  course_notes TEXT,
  duration TEXT,
  difficulty TEXT,
  weather TEXT,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  tagged_friends TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public',
  hiked_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hiking_journals ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can manage own journals"
  ON public.hiking_journals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public journals visible to all authenticated users
CREATE POLICY "Public journals visible to authenticated"
  ON public.hiking_journals FOR SELECT
  USING (
    visibility = 'public' AND auth.uid() IS NOT NULL
  );

-- Friends-only journals visible to friends
CREATE POLICY "Friends-only journals visible to friends"
  ON public.hiking_journals FOR SELECT
  USING (
    visibility = 'friends'
    AND EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND addressee_id = hiking_journals.user_id)
        OR (addressee_id = auth.uid() AND requester_id = hiking_journals.user_id)
      )
    )
  );

-- Journal likes
CREATE TABLE public.journal_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES public.hiking_journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(journal_id, user_id)
);

ALTER TABLE public.journal_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like visible journals"
  ON public.journal_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.journal_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
  ON public.journal_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Journal comments
CREATE TABLE public.journal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES public.hiking_journals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add comments"
  ON public.journal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.journal_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments"
  ON public.journal_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Storage bucket for journal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-photos', 'journal-photos', true);

-- Storage policies for journal photos
CREATE POLICY "Users can upload journal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'journal-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view journal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'journal-photos');

CREATE POLICY "Users can delete own journal photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'journal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
