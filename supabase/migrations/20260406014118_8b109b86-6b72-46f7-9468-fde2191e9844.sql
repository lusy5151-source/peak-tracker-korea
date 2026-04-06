
-- Create user_mountains table for user-registered mountains
CREATE TABLE public.user_mountains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mountain_id serial NOT NULL UNIQUE,
  name_ko text NOT NULL,
  name text,
  height integer NOT NULL,
  region text NOT NULL,
  difficulty text NOT NULL DEFAULT '보통',
  description text,
  lat double precision,
  lng double precision,
  image_url text,
  is_user_created boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Offset mountain_id to start at 10001 to avoid conflicts with static mountains (max 140)
ALTER SEQUENCE public.user_mountains_mountain_id_seq RESTART WITH 10001;

-- Enable RLS
ALTER TABLE public.user_mountains ENABLE ROW LEVEL SECURITY;

-- Everyone can view active user mountains
CREATE POLICY "Active user mountains viewable by everyone"
  ON public.user_mountains FOR SELECT
  USING (status = 'active');

-- Authenticated users can create mountains
CREATE POLICY "Authenticated users can create mountains"
  ON public.user_mountains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Creators can update their own mountains
CREATE POLICY "Creators can update own mountains"
  ON public.user_mountains FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Creators can delete their own mountains
CREATE POLICY "Creators can delete own mountains"
  ON public.user_mountains FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create mountain-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('mountain-images', 'mountain-images', true);

-- Storage policies for mountain-images bucket
CREATE POLICY "Anyone can view mountain images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mountain-images');

CREATE POLICY "Authenticated users can upload mountain images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'mountain-images');

CREATE POLICY "Users can delete own mountain images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'mountain-images' AND (storage.foldername(name))[1] = auth.uid()::text);
