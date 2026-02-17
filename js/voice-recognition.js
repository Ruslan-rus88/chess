// Voice Recognition Manager for Chess Moves
class VoiceRecognitionManager {
  constructor(chessGame) {
    this.chessGame = chessGame;
    this.recognition = null;
    this.isListening = false;
    this.enabled = false;
    this.initializeRecognition();
  }

  initializeRecognition() {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    // Set language based on current language setting
    this.updateLanguage();
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Voice command received:', transcript);
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart listening if no speech detected
        if (this.enabled && this.isListening) {
          setTimeout(() => {
            if (this.enabled && this.isListening) {
              this.startListening();
            }
          }, 1000);
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Restart listening if still enabled
      if (this.enabled) {
        setTimeout(() => {
          if (this.enabled) {
            this.startListening();
          }
        }, 500);
      }
    };
  }

  updateLanguage() {
    if (!this.recognition) return;
    
    const langCode = languageManager.getLanguageCode();
    const languageMap = {
      'en': 'en-US',
      'ru': 'ru-RU',
      'es': 'es-ES',
      'ar': 'ar-SA'
    };
    
    this.recognition.lang = languageMap[langCode] || 'en-US';
  }

  enable() {
    if (!this.recognition) {
      alert(languageManager.get('voiceCommands') + ': ' + 
            'Speech recognition is not supported in your browser.');
      return false;
    }
    
    this.enabled = true;
    this.updateLanguage();
    this.startListening();
    return true;
  }

  disable() {
    this.enabled = false;
    this.stopListening();
  }

  startListening() {
    if (!this.recognition || this.isListening || !this.enabled) return;
    
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      // Recognition might already be started
      if (error.name !== 'InvalidStateError') {
        console.error('Error starting recognition:', error);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      this.isListening = false;
    }
  }

  processVoiceCommand(transcript) {
    if (!this.chessGame || !this.chessGame.gameStarted || this.chessGame.gameOver) {
      return;
    }

    // Skip if it's PC's turn in one-player mode
    if (this.chessGame.gameMode === "one-player" &&
        this.chessGame.players[this.chessGame.currentPlayer].name === "PC") {
      return;
    }

    const patterns = languageManager.getVoicePatterns();
    const lang = languageManager.getLanguageCode();
    
    // Parse the move command
    let move = this.parseMove(transcript, patterns, lang);
    
    if (move) {
      this.executeMove(move);
    }
  }

  parseMove(transcript, patterns, lang) {
    // Remove extra spaces and normalize
    transcript = transcript.replace(/\s+/g, ' ').trim();
    
    // Pattern 1: "e2 to e4" or "e2 на e4" (from square to square)
    const simpleMovePattern = /([a-h][1-8])\s*(?:to|на|a|إلى|من)\s*([a-h][1-8])/i;
    let match = transcript.match(simpleMovePattern);
    
    if (match) {
      const from = this.squareToCoords(match[1]);
      const to = this.squareToCoords(match[2]);
      if (from && to) {
        return { from, to, piece: null };
      }
    }

    // Pattern 2: "pawn e2 to e4" or "пешка e2 на e4" (piece from square to square)
    const pieceNames = patterns.piece;
    for (let i = 0; i < pieceNames.length; i++) {
      const pieceName = pieceNames[i];
      const pieceType = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'][i];
      
      // Create pattern for this piece
      const piecePattern = new RegExp(
        `${pieceName}\\s+([a-h][1-8])\\s*(?:to|на|a|إلى|من)\\s*([a-h][1-8])`,
        'i'
      );
      
      match = transcript.match(piecePattern);
      if (match) {
        const from = this.squareToCoords(match[1]);
        const to = this.squareToCoords(match[2]);
        if (from && to) {
          return { from, to, piece: pieceType };
        }
      }
    }

    // Pattern 3: Just two squares "e2 e4"
    const twoSquaresPattern = /([a-h][1-8])\s+([a-h][1-8])/i;
    match = transcript.match(twoSquaresPattern);
    if (match) {
      const from = this.squareToCoords(match[1]);
      const to = this.squareToCoords(match[2]);
      if (from && to) {
        return { from, to, piece: null };
      }
    }

    return null;
  }

  squareToCoords(square) {
    if (!square || square.length !== 2) return null;
    
    const file = square[0].toLowerCase();
    const rank = parseInt(square[1]);
    
    if (file < 'a' || file > 'h' || rank < 1 || rank > 8) {
      return null;
    }
    
    // Convert to board coordinates (0-7)
    const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - rank; // Board is inverted (rank 8 is row 0)
    
    return { row, col };
  }

  executeMove(move) {
    if (!this.chessGame || !move) return;

    const { from, to, piece } = move;
    
    // If piece type is specified, verify the piece at from square matches
    if (piece) {
      const boardPiece = this.chessGame.board[from.row][from.col];
      if (!boardPiece || boardPiece.type !== piece) {
        console.log('Piece type mismatch');
        return;
      }
    }

    // Check if there's a piece at the from square
    const boardPiece = this.chessGame.board[from.row][from.col];
    if (!boardPiece) {
      console.log('No piece at source square');
      return;
    }

    // Check if it's the current player's piece
    if (boardPiece.color !== this.chessGame.currentPlayer) {
      console.log('Not your piece');
      return;
    }

    // Check if move is valid
    if (this.chessGame.isValidMove(from.row, from.col, to.row, to.col)) {
      // Execute the move
      this.chessGame.makeMove(from.row, from.col, to.row, to.col);
      this.chessGame.deselectSquare();
      this.chessGame.switchPlayer();
      this.chessGame.checkGameState();
      
      // Visual feedback
      console.log(`Move executed: ${this.coordsToSquare(from)} to ${this.coordsToSquare(to)}`);
    } else {
      console.log('Invalid move');
    }
  }

  coordsToSquare(coords) {
    const file = String.fromCharCode('a'.charCodeAt(0) + coords.col);
    const rank = 8 - coords.row;
    return file + rank;
  }
}
