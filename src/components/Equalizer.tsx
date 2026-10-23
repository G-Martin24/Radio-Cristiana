import React, { useEffect, useRef, useState } from 'react';

interface EqualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  barCount?: number;
  className?: string;
}

export const Equalizer: React.FC<EqualizerProps> = ({
  isPlaying,
  audioRef,
  barCount = 18,
  className = '',
}) => {
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    new Array(barCount).fill(10)
  );
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Try to connect Web Audio AnalyserNode to audio element
  useEffect(() => {
    if (!audioRef?.current) return;
    const audioElement = audioRef.current;

    // We only initialize AudioContext on user interaction/play to satisfy browser autoplay policy
    if (isPlaying && !audioContextRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.8;

          // Attempt to connect media element source
          const source = ctx.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          sourceNodeRef.current = source;
          setUsingFallback(false);
        }
      } catch (e) {
        // Cross-Origin / CORS security error on shoutcast streams is very normal
        console.info('[Equalizer] Using procedural fallback equalizer (CORS policy on audio stream):', (e as Error).message);
        setUsingFallback(true);
      }
    }
  }, [isPlaying, audioRef]);

  // Main visualization loop
  useEffect(() => {
    if (!isPlaying) {
      // Smoothly drop bars to baseline when paused
      setBarHeights(new Array(barCount).fill(8));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    if (prefersReducedMotion.current) {
      // Calm static height when reduced motion is preferred
      setBarHeights(new Array(barCount).fill(30));
      return;
    }

    let phase = 0;
    const dataArray = analyserRef.current
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null;

    const render = () => {
      phase += 0.08;

      if (!usingFallback && analyserRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);

        // Check if stream gives non-zero frequency data
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];

        if (sum > 0) {
          const step = Math.floor(dataArray.length / barCount) || 1;
          const nextHeights = [];
          for (let i = 0; i < barCount; i++) {
            const rawVal = dataArray[i * step] || 0;
            // Map 0-255 to percentage 10%-100%
            const pct = Math.max(10, Math.min(100, (rawVal / 255) * 100));
            nextHeights.push(pct);
          }
          setBarHeights(nextHeights);
          animationFrameRef.current = requestAnimationFrame(render);
          return;
        }
      }

      // Procedural musical visualizer (smooth natural organic curve)
      const nextHeights = [];
      for (let i = 0; i < barCount; i++) {
        const offset = (i / barCount) * Math.PI * 2;
        // Harmonic waves synthesis
        const wave1 = Math.sin(phase * 1.5 + offset * 1.2);
        const wave2 = Math.cos(phase * 2.3 + offset * 2.1) * 0.5;
        const wave3 = Math.sin(phase * 0.8 - offset * 0.7) * 0.3;
        const combined = (wave1 + wave2 + wave3 + 1.8) / 3.6; // normalized ~0 to 1
        
        // Boost middle frequencies slightly for natural bell curve
        const bellCurve = Math.sin((i / (barCount - 1)) * Math.PI) * 0.35 + 0.65;
        const heightPct = Math.max(12, Math.min(95, Math.round(combined * bellCurve * 100)));
        nextHeights.push(heightPct);
      }

      setBarHeights(nextHeights);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, barCount, usingFallback]);

  return (
    <div
      className={`flex items-end justify-center gap-1.5 h-12 px-2 py-1 select-none ${className}`}
      aria-label={isPlaying ? 'Ecualizador en vivo' : 'Ecualizador en pausa'}
      role="img"
    >
      {barHeights.map((height, idx) => (
        <div
          key={idx}
          className="w-1.5 rounded-full transition-all duration-100 ease-out origin-bottom bg-gradient-to-t from-[#B8860B] via-[#D4AF37] to-[#FFF3B0]"
          style={{
            height: `${height}%`,
            opacity: isPlaying ? 0.95 : 0.25,
            boxShadow: isPlaying ? '0 0 6px rgba(212, 175, 55, 0.4)' : 'none',
          }}
        />
      ))}
    </div>
  );
};
