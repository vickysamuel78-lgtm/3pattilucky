// 3 Patti Lucky - Bot AI System

class BotAI {
    constructor(player, game) {
        this.player = player;
        this.game = game;
        this.aggressiveness = this.getAggressiveness();
        this.bluffChance = this.getBluffChance();
    }

    getAggressiveness() {
        switch (this.player.difficulty) {
            case 'easy': return 0.3;
            case 'medium': return 0.5;
            case 'hard': return 0.7;
            default: return 0.5;
        }
    }

    getBluffChance() {
        switch (this.player.difficulty) {
            case 'easy': return 0.1;
            case 'medium': return 0.25;
            case 'hard': return 0.4;
            default: return 0.25;
        }
    }

    makeDecision() {
        const handStrength = this.evaluateHandStrength();
        const potOdds = this.calculatePotOdds();
        const shouldBluff = Math.random() < this.bluffChance;
        
        // Calculate decision score
        let decisionScore = handStrength * 0.6 + potOdds * 0.3 + (shouldBluff ? 0.3 : 0);
        
        // Adjust for difficulty
        if (this.player.difficulty === 'easy') {
            decisionScore *= 0.7; // Make worse decisions
        } else if (this.player.difficulty === 'hard') {
            decisionScore *= 1.2; // Make better decisions
        }

        // Add some randomness
        decisionScore += (Math.random() - 0.5) * 0.2;

        const callAmount = this.game.currentBet - this.player.currentBet;
        const canAfford = this.player.chips >= callAmount;

        // Decision logic
        if (decisionScore < 0.3) {
            return { action: 'fold' };
        } else if (decisionScore < 0.5) {
            if (canAfford && callAmount <= this.player.chips * 0.2) {
                return { action: 'call' };
            } else {
                return { action: 'fold' };
            }
        } else if (decisionScore < 0.7) {
            if (canAfford) {
                return { action: 'call' };
            } else {
                return { action: 'fold' };
            }
        } else {
            // Strong hand or bluffing - consider raising
            if (canAfford && Math.random() < this.aggressiveness) {
                const raiseAmount = this.calculateRaiseAmount(handStrength);
                if (this.player.chips >= callAmount + raiseAmount) {
                    return { action: 'raise', amount: raiseAmount };
                } else {
                    return { action: 'call' };
                }
            } else if (canAfford) {
                return { action: 'call' };
            } else {
                return { action: 'fold' };
            }
        }
    }

    evaluateHandStrength() {
        if (!this.player.hand || this.player.hand.length !== 3) return 0;

        const evaluation = HandEvaluator.evaluateHand(this.player.hand);
        
        // Normalize score to 0-1 range
        // Trail (600+) = 1.0, High Card (100+) = 0.2
        let strength = 0;
        
        switch (evaluation.rank) {
            case 6: // Trail
                strength = 0.95 + (evaluation.score - 600) / 1000;
                break;
            case 5: // Pure Sequence
                strength = 0.85 + (evaluation.score - 500) / 1000;
                break;
            case 4: // Sequence
                strength = 0.70 + (evaluation.score - 400) / 1000;
                break;
            case 3: // Color
                strength = 0.55 + (evaluation.score - 300) / 1000;
                break;
            case 2: // Pair
                strength = 0.35 + (evaluation.score - 200) / 1000;
                break;
            case 1: // High Card
                strength = 0.15 + (evaluation.score - 100) / 1000;
                break;
            default:
                strength = 0.1;
        }

        return Math.min(1, Math.max(0, strength));
    }

    calculatePotOdds() {
        const callAmount = this.game.currentBet - this.player.currentBet;
        if (callAmount <= 0) return 1;
        
        const potAfterCall = this.game.pot + callAmount;
        const odds = potAfterCall / callAmount;
        
        // Normalize to 0-1 range (higher pot odds = better)
        return Math.min(1, odds / 10);
    }

    calculateRaiseAmount(handStrength) {
        const potSize = this.game.pot;
        const minRaise = this.game.minBet;
        
        let raiseMultiplier;
        
        if (handStrength > 0.8) {
            // Very strong hand - big raise
            raiseMultiplier = 0.5 + Math.random() * 0.5; // 50-100% of pot
        } else if (handStrength > 0.6) {
            // Good hand - medium raise
            raiseMultiplier = 0.3 + Math.random() * 0.3; // 30-60% of pot
        } else {
            // Bluffing or decent hand - small raise
            raiseMultiplier = 0.2 + Math.random() * 0.2; // 20-40% of pot
        }

        let raiseAmount = Math.floor(potSize * raiseMultiplier);
        raiseAmount = Math.max(raiseAmount, minRaise);
        raiseAmount = Math.min(raiseAmount, this.player.chips * 0.4); // Don't bet more than 40% of stack
        
        return raiseAmount;
    }

    shouldSeeCards() {
        // Bots see their cards based on difficulty and hand strength
        if (this.player.seen) return false;
        
        const handStrength = this.evaluateHandStrength();
        
        switch (this.player.difficulty) {
            case 'easy':
                // Easy bots see cards randomly
                return Math.random() < 0.3;
            case 'medium':
                // Medium bots see cards if hand is decent
                return handStrength > 0.4 && Math.random() < 0.5;
            case 'hard':
                // Hard bots strategically see cards
                return handStrength > 0.5 && Math.random() < 0.7;
            default:
                return Math.random() < 0.4;
        }
    }

    getThinkingTime() {
        // Simulate thinking time for realism
        const baseTime = 500;
        const randomTime = Math.random() * 1500;
        
        switch (this.player.difficulty) {
            case 'easy':
                return baseTime + randomTime * 0.5;
            case 'medium':
                return baseTime + randomTime;
            case 'hard':
                return baseTime + randomTime * 1.5;
            default:
                return baseTime + randomTime;
        }
    }
}

class BotManager {
    constructor(game) {
        this.game = game;
        this.bots = new Map();
    }

    registerBot(player) {
        if (player.isBot) {
            this.bots.set(player.name, new BotAI(player, this.game));
        }
    }

    async executeBotTurn(player) {
        const bot = this.bots.get(player.name);
        if (!bot) return null;

        // Simulate thinking
        const thinkingTime = bot.getThinkingTime();
        await this.sleep(thinkingTime);

        // Check if bot should see cards
        if (bot.shouldSeeCards()) {
            player.seeCards();
            await this.sleep(300);
        }

        // Make decision
        const decision = bot.makeDecision();
        return decision;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getBotPersonality(difficulty) {
        const personalities = {
            easy: {
                names: ['Rookie Ram', 'Newbie Neha', 'Beginner Bob', 'Learner Lisa'],
                style: 'Cautious and predictable'
            },
            medium: {
                names: ['Player Priya', 'Steady Sam', 'Balanced Ben', 'Regular Rita'],
                style: 'Balanced and strategic'
            },
            hard: {
                names: ['Pro Patel', 'Expert Emma', 'Master Mike', 'Ace Aisha'],
                style: 'Aggressive and unpredictable'
            }
        };

        const personality = personalities[difficulty] || personalities.medium;
        const randomName = personality.names[Math.floor(Math.random() * personality.names.length)];
        
        return {
            name: randomName,
            style: personality.style
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BotAI, BotManager };
}
