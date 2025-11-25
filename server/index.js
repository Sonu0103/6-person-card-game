require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const GameState = require('./game/GameState');
const RoomManager = require('./rooms/RoomManager');

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Room Manager
const roomManager = new RoomManager();

// Clean up old rooms every 30 minutes
setInterval(() => {
    roomManager.cleanupOldRooms();
}, 30 * 60 * 1000);

// Store game states per room
const games = new Map();

// Helper function to broadcast game state updates to all players in a room
function broadcastUpdate(roomId) {
    const game = games.get(roomId);
    if (!game) return;

    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (roomSockets) {
        for (const clientId of roomSockets) {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket) {
                clientSocket.emit('gameStateUpdate', game.getPlayerState(clientId));
            }
        }
    }
}

// Helper function to broadcast room updates
async function broadcastRoomUpdate(roomId) {
    const room = await roomManager.getRoom(roomId);
    if (!room) return;

    io.to(roomId).emit('roomUpdate', room);
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new room
    socket.on('createRoom', async ({ playerName }) => {
        try {
            const room = await roomManager.createRoom(socket.id, playerName);
            socket.join(room.roomId);
            socket.emit('roomCreated', room);
            socket.emit('roomUpdate', room);
        } catch (error) {
            console.error('Error creating room:', error.message);
            socket.emit('error', error.message);
        }
    });

    // Join an existing room
    socket.on('joinRoom', async ({ roomId, playerName }) => {
        try {
            const room = await roomManager.joinRoom(roomId, socket.id, playerName);
            socket.join(roomId);
            await broadcastRoomUpdate(roomId);
        } catch (error) {
            console.error('Error joining room:', error.message);
            socket.emit('error', error.message);
        }
    });

    // Get list of available rooms
    socket.on('getAvailableRooms', async () => {
        const rooms = await roomManager.getAvailableRooms();
        socket.emit('availableRooms', rooms);
    });

    // Start game (host only)
    socket.on('startGame', async ({ roomId }) => {
        try {
            const room = await roomManager.getRoom(roomId);

            if (!room) {
                throw new Error('Room not found');
            }

            if (room.host !== socket.id) {
                throw new Error('Only the host can start the game');
            }

            await roomManager.startGame(roomId);

            // Create game state
            const game = new GameState(roomId, () => broadcastUpdate(roomId));

            // Add all players from room
            room.players.forEach(player => {
                game.addPlayer(player.id, player.name);
            });

            games.set(roomId, game);

            // Notify all players game has started
            broadcastUpdate(roomId);

        } catch (error) {
            console.error('Error starting game:', error.message);
            socket.emit('error', error.message);
        }
    });

    // Leave room
    socket.on('leaveRoom', async ({ roomId }) => {
        try {
            const room = await roomManager.removePlayer(roomId, socket.id);
            socket.leave(roomId);

            if (room) {
                await broadcastRoomUpdate(roomId);
            }
        } catch (error) {
            console.error('Error leaving room:', error.message);
        }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);

        // Find and remove player from any rooms
        const availableRooms = await roomManager.getAvailableRooms();
        for (const roomInfo of availableRooms) {
            const room = await roomManager.getRoom(roomInfo.roomId);
            if (room && room.players.some(p => p.id === socket.id)) {
                const playerName = room.players.find(p => p.id === socket.id)?.name;
                const updatedRoom = await roomManager.removePlayer(room.roomId, socket.id);

                if (updatedRoom) {
                    await broadcastRoomUpdate(room.roomId);
                }

                // Notify other players
                io.to(room.roomId).emit('playerDisconnected', {
                    playerId: socket.id,
                    playerName
                });
                break;
            }
        }
    });

    // Legacy support for old single-player games
    socket.on('joinGame', ({ playerName, roomId = 'default' }) => {
        socket.join(roomId);

        if (!games.has(roomId)) {
            games.set(roomId, new GameState(roomId, () => broadcastUpdate(roomId)));
        }

        const game = games.get(roomId);
        const success = game.addPlayer(socket.id, playerName);

        if (success) {
            broadcastUpdate(roomId);
        } else {
            socket.emit('error', 'Game is full or already started');
        }
    });

    socket.on('createSinglePlayerGame', ({ playerName }) => {
        const roomId = `sp-${socket.id}`;
        socket.join(roomId);

        const game = new GameState(roomId, () => broadcastUpdate(roomId));
        games.set(roomId, game);

        game.addPlayer(socket.id, playerName);
        game.addBots();

        socket.emit('gameStateUpdate', game.getPlayerState(socket.id));
    });

    // Game actions
    const gameActions = ['makeBid', 'selectTrump', 'playCard', 'makeSpecialRuleDecision'];
    gameActions.forEach(action => {
        socket.on(action, (data) => {
            const roomId = data.roomId || Array.from(socket.rooms).find(r => r !== socket.id);
            console.log(`Action ${action} received for room ${roomId} from ${socket.id}`);

            const game = games.get(roomId);
            if (game) {
                try {
                    game[action](socket.id, data);
                    broadcastUpdate(roomId);
                } catch (e) {
                    console.error(`Error in ${action}:`, e.message);
                    socket.emit('error', e.message);
                }
            } else {
                console.error(`Game not found for room ${roomId}`);
                socket.emit('error', 'Game not found');
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
