import React, { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { GameTable } from './components/GameTable';
import { Controls } from './components/Controls';
import { SpecialRulePopup } from './components/SpecialRulePopup';

function App() {
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const { gameState, isConnected, error, makeBid, selectTrump, playCard, createSinglePlayerGame, makeSpecialRuleDecision, myId } = useGameState(joined ? name : null);

  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Card Game 6</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Enter your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                placeholder="Player Name"
              />
            </div>
            <button
              onClick={() => name && setJoined(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Join Multiplayer Game
            </button>
            <button
              onClick={() => {
                if (name) {
                  setJoined(true);
                  // Small delay to ensure socket connected
                  setTimeout(() => createSinglePlayerGame(name), 100);
                }
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Play vs Bots
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">Connecting to game...</div>
          {error && <div className="text-red-400">{error}</div>}
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState.phase === 'GAME_OVER') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-4">Congratulations!</h1>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Team {gameState.winner} Wins!
          </h2>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="flex justify-center gap-12 text-white">
              <div>
                <div className="text-sm opacity-80">Team A</div>
                <div className="text-4xl font-bold">{gameState.scores.A}</div>
              </div>
              <div>
                <div className="text-sm opacity-80">Team B</div>
                <div className="text-4xl font-bold">{gameState.scores.B}</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-orange-600 font-bold text-xl rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-7xl relative">
        {/* Header / Scoreboard */}
        <div className="flex justify-between items-center mb-4 text-white bg-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-sm text-slate-400">Team A</div>
              <div className="text-3xl font-bold text-blue-400">{gameState.scores.A}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-400">Team B</div>
              <div className="text-3xl font-bold text-red-400">{gameState.scores.B}</div>
            </div>
          </div>
          <div className="text-xl font-bold">
            Phase: <span className="text-yellow-400">{gameState.phase}</span>
          </div>
          <div>
            Room: {gameState.roomId}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Column: Game Table & Controls */}
          <div className="flex-grow">
            <GameTable
              gameState={gameState}
              myId={myId}
              onPlayCard={playCard}
            >
              <Controls
                gameState={gameState}
                myId={myId}
                onBid={makeBid}
                onSelectTrump={selectTrump}
              />
            </GameTable>
          </div>

          {/* Right Column: Game Log */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-slate-800 p-4 rounded-xl h-[800px] flex flex-col shadow-lg">
              <h3 className="text-white font-bold mb-2 border-b border-slate-700 pb-2">Game Log</h3>
              <div className="flex-grow overflow-y-auto text-sm text-slate-300 space-y-1">
                {gameState.gameLog.map((log, i) => (
                  <div key={i} className="break-words">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Special Rule Decision Popup */}
        <SpecialRulePopup
          gameState={gameState}
          myId={myId}
          onDecision={makeSpecialRuleDecision}
        />
      </div>
    </div>
  );
}

export default App;
