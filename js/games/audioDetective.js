// Minijuego Arcade: Audio Detective (Discriminación Auditiva y Pares Mínimos)
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class AudioDetectiveGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.challenges = [];
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isAnswered = false;
  }

  start() {
    this.stop();
    const pool = [...CURRICULUM.audioDetectivePool].sort(() => Math.random() - 0.5);
    this.challenges = pool.slice(0, 5);
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;

    this.renderChallenge();
  }

  stop() {
    // Detener cualquier síntesis activa
  }

  renderChallenge() {
    this.isAnswered = false;
    const challenge = this.challenges[this.currentIndex];

    if (!challenge) {
      this.finishGame();
      return;
    }

    this.container.innerHTML = `
      <div class="audio-detective-view animate-fade-in">
        <div class="arcade-hud">
          <button class="icon-back-btn" id="btn-exit-ad" title="Salir al menú">✕</button>
          <div class="ad-counter-badge">
            Pista ${this.currentIndex + 1}/${this.challenges.length}
          </div>
          <div class="arcade-score-badge">
            ⚡ <span id="ad-score">${this.score}</span>
          </div>
        </div>

        <div class="ad-hero-card">
          <div class="detective-icon">🕵️‍♂️</div>
          <h2>Escucha atentamente el misterio</h2>
          <p class="ad-instructions">Identifica cuál de las palabras similares suena en la grabación</p>

          <!-- Reproductor de ondas de audio -->
          <div class="ad-player-box">
            <div class="audio-wave-bars" id="ad-wave">
              <span class="bar"></span><span class="bar"></span><span class="bar"></span>
              <span class="bar"></span><span class="bar"></span><span class="bar"></span>
              <span class="bar"></span><span class="bar"></span><span class="bar"></span>
            </div>

            <div class="ad-audio-controls">
              <button class="primary-btn ad-play-btn" id="btn-play-sentence">
                🔊 Escuchar Frase
              </button>
              <button class="secondary-btn ad-slow-btn" id="btn-play-slow">
                🐢 Despacio
              </button>
              <button class="secondary-btn ad-word-btn" id="btn-play-keyword" title="Escuchar solo la palabra clave">
                🎯 Solo la palabra
              </button>
            </div>
          </div>
        </div>

        <div class="ad-sentence-card">
          <p class="ad-sentence-text">"${challenge.blankSentence}"</p>
        </div>

        <!-- Opciones de palabras fonéticamente similares -->
        <div class="ad-options-grid" id="ad-options">
          ${challenge.options.map((opt, idx) => `
            <button class="ad-option-card animate-pop" data-idx="${idx}">
              <span class="ad-opt-num">${String.fromCharCode(65 + idx)}</span>
              <span class="ad-opt-word">${opt}</span>
              <button class="mini-listen-btn" data-word="${opt}" title="Escuchar">🔊</button>
            </button>
          `).join("")}
        </div>

        <div class="exercise-footer">
          <div id="ad-feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn continue-btn hidden" id="btn-ad-continue">
            CONTINUAR
          </button>
        </div>
      </div>
    `;

    // Reproducir automáticamente la frase al entrar
    setTimeout(() => {
      this.playSentence(challenge.fullSentence, false);
    }, 350);

    this.attachEvents(challenge);
  }

  attachEvents(challenge) {
    const exitBtn = this.container.querySelector("#btn-exit-ad");
    exitBtn.addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });

    const playBtn = this.container.querySelector("#btn-play-sentence");
    playBtn.addEventListener("click", () => {
      this.playSentence(challenge.fullSentence, false);
    });

    const slowBtn = this.container.querySelector("#btn-play-slow");
    slowBtn.addEventListener("click", () => {
      this.playSentence(challenge.fullSentence, true);
    });

    const keywordBtn = this.container.querySelector("#btn-play-keyword");
    keywordBtn.addEventListener("click", () => {
      this.playSentence(challenge.targetWord, false);
    });

    // Escuchar palabras individuales de las opciones
    this.container.querySelectorAll(".mini-listen-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        speechService.speak(btn.dataset.word, false);
      });
    });

    // Selección de respuesta
    const optionsGrid = this.container.querySelector("#ad-options");
    const banner = this.container.querySelector("#ad-feedback-banner");
    const continueBtn = this.container.querySelector("#btn-ad-continue");

    optionsGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".ad-option-card");
      if (!card || this.isAnswered) return;

      const idx = parseInt(card.dataset.idx, 10);
      this.verifyAnswer(challenge, idx, card);
    });

    continueBtn.addEventListener("click", () => {
      this.currentIndex++;
      this.renderChallenge();
    });
  }

  playSentence(text, slow = false) {
    const wave = this.container.querySelector("#ad-wave");
    if (wave) wave.classList.add("animating");

    speechService.speak(text, slow);

    setTimeout(() => {
      if (wave) wave.classList.remove("animating");
    }, slow ? 2200 : 1500);
  }

  verifyAnswer(challenge, selectedIdx, cardEl) {
    this.isAnswered = true;
    const isCorrect = selectedIdx === challenge.correctIndex;
    const banner = this.container.querySelector("#ad-feedback-banner");
    const continueBtn = this.container.querySelector("#btn-ad-continue");
    const optionsGrid = this.container.querySelector("#ad-options");

    banner.classList.remove("hidden");
    continueBtn.classList.remove("hidden");

    if (isCorrect) {
      soundService.playCorrect();
      cardEl.classList.add("correct-choice");
      this.score += 25;
      this.correctCount++;

      banner.className = "feedback-banner feedback-success animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">🎉</div>
        <div class="feedback-text">
          <strong>¡Oído de detective! (+25 pts)</strong>
          <span>La palabra era "<strong>${challenge.targetWord}</strong>". ${challenge.phoneticHint}</span>
        </div>
      `;
    } else {
      soundService.playWrong();
      cardEl.classList.add("wrong-choice");

      const correctCard = optionsGrid.querySelector(`.ad-option-card[data-idx="${challenge.correctIndex}"]`);
      if (correctCard) correctCard.classList.add("correct-choice");

      banner.className = "feedback-banner feedback-error animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">💔</div>
        <div class="feedback-text">
          <strong>La palabra era "<strong>${challenge.targetWord}</strong>":</strong>
          <span>${challenge.phoneticHint}</span>
        </div>
      `;
    }

    const scoreEl = this.container.querySelector("#ad-score");
    if (scoreEl) scoreEl.textContent = this.score;
  }

  finishGame() {
    this.stop();
    soundService.playFanfare();

    const earnedXp = this.score + 10;
    const earnedGems = Math.max(5, Math.floor(this.score / 20));

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);
    storageService.recordAudioDetective(this.score);

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🎧</div>
        <h2>¡Caso Resuelto, Detective!</h2>
        <p class="summary-subtitle">Tu agudeza para distinguir sonidos sutiles en inglés está en nivel experto</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Puntaje</span>
            <span class="stat-value">⚡ ${this.score}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Aciertos</span>
            <span class="stat-value text-green">🎯 ${this.correctCount}/5</span>
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
          <button class="primary-btn success-btn" id="btn-replay-ad">JUGAR OTRA VEZ</button>
          <button class="secondary-btn" id="btn-exit-ad-done">VOLVER AL ARCADE</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-replay-ad").addEventListener("click", () => {
      this.start();
    });

    this.container.querySelector("#btn-exit-ad-done").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }
}
