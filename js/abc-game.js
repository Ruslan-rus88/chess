// ═══════════════════════════════════════════════════════════════
//  ABC GAME  –  Letter Combination Quiz
// ═══════════════════════════════════════════════════════════════
class ABCGame {
  constructor() {
    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem("abc_best") || "0");
    this.currentQuestion = null;
    this.answering = false; // guard against double-click during animation
    this.ac = null;
    this.difficulty = "easy"; // easy | medium | hard
    this.language = "en"; // en | de

    // Word lists for medium (4-letter) and hard (5+ letter) difficulties
    this.MEDIUM_WORDS_EN = [
      "BALL", "BEAR", "BIRD", "BLUE", "BOAT", "BOOK", "CAKE", "CALM", "CARD",
      "CARE", "CITY", "COLD", "COME", "COOK", "COOL", "DARK", "DAWN", "DEAR",
      "DEEP", "DEER", "DOOR", "DOWN", "DRAW", "DROP", "DRUM", "DUST", "EACH",
      "EARN", "EAST", "EASY", "EDGE", "FACE", "FACT", "FAIR", "FALL", "FARM",
      "FAST", "FEAR", "FEEL", "FILL", "FIND", "FINE", "FIRE", "FISH", "FLAG",
      "FLAT", "FLOW", "FOOD", "FOOT", "FORK", "FORM", "FOUR", "FREE", "FROM",
      "FULL", "GAME", "GATE", "GIFT", "GIRL", "GIVE", "GLAD", "GLOW", "GOAT",
      "GOLD", "GOLF", "GONE", "GOOD", "GRAY", "GROW", "GULF", "HAIR", "HALF",
      "HALL", "HAND", "HANG", "HARD", "HARM", "HATE", "HAVE", "HEAD", "HEAR",
      "HEAT", "HELP", "HERE", "HERO", "HIGH", "HILL", "HINT", "HOLD", "HOLE",
      "HOME", "HOPE", "HOUR", "HUGE", "HUNT", "HURT", "IDEA", "IRON", "ITEM",
      "JACK", "JAZZ", "JOBS", "JOIN", "JOKE", "JUMP", "JUNE", "JUST", "KEEN",
      "KEEP", "KICK", "KIND", "KING", "KISS", "KNEE", "KNOT", "KNOW", "LACK",
      "LAKE", "LAMP", "LAND", "LANE", "LAST", "LATE", "LEAD", "LEAF", "LEFT",
      "LEND", "LESS", "LIFE", "LIFT", "LIKE", "LINE", "LINK", "LION", "LIST",
      "LIVE", "LOCK", "LONG", "LOOK", "LORD", "LOSE", "LOST", "LOVE", "LUCK",
      "MADE", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARK", "MASS", "MATH",
      "MEAL", "MEAN", "MEAT", "MEET", "MILE", "MILK", "MIND", "MINE", "MISS",
      "MODE", "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME",
      "NAVY", "NEAR", "NEAT", "NECK", "NEED", "NEWS", "NEXT", "NICE", "NINE",
      "NODE", "NONE", "NOON", "NOSE", "NOTE", "NOUN", "ODDS", "OKAY", "ONCE",
      "ONLY", "ONTO", "OPEN", "ORAL", "OVEN", "OVER", "PACE", "PACK", "PAGE",
      "PAID", "PAIN", "PAIR", "PALE", "PALM", "PARK", "PART", "PASS", "PAST",
      "PATH", "PEAK", "PICK", "PINE", "PINK", "PIPE", "PLAN", "PLAY", "PLOT",
      "PLUG", "PLUS", "POEM", "POET", "POLL", "POND", "POOL", "POOR", "PORT",
      "POUR", "PRAY", "PULL", "PUMP", "PURE", "PUSH", "QUIT", "RACE", "RAGE",
      "RAIN", "RANK", "RARE", "RATE", "READ", "REAL", "REAR", "RELY", "RENT",
      "REST", "RICE", "RICH", "RIDE", "RING", "RISE", "RISK", "ROAD", "ROCK",
      "ROLE", "ROLL", "ROOF", "ROOM", "ROOT", "ROPE", "ROSE", "RULE", "RUSH",
      "SAFE", "SAID", "SAIL", "SAKE", "SALE", "SALT", "SAME", "SAND", "SANG",
      "SAVE", "SEAL", "SEAT", "SEED", "SEEK", "SEEM", "SEEN", "SELF", "SELL",
      "SEND", "SHIP", "SHOP", "SHOT", "SHOW", "SHUT", "SICK", "SIDE", "SIGN",
      "SILK", "SING", "SINK", "SIZE", "SKIN", "SLIM", "SLIP", "SLOW", "SNAP",
      "SNOW", "SOAP", "SOCK", "SOFT", "SOIL", "SOLD", "SOLE", "SOME", "SONG",
      "SOON", "SORT", "SOUL", "SOUR", "SPIN", "SPOT", "STAR", "STAY", "STEM",
      "STEP", "STOP", "SUCH", "SUIT", "SURE", "SWIM", "TAIL", "TAKE", "TALE",
      "TALK", "TALL", "TANK", "TAPE", "TASK", "TEAM", "TEAR", "TELL", "TEND",
      "TENT", "TERM", "TEST", "TEXT", "THAN", "THAT", "THEM", "THEN", "THEY",
      "THIN", "THIS", "THUS", "TIDE", "TIDY", "TILL", "TIME", "TINY", "TIRE",
      "TOLD", "TOLL", "TONE", "TOOK", "TOOL", "TOPS", "TOSS", "TOUR", "TOWN",
      "TRAP", "TREE", "TRIM", "TRIP", "TRUE", "TUBE", "TUNA", "TUNE", "TURN",
      "TWIN", "TYPE", "UGLY", "UNDO", "UNIT", "UPON", "URGE", "USED", "USER",
      "VALE", "VARY", "VAST", "VERB", "VERY", "VIEW", "VINE", "VOID", "VOTE",
      "WADE", "WAGE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARD", "WARM",
      "WARN", "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WELL", "WENT", "WERE",
      "WEST", "WHAT", "WHEN", "WHOM", "WIDE", "WIFE", "WILD", "WILL", "WIND",
      "WINE", "WING", "WIRE", "WISE", "WISH", "WITH", "WOOD", "WORD", "WORE",
      "WORK", "WORM", "WORN", "WRAP", "YARD", "YEAR", "YOUR", "ZERO", "ZONE",
    ];

