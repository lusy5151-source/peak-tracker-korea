ALTER TABLE public.trails
  ADD COLUMN IF NOT EXISTS mountain_name text,
  ADD COLUMN IF NOT EXISTS trail_distance_m integer,
  ADD COLUMN IF NOT EXISTS up_minutes integer,
  ADD COLUMN IF NOT EXISTS down_minutes integer,
  ADD COLUMN IF NOT EXISTS geometry jsonb;