import React from "react";

interface MountainMascotProps {
  size?: number;
  className?: string;
}

const MountainMascot: React.FC<MountainMascotProps> = ({ size = 120, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
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
      {/* Left eye */}
      <ellipse cx="82" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
      <ellipse cx="84" cy="97" rx="3" ry="3" fill="white" />
      {/* Right eye */}
      <ellipse cx="118" cy="100" rx="8" ry="9" fill="hsl(200, 25%, 20%)" />
      <ellipse cx="120" cy="97" rx="3" ry="3" fill="white" />
      {/* Small nose */}
      <ellipse cx="100" cy="115" rx="4" ry="3" fill="hsl(78, 50%, 45%)" />
      {/* Smile */}
      <path
        d="M88 122 Q100 132 112 122"
        stroke="hsl(200, 25%, 20%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Blush left */}
      <ellipse cx="72" cy="115" rx="7" ry="5" fill="hsl(0, 100%, 71%)" opacity="0.3" />
      {/* Blush right */}
      <ellipse cx="128" cy="115" rx="7" ry="5" fill="hsl(0, 100%, 71%)" opacity="0.3" />
      {/* Flag pole */}
      <line x1="100" y1="30" x2="100" y2="8" stroke="hsl(200, 25%, 20%)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Flag */}
      <path
        d="M100 8 L118 15 L100 22 Z"
        fill="hsl(0, 100%, 71%)"
      />
    </svg>
  );
};

export default MountainMascot;
