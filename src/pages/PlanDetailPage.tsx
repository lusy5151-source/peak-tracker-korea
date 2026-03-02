import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { getMockWeather } from "@/data/mockWeather";
import { useHikingPlans, type PlanParticipant, type HikingPlan } from "@/hooks/useHikingPlans";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Calendar, Clock, MapPin, Mountain, Users, Copy, Check,
  Cloud, Sun, CloudRain, CloudSnow, CloudSun, Wind, Droplets, UserPlus,
  MessageSquare, Share2,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const conditionIcons: Record<string, any> = {
  "맑음": Sun, "구름": CloudSun, "흐림": Cloud, "비": CloudRain, "눈": CloudSnow,
};

const rsvpLabels: Record<string, { label: string; color: string }> = {
  going: { label: "참석", color: "bg-success/20 text-success" },
  interested: { label: "관심", color: "bg-primary/20 text-primary" },
  declined: { label: "불참", color: "bg-destructive/20 text-destructive" },
  pending: { label: "대기", color: "bg-secondary text-muted-foreground" },
};

const PlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, fetchParticipants, inviteFriend, updateRsvp, deletePlan } = useHikingPlans();
  const { friends } = useFriends();
  const { toast } = useToast();

  const [plan, setPlan] = useState<HikingPlan | null>(null);
  const [participants, setParticipants] = useState<PlanParticipant[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<{ nickname: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const found = plans.find((p) => p.id === id);
    if (found) setPlan(found);
  }, [plans, id]);

  useEffect(() => {
    if (!id) return;
    fetchParticipants(id).then(setParticipants);
  }, [id]);

  useEffect(() => {
    if (!plan) return;
    supabase
      .from("profiles")
      .select("nickname, avatar_url")
      .eq("user_id", plan.creator_id)
      .single()
      .then(({ data }) => {
        if (data) setCreatorProfile(data);
      });
  }, [plan?.creator_id]);

  const mountain = useMemo(
    () => (plan ? mountains.find((m) => m.id === plan.mountain_id) : null),
    [plan]
  );

  const weather = mountain ? getMockWeather(mountain.id) : null;
  const CondIcon = weather ? conditionIcons[weather.condition] || Cloud : Cloud;
  const trail = mountain?.trails?.find((t) => t.name === plan?.trail_name);

  const isCreator = user?.id === plan?.creator_id;
  const myParticipation = participants.find((p) => p.user_id === user?.id);

  const uninvitedFriends = friends.filter(
    (f) => !participants.some((p) => p.user_id === f.friendProfile.user_id)
  );

  const handleInvite = async (friendUserId: string) => {
    if (!id) return;
    const { error } = await inviteFriend(id, friendUserId);
    if (error) {
      toast({ title: "초대 실패", variant: "destructive" });
    } else {
      toast({ title: "초대를 보냈습니다" });
      fetchParticipants(id).then(setParticipants);
    }
  };

  const handleRsvp = async (status: string) => {
    if (!id) return;
    const { error } = await updateRsvp(id, status);
    if (!error) {
      toast({ title: `"${rsvpLabels[status]?.label}"(으)로 응답했습니다` });
      fetchParticipants(id).then(setParticipants);
    }
  };

  const handleCopyCode = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "초대 코드가 복사되었습니다" });
  };

  const handleDelete = async () => {
    if (!id) return;
    await deletePlan(id);
    toast({ title: "계획이 삭제되었습니다" });
    navigate("/plans");
  };

  if (!plan || !mountain) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Mountain className="h-8 w-8 mb-2" />
        <p className="text-sm">계획을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/plans")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1">{mountain.nameKo}</h1>
        {isCreator && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
            삭제
          </Button>
        )}
      </div>

      {/* Mountain & Route Card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Mountain className="h-5 w-5 text-primary" />
          <div>
            <p className="font-bold text-foreground">{mountain.nameKo}</p>
            <p className="text-xs text-muted-foreground">{mountain.region} · {mountain.height}m · {mountain.difficulty}</p>
          </div>
        </div>

        {trail && (
          <div className="rounded-lg bg-secondary/50 p-3 text-sm">
            <p className="font-medium text-foreground">🥾 {trail.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {trail.distance} · ⏱ {trail.duration} · 📍 {trail.startingPoint}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{format(new Date(plan.planned_date), "PPP", { locale: ko })}</span>
          </div>
          {plan.start_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{plan.start_time.slice(0, 5)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Weather Preview */}
      {weather && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">🌤 예상 날씨</p>
          <div className="flex items-center gap-3">
            <CondIcon className="h-8 w-8 text-sky-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{weather.temp}°C</p>
              <p className="text-xs text-muted-foreground">{weather.condition}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground space-y-0.5">
              <p className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weather.windSpeed}km/h</p>
              <p className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {weather.precipChance}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {plan.notes && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">📝 메모</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{plan.notes}</p>
        </div>
      )}

      {/* Invite Code */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          <Share2 className="inline h-3 w-3 mr-1" />초대 코드
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm font-mono text-foreground tracking-widest">
            {plan.invite_code}
          </code>
          <Button variant="outline" size="sm" onClick={handleCopyCode}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Creator */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">👤 만든 사람</p>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={creatorProfile?.avatar_url || ""} />
            <AvatarFallback className="text-xs">{creatorProfile?.nickname?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{creatorProfile?.nickname || "알 수 없음"}</span>
          {isCreator && <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">나</span>}
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />참가자 ({participants.length})
          </p>
          {isCreator && (
            <Button variant="ghost" size="sm" onClick={() => setShowInvite(!showInvite)}>
              <UserPlus className="h-4 w-4 mr-1" /> 초대
            </Button>
          )}
        </div>

        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">아직 참가자가 없습니다</p>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => {
              const rsvp = rsvpLabels[p.rsvp_status] || rsvpLabels.pending;
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.profile?.avatar_url || ""} />
                    <AvatarFallback className="text-[10px]">{p.profile?.nickname?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-foreground">{p.profile?.nickname || "사용자"}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", rsvp.color)}>
                    {rsvp.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Invite friends panel */}
        {showInvite && (
          <div className="mt-3 border-t border-border pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">친구 초대하기</p>
            {uninvitedFriends.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">초대할 수 있는 친구가 없습니다</p>
            ) : (
              uninvitedFriends.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={f.friendProfile.avatar_url || ""} />
                    <AvatarFallback className="text-[10px]">{f.friendProfile.nickname?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-foreground">{f.friendProfile.nickname}</span>
                  <Button size="sm" variant="outline" onClick={() => handleInvite(f.friendProfile.user_id)}>
                    초대
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RSVP buttons for participants */}
      {myParticipation && !isCreator && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3">내 응답</p>
          <div className="flex gap-2">
            {(["going", "interested", "declined"] as const).map((status) => {
              const info = rsvpLabels[status];
              return (
                <Button
                  key={status}
                  variant={myParticipation.rsvp_status === status ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRsvp(status)}
                >
                  {info.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetailPage;
