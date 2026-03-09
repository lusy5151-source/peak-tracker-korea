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
import { useSharedCompletions, type SharedCompletion } from "@/hooks/useSharedCompletions";
import { SharedCompletionCard } from "@/components/SharedCompletionCard";
import AchievementModal from "@/components/AchievementModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Progress } from "@/components/ui/progress";
import {
  Mountain, Plus, Calendar, ChevronRight,
  Sun, Cloud, CloudRain, CloudSnow, CloudSun,
  Target, BookOpen, Heart, Search,
  MessageCircle, Newspaper, Clock, Settings2,
  Bell, User, Users,
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

  // Challenge progress (for ring)
  const challengeProgress = useMemo(() => {
    if (activeChallenges.length === 0) return 0;
    const totalPct = activeChallenges.reduce((sum, ac) => {
      return sum + Math.min((ac.progress / ac.ch.goal_value) * 100, 100);
    }, 0);
    return Math.round(totalPct / activeChallenges.length);
  }, [activeChallenges]);

  useEffect(() => {
    if (user) {
      fetchFeed().then((journals) => setRecentJournals(journals.slice(0, 3)));
      Promise.all([fetchAllChallenges(), fetchUserChallenges()]).then(([all, mine]) => {
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

  // Today's mountain
  const todayIndex = new Date().getDate() % mountains.length;
  const todayMountain = mountains[todayIndex];

  const newsItems = [
    { id: 1, title: "봄철 등산 안전 수칙 안내", date: "2026-03-05", summary: "해빙기 산행 시 주의사항을 확인하세요." },
    { id: 2, title: "국립공원 예약제 일부 변경", date: "2026-03-03", summary: "3월부터 일부 코스 예약제가 변경됩니다." },
    { id: 3, title: "설악산 탐방로 개방 안내", date: "2026-03-01", summary: "겨울 통제 해제, 탐방로가 순차 개방됩니다." },
  ];

  return (
    <ErrorBoundary fallbackMessage="대시보드를 불러오는 중 문제가 발생했습니다">
      <div className="-mx-4 -mt-6 pb-24">
        <AchievementModal badge={newlyEarned} onDismiss={dismissNewBadge} />

        {/* ── Hero: Mountain silhouette + Upcoming Hike ── */}
        <section className="relative overflow-hidden bg-sky-hero px-5 pb-8 pt-6">
          {/* Abstract mountain shapes */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 120" className="w-full" preserveAspectRatio="none">
              <path d="M0 120 L0 80 Q50 30 100 60 Q150 90 200 50 Q250 10 300 55 Q350 90 400 40 L400 120 Z" fill="hsl(var(--nature-100))" opacity="0.5" />
              <path d="M0 120 L0 95 Q80 55 160 75 Q240 95 320 65 Q360 50 400 70 L400 120 Z" fill="hsl(var(--nature-50))" opacity="0.7" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Top mini header inside hero */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">완등</h1>
                <p className="text-xs text-muted-foreground mt-0.5">오늘도 한 걸음 더 🏔️</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="rounded-full bg-card/70 p-2 text-muted-foreground backdrop-blur-sm"><Bell className="h-4 w-4" /></button>
                <Link to="/profile" className="rounded-full bg-card/70 p-2 text-muted-foreground backdrop-blur-sm"><User className="h-4 w-4" /></Link>
                <Link to="/social" className="rounded-full bg-card/70 p-2 text-muted-foreground backdrop-blur-sm"><Users className="h-4 w-4" /></Link>
              </div>
            </div>

            {/* Upcoming schedule card */}
            <div className="rounded-2xl bg-card/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold text-muted-foreground mb-2">다가오는 일정</p>
              {upcomingPlan && upcomingMountain ? (
                <Link to={`/plans/${upcomingPlan.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-coral px-3 py-1 text-sm font-bold text-primary-foreground">{dDay}</span>
                      <h3 className="mt-2 text-lg font-bold text-foreground">{upcomingMountain.nameKo}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(upcomingPlan.planned_date).toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                        {upcomingPlan.start_time && ` · ${upcomingPlan.start_time.slice(0, 5)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xl bg-sky-hero/60 px-3 py-2">
                      <CondIcon className="h-5 w-5 text-sky-500" />
                      <span className="text-base font-semibold text-foreground">{weather.temp}°</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="text-center py-3">
                  <Calendar className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">예정된 일정이 없습니다</p>
                  <Link
                    to="/plans/create"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-coral px-5 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> 계획 만들기
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-5 px-5 pt-5">

          {/* ── Progress Rings Section ── */}
          <section className="grid grid-cols-2 gap-4">
            {/* Completion Progress */}
            <div className="rounded-3xl bg-card p-5 shadow-sm border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground">100대 명산 완등</p>
                <button onClick={() => setShowGoalEdit(!showGoalEdit)} className="text-muted-foreground hover:text-primary">
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {showGoalEdit && (
                <div className="mb-3 flex items-center gap-1.5 flex-wrap">
                  {[30, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => handleGoalSave(v)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${userGoal === v ? "bg-coral text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--coral-light))" strokeWidth="8" />
                    <circle
                      cx="56" cy="56" r="48" fill="none"
                      stroke="hsl(var(--coral))" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - goalPercent / 100)}`}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{goalPercent}%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">{completedCount}<span className="text-xs font-normal text-muted-foreground"> / {userGoal}</span></p>
                <p className="text-[10px] text-muted-foreground">백대명산 {baekduCompleted}/{baekduCount}</p>
              </div>
            </div>

            {/* Challenge Progress */}
            <div className="rounded-3xl bg-card p-5 shadow-sm border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3">챌린지 진행</p>
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-28">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--coral-light))" strokeWidth="8" />
                    <circle
                      cx="56" cy="56" r="48" fill="none"
                      stroke="hsl(var(--coral))" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - challengeProgress / 100)}`}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{challengeProgress}%</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  {activeChallenges.length > 0 ? `${activeChallenges.length}개 진행 중` : "참여 중인 챌린지 없음"}
                </p>
                <Link to="/challenges" className="mt-1 text-[10px] font-semibold text-coral hover:underline">전체 보기</Link>
              </div>
            </div>
          </section>

          {/* ── Search Bar ── */}
          <section>
            <Link to="/mountains" className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3.5 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground/60">산 이름, 지역으로 검색...</span>
            </Link>
          </section>

          {/* ── Today's Mountain ── */}
          <section>
            <SectionHeader title="오늘의 산" />
            <Link to={`/mountains/${todayMountain.id}`} className="block rounded-3xl bg-card border border-border p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-light shrink-0">
                  <Mountain className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground">{todayMountain.nameKo}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{todayMountain.region} · {todayMountain.height}m</p>
                  {todayMountain.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{todayMountain.description}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  상세 보기 <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </section>

          {/* ── Add Hiking Record ── */}
          <section>
            <Link
              to="/records"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange-accent bg-orange-accent-light px-5 py-4 transition-colors hover:bg-orange-accent/10"
            >
              <Plus className="h-5 w-5 text-orange-accent" />
              <span className="text-sm font-bold text-orange-accent">등산 기록 추가하기</span>
            </Link>
          </section>

          {/* ── Recent Hiking Journals ── */}
          <section>
            <SectionHeader title="최근 등산 기록" linkTo="/feed" linkLabel="전체 보기" />
            {!user ? (
              <EmptyState icon={BookOpen} message="로그인하면 등산 기록을 볼 수 있습니다" linkTo="/auth" linkLabel="로그인" />
            ) : recentJournals.length === 0 ? (
              <EmptyState icon={BookOpen} message="아직 등산 기록이 없습니다" linkTo="/records" linkLabel="기록 남기기" />
            ) : (
              <div className="space-y-3">
                {recentJournals.map((j) => {
                  const mt = mountains.find((m) => m.id === j.mountain_id);
                  return (
                    <div key={j.id} className="rounded-2xl bg-card border border-border p-4 shadow-sm">
                      <div className="flex gap-3">
                        {j.photos && j.photos.length > 0 ? (
                          <img src={j.photos[0]} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-mint-light shrink-0">
                            <Mountain className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground truncate">{mt?.nameKo || "산"}</p>
                            {j.profile?.nickname && (
                              <span className="text-[10px] text-muted-foreground">by {j.profile.nickname}</span>
                            )}
                          </div>
                          {j.notes && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{j.notes}</p>}
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-coral" /> {j.like_count || 0}</span>
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

          {/* ── Badge Gallery ── */}
          <section>
            <SectionHeader title="업적 갤러리" linkTo="/achievements" linkLabel="전체 보기" />
            <div className="rounded-3xl bg-lavender-light border border-border p-5 shadow-sm">
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {badges.map((b) => {
                  const earned = isEarned(b.id);
                  return (
                    <div key={b.id} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                      <div className={`flex h-13 w-13 items-center justify-center rounded-full border-2 transition-all ${
                        earned
                          ? "border-lavender bg-card shadow-sm"
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

          {/* ── Announcements / News ── */}
          <section>
            <SectionHeader title="공지사항" />
            <div className="rounded-3xl bg-card border border-border p-4 shadow-sm space-y-2">
              {newsItems.map((n) => (
                <div key={n.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card shrink-0">
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
      </div>
    </ErrorBoundary>
  );
};

/* ─── Helpers ─── */
function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {linkLabel && linkTo && <Link to={linkTo} className="text-xs font-medium text-coral hover:underline">{linkLabel}</Link>}
    </div>
  );
}

function EmptyState({ icon: Icon, message, linkTo, linkLabel }: { icon: any; message: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/30" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link to={linkTo} className="mt-1 inline-block text-xs font-semibold text-coral hover:underline">{linkLabel}</Link>
    </div>
  );
}

export default Dashboard;
