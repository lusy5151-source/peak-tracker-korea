import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type Friendship = Tables<"friendships">;
type Profile = Tables<"profiles">;

interface FriendWithProfile extends Friendship {
  friendProfile: Profile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendWithProfile[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!user) return;

    const { data: friendships } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!friendships) return;

    // Get all unique user IDs that aren't the current user
    const userIds = [
      ...new Set(
        friendships.map((f) =>
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        )
      ),
    ];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const withProfiles = friendships
      .map((f) => {
        const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        const friendProfile = profileMap.get(friendId);
        return friendProfile ? { ...f, friendProfile } : null;
      })
      .filter(Boolean) as FriendWithProfile[];

    setFriends(withProfiles.filter((f) => f.status === "accepted"));
    setPendingReceived(
      withProfiles.filter((f) => f.status === "pending" && f.addressee_id === user.id)
    );
    setPendingSent(
      withProfiles.filter((f) => f.status === "pending" && f.requester_id === user.id)
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  const sendRequest = async (addresseeId: string) => {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: addresseeId,
    });
    if (!error) fetchFriendships();
    return { error };
  };

  const acceptRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    if (!error) fetchFriendships();
    return { error };
  };

  const declineRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    if (!error) fetchFriendships();
    return { error };
  };

  const removeFriend = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    if (!error) fetchFriendships();
    return { error };
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return [];
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", user.id)
      .ilike("nickname", `%${query}%`)
      .limit(10);
    return data || [];
  };

  return {
    friends,
    pendingReceived,
    pendingSent,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    searchUsers,
    refetch: fetchFriendships,
  };
}
