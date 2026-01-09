// Chess Game JavaScript
class ChessGame {
  constructor() {
    this.board = this.createInitialBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameOver = false;
    this.capturedPieces = { white: [], black: [] };

    this.pieceSymbols = {
      classic: {
        white: {
          king: "♔",
          queen: "♕",
          rook: "♖",
          bishop: "♗",
          knight: "♘",
          pawn: "♙",
        },
        black: {
          king: "♚",
          queen: "♛",
          rook: "♜",
          bishop: "♝",
          knight: "♞",
          pawn: "♟",
        },
      },
    };

    this.currentPieceStyle = "classic";
    this.currentColorTheme = "traditional";
    this.currentBoardStyle = "wood";

    this.players = {
      white: { name: "", image: "" },
      black: { name: "", image: "" },
    };

    this.gameStarted = false;

    // Lessons mode
    this.lessonsBoard = this.createEmptyBoard();
    this.selectedPieceForLesson = null;
    this.lessonsSelectedSquare = null;

    // Mission mode
    this.missionBoard = this.createEmptyBoard();
    this.missionSelectedSquare = null;
    this.currentMission = 1;
    this.maxMissions = 10;
    this.missionPlayer = null;
    this.missionUserPiece = null;
    this.missionUserPiecePosition = null;
    this.missionOpponentPieces = [];

    this.initializeGame();
  }

  createEmptyBoard() {
    return Array(8)
      .fill()
      .map(() => Array(8).fill(null));
  }

  createInitialBoard() {
    const board = Array(8)
      .fill()
      .map(() => Array(8).fill(null));

    // Place black pieces
    board[0] = [
      { type: "rook", color: "black" },
      { type: "knight", color: "black" },
      { type: "bishop", color: "black" },
      { type: "queen", color: "black" },
      { type: "king", color: "black" },
      { type: "bishop", color: "black" },
      { type: "knight", color: "black" },
      { type: "rook", color: "black" },
    ];
    board[1] = Array(8)
      .fill()
      .map(() => ({ type: "pawn", color: "black" }));

    // Place white pieces
    board[6] = Array(8)
      .fill()
      .map(() => ({ type: "pawn", color: "white" }));
    board[7] = [
      { type: "rook", color: "white" },
      { type: "knight", color: "white" },
      { type: "bishop", color: "white" },
      { type: "queen", color: "white" },
      { type: "king", color: "white" },
      { type: "bishop", color: "white" },
      { type: "knight", color: "white" },
      { type: "rook", color: "white" },
    ];

    return board;
  }

  initializeGame() {
    this.createBoard();
    this.createLessonsBoard();
    this.updateDisplay();
    this.setupEventListeners();
    this.setupPlayerSelection();
    this.setupTabs();
    this.setupLessons();
    this.setupMission();
    this.updatePlaygroundVisibility();
  }

