const Card = require('./Card');
const BotLogic = require('./BotLogic');

class GameState {
    constructor(roomId, onUpdate) {
        this.roomId = roomId;
        this.onUpdate = onUpdate; // Callback to notify server of changes
        this.players = []; // { id, name, team, hand: [], tricksWon: 0, bid: null, isBot: boolean }
        this.deck = [];
        this.phase = 'WAITING'; // WAITING, BIDDING, TRUMP_SELECTION, PLAYING, SCORING, GAME_OVER
        this.currentTurn = 0; // Index of player whose turn it is
        this.dealerIndex = 0;

        this.currentBid = 0;
        this.bidWinner = null; // Player index
        this.trumpSuit = null;

        this.currentTrick = []; // { playerId, card }
        this.trickLeader = 0;

        this.scores = { 'A': 0, 'B': 0 };

        this.gameLog = [];
    }

    addPlayer(id, name, isBot = false) {
        if (this.players.length >= 6) return false;

        // Assign team: A (0, 2, 4), B (1, 3, 5)
        const team = this.players.length % 2 === 0 ? 'A' : 'B';
        this.players.push({
            id,
            name,
            team,
            hand: [],
            tricksWon: 0,
            bid: null,
            isBot
        });

        if (this.players.length === 6) {
            this.startGame();
        }
        return true;
    }

    addBots() {
        while (this.players.length < 6) {
            this.addPlayer(`bot-${Date.now()}-${this.players.length}`, `Bot ${this.players.length + 1}`, true);
        }
    }

    getPlayerTeam(id) {
        const p = this.players.find(p => p.id === id);
        return p ? p.team : null;
    }

    startGame() {
        this.phase = 'BIDDING';
        this.initializeDeck();
        this.dealCards();

        // Reset round state
        this.currentBid = 0;
        this.bidWinner = null;
        this.trumpSuit = null;
        this.players.forEach(p => {
            p.tricksWon = 0;
            p.bid = null;
        });

        // Player next to dealer starts bidding
        this.currentTurn = (this.dealerIndex + 1) % 6;
        this.gameLog.push('Game started. Bidding phase begins.');

        this.checkBotTurn();
    }

    initializeDeck() {
        const suits = ['S', 'H', 'D', 'C'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']; // No 2s
        this.deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push(new Card(suit, rank));
            }
        }
        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCards() {
        for (let i = 0; i < 6; i++) {
            this.players[i].hand = this.deck.slice(i * 8, (i + 1) * 8);
            // Sort hand for convenience
            this.players[i].hand.sort((a, b) => {
                if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
                return Card.getRankValue(a.rank) - Card.getRankValue(b.rank);
            });
        }
    }

    checkBotTurn() {
        const player = this.players[this.currentTurn];
        console.log(`Checking bot turn. Current Turn: ${this.currentTurn}, Player: ${player?.name}, IsBot: ${player?.isBot}, Phase: ${this.phase}`);

        if (player && player.isBot) {
            setTimeout(() => {
                try {
                    console.log(`Bot ${player.name} taking turn...`);
                    if (this.phase === 'BIDDING') {
                        const bid = BotLogic.getBid(player.hand);
                        console.log(`Bot ${player.name} decides to bid: ${bid}`);
                        this.makeBid(player.id, { bid });
                        this.onUpdate?.();
                    } else if (this.phase === 'TRUMP_SELECTION') {
                        const suit = BotLogic.selectTrump(player.hand);
                        console.log(`Bot ${player.name} selects trump: ${suit}`);
                        this.selectTrump(player.id, { suit });
                        this.onUpdate?.();
                    } else if (this.phase === 'PLAYING') {
                        const card = BotLogic.playCard(player.hand, this);
                        console.log(`Bot ${player.name} plays card: ${card.rank}${card.suit}`);
                        this.playCard(player.id, { card });
                        this.onUpdate?.();
                    }
                } catch (e) {
                    console.error('Bot error:', e);
                    // If bot errors, force pass/play random to prevent stuck game
                    if (this.phase === 'BIDDING') {
                        this.makeBid(player.id, { bid: 'PASS' });
                        this.onUpdate?.();
                    }
                }
            }, 1000);
        }
    }

