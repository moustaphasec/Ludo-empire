import React from 'react';
import { motion } from 'framer-motion';
import { PlayerColor } from '../game/constants';

interface TokenProps {
  id: string;
  color: PlayerColor;
  row: number;
  col: number;
  onClick?: () => void;
  isPlayable?: boolean;
  offsetIndex?: number;
  totalOnCell?: number;
  isGhost?: boolean;
}

export const Token: React.FC<TokenProps> = ({ id, color, row, col, onClick, isPlayable, offsetIndex = 0, totalOnCell = 1, isGhost }) => {
  let offsetX = 0;
  let offsetY = 0;
  
  if (totalOnCell > 1) {
     const angle = (Math.PI * 2 * offsetIndex) / totalOnCell;
     const radius = 0.25; 
     offsetX = Math.cos(angle) * radius;
     offsetY = Math.sin(angle) * radius;
  }

  const top = `${((row + 0.5 + offsetY) / 15) * 100}%`;
  const left = `${((col + 0.5 + offsetX) / 15) * 100}%`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ top, left, scale: 1, opacity: 1 }}
      transition={{ 
        top: { type: 'spring', stiffness: 200, damping: 20, mass: 0.8 },
        left: { type: 'spring', stiffness: 200, damping: 20, mass: 0.8 },
        scale: { type: 'spring', stiffness: 300, damping: 15 }
      }}
      onClick={isPlayable || isGhost ? onClick : undefined}
      className={`absolute w-[5%] h-[5%] -ml-[2.5%] -mt-[3.5%] pointer-events-auto flex items-center justify-center 
        ${isPlayable ? 'cursor-pointer z-30 group' : 'z-20'}
        ${isGhost ? 'opacity-50 cursor-pointer z-40 scale-75' : ''}
      `}
    >
      <motion.div 
        animate={isPlayable ? { y: [0, -10, 0] } : { y: 0 }} 
        transition={{ duration: 0.8, repeat: isPlayable ? Infinity : 0, ease: "easeInOut" }}
        className="w-full h-full absolute inset-0 flex items-center justify-center"
      >
        {isPlayable && (
          <div className="absolute -bottom-2 w-full h-[30%] bg-black/40 rounded-full blur-[2px] animate-pulse" />
        )}
        <svg viewBox="0 0 100 100" className="w-[200%] h-[200%] absolute -top-[50%] -left-[50%] pointer-events-none drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 group-hover:drop-shadow-[0_12px_12px_rgba(0,0,0,0.8)] transition-all duration-300">
           <defs>
            <radialGradient id={`grad-${color}-${id}`} cx="35%" cy="30%" r="65%">
              {color === 'green' && <><stop offset="0%" stopColor="#81c784"/><stop offset="100%" stopColor="#2e7d32"/></>}
              {color === 'red' && <><stop offset="0%" stopColor="#e57373"/><stop offset="100%" stopColor="#c62828"/></>}
              {color === 'blue' && <><stop offset="0%" stopColor="#64b5f6"/><stop offset="100%" stopColor="#1565c0"/></>}
              {color === 'yellow' && <><stop offset="0%" stopColor="#fff59d"/><stop offset="100%" stopColor="#f57f17"/></>}
            </radialGradient>
         </defs>
         {/* Base shadow */}
         <ellipse cx="50" cy="85" rx="30" ry="10" fill="rgba(0,0,0,0.3)" />
         {/* Base */}
         <path d="M 25 78 C 25 70, 40 65, 50 65 C 60 65, 75 70, 75 78 C 75 88, 25 88, 25 78 Z" fill={`url(#grad-${color}-${id})`} stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
         {/* Body */}
         <path d="M 38 66 L 43 45 C 43 45, 57 45, 57 45 L 62 66 Z" fill={`url(#grad-${color}-${id})`} />
         {/* Collar */}
         <ellipse cx="50" cy="45" rx="14" ry="4" fill={`url(#grad-${color}-${id})`} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
         {/* Head */}
         <circle cx="50" cy="27" r="15" fill={`url(#grad-${color}-${id})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
         {/* Highlights */}
         <ellipse cx="45" cy="22" rx="5" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-30 45 22)" />
         <path d="M 43 62 L 46 48" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
      </svg>
      </motion.div>

      {isGhost && (
         <div className="absolute inset-0 rounded-full ring-4 ring-white animate-ping"></div>
      )}
    </motion.div>
  );
};
