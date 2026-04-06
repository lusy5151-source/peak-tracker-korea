
-- Create mountain_duplicate_reports table
CREATE TABLE public.mountain_duplicate_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_mountain_id integer NOT NULL,
  existing_mountain_id integer NOT NULL,
  reported_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (reported_mountain_id, reported_by)
);

ALTER TABLE public.mountain_duplicate_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create duplicate reports"
  ON public.mountain_duplicate_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
  ON public.mountain_duplicate_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by OR has_role(auth.uid(), 'admin'::app_role));

-- Add reject_reason to user_mountains
ALTER TABLE public.user_mountains ADD COLUMN IF NOT EXISTS reject_reason text;

-- Function to auto-set status to pending when 3+ reports
CREATE OR REPLACE FUNCTION public.check_duplicate_report_threshold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count integer;
  _mountain_id integer;
BEGIN
  _mountain_id := NEW.reported_mountain_id;
  
  SELECT COUNT(*) INTO _count
  FROM public.mountain_duplicate_reports
  WHERE reported_mountain_id = _mountain_id;
  
  IF _count >= 3 THEN
    UPDATE public.user_mountains
    SET status = 'pending'
    WHERE mountain_id = _mountain_id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_duplicate_report_insert
  AFTER INSERT ON public.mountain_duplicate_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.check_duplicate_report_threshold();

-- Update user_mountains SELECT policy to also show pending mountains to their creator
DROP POLICY IF EXISTS "Active user mountains viewable by everyone" ON public.user_mountains;

CREATE POLICY "User mountains viewable"
  ON public.user_mountains FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));
