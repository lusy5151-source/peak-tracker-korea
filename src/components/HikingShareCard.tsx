import { useRef, useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Mountain } from "@/data/mountains";
import { CompletionRecord } from "@/hooks/useMountainStore";
import { SharedCompletion } from "@/hooks/useSharedCompletions";
import { useStore } from "@/context/StoreContext";
import { Button } from "@/components/ui/button";
import { Share2, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";
import { StackedAvatars } from "@/components/StackedAvatars";
import html2canvas from "html2canvas";

interface HikingShareCardProps {
  mountain: Mountain;
  record?: CompletionRecord;
  sharedCompletion?: SharedCompletion;
  photoUrl?: string;
}

const HikingShareCard = ({ mountain, record, sharedCompletion, photoUrl }: HikingShareCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const { completedCount } = useStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!miniMapRef.current) return;
    const map = L.map(miniMapRef.current, {
      center: [mountain.lat, mountain.lng],
      zoom: 13,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

    L.marker([mountain.lat, mountain.lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:hsl(160 40% 40%);border:2.5px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.25);font-size:14px;">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    }).addTo(map);

    return () => { map.remove(); };
  }, [mountain.lat, mountain.lng]);

  const completionDate = record?.completedAt || sharedCompletion?.completed_at;
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "";

  const displayPhoto = photoUrl || (record?.photos && record.photos.length > 0 ? record.photos[0] : null);
  const isShared = sharedCompletion?.participants && sharedCompletion.participants.length > 0;
  const completionLabel = isShared ? "함께 완등" : "완등";
  const duration = record?.duration || "";

  const totalMountains = 100;
  const progressPercent = Math.round((completedCount / totalMountains) * 100);

  const participantProfiles = sharedCompletion?.participants?.map((p) => ({
    nickname: p.profile?.nickname || null,
    avatar_url: p.profile?.avatar_url || null,
  })) || [];

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      if (navigator.share && navigator.canShare?.({ files: [new File([blob], "hiking-record.png", { type: "image/png" })] })) {
        await navigator.share({
          title: `${mountain.nameKo} 완등 기록`,
          text: `${mountain.nameKo}을(를) 완등했습니다! 🏔`,
          files: [new File([blob], "hiking-record.png", { type: "image/png" })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${mountain.nameKo}-완등기록.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(`${mountain.nameKo}을(를) 완등했습니다! 🏔 #등산 #완등 #${mountain.nameKo}`);
    const url = encodeURIComponent(window.location.href);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank", "width=600,height=400");
    else handleExport();
  };

  return (
    <div className="space-y-4">
      {/* The exportable card — 4:5 aspect ratio */}
      <div
        ref={cardRef}
        className="w-full max-w-[400px] mx-auto rounded-3xl overflow-hidden shadow-lg"
        style={{
          aspectRatio: "4 / 5",
          background: "linear-gradient(180deg, hsl(160 20% 97%), hsl(200 15% 94%))",
        }}
      >
        <div className="h-full flex flex-col">
          {/* Top: Photo section (fills ~45%) */}
          <div className="relative flex-[5] min-h-0">
            {displayPhoto ? (
              <img src={displayPhoto} alt={mountain.nameKo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[hsl(160_30%_85%)] to-[hsl(200_25%_80%)] flex items-center justify-center">
                <span className="text-6xl">⛰</span>
              </div>
            )}
            {/* Gradient overlay at bottom of photo */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            {/* Mountain name overlaid on photo */}
            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">{mountain.nameKo}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
                  {isShared ? "👥" : "👤"} {completionLabel}
                </span>
                {mountain.is_baekdu && (
                  <span className="rounded-full bg-white/25 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
                    백대명산
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Info section */}
          <div className="flex-[4] flex flex-col justify-between p-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatItem emoji="📅" label="날짜" value={formattedDate || "-"} />
              <StatItem emoji="⛰" label="해발" value={`${mountain.height}m`} />
              <StatItem emoji="🥾" label={duration ? "소요시간" : "난이도"} value={duration || mountain.difficulty} />
            </div>

            {/* Participants section */}
            {isShared && participantProfiles.length > 0 && (
              <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-black/[0.03] p-3">
                <StackedAvatars profiles={participantProfiles} max={5} size="sm" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground">함께 완등한 친구</p>
                  <p className="text-xs text-foreground truncate">
                    {participantProfiles.map((p) => p.nickname || "?").join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Mini map */}
            <div className="mt-3 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              <div ref={miniMapRef} className="h-[72px]" />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-muted-foreground">100대 명산 진행률</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-primary">{completedCount} / {totalMountains}</span>
                </div>
              </div>
              <p className="text-[8px] text-muted-foreground/60">완등 앱에서 기록한 등산 🏔</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-[400px] mx-auto">
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs rounded-xl" onClick={() => handleSocialShare("instagram")}>
          <Instagram className="h-3.5 w-3.5" /> Instagram
        </Button>
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs rounded-xl" onClick={() => handleSocialShare("kakao")}>
          <MessageCircle className="h-3.5 w-3.5" /> KakaoTalk
        </Button>
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs rounded-xl" onClick={() => handleSocialShare("twitter")}>
          <Twitter className="h-3.5 w-3.5" /> X
        </Button>
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs rounded-xl" onClick={() => handleSocialShare("facebook")}>
          <Facebook className="h-3.5 w-3.5" /> Facebook
        </Button>
        <Button size="sm" className="gap-1.5 text-xs rounded-xl" onClick={handleExport} disabled={exporting}>
          <Share2 className="h-3.5 w-3.5" /> {exporting ? "내보내는 중..." : "이미지 저장"}
        </Button>
      </div>
    </div>
  );
};

function StatItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] p-2.5 text-center">
      <p className="text-[9px] text-muted-foreground">{emoji} {label}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

export default HikingShareCard;
