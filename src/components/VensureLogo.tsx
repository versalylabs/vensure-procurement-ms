import React from "react";

interface VensureLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
  variant?: "badge" | "glyph";
}

/**
 * Vensure Official Architectural Brand Logo & Icon
 * Features the precision dual-wing 'V' monogram, forward logistics ascent,
 * and central procurement certainty node.
 */
export function VensureIcon({
  size = 36,
  className = "",
  variant = "badge",
}: {
  size?: number;
  className?: string;
  variant?: "badge" | "glyph";
}) {
  const rawId = React.useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const bgId = `vlBg_${id}`;
  const borderId = `vlBorder_${id}`;
  const wingLeftId = `vlWingLeft_${id}`;
  const wingRightId = `vlWingRight_${id}`;
  const glowId = `vlGlow_${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={bgId}
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1e1e2a" />
          <stop offset="100%" stopColor="#14141c" />
        </linearGradient>
        <linearGradient
          id={borderId}
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5266eb" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient
          id={wingLeftId}
          x1="16"
          y1="16"
          x2="32"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6875f5" />
          <stop offset="100%" stopColor="#4355d8" />
        </linearGradient>
        <linearGradient
          id={wingRightId}
          x1="32"
          y1="48"
          x2="48"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#5266eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient
          id={glowId}
          x1="32"
          y1="20"
          x2="32"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5266eb" stopOpacity="0" />
        </linearGradient>
      </defs>

      {variant === "badge" && (
        <>
          <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke={`url(#${borderId})`}
            strokeWidth="1.5"
          />
          <circle cx="32" cy="32" r="18" fill={`url(#${glowId})`} />
        </>
      )}

      {/* Left Arm of 'V' (Precision Chamfered Facet) */}
      <path
        d="M16 18L29.5 45.2C30.6 47.4 33.4 47.4 34.5 45.2L48 18H41.2L32 37.5L22.8 18H16Z"
        fill={`url(#${wingLeftId})`}
      />

      {/* Right Arm Dynamic Accent Wing (Forward Lift) */}
      <path
        d="M32 37.5L41.2 18H48L34.5 45.2C33.4 47.4 30.6 47.4 29.5 45.2L28 42.2L34.2 29.8L32 37.5Z"
        fill={`url(#${wingRightId})`}
      />

      {/* Sourcing & Delivery Diamond / Certainty Node */}
      <polygon
        points="32,22 36.5,27 32,32 27.5,27"
        fill="#ffffff"
        fillOpacity="0.95"
      />
      <polygon
        points="32,22 36.5,27 32,32 27.5,27"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="27" r="1.5" fill="#5266eb" />
    </svg>
  );
}

export function VensureLogo({
  size = 36,
  showWordmark = true,
  subtitle,
  className = "",
  variant = "badge",
}: VensureLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VensureIcon size={size} variant={variant} />
      {showWordmark && (
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-wider text-[#ededf3] leading-none">
            VENSURE
          </span>
          {subtitle && (
            <span className="text-[10px] tracking-widest text-[#c3c3cc] uppercase mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default VensureLogo;
