import React from "react";

interface BrandLogoProps {
  variant?: "megaphone" | "gavel";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ variant = "megaphone", className = "", size = "md" }: BrandLogoProps) {
  const iconSize = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const titleSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {variant === "megaphone" ? (
        // Gold/Brown Megaphone from Screenshot 3 & 5
        <div className={`${iconSize} relative mb-1.5 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
            {/* Sound waves */}
            <path d="M72 32C76 38 78 44 78 50C78 56 76 62 72 68" stroke="#8A5A2B" strokeWidth="5" strokeLinecap="round" />
            <path d="M83 24C90 32 94 41 94 50C94 59 90 68 83 76" stroke="#8A5A2B" strokeWidth="5" strokeLinecap="round" />
            {/* Megaphone body */}
            <path
              d="M32 38L62 20C65 18 69 20 69 24V76C69 80 65 82 62 80L32 62H20C16 62 14 60 14 56V44C14 40 16 38 20 38H32Z"
              fill="#8A5A2B"
            />
            {/* Handle */}
            <path
              d="M30 62L34 82C35 85 32 88 28 88C25 88 23 85 22 82L18 62"
              fill="#8A5A2B"
            />
          </svg>
        </div>
      ) : (
        // Gavel / Auction Hammer from Screenshot 4 (OTP)
        <div className={`${iconSize} relative mb-1.5 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-sm">
            {/* Speed / impact bursts */}
            <path d="M22 45L12 42" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M30 30L22 22" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 22L42 12" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M68 28L76 22" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
            <path d="M76 44L86 42" stroke="#8A5A2B" strokeWidth="4" strokeLinecap="round" />
            {/* Hammer Head */}
            <rect
              x="30"
              y="28"
              width="44"
              height="22"
              rx="4"
              transform="rotate(28 52 39)"
              fill="#8A5A2B"
            />
            {/* Hammer Handle */}
            <rect
              x="48"
              y="42"
              width="8"
              height="46"
              rx="3"
              transform="rotate(28 52 65)"
              fill="#6B4423"
            />
          </svg>
        </div>
      )}

      {/* Brand Typography */}
      <div className="flex flex-col items-center">
        <span className={`font-black tracking-tight text-[#1E293B] ${titleSize} leading-none`}>
          BIDDING
        </span>
        <span className="font-extrabold tracking-wider text-[#1E293B] text-xs leading-tight">
          PLUS
        </span>
      </div>
    </div>
  );
}
