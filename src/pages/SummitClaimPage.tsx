import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { mountains } from "@/data/mountains";
import { useAuth } from "@/contexts/AuthContext";
import { useHikingPlans } from "@/hooks/useHikingPlans";
import { useHikingGroups } from "@/hooks/useHikingGroups";
import { useSummits } from "@/hooks/useSummits";
import { useOfflineClaims } from "@/hooks/useOfflineClaims";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MountainMascot from "@/components/MountainMascot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Search, Mountain, Flag, Camera, MapPin,
  Navigation, Loader2, Shield, Clock, Users, Wifi, WifiOff,
  CheckCircle2, Calendar, ChevronRight, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Convert dataURL to File
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

export default function SummitClaimPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { plans } = useHikingPlans();
  const { myGroups } = useHikingGroups();
  const { pendingClaims, addOfflineClaim, markSynced, removeOfflineClaim } = useOfflineClaims();

  // Steps: select-mountain → select-summit → upload-photo → review
  const [step, setStep] = useState<"select-mountain" | "select-summit" | "upload-photo" | "review">("select-mountain");
  const [selectedMountainId, setSelectedMountainId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSummitId, setSelectedSummitId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error" | "skipped">("idle");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { summits, claimSummit, fetchClaims } = useSummits(selectedMountainId ?? undefined);

  const selectedMountain = selectedMountainId ? mountains.find((m) => m.id === selectedMountainId) : null;
  const selectedSummit = summits.find((s) => s.id === selectedSummitId);

  // Online status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Suggested mountains from hiking plans (today or upcoming)
  const suggestedMountains = useMemo(() => {
    if (!plans || plans.length === 0) return [];
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = plans
      .filter((p) => p.status === "upcoming" && p.planned_date >= today)
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
      .slice(0, 5);
    
    return upcoming.map((plan) => {
      const mt = mountains.find((m) => m.id === plan.mountain_id);
      return mt ? { plan, mountain: mt } : null;
    }).filter(Boolean) as { plan: any; mountain: typeof mountains[0] }[];
  }, [plans]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return mountains
      .filter((m) => m.nameKo.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [searchQuery]);

  const handleSelectMountain = (id: number) => {
    setSelectedMountainId(id);
    setSelectedSummitId(null);
    setStep("select-summit");
  };

  const handleSelectSummit = (summitId: string) => {
    setSelectedSummitId(summitId);
    setStep("upload-photo");
  };

  const handleGetLocation = () => {
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("success");
      },
      () => {
        setGpsStatus("error");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleSkipGPS = () => {
    setGpsStatus("skipped");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGoToReview = () => {
    if (photoPreview) setStep("review");
  };

  const handleSubmitClaim = async () => {
    if (!selectedSummit || !photoFile || !selectedMountain) return;

    // If offline, save locally
    if (!isOnline) {
      addOfflineClaim({
        mountainId: selectedMountain.id,
        mountainName: selectedMountain.nameKo,
        summitId: selectedSummit.id,
        summitName: selectedSummit.summit_name,
        photoDataUrl: photoPreview!,
        photoFileName: photoFile.name,
        latitude: userLocation?.lat ?? null,
        longitude: userLocation?.lng ?? null,
        groupId: selectedGroupId || null,
        timestamp: new Date().toISOString(),
      });
      toast({ title: "📱 오프라인 저장 완료", description: "네트워크 연결 시 자동으로 업로드됩니다." });
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        resetFlow();
      }, 3000);
      return;
    }

    setClaiming(true);

    // Use GPS location if available, otherwise use summit coordinates as fallback
    const lat = userLocation?.lat ?? selectedSummit.latitude;
    const lng = userLocation?.lng ?? selectedSummit.longitude;

    const result = await claimSummit(
      selectedSummit.id,
      lat,
      lng,
      photoFile,
      selectedGroupId || undefined
    );
    setClaiming(false);

    if (result.success) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        resetFlow();
      }, 3000);
    } else {
      toast({ title: "인증 실패", description: result.error, variant: "destructive" });
    }
  };

  const handleSyncOfflineClaim = async (claim: typeof pendingClaims[0]) => {
    if (!user) return;
    setSyncingId(claim.id);

    try {
      const file = dataURLtoFile(claim.photoDataUrl, claim.photoFileName);
      const lat = claim.latitude ?? 0;
      const lng = claim.longitude ?? 0;

      // Upload photo
      const fileExt = claim.photoFileName.split(".").pop();
      const filePath = `${user.id}/${claim.summitId}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("summit-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("summit-photos").getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("summit_claims")
        .insert({
          user_id: user.id,
          mountain_id: claim.mountainId,
          summit_id: claim.summitId,
          group_id: claim.groupId,
          latitude: lat,
          longitude: lng,
          photo_url: urlData.publicUrl,
        } as any);

      if (insertError) throw insertError;

      markSynced(claim.id);
      toast({ title: "✅ 동기화 완료", description: `${claim.summitName} 인증이 업로드되었습니다.` });
    } catch {
      toast({ title: "동기화 실패", description: "다시 시도해주세요.", variant: "destructive" });
    } finally {
      setSyncingId(null);
    }
  };

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingClaims.length > 0 && user) {
      pendingClaims.forEach((claim) => {
        handleSyncOfflineClaim(claim);
      });
    }
  }, [isOnline]);

  const resetFlow = () => {
    setStep("select-mountain");
    setSelectedMountainId(null);
    setSelectedSummitId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setGpsStatus("idle");
    setUserLocation(null);
    setSelectedGroupId("");
    setSearchQuery("");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-4">
        <MountainMascot size={100} mood="idle" />
        <p className="text-muted-foreground">로그인 후 정상 인증을 할 수 있습니다.</p>
        <Link to="/auth">
          <Button>로그인</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
          <div className="rounded-3xl bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <MountainMascot size={120} mood="celebrating" />
            <h2 className="mt-3 text-xl font-bold text-foreground">정상 정복! 🏔️</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedSummit?.summit_name || "정상"} 정복을 축하합니다!
            </p>
            <Badge className="mt-3 bg-primary/10 text-primary border-0 gap-1">
              <Flag className="h-3 w-3" /> Summit Claimed!
            </Badge>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== "select-mountain" ? (
          <button onClick={() => {
            if (step === "select-summit") setStep("select-mountain");
            else if (step === "upload-photo") setStep("select-summit");
            else if (step === "review") setStep("upload-photo");
          }} className="rounded-xl p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : (
          <Link to="/" className="rounded-xl p-2 hover:bg-secondary transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" /> 정상 인증
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === "select-mountain" && "산을 선택하세요"}
            {step === "select-summit" && "정상을 선택하세요"}
            {step === "upload-photo" && "사진을 업로드하세요"}
            {step === "review" && "인증 정보를 확인하세요"}
          </p>
        </div>

        {/* Online status */}
        <div className="ml-auto">
          {isOnline ? (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Wifi className="h-3 w-3" /> 온라인
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1 border-amber-300 text-amber-600">
              <WifiOff className="h-3 w-3" /> 오프라인
            </Badge>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["산 선택", "정상 선택", "사진", "확인"].map((label, idx) => {
          const steps = ["select-mountain", "select-summit", "upload-photo", "review"];
          const currentIdx = steps.indexOf(step);
          const isActive = idx <= currentIdx;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-muted"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Pending offline claims */}
      {pendingClaims.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            <WifiOff className="h-4 w-4" />
            대기 중인 오프라인 인증 ({pendingClaims.length}건)
          </div>
          {pendingClaims.map((claim) => (
            <div key={claim.id} className="flex items-center gap-3 rounded-lg bg-card p-3 border border-border/50">
              <img src={claim.photoDataUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{claim.mountainName} - {claim.summitName}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(claim.timestamp).toLocaleString("ko-KR")}</p>
              </div>
              {isOnline ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-full"
                  disabled={syncingId === claim.id}
                  onClick={() => handleSyncOfflineClaim(claim)}
                >
                  {syncingId === claim.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "동기화"}
                </Button>
              ) : (
                <Badge variant="outline" className="text-[9px]">대기중</Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Select Mountain */}
      {step === "select-mountain" && (
        <div className="space-y-4">
          {/* Suggested from plans */}
          {suggestedMountains.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                등산 계획 기반 추천
              </h3>
              {suggestedMountains.map(({ plan, mountain }) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectMountain(mountain.id)}
                  className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-left hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Mountain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{mountain.nameKo}</p>
                        <p className="text-xs text-muted-foreground">
                          {mountain.height}m · {mountain.region}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {plan.planned_date}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 ml-auto" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Manual search */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              산 검색
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="산 이름을 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((mt) => (
                  <button
                    key={mt.id}
                    onClick={() => handleSelectMountain(mt.id)}
                    className="w-full rounded-xl border border-border bg-card p-3 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Mountain className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{mt.nameKo}</p>
                        <p className="text-[11px] text-muted-foreground">{mt.height}m · {mt.region}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">검색 결과가 없습니다</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Select Summit */}
      {step === "select-summit" && selectedMountain && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Mountain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{selectedMountain.nameKo}</p>
                <p className="text-xs text-muted-foreground">{selectedMountain.height}m · {selectedMountain.region}</p>
              </div>
            </div>
          </div>

          {summits.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <MountainMascot size={80} mood="idle" />
              <p className="text-sm text-muted-foreground">등록된 정상이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">정상 선택</h3>
              {summits.map((summit) => (
                <button
                  key={summit.id}
                  onClick={() => handleSelectSummit(summit.id)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left hover:bg-secondary/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Flag className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{summit.summit_name}</p>
                      <p className="text-[11px] text-muted-foreground">{summit.elevation}m</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Upload Photo + GPS */}
      {step === "upload-photo" && selectedSummit && (
        <div className="space-y-4">
          {/* Info card */}
          <div className="rounded-xl bg-muted/50 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Shield className="h-3.5 w-3.5" /> 인증 안내
            </div>
            <ul className="text-[11px] text-muted-foreground space-y-0.5 ml-5 list-disc">
              <li>정상 사진 업로드 필수</li>
              <li>GPS는 선택사항 (보조 인증)</li>
              <li>같은 정상 12시간 쿨다운</li>
              <li>오프라인에서도 저장 가능</li>
            </ul>
          </div>

          {/* GPS (optional) */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Navigation className="h-3.5 w-3.5" /> GPS 위치 확인 (선택)
            </label>
            <div className="flex gap-2">
              <Button
                variant={gpsStatus === "success" ? "secondary" : "outline"}
                className={cn(
                  "flex-1 rounded-xl gap-2",
                  gpsStatus === "success" && "border-primary/30 bg-primary/5"
                )}
                onClick={handleGetLocation}
                disabled={gpsStatus === "loading" || gpsStatus === "skipped"}
              >
                {gpsStatus === "loading" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 확인 중...</>
                ) : gpsStatus === "success" ? (
                  <><MapPin className="h-4 w-4 text-primary" /> 위치 확인됨</>
                ) : (
                  <><MapPin className="h-4 w-4" /> 위치 가져오기</>
                )}
              </Button>
              {gpsStatus !== "success" && gpsStatus !== "skipped" && (
                <Button
                  variant="ghost"
                  className="rounded-xl text-xs"
                  onClick={handleSkipGPS}
                >
                  건너뛰기
                </Button>
              )}
            </div>
            {gpsStatus === "error" && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                GPS를 사용할 수 없습니다. 사진으로만 인증합니다.
              </div>
            )}
            {gpsStatus === "skipped" && (
              <p className="text-[11px] text-muted-foreground">GPS 없이 사진으로만 인증합니다</p>
            )}
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Camera className="h-3.5 w-3.5" /> 정상 사진 <span className="text-destructive">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Summit" className="w-full h-48 object-cover rounded-xl" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2 rounded-full text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  다시 선택
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-xl h-32 flex-col gap-2 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">사진 촬영 또는 선택</span>
              </Button>
            )}
          </div>

          {/* Club selection */}
          {myGroups.length > 0 && (
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> 산악회 (선택)
              </label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="산악회 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">선택 안 함</SelectItem>
                  {myGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            className="w-full rounded-xl"
            disabled={!photoPreview}
            onClick={handleGoToReview}
          >
            다음 단계 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* STEP 4: Review */}
      {step === "review" && selectedMountain && selectedSummit && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">인증 정보 확인</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">산</p>
                <p className="text-sm font-medium text-foreground">{selectedMountain.nameKo}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">정상</p>
                <p className="text-sm font-medium text-foreground">{selectedSummit.summit_name}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">GPS</p>
                <p className="text-sm font-medium text-foreground">
                  {gpsStatus === "success" ? "✅ 확인됨" : "📷 사진만"}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">네트워크</p>
                <p className="text-sm font-medium text-foreground">
                  {isOnline ? "✅ 온라인" : "📱 오프라인"}
                </p>
              </div>
            </div>

            {photoPreview && (
              <img src={photoPreview} alt="Summit" className="w-full h-40 object-cover rounded-xl" />
            )}

            {!isOnline && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <WifiOff className="h-4 w-4 shrink-0" />
                오프라인 상태입니다. 인증이 로컬에 저장되며 네트워크 연결 시 자동 업로드됩니다.
              </div>
            )}
          </div>

          <Button
            className="w-full rounded-xl gap-2"
            disabled={claiming}
            onClick={handleSubmitClaim}
          >
            {claiming ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 인증 중...</>
            ) : (
              <><Flag className="h-4 w-4" /> {isOnline ? "정상 정복 인증하기" : "오프라인 저장하기"}</>
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
            <Clock className="h-3 w-3" />
            같은 정상은 12시간 후 재인증 가능
          </div>
        </div>
      )}
    </div>
  );
}
