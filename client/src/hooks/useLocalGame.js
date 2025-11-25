import { useState, useEffect, useRef, useCallback } from 'react';
import { LocalGameEngine } from '../game/LocalGameEngine';

export function useLocalGame(playerName, difficulty) {
    const [gameState, setGameState] = useState(null);
    const engineRef = useRef(null);

    // Initialize game engine
    useEffect(() => {
        if (!playerName || !difficulty) return;

        const engine = new LocalGameEngine((newState) => {
            setGameState({ ...newState }); // Create new object to trigger re-render
        }, difficulty);

        engine.initGame(playerName);
        engineRef.current = engine;

        // Cleanup
        return () => {
            engineRef.current = null;
        };
    }, [playerName, difficulty]);

    const makeBid = useCallback((bid) => {
        engineRef.current?.makeBid('human', bid);
    }, []);

    const selectTrump = useCallback((suit) => {
        engineRef.current?.selectTrump('human', suit);
    }, []);

    const playCard = useCallback((card) => {
        engineRef.current?.playCard('human', card);
    }, []);

    const makeSpecialRuleDecision = useCallback((activate) => {
        engineRef.current?.makeSpecialRuleDecision('human', activate);
    }, []);

    return {
        gameState,
        makeBid,
        selectTrump,
        playCard,
        makeSpecialRuleDecision,
        myId: 'human'
    };
}
