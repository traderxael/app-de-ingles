// Minijuego Arcade: Word Fall (Lluvia de Palabras / Reflejos Léxicos)
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class WordFallGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.animationFrameId = null;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.shields = 3;
    this.currentTarget = null;
    this.bubbles = [];
    this.speed = 1.4; // Velocidad base de caída
    this.isRunning = false;
    this.pool = [...CURRICULUM.speedMatchPool];
  }

  start() {
    this.stop();
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.shields = 3;
    this.speed = 1.4;
    this.bubbles = [];
    this.isRunning = true;

    this.renderLayout();
    this.spawnNewRound();
    this.startLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="word-fall-view animate-fade-in">
        <div class="arcade-hud">
          <button class="icon-back-btn" id="btn-exit-wordfall" title="Salir al menú">✕</button>
          <div class="arcade-shields-badge" id="wf-shields">
            ❤️❤️❤️
          </div>
          <div class="arcade-combo-badge" id="wf-combo-box">
            🔥 <span id="wf-combo">x0</span>
          </div>
          <div class="arcade-score-badge">
            ⚡ <span id="wf-score">0</span>
          </div>
        </div>

        <!-- Banner de objetivo -->
        <div class="word-fall-target-card" id="wf-target-card">
          <span class="target-subtext">Toca la burbuja correcta en inglés:</span>
          <h2 class="target-prompt-word" id="wf-target-word">...</h2>
        </div>

        <!-- Zona de juego de caída -->
        <div class="word-fall-arena" id="wf-arena">
          <div class="danger-laser-line"></div>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-exit-wordfall").addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });
  }

  spawnNewRound() {
    if (!this.isRunning) return;

    // Seleccionar una palabra objetivo aleatoria
    const shuffled = [...this.pool].sort(() => Math.random() - 0.5);
    this.currentTarget = shuffled[0];

    const targetEl = this.container.querySelector("#wf-target-word");
    if (targetEl) targetEl.textContent = this.currentTarget.es;

    // Crear 3 o 4 burbujas: 1 correcta y 2 o 3 distractoras
    const arena = this.container.querySelector("#wf-arena");
    if (!arena) return;

    arena.querySelectorAll(".falling-bubble").forEach(b => b.remove());
    this.bubbles = [];

    const choices = [
      { text: this.currentTarget.en, isCorrect: true },
      { text: shuffled[1].en, isCorrect: false },
      { text: shuffled[2].en, isCorrect: false }
    ];
    if (shuffled[3]) {
      choices.push({ text: shuffled[3].en, isCorrect: false });
    }

    choices.sort(() => Math.random() - 0.5);

    const arenaWidth = arena.offsetWidth || 340;
    const laneWidth = (arenaWidth - 40) / choices.length;

    choices.forEach((choice, i) => {
      const bubbleEl = document.createElement("button");
      bubbleEl.className = "falling-bubble animate-pop";
      bubbleEl.textContent = choice.text;

      // Posición horizontal en carriles separados para evitar solapamientos
      const leftPos = Math.floor(15 + i * laneWidth + Math.random() * (laneWidth - 85));
      const initialY = -60 - (Math.random() * 40); // Ligeramente desfasadas en Y

      bubbleEl.style.left = `${leftPos}px`;
      bubbleEl.style.top = `${initialY}px`;

      bubbleEl.addEventListener("click", () => {
        this.handleBubbleClick(choice, bubbleEl);
      });

      arena.appendChild(bubbleEl);

      this.bubbles.push({
        el: bubbleEl,
        x: leftPos,
        y: initialY,
        vy: this.speed + (Math.random() * 0.4),
        choice
      });
    });
  }

  handleBubbleClick(choice, el) {
    if (!this.isRunning) return;

    if (choice.isCorrect) {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      const pts = 15 * Math.min(this.combo, 5);
      this.score += pts;
      soundService.playComboMatch(this.combo);
      speechService.speak(choice.text, false);

      // Aumentar levemente la velocidad cada 3 aciertos
      if (this.score % 45 === 0) {
        this.speed = Math.min(3.6, this.speed + 0.2);
      }

      el.classList.add("popped-success");
      this.updateHud();

      setTimeout(() => {
        this.spawnNewRound();
      }, 250);
    } else {
      soundService.playWrong();
      this.combo = 0;
      this.shields--;
      el.classList.add("popped-wrong");
      this.updateHud();

      if (this.shields <= 0) {
        this.gameOver();
      }
    }
  }

  startLoop() {
    const loop = () => {
      if (!this.isRunning) return;

      const arena = this.container.querySelector("#wf-arena");
      const arenaHeight = arena ? arena.offsetHeight - 55 : 360;

      let missedCorrect = false;

      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        b.y += b.vy;
        b.el.style.top = `${b.y}px`;

        // Si la burbuja tocó el suelo
        if (b.y >= arenaHeight) {
          if (b.choice.isCorrect) {
            missedCorrect = true;
          }
        }
      }

      if (missedCorrect) {
        soundService.playWrong();
        this.combo = 0;
        this.shields--;
        this.updateHud();

        if (this.shields <= 0) {
          this.gameOver();
          return;
        } else {
          this.spawnNewRound();
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  updateHud() {
    const scoreEl = this.container.querySelector("#wf-score");
    const comboEl = this.container.querySelector("#wf-combo");
    const shieldsEl = this.container.querySelector("#wf-shields");

    if (scoreEl) scoreEl.textContent = this.score;
    if (comboEl) comboEl.textContent = `x${this.combo}`;
    if (shieldsEl) {
      let heartsStr = "";
      for (let i = 0; i < 3; i++) {
        heartsStr += i < this.shields ? "❤️" : "🖤";
      }
      shieldsEl.textContent = heartsStr;
    }
  }

  gameOver() {
    this.stop();
    soundService.playFanfare();

    const earnedXp = Math.floor(this.score / 5) + 15;
    const earnedGems = Math.max(5, Math.floor(this.score / 25));

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);
    storageService.recordWordFall(this.score);

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🌧️</div>
        <h2>¡Fin de la Partida!</h2>
        <p class="summary-subtitle">¡Grandes reflejos lingüísticos en Word Fall!</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Puntaje</span>
            <span class="stat-value">⚡ ${this.score}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Mejor Combo</span>
            <span class="stat-value">🔥 x${this.maxCombo}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">XP Ganado</span>
            <span class="stat-value">⚡ +${earnedXp}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Gemas</span>
            <span class="stat-value">💎 +${earnedGems}</span>
          </div>
        </div>

        <div class="action-buttons-column">
          <button class="primary-btn success-btn" id="btn-replay-wf">JUGAR OTRA VEZ</button>
          <button class="secondary-btn" id="btn-exit-wf">VOLVER AL ARCADE</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-replay-wf").addEventListener("click", () => {
      this.start();
    });

    this.container.querySelector("#btn-exit-wf").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }
}
