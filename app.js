const express = require('express');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
});

// Centralized Room Management
// Structure: { [roomId]: { game: ChessInstance, white: socketId, black: socketId } }
const rooms = {};

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: "Grandmaster Chess" });
});

io.on('connection', (socket) => {
  console.log(`[CONNECTED] User ${socket.id}`);

  socket.on('joinRoom', (roomId) => {
    if (!roomId) return;
    
    socket.join(roomId);
    console.log(`[JOIN] User ${socket.id} joined room: ${roomId}`);

    // Initialize room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        game: new Chess(),
        white: null,
        black: null
      };
    }

    const room = rooms[roomId];

    // Assign Player Roles
    if (!room.white) {
      room.white = socket.id;
      socket.emit('playerRole', 'w');
      console.log(`[ROLE] User ${socket.id} assigned WHITE in ${roomId}`);
    } else if (!room.black) {
      room.black = socket.id;
      socket.emit('playerRole', 'b');
      console.log(`[ROLE] User ${socket.id} assigned BLACK in ${roomId}`);
    } else {
      socket.emit('spectatorRole');
      console.log(`[ROLE] User ${socket.id} joined as SPECTATOR in ${roomId}`);
    }

    // Send current game state
    socket.emit('boardState', room.game.fen());

    // --- Move Handling ---
    socket.on('move', (move) => {
      try {
        const game = room.game;

        // Validation: Is it this player's turn?
        if ((game.turn() === 'w' && socket.id !== room.white) ||
            (game.turn() === 'b' && socket.id !== room.black)) {
          return;
        }

        const result = game.move(move);

        if (result) {
          // Broadcast move and status to everyone in the room
          io.to(roomId).emit('move', move);
          io.to(roomId).emit('boardState', game.fen());

          // Check End Conditions
          if (game.in_checkmate()) {
            const winner = game.turn() === 'w' ? 'Black' : 'White';
            io.to(roomId).emit('gameOver', { type: 'checkmate', winner });
          } else if (game.in_draw()) {
            io.to(roomId).emit('gameOver', { type: 'draw' });
          }
        } else {
          socket.emit('illegalMove', move);
        }
      } catch (err) {
        console.error(`[MOVE ERROR] Room ${roomId}:`, err);
        socket.emit('error', 'Invalid move format');
      }
    });

    // --- Cleanup on Disconnect ---
    socket.on('disconnect', () => {
      console.log(`[DISCONNECT] User ${socket.id} from room ${roomId}`);
      
      if (socket.id === room.white) room.white = null;
      if (socket.id === room.black) room.black = null;

      // Optional: Cleanup room if empty (could be added with a timeout)
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SERVER] Running at http://localhost:${PORT}`);
});