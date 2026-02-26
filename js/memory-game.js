// Memory Game
class MemoryGame {
  constructor() {
    // All personnel characters with local assets
    this.personnel = [
      { id: "ruslan", name: "Ruslan", image: "assets/images/ruslan.jpeg" },
      { id: "roman", name: "Roman", image: "assets/images/roman.jpg" },
      { id: "katrine", name: "Katrine", image: "assets/images/katrine.jpg" },
      { id: "liana", name: "Liana", image: "assets/images/liana.jpeg" },
      { id: "peppa", name: "Peppa Pig", image: "assets/images/peppa.jpeg" },
      { id: "booba", name: "Booba", image: "assets/images/booba.jpeg" },
    ];

    this.level = null; // 'easy' | 'hard'
    this.cards = []; // shuffled card objects
    this.flippedCards = []; // at most 2 {el, index}
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.attempts = 0;
    this.canFlip = true;
    this.randomCharacter = null;
    this.timer = null;
    this.startTime = null;

    this.setupEventListeners();
  }

  // ─── Event Wiring ────────────────────────────────────────────────────────────

  setupEventListeners() {
    // Open memory game from "More Games" list
    document
      .getElementById("memory-game-option")
      .addEventListener("click", () => {
        document.getElementById("more-games-modal").style.display = "none";
        document.getElementById("memory-game-modal").style.display = "flex";
        this.showLevelSelection();
      });

    // Close the modal
    document
      .getElementById("close-memory-modal")
      .addEventListener("click", () => {
        this.closeGame();
      });

    // Click outside the modal content to close
    document
      .getElementById("memory-game-modal")
      .addEventListener("click", (e) => {
        if (e.target === document.getElementById("memory-game-modal")) {
          this.closeGame();
        }
      });

    // Level buttons
    document.getElementById("memory-easy-btn").addEventListener("click", () => {
      this.selectLevel("easy");
    });
    document.getElementById("memory-hard-btn").addEventListener("click", () => {
      this.selectLevel("hard");
    });

    // In-game: back to menu
    document.getElementById("memory-back-btn").addEventListener("click", () => {
      this.showLevelSelection();
    });

    // Win screen: play again (same level)
    document
      .getElementById("memory-play-again-btn")
      .addEventListener("click", () => {
        this.selectLevel(this.level);
      });

    // Win screen: change level
    document
      .getElementById("memory-change-level-btn")
      .addEventListener("click", () => {
        this.showLevelSelection();
      });
  }

  // ─── Screen Management ───────────────────────────────────────────────────────

  showLevelSelection() {
    this.clearTimer();
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.attempts = 0;
    this.canFlip = true;

    this.setScreen("level");
  }

  /** @param {'level'|'loading'|'game'|'win'} name */
  setScreen(name) {
    document.getElementById("memory-level-selection").style.display =
      name === "level" ? "block" : "none";
    document.getElementById("memory-loading").style.display =
      name === "loading" ? "flex" : "none";
    document.getElementById("memory-game-area").style.display =
      name === "game" ? "block" : "none";
    document.getElementById("memory-win-screen").style.display =
      name === "win" ? "flex" : "none";
  }

  // ─── Level & Character Loading ───────────────────────────────────────────────

  async selectLevel(level) {
    this.level = level;
    this.setScreen("loading");

    try {
      await this.loadRandomCharacter();
    } catch (e) {
      // Fallback: use a DiceBear generated SVG avatar so the game always works
      const seed = Math.floor(Math.random() * 9999);
      this.randomCharacter = {
        id: "mystery",
        name: "Mystery",
        image: `https://api.dicebear.com/8.x/fun-emoji/svg?seed=${seed}`,
      };
    }

    this.startGame();
  }

