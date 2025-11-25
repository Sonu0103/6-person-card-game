import { LocalBotLogic } from './LocalBotLogic';

// Card class adapted for client
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    static getRankValue(rank) {
        const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
        return values[rank] || 0;
    }
}

export class LocalGameEngine {
    constructor(onUpdate, difficulty = 'MEDIUM') {
        this.onUpdate = onUpdate; // Callback to update React state
        this.difficulty = difficulty;
        this.players = []; // { id, name, team, hand: [], tricksWon: 0, bid: null, isBot: boolean }
        this.deck = [];
        this.phase = 'WAITING'; // WAITING, BIDDING, TRUMP_SELECTION, PLAYING, SCORING, GAME_OVER
        this.currentTurn = 0;
        this.dealerIndex = 0;

        this.currentBid = 0;
        this.bidWinner = null;
        this.trumpSuit = null;

        this.currentTrick = []; // { playerId, card }
        this.trickLeader = 0;

        this.scores = { 'A': 0, 'B': 0 };
        this.gameLog = [];

        // 16-points special rule tracking
        this.consecutiveTricksWon = { 'A': 0, 'B': 0 };
        this.specialRuleEligible = false;
        this.specialRuleActivated = false;
        this.specialRuleTeam = null;
        this.awaitingSpecialRuleDecision = false;

        this.winner = null;
    }

    initGame(playerName) {
        this.players = [];
        // Add Human Player
        this.addPlayer('human', playerName, false);
        // Add 5 Bots
        for (let i = 1; i <= 5; i++) {
            this.addPlayer(`bot-${i}`, `Bot ${i}`, true);
        }
        this.startGame();
    }

    addPlayer(id, name, isBot = false) {
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

        // Reset special rule state
        this.consecutiveTricksWon = { 'A': 0, 'B': 0 };
        this.specialRuleEligible = false;
        this.specialRuleActivated = false;
        this.specialRuleTeam = null;
        this.awaitingSpecialRuleDecision = false;

        // Player next to dealer starts bidding
        this.currentTurn = (this.dealerIndex + 1) % 6;
        this.gameLog.push('Game started. Bidding phase begins.');

        this.notifyUpdate();
        this.checkBotTurn();
    }

    initializeDeck() {
        const suits = ['S', 'H', 'D', 'C'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
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
            this.players[i].hand.sort((a, b) => {
                if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
                return Card.getRankValue(a.rank) - Card.getRankValue(b.rank);
            });
        }
    }

    checkBotTurn() {
        const player = this.players[this.currentTurn];
        if (player && player.isBot) {
            // Simulate thinking time
            setTimeout(() => {
                try {
                    if (this.phase === 'BIDDING') {
                        const bid = LocalBotLogic.getBid(player.hand, this.difficulty);
                        this.makeBid(player.id, bid);
                    } else if (this.phase === 'TRUMP_SELECTION') {
                        const suit = LocalBotLogic.selectTrump(player.hand, this.difficulty);
                        this.selectTrump(player.id, suit);
                    } else if (this.phase === 'PLAYING') {
                        const card = LocalBotLogic.playCard(player.hand, this, this.difficulty);
                        this.playCard(player.id, card);
                    }
                } catch (e) {
                    console.error('Bot error:', e);
                    // Fallback to prevent stuck game
                    if (this.phase === 'BIDDING') {
                        this.makeBid(player.id, 'PASS');
                    }
                }
            }, 1000); // 1 second delay for realism
        }
    }

    makeBid(playerId, bid) {
        if (this.phase !== 'BIDDING') return;
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.currentTurn) return;

