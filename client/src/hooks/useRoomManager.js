import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useRoomManager() {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        newSocket.on('connect', () => {
            console.log('Connected to server for rooms');
            setIsConnected(true);
            setError(null);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('error', (errorMsg) => {
            console.error('Socket error:', errorMsg);
            setError(errorMsg);
        });

        newSocket.on('roomCreated', (room) => {
            console.log('Room created:', room);
            setCurrentRoom(room);
            setError(null);
        });

        newSocket.on('roomUpdate', (room) => {
            console.log('Room updated:', room);
            setCurrentRoom(room);
        });

        newSocket.on('playerDisconnected', ({ playerName }) => {
            console.log(`${playerName} disconnected`);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Create a new room
    const createRoom = (playerName) => {
        if (socket && isConnected) {
            socket.emit('createRoom', { playerName });
        } else {
            setError('Not connected to server');
        }
    };

    // Join an existing room
    const joinRoom = (roomId, playerName) => {
        if (socket && isConnected) {
            socket.emit('joinRoom', { roomId, playerName });
        } else {
            setError('Not connected to server');
        }
    };

    // Start the game (host only)
    const startGame = (roomId) => {
        if (socket && isConnected) {
            socket.emit('startGame', { roomId });
        } else {
            setError('Not connected to server');
        }
    };

    // Leave current room
    const leaveRoom = (roomId) => {
        if (socket && isConnected && roomId) {
            socket.emit('leaveRoom', { roomId });
            setCurrentRoom(null);
        }
    };

    return {
        socket,
        isConnected,
        currentRoom,
        error,
        createRoom,
        joinRoom,
        startGame,
        leaveRoom
    };
}
