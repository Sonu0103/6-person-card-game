// Room Manager - handles room creation, joining, and management with MongoDB

const Room = require('../models/Room');

class RoomManager {
    constructor() {
        this.useDatabase = false;
        this.memoryRooms = new Map(); // Fallback for when DB is unavailable

        // Check if MongoDB is connected
        const mongoose = require('mongoose');
        mongoose.connection.on('connected', () => {
            this.useDatabase = true;
            console.log('🎮 RoomManager using MongoDB');
        });
    }

    // Generate unique 6-digit room code
    async generateRoomCode() {
        let code;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            attempts++;

            if (this.useDatabase) {
                const existing = await Room.findOne({ roomId: code });
                if (!existing) break;
            } else {
                if (!this.memoryRooms.has(code)) break;
            }
        } while (attempts < maxAttempts);

        return code;
    }

    // Create a new room
    async createRoom(hostId, hostName) {
        const roomId = await this.generateRoomCode();

        const roomData = {
            roomId,
            host: hostId,
            players: [
                { id: hostId, name: hostName, team: 'A', ready: false }
            ],
            maxPlayers: 6,
            status: 'waiting'
        };

        if (this.useDatabase) {
            const room = await Room.create(roomData);
            console.log(`Room ${roomId} created by ${hostName} (DB)`);
            return room.toObject();
        } else {
            this.memoryRooms.set(roomId, { ...roomData, createdAt: Date.now() });
            console.log(`Room ${roomId} created by ${hostName} (Memory)`);
            return roomData;
        }
    }

    // Join an existing room
    async joinRoom(roomId, playerId, playerName) {
        let room;

        if (this.useDatabase) {
            room = await Room.findOne({ roomId });
        } else {
            room = this.memoryRooms.get(roomId);
        }

        if (!room) {
            throw new Error('Room not found');
        }

        if (room.status !== 'waiting') {
            throw new Error('Game already in progress');
        }

        if (room.players.length >= room.maxPlayers) {
            throw new Error('Room is full');
        }

        // Check if player already in room
        if (room.players.some(p => p.id === playerId)) {
            return room;
        }

        // Auto-assign to team (alternate A/B)
        const team = room.players.length % 2 === 0 ? 'A' : 'B';

        const newPlayer = {
            id: playerId,
            name: playerName,
            team,
            ready: false
        };

        if (this.useDatabase) {
            room.players.push(newPlayer);
            await room.save();
            console.log(`${playerName} joined room ${roomId} (DB)`);
            return room.toObject();
        } else {
            room.players.push(newPlayer);
            console.log(`${playerName} joined room ${roomId} (Memory)`);
            return room;
        }
    }

    // Get room details
    async getRoom(roomId) {
        if (this.useDatabase) {
            const room = await Room.findOne({ roomId });
            return room ? room.toObject() : null;
        } else {
            return this.memoryRooms.get(roomId) || null;
        }
    }

    // Get all available rooms
    async getAvailableRooms() {
        if (this.useDatabase) {
            const rooms = await Room.find({
                status: 'waiting',
                $expr: { $lt: [{ $size: '$players' }, '$maxPlayers'] }
            }).sort({ createdAt: -1 }).limit(20);

            return rooms.map(room => ({
                roomId: room.roomId,
                playerCount: room.players.length,
                maxPlayers: room.maxPlayers,
                hostName: room.players[0]?.name,
                createdAt: room.createdAt
            }));
        } else {
            const available = [];
            for (const [roomId, room] of this.memoryRooms.entries()) {
                if (room.status === 'waiting' && room.players.length < room.maxPlayers) {
                    available.push({
                        roomId: room.roomId,
                        playerCount: room.players.length,
                        maxPlayers: room.maxPlayers,
                        hostName: room.players[0].name,
                        createdAt: room.createdAt
                    });
                }
            }
            return available;
        }
    }

    // Remove a player from a room
    async removePlayer(roomId, playerId) {
        let room;

        if (this.useDatabase) {
            room = await Room.findOne({ roomId });
        } else {
            room = this.memoryRooms.get(roomId);
        }

        if (!room) return null;

        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return room;

        const removedPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        console.log(`${removedPlayer.name} left room ${roomId}`);

        // If room is empty, delete it
        if (room.players.length === 0) {
            if (this.useDatabase) {
                await Room.deleteOne({ roomId });
            } else {
                this.memoryRooms.delete(roomId);
            }
            console.log(`Room ${roomId} deleted (empty)`);
            return null;
        }

        // If host left, assign new host
        if (room.host === playerId && room.players.length > 0) {
            room.host = room.players[0].id;
            console.log(`New host for room ${roomId}: ${room.players[0].name}`);
        }

        if (this.useDatabase) {
            await room.save();
            return room.toObject();
        } else {
            return room;
        }
    }

    // Start game in a room
    async startGame(roomId) {
        let room;

        if (this.useDatabase) {
            room = await Room.findOne({ roomId });
        } else {
            room = this.memoryRooms.get(roomId);
        }

        if (!room) {
            throw new Error('Room not found');
        }

        if (room.players.length !== 6) {
            throw new Error(`Need 6 players to start (currently ${room.players.length})`);
        }

        room.status = 'in_progress';

        if (this.useDatabase) {
            await room.save();
        }

        console.log(`Game started in room ${roomId}`);
        return room;
    }

    // Clean up old rooms (run periodically)
    async cleanupOldRooms() {
        if (this.useDatabase) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const result = await Room.deleteMany({
                status: 'finished',
                updatedAt: { $lt: oneHourAgo }
            });
            if (result.deletedCount > 0) {
                console.log(`🧹 Cleaned up ${result.deletedCount} old rooms`);
            }
        } else {
            // Memory cleanup
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            for (const [roomId, room] of this.memoryRooms.entries()) {
                if (room.status === 'finished' && room.createdAt < oneHourAgo) {
                    this.memoryRooms.delete(roomId);
                }
            }
        }
    }
}

module.exports = RoomManager;
