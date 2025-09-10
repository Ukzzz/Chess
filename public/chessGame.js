const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggpiece = null;
let sourceSquare = null;
let playerRole = null;

// Prompt user for room
const roomId = prompt("Enter room ID:");
socket.emit("joinRoom", roomId);

// Render chessboard
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add("square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
        pieceElement.innerText = getpieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggpiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggpiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", (e) => e.preventDefault());
      squareElement.addEventListener("drop", () => {
        if (draggpiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });

  // Flip board if black
  if (playerRole === 'b') boardElement.classList.add("flipped");
  else boardElement.classList.remove("flipped");
};

// Handle move
const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: 'q'
  };
  socket.emit("move", move);
};

// Get unicode for pieces
const getpieceUnicode = (piece) => {
  const unicodePieces = {
    p: { w: "♙", b: "♟" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" }
  }
  return piece && unicodePieces[piece.type] ? unicodePieces[piece.type][piece.color] : "";
}

// Socket events
socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("illegalMove", () => {
  alert("Illegal move!");
  renderBoard();
});

socket.on("gameOver", (data) => {
  if (data.type === "checkmate") alert(`Checkmate! ${data.winner} wins!`);
  else if (data.type === "draw") alert("Game draw!");
});

renderBoard();
