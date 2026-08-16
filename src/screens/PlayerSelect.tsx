import React, { useState } from 'react';
import { PlayerColor, PLAYER_COLORS } from '../game/constants';
import { Users, User, Bot, Play, Settings as SettingsIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-black text-center mb-8 text-yellow-400 drop-shadow-md">CHOISIR DES JOUEURS</h2>
        
        <div className="flex justify-center gap-6 mb-10">
          {[2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setPlayerCount(num as 2|3|4)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border-[3px] transition-all
                ${playerCount === num ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-slate-600 opacity-70'}
              `}
            >
              {num}P
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {PLAYER_COLORS.map(color => {
            const isActive = 
              (playerCount === 2 && (color === 'green' || color === 'blue')) ||
              (playerCount === 3 && color !== 'yellow') ||
              (playerCount === 4);
              
            if (!isActive) return <div key={color} className="opacity-0" />;

            const bgColors = {
               green: 'bg-green-500',
               red: 'bg-red-500',
               blue: 'bg-blue-500',
               yellow: 'bg-yellow-500'
            };

            return (
              <button
                key={color}
                onClick={() => toggleType(color)}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-[3px] border-white/20 shadow-lg transition-transform hover:scale-105 active:scale-95 ${bgColors[color]}`}
              >
                {types[color] === 'human' ? <User size={48} className="text-white drop-shadow-md" /> : <Bot size={48} className="text-white drop-shadow-md" />}
                <span className="text-white font-bold text-lg drop-shadow-md">{types[color] === 'human' ? 'Humain' : 'Ordi'}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={onBack} className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center border-[3px] border-green-400 hover:bg-green-400 shadow-lg">
            <span className="text-3xl font-black rotate-180">➜</span>
          </button>
          <button onClick={handleStart} className="flex-1 ml-4 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-2xl font-black border-[3px] border-green-400 hover:bg-green-400 shadow-lg tracking-widest text-white">
            JOUER
          </button>
        </div>
      </div>
    </div>
  );
};
