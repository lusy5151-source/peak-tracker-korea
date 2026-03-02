import { useParams, Link } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import {
  ArrowLeft, Mountain, MapPin, TrendingUp, CheckCircle2, Circle, Calendar,
  Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudSun, ImagePlus, X, Users,
  Clock, Route, Flag, Save, UserPlus, UserMinus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { WeatherCondition, CompletionRecord } from "@/hooks/useMountainStore";
import { WeatherCard } from "@/components/WeatherCard";
import { TrailInfoSection } from "@/components/TrailInfo";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const weatherOptions: { value: WeatherCondition; label: string; icon: any }[] = [
  { value: "맑음", label: "맑음", icon: Sun },
  { value: "구름", label: "구름 조금", icon: CloudSun },
  { value: "흐림", label: "흐림", icon: Cloud },
  { value: "비", label: "비", icon: CloudRain },
  { value: "눈", label: "눈", icon: CloudSnow },
  { value: "안개", label: "안개", icon: CloudFog },
];

const difficultyOptions = [
  { value: "쉬움", label: "쉬움", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "보통", label: "보통", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "어려움", label: "어려움", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

function resizeImage(file: File, maxSize = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const MountainDetail = () => {
  const { id } = useParams<{ id: string }>();
  const mountain = mountains.find((m) => m.id === Number(id));
  const {
    isCompleted, toggleComplete, getRecord, updateNotes, updateDate,
    updateWeather, addPhotos, removePhoto, updateTaggedFriends,
    updateCourseInfo, updateDuration, updateDifficulty,
  } = useStore();

  if (!mountain) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">산을 찾을 수 없습니다</p>
        <Link to="/mountains" className="mt-2 inline-block text-sm text-primary hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const completed = isCompleted(mountain.id);
  const record = getRecord(mountain.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/mountains" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        산 목록
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{mountain.nameKo}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{mountain.name}</p>
          </div>
          <button
            onClick={() => toggleComplete(mountain.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              completed
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
            {completed ? "완등" : "미등"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InfoItem icon={Mountain} label="높이" value={`${mountain.height}m`} />
          <InfoItem icon={MapPin} label="지역" value={mountain.region} />
          <InfoItem icon={TrendingUp} label="난이도" value={mountain.difficulty} />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{mountain.description}</p>
      </div>

      {/* Trail info */}
      <TrailInfoSection mountainId={mountain.id} fallbackTrails={mountain.trails} />

      {/* Weather & outfit */}
      <WeatherCard mountainId={mountain.id} />

      {/* Hiking Journal */}
      {completed && record && (
        <JournalSection
          record={record}
          mountainId={mountain.id}
          mountainName={mountain.nameKo}
          mountainTrails={mountain.trails}
          updateNotes={updateNotes}
          updateDate={updateDate}
          updateWeather={updateWeather}
          addPhotos={addPhotos}
          removePhoto={removePhoto}
          updateTaggedFriends={updateTaggedFriends}
          updateCourseInfo={updateCourseInfo}
          updateDuration={updateDuration}
          updateDifficulty={updateDifficulty}
        />
      )}
    </div>
  );
};

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function JournalSection({
  record,
  mountainId,
  mountainName,
  mountainTrails,
  updateNotes,
  updateDate,
  updateWeather,
  addPhotos,
  removePhoto,
  updateTaggedFriends,
  updateCourseInfo,
  updateDuration,
  updateDifficulty,
}: {
  record: CompletionRecord;
  mountainId: number;
  mountainName: string;
  mountainTrails?: { name: string; distance: string; duration: string; startingPoint: string }[];
  updateNotes: (id: number, notes: string) => void;
  updateDate: (id: number, date: string) => void;
  updateWeather: (id: number, weather: WeatherCondition) => void;
  addPhotos: (id: number, photos: string[]) => void;
  removePhoto: (id: number, index: number) => void;
  updateTaggedFriends: (id: number, friends: string[]) => void;
  updateCourseInfo: (id: number, course: { courseName?: string; courseStartingPoint?: string; courseNotes?: string }) => void;
  updateDuration: (id: number, duration: string) => void;
  updateDifficulty: (id: number, difficulty: string) => void;
}) {
  const { user } = useAuth();
  const { friends } = useFriends();
  const { toast } = useToast();

  const [notes, setNotes] = useState(record.notes);
  const [date, setDate] = useState(record.completedAt.slice(0, 10));
  const [courseName, setCourseName] = useState(record.courseName || "");
  const [courseStartingPoint, setCourseStartingPoint] = useState(record.courseStartingPoint || "");
  const [courseNotes, setCourseNotes] = useState(record.courseNotes || "");
  const [duration, setDuration] = useState(record.duration || "");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [friendProfiles, setFriendProfiles] = useState<Map<string, { nickname: string | null; avatar_url: string | null }>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photos = record.photos || [];
  const taggedFriends = record.taggedFriends || [];

  useEffect(() => {
    setNotes(record.notes);
    setDate(record.completedAt.slice(0, 10));
    setCourseName(record.courseName || "");
    setCourseStartingPoint(record.courseStartingPoint || "");
    setCourseNotes(record.courseNotes || "");
    setDuration(record.duration || "");
  }, [record]);

  // Load profiles for tagged friends
  useEffect(() => {
    if (taggedFriends.length === 0) return;
    supabase
      .from("profiles")
      .select("user_id, nickname, avatar_url")
      .in("user_id", taggedFriends)
      .then(({ data }) => {
        if (data) {
          setFriendProfiles(new Map(data.map((p) => [p.user_id, p])));
        }
      });
  }, [taggedFriends]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const resized = await Promise.all(files.map((f) => resizeImage(f)));
    addPhotos(mountainId, resized);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTagFriend = async (friendUserId: string) => {
    const newTagged = [...taggedFriends, friendUserId];
    updateTaggedFriends(mountainId, newTagged);

    // Notify tagged friend
    if (user) {
      await supabase.from("plan_notifications").insert({
        user_id: friendUserId,
        plan_id: "00000000-0000-0000-0000-000000000000", // placeholder since no plan
        type: "tag",
        message: `${mountainName} 등산 일지에 함께한 친구로 태그되었습니다 🏔️`,
      } as any);
    }

    toast({ title: "친구를 태그했습니다" });
  };

  const handleUntagFriend = (friendUserId: string) => {
    updateTaggedFriends(mountainId, taggedFriends.filter((id) => id !== friendUserId));
  };

  const handleSelectTrail = (trail: { name: string; startingPoint: string }) => {
    setCourseName(trail.name);
    setCourseStartingPoint(trail.startingPoint);
    updateCourseInfo(mountainId, { courseName: trail.name, courseStartingPoint: trail.startingPoint });
  };

  const handleSave = () => {
    updateNotes(mountainId, notes);
    updateCourseInfo(mountainId, { courseName, courseStartingPoint, courseNotes });
    updateDuration(mountainId, duration);
    toast({ title: "일지가 저장되었습니다 ✅" });
  };

  const untaggedFriends = friends.filter(
    (f) => !taggedFriends.includes(f.friendProfile.user_id)
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">등산 일지</h2>
            <p className="text-xs text-muted-foreground">{mountainName}에서의 기억</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="h-3.5 w-3.5" /> 저장
        </Button>
      </div>

      {/* Date */}
      <div>
        <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          방문 날짜
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            updateDate(mountainId, e.target.value);
          }}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Course Info */}
      <div className="space-y-3">
        <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Route className="h-3.5 w-3.5" />
          등산 코스
        </label>

        {/* Quick select from mountain trails */}
        {mountainTrails && mountainTrails.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mountainTrails.map((trail) => (
              <button
                key={trail.name}
                onClick={() => handleSelectTrail(trail)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  courseName === trail.name
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {trail.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onBlur={() => updateCourseInfo(mountainId, { courseName })}
              placeholder="코스 이름"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <div className="relative">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={courseStartingPoint}
                onChange={(e) => setCourseStartingPoint(e.target.value)}
                onBlur={() => updateCourseInfo(mountainId, { courseStartingPoint })}
                placeholder="출발지점"
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <textarea
          rows={2}
          value={courseNotes}
          onChange={(e) => setCourseNotes(e.target.value)}
          onBlur={() => updateCourseInfo(mountainId, { courseNotes })}
          placeholder="코스 관련 메모 (선택)"
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          소요 시간
        </label>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onBlur={() => updateDuration(mountainId, duration)}
          placeholder="예: 3시간 30분"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">체감 난이도</label>
        <div className="flex gap-2">
          {difficultyOptions.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => updateDifficulty(mountainId, record.difficulty === value ? "" : value)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                record.difficulty === value
                  ? `${color} ring-1 ring-current/20`
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">날씨</label>
        <div className="flex flex-wrap gap-2">
          {weatherOptions.map(({ value, label, icon: Icon }) => {
            const selected = record.weather === value;
            return (
              <button
                key={value}
                onClick={() => updateWeather(mountainId, selected ? "" : value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tagged Friends */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            함께한 친구
          </label>
          {user && friends.length > 0 && (
            <button
              onClick={() => setShowFriendPicker(!showFriendPicker)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <UserPlus className="h-3 w-3" /> 태그하기
            </button>
          )}
        </div>

        {taggedFriends.length > 0 && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 mb-2">
            <p className="text-xs text-primary font-medium mb-2">
              🤝 {mountainName}을 함께 완등했습니다
            </p>
            <div className="flex flex-wrap gap-2">
              {taggedFriends.map((fId) => {
                const profile = friendProfiles.get(fId);
                return (
                  <div key={fId} className="flex items-center gap-1.5 rounded-lg bg-card border border-border px-2.5 py-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-[8px]">{profile?.nickname?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground">{profile?.nickname || "친구"}</span>
                    <button
                      onClick={() => handleUntagFriend(fId)}
                      className="text-muted-foreground hover:text-destructive ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showFriendPicker && (
          <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
            {untaggedFriends.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">태그할 수 있는 친구가 없습니다</p>
            ) : (
              untaggedFriends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleTagFriend(f.friendProfile.user_id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/60 transition-colors"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={f.friendProfile.avatar_url || ""} />
                    <AvatarFallback className="text-[9px]">{f.friendProfile.nickname?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm text-foreground text-left">{f.friendProfile.nickname}</span>
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                </button>
              ))
            )}
          </div>
        )}

        {!user && taggedFriends.length === 0 && (
          <p className="text-xs text-muted-foreground">로그인하면 함께한 친구를 태그할 수 있습니다</p>
        )}
      </div>

      {/* Photos */}
      <div>
        <label className="mb-2 block text-xs font-medium text-muted-foreground">사진</label>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <img
                src={src}
                alt={`등산 사진 ${i + 1}`}
                className="h-full w-full object-cover cursor-pointer transition-transform hover:scale-105"
                onClick={() => setLightboxIndex(i)}
              />
              <button
                onClick={() => removePhoto(mountainId, i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">추가</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Diary Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          오늘의 산행 일지
        </label>
        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => updateNotes(mountainId, notes)}
          placeholder={`${mountainName}에서의 하루를 기록해보세요.\n\n어떤 코스로 올랐나요? 정상에서 본 풍경은 어떠했나요?\n함께한 사람, 느꼈던 감정, 기억하고 싶은 순간들을 자유롭게 적어주세요...`}
          className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Save Button (bottom) */}
      <Button onClick={handleSave} className="w-full gap-2">
        <Save className="h-4 w-4" /> 일지 저장하기
      </Button>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/20 text-background"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={photos[lightboxIndex]}
            alt="사진 확대"
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default MountainDetail;
