import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";

const ONBOARDING_KEY = "onboarding_completed";

interface OnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    targetSelector: '[data-onboarding="upcoming-schedule"]',
    title: "등산 계획을 세워보세요 📅",
    description: "친구들과 함께 등산 일정을 만들고 공유할 수 있어요",
  },
  {
    targetSelector: '[data-onboarding="summit-claim"]',
    title: "정상을 인증하세요 🏔",
    description: "산 정상에서 인증하면 리더보드에 이름이 올라가요!",
  },
  {
    targetSelector: '[data-onboarding="progress-ring"]',
    title: "100대 명산 완등에 도전하세요 🎯",
    description: "완등한 산을 기록하고 목표를 향해 나아가세요",
  },
  {
    targetSelector: '[data-onboarding="community-feed"]',
    title: "친구들의 등산 기록을 확인하세요 👥",
    description: "친구를 추가하고 서로의 등산 일지를 공유해보세요",
  },
  {
    targetSelector: '[data-onboarding="badge-gallery"]',
    title: "업적을 모아보세요 🏆",
    description: "등산하면서 다양한 업적과 챌린지를 달성할 수 있어요",
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OnboardingTutorial = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowLeft: number; arrowDir: "up" | "down" }>({
    top: 0, left: 0, arrowLeft: 50, arrowDir: "up",
  });
  const [fading, setFading] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const t = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  }, []);

  const isFinal = currentStep >= steps.length;

  const measure = useCallback(() => {
    if (isFinal || !visible) return;
    const el = document.querySelector(steps[currentStep].targetSelector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    const pad = 6;
    const sr: Rect = {
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    };
    setRect(sr);

    // tooltip
    const tw = Math.min(280, window.innerWidth - 32);
    const spaceBelow = window.innerHeight - r.bottom;
    let tTop: number;
    let arrowDir: "up" | "down";
    if (spaceBelow > 170) {
      tTop = sr.top + sr.height + 12;
      arrowDir = "up";
    } else {
      tTop = sr.top - 12;
      arrowDir = "down";
    }
    const cx = sr.left + sr.width / 2;
    let tLeft = cx - tw / 2;
    tLeft = Math.max(16, Math.min(tLeft, window.innerWidth - tw - 16));
    const arrowLeft = Math.max(20, Math.min(cx - tLeft, tw - 20));

    setTooltipPos({ top: tTop, left: tLeft, arrowLeft, arrowDir });
  }, [currentStep, isFinal, visible]);

  useEffect(() => {
    if (!visible || isFinal) { setRect(null); return; }
    const el = document.querySelector(steps[currentStep].targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(measure, 450);
    }

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, currentStep, isFinal, measure]);

  const goNext = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setFading(false);
    }, 200);
  }, []);

  if (!visible) return null;

  const totalDots = steps.length + 1; // +1 for final screen

  return (
    <>
      {/* Overlay: dark background */}
      <div className="fixed inset-0 z-[9998]" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} />

      {/* Spotlight cutout (uses huge box-shadow to darken everything except the rect) */}
      {rect && !isFinal && (
        <div
          className="fixed z-[9999] rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: "3px solid #C7D66D",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6), 0 0 20px rgba(199,214,109,0.3)",
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Skip button */}
      {!isFinal && (
        <button
          onClick={dismiss}
          className="fixed top-4 right-4 z-[10001] flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          건너뛰기 <X className="h-4 w-4" />
        </button>
      )}

      {/* Tooltip bubble */}
      {!isFinal && rect && (
        <div
          className={`fixed z-[10001] transition-all duration-200 ${fading ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={{
            top: tooltipPos.arrowDir === "up" ? tooltipPos.top : undefined,
            bottom: tooltipPos.arrowDir === "down" ? window.innerHeight - tooltipPos.top : undefined,
            left: tooltipPos.left,
            width: Math.min(280, window.innerWidth - 32),
          }}
        >
          {/* Arrow up */}
          {tooltipPos.arrowDir === "up" && (
            <div
              className="absolute -top-2 w-4 h-4 rotate-45 bg-white"
              style={{ left: tooltipPos.arrowLeft - 8, borderRadius: 2 }}
            />
          )}
          <div className="bg-white rounded-2xl p-5 shadow-2xl">
            <h3 className="text-[15px] font-bold text-[#2F403A] mb-1">{steps[currentStep].title}</h3>
            <p className="text-[13px] text-[#2F403A]/70 leading-relaxed">{steps[currentStep].description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 w-2 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: i === currentStep ? "#C7D66D" : "#E5E7EB",
                      transform: i === currentStep ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                className="rounded-full px-5 py-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#C7D66D", color: "#2F403A" }}
              >
                다음
              </button>
            </div>
          </div>
          {/* Arrow down */}
          {tooltipPos.arrowDir === "down" && (
            <div
              className="absolute -bottom-2 w-4 h-4 rotate-45 bg-white"
              style={{ left: tooltipPos.arrowLeft - 8, borderRadius: 2 }}
            />
          )}
        </div>
      )}

      {/* Final screen */}
      {isFinal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center px-8">
          <div className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-all duration-300 ${fading ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
            <div className="text-5xl mb-4">🏔</div>
            <h2 className="text-xl font-bold text-[#2F403A] mb-2">완등과 함께 시작해볼까요? 🏔</h2>
            <p className="text-sm text-[#2F403A]/70 mb-6">지금 바로 첫 번째 산을 기록해보세요!</p>
            <button
              onClick={dismiss}
              className="w-full rounded-2xl px-6 py-3.5 text-base font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#C7D66D", color: "#2F403A" }}
            >
              시작하기
            </button>
            <div className="flex justify-center gap-1.5 mt-5">
              {Array.from({ length: totalDots }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: i === steps.length ? "#C7D66D" : "#E5E7EB" }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingTutorial;
