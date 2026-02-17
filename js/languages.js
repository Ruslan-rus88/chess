// Language translations for the Chess Game
const translations = {
  en: {
    // UI Elements
    title: "♛ Super Roman ♛",
    currentPlayer: "Current Player:",
    white: "White",
    black: "Black",
    newGame: "🎮 New Game",
    settings: "⚙ Settings",
    startGame: "Start Game",
    gameOver: "Game Over",
    wins: "Wins! 🎉",
    checkmate: "Checkmate!",
    check: "Check!",
    stalemate: "Stalemate!",
    
    // Game Modes
    game: "Game",
    lessons: "Lessons",
    mission: "Mission",
    
    // Player Selection
    selectPlayers: "Select Players",
    onePlayerVsPC: "One Player vs PC",
    twoPlayers: "2 Players",
    selectYourSide: "Select Your Side",
    yourPlayer: "Your Player",
    pc: "PC",
    computer: "Computer",
    selectYourPlayer: "Select Your Player",
    selectWhitePlayer: "Select White Player",
    selectBlackPlayer: "Select Black Player",
    vs: "VS",
    
    // Lessons
    chessLessons: "Chess Lessons",
    learnPieceMovements: "Learn Piece Movements",
    selectAPiece: "Select a Piece",
    clearBoard: "Clear Board",
    removeSelectedPiece: "Remove Selected Piece",
    randomBoardFill: "Random Board Fill",
    lessonInstructions1: "1. Select a piece from the options above",
    lessonInstructions2: "2. Click on any square on the board to place the piece",
    lessonInstructions3: "3. Click on the piece to see all available moves",
    lessonPieceSelected: "Great! Now click on the board to place the {piece}.",
    lessonBoardCleared: "Board cleared! Ready to start fresh.",
    lessonRandomPiecesAdded: "Random pieces added! Click on any piece to explore its moves.",
    lessonClickPieceForMoves: "Perfect! Now click on the piece to see its possible moves.",
    welcomeToMissionMode: "Welcome to Mission Mode! Select your player, difficulty, and piece to begin.",
    
    // Mission
    selectPlayerAndPiece: "Select Player and Piece for Mission Mode",
    selectPlayer: "Select Player",
    selectDifficulty: "Select Difficulty",
    selectYourPiece: "Select Your Piece",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    level: "Level",
    startMission: "Start Mission",
    mission: "Mission",
    captureAllOpponentPieces: "Capture all opponent pieces to complete the mission!",
    opponentPiecesRemaining: "Opponent pieces remaining:",
    hint: "💡 Hint",
    resetMission: "🔄 Reset Mission",
    missionCompleted: "Mission Completed!",
    nextMission: "Next Mission",
    backToMenu: "Back to Menu",
    missionFailed: "Mission Failed!",
    timesUp: "Time's up!",
    tryAgain: "Try Again",
    congratulations: "🎉 Congratulations! 🎉",
    completedAllMissions: "You have completed all 10 missions!",
    
    // Settings
    pieceStyle: "Piece Style",
    colorTheme: "Color Theme",
    boardStyle: "Board Style",
    language: "Language",
    classic: "Classic",
    traditional: "Traditional",
    wood: "Wood",
    marble: "Marble",
    neon: "Neon",
    close: "Close",
    
    // Pieces
    king: "King",
    queen: "Queen",
    rook: "Rook",
    bishop: "Bishop",
    knight: "Knight",
    pawn: "Pawn",
    capturedWhitePieces: "Captured White Pieces",
    capturedBlackPieces: "Captured Black Pieces",
    
    // Replay
    replayMode: "Replay Mode",
    previous: "⏮ Previous",
    stop: "⏸ Stop",
    play: "▶ Play",
    next: "Next ⏭",
    move: "Move",
    exitReplay: "Exit Replay",
    replay: "Replay",
    
    // Radio
    radioPlayer: "🎵 Radio Player",
    freeRadioStations: "Free Radio Stations",
    searchRadioStations: "Search radio stations...",
    loadingStations: "Loading stations...",
    nowPlaying: "Now Playing: ",
    
    // More Games
    moreGames: "🎮 More Games",
    xoGame: "XO Game",
    ticTacToe: "Tic-Tac-Toe",
    
    // XO Game
    selectGameMode: "Select Game Mode",
    vsComputer: "VS Computer",
    playerX: "Player X",
    playerO: "Player O",
    selectPlayerX: "Select Player X",
    selectPlayerO: "Select Player O",
    startXOGame: "Start XO Game",
    currentPlayerXO: "Current Player: ",
    newGameXO: "🔄 New Game",
    
    
    // Voice Commands
    voiceCommands: "Voice Commands",
    voiceCommandInstructions: "Say chess moves like 'e2 to e4' or 'pawn e2 to e4'",
    enableVoiceCommands: "Enable Voice Commands",
    
    // Voice command patterns (for recognition)
    voicePatterns: {
      move: ["move", "to", "from"],
      piece: ["pawn", "rook", "knight", "bishop", "queen", "king"],
      squares: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
                "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
                "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
                "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
                "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
                "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
                "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
                "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]
    }
  },
  
  ru: {
    // UI Elements
    title: "♛ Супер Роман ♛",
    currentPlayer: "Текущий игрок:",
    white: "Белые",
    black: "Черные",
    newGame: "🎮 Новая игра",
    settings: "⚙ Настройки",
    startGame: "Начать игру",
    gameOver: "Игра окончена",
    wins: "Победил! 🎉",
    checkmate: "Мат!",
    check: "Шах!",
    stalemate: "Пат!",
    
    // Game Modes
    game: "Игра",
    lessons: "Уроки",
    mission: "Миссия",
    
    // Player Selection
    selectPlayers: "Выберите игроков",
    onePlayerVsPC: "Один игрок против ПК",
    twoPlayers: "2 игрока",
    selectYourSide: "Выберите сторону",
    yourPlayer: "Ваш игрок",
    pc: "ПК",
    computer: "Компьютер",
    selectYourPlayer: "Выберите вашего игрока",
    selectWhitePlayer: "Выберите белого игрока",
    selectBlackPlayer: "Выберите черного игрока",
    vs: "ПРОТИВ",
    
    // Lessons
    chessLessons: "Уроки шахмат",
    learnPieceMovements: "Изучите движения фигур",
    selectAPiece: "Выберите фигуру",
    clearBoard: "Очистить доску",
    removeSelectedPiece: "Удалить выбранную фигуру",
    randomBoardFill: "Случайное заполнение доски",
    lessonInstructions1: "1. Выберите фигуру из вариантов выше",
    lessonInstructions2: "2. Нажмите на любую клетку на доске, чтобы разместить фигуру",
    lessonInstructions3: "3. Нажмите на фигуру, чтобы увидеть все доступные ходы",
    lessonPieceSelected: "Отлично! Теперь нажмите на доску, чтобы разместить {piece}.",
    lessonBoardCleared: "Доска очищена! Готово к новому началу.",
    lessonRandomPiecesAdded: "Случайные фигуры добавлены! Нажмите на любую фигуру, чтобы изучить её ходы.",
    lessonClickPieceForMoves: "Отлично! Теперь нажмите на фигуру, чтобы увидеть её возможные ходы.",
    welcomeToMissionMode: "Добро пожаловать в режим миссий! Выберите игрока, сложность и фигуру, чтобы начать.",
    
    // Mission
    selectPlayerAndPiece: "Выберите игрока и фигуру для режима миссии",
    selectPlayer: "Выберите игрока",
    selectDifficulty: "Выберите сложность",
    selectYourPiece: "Выберите вашу фигуру",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    level: "Уровень",
    startMission: "Начать миссию",
    mission: "Миссия",
    captureAllOpponentPieces: "Захватите все фигуры противника, чтобы выполнить миссию!",
    opponentPiecesRemaining: "Осталось фигур противника:",
    hint: "💡 Подсказка",
    resetMission: "🔄 Сбросить миссию",
    missionCompleted: "Миссия выполнена!",
    nextMission: "Следующая миссия",
    backToMenu: "Вернуться в меню",
    missionFailed: "Миссия провалена!",
    timesUp: "Время вышло!",
    tryAgain: "Попробовать снова",
    congratulations: "🎉 Поздравляем! 🎉",
    completedAllMissions: "Вы выполнили все 10 миссий!",
    
    // Settings
    pieceStyle: "Стиль фигур",
    colorTheme: "Цветовая тема",
    boardStyle: "Стиль доски",
    language: "Язык",
    classic: "Классический",
    traditional: "Традиционный",
    wood: "Дерево",
    marble: "Мрамор",
    neon: "Неон",
    close: "Закрыть",
    
    // Pieces
    king: "Король",
    queen: "Ферзь",
    rook: "Ладья",
    bishop: "Слон",
    knight: "Конь",
    pawn: "Пешка",
    capturedWhitePieces: "Захваченные белые фигуры",
    capturedBlackPieces: "Захваченные черные фигуры",
    
    // Replay
    replayMode: "Режим повтора",
    previous: "⏮ Назад",
    stop: "⏸ Стоп",
    play: "▶ Играть",
    next: "Вперед ⏭",
    move: "Ход",
    exitReplay: "Выйти из повтора",
    replay: "Повтор",
    
    // Radio
    radioPlayer: "🎵 Радио плеер",
    freeRadioStations: "Бесплатные радиостанции",
    searchRadioStations: "Поиск радиостанций...",
    loadingStations: "Загрузка станций...",
    nowPlaying: "Сейчас играет: ",
    
    // More Games
    moreGames: "🎮 Больше игр",
    xoGame: "Крестики-нолики",
    ticTacToe: "Крестики-нолики",
    // XO Game
    selectGameMode: "Выберите режим игры",
    vsComputer: "Против компьютера",
    playerX: "Игрок X",
    playerO: "Игрок O",
    selectPlayerX: "Выберите игрока X",
    selectPlayerO: "Выберите игрока O",
    startXOGame: "Начать игру в крестики-нолики",
    currentPlayerXO: "Текущий игрок: ",
    newGameXO: "🔄 Новая игра",
    
    // Voice Commands
    voiceCommands: "Голосовые команды",
    voiceCommandInstructions: "Говорите ходы как 'e2 на e4' или 'пешка e2 на e4'",
    enableVoiceCommands: "Включить голосовые команды",
    
    // Voice command patterns (for recognition)
    voicePatterns: {
      move: ["ход", "на", "из"],
      piece: ["пешка", "ладья", "конь", "слон", "ферзь", "король"],
      squares: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
                "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
                "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
                "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
                "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
                "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
                "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
                "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]
    }
  },
  
  es: {
    // UI Elements
    title: "♛ Super Roman ♛",
    currentPlayer: "Jugador actual:",
    white: "Blanco",
    black: "Negro",
    newGame: "🎮 Nuevo juego",
    settings: "⚙ Configuración",
    startGame: "Iniciar juego",
    gameOver: "Juego terminado",
    wins: "¡Gana! 🎉",
    checkmate: "¡Jaque mate!",
    check: "¡Jaque!",
    stalemate: "¡Ahogado!",
    
    // Game Modes
    game: "Juego",
    lessons: "Lecciones",
    mission: "Misión",
    
    // Player Selection
    selectPlayers: "Seleccionar jugadores",
    onePlayerVsPC: "Un jugador vs PC",
    twoPlayers: "2 jugadores",
    selectYourSide: "Selecciona tu lado",
    yourPlayer: "Tu jugador",
    pc: "PC",
    computer: "Computadora",
    selectYourPlayer: "Selecciona tu jugador",
    selectWhitePlayer: "Selecciona jugador blanco",
    selectBlackPlayer: "Selecciona jugador negro",
    vs: "VS",
    
    // Lessons
    chessLessons: "Lecciones de ajedrez",
    learnPieceMovements: "Aprende movimientos de piezas",
    selectAPiece: "Selecciona una pieza",
    clearBoard: "Limpiar tablero",
    removeSelectedPiece: "Eliminar pieza seleccionada",
    randomBoardFill: "Llenar tablero aleatorio",
    lessonInstructions1: "1. Selecciona una pieza de las opciones arriba",
    lessonInstructions2: "2. Haz clic en cualquier casilla del tablero para colocar la pieza",
    lessonInstructions3: "3. Haz clic en la pieza para ver todos los movimientos disponibles",
    lessonPieceSelected: "¡Genial! Ahora haz clic en el tablero para colocar el {piece}.",
    lessonBoardCleared: "¡Tablero limpiado! Listo para empezar de nuevo.",
    lessonRandomPiecesAdded: "¡Piezas aleatorias agregadas! Haz clic en cualquier pieza para explorar sus movimientos.",
    lessonClickPieceForMoves: "¡Perfecto! Ahora haz clic en la pieza para ver sus movimientos posibles.",
    welcomeToMissionMode: "¡Bienvenido al Modo Misión! Selecciona tu jugador, dificultad y pieza para comenzar.",
    
    // Mission
    selectPlayerAndPiece: "Selecciona jugador y pieza para modo misión",
    selectPlayer: "Selecciona jugador",
    selectDifficulty: "Selecciona dificultad",
    selectYourPiece: "Selecciona tu pieza",
    easy: "Fácil",
    medium: "Medio",
    hard: "Difícil",
    level: "Nivel",
    startMission: "Iniciar misión",
    mission: "Misión",
    captureAllOpponentPieces: "¡Captura todas las piezas del oponente para completar la misión!",
    opponentPiecesRemaining: "Piezas del oponente restantes:",
    hint: "💡 Pista",
    resetMission: "🔄 Reiniciar misión",
    missionCompleted: "¡Misión completada!",
    nextMission: "Siguiente misión",
    backToMenu: "Volver al menú",
    missionFailed: "¡Misión fallida!",
    timesUp: "¡Se acabó el tiempo!",
    tryAgain: "Intentar de nuevo",
    congratulations: "🎉 ¡Felicidades! 🎉",
    completedAllMissions: "¡Has completado las 10 misiones!",
    
    // Settings
    pieceStyle: "Estilo de piezas",
    colorTheme: "Tema de color",
    boardStyle: "Estilo de tablero",
    language: "Idioma",
    classic: "Clásico",
    traditional: "Tradicional",
    wood: "Madera",
    marble: "Mármol",
    neon: "Neón",
    close: "Cerrar",
    
    // Pieces
    king: "Rey",
    queen: "Reina",
    rook: "Torre",
    bishop: "Alfil",
    knight: "Caballo",
    pawn: "Peón",
    capturedWhitePieces: "Piezas blancas capturadas",
    capturedBlackPieces: "Piezas negras capturadas",
    
    // Replay
    replayMode: "Modo repetición",
    previous: "⏮ Anterior",
    stop: "⏸ Detener",
    play: "▶ Reproducir",
    next: "Siguiente ⏭",
    move: "Movimiento",
    exitReplay: "Salir de repetición",
    replay: "Repetición",
    
    // Radio
    radioPlayer: "🎵 Reproductor de radio",
    freeRadioStations: "Estaciones de radio gratuitas",
    searchRadioStations: "Buscar estaciones de radio...",
    loadingStations: "Cargando estaciones...",
    nowPlaying: "Reproduciendo: ",
    
    // More Games
    moreGames: "🎮 Más juegos",
    xoGame: "Juego XO",
    ticTacToe: "Tres en raya",
    // XO Game
    selectGameMode: "Selecciona modo de juego",
    vsComputer: "VS Computadora",
    playerX: "Jugador X",
    playerO: "Jugador O",
    selectPlayerX: "Selecciona jugador X",
    selectPlayerO: "Selecciona jugador O",
    startXOGame: "Iniciar juego XO",
    currentPlayerXO: "Jugador actual: ",
    newGameXO: "🔄 Nuevo juego",
    
    // Voice Commands
    voiceCommands: "Comandos de voz",
    voiceCommandInstructions: "Di movimientos como 'e2 a e4' o 'peón e2 a e4'",
    enableVoiceCommands: "Habilitar comandos de voz",
    
    // Voice command patterns (for recognition)
    voicePatterns: {
      move: ["mover", "a", "desde"],
      piece: ["peón", "torre", "caballo", "alfil", "reina", "rey"],
      squares: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
                "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
                "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
                "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
                "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
                "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
                "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
                "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]
    }
  },
  
  ar: {
    // UI Elements
    title: "♛ سوبر رومان ♛",
    currentPlayer: "اللاعب الحالي:",
    white: "أبيض",
    black: "أسود",
    newGame: "🎮 لعبة جديدة",
    settings: "⚙ الإعدادات",
    startGame: "بدء اللعبة",
    gameOver: "انتهت اللعبة",
    wins: "يفوز! 🎉",
    checkmate: "كش ملك!",
    check: "كش!",
    stalemate: "تعادل!",
    
    // Game Modes
    game: "لعبة",
    lessons: "دروس",
    mission: "مهمة",
    
    // Player Selection
    selectPlayers: "اختر اللاعبين",
    onePlayerVsPC: "لاعب واحد ضد الكمبيوتر",
    twoPlayers: "لاعبان",
    selectYourSide: "اختر جانبك",
    yourPlayer: "لاعبك",
    pc: "كمبيوتر",
    computer: "كمبيوتر",
    selectYourPlayer: "اختر لاعبك",
    selectWhitePlayer: "اختر اللاعب الأبيض",
    selectBlackPlayer: "اختر اللاعب الأسود",
    vs: "ضد",
    
    // Lessons
    chessLessons: "دروس الشطرنج",
    learnPieceMovements: "تعلم حركات القطع",
    selectAPiece: "اختر قطعة",
    clearBoard: "مسح اللوحة",
    removeSelectedPiece: "إزالة القطعة المحددة",
    randomBoardFill: "ملء عشوائي للوحة",
    lessonInstructions1: "1. اختر قطعة من الخيارات أعلاه",
    lessonInstructions2: "2. انقر على أي مربع على اللوحة لوضع القطعة",
    lessonInstructions3: "3. انقر على القطعة لرؤية جميع الحركات المتاحة",
    lessonPieceSelected: "رائع! الآن انقر على اللوحة لوضع {piece}.",
    lessonBoardCleared: "تم مسح اللوحة! جاهز للبدء من جديد.",
    lessonRandomPiecesAdded: "تمت إضافة قطع عشوائية! انقر على أي قطعة لاستكشاف حركاتها.",
    lessonClickPieceForMoves: "ممتاز! الآن انقر على القطعة لرؤية حركاتها المحتملة.",
    welcomeToMissionMode: "مرحباً بك في وضع المهمة! اختر لاعبك وصعوبتك وقطعتك للبدء.",
    
    // Mission
    selectPlayerAndPiece: "اختر اللاعب والقطعة لوضع المهمة",
    selectPlayer: "اختر اللاعب",
    selectDifficulty: "اختر الصعوبة",
    selectYourPiece: "اختر قطعتك",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    level: "المستوى",
    startMission: "بدء المهمة",
    mission: "مهمة",
    captureAllOpponentPieces: "التقط جميع قطع الخصم لإكمال المهمة!",
    opponentPiecesRemaining: "قطع الخصم المتبقية:",
    hint: "💡 تلميح",
    resetMission: "🔄 إعادة تعيين المهمة",
    missionCompleted: "اكتملت المهمة!",
    nextMission: "المهمة التالية",
    backToMenu: "العودة إلى القائمة",
    missionFailed: "فشلت المهمة!",
    timesUp: "انتهى الوقت!",
    tryAgain: "حاول مرة أخرى",
    congratulations: "🎉 تهانينا! 🎉",
    completedAllMissions: "لقد أكملت جميع المهام العشر!",
    
    // Settings
    pieceStyle: "نمط القطع",
    colorTheme: "المظهر اللوني",
    boardStyle: "نمط اللوحة",
    language: "اللغة",
    classic: "كلاسيكي",
    traditional: "تقليدي",
    wood: "خشب",
    marble: "رخام",
    neon: "نيون",
    close: "إغلاق",
    
    // Pieces
    king: "ملك",
    queen: "ملكة",
    rook: "قلعة",
    bishop: "فيل",
    knight: "حصان",
    pawn: "بيدق",
    capturedWhitePieces: "القطع البيضاء المأسورة",
    capturedBlackPieces: "القطع السوداء المأسورة",
    
    // Replay
    replayMode: "وضع إعادة التشغيل",
    previous: "⏮ السابق",
    stop: "⏸ إيقاف",
    play: "▶ تشغيل",
    next: "التالي ⏭",
    move: "نقلة",
    exitReplay: "خروج من إعادة التشغيل",
    replay: "إعادة تشغيل",
    
    // Radio
    radioPlayer: "🎵 مشغل الراديو",
    freeRadioStations: "محطات راديو مجانية",
    searchRadioStations: "البحث عن محطات الراديو...",
    loadingStations: "جاري تحميل المحطات...",
    nowPlaying: "يعمل الآن: ",
    
    // More Games
    moreGames: "🎮 المزيد من الألعاب",
    xoGame: "لعبة XO",
    ticTacToe: "تيك تاك تو",
    // XO Game
    selectGameMode: "اختر وضع اللعبة",
    vsComputer: "ضد الكمبيوتر",
    playerX: "اللاعب X",
    playerO: "اللاعب O",
    selectPlayerX: "اختر اللاعب X",
    selectPlayerO: "اختر اللاعب O",
    startXOGame: "بدء لعبة XO",
    currentPlayerXO: "اللاعب الحالي: ",
    newGameXO: "🔄 لعبة جديدة",
    
    // Voice Commands
    voiceCommands: "الأوامر الصوتية",
    voiceCommandInstructions: "قل الحركات مثل 'e2 إلى e4' أو 'بيدق e2 إلى e4'",
    enableVoiceCommands: "تفعيل الأوامر الصوتية",
    
    // Voice command patterns (for recognition)
    voicePatterns: {
      move: ["نقل", "إلى", "من"],
      piece: ["بيدق", "قلعة", "حصان", "فيل", "ملكة", "ملك"],
      squares: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
                "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
                "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
                "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
                "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
                "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
                "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
                "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"]
    }
  }
};

// Language Manager Class
class LanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('chessLanguage') || 'en';
    this.translations = translations;
    this.updateHTMLDir();
  }

  get(key) {
    const translation = this.translations[this.currentLanguage];
    if (!translation) {
      console.warn(`Translation not found for key: ${key} in language: ${this.currentLanguage}`);
      return this.translations['en'][key] || key;
    }
    return translation[key] || this.translations['en'][key] || key;
  }

  setLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`Language ${lang} not supported`);
      return;
    }
    this.currentLanguage = lang;
    localStorage.setItem('chessLanguage', lang);
    this.updateHTMLDir();
    this.updateAllTexts();
  }

  updateHTMLDir() {
    // Set RTL for Arabic
    if (this.currentLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', this.currentLanguage);
    }
  }

  updateAllTexts() {
    // This will be called by the main game class to update all UI texts
    if (window.chessGameInstance) {
      window.chessGameInstance.updateUITexts();
    }
  }

  getVoicePatterns() {
    return this.translations[this.currentLanguage].voicePatterns || this.translations['en'].voicePatterns;
  }

  getLanguageCode() {
    return this.currentLanguage;
  }
}

// Create global language manager instance
const languageManager = new LanguageManager();
