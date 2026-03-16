
-- Create summits table
CREATE TABLE public.summits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mountain_id integer NOT NULL,
  summit_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  elevation integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.summits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Summits viewable by everyone" ON public.summits
  FOR SELECT USING (true);

-- Create summit_claims table
CREATE TABLE public.summit_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mountain_id integer NOT NULL,
  summit_id uuid NOT NULL REFERENCES public.summits(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.hiking_groups(id) ON DELETE SET NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  photo_url text NOT NULL,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.summit_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Summit claims viewable by everyone" ON public.summit_claims
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create claims" ON public.summit_claims
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own claims" ON public.summit_claims
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_summit_claims_summit_id ON public.summit_claims(summit_id);
CREATE INDEX idx_summit_claims_user_id ON public.summit_claims(user_id);
CREATE INDEX idx_summit_claims_mountain_id ON public.summit_claims(mountain_id);
CREATE INDEX idx_summit_claims_group_id ON public.summit_claims(group_id);
CREATE INDEX idx_summits_mountain_id ON public.summits(mountain_id);

-- Create storage bucket for summit photos
INSERT INTO storage.buckets (id, name, public) VALUES ('summit-photos', 'summit-photos', true);

-- Storage RLS for summit-photos
CREATE POLICY "Anyone can view summit photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'summit-photos');

CREATE POLICY "Authenticated users can upload summit photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'summit-photos');

CREATE POLICY "Users can delete own summit photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'summit-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for summit_claims
ALTER PUBLICATION supabase_realtime ADD TABLE public.summit_claims;
