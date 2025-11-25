
export class LocalBotLogic {
    static getBid(hand, difficulty = 'MEDIUM') {
        // Difficulty adjustments for bidding
        // EASY: Randomly bids or passes, underestimates hand
        // MEDIUM: Standard logic (count high cards)
        // HARD: Aggressive bidding, counts distribution

        let highCards = 0;
        hand.forEach(c => {
            if (['A', 'K', 'Q'].includes(c.rank)) highCards++;
        });

        if (difficulty === 'EASY') {
            // 50% chance to underbid or pass randomly
            if (Math.random() > 0.5) return 'PASS';
            return Math.max(5, highCards + 3);
        }

        if (difficulty === 'HARD') {
            // Aggressive: Count Jacks as 0.5, 10s as 0.25
            let strength = highCards;
            hand.forEach(c => {
                if (c.rank === 'J') strength += 0.5;
                if (c.rank === '10') strength += 0.25;
            });

            if (strength >= 3.5) return Math.min(8, Math.floor(strength + 4));
            if (strength >= 2) return Math.random() > 0.3 ? 5 : 'PASS';
            return 'PASS';
        }

        // MEDIUM (Standard)
        if (highCards >= 3) {
            return Math.min(8, 4 + Math.floor(highCards / 1.5));
        } else if (highCards >= 1) {
            return Math.random() > 0.5 ? 5 : 'PASS';
        }
        return 'PASS';
    }

    static selectTrump(hand, difficulty = 'MEDIUM') {
        const counts = { 'S': 0, 'H': 0, 'D': 0, 'C': 0 };
        hand.forEach(c => counts[c.suit]++);

        if (difficulty === 'EASY') {
            // 20% chance to pick a random suit
            if (Math.random() < 0.2) {
                const suits = ['S', 'H', 'D', 'C'];
                return suits[Math.floor(Math.random() * 4)];
            }
        }

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    static playCard(hand, gameState, difficulty = 'MEDIUM') {
        const { currentTrick, trumpSuit, players, currentTurn, bidWinner } = gameState;
        const botPlayer = players[currentTurn];
        const botTeam = botPlayer.team;

        // If leading the trick
        if (currentTrick.length === 0) {
            return this.leadCard(hand, trumpSuit, difficulty);
        }

        const leadSuit = currentTrick[0].card.suit;
        const followSuitCards = hand.filter(c => c.suit === leadSuit);

        // Must follow suit if possible
        if (followSuitCards.length > 0) {
            return this.followSuit(followSuitCards, currentTrick, trumpSuit, botTeam, players, difficulty);
        }

        // Can't follow suit - decide whether to trump or discard
        return this.cannotFollowSuit(hand, currentTrick, trumpSuit, botTeam, players, bidWinner, difficulty);
    }

    static leadCard(hand, trumpSuit, difficulty) {
        if (difficulty === 'EASY') {
            // Random card
            return hand[Math.floor(Math.random() * hand.length)];
        }

        // Lead with highest non-trump card, or trump if no choice
        const nonTrump = hand.filter(c => c.suit !== trumpSuit);

        // Helper to get rank value
        const getRankValue = (rank) => {
            const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
            return values[rank] || 0;
        };

        if (nonTrump.length > 0) {
            nonTrump.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
            return nonTrump[0];
        }
        return hand[0];
    }

    static followSuit(followSuitCards, currentTrick, trumpSuit, botTeam, players, difficulty) {
        const getRankValue = (rank) => {
            const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
            return values[rank] || 0;
        };

        if (difficulty === 'EASY') {
            // Random valid card
            return followSuitCards[Math.floor(Math.random() * followSuitCards.length)];
        }

        const currentWinner = this.getCurrentWinner(currentTrick, trumpSuit);
        const winningPlayer = players[currentWinner.playerIndex];

        // Check if teammate is currently winning
        if (winningPlayer.team === botTeam) {
            // Teammate winning - play lowest card to save high cards
            followSuitCards.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
            return followSuitCards[0];
        } else {
            // Opponent winning - try to win with highest card
            followSuitCards.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
            const highestCard = followSuitCards[0];

            // Only play high card if it can actually win
            if (getRankValue(highestCard.rank) > getRankValue(currentWinner.card.rank)) {
                return highestCard;
            }
            // Can't win anyway, play lowest
            return followSuitCards[followSuitCards.length - 1];
        }
    }

    static cannotFollowSuit(hand, currentTrick, trumpSuit, botTeam, players, bidWinner, difficulty) {
        const getRankValue = (rank) => {
            const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
            return values[rank] || 0;
        };

        if (difficulty === 'EASY') {
            return hand[Math.floor(Math.random() * hand.length)];
        }

        const currentWinner = this.getCurrentWinner(currentTrick, trumpSuit);
        const winningPlayer = players[currentWinner.playerIndex];
        const trumpCards = hand.filter(c => c.suit === trumpSuit);

        // Check if teammate is winning
        if (winningPlayer.team === botTeam) {
            // Teammate winning - don't waste trump, discard lowest card
            return this.discardLowest(hand, trumpSuit);
        }

        // Opponent is winning - evaluate if we should trump
        const callingTeam = players[bidWinner].team;
        const shouldTrump = this.shouldUseTrump(currentTrick, trumpCards, botTeam, callingTeam, currentWinner, difficulty);

        if (shouldTrump && trumpCards.length > 0) {
            // Use lowest trump that can win
            trumpCards.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));

            // If current winner is also trump, need higher trump
            if (currentWinner.card.suit === trumpSuit) {
                const winningTrump = trumpCards.find(c =>
                    getRankValue(c.rank) > getRankValue(currentWinner.card.rank)
                );
                if (winningTrump) return winningTrump;
            } else {
                // Current winner is not trump, any trump wins
                return trumpCards[0];
            }
        }

