import React from 'react';

interface ChristianLogoProps {
  className?: string;
  size?: number;
}

export const ChristianLogo: React.FC<ChristianLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)]"
      >
        <defs>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9E780E" />
          </linearGradient>
          <linearGradient id="shieldBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C274C" />
            <stop offset="100%" stopColor="#0B132B" />
          </linearGradient>
        </defs>

        {/* Outer Circular Shield */}
        <circle cx="50" cy="50" r="46" fill="url(#shieldBg)" stroke="url(#logoGold)" strokeWidth="2" strokeOpacity="0.8" />
        
        {/* Subtle Halo */}
        <circle cx="50" cy="42" r="16" fill="#D4AF37" fillOpacity="0.12" />

        {/* Acoustic Broadcast Arcs (Left) */}
        <path d="M 34 38 A 16 16 0 0 0 34 62" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M 26 31 A 26 26 0 0 0 26 69" stroke="url(#logoGold)" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.5" />

        {/* Acoustic Broadcast Arcs (Right) */}
        <path d="M 66 38 A 16 16 0 0 1 66 62" stroke="url(#logoGold)" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
        <path d="M 74 31 A 26 26 0 0 1 74 69" stroke="url(#logoGold)" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.5" />

        {/* Christian Cross */}
        {/* Vertical Beam */}
        <rect x="47" y="24" width="6" height="46" rx="3" fill="url(#logoGold)" />
        {/* Horizontal Beam */}
        <rect x="36" y="37" width="28" height="6" rx="3" fill="url(#logoGold)" />

        {/* Radiance center point */}
        <circle cx="50" cy="40" r="2.5" fill="#FFFFFF" />

        {/* Base Equalizer Bars (symbolizing sacred sound) */}
        <rect x="42" y="74" width="2" height="4" rx="1" fill="url(#logoGold)" fillOpacity="0.7" />
        <rect x="46" y="72" width="2" height="6" rx="1" fill="url(#logoGold)" />
        <rect x="50" y="70" width="2" height="8" rx="1" fill="url(#logoGold)" />
        <rect x="54" y="72" width="2" height="6" rx="1" fill="url(#logoGold)" />
        <rect x="58" y="74" width="2" height="4" rx="1" fill="url(#logoGold)" fillOpacity="0.7" />
      </svg>
    </div>
  );
};
