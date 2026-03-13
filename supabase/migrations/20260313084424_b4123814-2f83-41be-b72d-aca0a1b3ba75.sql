
-- Create announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  mountain_name text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  full_description text NOT NULL,
  category text NOT NULL DEFAULT 'app',
  alert_type text NOT NULL DEFAULT 'app_update',
  severity text NOT NULL DEFAULT 'info',
  source text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY "Announcements viewable by everyone"
  ON public.announcements FOR SELECT
  USING (is_active = true);

-- Only service role can manage (admin via backend functions)
-- No INSERT/UPDATE/DELETE policies for regular users

-- Add updated_at trigger
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