    makeBid(playerId, { bid }) {
        console.log(`makeBid called by ${playerId} with bid: ${bid}. Phase: ${this.phase}, CurrentTurn: ${this.currentTurn}`);
        if (this.phase !== 'BIDDING') throw new Error('Not bidding phase');
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.currentTurn) throw new Error('Not your turn');

        if (bid === 'PASS') {
            this.gameLog.push(`${this.players[playerIndex].name} passed.`);
            this.players[playerIndex].bid = 'PASS';
            console.log(`Player ${playerIndex} passed.`);
        } else {
            const bidVal = parseInt(bid);
            if (isNaN(bidVal) || bidVal < 5 || bidVal <= this.currentBid) {
                if (this.players[playerIndex].isBot) {
                    this.gameLog.push(`${this.players[playerIndex].name} passed (invalid bid).`);
                    this.players[playerIndex].bid = 'PASS';
                    console.log(`Bot ${playerIndex} passed (invalid bid).`);
                } else {
                    throw new Error('Invalid bid');
                }
            } else {
                this.currentBid = bidVal;
                this.bidWinner = playerIndex;
                this.gameLog.push(`${this.players[playerIndex].name} bid ${bidVal}.`);
                this.players[playerIndex].bid = bidVal;
                console.log(`Player ${playerIndex} bid ${bidVal}.`);
            }
        }

        const nextPlayer = (this.currentTurn + 1) % 6;
        const startPlayer = (this.dealerIndex + 1) % 6;

        console.log(`NextPlayer: ${nextPlayer}, StartPlayer: ${startPlayer}`);

