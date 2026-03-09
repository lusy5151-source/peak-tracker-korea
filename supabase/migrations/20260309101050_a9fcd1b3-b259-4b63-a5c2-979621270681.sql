
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general';
