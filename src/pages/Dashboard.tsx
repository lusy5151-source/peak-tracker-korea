import { useStore } from "@/context/StoreContext";
import { mountains } from "@/data/mountains";
import { getMockWeather, getOutfitRecommendations } from "@/data/mockWeather";
import { mockFriends } from "@/data/mockFriends";
import { useGearStore } from "@/hooks/useGearStore";
import { useAchievementStore } from "@/hooks/useAchievementStore";
import AchievementModal from "@/components/AchievementModal";
import {
  Mountain, Plus, Calendar, MapPin, Wind, Droplets,
  ChevronRight, Shirt, Users, Route, Sun, Cloud, CloudRain, CloudSnow, CloudSun,
  ArrowRight, Thermometer, Search, Trophy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const conditionIcons: Record<string, any> = {
  "맑음": Sun, "구름": CloudSun, "흐림": Cloud, "비": CloudRain, "눈": CloudSnow,
};

const Dashboard = () => {
  const { records, completedCount, isCompleted } = useStore();
  const { items: gearItems } = useGearStore();
  const navigate = useNavigate();

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

  const recommendedRoutes = useMemo(() => {
    return mountains.filter((m) => m.trails && m.trails.length > 0).slice(0, 4);
  }, []);

  // Search
  const [search, setSearch] = useState("");
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return mountains.filter((m) =>
      m.nameKo.includes(q) || m.name.toLowerCase().includes(q) || m.region.includes(q)
    ).slice(0, 6);
  }, [search]);

  return (
    <div className="space-y-6 pb-24">
      {/* ── Hero: Map (left) + Search & Today's Mountain (right) ── */}
      <section className="grid gap-4 lg:grid-cols-5">
        {/* Map */}
        <div className="lg:col-span-3 rounded-2xl border border-border overflow-hidden shadow-sm bg-card min-h-[320px] lg:min-h-[400px]">
          <MiniMap isCompleted={isCompleted} onMarkerClick={(id) => navigate(`/mountains/${id}`)} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="산 이름, 지역으로 검색..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                {searchResults.map((m) => (
                  <Link
                    key={m.id}
                    to={`/mountains/${m.id}`}
                    onClick={() => setSearch("")}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
                  >
                    <Mountain className="h-4 w-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{m.nameKo}</p>
                      <p className="text-[10px] text-muted-foreground">{m.region} · {m.height}m · {m.difficulty}</p>
                    </div>
                    {isCompleted(m.id) && (
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">완등</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Today's Mountain & Weather */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <p className="text-[10px] font-medium uppercase tracking-wider text-sky-500">오늘의 산</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">{featuredMountain.nameKo}</h2>
            <p className="text-xs text-muted-foreground">{featuredMountain.region} · {featuredMountain.height}m · {featuredMountain.difficulty}</p>

            <div className="mt-4 flex items-center gap-3">
              <CondIcon className="h-9 w-9 text-sky-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{weather.temp}°</p>
                <p className="text-[10px] text-muted-foreground">체감 {weather.feelsLike}°C</p>
              </div>
              <div className="ml-auto grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weather.windSpeed}km/h</span>
                <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {weather.precipChance}%</span>
                <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> 습도 {weather.humidity}%</span>
              </div>
            </div>

            {/* Outfit rec */}
            <div className="mt-4 rounded-xl bg-accent/40 p-3">
              <p className="text-[10px] font-medium text-accent-foreground/70 mb-1">🧥 복장 추천</p>
              <p className="text-xs text-foreground leading-relaxed">
                {outfitRecs.slice(0, 3).map((r) => r.item).join(" · ")}
              </p>
            </div>

            <Link
              to={`/mountains/${featuredMountain.id}`}
              className="mt-auto pt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              상세 보기 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Add Hiking Record CTA */}
      <Link
        to="/mountains"
        className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-sky-500 px-6 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
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
                <Route className="h-4 w-4 text-sky-500" />
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
            <div className="mt-3 rounded-lg bg-accent/30 p-3">
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

/* ─── Mini Map ─── */

function MiniMap({ isCompleted, onMarkerClick }: { isCompleted: (id: number) => boolean; onMarkerClick: (id: number) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [36.0, 127.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    mountains.forEach((m) => {
      const completed = isCompleted(m.id);
      const color = completed ? "hsl(160, 40%, 40%)" : "hsl(200, 30%, 70%)";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 10px; height: 10px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindTooltip(
        `<strong>${m.nameKo}</strong><br/>${m.height}m${completed ? " ✓" : ""}`,
        { direction: "top", offset: [0, -6] }
      );
      marker.on("click", () => onMarkerClick(m.id));
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isCompleted, onMarkerClick]);

  return <div ref={mapRef} className="h-full w-full min-h-[320px]" />;
}

/* ─── Helpers ─── */

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
