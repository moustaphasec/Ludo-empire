import React from 'react';
import { SAFE_SQUARES } from '../game/constants';
import { Star } from 'lucide-react';

interface BoardProps {
  children?: React.ReactNode;
}

const getCellColor = (row: number, col: number) => {
  if (row < 6 && col < 6) return 'bg-[#4CAF50]';
  if (row < 6 && col > 8) return 'bg-[#F44336]';
  if (row > 8 && col < 6) return 'bg-[#FFEB3B]';
  if (row > 8 && col > 8) return 'bg-[#2196F3]';

  if (row === 7 && col > 0 && col < 6) return 'bg-[#4CAF50]';
  if (col === 7 && row > 0 && row < 6) return 'bg-[#F44336]';
  if (row === 7 && col > 8 && col < 14) return 'bg-[#2196F3]';
  if (col === 7 && row > 8 && row < 14) return 'bg-[#FFEB3B]';

  if (row === 6 && col === 1) return 'bg-[#4CAF50]';
  if (row === 1 && col === 8) return 'bg-[#F44336]';
  if (row === 8 && col === 13) return 'bg-[#2196F3]';
  if (row === 13 && col === 6) return 'bg-[#FFEB3B]';

  return 'bg-[#f0f0f0]';
};

const isSafe = (row: number, col: number) => {
  return SAFE_SQUARES.some(s => s[0] === row && s[1] === col);
};

export const Board: React.FC<BoardProps> = ({ children }) => {
  const pathCells: {row: number, col: number}[] = [];
  for(let r=0; r<6; r++) for(let c=6; c<9; c++) pathCells.push({row: r, col: c});
  for(let r=9; r<15; r++) for(let c=6; c<9; c++) pathCells.push({row: r, col: c});
  for(let r=6; r<9; r++) for(let c=0; c<6; c++) pathCells.push({row: r, col: c});
  for(let r=6; r<9; r++) for(let c=9; c<15; c++) pathCells.push({row: r, col: c});

  return (
    <div className="relative w-full h-full border-[12px] md:border-[16px] border-[#37474f] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden grid grid-cols-15 grid-rows-15">
      
      {/* Bases */}
      <div className="col-start-1 col-end-7 row-start-1 row-end-7 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] p-4 relative border-r-2 border-b-2 border-slate-700/50">
        <div className="w-full h-full bg-[#4CAF50]/20 rounded-xl flex items-center justify-center p-4">
           <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center shadow-inner">
             <div className="grid grid-cols-2 gap-8 p-4 w-full h-full">
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
             </div>
           </div>
        </div>
      </div>
      <div className="col-start-10 col-end-16 row-start-1 row-end-7 bg-gradient-to-bl from-[#F44336] to-[#C62828] p-4 relative border-l-2 border-b-2 border-slate-700/50">
        <div className="w-full h-full bg-[#F44336]/20 rounded-xl flex items-center justify-center p-4">
           <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center shadow-inner">
             <div className="grid grid-cols-2 gap-8 p-4 w-full h-full">
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
             </div>
           </div>
        </div>
      </div>
      <div className="col-start-1 col-end-7 row-start-10 row-end-16 bg-gradient-to-tr from-[#FFEB3B] to-[#FBC02D] p-4 relative border-r-2 border-t-2 border-slate-700/50">
        <div className="w-full h-full bg-[#FFEB3B]/20 rounded-xl flex items-center justify-center p-4">
           <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center shadow-inner">
             <div className="grid grid-cols-2 gap-8 p-4 w-full h-full">
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
             </div>
           </div>
        </div>
      </div>
      <div className="col-start-10 col-end-16 row-start-10 row-end-16 bg-gradient-to-tl from-[#2196F3] to-[#1565C0] p-4 relative border-l-2 border-t-2 border-slate-700/50">
        <div className="w-full h-full bg-[#2196F3]/20 rounded-xl flex items-center justify-center p-4">
           <div className="w-full h-full border-2 border-white/20 rounded-lg flex items-center justify-center shadow-inner">
             <div className="grid grid-cols-2 gap-8 p-4 w-full h-full">
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
                <div className="rounded-full bg-black/20 shadow-inner" />
             </div>
           </div>
        </div>
      </div>

      {/* Center Box */}
      <div className="col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="0,0 100,0 50,50" fill="#F44336" />
          <polygon points="0,0 0,100 50,50" fill="#4CAF50" />
          <polygon points="0,100 100,100 50,50" fill="#FFEB3B" />
          <polygon points="100,0 100,100 50,50" fill="#2196F3" />
        </svg>
      </div>

      {/* Path Cells */}
      {pathCells.map(cell => {
        const bg = getCellColor(cell.row, cell.col);
        const safe = isSafe(cell.row, cell.col);
        return (
          <div 
            key={`${cell.row}-${cell.col}`}
            className={`border-[1px] border-slate-300 ${bg} flex items-center justify-center relative shadow-sm`}
            style={{ gridColumnStart: cell.col + 1, gridRowStart: cell.row + 1 }}
          >
            {safe && <Star className="text-gray-800 opacity-60 w-3/4 h-3/4 fill-current" />}
            {cell.row === 6 && cell.col === 1 && <span className="text-white font-black text-2xl drop-shadow-md">➔</span>}
            {cell.row === 1 && cell.col === 8 && <span className="text-white font-black text-2xl drop-shadow-md rotate-90">➔</span>}
            {cell.row === 8 && cell.col === 13 && <span className="text-white font-black text-2xl drop-shadow-md rotate-180">➔</span>}
            {cell.row === 13 && cell.col === 6 && <span className="text-white font-black text-2xl drop-shadow-md -rotate-90">➔</span>}
          </div>
        );
      })}

      {/* Children (Tokens) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
};
