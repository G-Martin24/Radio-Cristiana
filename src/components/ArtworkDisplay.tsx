import React, { useEffect, useState } from 'react';

interface ArtworkDisplayProps {
  artworkUrl: string | null;
  isPlaying: boolean;
  songTitle?: string;
  artistName?: string;
}

export const ArtworkDisplay: React.FC<ArtworkDisplayProps> = ({
  artworkUrl,
  isPlaying,
  songTitle = 'Alabanza & Adoración',
  artistName = '',
}) => {
  // Retain previous artwork until new one is successfully loaded
  const [displayedArtwork, setDisplayedArtwork] = useState<string | null>(artworkUrl);
  const [isLoadingNew, setIsLoadingNew] = useState(false);

  useEffect(() => {
    if (!artworkUrl) {
      setDisplayedArtwork(null);
      return;
    }

    if (artworkUrl === displayedArtwork) return;

    // Preload the incoming artwork before switching
    setIsLoadingNew(true);
    const img = new Image();
    img.src = artworkUrl;
    img.onload = () => {
      setDisplayedArtwork(artworkUrl);
      setIsLoadingNew(false);
    };
    img.onerror = () => {
      // If failed, keep the previous artwork or fallback
      setIsLoadingNew(false);
    };
  }, [artworkUrl, displayedArtwork]);

  return (
    <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 select-none">
      {/* Outer ambient glow */}
      <div
        className={`absolute -inset-2.5 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-sky-600/15 to-amber-300/25 blur-xl transition-all duration-700 pointer-events-none ${
          isPlaying ? 'opacity-90 scale-100' : 'opacity-30 scale-95'
        }`}
      />

      {/* Main Container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0B132B] shadow-2xl shadow-black/80 flex items-center justify-center">
        {displayedArtwork ? (
          <img
            src={displayedArtwork}
            alt={songTitle ? `${songTitle} - ${artistName}` : 'Carátula de la transmisión'}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isPlaying ? 'scale-105' : 'scale-100'
            }`}
          />
        ) : (
          /* High-Fidelity Christian Artwork Fallback */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#141E3D] via-[#0E162F] to-[#070B18]">
            {/* Celestial background rays */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_40%,rgba(255,224,130,0.5)_0%,transparent_60%)] pointer-events-none" />

            {/* Glowing Golden Cross Emblem */}
            <div className="relative mb-4">
              <div
                className={`absolute -inset-4 rounded-full bg-amber-400/20 blur-md transition-all duration-1000 ${
                  isPlaying ? 'scale-125 opacity-80' : 'scale-90 opacity-40'
                }`}
              />
              <svg
                viewBox="0 0 80 80"
                width="72"
                height="72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)]"
              >
                <circle cx="40" cy="40" r="36" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="40" cy="32" r="14" fill="#FFE082" fillOpacity="0.15" />
                {/* Cross beams */}
                <rect x="37" y="16" width="6" height="48" rx="3" fill="url(#artGoldGrad)" />
                <rect x="24" y="29" width="32" height="6" rx="3" fill="url(#artGoldGrad)" />
                <circle cx="40" cy="32" r="2" fill="#FFFFFF" />

                <defs>
                  <linearGradient id="artGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2B2" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8C6B08" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <p className="text-amber-200/90 text-xs font-medium tracking-widest uppercase">
              Alabanza & Adoración
            </p>
            <p className="text-slate-400 text-[11px] mt-1 font-light">
              Música Cristiana en Vivo
            </p>
          </div>
        )}

        {/* Loading overlay for incoming artwork */}
        {isLoadingNew && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity">
            <div className="w-6 h-6 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
