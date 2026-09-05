import React, { useState, useEffect } from 'react';
import { Board } from '../components/Board';
import { Token as TokenComponent } from '../components/Token';
import { Dice } from '../components/Dice';
import { ConfettiEffect, CelebrationType } from '../components/ConfettiEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GameState, 
  createInitialState, 
  executeMove, 
  getTokensWithMoves, 
  getValidDestinations, 
  getValidMoves, 
  getTokenAbsoluteCoords, 
  advanceTurn, 
  aiTakeTurn, 
  rollSmartDice,
  isAllPawnsInBase,
  Token 
} from '../game/engine';
import { PlayerColor, BASE_POSITIONS } from '../game/constants';
import { 
  User, 
  Bot, 
  LogOut, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  Swords, 
  ShieldAlert, 
  Trophy, 
  Sparkles,
  X,
  Smile
} from 'lucide-react';
import { playSound, isSoundEnabled, toggleSound } from '../utils/audio';

interface GameScreenProps {
  players: PlayerColor[];
  playerTypes: Record<PlayerColor, 'human' | 'computer'>;
  onQuit: () => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  color: PlayerColor;
}

export const GameScreen: React.FC<GameScreenProps> = ({ players, playerTypes, onQuit }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState(players, playerTypes));
  const [rolling, setRolling] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [animatingTokenId, setAnimatingTokenId] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [showRules, setShowRules] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [celebration, setCelebration] = useState<{ type: CelebrationType; timestamp: number } | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>("🎲 Bienvenue ! Que la meilleure stratégie l'emporte !");

  const currentPlayerColor = gameState.players[gameState.turnIndex];
  const isComputerTurn = gameState.playerTypes[currentPlayerColor] === 'computer';
  const winner = gameState.winner;

  const playerNames: Record<PlayerColor, string> = {
    green: 'Vert',
    red: 'Rouge',
    blue: 'Bleu',
    yellow: 'Jaune'
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playSound('click');
  };

  const handleRestart = () => {
    playSound('click');
    setGameState(createInitialState(players, playerTypes));
    setSelectedTokenId(null);
    setAnimatingTokenId(null);
    setBannerMessage("🔄 Nouvelle partie lancée !");
  };

  const triggerCelebration = (type: CelebrationType) => {
    setCelebration({ type, timestamp: Date.now() });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const triggerEmoji = (emoji: string) => {
    playSound('click');
    setShowEmojiPicker(false);
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      color: currentPlayerColor
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2500);
  };

  const playMoveAnimation = (tokenId: string, move: { destination: Token; path: Token[] }) => {
    setAnimatingTokenId(tokenId);

    // Detect invasion
    if (move.destination.state === 'detour') {
      setBannerMessage(`⚔️ INVASION ! ${playerNames[move.destination.color]} traque l'adversaire dans son escalier !`);
    }

    const applyFinalMove = (prev: GameState) => {
      const next = executeMove(prev, tokenId, move.destination);
      const prevCaptures = prev.stats[move.destination.color]?.captures || 0;
      const nextCaptures = next.stats[move.destination.color]?.captures || 0;
      if (nextCaptures > prevCaptures) {
        playSound('capture');
        triggerCelebration('capture');
        triggerShake();
        setBannerMessage(`💥 BOOM ! ${playerNames[move.destination.color]} a éliminé un pion ! Rejouez !`);
      } else if (next.winner) {
        playSound('win');
        triggerCelebration('win');
      } else if (prev.diceValue === 6) {
        playSound('bonus');
      }
      return next;
    };

    if (move.path.length <= 1) {
      playSound('move');
      setGameState(applyFinalMove);
      setAnimatingTokenId(null);
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      if (step < move.path.length - 1) {
        playSound('move');
        setGameState(prev => {
          const newTokens = [...prev.tokens];
          const idx = newTokens.findIndex(t => t.id === tokenId);
          if (idx > -1) newTokens[idx] = move.path[step];
          return { ...prev, tokens: newTokens };
        });
        step++;
      } else {
        clearInterval(interval);
        playSound('move');
        setGameState(applyFinalMove);
        setAnimatingTokenId(null);
      }
    }, 180);
  };

  useEffect(() => {
    if (winner) return;

    if (isComputerTurn) {
      const timer = setTimeout(() => {
        if (!gameState.hasRolled && !rolling && !animatingTokenId) {
          handleRoll();
        } else if (gameState.hasRolled && !animatingTokenId) {
          const aiAction = aiTakeTurn(gameState);
          if (aiAction && aiAction.action === 'move') {
            const token = gameState.tokens.find(t => t.id === aiAction.tokenId);
            if (token) {
              const moves = getValidMoves(token, gameState.diceValue!);
              const move = moves.find(
                m =>
                  m.destination.state === aiAction.destination.state &&
                  m.destination.position === aiAction.destination.position
              );
              if (move) {
                playMoveAnimation(aiAction.tokenId, move);
              } else {
                setGameState(prev => executeMove(prev, aiAction.tokenId, aiAction.destination));
              }
            }
          } else if (!aiAction) {
            // AI has no moves possible
            const inBase = isAllPawnsInBase(gameState, currentPlayerColor);
            playSound('miss');
            setBannerMessage(`Dé : ${gameState.diceValue}. Aucun coup possible pour ${playerNames[currentPlayerColor]}. Tour suivant...`);
            setGameState(prev => {
              const nextConsecutive = { ...prev.consecutiveTurnsWithoutExit };
              if (inBase) {
                nextConsecutive[currentPlayerColor] = (nextConsecutive[currentPlayerColor] || 0) + 1;
              }
              return advanceTurn({ ...prev, consecutiveTurnsWithoutExit: nextConsecutive });
            });
          }
        }
      }, 850);
      return () => clearTimeout(timer);
    } else {
      if (gameState.hasRolled && !animatingTokenId) {
        const validTokens = getTokensWithMoves(gameState, currentPlayerColor);
        if (validTokens.length === 0) {
          // Human has no moves possible
          const inBase = isAllPawnsInBase(gameState, currentPlayerColor);
          playSound('miss');
          setBannerMessage(`Dé : ${gameState.diceValue}. Aucun coup possible pour ${playerNames[currentPlayerColor]}. Tour suivant...`);
          const timer = setTimeout(() => {
            setGameState(prev => {
              const nextConsecutive = { ...prev.consecutiveTurnsWithoutExit };
              if (inBase) {
                nextConsecutive[currentPlayerColor] = (nextConsecutive[currentPlayerColor] || 0) + 1;
              }
              return advanceTurn({ ...prev, consecutiveTurnsWithoutExit: nextConsecutive });
            });
          }, 1100);
          return () => clearTimeout(timer);
        } else if (validTokens.length === 1 && !selectedTokenId) {
          const moves = getValidMoves(validTokens[0], gameState.diceValue!);
          if (moves.length === 1) {
            const timer = setTimeout(() => {
              playMoveAnimation(validTokens[0].id, moves[0]);
            }, 350);
            return () => clearTimeout(timer);
          }
        }
      }
    }
  }, [gameState, isComputerTurn, winner, selectedTokenId, animatingTokenId]);

  const handleRoll = () => {
    if (gameState.hasRolled || rolling || winner || animatingTokenId) return;
    if (!isComputerTurn && gameState.playerTypes[currentPlayerColor] !== 'human') return;

    playSound('roll');
    setRolling(true);
    setSelectedTokenId(null);

    setTimeout(() => {
      setRolling(false);
      const diceValue = rollSmartDice(gameState);
      if (diceValue === 6) {
        playSound('six');
        triggerCelebration('six');
        setBannerMessage(`🎉 6 ! Quelle chance ! ${playerNames[currentPlayerColor]} rejoue !`);
      } else {
        setBannerMessage(`Dé : ${diceValue}. Choisissez un pion à déplacer.`);
      }
      setGameState(prev => ({ ...prev, hasRolled: true, diceValue }));
    }, 550);
  };

  const handleTokenClick = (tokenId: string) => {
    if (winner || isComputerTurn || animatingTokenId) return;
    const token = gameState.tokens.find(t => t.id === tokenId);
    if (!token || token.color !== currentPlayerColor) return;

    const validTokens = getTokensWithMoves(gameState, currentPlayerColor);
    if (!validTokens.find(t => t.id === tokenId)) return;

    const moves = getValidMoves(token, gameState.diceValue!);
    if (moves.length === 1) {
      playMoveAnimation(tokenId, moves[0]);
      setSelectedTokenId(null);
    } else {
      playSound('click');
      setSelectedTokenId(tokenId);
      setBannerMessage("👉 Touchez une case de destination holographique.");
    }
  };

  const handleGhostClick = (destination: Token) => {
    if (!selectedTokenId || animatingTokenId) return;
    const token = gameState.tokens.find(t => t.id === selectedTokenId);
    if (!token) return;

    const moves = getValidMoves(token, gameState.diceValue!);
    const move = moves.find(
      m => m.destination.state === destination.state && m.destination.position === destination.position
    );

    if (move) {
      playMoveAnimation(selectedTokenId, move);
    }
    setSelectedTokenId(null);
  };

  const cellTokenList: Record<string, string[]> = {};
  gameState.tokens.forEach(t => {
    if (t.state !== 'base') {
      const coords = getTokenAbsoluteCoords(t);
      if (coords) {
        const key = `${coords[0]},${coords[1]}`;
        if (!cellTokenList[key]) cellTokenList[key] = [];
        cellTokenList[key].push(t.id);
      }
    }
  });

  const validPlayableTokens =
    gameState.hasRolled && !isComputerTurn && !winner
      ? getTokensWithMoves(gameState, currentPlayerColor)
      : [];

  let ghostDestinations: Token[] = [];
  if (selectedTokenId) {
    const t = gameState.tokens.find(t => t.id === selectedTokenId);
    if (t) ghostDestinations = getValidDestinations(t, gameState.diceValue!);
  }

  return (
    <div className="h-[100dvh] bg-[#121824] flex flex-col p-2 sm:p-3 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/35 via-slate-950/60 to-[#0b0f19] pointer-events-none" />

      {/* DYNAMIC CELEBRATION PARTICLES / CONFETTI */}
      <ConfettiEffect trigger={celebration} />

      {/* FLOATING EMOJIS */}
      {floatingEmojis.map(item => (
        <motion.div
          key={item.id}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -140, opacity: 0, scale: 1.6 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 text-5xl z-50 pointer-events-none filter drop-shadow-lg"
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* TOP INTERACTIVE HUD BAR */}
      <header className="relative z-20 w-full max-w-[620px] mx-auto flex items-center justify-between gap-2 px-1 sm:px-2 py-1 shrink-0">
        {/* Left Actions: Quit & Restart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              playSound('click');
              onQuit();
            }}
            title="Quitter la partie"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl flex items-center justify-center border border-white/20 text-white shadow-md transition-all"
          >
            <LogOut size={18} />
          </button>
          <button
            onClick={handleRestart}
            title="Recommencer la partie"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl flex items-center justify-center border border-white/20 text-amber-300 shadow-md transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Center: Live Notification Toast */}
        <motion.div
          key={bannerMessage}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 max-w-[280px] sm:max-w-[340px] px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-center text-white text-[11px] sm:text-xs font-semibold shadow-inner truncate"
        >
          {bannerMessage}
        </motion.div>

        {/* Right Actions: Emoji, Sound & Rules */}
        <div className="flex items-center gap-1.5 sm:gap-2 relative">
          {/* Quick Reaction Button */}
          <button
            onClick={() => setShowEmojiPicker(prev => !prev)}
            title="Envoyer une réaction"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl flex items-center justify-center border border-white/20 text-yellow-300 shadow-md transition-all"
          >
            <Smile size={18} />
          </button>

          {/* Emoji Picker Popover */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute right-0 top-12 bg-slate-900/95 border border-white/20 rounded-2xl p-2.5 shadow-2xl flex gap-2 z-50 backdrop-blur-xl"
              >
                {['😂', '🔥', '👑', '🎯', '💀', '👏'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => triggerEmoji(emoji)}
                    className="text-2xl hover:scale-130 active:scale-95 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? 'Couper le son' : 'Activer le son'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-md active:scale-95 ${
              soundOn
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                : 'bg-white/10 border-white/20 text-white/50'
            }`}
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Rules Modal Trigger */}
          <button
            onClick={() => {
              playSound('click');
              setShowRules(true);
            }}
            title="Règles du jeu"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl flex items-center justify-center border border-white/20 text-cyan-300 shadow-md transition-all"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-[620px] mx-auto flex flex-col justify-between items-center py-1 gap-1.5 sm:gap-2.5">
        
        {/* TOP PLAYERS ROW */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex justify-between w-full px-1 sm:px-2 shrink-0"
        >
          <PlayerCorner
            color="green"
            isCurrent={currentPlayerColor === 'green'}
            gameState={gameState}
            handleRoll={handleRoll}
            rolling={rolling}
            isActive={players.includes('green')}
          />
          <PlayerCorner
            color="red"
            isCurrent={currentPlayerColor === 'red'}
            gameState={gameState}
            handleRoll={handleRoll}
            rolling={rolling}
            isActive={players.includes('red')}
          />
        </motion.div>

        {/* BOARD CONTAINER */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={
            isShaking
              ? { x: [-7, 7, -5, 5, -2, 2, 0], y: [-3, 3, -2, 2, 0], scale: [1, 1.02, 1] }
              : { scale: 1, opacity: 1, x: 0, y: 0 }
          }
          transition={isShaking ? { duration: 0.35 } : { duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="w-full flex-1 max-h-[58vh] sm:max-h-[63vh] flex justify-center items-center shrink min-h-[290px]"
        >
          <div className="h-full aspect-square max-w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-[1.8rem]">
            <Board>
              {gameState.tokens.map(token => {
                let row = 0,
                  col = 0,
                  offsetIndex = 0,
                  totalOnCell = 1;

                if (token.state === 'base') {
                  const tokenIdx = parseInt(token.id.split('-')[1]);
                  row = BASE_POSITIONS[token.color][tokenIdx][0];
                  col = BASE_POSITIONS[token.color][tokenIdx][1];
                } else {
                  const coords = getTokenAbsoluteCoords(token);
                  if (coords) {
                    row = coords[0];
                    col = coords[1];
                    const key = `${row},${col}`;
                    totalOnCell = cellTokenList[key].length;
                    offsetIndex = cellTokenList[key].indexOf(token.id);
                  }
                }

                const isPlayable = validPlayableTokens.some(t => t.id === token.id);

                return (
                  <TokenComponent
                    key={token.id}
                    id={token.id}
                    color={token.color}
                    row={row}
                    col={col}
                    totalOnCell={totalOnCell}
                    offsetIndex={offsetIndex}
                    isPlayable={isPlayable && !selectedTokenId && !animatingTokenId}
                    onClick={() => handleTokenClick(token.id)}
                  />
                );
              })}

              {/* Holographic Ghost Movement Targets */}
              {ghostDestinations.map((dest, idx) => {
                const coords = getTokenAbsoluteCoords(dest);
                if (!coords) return null;
                return (
                  <TokenComponent
                    key={`ghost-${idx}`}
                    id={`ghost-${idx}`}
                    color={dest.color}
                    row={coords[0]}
                    col={coords[1]}
                    isGhost={true}
                    onClick={() => handleGhostClick(dest)}
                  />
                );
              })}
            </Board>
          </div>
        </motion.div>

        {/* BOTTOM PLAYERS ROW */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex justify-between w-full px-1 sm:px-2 shrink-0"
        >
          <PlayerCorner
            color="yellow"
            isCurrent={currentPlayerColor === 'yellow'}
            gameState={gameState}
            handleRoll={handleRoll}
            rolling={rolling}
            isActive={players.includes('yellow')}
          />
          <PlayerCorner
            color="blue"
            isCurrent={currentPlayerColor === 'blue'}
            gameState={gameState}
            handleRoll={handleRoll}
            rolling={rolling}
            isActive={players.includes('blue')}
          />
        </motion.div>
      </div>

      {/* RULES & EXCLUSIVE INVASION MODAL */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#1a2333] border-2 border-amber-500/40 w-full max-w-lg rounded-3xl p-5 sm:p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  playSound('click');
                  setShowRules(false);
                }}
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20 text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                    RÈGLES DE LUDO MODERNE
                  </h3>
                  <p className="text-xs text-slate-300">Classique & Mode Chasse Invasif</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm leading-relaxed text-slate-200">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span>🎲</span> Sortie de base & Déplacements
                  </h4>
                  <p className="text-xs text-slate-300">
                    Faites un <strong>6</strong> au dé pour faire sortir un pion de votre maison sur le plateau. Chaque 6 vous accorde un tour supplémentaire immédiat !
                  </p>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span>⭐</span> Cases Étoilées Sécurisées
                  </h4>
                  <p className="text-xs text-slate-300">
                    Les cases marquées d'une étoile dorée étincelante sont des zones de paix : aucun pion ne peut y être capturé !
                  </p>
                </div>

                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <span>🎯</span> Captures & Lancer Bonus
                  </h4>
                  <p className="text-xs text-slate-300">
                    Atterrissez sur la case d'un pion ennemi pour le renvoyer chez lui ! Toute capture réussie vous récompense d'un nouveau lancer immédiat.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-rose-900/40 to-amber-900/40 p-3.5 rounded-2xl border-2 border-rose-500/50 shadow-inner">
                  <h4 className="font-black text-rose-300 text-base mb-1 flex items-center gap-2">
                    <Swords size={18} className="text-rose-400" />
                    Règle Exclusive : Invasion & Chasse !
                  </h4>
                  <p className="text-xs text-rose-100 mb-1.5">
                    Lorsque vous atteignez l'entrée de l'escalier d'un adversaire, vous pouvez <strong>entrer dans son escalier</strong> pour le traquer et le capturer chez lui !
                  </p>
                  <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-rose-400/30 text-xs">
                    <ShieldAlert size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Pour redescendre :</strong> Après l'invasion, pour vous échapper de l'escalier ennemi, vous devez obtenir un <strong>6</strong> par marche !
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setShowRules(false);
                }}
                className="w-full mt-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black py-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                Compris, retour au jeu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WINNER VICTORY SCREEN */}
      {winner && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-yellow-400/60 p-8 rounded-[2.5rem] text-center shadow-[0_0_60px_rgba(234,179,8,0.35)] text-white w-full max-w-md relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-yellow-400/20 blur-2xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white flex items-center justify-center shadow-lg">
              <Trophy size={42} className="text-amber-950 fill-amber-950" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
              Victoire Royale !
            </h2>
            <p className="text-xl mb-6 text-slate-200">
              Le joueur <span className="font-black capitalize text-amber-300">{playerNames[winner]}</span> remporte la partie !
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white py-3.5 rounded-2xl text-lg font-black shadow-lg active:scale-95 transition-all"
              >
                Rejouer une partie
              </button>
              <button
                onClick={onQuit}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-2xl text-lg font-bold border border-white/20 active:scale-95 transition-all"
              >
                Menu Principal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

interface PlayerCornerProps {
  color: PlayerColor;
  isCurrent: boolean;
  gameState: GameState;
  handleRoll: () => void;
  rolling: boolean;
  isActive: boolean;
}

const PlayerCorner: React.FC<PlayerCornerProps> = ({
  color,
  isCurrent,
  gameState,
  handleRoll,
  rolling,
  isActive
}) => {
  if (!isActive) return <div className="w-1/2 opacity-0 pointer-events-none" />;

  const isLeft = color === 'green' || color === 'yellow';
  const type = gameState.playerTypes[color];
  const stats = gameState.stats[color];
  const isComputerTurn = gameState.playerTypes[gameState.players[gameState.turnIndex]] === 'computer';

  const colorLabels: Record<PlayerColor, string> = {
    green: 'Vert',
    red: 'Rouge',
    blue: 'Bleu',
    yellow: 'Jaune'
  };

  const bgGradients = {
    green: 'from-[#10b981] to-[#047857] border-[#34d399]/60',
    red: 'from-[#ef4444] to-[#b91c1c] border-[#f87171]/60',
    blue: 'from-[#3b82f6] to-[#1d4ed8] border-[#60a5fa]/60',
    yellow: 'from-[#eab308] to-[#a16207] border-[#fde047]/60'
  };

  const ringGlows = {
    green: 'ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    red: 'ring-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    blue: 'ring-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    yellow: 'ring-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
  };

  return (
    <div className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-2 sm:gap-3 w-1/2 ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
      {/* Player Profile Card */}
      <div
        className={`flex flex-col items-center bg-slate-900/80 backdrop-blur-md px-2.5 py-2 rounded-2xl border transition-all duration-300 relative
          ${isCurrent ? `ring-[3px] ${ringGlows[color]} border-transparent scale-105 z-20` : 'border-white/10 opacity-75'}
        `}
      >
        {/* Turn Active Pill */}
        {isCurrent && (
          <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-md animate-pulse">
            Son Tour
          </div>
        )}

        {/* Stats (Captures & Losses) */}
        <div className="flex gap-2 text-white mb-1.5 bg-black/40 px-2 py-0.5 rounded-lg w-full justify-center">
          <span className="text-[10px] font-black flex items-center gap-0.5 text-emerald-300" title="Captures réussies">
            ⚔️ {stats.captures}
          </span>
          <span className="text-[10px] font-black flex items-center gap-0.5 text-rose-300" title="Pions perdus">
            💀 {stats.lost}
          </span>
        </div>

        {/* Avatar Box with Gradient */}
        <div className="flex items-center gap-2">
          <div
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center shadow-lg border-2 bg-gradient-to-br ${bgGradients[color]}`}
          >
            {type === 'human' ? (
              <User size={22} className="text-white drop-shadow sm:w-6 sm:h-6" />
            ) : (
              <Bot size={22} className="text-white drop-shadow sm:w-6 sm:h-6" />
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-white font-black text-xs">{colorLabels[color]}</span>
            <span className="text-slate-400 text-[10px] font-medium">{type === 'human' ? 'Joueur' : 'Robot'}</span>
          </div>
        </div>
      </div>

      {/* DICE AREA (Only for Current Player) */}
      {isCurrent && (
        <div className="flex items-center gap-1.5 sm:gap-2 z-30">
          {!isLeft && !gameState.hasRolled && !isComputerTurn && !rolling && (
            <motion.div animate={{ x: [0, -6, 0] }} transition={{ duration: 0.9, repeat: Infinity }} className="text-xl sm:text-2xl drop-shadow">
              👉
            </motion.div>
          )}

          <div className="scale-85 sm:scale-100 origin-center">
            <Dice
              value={gameState.diceValue}
              rolling={rolling}
              onClick={!isComputerTurn && !gameState.hasRolled && !rolling ? handleRoll : undefined}
              color={color}
              canRoll={!gameState.hasRolled && !rolling}
            />
          </div>

          {isLeft && !gameState.hasRolled && !isComputerTurn && !rolling && (
            <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 0.9, repeat: Infinity }} className="text-xl sm:text-2xl drop-shadow">
              👈
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
