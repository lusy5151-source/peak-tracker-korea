import React from "react";

interface MountainMascotProps {
  size?: number;
  className?: string;
  mood?: "default" | "celebrating" | "loading" | "success" | "sad" | "waving";
}

const MountainMascot: React.FC<MountainMascotProps> = ({ size = 120, className = "", mood = "default" }) => {
  const animationClass = mood === "celebrating"
    ? "animate-mascot-celebrate"
    : mood === "loading"
    ? "animate-mascot-bounce"
    : mood === "waving"
    ? "animate-mascot-wave"
    : mood === "success"
    ? "animate-mascot-pop"
    : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animationClass}`}
    >
      {/* Celebration sparkles */}
      {mood === "celebrating" && (
        <>
          <circle cx="40" cy="40" r="3" fill="hsl(40, 100%, 60%)" className="animate-mascot-sparkle" />
          <circle cx="160" cy="35" r="2.5" fill="hsl(0, 100%, 71%)" className="animate-mascot-sparkle" style={{ animationDelay: "0.2s" }} />
          <circle cx="30" cy="80" r="2" fill="hsl(270, 60%, 70%)" className="animate-mascot-sparkle" style={{ animationDelay: "0.4s" }} />
          <circle cx="170" cy="75" r="2.5" fill="hsl(78, 52%, 56%)" className="animate-mascot-sparkle" style={{ animationDelay: "0.6s" }} />
          <path d="M50 25 L53 18 L56 25 L49 21 L57 21 Z" fill="hsl(40, 100%, 60%)" className="animate-mascot-sparkle" style={{ animationDelay: "0.3s" }} />
          <path d="M150 20 L153 13 L156 20 L149 16 L157 16 Z" fill="hsl(0, 100%, 71%)" className="animate-mascot-sparkle" style={{ animationDelay: "0.5s" }} />
        </>
      )}

      {/* Success confetti */}
      {mood === "success" && (
        <>
          <rect x="35" y="30" width="5" height="5" rx="1" fill="hsl(78, 52%, 56%)" className="animate-mascot-confetti" />
          <rect x="155" y="25" width="4" height="6" rx="1" fill="hsl(0, 100%, 71%)" className="animate-mascot-confetti" style={{ animationDelay: "0.15s" }} />
          <rect x="60" y="15" width="4" height="4" rx="1" fill="hsl(40, 100%, 60%)" className="animate-mascot-confetti" style={{ animationDelay: "0.3s" }} />
          <rect x="140" y="20" width="5" height="4" rx="1" fill="hsl(270, 60%, 70%)" className="animate-mascot-confetti" style={{ animationDelay: "0.45s" }} />
        </>
      )}

      {/* Mountain body */}
      <path
        d="M100 30 L170 150 Q170 165 155 165 L45 165 Q30 165 30 150 Z"
        fill="hsl(78, 52%, 56%)"
      />
      {/* Snow cap */}
      <path
        d="M100 30 L120 70 L80 70 Z"
        fill="white"
        opacity="0.8"
      />

      {/* Eyes - mood variations */}
      {mood === "celebrating" || mood === "success" ? (
        <>
          {/* Happy squint eyes */}
          <path d="M74 98 Q82 90 90 98" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M110 98 Q118 90 126 98" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : mood === "sad" ? (
        <>
          {/* Sad eyes */}
          <ellipse cx="82" cy="100" rx="7" ry="8" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="84" cy="97" rx="2.5" ry="2.5" fill="white" />
          <ellipse cx="118" cy="100" rx="7" ry="8" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="120" cy="97" rx="2.5" ry="2.5" fill="white" />
          {/* Tear */}
          <ellipse cx="90" cy="110" rx="2" ry="3" fill="hsl(205, 50%, 75%)" opacity="0.6" />
        </>
      ) : mood === "loading" ? (
        <>
          {/* Looking-around eyes */}
          <ellipse cx="82" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="85" cy="98" rx="3" ry="3" fill="white" className="animate-mascot-look" />
          <ellipse cx="118" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="121" cy="98" rx="3" ry="3" fill="white" className="animate-mascot-look" />
        </>
      ) : (
        <>
          {/* Default eyes */}
          <ellipse cx="82" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="84" cy="97" rx="3" ry="3" fill="white" />
          <ellipse cx="118" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
          <ellipse cx="120" cy="97" rx="3" ry="3" fill="white" />
        </>
      )}

      {/* Small nose */}
      <ellipse cx="100" cy="115" rx="4" ry="3" fill="hsl(78, 50%, 45%)" />

      {/* Mouth - mood variations */}
      {mood === "celebrating" || mood === "success" ? (
        <path d="M85 120 Q100 138 115 120" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" fill="hsl(0, 60%, 55%)" fillOpacity="0.3" />
      ) : mood === "sad" ? (
        <path d="M88 128 Q100 120 112 128" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : mood === "loading" ? (
        <ellipse cx="100" cy="125" rx="5" ry="4" fill="hsl(200, 25%, 20%)" opacity="0.7" />
      ) : (
        <path d="M88 122 Q100 132 112 122" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Blush */}
      <ellipse cx="72" cy="115" rx="7" ry="5" fill="hsl(0, 100%, 71%)" opacity={mood === "celebrating" || mood === "success" ? "0.5" : "0.3"} />
      <ellipse cx="128" cy="115" rx="7" ry="5" fill="hsl(0, 100%, 71%)" opacity={mood === "celebrating" || mood === "success" ? "0.5" : "0.3"} />

      {/* Flag pole */}
      <line x1="100" y1="30" x2="100" y2="8" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Flag */}
      <path
        d="M100 8 L118 15 L100 22 Z"
        fill="hsl(0, 100%, 71%)"
        className={mood === "celebrating" || mood === "success" ? "animate-mascot-flag" : ""}
      />

      {/* Waving hand for waving mood */}
      {mood === "waving" && (
        <g className="animate-mascot-hand">
          <circle cx="170" cy="120" r="8" fill="hsl(78, 52%, 56%)" stroke="hsl(78, 50%, 45%)" strokeWidth="1.5" />
          <path d="M165 112 Q170 105 175 112" stroke="hsl(78, 50%, 45%)" strokeWidth="1.5" fill="none" />
        </g>
      )}
    </svg>
  );
};

export default MountainMascot;
