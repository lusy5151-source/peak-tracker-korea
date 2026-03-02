import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HikingJournal {
  id: string;
  user_id: string;
  mountain_id: number;
  course_name: string | null;
  course_starting_point: string | null;
  course_notes: string | null;
  duration: string | null;
  difficulty: string | null;
  weather: string | null;
  notes: string | null;
  photos: string[];
  tagged_friends: string[];
  visibility: "public" | "friends" | "private";
  hiked_at: string;
  created_at: string;
  updated_at: string;
  // Joined data
  profile?: { nickname: string | null; avatar_url: string | null };
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
}

export interface JournalComment {
  id: string;
  journal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
}

export function useHikingJournals() {
  const { user } = useAuth();

  const fetchMyJournals = useCallback(async (): Promise<HikingJournal[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from("hiking_journals")
      .select("*")
      .eq("user_id", user.id)
      .order("hiked_at", { ascending: false });
    return (data as any[] || []) as HikingJournal[];
  }, [user]);

  const fetchUserJournals = useCallback(async (userId: string): Promise<HikingJournal[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from("hiking_journals")
      .select("*")
      .eq("user_id", userId)
      .order("hiked_at", { ascending: false });
    return (data as any[] || []) as HikingJournal[];
  }, [user]);

  const fetchFeed = useCallback(async (): Promise<HikingJournal[]> => {
    if (!user) return [];
    // Fetch public + friends-only journals (RLS handles visibility)
    const { data: journals } = await supabase
      .from("hiking_journals")
      .select("*")
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!journals || journals.length === 0) return [];

    // Get profiles
    const userIds = [...new Set((journals as any[]).map((j) => j.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    // Get like counts
    const journalIds = (journals as any[]).map((j) => j.id);
    const { data: likes } = await supabase
      .from("journal_likes")
      .select("journal_id, user_id")
      .in("journal_id", journalIds);

    const likeCounts = new Map<string, number>();
    const userLikes = new Set<string>();
    (likes || []).forEach((l: any) => {
      likeCounts.set(l.journal_id, (likeCounts.get(l.journal_id) || 0) + 1);
      if (l.user_id === user.id) userLikes.add(l.journal_id);
    });

    // Get comment counts
    const { data: comments } = await supabase
      .from("journal_comments")
      .select("journal_id")
      .in("journal_id", journalIds);

    const commentCounts = new Map<string, number>();
    (comments || []).forEach((c: any) => {
      commentCounts.set(c.journal_id, (commentCounts.get(c.journal_id) || 0) + 1);
    });

    return (journals as any[]).map((j) => ({
      ...j,
      profile: profileMap.get(j.user_id) || null,
      like_count: likeCounts.get(j.id) || 0,
      comment_count: commentCounts.get(j.id) || 0,
      is_liked: userLikes.has(j.id),
    })) as HikingJournal[];
  }, [user]);

  const createJournal = async (journal: {
    mountain_id: number;
    course_name?: string;
    course_starting_point?: string;
    course_notes?: string;
    duration?: string;
    difficulty?: string;
    weather?: string;
    notes?: string;
    photos?: string[];
    tagged_friends?: string[];
    visibility?: string;
    hiked_at?: string;
  }) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { data, error } = await supabase
      .from("hiking_journals")
      .insert({ ...journal, user_id: user.id } as any)
      .select()
      .single();

    // Notify tagged friends
    if (!error && journal.tagged_friends && journal.tagged_friends.length > 0) {
      const notifications = journal.tagged_friends.map((fId) => ({
        user_id: fId,
        plan_id: "00000000-0000-0000-0000-000000000000",
        type: "tag",
        message: "등산 일지에 함께한 친구로 태그되었습니다 🏔️",
      }));
      await supabase.from("plan_notifications").insert(notifications as any);
    }

    return { data: data as HikingJournal | null, error };
  };

  const updateJournal = async (id: string, updates: Partial<HikingJournal>) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("hiking_journals")
      .update(updates as any)
      .eq("id", id);
    return { error };
  };

  const deleteJournal = async (id: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("hiking_journals")
      .delete()
      .eq("id", id);
    return { error };
  };

  const toggleLike = async (journalId: string, isLiked: boolean) => {
    if (!user) return;
    if (isLiked) {
      await supabase
        .from("journal_likes")
        .delete()
        .eq("journal_id", journalId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("journal_likes")
        .insert({ journal_id: journalId, user_id: user.id } as any);
    }
  };

  const fetchComments = async (journalId: string): Promise<JournalComment[]> => {
    const { data: comments } = await supabase
      .from("journal_comments")
      .select("*")
      .eq("journal_id", journalId)
      .order("created_at", { ascending: true });

    if (!comments || comments.length === 0) return [];

    const userIds = [...new Set((comments as any[]).map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    return (comments as any[]).map((c) => ({
      ...c,
      profile: profileMap.get(c.user_id) || null,
    }));
  };

  const addComment = async (journalId: string, content: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { data, error } = await supabase
      .from("journal_comments")
      .insert({ journal_id: journalId, user_id: user.id, content } as any)
      .select()
      .single();
    return { data, error };
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    await supabase.from("journal_comments").delete().eq("id", commentId);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("journal-photos")
      .upload(path, file, { upsert: true });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage
      .from("journal-photos")
      .getPublicUrl(path);
    return publicUrl;
  };

  return {
    fetchMyJournals,
    fetchUserJournals,
    fetchFeed,
    createJournal,
    updateJournal,
    deleteJournal,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
    uploadPhoto,
  };
}
