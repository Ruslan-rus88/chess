// ═══════════════════════════════════════════════════════════════
//  DRAGON REALMS – Sky Island Adventure Mini-Game
// ═══════════════════════════════════════════════════════════════
class DragonRealmsGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animFrame = null;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    // Dragon state
    this.dragon = null;
    this.selectedDragon = "fire";
    this.selectedMission = "crystal-run";
    this.dragonLevel = parseInt(localStorage.getItem("dr_dragon_lv") || "1");
    this.dragonXP = parseInt(localStorage.getItem("dr_dragon_xp") || "0");

    // Progression
    this.crystals = 0;
    this.highScore = parseInt(localStorage.getItem("dr_hi") || "0");
    this.totalCrystals = parseInt(
      localStorage.getItem("dr_total_crystals") || "0",
    );
    this.islandsUnlocked = parseInt(
      localStorage.getItem("dr_islands") || "1",
    );
    this.currentIsland = 1;
    this.lives = 3;
    this.rescued = 0;

    // Timer
    this.missionTime = 180; // 3 minutes in seconds
    this.timeRemaining = this.missionTime;
    this.lastTimerTick = 0;

    // Ability cooldown
    this.abilityCooldown = 0;
    this.abilityMaxCooldown = 3000; // 3 seconds
    this.abilityActive = false;
    this.abilityTimer = 0;

    // Game objects
    this.rings = [];
    this.obstacles = [];
    this.enemies = [];
    this.particles = [];
    this.clouds = [];
    this.islands = [];
    this.collectibles = [];
    this.babyDragons = [];
    this.shrineSymbols = [];
    this.lightningBolts = [];

    // Input
    this.keys = {};
    this.touchStartX = null;
    this.touchStartY = null;
    this.lastTime = 0;

    // Spawning
    this.spawnTimer = 0;
    this.spawnInterval = 1200;
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 2500;
    this.scrollSpeed = 2;

    // Mission-specific goals
    this.missionGoal = 0;
    this.missionProgress = 0;

    // Unlocked dragons
    this.unlockedDragons = JSON.parse(
      localStorage.getItem("dr_unlocked") || '["fire","ice","storm","crystal","shadow"]',
    );
    // Ensure storm, crystal, shadow are always unlocked
    ["storm", "crystal", "shadow"].forEach((d) => {
      if (!this.unlockedDragons.includes(d)) this.unlockedDragons.push(d);
    });

    // Bind handlers
    this._keyDown = this._keyDown.bind(this);
    this._keyUp = this._keyUp.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._touchMove = this._touchMove.bind(this);
    this._touchEnd = this._touchEnd.bind(this);
    this._resize = this._resize.bind(this);

    this._setupModal();
  }

  // ─── Dragon Definitions ─────────────────────────────────────────────────────
  get DRAGONS() {
    return {
      fire: {
        name: "Fire Dragon",
        emoji: "🔥",
        color: "#ff4500",
        glowColor: "rgba(255,69,0,0.5)",
        bodyColor: "#cc3700",
        wingColor: "#ff6b35",
        ability: "Fire Breath",
        abilityDesc: "Destroys obstacles & enemies",
      },
      ice: {
        name: "Ice Dragon",
        emoji: "❄️",
        color: "#00bfff",
        glowColor: "rgba(0,191,255,0.5)",
        bodyColor: "#0099cc",
        wingColor: "#66d9ff",
        ability: "Crystal Magnet",
        abilityDesc: "Attracts nearby collectibles",
      },
      storm: {
        name: "Storm Dragon",
        emoji: "⚡",
        color: "#ffd700",
        glowColor: "rgba(255,215,0,0.5)",
        bodyColor: "#ccac00",
        wingColor: "#ffe44d",
        ability: "Wind Dash",
        abilityDesc: "High-speed burst forward",
      },
      crystal: {
        name: "Crystal Dragon",
        emoji: "💎",
        color: "#da70d6",
        glowColor: "rgba(218,112,214,0.5)",
        bodyColor: "#b050ae",
        wingColor: "#e899e5",
        ability: "Storm Shield",
        abilityDesc: "Temporary protection",
      },
      shadow: {
        name: "Shadow Dragon",
        emoji: "🌑",
        color: "#8b00ff",
        glowColor: "rgba(139,0,255,0.5)",
        bodyColor: "#6600cc",
        wingColor: "#aa44ff",
        ability: "Ancient Roar",
        abilityDesc: "Clears all enemies on screen",
      },
    };
  }

  // ─── Modal Wiring ─────────────────────────────────────────────────────────
  _setupModal() {
    document
      .getElementById("dragon-realms-option")
      .addEventListener("click", () => {
        document.getElementById("more-games-modal").style.display = "none";
        document.getElementById("dragon-realms-modal").style.display = "flex";
        this._initCanvas();
        this._updateStartScreen();
      });

    document
      .getElementById("close-dragon-realms-modal")
      .addEventListener("click", () => {
        this._closeGame();
      });

    document
      .getElementById("dragon-realms-modal")
      .addEventListener("click", (e) => {
        if (e.target === document.getElementById("dragon-realms-modal"))
          this._closeGame();
      });

    document.getElementById("dr-start-btn").addEventListener("click", () => {
      this._startGame();
    });

    document.getElementById("dr-restart-btn").addEventListener("click", () => {
      this._startGame();
    });

    document.getElementById("dr-next-btn").addEventListener("click", () => {
      this._nextMission();
    });

    document.getElementById("dr-menu-btn").addEventListener("click", () => {
      this._showScreen("start");
    });

    document
      .getElementById("dr-victory-menu-btn")
      .addEventListener("click", () => {
        this._showScreen("start");
      });

    // Dragon selection
    document.querySelectorAll(".dr-dragon-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dragon = btn.dataset.dragon;
        if (this.unlockedDragons.includes(dragon)) {
          this.selectedDragon = dragon;
          document.querySelectorAll(".dr-dragon-btn").forEach((b) => {
            b.classList.remove("dr-dragon-btn--selected");
          });
          btn.classList.add("dr-dragon-btn--selected");
        }
      });
    });

    // Mission selection
    document.querySelectorAll(".dr-mission-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedMission = btn.dataset.mission;
        document.querySelectorAll(".dr-mission-btn").forEach((b) => {
          b.classList.remove("dr-mission-btn--selected");
        });
        btn.classList.add("dr-mission-btn--selected");
      });
    });

    // Mobile ability button
    const mobileAbility = document.getElementById("dr-mobile-ability");
    mobileAbility.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._useAbility();
      },
      { passive: false },
    );
    mobileAbility.addEventListener("click", () => this._useAbility());

    // Detect touch device
    window.addEventListener(
      "touchstart",
      () => {
        mobileAbility.style.display = "flex";
      },
      { once: true },
    );
  }

  _updateStartScreen() {
    // Update dragon lock states
    document.querySelectorAll(".dr-dragon-btn").forEach((btn) => {
      const dragon = btn.dataset.dragon;
      if (this.unlockedDragons.includes(dragon)) {
        btn.classList.remove("dr-dragon-btn--locked");
        const lock = btn.querySelector(".dr-lock-badge");
        if (lock) lock.style.display = "none";
      }
    });

    // Update stats
    const bestEl = document.getElementById("dr-best-score-display");
    if (bestEl) bestEl.textContent = this.highScore;
    const lvEl = document.getElementById("dr-dragon-level-display");
    if (lvEl) lvEl.textContent = this.dragonLevel;
    const islandsEl = document.getElementById("dr-islands-display");
    if (islandsEl) islandsEl.textContent = `${this.islandsUnlocked}/5`;

    // Update mobile ability emoji
    const dragonDef = this.DRAGONS[this.selectedDragon];
    const mobileAbility = document.getElementById("dr-mobile-ability");
    if (mobileAbility && dragonDef) {
      mobileAbility.textContent = dragonDef.emoji;
    }
  }

  // ─── Canvas Setup ───────────────────────────────────────────────────────────
  _initCanvas() {
    if (this.canvas) return;
    this.canvas = document.getElementById("dr-canvas");
    this.ctx = this.canvas.getContext("2d");
    this._resize();
    window.addEventListener("resize", this._resize);
    // Draw idle background
    this._drawIdleBackground();
  }

  _resize() {
    if (!this.canvas) return;
    const wrap = document.getElementById("dr-canvas-wrap");
    this.canvas.width = wrap.clientWidth;
    this.canvas.height = wrap.clientHeight;
    if (!this.running) this._drawIdleBackground();
  }

  _drawIdleBackground() {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a0a2e");
    grad.addColorStop(0.4, "#1a1060");
    grad.addColorStop(0.7, "#3a1080");
    grad.addColorStop(1, "#ff6b35");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.6;
      const r = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.3})`;
      ctx.fill();
    }

    // Floating islands silhouettes
    this._drawIslandSilhouette(ctx, w * 0.15, h * 0.55, 100, 40);
    this._drawIslandSilhouette(ctx, w * 0.5, h * 0.45, 140, 50);
    this._drawIslandSilhouette(ctx, w * 0.82, h * 0.6, 90, 35);
  }

  _drawIslandSilhouette(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(20,10,40,0.7)";
    ctx.beginPath();
    ctx.ellipse(x, y, w, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Top bumps
    ctx.beginPath();
    ctx.ellipse(x - w * 0.3, y - h * 0.3, w * 0.35, h * 0.5, 0, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.2, y - h * 0.2, w * 0.4, h * 0.6, 0, Math.PI, 0);
    ctx.fill();
  }

  // ─── Screen Management ──────────────────────────────────────────────────────
  _showScreen(name) {
    const screens = ["start", "gameover", "victory"];
    screens.forEach((s) => {
      const el = document.getElementById(
        `dr-${s === "start" ? "start" : s === "gameover" ? "gameover" : "victory"}-screen`,
      );
      if (el) el.style.display = s === name ? "flex" : "none";
    });
    document.getElementById("dr-overlay").style.display =
      name === "playing" ? "flex" : "none";

    if (name === "start") {
      this._updateStartScreen();
      this._stopLoop();
      this._drawIdleBackground();
    }
  }

  // ─── Game Start ─────────────────────────────────────────────────────────────
  _startGame() {
    this.crystals = 0;
    this.lives = 3;
    this.rescued = 0;
    this.gameOver = false;
    this.victory = false;
    this.missionProgress = 0;
    this.abilityCooldown = 0;
    this.abilityActive = false;
    this.abilityTimer = 0;
    this.scrollSpeed = 2 + this.dragonLevel * 0.3;
    this.spawnTimer = 0;
    this.enemySpawnTimer = 0;
    this.lastTime = 0;
    this.lastTimerTick = 0;

    // Clear objects
    this.rings = [];
    this.obstacles = [];
    this.enemies = [];
    this.particles = [];
    this.clouds = [];
    this.islands = [];
    this.collectibles = [];
    this.babyDragons = [];
    this.shrineSymbols = [];
    this.lightningBolts = [];

    // Mission-specific setup
    this._setupMission();

    // Create dragon
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.dragon = {
      x: w * 0.15,
      y: h * 0.5,
      w: 50,
      h: 40,
      vy: 0,
      vx: 0,
      wingPhase: 0,
      invincible: 0,
    };

    // Generate initial clouds
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        size: Math.random() * 60 + 30,
        speed: Math.random() * 0.5 + 0.3,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    // Generate initial floating islands
    for (let i = 0; i < 3; i++) {
      this.islands.push({
        x: w * 0.3 + Math.random() * w * 0.7,
        y: Math.random() * h * 0.7 + h * 0.15,
        width: Math.random() * 100 + 60,
        height: Math.random() * 30 + 20,
        speed: Math.random() * 0.3 + 0.2,
      });
    }

    // Show HUD
    this._showScreen("playing");
    this._bindInput();
    this._startLoop();
  }

  _setupMission() {
    switch (this.selectedMission) {
      case "crystal-run":
        this.missionTime = 180;
        this.missionGoal = 30 + this.currentIsland * 10;
        this.spawnInterval = 800;
        break;
      case "dragon-rescue":
        this.missionTime = 180;
        this.missionGoal = 3 + Math.floor(this.currentIsland / 2);
        this.spawnInterval = 1200;
        this.enemySpawnInterval = 2000;
        break;
      case "sky-battle":
        this.missionTime = 150;
        this.missionGoal = 15 + this.currentIsland * 5;
        this.enemySpawnInterval = 1200;
        this.spawnInterval = 1500;
        break;
      case "shrine-puzzle":
        this.missionTime = 120;
        this.missionGoal = 5 + this.currentIsland;
        this.spawnInterval = 2000;
        this._generateShrineSymbols();
        break;
      case "storm-escape":
        this.missionTime = 120;
        this.missionGoal = 1; // survive
        this.scrollSpeed = 3 + this.dragonLevel * 0.4;
        this.spawnInterval = 600;
        break;
    }
    this.timeRemaining = this.missionTime;
  }

  _generateShrineSymbols() {
    const symbols = ["🔴", "🔵", "🟢", "🟡", "🟣"];
    const count = Math.min(this.missionGoal, symbols.length);
    const sequence = [];
    for (let i = 0; i < count; i++) {
      sequence.push(symbols[i]);
    }
    this.shrineSequence = sequence;
    this.shrineCurrentIndex = 0;
  }

  // ─── Input ──────────────────────────────────────────────────────────────────
  _bindInput() {
    document.addEventListener("keydown", this._keyDown);
    document.addEventListener("keyup", this._keyUp);
    this.canvas.addEventListener("touchstart", this._touchStart, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", this._touchMove, {
      passive: false,
    });
    this.canvas.addEventListener("touchend", this._touchEnd);
  }

  _unbindInput() {
    document.removeEventListener("keydown", this._keyDown);
    document.removeEventListener("keyup", this._keyUp);
    this.canvas.removeEventListener("touchstart", this._touchStart);
    this.canvas.removeEventListener("touchmove", this._touchMove);
    this.canvas.removeEventListener("touchend", this._touchEnd);
  }

  _keyDown(e) {
    if (!this.running) return;
    this.keys[e.key] = true;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._useAbility();
    }
  }

  _keyUp(e) {
    this.keys[e.key] = false;
  }

  _touchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  }

  _touchMove(e) {
    e.preventDefault();
    if (!this.dragon || this.touchStartX === null) return;
    const t = e.touches[0];
    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;
    this.dragon.x += dx * 0.6;
    this.dragon.y += dy * 0.6;
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  }

  _touchEnd() {
    this.touchStartX = null;
    this.touchStartY = null;
  }

  // ─── Ability System ─────────────────────────────────────────────────────────
  _useAbility() {
    if (this.abilityCooldown > 0 || !this.running || this.gameOver) return;
    this.abilityCooldown = this.abilityMaxCooldown;
    this.abilityActive = true;
    this.abilityTimer = 800; // ability lasts 800ms

    const dragonDef = this.DRAGONS[this.selectedDragon];

    switch (this.selectedDragon) {
      case "fire":
        // Fire Breath – destroy nearby obstacles and enemies
        this._fireBreathEffect();
        break;
      case "ice":
        // Crystal Magnet – attract collectibles
        this._crystalMagnetEffect();
        break;
      case "storm":
        // Wind Dash – burst forward
        if (this.dragon) {
          this.dragon.vx = 12;
          this.dragon.invincible = 1000;
        }
        break;
      case "crystal":
        // Storm Shield – temporary invincibility
        if (this.dragon) {
          this.dragon.invincible = 3000;
        }
        break;
      case "shadow":
        // Ancient Roar – clear all enemies
        this._ancientRoarEffect();
        break;
    }

    // Ability particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: this.dragon.x + this.dragon.w / 2,
        y: this.dragon.y + this.dragon.h / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 600,
        maxLife: 600,
        color: dragonDef.color,
        size: Math.random() * 6 + 3,
      });
    }
  }

  _fireBreathEffect() {
    const dx = this.dragon.x + this.dragon.w;
    const dy = this.dragon.y + this.dragon.h / 2;

    // Destroy obstacles in front
    this.obstacles = this.obstacles.filter((o) => {
      const dist = Math.hypot(o.x - dx, o.y - dy);
      if (dist < 150) {
        this._spawnExplosion(o.x, o.y, "#ff4500");
        return false;
      }
      return true;
    });

    // Destroy enemies in front
    this.enemies = this.enemies.filter((e) => {
      const dist = Math.hypot(e.x - dx, e.y - dy);
      if (dist < 150) {
        this._spawnExplosion(e.x, e.y, "#ff4500");
        this.missionProgress++;
        this.crystals += 2;
        return false;
      }
      return true;
    });

    // Fire particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: dx,
        y: dy,
        vx: Math.random() * 10 + 3,
        vy: (Math.random() - 0.5) * 6,
        life: 500,
        maxLife: 500,
        color: Math.random() > 0.5 ? "#ff4500" : "#ffa500",
        size: Math.random() * 8 + 3,
      });
    }
  }

  _crystalMagnetEffect() {
    // Attract all collectibles toward dragon
    this.collectibles.forEach((c) => {
      c.attracted = true;
    });
    this.rings.forEach((r) => {
      r.attracted = true;
    });
  }

  _ancientRoarEffect() {
    // Clear all enemies with explosions
    this.enemies.forEach((e) => {
      this._spawnExplosion(e.x, e.y, "#8b00ff");
      this.missionProgress++;
      this.crystals += 2;
    });
    this.enemies = [];

    // Screen shake effect via particles
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 800,
        maxLife: 800,
        color: "#8b00ff",
        size: Math.random() * 10 + 4,
      });
    }
  }

  _spawnExplosion(x, y, color) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 400,
        maxLife: 400,
        color,
        size: Math.random() * 6 + 2,
      });
    }
  }

  // ─── Game Loop ──────────────────────────────────────────────────────────────
  _startLoop() {
    this.running = true;
    this.lastTime = performance.now();
    this.lastTimerTick = this.lastTime;
    const loop = (ts) => {
      if (!this.running) return;
      const dt = Math.min(ts - this.lastTime, 50);
      this.lastTime = ts;
      this._update(dt, ts);
      this._draw();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  _stopLoop() {
    this.running = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  // ─── Update ─────────────────────────────────────────────────────────────────
  _update(dt, ts) {
    if (this.gameOver || this.victory) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Timer
    if (ts - this.lastTimerTick >= 1000) {
      this.timeRemaining--;
      this.lastTimerTick = ts;
      if (this.timeRemaining <= 0) {
        // Time's up – check if mission complete
        if (this.selectedMission === "storm-escape") {
          this._winMission();
        } else {
          this._loseMission();
        }
        return;
      }
    }

    // Update timer display
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    const timerEl = document.getElementById("dr-timer");
    if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

    // Update HUD
    const crystalEl = document.getElementById("dr-crystals");
    if (crystalEl) crystalEl.textContent = this.crystals;
    const islandEl = document.getElementById("dr-island");
    if (islandEl) islandEl.textContent = this.currentIsland;
    const livesEl = document.getElementById("dr-lives");
    if (livesEl) livesEl.textContent = "❤️".repeat(Math.max(0, this.lives));
    const abilityEl = document.getElementById("dr-ability");
    if (abilityEl) {
      if (this.abilityCooldown > 0) {
        abilityEl.textContent = Math.ceil(this.abilityCooldown / 1000) + "s";
        abilityEl.classList.remove("dr-ability-ready");
      } else {
        abilityEl.textContent = "READY";
        abilityEl.classList.add("dr-ability-ready");
      }
    }

    // Dragon movement
    if (this.dragon) {
      const speed = 4 + this.dragonLevel * 0.2;
      if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"])
        this.dragon.vy = -speed;
      else if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"])
        this.dragon.vy = speed;
      else this.dragon.vy *= 0.85;

      if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"])
        this.dragon.vx = speed;
      else if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"])
        this.dragon.vx = -speed;
      else this.dragon.vx *= 0.85;

      this.dragon.x += this.dragon.vx;
      this.dragon.y += this.dragon.vy;

      // Boundaries
      this.dragon.x = Math.max(0, Math.min(w - this.dragon.w, this.dragon.x));
      this.dragon.y = Math.max(0, Math.min(h - this.dragon.h, this.dragon.y));

      // Wing animation
      this.dragon.wingPhase += dt * 0.008;

      // Invincibility timer
      if (this.dragon.invincible > 0) {
        this.dragon.invincible -= dt;
      }
    }

    // Ability cooldown
    if (this.abilityCooldown > 0) {
      this.abilityCooldown -= dt;
      if (this.abilityCooldown < 0) this.abilityCooldown = 0;
    }

    // Ability active timer
    if (this.abilityActive) {
      this.abilityTimer -= dt;
      if (this.abilityTimer <= 0) {
        this.abilityActive = false;
      }
    }

    // Spawn game objects
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this._spawnObjects();
    }

    this.enemySpawnTimer += dt;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0;
      this._spawnEnemy();
    }

    // Update objects
    this._updateClouds(dt);
    this._updateIslands(dt);
    this._updateRings(dt);
    this._updateCollectibles(dt);
    this._updateObstacles(dt);
    this._updateEnemies(dt);
    this._updateBabyDragons(dt);
    this._updateLightning(dt);
    this._updateParticles(dt);

    // Collision detection
    this._checkCollisions();

    // Check mission completion
    this._checkMissionComplete();
  }

  // ─── Spawning ───────────────────────────────────────────────────────────────
  _spawnObjects() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    switch (this.selectedMission) {
      case "crystal-run":
        // Spawn crystal rings
        this.rings.push({
          x: w + 30,
          y: Math.random() * (h - 80) + 40,
          radius: 25,
          collected: false,
          attracted: false,
        });
        // Occasional obstacles
        if (Math.random() < 0.3) {
          this.obstacles.push({
            x: w + 20,
            y: Math.random() * (h - 60) + 30,
            w: 40,
            h: 40,
            type: "rock",
          });
        }
        break;

      case "dragon-rescue":
        // Spawn collectibles
        if (Math.random() < 0.5) {
          this.collectibles.push({
            x: w + 20,
            y: Math.random() * (h - 60) + 30,
            size: 20,
            type: "crystal",
            attracted: false,
          });
        }
        // Spawn baby dragons occasionally
        if (Math.random() < 0.15 && this.babyDragons.length < 2) {
          this.babyDragons.push({
            x: w + 20,
            y: Math.random() * (h - 80) + 40,
            size: 30,
            rescued: false,
            guardEnemy: {
              x: w + 60,
              y: Math.random() * (h - 80) + 40,
              w: 35,
              h: 35,
              hp: 2,
              type: "guard",
            },
          });
        }
        break;

      case "sky-battle":
        // Spawn collectibles
        if (Math.random() < 0.4) {
          this.collectibles.push({
            x: w + 20,
            y: Math.random() * (h - 60) + 30,
            size: 18,
            type: "crystal",
            attracted: false,
          });
        }
        break;

      case "shrine-puzzle":
        // Spawn shrine symbols
        if (
          this.shrineSymbols.length < 3 &&
          this.shrineCurrentIndex < this.shrineSequence.length
        ) {
          const correctSymbol = this.shrineSequence[this.shrineCurrentIndex];
          const allSymbols = ["🔴", "🔵", "🟢", "🟡", "🟣"];
          const symbols = [correctSymbol];
          while (symbols.length < 3) {
            const s = allSymbols[Math.floor(Math.random() * allSymbols.length)];
            if (!symbols.includes(s)) symbols.push(s);
          }
          // Shuffle
          for (let i = symbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
          }
          symbols.forEach((sym, idx) => {
            this.shrineSymbols.push({
              x: w + 20,
              y: h * 0.25 + idx * (h * 0.25),
              size: 35,
              symbol: sym,
              correct: sym === correctSymbol,
            });
          });
        }
        break;

      case "storm-escape":
        // Spawn obstacles rapidly
        this.obstacles.push({
          x: w + 20,
          y: Math.random() * (h - 60) + 30,
          w: Math.random() * 50 + 30,
          h: Math.random() * 50 + 30,
          type: "debris",
        });
        // Lightning
        if (Math.random() < 0.2) {
          this.lightningBolts.push({
            x: Math.random() * w,
            y: 0,
            targetY: h,
            width: 3,
            life: 800,
            maxLife: 800,
            warned: false,
            warningTime: 500,
          });
        }
        // Crystals
        if (Math.random() < 0.3) {
          this.collectibles.push({
            x: w + 20,
            y: Math.random() * (h - 60) + 30,
            size: 18,
            type: "crystal",
            attracted: false,
          });
        }
        break;
    }
  }

  _spawnEnemy() {
    if (
      this.selectedMission === "shrine-puzzle" ||
      this.selectedMission === "crystal-run"
    )
      return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const types = ["shadow-beast", "dark-bird", "storm-wisp"];
    const type = types[Math.floor(Math.random() * types.length)];

    this.enemies.push({
      x: w + 30,
      y: Math.random() * (h - 60) + 30,
      w: 35,
      h: 35,
      type,
      hp: type === "shadow-beast" ? 2 : 1,
      speed: Math.random() * 1.5 + 1,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // ─── Update Helpers ─────────────────────────────────────────────────────────
  _updateClouds(dt) {
    const w = this.canvas.width;
    this.clouds.forEach((c) => {
      c.x -= (c.speed + this.scrollSpeed * 0.3) * (dt / 16);
      if (c.x + c.size < 0) {
        c.x = w + c.size;
        c.y = Math.random() * this.canvas.height * 0.5;
      }
    });
  }

  _updateIslands(dt) {
    const w = this.canvas.width;
    this.islands.forEach((isl) => {
      isl.x -= (isl.speed + this.scrollSpeed * 0.5) * (dt / 16);
      if (isl.x + isl.width < 0) {
        isl.x = w + isl.width + Math.random() * 200;
        isl.y = Math.random() * this.canvas.height * 0.7 + this.canvas.height * 0.15;
      }
    });
  }

  _updateRings(dt) {
    this.rings = this.rings.filter((r) => {
      r.x -= this.scrollSpeed * (dt / 16);
      if (r.attracted && this.dragon) {
        const dx = this.dragon.x + this.dragon.w / 2 - r.x;
        const dy = this.dragon.y + this.dragon.h / 2 - r.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          r.x += (dx / dist) * 6;
          r.y += (dy / dist) * 6;
        }
      }
      return r.x + r.radius > -10 && !r.collected;
    });
  }

  _updateCollectibles(dt) {
    this.collectibles = this.collectibles.filter((c) => {
      c.x -= this.scrollSpeed * (dt / 16);
      if (c.attracted && this.dragon) {
        const dx = this.dragon.x + this.dragon.w / 2 - c.x;
        const dy = this.dragon.y + this.dragon.h / 2 - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
          c.x += (dx / dist) * 6;
          c.y += (dy / dist) * 6;
        }
      }
      return c.x + c.size > -10;
    });
  }

  _updateObstacles(dt) {
    this.obstacles = this.obstacles.filter((o) => {
      o.x -= this.scrollSpeed * 1.2 * (dt / 16);
      return o.x + o.w > -10;
    });
  }

  _updateEnemies(dt) {
    this.enemies = this.enemies.filter((e) => {
      e.x -= (e.speed + this.scrollSpeed * 0.5) * (dt / 16);
      e.phase += dt * 0.003;
      e.y += Math.sin(e.phase) * 1.2;
      return e.x + e.w > -10;
    });
  }

  _updateBabyDragons(dt) {
    this.babyDragons = this.babyDragons.filter((bd) => {
      bd.x -= this.scrollSpeed * 0.8 * (dt / 16);
      if (bd.guardEnemy) {
        bd.guardEnemy.x -= this.scrollSpeed * 0.8 * (dt / 16);
      }
      return bd.x + bd.size > -10;
    });
  }

  _updateLightning(dt) {
    this.lightningBolts = this.lightningBolts.filter((l) => {
      l.life -= dt;
      if (!l.warned && l.life <= l.warningTime) {
        l.warned = true;
      }
      return l.life > 0;
    });
  }

  _updateParticles(dt) {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.life -= dt;
      return p.life > 0;
    });
  }

  // ─── Collision Detection ────────────────────────────────────────────────────
  _checkCollisions() {
    if (!this.dragon) return;
    const dx = this.dragon.x;
    const dy = this.dragon.y;
    const dw = this.dragon.w;
    const dh = this.dragon.h;
    const dcx = dx + dw / 2;
    const dcy = dy + dh / 2;

    // Rings
    this.rings.forEach((r) => {
      if (r.collected) return;
      const dist = Math.hypot(r.x - dcx, r.y - dcy);
      if (dist < r.radius + 20) {
        r.collected = true;
        this.crystals++;
        this.missionProgress++;
        this._spawnCollectParticle(r.x, r.y, "#00e5ff");
      }
    });

    // Collectibles
    this.collectibles = this.collectibles.filter((c) => {
      const dist = Math.hypot(c.x - dcx, c.y - dcy);
      if (dist < c.size + 20) {
        this.crystals++;
        this._spawnCollectParticle(c.x, c.y, "#ffd700");
        return false;
      }
      return true;
    });

    // Baby Dragons
    this.babyDragons.forEach((bd) => {
      if (bd.rescued) return;
      // Check if guard is dead
      if (bd.guardEnemy && bd.guardEnemy.hp <= 0) {
        bd.guardEnemy = null;
      }
      // Can rescue if no guard
      if (!bd.guardEnemy) {
        const dist = Math.hypot(bd.x - dcx, bd.y - dcy);
        if (dist < bd.size + 20) {
          bd.rescued = true;
          this.rescued++;
          this.missionProgress++;
          this._spawnCollectParticle(bd.x, bd.y, "#ff69b4");
        }
      }
    });

    // Shrine symbols
    this.shrineSymbols = this.shrineSymbols.filter((s) => {
      s.x -= this.scrollSpeed * (16 / 16);
      const dist = Math.hypot(s.x - dcx, s.y - dcy);
      if (dist < s.size + 20) {
        if (s.correct) {
          this.shrineCurrentIndex++;
          this.missionProgress++;
          this.crystals += 5;
          this._spawnCollectParticle(s.x, s.y, "#ffd700");
        } else {
          this._takeDamage();
        }
        return false;
      }
      return s.x + s.size > -10;
    });

    // Obstacles (damage)
    if (this.dragon.invincible <= 0) {
      this.obstacles.forEach((o) => {
        if (this._rectOverlap(dx, dy, dw, dh, o.x, o.y, o.w, o.h)) {
          this._takeDamage();
          o.x = -100; // remove
        }
      });
    }

    // Enemies
    this.enemies = this.enemies.filter((e) => {
      if (this._rectOverlap(dx, dy, dw, dh, e.x, e.y, e.w, e.h)) {
        if (this.abilityActive && this.selectedDragon === "fire") {
          this._spawnExplosion(e.x, e.y, "#ff4500");
          this.missionProgress++;
          this.crystals += 2;
          return false;
        } else if (this.dragon.invincible > 0) {
          this._spawnExplosion(e.x, e.y, this.DRAGONS[this.selectedDragon].color);
          this.missionProgress++;
          this.crystals += 2;
          return false;
        } else {
          this._takeDamage();
          return false;
        }
      }
      return true;
    });

    // Guard enemies (for dragon rescue)
    this.babyDragons.forEach((bd) => {
      if (!bd.guardEnemy || bd.guardEnemy.hp <= 0) return;
      const ge = bd.guardEnemy;
      if (this._rectOverlap(dx, dy, dw, dh, ge.x, ge.y, ge.w, ge.h)) {
        if (this.abilityActive || this.dragon.invincible > 0) {
          ge.hp--;
          this._spawnExplosion(ge.x, ge.y, "#ff4500");
        } else {
          this._takeDamage();
        }
      }
    });

    // Lightning
    this.lightningBolts.forEach((l) => {
      if (l.warned && l.life < l.warningTime - 200) {
        // Lightning is striking
        if (
          Math.abs(l.x - dcx) < 30 &&
          this.dragon.invincible <= 0
        ) {
          this._takeDamage();
        }
      }
    });
  }

  _rectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  _takeDamage() {
    if (this.dragon.invincible > 0) return;
    this.lives--;
    this.dragon.invincible = 1500;
    this._spawnExplosion(
      this.dragon.x + this.dragon.w / 2,
      this.dragon.y + this.dragon.h / 2,
      "#ff0000",
    );
    if (this.lives <= 0) {
      this._loseMission();
    }
  }

  _spawnCollectParticle(x, y, color) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 400,
        maxLife: 400,
        color,
        size: Math.random() * 4 + 2,
      });
    }
  }

  // ─── Mission Completion ─────────────────────────────────────────────────────
  _checkMissionComplete() {
    switch (this.selectedMission) {
      case "crystal-run":
        if (this.crystals >= this.missionGoal) this._winMission();
        break;
      case "dragon-rescue":
        if (this.rescued >= this.missionGoal) this._winMission();
        break;
      case "sky-battle":
        if (this.missionProgress >= this.missionGoal) this._winMission();
        break;
      case "shrine-puzzle":
        if (this.shrineCurrentIndex >= this.missionGoal) this._winMission();
        break;
      case "storm-escape":
        // Win by surviving – checked in timer
        break;
    }
  }

  _winMission() {
    this.victory = true;
    this.running = false;

    // XP and rewards
    const xpEarned = 20 + this.crystals * 2 + this.currentIsland * 10;
    this.dragonXP += xpEarned;
    const xpToLevel = this.dragonLevel * 100;
    if (this.dragonXP >= xpToLevel) {
      this.dragonXP -= xpToLevel;
      this.dragonLevel++;
      // Unlock dragons at certain levels
      if (this.dragonLevel >= 3 && !this.unlockedDragons.includes("storm")) {
        this.unlockedDragons.push("storm");
      }
      if (this.dragonLevel >= 5 && !this.unlockedDragons.includes("crystal")) {
        this.unlockedDragons.push("crystal");
      }
      if (this.dragonLevel >= 8 && !this.unlockedDragons.includes("shadow")) {
        this.unlockedDragons.push("shadow");
      }
    }

    // Unlock next island
    if (this.currentIsland >= this.islandsUnlocked && this.islandsUnlocked < 5) {
      this.islandsUnlocked++;
    }

    // Update high score
    if (this.crystals > this.highScore) {
      this.highScore = this.crystals;
    }

    // Save progress
    this._saveProgress();

    // Coins and gems rewards
    const coins = this.crystals * 5 + this.currentIsland * 20;
    const gems = Math.floor(this.crystals / 10) + this.currentIsland;

    // Update total crystals
    this.totalCrystals += this.crystals;

    // Show victory screen
    document.getElementById("dr-victory-crystals").textContent = this.crystals;
    const timeSpent = this.missionTime - this.timeRemaining;
    const m = Math.floor(timeSpent / 60);
    const s = timeSpent % 60;
    document.getElementById("dr-victory-time").textContent = `${m}:${s.toString().padStart(2, "0")}`;
    document.getElementById("dr-victory-rescued").textContent = this.rescued;
    document.getElementById("dr-victory-xp").textContent = `+${xpEarned}`;
    document.getElementById("dr-reward-coins").textContent = coins;
    document.getElementById("dr-reward-gems").textContent = gems;

    this._showScreen("victory");
  }

  _loseMission() {
    this.gameOver = true;
    this.running = false;

    if (this.crystals > this.highScore) {
      this.highScore = this.crystals;
    }
    this.totalCrystals += this.crystals;
    this._saveProgress();

    document.getElementById("dr-final-crystals").textContent = this.crystals;
    document.getElementById("dr-final-best").textContent = this.highScore;
    document.getElementById("dr-final-island").textContent = this.currentIsland;

    this._showScreen("gameover");
  }

  _nextMission() {
    // Cycle to next mission or next island
    const missions = [
      "crystal-run",
      "dragon-rescue",
      "sky-battle",
      "shrine-puzzle",
      "storm-escape",
    ];
    const idx = missions.indexOf(this.selectedMission);
    const nextIdx = (idx + 1) % missions.length;
    if (nextIdx === 0 && this.currentIsland < this.islandsUnlocked) {
      this.currentIsland++;
    }
    this.selectedMission = missions[nextIdx];

    // Update button selection
    document.querySelectorAll(".dr-mission-btn").forEach((b) => {
      b.classList.remove("dr-mission-btn--selected");
      if (b.dataset.mission === this.selectedMission) {
        b.classList.add("dr-mission-btn--selected");
      }
    });

    this._startGame();
  }

  _saveProgress() {
    localStorage.setItem("dr_hi", this.highScore.toString());
    localStorage.setItem("dr_dragon_lv", this.dragonLevel.toString());
    localStorage.setItem("dr_dragon_xp", this.dragonXP.toString());
    localStorage.setItem("dr_islands", this.islandsUnlocked.toString());
    localStorage.setItem("dr_total_crystals", this.totalCrystals.toString());
    localStorage.setItem("dr_unlocked", JSON.stringify(this.unlockedDragons));
  }

  // ─── Drawing ────────────────────────────────────────────────────────────────
  _draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient based on mission
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    switch (this.selectedMission) {
      case "crystal-run":
        grad.addColorStop(0, "#0a0a2e");
        grad.addColorStop(0.5, "#1a1060");
        grad.addColorStop(1, "#3a1080");
        break;
      case "dragon-rescue":
        grad.addColorStop(0, "#0a1a2e");
        grad.addColorStop(0.5, "#103060");
        grad.addColorStop(1, "#1a5080");
        break;
      case "sky-battle":
        grad.addColorStop(0, "#1a0a0a");
        grad.addColorStop(0.5, "#3a1020");
        grad.addColorStop(1, "#601030");
        break;
      case "shrine-puzzle":
        grad.addColorStop(0, "#0a1a0a");
        grad.addColorStop(0.5, "#103010");
        grad.addColorStop(1, "#206030");
        break;
      case "storm-escape":
        grad.addColorStop(0, "#0a0a1a");
        grad.addColorStop(0.5, "#202040");
        grad.addColorStop(1, "#303060");
        break;
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5 + this.lastTime * 0.01) % w);
      const sy = ((i * 73.3) % (h * 0.5));
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds
    this._drawClouds();

    // Floating islands
    this._drawIslands();

    // Rings
    this._drawRings();

    // Collectibles
    this._drawCollectibles();

    // Shrine symbols
    this._drawShrineSymbols();

    // Baby dragons
    this._drawBabyDragons();

    // Obstacles
    this._drawObstacles();

    // Enemies
    this._drawEnemies();

    // Lightning
    this._drawLightning();

    // Dragon
    this._drawDragon();

    // Particles (on top)
    this._drawParticles();

    // Mission progress bar
    this._drawProgressBar();
  }

  _drawClouds() {
    const ctx = this.ctx;
    this.clouds.forEach((c) => {
      ctx.save();
      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.size, c.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        c.x - c.size * 0.3,
        c.y - c.size * 0.15,
        c.size * 0.6,
        c.size * 0.35,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        c.x + c.size * 0.35,
        c.y - c.size * 0.1,
        c.size * 0.5,
        c.size * 0.3,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    });
  }

  _drawIslands() {
    const ctx = this.ctx;
    this.islands.forEach((isl) => {
      // Island body
      ctx.fillStyle = "#3d2b1f";
      ctx.beginPath();
      ctx.ellipse(isl.x, isl.y, isl.width, isl.height * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Green top
      ctx.fillStyle = "#228b22";
      ctx.beginPath();
      ctx.ellipse(
        isl.x,
        isl.y - isl.height * 0.2,
        isl.width * 0.9,
        isl.height * 0.35,
        0,
        Math.PI,
        0,
      );
      ctx.fill();

      // Little trees
      ctx.fillStyle = "#006400";
      for (let i = 0; i < 3; i++) {
        const tx = isl.x - isl.width * 0.4 + i * isl.width * 0.4;
        const ty = isl.y - isl.height * 0.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - 8, ty + 15);
        ctx.lineTo(tx + 8, ty + 15);
        ctx.closePath();
        ctx.fill();
      }

      // Glow underneath
      ctx.save();
      ctx.globalAlpha = 0.15;
      const islGrad = ctx.createRadialGradient(
        isl.x,
        isl.y + isl.height,
        0,
        isl.x,
        isl.y + isl.height,
        isl.width,
      );
      islGrad.addColorStop(0, "#ffd700");
      islGrad.addColorStop(1, "transparent");
      ctx.fillStyle = islGrad;
      ctx.fillRect(
        isl.x - isl.width,
        isl.y,
        isl.width * 2,
        isl.height * 3,
      );
      ctx.restore();
    });
  }

  _drawRings() {
    const ctx = this.ctx;
    this.rings.forEach((r) => {
      if (r.collected) return;
      ctx.save();
      // Glow
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 15;
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Crystal in center
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#00e5ff";
      ctx.font = `${r.radius * 0.8}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💎", r.x, r.y);
      ctx.restore();
    });
  }

  _drawCollectibles() {
    const ctx = this.ctx;
    this.collectibles.forEach((c) => {
      ctx.save();
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 10;
      ctx.font = `${c.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💎", c.x, c.y);
      ctx.restore();
    });
  }

  _drawShrineSymbols() {
    const ctx = this.ctx;
    this.shrineSymbols.forEach((s) => {
      ctx.save();
      ctx.shadowColor = s.correct ? "#ffd700" : "#ff4444";
      ctx.shadowBlur = 12;
      ctx.font = `${s.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.symbol, s.x, s.y);

      // Border circle
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // Show current target symbol at top
    if (
      this.selectedMission === "shrine-puzzle" &&
      this.shrineSequence &&
      this.shrineCurrentIndex < this.shrineSequence.length
    ) {
      const ctx2 = this.ctx;
      ctx2.save();
      ctx2.fillStyle = "rgba(0,0,0,0.6)";
      ctx2.fillRect(this.canvas.width / 2 - 80, 50, 160, 40);
      ctx2.fillStyle = "#fff";
      ctx2.font = "16px sans-serif";
      ctx2.textAlign = "center";
      ctx2.textBaseline = "middle";
      ctx2.fillText(
        `Find: ${this.shrineSequence[this.shrineCurrentIndex]}`,
        this.canvas.width / 2,
        70,
      );
      ctx2.restore();
    }
  }

  _drawBabyDragons() {
    const ctx = this.ctx;
    this.babyDragons.forEach((bd) => {
      if (bd.rescued) return;

      // Baby dragon
      ctx.save();
      ctx.shadowColor = "#ff69b4";
      ctx.shadowBlur = 10;
      ctx.font = `${bd.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐣", bd.x, bd.y);
      ctx.restore();

      // Guard enemy
      if (bd.guardEnemy && bd.guardEnemy.hp > 0) {
        const ge = bd.guardEnemy;
        ctx.save();
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8;
        ctx.font = `${ge.w}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("👹", ge.x + ge.w / 2, ge.y + ge.h / 2);
        ctx.restore();
      }
    });
  }

  _drawObstacles() {
    const ctx = this.ctx;
    this.obstacles.forEach((o) => {
      ctx.save();
      if (o.type === "rock") {
        ctx.fillStyle = "#555";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.5, o.y);
        ctx.lineTo(o.x + o.w, o.y + o.h * 0.4);
        ctx.lineTo(o.x + o.w * 0.8, o.y + o.h);
        ctx.lineTo(o.x + o.w * 0.2, o.y + o.h);
        ctx.lineTo(o.x, o.y + o.h * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#777";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Debris
        ctx.fillStyle = "#6b4226";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(o.x + o.w * 0.3, o.y);
        ctx.lineTo(o.x + o.w, o.y + o.h * 0.2);
        ctx.lineTo(o.x + o.w * 0.7, o.y + o.h);
        ctx.lineTo(o.x, o.y + o.h * 0.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });
  }

  _drawEnemies() {
    const ctx = this.ctx;
    this.enemies.forEach((e) => {
      ctx.save();
      ctx.shadowColor = "#ff0044";
      ctx.shadowBlur = 10;
      let emoji = "👾";
      if (e.type === "dark-bird") emoji = "🦇";
      else if (e.type === "storm-wisp") emoji = "👻";
      ctx.font = `${e.w}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, e.x + e.w / 2, e.y + e.h / 2);
      ctx.restore();
    });
  }

  _drawLightning() {
    const ctx = this.ctx;
    this.lightningBolts.forEach((l) => {
      if (!l.warned) {
        // Warning indicator
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(this.lastTime * 0.02) * 0.3;
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(l.x, 0);
        ctx.lineTo(l.x, this.canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else {
        // Lightning bolt
        ctx.save();
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = l.width;
        ctx.beginPath();
        let y = 0;
        ctx.moveTo(l.x, y);
        while (y < this.canvas.height) {
          y += 20 + Math.random() * 30;
          const xOff = (Math.random() - 0.5) * 30;
          ctx.lineTo(l.x + xOff, Math.min(y, this.canvas.height));
        }
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  _drawDragon() {
    if (!this.dragon) return;
    const ctx = this.ctx;
    const d = this.dragon;
    const dragonDef = this.DRAGONS[this.selectedDragon];

    // Invincibility flash
    if (d.invincible > 0 && Math.floor(d.invincible / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();

    const cx = d.x + d.w / 2;
    const cy = d.y + d.h / 2;

    // Glow
    ctx.shadowColor = dragonDef.glowColor;
    ctx.shadowBlur = 20;

    // Body
    ctx.fillStyle = dragonDef.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, d.w * 0.45, d.h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = dragonDef.color;
    ctx.beginPath();
    ctx.ellipse(cx + d.w * 0.35, cy - d.h * 0.1, d.w * 0.2, d.h * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx + d.w * 0.4, cy - d.h * 0.15, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cx + d.w * 0.42, cy - d.h * 0.15, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    const wingAngle = Math.sin(d.wingPhase) * 0.4;
    ctx.fillStyle = dragonDef.wingColor;
    ctx.save();
    ctx.translate(cx - d.w * 0.1, cy - d.h * 0.1);
    ctx.rotate(-0.3 + wingAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-d.w * 0.4, -d.h * 0.8, -d.w * 0.1, -d.h * 0.5);
    ctx.quadraticCurveTo(d.w * 0.05, -d.h * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(cx - d.w * 0.1, cy + d.h * 0.1);
    ctx.rotate(0.3 - wingAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-d.w * 0.4, d.h * 0.8, -d.w * 0.1, d.h * 0.5);
    ctx.quadraticCurveTo(d.w * 0.05, d.h * 0.3, 0, 0);
    ctx.fill();
    ctx.restore();

    // Tail
    ctx.strokeStyle = dragonDef.bodyColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - d.w * 0.4, cy);
    ctx.quadraticCurveTo(
      cx - d.w * 0.7,
      cy + Math.sin(d.wingPhase * 1.5) * 10,
      cx - d.w * 0.8,
      cy - 5,
    );
    ctx.stroke();

    // Ability active visual
    if (this.abilityActive) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = dragonDef.color;
      ctx.beginPath();
      ctx.arc(cx, cy, d.w * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  _drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  _drawProgressBar() {
    const ctx = this.ctx;
    const w = this.canvas.width;

    // Mission progress bar at bottom
    const barW = w * 0.6;
    const barH = 8;
    const barX = (w - barW) / 2;
    const barY = this.canvas.height - 20;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(barX, barY, barW, barH);

    let progress = 0;
    if (this.selectedMission === "storm-escape") {
      progress = 1 - this.timeRemaining / this.missionTime;
    } else if (this.missionGoal > 0) {
      progress = Math.min(1, this.missionProgress / this.missionGoal);
    }

    const progGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    progGrad.addColorStop(0, "#00e5ff");
    progGrad.addColorStop(1, "#ffd700");
    ctx.fillStyle = progGrad;
    ctx.fillRect(barX, barY, barW * progress, barH);

    // Progress text
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    let progressText = "";
    switch (this.selectedMission) {
      case "crystal-run":
        progressText = `Crystals: ${this.crystals}/${this.missionGoal}`;
        break;
      case "dragon-rescue":
        progressText = `Rescued: ${this.rescued}/${this.missionGoal}`;
        break;
      case "sky-battle":
        progressText = `Defeated: ${this.missionProgress}/${this.missionGoal}`;
        break;
      case "shrine-puzzle":
        progressText = `Shrines: ${this.shrineCurrentIndex || 0}/${this.missionGoal}`;
        break;
      case "storm-escape":
        progressText = `Survive!`;
        break;
    }
    ctx.fillText(progressText, w / 2, barY - 4);
  }

  // ─── Close / Cleanup ────────────────────────────────────────────────────────
  _closeGame() {
    this._stopLoop();
    this._unbindInput();
    this.keys = {};
    document.getElementById("dragon-realms-modal").style.display = "none";
    this._showScreen("start");
  }
}
