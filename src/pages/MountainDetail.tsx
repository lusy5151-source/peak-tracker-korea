import { useParams, Link } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useStore } from "@/context/StoreContext";
import { ArrowLeft, Mountain, MapPin, TrendingUp, CheckCircle2, Circle, Calendar, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudSun, ImagePlus, X, Users } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { WeatherCondition } from "@/hooks/useMountainStore";
import { WeatherCard } from "@/components/WeatherCard";
import { TrailInfoSection } from "@/components/TrailInfo";
import { mockFriends } from "@/data/mockFriends";

const weatherOptions: { value: WeatherCondition; label: string; icon: any }[] = [
  { value: "맑음", label: "맑음", icon: Sun },
  { value: "구름", label: "구름 조금", icon: CloudSun },
  { value: "흐림", label: "흐림", icon: Cloud },
  { value: "비", label: "비", icon: CloudRain },
  { value: "눈", label: "눈", icon: CloudSnow },
  { value: "안개", label: "안개", icon: CloudFog },
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
  const { isCompleted, toggleComplete, getRecord, updateNotes, updateDate, updateWeather, addPhotos, removePhoto } = useStore();

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
          updateNotes={updateNotes}
          updateDate={updateDate}
          updateWeather={updateWeather}
          addPhotos={addPhotos}
          removePhoto={removePhoto}
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
  updateNotes,
  updateDate,
  updateWeather,
  addPhotos,
  removePhoto,
}: {
  record: { completedAt: string; notes: string; weather?: WeatherCondition; photos?: string[]; taggedFriends?: string[] };
  mountainId: number;
  mountainName: string;
  updateNotes: (id: number, notes: string) => void;
  updateDate: (id: number, date: string) => void;
  updateWeather: (id: number, weather: WeatherCondition) => void;
  addPhotos: (id: number, photos: string[]) => void;
  removePhoto: (id: number, index: number) => void;
}) {
  const [notes, setNotes] = useState(record.notes);
  const [date, setDate] = useState(record.completedAt.slice(0, 10));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photos = record.photos || [];
  const taggedFriends = record.taggedFriends || [];

  useEffect(() => {
    setNotes(record.notes);
    setDate(record.completedAt.slice(0, 10));
  }, [record]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const resized = await Promise.all(files.map((f) => resizeImage(f)));
    addPhotos(mountainId, resized);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">등산 일지</h2>
          <p className="text-xs text-muted-foreground">{mountainName}에서의 기억</p>
        </div>
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

      {/* Tagged friends */}
      {taggedFriends.length > 0 && (
        <div>
          <label className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            함께한 친구
          </label>
          <div className="flex flex-wrap gap-2">
            {taggedFriends.map((fId) => {
              const friend = mockFriends.find((f) => f.id === fId);
              return friend ? (
                <span key={fId} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {friend.avatar} {friend.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

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
