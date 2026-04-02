
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user data from all tables
  DELETE FROM public.account_deletion_requests WHERE user_id = _uid;
  DELETE FROM public.activity_feed WHERE user_id = _uid;
  DELETE FROM public.club_messages WHERE user_id = _uid;
  DELETE FROM public.friendships WHERE requester_id = _uid OR addressee_id = _uid;
  DELETE FROM public.group_invitations WHERE user_id = _uid OR invited_by = _uid;
  DELETE FROM public.group_members WHERE user_id = _uid;
  DELETE FROM public.hiking_journals WHERE user_id = _uid;
  DELETE FROM public.journal_comments WHERE user_id = _uid;
  DELETE FROM public.journal_likes WHERE user_id = _uid;
  DELETE FROM public.magazine_likes WHERE user_id = _uid;
  DELETE FROM public.magazine_saves WHERE user_id = _uid;
  DELETE FROM public.message_reactions WHERE user_id = _uid;
  DELETE FROM public.message_reads WHERE user_id = _uid;
  DELETE FROM public.plan_edit_history WHERE user_id = _uid;
  DELETE FROM public.plan_notifications WHERE user_id = _uid;
  DELETE FROM public.plan_participants WHERE user_id = _uid;
  DELETE FROM public.privacy_settings WHERE user_id = _uid;
  DELETE FROM public.profiles WHERE user_id = _uid;
  DELETE FROM public.reports WHERE reporter_id = _uid;
  DELETE FROM public.shared_completion_participants WHERE user_id = _uid;
  DELETE FROM public.summit_claims WHERE user_id = _uid;
  DELETE FROM public.user_achievements WHERE user_id = _uid;
  DELETE FROM public.user_blocks WHERE blocker_id = _uid OR blocked_id = _uid;
  DELETE FROM public.user_challenges WHERE user_id = _uid;
  DELETE FROM public.user_roles WHERE user_id = _uid;

  -- Delete groups created by user (cascade will handle members)
  DELETE FROM public.hiking_groups WHERE creator_id = _uid;
  -- Delete plans created by user
  DELETE FROM public.hiking_plans WHERE creator_id = _uid;
  -- Delete shared completions created by user
  DELETE FROM public.shared_completions WHERE created_by = _uid;
  -- Delete magazine posts created by user
  DELETE FROM public.magazine_posts WHERE created_by = _uid;

  -- Finally delete the auth user
  DELETE FROM auth.users WHERE id = _uid;
END;
$$;
