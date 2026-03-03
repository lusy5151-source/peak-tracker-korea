import { useEffect, useState, useMemo } from "react";
import { useChallenges, Challenge, UserChallenge } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ChallengePage = () => {
  const { user } = useAuth();
  const { fetchAllChallenges, fetchUserChallenges, joinChallenge, recalculateProgress } = useChallenges();
  const { toast } = useToast();
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [all, mine] = await Promise.all([fetchAllChallenges(), fetchUserChallenges()]);
    setAllChallenges(all);
    setUserChallenges(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const ongoing = useMemo(
    () => userChallenges.filter((uc) => !uc.completed),
    [userChallenges]
  );

  const completed = useMemo(
    () => userChallenges.filter((uc) => uc.completed),
    [userChallenges]
  );

  const joinedIds = useMemo(
    () => new Set(userChallenges.map((uc) => uc.challenge_id)),
    [userChallenges]
  );

  const recommended = useMemo(() => {
    // Show challenges user hasn't joined, prioritize by type
    return allChallenges.filter((c) => !joinedIds.has(c.id));
  }, [allChallenges, joinedIds]);

  const handleJoin = async (challengeId: string) => {
    if (!user) return;
    setJoining(challengeId);
    await joinChallenge(challengeId);
    await recalculateProgress();
    await load();
    toast({ title: "챌린지 참여 완료!", description: "진행 상황이 자동으로 업데이트됩니다." });
    setJoining(null);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "personal": return "개인";
      case "group": return "그룹";
      case "season": return "시즌";
      default: return type;
    }
  };

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case "personal": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "group": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "season": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Target className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">챌린지에 참여하려면 로그인이 필요합니다.</p>
        <Link to="/auth">
          <Button>로그인</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Target className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-foreground">챌린지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          진행 중 {ongoing.length}개 · 완료 {completed.length}개
        </p>
      </div>

      <Tabs defaultValue="ongoing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ongoing" className="text-xs">진행 중</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">완료</TabsTrigger>
          <TabsTrigger value="recommended" className="text-xs">추천</TabsTrigger>
        </TabsList>

        {/* Ongoing */}
        <TabsContent value="ongoing" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : ongoing.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">진행 중인 챌린지가 없습니다</p>
              <p className="text-xs mt-1">추천 탭에서 챌린지에 참여해보세요!</p>
            </div>
          ) : (
            ongoing.map((uc) => {
              const ch = uc.challenge;
              if (!ch) return null;
              const pct = Math.min(Math.round((uc.progress / ch.goal_value) * 100), 100);
              return (
                <div key={uc.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadgeClass(ch.type)}`}>
                          {typeLabel(ch.type)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm text-foreground">{ch.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                    </div>
                    {ch.badge && (
                      <span className="text-2xl">{ch.badge.image_url}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {uc.progress} / {ch.goal_value} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-2.5 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500" />
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="space-y-3 mt-4">
          {loading ? (
            <div className="h-28 rounded-xl bg-muted animate-pulse" />
          ) : completed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">아직 완료한 챌린지가 없습니다</p>
            </div>
          ) : (
            completed.map((uc) => {
              const ch = uc.challenge;
              if (!ch) return null;
              return (
                <div key={uc.id} className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                      {ch.badge ? (
                        <span className="text-2xl">{ch.badge.image_url}</span>
                      ) : (
                        <Trophy className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground">{ch.title}</h3>
                      {ch.badge && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          🏅 {ch.badge.name} 획득!
                        </p>
                      )}
                      {uc.completed_at && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(uc.completed_at).toLocaleDateString("ko-KR")} 달성
                        </p>
                      )}
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Recommended */}
        <TabsContent value="recommended" className="space-y-3 mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">모든 챌린지에 참여 중입니다! 🎉</p>
            </div>
          ) : (
            <>
              {["personal", "group", "season"].map((type) => {
                const items = recommended.filter((c) => c.type === type);
                if (items.length === 0) return null;
                return (
                  <div key={type} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {typeLabel(type)} 챌린지
                    </h3>
                    {items.map((ch) => (
                      <div key={ch.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeBadgeClass(ch.type)}`}>
                                {typeLabel(ch.type)}
                              </span>
                              {ch.badge && <span className="text-sm">{ch.badge.image_url}</span>}
                            </div>
                            <h3 className="font-semibold text-sm text-foreground">{ch.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                            {ch.start_date && ch.end_date && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                📅 {ch.start_date} ~ {ch.end_date}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                            onClick={() => handleJoin(ch.id)}
                            disabled={joining === ch.id}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            {joining === ch.id ? "참여 중..." : "참여"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengePage;
