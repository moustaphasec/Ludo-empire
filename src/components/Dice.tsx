import React from 'react';
import { motion } from 'framer-motion';
import { PlayerColor } from '../game/constants';
import { Sparkles } from 'lucide-react';

interface DiceProps {
  value: number | null;
  rolling: boolean;
  onClick?: () => void;
  color?: PlayerColor;
  canRoll?: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, rolling, onClick, color, canRoll = true }) => {
  const dots = value || 6;

  const getDotPositions = (v: number) => {
    switch (v) {
      case 1:
        return ['col-start-2 row-start-2'];
      case 2:
        return ['col-start-1 row-start-1', 'col-start-3 row-start-3'];
      case 3:
        return ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'];
      case 4:
        return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 5:
        return ['col-start-1 row-start-1', 'col-start-3 row-start-1', 'col-start-2 row-start-2', 'col-start-1 row-start-3', 'col-start-3 row-start-3'];
      case 6:
        return [
          'col-start-1 row-start-1',
          'col-start-3 row-start-1',
          'col-start-1 row-start-2',
          'col-start-3 row-start-2',
          'col-start-1 row-start-3',
          'col-start-3 row-start-3'
        ];
      default:
        return [];
    }
  };

  const pipColors = {
    green: 'bg-[#047857] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
    red: 'bg-[#b91c1c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
    blue: 'bg-[#1d4ed8] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
    yellow: 'bg-[#b45309] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
  };

  const currentPipColor = color ? pipColors[color] : 'bg-slate-800 shadow-inner';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Clickable Invitation Pulse */}
      {onClick && canRoll && !rolling && (
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute -inset-2 rounded-2xl bg-amber-400/40 blur-sm pointer-events-none"
        />
      )}

      {/* Main Dice Cube */}
      <motion.div
        onClick={onClick}
        whileHover={onClick ? { scale: 1.08, rotate: 2 } : {}}
        whileTap={onClick ? { scale: 0.94 } : {}}
        animate={
          rolling
            ? {
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.25, 0.95, 1.15, 1],
                y: [0, -32, 4, -12, 0]
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        transition={{
          duration: 0.55,
          repeat: rolling ? Infinity : 0,
          ease: 'easeInOut'
        }}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] 
          shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(0,0,0,0.15)] 
          border-2 border-white/80 grid grid-cols-3 grid-rows-3 p-2 sm:p-2.5 gap-1 sm:gap-1.5 
          ${onClick ? 'cursor-pointer' : ''} relative overflow-hidden z-10`}
      >
        {/* Specular corner sheen */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl pointer-events-none" />

        {value !== null || rolling ? (
          getDotPositions(rolling ? Math.floor(Math.random() * 6) + 1 : dots).map((pos, i) => (
            <div
              key={i}
              className={`w-full h-full rounded-full ${currentPipColor} ${pos} border border-black/10 flex items-center justify-center`}
            >
              <div className="w-1 h-1 rounded-full bg-white/40 -mt-0.5 -ml-0.5" />
            </div>
          ))
        ) : (
          <div className="col-span-3 row-span-3 flex flex-col items-center justify-center text-slate-700 font-black text-[11px] sm:text-xs text-center leading-tight tracking-wider">
            <Sparkles size={14} className="text-amber-500 mb-0.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>LANCER</span>
          </div>
        )}
      </motion.div>

      {/* Dynamic floor shadow */}
      <motion.div
        animate={
          rolling
            ? { scale: [1, 0.45, 1.1, 0.6, 1], opacity: [0.6, 0.2, 0.7, 0.3, 0.6] }
            : { scale: 1, opacity: 0.55 }
        }
        transition={{ duration: 0.55, repeat: rolling ? Infinity : 0, ease: 'easeInOut' }}
        className="absolute -bottom-2.5 w-11 sm:w-13 h-3 bg-black/60 rounded-full blur-[3px] z-0 pointer-events-none"
      />
    </div>
  );
};

