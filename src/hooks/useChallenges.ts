import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  type: string;
  goal_type: string;
  goal_value: number;
  start_date: string | null;
  end_date: string | null;
  badge_id: string | null;
  level: number;
  category: string;
  badge?: { name: string; image_url: string | null; description: string | null };
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  joined_at: string;
  challenge?: Challenge;
}

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"] as const;
export type BadgeTier = (typeof TIER_ORDER)[number];

export function getTierForLevel(level: number): BadgeTier {
  return TIER_ORDER[Math.min(level - 1, 3)] || "bronze";
}

export const TIER_COLORS: Record<BadgeTier, { bg: string; ring: string; text: string }> = {
  bronze: { bg: "bg-amber-100 dark:bg-amber-900/30", ring: "stroke-amber-400", text: "text-amber-600 dark:text-amber-400" },
  silver: { bg: "bg-slate-200 dark:bg-slate-700/40", ring: "stroke-slate-400", text: "text-slate-500 dark:text-slate-400" },
  gold: { bg: "bg-yellow-100 dark:bg-yellow-900/30", ring: "stroke-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
  platinum: { bg: "bg-violet-100 dark:bg-violet-900/30", ring: "stroke-violet-500", text: "text-violet-600 dark:text-violet-400" },
};

// Region map for region_specific challenges
const REGION_MAP: Record<string, string[]> = {
  "c2000001-0004-0000-0000-000000000001": ["서울·경기"],
  "c2000001-0004-0000-0000-000000000002": ["서울·경기"],
  "c2000001-0004-0000-0000-000000000003": ["경북", "경남"],
  "c2000001-0004-0000-0000-000000000004": ["제주"],
};

export function useChallenges() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchAllChallenges = useCallback(async (): Promise<Challenge[]> => {
    const { data } = await supabase
      .from("challenges")
      .select("*, badges(name, image_url, description)")
      .order("category")
      .order("level");
    return (data || []).map((c: any) => ({
      ...c,
      badge: c.badges || null,
    }));
  }, []);

  const fetchUserChallenges = useCallback(async (): Promise<UserChallenge[]> => {
    if (!user) return [];
    const { data } = await supabase
      .from("user_challenges")
      .select("*, challenges(*, badges(name, image_url, description))")
      .eq("user_id", user.id);
    return (data || []).map((uc: any) => ({
      ...uc,
      challenge: uc.challenges
        ? { ...uc.challenges, badge: uc.challenges.badges || null }
        : null,
    }));
  }, [user]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;
    await supabase
      .from("user_challenges")
      .insert({ user_id: user.id, challenge_id: challengeId } as any);
  }, [user]);

  const joinCategoryLevel1 = useCallback(async (category: string, allChallenges: Challenge[]) => {
    if (!user) return;
    const lv1 = allChallenges.find((c) => c.category === category && c.level === 1);
    if (!lv1) return;
    // Check if already joined
    const { data: existing } = await supabase
      .from("user_challenges")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", lv1.id)
      .maybeSingle();
    if (!existing) {
      await supabase
        .from("user_challenges")
        .insert({ user_id: user.id, challenge_id: lv1.id } as any);
    }
  }, [user]);

  const autoUnlockNextLevel = useCallback(async (completedChallenge: Challenge, allChallenges: Challenge[]) => {
    if (!user) return;
    const nextLevel = allChallenges.find(
      (c) => c.category === completedChallenge.category && c.level === completedChallenge.level + 1
    );
    if (!nextLevel) return;
    const { data: existing } = await supabase
      .from("user_challenges")
      .select("id")
      .eq("user_id", user.id)
      .eq("challenge_id", nextLevel.id)
      .maybeSingle();
    if (!existing) {
      await supabase
        .from("user_challenges")
        .insert({ user_id: user.id, challenge_id: nextLevel.id } as any);
    }
  }, [user]);

  const updateProgress = useCallback(async (ucId: string, progress: number, goalValue: number) => {
    if (!user) return;
    const completed = progress >= goalValue;
    await supabase
      .from("user_challenges")
      .update({
        progress,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      } as any)
      .eq("id", ucId);
  }, [user]);

  const recalculateProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: journals } = await supabase
        .from("hiking_journals")
        .select("*")
        .eq("user_id", user.id);
      if (!journals) return;

      const { data: userChallenges } = await supabase
        .from("user_challenges")
        .select("*, challenges(*)")
        .eq("user_id", user.id)
        .eq("completed", false);
      if (!userChallenges || userChallenges.length === 0) return;

      const { mountains } = await import("@/data/mountains");
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      for (const uc of userChallenges as any[]) {
        const ch = uc.challenges;
        if (!ch) continue;
        let progress = 0;

        switch (ch.goal_type) {
          case "count": {
            progress = journals.filter((j: any) => {
              const d = new Date(j.hiked_at);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            break;
          }
          case "distance": {
            progress = journals.reduce((sum: number, j: any) => {
              if (!j.duration) return sum;
              const match = j.duration.match(/(\d+)/);
              const hours = match ? parseInt(match[1]) / 60 : 0;
              return sum + hours * 4;
            }, 0);
            break;
          }
          case "mountain": {
            const uniqueMountains = new Set(journals.map((j: any) => j.mountain_id));
            progress = uniqueMountains.size;
            break;
          }
          case "elevation_total": {
            const hikedMountainIds = journals.map((j: any) => j.mountain_id);
            progress = hikedMountainIds.reduce((sum: number, mid: number) => {
              const m = mountains.find((mt) => mt.id === mid);
              return sum + (m ? m.height : 0);
            }, 0);
            break;
          }
          case "region_specific": {
            const targetRegions = REGION_MAP[ch.id] || [];
            const regionMountains = new Set(
              journals
                .map((j: any) => {
                  const m = mountains.find((mt) => mt.id === j.mountain_id);
                  if (m && targetRegions.includes(m.region)) return m.id;
                  return null;
                })
                .filter(Boolean)
            );
            progress = regionMountains.size;
            break;
          }
          case "streak": {
            const months = new Set(
              journals.map((j: any) => {
                const d = new Date(j.hiked_at);
                return `${d.getFullYear()}-${d.getMonth()}`;
              })
            );
            // Count consecutive months ending at current
            let streak = 0;
            for (let i = 0; i < 12; i++) {
              const d = new Date(currentYear, currentMonth - i);
              if (months.has(`${d.getFullYear()}-${d.getMonth()}`)) streak++;
              else break;
            }
            progress = streak;
            break;
          }
          case "sunrise": {
            const hasSunrise = journals.some(
              (j: any) => j.notes && (j.notes.includes("새벽") || j.notes.includes("일출"))
            );
            progress = hasSunrise ? 1 : 0;
            break;
          }
          case "sunset": {
            const hasSunset = journals.some(
              (j: any) => j.notes && (j.notes.includes("석양") || j.notes.includes("일몰"))
            );
            progress = hasSunset ? 1 : 0;
            break;
          }
          case "night_hike": {
            const hasNight = journals.some(
              (j: any) => j.notes && (j.notes.includes("야간") || j.notes.includes("밤"))
            );
            progress = hasNight ? 1 : 0;
            break;
          }
          case "weather_rain": {
            progress = journals.some((j: any) => j.weather === "비") ? 1 : 0;
            break;
          }
          case "weather_snow": {
            progress = journals.some((j: any) => j.weather === "눈") ? 1 : 0;
            break;
          }
          case "weather_wind": {
            progress = journals.some((j: any) => j.weather === "바람") ? 1 : 0;
            break;
          }
          case "difficulty_count": {
            const difficultMountains = new Set(
              journals
                .map((j: any) => {
                  const m = mountains.find((mt) => mt.id === j.mountain_id);
                  return m?.difficulty === "어려움" ? m.id : null;
                })
                .filter(Boolean)
            );
            progress = difficultMountains.size;
            break;
          }
          case "seasonal_spring": {
            progress = journals.some((j: any) => {
              const m = new Date(j.hiked_at).getMonth();
              return m >= 2 && m <= 4;
            }) ? 1 : 0;
            break;
          }
          case "seasonal_summer": {
            progress = journals.some((j: any) => {
              const m = new Date(j.hiked_at).getMonth();
              return m >= 5 && m <= 7;
            }) ? 1 : 0;
            break;
          }
          case "seasonal_autumn": {
            progress = journals.some((j: any) => {
              const m = new Date(j.hiked_at).getMonth();
              return m >= 8 && m <= 10;
            }) ? 1 : 0;
            break;
          }
          case "seasonal_winter": {
            progress = journals.some((j: any) => {
              const m = new Date(j.hiked_at).getMonth();
              return m === 11 || m <= 1;
            }) ? 1 : 0;
            break;
          }
        }

        const completed = progress >= ch.goal_value;
        await supabase
          .from("user_challenges")
          .update({
            progress,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          } as any)
          .eq("id", uc.id);

        // Auto-unlock next level on completion
        if (completed) {
          const allCh = await fetchAllChallenges();
          await autoUnlockNextLevel(ch, allCh);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, autoUnlockNextLevel, fetchAllChallenges]);

  return {
    fetchAllChallenges,
    fetchUserChallenges,
    joinChallenge,
    joinCategoryLevel1,
    autoUnlockNextLevel,
    updateProgress,
    recalculateProgress,
    loading,
  };
}
