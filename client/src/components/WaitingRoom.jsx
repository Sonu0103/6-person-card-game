import React from 'react';

export function WaitingRoom({ room, myId, onStartGame, onLeaveRoom }) {
    const isHost = room.host === myId;
    const canStart = room.players.length === 6;

    // Split players by team
    const teamA = room.players.filter(p => p.team === 'A');
    const teamB = room.players.filter(p => p.team === 'B');

    // Helper to render player slot
    const renderPlayerSlot = (player, index, team) => {
        if (!player) {
            return (
                <div key={`empty-${team}-${index}`} className="bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-xl p-4 text-center">
                    <div className="text-slate-500 text-sm">Waiting for player...</div>
                </div>
            );
        }

        const isMe = player.id === myId;

        return (
            <div key={player.id} className={`rounded-xl p-4 border-2 ${isMe
                    ? 'bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-500'
                    : 'bg-slate-900/50 border-slate-600'
                }`}>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isMe ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1 text-white font-bold truncate">{player.name}</div>
                    {player.id === room.host && (
                        <div className="px-2 py-1 bg-emerald-600/30 border border-emerald-500 rounded text-xs text-emerald-400 font-bold">
                            HOST
                        </div>
                    )}
                    {isMe && (
                        <div className="px-2 py-1 bg-yellow-600/30 border border-yellow-500 rounded text-xs text-yellow-400 font-bold">
                            YOU
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/90 backdrop-blur border-2 border-slate-700 rounded-3xl shadow-2xl p-8 max-w-4xl w-full">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-3">
                        Waiting Room
                    </h1>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-slate-400">Room Code:</div>
                        <div className="px-6 py-2 bg-slate-900 border-2 border-emerald-500 rounded-xl text-3xl font-mono font-black text-emerald-400 tracking-wider">
                            {room.roomId}
                        </div>
                        <button
                            onClick={() => navigator.clipboard.writeText(room.roomId)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-bold transition-colors"
                        >
                            📋 Copy
                        </button>
                    </div>
                    <div className="text-slate-400 text-sm">
                        Share this code with friends to join!
                    </div>
                </div>

                {/* Player Count */}
                <div className="mb-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${canStart
                            ? 'bg-emerald-900/30 border border-emerald-500 text-emerald-400'
                            : 'bg-slate-900/50 border border-slate-600 text-slate-400'
                        }`}>
                        <div className="text-2xl font-black">{room.players.length}/6</div>
                        <div className="text-sm font-bold">PLAYERS</div>
                    </div>
                </div>

                {/* Teams */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Team A */}
                    <div className="bg-slate-900/30 rounded-2xl p-5 border-2 border-blue-500/30">
                        <h3 className="text-2xl font-black text-blue-400 mb-4 text-center">Team A</h3>
                        <div className="space-y-3">
                            {[0, 1, 2].map(index => renderPlayerSlot(teamA[index], index, 'A'))}
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="bg-slate-900/30 rounded-2xl p-5 border-2 border-red-500/30">
                        <h3 className="text-2xl font-black text-red-400 mb-4 text-center">Team B</h3>
                        <div className="space-y-3">
                            {[0, 1, 2].map(index => renderPlayerSlot(teamB[index], index, 'B'))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onLeaveRoom}
                        className="flex-1 px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        ← Leave Room
                    </button>

                    {isHost && (
                        <button
                            onClick={onStartGame}
                            disabled={!canStart}
                            className={`flex-1 px-6 py-4 font-bold rounded-xl transition-all ${canStart
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:scale-105 shadow-lg shadow-emerald-900/30'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {canStart ? '▶ Start Game' : `Waiting for ${6 - room.players.length} more player(s)...`}
                        </button>
                    )}

                    {!isHost && (
                        <div className="flex-1 px-6 py-4 bg-slate-900/50 border-2 border-slate-600 text-slate-400 font-bold rounded-xl text-center">
                            {canStart ? 'Waiting for host to start...' : `Waiting for ${6 - room.players.length} more player(s)...`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
