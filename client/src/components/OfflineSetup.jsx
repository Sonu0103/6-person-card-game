import React, { useState } from 'react';

export function OfflineSetup({ onStartGame, onBack }) {
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [playerName, setPlayerName] = useState('');

    const difficulties = [
        { id: 'EASY', label: 'Easy', desc: 'Bots play randomly. Good for learning.' },
        { id: 'MEDIUM', label: 'Medium', desc: 'Standard bots. Balanced challenge.' },
        { id: 'HARD', label: 'Hard', desc: 'Aggressive bots. For experts.' }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Offline Setup</h2>

                <div className="mb-6">
                    <label className="block text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Your Name</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <div className="space-y-4 mb-8">
                    <p className="block text-slate-400 text-sm mb-2 uppercase tracking-wider font-semibold">Select Difficulty</p>
                    {difficulties.map((diff) => (
                        <button
                            key={diff.id}
                            onClick={() => setDifficulty(diff.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left group relative overflow-hidden ${difficulty === diff.id
                                    ? 'border-emerald-500 bg-emerald-900/20'
                                    : 'border-slate-600 hover:border-slate-500 bg-slate-800'
                                }`}
                        >
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold text-lg ${difficulty === diff.id ? 'text-emerald-400' : 'text-white'}`}>
                                        {diff.label}
                                    </span>
                                    {difficulty === diff.id && (
                                        <span className="text-emerald-500">✓</span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm">{diff.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 px-6 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onStartGame(difficulty, playerName || 'Player 1')}
                        className="flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-105"
                    >
                        Start Game
                    </button>
                </div>
            </div>
        </div>
    );
}