    this.HARD_WORDS_EN = [
      "ABOUT", "ABOVE", "AFTER", "AGAIN", "ALIVE", "ALONE", "ALONG", "ANGEL",
      "ANGLE", "APPLE", "ARENA", "BEACH", "BEGIN", "BLACK", "BLANK", "BLAST",
      "BLAZE", "BLEND", "BLESS", "BLIND", "BLOCK", "BLOOM", "BOARD", "BONUS",
      "BRAIN", "BRAVE", "BREAD", "BREAK", "BREED", "BRICK", "BRIEF", "BRING",
      "BROAD", "BROWN", "BRUSH", "BUILD", "BURST", "CABIN", "CARRY", "CATCH",
      "CAUSE", "CHAIN", "CHAIR", "CHARM", "CHASE", "CHEAP", "CHECK", "CHESS",
      "CHIEF", "CHILD", "CHINA", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLIMB",
      "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "CORAL", "COUNT",
      "COURT", "COVER", "CRACK", "CRAFT", "CRASH", "CRAZY", "CREAM", "CRIME",
      "CROSS", "CROWD", "CROWN", "CRUSH", "CURVE", "CYCLE", "DAILY", "DANCE",
      "DEATH", "DELAY", "DEPTH", "DEVIL", "DIRTY", "DOUBT", "DRAFT", "DRAIN",
      "DRAMA", "DREAM", "DRESS", "DRIFT", "DRINK", "DRIVE", "EAGER", "EARLY",
      "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "EQUAL",
      "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAINT", "FAITH",
      "FALSE", "FANCY", "FAULT", "FEAST", "FETCH", "FEVER", "FIELD", "FIFTY",
      "FIGHT", "FINAL", "FLAME", "FLASH", "FLEET", "FLESH", "FLOAT", "FLOOD",
      "FLOOR", "FLOUR", "FOCUS", "FORCE", "FORGE", "FOUND", "FRAME", "FRANK",
      "FRESH", "FRONT", "FROST", "FRUIT", "GHOST", "GIANT", "GIVEN", "GLASS",
      "GLOBE", "GLORY", "GRACE", "GRADE", "GRAIN", "GRAND", "GRANT", "GRAPE",
      "GRASP", "GRASS", "GRAVE", "GREAT", "GREEN", "GREET", "GROSS", "GROUP",
      "GROVE", "GROWN", "GUARD", "GUESS", "GUIDE", "GUILT", "HAPPY", "HARSH",
      "HAVEN", "HEART", "HEAVY", "HENCE", "HONEY", "HONOR", "HORSE", "HOTEL",
      "HOUSE", "HUMAN", "HUMOR", "HURRY", "IMAGE", "IMPLY", "INDEX", "INNER",
      "INPUT", "IRONY", "ISSUE", "IVORY", "JEWEL", "JOINT", "JUDGE", "JUICE",
      "KNIFE", "KNOCK", "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH",
      "LAYER", "LEARN", "LEAST", "LEAVE", "LEGAL", "LEMON", "LEVEL", "LIGHT",
      "LIMIT", "LINEN", "LIVER", "LOCAL", "LOOSE", "LOVER", "LOWER", "LUCKY",
      "LUNCH", "MAGIC", "MAJOR", "MAKER", "MANOR", "MAPLE", "MARCH", "MATCH",
      "MAYOR", "MEDIA", "MERCY", "MERIT", "METAL", "MIGHT", "MINOR", "MINUS",
      "MIXED", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE",
      "MOUTH", "MOVIE", "MUSIC", "NERVE", "NEVER", "NIGHT", "NOBLE", "NOISE",
      "NORTH", "NOTED", "NOVEL", "NURSE", "OCEAN", "OFFER", "OFTEN", "OLIVE",
      "ONSET", "OPERA", "ORDER", "OTHER", "OUTER", "OWNER", "OXIDE", "PAINT",
      "PANEL", "PANIC", "PAPER", "PARTY", "PASTA", "PATCH", "PAUSE", "PEACE",
      "PEACH", "PEARL", "PENNY", "PHASE", "PHONE", "PHOTO", "PIANO", "PIECE",
      "PILOT", "PITCH", "PIXEL", "PIZZA", "PLACE", "PLAIN", "PLANE", "PLANT",
      "PLATE", "PLAZA", "PLEAD", "POINT", "POLAR", "POUND", "POWER", "PRESS",
      "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD",
      "PROVE", "PSALM", "PUNCH", "PUPIL", "QUEEN", "QUEST", "QUEUE", "QUICK",
      "QUIET", "QUOTE", "RADAR", "RADIO", "RAISE", "RANCH", "RANGE", "RAPID",
      "RATIO", "REACH", "REACT", "READY", "REALM", "REBEL", "REIGN", "RELAX",
      "REPLY", "RIDER", "RIGHT", "RIGID", "RIVAL", "RIVER", "ROBIN", "ROBOT",
      "ROCKY", "ROMAN", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RUGBY", "RULER",
      "RURAL", "SAINT", "SALAD", "SAUCE", "SCALE", "SCARE", "SCENE", "SCOPE",
      "SCORE", "SENSE", "SERVE", "SEVEN", "SHADE", "SHALL", "SHAME", "SHAPE",
      "SHARE", "SHARK", "SHARP", "SHEEP", "SHEER", "SHELF", "SHELL", "SHIFT",
      "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOUT", "SIGHT", "SINCE",
      "SIXTH", "SIXTY", "SKILL", "SKULL", "SLASH", "SLAVE", "SLEEP", "SLICE",
      "SLIDE", "SMART", "SMELL", "SMILE", "SMOKE", "SNACK", "SOLAR", "SOLID",
      "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED",
      "SPEND", "SPICE", "SPITE", "SPLIT", "SPOKE", "SPOON", "SPORT", "SPRAY",
      "SQUAD", "STACK", "STAFF", "STAGE", "STAIR", "STAKE", "STALE", "STAND",
      "STARE", "START", "STATE", "STEAM", "STEEL", "STEEP", "STEER", "STICK",
      "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STOVE",
      "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUNNY",
      "SUPER", "SURGE", "SWAMP", "SWEAR", "SWEET", "SWEPT", "SWIFT", "SWING",
      "SWORD", "TABLE", "TASTE", "TEACH", "TEETH", "THANK", "THEME", "THERE",
      "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THROW", "THUMB",
      "TIGER", "TIGHT", "TIMER", "TIRED", "TITLE", "TODAY", "TOKEN", "TOTAL",
      "TOUCH", "TOUGH", "TOWER", "TOXIC", "TRACE", "TRACK", "TRADE", "TRAIL",
      "TRAIN", "TRAIT", "TRASH", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK",
      "TROOP", "TRUCK", "TRULY", "TRUMP", "TRUNK", "TRUST", "TRUTH", "TWICE",
      "TWIST", "ULTRA", "UNCLE", "UNDER", "UNION", "UNITE", "UNITY", "UNTIL",
      "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "UTTER", "VALID", "VALUE",
      "VAULT", "VIDEO", "VIGOR", "VIRUS", "VISIT", "VITAL", "VIVID", "VOCAL",
      "VOICE", "VOTER", "WAGON", "WASTE", "WATCH", "WATER", "WEAVE", "WEIGH",
      "WEIRD", "WHALE", "WHEAT", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE",
      "WHOLE", "WHOSE", "WOMAN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH",
      "WOULD", "WOUND", "WRITE", "WRONG", "WROTE", "YIELD", "YOUNG", "YOUTH",
    ];

