/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './screens/Home';
import { PlayerSelect } from './screens/PlayerSelect';
import { GameScreen } from './screens/GameScreen';
import { Online } from './screens/Online';
import { PlayerColor } from './game/constants';
import { GameMode } from './game/engine';

type Screen = 'home' | 'player_select' | 'game' | 'online';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [players, setPlayers] = useState<PlayerColor[]>([]);
  const [playerTypes, setPlayerTypes] = useState<Record<PlayerColor, 'human' | 'computer'>>({} as any);
  const [gameMode, setGameMode] = useState<GameMode>('quick');

  const handleStartGame = (
    selectedPlayers: PlayerColor[], 
    selectedTypes: Record<PlayerColor, 'human' | 'computer'>,
    selectedMode: GameMode = 'quick'
  ) => {
    setPlayers(selectedPlayers);
    setPlayerTypes(selectedTypes);
    setGameMode(selectedMode);
    setCurrentScreen('game');
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 overflow-hidden font-sans select-none">
      {currentScreen === 'home' && (
        <Home onNavigate={(screen) => setCurrentScreen(screen)} />
      )}
      {currentScreen === 'player_select' && (
        <PlayerSelect 
          onStart={handleStartGame} 
          onBack={() => setCurrentScreen('home')} 
        />
      )}
      {currentScreen === 'online' && (
        <Online onBack={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'game' && (
        <GameScreen 
          players={players} 
          playerTypes={playerTypes} 
          gameMode={gameMode}
          onQuit={() => setCurrentScreen('home')} 
        />
      )}
    </div>
  );
}

