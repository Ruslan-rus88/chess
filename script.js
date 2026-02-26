// Chess Game JavaScript
class ChessGame {
  constructor() {
    this.board = this.createInitialBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameOver = false;
    this.capturedPieces = { white: [], black: [] };

    // Undo/Redo functionality
    this.boardHistory = []; // Store board states for undo/redo
    this.capturedPiecesHistory = []; // Store captured pieces states
    this.currentPlayerHistory = []; // Store current player states
    this.historyIndex = -1; // Current position in history (-1 means at latest move)
    this.isUndoMode = false; // Whether we're in undo mode (not at latest move)

    // Replay mode
    this.replayMode = false;
    this.replayInterval = null;
    this.replaySpeed = 1000; // 1 seconds in milliseconds
    this.replayIndex = 0;
    this.initialBoardState = null;
    this.replayBoardState = null;
    this.replayCapturedPieces = { white: [], black: [] };
    this.isReplayPlaying = false;

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
    this.gameMode = "one-player"; // "one-player" or "two-players"
    this.playerSide = "white"; // "white" or "black" for one-player mode

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
    this.missionDifficulty = "medium"; // "easy", "medium", "hard"
    this.missionUserPiecePosition = null;
    this.missionOpponentPieces = [];
    this.missionTimer = null;
    this.missionTimeRemaining = 0;
    this.missionTimerInterval = null;
    this.missionCompleted = false; // Flag to prevent timeout after completion

    // Lessons mode instructor
    this.lessonsInstructor = "roman";

    // Voice recognition
    this.voiceRecognition = null;

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

    // Load voices for speech synthesis (some browsers need this)
    if (window.speechSynthesis) {
      // Chrome needs voices to be loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          // Voices loaded
        });
      }
    }
  }

  createBoard() {
    const boardElement = document.getElementById("chess-board");
    boardElement.innerHTML = "";

    // Check if current player's king is in check
    const kingInCheck = this.isKingInCheck(this.currentPlayer);

    // Get last move for highlighting
    const lastMove =
      this.moveHistory.length > 0
        ? this.moveHistory[this.moveHistory.length - 1]
        : null;

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

        // Highlight king in check with red background
        if (
          kingInCheck &&
          piece &&
          piece.type === "king" &&
          piece.color === this.currentPlayer
        ) {
          square.classList.add("king-in-check");
        }

        // Highlight last move
        if (lastMove) {
          if (
            (lastMove.from.row === row && lastMove.from.col === col) ||
            (lastMove.to.row === row && lastMove.to.col === col)
          ) {
            square.classList.add("last-move");
          }
        }

        square.addEventListener("click", (e) => this.handleSquareClick(e));
        boardElement.appendChild(square);
      }
    }
  }

  handleSquareClick(event) {
    if (this.gameOver || !this.gameStarted || this.replayMode) return;

    // In one-player mode, don't allow moves when it's PC's turn
    if (
      this.gameMode === "one-player" &&
      this.players[this.currentPlayer].name === "PC"
    ) {
      return;
    }

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
          col,
        )
      ) {
        // Make the move
        this.makeMove(
          this.selectedSquare.row,
          this.selectedSquare.col,
          row,
          col,
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
      `[data-row="${row}"][data-col="${col}"]`,
    );
    square.classList.add("selected");

    // Play selection sound
    if (typeof soundManager !== "undefined") {
      soundManager.play("select");
    }

    // Highlight possible moves
    this.highlightPossibleMoves(row, col);
  }

  deselectSquare() {
    if (this.selectedSquare) {
      const square = document.querySelector(
        `[data-row="${this.selectedSquare.row}"][data-col="${this.selectedSquare.col}"]`,
      );
      square.classList.remove("selected");
      this.selectedSquare = null;
    }

    // Remove all move highlights (but keep check highlight)
    document.querySelectorAll(".square").forEach((sq) => {
      sq.classList.remove("possible-move", "possible-capture");
    });
  }

  highlightPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Only highlight moves that are valid and don't leave king in check
        if (this.isValidMove(row, col, r, c)) {
          const square = document.querySelector(
            `[data-row="${r}"][data-col="${c}"]`,
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

    // Check if the move is valid according to piece movement rules
    if (!this.isValidPieceMove(piece, fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    // If the king is in check, only allow moves that remove the check
    if (this.isKingInCheck(piece.color)) {
      return this.doesMoveRemoveCheck(fromRow, fromCol, toRow, toCol);
    }

    // If the king is not in check, prevent moves that would leave the king in check
    if (this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol)) {
      return false;
    }

    return true;
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

  // Find the king's position for a given color
  findKing(color, board = this.board) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === "king" && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // Check if a square is under attack by opponent pieces
  isSquareUnderAttack(row, col, defendingColor, board = this.board) {
    const opponentColor = defendingColor === "white" ? "black" : "white";

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === opponentColor) {
          // Check if this opponent piece can attack the target square
          if (this.canPieceAttackSquare(piece, r, c, row, col, board)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Check if a piece can attack a specific square
  canPieceAttackSquare(piece, fromRow, fromCol, toRow, toCol, board) {
    // Can't attack own square
    if (fromRow === toRow && fromCol === toCol) return false;

    // Can't capture own color piece
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    switch (piece.type) {
      case "pawn":
        const direction = piece.color === "white" ? -1 : 1;
        // Pawns can only attack diagonally
        return absColDiff === 1 && rowDiff === direction;

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

  // Check if path is clear on a specific board (for check detection)
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

  // Check if the king is in check
  isKingInCheck(color, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return false;

    return this.isSquareUnderAttack(kingPos.row, kingPos.col, color, board);
  }

  // Find all pieces attacking the king
  getAttackingPieces(color, board = this.board) {
    const kingPos = this.findKing(color, board);
    if (!kingPos) return [];

    const opponentColor = color === "white" ? "black" : "white";
    const attackingPieces = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === opponentColor) {
          if (
            this.canPieceAttackSquare(
              piece,
              r,
              c,
              kingPos.row,
              kingPos.col,
              board,
            )
          ) {
            attackingPieces.push({ piece, row: r, col: c });
          }
        }
      }
    }

    return attackingPieces;
  }

  // Get squares between two positions (for blocking checks)
  getSquaresBetween(fromRow, fromCol, toRow, toCol) {
    const squares = [];
    const rowStep = toRow === fromRow ? 0 : toRow > fromRow ? 1 : -1;
    const colStep = toCol === fromCol ? 0 : toCol > fromCol ? 1 : -1;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      squares.push({ row: currentRow, col: currentCol });
      currentRow += rowStep;
      currentCol += colStep;
    }

    return squares;
  }

  // Check if a move would leave the king in check
  wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    // Create a copy of the board to simulate the move
    const boardCopy = this.board.map((row) =>
      row.map((col) => (col ? { ...col } : null)),
    );

    // Simulate the move
    boardCopy[toRow][toCol] = boardCopy[fromRow][fromCol];
    boardCopy[fromRow][fromCol] = null;

    // Check if the king is in check after the move
    return this.isKingInCheck(piece.color, boardCopy);
  }

  // Check if a move removes check (when king is already in check)
  doesMoveRemoveCheck(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    if (!piece) return false;

    const color = piece.color;

    // If king is not in check, any move that doesn't leave it in check is valid
    if (!this.isKingInCheck(color)) {
      return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
    }

    // King is in check - find all attacking pieces
    const attackingPieces = this.getAttackingPieces(color);

    // If multiple pieces are attacking, only the king can move
    if (attackingPieces.length > 1) {
      if (piece.type === "king") {
        // Check if the destination square is safe (not under attack)
        return !this.isSquareUnderAttack(toRow, toCol, color);
      }
      return false;
    }

    // Only one piece is attacking
    const attacker = attackingPieces[0];
    const kingPos = this.findKing(color);

    // Case 1: Moving the king to a safe square
    if (piece.type === "king") {
      // The destination square must not be under attack
      return !this.isSquareUnderAttack(toRow, toCol, color);
    }

    // Case 2: Capturing the attacking piece
    if (toRow === attacker.row && toCol === attacker.col) {
      return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
    }

    // Case 3: Blocking the check (only works for line attacks: rook, bishop, queen)
    const attackerPiece = attacker.piece;
    if (
      attackerPiece.type === "rook" ||
      attackerPiece.type === "bishop" ||
      attackerPiece.type === "queen"
    ) {
      // Check if the move is on the line between the attacker and the king
      const blockingSquares = this.getSquaresBetween(
        attacker.row,
        attacker.col,
        kingPos.row,
        kingPos.col,
      );
      const isOnBlockingLine = blockingSquares.some(
        (sq) => sq.row === toRow && sq.col === toCol,
      );

      if (isOnBlockingLine) {
        return !this.wouldMoveLeaveKingInCheck(fromRow, fromCol, toRow, toCol);
      }
    }

    // Move doesn't remove the check
    return false;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    // Save board state before making the move (for undo)
    this.saveBoardStateBeforeMove();

    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Handle capture
    if (capturedPiece) {
      this.capturedPieces[capturedPiece.color].push(capturedPiece);
      this.updateCapturedPieces();

      // Play capture sound
      if (typeof soundManager !== "undefined") {
        soundManager.play("capture");
      }
    } else {
      // Play move sound
      if (typeof soundManager !== "undefined") {
        soundManager.play("move");
      }
    }

    // Move piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    // Handle pawn promotion - automatically promote to queen when reaching the last row
    if (piece.type === "pawn") {
      const promotionRow = piece.color === "white" ? 0 : 7;
      if (toRow === promotionRow) {
        // Promote pawn to queen
        this.board[toRow][toCol] = {
          type: "queen",
          color: piece.color,
        };
      }
    }

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

    // Check if king is in check and play check sound
    if (typeof soundManager !== "undefined") {
      const nextPlayer = this.currentPlayer === "white" ? "black" : "white";
      if (this.isKingInCheck(nextPlayer)) {
        soundManager.play("check");
      }
    }
  }

  storeInitialBoardState() {
    // Deep copy the initial board state
    this.initialBoardState = this.board.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
  }

  highlightLastMove(fromRow, fromCol, toRow, toCol) {
    const fromSquare = document.querySelector(
      `[data-row="${fromRow}"][data-col="${fromCol}"]`,
    );
    const toSquare = document.querySelector(
      `[data-row="${toRow}"][data-col="${toCol}"]`,
    );

    fromSquare.classList.add("last-move");
    toSquare.classList.add("last-move");
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.updateDisplay();

    // Recreate board to update check highlight for new current player
    this.createBoard();

    // If PC's turn, make a move automatically
    if (
      this.gameMode === "one-player" &&
      this.players[this.currentPlayer].name === "PC"
    ) {
      setTimeout(() => {
        this.makePCMove();
      }, 500);
    }
  }

  makePCMove() {
    if (this.gameOver || !this.gameStarted) return;
    if (this.players[this.currentPlayer].name !== "PC") return;

    // Find all possible moves for PC
    const possibleMoves = [];

    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = this.board[fromRow][fromCol];
        if (piece && piece.color === this.currentPlayer) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                possibleMoves.push({
                  from: { row: fromRow, col: fromCol },
                  to: { row: toRow, col: toCol },
                });
              }
            }
          }
        }
      }
    }

    // If there are possible moves, pick a random one
    if (possibleMoves.length > 0) {
      const randomMove =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      this.makeMove(
        randomMove.from.row,
        randomMove.from.col,
        randomMove.to.row,
        randomMove.to.col,
      );
      this.switchPlayer();
      this.checkGameState();
    }
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

  updateAllUITexts() {
    if (typeof languageManager === "undefined") return;

    // Header
    const title = document.querySelector(".game-header h1");
    if (title) title.textContent = languageManager.get("title");

    // Current player label
    const currentPlayerLabel = document.querySelector(
      ".current-player-info span",
    );
    if (
      currentPlayerLabel &&
      currentPlayerLabel.textContent.includes("Current Player")
    ) {
      currentPlayerLabel.textContent = languageManager.get("currentPlayer");
    }

    // Buttons
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.textContent = languageManager.get("newGame");

    const startGameBtn = document.getElementById("start-game-btn");
    if (startGameBtn)
      startGameBtn.textContent = languageManager.get("startGame");

    // Tabs
    const tabs = document.querySelectorAll(".tab-button");
    tabs.forEach((tab) => {
      const tabName = tab.dataset.tab;
      if (tabName === "game") tab.textContent = languageManager.get("game");
      if (tabName === "lessons")
        tab.textContent = languageManager.get("lessons");
      if (tabName === "mission")
        tab.textContent = languageManager.get("mission");
    });

    // Player selection
    const selectPlayers = document.querySelector(".player-selection h3");
    if (selectPlayers)
      selectPlayers.textContent = languageManager.get("selectPlayers");

    const onePlayerLabel = document.querySelector(
      'label[for="mode-one-player"] span',
    );
    if (onePlayerLabel)
      onePlayerLabel.textContent = languageManager.get("onePlayerVsPC");

    const twoPlayersLabel = document.querySelector(
      'label[for="mode-two-players"] span',
    );
    if (twoPlayersLabel)
      twoPlayersLabel.textContent = languageManager.get("twoPlayers");

    const selectYourSide = document.querySelector(".player-side-selection h4");
    if (selectYourSide)
      selectYourSide.textContent = languageManager.get("selectYourSide");

    const whiteLabel = document.querySelector(
      'label[for="player-side-white"] span',
    );
    if (whiteLabel) whiteLabel.textContent = languageManager.get("white");

    const blackLabel = document.querySelector(
      'label[for="player-side-black"] span',
    );
    if (blackLabel) blackLabel.textContent = languageManager.get("black");

    const pcPlayerName = document.getElementById("pc-player-name");
    if (pcPlayerName)
      pcPlayerName.textContent = languageManager.get("computer");

    // Captured pieces
    const capturedWhite = document.querySelector(".captured-white h3");
    if (capturedWhite)
      capturedWhite.textContent = languageManager.get("capturedWhitePieces");

    const capturedBlack = document.querySelector(".captured-black h3");
    if (capturedBlack)
      capturedBlack.textContent = languageManager.get("capturedBlackPieces");

    // Lessons
    const lessonsTitle = document.querySelector(".lessons-title h2");
    if (lessonsTitle)
      lessonsTitle.textContent = languageManager.get("chessLessons");

    const learnMovements = document.querySelector(".lessons-title h3");
    if (learnMovements)
      learnMovements.textContent = languageManager.get("learnPieceMovements");

    const selectPiece = document.querySelector(".piece-selector h3");
    if (selectPiece)
      selectPiece.textContent = languageManager.get("selectAPiece");

    const clearBoardBtn = document.getElementById("clear-lesson-board");
    if (clearBoardBtn)
      clearBoardBtn.textContent = languageManager.get("clearBoard");

    const removePieceBtn = document.getElementById("remove-selected-piece");
    if (removePieceBtn)
      removePieceBtn.textContent = languageManager.get("removeSelectedPiece");

    const randomBoardBtn = document.getElementById("random-board-fill");
    if (randomBoardBtn)
      randomBoardBtn.textContent = languageManager.get("randomBoardFill");

    // Lesson instructions
    const lessonInstruction1 = document.getElementById("lesson-instruction-1");
    if (lessonInstruction1)
      lessonInstruction1.textContent = languageManager.get(
        "lessonInstructions1",
      );

    const lessonInstruction2 = document.getElementById("lesson-instruction-2");
    if (lessonInstruction2)
      lessonInstruction2.textContent = languageManager.get(
        "lessonInstructions2",
      );

    const lessonInstruction3 = document.getElementById("lesson-instruction-3");
    if (lessonInstruction3)
      lessonInstruction3.textContent = languageManager.get(
        "lessonInstructions3",
      );

    // Mission
    const missionSelectTitle = document.querySelector("#mission-selection h3");
    if (missionSelectTitle)
      missionSelectTitle.textContent = languageManager.get(
        "selectPlayerAndPiece",
      );

    const startMissionBtn = document.getElementById("start-mission-btn");
    if (startMissionBtn)
      startMissionBtn.textContent = languageManager.get("startMission");

    // Settings modal
    this.updateSettingsModalTexts();

    // Game over modal
    const newGameBtn = document.getElementById("new-game-btn");
    if (newGameBtn) newGameBtn.textContent = languageManager.get("newGame");

    const replayBtn = document.getElementById("replay-btn");
    if (replayBtn) replayBtn.textContent = languageManager.get("replay");

    // Replay controls
    const replayPrevBtn = document.getElementById("replay-prev-btn");
    if (replayPrevBtn)
      replayPrevBtn.textContent = languageManager.get("previous");

    const replayStopBtn = document.getElementById("replay-stop-btn");
    if (replayStopBtn) replayStopBtn.textContent = languageManager.get("stop");

    const replayPlayBtn = document.getElementById("replay-play-btn");
    if (replayPlayBtn) replayPlayBtn.textContent = languageManager.get("play");

    const replayNextBtn = document.getElementById("replay-next-btn");
    if (replayNextBtn) replayNextBtn.textContent = languageManager.get("next");

    const exitReplayBtn = document.getElementById("exit-replay-btn");
    if (exitReplayBtn)
      exitReplayBtn.textContent = languageManager.get("exitReplay");
  }

  updateSettingsModalTexts() {
    if (typeof languageManager === "undefined") return;

    const languageLabel = document.getElementById("language-label");
    if (languageLabel)
      languageLabel.textContent = languageManager.get("language");

    const pieceStyleLabel = document.getElementById("piece-style-label");
    if (pieceStyleLabel)
      pieceStyleLabel.textContent = languageManager.get("pieceStyle");

    const colorThemeLabel = document.getElementById("color-theme-label");
    if (colorThemeLabel)
      colorThemeLabel.textContent = languageManager.get("colorTheme");

    const boardStyleLabel = document.getElementById("board-style-label");
    if (boardStyleLabel)
      boardStyleLabel.textContent = languageManager.get("boardStyle");

    const enableVoiceLabel = document.getElementById(
      "enable-voice-commands-label",
    );
    if (enableVoiceLabel)
      enableVoiceLabel.textContent = languageManager.get("enableVoiceCommands");

    const voiceInstructions = document.getElementById(
      "voice-command-instructions",
    );
    if (voiceInstructions)
      voiceInstructions.textContent = languageManager.get(
        "voiceCommandInstructions",
      );

    const settingsCloseBtn = document.getElementById("settings-close-btn");
    if (settingsCloseBtn)
      settingsCloseBtn.textContent = languageManager.get("close");
  }

  updateUITexts() {
    // Alias for updateAllUITexts (for language manager compatibility)
    this.updateAllUITexts();
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

    const winsText =
      typeof languageManager !== "undefined"
        ? languageManager.get("wins")
        : "Wins! 🎉";
    document.getElementById("game-over-title").textContent =
      `${winnerName} ${winsText}`;

    const winnerImg = document.getElementById("game-over-winner-img");
    if (winnerImage) {
      winnerImg.src = winnerImage;
      winnerImg.alt = winnerName;
      winnerImg.style.display = "block";
    } else {
      winnerImg.style.display = "none";
    }

    document.getElementById("game-over-message").textContent = message;
    document.getElementById("game-over-modal").style.display = "block";
  }

  resetGame() {
    // Exit replay mode if active
    if (this.replayMode) {
      this.replayStop();
      this.replayMode = false;
      document.getElementById("replay-controls").style.display = "none";
    }

    this.board = this.createInitialBoard();
    this.currentPlayer = "white";
    this.selectedSquare = null;
    this.moveHistory = [];
    this.gameOver = false;
    this.capturedPieces = { white: [], black: [] };
    this.gameStarted = false;

    document.getElementById("game-over-modal").style.display = "none";
    document.querySelector(".player-selection").style.display = "block";

    // Reset player selections based on game mode
    if (this.gameMode === "one-player") {
      this.clearOnePlayerSelection();
      const oppositeSide = this.playerSide === "white" ? "black" : "white";
      this.players[oppositeSide] = { name: "PC", image: "" };
    } else {
      // Reset two-player selections
      document
        .querySelectorAll(
          '.player-option[data-color="white"], .player-option[data-color="black"]',
        )
        .forEach((option) => {
          option.classList.remove("selected");
        });
      document
        .querySelectorAll("#white-player, #black-player")
        .forEach((player) => {
          player.classList.remove("has-player");
          const img = player.querySelector("img");
          if (img) img.style.display = "none";
        });
      document.getElementById("white-player-name").textContent =
        "Select White Player";
      document.getElementById("black-player-name").textContent =
        "Select Black Player";

      this.players = {
        white: { name: "", image: "" },
        black: { name: "", image: "" },
      };
    }

    this.updateStartButtonState();
    this.updatePlayerOptionStates();

    this.createBoard();
    this.updateDisplay();
    this.updateCapturedPieces();
    this.updatePlaygroundVisibility();
    this.updateCurrentPlayerDisplay();

    // Reset undo/redo history
    this.boardHistory = [];
    this.capturedPiecesHistory = [];
    this.currentPlayerHistory = [];
    this.historyIndex = -1;
    this.isUndoMode = false;
    this.updateUndoRedoButtons();

    // Save initial board state
    this.saveBoardState();
  }

  // Save current board state for undo/redo
  saveBoardState() {
    // If we're not at the latest position and make a new move, truncate history
    // This handles both undo mode and resume scenarios
    if (this.historyIndex < this.boardHistory.length - 1) {
      this.boardHistory = this.boardHistory.slice(0, this.historyIndex + 1);
      this.capturedPiecesHistory = this.capturedPiecesHistory.slice(
        0,
        this.historyIndex + 1,
      );
      this.currentPlayerHistory = this.currentPlayerHistory.slice(
        0,
        this.historyIndex + 1,
      );
    }

    // Deep copy board state
    const boardCopy = this.board.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );

    // Deep copy captured pieces
    const capturedCopy = {
      white: this.capturedPieces.white.map((p) => ({ ...p })),
      black: this.capturedPieces.black.map((p) => ({ ...p })),
    };

    this.boardHistory.push(boardCopy);
    this.capturedPiecesHistory.push(capturedCopy);
    this.currentPlayerHistory.push(this.currentPlayer);

    this.historyIndex = this.boardHistory.length - 1;
    this.isUndoMode = false;
    this.updateUndoRedoButtons();
  }

  // Save board state before making a move (for undo)
  saveBoardStateBeforeMove() {
    // Only save if not in undo mode (to avoid saving duplicate states)
    if (!this.isUndoMode) {
      this.saveBoardState();
    }
  }

  // Undo last move
  undoMove() {
    if (this.historyIndex <= 0) return; // Can't undo from initial state

    this.historyIndex--;
    this.restoreBoardState();
    this.isUndoMode = true;
    this.updateUndoRedoButtons();
  }

  // Redo undone move
  redoMove() {
    if (this.historyIndex >= this.boardHistory.length - 1) return; // Already at latest

    this.historyIndex++;
    this.restoreBoardState();
    this.updateUndoRedoButtons();

    // If we're back at the latest move, exit undo mode
    if (this.historyIndex === this.boardHistory.length - 1) {
      this.isUndoMode = false;
    }
  }

  // Resume game from current position
  resumeGame() {
    // Exit undo mode and continue from currently displayed position
    // Don't change historyIndex - stay at current position
    this.isUndoMode = false;
    this.updateUndoRedoButtons();

    // When the next move is made, saveBoardState will truncate history
    // from this point forward, so the game continues from here
  }

  // Restore board state from history
  restoreBoardState() {
    if (this.historyIndex < 0 || this.historyIndex >= this.boardHistory.length)
      return;

    // Restore board
    const savedBoard = this.boardHistory[this.historyIndex];
    this.board = savedBoard.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );

    // Restore captured pieces
    const savedCaptured = this.capturedPiecesHistory[this.historyIndex];
    this.capturedPieces = {
      white: savedCaptured.white.map((p) => ({ ...p })),
      black: savedCaptured.black.map((p) => ({ ...p })),
    };

    // Restore current player
    this.currentPlayer = this.currentPlayerHistory[this.historyIndex];

    // Update display
    this.createBoard();
    this.updateDisplay();
    this.updateCapturedPieces();
    this.deselectSquare();
  }

  // Update undo/redo/resume button states
  updateUndoRedoButtons() {
    const undoBtn = document.getElementById("undo-btn");
    const redoBtn = document.getElementById("redo-btn");
    const resumeBtn = document.getElementById("resume-btn");

    if (!undoBtn || !redoBtn || !resumeBtn) return;

    // Show/hide buttons based on whether game is active
    if (this.gameStarted) {
      undoBtn.style.display = "inline-block";
      redoBtn.style.display = "inline-block";
    } else {
      undoBtn.style.display = "none";
      redoBtn.style.display = "none";
      resumeBtn.style.display = "none";
      return; // Don't update states if buttons are hidden
    }

    // Enable/disable undo (can undo if not at initial state)
    undoBtn.disabled = this.historyIndex <= 0;

    // Enable/disable redo (can redo if not at latest move)
    redoBtn.disabled = this.historyIndex >= this.boardHistory.length - 1;

    // Show/hide resume button (only show when in undo mode and not at latest)
    // Resume allows continuing from current position, not jumping to latest
    if (this.isUndoMode && this.historyIndex < this.boardHistory.length - 1) {
      resumeBtn.style.display = "inline-block";
      resumeBtn.disabled = false;
    } else {
      resumeBtn.style.display = "none";
    }
  }

  setupEventListeners() {
    document.getElementById("reset-btn").addEventListener("click", () => {
      this.resetGame();
    });

    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.resetGame();
    });

    // Undo/Redo/Resume buttons
    document.getElementById("undo-btn").addEventListener("click", () => {
      this.undoMove();
    });

    document.getElementById("redo-btn").addEventListener("click", () => {
      this.redoMove();
    });

    document.getElementById("resume-btn").addEventListener("click", () => {
      this.resumeGame();
    });

    document.getElementById("replay-btn").addEventListener("click", () => {
      this.startReplay();
    });

    // Replay controls
    document.getElementById("replay-prev-btn").addEventListener("click", () => {
      this.replayPrevious();
    });

    document.getElementById("replay-next-btn").addEventListener("click", () => {
      this.replayNext();
    });

    document.getElementById("replay-play-btn").addEventListener("click", () => {
      this.replayPlay();
    });

    document.getElementById("replay-stop-btn").addEventListener("click", () => {
      this.replayStop();
    });

    document.getElementById("exit-replay-btn").addEventListener("click", () => {
      this.exitReplay();
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
    const settingsModal = document.getElementById("settings-modal");
    const settingsClose = document.getElementById("settings-close");
    const settingsCloseBtn = document.getElementById("settings-close-btn");

    settingsToggle.addEventListener("click", () => {
      settingsModal.style.display = "flex";
      this.updateSettingsModalTexts();
    });

    settingsClose.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });

    settingsCloseBtn.addEventListener("click", () => {
      settingsModal.style.display = "none";
    });

    // Close modal when clicking outside
    settingsModal.addEventListener("click", (e) => {
      if (e.target.id === "settings-modal") {
        settingsModal.style.display = "none";
      }
    });

    // Language selector
    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.value = languageManager.getLanguageCode();
      languageSelect.addEventListener("change", (e) => {
        languageManager.setLanguage(e.target.value);
        this.updateAllUITexts();
        if (this.voiceRecognition) {
          this.voiceRecognition.updateLanguage();
        }
      });
    }

    // Voice commands checkbox
    const enableVoiceCommands = document.getElementById(
      "enable-voice-commands",
    );
    if (enableVoiceCommands) {
      enableVoiceCommands.addEventListener("change", (e) => {
        if (e.target.checked) {
          if (!this.voiceRecognition) {
            this.voiceRecognition = new VoiceRecognitionManager(this);
          }
          this.voiceRecognition.enable();
        } else {
          if (this.voiceRecognition) {
            this.voiceRecognition.disable();
          }
        }
      });
    }

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

  updateRadioLabelClass(radio) {
    const label = radio.closest(".radio-label");
    if (label) {
      // Update checked state
      if (radio.checked) {
        label.classList.add("checked");
      } else {
        label.classList.remove("checked");
      }

      // Add value-based classes for player-side-selection buttons
      if (radio.name === "player-side") {
        // Remove existing side classes
        label.classList.remove("side-white", "side-black");
        // Add appropriate side class
        if (radio.value === "white") {
          label.classList.add("side-white");
        } else if (radio.value === "black") {
          label.classList.add("side-black");
        }
      }
    }
  }

  setupPlayerSelection() {
    // Only select player options for chess game (not XO game which uses data-xo-color)
    const playerOptions = document.querySelectorAll(
      ".player-option[data-color]:not([data-xo-color])",
    );
    const startGameBtn = document.getElementById("start-game-btn");

    playerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        this.handlePlayerSelection(option);
      });
    });

    startGameBtn.addEventListener("click", () => {
      this.startGame();
    });

    // Game mode radio buttons
    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    gameModeRadios.forEach((radio) => {
      // Update checked class on load
      this.updateRadioLabelClass(radio);

      radio.addEventListener("change", (e) => {
        this.gameMode = e.target.value;
        // Update all radio label classes
        gameModeRadios.forEach((r) => this.updateRadioLabelClass(r));
        this.handleGameModeChange();
      });
    });

    // Player side radio buttons (for one-player mode)
    const playerSideRadios = document.querySelectorAll(
      'input[name="player-side"]',
    );
    playerSideRadios.forEach((radio) => {
      // Update checked class on load
      this.updateRadioLabelClass(radio);

      radio.addEventListener("change", (e) => {
        this.playerSide = e.target.value;
        // Update all radio label classes
        playerSideRadios.forEach((r) => this.updateRadioLabelClass(r));
        this.handlePlayerSideChange();
      });
    });

    // Initialize game mode and radio button classes
    this.handleGameModeChange();

    // Initialize radio button label classes
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      this.updateRadioLabelClass(radio);
    });

    this.updatePlayerOptionStates();
    this.updateStartButtonState();
  }

  handleGameModeChange() {
    const onePlayerSetup = document.getElementById("one-player-setup");
    const twoPlayersSetup = document.getElementById("two-players-setup");

    if (this.gameMode === "one-player") {
      onePlayerSetup.style.display = "block";
      twoPlayersSetup.style.display = "none";
      // Clear two-player selections
      this.clearPlayerSelection("white");
      this.clearPlayerSelection("black");
      // Set PC as opponent
      const oppositeSide = this.playerSide === "white" ? "black" : "white";
      this.players[oppositeSide] = { name: "PC", image: "" };
    } else {
      onePlayerSetup.style.display = "none";
      twoPlayersSetup.style.display = "block";
      // Clear one-player selection
      this.clearOnePlayerSelection();
      // Clear PC assignment
      this.players.white = { name: "", image: "" };
      this.players.black = { name: "", image: "" };
    }
    this.updateStartButtonState();
    this.updatePlayerOptionStates();
  }

  handlePlayerSideChange() {
    const onePlayerTitle = document.getElementById("one-player-title");
    onePlayerTitle.textContent = `Your Player (${
      this.playerSide.charAt(0).toUpperCase() + this.playerSide.slice(1)
    })`;

    // Clear current selection
    this.clearOnePlayerSelection();

    // Set PC as opponent
    const oppositeSide = this.playerSide === "white" ? "black" : "white";
    this.players[oppositeSide] = { name: "PC", image: "" };

    // Clear the side we're switching from
    this.players[this.playerSide] = { name: "", image: "" };

    this.updateStartButtonState();
  }

  clearOnePlayerSelection() {
    const onePlayerSelected = document.getElementById("one-player-selected");
    const onePlayerImg = document.getElementById("one-player-img");
    const onePlayerName = document.getElementById("one-player-name");

    onePlayerSelected.classList.remove("has-player");
    onePlayerImg.src = "";
    onePlayerImg.alt = "";
    onePlayerImg.style.display = "none";
    onePlayerName.textContent = "Select Your Player";

    document
      .querySelectorAll('.player-option[data-color="one-player"]')
      .forEach((opt) => opt.classList.remove("selected"));

    this.players[this.playerSide] = { name: "", image: "" };
  }

  handlePlayerSelection(option) {
    if (option.classList.contains("disabled")) return;

    const playerName = option.dataset.player;
    const optionColor = option.dataset.color;
    const formattedName =
      playerName.charAt(0).toUpperCase() + playerName.slice(1);
    const playerImage = option.querySelector("img").src;

    // Handle one-player mode
    if (optionColor === "one-player") {
      // If clicking on already selected option, deselect it
      if (option.classList.contains("selected")) {
        this.clearOnePlayerSelection();
        this.updateStartButtonState();
        return;
      }

      // Clear existing selection
      this.clearOnePlayerSelection();

      // Select this option
      option.classList.add("selected");

      // Update player info for the selected side
      this.players[this.playerSide] = {
        name: formattedName,
        image: playerImage,
      };

      // Update selected player display
      const onePlayerSelected = document.getElementById("one-player-selected");
      const onePlayerImg = document.getElementById("one-player-img");
      const onePlayerName = document.getElementById("one-player-name");

      onePlayerSelected.classList.add("has-player");
      onePlayerImg.src = playerImage;
      onePlayerImg.alt = formattedName;
      onePlayerImg.style.display = "block";
      onePlayerName.textContent = formattedName;

      this.updateStartButtonState();
      return;
    }

    // Handle two-players mode (original logic)
    const playerColor = optionColor;
    const otherColor = playerColor === "white" ? "black" : "white";

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
      `${playerColor}-player-img`,
    );
    const selectedPlayerName = document.getElementById(
      `${playerColor}-player-name`,
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
    // Only update chess game player options (not XO game which uses data-xo-color)
    document
      .querySelectorAll(".player-option[data-color]:not([data-xo-color])")
      .forEach((option) => {
        const optionColor = option.dataset.color;

        // One-player mode options don't need disabling logic
        if (optionColor === "one-player") {
          option.classList.remove("disabled");
          return;
        }

        // Two-players mode - disable if same player is selected for other color
        const otherColor = optionColor === "white" ? "black" : "white";
        const playerName = option.dataset.player;
        const otherPlayerName =
          this.players[otherColor] && this.players[otherColor].name
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
    if (!startGameBtn) return;

    if (this.gameMode === "one-player") {
      // In one-player mode, only need the player's side to be selected
      if (this.players[this.playerSide] && this.players[this.playerSide].name) {
        startGameBtn.style.display = "block";
      } else {
        startGameBtn.style.display = "none";
      }
    } else {
      // In two-players mode, need both players
      if (
        this.players.white &&
        this.players.white.name &&
        this.players.black &&
        this.players.black.name
      ) {
        startGameBtn.style.display = "block";
      } else {
        startGameBtn.style.display = "none";
      }
    }
  }

  startGame() {
    // Validate based on game mode
    if (this.gameMode === "one-player") {
      if (!this.players[this.playerSide].name) {
        return;
      }
      // Ensure PC is set as opponent
      const oppositeSide = this.playerSide === "white" ? "black" : "white";
      this.players[oppositeSide] = { name: "PC", image: "" };
    } else {
      if (!(this.players.white.name && this.players.black.name)) {
        return;
      }
    }

    this.gameStarted = true;
    // Store initial board state for replay
    this.storeInitialBoardState();

    // Initialize undo/redo history with initial state
    this.boardHistory = [];
    this.capturedPiecesHistory = [];
    this.currentPlayerHistory = [];
    this.historyIndex = -1;
    this.isUndoMode = false;
    this.saveBoardState(); // Save initial state

    document.querySelector(".player-selection").style.display = "none";
    this.updateCurrentPlayerDisplay();
    this.updatePlaygroundVisibility();
    this.updateUndoRedoButtons();

    // If PC starts, make first move
    if (
      this.gameMode === "one-player" &&
      this.players[this.currentPlayer].name === "PC"
    ) {
      setTimeout(() => {
        this.makePCMove();
      }, 500);
    }
  }

  updateCurrentPlayerDisplay() {
    const currentPlayerEl = document.getElementById("current-player");
    const currentPlayerImg = document.getElementById("current-player-img");
    const currentPlayerInfo = document.querySelector(".current-player-info");
    const gameTab = document.getElementById("game-tab");
    const isGameTabActive = gameTab && gameTab.style.display !== "none";

    // Only show current player info if game is started AND we're on the game tab
    if (this.gameStarted && isGameTabActive) {
      if (currentPlayerInfo) {
        currentPlayerInfo.style.display = "flex";
      }

      if (this.players[this.currentPlayer].name) {
        const playerName = this.players[this.currentPlayer].name;
        currentPlayerEl.textContent = playerName;

        // Only show image if player has an image (not PC)
        if (this.players[this.currentPlayer].image) {
          currentPlayerImg.src = this.players[this.currentPlayer].image;
          currentPlayerImg.alt = playerName;
          currentPlayerImg.style.display = "block";
        } else {
          currentPlayerImg.style.display = "none";
        }
      } else {
        currentPlayerEl.textContent =
          this.currentPlayer.charAt(0).toUpperCase() +
          this.currentPlayer.slice(1);
        currentPlayerImg.style.display = "none";
      }
    } else {
      // Hide current player info if game not started or not on game tab
      if (currentPlayerInfo) {
        currentPlayerInfo.style.display = "none";
      }
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
    const resetBtn = document.getElementById("reset-btn");
    const currentPlayerInfo = document.querySelector(".current-player-info");

    // Ensure button is visible on initial load (Game tab is active by default)
    // Current player info should be hidden until game starts
    if (resetBtn) {
      resetBtn.style.display = "block";
    }
    if (currentPlayerInfo) {
      currentPlayerInfo.style.display = "none";
    }

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

        // Hide New Game button in Lessons and Mission tabs
        if (resetBtn) {
          if (targetTab === "lessons" || targetTab === "mission") {
            resetBtn.style.display = "none";
          } else {
            resetBtn.style.display = "block";
          }
        }

        // Hide current player info in Lessons and Mission tabs, or if game not started
        const currentPlayerInfo = document.querySelector(
          ".current-player-info",
        );
        if (currentPlayerInfo) {
          if (targetTab === "game" && this.gameStarted) {
            currentPlayerInfo.style.display = "flex";
          } else {
            currentPlayerInfo.style.display = "none";
          }
        }

        // Update current player display when switching tabs
        this.updateCurrentPlayerDisplay();

        // Start speech only when navigating to mission tab (not on page load)
        if (targetTab === "mission") {
          // Show welcome message when mission tab is opened for the first time
          // Use a small delay to ensure tab is visible
          setTimeout(() => {
            const missionPlayerEl = document.getElementById(
              "selected-mission-player",
            );
            if (
              missionPlayerEl &&
              !missionPlayerEl.classList.contains("has-player")
            ) {
              const message =
                typeof languageManager !== "undefined"
                  ? languageManager.get("welcomeToMissionMode")
                  : "Welcome to Mission Mode! Select your player, difficulty, and piece to begin.";
              this.showRomanMessage(message);
            }
          }, 100);
        }
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
          this.handleLessonsSquareClick(e),
        );
        boardElement.appendChild(square);
      }
    }
  }

  setupLessons() {
    // Initialize instructor dropdown
    const instructorSelect = document.getElementById(
      "lessons-instructor-select",
    );
    const instructorImg = document.getElementById("lessons-instructor-img");

    if (instructorSelect) {
      instructorSelect.addEventListener("change", (e) => {
        this.lessonsInstructor = e.target.value;
        this.updateInstructorImage();
      });
      // Set initial image
      this.updateInstructorImage();
    }

    // Initialize instructor's speech bubble (no automatic speech on page load)
    // Speech will only start when user navigates to missions

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

        // Show reactive message with translated piece name
        const pieceNames = {
          king:
            typeof languageManager !== "undefined"
              ? languageManager.get("king")
              : "King",
          queen:
            typeof languageManager !== "undefined"
              ? languageManager.get("queen")
              : "Queen",
          rook:
            typeof languageManager !== "undefined"
              ? languageManager.get("rook")
              : "Rook",
          bishop:
            typeof languageManager !== "undefined"
              ? languageManager.get("bishop")
              : "Bishop",
          knight:
            typeof languageManager !== "undefined"
              ? languageManager.get("knight")
              : "Knight",
          pawn:
            typeof languageManager !== "undefined"
              ? languageManager.get("pawn")
              : "Pawn",
        };
        const message =
          typeof languageManager !== "undefined"
            ? languageManager
                .get("lessonPieceSelected")
                .replace("{piece}", pieceNames[pieceType])
            : `Great! Now click on the board to place the ${pieceNames[pieceType]}.`;
        this.showRomanMessage(message);
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
        const message =
          typeof languageManager !== "undefined"
            ? languageManager.get("lessonBoardCleared")
            : "Board cleared! Ready to start fresh.";
        this.showRomanMessage(message);
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
        const message =
          typeof languageManager !== "undefined"
            ? languageManager.get("lessonRandomPiecesAdded")
            : "Random pieces added! Click on any piece to explore its moves.";
        this.showRomanMessage(message);
      });
    }
  }

  showRomanMessage(message) {
    const contentEl = document.getElementById("speech-bubble-content");
    const dotsEl = document.getElementById("speech-bubble-dots");

    if (!contentEl || !dotsEl) return;

    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Clear previous content and stop any ongoing typing
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
      this.dotsInterval = null;
    }

    // Store the message to type
    this.currentTypingMessage = message;
    this.currentTypingIndex = 0;

    contentEl.textContent = "";
    dotsEl.style.display = "block";
    dotsEl.textContent = ".";

    // Animate dots
    let dotCount = 1;
    this.dotsInterval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      dotsEl.textContent = ".".repeat(dotCount);
    }, 500);

    // Show dots for 0.8 seconds, then type out the message
    setTimeout(() => {
      if (this.dotsInterval) {
        clearInterval(this.dotsInterval);
        this.dotsInterval = null;
      }
      dotsEl.style.display = "none";

      // Reset typing state
      this.currentTypingIndex = 0;
      contentEl.textContent = "";

      // Start reading the message immediately as typing begins
      this.speakMessage(message);

      // Type out the message character by character
      this.typingInterval = setInterval(() => {
        // Check if this is still the current message (prevent race conditions)
        if (this.currentTypingMessage !== message) {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
          return;
        }

        if (this.currentTypingIndex < message.length) {
          // Build the text from the beginning each time to ensure correctness
          contentEl.textContent = message.substring(
            0,
            this.currentTypingIndex + 1,
          );
          this.currentTypingIndex++;
        } else {
          clearInterval(this.typingInterval);
          this.typingInterval = null;
          this.currentTypingMessage = null;
        }
      }, 30); // 30ms per character for typing effect
    }, 800);
  }

  updateInstructorImage() {
    const instructorImg = document.getElementById("lessons-instructor-img");
    if (!instructorImg) return;

    const imageMap = {
      roman: "assets/images/roman.jpg",
      ruslan: "assets/images/ruslan.jpeg",
      booba: "assets/images/booba.jpeg",
      katrine: "assets/images/katrine.jpg",
      liana: "assets/images/liana.jpeg",
      peppa: "assets/images/peppa.jpeg",
    };

    if (imageMap[this.lessonsInstructor]) {
      instructorImg.src = imageMap[this.lessonsInstructor];
      instructorImg.alt =
        this.lessonsInstructor.charAt(0).toUpperCase() +
        this.lessonsInstructor.slice(1);
    }
  }

  speakMessage(message) {
    // Check if browser supports speech synthesis
    if (!window.speechSynthesis) {
      console.log("Speech synthesis not supported in this browser");
      return;
    }

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(message);

    // Get current language code
    const langCode =
      typeof languageManager !== "undefined"
        ? languageManager.getLanguageCode()
        : "en";
    const languageMap = {
      en: "en-US",
      ru: "ru-RU",
      es: "es-ES",
      ar: "ar-SA",
    };
    const speechLang = languageMap[langCode] || "en-US";
    utterance.lang = speechLang;

    // Configure voice settings based on instructor
    const instructor = this.lessonsInstructor || "roman";

    // Voice settings by instructor type
    if (instructor === "katrine") {
      // Lady voice
      utterance.rate = 1.0;
      utterance.pitch = 1.2; // Slightly higher for female
      utterance.volume = 1.0;
    } else if (instructor === "liana" || instructor === "peppa") {
      // Girl kid sound
      utterance.rate = 1.1; // Slightly faster
      utterance.pitch = 1.6; // Higher pitch for young girl
      utterance.volume = 1.0;
    } else {
      // Man voice (Roman, Ruslan, Booba)
      utterance.rate = 1.0;
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0;
    }

    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let selectedVoice = null;
      const langPrefix = speechLang.split("-")[0];

      if (instructor === "katrine") {
        // Prefer female voices for lady
        selectedVoice =
          voices.find(
            (voice) =>
              voice.lang.startsWith(langPrefix) &&
              (voice.name.toLowerCase().includes("female") ||
                voice.name.toLowerCase().includes("woman") ||
                voice.name.toLowerCase().includes("zira") ||
                voice.name.toLowerCase().includes("samantha")),
          ) ||
          voices.find(
            (voice) => voice.lang.startsWith(langPrefix) && voice.localService,
          );
      } else if (instructor === "liana" || instructor === "peppa") {
        // Prefer higher-pitched voices for young girls
        selectedVoice =
          voices.find(
            (voice) =>
              voice.lang.startsWith(langPrefix) &&
              (voice.name.toLowerCase().includes("child") ||
                voice.name.toLowerCase().includes("young") ||
                voice.name.toLowerCase().includes("kid")),
          ) ||
          voices.find(
            (voice) =>
              voice.lang.startsWith(langPrefix) &&
              (voice.name.toLowerCase().includes("female") ||
                voice.name.toLowerCase().includes("woman")),
          );
      }

      // Fallback to any voice in current language
      if (!selectedVoice) {
        selectedVoice =
          voices.find(
            (voice) => voice.lang.startsWith(langPrefix) && voice.localService,
          ) ||
          voices.find((voice) => voice.lang.startsWith(langPrefix)) ||
          voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Speak the message
    window.speechSynthesis.speak(utterance);
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
      if (
        square.classList.contains("possible-move") ||
        square.classList.contains("possible-capture")
      ) {
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
      const pieceNames = {
        king: "King",
        queen: "Queen",
        rook: "Rook",
        bishop: "Bishop",
        knight: "Knight",
        pawn: "Pawn",
      };
      this.showRomanMessage(
        `Click on the highlighted squares to see where this ${
          pieceNames[piece.type]
        } can move!`,
      );
    } else if (this.selectedPieceForLesson) {
      // Place the selected piece from the selector on the board
      this.lessonsBoard[row][col] = { ...this.selectedPieceForLesson };
      this.createLessonsBoard();
      this.selectedPieceForLesson = null;
      document
        .querySelectorAll(".lesson-piece-option")
        .forEach((opt) => opt.classList.remove("selected"));
      this.showRomanMessage(
        typeof languageManager !== "undefined"
          ? languageManager.get("lessonClickPieceForMoves")
          : "Perfect! Now click on the piece to see its possible moves.",
      );
    }
  }

  selectLessonsSquare(row, col) {
    // Clear previous selection
    this.deselectLessonsSquare();

    this.lessonsSelectedSquare = { row, col };
    const square = document.querySelector(
      `#lessons-board [data-row="${row}"][data-col="${col}"]`,
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
        `#lessons-board [data-row="${this.lessonsSelectedSquare.row}"][data-col="${this.lessonsSelectedSquare.col}"]`,
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
    const squaresToFill = emptySquares.slice(
      0,
      Math.min(10, emptySquares.length),
    );

    // Piece types and colors
    const pieceTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];
    const colors = ["white", "black"];

    // Fill selected squares with random pieces
    squaresToFill.forEach(({ row, col }) => {
      const randomType =
        pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
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
            `#lessons-board [data-row="${r}"][data-col="${c}"]`,
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
      this.lessonsBoard,
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
          board,
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
    const missionPlayerOptions = document.querySelectorAll(
      ".mission-player-option",
    );
    missionPlayerOptions.forEach((option) => {
      option.addEventListener("click", () => {
        missionPlayerOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const playerName = option.dataset.player;
        const formattedName =
          playerName.charAt(0).toUpperCase() + playerName.slice(1);
        const playerImage = option.querySelector("img").src;

        this.missionPlayer = { name: formattedName, image: playerImage };

        const selectedPlayerEl = document.getElementById(
          "selected-mission-player",
        );
        const selectedPlayerImg = document.getElementById(
          "selected-mission-player-img",
        );
        const selectedPlayerName = document.getElementById(
          "selected-mission-player-name",
        );

        selectedPlayerEl.classList.add("has-player");
        selectedPlayerImg.src = playerImage;
        selectedPlayerImg.alt = formattedName;
        selectedPlayerImg.style.display = "block";
        selectedPlayerName.textContent = formattedName;

        this.updateStartMissionButton();
      });
    });

    // Mission piece selection
    const missionPieceOptions = document.querySelectorAll(
      ".mission-piece-option",
    );
    missionPieceOptions.forEach((option) => {
      option.addEventListener("click", () => {
        missionPieceOptions.forEach((opt) => opt.classList.remove("selected"));
        option.classList.add("selected");

        const pieceType = option.dataset.piece;
        const pieceColor = option.dataset.color;

        this.missionUserPiece = { type: pieceType, color: pieceColor };

        const selectedPieceEl = document.getElementById(
          "selected-mission-piece",
        );
        const pieceName =
          pieceType.charAt(0).toUpperCase() + pieceType.slice(1);
        selectedPieceEl.classList.add("has-piece");
        selectedPieceEl.innerHTML = `<span>${pieceName}</span>`;

        this.updateStartMissionButton();
      });
    });

    // Mission difficulty selection
    const missionDifficultyOptions = document.querySelectorAll(
      ".mission-difficulty-option",
    );
    missionDifficultyOptions.forEach((option) => {
      option.addEventListener("click", () => {
        missionDifficultyOptions.forEach((opt) =>
          opt.classList.remove("selected"),
        );
        option.classList.add("selected");

        const difficulty = option.dataset.difficulty;
        this.missionDifficulty = difficulty;

        const selectedDifficultyEl = document.getElementById(
          "selected-mission-difficulty",
        );
        const difficultyName =
          difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        const difficultyIconEl = option.querySelector(".difficulty-icon");
        const difficultyIcon = difficultyIconEl
          ? difficultyIconEl.textContent
          : "";
        selectedDifficultyEl.classList.add("has-difficulty");
        selectedDifficultyEl.innerHTML = `<span>${difficultyIcon} ${difficultyName}</span>`;

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

    const backToMissionMenuBtn = document.getElementById(
      "back-to-mission-menu-btn",
    );
    if (backToMissionMenuBtn) {
      backToMissionMenuBtn.addEventListener("click", () => {
        this.resetMission();
      });
    }

    // Mission failure modal buttons
    const retryMissionBtn = document.getElementById("retry-mission-btn");
    if (retryMissionBtn) {
      retryMissionBtn.addEventListener("click", () => {
        document.getElementById("mission-failure-modal").style.display = "none";
        this.resetCurrentMission();
      });
    }

    const missionFailureMenuBtn = document.getElementById(
      "mission-failure-menu-btn",
    );
    if (missionFailureMenuBtn) {
      missionFailureMenuBtn.addEventListener("click", () => {
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
      if (
        this.missionPlayer &&
        this.missionUserPiece &&
        this.missionDifficulty
      ) {
        startMissionBtn.style.display = "block";
      } else {
        startMissionBtn.style.display = "none";
      }
    }
  }

  startMission() {
    if (
      !this.missionPlayer ||
      !this.missionUserPiece ||
      !this.missionDifficulty
    )
      return;

    this.currentMission = 1;
    this.missionCompleted = false;
    document.getElementById("mission-selection").style.display = "none";
    document.getElementById("mission-game-area").style.display = "block";
    this.initializeMissionBoard();
  }

  initializeMissionBoard() {
    // Clear board
    this.missionBoard = this.createEmptyBoard();
    this.missionSelectedSquare = null;
    this.missionOpponentPieces = [];
    this.missionCompleted = false; // Reset completion flag
    this.clearMissionHints();

    // Stop any existing timer
    this.stopMissionTimer();

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
    this.missionUserPiecePosition = {
      row: userSquare.row,
      col: userSquare.col,
    };

    // Handle bishop color restriction
    let availableSquares = allSquares;
    if (this.missionUserPiece.type === "bishop") {
      const userSquareColor =
        (userSquare.row + userSquare.col) % 2 === 0 ? "light" : "dark";
      availableSquares = allSquares.filter((sq) => {
        const squareColor = (sq.row + sq.col) % 2 === 0 ? "light" : "dark";
        return squareColor === userSquareColor;
      });
    }

    // Place opponent pieces (opposite color of user piece)
    const opponentColor =
      this.missionUserPiece.color === "white" ? "black" : "white";
    const opponentTypes = ["king", "queen", "rook", "bishop", "knight", "pawn"];

    for (
      let i = 0;
      i < opponentPiecesCount && availableSquares.length > 0;
      i++
    ) {
      const square = availableSquares.pop();
      const randomType =
        opponentTypes[Math.floor(Math.random() * opponentTypes.length)];
      const opponentPiece = { type: randomType, color: opponentColor };

      this.missionBoard[square.row][square.col] = opponentPiece;
      this.missionOpponentPieces.push({
        row: square.row,
        col: square.col,
        piece: opponentPiece,
      });
    }

    // Update mission info
    document.getElementById("mission-title").textContent =
      `Mission ${this.currentMission}`;
    document.getElementById("mission-description").textContent =
      "Capture all opponent pieces to complete the mission!";
    this.updateOpponentPiecesCount();

    // Create mission board
    this.createMissionBoard();

    // Start timer for this mission
    this.startMissionTimer();
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

        square.addEventListener("click", (e) =>
          this.handleMissionSquareClick(e),
        );
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
            (op) => !(op.row === row && op.col === col),
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
      `#mission-board [data-row="${row}"][data-col="${col}"]`,
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
        `#mission-board [data-row="${this.missionSelectedSquare.row}"][data-col="${this.missionSelectedSquare.col}"]`,
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
            `#mission-board [data-row="${r}"][data-col="${c}"]`,
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
    return this.isValidPieceMoveForBoard(
      piece,
      fromRow,
      fromCol,
      toRow,
      toCol,
      this.missionBoard,
    );
  }

  updateOpponentPiecesCount() {
    const count = this.missionOpponentPieces.length;
    document.getElementById("opponent-pieces-count").textContent = count;
  }

  checkMissionCompletion() {
    if (this.missionOpponentPieces.length === 0) {
      // Set completion flag to prevent timeout
      this.missionCompleted = true;

      // Stop timer on completion
      this.stopMissionTimer();

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
    this.stopMissionTimer();
    this.missionCompleted = false; // Reset flag for next mission
    this.currentMission++;
    this.initializeMissionBoard();
  }

  resetMission() {
    document.getElementById("mission-completion-modal").style.display = "none";
    document.getElementById("all-missions-completed-modal").style.display =
      "none";
    document.getElementById("mission-failure-modal").style.display = "none";
    document.getElementById("mission-selection").style.display = "block";
    document.getElementById("mission-game-area").style.display = "none";

    this.stopMissionTimer();
    this.missionCompleted = false; // Reset flag
    this.currentMission = 1;
    this.missionBoard = this.createEmptyBoard();
    this.missionSelectedSquare = null;
    this.missionOpponentPieces = [];
    this.missionUserPiecePosition = null;

    // Reset selections
    document
      .querySelectorAll(".mission-player-option")
      .forEach((opt) => opt.classList.remove("selected"));
    document
      .querySelectorAll(".mission-piece-option")
      .forEach((opt) => opt.classList.remove("selected"));
    document
      .querySelectorAll(".mission-difficulty-option")
      .forEach((opt) => opt.classList.remove("selected"));
    document
      .getElementById("selected-mission-player")
      .classList.remove("has-player");
    document.getElementById("selected-mission-player-img").style.display =
      "none";
    document.getElementById("selected-mission-player-name").textContent =
      "Select Player";
    document
      .getElementById("selected-mission-piece")
      .classList.remove("has-piece");
    document.getElementById("selected-mission-piece").innerHTML =
      "<span>Select Piece</span>";
    document
      .getElementById("selected-mission-difficulty")
      .classList.remove("has-difficulty");
    document.getElementById("selected-mission-difficulty").innerHTML =
      "<span>Select Difficulty</span>";

    this.missionPlayer = null;
    this.missionUserPiece = null;
    this.missionDifficulty = "medium"; // Reset to default
    this.updateStartMissionButton();
  }

  resetCurrentMission() {
    // Reset just the current mission without going back to selection
    this.deselectMissionSquare();
    this.clearMissionHints();
    this.stopMissionTimer();
    this.missionCompleted = false; // Reset flag
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
        `#mission-board [data-row="${row}"][data-col="${col}"]`,
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

  startMissionTimer() {
    // Calculate time based on difficulty
    let timeMultiplier = 10; // default medium
    if (this.missionDifficulty === "easy") {
      timeMultiplier = 20;
    } else if (this.missionDifficulty === "hard") {
      timeMultiplier = 5;
    }

    this.missionTimeRemaining = this.currentMission * timeMultiplier;
    this.updateTimerDisplay();

    // Clear any existing timer
    if (this.missionTimerInterval) {
      clearInterval(this.missionTimerInterval);
    }

    // Start countdown
    this.missionTimerInterval = setInterval(() => {
      // Don't process timeout if mission is already completed
      if (this.missionCompleted) {
        return;
      }

      this.missionTimeRemaining--;
      this.updateTimerDisplay();

      if (this.missionTimeRemaining <= 0 && !this.missionCompleted) {
        this.handleMissionTimeout();
      }
    }, 1000);
  }

  stopMissionTimer() {
    if (this.missionTimerInterval) {
      clearInterval(this.missionTimerInterval);
      this.missionTimerInterval = null;
    }
    this.missionTimeRemaining = 0;
    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById("mission-timer");
    const timerCircle = document.getElementById("mission-timer-circle");
    if (!timerElement || !timerCircle) return;

    const minutes = Math.floor(this.missionTimeRemaining / 60);
    const seconds = this.missionTimeRemaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    timerElement.textContent = timeString;

    // Calculate percentage for circular progress based on difficulty
    let timeMultiplier = 10; // default medium
    if (this.missionDifficulty === "easy") {
      timeMultiplier = 20;
    } else if (this.missionDifficulty === "hard") {
      timeMultiplier = 5;
    }
    const totalTime = this.currentMission * timeMultiplier;
    const percentage = Math.max(
      0,
      Math.min(100, (this.missionTimeRemaining / totalTime) * 100),
    );

    // Update circle progress (circumference = 2 * π * 45 ≈ 282.74)
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    timerCircle.style.strokeDashoffset = offset;

    // Add warning class when time is low
    const timerContainer = document.querySelector(".mission-timer-container");
    if (timerContainer) {
      if (this.missionTimeRemaining <= 5 && this.missionTimeRemaining > 0) {
        timerContainer.classList.add("timer-warning");
      } else {
        timerContainer.classList.remove("timer-warning");
      }
    }
  }

  handleMissionTimeout() {
    this.stopMissionTimer();

    // Play timeout sound
    this.playTimeoutSound();

    // Show failure modal with sad face
    this.showMissionFailure();
  }

  playTimeoutSound() {
    // Create a beep sound using Web Audio API
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Fallback: try to play a simple beep
      console.log("Sound playback failed:", e);
    }
  }

  showMissionFailure() {
    const modal = document.getElementById("mission-failure-modal");
    const message = document.getElementById("mission-failure-message");
    const playerImg = document.getElementById("mission-failure-player-img");

    if (message) {
      message.textContent = `Time's up! Mission ${this.currentMission} failed.`;
    }

    if (playerImg && this.missionPlayer) {
      playerImg.src = this.missionPlayer.image;
      playerImg.alt = this.missionPlayer.name;
      playerImg.style.display = "block";
    }

    if (modal) {
      modal.style.display = "block";
    }
  }

  // Replay functionality
  startReplay() {
    if (!this.moveHistory || this.moveHistory.length === 0) {
      alert("No moves to replay!");
      return;
    }

    // Close the game over modal
    document.getElementById("game-over-modal").style.display = "none";

    // Enter replay mode
    this.replayMode = true;
    this.replayIndex = 0;
    this.isReplayPlaying = false;

    // Reset board to initial state
    this.replayBoardState = this.initialBoardState.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
    this.replayCapturedPieces = { white: [], black: [] };

    // Apply board state
    this.board = this.replayBoardState.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
    this.capturedPieces = { white: [], black: [] };

    // Show replay controls
    document.getElementById("replay-controls").style.display = "block";

    // Update display
    this.createBoard();
    this.updateCapturedPieces();
    this.updateReplayInfo();
    this.updateReplayButtons();

    // Start auto-play
    this.replayPlay();
  }

  replayPlay() {
    if (this.isReplayPlaying) return;

    this.isReplayPlaying = true;
    this.updateReplayButtons();

    // Auto-play moves
    this.replayInterval = setInterval(() => {
      if (this.replayIndex < this.moveHistory.length) {
        this.replayNext();
      } else {
        // Reached end, stop auto-play
        this.replayStop();
      }
    }, this.replaySpeed);
  }

  replayStop() {
    this.isReplayPlaying = false;
    if (this.replayInterval) {
      clearInterval(this.replayInterval);
      this.replayInterval = null;
    }
    this.updateReplayButtons();
  }

  replayNext() {
    if (this.replayIndex >= this.moveHistory.length) return;

    const move = this.moveHistory[this.replayIndex];

    // Apply the move
    const piece = this.replayBoardState[move.from.row][move.from.col];
    const capturedPiece = this.replayBoardState[move.to.row][move.to.col];

    // Handle capture
    if (capturedPiece) {
      this.replayCapturedPieces[capturedPiece.color].push(capturedPiece);
    }

    // Move piece
    this.replayBoardState[move.to.row][move.to.col] = piece;
    this.replayBoardState[move.from.row][move.from.col] = null;

    // Update board and captured pieces
    this.board = this.replayBoardState.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
    this.capturedPieces = {
      white: [...this.replayCapturedPieces.white],
      black: [...this.replayCapturedPieces.black],
    };

    this.replayIndex++;

    // Update display
    this.createBoard();
    this.highlightLastMove(
      move.from.row,
      move.from.col,
      move.to.row,
      move.to.col,
    );
    this.updateCapturedPieces();
    this.updateReplayInfo();
    this.updateReplayButtons();
  }

  replayPrevious() {
    if (this.replayIndex <= 0) return;

    // Stop auto-play if playing
    if (this.isReplayPlaying) {
      this.replayStop();
    }

    this.replayIndex--;

    // Reset to initial state
    this.replayBoardState = this.initialBoardState.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
    this.replayCapturedPieces = { white: [], black: [] };

    // Replay all moves up to current index
    for (let i = 0; i < this.replayIndex; i++) {
      const move = this.moveHistory[i];
      const piece = this.replayBoardState[move.from.row][move.from.col];
      const capturedPiece = this.replayBoardState[move.to.row][move.to.col];

      if (capturedPiece) {
        this.replayCapturedPieces[capturedPiece.color].push(capturedPiece);
      }

      this.replayBoardState[move.to.row][move.to.col] = piece;
      this.replayBoardState[move.from.row][move.from.col] = null;
    }

    // Update board and captured pieces
    this.board = this.replayBoardState.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    );
    this.capturedPieces = {
      white: [...this.replayCapturedPieces.white],
      black: [...this.replayCapturedPieces.black],
    };

    // Update display
    this.createBoard();
    if (this.replayIndex > 0) {
      const lastMove = this.moveHistory[this.replayIndex - 1];
      this.highlightLastMove(
        lastMove.from.row,
        lastMove.from.col,
        lastMove.to.row,
        lastMove.to.col,
      );
    }
    this.updateCapturedPieces();
    this.updateReplayInfo();
    this.updateReplayButtons();
  }

  exitReplay() {
    this.replayStop();
    this.replayMode = false;
    this.replayIndex = 0;

    // Hide replay controls
    document.getElementById("replay-controls").style.display = "none";

    // Reset game to end state
    this.resetGame();
  }

  updateReplayInfo() {
    const infoElement = document.getElementById("replay-move-info");
    if (infoElement) {
      infoElement.textContent = `Move ${this.replayIndex} / ${this.moveHistory.length}`;
    }
  }

  updateReplayButtons() {
    const prevBtn = document.getElementById("replay-prev-btn");
    const nextBtn = document.getElementById("replay-next-btn");
    const playBtn = document.getElementById("replay-play-btn");
    const stopBtn = document.getElementById("replay-stop-btn");

    // Update previous button
    if (prevBtn) {
      prevBtn.disabled = this.replayIndex <= 0;
    }

    // Update next button
    if (nextBtn) {
      nextBtn.disabled = this.replayIndex >= this.moveHistory.length;
    }

    // Update play/stop buttons
    if (playBtn) {
      playBtn.style.display = this.isReplayPlaying ? "none" : "inline-block";
    }
    if (stopBtn) {
      stopBtn.style.display = this.isReplayPlaying ? "inline-block" : "none";
    }
  }
}

// Initialize the game when the page loads (removed - see bottom of file)

// Add some sound effects (optional - will work if you add sound files)
// SoundManager is now in js/utils/sound-manager.js

// XO Game Class
class XOGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameOver = false;
    this.winner = null;
    this.gameMode = "two-players"; // "two-players" or "vs-computer"
    this.players = {
      X: { name: "", image: "" },
      O: { name: "", image: "" },
    };
    this.computerSymbol = "O";
    this.humanSymbol = "X";
    this.setupEventListeners();
  }

  setupEventListeners() {
    // More Games button
    document.getElementById("more-games-btn").addEventListener("click", () => {
      document.getElementById("more-games-modal").style.display = "flex";
    });

    // Close games modal
    document
      .getElementById("close-games-modal")
      .addEventListener("click", () => {
        document.getElementById("more-games-modal").style.display = "none";
      });

    // XO Game option
    document.getElementById("xo-game-option").addEventListener("click", () => {
      document.getElementById("more-games-modal").style.display = "none";
      document.getElementById("xo-game-modal").style.display = "flex";
      this.resetGameSetup();
    });

    // Close XO modal
    document.getElementById("close-xo-modal").addEventListener("click", () => {
      this.resetAndCloseXOGame();
    });

    // Game mode selection
    document.querySelectorAll('input[name="xo-game-mode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.gameMode = e.target.value;
        this.updatePlayerSelection();
      });
    });

    // Player selection for X
    document.querySelectorAll('[data-xo-color="x"]').forEach((option) => {
      option.addEventListener("click", () => {
        const player = option.dataset.player;
        const img = option.querySelector("img").src;
        this.selectPlayer("X", player, img);
      });
    });

    // Player selection for O
    document.querySelectorAll('[data-xo-color="o"]').forEach((option) => {
      option.addEventListener("click", () => {
        if (this.gameMode === "two-players") {
          const player = option.dataset.player;
          const img = option.querySelector("img").src;
          this.selectPlayer("O", player, img);
        }
      });
    });

    // Start XO game
    document
      .getElementById("start-xo-game-btn")
      .addEventListener("click", () => {
        this.startGame();
      });

    // Reset XO game
    document.getElementById("xo-reset-btn").addEventListener("click", () => {
      this.resetGame();
    });
  }

  resetGameSetup() {
    this.players = { X: { name: "", image: "" }, O: { name: "", image: "" } };
    this.gameMode = "vs-computer";
    document.getElementById("xo-mode-two-players").checked = false;
    document.getElementById("xo-mode-vs-computer").checked = true;

    // Reset player displays
    document.getElementById("xo-x-player").innerHTML =
      "<span>Select Player X</span>";
    document.getElementById("xo-x-player").classList.remove("has-player");
    document.getElementById("xo-o-player").innerHTML =
      '<span id="xo-o-player-text">Select Player O</span>';
    document.getElementById("xo-o-player").classList.remove("has-player");

    this.updatePlayerSelection();
    this.updateStartButton();
  }

  updatePlayerSelection() {
    const oPlayerOptions = document.getElementById("xo-o-player-options");
    const oPlayerElement = document.getElementById("xo-o-player");

    if (this.gameMode === "vs-computer") {
      oPlayerOptions.style.display = "none";
      oPlayerElement.innerHTML = "<span>Computer</span>";
      oPlayerElement.classList.add("has-player");
      this.players.O = { name: "Computer", image: "" };
    } else {
      oPlayerOptions.style.display = "grid";
      oPlayerElement.innerHTML =
        '<span id="xo-o-player-text">Select Player O</span>';
      if (!this.players.O.name || this.players.O.name === "Computer") {
        oPlayerElement.classList.remove("has-player");
        this.players.O = { name: "", image: "" };
      }
    }
    this.updateStartButton();
  }

  selectPlayer(symbol, playerName, imageSrc) {
    this.players[symbol] = { name: playerName, image: imageSrc };

    const playerElement = document.getElementById(
      `xo-${symbol.toLowerCase()}-player`,
    );
    playerElement.innerHTML = `
      <img src="${imageSrc}" alt="${playerName}" style="display: block; width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 8px; border: 2px solid #28a745;" />
      <span>${playerName}</span>
    `;
    playerElement.classList.add("has-player");

    this.updateStartButton();
  }

  updateStartButton() {
    const startBtn = document.getElementById("start-xo-game-btn");
    if (this.players.X.name && this.players.O.name) {
      startBtn.style.display = "block";
    } else {
      startBtn.style.display = "none";
    }
  }

  startGame() {
    document.getElementById("xo-game-setup").style.display = "none";
    document.getElementById("xo-game-area").style.display = "block";

    // Set symbols for vs computer mode
    if (this.gameMode === "vs-computer") {
      this.humanSymbol = "X";
      this.computerSymbol = "O";
      this.currentPlayer = "X"; // Human always starts
    }

    this.createBoard();
    this.resetGame();
  }

  createBoard() {
    const board = document.getElementById("xo-board");
    board.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.className = "xo-cell";
      cell.dataset.index = i;
      cell.addEventListener("click", () => this.handleCellClick(i));
      board.appendChild(cell);
    }
  }

  resetGame() {
    this.board = Array(9).fill(null);
    this.currentPlayer = "X";
    this.gameOver = false;
    this.winner = null;

    // Reset symbols for vs computer mode
    if (this.gameMode === "vs-computer") {
      this.humanSymbol = "X";
      this.computerSymbol = "O";
    }

    this.updateBoard();
    this.updateStatus();
  }

  resetAndCloseXOGame() {
    // Reset the game state
    this.resetGame();

    // Hide game area and show setup
    document.getElementById("xo-game-area").style.display = "none";
    document.getElementById("xo-game-setup").style.display = "block";

    // Reset game setup
    this.resetGameSetup();

    // Close the modal
    document.getElementById("xo-game-modal").style.display = "none";
  }

  handleCellClick(index) {
    if (this.gameOver || this.board[index] !== null) return;

    // In vs computer mode, only allow human (X) to click
    if (
      this.gameMode === "vs-computer" &&
      this.currentPlayer !== this.humanSymbol
    ) {
      return;
    }

    // Make the move
    this.makeMove(index, this.currentPlayer);

    if (this.gameOver) return;

    // Computer's turn (if vs computer mode)
    if (
      this.gameMode === "vs-computer" &&
      this.currentPlayer === this.computerSymbol
    ) {
      setTimeout(() => {
        this.computerMove();
      }, 500);
    }
  }

  makeMove(index, symbol) {
    this.board[index] = symbol;
    this.updateBoard();

    if (this.checkWinner()) {
      this.gameOver = true;
      this.updateStatus();
      return;
    }

    if (this.isBoardFull()) {
      this.gameOver = true;
      this.winner = "draw";
      this.updateStatus();
      return;
    }

    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    this.updateStatus();
  }

  computerMove() {
    if (this.gameOver) return;

    // Simple AI: Try to win, then block, then take center, then take corner, else random
    let move = this.findWinningMove(this.computerSymbol);
    if (move === null) {
      move = this.findWinningMove(this.humanSymbol); // Block opponent
    }
    if (move === null && this.board[4] === null) {
      move = 4; // Take center
    }
    if (move === null) {
      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter((i) => this.board[i] === null);
      if (availableCorners.length > 0) {
        move =
          availableCorners[Math.floor(Math.random() * availableCorners.length)];
      }
    }
    if (move === null) {
      const available = this.board
        .map((cell, index) => (cell === null ? index : null))
        .filter((val) => val !== null);
      move = available[Math.floor(Math.random() * available.length)];
    }

    if (move !== null) {
      this.makeMove(move, this.computerSymbol);
    }
  }

  findWinningMove(symbol) {
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = symbol;
        if (this.checkWinner()) {
          this.board[i] = null;
          return i;
        }
        this.board[i] = null;
      }
    }
    return null;
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.winner = this.board[a];
        return true;
      }
    }
    return false;
  }

  isBoardFull() {
    return this.board.every((cell) => cell !== null);
  }

  updateBoard() {
    const cells = document.querySelectorAll(".xo-cell");
    cells.forEach((cell, index) => {
      const symbol = this.board[index];
      cell.textContent = symbol || "";
      cell.className = "xo-cell";
      if (symbol) {
        cell.classList.add(symbol.toLowerCase());
        cell.classList.add("disabled");
      }
    });
  }

  updateStatus() {
    const statusEl = document.getElementById("xo-game-status");
    const currentPlayerEl = document.getElementById("xo-current-player-name");

    if (this.gameOver) {
      if (this.winner === "draw") {
        statusEl.textContent = "It's a draw!";
        currentPlayerEl.textContent = "Draw";
      } else {
        const winnerName = this.players[this.winner].name;
        statusEl.textContent = `${winnerName} wins!`;
        currentPlayerEl.textContent = winnerName;
      }
    } else {
      const currentPlayerName = this.players[this.currentPlayer].name;
      statusEl.textContent = "";
      currentPlayerEl.textContent = currentPlayerName;
    }
  }
}

// Race Game Class - REMOVED (all code deleted)

// Initialize sound manager globally
let soundManager;

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  soundManager = new SoundManager();
  const game = new ChessGame();
  window.chessGameInstance = game; // Make accessible for language manager
  const xoGame = new XOGame();
  const memoryGame = new MemoryGame();
  const spaceWarGame = new SpaceWarGame();
  const radioPlayer = new RadioPlayer();

  // Update UI texts on initial load
  game.updateAllUITexts();
});