    // German word lists
    this.MEDIUM_WORDS_DE = [
      "BALL", "BAUM", "BEIN", "BERG", "BETT", "BILD", "BLAU", "BROT", "BUCH",
      "BURG", "DACH", "DAME", "DORF", "DUMM", "ECHT", "ERDE", "ESEL", "FALL",
      "FANG", "FARN", "FASS", "FELD", "FELS", "FEST", "FILM", "FINK", "FORM",
      "FREI", "GANZ", "GAST", "GELD", "GELB", "GLAS", "GOLD", "GRAS", "GRAU",
      "GURT", "HAAR", "HAHN", "HALB", "HALT", "HAND", "HART", "HAUS", "HAUT",
      "HEFT", "HELD", "HELL", "HEMD", "HERR", "HERZ", "HIER", "HILF", "HIRN",
      "HOLZ", "HORN", "HOSE", "HUND", "IGEL", "JAGD", "JUNG", "KALT", "KAMM",
      "KEIN", "KERN", "KIND", "KLAR", "KNIE", "KOCH", "KOPF", "KORN", "KRUG",
      "KURS", "KURZ", "LACK", "LAMM", "LAND", "LANG", "LAUT", "LEER", "LEID",
      "LEIM", "LIED", "LOCH", "LUFT", "MAHL", "MAIS", "MANN", "MAUS", "MEER",
      "MOND", "MOOS", "MORD", "MULL", "MUND", "NASS", "NEIN", "NEST", "NETZ",
      "NORD", "OBST", "OFEN", "PAAR", "PARK", "PELZ", "PFAD", "PILZ", "PLAN",
      "RAND", "RAUM", "RAUS", "REBE", "RECK", "REHE", "REIS", "RING", "ROCK",
      "ROHR", "ROSE", "ROST", "RUND", "RUHE", "SAAL", "SACK", "SAFT", "SALZ",
      "SAND", "SATT", "SEIL", "SEIN", "SOHN", "STAR", "STIL", "TANZ", "TIER",
      "TOPF", "TURM", "VOLL", "WALD", "WAND", "WARM", "WEIN", "WELT", "WERK",
      "WILD", "WIND", "WOHL", "WOLF", "WORT", "WURM", "ZAHL", "ZAUN", "ZEIT",
      "ZELT", "ZIEL",
    ];

