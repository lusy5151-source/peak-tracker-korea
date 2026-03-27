import { useState, useEffect } from "react";
import { mountains } from "@/data/mountains";
import { useHikingJournals, type HikingJournal } from "@/hooks/useHikingJournals";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivacySettings } from "@/hooks/usePrivacySettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mountain, Camera, X, Clock, Route, Globe, Users, Lock, Loader2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface JournalFormProps {
  editJournal?: HikingJournal | null;
  onClose: () => void;
  onSaved: () => void;
}

const weatherOptions = ["☀️ 맑음", "⛅ 구름", "☁️ 흐림", "🌧️ 비", "❄️ 눈", "🌫️ 안개"];
const difficultyOptions = ["쉬움", "보통", "어려움", "매우 어려움"];
const visibilityOptions = [
  { value: "public", label: "전체 공개", icon: Globe },
  { value: "friends", label: "친구 공개", icon: Users },
  { value: "private", label: "나만 보기", icon: Lock },
];

export function JournalForm({ editJournal, onClose, onSaved }: JournalFormProps) {
  const { user } = useAuth();
  const { createJournal, updateJournal, uploadPhoto } = useHikingJournals();
  const { friends } = useFriends();
  const { toast } = useToast();

  const [mountainId, setMountainId] = useState<number>(editJournal?.mountain_id || 0);
  const [hikedAt, setHikedAt] = useState(editJournal?.hiked_at || new Date().toISOString().split("T")[0]);
  const [courseName, setCourseName] = useState(editJournal?.course_name || "");
  const [courseStartingPoint, setCourseStartingPoint] = useState(editJournal?.course_starting_point || "");
  const [courseNotes, setCourseNotes] = useState(editJournal?.course_notes || "");
  const [duration, setDuration] = useState(editJournal?.duration || "");
  const [difficulty, setDifficulty] = useState(editJournal?.difficulty || "");
  const [weather, setWeather] = useState(editJournal?.weather || "");
  const [notes, setNotes] = useState(editJournal?.notes || "");
  const [visibility, setVisibility] = useState(editJournal?.visibility || "public");
  const [photos, setPhotos] = useState<string[]>(editJournal?.photos || []);
  const [taggedFriends, setTaggedFriends] = useState<string[]>(editJournal?.tagged_friends || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mountainSearch, setMountainSearch] = useState("");

  const isEdit = !!editJournal;

  const filteredMountains = mountainSearch
    ? mountains.filter((m) => m.nameKo.includes(mountainSearch) || m.name.toLowerCase().includes(mountainSearch.toLowerCase()))
    : mountains;

  const selectedMountain = mountains.find((m) => m.id === mountainId);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newPhotos: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadPhoto(file);
      if (url) newPhotos.push(url);
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFriend = (friendId: string) => {
    setTaggedFriends((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (!mountainId) {
      toast({ title: "산을 선택해주세요", variant: "destructive" });
      return;
    }
    setSaving(true);

    const journalData = {
      mountain_id: mountainId,
      hiked_at: hikedAt,
      course_name: courseName || undefined,
      course_starting_point: courseStartingPoint || undefined,
      course_notes: courseNotes || undefined,
      duration: duration || undefined,
      difficulty: difficulty || undefined,
      weather: weather || undefined,
      notes: notes || undefined,
      photos,
      tagged_friends: taggedFriends,
      visibility,
    };

    if (isEdit && editJournal) {
      const { error } = await updateJournal(editJournal.id, journalData);
      if (error) {
        toast({ title: "수정 실패", variant: "destructive" });
      } else {
        toast({ title: "일지를 수정했습니다 ✏️" });
        onSaved();
      }
    } else {
      const { error } = await createJournal(journalData);
      if (error) {
        toast({ title: "작성 실패", variant: "destructive" });
      } else {
        toast({ title: "일지를 작성했습니다 🏔️" });
        onSaved();
      }
    }
    setSaving(false);
  };

  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full max-w-lg max-h-[90vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl overflow-y-auto pb-24 sm:pb-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {isEdit ? "일지 수정" : "등산 일지 작성"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Mountain Selection */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">산 선택 *</label>
            <Input
              placeholder="산 이름 검색..."
              value={selectedMountain ? selectedMountain.nameKo : mountainSearch}
              onChange={(e) => {
                setMountainSearch(e.target.value);
                if (mountainId) setMountainId(0);
              }}
              className="mb-2"
            />
            {!mountainId && mountainSearch && (
              <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-background">
                {filteredMountains.slice(0, 10).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMountainId(m.id); setMountainSearch(""); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 flex items-center gap-2"
                  >
                    <Mountain className="h-3.5 w-3.5 text-primary" />
                    <span className="text-foreground">{m.nameKo}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{m.region} · {m.height}m</span>
                  </button>
                ))}
              </div>
            )}
            {selectedMountain && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                <Mountain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{selectedMountain.nameKo}</span>
                <span className="text-[10px] text-muted-foreground">{selectedMountain.region}</span>
                <button onClick={() => { setMountainId(0); setMountainSearch(""); }} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">등산 날짜</label>
            <Input
              type="date"
              value={hikedAt}
              onChange={(e) => setHikedAt(e.target.value)}
            />
          </div>

          {/* Course info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">코스명</label>
              <Input
                placeholder="예: 백운대 코스"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">출발점</label>
              <Input
                placeholder="예: 북한산성 탐방지원센터"
                value={courseStartingPoint}
                onChange={(e) => setCourseStartingPoint(e.target.value)}
              />
            </div>
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">소요 시간</label>
              <Input
                placeholder="예: 3시간 30분"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">난이도</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weather */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">날씨</label>
            <div className="flex flex-wrap gap-1.5">
              {weatherOptions.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeather(weather === w ? "" : w)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                    weather === w
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">사진</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 bg-foreground/60 text-background rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className={cn(
                "flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors",
                uploading && "pointer-events-none opacity-50"
              )}>
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">메모</label>
            <Textarea
              placeholder="등산 소감을 적어보세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Course Notes */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">코스 메모</label>
            <Textarea
              placeholder="코스에 대한 참고사항..."
              value={courseNotes}
              onChange={(e) => setCourseNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">공개 범위</label>
            <div className="flex gap-2">
              {visibilityOptions.map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.value}
                    onClick={() => setVisibility(v.value as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs transition-colors",
                      visibility === v.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Friends */}
          {acceptedFriends.length > 0 && (
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">함께한 친구 태그</label>
              <div className="flex flex-wrap gap-1.5">
                {acceptedFriends.map((f) => {
                  const fId = f.friendProfile.user_id;
                  const isTagged = taggedFriends.includes(fId);
                  return (
                    <button
                      key={fId}
                      onClick={() => toggleFriend(fId)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                        isTagged
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-secondary/50"
                      )}
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={f.friendProfile.avatar_url || ""} />
                        <AvatarFallback className="text-[7px]">{f.friendProfile.nickname?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      {f.friendProfile.nickname || "친구"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="sticky bottom-0 z-[61] bg-card border-t border-border p-4 pb-6 sm:pb-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">취소</Button>
          <Button onClick={handleSubmit} disabled={saving || !mountainId} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {isEdit ? "수정 완료" : "일지 작성"}
          </Button>
        </div>
      </div>
    </div>
  );
}
