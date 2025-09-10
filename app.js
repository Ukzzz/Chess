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

// Store games and players per room
const games = {};          // { roomId: Chess instance }
const playersInRoom = {};  // { roomId: { white: socketId, black: socketId } }

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: "Chess Game" });
});

io.on('connection', (socket) => {
  console.log('New user connected: ' + socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);

    // Initialize game if doesn't exist
    if (!games[roomId]) {
      games[roomId] = new Chess();
      playersInRoom[roomId] = {};
    }

    const roomPlayers = playersInRoom[roomId];

    // Assign player role
    if (!roomPlayers.white) {
      roomPlayers.white = socket.id;
      socket.emit('playerRole', 'w');
    } else if (!roomPlayers.black) {
      roomPlayers.black = socket.id;
      socket.emit('playerRole', 'b');
    } else {
      socket.emit('spectatorRole');
    }

    // Send current board to client
    socket.emit('boardState', games[roomId].fen());

    // Handle moves
    socket.on('move', (move) => {
      const chess = games[roomId];

      // Only allow current turn player
      if ((chess.turn() === 'w' && socket.id !== roomPlayers.white) ||
          (chess.turn() === 'b' && socket.id !== roomPlayers.black)) return;

      const result = chess.move(move);

      if (result) {
        io.to(roomId).emit('move', move);
        io.to(roomId).emit('boardState', chess.fen());

        // Check for checkmate
        if (chess.in_checkmate()) {
          const winner = chess.turn() === 'w' ? 'Black' : 'White';
          io.to(roomId).emit('gameOver', { type: 'checkmate', winner });
        } else if (chess.in_draw()) {
          io.to(roomId).emit('gameOver', { type: 'draw' });
        }
      } else {
        socket.emit('illegalMove', move);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected: ' + socket.id);
      if (socket.id === roomPlayers.white) delete roomPlayers.white;
      if (socket.id === roomPlayers.black) delete roomPlayers.black;
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));