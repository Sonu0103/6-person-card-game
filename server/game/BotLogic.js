const Card = require('./Card');

class BotLogic {
    static getBid(hand) {
        // Simple logic: Count Aces and Kings.
        // If > 2 high cards, bid number of high cards + 4 (min 5).
        // Otherwise pass or bid 5 with low probability.

        let highCards = 0;
        hand.forEach(c => {
            if (['A', 'K', 'Q'].includes(c.rank)) highCards++;
        });

        if (highCards >= 3) {
            return Math.min(8, 4 + Math.floor(highCards / 1.5));
        } else if (highCards >= 1) {
            // 50% chance to bid 5
            return Math.random() > 0.5 ? 5 : 'PASS';
        }
        return 'PASS';
    }

    static selectTrump(hand) {
        // Count suits, pick most frequent
        const counts = { 'S': 0, 'H': 0, 'D': 0, 'C': 0 };
        hand.forEach(c => counts[c.suit]++);

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    static playCard(hand, gameState) {
        const { currentTrick, trumpSuit, players, currentTurn, bidWinner } = gameState;
        const botPlayer = players[currentTurn];
        const botTeam = botPlayer.team;

        // If leading the trick
        if (currentTrick.length === 0) {
            return this.leadCard(hand, trumpSuit);
        }

        const leadSuit = currentTrick[0].card.suit;
        const followSuitCards = hand.filter(c => c.suit === leadSuit);

        // Must follow suit if possible
        if (followSuitCards.length > 0) {
            return this.followSuit(followSuitCards, currentTrick, trumpSuit, botTeam, players);
        }

        // Can't follow suit - decide whether to trump or discard
        return this.cannotFollowSuit(hand, currentTrick, trumpSuit, botTeam, players, bidWinner);
    }

    static leadCard(hand, trumpSuit) {
        // Lead with highest non-trump card, or trump if no choice
        const nonTrump = hand.filter(c => c.suit !== trumpSuit);
        if (nonTrump.length > 0) {
            nonTrump.sort((a, b) => Card.getRankValue(b.rank) - Card.getRankValue(a.rank));
            return nonTrump[0];
        }
        return hand[0];
    }

    static followSuit(followSuitCards, currentTrick, trumpSuit, botTeam, players) {
        const currentWinner = this.getCurrentWinner(currentTrick, trumpSuit);
        const winningPlayer = players[currentWinner.playerIndex];

        // Check if teammate is currently winning
        if (winningPlayer.team === botTeam) {
            // Teammate winning - play lowest card to save high cards
            followSuitCards.sort((a, b) => Card.getRankValue(a.rank) - Card.getRankValue(b.rank));
            return followSuitCards[0];
        } else {
            // Opponent winning - try to win with highest card
            followSuitCards.sort((a, b) => Card.getRankValue(b.rank) - Card.getRankValue(a.rank));
            const highestCard = followSuitCards[0];

            // Only play high card if it can actually win
            if (Card.getRankValue(highestCard.rank) > Card.getRankValue(currentWinner.card.rank)) {
                return highestCard;
            }
            // Can't win anyway, play lowest
            return followSuitCards[followSuitCards.length - 1];
        }
    }

    static cannotFollowSuit(hand, currentTrick, trumpSuit, botTeam, players, bidWinner) {
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
        const shouldTrump = this.shouldUseTrump(currentTrick, trumpCards, botTeam, callingTeam, currentWinner);

        if (shouldTrump && trumpCards.length > 0) {
            // Use lowest trump that can win
            trumpCards.sort((a, b) => Card.getRankValue(a.rank) - Card.getRankValue(b.rank));

            // If current winner is also trump, need higher trump
            if (currentWinner.card.suit === trumpSuit) {
                const winningTrump = trumpCards.find(c =>
                    Card.getRankValue(c.rank) > Card.getRankValue(currentWinner.card.rank)
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

    static shouldUseTrump(currentTrick, trumpCards, botTeam, callingTeam, currentWinner) {
        if (trumpCards.length === 0) return false;

        // If we're the calling team and need tricks, trump is more valuable
        const isCallingTeam = botTeam === callingTeam;

        // Trump if:
        // 1. We're the calling team and need to win tricks
        // 2. The trick has high-value cards (A, K, Q)
        // 3. We have strong trump (A, K, Q of trump)

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
        // Discard lowest non-trump card if possible
        const nonTrump = hand.filter(c => c.suit !== trumpSuit);
        if (nonTrump.length > 0) {
            nonTrump.sort((a, b) => Card.getRankValue(a.rank) - Card.getRankValue(b.rank));
            return nonTrump[0];
        }
        // Only trump cards left, discard lowest trump
        hand.sort((a, b) => Card.getRankValue(a.rank) - Card.getRankValue(b.rank));
        return hand[0];
    }

    static getCurrentWinner(currentTrick, trumpSuit) {
        const leadSuit = currentTrick[0].card.suit;
        let winner = currentTrick[0];

        for (let i = 1; i < currentTrick.length; i++) {
            const current = currentTrick[i];

            // Trump beats non-trump
            if (current.card.suit === trumpSuit && winner.card.suit !== trumpSuit) {
                winner = current;
            }
            // Both trump or both same suit - higher rank wins
            else if (current.card.suit === winner.card.suit) {
                if (Card.getRankValue(current.card.rank) > Card.getRankValue(winner.card.rank)) {
                    winner = current;
                }
            }
        }

        return winner;
    }
}

module.exports = BotLogic;
