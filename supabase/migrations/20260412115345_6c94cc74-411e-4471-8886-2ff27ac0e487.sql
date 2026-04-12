
-- Add mountain_ids array column
ALTER TABLE public.hiking_journals
ADD COLUMN mountain_ids integer[] DEFAULT '{}';

-- Backfill existing data
UPDATE public.hiking_journals
SET mountain_ids = ARRAY[mountain_id]
WHERE mountain_ids = '{}' OR mountain_ids IS NULL;
