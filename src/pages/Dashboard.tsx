import { useStore } from "@/context/StoreContext";
import { mountains } from "@/data/mountains";
import { getMockWeather, getOutfitRecommendations } from "@/data/mockWeather";
import { mockFriends } from "@/data/mockFriends";
import { useGearStore } from "@/hooks/useGearStore";
import {
  Mountain, Plus, Calendar, MapPin, CloudSun, Wind, Droplets,
  ChevronRight, Shirt, Users, Route, Sun, Cloud, CloudRain, CloudSnow,
  TrendingUp, ArrowRight, Thermometer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const conditionIcons: Record<string, any> = {
  "맑음": Sun, "구름": CloudSun, "흐림": Cloud, "비": CloudRain, "눈": CloudSnow,
};

const Dashboard = () => {
  const { records, completedCount, isCompleted } = useStore();
  const { items: gearItems } = useGearStore();

  // Pick a featured mountain (first uncompleted with trails, or first with trails)
  const featuredMountain = useMemo(() => {
    return mountains.find((m) => m.trails?.length && !isCompleted(m.id))
      || mountains.find((m) => m.trails?.length)
      || mountains[0];
  }, [isCompleted]);

  const weather = getMockWeather(featuredMountain.id);
  const outfitRecs = getOutfitRecommendations(weather);
  const CondIcon = conditionIcons[weather.condition] || Cloud;

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 4)
      .map((r) => ({ ...r, mountain: mountains.find((m) => m.id === r.mountainId)! }))
      .filter((r) => r.mountain);
  }, [records]);

  // Recommended routes (mountains with trail data)
  const recommendedRoutes = useMemo(() => {
    return mountains
      .filter((m) => m.trails && m.trails.length > 0)
      .slice(0, 4);
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Today's Mountain & Weather */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">오늘의 산</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{featuredMountain.nameKo}</h2>
            <p className="text-xs text-muted-foreground">{featuredMountain.region} · {featuredMountain.height}m</p>
          </div>
          <div className="flex items-center gap-2">
            <CondIcon className="h-8 w-8 text-primary" />
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{weather.temp}°</p>
              <p className="text-[10px] text-muted-foreground">체감 {weather.feelsLike}°</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat icon={Thermometer} label="기온" value={`${weather.temp}°C`} />
          <MiniStat icon={Wind} label="풍속" value={`${weather.windSpeed}km/h`} />
          <MiniStat icon={Droplets} label="강수" value={`${weather.precipChance}%`} />
        </div>

        {/* Quick outfit rec */}
        <div className="mt-4 rounded-xl bg-secondary/50 p-3">
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5">🧥 복장 추천</p>
          <p className="text-xs text-foreground leading-relaxed">
            {outfitRecs.slice(0, 3).map((r) => r.item).join(" · ")}
          </p>
        </div>

        <Link
          to={`/mountains/${featuredMountain.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          상세 날씨 보기 <ArrowRight className="h-3 w-3" />
        </Link>
      </section>

      {/* 2. Add Hiking Record CTA */}
      <Link
        to="/mountains"
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus className="h-5 w-5" />
        등산 기록 추가하기
      </Link>

      {/* 3. Recent Hiking Records */}
      <section>
        <SectionHeader title="최근 기록" linkTo="/records" linkLabel="모두 보기" />
        {recentRecords.length === 0 ? (
          <EmptyState icon={Mountain} message="아직 등산 기록이 없습니다" linkTo="/mountains" linkLabel="산 목록에서 시작하세요" />
        ) : (
          <div className="space-y-2.5">
            {recentRecords.map((r) => (
              <Link
                key={r.mountainId}
                to={`/mountains/${r.mountainId}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:bg-secondary/50"
              >
                {/* Photo thumbnail or icon */}
                {r.photos && r.photos.length > 0 ? (
                  <img src={r.photos[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mountain className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{r.mountain.nameKo}</p>
                    {r.weather && <span className="text-xs text-muted-foreground">{r.weather}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(r.completedAt).toLocaleDateString("ko-KR")}
                    {(r as any).taggedFriends && (r as any).taggedFriends.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {(r as any).taggedFriends.length}명
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">{r.notes}</p>}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. Map Preview */}
      <section>
        <SectionHeader title="지도" linkTo="/map" linkLabel="전체 보기" />
        <Link to="/map" className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">백대명산 지도</p>
                <p className="text-xs text-muted-foreground">
                  완등 {completedCount}개 · 미등 {100 - completedCount}개
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> 완등</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" /> 미등</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-secondary">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${completedCount}%` }} />
          </div>
        </Link>
      </section>

      {/* 5. Recommended Hiking Routes */}
      <section>
        <SectionHeader title="추천 등산 코스" linkTo="/mountains" linkLabel="더 보기" />
        <div className="grid gap-2.5 sm:grid-cols-2">
          {recommendedRoutes.map((m) => (
            <Link
              key={m.id}
              to={`/mountains/${m.id}`}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Route className="h-4 w-4 text-primary" />
                <p className="font-medium text-foreground text-sm">{m.nameKo}</p>
                <DifficultyBadge difficulty={m.difficulty} />
              </div>
              {m.trails && m.trails[0] && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>🥾 {m.trails[0].name}</p>
                  <div className="flex items-center gap-3">
                    <span>{m.trails[0].distance}</span>
                    <span>⏱ {m.trails[0].duration}</span>
                  </div>
                  <p className="text-[10px]">📍 {m.trails[0].startingPoint}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Gear & Outfit */}
      <section>
        <SectionHeader title="내 장비" linkTo="/gear" linkLabel="관리하기" />
        {gearItems.length === 0 ? (
          <EmptyState icon={Shirt} message="등록된 장비가 없습니다" linkTo="/gear" linkLabel="장비를 추가하세요" />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{gearItems.length}개 장비 등록됨</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {gearItems.slice(0, 6).map((g) => (
                <div key={g.id} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-2.5 py-1.5">
                  {g.photo ? (
                    <img src={g.photo} alt="" className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <span className="text-sm">👕</span>
                  )}
                  <span className="text-xs font-medium text-foreground">{g.name}</span>
                </div>
              ))}
              {gearItems.length > 6 && (
                <Link to="/gear" className="flex items-center rounded-lg bg-secondary/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-primary">
                  +{gearItems.length - 6}개 더
                </Link>
              )}
            </div>

            {/* Weather-based suggestion */}
            <div className="mt-3 rounded-lg bg-primary/5 p-3">
              <p className="text-[10px] font-medium text-primary mb-1">오늘 날씨에 맞는 장비</p>
              <p className="text-xs text-foreground">
                {outfitRecs.slice(0, 2).map((r) => r.item).join(", ")}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 7. Friends & Social */}
      <section>
        <SectionHeader title="친구 활동" linkTo="/social" linkLabel="전체 보기" />
        <div className="space-y-2.5">
          {mockFriends.slice(0, 3).map((friend) => {
            const recent = friend.recentMountainIds
              .map((id) => mountains.find((m) => m.id === id))
              .filter(Boolean)
              .slice(0, 2);
            return (
              <div key={friend.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-base">
                  {friend.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{friend.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mountain className="h-3 w-3" />
                    {friend.completedCount}개 완등
                    {recent.length > 0 && (
                      <span className="truncate">· 최근 {recent.map((m) => m!.nameKo).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="w-14 h-1.5 rounded-full bg-secondary shrink-0">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${friend.completedCount}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/* ─── Helper Components ─── */

function SectionHeader({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <Link to={linkTo} className="text-xs text-primary hover:underline">{linkLabel}</Link>
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

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    "쉬움": "bg-success/10 text-success",
    "보통": "bg-accent text-accent-foreground",
    "어려움": "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium ${colors[difficulty] || "bg-secondary text-secondary-foreground"}`}>
      {difficulty}
    </span>
  );
}

export default Dashboard;