    this.HARD_WORDS_DE = [
      "ABEND", "ADLER", "AFFEN", "ALLES", "AMPEL", "ANGST", "APFEL", "ARBEIT",
      "AUGEN", "BACKE", "BAUER", "BAUEN", "BIRNE", "BLATT", "BLICK", "BLUME",
      "BLITZ", "BOHNE", "BRAUN", "BREIT", "BRIEF", "BRISE", "BRUDER", "BRUCH",
      "DAMPF", "DECKE", "DENKE", "DRAHT", "DRECK", "DUNKEL", "EICHE", "EIMER",
      "EISEN", "ELTERN", "ENGEL", "ENTEN", "ERNTE", "FAHNE", "FARBE", "FEDER",
      "FEIER", "FEIND", "FEUER", "FISCH", "FLECK", "FLUSS", "FUCHS", "GABEL",
      "GARTEN", "GEIST", "GIPFEL", "GLOCKE", "GRENZE", "GRIFF", "GROSS",
      "GRUND", "GURKE", "HAFEN", "HAKEN", "HALTE", "HENNE", "HONIG", "HOSEN",
      "HUTTE", "IMMER", "INSEL", "JAGEN", "JUBEL", "KABEL", "KARTE", "KATZE",
      "KETTE", "KIRCHE", "KLEID", "KLEIN", "KNOPF", "KOHLE", "KRAFT", "KRANZ",
      "KREBS", "KREUZ", "KRONE", "KUCHE", "KUGEL", "KUNST", "LADEN", "LAMPE",
      "LAUFEN", "LEDER", "LEHRE", "LEISE", "LESEN", "LICHT", "LIEBE", "LINDE",
      "LINKS", "LOWEN", "MAGEN", "MARKT", "MAUER", "MEISE", "MESSER", "MILCH",
      "MONAT", "MORGEN", "MOTOR", "MUSIK", "NACHT", "NADEL", "NATUR", "NEBEL",
      "NORDEN", "NUDEL", "OSTEN", "PALME", "PFERD", "PLATZ", "PREIS", "PRINZ",
      "PUNKT", "REGEN", "REISE", "RENTE", "RINDE", "ROSEN", "RUHIG", "SAGEN",
      "SAMEN", "SCHAL", "SCHAF", "SCHUH", "SEELE", "SEGEN", "SONNE", "SORGE",
      "SPIEL", "STADT", "STAMM", "STAUB", "STEIN", "STERN", "STILL", "STIRN",
      "STOFF", "STOLZ", "STROM", "STUCK", "STURM", "SUCHE", "SUMPF", "TASSE",
      "TAUBE", "TEICH", "TIGER", "TINTE", "TISCH", "TRAUM", "TREUE", "TROPF",
      "TRUHE", "TURME", "UNTER", "VATER", "VOGEL", "WAGEN", "WANGE", "WASSER",
      "WELLE", "WIESE", "WOLKE", "WUNDE", "WURZE", "ZANGE", "ZAUBER", "ZEILE",
      "ZIEGE", "ZUCKER",
    ];

