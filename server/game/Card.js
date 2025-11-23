class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    static getRankValue(rank) {
        const values = {
            '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return values[rank] || 0;
    }
}

module.exports = Card;
