// 3 Patti Lucky - Core Game Logic

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    get value() {
        const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
        return values[this.rank];
    }

    toString() {
        return `${this.rank}${this.suit}`;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cards = [];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }
}

class HandEvaluator {
    static evaluateHand(cards) {
        if (cards.length !== 3) return { rank: 0, score: 0, name: 'Invalid' };

        const sorted = [...cards].sort((a, b) => b.value - a.value);
        const values = sorted.map(c => c.value);
        const suits = sorted.map(c => c.suit);

        // Check for Trail (Three of a Kind)
        if (values[0] === values[1] && values[1] === values[2]) {
            return { rank: 6, score: 600 + values[0], name: 'Trail', cards: sorted };
        }

        const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
        const isStraight = this.isStraight(values);

        // Pure Sequence (Straight Flush)
        if (isFlush && isStraight) {
            return { rank: 5, score: 500 + values[0], name: 'Pure Sequence', cards: sorted };
        }

        // Sequence (Straight)
        if (isStraight) {
            return { rank: 4, score: 400 + values[0], name: 'Sequence', cards: sorted };
        }

        // Color (Flush)
        if (isFlush) {
            return { rank: 3, score: 300 + values[0] + values[1] * 0.1 + values[2] * 0.01, name: 'Color', cards: sorted };
        }

        // Pair
        if (values[0] === values[1]) {
            return { rank: 2, score: 200 + values[0] + values[2] * 0.1, name: 'Pair', cards: sorted };
        }
        if (values[1] === values[2]) {
            return { rank: 2, score: 200 + values[1] + values[0] * 0.1, name: 'Pair', cards: sorted };
        }

        // High Card
        return { rank: 1, score: 100 + values[0] + values[1] * 0.1 + values[2] * 0.01, name: 'High Card', cards: sorted };
    }

    static isStraight(values) {
        // Check for A-2-3
        if (values[0] === 14 && values[1] === 3 && values[2] === 2) return true;
        // Check for consecutive
        return values[0] - values[1] === 1 && values[1] - values[2] === 1;
    }

    static compareHands(hand1, hand2) {
        const eval1 = this.evaluateHand(hand1);
        const eval2 = this.evaluateHand(hand2);
        
        if (eval1.score > eval2.score) return 1;
        if (eval1.score < eval2.score) return -1;
        return 0;
    }
}

class Player {
    constructor(name, chips, isBot = false, difficulty = 'medium') {
        this.name = name;
        this.chips = chips;
        this.hand = [];
        this.isBot = isBot;
        this.difficulty = difficulty;
        this.currentBet = 0;
        this.folded = false;
        this.isAllIn = false;
        this.seen = false;
    }

    reset() {
        this.hand = [];
        this.currentBet = 0;
        this.folded = false;
        this.isAllIn = false;
        this.seen = false;
    }

    bet(amount) {
        const actualBet = Math.min(amount, this.chips);
        this.chips -= actualBet;
        this.currentBet += actualBet;
        if (this.chips === 0) this.isAllIn = true;
        return actualBet;
    }

    fold() {
        this.folded = true;
    }

    seeCards() {
        this.seen = true;
    }
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.pot = 0;
        this.currentBet = 0;
        this.minBet = 10;
        this.blind = 5;
        this.currentPlayerIndex = 0;
        this.dealerIndex = 0;
        this.gameState = 'waiting'; // waiting, dealing, betting, showdown, ended
        this.round = 0;
    }

    addPlayer(name, chips, isBot = false, difficulty = 'medium') {
        this.players.push(new Player(name, chips, isBot, difficulty));
    }

    startNewRound() {
        this.deck.reset();
        this.deck.shuffle();
        this.pot = 0;
        this.currentBet = this.blind;
        this.round++;
        
        // Reset all players
        this.players.forEach(player => player.reset());
        
        // Remove players with no chips
        this.players = this.players.filter(player => player.chips > 0);
        
        if (this.players.length < 2) {
            this.gameState = 'ended';
            return;
        }

        // Rotate dealer
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;

        // Collect blinds
        const blindPlayer = this.players[this.dealerIndex];
        const blindAmount = blindPlayer.bet(this.blind);
        this.pot += blindAmount;

        // Deal cards
        this.gameState = 'dealing';
        for (let i = 0; i < 3; i++) {
            for (let player of this.players) {
                player.hand.push(this.deck.deal());
            }
        }

        this.gameState = 'betting';
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getActivePlayers() {
        return this.players.filter(p => !p.folded);
    }

    nextPlayer() {
        let attempts = 0;
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            attempts++;
            if (attempts > this.players.length) break;
        } while (this.players[this.currentPlayerIndex].folded);

        // Check if betting round is complete
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length === 1) {
            this.endRound();
            return;
        }

        const allBetsEqual = activePlayers.every(p => p.currentBet === this.currentBet || p.isAllIn);
        const allActed = activePlayers.every(p => p.currentBet > 0 || p.isAllIn);
        
        if (allBetsEqual && allActed) {
            this.showdown();
        }
    }

    playerAction(action, amount = 0) {
        const player = this.getCurrentPlayer();
        
        switch (action) {
            case 'fold':
                player.fold();
                break;
            case 'call':
                const callAmount = this.currentBet - player.currentBet;
                this.pot += player.bet(callAmount);
                break;
            case 'raise':
                const raiseAmount = (this.currentBet - player.currentBet) + amount;
                this.pot += player.bet(raiseAmount);
                this.currentBet = player.currentBet;
                break;
            case 'see':
                player.seeCards();
                return; // Don't advance to next player
        }

        this.nextPlayer();
    }

    showdown() {
        this.gameState = 'showdown';
        const activePlayers = this.getActivePlayers();
        
        if (activePlayers.length === 1) {
            this.declareWinner(activePlayers[0]);
            return;
        }

        // Evaluate all hands
        let bestPlayer = activePlayers[0];
        let bestEval = HandEvaluator.evaluateHand(bestPlayer.hand);

        for (let i = 1; i < activePlayers.length; i++) {
            const player = activePlayers[i];
            const playerEval = HandEvaluator.evaluateHand(player.hand);
            
            if (playerEval.score > bestEval.score) {
                bestPlayer = player;
                bestEval = playerEval;
            }
        }

        this.declareWinner(bestPlayer, bestEval);
    }

    declareWinner(winner, handEval = null) {
        winner.chips += this.pot;
        this.gameState = 'ended';
        
        return {
            winner: winner,
            pot: this.pot,
            handEval: handEval
        };
    }

    endRound() {
        const activePlayers = this.getActivePlayers();
        if (activePlayers.length === 1) {
            this.declareWinner(activePlayers[0]);
        } else {
            this.showdown();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game, Player, Card, Deck, HandEvaluator };
}
