// 3 Patti Lucky - UI Controller

class UIController {
    constructor() {
        this.game = null;
        this.botManager = null;
        this.isProcessing = false;
        this.animationSpeed = 300;
    }

    initialize() {
        this.setupEventListeners();
        this.showStartScreen();
    }

    setupEventListeners() {
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('new-round-btn').addEventListener('click', () => this.startNewRound());
        document.getElementById('fold-btn').addEventListener('click', () => this.playerAction('fold'));
        document.getElementById('call-btn').addEventListener('click', () => this.playerAction('call'));
        document.getElementById('raise-btn').addEventListener('click', () => this.playerAction('raise'));
        document.getElementById('see-cards-btn').addEventListener('click', () => this.seeCards());
    }

    showStartScreen() {
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('game-screen').style.display = 'none';
    }

    startGame() {
        const numBots = parseInt(document.getElementById('num-bots').value);
        const startingChips = parseInt(document.getElementById('starting-chips').value);
        const difficulty = document.getElementById('difficulty').value;

        // Initialize game
        this.game = new Game();
        this.botManager = new BotManager(this.game);

        // Add human player
        this.game.addPlayer('You', startingChips, false);

        // Add bot players
        for (let i = 0; i < numBots; i++) {
            const botPersonality = this.botManager.getBotPersonality(difficulty);
            this.game.addPlayer(botPersonality.name, startingChips, true, difficulty);
            this.botManager.registerBot(this.game.players[i + 1]);
        }

        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        this.startNewRound();
    }

    startNewRound() {
        if (this.isProcessing) return;

        this.game.startNewRound();
        
        if (this.game.gameState === 'ended') {
            this.showGameOver();
            return;
        }

        this.updateUI();
        this.hideRoundResult();
        
        // Start bot turns if first player is bot
        setTimeout(() => this.processBotTurns(), 500);
    }

    async processBotTurns() {
        if (this.isProcessing) return;
        
        while (this.game.gameState === 'betting') {
            const currentPlayer = this.game.getCurrentPlayer();
            
            if (!currentPlayer.isBot) {
                this.updateUI();
                return;
            }

            this.isProcessing = true;
            this.updateUI();
            
            const decision = await this.botManager.executeBotTurn(currentPlayer);
            
            if (decision) {
                this.showBotAction(currentPlayer, decision);
                await this.sleep(500);
                
                this.game.playerAction(decision.action, decision.amount || 0);
                this.updateUI();
                
                await this.sleep(300);
            }
            
            this.isProcessing = false;

            if (this.game.gameState === 'showdown' || this.game.gameState === 'ended') {
                this.showRoundResult();
                return;
            }
        }
    }

    playerAction(action) {
        if (this.isProcessing) return;
        if (this.game.gameState !== 'betting') return;
        
        const currentPlayer = this.game.getCurrentPlayer();
        if (currentPlayer.isBot) return;

        let amount = 0;
        if (action === 'raise') {
            const raiseInput = prompt('Enter raise amount:', this.game.minBet);
            if (!raiseInput) return;
            amount = parseInt(raiseInput);
            if (isNaN(amount) || amount < this.game.minBet) {
                alert(`Minimum raise is ${this.game.minBet}`);
                return;
            }
        }

        this.game.playerAction(action, amount);
        this.updateUI();

        if (this.game.gameState === 'showdown' || this.game.gameState === 'ended') {
            this.showRoundResult();
        } else {
            setTimeout(() => this.processBotTurns(), 300);
        }
    }

    seeCards() {
        const currentPlayer = this.game.getCurrentPlayer();
        if (!currentPlayer.isBot && !currentPlayer.seen) {
            currentPlayer.seeCards();
            this.updateUI();
        }
    }

    updateUI() {
        this.updatePot();
        this.updatePlayers();
        this.updateControls();
        this.updateGameInfo();
    }

    updatePot() {
        document.getElementById('pot-amount').textContent = this.game.pot;
        document.getElementById('current-bet').textContent = this.game.currentBet;
    }

