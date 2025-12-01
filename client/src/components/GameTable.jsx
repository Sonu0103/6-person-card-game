import React, { useState } from 'react';
import { Card } from './Card';

export function GameTable({ gameState, myId, onPlayCard, children }) {
    console.log('GameTable render:', {
        hasGameState: !!gameState,
        phase: gameState?.phase,
        playerCount: gameState?.players?.length,
        myId,
        players: gameState?.players?.map(p => p.name)
    });

    if (!gameState) {
        console.log('GameTable: No game state');
        return <div className="text-white text-center p-8">Loading game...</div>;
    }

    if (!gameState.players || gameState.players.length === 0) {
        console.log('GameTable: No players in game state');
        return <div className="text-white text-center p-8">Waiting for players...</div>;
    }

    const { players, currentTrick, currentTurn, dealerIndex, trumpSuit } = gameState;

    // Rotate players so "me" is at bottom
    const myIndex = players.findIndex(p => p.id === myId);

    if (myIndex === -1) {
        console.log('GameTable: My ID not found in players', { myId, playerIds: players.map(p => p.id) });
        return <div className="text-white text-center p-8">Finding your position...</div>;
    }

    const rotatedPlayers = [
        ...players.slice(myIndex),
        ...players.slice(0, myIndex)
    ];

    // Positions for 6 players: Bottom, Bottom-Left, Top-Left, Top, Top-Right, Bottom-Right
    // Actually, let's do: Bottom (Me), Bottom-Right, Top-Right, Top, Top-Left, Bottom-Left
    // 0 is Me.
    // 1 is Right-Bottom
    // 2 is Right-Top
    // 3 is Top
    // 4 is Left-Top
    // 5 is Left-Bottom

    const positions = [
        'bottom-4 left-1/2 -translate-x-1/2', // Me
        'bottom-20 right-10', // P1
        'top-20 right-10', // P2
        'top-4 left-1/2 -translate-x-1/2', // P3
        'top-20 left-10', // P4
        'bottom-20 left-10' // P5
    ];

    return (
        <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[800px] bg-green-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-4 sm:border-8 border-amber-900">
            {/* Center Table Area */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-green-700 rounded-full border-2 sm:border-4 border-green-600 flex items-center justify-center">
                {/* Trump Indicator */}
                {trumpSuit && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-lg sm:text-2xl bg-white p-1 sm:p-2 rounded-full shadow-md">
                        Trump: <span className={['H', 'D'].includes(trumpSuit) ? 'text-red-600' : 'text-black'}>
                            {{ 'S': '♠', 'H': '♥', 'D': '♦', 'C': '♣' }[trumpSuit]}
                        </span>
                    </div>
                )}

                {/* Played Cards */}
                {currentTrick.map((play, i) => {
                    // We need to map play.playerIndex to a visual position relative to Me
                    // play.playerIndex is absolute index (0-5)
                    // myIndex is absolute index of Me
                    // relativeIndex = (play.playerIndex - myIndex + 6) % 6
                    const relativeIndex = (play.playerIndex - myIndex + 6) % 6;

                    // Offsets for cards in the center - spread them out more and add rotation
                    const offsets = [
                        { transform: 'translate-y-16', rotation: 'rotate-0' }, // Me
                        { transform: 'translate-x-16 translate-y-8', rotation: 'rotate-12' }, // P1
                        { transform: 'translate-x-16 -translate-y-8', rotation: '-rotate-12' }, // P2
                        { transform: '-translate-y-16', rotation: 'rotate-0' }, // P3
                        { transform: '-translate-x-16 -translate-y-8', rotation: 'rotate-12' }, // P4
                        { transform: '-translate-x-16 translate-y-8', rotation: '-rotate-12' } // P5
                    ];

                    const offset = offsets[relativeIndex];

                    return (
                        <div
                            key={i}
                            className={`absolute ${offset.transform} ${offset.rotation} transition-all duration-[1500ms] ease-out`}
                            style={{ zIndex: i + 10 }}
                        >
                            <Card card={play.card} />
                        </div>
                    );
                })}
            </div>

            {/* Players */}
            {rotatedPlayers.map((player, index) => (
                <div key={player.id} className={`absolute ${positions[index]} flex flex-col items-center`}>
                    <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-xl mb-1 sm:mb-2 border-2 sm:border-4 shadow-lg
                        ${gameState.currentTurn === (player.id === myId ? myIndex : players.findIndex(p => p.id === player.id))
                            ? 'border-yellow-400 bg-yellow-600 animate-pulse'
                            : 'border-slate-600 bg-slate-800'}
                    `}>
                        {player.name[0]}
                    </div>
                    <div className="bg-black/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-xs sm:text-sm mb-0.5 sm:mb-1">
                        {player.name} (Team {player.team})
                    </div>
                    <div className="text-xs text-yellow-200">
                        Tricks: {player.tricksWon}
                    </div>
                    {player.bid && (
                        <div className="text-xs text-cyan-200">
                            Bid: {player.bid}
                        </div>
                    )}

                    {/* Hand (Only visible for Me) */}
                    {index === 0 && (
                        <div className="flex -space-x-6 sm:-space-x-8 mt-2 sm:mt-4 hover:space-x-0.5 sm:hover:space-x-1 transition-all">
                            {gameState.myHand.map((card, i) => (
                                <Card
                                    key={i}
                                    card={card}
                                    isPlayable={gameState.currentTurn === myIndex && gameState.phase === 'PLAYING'}
                                    onClick={() => onPlayCard(card)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Card Backs for others */}
                    {index !== 0 && (
                        <div className="flex -space-x-6 sm:-space-x-10 mt-1 sm:mt-2">
                            {Array(player.handCount).fill(0).map((_, i) => (
                                <div key={i} className="w-6 h-8 sm:w-8 sm:h-12 bg-blue-800 rounded border border-white shadow-sm"></div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {/* Children (Controls) */}
            {children}
        </div>
    );
}
