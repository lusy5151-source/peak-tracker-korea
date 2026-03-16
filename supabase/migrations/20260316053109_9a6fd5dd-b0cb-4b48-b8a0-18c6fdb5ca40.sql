
-- Create club_messages table for club chat
CREATE TABLE public.club_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.hiking_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

-- Members can view messages in their clubs
CREATE POLICY "Members can view club messages" ON public.club_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = club_messages.club_id AND gm.user_id = auth.uid()
  ));

-- Members can send messages
CREATE POLICY "Members can send club messages" ON public.club_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = club_messages.club_id AND gm.user_id = auth.uid()
    )
  );

-- Users can delete own messages
CREATE POLICY "Users can delete own club messages" ON public.club_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime for club_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_messages;

-- Create storage bucket for club logos
INSERT INTO storage.buckets (id, name, public) VALUES ('club-logos', 'club-logos', true);

-- Storage policies for club logos
CREATE POLICY "Anyone can view club logos" ON storage.objects FOR SELECT USING (bucket_id = 'club-logos');
CREATE POLICY "Authenticated users can upload club logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'club-logos');
CREATE POLICY "Users can update own club logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'club-logos');
CREATE POLICY "Users can delete own club logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'club-logos');

-- Trigger: notify club leader when join request comes in
CREATE OR REPLACE FUNCTION public.on_join_request_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _leader_id uuid;
  _group_name text;
  _requester_name text;
BEGIN
  IF NEW.type = 'request' AND NEW.status = 'pending' THEN
    SELECT creator_id, name INTO _leader_id, _group_name FROM public.hiking_groups WHERE id = NEW.group_id;
    SELECT nickname INTO _requester_name FROM public.profiles WHERE user_id = NEW.user_id;
    
    INSERT INTO public.activity_feed (user_id, type, message)
    VALUES (
      _leader_id,
      'club_join_request',
      COALESCE(_requester_name, '누군가') || '님이 ' || COALESCE(_group_name, '산악회') || ' 가입을 요청했습니다 📩'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_join_request_created ON public.group_invitations;
CREATE TRIGGER trg_join_request_created
  AFTER INSERT ON public.group_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.on_join_request_created();
