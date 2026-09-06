// Minijuego Arcade: Sentence Scramble (Desafío de Orden Sintáctico Contrarreloj)
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class SentenceScrambleGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.rounds = [];
    this.currentRoundIdx = 0;
    this.score = 0;
    this.timer = null;
    this.roundTimeLeft = 30;
    this.selectedTokens = [];
    this.availableTokens = [];
    this.isRoundChecked = false;
  }

  start() {
    this.stop();
    // Tomar 5 oraciones al azar del banco
    const pool = [...CURRICULUM.sentenceScramblePool].sort(() => Math.random() - 0.5);
    this.rounds = pool.slice(0, 5);
    this.currentRoundIdx = 0;
    this.score = 0;

    this.renderRound();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  renderRound() {
    this.stop();
    this.isRoundChecked = false;
    this.selectedTokens = [];
    this.roundTimeLeft = 30;

    const round = this.rounds[this.currentRoundIdx];
    if (!round) {
      this.finishGame();
      return;
    }

    // Mezclar las fichas de palabras
    this.availableTokens = [...round.solution].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="scramble-view animate-fade-in">
        <div class="arcade-hud">
          <button class="icon-back-btn" id="btn-exit-scramble" title="Salir al menú">✕</button>
          <div class="scramble-round-badge">
            Ronda ${this.currentRoundIdx + 1}/${this.rounds.length}
          </div>
          <div class="arcade-timer-badge">
            ⏱️ <span id="sc-timer">${this.roundTimeLeft}s</span>
          </div>
          <div class="arcade-score-badge">
            ⚡ <span id="sc-score">${this.score}</span>
          </div>
        </div>

        <div class="scramble-prompt-card">
          <span class="sc-prompt-label">Ordena las palabras en inglés para traducir:</span>
          <h3 class="sc-prompt-text">"${round.prompt}"</h3>
          ${round.hint ? `<button class="hint-btn" id="btn-sc-hint">💡 Pista gramatical</button>` : ""}
        </div>

        <div id="sc-hint-alert" class="hint-alert hidden">
          <span>💡 <strong>Consejo:</strong> ${round.hint || ""}</span>
        </div>

        <!-- Área de armado de la oración -->
        <div class="scramble-slot-container" id="sc-slot">
          <p class="slot-placeholder">Toca las fichas de abajo en el orden correcto...</p>
        </div>

        <!-- Banco de fichas disponibles -->
        <div class="scramble-tokens-pool" id="sc-pool">
          ${this.availableTokens.map((word, idx) => `
            <button class="scramble-chip animate-pop" data-idx="${idx}" data-word="${word}">${word}</button>
          `).join("")}
        </div>

        <div class="exercise-footer">
          <div id="sc-feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn check-btn" id="btn-sc-check" disabled>
            COMPROBAR ORACIÓN
          </button>
        </div>
      </div>
    `;

    this.attachEvents(round);
    this.startTimer();
  }

  attachEvents(round) {
    const exitBtn = this.container.querySelector("#btn-exit-scramble");
    exitBtn.addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });

    const hintBtn = this.container.querySelector("#btn-sc-hint");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        soundService.playPop();
        const hintAlert = this.container.querySelector("#sc-hint-alert");
        hintAlert.classList.toggle("hidden");
      });
    }

    const pool = this.container.querySelector("#sc-pool");
    const slot = this.container.querySelector("#sc-slot");
    const checkBtn = this.container.querySelector("#btn-sc-check");

    // Click en ficha del banco -> va a la oración
    pool.addEventListener("click", (e) => {
      const chip = e.target.closest(".scramble-chip");
      if (!chip || chip.classList.contains("used") || this.isRoundChecked) return;

      soundService.playPop();
      const word = chip.dataset.word;
      const idx = chip.dataset.idx;

      chip.classList.add("used");
      this.selectedTokens.push({ word, poolIdx: idx });
      this.updateSlotView();
    });

    // Click en ficha seleccionada -> vuelve al banco
    slot.addEventListener("click", (e) => {
      const chip = e.target.closest(".scramble-chip-selected");
      if (!chip || this.isRoundChecked) return;

      soundService.playPop();
      const pos = parseInt(chip.dataset.pos, 10);
      const item = this.selectedTokens[pos];

      const originalChip = pool.querySelector(`.scramble-chip[data-idx="${item.poolIdx}"]`);
      if (originalChip) originalChip.classList.remove("used");

      this.selectedTokens.splice(pos, 1);
      this.updateSlotView();
    });

    checkBtn.addEventListener("click", () => {
      if (!this.isRoundChecked) {
        this.verifySentence(round);
      } else {
        this.currentRoundIdx++;
        this.renderRound();
      }
    });
  }

  updateSlotView() {
    const slot = this.container.querySelector("#sc-slot");
    const checkBtn = this.container.querySelector("#btn-sc-check");

    if (this.selectedTokens.length === 0) {
      slot.innerHTML = `<p class="slot-placeholder">Toca las fichas de abajo en el orden correcto...</p>`;
      checkBtn.disabled = true;
    } else {
      slot.innerHTML = this.selectedTokens.map((item, pos) => `
        <button class="scramble-chip-selected animate-pop" data-pos="${pos}">${item.word}</button>
      `).join("");
      checkBtn.disabled = false;
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.roundTimeLeft--;
      const timerEl = this.container.querySelector("#sc-timer");
      if (timerEl) {
        timerEl.textContent = `${this.roundTimeLeft}s`;
        if (this.roundTimeLeft <= 8) {
          timerEl.classList.add("urgent-timer");
        }
      }

      if (this.roundTimeLeft <= 0) {
        this.stop();
        this.timeoutRound();
      }
    }, 1000);
  }

  verifySentence(round) {
    this.stop();
    this.isRoundChecked = true;

    const answer = this.selectedTokens.map(s => s.word.toLowerCase().replace(/[.,?!]/g, ""));
    const correct = round.solution.map(s => s.toLowerCase().replace(/[.,?!]/g, ""));

    const isCorrect = answer.length === correct.length && answer.every((w, i) => w === correct[i]);
    const banner = this.container.querySelector("#sc-feedback-banner");
    const checkBtn = this.container.querySelector("#btn-sc-check");
    banner.classList.remove("hidden");

    if (isCorrect) {
      soundService.playCorrect();
      const points = 20 + this.roundTimeLeft;
      this.score += points;

      banner.className = "feedback-banner feedback-success animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">🎉</div>
        <div class="feedback-text">
          <strong>¡Sintaxis perfecta! (+${points} pts)</strong>
          <span>"${round.solution.join(" ")}"</span>
        </div>
      `;
      speechService.speak(round.solution.join(" "), false);
      checkBtn.textContent = "SIGUIENTE ORACIÓN";
      checkBtn.className = "primary-btn continue-btn success-btn";
    } else {
      soundService.playWrong();
      banner.className = "feedback-banner feedback-error animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">💔</div>
        <div class="feedback-text">
          <strong>Orden correcto:</strong>
          <span>"${round.solution.join(" ")}"</span>
        </div>
      `;
      speechService.speak(round.solution.join(" "), false);
      checkBtn.textContent = "CONTINUAR";
      checkBtn.className = "primary-btn continue-btn error-btn";
    }

    const scoreEl = this.container.querySelector("#sc-score");
    if (scoreEl) scoreEl.textContent = this.score;
  }

  timeoutRound() {
    const round = this.rounds[this.currentRoundIdx];
    this.isRoundChecked = true;

    soundService.playWrong();
    const banner = this.container.querySelector("#sc-feedback-banner");
    const checkBtn = this.container.querySelector("#btn-sc-check");
    banner.classList.remove("hidden");

    banner.className = "feedback-banner feedback-error animate-slide-up";
    banner.innerHTML = `
      <div class="feedback-icon">⏱️</div>
      <div class="feedback-text">
        <strong>¡Tiempo agotado! La oración era:</strong>
        <span>"${round.solution.join(" ")}"</span>
      </div>
    `;
    speechService.speak(round.solution.join(" "), false);
    checkBtn.textContent = "CONTINUAR";
    checkBtn.className = "primary-btn continue-btn error-btn";
    checkBtn.disabled = false;
  }

  finishGame() {
    this.stop();
    soundService.playFanfare();

    const earnedXp = Math.floor(this.score / 4) + 15;
    const earnedGems = Math.max(5, Math.floor(this.score / 20));

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);
    storageService.recordSentenceScramble(this.score);

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🧩</div>
        <h2>¡Desafío Sintáctico Completado!</h2>
        <p class="summary-subtitle">Tu dominio de la estructura oracional en inglés se ha fortalecido</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Puntaje Total</span>
            <span class="stat-value">⚡ ${this.score}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Rondas</span>
            <span class="stat-value">🎯 5/5</span>
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
          <button class="primary-btn success-btn" id="btn-replay-sc">JUGAR OTRA VEZ</button>
          <button class="secondary-btn" id="btn-exit-sc">VOLVER AL ARCADE</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-replay-sc").addEventListener("click", () => {
      this.start();
    });

    this.container.querySelector("#btn-exit-sc").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }
}