    updatePlayers() {
        const playersContainer = document.getElementById('players-container');
        playersContainer.innerHTML = '';

        this.game.players.forEach((player, index) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-card';
            
            if (index === this.game.currentPlayerIndex && this.game.gameState === 'betting') {
                playerDiv.classList.add('active');
            }
            
            if (player.folded) {
                playerDiv.classList.add('folded');
            }

            const statusBadges = [];
            if (player.isBot) statusBadges.push('<span class="badge bot-badge">BOT</span>');
            if (player.seen) statusBadges.push('<span class="badge seen-badge">SEEN</span>');
            if (player.isAllIn) statusBadges.push('<span class="badge allin-badge">ALL-IN</span>');
            if (player.folded) statusBadges.push('<span class="badge fold-badge">FOLDED</span>');

            playerDiv.innerHTML = `
                <div class="player-name">${player.name} ${statusBadges.join(' ')}</div>
                <div class="player-chips">💰 ${player.chips}</div>
                <div class="player-bet">Bet: ${player.currentBet}</div>
                <div class="player-cards">
                    ${this.renderCards(player)}
                </div>
            `;

            playersContainer.appendChild(playerDiv);
        });
    }

    renderCards(player) {
        if (!player.hand || player.hand.length === 0) {
            return '<div class="card-placeholder">?</div>'.repeat(3);
        }

        if (player.isBot && this.game.gameState !== 'showdown') {
            return '<div class="card back">🂠</div>'.repeat(3);
        }

        return player.hand.map(card => {
            const suitColor = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
            return `<div class="card ${suitColor}">${card.rank}${card.suit}</div>`;
        }).join('');
    }

    updateControls() {
        const currentPlayer = this.game.getCurrentPlayer();
        const isPlayerTurn = currentPlayer && !currentPlayer.isBot;
        const canAct = this.game.gameState === 'betting' && isPlayerTurn && !this.isProcessing;

        document.getElementById('fold-btn').disabled = !canAct;
        document.getElementById('call-btn').disabled = !canAct;
        document.getElementById('raise-btn').disabled = !canAct;
        document.getElementById('see-cards-btn').disabled = !canAct || currentPlayer.seen;

        if (canAct) {
            const callAmount = this.game.currentBet - currentPlayer.currentBet;
            document.getElementById('call-btn').textContent = callAmount > 0 ? `Call ${callAmount}` : 'Check';
        }
    }

    updateGameInfo() {
        const currentPlayer = this.game.getCurrentPlayer();
        let statusText = '';

        if (this.game.gameState === 'betting') {
            if (currentPlayer) {
                statusText = currentPlayer.isBot ? 
                    `${currentPlayer.name} is thinking...` : 
                    'Your turn!';
            }
        } else if (this.game.gameState === 'showdown') {
            statusText = 'Showdown!';
        } else if (this.game.gameState === 'ended') {
            statusText = 'Round ended';
        }

        document.getElementById('game-status').textContent = statusText;
        document.getElementById('round-number').textContent = this.game.round;
    }

    showBotAction(player, decision) {
        const actionText = decision.action === 'raise' ? 
            `${decision.action.toUpperCase()} ${decision.amount}` : 
            decision.action.toUpperCase();
        
        this.showNotification(`${player.name}: ${actionText}`);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    showRoundResult() {
        const activePlayers = this.game.getActivePlayers();
        
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            this.displayWinner(winner, null);
        } else {
            // Evaluate all hands for showdown
            let bestPlayer = activePlayers[0];
            let bestEval = HandEvaluator.evaluateHand(bestPlayer.hand);

            for (let player of activePlayers) {
                const playerEval = HandEvaluator.evaluateHand(player.hand);
                if (playerEval.score > bestEval.score) {
                    bestPlayer = player;
                    bestEval = playerEval;
                }
            }

            this.displayWinner(bestPlayer, bestEval);
        }

        document.getElementById('new-round-btn').style.display = 'block';
    }

    displayWinner(winner, handEval) {
        const resultDiv = document.getElementById('round-result');
        const winnerNameEl = document.getElementById('winner-name');
        const winnerHandEl = document.getElementById('winner-hand');
        const winnerAmountEl = document.getElementById('winner-amount');

        winnerNameEl.textContent = winner.name;
        winnerHandEl.textContent = handEval ? handEval.name : 'All others folded';
        winnerAmountEl.textContent = this.game.pot;

        resultDiv.style.display = 'block';
    }

    hideRoundResult() {
        document.getElementById('round-result').style.display = 'none';
        document.getElementById('new-round-btn').style.display = 'none';
    }

    showGameOver() {
        const winner = this.game.players.reduce((prev, current) => 
            (prev.chips > current.chips) ? prev : current
        );

        alert(`Game Over! ${winner.name} wins with ${winner.chips} chips!`);
        this.showStartScreen();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize UI when DOM is loaded
let uiController;
document.addEventListener('DOMContentLoaded', () => {
    uiController = new UIController();
    uiController.initialize();
});
