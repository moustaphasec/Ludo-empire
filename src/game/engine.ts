import { PlayerColor, MAIN_PATH, START_INDICES, ENTRANCES, SAFE_SQUARES, HOME_STRETCHES } from './constants';

export type TokenState = 'base' | 'main' | 'home' | 'detour' | 'finished';

export interface Token {
  id: string;
  color: PlayerColor;
  state: TokenState;
  position: number;
  detourColor?: PlayerColor;
}

export interface GameState {
  players: PlayerColor[];
  playerTypes: Record<PlayerColor, 'human' | 'computer'>;
  tokens: Token[];
  turnIndex: number;
  diceValue: number | null;
  hasRolled: boolean;
  winner: PlayerColor | null;
  stats: Record<PlayerColor, { captures: number; lost: number }>;
  consecutiveTurnsWithoutExit: Record<PlayerColor, number>;
}

export const isAllPawnsInBase = (state: GameState, color: PlayerColor): boolean => {
  const playerTokens = state.tokens.filter(t => t.color === color && t.state !== 'finished');
  return playerTokens.length > 0 && playerTokens.every(t => t.state === 'base');
};

/**
 * Secret Smart Dice:
 * To the players, this appears completely random and governed by pure luck.
 * Under the hood, it secretly prevents bad RNG lockouts (players stuck in base)
 * and boosts high-stakes clashes and comebacks, keeping the game thrilling and dynamic.
 */
export const rollSmartDice = (state: GameState): number => {
  const currentPlayer = state.players[state.turnIndex];
  const inBase = isAllPawnsInBase(state, currentPlayer);

  // 1. Secret Base Exit Tuning (invisible to players)
  if (inBase) {
    const stuckTurns = state.consecutiveTurnsWithoutExit[currentPlayer] || 0;
    
    // If stuck for 2 turns in base, guaranteed 6 for maximum satisfaction!
    if (stuckTurns >= 2) {
      return 6;
    }
    // If stuck for 1 turn in base, 50% chance of 6
    if (stuckTurns === 1) {
      if (Math.random() < 0.50) return 6;
    } else {
      // First turn: 30% chance of 6 for an engaging, brisk kickoff
      if (Math.random() < 0.30) return 6;
    }

    const nonSixes = [1, 2, 3, 4, 5];
    return nonSixes[Math.floor(Math.random() * nonSixes.length)];
  }

  // 2. Secret Excitement & Action Tuning (promotes clashes, hunting & stair invasions!)
  const stairCaptureRolls: number[] = [];
  const normalCaptureRolls: number[] = [];
  const activeTokens = state.tokens.filter(t => t.color === currentPlayer && t.state !== 'base' && t.state !== 'finished');

  for (let d = 1; d <= 6; d++) {
    for (const token of activeTokens) {
      const dests = getValidDestinations(token, d);
      for (const dest of dests) {
        const coords = getTokenAbsoluteCoords(dest);
        if (!coords || isSafeSquare(coords)) continue;

        const capturesEnemy = state.tokens.some(enemy =>
          enemy.color !== currentPlayer &&
          enemy.state !== 'base' &&
          enemy.state !== 'finished' &&
          getTokenAbsoluteCoords(enemy)?.[0] === coords[0] &&
          getTokenAbsoluteCoords(enemy)?.[1] === coords[1]
        );

        if (capturesEnemy) {
          if (dest.state === 'detour') {
            stairCaptureRolls.push(d);
          } else {
            normalCaptureRolls.push(d);
          }
        }
      }
    }
  }

  // High-stakes boost: 55% chance to award a roll that triggers an invasion capture in opponent's stairs!
  if (stairCaptureRolls.length > 0 && Math.random() < 0.55) {
    return stairCaptureRolls[Math.floor(Math.random() * stairCaptureRolls.length)];
  }

  // 35% chance to award a regular track capture
  if (normalCaptureRolls.length > 0 && Math.random() < 0.35) {
    return normalCaptureRolls[Math.floor(Math.random() * normalCaptureRolls.length)];
  }

  // Standard fair roll
  return Math.floor(Math.random() * 6) + 1;
};

export const createInitialState = (
  players: PlayerColor[], 
  playerTypes: Record<PlayerColor, 'human' | 'computer'>
): GameState => {
  const tokens: Token[] = [];
  players.forEach(color => {
    for (let i = 0; i < 4; i++) {
      tokens.push({
        id: `${color}-${i}`,
        color,
        state: 'base',
        position: 0
      });
    }
  });

  const stats = {} as Record<PlayerColor, { captures: number; lost: number }>;
  const consecutiveTurnsWithoutExit = {} as Record<PlayerColor, number>;
  players.forEach(p => {
    stats[p] = { captures: 0, lost: 0 };
    consecutiveTurnsWithoutExit[p] = 0;
  });

  return {
    players,
    playerTypes,
    tokens,
    turnIndex: 0,
    diceValue: null,
    hasRolled: false,
    winner: null,
    stats,
    consecutiveTurnsWithoutExit
  };
};