  async loadRandomCharacter() {
    // Rick & Morty API – free, no API key, ~826 characters with image
    const id = Math.floor(Math.random() * 826) + 1;
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/${id}`,
    );

    if (!response.ok) throw new Error("Rick & Morty API error");

    const data = await response.json();
    this.randomCharacter = {
      id: `rm_${data.id}`,
      name: data.name.length > 14 ? data.name.slice(0, 13) + "…" : data.name,
      image: data.image,
    };
  }

  // ─── Game Initialisation ─────────────────────────────────────────────────────

  startGame() {
    // Shuffle the local personnel list and pick the required count
    const shuffled = [...this.personnel].sort(() => Math.random() - 0.5);

    // Easy  → 2 local + 1 random = 3 pairs (6 cards)
    // Hard  → 5 local + 1 random = 6 pairs (12 cards)
    const localCount = this.level === "easy" ? 2 : 5;
    const selectedChars = [
      ...shuffled.slice(0, localCount),
      this.randomCharacter,
    ];

    this.totalPairs = selectedChars.length;
    this.matchedPairs = 0;
    this.attempts = 0;
    this.flippedCards = [];
    this.canFlip = true;

    // Create two cards per character, then shuffle
    const pairs = [];
    selectedChars.forEach((char) => {
      pairs.push({ ...char, cardId: char.id + "_a" });
      pairs.push({ ...char, cardId: char.id + "_b" });
    });
    this.cards = pairs.sort(() => Math.random() - 0.5);

    // Update HUD
    document.getElementById("memory-level-display").textContent =
      this.level === "easy" ? "🟢 Easy" : "🔴 Hard";
    document.getElementById("memory-attempts").textContent = "0";
    document.getElementById("memory-matched").textContent =
      `0 / ${this.totalPairs}`;
    document.getElementById("memory-timer").textContent = "0:00";

    this.setScreen("game");
    this.renderBoard();
    this.startTimer();
  }

  // ─── Board Rendering ─────────────────────────────────────────────────────────

  renderBoard() {
    const board = document.getElementById("memory-board");
    board.innerHTML = "";
    board.className = `memory-board memory-board-${this.level}`;

    this.cards.forEach((card, index) => {
      const cardEl = document.createElement("div");
      cardEl.className = "memory-card";
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-back-face">
            <span class="memory-card-back-icon">🃏</span>
          </div>
          <div class="memory-card-front-face">
            <img src="${card.image}" alt="${card.name}" onerror="this.src='assets/images/roman.jpg'" />
            <span class="memory-card-label">${card.name}</span>
          </div>
        </div>`;

      cardEl.addEventListener("click", () => this.flipCard(cardEl, index));
      board.appendChild(cardEl);
    });
  }

  // ─── Card Flip Logic ─────────────────────────────────────────────────────────

  flipCard(cardEl, index) {
    if (!this.canFlip) return;
    if (cardEl.classList.contains("flipped")) return;
    if (cardEl.classList.contains("matched")) return;
    if (this.flippedCards.length >= 2) return;

    cardEl.classList.add("flipped");
    this.flippedCards.push({ el: cardEl, index });

    if (this.flippedCards.length === 2) {
      this.attempts++;
      document.getElementById("memory-attempts").textContent = this.attempts;
      this.checkMatch();
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    const char1 = this.cards[card1.index];
    const char2 = this.cards[card2.index];
    const isMatch = char1.id === char2.id;

    if (isMatch) {
      // ✅ Keep flipped, mark as matched after a short pause
      setTimeout(() => {
        card1.el.classList.add("matched");
        card2.el.classList.add("matched");
        this.flippedCards = [];
        this.matchedPairs++;
        document.getElementById("memory-matched").textContent =
          `${this.matchedPairs} / ${this.totalPairs}`;

        if (this.matchedPairs === this.totalPairs) {
          this.onWin();
        }
      }, 400);
    } else {
      // ❌ Flip back after delay
      this.canFlip = false;
      setTimeout(() => {
        card1.el.classList.remove("flipped");
        card2.el.classList.remove("flipped");
        this.flippedCards = [];
        this.canFlip = true;
      }, 1100);
    }
  }

  // ─── Win ─────────────────────────────────────────────────────────────────────

  onWin() {
    this.clearTimer();

    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

    setTimeout(() => {
      document.getElementById("memory-win-attempts").textContent =
        this.attempts;
      document.getElementById("memory-win-time").textContent = timeStr;
      document.getElementById("memory-win-level").textContent =
        this.level === "easy" ? "🟢 Easy" : "🔴 Hard";
      this.setScreen("win");
    }, 600);
  }

  // ─── Timer ───────────────────────────────────────────────────────────────────

  startTimer() {
    this.clearTimer();
    this.startTime = Date.now();
    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const el = document.getElementById("memory-timer");
      if (el) el.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
    }, 1000);
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ─── Close ───────────────────────────────────────────────────────────────────

  closeGame() {
    this.clearTimer();
    document.getElementById("memory-game-modal").style.display = "none";
    this.showLevelSelection();
  }
}
