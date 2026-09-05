import React, { useState } from 'react';
import { Bot, Users, Globe, Volume2, VolumeX, HelpCircle, Crown, Swords, ShieldAlert, X } from 'lucide-react';
import { playSound, isSoundEnabled, toggleSound } from '../utils/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { PwaInstallBanner } from '../components/PwaInstallBanner';

export const Home: React.FC<{ onNavigate: (screen: 'player_select' | 'online') => void }> = ({ onNavigate }) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showRules, setShowRules] = useState(false);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playSound('click');
  };

  const handleNavigation = (screen: 'player_select' | 'online') => {
    playSound('click');
    onNavigate(screen);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d131f] flex flex-col items-center justify-between p-4 sm:p-6 text-white font-sans relative overflow-x-hidden overflow-y-auto select-none">
      {/* Dynamic ambient lights */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-rose-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full max-w-md flex justify-between items-center relative z-20 shrink-0">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <Crown size={16} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-black tracking-wider text-amber-300">ÉDITION ÉLITE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Rules Button */}
          <button
            onClick={() => {
              playSound('click');
              setShowRules(true);
            }}
            title="Règles du jeu"
            className="w-11 h-11 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl flex items-center justify-center border border-white/20 text-cyan-300 shadow-lg transition-all"
          >
            <HelpCircle size={20} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Couper le son' : 'Activer le son'}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all shadow-lg active:scale-95 ${
              soundOn
                ? 'bg-emerald-600/30 border-emerald-400/80 text-emerald-300'
                : 'bg-white/10 border-white/20 text-white/50'
            }`}
          >
            {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Title with Emblem */}
      <div className="flex flex-col items-center w-full flex-1 justify-center relative z-10 shrink-0 my-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative flex flex-col items-center mb-8 sm:mb-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-yellow-100 p-0.5 shadow-[0_10px_30px_rgba(234,179,8,0.4)] mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-[1.4rem] bg-[#1a110a] flex items-center justify-center">
              <Crown size={36} className="text-amber-400 fill-amber-400 sm:w-10 sm:h-10 animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-tight text-center leading-none">
            LUDO
          </h1>
          <span className="text-xs sm:text-sm font-black tracking-[0.3em] text-amber-400 uppercase mt-1">
            Moderne & Chasse
          </span>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {/* Vs Computer */}
          <button
            onClick={() => handleNavigation('player_select')}
            className="w-full bg-gradient-to-r from-emerald-900/40 to-slate-900/60 hover:from-emerald-900/60 hover:to-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg border border-emerald-300/40 group-hover:scale-108 transition-transform">
                <Bot size={30} className="text-white drop-shadow" />
              </div>
              <div className="text-left">
                <div className="text-lg sm:text-xl font-black text-white">Contre l'IA</div>
                <div className="text-xs text-emerald-300/80 font-medium">Partie solo avec bots intelligents</div>
              </div>
            </div>
            <span className="text-emerald-400 font-black text-2xl group-hover:translate-x-1 transition-transform">➔</span>
          </button>

          {/* Local Multiplayer */}
          <button
            onClick={() => handleNavigation('player_select')}
            className="w-full bg-gradient-to-r from-fuchsia-900/40 to-slate-900/60 hover:from-fuchsia-900/60 hover:to-slate-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border-2 border-fuchsia-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shadow-lg border border-fuchsia-300/40 group-hover:scale-108 transition-transform">
                <Users size={30} className="text-white drop-shadow" />
              </div>
              <div className="text-left">
                <div className="text-lg sm:text-xl font-black text-white">Multijoueur Local</div>
                <div className="text-xs text-fuchsia-300/80 font-medium">Jusqu'à 4 joueurs sur cet écran</div>
              </div>
            </div>
            <span className="text-fuchsia-400 font-black text-2xl group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: PWA Install & Online Button */}
      <div className="w-full max-w-sm relative z-10 shrink-0 mb-3 flex flex-col gap-2">
        <PwaInstallBanner />
        <button
          onClick={() => handleNavigation('online')}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 border-2 border-blue-400/50 py-3.5 rounded-2xl flex justify-center items-center gap-3 shadow-[0_12px_25px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Globe className="text-blue-200" size={24} />
          <span className="font-black text-lg tracking-widest text-white drop-shadow">SALLE EN LIGNE</span>
        </button>
      </div>

      {/* Rules Modal in Home Screen */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a2333] border-2 border-amber-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  playSound('click');
                  setShowRules(false);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 text-white"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
                <Crown size={22} /> RÈGLES DU JEU
              </h3>

              <div className="space-y-3.5 text-sm text-slate-200">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-emerald-400 mb-1">🎲 6 Pour Sortir & Rejouer</h4>
                  <p className="text-xs text-slate-300">
                    Chaque 6 permet de déployer un pion sur la piste et donne un lancer de dé bonus.
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-amber-400 mb-1">⭐ Cases Étoiles de Sécurité</h4>
                  <p className="text-xs text-slate-300">
                    Les cases étoilées protègent vos pions : impossible d'y subir une capture !
                  </p>
                </div>
                <div className="bg-rose-950/40 p-3.5 rounded-2xl border-2 border-rose-500/40">
                  <h4 className="font-black text-rose-300 flex items-center gap-2 mb-1">
                    <Swords size={16} /> Mode Invasion & Chasse
                  </h4>
                  <p className="text-xs text-rose-100">
                    Vous pouvez franchir l'entrée de l'escalier d'un adversaire pour aller capturer son pion chez lui. Pour redescendre les marches, un 6 par marche est exigé !
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setShowRules(false);
                }}
                className="w-full mt-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

