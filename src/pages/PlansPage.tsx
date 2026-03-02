import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useHikingPlans } from "@/hooks/useHikingPlans";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Mountain, Calendar, Clock, Users, Bell, ChevronRight, Link2, UserCheck, UserX, Mail,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PendingInvitation {
  id: string;
  plan_id: string;
  invited_at: string;
  plan: {
    id: string;
    mountain_id: number;
    planned_date: string;
    start_time: string | null;
    trail_name: string | null;
    creator_id: string;
  };
  inviterName: string;
}

const PlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, loading, notifications, markNotificationRead, joinByCode, acceptInvitation, declineInvitation } = useHikingPlans();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!user) { setInvitationsLoading(false); return; }
    
    const { data: participants } = await supabase
      .from("plan_participants")
      .select("id, plan_id, invited_at, status")
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (!participants || participants.length === 0) {
      setInvitations([]);
      setInvitationsLoading(false);
      return;
    }

    const planIds = participants.map((p: any) => p.plan_id);
    const { data: planData } = await supabase
      .from("hiking_plans")
      .select("id, mountain_id, planned_date, start_time, trail_name, creator_id")
      .in("id", planIds);

    if (!planData) { setInvitations([]); setInvitationsLoading(false); return; }

    const creatorIds = [...new Set((planData as any[]).map((p) => p.creator_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", creatorIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.nickname || "알 수 없음"]));
    const planMap = new Map((planData as any[]).map((p) => [p.id, p]));

    const mapped: PendingInvitation[] = (participants as any[])
      .filter((p) => planMap.has(p.plan_id))
      .map((p) => ({
        id: p.id,
        plan_id: p.plan_id,
        invited_at: p.invited_at,
        plan: planMap.get(p.plan_id)!,
        inviterName: profileMap.get(planMap.get(p.plan_id)!.creator_id) || "알 수 없음",
      }));

    setInvitations(mapped);
    setInvitationsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAccept = async (inv: PendingInvitation) => {
    setRespondingId(inv.id);
    const { error } = await acceptInvitation(inv.plan_id);
    if (error) {
      toast({ title: "수락 실패", variant: "destructive" });
    } else {
      toast({ title: "초대를 수락했습니다! ✅" });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    }
    setRespondingId(null);
  };

  const handleDecline = async (inv: PendingInvitation) => {
    setRespondingId(inv.id);
    const { error } = await declineInvitation(inv.plan_id);
    if (error) {
      toast({ title: "거절 실패", variant: "destructive" });
    } else {
      toast({ title: "초대를 거절했습니다" });
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
    }
    setRespondingId(null);
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    const { data, error } = await joinByCode(inviteCode.trim());
    setJoining(false);
    if (error) {
      toast({ title: error.message || "참여 실패", variant: "destructive" });
    } else if (data) {
      toast({ title: "계획에 참여했습니다!" });
      navigate(`/plans/${data.id}`);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Mountain className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">로그인이 필요합니다</p>
        <Button onClick={() => navigate("/auth")}>로그인</Button>
      </div>
    );
  }

  const upcoming = plans.filter((p) => p.status === "upcoming" && new Date(p.planned_date) >= new Date());
  const past = plans.filter((p) => p.status !== "upcoming" || new Date(p.planned_date) < new Date());

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">등산 계획</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowJoin(!showJoin)}>
            <Link2 className="h-4 w-4 mr-1" /> 코드 참여
          </Button>
          <Button size="sm" onClick={() => navigate("/plans/create")}>
            <Plus className="h-4 w-4 mr-1" /> 새 계획
          </Button>
        </div>
      </div>

      {/* Join by code */}
      {showJoin && (
        <div className="rounded-xl border border-border bg-card p-4 flex gap-2">
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="초대 코드 입력..."
            className="font-mono tracking-widest"
          />
          <Button onClick={handleJoinByCode} disabled={joining}>
            {joining ? "참여 중..." : "참여"}
          </Button>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground flex items-center gap-1">
            <Bell className="h-4 w-4 text-primary" /> 알림
          </p>
          {notifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 cursor-pointer"
              onClick={() => {
                markNotificationRead(n.id);
                navigate(`/plans/${n.plan_id}`);
              }}
            >
              <Bell className="h-4 w-4 text-primary shrink-0" />
              <p className="flex-1 text-sm text-foreground">{n.message}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}

      {/* Pending Invitations */}
      {invitationsLoading ? (
        <section className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </section>
      ) : invitations.length > 0 && (
        <section>
          <p className="text-sm font-medium text-foreground flex items-center gap-1 mb-2">
            <Mail className="h-4 w-4 text-primary" /> 받은 초대 ({invitations.length})
          </p>
          <div className="space-y-2.5">
            {invitations.map((inv) => {
              const mountain = mountains.find((m) => m.id === inv.plan.mountain_id);
              const isResponding = respondingId === inv.id;
              return (
                <div
                  key={inv.id}
                  className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Mountain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {mountain?.nameKo || "알 수 없는 산"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(inv.plan.planned_date), "M/d (EEE)", { locale: ko })}
                        </span>
                        {inv.plan.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {inv.plan.start_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {inv.inviterName}님의 초대
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccept(inv)}
                      disabled={isResponding}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      {isResponding ? "처리 중..." : "수락"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDecline(inv)}
                      disabled={isResponding}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      거절
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Plans */}
      <section>
        <p className="text-sm font-medium text-muted-foreground mb-2">다가오는 계획 ({upcoming.length})</p>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Mountain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">아직 계획이 없습니다</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/plans/create")}>
              첫 계획 만들기
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((plan) => {
              const mountain = mountains.find((m) => m.id === plan.mountain_id);
              if (!mountain) return null;
              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Mountain className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{mountain.nameKo}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(plan.planned_date), "M/d (EEE)", { locale: ko })}
                      </span>
                      {plan.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {plan.start_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    {plan.trail_name && (
                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">🥾 {plan.trail_name}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Past Plans */}
      {past.length > 0 && (
        <section>
          <p className="text-sm font-medium text-muted-foreground mb-2">지난 계획 ({past.length})</p>
          <div className="space-y-2 opacity-60">
            {past.map((plan) => {
              const mountain = mountains.find((m) => m.id === plan.mountain_id);
              if (!mountain) return null;
              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-secondary/50 transition-colors"
                >
                  <Mountain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{mountain.nameKo}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(plan.planned_date), "M/d", { locale: ko })}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default PlansPage;
