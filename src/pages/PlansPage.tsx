import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useHikingPlans } from "@/hooks/useHikingPlans";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Mountain, Calendar, Clock, Users, Bell, ChevronRight, Link2,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, loading, notifications, markNotificationRead, joinByCode } = useHikingPlans();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

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
