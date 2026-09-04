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
}

export const createInitialState = (players: PlayerColor[], playerTypes: Record<PlayerColor, 'human' | 'computer'>): GameState => {
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
  players.forEach(p => stats[p] = { captures: 0, lost: 0 });

  return {
    players,
    playerTypes,
    tokens,
    turnIndex: 0,
    diceValue: null,
    hasRolled: false,
    winner: null,
    stats
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

  if (token.state === 'detour') {
    if (diceValue === 6) {
      if (token.position > 0) {
        const dest = { ...token, state: 'detour', position: token.position - 1, detourColor: token.detourColor } as Token;
        return [{ destination: dest, path: [dest] }];
      } else {
        const dest = { ...token, state: 'main', position: ENTRANCES[token.detourColor!] } as Token;
        return [{ destination: dest, path: [dest] }];
      }
    }
    return []; // Cannot move out without a 6
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

  // Check captures
  if (destinationToken.state === 'main' || destinationToken.state === 'detour') {
    const coords = getTokenAbsoluteCoords(destinationToken)!;
    if (!isSafeSquare(coords)) {
      newTokens.forEach((t, idx) => {
        if (t.id !== originalTokenId && t.color !== originalToken.color && t.state !== 'base' && t.state !== 'finished') {
          const tCoords = getTokenAbsoluteCoords(t)!;
          if (tCoords[0] === coords[0] && tCoords[1] === coords[1]) {
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

  let nextState = {
    ...state,
    tokens: newTokens,
    stats: newStats
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
      
      // 1. Prioritize escaping detour (needs 6)
      if (t.state === 'detour' && d.state === 'detour') {
        score += 120;
      }
      if (t.state === 'detour' && d.state === 'main') {
        score += 150; // Getting out is great
      }

      // 2. Prioritize reaching the finished state
      if (d.state === 'finished') {
        score += 200;
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
            score += 150;
          }
        }
      }

      // 4. Leaving base on 6 is high priority
      if (t.state === 'base' && d.state === 'main') {
        score += 80;
      }

      // 5. Invasions are high reward if an opponent is in their stairs
      if (d.state === 'detour' && t.state === 'main') {
        const targetStretch = d.detourColor;
        const hasPrey = state.tokens.some(enemy => 
          enemy.color === targetStretch && 
          enemy.state === 'home' && 
          enemy.position >= d.position
        );
        if (hasPrey) {
          score += 90; // Go hunt!
        } else {
          score -= 20; // Don't invade empty stairs
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
