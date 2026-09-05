import React, { useState } from 'react';
import { Download, WifiOff, Share2, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePwaInstall, useOnlineStatus } from '../registerServiceWorker';
import { playSound } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

export const PwaInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isIos, installApp } = usePwaInstall();
  const isOnline = useOnlineStatus();
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleInstallClick = async () => {
    playSound('click');
    if (canInstall) {
      await installApp();
    } else if (isIos) {
      setShowIosModal(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2.5 my-2 relative z-30">
      {/* Offline Status Badge */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="w-full max-w-sm flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/50 backdrop-blur-xl shadow-lg text-amber-200 text-xs font-bold"
          >
            <WifiOff size={15} className="text-amber-400 animate-pulse shrink-0" />
            <span>Mode Hors Ligne : Le jeu fonctionne à 100%</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Button / Banner (Only if not already running standalone) */}
      {!isInstalled && !dismissed && (canInstall || isIos) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-amber-400/40 backdrop-blur-xl p-3 shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shrink-0 shadow-md text-slate-950 font-black">
                <Smartphone size={20} />
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-extrabold text-white truncate">Installer Ludo Empire</p>
                <p className="text-[10px] text-amber-200/80 truncate">Accès instantané & 100% hors-ligne</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Installer</span>
              </button>

              <button
                onClick={() => setDismissed(true)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors"
                title="Ignorer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Already Installed Badge (Subtle confirmation) */}
      {isInstalled && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
          <CheckCircle size={12} className="text-emerald-400" />
          <span>App installée (Hors-ligne activé)</span>
        </div>
      )}

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIosModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a2333] border-2 border-amber-500/40 w-full max-w-sm rounded-3xl p-5 text-white shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative"
            >
              <button
                onClick={() => {
                  playSound('click');
                  setShowIosModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 text-white"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-400">Installer sur iOS</h3>
                  <p className="text-xs text-slate-300">Ajouter à l'écran d'accueil</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-200">
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Share2 size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-white">Étape 1 :</span>
                    <p className="text-slate-300 mt-0.5">
                      Dans Safari, appuyez sur le bouton <strong>Partager</strong> (icône avec la flèche) en bas de l'écran.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-white">Étape 2 :</span>
                    <p className="text-slate-300 mt-0.5">
                      Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-500/10 p-3 rounded-xl border border-amber-400/30">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300">Étape 3 :</span>
                    <p className="text-slate-200 mt-0.5">
                      Appuyez sur <strong>Ajouter</strong> en haut à droite. L'application est prête et jouable hors ligne !
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setShowIosModal(false);
                }}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Compris !
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
