import { supabase } from "@/integrations/supabase/client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { badges, BadgeDefinition, EarnedBadge } from "@/data/badges";
import type { CompletionRecord } from "@/hooks/useMountainStore";
import type { GearItem } from "@/hooks/useGearStore";

const STORAGE_KEY = "korea-100-badges";
const FEATURED_KEY = "korea-100-featured-badge";

export interface SharedCompletionData {
  id: string;
  participant_count: number;
}

function loadEarned(): EarnedBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEarned(earned: EarnedBadge[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
}

function getSeason(date: Date): string {
  const m = date.getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
}

export function useAchievementStore(
  records: CompletionRecord[],
  gearItems: GearItem[],
  sharedCompletions: SharedCompletionData[] = []
) {
  const [earned, setEarned] = useState<EarnedBadge[]>(loadEarned);
  const [featuredBadgeId, setFeaturedBadgeId] = useState<string | null>(
    () => localStorage.getItem(FEATURED_KEY)
  );
  const [newlyEarned, setNewlyEarned] = useState<BadgeDefinition | null>(null);

  useEffect(() => { saveEarned(earned); }, [earned]);
  useEffect(() => {
  const loadFromDB = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data } = await supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", user.id);

    if (!data) return;

    setEarned(
      data.map((d) => ({
        badgeId: d.badge_id,
        earnedAt: d.earned_at
      }))
    );
  };

  loadFromDB();
}, []);

  useEffect(() => {
    if (featuredBadgeId) localStorage.setItem(FEATURED_KEY, featuredBadgeId);
    else localStorage.removeItem(FEATURED_KEY);
  }, [featuredBadgeId]);

  const isEarned = useCallback(
    (badgeId: string) => earned.some((e) => e.badgeId === badgeId),
    [earned]
  );

  const earnBadge = useCallback(async (badgeId: string) => {
    if (earned.some((e) => e.badgeId === badgeId)) return;
 
  setEarned((prev) => {
    if (prev.some((e) => e.badgeId === badgeId)) return prev;
    return [...prev, { badgeId, earnedAt: new Date().toISOString() }];
  });

  const badge = badges.find((b) => b.id === badgeId);
  if (badge) setNewlyEarned(badge);
    
 const user = (await supabase.auth.getUser()).data.user;

  if (user) {
    await supabase
      .from("user_achievements")
      .upsert(
        {
        user_id: user.id,
        badge_id: badgeId
      },
      { onConflict: "user_id,badge_id" }
  );

},[earned]);


  const dismissNewBadge = useCallback(() => setNewlyEarned(null), []);

  const setFeatured = useCallback((id: string | null) => setFeaturedBadgeId(id), []);

  // Check and award badges based on current state
  const checkBadges = useCallback(() => {
    const count = records.length;
    const maxSharedParticipants = Math.max(
    0,
     ...sharedCompletions.map((sc) => sc.participant_count)
  );

    badges.forEach((badge) => {
      if (isEarned(badge.id)) return;

      const { condition } = badge;
      let unlocked = false;

      switch (condition.type) {
        case "completedCount":
          unlocked = count >= (condition.value || 0);
          break;
        case "specificMountain":
          unlocked = records.some((r) => r.mountainId === condition.mountainId);
          break;
        case "weather":
          unlocked = records.some((r) => r.weather === condition.weatherCondition);
          break;
        case "firstAction":
          if (condition.actionType === "journal") {
            unlocked = records.some((r) => r.notes && r.notes.trim().length > 0);
          } else if (condition.actionType === "photo") {
            unlocked = records.some((r) => r.photos && r.photos.length > 0);
          } else if (condition.actionType === "gear") {
            unlocked = gearItems.length > 0;
          }
          break;
        case "seasonal":
          unlocked = records.some((r) => getSeason(new Date(r.completedAt)) === condition.season);
          break;
        case "sharedParticipants":
          unlocked = maxSharedParticipants >= (condition.value || 0);
          break;
      }

      if (unlocked) earnBadge(badge.id);
    });
  }, [records, gearItems, sharedCompletions, isEarned, earnBadge]);

  // Run badge checks whenever records, gear, or shared completions change
  useEffect(() => { checkBadges(); }, [checkBadges]);

  const earnedBadges = useMemo(
    () => earned.map((e) => ({ 
    ...e,
    badge: badges.find((b) => b.id === e.badgeId) 
    }))
    .filter((e) => e.badge),
    [earned]
  );

  const featuredBadge = useMemo(
    () => (featuredBadgeId ? badges.find((b) => b.id === featuredBadgeId) : null),
    [featuredBadgeId]
  );

  // Progress toward next milestone
  const nextMilestone = useMemo(() => {
    const milestones = badges
      .filter((b) => b.condition.type === "completedCount")
      .sort((a, b) => (a.condition.value || 0) - (b.condition.value || 0));
    return milestones.find((m) => !isEarned(m.id)) || null;
  }, [isEarned]);

  return {
    earned,
    earnedBadges,
    isEarned,
    newlyEarned,
    dismissNewBadge,
    featuredBadge,
    featuredBadgeId,
    setFeatured,
    nextMilestone,
    totalBadges: badges.length,
    earnedCount: earned.length,
  };
}
