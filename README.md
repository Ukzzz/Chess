# Online Multiplayer Chess Game

A real-time, multiplayer chess game built with Node.js, Express, and Socket.IO. Play chess with friends in private rooms with a clean, responsive interface.

## Features

- 🎮 Real-time multiplayer gameplay
- 🔒 Private game rooms
- ♟️ Full chess rules implementation using chess.js
- 🎨 Responsive design with smooth animations
- 👥 Support for spectators
- 🔄 Automatic board flipping for black player
- 📱 Mobile-friendly interface

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Real-time Communication**: Socket.IO
- **Chess Logic**: chess.js
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chess-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## How to Play

1. Open the application in your browser
2. Enter a room ID (share this with a friend to play together)
3. The first player to join will be White, the second will be Black
4. Drag and drop pieces to make moves
5. Spectators can watch the game by joining the same room

## Project Structure

```
chess-game/
├── public/           # Static files
│   └── chessGame.js  # Client-side JavaScript
├── views/
│   └── index.ejs     # Main HTML template
├── app.js           # Express server and Socket.IO setup
├── package.json     # Project dependencies
└── README.md        # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variable:

```
PORT=3000
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgements

- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library
- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
