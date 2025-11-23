# Card Game 6 - 6-Player Trick-Taking Card Game

A real-time multiplayer card game built with React, Node.js, and Socket.IO. Play against bots or with friends in this strategic 6-player trick-taking game featuring bidding, trump selection, and a special 16-points challenge rule.

## Features

- 🎮 **Single-player mode** against intelligent AI bots
- 🤝 **Multiplayer support** (up to 6 players)
- 🎯 **Strategic gameplay** with bidding and trump selection
- ⚡ **16-Points Challenge** - High-risk, high-reward special rule
- 📱 **Fully responsive** - Works on mobile, tablet, and desktop
- 🎨 **Beautiful UI** with smooth animations
- 🤖 **Smart AI** that plays strategically based on team performance

## Game Rules

- **Players**: 6 players in 2 teams (Team A vs Team B)
- **Deck**: 48 cards (standard deck with all 2s removed)
- **Objective**: First team to reach 52 points (or opponent reaches -52)
- **Phases**: Bidding → Trump Selection → Playing → Scoring

### Scoring
- **Normal**: Bid team gets bid points if successful, loses double if failed
- **16-Points Challenge**: Win all 8 tricks for +16 points, or lose -32 points

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO
- Custom game logic with AI bots

## Local Development

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/card-game-6.git
   cd card-game-6
   ```

2. **Install dependencies**
   
   Backend:
   ```bash
   cd server
   npm install
   ```
   
   Frontend:
   ```bash
   cd client
   npm install
   ```

3. **Run the application**
   
   Backend (in `server` directory):
   ```bash
   npm run dev
   ```
   
   Frontend (in `client` directory):
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Enter your name and click "Play vs Bots"

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions on deploying to Render (backend) and Vercel (frontend).

## Project Structure

```
card-game-6/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── index.css      # Tailwind styles
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── game/             # Game logic
│   │   ├── GameState.js  # Main game state management
│   │   ├── BotLogic.js   # AI bot logic
│   │   └── Card.js       # Card utilities
│   ├── index.js          # Server entry point
│   └── package.json
│
└── DEPLOYMENT_GUIDE.md   # Deployment instructions
```

## Game Components

### Frontend Components
- **App.jsx** - Main application component
- **GameTable.jsx** - Game board and player positions
- **Controls.jsx** - Bidding and trump selection UI
- **Card.jsx** - Individual card component
- **SpecialRulePopup.jsx** - 16-points challenge decision UI

### Backend Components
- **GameState.js** - Core game logic and state management
- **BotLogic.js** - AI decision-making for bots
- **Card.js** - Card representation and utilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Acknowledgments

- Built with ❤️ using React and Node.js
- Inspired by traditional trick-taking card games
- AI assistance from Google Gemini

---

**Enjoy the game! 🎴**
