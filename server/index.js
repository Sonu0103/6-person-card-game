require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameState = require('./game/GameState');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for now, restrict in production
        methods: ["GET", "POST"]
    }
});

// Store game states. Key = roomID
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

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinGame', ({ playerName, roomId = 'default' }) => {
        socket.join(roomId);

        if (!games.has(roomId)) {
            // Pass broadcastUpdate callback to GameState
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

        // Pass broadcastUpdate callback to GameState
        const game = new GameState(roomId, () => broadcastUpdate(roomId));
        games.set(roomId, game);

        game.addPlayer(socket.id, playerName);
        game.addBots(); // Fill with bots

        socket.emit('gameStateUpdate', game.getPlayerState(socket.id));
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    const gameActions = ['makeBid', 'selectTrump', 'playCard'];
    gameActions.forEach(action => {
        socket.on(action, (data) => {
            // Use explicit roomId if provided, otherwise fallback (though fallback is risky)
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