    this._setupModal();
  }

  // ─── Modal Wiring ────────────────────────────────────────────
  _setupModal() {
    const option = document.getElementById("abc-game-option");
    if (option) option.addEventListener("click", () => this._openModal());

    const closeBtn = document.getElementById("close-abc-modal");
    if (closeBtn) closeBtn.addEventListener("click", () => this._closeModal());

    const startBtn = document.getElementById("abc-start-btn");
    if (startBtn)
      startBtn.addEventListener("click", () => {
        this._playSound("start");
        this._startGame();
      });

    const playAgainBtn = document.getElementById("abc-play-again-btn");
    if (playAgainBtn)
      playAgainBtn.addEventListener("click", () => {
        this._playSound("start");
        this._startGame();
      });

    const menuBtn = document.getElementById("abc-menu-btn");
    if (menuBtn)
      menuBtn.addEventListener("click", () => {
        this._playSound("click");
        this._showScreen("abc-start-screen");
      });

    // Language buttons
    document.querySelectorAll(".abc-lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._playSound("click");
        this.language = btn.dataset.lang;
        document.querySelectorAll(".abc-lang-btn").forEach((b) =>
          b.classList.remove("abc-lang-btn--active"),
        );
        btn.classList.add("abc-lang-btn--active");
      });
    });

    // Difficulty buttons
    document.querySelectorAll(".abc-diff-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._playSound("click");
        this.difficulty = btn.dataset.diff;
        document.querySelectorAll(".abc-diff-btn").forEach((b) =>
          b.classList.remove("abc-diff-btn--active"),
        );
        btn.classList.add("abc-diff-btn--active");
        // Update hint visibility
        document.querySelectorAll(".abc-diff-hint").forEach((h) => {
          h.style.display = h.dataset.for === btn.dataset.diff ? "inline" : "none";
        });
      });
    });
    // Show initial hint
    document.querySelectorAll(".abc-diff-hint").forEach((h) => {
      h.style.display = h.dataset.for === "easy" ? "inline" : "none";
    });
  }

  _openModal() {
    const modal = document.getElementById("abc-game-modal");
    if (modal) {
      modal.style.display = "flex";
      this._refreshBestDisplay();
      this._showScreen("abc-start-screen");
    }
  }

  _closeModal() {
    const modal = document.getElementById("abc-game-modal");
    if (modal) modal.style.display = "none";
  }

  _showScreen(id) {
    ["abc-start-screen", "abc-game-screen"].forEach((s) => {
      const el = document.getElementById(s);
      if (el) el.style.display = s === id ? "flex" : "none";
    });
    // Also hide lost dialog if switching screens
    const lost = document.getElementById("abc-lost-dialog");
    if (lost) lost.style.display = "none";
  }

  _refreshBestDisplay() {
    const el = document.getElementById("abc-best-score-display");
    if (el) el.textContent = this.bestScore;
  }

  // ─── Game Logic ───────────────────────────────────────────────
  _startGame() {
    this._initAudio();
    this.score = 0;
    this.answering = false;
    this._showScreen("abc-game-screen");

    // Show difficulty badge in game screen
    const badge = document.getElementById("abc-diff-badge");
    if (badge) {
      const labels = { easy: "Easy", medium: "Medium", hard: "Hard" };
      const langFlag = this.language === "de" ? "🇩🇪" : "🇬🇧";
      badge.textContent = langFlag + " " + labels[this.difficulty];
      badge.className = "abc-diff-badge abc-diff-badge--" + this.difficulty;
    }

    this._updateScoreDisplay();
    this._nextQuestion();
  }

  _updateScoreDisplay() {
    const el = document.getElementById("abc-score");
    if (el) el.textContent = this.score;
  }

  _randomLetter() {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
  }

  _pickRandomWord(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  _nextQuestion() {
    this.answering = false;

    const mediumList = this.language === "de" ? this.MEDIUM_WORDS_DE : this.MEDIUM_WORDS_EN;
    const hardList = this.language === "de" ? this.HARD_WORDS_DE : this.HARD_WORDS_EN;

    let letters, correct;

    if (this.difficulty === "easy") {
      // 2 random letters
      const l1 = this._randomLetter();
      const l2 = this._randomLetter();
      letters = [l1, l2];
      correct = l1 + l2;
    } else if (this.difficulty === "medium") {
      // 4-letter real word
      const word = this._pickRandomWord(mediumList);
      letters = word.split("");
      correct = word;
    } else {
      // 5+ letter real word
      const word = this._pickRandomWord(hardList);
      letters = word.split("");
      correct = word;
    }

    // Generate 2 unique wrong answers
    const wrongs = new Set();
    while (wrongs.size < 2) {
      let w;
      if (this.difficulty === "easy") {
        w = this._randomLetter() + this._randomLetter();
      } else if (this.difficulty === "medium") {
        w = this._pickRandomWord(mediumList);
      } else {
        w = this._pickRandomWord(hardList);
      }
      if (w !== correct) wrongs.add(w);
    }

    const options = [correct, ...Array.from(wrongs)];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    this.currentQuestion = { letters, correct };

    // Render letters into the question area
    const questionEl = document.getElementById("abc-question-letters");
    if (questionEl) {
      questionEl.innerHTML = "";
      // Add modifier class for long words so CSS can scale down
      questionEl.classList.toggle("abc-question--long", letters.length > 3);
      letters.forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "abc-letter abc-letter-pop";
        span.textContent = ch;
        // Alternate colors
        span.style.color = i % 2 === 0 ? "#a78bfa" : "#60a5fa";
        questionEl.appendChild(span);

        // Add '+' between letters
        if (i < letters.length - 1) {
          const plus = document.createElement("span");
          plus.className = "abc-operator";
          plus.textContent = "+";
          questionEl.appendChild(plus);
        }
      });
      // Add '= ?'
      const eq = document.createElement("span");
      eq.className = "abc-operator";
      eq.textContent = "=";
      questionEl.appendChild(eq);

      const qm = document.createElement("span");
      qm.className = "abc-question-mark";
      qm.textContent = "?";
      questionEl.appendChild(qm);
    }

    // Set option buttons
    const optBtns = document.querySelectorAll(".abc-option-btn");
    optBtns.forEach((btn, i) => {
      btn.textContent = options[i];
      btn.className = "abc-option-btn";
      btn.setAttribute("data-index", i);
      btn.onclick = () => this._answer(options[i], btn);
    });
  }

  _answer(chosen, btn) {
    if (this.answering || !this.currentQuestion) return;
    this.answering = true;

    this._playSound("click");

    if (chosen === this.currentQuestion.correct) {
      // ── Correct ──
      btn.classList.add("abc-option-correct");
      this._playSound("correct");

      // Speak the result
      this._speak(this.currentQuestion.correct);

      this.score++;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem("abc_best", this.bestScore);
      }
      this._updateScoreDisplay();

      setTimeout(() => {
        btn.classList.remove("abc-option-correct");
        this._nextQuestion();
      }, 1200);
    } else {
      // ── Wrong ──
      btn.classList.add("abc-option-wrong");

      // Also highlight the correct button
      const optBtns = document.querySelectorAll(".abc-option-btn");
      optBtns.forEach((b) => {
        if (b.textContent === this.currentQuestion.correct) {
          b.classList.add("abc-option-reveal");
        }
      });

      this._playSound("wrong");

      // Speak the correct answer so the player learns
      this._speak(this.currentQuestion.correct);

      setTimeout(() => this._showLostDialog(), 1200);
    }
  }

  _showLostDialog() {
    const lostScore = document.getElementById("abc-lost-score");
    const lostBest = document.getElementById("abc-lost-best");
    if (lostScore) lostScore.textContent = this.score;
    if (lostBest) lostBest.textContent = this.bestScore;

    const dialog = document.getElementById("abc-lost-dialog");
    if (dialog) {
      dialog.style.display = "flex";
      // Trigger entrance animation
      const box = dialog.querySelector(".abc-lost-box");
      if (box) {
        box.classList.remove("abc-lost-box-in");
        void box.offsetWidth;
        box.classList.add("abc-lost-box-in");
      }
    }
  }

  // ─── Speech ────────────────────────────────────────────────────
  _getSpeechLang() {
    return this.language === "de" ? "de-DE" : "en-US";
  }

  _speak(text) {
    if (!("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const word = text.toUpperCase();
    const lang = this._getSpeechLang();

    // For easy mode (2 letters), spell out each letter
    // For medium/hard (real words), say the word naturally
    if (this.difficulty === "easy") {
      // Spell letter by letter
      const letters = word.split("");
      letters.forEach((letter, i) => {
        const utter = new SpeechSynthesisUtterance(letter);
        utter.rate = 0.65;
        utter.pitch = 1.1;
        utter.volume = 0.9;
        utter.lang = lang;
        // Delay each letter slightly
        setTimeout(() => window.speechSynthesis.speak(utter), i * 500);
      });
      // Then say the combination
      const combo = new SpeechSynthesisUtterance(word);
      combo.rate = 0.6;
      combo.pitch = 1.0;
      combo.volume = 0.9;
      combo.lang = lang;
      setTimeout(
        () => window.speechSynthesis.speak(combo),
        letters.length * 500 + 300,
      );
    } else {
      // Say the word naturally – slower for clarity
      const utter = new SpeechSynthesisUtterance(word);
      utter.rate = 0.6;
      utter.pitch = 1.0;
      utter.volume = 0.9;
      utter.lang = lang;
      window.speechSynthesis.speak(utter);
    }
  }

  // ─── Audio ────────────────────────────────────────────────────
  _initAudio() {
    if (!this.ac) {
      try {
        this.ac = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    if (this.ac && this.ac.state === "suspended") {
      this.ac.resume();
    }
  }

  _playSound(name) {
    this._initAudio();
    if (!this.ac) return;
    const t = this.ac.currentTime;

    switch (name) {
      case "correct": {
        // Happy ascending chime – 4 notes
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
          const o = this.ac.createOscillator();
          const g = this.ac.createGain();
          o.connect(g);
          g.connect(this.ac.destination);
          o.type = "sine";
          o.frequency.value = freq;
          g.gain.setValueAtTime(0, t + i * 0.11);
          g.gain.linearRampToValueAtTime(0.28, t + i * 0.11 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.11 + 0.3);
          o.start(t + i * 0.11);
          o.stop(t + i * 0.11 + 0.35);
        });
        break;
      }

      case "wrong": {
        // Descending sad buzz
        const o = this.ac.createOscillator();
        const g = this.ac.createGain();
        o.connect(g);
        g.connect(this.ac.destination);
        o.type = "sawtooth";
        o.frequency.setValueAtTime(320, t);
        o.frequency.linearRampToValueAtTime(80, t + 0.45);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.start(t);
        o.stop(t + 0.55);
        break;
      }

      case "click": {
        // Soft tick
        const o = this.ac.createOscillator();
        const g = this.ac.createGain();
        o.connect(g);
        g.connect(this.ac.destination);
        o.type = "sine";
        o.frequency.value = 900;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.start(t);
        o.stop(t + 0.1);
        break;
      }

      case "start": {
        // Rising whoosh
        const o = this.ac.createOscillator();
        const g = this.ac.createGain();
        o.connect(g);
        g.connect(this.ac.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(220, t);
        o.frequency.exponentialRampToValueAtTime(880, t + 0.3);
        g.gain.setValueAtTime(0.22, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t);
        o.stop(t + 0.4);
        break;
      }
    }
  }
}
