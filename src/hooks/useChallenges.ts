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

export function useChallenges() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchAllChallenges = useCallback(async (): Promise<Challenge[]> => {
    const { data } = await supabase
      .from("challenges")
      .select("*, badges(name, image_url, description)")
      .order("type");
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

  // Called after saving a hiking journal to update all active challenges
  const recalculateProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch user's journals
      const { data: journals } = await supabase
        .from("hiking_journals")
        .select("*")
        .eq("user_id", user.id);
      if (!journals) return;

      // Fetch user's active challenges
      const { data: userChallenges } = await supabase
        .from("user_challenges")
        .select("*, challenges(*)")
        .eq("user_id", user.id)
        .eq("completed", false);
      if (!userChallenges || userChallenges.length === 0) return;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      for (const uc of userChallenges as any[]) {
        const ch = uc.challenges;
        if (!ch) continue;
        let progress = 0;

        switch (ch.goal_type) {
          case "count": {
            // Count journals in current month
            progress = journals.filter((j: any) => {
              const d = new Date(j.hiked_at);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }).length;
            break;
          }
          case "distance": {
            // Sum estimated distances from duration (rough estimate: 1hr ≈ 4km)
            progress = journals.reduce((sum: number, j: any) => {
              if (!j.duration) return sum;
              const match = j.duration.match(/(\d+)/);
              const hours = match ? parseInt(match[1]) / 60 : 0;
              return sum + hours * 4;
            }, 0);
            break;
          }
          case "mountain": {
            // Count distinct mountains
            const uniqueMountains = new Set(journals.map((j: any) => j.mountain_id));
            progress = uniqueMountains.size;
            break;
          }
          case "elevation": {
            // Check if any journal's mountain has elevation >= goal
            const { mountains } = await import("@/data/mountains");
            const hikedMountainIds = new Set(journals.map((j: any) => j.mountain_id));
            const hasHighMountain = mountains.some(
              (m) => hikedMountainIds.has(m.id) && m.height >= ch.goal_value
            );
            progress = hasHighMountain ? ch.goal_value : 0;
            break;
          }
          case "group_count": {
            // Count journals with tagged friends
            progress = journals.filter(
              (j: any) => j.tagged_friends && j.tagged_friends.length > 0
            ).length;
            break;
          }
          case "group_size": {
            // Check if any journal has >= goal_value tagged friends
            const hasLargeGroup = journals.some(
              (j: any) => j.tagged_friends && j.tagged_friends.length >= ch.goal_value
            );
            progress = hasLargeGroup ? ch.goal_value : 0;
            break;
          }
          case "streak": {
            // Calculate max consecutive days
            const dates = journals
              .map((j: any) => new Date(j.hiked_at).toDateString())
              .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
              .map((d: string) => new Date(d).getTime())
              .sort((a: number, b: number) => a - b);
            let maxStreak = dates.length > 0 ? 1 : 0;
            let streak = 1;
            for (let i = 1; i < dates.length; i++) {
              const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
              if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
              else { streak = 1; }
            }
            progress = maxStreak;
            break;
          }
          case "early_start": {
            // Check journals with start_time before 6am (use duration as proxy)
            // For now count summer journals
            const summerJournals = journals.filter((j: any) => {
              const d = new Date(j.hiked_at);
              return d.getMonth() >= 5 && d.getMonth() <= 7;
            });
            progress = summerJournals.length > 0 ? 1 : 0;
            break;
          }
          case "family_tag": {
            // Check if any journal has notes mentioning 가족
            const hasFamilyTag = journals.some(
              (j: any) => j.notes && j.notes.includes("가족")
            );
            progress = hasFamilyTag ? 1 : 0;
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
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    fetchAllChallenges,
    fetchUserChallenges,
    joinChallenge,
    updateProgress,
    recalculateProgress,
    loading,
  };
}
