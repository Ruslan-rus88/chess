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

  _nextQuestion() {
    this.answering = false;

    const l1 = this._randomLetter();
    const l2 = this._randomLetter();
    const correct = l1 + l2;

    // Generate 2 unique wrong answers
    const wrongs = new Set();
    while (wrongs.size < 2) {
      const w = this._randomLetter() + this._randomLetter();
      if (w !== correct) wrongs.add(w);
    }

    const options = [correct, ...Array.from(wrongs)];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    this.currentQuestion = { l1, l2, correct };

    // Animate letters in
    const l1El = document.getElementById("abc-letter1");
    const l2El = document.getElementById("abc-letter2");
    if (l1El) {
      l1El.textContent = l1;
      l1El.classList.remove("abc-letter-pop");
      void l1El.offsetWidth;
      l1El.classList.add("abc-letter-pop");
    }
    if (l2El) {
      l2El.textContent = l2;
      l2El.classList.remove("abc-letter-pop");
      void l2El.offsetWidth;
      l2El.classList.add("abc-letter-pop");
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

      this.score++;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem("abc_best", this.bestScore);
      }
      this._updateScoreDisplay();

      setTimeout(() => {
        btn.classList.remove("abc-option-correct");
        this._nextQuestion();
      }, 650);
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

      setTimeout(() => this._showLostDialog(), 900);
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