export const getTokenAbsoluteCoords = (token: Token): number[] | null => {
  if (token.state === 'base') return null;
  if (token.state === 'finished') return [7, 7];
  if (token.state === 'main') return MAIN_PATH[token.position];
  if (token.state === 'home') return HOME_STRETCHES[token.color][token.position];
  if (token.state === 'detour' && token.detourColor) return HOME_STRETCHES[token.detourColor][token.position];
  return null;
};

const isSafeSquare = (coords: number[]) => {
  return SAFE_SQUARES.some(s => s[0] === coords[0] && s[1] === coords[1]);
};

export const getValidMoves = (token: Token, diceValue: number): { destination: Token, path: Token[] }[] => {
  if (token.state === 'base') {
    if (diceValue === 6) {
      const dest = { ...token, state: 'main', position: START_INDICES[token.color] } as Token;
      return [{ destination: dest, path: [dest] }];
    }
    return [];
  }
  
  if (token.state === 'finished') return [];

  if (token.state === 'detour' && token.detourColor) {
    const results: { destination: Token, path: Token[] }[] = [];
    const detourColor = token.detourColor;

    // 1. CHASSE EN AVANT (Hunt deeper up the enemy stairs)
    let forwardPos = token.position;
    let forwardDir = 1;
    const forwardHistory: Token[] = [];
    for (let s = 0; s < diceValue; s++) {
      let nextPos = forwardPos + forwardDir;
      if (nextPos >= 5) {
        forwardDir = -1;
        nextPos = 3; // Bounce back from top (cannot enter victory center)
      } else if (nextPos < 0) {
        forwardDir = 1;
        nextPos = 1;
      }
      forwardPos = nextPos;
      forwardHistory.push({ ...token, state: 'detour', position: forwardPos, detourColor });
    }
    if (forwardHistory.length > 0) {
      results.push({ destination: forwardHistory[forwardHistory.length - 1], path: forwardHistory });
    }

    // 2. REPLI VERS LA SORTIE (Retreat / step down towards the entrance)
    let retreatPos = token.position;
    const retreatHistory: Token[] = [];
    let hasExited = false;
    for (let s = 0; s < diceValue; s++) {
      if (!hasExited) {
        retreatPos--;
        if (retreatPos < 0) {
          hasExited = true;
          const exitMain = ENTRANCES[detourColor];
          retreatHistory.push({ ...token, state: 'main', position: exitMain, detourColor: undefined });
        } else {
          retreatHistory.push({ ...token, state: 'detour', position: retreatPos, detourColor });
        }
      } else {
        const lastPos = retreatHistory[retreatHistory.length - 1].position;
        const nextPos = (lastPos + 1) % 52;
        retreatHistory.push({ ...token, state: 'main', position: nextPos, detourColor: undefined });
      }
    }
    if (retreatHistory.length > 0) {
      const retreatDest = retreatHistory[retreatHistory.length - 1];
      const alreadyHas = results.some(
        r => r.destination.state === retreatDest.state &&
             r.destination.position === retreatDest.position &&
             r.destination.detourColor === retreatDest.detourColor
      );
      if (!alreadyHas) {
        results.push({ destination: retreatDest, path: retreatHistory });
      }
    }

    // 3. SPRINT D'ÉVASION SUR UN 6 (Instant direct exit onto main track)
    if (diceValue === 6) {
      const exitMain = ENTRANCES[detourColor];
      const sprintPath = [{ ...token, state: 'main' as TokenState, position: exitMain, detourColor: undefined }];
      const alreadyHas = results.some(
        r => r.destination.state === 'main' && r.destination.position === exitMain
      );
      if (!alreadyHas) {
        results.push({ destination: sprintPath[0], path: sprintPath });
      }
    }

    return results;
  }

  type PathState = { state: 'main'|'home'|'detour'|'finished', pos: number, detourColor?: PlayerColor, dir: number, history: Token[] };
  let paths: PathState[] = [{ state: token.state as 'main'|'home'|'detour', pos: token.position, detourColor: token.detourColor, dir: 1, history: [] }];

  for (let i = 0; i < diceValue; i++) {
    let nextPaths: PathState[] = [];
    for (const p of paths) {
      if (p.state === 'finished') {
        nextPaths.push(p);
        continue;
      }
      
      let nextStateInfo: { state: 'main'|'home'|'detour'|'finished', pos: number, detourColor?: PlayerColor, dir: number }[] = [];

      if (p.state === 'main') {
        if ((token.color === 'green' && p.pos === 50) ||
            (token.color === 'red' && p.pos === 11) ||
            (token.color === 'blue' && p.pos === 24) ||
            (token.color === 'yellow' && p.pos === 37)) {
            nextStateInfo.push({ state: 'home', pos: 0, dir: 1 });
        } else {
            nextStateInfo.push({ state: 'main', pos: (p.pos + 1) % 52, dir: 1 });
        }
        
        if (p.pos === ENTRANCES.red && token.color !== 'red') nextStateInfo.push({ state: 'detour', pos: 0, detourColor: 'red', dir: 1 });
        if (p.pos === ENTRANCES.blue && token.color !== 'blue') nextStateInfo.push({ state: 'detour', pos: 0, detourColor: 'blue', dir: 1 });
        if (p.pos === ENTRANCES.yellow && token.color !== 'yellow') nextStateInfo.push({ state: 'detour', pos: 0, detourColor: 'yellow', dir: 1 });
        if (p.pos === ENTRANCES.green && token.color !== 'green') nextStateInfo.push({ state: 'detour', pos: 0, detourColor: 'green', dir: 1 });

      } else if (p.state === 'home') {
        const nextPos = p.pos + p.dir;
        if (nextPos === 5) {
           if (i === diceValue - 1) {
             nextStateInfo.push({ state: 'finished', pos: 0, dir: 1 });
           } else {
             nextStateInfo.push({ state: 'home', pos: 3, dir: -1 }); // bounce
           }
        } else if (nextPos < 0) {
           nextStateInfo.push({ state: 'home', pos: 1, dir: 1 });
        } else {
           nextStateInfo.push({ state: 'home', pos: nextPos, dir: p.dir });
        }
      } else if (p.state === 'detour') {
        const nextPos = p.pos + p.dir;
        if (nextPos === 5) {
           nextStateInfo.push({ state: 'detour', pos: 3, detourColor: p.detourColor, dir: -1 });
        } else if (nextPos < 0) {
           nextStateInfo.push({ state: 'detour', pos: 1, detourColor: p.detourColor, dir: 1 });
        } else {
           nextStateInfo.push({ state: 'detour', pos: nextPos, detourColor: p.detourColor, dir: p.dir });
        }
      }

      for (const next of nextStateInfo) {
        const t = { ...token, state: next.state as TokenState, position: next.pos, detourColor: next.detourColor } as Token;
        nextPaths.push({ ...next, history: [...p.history, t] });
      }
    }
    
    const seen = new Set();
    paths = nextPaths.filter(p => {
      const key = `${p.state}-${p.pos}-${p.detourColor}-${p.dir}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return paths.map(p => {
    if (p.state === 'home' && p.pos === 5) return null; // Safety
    const dest = { ...token, state: p.state as TokenState, position: p.pos, detourColor: p.detourColor } as Token;
    return { destination: dest, path: p.history };
  }).filter(Boolean) as { destination: Token, path: Token[] }[];
};

export const getValidDestinations = (token: Token, diceValue: number): Token[] => {
  return getValidMoves(token, diceValue).map(m => m.destination);
};

export const checkWin = (state: GameState, color: PlayerColor): boolean => {
  return state.tokens.filter(t => t.color === color).every(t => t.state === 'finished');
};

export const advanceTurn = (state: GameState): GameState => {
  let nextTurn = (state.turnIndex + 1) % state.players.length;
  let loopCount = 0;
  while (checkWin(state, state.players[nextTurn]) && loopCount < state.players.length) {
    nextTurn = (nextTurn + 1) % state.players.length;
    loopCount++;
  }

  return {
    ...state,
    turnIndex: nextTurn,
    diceValue: null,
    hasRolled: false,
  };
};

export const executeMove = (state: GameState, originalTokenId: string, destinationToken: Token): GameState => {
  const tokenIndex = state.tokens.findIndex(t => t.id === originalTokenId);
  if (tokenIndex === -1) return state;

  const originalToken = state.tokens[tokenIndex];
  const newTokens = [...state.tokens];
  newTokens[tokenIndex] = destinationToken;

  let captureOccurred = false;
  const newStats = { ...state.stats };
  const newConsecutiveTurns = { ...state.consecutiveTurnsWithoutExit };

  // If a pawn exits base, reset stuck turns
  if (originalToken.state === 'base' && destinationToken.state !== 'base') {
    newConsecutiveTurns[originalToken.color] = 0;
  }

  // Check captures
  if (destinationToken.state === 'main' || destinationToken.state === 'detour') {
    const coords = getTokenAbsoluteCoords(destinationToken);
    if (coords && !isSafeSquare(coords)) {
      newTokens.forEach((t, idx) => {
        if (t.id !== originalTokenId && t.color !== originalToken.color && t.state !== 'base' && t.state !== 'finished') {
          const tCoords = getTokenAbsoluteCoords(t);
          if (tCoords && tCoords[0] === coords[0] && tCoords[1] === coords[1]) {
            // Capture!
            newTokens[idx] = { ...t, state: 'base', position: 0, detourColor: undefined };
            captureOccurred = true;
            newStats[originalToken.color] = { ...newStats[originalToken.color], captures: newStats[originalToken.color].captures + 1 };
            newStats[t.color] = { ...newStats[t.color], lost: newStats[t.color].lost + 1 };
          }
        }
      });
    }
  }

  let nextState: GameState = {
    ...state,
    tokens: newTokens,
    stats: newStats,
    consecutiveTurnsWithoutExit: newConsecutiveTurns
  };

  if (checkWin(nextState, originalToken.color)) {
    nextState.winner = originalToken.color;
  }

  if (state.diceValue === 6 || captureOccurred || destinationToken.state === 'finished') {
    nextState.diceValue = null;
    nextState.hasRolled = false;
  } else {
    nextState = advanceTurn(nextState);
  }

  return nextState;
};

export const getTokensWithMoves = (state: GameState, color: PlayerColor): Token[] => {
  if (!state.hasRolled || state.diceValue === null) return [];
  return state.tokens.filter(t => t.color === color && getValidDestinations(t, state.diceValue!).length > 0);
};

export const aiTakeTurn = (state: GameState): { action: 'roll' } | { action: 'move', tokenId: string, destination: Token } | null => {
  const currentPlayer = state.players[state.turnIndex];
  if (!state.hasRolled) return { action: 'roll' };
  
  const validTokens = getTokensWithMoves(state, currentPlayer);
  if (validTokens.length === 0) return null;

  type MoveChoice = { token: Token, destination: Token, score: number };
  const choices: MoveChoice[] = [];

  for (const t of validTokens) {
    const dests = getValidDestinations(t, state.diceValue!);
    for (const d of dests) {
      let score = 0;
      
      // 1. In detour: prioritize capturing prey in stairs, advancing towards prey, or escaping
      if (t.state === 'detour') {
        const targetStretch = t.detourColor;
        const hasPrey = state.tokens.some(enemy => 
          enemy.color === targetStretch && 
          enemy.state === 'home'
        );

        if (d.state === 'main') {
          // Exiting detour: great if no prey left or already captured
          score += hasPrey ? 110 : 220;
        } else if (d.state === 'detour') {
          // Hunting deeper
          score += hasPrey ? 170 : 80;
        }
      }

      // 2. Prioritize reaching the finished state
      if (d.state === 'finished') {
        score += 250;
      }

      // 3. Prioritize captures (hunt)
      if (d.state === 'main' || d.state === 'detour') {
        const coords = getTokenAbsoluteCoords(d)!;
        if (!isSafeSquare(coords)) {
          const hasEnemy = state.tokens.some(enemy => 
            enemy.color !== currentPlayer && 
            enemy.state !== 'base' && 
            enemy.state !== 'finished' && 
            getTokenAbsoluteCoords(enemy)?.[0] === coords[0] && 
            getTokenAbsoluteCoords(enemy)?.[1] === coords[1]
          );
          if (hasEnemy) {
            // Massive score for stair capture vs normal capture
            score += d.state === 'detour' ? 320 : 180;
          }
        }
      }

      // 4. Leaving base on 6 is high priority
      if (t.state === 'base' && d.state === 'main') {
        score += 100;
      }

      // 5. Invasions: high reward if an opponent is hiding in their stairs!
      if (d.state === 'detour' && t.state === 'main') {
        const targetStretch = d.detourColor;
        const hasPrey = state.tokens.some(enemy => 
          enemy.color === targetStretch && 
          enemy.state === 'home' && 
          enemy.position >= d.position
        );
        if (hasPrey) {
          score += 190; // Aggressively go hunt!
        } else {
          score -= 30; // Don't invade empty stairs
        }
      }

      // 6. Safe spot preference
      if (d.state === 'main') {
        const coords = getTokenAbsoluteCoords(d)!;
        if (isSafeSquare(coords)) {
          score += 25;
        }
      }

      // 7. General forward progress
      if (d.state === 'main' && t.state === 'main') {
        // Approximate forward progress
        score += 5; 
      }
      if (d.state === 'home') {
        score += 10 + d.position * 2;
      }

      choices.push({ token: t, destination: d, score });
    }
  }

  // Sort by highest score
  choices.sort((a, b) => b.score - a.score);
  const bestChoice = choices[0];

  return { action: 'move', tokenId: bestChoice.token.id, destination: bestChoice.destination };
};
