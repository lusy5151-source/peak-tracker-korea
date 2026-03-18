
ALTER TABLE public.trails 
ADD COLUMN IF NOT EXISTS starting_point_description text,
ADD COLUMN IF NOT EXISTS parking_info jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS public_transit jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS car_access jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tips jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS end_point text;
