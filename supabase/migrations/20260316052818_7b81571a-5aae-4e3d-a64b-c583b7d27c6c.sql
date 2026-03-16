
-- Trigger function to notify user when their club join request is accepted
CREATE OR REPLACE FUNCTION public.on_join_request_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_name text;
BEGIN
  -- Only fire when status changes to 'accepted' and type is 'request'
  IF NEW.status = 'accepted' AND OLD.status = 'pending' AND NEW.type = 'request' THEN
    SELECT name INTO _group_name FROM public.hiking_groups WHERE id = NEW.group_id;
    
    -- Insert a plan_notification (reusing notification table for general notifications)
    -- We'll use a dummy plan_id since plan_notifications requires it
    -- Better approach: insert into activity_feed as a notification
    INSERT INTO public.activity_feed (user_id, type, message)
    VALUES (
      NEW.user_id,
      'club_join_accepted',
      COALESCE(_group_name, '산악회') || ' 가입이 승인되었습니다! 🎉'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_join_request_accepted ON public.group_invitations;
CREATE TRIGGER trg_join_request_accepted
  AFTER UPDATE ON public.group_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.on_join_request_accepted();
