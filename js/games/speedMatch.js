// Minijuego Arcade: Speed Match (Match Madness Contrarreloj)
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class SpeedMatchGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.timer = null;
    this.timeLeft = 45;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.matches = 0;
    this.activePairs = [];
    this.selectedTile = null;
    this.pool = [...CURRICULUM.speedMatchPool];
  }

  start() {
    this.stop();
    this.timeLeft = 45;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.matches = 0;
    this.selectedTile = null;
    this.pool = [...CURRICULUM.speedMatchPool];

    this.renderGameLayout();
    this.loadNewTiles(5); // 5 pares iniciales activos
    this.startTimer();
  }

  renderGameLayout() {
    this.container.innerHTML = `
      <div class="speed-match-view animate-fade-in">
        <div class="arcade-hud">
          <button class="icon-back-btn" id="btn-exit-arcade" title="Salir al menú">✕</button>
          <div class="arcade-timer-badge">
            ⏱️ <span id="arcade-timer">${this.timeLeft}s</span>
          </div>
          <div class="arcade-combo-badge" id="arcade-combo-box">
            🔥 <span id="arcade-combo">x0</span>
          </div>
          <div class="arcade-score-badge">
            ⚡ <span id="arcade-score">0</span>
          </div>
        </div>

        <div class="arcade-instructions">
          <p>¡Empareja la palabra en español con su significado en inglés lo más rápido que puedas!</p>
        </div>

        <div class="speed-match-grid" id="speed-tiles-grid"></div>
      </div>
    `;

    this.container.querySelector("#btn-exit-arcade").addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });
  }

  loadNewTiles(count) {
    const grid = this.container.querySelector("#speed-tiles-grid");
    if (!grid) return;

    // Tomar palabras aleatorias del banco sin repetir si es posible
    const shuffledPool = [...this.pool].sort(() => Math.random() - 0.5);
    const selectedPairs = shuffledPool.slice(0, count);
    this.activePairs = selectedPairs;

    // Crear fichas separadas para inglés y español y mezclarlas
    const tiles = [];
    selectedPairs.forEach((pair, idx) => {
      tiles.push({ id: `p-${idx}-es`, pairId: idx, lang: "es", text: pair.es });
      tiles.push({ id: `p-${idx}-en`, pairId: idx, lang: "en", text: pair.en });
    });

    tiles.sort(() => Math.random() - 0.5);

    grid.innerHTML = tiles.map(tile => `
      <button class="speed-tile animate-pop" 
              data-id="${tile.id}" 
              data-pair-id="${tile.pairId}" 
              data-lang="${tile.lang}" 
              data-text="${tile.text}">
        ${tile.text}
      </button>
    `).join("");

    this.attachTileEvents();
  }

  attachTileEvents() {
    const grid = this.container.querySelector("#speed-tiles-grid");
    if (!grid) return;

    grid.onclick = (e) => {
      const tile = e.target.closest(".speed-tile");
      if (!tile || tile.classList.contains("matched")) return;

      soundService.playPop();

      if (!this.selectedTile) {
        this.selectedTile = tile;
        tile.classList.add("selected");
        if (tile.dataset.lang === "en") {
          speechService.speak(tile.dataset.text, false);
        }
        return;
      }

      if (this.selectedTile === tile) {
        this.selectedTile.classList.remove("selected");
        this.selectedTile = null;
        return;
      }

      // Si seleccionó dos del mismo idioma, cambiar foco
      if (this.selectedTile.dataset.lang === tile.dataset.lang) {
        this.selectedTile.classList.remove("selected");
        this.selectedTile = tile;
        tile.classList.add("selected");
        if (tile.dataset.lang === "en") {
          speechService.speak(tile.dataset.text, false);
        }
        return;
      }

      // Comparar pares
      const isMatch = this.selectedTile.dataset.pairId === tile.dataset.pairId;

      if (isMatch) {
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.matches++;

        const pointsEarned = 10 * Math.min(this.combo, 4);
        this.score += pointsEarned;

        soundService.playComboMatch(this.combo);

        this.selectedTile.classList.remove("selected");
        this.selectedTile.classList.add("matched");
        tile.classList.add("matched");

        this.updateHud();

        // Si se limpiaron todos los pares en pantalla, cargar una nueva ronda
        const remaining = grid.querySelectorAll(".speed-tile:not(.matched)").length;
        if (remaining === 0) {
          setTimeout(() => {
            this.loadNewTiles(5);
          }, 350);
        }

        this.selectedTile = null;
      } else {
        // Fallo: rompe el combo
        this.combo = 0;
        soundService.playWrong();
        this.updateHud();

        tile.classList.add("mismatch");
        this.selectedTile.classList.add("mismatch");

        setTimeout(() => {
          tile.classList.remove("mismatch", "selected");
          if (this.selectedTile) this.selectedTile.classList.remove("mismatch", "selected");
          this.selectedTile = null;
        }, 400);
      }
    };
  }

  updateHud() {
    const scoreEl = this.container.querySelector("#arcade-score");
    const comboEl = this.container.querySelector("#arcade-combo");
    const comboBox = this.container.querySelector("#arcade-combo-box");

    if (scoreEl) scoreEl.textContent = this.score;
    if (comboEl) comboEl.textContent = `x${this.combo}`;

    if (comboBox) {
      if (this.combo >= 3) {
        comboBox.classList.add("super-combo");
      } else {
        comboBox.classList.remove("super-combo");
      }
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      const timerEl = this.container.querySelector("#arcade-timer");
      if (timerEl) {
        timerEl.textContent = `${this.timeLeft}s`;
        if (this.timeLeft <= 10) {
          timerEl.classList.add("urgent-timer");
        }
      }

      if (this.timeLeft <= 0) {
        this.stop();
        this.gameOver();
      }
    }, 1000);
  }

  gameOver() {
    this.stop();
    soundService.playFanfare();
    const earnedXp = Math.floor(this.score / 5) + 15;
    const earnedGems = Math.max(5, Math.floor(this.score / 20));

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);
    storageService.recordSpeedMatch(this.score, this.maxCombo);

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🏆</div>
        <h2>¡Tiempo Agotado!</h2>
        <p class="summary-subtitle">Gran demostración de velocidad léxica</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Puntos</span>
            <span class="stat-value">⚡ ${this.score}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Parejas</span>
            <span class="stat-value">🎯 ${this.matches}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Mejor Combo</span>
            <span class="stat-value">🔥 x${this.maxCombo}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Gemas Ganadas</span>
            <span class="stat-value">💎 +${earnedGems}</span>
          </div>
        </div>

        <div class="action-buttons-column">
          <button class="primary-btn success-btn" id="btn-replay-arcade">JUGAR OTRA VEZ</button>
          <button class="secondary-btn" id="btn-back-main">VOLVER AL INICIO</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-replay-arcade").addEventListener("click", () => {
      this.start();
    });

    this.container.querySelector("#btn-back-main").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
