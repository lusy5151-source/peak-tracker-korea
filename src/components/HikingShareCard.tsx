import { useRef, useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Mountain } from "@/data/mountains";
import { CompletionRecord } from "@/hooks/useMountainStore";
import { SharedCompletion } from "@/hooks/useSharedCompletions";
import { useStore } from "@/context/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Instagram, MessageCircle, Twitter, Facebook } from "lucide-react";
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
      zoom: 12,
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
        html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:hsl(160 40% 40%);border:2px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:12px;">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(map);

    return () => { map.remove(); };
  }, [mountain.lat, mountain.lng]);

  const completionDate = record?.completedAt || sharedCompletion?.completed_at;
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "";

  const displayPhoto = photoUrl || (record?.photos && record.photos.length > 0 ? record.photos[0] : null);
  const totalMountains = 100;
  const progressPercent = Math.round((completedCount / totalMountains) * 100);

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
      {/* The exportable card */}
      <div
        ref={cardRef}
        className="w-full max-w-[400px] mx-auto aspect-square rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(160 20% 97%), hsl(200 20% 94%))" }}
      >
        <div className="h-full flex flex-col p-5">
          {/* Top: Mountain name + badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏔</span>
            <h2 className="text-xl font-bold text-foreground">{mountain.nameKo}</h2>
            {mountain.is_baekdu && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                백대명산
              </Badge>
            )}
          </div>

          {/* Mini map */}
          <div
            ref={miniMapRef}
            className="h-[80px] rounded-xl overflow-hidden border border-border shadow-sm mb-1"
          />
          <p className="text-[9px] text-muted-foreground text-center mb-2">📍 정상 위치</p>

          {/* Photo */}
          {displayPhoto && (
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border shadow-sm mb-3">
              <img src={displayPhoto} alt={mountain.nameKo} className="w-full h-full object-cover" />
            </div>
          )}
          {!displayPhoto && (
            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border shadow-sm mb-3 bg-secondary flex items-center justify-center">
              <span className="text-4xl">⛰</span>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">📅 날짜</p>
              <p className="text-[11px] font-semibold text-foreground">{formattedDate || "-"}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">📍 정상</p>
              <p className="text-[11px] font-semibold text-foreground">{mountain.nameKo}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">⛰ 해발</p>
              <p className="text-[11px] font-semibold text-foreground">{mountain.height}m</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-muted-foreground">🥾 난이도</p>
              <p className="text-[11px] font-semibold text-foreground">{mountain.difficulty}</p>
            </div>
          </div>

          {/* Shared completion section */}
          {sharedCompletion?.participants && sharedCompletion.participants.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium text-muted-foreground">👥 함께 완등</span>
              <div className="flex -space-x-1.5">
                {sharedCompletion.participants.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    className="h-5 w-5 rounded-full bg-accent border border-card flex items-center justify-center text-[8px] font-bold text-accent-foreground"
                    style={{ zIndex: 5 - i }}
                  >
                    {(p.profile?.nickname || "?")[0]}
                  </div>
                ))}
                {sharedCompletion.participants.length > 5 && (
                  <div className="h-5 w-5 rounded-full bg-secondary border border-card flex items-center justify-center text-[7px] text-muted-foreground">
                    +{sharedCompletion.participants.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <div>
              <p className="text-[9px] text-muted-foreground">100대 명산 진행률</p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-[10px] font-bold text-primary">{completedCount} / {totalMountains}</span>
              </div>
            </div>
            <p className="text-[8px] text-muted-foreground/70">완등 앱에서 기록한 등산 🏔</p>
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

export default HikingShareCard;
