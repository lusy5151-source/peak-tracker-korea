ALTER TABLE public.trails ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'summit';
COMMENT ON COLUMN public.trails.course_type IS 'Type: loop, summit, ridge, out-and-back';