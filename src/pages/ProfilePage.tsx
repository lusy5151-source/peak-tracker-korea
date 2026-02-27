import { useStore } from "@/context/StoreContext";
import { useGearStore } from "@/hooks/useGearStore";
import { useAchievementStore } from "@/hooks/useAchievementStore";
import { badges, badgeCategories, BadgeCategory } from "@/data/badges";
import { mountains, regions } from "@/data/mountains";
import { Link } from "react-router-dom";
import { User, Trophy, Mountain, ChevronRight, Star } from "lucide-react";
import { useMemo } from "react";

const ProfilePage = () => {
  const { records, completedCount } = useStore();
  const { items: gearItems } = useGearStore();
  const { earnedBadges, earnedCount, totalBadges, featuredBadge, setFeatured, featuredBadgeId } =
    useAchievementStore(records, gearItems);

  const percentage = Math.round((completedCount / mountains.length) * 100);

  // Region progress
  const regionProgress = useMemo(() => {
    return regions.map((region) => {
      const total = mountains.filter((m) => m.region === region).length;
      const completed = records.filter((r) => {
        const m = mountains.find((mt) => mt.id === r.mountainId);
        return m && m.region === region;
      }).length;
      return { region, total, completed };
    });
  }, [records]);

  // Most recent earned badge
  const recentBadge = useMemo(() => {
    if (earnedBadges.length === 0) return null;
    const sorted = [...earnedBadges].sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
    return sorted[0];
  }, [earnedBadges]);

  return (
    <div className="space-y-6 pb-24">
      {/* Profile header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-lg font-bold text-foreground">나의 프로필</h1>
        {featuredBadge && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="text-base">{featuredBadge.icon}</span>
            <span className="text-xs font-medium text-primary">{featuredBadge.name}</span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
          <Mountain className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{completedCount}</p>
          <p className="text-[10px] text-muted-foreground">완등</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
          <Trophy className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{earnedCount}</p>
          <p className="text-[10px] text-muted-foreground">업적</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
          <Star className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{percentage}%</p>
          <p className="text-[10px] text-muted-foreground">진행률</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">전체 진행률</h2>
          <span className="text-xs text-muted-foreground">{completedCount} / {mountains.length}</span>
        </div>
        <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Region progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-3">지역별 진행률</h2>
        <div className="space-y-3">
          {regionProgress.map(({ region, total, completed }) => (
            <div key={region}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">{region}</span>
                <span className="text-[10px] text-muted-foreground">{completed}/{total}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent achievement */}
      {recentBadge && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">최근 업적</h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl">{recentBadge.badge.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{recentBadge.badge.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(recentBadge.earnedAt).toLocaleDateString("ko-KR")} 달성
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Badge gallery */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">업적 갤러리</h2>
          <Link to="/achievements" className="text-xs text-primary hover:underline">모두 보기</Link>
        </div>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">아직 획득한 업적이 없습니다</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {earnedBadges.slice(0, 12).map((eb) => (
              <button
                key={eb.badgeId}
                onClick={() => setFeatured(featuredBadgeId === eb.badgeId ? null : eb.badgeId)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                  featuredBadgeId === eb.badgeId
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-secondary"
                }`}
              >
                <span className="text-2xl">{eb.badge.icon}</span>
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                  {eb.badge.name}
                </span>
              </button>
            ))}
          </div>
        )}
        {featuredBadgeId && (
          <p className="mt-2 text-[10px] text-primary text-center">
            ⭐ 대표 배지로 설정됨 (다시 클릭하면 해제)
          </p>
        )}
      </div>

      <Link
        to="/achievements"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/50"
      >
        <Trophy className="h-4 w-4 text-primary" />
        전체 업적 보기
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
};

export default ProfilePage;
