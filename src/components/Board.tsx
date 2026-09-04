import React from 'react';
import { SAFE_SQUARES } from '../game/constants';
import { Crown, Sparkles } from 'lucide-react';

interface BoardProps {
  children?: React.ReactNode;
}

const getCellDetails = (row: number, col: number) => {
  // Bases (handled separately)
  if (row < 6 && col < 6) return { color: 'green', type: 'base' };
  if (row < 6 && col > 8) return { color: 'red', type: 'base' };
  if (row > 8 && col < 6) return { color: 'yellow', type: 'base' };
  if (row > 8 && col > 8) return { color: 'blue', type: 'base' };

  // Home stretches (escaliers)
  if (row === 7 && col > 0 && col < 6) return { color: 'green', type: 'home_stretch', step: col };
  if (col === 7 && row > 0 && row < 6) return { color: 'red', type: 'home_stretch', step: row };
  if (col === 7 && row > 8 && row < 14) return { color: 'yellow', type: 'home_stretch', step: 14 - row };
  if (row === 7 && col > 8 && col < 14) return { color: 'blue', type: 'home_stretch', step: 14 - col };

  // Starting squares
  if (row === 6 && col === 1) return { color: 'green', type: 'start', arrow: 'right' };
  if (row === 1 && col === 8) return { color: 'red', type: 'start', arrow: 'down' };
  if (row === 13 && col === 6) return { color: 'yellow', type: 'start', arrow: 'up' };
  if (row === 8 && col === 13) return { color: 'blue', type: 'start', arrow: 'left' };

  return { color: 'neutral', type: 'track' };
};

const isSafe = (row: number, col: number) => {
  return SAFE_SQUARES.some(s => s[0] === row && s[1] === col);
};

