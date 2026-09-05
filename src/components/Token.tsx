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
  isHunter?: boolean;
}

export const Token: React.FC<TokenProps> = ({
  id,
  color,
  row,
  col,
  onClick,
  isPlayable,
  offsetIndex = 0,
  totalOnCell = 1,
  isGhost,
  isHunter
}) => {
  let offsetX = 0;
  let offsetY = 0;

  if (totalOnCell > 1) {
    const angle = (Math.PI * 2 * offsetIndex) / totalOnCell;
    const radius = 0.28;
    offsetX = Math.cos(angle) * radius;
    offsetY = Math.sin(angle) * radius;
  }

  const top = `${((row + 0.5 + offsetY) / 15) * 100}%`;
  const left = `${((col + 0.5 + offsetX) / 15) * 100}%`;

  // Gradients and colors config
  const colorGradients = {
    green: {
      light: '#34d399',
      mid: '#059669',
      dark: '#064e3b',
      glow: 'rgba(16, 185, 129, 0.6)',
      ring: '#10b981'
    },
    red: {
      light: '#f87171',
      mid: '#dc2626',
      dark: '#7f1d1d',
      glow: 'rgba(239, 68, 68, 0.6)',
      ring: '#ef4444'
    },
    blue: {
      light: '#60a5fa',
      mid: '#2563eb',
      dark: '#1e3a8a',
      glow: 'rgba(59, 130, 246, 0.6)',
      ring: '#3b82f6'
    },
    yellow: {
      light: '#fde047',
      mid: '#d97706',
      dark: '#78350f',
      glow: 'rgba(234, 179, 8, 0.6)',
      ring: '#eab308'
    }
  };

  const currentTheme = colorGradients[color];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ top, left, scale: 1, opacity: 1 }}
      transition={{
        top: { type: 'spring', stiffness: 220, damping: 22, mass: 0.8 },
        left: { type: 'spring', stiffness: 220, damping: 22, mass: 0.8 },
        scale: { type: 'spring', stiffness: 350, damping: 18 }
      }}
      onClick={isPlayable || isGhost ? onClick : undefined}
      className={`absolute w-[5.5%] h-[5.5%] -ml-[2.75%] -mt-[3.75%] pointer-events-auto flex items-center justify-center 
        ${isPlayable ? 'cursor-pointer z-30 group' : 'z-20'}
        ${isGhost ? 'opacity-65 cursor-pointer z-40' : ''}
      `}
    >
      {/* Ground Aura / Pulsing Ring when Playable */}
      {isPlayable && !isHunter && (
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-yellow-300 bg-yellow-400/30 blur-[1px] pointer-events-none"
        />
      )}

      {/* Predator / Hunter Aura in Enemy Stairs */}
      {isHunter && !isGhost && (
        <>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-rose-500 bg-rose-600/35 blur-[2px] pointer-events-none"
          />
          <motion.div
            animate={{ y: [-3, 1, -3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-6 px-1.5 py-0.5 rounded-full bg-rose-950/95 border border-rose-500/80 text-[9px] font-black text-rose-300 flex items-center gap-1 shadow-lg pointer-events-none z-50 whitespace-nowrap"
          >
            <span>⚔️</span>
            <span>CHASSEUR</span>
          </motion.div>
        </>
      )}

      {/* Target Ghost Marker */}
      {isGhost && (
        <>
          <div
            className={`absolute -bottom-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-dashed ${
              isHunter ? 'border-rose-400 bg-rose-600/40' : 'border-white bg-white/30'
            } animate-spin`}
            style={{ animationDuration: isHunter ? '4s' : '6s' }}
          />
          {isHunter && (
            <div className="absolute -top-5 px-1.5 py-0.5 rounded-md bg-rose-950/95 border border-rose-500 text-[8px] font-black text-rose-200 flex items-center gap-0.5 shadow-md pointer-events-none whitespace-nowrap">
              <span>⚔️</span>
              <span>CHASSE</span>
            </div>
          )}
        </>
      )}

      {/* Token Body Motion (Bobbing when playable) */}
      <motion.div
        animate={isPlayable ? { y: [0, -9, 0] } : { y: 0 }}
        transition={{ duration: 0.9, repeat: isPlayable ? Infinity : 0, ease: 'easeInOut' }}
        className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-115"
      >
        {/* Ground Contact Shadow */}
        <div className="absolute -bottom-1.5 w-6 h-2 sm:w-7 sm:h-2.5 bg-black/45 rounded-full blur-[2px] pointer-events-none" />

        {/* 3D Pawn SVG */}
        <svg
          viewBox="0 0 100 130"
          className="w-[220%] h-[220%] absolute -top-[65%] -left-[60%] pointer-events-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.55)]"
        >
          <defs>
            {/* Radial gradient for sphere head */}
            <radialGradient id={`head-grad-${color}-${id}`} cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor={currentTheme.light} />
              <stop offset="55%" stopColor={currentTheme.mid} />
              <stop offset="100%" stopColor={currentTheme.dark} />
            </radialGradient>

            {/* Linear gradient for body stem */}
            <linearGradient id={`body-grad-${color}-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={currentTheme.dark} />
              <stop offset="25%" stopColor={currentTheme.mid} />
              <stop offset="55%" stopColor={currentTheme.light} />
              <stop offset="85%" stopColor={currentTheme.mid} />
              <stop offset="100%" stopColor={currentTheme.dark} />
            </linearGradient>

            {/* Gold metallic collar / base ring */}
            <linearGradient id={`gold-ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* 1. Base pedestal */}
          <ellipse cx="50" cy="112" rx="34" ry="12" fill={`url(#gold-ring-${id})`} />
          <ellipse cx="50" cy="108" rx="32" ry="11" fill={`url(#body-grad-${color}-${id})`} stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

          {/* 2. Lower body bevel */}
          <path
            d="M 24 108 C 26 95, 34 85, 42 75 L 58 75 C 66 85, 74 95, 76 108 Z"
            fill={`url(#body-grad-${color}-${id})`}
          />

          {/* 3. Neck / Waist Ring (Gold Collar) */}
          <ellipse cx="50" cy="74" rx="17" ry="5" fill={`url(#gold-ring-${id})`} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
          <ellipse cx="50" cy="72" rx="15" ry="4" fill={`url(#body-grad-${color}-${id})`} />

          {/* 4. Upper body stem */}
          <path
            d="M 40 73 C 41 62, 43 55, 45 46 L 55 46 C 57 55, 59 62, 60 73 Z"
            fill={`url(#body-grad-${color}-${id})`}
          />

          {/* 5. Head Collar Bead */}
          <ellipse cx="50" cy="46" rx="14" ry="4" fill={`url(#gold-ring-${id})`} />

          {/* 6. Spherical Head */}
          <circle
            cx="50"
            cy="26"
            r="19"
            fill={`url(#head-grad-${color}-${id})`}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.7"
          />

          {/* 7. Specular Glints & Candy Highlights */}
          {/* Main off-center gloss spot */}
          <ellipse cx="43" cy="19" rx="6" ry="3.5" fill="#ffffff" opacity="0.85" transform="rotate(-30 43 19)" />
          {/* Secondary micro glint */}
          <circle cx="51" cy="14" r="1.8" fill="#ffffff" opacity="0.6" />
          {/* Body curved light sheen */}
          <path
            d="M 45 80 C 42 90, 36 98, 30 104"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          {/* Bottom rim bounce light */}
          <ellipse cx="50" cy="114" rx="26" ry="4" fill="#ffffff" opacity="0.25" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

