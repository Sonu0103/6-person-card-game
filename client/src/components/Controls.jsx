import React, { useState } from 'react';

export function Controls({ gameState, myId, onBid, onSelectTrump }) {
    const { phase, currentTurn, players, currentBid, bidWinner } = gameState;
    const myIndex = players.findIndex(p => p.id === myId);
    const isMyTurn = currentTurn === myIndex;

    if (!isMyTurn) return (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full animate-bounce">
            Waiting for {players[currentTurn].name}...
        </div>
    );

    if (phase === 'BIDDING') {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col items-center gap-2 sm:gap-4 z-50 max-w-[90vw]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Make a Bid</h3>
                <p className="text-sm sm:text-base text-slate-500">Current Highest: {currentBid}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    <button
                        onClick={() => {
                            console.log('PASS button clicked');
                            onBid('PASS');
                        }}
                        className="px-4 sm:px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors text-sm sm:text-base"
                    >
                        PASS
                    </button>
                    {[5, 6, 7, 8].map(num => (
                        <button
                            key={num}
                            disabled={num <= currentBid}
                            onClick={() => onBid(num)}
                            className={`
                                px-4 sm:px-6 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base
                                ${num <= currentBid
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
                            `}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (phase === 'TRUMP_SELECTION' && bidWinner === myIndex) {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col items-center gap-3 sm:gap-4 z-50 max-w-[90vw]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">Select Trump Suit</h3>
                <div className="flex gap-2 sm:gap-4">
                    {[
                        { suit: 'S', icon: '♠', color: 'text-slate-800' },
                        { suit: 'H', icon: '♥', color: 'text-red-600' },
                        { suit: 'D', icon: '♦', color: 'text-red-600' },
                        { suit: 'C', icon: '♣', color: 'text-slate-800' }
                    ].map(({ suit, icon, color }) => (
                        <button
                            key={suit}
                            onClick={() => onSelectTrump(suit)}
                            className={`w-12 h-12 sm:w-16 sm:h-16 text-2xl sm:text-4xl border-2 border-slate-200 rounded-xl hover:bg-slate-50 ${color}`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
