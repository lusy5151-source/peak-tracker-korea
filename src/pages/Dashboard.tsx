import { useStore } from "@/context/StoreContext";
import { mountains, baekduMountains } from "@/data/mountains";
import { badges } from "@/data/badges";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/contexts/AuthContext";
import { useGearStore } from "@/hooks/useGearStore";
import { useAchievementStore } from "@/hooks/useAchievementStore";
import { useSharedCompletionCounts } from "@/hooks/useSharedCompletionCounts";
import { useHikingPlans } from "@/hooks/useHikingPlans";
import { useHikingJournals, HikingJournal } from "@/hooks/useHikingJournals";
import { useChallenges, Challenge, UserChallenge } from "@/hooks/useChallenges";
import { useSharedCompletions, type SharedCompletion } from "@/hooks/useSharedCompletions";
import { useLiveSummitFeed } from "@/hooks/useLiveSummitFeed";
import { SharedCompletionCard } from "@/components/SharedCompletionCard";
import AchievementModal from "@/components/AchievementModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StackedAvatars } from "@/components/StackedAvatars";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MountainMascot from "@/components/MountainMascot";
import {
  Mountain, Plus, Calendar, ChevronRight,
  Sun, Cloud, CloudRain, CloudSnow, CloudSun,
  Target, BookOpen, Heart, Search,
  MessageCircle, Newspaper, Clock, Settings2,
  Users, Flag, Crown, Flame,
} from "lucide-react";
import { AnnouncementSection } from "@/components/AnnouncementSystem";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const conditionIcons: Record<string, any> = {
  "맑음": Sun, "구름": CloudSun, "흐림": Cloud, "비": CloudRain, "눈": CloudSnow,
};

const GOAL_KEY = "wandeng-user-goal";

