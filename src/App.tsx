import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, AlertCircle } from 'lucide-react';
import { STATION_CONFIG } from './config/station';
import { ChristianLogo } from './components/ChristianLogo';
import { ArtworkDisplay } from './components/ArtworkDisplay';
import { Equalizer } from './components/Equalizer';
import { StatusIndicator, PlaybackState } from './components/StatusIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import type { StationMetadata } from './lib/metadata-service';

export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Playback States
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('radio_vol');
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.85);

  // Metadata States
  const [metadata, setMetadata] = useState<StationMetadata>({
    artist: '',
    title: 'Transmisión en Vivo',
    artwork: null,
    updatedAt: '',
  });
  const [metadataError, setMetadataError] = useState<boolean>(false);

  // Fetch metadata function
  const fetchMetadata = useCallback(async () => {
    try {
      const res = await fetch(STATION_CONFIG.metadataEndpoint, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: StationMetadata = await res.json();
      setMetadata((prev) => {
        // Only update if something changed
        if (
          prev.artist !== data.artist ||
          prev.title !== data.title ||
          prev.artwork !== data.artwork
        ) {
          return data;
        }
        return prev;
      });
      setMetadataError(false);

      // Update Native MediaSession (Notification and Lock Screen)
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: data.title || STATION_CONFIG.name,
          artist: data.artist || STATION_CONFIG.name,
          album: STATION_CONFIG.name,
          artwork: data.artwork
            ? [{ src: data.artwork, sizes: '512x512', type: 'image/jpeg' }]
            : [
                { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
              ],
        });
      }
    } catch (err) {
      console.warn('[RadioApp] Could not refresh station metadata:', (err as Error).message);
      setMetadataError(true);
    }
  }, []);

  // Poll metadata every 15 seconds
  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, STATION_CONFIG.pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchMetadata]);

  // Audio setup and sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const onPlaying = () => setPlaybackState('playing');
    const onPause = () => {
      setPlaybackState((prev) => (prev === 'error' ? 'error' : 'paused'));
    };
    const onWaiting = () => setPlaybackState('connecting');
    const onError = () => {
      console.error('[RadioApp] Audio playback stream error');
      setPlaybackState('error');
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('error', onError);
    };
  }, [isMuted, volume]);

  // Setup MediaSession action handlers (play / pause from earbuds or lock screen)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('stop', () => handleStop());
    }
  }, [playbackState]);

  // Handle Play / Pause Toggle
  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackState === 'playing') {
      audio.pause();
      setPlaybackState('paused');
    } else {
      setPlaybackState('connecting');
      try {
        // Cache bust the stream URL on fresh play to guarantee real-time buffer
        const freshUrl = `${STATION_CONFIG.streamUrl}${STATION_CONFIG.streamUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}`;
        audio.src = freshUrl;
        audio.load();
        await audio.play();
        setPlaybackState('playing');
      } catch (err) {
        console.error('[RadioApp] Play request error:', err);
        setPlaybackState('error');
      }
    }
  };

  // Handle Stop
  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = '';
    setPlaybackState('paused');
  };

  // Volume slider change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    try {
      localStorage.setItem('radio_vol', String(newVol));
    } catch {}
  };

  // Mute toggle
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restored = prevVolume > 0 ? prevVolume : 0.85;
      setVolume(restored);
      if (audioRef.current) audioRef.current.volume = restored;
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // Retry on connection error
  const handleRetry = () => {
    handleTogglePlay();
    fetchMetadata();
  };

  // Keyboard accessibility (Space: Play/Pause, M: Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState, isMuted, volume]);

  const isPlaying = playbackState === 'playing';

  return (
    <main className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20">
      {/* Hidden audio element with crossOrigin for AnalyserNode where available */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* Top Header: Brand Zone + Install Action (Strict Top Bar Contract) */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <ChristianLogo size={36} />
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white whitespace-nowrap">
              {STATION_CONFIG.name}
            </h1>
            <p className="text-[11px] text-amber-200/70 font-light hidden sm:block">
              {STATION_CONFIG.tagline}
            </p>
          </div>
        </div>

        {/* Primary Action Zone: PWA Install prompt */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Player Core */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8 max-w-xl mx-auto w-full">
        {/* Connection & Live Status */}
        <StatusIndicator
          playbackState={playbackState}
          metadataError={metadataError}
          onRetry={handleRetry}
          className="mb-5 sm:mb-6"
        />

        {/* Album Artwork Display */}
        <ArtworkDisplay
          artworkUrl={metadata.artwork}
          isPlaying={isPlaying}
          songTitle={metadata.title}
          artistName={metadata.artist}
        />

        {/* Song & Artist Info */}
        <div className="w-full text-center mt-6 px-4">
          <h2
            className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-2 leading-snug drop-shadow-sm"
            title={metadata.title}
          >
            {metadata.title || 'Alabanza & Adoración en Vivo'}
          </h2>

          <p
            className="text-sm sm:text-base text-amber-200/90 font-medium mt-1 line-clamp-1"
            title={metadata.artist}
          >
            {metadata.artist || STATION_CONFIG.name}
          </p>
        </div>

        {/* Equalizer Visualizer */}
        <div className="w-full max-w-xs mt-4 mb-2">
          <Equalizer isPlaying={isPlaying} audioRef={audioRef} barCount={20} />
        </div>

        {/* Playback Controls Card */}
        <div className="w-full max-w-sm bg-[#0B132B]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 mt-2 shadow-xl shadow-black/40">
          {/* Main Primary Action: Large Play / Pause button */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleTogglePlay}
              disabled={playbackState === 'connecting'}
              className={`relative group w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                isPlaying
                  ? 'bg-gradient-to-br from-amber-400 to-[#AA820A] text-[#060913] shadow-amber-500/25 hover:shadow-amber-500/40'
                  : 'bg-gradient-to-br from-amber-300 via-amber-400 to-[#C69214] text-[#060913] shadow-amber-500/30 hover:scale-105'
              } ${playbackState === 'connecting' ? 'opacity-75 cursor-wait' : ''}`}
              aria-label={isPlaying ? 'Pausar transmisión' : 'Reproducir transmisión en vivo'}
            >
              {playbackState === 'connecting' ? (
                <div className="w-7 h-7 border-3 border-[#060913]/30 border-t-[#060913] rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>
          </div>

          {/* Volume Control Row */}
          <div className="mt-5 flex items-center gap-3 px-2">
            <button
              onClick={handleToggleMute}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-amber-200 transition-colors cursor-pointer"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : volume < 0.4 ? (
                <Volume1 className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5 text-amber-300" />
              )}
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Control de volumen"
              />
            </div>

            <span className="text-[11px] font-mono tabular-nums text-slate-400 w-9 text-right select-none">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Stream Error Notice if active */}
        {playbackState === 'error' && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2.5 text-xs text-rose-200 max-w-sm w-full">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-medium">No se pudo conectar al servidor de audio.</p>
              <p className="text-[11px] text-rose-300/80">Comprueba tu conexión a internet o reintenta.</p>
            </div>
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 rounded bg-rose-800/40 hover:bg-rose-800/60 text-xs font-medium cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Discreet Spiritual Footer (Strict Anti-Slop, no fake telemetry, no social clutter) */}
      <footer className="w-full border-t border-slate-900/80 py-4 px-4 text-center text-xs text-slate-500 shrink-0">
        <p className="tracking-wide">
          «Cantad alegres a Dios, habitantes de toda la tierra.» · Salmo 100:1
        </p>
      </footer>
    </main>
  );
}
