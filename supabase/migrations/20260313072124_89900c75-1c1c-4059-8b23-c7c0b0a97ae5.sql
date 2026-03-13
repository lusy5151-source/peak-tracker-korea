
CREATE TABLE public.group_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.hiking_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  invited_by UUID,
  type TEXT NOT NULL DEFAULT 'invite',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id, type, status)
);

ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view invitations relevant to them
CREATE POLICY "Users can view own invitations"
  ON public.group_invitations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = invited_by OR EXISTS (
    SELECT 1 FROM public.hiking_groups WHERE id = group_invitations.group_id AND creator_id = auth.uid()
  ));

-- Users can create join requests
CREATE POLICY "Users can request to join"
  ON public.group_invitations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (
    (type = 'request' AND auth.uid() = user_id) OR
    (type = 'invite' AND EXISTS (
      SELECT 1 FROM public.hiking_groups WHERE id = group_invitations.group_id AND creator_id = auth.uid()
    ))
  ));

-- Leaders can update (accept/reject), users can cancel own
CREATE POLICY "Leaders can manage invitations"
  ON public.group_invitations FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.hiking_groups WHERE id = group_invitations.group_id AND creator_id = auth.uid())
  );

-- Users can delete own, leaders can delete any for their group
CREATE POLICY "Users can delete own invitations"
  ON public.group_invitations FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.hiking_groups WHERE id = group_invitations.group_id AND creator_id = auth.uid())
  );

-- Add update trigger for group_members role management by leaders
CREATE POLICY "Leaders can update member roles"
  ON public.group_members FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.hiking_groups WHERE id = group_members.group_id AND creator_id = auth.uid())
  );

-- Leaders can remove members
CREATE POLICY "Leaders can remove members"
  ON public.group_members FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.hiking_groups WHERE id = group_members.group_id AND creator_id = auth.uid())
  );
