import { useEffect, useState, useMemo } from "react";
import { useChallenges, Challenge, UserChallenge } from "@/hooks/useChallenges";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Trophy,
  Target,
  CheckCircle2,
  Plus,
  ChevronDown,
  TrendingUp,
  MapPin,
  CalendarCheck,
  Sunrise,
  BookOpen,
  Users,
  Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Category definitions with goal_type mappings
const CATEGORIES = [
  {
    id: "growth",
    title: "성장",
    description: "거리와 고도를 정복해보세요",
    icon: TrendingUp,
    goalTypes: ["distance", "elevation_total", "elevation"],
  },
  {
    id: "region",
    title: "지역 정복",
    description: "다양한 지역의 산을 탐험하세요",
    icon: MapPin,
    goalTypes: ["mountain", "region_specific", "region_count"],
  },
  {
    id: "habit",
    title: "습관 & 꾸준함",
    description: "등산을 습관으로 만들어보세요",
    icon: CalendarCheck,
    goalTypes: ["count", "streak"],
  },
  {
    id: "special",
    title: "특별 조건",
    description: "특별한 등산 경험에 도전하세요",
    icon: Sunrise,
    goalTypes: ["sunrise", "early_start"],
  },
  {
    id: "journal",
    title: "기록 & 콘텐츠",
    description: "등산 기록을 남겨보세요",
    icon: BookOpen,
    goalTypes: ["journal_count"],
  },
  {
    id: "social",
    title: "소셜",
    description: "함께하는 등산의 즐거움",
    icon: Users,
    goalTypes: ["group_count", "group_size", "family_tag", "new_friend"],
  },
  {
    id: "season",
    title: "시즌",
    description: "계절별 특별 챌린지",
    icon: Leaf,
    goalTypes: [], // matched by challenge type instead
  },
];

interface ChallengeWithStatus {
  challenge: Challenge;
  userChallenge?: UserChallenge;
  status: "ongoing" | "completed" | "locked";
}

const ChallengePage = () => {
  const { user } = useAuth();
  const { fetchAllChallenges, fetchUserChallenges, joinChallenge, recalculateProgress } = useChallenges();
  const { toast } = useToast();
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["growth", "region", "habit"]));

  const load = async () => {
    setLoading(true);
    const [all, mine] = await Promise.all([fetchAllChallenges(), fetchUserChallenges()]);
    setAllChallenges(all);
    setUserChallenges(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const ucMap = useMemo(() => {
    const m = new Map<string, UserChallenge>();
    userChallenges.forEach((uc) => m.set(uc.challenge_id, uc));
    return m;
  }, [userChallenges]);

  const categorized = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items: ChallengeWithStatus[] = allChallenges
        .filter((ch) => {
          if (cat.id === "season") return ch.type === "season";
          return cat.goalTypes.includes(ch.goal_type) && ch.type !== "season";
        })
        .map((ch) => {
          const uc = ucMap.get(ch.id);
          let status: "ongoing" | "completed" | "locked" = "locked";
          if (uc) status = uc.completed ? "completed" : "ongoing";
          return { challenge: ch, userChallenge: uc, status };
        })
        .sort((a, b) => {
          const order = { ongoing: 0, locked: 1, completed: 2 };
          return order[a.status] - order[b.status];
        });

      const ongoingCount = items.filter((i) => i.status === "ongoing").length;
      const completedCount = items.filter((i) => i.status === "completed").length;

      return { ...cat, items, ongoingCount, completedCount };
    }).filter((cat) => cat.items.length > 0);
  }, [allChallenges, ucMap]);

  const totalOngoing = userChallenges.filter((uc) => !uc.completed).length;
  const totalCompleted = userChallenges.filter((uc) => uc.completed).length;

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleJoin = async (challengeId: string) => {
    if (!user) return;
    setJoining(challengeId);
    await joinChallenge(challengeId);
    await recalculateProgress();
    await load();
    toast({ title: "챌린지 참여 완료!", description: "진행 상황이 자동으로 업데이트됩니다." });
    setJoining(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Target className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">챌린지에 참여하려면 로그인이 필요합니다.</p>
        <Link to="/auth"><Button>로그인</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Target className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-foreground">챌린지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          진행 중 {totalOngoing}개 · 완료 {totalCompleted}개
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categorized.map((cat) => {
            const Icon = cat.icon;
            const isOpen = openCategories.has(cat.id);
            return (
              <Collapsible key={cat.id} open={isOpen} onOpenChange={() => toggleCategory(cat.id)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <h2 className="font-semibold text-sm text-foreground">{cat.title}</h2>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cat.ongoingCount > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {cat.ongoingCount} 진행
                        </span>
                      )}
                      {cat.completedCount > 0 && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {cat.completedCount} 완료
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2 pl-2">
                    {cat.items.map((item) => (
                      <ChallengeItem
                        key={item.challenge.id}
                        item={item}
                        joining={joining}
                        onJoin={handleJoin}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

function ChallengeItem({
  item,
  joining,
  onJoin,
}: {
  item: ChallengeWithStatus;
  joining: string | null;
  onJoin: (id: string) => void;
}) {
  const { challenge: ch, userChallenge: uc, status } = item;

  if (status === "completed" && uc) {
    return (
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            {ch.badge ? (
              <span className="text-lg">{ch.badge.image_url}</span>
            ) : (
              <Trophy className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{ch.title}</h3>
            {ch.badge && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">🏅 {ch.badge.name}</p>
            )}
            {uc.completed_at && (
              <p className="text-[10px] text-muted-foreground">
                {new Date(uc.completed_at).toLocaleDateString("ko-KR")} 달성
              </p>
            )}
          </div>
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
        </div>
      </div>
    );
  }

  if (status === "ongoing" && uc) {
    const pct = Math.min(Math.round((uc.progress / ch.goal_value) * 100), 100);
    return (
      <div className="rounded-xl border border-border bg-card p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{ch.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ch.description}</p>
          </div>
          {ch.badge && <span className="text-xl shrink-0 ml-2">{ch.badge.image_url}</span>}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {uc.progress} / {ch.goal_value} ({pct}%)
            </span>
          </div>
          <Progress value={pct} className="h-2 bg-emerald-100 dark:bg-emerald-900/30 [&>div]:bg-emerald-500" />
        </div>
      </div>
    );
  }

  // Locked
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{ch.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ch.description}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 ml-2 border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          onClick={() => onJoin(ch.id)}
          disabled={joining === ch.id}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {joining === ch.id ? "참여 중..." : "참여"}
        </Button>
      </div>
    </div>
  );
}

export default ChallengePage;
