import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or running as standalone APK, hide the install button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-medium transition cursor-pointer"
        title="Instalar aplicación en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-amber-400" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-medium transition cursor-pointer"
          title="Instalar en iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#0B132B] border border-amber-500/30 p-6 shadow-2xl text-slate-100">
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-semibold text-amber-200 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                Instalar en iPhone o iPad
              </h3>

              <div className="mt-3 space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  1. Toca el botón <strong>Compartir</strong> (el icono con una flecha hacia arriba) en Safari.
                </p>
                <p>
                  2. Desplázate hacia abajo y selecciona <strong>«Agregar a Inicio»</strong>.
                </p>
                <p>
                  3. Toca <strong>«Agregar»</strong> en la esquina superior derecha para disfrutar la radio como app nativa.
                </p>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium border border-amber-500/40 transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
