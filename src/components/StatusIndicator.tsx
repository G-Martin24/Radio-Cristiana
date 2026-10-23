import React from 'react';

export type PlaybackState = 'idle' | 'connecting' | 'playing' | 'paused' | 'error';

interface StatusIndicatorProps {
  playbackState: PlaybackState;
  metadataError?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  playbackState,
  metadataError = false,
  onRetry,
  className = '',
}) => {
  const getStatusContent = () => {
    switch (playbackState) {
      case 'connecting':
        return {
          label: 'Conectando...',
          color: 'text-amber-300',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'playing':
        return {
          label: 'Reproduciendo',
          color: 'text-emerald-400',
          dot: 'bg-emerald-400',
        };
      case 'paused':
      case 'idle':
        return {
          label: 'Pausado',
          color: 'text-slate-400',
          dot: 'bg-slate-500',
        };
      case 'error':
        return {
          label: 'Error de conexión',
          color: 'text-rose-400',
          dot: 'bg-rose-500',
        };
    }
  };

  const status = getStatusContent();

  return (
    <div className={`flex flex-col items-center gap-1.5 select-none ${className}`}>
      {/* Live Badge & Connection Status */}
      <div className="flex items-center gap-2.5 text-xs font-medium">
        {/* EN VIVO Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              playbackState === 'playing' ? 'bg-amber-400 animate-ping' : 'bg-amber-400/50'
            }`}
          />
          <span className="tracking-widest font-semibold uppercase text-[10px]">EN VIVO</span>
        </div>

        <span className="text-slate-600" aria-hidden="true">·</span>

        {/* Current State Text */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className={`${status.color} transition-colors duration-300`}>{status.label}</span>
        </div>

        {playbackState === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="text-amber-400 hover:text-amber-300 underline text-xs ml-1 cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>

      {/* Metadata status notice if metadata endpoint fails */}
      {metadataError && (
        <span className="text-[11px] text-amber-200/60 font-light">
          Metadatos no disponibles (audio en vivo activo)
        </span>
      )}
    </div>
  );
};
