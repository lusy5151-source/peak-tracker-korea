import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HikingGroup {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  avatar_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
}

export function useHikingGroups() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<HikingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGroups = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);
    if (!memberships || memberships.length === 0) {
      setMyGroups([]);
      setLoading(false);
      return;
    }
    const groupIds = (memberships as any[]).map((m) => m.group_id);
    const { data: groups } = await supabase
      .from("hiking_groups")
      .select("*")
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    // Get member counts
    const { data: allMembers } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds);
    const countMap = new Map<string, number>();
    (allMembers || []).forEach((m: any) => {
      countMap.set(m.group_id, (countMap.get(m.group_id) || 0) + 1);
    });

    setMyGroups(
      ((groups as any[]) || []).map((g) => ({ ...g, member_count: countMap.get(g.id) || 0 }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMyGroups(); }, [fetchMyGroups]);

  const fetchPublicGroups = async (): Promise<HikingGroup[]> => {
    const { data } = await supabase
      .from("hiking_groups")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as any[]) || [];
  };

  const createGroup = async (params: { name: string; description?: string; is_public?: boolean }) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { data, error } = await supabase
      .from("hiking_groups")
      .insert({ ...params, creator_id: user.id } as any)
      .select()
      .single();
    if (!error && data) {
      // Auto-join as admin
      await supabase.from("group_members").insert({
        group_id: (data as any).id,
        user_id: user.id,
        role: "admin",
      } as any);
      fetchMyGroups();
    }
    return { data: data as HikingGroup | null, error };
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: user.id, role: "member" } as any);
    if (!error) fetchMyGroups();
    return { error };
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id);
    if (!error) fetchMyGroups();
    return { error };
  };

  const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    const { data: members } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId);
    if (!members || members.length === 0) return [];
    const userIds = (members as any[]).map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    return (members as any[]).map((m) => ({ ...m, profile: profileMap.get(m.user_id) || null }));
  };

  return {
    myGroups,
    loading,
    fetchMyGroups,
    fetchPublicGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    fetchGroupMembers,
  };
}