  createBoard() {
    const boardElement = document.getElementById("chess-board");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `piece ${piece.color}-piece`;
          pieceElement.textContent =
            this.pieceSymbols[this.currentPieceStyle][piece.color][piece.type];
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", (e) => this.handleSquareClick(e));
        boardElement.appendChild(square);
      }
    }
  }

  handleSquareClick(event) {
    if (this.gameOver || !this.gameStarted) return;

    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = this.board[row][col];

    if (this.selectedSquare) {
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        // Deselect the same square
        this.deselectSquare();
      } else if (
        this.isValidMove(
          this.selectedSquare.row,
          this.selectedSquare.col,
          row,
          col
        )
      ) {
        // Make the move
        this.makeMove(
          this.selectedSquare.row,
          this.selectedSquare.col,
          row,
          col
        );
        this.deselectSquare();
        this.switchPlayer();
        this.checkGameState();
      } else if (piece && piece.color === this.currentPlayer) {
        // Select a different piece of the same color
        this.deselectSquare();
        this.selectSquare(row, col);
      } else {
        // Invalid move
        this.deselectSquare();
      }
    } else if (piece && piece.color === this.currentPlayer) {
      // Select a piece
      this.selectSquare(row, col);
    }
  }

  selectSquare(row, col) {
    // Clear any previous highlights first
    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("possible-move", "possible-capture");
    });

    this.selectedSquare = { row, col };
    const square = document.querySelector(
      `[data-row="${row}"][data-col="${col}"]`
    );
    square.classList.add("selected");

    // Highlight possible moves
    this.highlightPossibleMoves(row, col);
  }

  deselectSquare() {
    if (this.selectedSquare) {
      const square = document.querySelector(
        `[data-row="${this.selectedSquare.row}"][data-col="${this.selectedSquare.col}"]`
      );
      square.classList.remove("selected");
      this.selectedSquare = null;
    }

    // Remove all move highlights
    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("possible-move", "possible-capture");
    });
  }

  highlightPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMove(row, col, r, c)) {
          const square = document.querySelector(
            `[data-row="${r}"][data-col="${c}"]`
          );
          if (square) {
            const targetPiece = this.board[r][c];
            if (targetPiece && targetPiece.color !== piece.color) {
              square.classList.add("possible-capture");
            } else if (!targetPiece) {
              square.classList.add("possible-move");
            }
          }
        }
      }
    }
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const targetPiece = this.board[toRow][toCol];

    if (!piece) return false;
    if (piece.color !== this.currentPlayer) return false;
    if (targetPiece && targetPiece.color === piece.color) return false;
    if (fromRow === toRow && fromCol === toCol) return false;

    return this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol);
  }

  isValidPieceMove(piece, fromRow, fromCol, toRow, toCol) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case "pawn":
        return this.isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
      case "rook":
        return (
          (rowDiff === 0 || colDiff === 0) &&
          this.isPathClear(fromRow, fromCol, toRow, toCol)
        );
      case "bishop":
        return (
          absRowDiff === absColDiff &&
          this.isPathClear(fromRow, fromCol, toRow, toCol)
        );
      case "queen":
        return (
          (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) &&
          this.isPathClear(fromRow, fromCol, toRow, toCol)
        );
      case "king":
        return absRowDiff <= 1 && absColDiff <= 1;
      case "knight":
        return (
          (absRowDiff === 2 && absColDiff === 1) ||
          (absRowDiff === 1 && absColDiff === 2)
        );
      default:
        return false;
    }
  }

  isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // Forward move
    if (colDiff === 0) {
      if (this.board[toRow][toCol]) return false; // Can't capture forward
      if (rowDiff === direction) return true; // One step forward
      // Two steps from start - check if path is clear
      if (fromRow === startRow && rowDiff === 2 * direction) {
        const middleRow = fromRow + direction;
        return !this.board[middleRow][toCol] && !this.board[toRow][toCol];
      }
    }

    // Diagonal capture
    if (colDiff === 1 && rowDiff === direction) {
      return this.board[toRow][toCol] !== null; // Can only capture diagonally
    }

    return false;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
    const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Handle capture
    if (capturedPiece) {
      this.capturedPieces[capturedPiece.color].push(capturedPiece);
      this.updateCapturedPieces();
    }

    // Move piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Add move to history
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece,
      capturedPiece: capturedPiece,
    });

    // Update the display
    this.createBoard();
    this.highlightLastMove(fromRow, fromCol, toRow, toCol);
  }

  highlightLastMove(fromRow, fromCol, toRow, toCol) {
    const fromSquare = document.querySelector(
      `[data-row="${fromRow}"][data-col="${fromCol}"]`
    );
    const toSquare = document.querySelector(
      `[data-row="${toRow}"][data-col="${toCol}"]`
    );

    fromSquare.classList.add("last-move");
    toSquare.classList.add("last-move");
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.updateDisplay();
  }

  checkGameState() {
    const kingPosition = this.findKing(this.currentPlayer);
    if (!kingPosition) {
      const winnerColor = this.currentPlayer === "white" ? "black" : "white";
      const winnerName = this.players[winnerColor].name;
      this.endGame(`${winnerName} captured the king!`);
      return;
    }

    // Check for checkmate (simplified - just check if king can move)
    let canMove = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentPlayer) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(row, col, toRow, toCol)) {
                canMove = true;
                break;
              }
            }
            if (canMove) break;
          }
          if (canMove) break;
        }
      }
      if (canMove) break;
    }

    if (!canMove) {
      const winnerColor = this.currentPlayer === "white" ? "black" : "white";
      const winnerName = this.players[winnerColor].name;
      this.endGame(`Checkmate!`);
    }
  }

  findKing(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === "king" && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  updateDisplay() {
    this.updateCurrentPlayerDisplay();
    document.getElementById("current-player").style.color =
      this.currentPlayer === "white" ? "#8B4513" : "#2C2C2C";
  }

  updateCapturedPieces() {
    ["white", "black"].forEach((color) => {
      const container = document.getElementById(`captured-${color}`);
      container.innerHTML = "";

      this.capturedPieces[color].forEach((piece) => {
        const pieceElement = document.createElement("div");
        pieceElement.className = "captured-piece";
        pieceElement.textContent =
          this.pieceSymbols[this.currentPieceStyle][piece.color][piece.type];
        container.appendChild(pieceElement);
      });
    });
  }

  endGame(message) {
    this.gameOver = true;

    // Determine the winner
    const winnerColor = this.currentPlayer === "white" ? "black" : "white";
    const winnerName = this.players[winnerColor].name;
    const winnerImage = this.players[winnerColor].image;

    document.getElementById(
      "game-over-title"
    ).textContent = `${winnerName} Wins! 🎉`;

    const winnerImg = document.getElementById("game-over-winner-img");
    winnerImg.src = winnerImage;
    winnerImg.alt = winnerName;
    winnerImg.style.display = "block";

    document.getElementById("game-over-message").textContent = message;
    document.getElementById("game-over-modal").style.display = "block";
  }

  resetGame() {
    this.board = this.createInitialBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameOver = false;
    this.capturedPieces = { white: [], black: [] };
    this.gameStarted = false;

    document.getElementById("game-over-modal").style.display = "none";
    document.querySelector(".player-selection").style.display = "block";

    // Reset player selections
    document.querySelectorAll(".player-option").forEach((option) => {
      option.classList.remove("selected");
    });
    document.querySelectorAll(".selected-player").forEach((player) => {
      player.classList.remove("has-player");
      player.querySelector("img").style.display = "none";
    });
    document.getElementById("white-player-name").textContent =
      "Select White Player";
    document.getElementById("black-player-name").textContent =
      "Select Black Player";

    this.players = {
      white: { name: "", image: "" },
      black: { name: "", image: "" },
    };

    this.updateStartButtonState();
    this.updatePlayerOptionStates();

    this.createBoard();
    this.updateDisplay();
    this.updateCapturedPieces();
    this.updatePlaygroundVisibility();
  }

  setupEventListeners() {
    document.getElementById("reset-btn").addEventListener("click", () => {
      this.resetGame();
    });

    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.resetGame();
    });

    // Close modal when clicking outside
    document
      .getElementById("game-over-modal")
      .addEventListener("click", (e) => {
        if (e.target.id === "game-over-modal") {
          document.getElementById("game-over-modal").style.display = "none";
        }
      });

    // Add keyboard support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.deselectSquare();
      }
      if (e.key === "r" || e.key === "R") {
        this.resetGame();
      }
    });

    // Setup customization controls
    this.setupCustomization();
  }

  setupCustomization() {
    // Settings toggle
    const settingsToggle = document.getElementById("settings-toggle");
    const settingsContent = document.getElementById("settings-content");

    settingsToggle.addEventListener("click", () => {
      settingsContent.classList.toggle("active");
    });

    // Piece style selector
    const pieceStyleSelect = document.getElementById("piece-style");
    pieceStyleSelect.addEventListener("change", (e) => {
      this.changePieceStyle(e.target.value);
    });

    // Color theme selector
    const colorThemeSelect = document.getElementById("color-theme");
    colorThemeSelect.addEventListener("change", (e) => {
      this.changeColorTheme(e.target.value);
    });

    // Board style selector
    const boardStyleSelect = document.getElementById("board-style");
    boardStyleSelect.addEventListener("change", (e) => {
      this.changeBoardStyle(e.target.value);
    });

    // Fullscreen button
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    fullscreenBtn.addEventListener("click", () => {
      this.toggleFullscreen();
    });

    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", () => {
      this.updateFullscreenButton();
    });
  }

  changePieceStyle(style) {
    this.currentPieceStyle = style;
    this.createBoard();
    this.createLessonsBoard();
    this.updateCapturedPieces();
  }

  changeColorTheme(theme) {
    // Remove existing theme classes
    const gameContainer = document.querySelector(".game-container");
    gameContainer.className = gameContainer.className.replace(/theme-\w+/g, "");

    // Add new theme class
    if (theme !== "traditional") {
      gameContainer.classList.add(`theme-${theme}`);
    }
    this.currentColorTheme = theme;
  }

  changeBoardStyle(style) {
    // Remove existing board style classes
    const chessBoard = document.querySelector(".chess-board");
    chessBoard.className = chessBoard.className.replace(/board-\w+/g, "");

    // Add new board style class
    if (style !== "classic") {
      chessBoard.classList.add(`board-${style}`);
    }
    this.currentBoardStyle = style;
  }

  toggleFullscreen() {
    const gameContainer = document.querySelector(".game-container");

    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement
        .requestFullscreen()
        .then(() => {
          gameContainer.classList.add("fullscreen");
        })
        .catch((err) => {
          console.error("Error entering fullscreen:", err);
        });
    } else {
      // Exit fullscreen
      document
        .exitFullscreen()
        .then(() => {
          gameContainer.classList.remove("fullscreen");
        })
        .catch((err) => {
          console.error("Error exiting fullscreen:", err);
        });
    }
  }

  updateFullscreenButton() {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const gameContainer = document.querySelector(".game-container");

    if (document.fullscreenElement) {
      fullscreenBtn.textContent = "🚪 Exit Fullscreen";
      gameContainer.classList.add("fullscreen");
    } else {
      fullscreenBtn.textContent = "📺 Fullscreen";
      gameContainer.classList.remove("fullscreen");
    }
  }

  setupPlayerSelection() {
    const playerOptions = document.querySelectorAll(".player-option");
    const startGameBtn = document.getElementById("start-game-btn");

    playerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        this.handlePlayerSelection(option);
      });
    });

    startGameBtn.addEventListener("click", () => {
      this.startGame();
    });

    this.updatePlayerOptionStates();
    this.updateStartButtonState();
  }

  handlePlayerSelection(option) {
    if (option.classList.contains("disabled")) return;

    const playerName = option.dataset.player;
    const playerColor = option.dataset.color;
    const otherColor = playerColor === "white" ? "black" : "white";
    const formattedName =
      playerName.charAt(0).toUpperCase() + playerName.slice(1);
    const playerImage = option.querySelector("img").src;

    // If clicking on already selected option, deselect it
    if (option.classList.contains("selected")) {
      this.clearPlayerSelection(playerColor);
      this.updateStartButtonState();
      this.updatePlayerOptionStates();
      return;
    }

    // Clear existing selections for this color
    this.clearPlayerSelection(playerColor);

    // If the other color had this player, clear it as well
    if (
      this.players[otherColor].name &&
      this.players[otherColor].name.toLowerCase() === playerName
    ) {
      this.clearPlayerSelection(otherColor);
    }

    option.classList.add("selected");

    // Update player info
    this.players[playerColor] = {
      name: formattedName,
      image: playerImage,
    };

    // Update selected player display
    const selectedPlayerEl = document.getElementById(`${playerColor}-player`);
    const selectedPlayerImg = document.getElementById(
      `${playerColor}-player-img`
    );
    const selectedPlayerName = document.getElementById(
      `${playerColor}-player-name`
    );

    selectedPlayerEl.classList.add("has-player");
    selectedPlayerImg.src = playerImage;
    selectedPlayerImg.alt = formattedName;
    selectedPlayerImg.style.display = "block";
    selectedPlayerName.textContent = formattedName;

    this.updateStartButtonState();
    this.updatePlayerOptionStates();
  }

  clearPlayerSelection(color) {
    const labelText =
      color === "white" ? "Select White Player" : "Select Black Player";

    this.players[color] = { name: "", image: "" };

    const selectedPlayerEl = document.getElementById(`${color}-player`);
    const selectedPlayerImg = document.getElementById(`${color}-player-img`);
    const selectedPlayerName = document.getElementById(`${color}-player-name`);

    selectedPlayerEl.classList.remove("has-player");
    selectedPlayerImg.src = "";
    selectedPlayerImg.alt = "";
    selectedPlayerImg.style.display = "none";
    selectedPlayerName.textContent = labelText;

    document
      .querySelectorAll(`.player-option[data-color="${color}"]`)
      .forEach((opt) => opt.classList.remove("selected"));
  }

  updatePlayerOptionStates() {
    document.querySelectorAll(".player-option").forEach((option) => {
      const optionColor = option.dataset.color;
      const otherColor = optionColor === "white" ? "black" : "white";
      const playerName = option.dataset.player;
      const otherPlayerName = this.players[otherColor].name
        ? this.players[otherColor].name.toLowerCase()
        : "";

      if (otherPlayerName && otherPlayerName === playerName) {
        option.classList.add("disabled");
      } else {
        option.classList.remove("disabled");
      }
    });
  }

  updateStartButtonState() {
    const startGameBtn = document.getElementById("start-game-btn");
    if (this.players.white.name && this.players.black.name) {
      startGameBtn.style.display = "block";
    } else {
      startGameBtn.style.display = "none";
    }
  }

  startGame() {
    if (!(this.players.white.name && this.players.black.name)) {
      return;
    }
    this.gameStarted = true;
    document.querySelector(".player-selection").style.display = "none";
    this.updateCurrentPlayerDisplay();
    this.updatePlaygroundVisibility();
  }

  updateCurrentPlayerDisplay() {
    const currentPlayerEl = document.getElementById("current-player");
    const currentPlayerImg = document.getElementById("current-player-img");

    if (this.gameStarted && this.players[this.currentPlayer].name) {
      currentPlayerEl.textContent = this.players[this.currentPlayer].name;
      currentPlayerImg.src = this.players[this.currentPlayer].image;
      currentPlayerImg.alt = this.players[this.currentPlayer].name;
      currentPlayerImg.style.display = "block";
    } else {
      currentPlayerEl.textContent =
        this.currentPlayer.charAt(0).toUpperCase() +
        this.currentPlayer.slice(1);
      currentPlayerImg.style.display = "none";
    }
  }

  updatePlaygroundVisibility() {
    const chessContainer = document.querySelector(".chess-container");
    const capturedPieces = document.querySelector(".captured-pieces");
    
    if (this.gameStarted) {
      if (chessContainer) chessContainer.style.display = "flex";
      if (capturedPieces) capturedPieces.style.display = "flex";
    } else {
      if (chessContainer) chessContainer.style.display = "none";
      if (capturedPieces) capturedPieces.style.display = "none";
    }
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.dataset.tab;

        // Update active tab button
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Show/hide tab contents
        tabContents.forEach((content) => {
          if (content.id === `${targetTab}-tab`) {
            content.style.display = "block";
          } else {
            content.style.display = "none";
          }
        });
      });
    });
  }

  createLessonsBoard() {
    const boardElement = document.getElementById("lessons-board");
    if (!boardElement) return;

    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.lessonsBoard[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `piece ${piece.color}-piece`;
          pieceElement.textContent =
            this.pieceSymbols[this.currentPieceStyle][piece.color][piece.type];
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", (e) =>
          this.handleLessonsSquareClick(e)
        );
        boardElement.appendChild(square);
      }
    }
  }

  setupLessons() {
    // Piece selection
    const pieceOptions = document.querySelectorAll(".lesson-piece-option");
    pieceOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove previous selection
        pieceOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const pieceType = option.dataset.piece;
        const pieceColor = option.dataset.color;
        this.selectedPieceForLesson = { type: pieceType, color: pieceColor };
      });
    });

    // Clear board button
    const clearButton = document.getElementById("clear-lesson-board");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        this.lessonsBoard = this.createEmptyBoard();
        this.selectedPieceForLesson = null;
        this.lessonsSelectedSquare = null;
        this.createLessonsBoard();
        pieceOptions.forEach((opt) => opt.classList.remove("selected"));
        this.updateRemovePieceButton();
      });
    }

    // Remove selected piece button
    const removePieceButton = document.getElementById("remove-selected-piece");
    if (removePieceButton) {
      removePieceButton.addEventListener("click", () => {
        if (this.lessonsSelectedSquare) {
          const row = this.lessonsSelectedSquare.row;
          const col = this.lessonsSelectedSquare.col;
          this.lessonsBoard[row][col] = null;
          this.deselectLessonsSquare();
          this.createLessonsBoard();
        }
      });
      // Initialize button state
      this.updateRemovePieceButton();
    }

    // Random board fill button
    const randomBoardButton = document.getElementById("random-board-fill");
    if (randomBoardButton) {
      randomBoardButton.addEventListener("click", () => {
        this.fillRandomPieces();
      });
    }
  }

  handleLessonsSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = this.lessonsBoard[row][col];

    // If a piece is already selected and we're clicking on a valid move square
    if (this.lessonsSelectedSquare) {
      const fromRow = this.lessonsSelectedSquare.row;
      const fromCol = this.lessonsSelectedSquare.col;
      
      // If clicking the same square, deselect
      if (fromRow === row && fromCol === col) {
        this.deselectLessonsSquare();
        return;
      }
      
      // Check if clicking on a highlighted valid move
      if (square.classList.contains("possible-move") || square.classList.contains("possible-capture")) {
        // Move the piece
        const movingPiece = this.lessonsBoard[fromRow][fromCol];
        this.lessonsBoard[fromRow][fromCol] = null;
        this.lessonsBoard[row][col] = movingPiece;
        this.createLessonsBoard();
        this.deselectLessonsSquare();
        return;
      }
      
      // If clicking on a different piece, deselect current and select new one
      if (piece) {
        this.selectLessonsSquare(row, col);
        return;
      }
      
      // If clicking on empty non-highlighted square, deselect
      this.deselectLessonsSquare();
      return;
    }

    // No piece selected - normal behavior
    // If clicking on an existing piece, show its moves
    if (piece) {
      // Select this piece and show moves
      this.selectLessonsSquare(row, col);
    } else if (this.selectedPieceForLesson) {
      // Place the selected piece from the selector on the board
      this.lessonsBoard[row][col] = { ...this.selectedPieceForLesson };
      this.createLessonsBoard();
      this.selectedPieceForLesson = null;
      document
        .querySelectorAll(".lesson-piece-option")
        .forEach((opt) => opt.classList.remove("selected"));
    }
  }

  selectLessonsSquare(row, col) {
    // Clear previous selection
    this.deselectLessonsSquare();

    this.lessonsSelectedSquare = { row, col };
    const square = document.querySelector(
      `#lessons-board [data-row="${row}"][data-col="${col}"]`
    );
    if (square) {
      square.classList.add("selected");
    }

    // Highlight possible moves
    this.highlightLessonsMoves(row, col);
    
    // Enable remove button
    this.updateRemovePieceButton();
  }

  deselectLessonsSquare() {
    if (this.lessonsSelectedSquare) {
      const square = document.querySelector(
        `#lessons-board [data-row="${this.lessonsSelectedSquare.row}"][data-col="${this.lessonsSelectedSquare.col}"]`
      );
      if (square) {
        square.classList.remove("selected");
      }
      this.lessonsSelectedSquare = null;
    }

    // Remove all move highlights
    document.querySelectorAll("#lessons-board .square").forEach((sq) => {
      sq.classList.remove("possible-move", "possible-capture");
    });
    
    // Disable remove button
    this.updateRemovePieceButton();
  }

  updateRemovePieceButton() {
    const removePieceButton = document.getElementById("remove-selected-piece");
    if (removePieceButton) {
      removePieceButton.disabled = !this.lessonsSelectedSquare;
    }
  }

  fillRandomPieces() {
    // Get all empty squares
    const emptySquares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!this.lessonsBoard[row][col]) {
          emptySquares.push({ row, col });
        }
      }
    }

    // Randomly shuffle empty squares
    for (let i = emptySquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptySquares[i], emptySquares[j]] = [emptySquares[j], emptySquares[i]];
    }

    // Get up to 10 random empty squares
    const squaresToFill = emptySquares.slice(0, Math.min(10, emptySquares.length));

    // Piece types and colors
    const pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
    const colors = ["white", "black"];

    // Fill selected squares with random pieces
    squaresToFill.forEach(({ row, col }) => {
      const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.lessonsBoard[row][col] = { type: randomType, color: randomColor };
    });

    // Update board display and deselect any selected piece
    this.deselectLessonsSquare();
    this.createLessonsBoard();
  }

  highlightLessonsMoves(row, col) {
    const piece = this.lessonsBoard[row][col];
    if (!piece) return;

    // Highlight all valid moves for this piece
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidLessonsMove(row, col, r, c)) {
          const square = document.querySelector(
            `#lessons-board [data-row="${r}"][data-col="${c}"]`
          );
          if (square) {
            const targetPiece = this.lessonsBoard[r][c];
            if (targetPiece && targetPiece.color !== piece.color) {
              square.classList.add("possible-capture");
            } else if (!targetPiece) {
              square.classList.add("possible-move");
            }
            // Also highlight the starting square as a possible move
            if (r === row && c === col) {
              square.classList.add("possible-move");
            }
          }
        }
      }
    }
  }

  isValidLessonsMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.lessonsBoard[fromRow][fromCol];
    const targetPiece = this.lessonsBoard[toRow][toCol];

    if (!piece) return false;
    if (targetPiece && targetPiece.color === piece.color) return false;
    if (fromRow === toRow && fromCol === toCol) return false;

    // Use lessons board for validation
    return this.isValidPieceMoveForBoard(
      piece,
      fromRow,
      fromCol,
      toRow,
      toCol,
      this.lessonsBoard
    );
  }

  isValidPieceMoveForBoard(piece, fromRow, fromCol, toRow, toCol, board) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case "pawn":
        return this.isValidPawnMoveForBoard(
          piece,
          fromRow,
          fromCol,
          toRow,
          toCol,
          board
        );
      case "rook":
        return (
          (rowDiff === 0 || colDiff === 0) &&
          this.isPathClearForBoard(fromRow, fromCol, toRow, toCol, board)
        );
      case "bishop":
        return (
          absRowDiff === absColDiff &&
          this.isPathClearForBoard(fromRow, fromCol, toRow, toCol, board)
        );
      case "queen":
        return (
          (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) &&
          this.isPathClearForBoard(fromRow, fromCol, toRow, toCol, board)
        );
      case "king":
        return absRowDiff <= 1 && absColDiff <= 1;
      case "knight":
        return (
          (absRowDiff === 2 && absColDiff === 1) ||
          (absRowDiff === 1 && absColDiff === 2)
        );
      default:
        return false;
    }
  }

  isValidPawnMoveForBoard(piece, fromRow, fromCol, toRow, toCol, board) {
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    // Forward move
    if (colDiff === 0) {
      if (board[toRow][toCol]) return false; // Can't capture forward
      if (rowDiff === direction) return true; // One step forward
      // Two steps from start - check if path is clear
      if (fromRow === startRow && rowDiff === 2 * direction) {
        const middleRow = fromRow + direction;
        return !board[middleRow][toCol] && !board[toRow][toCol];
      }
    }

    // Diagonal capture
    if (colDiff === 1 && rowDiff === direction) {
      return board[toRow][toCol] !== null; // Can only capture diagonally
    }

    return false;
  }

  isPathClearForBoard(fromRow, fromCol, toRow, toCol, board) {
    const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
    const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  }

  setupMission() {
    // Mission player selection
    const missionPlayerOptions = document.querySelectorAll(".mission-player-option");
    missionPlayerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        missionPlayerOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const playerName = option.dataset.player;
        const formattedName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
        const playerImage = option.querySelector("img").src;

        this.missionPlayer = { name: formattedName, image: playerImage };

        const selectedPlayerEl = document.getElementById("selected-mission-player");
        const selectedPlayerImg = document.getElementById("selected-mission-player-img");
        const selectedPlayerName = document.getElementById("selected-mission-player-name");

        selectedPlayerEl.classList.add("has-player");
        selectedPlayerImg.src = playerImage;
        selectedPlayerImg.alt = formattedName;
        selectedPlayerImg.style.display = "block";
        selectedPlayerName.textContent = formattedName;

        this.updateStartMissionButton();
      });
    });

    // Mission piece selection
    const missionPieceOptions = document.querySelectorAll(".mission-piece-option");
    missionPieceOptions.forEach((option) => {
      option.addEventListener("click", () => {
        missionPieceOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const pieceType = option.dataset.piece;
        const pieceColor = option.dataset.color;

        this.missionUserPiece = { type: pieceType, color: pieceColor };

        const selectedPieceEl = document.getElementById("selected-mission-piece");
        const pieceName = pieceType.charAt(0).toUpperCase() + pieceType.slice(1);
        selectedPieceEl.classList.add("has-piece");
        selectedPieceEl.innerHTML = `<span>${pieceName}</span>`;

        this.updateStartMissionButton();
      });
    });

    // Start mission button
    const startMissionBtn = document.getElementById("start-mission-btn");
    if (startMissionBtn) {
      startMissionBtn.addEventListener("click", () => {
        this.startMission();
      });
    }

    // Mission completion modals
    const nextMissionBtn = document.getElementById("next-mission-btn");
    if (nextMissionBtn) {
      nextMissionBtn.addEventListener("click", () => {
        this.nextMission();
      });
    }

    const missionMenuBtn = document.getElementById("mission-menu-btn");
    if (missionMenuBtn) {
      missionMenuBtn.addEventListener("click", () => {
        this.resetMission();
      });
    }

    const backToMissionMenuBtn = document.getElementById("back-to-mission-menu-btn");
    if (backToMissionMenuBtn) {
      backToMissionMenuBtn.addEventListener("click", () => {
        this.resetMission();
      });
    }

    // Hint button
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        this.showMissionHint();
      });
    }

    // Reset mission button
    const resetMissionBtn = document.getElementById("reset-mission-btn");
    if (resetMissionBtn) {
      resetMissionBtn.addEventListener("click", () => {
        this.resetCurrentMission();
      });
    }

    this.updateStartMissionButton();
  }

  updateStartMissionButton() {
    const startMissionBtn = document.getElementById("start-mission-btn");
    if (startMissionBtn) {
      if (this.missionPlayer && this.missionUserPiece) {
        startMissionBtn.style.display = "block";
      } else {
        startMissionBtn.style.display = "none";
      }
    }
  }

  startMission() {
    if (!this.missionPlayer || !this.missionUserPiece) return;

    this.currentMission = 1;
    document.getElementById("mission-selection").style.display = "none";
    document.getElementById("mission-game-area").style.display = "block";
    this.initializeMissionBoard();
  }

  initializeMissionBoard() {
    // Clear board
    this.missionBoard = this.createEmptyBoard();
    this.missionSelectedSquare = null;
    this.missionOpponentPieces = [];
    this.clearMissionHints();

    // Get number of opponent pieces for current mission
    const opponentPiecesCount = this.currentMission;

    // Get all possible squares
    const allSquares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        allSquares.push({ row, col });
      }
    }

    // Randomly shuffle squares
    for (let i = allSquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSquares[i], allSquares[j]] = [allSquares[j], allSquares[i]];
    }

    // Place user piece first
    const userSquare = allSquares.pop();
    this.missionBoard[userSquare.row][userSquare.col] = {
      type: this.missionUserPiece.type,
      color: this.missionUserPiece.color,
    };
    this.missionUserPiecePosition = { row: userSquare.row, col: userSquare.col };

    // Handle bishop color restriction
    let availableSquares = allSquares;
    if (this.missionUserPiece.type === "bishop") {
      const userSquareColor = (userSquare.row + userSquare.col) % 2 === 0 ? "light" : "dark";
      availableSquares = allSquares.filter((sq) => {
        const squareColor = (sq.row + sq.col) % 2 === 0 ? "light" : "dark";
        return squareColor === userSquareColor;
      });
    }

    // Place opponent pieces (opposite color of user piece)
    const opponentColor = this.missionUserPiece.color === "white" ? "black" : "white";
    const opponentTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];

    for (let i = 0; i < opponentPiecesCount && availableSquares.length > 0; i++) {
      const square = availableSquares.pop();
      const randomType = opponentTypes[Math.floor(Math.random() * opponentTypes.length)];
      const opponentPiece = { type: randomType, color: opponentColor };

      this.missionBoard[square.row][square.col] = opponentPiece;
      this.missionOpponentPieces.push({ row: square.row, col: square.col, piece: opponentPiece });
    }

    // Update mission info
    document.getElementById("mission-title").textContent = `Mission ${this.currentMission}`;
    document.getElementById("mission-description").textContent =
      "Capture all opponent pieces to complete the mission!";
    this.updateOpponentPiecesCount();

    // Create mission board
    this.createMissionBoard();
  }

  createMissionBoard() {
    const boardElement = document.getElementById("mission-board");
    if (!boardElement) return;

    boardElement.innerHTML = "";
    this.clearMissionHints();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.missionBoard[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `piece ${piece.color}-piece`;
          pieceElement.textContent =
            this.pieceSymbols[this.currentPieceStyle][piece.color][piece.type];
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", (e) => this.handleMissionSquareClick(e));
        boardElement.appendChild(square);
      }
    }
  }

  handleMissionSquareClick(event) {
    const square = event.currentTarget;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = this.missionBoard[row][col];

    // Check if clicking on user's piece
    const isUserPiece =
      this.missionUserPiecePosition &&
      this.missionUserPiecePosition.row === row &&
      this.missionUserPiecePosition.col === col;

    if (isUserPiece) {
      // Select/deselect user piece
      if (
        this.missionSelectedSquare &&
        this.missionSelectedSquare.row === row &&
        this.missionSelectedSquare.col === col
      ) {
        this.deselectMissionSquare();
      } else {
        this.selectMissionSquare(row, col);
      }
      return;
    }

    // If user piece is selected, try to move or capture
    if (this.missionSelectedSquare) {
      const fromRow = this.missionSelectedSquare.row;
      const fromCol = this.missionSelectedSquare.col;

      // Check if valid move
      if (this.isValidMissionMove(fromRow, fromCol, row, col)) {
        const capturedPiece = this.missionBoard[row][col];

        // Move user piece
        const movingPiece = this.missionBoard[fromRow][fromCol];
        this.missionBoard[fromRow][fromCol] = null;
        this.missionBoard[row][col] = movingPiece;
        this.missionUserPiecePosition = { row, col };

        // Remove captured piece from opponent pieces list if it was one
        if (capturedPiece) {
          this.missionOpponentPieces = this.missionOpponentPieces.filter(
            (op) => !(op.row === row && op.col === col)
          );
        }

        this.deselectMissionSquare();
        this.clearMissionHints();
        this.createMissionBoard();
        this.updateOpponentPiecesCount();
        this.checkMissionCompletion();
      } else {
        // Invalid move, deselect
        this.deselectMissionSquare();
        this.clearMissionHints();
      }
    }
  }

  selectMissionSquare(row, col) {
    this.deselectMissionSquare();
    this.clearMissionHints();

    this.missionSelectedSquare = { row, col };
    const square = document.querySelector(
      `#mission-board [data-row="${row}"][data-col="${col}"]`
    );
    if (square) {
      square.classList.add("selected");
    }

    // Highlight possible moves
    this.highlightMissionMoves(row, col);
  }

  deselectMissionSquare() {
    if (this.missionSelectedSquare) {
      const square = document.querySelector(
        `#mission-board [data-row="${this.missionSelectedSquare.row}"][data-col="${this.missionSelectedSquare.col}"]`
      );
      if (square) {
        square.classList.remove("selected");
      }
      this.missionSelectedSquare = null;
    }

    // Remove all move highlights
    document.querySelectorAll("#mission-board .square").forEach((sq) => {
      sq.classList.remove("possible-move", "possible-capture");
    });
  }

  highlightMissionMoves(row, col) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.isValidMissionMove(row, col, r, c)) {
          const square = document.querySelector(
            `#mission-board [data-row="${r}"][data-col="${c}"]`
          );
          if (square) {
            const targetPiece = this.missionBoard[r][c];
            if (targetPiece) {
              square.classList.add("possible-capture");
            } else {
              square.classList.add("possible-move");
            }
          }
        }
      }
    }
  }

  isValidMissionMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.missionBoard[fromRow][fromCol];
    if (!piece) return false;

    // Only user's piece can move
    if (
      !this.missionUserPiecePosition ||
      this.missionUserPiecePosition.row !== fromRow ||
      this.missionUserPiecePosition.col !== fromCol
    ) {
      return false;
    }

    // Can't move to same square
    if (fromRow === toRow && fromCol === toCol) return false;

    // Can't capture own piece (shouldn't happen, but check anyway)
    const targetPiece = this.missionBoard[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;

    // Use the same move validation logic
    return this.isValidPieceMoveForBoard(piece, fromRow, fromCol, toRow, toCol, this.missionBoard);
  }

  updateOpponentPiecesCount() {
    const count = this.missionOpponentPieces.length;
    document.getElementById("opponent-pieces-count").textContent = count;
  }

  checkMissionCompletion() {
    if (this.missionOpponentPieces.length === 0) {
      // Mission completed
      if (this.currentMission >= this.maxMissions) {
        // All missions completed
        this.showAllMissionsCompleted();
      } else {
        // Show mission completion dialog
        this.showMissionCompletion();
      }
    }
  }

  showMissionCompletion() {
    const modal = document.getElementById("mission-completion-modal");
    const title = document.getElementById("mission-completion-title");
    const message = document.getElementById("mission-completion-message");
    const winnerImg = document.getElementById("mission-winner-img");

    title.textContent = "Mission Completed!";
    message.textContent = `Congratulations, mission ${this.currentMission} is completed!`;
    winnerImg.src = this.missionPlayer.image;
    winnerImg.alt = this.missionPlayer.name;
    winnerImg.style.display = "block";

    modal.style.display = "block";
  }

  showAllMissionsCompleted() {
    const modal = document.getElementById("all-missions-completed-modal");
    const winnerImg = document.getElementById("all-missions-winner-img");

    winnerImg.src = this.missionPlayer.image;
    winnerImg.alt = this.missionPlayer.name;
    winnerImg.style.display = "block";

    modal.style.display = "block";
  }

  nextMission() {
    document.getElementById("mission-completion-modal").style.display = "none";
    this.currentMission++;
    this.initializeMissionBoard();
  }

  resetMission() {
    document.getElementById("mission-completion-modal").style.display = "none";
    document.getElementById("all-missions-completed-modal").style.display = "none";
    document.getElementById("mission-selection").style.display = "block";
    document.getElementById("mission-game-area").style.display = "none";

    this.currentMission = 1;
    this.missionBoard = this.createEmptyBoard();
    this.missionSelectedSquare = null;
    this.missionOpponentPieces = [];
    this.missionUserPiecePosition = null;

    // Reset selections
    document.querySelectorAll(".mission-player-option").forEach((opt) => opt.classList.remove("selected"));
    document.querySelectorAll(".mission-piece-option").forEach((opt) => opt.classList.remove("selected"));
    document.getElementById("selected-mission-player").classList.remove("has-player");
    document.getElementById("selected-mission-player-img").style.display = "none";
    document.getElementById("selected-mission-player-name").textContent = "Select Player";
    document.getElementById("selected-mission-piece").classList.remove("has-piece");
    document.getElementById("selected-mission-piece").innerHTML = "<span>Select Piece</span>";

    this.missionPlayer = null;
    this.missionUserPiece = null;
    this.updateStartMissionButton();
  }

  resetCurrentMission() {
    // Reset just the current mission without going back to selection
    this.deselectMissionSquare();
    this.clearMissionHints();
    this.initializeMissionBoard();
  }

  showMissionHint() {
    // Clear any existing hints
    this.clearMissionHints();

    if (!this.missionUserPiecePosition) return;

    const userRow = this.missionUserPiecePosition.row;
    const userCol = this.missionUserPiecePosition.col;
    const userPiece = this.missionBoard[userRow][userCol];

    if (!userPiece) return;

    // Find all opponent pieces that can be captured
    const capturablePieces = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.missionBoard[row][col];
        // Check if this is an opponent piece
        if (piece && piece.color !== userPiece.color) {
          // Check if user can capture this piece
          if (this.isValidMissionMove(userRow, userCol, row, col)) {
            capturablePieces.push({ row, col });
          }
        }
      }
    }

    // Highlight capturable pieces in yellow
    capturablePieces.forEach(({ row, col }) => {
      const square = document.querySelector(
        `#mission-board [data-row="${row}"][data-col="${col}"]`
      );
      if (square) {
        square.classList.add("hint-capture");
      }
    });
  }

  clearMissionHints() {
    document.querySelectorAll("#mission-board .square").forEach((sq) => {
      sq.classList.remove("hint-capture");
    });
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const game = new ChessGame();
});

// Add some sound effects (optional - will work if you add sound files)
class SoundManager {
  constructor() {
    this.sounds = {
      move: new Audio("move.mp3"),
      capture: new Audio("capture.mp3"),
      check: new Audio("check.mp3"),
    };

    // Set volume
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.3;
    });
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(() => {
        // Sound failed to play - that's okay
      });
    }
  }
}

// Uncomment to enable sounds (requires sound files)
// const soundManager = new SoundManager();
