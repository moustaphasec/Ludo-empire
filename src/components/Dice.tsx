import React from 'react';
import { motion } from 'framer-motion';
import { PlayerColor } from '../game/constants';

interface DiceProps {
  value: number | null;
  rolling: boolean;
  onClick?: () => void;
  color?: PlayerColor;
}

export const Dice: React.FC<DiceProps> = ({ value, rolling, onClick, color }) => {
  const dots = value || 6;
  
  const getDotPositions = (v: number) => {
    switch(v) {
      case 1: return ['col-start-2 row-start-2'];
      case 2: return ['col-start-1 row-start-1', 'col-start-3 row-start-3'];
      case 3: return ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'];
      case 4: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 5: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 6: return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-2', 'col-start-3 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      default: return [];
    }
  };

  const colorStyles = {
    green: 'from-[#4CAF50] to-[#2E7D32] border-[#1B5E20] shadow-green-900',
    red: 'from-[#F44336] to-[#C62828] border-[#b71c1c] shadow-red-900',
    blue: 'from-[#2196F3] to-[#1565C0] border-[#0D47A1] shadow-blue-900',
    yellow: 'from-[#FFEB3B] to-[#F57F17] border-[#F57F17] shadow-yellow-900',
  };

  const activeColorStyle = color ? colorStyles[color] : 'from-slate-200 to-slate-400 border-slate-600 shadow-slate-800';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div
        onClick={onClick}
        animate={rolling 
          ? { 
              rotate: [0, 180, 360], 
              scale: [1, 1.2, 1],
              y: [0, -30, 0]
            } 
          : { rotate: 0, scale: 1, y: 0 }
        }
        transition={{ 
          duration: 0.4, 
          repeat: rolling ? Infinity : 0,
          ease: "easeInOut"
        }}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl shadow-[0_8px_15px_rgba(0,0,0,0.5)] border-b-4 border-r-2 bg-gradient-to-br ${activeColorStyle} grid grid-cols-3 grid-rows-3 p-2 gap-1 cursor-pointer relative overflow-hidden z-10`}
      >
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-xl pointer-events-none" />
        {value !== null || rolling ? getDotPositions(rolling ? Math.floor(Math.random() * 6) + 1 : dots).map((pos, i) => (
          <div key={i} className={`w-full h-full bg-white rounded-full shadow-inner ${pos}`} />
        )) : (
          <div className="col-span-3 row-span-3 flex items-center justify-center text-white font-bold text-xs text-center leading-tight drop-shadow-md">
            ROLL
          </div>
        )}
      </motion.div>
      
      {/* Dynamic floor shadow */}
      <motion.div 
        animate={rolling ? { scale: [1, 0.5, 1], opacity: [0.6, 0.2, 0.6] } : { scale: 1, opacity: 0.6 }}
        transition={{ duration: 0.4, repeat: rolling ? Infinity : 0, ease: "easeInOut" }}
        className="absolute -bottom-2 w-10 h-3 bg-black/50 rounded-full blur-[4px] z-0"
      />
    </div>
  );
};
