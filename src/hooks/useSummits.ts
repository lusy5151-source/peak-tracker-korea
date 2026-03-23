import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Summit {
  id: string;
  mountain_id: number;
  summit_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

export interface SummitClaim {
  id: string;
  user_id: string;
  mountain_id: number;
  summit_id: string;
  group_id: string | null;
  latitude: number;
  longitude: number;
  photo_url: string;
  claimed_at: string;
  profile?: { nickname: string | null; avatar_url: string | null };
}

export interface MountainLeader {
  user_id: string;
  claim_count: number;
  nickname: string | null;
  avatar_url: string | null;
}

export interface ClubRanking {
  group_id: string;
  group_name: string;
  claim_count: number;
}

// Calculate distance between two GPS points in meters (Haversine formula)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useSummits(mountainId?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summits, setSummits] = useState<Summit[]>([]);
  const [claims, setClaims] = useState<SummitClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummits = useCallback(async () => {
    if (!mountainId) return;
    const { data } = await supabase
      .from("summits")
      .select("*")
      .eq("mountain_id", mountainId);
    setSummits((data as any[]) || []);
  }, [mountainId]);

  const fetchClaims = useCallback(async () => {
    if (!mountainId) return;
    const { data: claimsData } = await supabase
      .from("summit_claims")
      .select("*")
      .eq("mountain_id", mountainId)
      .order("claimed_at", { ascending: false });

    if (!claimsData || (claimsData as any[]).length === 0) {
      setClaims([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set((claimsData as any[]).map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setClaims(
      (claimsData as any[]).map((c) => ({
        ...c,
        profile: profileMap.get(c.user_id) || null,
      }))
    );
    setLoading(false);
  }, [mountainId]);

  useEffect(() => {
    if (mountainId) {
      Promise.all([fetchSummits(), fetchClaims()]).then(() => setLoading(false));
    }
  }, [fetchSummits, fetchClaims, mountainId]);

  // Get current owner of a summit (most recent claim)
  const getSummitOwner = (summitId: string): SummitClaim | null => {
    return claims.find((c) => c.summit_id === summitId) || null;
  };

  // Get mountain leader (user with most claims on this mountain)
  const getMountainLeader = (): MountainLeader | null => {
    if (claims.length === 0) return null;
    const countMap = new Map<string, { count: number; earliest: string }>();
    claims.forEach((c) => {
      const existing = countMap.get(c.user_id);
      if (!existing) {
        countMap.set(c.user_id, { count: 1, earliest: c.claimed_at });
      } else {
        existing.count++;
        if (c.claimed_at < existing.earliest) existing.earliest = c.claimed_at;
      }
    });

    let leader: { userId: string; count: number; earliest: string } | null = null;
    countMap.forEach((val, userId) => {
      if (!leader || val.count > leader.count || (val.count === leader.count && val.earliest < leader.earliest)) {
        leader = { userId, count: val.count, earliest: val.earliest };
      }
    });

    if (!leader) return null;
    const claim = claims.find((c) => c.user_id === (leader as any).userId);
    return {
      user_id: (leader as any).userId,
      claim_count: (leader as any).count,
      nickname: claim?.profile?.nickname || null,
      avatar_url: claim?.profile?.avatar_url || null,
    };
  };

  // Get club owner (club with most claims on this mountain)
  const getClubOwner = (): ClubRanking | null => {
    const clubClaims = claims.filter((c) => c.group_id);
    if (clubClaims.length === 0) return null;

    const countMap = new Map<string, number>();
    clubClaims.forEach((c) => {
      countMap.set(c.group_id!, (countMap.get(c.group_id!) || 0) + 1);
    });

    let topGroupId = "";
    let topCount = 0;
    countMap.forEach((count, groupId) => {
      if (count > topCount) {
        topGroupId = groupId;
        topCount = count;
      }
    });

    return topGroupId ? { group_id: topGroupId, group_name: "", claim_count: topCount } : null;
  };

  // Claim a summit
  const claimSummit = async (
    summitId: string,
    userLat: number,
    userLng: number,
    photoFile: File,
    groupId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "로그인이 필요합니다" };

    const summit = summits.find((s) => s.id === summitId);
    if (!summit) return { success: false, error: "정상을 찾을 수 없습니다" };

    // GPS verification (soft check - warn but allow if > 50m, skip if coordinates match summit exactly)
    const isFallbackCoords = userLat === summit.latitude && userLng === summit.longitude;
    if (!isFallbackCoords) {
      const distance = getDistanceMeters(userLat, userLng, summit.latitude, summit.longitude);
      if (distance > 500) {
        return { success: false, error: `정상에서 ${Math.round(distance)}m 떨어져 있습니다. GPS 인증이 어려운 경우 GPS 없이 인증해주세요.` };
      }
    }

    // Cooldown check (12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { data: recentClaims } = await supabase
      .from("summit_claims")
      .select("id")
      .eq("user_id", user.id)
      .eq("summit_id", summitId)
      .gte("claimed_at", twelveHoursAgo);

    if (recentClaims && (recentClaims as any[]).length > 0) {
      return { success: false, error: "같은 정상은 12시간 후에 다시 인증할 수 있습니다" };
    }

    // Upload photo
    const fileExt = photoFile.name.split(".").pop();
    const filePath = `${user.id}/${summitId}_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("summit-photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      return { success: false, error: "사진 업로드에 실패했습니다" };
    }

    const { data: urlData } = supabase.storage.from("summit-photos").getPublicUrl(filePath);
    const photoUrl = urlData.publicUrl;

    // Insert claim
    const { error: insertError } = await supabase
      .from("summit_claims")
      .insert({
        user_id: user.id,
        mountain_id: summit.mountain_id,
        summit_id: summitId,
        group_id: groupId || null,
        latitude: userLat,
        longitude: userLng,
        photo_url: photoUrl,
      } as any);

    if (insertError) {
      return { success: false, error: "인증 등록에 실패했습니다" };
    }

    toast({
      title: "🎉 정상 정복 인증 완료!",
      description: "등산 기록이 피드에 자동으로 게시되었습니다.",
    });
    await fetchClaims();
    return { success: true };
  };

  return {
    summits,
    claims,
    loading,
    getSummitOwner,
    getMountainLeader,
    getClubOwner,
    claimSummit,
    fetchClaims,
  };
}

// Hook for global leaderboard data
export function useLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [topClaimers, setTopClaimers] = useState<{ user_id: string; count: number; nickname: string | null; avatar_url: string | null }[]>([]);
  const [mountainLeaders, setMountainLeaders] = useState<{ mountain_id: number; user_id: string; count: number; nickname: string | null; avatar_url: string | null }[]>([]);
  const [clubRankings, setClubRankings] = useState<{ group_id: string; group_name: string; count: number }[]>([]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);

    // Fetch all claims
    const { data: allClaims } = await supabase
      .from("summit_claims")
      .select("user_id, mountain_id, group_id, claimed_at")
      .order("claimed_at", { ascending: true });

    if (!allClaims || (allClaims as any[]).length === 0) {
      setLoading(false);
      return;
    }

    const claimsArr = allClaims as any[];

    // Top claimers
    const userCounts = new Map<string, number>();
    claimsArr.forEach((c) => {
      userCounts.set(c.user_id, (userCounts.get(c.user_id) || 0) + 1);
    });
    const topUsers = [...userCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    // Mountain leaders
    const mtMap = new Map<number, Map<string, { count: number; earliest: string }>>();
    claimsArr.forEach((c) => {
      if (!mtMap.has(c.mountain_id)) mtMap.set(c.mountain_id, new Map());
      const userMap = mtMap.get(c.mountain_id)!;
      const existing = userMap.get(c.user_id);
      if (!existing) {
        userMap.set(c.user_id, { count: 1, earliest: c.claimed_at });
      } else {
        existing.count++;
        if (c.claimed_at < existing.earliest) existing.earliest = c.claimed_at;
      }
    });

    const leaders: { mountain_id: number; user_id: string; count: number }[] = [];
    mtMap.forEach((userMap, mtId) => {
      let best: { userId: string; count: number; earliest: string } | null = null;
      userMap.forEach((val, userId) => {
        if (!best || val.count > best.count || (val.count === best.count && val.earliest < best.earliest)) {
          best = { userId, count: val.count, earliest: val.earliest };
        }
      });
      if (best) leaders.push({ mountain_id: mtId, user_id: (best as any).userId, count: (best as any).count });
    });

    // Club rankings
    const clubCounts = new Map<string, number>();
    claimsArr.filter((c) => c.group_id).forEach((c) => {
      clubCounts.set(c.group_id, (clubCounts.get(c.group_id) || 0) + 1);
    });
    const topClubs = [...clubCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    // Fetch profiles
    const allUserIds = [...new Set([
      ...topUsers.map(([id]) => id),
      ...leaders.map((l) => l.user_id),
    ])];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", allUserIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    setTopClaimers(
      topUsers.map(([userId, count]) => ({
        user_id: userId,
        count,
        nickname: profileMap.get(userId)?.nickname || null,
        avatar_url: profileMap.get(userId)?.avatar_url || null,
      }))
    );

    setMountainLeaders(
      leaders.map((l) => ({
        ...l,
        nickname: profileMap.get(l.user_id)?.nickname || null,
        avatar_url: profileMap.get(l.user_id)?.avatar_url || null,
      }))
    );

    // Fetch club names
    if (topClubs.length > 0) {
      const clubIds = topClubs.map(([id]) => id);
      const { data: groups } = await supabase
        .from("hiking_groups")
        .select("id, name")
        .in("id", clubIds);
      const groupMap = new Map((groups || []).map((g: any) => [g.id, g.name]));
      setClubRankings(
        topClubs.map(([groupId, count]) => ({
          group_id: groupId,
          group_name: groupMap.get(groupId) || "알 수 없음",
          count,
        }))
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { topClaimers, mountainLeaders, clubRankings, loading };
}
