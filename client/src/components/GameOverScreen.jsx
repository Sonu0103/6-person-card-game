import React from 'react';

export function GameOverScreen({ winner, scores, onNewGame, onBackToLobby }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-yellow-500 rounded-3xl shadow-2xl max-w-2xl w-full text-center p-8 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/card_game_bg_luxury.png')] opacity-10 bg-cover bg-center pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-6xl mb-6 animate-bounce">🏆</div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-4 drop-shadow-sm">
                        VICTORY!
                    </h1>
                    <h2 className="text-3xl font-bold text-white mb-8">
                        Team {winner} Wins!
                    </h2>

                    <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
                        <div className="flex justify-center gap-12 text-white">
                            <div className="flex flex-col items-center">
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Team A</div>
                                <div className={`text-5xl font-black ${scores.A > scores.B ? 'text-yellow-400' : 'text-slate-300'}`}>
                                    {scores.A}
                                </div>
                            </div>
                            <div className="w-px bg-slate-600"></div>
                            <div className="flex flex-col items-center">
                                <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Team B</div>
                                <div className={`text-5xl font-black ${scores.B > scores.A ? 'text-yellow-400' : 'text-slate-300'}`}>
                                    {scores.B}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onBackToLobby}
                            className="px-8 py-4 rounded-xl border-2 border-slate-600 text-slate-300 font-bold text-lg hover:bg-slate-800 hover:border-slate-500 transition-all"
                        >
                            Back to Lobby
                        </button>
                        <button
                            onClick={onNewGame}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-emerald-400 hover:scale-105 transition-all"
                        >
                            New Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
