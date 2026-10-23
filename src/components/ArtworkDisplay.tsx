import React from 'react';

interface ArtworkDisplayProps {
  isPlaying: boolean;
  songTitle?: string;
  artistName?: string;
  artworkUrl?: string | null;
}

export const ArtworkDisplay: React.FC<ArtworkDisplayProps> = ({
  isPlaying,
  songTitle = 'Transmisión en Vivo',
  artistName = '',
}) => {
  return (
    <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 select-none">
      {/* Outer ambient glow reacting to playback state */}
      <div
        className={`absolute -inset-3 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-sky-600/15 to-amber-300/25 blur-xl transition-all duration-700 pointer-events-none ${
          isPlaying ? 'opacity-90 scale-100' : 'opacity-30 scale-95'
        }`}
      />

      {/* Main Container Card */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0B132B] shadow-2xl shadow-black/80 flex flex-col items-center justify-center p-4">
        {/* Subtle radial depth gradient behind logo */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.35)_0%,transparent_70%)] pointer-events-none" />

        {/* Central Official Radio Poder Logo */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src="/assets/logo-radio-poder.png"
            alt={songTitle ? `Radio Poder - ${songTitle} ${artistName}` : 'Radio Poder'}
            className={`w-full h-full max-w-[90%] max-h-[90%] object-contain select-none transition-transform duration-700 ease-out drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
