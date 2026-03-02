import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useGearStore } from "@/hooks/useGearStore";
import { useAchievementStore } from "@/hooks/useAchievementStore";
import { useProfile } from "@/hooks/useProfile";
import { useHikingJournals, type HikingJournal } from "@/hooks/useHikingJournals";
import { useFriends } from "@/hooks/useFriends";
import { badges, BadgeCategory } from "@/data/badges";
import { mountains, regions } from "@/data/mountains";
import { JournalCard, JournalGridCard } from "@/components/JournalCard";
import { Link } from "react-router-dom";
import {
  User, Trophy, Mountain, ChevronRight, Star, Camera, MapPin,
  Settings, LogOut, Shield, Edit3, BookOpen, Users, Heart,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const HIKING_STYLES = [
  { id: "solo", label: "솔로 등산", emoji: "🧍" },
  { id: "trekking", label: "트레킹", emoji: "🥾" },
  { id: "photography", label: "사진촬영", emoji: "📸" },
  { id: "summit", label: "정상 도전", emoji: "⛰️" },
  { id: "healing", label: "힐링 하이킹", emoji: "🌿" },
];

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { records, completedCount } = useStore();
  const { items: gearItems } = useGearStore();
  const { earnedBadges, earnedCount, totalBadges, featuredBadge, setFeatured, featuredBadgeId } =
    useAchievementStore(records, gearItems);
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { fetchMyJournals } = useHikingJournals();
  const { friends } = useFriends();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [journals, setJournals] = useState<HikingJournal[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<HikingJournal | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "stats">("posts");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const percentage = Math.round((completedCount / mountains.length) * 100);

  useEffect(() => {
    if (user) {
      fetchMyJournals().then(setJournals);
    }
  }, [user]);

  // Shared hikes count (journals with tagged friends)
  const sharedHikesCount = useMemo(
    () => journals.filter((j) => j.tagged_friends && j.tagged_friends.length > 0).length,
    [journals]
  );

  // Recent tagged friends
  const recentTaggedFriends = useMemo(() => {
    const allFriendIds = journals
      .flatMap((j) => j.tagged_friends || [])
      .filter(Boolean);
    return [...new Set(allFriendIds)].slice(0, 6);
  }, [journals]);

  const [taggedProfiles, setTaggedProfiles] = useState<Map<string, { nickname: string | null; avatar_url: string | null }>>(new Map());
  useEffect(() => {
    if (recentTaggedFriends.length === 0) return;
    supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", recentTaggedFriends)
      .then(({ data }) => {
        if (data) setTaggedProfiles(new Map(data.map((p) => [p.user_id, p])));
      });
  }, [recentTaggedFriends]);

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

  const recentBadge = useMemo(() => {
    if (earnedBadges.length === 0) return null;
    return [...earnedBadges].sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    )[0];
  }, [earnedBadges]);

  const startEditing = () => {
    setNickname(profile?.nickname || "");
    setBio(profile?.bio || "");
    setLocation(profile?.location || "");
    setSelectedStyles(profile?.hiking_styles || []);
    setEditing(true);
  };

  const saveProfile = async () => {
    await updateProfile({ nickname, bio, location, hiking_styles: selectedStyles });
    setEditing(false);
    toast({ title: "프로필이 저장되었습니다" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
    toast({ title: "프로필 사진이 업데이트되었습니다" });
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-5 pb-24">
      {/* Profile header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center relative">
        <button
          onClick={editing ? saveProfile : startEditing}
          className="absolute top-4 right-4 rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          {editing ? <span className="text-xs font-medium text-primary">저장</span> : <Edit3 className="h-4 w-4" />}
        </button>

        <div className="relative mx-auto mb-3 h-20 w-20">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="프로필"
              className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <User className="h-9 w-9 text-primary" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm"
          >
            <Camera className="h-3 w-3" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        {editing ? (
          <div className="space-y-3 mt-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="지역 (선택)"
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">등산 스타일</p>
              <div className="flex flex-wrap justify-center gap-2">
                {HIKING_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleStyle(s.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedStyles.includes(s.id)
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {s.emoji} {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold text-foreground">
              {profile?.nickname || user.email?.split("@")[0]}
            </h1>
            {profile?.bio && <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>}
            {profile?.location && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {profile.location}
              </p>
            )}
            {profile?.hiking_styles && profile.hiking_styles.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {profile.hiking_styles.map((id) => {
                  const style = HIKING_STYLES.find((s) => s.id === id);
                  return style ? (
                    <span key={id} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
                      {style.emoji} {style.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {featuredBadge && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                <span className="text-base">{featuredBadge.icon}</span>
                <span className="text-xs font-medium text-primary">{featuredBadge.name}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Summary - 4 stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">{journals.length}</p>
          <p className="text-[9px] text-muted-foreground">등산 일지</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-primary">{completedCount}</p>
          <p className="text-[9px] text-muted-foreground">완등</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">{sharedHikesCount}</p>
          <p className="text-[9px] text-muted-foreground">함께한 등산</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">{percentage}%</p>
          <p className="text-[9px] text-muted-foreground">진행률</p>
        </div>
      </div>

      {/* Recent tagged friends */}
      {recentTaggedFriends.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> 최근 함께한 친구
          </p>
          <div className="flex gap-3">
            {recentTaggedFriends.map((fId) => {
              const p = taggedProfiles.get(fId);
              return (
                <div key={fId} className="flex flex-col items-center gap-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={p?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">{p?.nickname?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="text-[9px] text-foreground font-medium truncate w-12 text-center">
                    {p?.nickname || "친구"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors",
            activeTab === "posts" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" /> 등산 일지
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors",
            activeTab === "stats" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="h-3.5 w-3.5" /> 통계 & 업적
        </button>
      </div>

      {/* Posts tab */}
      {activeTab === "posts" && (
        <section>
          {journals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">아직 게시된 일지가 없습니다</p>
              <p className="text-xs text-muted-foreground/70 mt-1">산 상세 페이지에서 일지를 작성하고 게시해보세요</p>
            </div>
          ) : selectedJournal ? (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedJournal(null)}
                className="text-xs text-primary hover:underline"
              >
                ← 목록으로
              </button>
              <JournalCard journal={selectedJournal} showAuthor={false} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {journals.map((j) => (
                <JournalGridCard key={j.id} journal={j} onClick={() => setSelectedJournal(j)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Stats tab */}
      {activeTab === "stats" && (
        <section className="space-y-5">
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
        </section>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Link
          to="/feed"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/50"
        >
          <Heart className="h-4 w-4 text-primary" />
          친구 피드 보기
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/achievements"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/50"
        >
          <Trophy className="h-4 w-4 text-primary" />
          전체 업적 보기
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-destructive shadow-sm transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
