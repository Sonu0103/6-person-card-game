import React, { useEffect } from 'react';

export function Lobby({ playerName: initialPlayerName, socket, onCreateRoom, onJoinRoom, onBack }) {
    const [availableRooms, setAvailableRooms] = React.useState([]);
    const [roomCode, setRoomCode] = React.useState('');
    const [playerName, setPlayerName] = React.useState(initialPlayerName || '');

    useEffect(() => {
        if (socket) {
            // Request available rooms
            socket.emit('getAvailableRooms');

            // Listen for available rooms
            socket.on('availableRooms', (rooms) => {
                setAvailableRooms(rooms);
            });

            // Refresh every 5 seconds
            const interval = setInterval(() => {
                socket.emit('getAvailableRooms');
            }, 5000);

            return () => {
                clearInterval(interval);
                socket.off('availableRooms');
            };
        }
    }, [socket]);

    const handleCreateRoom = () => {
        if (!playerName.trim()) return;
        onCreateRoom(playerName);
    };

    const handleJoinRoom = (code) => {
        if (!playerName.trim()) return;
        onJoinRoom(playerName, code);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/90 backdrop-blur border-2 border-slate-700 rounded-3xl shadow-2xl p-8 max-w-4xl w-full">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-2">
                        Game Lobby
                    </h1>
                    <p className="text-slate-400 text-sm">Join or create a room to play</p>
                </div>

                {/* Player Name Input */}
                <div className="mb-6 p-4 bg-slate-900/50 border-2 border-yellow-500/30 rounded-2xl">
                    <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wider">Your Name</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors font-bold"
                        maxLength={20}
                    />
                </div>

                {/* Create Room Section */}
                <div className="mb-6 p-6 bg-slate-900/50 border-2 border-emerald-500/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-emerald-400 mb-3">Create New Room</h3>
                    <p className="text-sm text-slate-400 mb-4">Start a new game and get a room code to share with friends</p>
                    <button
                        onClick={handleCreateRoom}
                        disabled={!playerName.trim()}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-900/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        + Create Room
                    </button>
                </div>

                {/* Join Room Section */}
                <div className="mb-6 p-6 bg-slate-900/50 border-2 border-blue-500/30 rounded-2xl">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">Join with Code</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-white text-center text-lg font-mono focus:border-blue-500 focus:outline-none transition-colors"
                            maxLength={6}
                        />
                        <button
                            onClick={() => handleJoinRoom(roomCode)}
                            disabled={roomCode.length !== 6 || !playerName.trim()}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Join
                        </button>
                    </div>
                </div>

                {/* Available Rooms */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-300 mb-4">Available Rooms ({availableRooms.length})</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {availableRooms.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <div className="text-4xl mb-4">🎮</div>
                                <p>No rooms available. Create one to get started!</p>
                            </div>
                        ) : (
                            availableRooms.map((room) => (
                                <div
                                    key={room.roomId}
                                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-emerald-500/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="font-mono text-2xl font-black text-emerald-400">{room.roomId}</div>
                                            <div className="text-sm text-slate-400">
                                                Host: <span className="text-white">{room.hostName}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-xs text-slate-500">
                                                Players: {room.playerCount}/{room.maxPlayers}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleJoinRoom(room.roomId)}
                                        disabled={!playerName.trim()}
                                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Join →
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="w-full px-6 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors"
                >
                    ← Back to Menu
                </button>
            </div>
        </div>
    );
}
