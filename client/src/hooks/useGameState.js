import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.PROD ? 'https://card-game-server-b3lz.onrender.com' : 'http://localhost:3001');

export function useGameState(playerName) {
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
            socket.emit('joinGame', { playerName });
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
    }, [playerName]);

    const makeBid = (bid) => {
        console.log('useGameState: makeBid called with', bid);
        if (socketRef.current) {
            socketRef.current.emit('makeBid', { bid, roomId: gameState?.roomId });
            console.log('useGameState: emitted makeBid for room', gameState?.roomId);
        } else {
            console.error('useGameState: socket not connected');
        }
    };

    const selectTrump = (suit) => {
        socketRef.current?.emit('selectTrump', { suit, roomId: gameState?.roomId });
    };

    const playCard = (card) => {
        socketRef.current?.emit('playCard', { card, roomId: gameState?.roomId });
    };

    const createSinglePlayerGame = (name) => {
        socketRef.current?.emit('createSinglePlayerGame', { playerName: name });
    };

    const makeSpecialRuleDecision = (activate) => {
        socketRef.current?.emit('makeSpecialRuleDecision', { activate, roomId: gameState?.roomId });
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
