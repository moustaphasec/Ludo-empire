import React, { useState } from 'react';
import { PlayerColor, PLAYER_COLORS } from '../game/constants';
import { User, Bot, Play, Settings as SettingsIcon } from 'lucide-react';

export const PlayerSelect: React.FC<{ onStart: (players: PlayerColor[], types: Record<PlayerColor, 'human'|'computer'>) => void, onBack: () => void }> = ({ onStart, onBack }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [types, setTypes] = useState<Record<PlayerColor, 'human'|'computer'>>({
    green: 'human',
    red: 'computer',
    blue: 'computer',
    yellow: 'computer'
  });

  const handleStart = () => {
    let activePlayers: PlayerColor[] = [];
    if (playerCount === 2) activePlayers = ['green', 'blue']; // opposite corners
    if (playerCount === 3) activePlayers = ['green', 'red', 'blue'];
    if (playerCount === 4) activePlayers = ['green', 'red', 'blue', 'yellow'];
    
    onStart(activePlayers, types);
  };

  const toggleType = (color: PlayerColor) => {
    setTypes(prev => ({ ...prev, [color]: prev[color] === 'human' ? 'computer' : 'human' }));
  };

  return (
    <div className="min-h-[100dvh] bg-[#1c2331] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#1c2331] to-[#1c2331] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 drop-shadow-md tracking-wide">
          NOMBRE DE JOUEURS
        </h2>
        
        {/* Player Count Selection */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
          {[2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setPlayerCount(num as 2|3|4)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold border-2 sm:border-[3px] transition-all
                ${playerCount === num 
                  ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110 text-white' 
                  : 'bg-white/5 border-white/20 text-white/50 hover:bg-white/10 hover:border-white/30'
                }
              `}
            >
              {num}P
            </button>
          ))}
        </div>

        {/* Player Types Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 min-h-[220px]">
          {PLAYER_COLORS.map(color => {
            const isActive = 
              (playerCount === 2 && (color === 'green' || color === 'blue')) ||
              (playerCount === 3 && color !== 'yellow') ||
              (playerCount === 4);
              
            if (!isActive) return <div key={color} className="opacity-0 pointer-events-none transition-all duration-300" />;

            const bgGradients = {
               green: 'from-[#4CAF50] to-[#2E7D32] border-[#8BC34A]/50',
               red: 'from-[#F44336] to-[#C62828] border-[#EF5350]/50',
               blue: 'from-[#2196F3] to-[#1565C0] border-[#64B5F6]/50',
               yellow: 'from-[#FFC107] to-[#F57F17] border-[#FFD54F]/50'
            };

            return (
              <button
                key={color}
                onClick={() => toggleType(color)}
                className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 bg-gradient-to-br shadow-lg transition-transform hover:scale-105 active:scale-95 ${bgGradients[color]}`}
              >
                {types[color] === 'human' 
                  ? <User size={40} className="text-white drop-shadow-md sm:w-[48px] sm:h-[48px]" /> 
                  : <Bot size={40} className="text-white drop-shadow-md sm:w-[48px] sm:h-[48px]" />
                }
                <span className="text-white font-bold text-base sm:text-lg drop-shadow-md uppercase tracking-wider">
                  {types[color] === 'human' ? 'Humain' : 'Ordi'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button onClick={onBack} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 hover:bg-white/20 active:scale-95 transition-all shadow-lg text-white">
            <span className="text-3xl font-black rotate-180 drop-shadow-md">➜</span>
          </button>
          
          <button onClick={handleStart} className="flex-1 h-14 bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] rounded-2xl flex items-center justify-center gap-2 text-xl font-black border-2 border-[#8BC34A]/50 shadow-[0_0_20px_rgba(76,175,80,0.4)] hover:shadow-[0_0_30px_rgba(76,175,80,0.6)] hover:scale-[1.02] active:scale-95 transition-all tracking-widest text-white group overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span>JOUER</span>
            <Play fill="currentColor" size={20} className="drop-shadow-md" />
          </button>
        </div>
      </div>
    </div>
  );
};
