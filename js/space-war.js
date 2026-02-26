// ═══════════════════════════════════════════════════════════════
//  SPACE WAR GAME
// ═══════════════════════════════════════════════════════════════
class SpaceWarGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animFrame = null;
    this.running = false;
    this.paused = false;
    this.gameOver = false;
    this.started = false; // waiting for first action

    // Game objects
    this.ship = null;
    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.stars = [];

    // Input
    this.keys = {};
    this.touchStartX = null;
    this.lastShot = 0;
    this.shootCooldown = 280; // ms between bullets

    // Progression
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("sw_hi") || "0");
    this.level = 1;
    this.lives = 3;
    this.wave = 0;

    // Timing
    this.lastTime = 0;
    this.enemyTimer = 0;
    this.enemyInterval = 1400; // ms between spawns (decreases)
    this.levelTimer = 0;

    this._keyDown = this._keyDown.bind(this);
    this._keyUp = this._keyUp.bind(this);
    this._touchStart = this._touchStart.bind(this);
    this._touchMove = this._touchMove.bind(this);
    this._touchEnd = this._touchEnd.bind(this);
    this._resize = this._resize.bind(this);

    // Audio
    this.ac = null;

    this._setupModal();
  }

  // ─── Modal Wiring ─────────────────────────────────────────────────────────

  _setupModal() {
    document
      .getElementById("space-war-option")
      .addEventListener("click", () => {
        document.getElementById("more-games-modal").style.display = "none";
        document.getElementById("space-war-modal").style.display = "flex";
        this._initCanvas();
      });

    document
      .getElementById("close-space-war-modal")
      .addEventListener("click", () => {
        this._closeGame();
      });

    document
      .getElementById("space-war-modal")
      .addEventListener("click", (e) => {
        if (e.target === document.getElementById("space-war-modal"))
          this._closeGame();
      });

    document.getElementById("sw-start-btn").addEventListener("click", () => {
      this._startGame();
    });

    document.getElementById("sw-restart-btn").addEventListener("click", () => {
      this._startGame();
    });

    document.getElementById("sw-menu-btn").addEventListener("click", () => {
      this._showScreen("start");
    });

    // Mobile shoot button
    const mobileShoot = document.getElementById("sw-mobile-shoot");
    mobileShoot.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._shoot(performance.now());
      },
      { passive: false },
    );
    mobileShoot.addEventListener("click", () => this._shoot(performance.now()));

    // Detect touch device → show shoot button
    window.addEventListener(
      "touchstart",
      () => {
        mobileShoot.style.display = "flex";
      },
      { once: true },
    );
  }

  // ─── Canvas ───────────────────────────────────────────────────────────────

  _initCanvas() {
    this.canvas = document.getElementById("sw-canvas");
    this.ctx = this.canvas.getContext("2d");
    this._resize();
    this._generateStars();
    this._showScreen("start");
  }

  _resize() {
    if (!this.canvas) return;
    const wrap = document.getElementById("sw-canvas-wrap");
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    if (this.ship) {
      this.ship.x = Math.min(this.ship.x, w - this.ship.w / 2);
      this.ship.y = h - 80;
    }
    this._generateStars();
  }

  _generateStars() {
    this.stars = [];
    const W = this.canvas.width;
    const H = this.canvas.height;
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        spd: Math.random() * 0.6 + 0.15,
        alp: Math.random() * 0.6 + 0.3,
      });
    }
  }

  // ─── Screen Management ────────────────────────────────────────────────────

  /** @param {'start'|'playing'|'over'} name */
  _showScreen(name) {
    document.getElementById("sw-start-screen").style.display =
      name === "start" ? "flex" : "none";
    document.getElementById("sw-overlay").style.display =
      name === "playing" ? "block" : "none";
    document.getElementById("sw-gameover-screen").style.display =
      name === "over" ? "flex" : "none";

    if (name !== "playing") {
      this._stopLoop();
    }
  }

  // ─── Start / Reset ────────────────────────────────────────────────────────

  _startGame() {
    const W = this.canvas.width;
    const H = this.canvas.height;

    this.ship = {
      x: W / 2,
      y: H - 80,
      w: 44,
      h: 52,
      spd: 5.5,
      trail: [],
    };

    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.wave = 0;
    this.lastTime = 0;
    this.enemyTimer = 0;
    this.enemyInterval = 1400;
    this.levelTimer = 0;
    this.gameOver = false;
    this.paused = false;
    this.running = true;

    this._updateHUD();
    this._showScreen("playing");
    this._initAudio();
    this._attachInput();
    this._startLoop();
  }

  _closeGame() {
    this._stopLoop();
    this._detachInput();
    document.getElementById("space-war-modal").style.display = "none";
    this._showScreen("start");
    this.running = false;
    this.gameOver = false;
  }

  // ─── Game Loop ────────────────────────────────────────────────────────────

  _startLoop() {
    this.lastTime = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      const dt = Math.min(now - this.lastTime, 50);
      this.lastTime = now;
      if (!this.paused && !this.gameOver) this._update(dt, now);
      this._draw();
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  _stopLoop() {
    this.running = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  _update(dt, now) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    // ── Level progression
    this.levelTimer += dt;
    if (this.levelTimer > 18000) {
      // every 18 s go up a level
      this.levelTimer = 0;
      this.level++;
      this.enemyInterval = Math.max(420, this.enemyInterval - 100);
      this._playSound("levelup");
    }

    // ── Move ship
    const spd = this.ship.spd;
    if (
      (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) &&
      this.ship.x > this.ship.w / 2
    )
      this.ship.x -= spd;
    if (
      (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) &&
      this.ship.x < W - this.ship.w / 2
    )
      this.ship.x += spd;
    if (
      (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) &&
      this.ship.y > this.ship.h / 2 + 10
    )
      this.ship.y -= spd * 0.8;
    if (
      (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) &&
      this.ship.y < H - this.ship.h / 2 - 4
    )
      this.ship.y += spd * 0.8;

    // Ship trail
    this.ship.trail.unshift({
      x: this.ship.x,
      y: this.ship.y + this.ship.h / 2,
    });
    if (this.ship.trail.length > 8) this.ship.trail.pop();

    // ── Auto-shoot on held Space/Enter  (keyboard handled in keydown)

    // ── Spawn enemies
    this.enemyTimer += dt;
    if (this.enemyTimer >= this.enemyInterval) {
      this.enemyTimer = 0;
      this.wave++;
      this._spawnEnemy(W, now);
    }

    // ── Move bullets
    this.bullets = this.bullets.filter((b) => b.y > -10);
    this.bullets.forEach((b) => {
      b.y -= b.spd;
      b.trail.unshift({ x: b.x, y: b.y });
      if (b.trail.length > 6) b.trail.pop();
    });

    // ── Move enemies
    this.enemies = this.enemies.filter((e) => e.y < H + 60);
    this.enemies.forEach((e) => {
      e.y += e.spd;
      e.x += Math.sin(e.wobble + now * 0.001 * e.wobbleSpd) * e.wobbleAmp;
      e.angle = Math.sin(now * 0.002 * e.wobbleSpd) * 0.18;
      e.glow = (Math.sin(now * 0.004) + 1) / 2;
    });

    // ── Particles
    this.particles = this.particles.filter((p) => p.life > 0);
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.life -= 1.8;
      p.r *= 0.96;
    });

    // ── Stars scroll
    this.stars.forEach((s) => {
      s.y += s.spd;
      if (s.y > H) {
        s.y = 0;
        s.x = Math.random() * W;
      }
    });

    // ── Collisions: bullet ↔ enemy
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const b = this.bullets[bi];
        const e = this.enemies[ei];
        if (!b || !e) continue;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < e.r + 6) {
          this._explode(e.x, e.y, e.color);
          this.enemies.splice(ei, 1);
          this.bullets.splice(bi, 1);
          const pts = e.type === "boss" ? 50 : e.type === "fast" ? 20 : 10;
          this.score += pts;
          this._playSound("explosion");
          this._updateHUD();
          break;
        }
      }
    }

    // ── Collisions: enemy ↔ ship
    for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
      const e = this.enemies[ei];
      const dx = e.x - this.ship.x;
      const dy = e.y - this.ship.y;
      if (Math.sqrt(dx * dx + dy * dy) < e.r + 18) {
        this._explode(e.x, e.y, e.color);
        this._explode(this.ship.x, this.ship.y, "#00ffff");
        this.enemies.splice(ei, 1);
        this.lives--;
        this._playSound("hit");
        this._updateHUD();
        if (this.lives <= 0) {
          this._triggerGameOver();
          return;
        }
        // brief invincibility flash handled visually via particles
      }
    }

    // ── Enemies that reach the bottom are silently removed (no life penalty)
    // (already handled by the filter at the top of _update)
  }

  // ─── Spawn ────────────────────────────────────────────────────────────────

  _spawnEnemy(W, now) {
    // Decide type based on wave & level
    const roll = Math.random();
    let type, color, r, spd, hp;

    if (this.level >= 4 && roll < 0.12) {
      type = "boss";
      color = "#ff2277";
      r = 32;
      spd = 1.1 + this.level * 0.12;
      hp = 1;
      this._playSound("boss");
    } else if (roll < 0.3) {
      type = "fast";
      color = "#ffaa00";
      r = 16;
      spd = 2.8 + this.level * 0.18;
      hp = 1;
    } else {
      type = "basic";
      color = "#7c3aff";
      r = 20;
      spd = 1.4 + this.level * 0.12;
      hp = 1;
    }

    this.enemies.push({
      x: Math.random() * (W - r * 2) + r,
      y: -r - 10,
      r,
      spd,
      type,
      color,
      hp,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpd: Math.random() * 0.8 + 0.4,
      wobbleAmp: type === "fast" ? 0.6 : type === "boss" ? 0.3 : 1.2,
      angle: 0,
      glow: 0,
    });
  }

  // ─── Shoot ────────────────────────────────────────────────────────────────

  _shoot(now) {
    if (!this.running || this.gameOver || this.paused) return;
    if (now - this.lastShot < this.shootCooldown) return;
    this.lastShot = now;

    this.bullets.push({
      x: this.ship.x,
      y: this.ship.y - this.ship.h / 2,
      spd: 16.5,
      trail: [],
    });
    this._playSound("laser");
  }

  // ─── Particles ────────────────────────────────────────────────────────────

  _explode(x, y, color) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.4;
      const spd = Math.random() * 4 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1,
        r: Math.random() * 5 + 2,
        life: Math.random() * 40 + 25,
        color,
      });
    }
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────

  _draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // ── Background
    ctx.fillStyle = "#020816";
    ctx.fillRect(0, 0, W, H);

    // ── Nebula glow
    const ng = ctx.createRadialGradient(
      W * 0.3,
      H * 0.4,
      0,
      W * 0.3,
      H * 0.4,
      W * 0.55,
    );
    ng.addColorStop(0, "rgba(60,0,120,0.18)");
    ng.addColorStop(0.5, "rgba(20,0,60,0.10)");
    ng.addColorStop(1, "transparent");
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, W, H);

    // ── Stars
    this.stars.forEach((s) => {
      ctx.save();
      ctx.globalAlpha = s.alp;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (!this.running && !this.gameOver) return;

    // ── Particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 60);
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ── Bullets
    this.bullets.forEach((b) => {
      // Trail
      b.trail.forEach((pt, i) => {
        ctx.save();
        ctx.globalAlpha = (1 - i / b.trail.length) * 0.45;
        ctx.fillStyle = "#00ffff";
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#00ffff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 - i * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Bullet head
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#00ffff";
      const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 7);
      bg.addColorStop(0, "#fff");
      bg.addColorStop(0.4, "#00ffff");
      bg.addColorStop(1, "transparent");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ── Enemies
    this.enemies.forEach((e) => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);

      // Glow
      ctx.shadowBlur = 22 + e.glow * 14;
      ctx.shadowColor = e.color;

      if (e.type === "boss") {
        this._drawBoss(ctx, e.r, e.color, e.glow);
      } else if (e.type === "fast") {
        this._drawFastEnemy(ctx, e.r, e.color, e.glow);
      } else {
        this._drawBasicEnemy(ctx, e.r, e.color, e.glow);
      }
      ctx.restore();
    });

    // ── Ship trail
    if (this.ship) {
      this.ship.trail.forEach((pt, i) => {
        ctx.save();
        ctx.globalAlpha = (1 - i / this.ship.trail.length) * 0.35;
        ctx.fillStyle = "#00e5ff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00e5ff";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Ship
      this._drawShip(ctx, this.ship.x, this.ship.y, this.ship.w, this.ship.h);
    }
  }

  // ─── Draw helpers ─────────────────────────────────────────────────────────

  _drawShip(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    // Engine glow
    const eg = ctx.createRadialGradient(0, h * 0.42, 0, 0, h * 0.42, h * 0.35);
    eg.addColorStop(0, "rgba(0,220,255,0.9)");
    eg.addColorStop(0.4, "rgba(0,120,255,0.4)");
    eg.addColorStop(1, "transparent");
    ctx.fillStyle = eg;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.38, w * 0.22, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hull gradient
    const hg = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    hg.addColorStop(0, "#b0eaff");
    hg.addColorStop(0.4, "#4fc3f7");
    hg.addColorStop(1, "#0055a5");
    ctx.fillStyle = hg;
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00e5ff";

    // Main body
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, h / 2 - 8);
    ctx.quadraticCurveTo(w * 0.28, h / 2, 0, h / 2 - 4);
    ctx.quadraticCurveTo(-w * 0.28, h / 2, -w / 2, h / 2 - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.fillStyle = "rgba(0,180,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, h * 0.05);
    ctx.lineTo(-w * 0.72, h * 0.48);
    ctx.lineTo(-w * 0.18, h * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.05);
    ctx.lineTo(w * 0.72, h * 0.48);
    ctx.lineTo(w * 0.18, h * 0.38);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    const cg = ctx.createRadialGradient(0, -h * 0.1, 0, 0, -h * 0.1, h * 0.22);
    cg.addColorStop(0, "rgba(200,240,255,0.95)");
    cg.addColorStop(0.5, "rgba(60,180,255,0.7)");
    cg.addColorStop(1, "rgba(0,80,180,0.3)");
    ctx.fillStyle = cg;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, w * 0.18, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawBasicEnemy(ctx, r, color, glow) {
    // Saucer shape
    const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g1.addColorStop(0, "#fff");
    g1.addColorStop(0.3, color);
    g1.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = g1;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dome
    const dg = ctx.createRadialGradient(
      -r * 0.2,
      -r * 0.22,
      0,
      0,
      -r * 0.1,
      r * 0.55,
    );
    dg.addColorStop(0, "rgba(255,255,255,0.9)");
    dg.addColorStop(0.5, color);
    dg.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.18, r * 0.5, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lights ring
    for (let i = 0; i < 6; i++) {
      const a = ((Math.PI * 2) / 6) * i;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.18, 3, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#fff" : "#ffee00";
      ctx.fill();
    }
  }

  _drawFastEnemy(ctx, r, color, glow) {
    // Arrow / comet shape
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.3, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.6, r * 0.6);
    ctx.lineTo(0, r * 0.2);
    ctx.lineTo(-r * 0.6, r * 0.6);
    ctx.closePath();
    ctx.fill();

    // Core dot
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawBoss(ctx, r, color, glow) {
    // Spiky star + rotating ring
    ctx.fillStyle = color;

    // Outer spikes
    const spikes = 8;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = (Math.PI / spikes) * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.52;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    sg.addColorStop(0, "#fff");
    sg.addColorStop(0.3, color);
    sg.addColorStop(1, "#440020");
    ctx.fillStyle = sg;
    ctx.fill();

    // Core
    const cg = ctx.createRadialGradient(-r * 0.15, -r * 0.15, 0, 0, 0, r * 0.4);
    cg.addColorStop(0, "#ffffff");
    cg.addColorStop(0.5, color);
    cg.addColorStop(1, "#220010");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff2277";
    ctx.beginPath();
    ctx.arc(r * 0.04, r * 0.04, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── HUD ──────────────────────────────────────────────────────────────────

  _updateHUD() {
    const scoreEl = document.getElementById("sw-score");
    const livesEl = document.getElementById("sw-lives");
    const levelEl = document.getElementById("sw-level");
    if (scoreEl) scoreEl.textContent = this.score;
    if (levelEl) levelEl.textContent = this.level;
    if (livesEl) {
      livesEl.textContent = "";
      for (let i = 0; i < this.lives; i++) livesEl.textContent += "❤️";
    }
  }

  // ─── Game Over ────────────────────────────────────────────────────────────

  _triggerGameOver() {
    this.gameOver = true;
    this.running = false;
    this._playSound("gameover");
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("sw_hi", this.highScore);
    }
    cancelAnimationFrame(this.animFrame);
    this._draw(); // final frame

    document.getElementById("sw-final-score").textContent = this.score;
    document.getElementById("sw-final-hi").textContent = this.highScore;
    document.getElementById("sw-final-level").textContent = this.level;
    setTimeout(() => this._showScreen("over"), 400);
    this._detachInput();
  }

  // ─── Audio Synthesis ──────────────────────────────────────────────────────

  _initAudio() {
    if (this.ac) return;
    try {
      this.ac = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.ac = null;
    }
  }

  _playSound(name) {
    if (!this.ac) return;
    if (this.ac.state === "suspended") this.ac.resume();
    const ac = this.ac;
    const t = ac.currentTime;

    switch (name) {
      case "laser": {
        // Quick sci-fi zap — square wave sweep down
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.07);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }

      case "explosion": {
        // White-noise burst + low thump
        const bufLen = Math.ceil(ac.sampleRate * 0.22);
        const buffer = ac.createBuffer(1, bufLen, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const src = ac.createBufferSource();
        src.buffer = buffer;
        const filt = ac.createBiquadFilter();
        filt.type = "bandpass";
        filt.frequency.value = 420;
        filt.Q.value = 0.7;
        const gn = ac.createGain();
        gn.gain.setValueAtTime(0.55, t);
        gn.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        src.connect(filt);
        filt.connect(gn);
        gn.connect(ac.destination);
        src.start(t);
        // Low thump sine sweep
        const osc = ac.createOscillator();
        const g2 = ac.createGain();
        osc.connect(g2);
        g2.connect(ac.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.2);
        g2.gain.setValueAtTime(0.65, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }

      case "hit": {
        // Harsh distorted thud — ship taking damage
        const osc = ac.createOscillator();
        const dist = ac.createWaveShaper();
        const gain = ac.createGain();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          curve[i] = ((Math.PI + 180) * x) / (Math.PI + 180 * Math.abs(x));
        }
        dist.curve = curve;
        osc.connect(dist);
        dist.connect(gain);
        gain.connect(ac.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.28);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }

      case "levelup": {
        // Bright ascending arpeggio C5-E5-G5-C6
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.type = "triangle";
          osc.frequency.value = freq;
          const st = t + i * 0.1;
          gain.gain.setValueAtTime(0, st);
          gain.gain.linearRampToValueAtTime(0.28, st + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.14);
          osc.start(st);
          osc.stop(st + 0.14);
        });
        break;
      }

      case "gameover": {
        // Descending dramatic tones
        [440, 370, 294, 220, 147].forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.type = "sawtooth";
          osc.frequency.value = freq;
          const st = t + i * 0.18;
          gain.gain.setValueAtTime(0.28, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);
          osc.start(st);
          osc.stop(st + 0.2);
        });
        break;
      }

      case "boss": {
        // Low pulsing alarm warning
        const osc = ac.createOscillator();
        const lfo = ac.createOscillator();
        const lfoG = ac.createGain();
        const gain = ac.createGain();
        lfo.connect(lfoG);
        lfoG.connect(gain.gain);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = "square";
        osc.frequency.value = 110;
        lfo.type = "sine";
        lfo.frequency.value = 9;
        lfoG.gain.value = 0.28;
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc.start(t);
        osc.stop(t + 0.55);
        lfo.start(t);
        lfo.stop(t + 0.55);
        break;
      }
    }
  }

  // ─── Input ────────────────────────────────────────────────────────────────

  _attachInput() {
    document.addEventListener("keydown", this._keyDown);
    document.addEventListener("keyup", this._keyUp);
    const cv = this.canvas;
    cv.addEventListener("touchstart", this._touchStart, { passive: false });
    cv.addEventListener("touchmove", this._touchMove, { passive: false });
    cv.addEventListener("touchend", this._touchEnd, { passive: false });
    window.addEventListener("resize", this._resize);
  }

  _detachInput() {
    document.removeEventListener("keydown", this._keyDown);
    document.removeEventListener("keyup", this._keyUp);
    if (this.canvas) {
      this.canvas.removeEventListener("touchstart", this._touchStart);
      this.canvas.removeEventListener("touchmove", this._touchMove);
      this.canvas.removeEventListener("touchend", this._touchEnd);
    }
    window.removeEventListener("resize", this._resize);
  }

  _keyDown(e) {
    this.keys[e.key] = true;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._shoot(performance.now());
    }
  }

  _keyUp(e) {
    this.keys[e.key] = false;
  }

  // ── Touch controls: drag to move ship, tap to shoot ──
  _touchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this._touchLastX = t.clientX;
    this._touchLastY = t.clientY;
    this._touchMoved = false;
    // If tap (not drag) fire immediately on touchend
  }

  _touchMove(e) {
    e.preventDefault();
    if (!this.ship) return;
    const t = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;

    // Move ship to finger position
    const canvasX = (t.clientX - rect.left) * scaleX;
    this.ship.x = Math.max(
      this.ship.w / 2,
      Math.min(this.canvas.width - this.ship.w / 2, canvasX),
    );
    this._touchMoved = true;
    this._touchLastX = t.clientX;
    this._touchLastY = t.clientY;
  }

  _touchEnd(e) {
    e.preventDefault();
    // Tap (no significant move) → shoot
    if (!this._touchMoved) {
      this._shoot(performance.now());
    }
    this._touchMoved = false;
  }
}
