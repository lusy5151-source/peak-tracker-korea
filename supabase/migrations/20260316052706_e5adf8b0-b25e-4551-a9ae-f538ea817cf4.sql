
-- Trigger function to auto-insert summit claims into activity_feed
CREATE OR REPLACE FUNCTION public.on_summit_claim_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _summit_name text;
  _mountain_name text;
BEGIN
  -- Get summit name
  SELECT summit_name INTO _summit_name FROM public.summits WHERE id = NEW.summit_id;
  
  -- Build message
  _mountain_name := COALESCE(_summit_name, '정상');

  INSERT INTO public.activity_feed (user_id, type, mountain_id, message)
  VALUES (
    NEW.user_id,
    'summit_claim',
    NEW.mountain_id,
    _mountain_name || ' 정상을 정복했습니다! 🏔️'
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_summit_claim_to_feed ON public.summit_claims;
CREATE TRIGGER trg_summit_claim_to_feed
  AFTER INSERT ON public.summit_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.on_summit_claim_insert();
