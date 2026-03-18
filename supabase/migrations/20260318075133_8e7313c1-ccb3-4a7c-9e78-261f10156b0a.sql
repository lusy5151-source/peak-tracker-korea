
-- Magazine posts table
CREATE TABLE public.magazine_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '등산 코스',
  cover_image_url text,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.magazine_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Magazine posts viewable by everyone" ON public.magazine_posts
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert magazine posts" ON public.magazine_posts
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update magazine posts" ON public.magazine_posts
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete magazine posts" ON public.magazine_posts
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Magazine slides table
CREATE TABLE public.magazine_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.magazine_posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  slide_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.magazine_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Magazine slides viewable by everyone" ON public.magazine_slides
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert magazine slides" ON public.magazine_slides
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update magazine slides" ON public.magazine_slides
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete magazine slides" ON public.magazine_slides
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Magazine likes table
CREATE TABLE public.magazine_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.magazine_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.magazine_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone" ON public.magazine_likes
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can like posts" ON public.magazine_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.magazine_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Magazine saves table
CREATE TABLE public.magazine_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.magazine_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.magazine_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves" ON public.magazine_saves
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON public.magazine_saves
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON public.magazine_saves
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for magazine images
INSERT INTO storage.buckets (id, name, public) VALUES ('magazine-images', 'magazine-images', true);

CREATE POLICY "Anyone can view magazine images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'magazine-images');

CREATE POLICY "Admins can upload magazine images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'magazine-images');

CREATE POLICY "Admins can delete magazine images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'magazine-images');