const Dashboard = () => {
  const { records, completedCount, isCompleted } = useStore();
  const { items: gearItems } = useGearStore();
  const sharedCompletions = useSharedCompletionCounts();
  const { earnedBadges, isEarned, newlyEarned, dismissNewBadge, earnedCount, totalBadges } =
    useAchievementStore(records, gearItems, sharedCompletions);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans } = useHikingPlans();
  const { fetchFeed } = useHikingJournals();
  const { fetchAllChallenges, fetchUserChallenges } = useChallenges();
  const { fetchSharedCompletions } = useSharedCompletions();
  const { claims: liveClaims, kingOfDay, loading: liveFeedLoading } = useLiveSummitFeed();
  const [recentJournals, setRecentJournals] = useState<HikingJournal[]>([]);
  const [recentSharedCompletions, setRecentSharedCompletions] = useState<SharedCompletion[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<(UserChallenge & { ch: Challenge })[]>([]);
  const [userGoal, setUserGoal] = useState<number>(() => {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? parseInt(saved) : 100;
  });
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  const baekduCount = baekduMountains.length;
  const baekduCompleted = baekduMountains.filter((m) => isCompleted(m.id)).length;
  const goalPercent = Math.min(Math.round((completedCount / userGoal) * 100), 100);

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

  const challengeProgress = useMemo(() => {
    if (activeChallenges.length === 0) return 0;
    const totalPct = activeChallenges.reduce((sum, ac) => {
      return sum + Math.min((ac.progress / ac.ch.goal_value) * 100, 100);
    }, 0);
    return Math.round(totalPct / activeChallenges.length);
  }, [activeChallenges]);

  useEffect(() => {
    if (user) {
      fetchFeed()
        .then((journals) => setRecentJournals(journals.slice(0, 3)))
        .catch(() => setRecentJournals([]));
      fetchSharedCompletions()
        .then((scs) => setRecentSharedCompletions(scs.slice(0, 3)))
        .catch(() => setRecentSharedCompletions([]));
      Promise.all([fetchAllChallenges(), fetchUserChallenges()])
        .then(([all, mine]) => {
          const active = mine
            .filter((uc) => !uc.completed)
            .slice(0, 3)
            .map((uc) => ({ ...uc, ch: all.find((c) => c.id === uc.challenge_id)! }))
            .filter((uc) => uc.ch);
          setActiveChallenges(active);
        })
        .catch(() => setActiveChallenges([]));
    }
  }, [user]);

  const handleGoalSave = (val: number) => {
    const clamped = Math.max(1, Math.min(val, 200));
    setUserGoal(clamped);
    localStorage.setItem(GOAL_KEY, String(clamped));
    setShowGoalEdit(false);
  };

  const CondIcon = conditionIcons[weather.condition] || Cloud;
  const todayIndex = new Date().getDate() % mountains.length;
  const todayMountain = mountains[todayIndex];

  return (
    <ErrorBoundary fallbackMessage="대시보드를 불러오는 중 문제가 발생했습니다">
      <div className="-mx-4 -mt-6 pb-24">
        <AchievementModal badge={newlyEarned} onDismiss={dismissNewBadge} />

        {/* ── Hero: Mountain illustration + Upcoming Hike ── */}
        <section className="relative overflow-hidden px-5 pb-8 pt-6" style={{ background: "hsl(205, 50%, 88%)" }}>
          {/* Playful mountain shapes */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 400 140" className="w-full" preserveAspectRatio="none">
              <path d="M0 140 L0 90 Q60 25 120 65 Q180 105 240 45 Q300 5 360 55 Q380 80 400 50 L400 140 Z" fill="hsl(var(--nature-200))" opacity="0.4" />
              <path d="M0 140 L0 105 Q80 50 160 80 Q240 110 320 70 Q360 45 400 75 L400 140 Z" fill="hsl(var(--nature-100))" opacity="0.6" />
            </svg>
          </div>


          <div className="relative z-10">
            <div className="mb-5">
              <h1 className="text-xl font-bold text-foreground">완등</h1>
              <p className="text-xs text-muted-foreground mt-0.5">오늘도 한 걸음 더 🏔️</p>
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
                    <div className="flex items-center gap-1.5 rounded-xl bg-accent/60 px-3 py-2">
                      <CondIcon className="h-5 w-5 text-sky-600" />
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
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> 계획 만들기
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="space-y-5 px-5 pt-5">

          {/* ── 완등 MAGAZINE Banner ── */}
          <section>
            <Link to="/magazine">
              <div className="relative rounded-3xl p-5 shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]" style={{ background: "hsl(var(--magazine))" }}>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                  <Newspaper className="h-16 w-16 text-white/20" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-lg font-bold text-white">완등 MAGAZINE</h2>
                  <p className="text-xs mt-1 text-white/80">등산 정보 · 코스 · 장비 · 안전 팁</p>
                </div>
              </div>
            </Link>
          </section>

          {/* ── CTA Buttons (side by side) ── */}
          <section className="grid grid-cols-2 gap-3">
            <Link to="/summit-claim">
              <Button className="w-full h-14 rounded-2xl text-sm font-bold gap-2 shadow-lg bg-primary hover:bg-primary/90 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]">
                <Flag className="h-5 w-5" />
                정상 인증하기
              </Button>
            </Link>
            <Link to="/records">
              <Button variant="outline" className="w-full h-14 rounded-2xl text-sm font-bold gap-2 shadow-lg border-2 border-coral text-coral hover:bg-coral/10 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]">
                <Plus className="h-5 w-5" />
                등산 기록 추가
              </Button>
            </Link>
          </section>

          {/* ── Live Summit Claim Feed ── */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-coral" />
              <h2 className="text-base font-bold text-foreground">실시간 정상 정복</h2>
            </div>
            <div className="rounded-3xl bg-card border border-border p-4 shadow-sm space-y-3">
              {liveFeedLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">불러오는 중...</div>
              ) : liveClaims.length === 0 ? (
                <div className="py-6 text-center">
                  <Mountain className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">아직 정복 기록이 없습니다</p>
                  <p className="text-xs text-muted-foreground mt-1">첫 번째 정복자가 되어보세요!</p>
                </div>
              ) : (
                liveClaims.slice(0, 5).map((claim) => {
                  const mt = mountains.find((m) => m.id === claim.mountain_id);
                  const timeAgo = getTimeAgo(claim.claimed_at);
                  return (
                    <div key={claim.id} className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3">
                      <Link to={`/profile/${claim.user_id}`} className="shrink-0">
                        <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                          {claim.avatar_url && <AvatarImage src={claim.avatar_url} />}
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {(claim.nickname || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🏔</span>
                          <span className="text-sm font-semibold text-foreground truncate">
                            {claim.summit_name}
                          </span>
                          {mt && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              ({mt.nameKo})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Link
                            to={`/profile/${claim.user_id}`}
                            className="text-xs text-primary hover:underline font-medium truncate"
                          >
                            {claim.nickname || "등산러"}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">· {timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {liveClaims.length > 5 && (
                <Link to="/leaderboard" className="block text-center text-xs font-medium text-coral hover:underline pt-1">
                  전체 보기 →
                </Link>
              )}
            </div>
          </section>

          {/* ── Mountain King of the Day ── */}
          {kingOfDay && (
            <section>
              <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-800/30 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-bold text-foreground">오늘의 산왕</h2>
                </div>
                <Link to={`/profile/${kingOfDay.user_id}`} className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-amber-300 hover:ring-amber-400 transition-all">
                    {kingOfDay.avatar_url && <AvatarImage src={kingOfDay.avatar_url} />}
                    <AvatarFallback className="text-lg bg-amber-100 text-amber-700">
                      {(kingOfDay.nickname || "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-bold text-foreground">{kingOfDay.nickname || "등산러"}</p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                      오늘 {kingOfDay.claim_count}개 정상 정복 👑
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* ── Progress Rings Section ── */}
          <section className="grid grid-cols-2 gap-4">
            {/* 100대 명산 완등 Progress - clickable */}
            <Link to="/mountains" className="block rounded-3xl bg-card p-5 shadow-sm border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground">100대 명산 진행률</p>
                <button onClick={(e) => { e.preventDefault(); setShowGoalEdit(!showGoalEdit); }} className="text-muted-foreground hover:text-primary">
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
            </Link>

            {/* 정상 점령 챌린지 Progress */}
            <div className="rounded-3xl bg-card p-5 shadow-sm border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3">정상 점령 챌린지</p>
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nature-50 shrink-0">
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

          {/* ── Shared Completion Link ── */}
          <section>
            <Link
              to="/shared-completions"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-nature-50 px-4 py-4 transition-colors hover:bg-primary/10"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-bold text-primary">공동 완등 기록</span>
            </Link>
          </section>

          {/* ── Recent Shared Completions ── */}
          {user && recentSharedCompletions.length > 0 && (
            <section>
              <SectionHeader title="최근 공동 완등" linkTo="/shared-completions" linkLabel="전체 보기" />
              <div className="space-y-3">
                {recentSharedCompletions.map((sc) => (
                  <SharedCompletionCard key={sc.id} completion={sc} />
                ))}
              </div>
            </section>
          )}

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
                          <img src={j.photos[0]} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" loading="lazy" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-nature-50 shrink-0">
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
            <div className="rounded-3xl bg-purple-light border border-border p-5 shadow-sm">
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
            <SectionHeader title="공지 · 산악정보" />
            <div className="rounded-3xl bg-card border border-border p-4 shadow-sm">
              <AnnouncementSection />
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
      {linkLabel && linkTo && <Link to={linkTo} className="text-xs font-medium text-primary hover:underline">{linkLabel}</Link>}
    </div>
  );
}

function EmptyState({ icon: Icon, message, linkTo, linkLabel }: { icon: any; message: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/30" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Link to={linkTo} className="mt-1 inline-block text-xs font-semibold text-primary hover:underline">{linkLabel}</Link>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default Dashboard;
