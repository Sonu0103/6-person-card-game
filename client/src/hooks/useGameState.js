import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useGameState(playerName, roomId = null) {
    const [gameState, setGameState] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!playerName) return;

        socketRef.current = io(SOCKET_URL);

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            // If roomId is provided, the game is already started via room system
            // Otherwise, use legacy joinGame for backward compatibility
            if (!roomId) {
                socket.emit('joinGame', { playerName });
            }
        });

        socket.on('gameStateUpdate', (state) => {
            setGameState(state);
            setError(null);
        });

        socket.on('error', (msg) => {
            setError(msg);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [playerName, roomId]);

    const makeBid = (bid) => {
        console.log('useGameState: makeBid called with', bid);
        if (socketRef.current) {
            socketRef.current.emit('makeBid', { bid, roomId: roomId || gameState?.roomId });
            console.log('useGameState: emitted makeBid for room', roomId || gameState?.roomId);
        } else {
            console.error('useGameState: socket not connected');
        }
    };

    const selectTrump = (suit) => {
        socketRef.current?.emit('selectTrump', { suit, roomId: roomId || gameState?.roomId });
    };

    const playCard = (card) => {
        socketRef.current?.emit('playCard', { card, roomId: roomId || gameState?.roomId });
    };

    const createSinglePlayerGame = (name) => {
        socketRef.current?.emit('createSinglePlayerGame', { playerName: name });
    };

    const makeSpecialRuleDecision = (activate) => {
        socketRef.current?.emit('makeSpecialRuleDecision', { activate, roomId: roomId || gameState?.roomId });
    };

    return {
        gameState,
        isConnected,
        error,
        makeBid,
        selectTrump,
        playCard,
        createSinglePlayerGame,
        makeSpecialRuleDecision,
        myId: socketRef.current?.id
    };
}