export const Board: React.FC<BoardProps> = ({ children }) => {
  const pathCells: { row: number; col: number }[] = [];
  for (let r = 0; r < 6; r++) for (let c = 6; c < 9; c++) pathCells.push({ row: r, col: c });
  for (let r = 9; r < 15; r++) for (let c = 6; c < 9; c++) pathCells.push({ row: r, col: c });
  for (let r = 6; r < 9; r++) for (let c = 0; c < 6; c++) pathCells.push({ row: r, col: c });
  for (let r = 6; r < 9; r++) for (let c = 9; c < 15; c++) pathCells.push({ row: r, col: c });

  return (
    <div className="relative w-full h-full p-2 sm:p-2.5 bg-gradient-to-br from-[#2c1d11] via-[#422a1d] to-[#1a110a] rounded-[1.75rem] shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_6px_rgba(0,0,0,0.8)] border-[3px] sm:border-4 border-[#d4af37]/60">
      
      {/* Corner Brass Studs */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-600 shadow-md border border-amber-800" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-600 shadow-md border border-amber-800" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-600 shadow-md border border-amber-800" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-600 shadow-md border border-amber-800" />

      {/* Main Board Grid */}
      <div className="relative w-full h-full bg-[#fdfbf7] rounded-xl overflow-hidden grid grid-cols-15 grid-rows-15 shadow-[inset_0_0_20px_rgba(0,0,0,0.35)] border border-amber-900/40">
        
        {/* GREEN BASE (Top-Left) */}
        <div className="col-start-1 col-end-7 row-start-1 row-end-7 p-2 sm:p-3 relative bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] border-r-[3px] border-b-[3px] border-[#064e3b] shadow-inner">
          <div className="w-full h-full bg-white/95 rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)] border-2 border-[#10b981]/40 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#10b981]/10 rounded-full blur-xl pointer-events-none" />
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#059669] uppercase flex items-center justify-between">
              <span>VERT</span>
              <span className="opacity-40 text-sm">☘️</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 w-full h-[75%] items-center justify-items-center">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#10b981]/25 to-[#047857]/40 p-1 flex items-center justify-center border-2 border-[#10b981] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)] relative">
                  <div className="w-4 h-4 rounded-full bg-[#10b981]/40 border border-white/60 shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RED BASE (Top-Right) */}
        <div className="col-start-10 col-end-16 row-start-1 row-end-7 p-2 sm:p-3 relative bg-gradient-to-bl from-[#ef4444] via-[#dc2626] to-[#b91c1c] border-l-[3px] border-b-[3px] border-[#7f1d1d] shadow-inner">
          <div className="w-full h-full bg-white/95 rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)] border-2 border-[#ef4444]/40 relative overflow-hidden">
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-[#ef4444]/10 rounded-full blur-xl pointer-events-none" />
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#dc2626] uppercase flex items-center justify-between">
              <span className="opacity-40 text-sm">🔥</span>
              <span>ROUGE</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 w-full h-[75%] items-center justify-items-center">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#ef4444]/25 to-[#b91c1c]/40 p-1 flex items-center justify-center border-2 border-[#ef4444] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)] relative">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]/40 border border-white/60 shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* YELLOW BASE (Bottom-Left) */}
        <div className="col-start-1 col-end-7 row-start-10 row-end-16 p-2 sm:p-3 relative bg-gradient-to-tr from-[#eab308] via-[#ca8a04] to-[#a16207] border-r-[3px] border-t-[3px] border-[#713f12] shadow-inner">
          <div className="w-full h-full bg-white/95 rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)] border-2 border-[#eab308]/40 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#eab308]/10 rounded-full blur-xl pointer-events-none" />
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#ca8a04] uppercase flex items-center justify-between">
              <span>JAUNE</span>
              <span className="opacity-40 text-sm">☀️</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 w-full h-[75%] items-center justify-items-center">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#eab308]/25 to-[#a16207]/40 p-1 flex items-center justify-center border-2 border-[#eab308] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)] relative">
                  <div className="w-4 h-4 rounded-full bg-[#eab308]/40 border border-white/60 shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BLUE BASE (Bottom-Right) */}
        <div className="col-start-10 col-end-16 row-start-10 row-end-16 p-2 sm:p-3 relative bg-gradient-to-tl from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] border-l-[3px] border-t-[3px] border-[#1e3a8a] shadow-inner">
          <div className="w-full h-full bg-white/95 rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.1)] border-2 border-[#3b82f6]/40 relative overflow-hidden">
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-[#3b82f6]/10 rounded-full blur-xl pointer-events-none" />
            <div className="text-[10px] sm:text-xs font-black tracking-widest text-[#2563eb] uppercase flex items-center justify-between">
              <span className="opacity-40 text-sm">⚡</span>
              <span>BLEU</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 w-full h-[75%] items-center justify-items-center">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-[#3b82f6]/25 to-[#1d4ed8]/40 p-1 flex items-center justify-center border-2 border-[#3b82f6] shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.15)] relative">
                  <div className="w-4 h-4 rounded-full bg-[#3b82f6]/40 border border-white/60 shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER BOX (Goal & Crown Medallion) */}
        <div className="col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden flex items-center justify-center border-2 border-[#d4af37] shadow-[inset_0_0_15px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="center-red" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="center-green" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>
              <linearGradient id="center-yellow" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="center-blue" x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>
            <polygon points="0,0 100,0 50,50" fill="url(#center-red)" stroke="#d4af37" strokeWidth="0.8" />
            <polygon points="0,0 0,100 50,50" fill="url(#center-green)" stroke="#d4af37" strokeWidth="0.8" />
            <polygon points="0,100 100,100 50,50" fill="url(#center-yellow)" stroke="#d4af37" strokeWidth="0.8" />
            <polygon points="100,0 100,100 50,50" fill="url(#center-blue)" stroke="#d4af37" strokeWidth="0.8" />
          </svg>

          {/* Golden Trophy / Crown Medallion in Center */}
          <div className="absolute w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#b45309] via-[#fbbf24] to-[#fef08a] border-2 border-yellow-100 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.6)] flex items-center justify-center transform hover:rotate-12 transition-transform">
            <Crown size={18} className="text-amber-950 fill-amber-950 drop-shadow-sm sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* PATH CELLS */}
        {pathCells.map(cell => {
          const details = getCellDetails(cell.row, cell.col);
          const safe = isSafe(cell.row, cell.col);

          let cellBackground = 'bg-white/90';
          let borderStyle = 'border-slate-300/80';
          let content = null;

          if (details.type === 'home_stretch') {
            if (details.color === 'green') cellBackground = 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white';
            if (details.color === 'red') cellBackground = 'bg-gradient-to-b from-[#ef4444] to-[#dc2626] text-white';
            if (details.color === 'yellow') cellBackground = 'bg-gradient-to-t from-[#eab308] to-[#ca8a04] text-white';
            if (details.color === 'blue') cellBackground = 'bg-gradient-to-l from-[#3b82f6] to-[#2563eb] text-white';
            borderStyle = 'border-white/30';
            content = (
              <span className="text-[10px] sm:text-xs font-black opacity-80 select-none">
                {details.step}
              </span>
            );
          } else if (details.type === 'start') {
            if (details.color === 'green') cellBackground = 'bg-gradient-to-br from-[#10b981] to-[#047857] text-white';
            if (details.color === 'red') cellBackground = 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white';
            if (details.color === 'yellow') cellBackground = 'bg-gradient-to-br from-[#eab308] to-[#a16207] text-white';
            if (details.color === 'blue') cellBackground = 'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white';
            borderStyle = 'border-white/40 shadow-sm';
            
            const rotations: Record<string, string> = { right: '', down: 'rotate-90', up: '-rotate-90', left: 'rotate-180' };
            content = (
              <span className={`text-white font-black text-sm sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${rotations[details.arrow || '']}`}>
                ➔
              </span>
            );
          } else if (safe) {
            cellBackground = 'bg-amber-50/90';
            content = (
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="absolute w-5 h-5 rounded-full bg-amber-400/20 blur-sm" />
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 drop-shadow-[0_1px_3px_rgba(217,119,6,0.5)]" />
              </div>
            );
          }

          return (
            <div
              key={`${cell.row}-${cell.col}`}
              className={`border-[0.5px] sm:border-[1px] ${borderStyle} ${cellBackground} flex items-center justify-center relative shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.06)]`}
              style={{ gridColumnStart: cell.col + 1, gridRowStart: cell.row + 1 }}
            >
              {content}
            </div>
          );
        })}

        {/* Children (Tokens on top) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
};

