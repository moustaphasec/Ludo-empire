import React, { useState } from 'react';
import { Globe, ArrowLeft, Users, Shield, Copy, Check, Sparkles, WifiOff } from 'lucide-react';
import { playSound } from '../utils/audio';
import { motion } from 'framer-motion';
import { useOnlineStatus } from '../registerServiceWorker';

export const Online: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [roomCode, setRoomCode] = useState('LUDO-7842');
  const [copied, setCopied] = useState(false);
  const isOnline = useOnlineStatus();

  const handleCopy = () => {
    playSound('click');
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateRoom = () => {
    playSound('click');
    const newCode = 'LUDO-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(newCode);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d131f] flex flex-col items-center justify-between p-4 sm:p-6 text-white font-sans relative overflow-x-hidden overflow-y-auto select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-md flex items-center justify-between relative z-20 shrink-0">
        <button
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="w-11 h-11 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl flex items-center justify-center border border-white/20 transition-all shadow-lg text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-black tracking-widest text-blue-300 uppercase flex items-center gap-2">
          <Globe size={18} className="text-blue-400" /> MULTIJOUEUR EN LIGNE
        </span>
        <div className="w-11" />
      </header>

      {/* Center Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-slate-900/80 backdrop-blur-2xl border-2 border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] my-4 flex flex-col items-center text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-[0_10px_30px_rgba(37,99,235,0.4)] mb-4 flex items-center justify-center"
        >
          <div className="w-full h-full rounded-[1.4rem] bg-[#0b1329] flex items-center justify-center">
            <Globe size={38} className="text-cyan-300" />
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 mb-2">
          SALLE MULTIJOUEUR
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          Défiez vos amis à distance avec le code de partie privé ci-dessous !
        </p>

        {/* Offline Warning if not connected */}
        {!isOnline && (
          <div className="w-full mb-5 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5 text-left">
            <WifiOff size={18} className="text-amber-400 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-amber-300">Connexion Internet Indisponible</p>
              <p className="text-[11px] text-amber-200/80">
                Le jeu en ligne nécessite internet. Vous pouvez toutefois jouer hors-ligne contre l'IA ou en multijoueur local sur le même écran !
              </p>
            </div>
          </div>
        )}

        {/* Room Code Box */}
        <div className="w-full bg-black/40 border-2 border-blue-500/40 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-inner">
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Code du Salon</div>
            <div className="text-2xl font-black tracking-widest text-white">{roomCode}</div>
          </div>
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handleCreateRoom}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-95 rounded-2xl font-black text-sm uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> Générer un nouveau code
          </button>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-400/20 text-[11px] text-blue-200/90 leading-relaxed">
            📡 <strong>Mode Réseau Déployé</strong> : Prêt pour l'appairage WebSocket & WebRTC P2P direct entre joueurs.
          </div>
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="w-full max-w-sm relative z-10 shrink-0 mb-3">
        <button
          onClick={() => {
            playSound('click');
            onBack();
          }}
          className="w-full py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-wider text-white shadow-md transition-all"
        >
          Retour au Menu
        </button>
      </div>
    </div>
  );
};
