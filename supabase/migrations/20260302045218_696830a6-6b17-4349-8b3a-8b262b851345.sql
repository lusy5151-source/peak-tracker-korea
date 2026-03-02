
CREATE TABLE public.trails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mountain_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  distance_km NUMERIC(5,2) NOT NULL,
  difficulty TEXT NOT NULL DEFAULT '보통',
  duration_minutes INTEGER NOT NULL,
  starting_point TEXT NOT NULL,
  elevation_gain_m INTEGER,
  description TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public read access
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trails are viewable by everyone"
  ON public.trails
  FOR SELECT
  USING (true);
