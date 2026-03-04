import { X, Share2, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  challenge: {
    title: string;
    description?: string | null;
    badge?: { name: string; image_url: string | null } | null;
  } | null;
  onDismiss: () => void;
}

const ChallengeCompletionModal = ({ challenge, onDismiss }: Props) => {
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (challenge) {
      const t = setTimeout(() => {
        setVisible(true);
        setShowConfetti(true);
      }, 50);
      const t2 = setTimeout(() => setShowConfetti(false), 3000);
      return () => { clearTimeout(t); clearTimeout(t2); };
    } else {
      setVisible(false);
      setShowConfetti(false);
    }
  }, [challenge]);

  if (!challenge) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🏔️ 챌린지 달성! - ${challenge.title}`,
          text: `완등에서 "${challenge.title}" 챌린지를 달성했습니다! 🎉`,
          url: window.location.href,
        });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(
        `🏔️ 완등 챌린지 달성!\n${challenge.title}\n${challenge.description || ""}`
      );
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = 600;
      canvas.height = 400;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, "#065f46");
      grad.addColorStop(1, "#047857");
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, 600, 400, 24);
      ctx.fill();

      // Badge
      ctx.font = "64px serif";
      ctx.textAlign = "center";
      ctx.fillText(challenge.badge?.image_url || "🏆", 300, 130);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("챌린지 달성! 🎉", 300, 200);

      ctx.font = "bold 22px sans-serif";
      ctx.fillText(challenge.title, 300, 245);

      if (challenge.badge) {
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#a7f3d0";
        ctx.fillText(`🏅 ${challenge.badge.name}`, 300, 285);
      }

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#6ee7b7";
      ctx.fillText(`${new Date().toLocaleDateString("ko-KR")} · 완등`, 300, 360);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `challenge-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch { /* fallback silent */ }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onDismiss}
      />

      {/* Confetti particles */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                backgroundColor: ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899"][i % 6],
                left: `${10 + Math.random() * 80}%`,
                top: "-10px",
                animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl transition-all duration-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.7) translateY(40px)",
        }}
      >
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Badge with glow */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
          <span
            className="text-6xl"
            style={{ animation: visible ? "challengeBounce 0.8s ease-out" : "none" }}
          >
            {challenge.badge?.image_url || "🏆"}
          </span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          챌린지 달성!
        </p>
        <h3 className="mt-1 text-xl font-bold text-foreground">{challenge.title}</h3>
        {challenge.description && (
          <p className="mt-2 text-sm text-muted-foreground">{challenge.description}</p>
        )}
        {challenge.badge && (
          <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            🏅 {challenge.badge.name} 배지 획득!
          </p>
        )}

        {/* Share card preview */}
        <div
          ref={cardRef}
          className="mt-5 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 text-white"
        >
          <p className="text-3xl mb-2">{challenge.badge?.image_url || "🏆"}</p>
          <p className="text-xs font-medium opacity-80">챌린지 달성</p>
          <p className="text-base font-bold">{challenge.title}</p>
          <p className="mt-2 text-[10px] opacity-60">
            {new Date().toLocaleDateString("ko-KR")} · 완등
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button onClick={handleShare} className="flex-1 gap-1.5" variant="default">
            <Share2 className="h-4 w-4" /> 공유
          </Button>
          <Button onClick={handleDownloadCard} variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" /> 저장
          </Button>
        </div>

        <button
          onClick={onDismiss}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground"
        >
          닫기
        </button>
      </div>

      <style>{`
        @keyframes challengeBounce {
          0% { transform: scale(0) rotate(-20deg); }
          50% { transform: scale(1.3) rotate(10deg); }
          70% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChallengeCompletionModal;
