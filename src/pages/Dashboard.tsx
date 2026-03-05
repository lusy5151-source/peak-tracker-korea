import { useStore } from "@/context/StoreContext";
import { mountains, baekduMountains } from "@/data/mountains";
import { badges } from "@/data/badges";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/contexts/AuthContext";
import { useGearStore } from "@/hooks/useGearStore";
import { useAchievementStore } from "@/hooks/useAchievementStore";
import { useHikingPlans } from "@/hooks/useHikingPlans";
import { useHikingJournals, HikingJournal } from "@/hooks/useHikingJournals";
import { useChallenges, Challenge, UserChallenge } from "@/hooks/useChallenges";
import AchievementModal from "@/components/AchievementModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Progress } from "@/components/ui/progress";
import {
  Mountain, Plus, Calendar, MapPin, ChevronRight,
  Sun, Cloud, CloudRain, CloudSnow, CloudSun,
  ArrowRight, Target, Trophy, BookOpen, Heart,
  MessageCircle, Newspaper, Clock, Settings2,
  Sparkles, PenLine,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const conditionIcons: Record<string, any> = {
  "맑음": Sun, "구름": CloudSun, "흐림": Cloud, "비": CloudRain, "눈": CloudSnow,
};

const GOAL_KEY = "wandeng-user-goal";

const Dashboard = () => {
  const { records, completedCount, isCompleted } = useStore();
  const { items: gearItems } = useGearStore();
  const { earnedBadges, isEarned, newlyEarned, dismissNewBadge, earnedCount, totalBadges } =
    useAchievementStore(records, gearItems);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans } = useHikingPlans();
  const { fetchFeed } = useHikingJournals();
  const { fetchAllChallenges, fetchUserChallenges } = useChallenges();

  const [recentJournals, setRecentJournals] = useState<HikingJournal[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<(UserChallenge & { ch: Challenge })[]>([]);
  const [allChallengesList, setAllChallengesList] = useState<Challenge[]>([]);
  const [userGoal, setUserGoal] = useState<number>(() => {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? parseInt(saved) : 100;
  });
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  const baekduCount = baekduMountains.length;
  const baekduCompleted = baekduMountains.filter((m) => isCompleted(m.id)).length;
  const goalPercent = Math.min(Math.round((completedCount / userGoal) * 100), 100);

  // Upcoming hike
  const upcomingPlan = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return plans
      .filter((p) => new Date(p.planned_date) >= today && p.status !== "cancelled")
      .sort((a, b) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime())[0] || null;
  }, [plans]);

  const upcomingMountain = upcomingPlan ? mountains.find((m) => m.id === upcomingPlan.mountain_id) : null;
  const { weather } = useWeather(
    upcomingMountain?.id || mountains[0].id,
    upcomingMountain?.lat || mountains[0].lat,
    upcomingMountain?.lng || mountains[0].lng
  );

  const dDay = useMemo(() => {
    if (!upcomingPlan) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const planDate = new Date(upcomingPlan.planned_date);
    planDate.setHours(0, 0, 0, 0);
    const diff = Math.round((planDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
  }, [upcomingPlan]);

  // Load journals & challenges
  useEffect(() => {
    if (user) {
      fetchFeed().then((journals) => setRecentJournals(journals.slice(0, 3)));
      Promise.all([fetchAllChallenges(), fetchUserChallenges()]).then(([all, mine]) => {
        setAllChallengesList(all);
        const active = mine
          .filter((uc) => !uc.completed)
          .slice(0, 3)
          .map((uc) => ({ ...uc, ch: all.find((c) => c.id === uc.challenge_id)! }))
          .filter((uc) => uc.ch);
        setActiveChallenges(active);
      });
    }
  }, [user]);

  const handleGoalSave = (val: number) => {
    const clamped = Math.max(1, Math.min(val, 200));
    setUserGoal(clamped);
    localStorage.setItem(GOAL_KEY, String(clamped));
    setShowGoalEdit(false);
  };

  const CondIcon = conditionIcons[weather.condition] || Cloud;

  // News items (static for now)
  const newsItems = [
    { id: 1, title: "봄철 등산 안전 수칙 안내", date: "2026-03-05", summary: "해빙기 산행 시 주의사항을 확인하세요." },
    { id: 2, title: "국립공원 예약제 일부 변경", date: "2026-03-03", summary: "3월부터 일부 코스 예약제가 변경됩니다." },
    { id: 3, title: "설악산 탐방로 개방 안내", date: "2026-03-01", summary: "겨울 통제 해제, 탐방로가 순차 개방됩니다." },
  ];

  return (
    <ErrorBoundary fallbackMessage="대시보드를 불러오는 중 문제가 발생했습니다">
    <div className="space-y-5 pb-24">
      <AchievementModal badge={newlyEarned} onDismiss={dismissNewBadge} />

      {/* ── 1. Upcoming Hike ── */}
      <section>
        <SectionHeader title="다가오는 등산" linkTo="/plans" linkLabel="계획 보기" />
        {upcomingPlan && upcomingMountain ? (
          <Link to={`/plans/${upcomingPlan.id}`} className="block rounded-2xl border border-border bg-card p-5 shadow-sm hover:bg-accent/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">{dDay}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(upcomingPlan.planned_date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                    {upcomingPlan.start_time && ` · ${upcomingPlan.start_time.slice(0, 5)}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{upcomingMountain.nameKo}</h3>
                <p className="text-xs text-muted-foreground">{upcomingMountain.region} · {upcomingMountain.height}m</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5">
                <CondIcon className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-medium text-foreground">{weather.temp}°</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">예정된 등산 일정이 없습니다</p>
            <Link
              to="/plans/create"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> 계획 만들기
            </Link>
          </div>
        )}
      </section>

      {/* ── Quick Actions: 오늘의 산 + 등산기록 추가 ── */}
      <section className="grid grid-cols-2 gap-3">
        {/* 오늘의 산 */}
        {(() => {
          const todayIndex = new Date().getDate() % mountains.length;
          const todayMountain = mountains[todayIndex];
          return (
            <Link
              to={`/mountains/${todayMountain.id}`}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground">오늘의 산</p>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{todayMountain.nameKo}</p>
              <p className="text-[10px] text-muted-foreground">{todayMountain.region} · {todayMountain.height}m</p>
            </Link>
          );
        })()}

        {/* 등산기록 추가 */}
        <Link
          to="/records"
          className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 shadow-sm hover:bg-primary/10 transition-colors flex flex-col justify-center items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">등산기록 추가</p>
          <p className="text-[10px] text-muted-foreground">오늘의 산행을 기록하세요</p>
        </Link>
      </section>

      {/* ── 2. Completion Progress + Active Challenges ── */}
      <section className="grid gap-3 sm:grid-cols-2">
        {/* Completion Progress */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">완등 진행률</p>
            <button onClick={() => setShowGoalEdit(!showGoalEdit)} className="text-muted-foreground hover:text-primary">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {showGoalEdit && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">목표:</span>
              {[30, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => handleGoalSave(v)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${userGoal === v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - goalPercent / 100)}`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">{goalPercent}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-2xl font-bold text-foreground">{completedCount}<span className="text-sm font-normal text-muted-foreground"> / {userGoal}</span></p>
              <p className="text-xs text-muted-foreground">목표 {userGoal}개 산 완등</p>
              <p className="text-[10px] text-primary">백대명산 {baekduCompleted}/{baekduCount}</p>
            </div>
          </div>
          <Link
            to="/mountains"
            className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            산 목록 보기 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Active Challenges */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">진행 중인 챌린지</p>
            <Link to="/challenges" className="text-xs text-primary hover:underline">전체</Link>
          </div>
          {!user ? (
            <div className="text-center py-4">
              <Target className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">로그인하면 챌린지에 참여할 수 있어요</p>
            </div>
          ) : activeChallenges.length > 0 ? (
            <div className="space-y-3">
              {activeChallenges.map((ac) => {
                const pct = Math.min(Math.round((ac.progress / ac.ch.goal_value) * 100), 100);
                return (
                  <div key={ac.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {ac.ch.badge && <span className="text-sm shrink-0">{ac.ch.badge.image_url}</span>}
                        <p className="text-xs font-medium text-foreground truncate">{ac.ch.title}</p>
                      </div>
                      <span className="text-[10px] font-medium text-primary shrink-0">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5 bg-secondary [&>div]:bg-primary" />
                    <p className="text-[10px] text-muted-foreground">{ac.progress} / {ac.ch.goal_value}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <Target className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">참여 중인 챌린지가 없습니다</p>
              <Link to="/challenges" className="mt-2 inline-block text-xs text-primary font-medium">챌린지 둘러보기</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Recent Hiking Journals ── */}
      <section>
        <SectionHeader title="최근 등산 일지" linkTo="/feed" linkLabel="전체 보기" />
        {!user ? (
          <EmptyState icon={BookOpen} message="로그인하면 등산 일지를 볼 수 있습니다" linkTo="/auth" linkLabel="로그인" />
        ) : recentJournals.length === 0 ? (
          <EmptyState icon={BookOpen} message="아직 등산 일지가 없습니다" linkTo="/records" linkLabel="기록 남기기" />
        ) : (
          <div className="space-y-2.5">
            {recentJournals.map((j) => {
              const mt = mountains.find((m) => m.id === j.mountain_id);
              return (
                <div key={j.id} className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                  <div className="flex gap-3">
                    {j.photos && j.photos.length > 0 ? (
                      <img src={j.photos[0]} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Mountain className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{mt?.nameKo || "산"}</p>
                        {j.profile?.nickname && (
                          <span className="text-[10px] text-muted-foreground">by {j.profile.nickname}</span>
                        )}
                      </div>
                      {j.notes && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{j.notes}</p>}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {j.like_count || 0}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {j.comment_count || 0}</span>
                        <span>{new Date(j.hiked_at).toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. Badge Gallery ── */}
      <section>
        <SectionHeader title="배지 갤러리" linkTo="/achievements" linkLabel="전체 보기" />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {badges.map((b) => {
              const earned = isEarned(b.id);
              return (
                <div key={b.id} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                    earned
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted grayscale opacity-40"
                  }`}>
                    <span className="text-xl">{b.icon}</span>
                  </div>
                  <p className={`text-[9px] font-medium text-center leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {b.name}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{earnedCount} / {totalBadges} 달성</p>
        </div>
      </section>

      {/* ── 5. Mountain News ── */}
      <section>
        <SectionHeader title="산 뉴스" linkTo="#" linkLabel="" />
        <div className="space-y-2">
          {newsItems.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                <p className="text-[10px] text-muted-foreground">{n.date}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
    </ErrorBoundary>
  );
};

/* ─── Helpers ─── */
function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {linkLabel && <Link to={linkTo} className="text-xs text-primary hover:underline">{linkLabel}</Link>}
    </div>
  );
}

function EmptyState({ icon: Icon, message, linkTo, linkLabel }: { icon: any; message: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/30" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link to={linkTo} className="mt-1 inline-block text-xs text-primary hover:underline">{linkLabel}</Link>
    </div>
  );
}

export default Dashboard;
