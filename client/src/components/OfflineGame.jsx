import React, { useCallback } from 'react';
import { useLocalGame } from '../hooks/useLocalGame';
import { GameTable } from './GameTable';
import { Controls } from './Controls';
import { SpecialRulePopup } from './SpecialRulePopup';
import { Scoreboard } from './Scoreboard';
import { GameOverScreen } from './GameOverScreen';

export function OfflineGame({ playerName, difficulty, onLeave }) {
    const { gameState, makeBid, selectTrump, playCard, makeSpecialRuleDecision, myId } = useLocalGame(playerName, difficulty);

    const handleNewGame = useCallback(() => {
        // Force a reload to reset state completely for now
        window.location.reload();
    }, []);

    if (!gameState) return <div className="text-white text-center mt-20">Loading game engine...</div>;

    // Find my team
    const myPlayer = gameState.players.find(p => p.id === myId);
    const myTeam = myPlayer ? myPlayer.team : 'A';

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row relative">
            {/* Game Over Screen */}
            {gameState.phase === 'GAME_OVER' && (
                <GameOverScreen
                    winner={gameState.winner}
                    scores={gameState.scores}
                    onNewGame={handleNewGame}
                    onBackToLobby={onLeave}
                />
            )}

            {/* Left Side - Game Table */}
            <div className="flex-1 relative flex flex-col">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
                    <div className="pointer-events-auto">
                        <button
                            onClick={onLeave}
                            className="bg-slate-800/80 backdrop-blur text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-700 border border-slate-600 transition-colors text-sm font-bold"
                        >
                            ← Exit
                        </button>
                    </div>
                    <div className="bg-slate-800/90 backdrop-blur px-6 py-2 rounded-xl border border-slate-600 shadow-xl">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold text-center">Current Bid</div>
                        <div className="text-2xl font-black text-yellow-400 text-center">
                            {gameState.currentBid > 0 ? gameState.currentBid : '-'}
                        </div>
                        {gameState.trumpSuit && (
                            <div className="text-center mt-1 border-t border-slate-700 pt-1">
                                <span className={`text-lg ${['H', 'D'].includes(gameState.trumpSuit) ? 'text-red-500' : 'text-slate-200'}`}>
                                    {['S', 'H', 'D', 'C'].find(s => s === gameState.trumpSuit) === 'S' ? '♠' :
                                        ['S', 'H', 'D', 'C'].find(s => s === gameState.trumpSuit) === 'H' ? '♥' :
                                            ['S', 'H', 'D', 'C'].find(s => s === gameState.trumpSuit) === 'D' ? '♦' : '♣'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <GameTable
                    gameState={gameState}
                    myId={myId}
                    onPlayCard={playCard}
                />

                {/* Scoreboard - Moved below table */}
                <Scoreboard scores={gameState.scores} myTeam={myTeam} />
            </div>

            {/* Right Side - Controls & Chat (Chat hidden for offline) */}
            <div className="w-full md:w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {gameState.gameLog.map((log, i) => (
                            <div key={i} className="text-sm text-slate-300 border-b border-slate-700/50 pb-1 last:border-0">
                                <span className="text-slate-500 text-xs">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span> {log}
                            </div>
                        ))}
                    </div>
                </div>

                <Controls
                    gameState={gameState}
                    myId={myId}
                    onBid={makeBid}
                    onSelectTrump={selectTrump}
                />
            </div>

            {gameState.awaitingSpecialRuleDecision && (
                <SpecialRulePopup
                    onDecision={makeSpecialRuleDecision}
                    teamName={gameState.specialRuleTeam} // This might be null in engine, need to check logic
                />
            )}
        </div>
    );
}