        // Don't use trump or can't win - discard lowest non-trump
        return this.discardLowest(hand, trumpSuit);
    }

    static shouldUseTrump(currentTrick, trumpCards, botTeam, callingTeam, currentWinner, difficulty) {
        if (trumpCards.length === 0) return false;

        if (difficulty === 'HARD') {
            // Always trump if opponent winning and we can win
            return true;
        }

        // If we're the calling team and need tricks, trump is more valuable
        const isCallingTeam = botTeam === callingTeam;

        const hasHighValueCards = currentTrick.some(play =>
            ['A', 'K', 'Q'].includes(play.card.rank)
        );

        const hasStrongTrump = trumpCards.some(c =>
            ['A', 'K', 'Q'].includes(c.rank)
        );

        // If calling team and trick is important, use trump
        if (isCallingTeam && hasHighValueCards) return true;

        // If we have strong trump and trick has value, use it
        if (hasStrongTrump && hasHighValueCards) return true;

        // If it's late in the game (few cards left), be more aggressive
        if (trumpCards.length <= 2) return true;

        return false;
    }

    static discardLowest(hand, trumpSuit) {
        const getRankValue = (rank) => {
            const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
            return values[rank] || 0;
        };

        // Discard lowest non-trump card if possible
        const nonTrump = hand.filter(c => c.suit !== trumpSuit);
        if (nonTrump.length > 0) {
            nonTrump.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
            return nonTrump[0];
        }
        // Only trump cards left, discard lowest trump
        hand.sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
        return hand[0];
    }

    static getCurrentWinner(currentTrick, trumpSuit) {
        const getRankValue = (rank) => {
            const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
            return values[rank] || 0;
        };

        let winner = currentTrick[0];

        for (let i = 1; i < currentTrick.length; i++) {
            const current = currentTrick[i];

            // Trump beats non-trump
            if (current.card.suit === trumpSuit && winner.card.suit !== trumpSuit) {
                winner = current;
            }
            // Both trump or both same suit - higher rank wins
            else if (current.card.suit === winner.card.suit) {
                if (getRankValue(current.card.rank) > getRankValue(winner.card.rank)) {
                    winner = current;
                }
            }
        }

        return winner;
    }
}