        if (nextPlayer === startPlayer) {
            console.log('Bidding round complete. Finalizing.');
            this.finalizeBidding();
        } else {
            this.currentTurn = nextPlayer;
            this.checkBotTurn();
        }
    }

    finalizeBidding() {
        console.log('finalizeBidding called.');
        if (this.bidWinner === null) {
            this.bidWinner = this.dealerIndex;
            this.currentBid = 5;
            this.gameLog.push('Everyone passed. Dealer forced to call 5.');
        }

        this.phase = 'TRUMP_SELECTION';
        this.currentTurn = this.bidWinner;
        this.gameLog.push(`${this.players[this.bidWinner].name} won the bid with ${this.currentBid}. Waiting for Trump selection.`);
        console.log(`Bid winner: ${this.bidWinner}. Phase changed to TRUMP_SELECTION.`);
        this.checkBotTurn();
    }

    selectTrump(playerId, { suit }) {
        if (this.phase !== 'TRUMP_SELECTION') throw new Error('Not trump selection phase');
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.bidWinner) throw new Error('Only caller can select trump');

        if (!['S', 'H', 'D', 'C'].includes(suit)) throw new Error('Invalid suit');

        this.trumpSuit = suit;
        this.phase = 'PLAYING';
        this.trickLeader = (this.dealerIndex + 1) % 6;
        this.currentTurn = this.trickLeader;
        this.gameLog.push(`Trump selected: ${suit}. Play begins.`);
        this.checkBotTurn();
    }

    playCard(playerId, { card }) {
        if (this.phase !== 'PLAYING') throw new Error('Not playing phase');
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.currentTurn) throw new Error('Not your turn');

        const playerHand = this.players[playerIndex].hand;
        const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);

        if (cardIndex === -1) throw new Error('Card not in hand');

        const playedCard = playerHand[cardIndex];

        if (this.currentTrick.length > 0) {
            const leadSuit = this.currentTrick[0].card.suit;
            if (playedCard.suit !== leadSuit) {
                const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
                if (hasLeadSuit) {
                    throw new Error(`Must follow suit: ${leadSuit}`);
                }
            }
        }

        this.players[playerIndex].hand.splice(cardIndex, 1);
        this.currentTrick.push({ playerId, card: playedCard, playerIndex });
        this.gameLog.push(`${this.players[playerIndex].name} played ${playedCard.rank}${playedCard.suit}`);

        if (this.currentTrick.length === 6) {
            // Broadcast state immediately so all 6 cards are visible
            this.onUpdate?.();

            // Wait 3 seconds before resolving the trick
            setTimeout(() => {
                this.resolveTrick();
                this.onUpdate?.();
            }, 3000);
        } else {
            this.currentTurn = (this.currentTurn + 1) % 6;
            this.checkBotTurn();
        }
    }

    resolveTrick() {
        const leadSuit = this.currentTrick[0].card.suit;
        let winnerIndex = 0;
        let winningCard = this.currentTrick[0].card;

        for (let i = 1; i < 6; i++) {
            const checkCard = this.currentTrick[i].card;

            if (checkCard.suit === this.trumpSuit && winningCard.suit !== this.trumpSuit) {
                winnerIndex = i;
                winningCard = checkCard;
            } else if (checkCard.suit === winningCard.suit) {
                if (Card.getRankValue(checkCard.rank) > Card.getRankValue(winningCard.rank)) {
                    winnerIndex = i;
                    winningCard = checkCard;
                }
            }
        }

        const trickWinner = this.currentTrick[winnerIndex];
        const winnerPlayerIndex = trickWinner.playerIndex;

        this.players[winnerPlayerIndex].tricksWon++;
        this.gameLog.push(`${this.players[winnerPlayerIndex].name} won the trick.`);

        this.currentTrick = [];
        this.trickLeader = winnerPlayerIndex;
        this.currentTurn = winnerPlayerIndex;

        if (this.players[0].hand.length === 0) {
            this.calculateScores();
        } else {
            this.checkBotTurn();
        }
    }

    calculateScores() {
        this.phase = 'SCORING';

        const teamTricks = { 'A': 0, 'B': 0 };
        this.players.forEach(p => {
            teamTricks[p.team] += p.tricksWon;
        });

        const callerTeam = this.players[this.bidWinner].team;
        const opponentTeam = callerTeam === 'A' ? 'B' : 'A';

        // Bidding team scoring
        if (teamTricks[callerTeam] >= this.currentBid) {
            // If they meet or exceed the bid, they get points equal to the bid (not tricks won)
            this.scores[callerTeam] += this.currentBid;
            this.gameLog.push(`Team ${callerTeam} met bid of ${this.currentBid} with ${teamTricks[callerTeam]} tricks. (+${this.currentBid} points)`);
        } else {
            // If they fail, they lose double the bid
            const penalty = this.currentBid * 2;
            this.scores[callerTeam] -= penalty;
            this.gameLog.push(`Team ${callerTeam} failed bid of ${this.currentBid} with only ${teamTricks[callerTeam]} tricks. (-${penalty} points)`);
        }

        // Non-bidding team gets 0 points
        this.gameLog.push(`Team ${opponentTeam} (non-bidding) gets 0 points.`);

        // Check for game over conditions: +52 or -52
        let gameOver = false;
        let winner = null;

        if (this.scores['A'] >= 52) {
            gameOver = true;
            winner = 'A';
            this.gameLog.push(`🎉 GAME OVER! Team A wins with ${this.scores['A']} points!`);
        } else if (this.scores['B'] >= 52) {
            gameOver = true;
            winner = 'B';
            this.gameLog.push(`🎉 GAME OVER! Team B wins with ${this.scores['B']} points!`);
        } else if (this.scores['A'] <= -52) {
            gameOver = true;
            winner = 'B';
            this.gameLog.push(`🎉 GAME OVER! Team B wins! Team A reached -52 points.`);
        } else if (this.scores['B'] <= -52) {
            gameOver = true;
            winner = 'A';
            this.gameLog.push(`🎉 GAME OVER! Team A wins! Team B reached -52 points.`);
        }

        if (gameOver) {
            this.phase = 'GAME_OVER';
            this.winner = winner;
        } else {
            this.dealerIndex = (this.dealerIndex + 1) % 6;
            setTimeout(() => this.startGame(), 5000);
        }
    }

    getPublicState() {
        return {
            roomId: this.roomId,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                team: p.team,
                handCount: p.hand.length,
                tricksWon: p.tricksWon,
                bid: p.bid
            })),
            phase: this.phase,
            currentTurn: this.currentTurn,
            trumpSuit: this.trumpSuit,
            currentTrick: this.currentTrick,
            scores: this.scores,
            currentBid: this.currentBid,
            bidWinner: this.bidWinner,
            dealerIndex: this.dealerIndex,
            gameLog: this.gameLog.slice(-10),
            winner: this.winner
        };
    }

    getPlayerState(playerId) {
        const publicState = this.getPublicState();
        const player = this.players.find(p => p.id === playerId);
        return {
            ...publicState,
            myHand: player ? player.hand : [],
            myId: playerId
        };
    }
}

module.exports = GameState;
