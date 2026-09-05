import React, { useState } from 'react';
import { PlayerColor, PLAYER_COLORS } from '../game/constants';
import { User, Bot, Play, ArrowLeft } from 'lucide-react';
import { playSound } from '../utils/audio';

export const PlayerSelect: React.FC<{
  onStart: (players: PlayerColor[], types: Record<PlayerColor, 'human' | 'computer'>) => void;
  onBack: () => void;
}> = ({ onStart, onBack }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [types, setTypes] = useState<Record<PlayerColor, 'human' | 'computer'>>({
    green: 'human',
    red: 'computer',
    blue: 'computer',
    yellow: 'computer'
  });

  const handleStart = () => {
    playSound('click');
    let activePlayers: PlayerColor[] = [];
    if (playerCount === 2) activePlayers = ['green', 'blue']; // opposite corners
    if (playerCount === 3) activePlayers = ['green', 'red', 'blue'];
    if (playerCount === 4) activePlayers = ['green', 'red', 'blue', 'yellow'];

    onStart(activePlayers, types);
  };

  const toggleType = (color: PlayerColor) => {
    playSound('click');
    setTypes(prev => ({ ...prev, [color]: prev[color] === 'human' ? 'computer' : 'human' }));
  };

  const handleSelectCount = (num: 2 | 3 | 4) => {
    playSound('click');
    setPlayerCount(num);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0d131f] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans relative overflow-hidden select-none">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#0d131f] to-[#0d131f] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] bg-slate-900/85 backdrop-blur-2xl border-2 border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 drop-shadow-md tracking-wide">
          CONFIGURATION
        </h2>

        {/* Player Count Selection */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nombre de Joueurs</span>
          <div className="flex justify-center gap-2.5 sm:gap-3 w-full">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => handleSelectCount(num as 2 | 3 | 4)}
                className={`flex-1 py-2.5 sm:py-3 rounded-2xl flex items-center justify-center text-base sm:text-lg font-black border-2 transition-all active:scale-95
                  ${
                    playerCount === num
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-yellow-200 text-slate-950 shadow-[0_0_25px_rgba(234,179,8,0.5)] scale-105'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/25'
                  }
                `}
              >
                {num} Joueurs
              </button>
            ))}
          </div>
        </div>

        {/* Player Types Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 min-h-[200px]">
          {PLAYER_COLORS.map(color => {
            const isActive =
              (playerCount === 2 && (color === 'green' || color === 'blue')) ||
              (playerCount === 3 && color !== 'yellow') ||
              playerCount === 4;

            if (!isActive) return <div key={color} className="opacity-0 pointer-events-none transition-all duration-300" />;

            const bgGradients = {
              green: 'from-[#10b981] to-[#047857] border-[#34d399]/70 text-emerald-100',
              red: 'from-[#ef4444] to-[#b91c1c] border-[#f87171]/70 text-rose-100',
              blue: 'from-[#3b82f6] to-[#1d4ed8] border-[#60a5fa]/70 text-blue-100',
              yellow: 'from-[#eab308] to-[#a16207] border-[#fde047]/70 text-amber-100'
            };

            const labels: Record<PlayerColor, string> = {
              green: 'Vert',
              red: 'Rouge',
              blue: 'Bleu',
              yellow: 'Jaune'
            };

            return (
              <button
                key={color}
                onClick={() => toggleType(color)}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 bg-gradient-to-br shadow-xl transition-all hover:scale-105 active:scale-95 ${bgGradients[color]}`}
              >
                <div className="text-[10px] uppercase font-black tracking-widest opacity-80">{labels[color]}</div>
                {types[color] === 'human' ? (
                  <User size={36} className="text-white drop-shadow sm:w-10 sm:h-10" />
                ) : (
                  <Bot size={36} className="text-white drop-shadow sm:w-10 sm:h-10" />
                )}
                <div className="bg-black/30 px-3 py-0.5 rounded-full text-white font-black text-xs uppercase tracking-wider">
                  {types[color] === 'human' ? 'Humain' : 'Robot'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              playSound('click');
              onBack();
            }}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl flex items-center justify-center border border-white/20 transition-all shadow-lg text-white"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onClick={handleStart}
            className="flex-1 h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center gap-2 text-xl font-black border-2 border-emerald-300/50 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:shadow-[0_0_35px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:scale-95 transition-all tracking-widest text-white group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span>LANCER</span>
            <Play fill="currentColor" size={20} className="drop-shadow" />
          </button>
        </div>
      </div>
    </div>
  );
};

