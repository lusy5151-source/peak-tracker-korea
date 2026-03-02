import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HikingPlan {
  id: string;
  creator_id: string;
  mountain_id: number;
  trail_name: string | null;
  planned_date: string;
  start_time: string | null;
  notes: string | null;
  invite_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PlanParticipant {
  id: string;
  plan_id: string;
  user_id: string;
  rsvp_status: string;
  invited_at: string;
  responded_at: string | null;
  profile?: {
    nickname: string | null;
    avatar_url: string | null;
  };
}

export interface PlanNotification {
  id: string;
  user_id: string;
  plan_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useHikingPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<HikingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<PlanNotification[]>([]);

  const fetchPlans = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    const { data } = await supabase
      .from("hiking_plans")
      .select("*")
      .order("planned_date", { ascending: true });

    setPlans((data as HikingPlan[]) || []);
    setLoading(false);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("plan_notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false });
    setNotifications((data as PlanNotification[]) || []);
  }, [user]);

  useEffect(() => {
    fetchPlans();
    fetchNotifications();
  }, [fetchPlans, fetchNotifications]);

  const createPlan = async (plan: {
    mountain_id: number;
    trail_name?: string;
    planned_date: string;
    start_time?: string;
    notes?: string;
  }) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { data, error } = await supabase
      .from("hiking_plans")
      .insert({ ...plan, creator_id: user.id } as any)
      .select()
      .single();
    if (!error) fetchPlans();
    return { data: data as HikingPlan | null, error };
  };

  const updatePlan = async (planId: string, updates: Partial<HikingPlan>) => {
    const { error } = await supabase
      .from("hiking_plans")
      .update(updates as any)
      .eq("id", planId);
    if (!error) fetchPlans();
    return { error };
  };

  const deletePlan = async (planId: string) => {
    const { error } = await supabase
      .from("hiking_plans")
      .delete()
      .eq("id", planId);
    if (!error) fetchPlans();
    return { error };
  };

  const fetchParticipants = async (planId: string): Promise<PlanParticipant[]> => {
    const { data: participants } = await supabase
      .from("plan_participants")
      .select("*")
      .eq("plan_id", planId);

    if (!participants || participants.length === 0) return [];

    const userIds = participants.map((p: any) => p.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

    return (participants as any[]).map((p) => ({
      ...p,
      profile: profileMap.get(p.user_id) || null,
    }));
  };

  const inviteFriend = async (planId: string, friendUserId: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    // With current RLS, only the user themselves can insert their participation.
    // So we send a notification instead, and they join via the plan or invite code.
    const plan = plans.find((p) => p.id === planId);
    const { error } = await supabase.from("plan_notifications").insert({
      user_id: friendUserId,
      plan_id: planId,
      type: "invitation",
      message: `등산 계획에 초대되었습니다${plan ? ` (${plan.planned_date})` : ""}`,
    } as any);
    return { error };
  };

  const joinPlan = async (planId: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("plan_participants")
      .insert({ plan_id: planId, user_id: user.id } as any);
    if (!error) fetchPlans();
    return { error };
  };

  const updateRsvp = async (planId: string, status: string) => {
    if (!user) return { error: { message: "Not authenticated" } };
    const { error } = await supabase
      .from("plan_participants")
      .update({ rsvp_status: status, responded_at: new Date().toISOString() } as any)
      .eq("plan_id", planId)
      .eq("user_id", user.id);

    if (!error) {
      // Notify plan creator
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        const statusLabels: Record<string, string> = {
          going: "참석",
          interested: "관심",
          declined: "불참",
        };
        await supabase.from("plan_notifications").insert({
          user_id: plan.creator_id,
          plan_id: planId,
          type: "rsvp_change",
          message: `참가자가 "${statusLabels[status] || status}"(으)로 응답했습니다`,
        } as any);
      }
    }
    return { error };
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase
      .from("plan_notifications")
      .update({ is_read: true } as any)
      .eq("id", notificationId);
    fetchNotifications();
  };

  const joinByCode = async (code: string) => {
    if (!user) return { error: { message: "Not authenticated" } };

    const { data: plan } = await supabase
      .from("hiking_plans")
      .select("*")
      .eq("invite_code", code)
      .single();

    if (!plan) return { error: { message: "유효하지 않은 초대 코드입니다" } };

    const { error } = await supabase
      .from("plan_participants")
      .insert({ plan_id: (plan as any).id, user_id: user.id } as any);

    if (!error) fetchPlans();
    return { data: plan as HikingPlan, error };
  };

  return {
    plans,
    loading,
    notifications,
    createPlan,
    updatePlan,
    deletePlan,
    fetchParticipants,
    inviteFriend,
    updateRsvp,
    markNotificationRead,
    joinByCode,
    refetch: fetchPlans,
  };
}
