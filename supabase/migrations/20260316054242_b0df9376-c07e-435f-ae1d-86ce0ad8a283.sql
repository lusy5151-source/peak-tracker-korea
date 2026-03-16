
-- 1. Message reads table for read receipts
CREATE TABLE public.message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.hiking_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reads" ON public.message_reads FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Reply support on club_messages
ALTER TABLE public.club_messages ADD COLUMN reply_to_id uuid REFERENCES public.club_messages(id) ON DELETE SET NULL;

-- 3. Message reactions table
CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.club_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view reactions" ON public.message_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Add record_id to summit_claims for linking to journals
ALTER TABLE public.summit_claims ADD COLUMN record_id uuid;

-- 5. Trigger: auto-create hiking_journal on summit claim
CREATE OR REPLACE FUNCTION public.on_summit_claim_create_journal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _summit_name text;
  _journal_id uuid;
BEGIN
  SELECT summit_name INTO _summit_name FROM public.summits WHERE id = NEW.summit_id;
  
  INSERT INTO public.hiking_journals (user_id, mountain_id, notes, photos, hiked_at, visibility)
  VALUES (
    NEW.user_id,
    NEW.mountain_id,
    COALESCE(_summit_name, '정상') || ' 정상 점령 성공! 🏔',
    ARRAY[NEW.photo_url],
    CURRENT_DATE,
    'public'
  )
  RETURNING id INTO _journal_id;

  UPDATE public.summit_claims SET record_id = _journal_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_summit_claim_create_journal
  AFTER INSERT ON public.summit_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.on_summit_claim_create_journal();

-- 6. Enable realtime for message_reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
