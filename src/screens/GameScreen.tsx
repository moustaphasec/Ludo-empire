import React, { useState, useEffect } from 'react';
import { Board } from '../components/Board';
import { Token as TokenComponent } from '../components/Token';
import { Dice } from '../components/Dice';
import { motion } from 'framer-motion';
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
  Token
} from '../game/engine';
import { PlayerColor, BASE_POSITIONS } from '../game/constants';
import { Users, User, Bot, LogOut } from 'lucide-react';

import { playSound } from '../utils/audio';

interface GameScreenProps {
  players: PlayerColor[];
  playerTypes: Record<PlayerColor, 'human' | 'computer'>;
  onQuit: () => void;
}

const colorStyles: Record<PlayerColor, string> = {
  green: 'bg-[#4CAF50] text-white',
  red: 'bg-[#F44336] text-white',
  blue: 'bg-[#2196F3] text-white',
  yellow: 'bg-[#FFEB3B] text-white'
};

export const GameScreen: React.FC<GameScreenProps> = ({ players, playerTypes, onQuit }) => {
  const [gameState, setGameState] = useState<GameState>(createInitialState(players, playerTypes));
  const [rolling, setRolling] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [animatingTokenId, setAnimatingTokenId] = useState<string | null>(null);

  const currentPlayerColor = gameState.players[gameState.turnIndex];
  const isComputerTurn = gameState.playerTypes[currentPlayerColor] === 'computer';
  const winner = gameState.winner;

  const playMoveAnimation = (tokenId: string, move: { destination: Token, path: Token[] }) => {
    setAnimatingTokenId(tokenId);
    if (move.path.length <= 1) {
       playSound('move');
       setGameState(prev => executeMove(prev, tokenId, move.destination));
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
          setGameState(prev => executeMove(prev, tokenId, move.destination));
          setAnimatingTokenId(null);
       }
    }, 200); // 200ms per step
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
                 const move = moves.find(m => m.destination.state === aiAction.destination.state && m.destination.position === aiAction.destination.position);
                 if (move) {
                    playMoveAnimation(aiAction.tokenId, move);
                 } else {
                    setGameState(prev => executeMove(prev, aiAction.tokenId, aiAction.destination));
                 }
             }
          } else if (!aiAction) {
             setGameState(advanceTurn(gameState));
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      if (gameState.hasRolled && !animatingTokenId) {
        const validTokens = getTokensWithMoves(gameState, currentPlayerColor);
        if (validTokens.length === 0) {
           const timer = setTimeout(() => {
             setGameState(advanceTurn(gameState));
           }, 1500);
           return () => clearTimeout(timer);
        } else if (validTokens.length === 1 && !selectedTokenId) {
           // Auto select if only 1 choice
           const moves = getValidMoves(validTokens[0], gameState.diceValue!);
           if (moves.length === 1) {
              const timer = setTimeout(() => {
                 playMoveAnimation(validTokens[0].id, moves[0]);
              }, 400);
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
      const diceValue = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => ({ ...prev, hasRolled: true, diceValue }));
    }, 600);
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
       setSelectedTokenId(tokenId);
    }
  };

  const handleGhostClick = (destination: Token) => {
    if (!selectedTokenId || animatingTokenId) return;
    const token = gameState.tokens.find(t => t.id === selectedTokenId);
    if (!token) return;
    
    const moves = getValidMoves(token, gameState.diceValue!);
    const move = moves.find(m => m.destination.state === destination.state && m.destination.position === destination.position);
    
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

  const validPlayableTokens = gameState.hasRolled && !isComputerTurn && !winner
    ? getTokensWithMoves(gameState, currentPlayerColor)
    : [];

  let ghostDestinations: Token[] = [];
  if (selectedTokenId) {
     const t = gameState.tokens.find(t => t.id === selectedTokenId);
     if (t) ghostDestinations = getValidDestinations(t, gameState.diceValue!);
  }

  return (
    <div className="h-[100dvh] bg-[#241c2c] flex flex-col p-2 sm:p-4 relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 w-full flex justify-between items-center mb-2 shrink-0">
        <button onClick={onQuit} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border-2 border-slate-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-transform">
           <LogOut size={20} />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-[500px] mx-auto flex flex-col justify-between items-center py-1 gap-2">
         
         {/* Top Players */}
         <div className="flex justify-between w-full px-2 shrink-0">
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
         </div>
         
         {/* Board */}
         <div className="w-full max-h-[60vh] aspect-square flex justify-center items-center shrink">
            <div className="h-full aspect-square relative">
               <Board>
                 {gameState.tokens.map((token) => {
                   let row = 0, col = 0, offsetIndex = 0, totalOnCell = 1;

                   if (token.state === 'base') {
                     const tokenIdx = parseInt(token.id.split('-')[1]);
                     row = BASE_POSITIONS[token.color][tokenIdx][0];
                     col = BASE_POSITIONS[token.color][tokenIdx][1];
                   } else {
                     const coords = getTokenAbsoluteCoords(token);
                     if (coords) {
                       row = coords[0]; col = coords[1];
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
         </div>

         {/* Bottom Players */}
         <div className="flex justify-between w-full px-2 shrink-0">
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
         </div>
      </div>

      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 border-2 border-slate-600 p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(255,215,0,0.5)] transform scale-110 text-white">
            <h2 className="text-4xl font-black mb-4 text-yellow-400">Victoire!</h2>
            <p className="text-2xl mb-8 capitalize font-bold">Le joueur {winner} a gagné!</p>
            <button 
              onClick={onQuit}
              className="bg-gradient-to-b from-[#4CAF50] to-[#2E7D32] border-[3px] border-[#8BC34A] text-white px-8 py-4 rounded-xl text-xl font-bold hover:scale-105 transition shadow-lg"
            >
              Menu Principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PlayerCorner = ({ color, isCurrent, gameState, handleRoll, rolling, isActive }: { color: PlayerColor, isCurrent: boolean, gameState: GameState, handleRoll: () => void, rolling: boolean, isActive: boolean }) => {
  if (!isActive) return <div className="w-1/2 opacity-0 pointer-events-none" />;

  const isLeft = color === 'green' || color === 'yellow';
  const type = gameState.playerTypes[color];
  const stats = gameState.stats[color];
  const isComputerTurn = gameState.playerTypes[gameState.players[gameState.turnIndex]] === 'computer';
  
  return (
    <div className={`flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-center gap-3 w-1/2 ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
       <div className={`flex flex-col items-center bg-slate-800/90 px-3 py-2 rounded-2xl border-[3px] transition-all shadow-xl
         ${isCurrent ? `border-${color}-500 ring-4 ring-${color}-500/30 scale-105 z-20` : 'border-slate-700 opacity-90'}
       `}>
          <div className="flex gap-3 text-white mb-2 bg-black/40 px-2 py-1 rounded-md w-full justify-center">
             <span className="text-[11px] font-bold flex items-center gap-1">⚔️ {stats.captures}</span>
             <span className="text-[11px] font-bold flex items-center gap-1">💀 {stats.lost}</span>
          </div>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-inner border border-white/30 bg-gradient-to-br ${
             color === 'green' ? 'from-[#4CAF50] to-[#2E7D32]' :
             color === 'red' ? 'from-[#F44336] to-[#C62828]' :
             color === 'blue' ? 'from-[#2196F3] to-[#1565C0]' :
             'from-[#FFEB3B] to-[#F57F17]'
          }`}>
             {type === 'human' ? <User size={28} className="text-white drop-shadow-md" /> : <Bot size={28} className="text-white drop-shadow-md" />}
          </div>
       </div>

       {isCurrent && (
          <div className="flex items-center gap-2 z-30">
             {!isLeft && !gameState.hasRolled && !isComputerTurn && !rolling && (
                <motion.div animate={{ x: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl drop-shadow-lg">
                   👉
                </motion.div>
             )}
             
             <Dice 
               value={gameState.diceValue} 
               rolling={rolling} 
               onClick={!isComputerTurn && !gameState.hasRolled && !rolling ? handleRoll : undefined} 
               color={color}
             />
             
             {isLeft && !gameState.hasRolled && !isComputerTurn && !rolling && (
                <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-4xl drop-shadow-lg">
                   👈
                </motion.div>
             )}
          </div>
       )}
    </div>
  );
};
