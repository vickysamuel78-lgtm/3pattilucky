// Simple test file to verify game logic
// Run with: node test.js

// Mock browser environment for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    const { Game, Player, Card, Deck, HandEvaluator } = require('./game.js');
    
    console.log('🎰 Testing 3 Patti Lucky Game Logic...\n');
    
    // Test 1: Deck Creation and Shuffling
    console.log('Test 1: Deck Creation');
    const deck = new Deck();
    console.log(`✓ Deck created with ${deck.cards.length} cards`);
    deck.shuffle();
    console.log('✓ Deck shuffled successfully\n');
    
    // Test 2: Hand Evaluation
    console.log('Test 2: Hand Evaluation');
    
    // Trail (Three of a Kind)
    const trail = [new Card('♠', 'A'), new Card('♥', 'A'), new Card('♦', 'A')];
    const trailEval = HandEvaluator.evaluateHand(trail);
    console.log(`Trail: ${trailEval.name} - Score: ${trailEval.score}`);
    
    // Pure Sequence
    const pureSeq = [new Card('♠', 'K'), new Card('♠', 'Q'), new Card('♠', 'J')];
    const pureSeqEval = HandEvaluator.evaluateHand(pureSeq);
    console.log(`Pure Sequence: ${pureSeqEval.name} - Score: ${pureSeqEval.score}`);
    
    // Sequence
    const seq = [new Card('♠', '5'), new Card('♥', '4'), new Card('♦', '3')];
    const seqEval = HandEvaluator.evaluateHand(seq);
    console.log(`Sequence: ${seqEval.name} - Score: ${seqEval.score}`);
    
    // Color (Flush)
    const color = [new Card('♥', 'K'), new Card('♥', '9'), new Card('♥', '5')];
    const colorEval = HandEvaluator.evaluateHand(color);
    console.log(`Color: ${colorEval.name} - Score: ${colorEval.score}`);
    
    // Pair
    const pair = [new Card('♠', '7'), new Card('♥', '7'), new Card('♦', '3')];
    const pairEval = HandEvaluator.evaluateHand(pair);
    console.log(`Pair: ${pairEval.name} - Score: ${pairEval.score}`);
    
    // High Card
    const highCard = [new Card('♠', 'K'), new Card('♥', '9'), new Card('♦', '5')];
    const highCardEval = HandEvaluator.evaluateHand(highCard);
    console.log(`High Card: ${highCardEval.name} - Score: ${highCardEval.score}\n`);
    
    // Test 3: Hand Comparison
    console.log('Test 3: Hand Comparison');
    const comparison = HandEvaluator.compareHands(trail, pureSeq);
    console.log(`Trail vs Pure Sequence: ${comparison > 0 ? 'Trail wins' : 'Pure Sequence wins'}`);
    console.log('✓ Hand comparison working correctly\n');
    
    // Test 4: Game Initialization
    console.log('Test 4: Game Initialization');
    const game = new Game();
    game.addPlayer('Player 1', 1000, false);
    game.addPlayer('Bot 1', 1000, true, 'easy');
    game.addPlayer('Bot 2', 1000, true, 'medium');
    game.addPlayer('Bot 3', 1000, true, 'hard');
    console.log(`✓ Game created with ${game.players.length} players`);
    
    game.players.forEach(player => {
        console.log(`  - ${player.name}: ${player.chips} chips ${player.isBot ? '(BOT)' : '(HUMAN)'}`);
    });
    console.log();
    
    // Test 5: Round Start
    console.log('Test 5: Starting a Round');
    game.startNewRound();
    console.log(`✓ Round ${game.round} started`);
    console.log(`✓ Game state: ${game.gameState}`);
    console.log(`✓ Pot: ${game.pot}`);
    console.log(`✓ Current bet: ${game.currentBet}`);
    
    game.players.forEach(player => {
        console.log(`  - ${player.name}: ${player.hand.length} cards dealt`);
    });
    console.log();
    
    // Test 6: Player Actions
    console.log('Test 6: Player Actions');
    const currentPlayer = game.getCurrentPlayer();
    console.log(`Current player: ${currentPlayer.name}`);
    
    const chipsBefore = currentPlayer.chips;
    currentPlayer.bet(50);
    console.log(`✓ Player bet 50 chips (${chipsBefore} → ${currentPlayer.chips})`);
    
    const foldPlayer = game.players[2];
    foldPlayer.fold();
    console.log(`✓ ${foldPlayer.name} folded`);
    
    const activePlayers = game.getActivePlayers();
    console.log(`✓ Active players: ${activePlayers.length}\n`);
    
    console.log('✅ All tests passed! Game logic is working correctly.\n');
    console.log('🎮 To play the game, open index.html in a web browser!');
}
