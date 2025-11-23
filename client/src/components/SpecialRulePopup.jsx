import React from 'react';

export function SpecialRulePopup({ gameState, myId, onDecision }) {
    if (!gameState.awaitingSpecialRuleDecision) return null;

    const callingTeam = gameState.players[gameState.bidWinner].team;
    const myPlayer = gameState.players.find(p => p.id === myId);
    const isCallingTeam = myPlayer?.team === callingTeam;

    // Only show to calling team members
    if (!isCallingTeam) return null;

    const trumpColor = ['H', 'D'].includes(gameState.trumpSuit) ? 'border-red-500' : 'border-slate-800';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className={`bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl shadow-2xl max-w-lg w-full border-4 ${trumpColor} animate-pulse-slow`}>
                <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-3xl font-bold text-white mb-2">16-Points Challenge!</h2>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">
                        Team {callingTeam} - 5 Consecutive Wins!
                    </h3>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6 text-left">
                        <p className="text-white font-semibold mb-3">⚡ Activate the Challenge?</p>
                        <ul className="text-sm text-slate-900 space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">✅</span>
                                <span><strong>Success:</strong> Win all 8 tricks = <strong>+16 points</strong></span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">❌</span>
                                <span><strong>Failure:</strong> Lose even 1 trick = <strong>-32 points</strong></span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onDecision(false)}
                            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-800 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
                        >
                            Continue Normally
                        </button>
                        <button
                            onClick={() => onDecision(true)}
                            className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
                        >
                            ⚡ Activate Challenge
                        </button>
                    </div>

                    <p className="text-xs text-slate-700 mt-4 italic">
                        Any team member can make this decision
                    </p>
                </div>
            </div>
        </div>
    );
}
