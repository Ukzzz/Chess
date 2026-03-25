const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const joinBtn = document.getElementById("join-btn");
const roomInput = document.getElementById("room-input");
const roomInfo = document.getElementById("room-info");
const joinControls = document.getElementById("join-controls");
const displayRoomId = document.getElementById("display-room-id");
const statusText = document.getElementById("game-status-text");
const roleBadge = document.getElementById("role-badge");
const turnBadge = document.getElementById("turn-badge");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalClose = document.getElementById("modal-close");
const copyBtn = document.getElementById("copy-room-btn");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// SVG Pieces (Wikipedia standard)
const pieceSVGs = {
    w: {
        p: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 3.55-7.41 9.47h23c0-5.92-4.41-8.41-7.41-9.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
        r: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
        n: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 2.43-1.63 2.92-1.32 4.25l5.5 2c.31-1.33 1.9-1.82 1.52-4.25C26.13 18.52 26.54 18 24 18z" fill="#fff"/><path d="M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5z" fill="#000"/><path d="M15 15.5c4.5 2 5 2 5 2" stroke-linecap="butt"/><path d="M24 18c-3.1 2.5-13 4.5-13 14h29" fill="#fff"/><path d="M28 35.8c-1.35 1.5-3.35 2.2-5 2.2V35s1.25.5 4.5.8" fill="#fff"/></g></svg>`,
        b: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.3 13.5-2 3.39 2.3 10.11 1.03 13.5 2 0 0 .45 1 1 2.5H8c.55-1.5 1-2.5 1-2.5z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
        q: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="white" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 2.5 1 1 1 1 1h22s-1.5 0 1-1c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/><path d="M9 39h27v-3H9v3z"/></g></svg>`,
        k: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke="#000" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6-2.5s-4.5 0-6 2.5c-1.5 2.5 3 10 3 10" fill="#fff" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-1-1-1--1.5-2.5-6-2.5-6-2.5s-4.5 0-6 2.5c0 0 3 0-1 1s-7.5 4.5-7.5 4.5V28h-7c-2 0-3 1-3 1s-7.5 4.5-7.5 4.5c-3 6 6 10.5 6 10.5v7z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#000"/><path d="M9 39h27v-3H9v3z" fill="#fff"/></g></svg>`
    },
    b: {
        p: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 3.55-7.41 9.47h23c0-5.92-4.41-8.41-7.41-9.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
        r: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="#000" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
        n: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/><path d="M24 18c.38 2.43-1.63 2.92-1.32 4.25l5.5 2c.31-1.33 1.9-1.82 1.52-4.25C26.13 18.52 26.54 18 24 18z" fill="#000"/><path d="M9.5 25.5A.5.5 0 1 1 9 25a.5.5 0 0 1 .5.5z" fill="#fff"/><path d="M15 15.5c4.5 2 5 2 5 2" stroke-linecap="butt"/><path d="M24 18c-3.1 2.5-13 4.5-13 14h29" fill="#000"/><path d="M28 35.8c-1.35 1.5-3.35 2.2-5 2.2V35s1.25.5 4.5.8" fill="#000"/></g></svg>`,
        b: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.3 13.5-2 3.39 2.3 10.11 1.03 13.5 2 0 0 .45 1 1 2.5H8c.55-1.5 1-2.5 1-2.5z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
        q: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="black" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25L7 14l2 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 2.5 1 1 1 1 1h22s-1.5 0 1-1c1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/><path d="M9 39h27v-3H9v3z"/></g></svg>`,
        k: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke="#fff" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6-2.5s-4.5 0-6 2.5c-1.5 2.5 3 10 3 10" fill="#000" stroke-linecap="butt"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-1-1-1--1.5-2.5-6-2.5-6-2.5s-4.5 0-6 2.5c0 0 3 0-1 1s-7.5 4.5-7.5 4.5V28h-7c-2 0-3 1-3 1s-7.5 4.5-7.5 4.5c-3 6 6 10.5 6 10.5v7z" fill="#000"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/><path d="M9 39h27v-3H9v3z" fill="#000"/></g></svg>`
    }
};

// --- Helper Functions ---

const updateStatus = (msg) => {
    if (statusText) statusText.innerText = msg;
};

const updateTurn = () => {
    if (!turnBadge) return;
    const turn = chess.turn();
    turnBadge.innerText = turn === 'w' ? "White's Turn" : "Black's Turn";
    turnBadge.className = `px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest ${turn === 'w' ? 'bg-zinc-100 text-black' : 'bg-primary text-white font-black'}`;
};

const showModal = (title, description) => {
    if (!modalOverlay || !modalTitle || !modalDescription) return;
    modalTitle.innerText = title;
    modalDescription.innerText = description;
    modalOverlay.classList.remove("hidden");
};

// --- Event Listeners ---

joinBtn.addEventListener("click", () => {
    const id = roomInput.value.trim();
    if (id) {
        socket.emit("joinRoom", id);
        displayRoomId.innerText = id;
        roomInfo.classList.remove("hidden");
        joinControls.classList.add("hidden");
        updateStatus("Joining room...");
    }
});

modalClose.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
    location.reload(); 
});

if (copyBtn) {
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(displayRoomId.innerText);
        const originalText = statusText.innerText;
        updateStatus("Room ID copied!");
        setTimeout(() => updateStatus(originalText), 2000);
    });
}

// --- Rendering ---

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
            
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece");
                pieceElement.innerHTML = pieceSVGs[square.color][square.type];
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => e.preventDefault());
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
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

    if (playerRole === 'b') boardElement.classList.add("flipped");
    else boardElement.classList.remove("flipped");
    
    updateTurn();
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
};

// --- Socket Events ---

socket.on("connect", () => {
    updateStatus("Connected to server. Join a room to start!");
});

socket.on("playerRole", (role) => {
    playerRole = role;
    roleBadge.innerText = `YOU ARE ${role === 'w' ? 'WHITE' : 'BLACK'}`;
    roleBadge.classList.remove("hidden");
    updateStatus(`Game joined! You are playing as ${role === 'w' ? 'White' : 'Black'}.`);
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    roleBadge.innerText = "SPECTATING";
    roleBadge.classList.remove("hidden");
    updateStatus("Watching as spectator.");
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
    updateStatus("Invalid move. Try again.");
    setTimeout(() => updateStatus("Game in progress..."), 2000);
});

socket.on("gameOver", (data) => {
    let title = "Game Over";
    let desc = "";

    if (data.type === "checkmate") {
        title = "Checkmate!";
        desc = `${data.winner} wins the game!`;
    } else if (data.type === "draw") {
        title = "Draw!";
        desc = "The game ended in a draw.";
    }

    showModal(title, desc);
    updateStatus(title);
});

// Initial Render
updateStatus("Initializing...");
renderBoard();
