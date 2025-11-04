# 🎰 3 Patti Lucky - Online Gambling Game Bot

A fully-featured 3 Patti (Teen Patti) card game with intelligent AI bots, built with vanilla JavaScript.

## 🎮 Features

- **Authentic 3 Patti Gameplay**: Complete implementation of the popular Indian card game
- **Intelligent AI Bots**: Three difficulty levels (Easy, Medium, Hard) with strategic decision-making
- **Hand Rankings**: Trail, Pure Sequence, Sequence, Color, Pair, and High Card
- **Casino-Style Interface**: Beautiful green table design with card animations
- **Customizable Settings**: Configure number of bots, starting chips, and difficulty
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🃏 Game Rules

### Hand Rankings (Highest to Lowest)
1. **Trail (Three of a Kind)**: Three cards of the same rank (e.g., A-A-A)
2. **Pure Sequence (Straight Flush)**: Three consecutive cards of the same suit (e.g., K♠-Q♠-J♠)
3. **Sequence (Straight)**: Three consecutive cards of different suits (e.g., 5♠-4♥-3♦)
4. **Color (Flush)**: Three cards of the same suit (e.g., K♥-9♥-5♥)
5. **Pair**: Two cards of the same rank (e.g., 7♠-7♥-3♦)
6. **High Card**: No matching cards (highest card wins)

### Gameplay
- Each player is dealt 3 cards
- Players can **Fold**, **Call**, or **Raise** during betting rounds
- Click **See Cards** to reveal your hand (costs chips)
- Last player standing or best hand at showdown wins the pot

## 🚀 How to Play

### Option 1: Open in Browser
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

### Option 2: Local Server (Optional)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## 🎯 Game Controls

- **Fold**: Give up your hand and exit the round
- **Call**: Match the current bet
- **Raise**: Increase the bet amount
- **See Cards**: Reveal your cards (strategic decision)

## 🤖 Bot AI System

### Easy Bots
- Cautious and predictable
- Makes basic decisions
- Low bluffing frequency (10%)

### Medium Bots
- Balanced strategy
- Considers pot odds
- Moderate bluffing (25%)

### Hard Bots
- Aggressive and strategic
- Advanced hand evaluation
- High bluffing frequency (40%)

## 📁 Project Structure

```
3pattilucky/
├── index.html      # Main game interface
├── styles.css      # Casino-themed styling
├── game.js         # Core game logic (deck, hands, rules)
├── bot.js          # AI bot decision-making system
├── ui.js           # UI controller and animations
├── test.js         # Test suite for game logic
└── README.md       # This file
```

## 🧪 Testing

Run the test suite to verify game logic:

```bash
node test.js
```

All tests should pass, verifying:
- Deck creation and shuffling
- Hand evaluation and ranking
- Hand comparison logic
- Game initialization
- Round management
- Player actions

## 🎨 Customization

### Modify Game Settings
Edit the default values in `index.html`:
- Number of bots (2-5)
- Starting chips (500-5000)
- Bot difficulty (easy/medium/hard)

### Adjust Betting Rules
Edit `game.js`:
- `minBet`: Minimum bet amount (default: 10)
- `blind`: Blind/ante amount (default: 5)

### Change Styling
Edit `styles.css` to customize:
- Table colors
- Card designs
- Button styles
- Animations

## 🛠️ Technical Details

- **Pure Vanilla JavaScript**: No frameworks or dependencies
- **Object-Oriented Design**: Clean class-based architecture
- **Responsive CSS**: Mobile-first design approach
- **Async/Await**: Smooth bot turn animations
- **Modular Code**: Separated concerns (game logic, AI, UI)

## 🎲 Game Strategy Tips

1. **See your cards early** if you have a strong hand
2. **Bluff occasionally** to keep bots guessing
3. **Fold weak hands** to preserve chips
4. **Watch betting patterns** to predict bot hands
5. **Manage your bankroll** - don't go all-in too early

## 📝 License

This is a demonstration project for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and enhance the game!

## 🎉 Enjoy Playing!

Good luck at the tables! 🍀
