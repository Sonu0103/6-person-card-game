const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    team: { type: String, enum: ['A', 'B'], required: true },
    ready: { type: Boolean, default: false }
});

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    host: { type: String, required: true },
    players: [playerSchema],
    maxPlayers: { type: Number, default: 6 },
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'finished'],
        default: 'waiting',
        index: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for finding available rooms quickly
roomSchema.index({ status: 1, createdAt: -1 });

// Clean up old finished rooms automatically
roomSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 }); // Delete after 1 hour of inactivity

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