        if (bid === 'PASS') {
            this.gameLog.push(`${this.players[playerIndex].name} passed.`);
            this.players[playerIndex].bid = 'PASS';
        } else {
            const bidVal = parseInt(bid);
            if (isNaN(bidVal) || bidVal < 5 || bidVal <= this.currentBid) {
                // Invalid bid, treat as pass for bots, error for human
                if (this.players[playerIndex].isBot) {
                    this.players[playerIndex].bid = 'PASS';
                } else {
                    throw new Error('Invalid bid');
                }
            } else {
                this.currentBid = bidVal;
                this.bidWinner = playerIndex;
                this.gameLog.push(`${this.players[playerIndex].name} bid ${bidVal}.`);
                this.players[playerIndex].bid = bidVal;
            }
        }

        const nextPlayer = (this.currentTurn + 1) % 6;
        const startPlayer = (this.dealerIndex + 1) % 6;

        if (nextPlayer === startPlayer) {
            this.finalizeBidding();
        } else {
            this.currentTurn = nextPlayer;
            this.notifyUpdate();
            this.checkBotTurn();
        }
    }

    finalizeBidding() {
        if (this.bidWinner === null) {
            this.bidWinner = this.dealerIndex;
            this.currentBid = 5;
            this.gameLog.push('Everyone passed. Dealer forced to call 5.');
        }

        this.phase = 'TRUMP_SELECTION';
        this.currentTurn = this.bidWinner;
        this.gameLog.push(`${this.players[this.bidWinner].name} won the bid with ${this.currentBid}. Waiting for Trump selection.`);

        this.notifyUpdate();
        this.checkBotTurn();
    }

    selectTrump(playerId, suit) {
        if (this.phase !== 'TRUMP_SELECTION') return;
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.bidWinner) return;

        this.trumpSuit = suit;
        this.phase = 'PLAYING';
        this.trickLeader = (this.dealerIndex + 1) % 6;
        this.currentTurn = this.trickLeader;
        this.gameLog.push(`Trump selected: ${suit}. Play begins.`);

        this.notifyUpdate();
        this.checkBotTurn();
    }

    playCard(playerId, card) {
        if (this.phase !== 'PLAYING') return;
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== this.currentTurn) return;

        const playerHand = this.players[playerIndex].hand;
        const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);

        if (cardIndex === -1) return; // Should not happen

        const playedCard = playerHand[cardIndex];

        // Validation
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
            this.notifyUpdate();
            // Wait before resolving trick
            setTimeout(() => {
                this.resolveTrick();
                this.notifyUpdate();
            }, 2000);
        } else {
            this.currentTurn = (this.currentTurn + 1) % 6;
            this.notifyUpdate();
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
        const winnerTeam = this.players[winnerPlayerIndex].team;
        this.gameLog.push(`${this.players[winnerPlayerIndex].name} won the trick.`);

        // Track consecutive trick wins for special rule
        const loserTeam = winnerTeam === 'A' ? 'B' : 'A';
        this.consecutiveTricksWon[winnerTeam]++;
        this.consecutiveTricksWon[loserTeam] = 0;

        this.currentTrick = [];
        this.trickLeader = winnerPlayerIndex;
        this.currentTurn = winnerPlayerIndex;

        // Check for special rule eligibility
        const callingTeam = this.players[this.bidWinner].team;
        if (!this.specialRuleActivated &&
            !this.specialRuleEligible &&
            winnerTeam === callingTeam &&
            this.consecutiveTricksWon[winnerTeam] === 5 &&
            this.currentBid >= 6) {

            this.specialRuleEligible = true;
            this.awaitingSpecialRuleDecision = true;
            this.phase = 'SPECIAL_RULE_DECISION';
            this.gameLog.push(`🎯 Team ${winnerTeam} is eligible for the 16-Points Challenge!`);

            // If bot, automatically decide (for now, bots decline to be safe)
            if (this.players[this.currentTurn].isBot) {
                setTimeout(() => this.makeSpecialRuleDecision(this.players[this.currentTurn].id, false), 1000);
            }
            return;
        }

        // Check failure condition
        if (this.specialRuleActivated && winnerTeam !== this.specialRuleTeam) {
            this.gameLog.push(`❌ Team ${this.specialRuleTeam} failed the 16-Points Challenge!`);
            this.calculateScores();
            return;
        }

        if (this.players[0].hand.length === 0) {
            this.calculateScores();
        } else {
            this.checkBotTurn();
        }
    }

    makeSpecialRuleDecision(playerId, activate) {
        if (!this.awaitingSpecialRuleDecision) return;
        const playerIndex = this.players.findIndex(p => p.id === playerId);

        this.awaitingSpecialRuleDecision = false;

        if (activate) {
            this.specialRuleActivated = true;
            this.specialRuleTeam = this.players[playerIndex].team;
            this.phase = 'PLAYING';
            this.gameLog.push(`⚡ Team ${this.specialRuleTeam} activated the 16-Points Challenge!`);
        } else {
            this.specialRuleEligible = false;
            this.phase = 'PLAYING';
            this.gameLog.push(`Team ${this.players[playerIndex].team} declined the challenge.`);
        }

        this.notifyUpdate();
        this.checkBotTurn();
    }

    calculateScores() {
        this.phase = 'SCORING';
        const teamTricks = { 'A': 0, 'B': 0 };
        this.players.forEach(p => {
            teamTricks[p.team] += p.tricksWon;
        });

        const callerTeam = this.players[this.bidWinner].team;
        const opponentTeam = callerTeam === 'A' ? 'B' : 'A';

        if (this.specialRuleActivated) {
            if (teamTricks[this.specialRuleTeam] === 8) {
                this.scores[this.specialRuleTeam] += 16;
                this.gameLog.push(`🎉 Team ${this.specialRuleTeam} SUCCESS! (+16 points)`);
            } else {
                this.scores[this.specialRuleTeam] -= 32;
                this.gameLog.push(`💥 Team ${this.specialRuleTeam} FAILED! (-32 points)`);
            }
        } else {
            if (teamTricks[callerTeam] >= this.currentBid) {
                this.scores[callerTeam] += this.currentBid;
                this.gameLog.push(`Team ${callerTeam} met bid (+${this.currentBid})`);
            } else {
                const penalty = this.currentBid * 2;
                this.scores[callerTeam] -= penalty;
                this.gameLog.push(`Team ${callerTeam} failed bid (-${penalty})`);
            }
        }

        // Check Game Over
        let gameOver = false;
        if (this.scores['A'] >= 52 || this.scores['B'] <= -52) {
            gameOver = true;
            this.winner = 'A';
        } else if (this.scores['B'] >= 52 || this.scores['A'] <= -52) {
            gameOver = true;
            this.winner = 'B';
        }

        if (gameOver) {
            this.phase = 'GAME_OVER';
            this.gameLog.push(`GAME OVER! Team ${this.winner} wins!`);
        } else {
            this.dealerIndex = (this.dealerIndex + 1) % 6;
            setTimeout(() => this.startGame(), 5000);
        }
        this.notifyUpdate();
    }

    notifyUpdate() {
        if (this.onUpdate) {
            this.onUpdate(this.getState());
        }
    }

    getState() {
        return {
            players: this.players,
            phase: this.phase,
            currentTurn: this.currentTurn,
            trumpSuit: this.trumpSuit,
            currentTrick: this.currentTrick,
            scores: this.scores,
            currentBid: this.currentBid,
            bidWinner: this.bidWinner,
            dealerIndex: this.dealerIndex,
            gameLog: this.gameLog.slice(-10),
            winner: this.winner,
            awaitingSpecialRuleDecision: this.awaitingSpecialRuleDecision,
            specialRuleActivated: this.specialRuleActivated,
            specialRuleTeam: this.specialRuleTeam,
            consecutiveTricksWon: this.consecutiveTricksWon,
            myId: 'human', // Always human for local game
            myHand: this.players[0]?.hand || []
        };
    }
}
