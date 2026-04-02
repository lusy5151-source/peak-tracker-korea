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

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OnboardingTutorial = () => {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<"top" | "bottom">("top");
  const [transitioning, setTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  }, []);

  const isFinalScreen = currentStep >= steps.length;

  const computePositions = useCallback(() => {
    if (isFinalScreen) {
      setSpotlight(null);
      return;
    }
    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlight(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const padding = 8;
    const sr: SpotlightRect = {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlight(sr);

    // Tooltip positioning
    const tooltipWidth = Math.min(300, window.innerWidth - 32);
    const viewportTop = rect.top;
    const viewportBottom = window.innerHeight - rect.bottom;

    let top: number;
    let dir: "top" | "bottom";

    if (viewportBottom > 160) {
      top = sr.top + sr.height + 16;
      dir = "top";
    } else {
      top = sr.top - 16;
      dir = "bottom";
    }

    const centerX = sr.left + sr.width / 2;
    let left = centerX - tooltipWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    if (dir === "bottom") {
      setTooltipStyle({
        position: "absolute",
        top: "auto",
        bottom: `${document.documentElement.scrollHeight - top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
      });
    } else {
      setTooltipStyle({
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
      });
    }

    const arrowLeft = centerX - left - 8;
    setArrowStyle({ left: `${Math.max(16, Math.min(arrowLeft, tooltipWidth - 32))}px` });
    setArrowDirection(dir);
  }, [currentStep, isFinalScreen]);

  useEffect(() => {
    if (!visible) return;
    if (isFinalScreen) {
      setSpotlight(null);
      return;
    }

    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(computePositions, 400);
    } else {
      computePositions();
    }

    const handleResize = () => computePositions();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [visible, currentStep, computePositions, isFinalScreen]);

  const goNext = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setTransitioning(false);
    }, 200);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999]"
      style={{ pointerEvents: "auto" }}
    >
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: document.documentElement.scrollHeight }}
        preserveAspectRatio="none"
        viewBox={`0 0 ${window.innerWidth} ${document.documentElement.scrollHeight}`}
      >
        <defs>
          <mask id="onboarding-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="16"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#onboarding-mask)"
        />
      </svg>

      {/* Spotlight highlight border */}
      {spotlight && !isFinalScreen && (
        <div
          className="absolute rounded-2xl transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            border: "3px solid #C7D66D",
            boxShadow: "0 0 20px rgba(199, 214, 109, 0.3)",
          }}
        />
      )}

      {/* Skip button */}
      {!isFinalScreen && (
        <button
          onClick={dismiss}
          className="fixed top-4 right-4 z-[10001] flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
        >
          건너뛰기 <X className="h-4 w-4" />
        </button>
      )}

      {/* Tooltip */}
      {!isFinalScreen && spotlight && (
        <div
          className={`z-[10001] transition-all duration-200 ease-out ${transitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          style={tooltipStyle}
        >
          {/* Arrow */}
          {arrowDirection === "top" && (
            <div
              className="absolute -top-2 w-4 h-4 rotate-45 bg-white rounded-sm"
              style={arrowStyle}
            />
          )}
          <div className="relative bg-white rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-[#2F403A] mb-1.5">{steps[currentStep].title}</h3>
            <p className="text-sm text-[#2F403A]/70 leading-relaxed">{steps[currentStep].description}</p>

            {/* Progress dots + buttons */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
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
          {arrowDirection === "bottom" && (
            <div
              className="absolute -bottom-2 w-4 h-4 rotate-45 bg-white rounded-sm"
              style={arrowStyle}
            />
          )}
        </div>
      )}

      {/* Final screen */}
      {isFinalScreen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center px-8">
          <div
            className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-all duration-300 ${transitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
          >
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
              {[...steps, null].map((_, i) => (
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
    </div>
  );
};

export default OnboardingTutorial;
