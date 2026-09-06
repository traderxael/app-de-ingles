// Minijuego y Repaso SRS: Flashcards Inteligentes 3D con Soporte de Categorías
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class FlashcardsGame {
  constructor(container, onExit, category = "all") {
    this.container = container;
    this.onExit = onExit;
    this.selectedCategory = category;
    this.deck = [];
    this.currentIndex = 0;
    this.masteredCount = 0;
    this.reviewCount = 0;
    this.isFlipped = false;
  }

  start(category = "all") {
    this.selectedCategory = category;
    let pool = [...CURRICULUM.flashcards];
    if (this.selectedCategory !== "all") {
      pool = pool.filter(c => c.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    this.deck = pool.sort(() => Math.random() - 0.5);
    this.currentIndex = 0;
    this.masteredCount = 0;
    this.reviewCount = 0;
    this.renderCard();
  }

  stop() {
    if (speechService.stopListening) speechService.stopListening();
  }

  renderCard() {
    this.isFlipped = false;
    const card = this.deck[this.currentIndex];

    if (!card) {
      this.renderSummary();
      return;
    }

    const progressPct = Math.round(((this.currentIndex) / this.deck.length) * 100);

    this.container.innerHTML = `
      <div class="flashcards-view animate-fade-in">
        <div class="flashcard-top-bar">
          <button class="icon-back-btn" id="btn-exit-fc" title="Salir al menú">✕</button>
          <div class="fc-progress-wrapper">
            <div class="fc-progress-bar" style="width: ${progressPct}%"></div>
          </div>
          <span class="fc-counter">${this.currentIndex + 1}/${this.deck.length}</span>
        </div>

        <div class="fc-category-badge">${card.category}</div>

        <!-- Tarjeta 3D que gira al tocar -->
        <div class="flip-card-container" id="flip-card-box">
          <div class="flip-card-inner" id="card-inner">
            
            <!-- Cara frontal (Inglés) -->
            <div class="flip-card-front">
              <span class="tap-hint">Toca para voltear 🔄</span>
              <h2 class="fc-word">${card.word}</h2>
              <span class="fc-phonetic">${card.phonetic}</span>
              <button class="speaker-btn fc-speaker" id="btn-fc-audio" title="Escuchar pronunciación">
                🔊 Escuchar
              </button>
            </div>

            <!-- Cara trasera (Español & Ejemplo) -->
            <div class="flip-card-back">
              <span class="tap-hint">Significado en español</span>
              <h2 class="fc-translation">${card.translation}</h2>
              <div class="fc-example-box">
                <p class="fc-example-en">"${card.example}"</p>
              </div>
              <button class="speaker-btn fc-speaker mini" id="btn-fc-example-audio">
                🔊 Escuchar ejemplo
              </button>
            </div>

          </div>
        </div>

        <!-- Botones de Repetición Espaciada (SRS) -->
        <div class="fc-actions-row">
          <button class="fc-action-btn btn-wrong" id="btn-fc-hard" title="Marcar para repasar">
            <span>👎</span>
            <strong>Repasar</strong>
          </button>
          <button class="fc-action-btn btn-flip" id="btn-fc-flip" title="Voltear tarjeta">
            <span>🔄</span>
            <strong>Voltear</strong>
          </button>
          <button class="fc-action-btn btn-correct" id="btn-fc-easy" title="Marcar como aprendida">
            <span>👍</span>
            <strong>¡Me la sé!</strong>
          </button>
        </div>
      </div>
    `;

    // Reproducir pronunciación inicial
    setTimeout(() => {
      speechService.speak(card.word, false);
    }, 200);

    this.attachCardEvents(card);
  }

  attachCardEvents(card) {
    const cardBox = this.container.querySelector("#flip-card-box");
    const cardInner = this.container.querySelector("#card-inner");
    const flipBtn = this.container.querySelector("#btn-fc-flip");
    const audioBtn = this.container.querySelector("#btn-fc-audio");
    const exampleAudioBtn = this.container.querySelector("#btn-fc-example-audio");
    const hardBtn = this.container.querySelector("#btn-fc-hard");
    const easyBtn = this.container.querySelector("#btn-fc-easy");
    const exitBtn = this.container.querySelector("#btn-exit-fc");

    const flipCard = () => {
      soundService.playPop();
      this.isFlipped = !this.isFlipped;
      cardInner.classList.toggle("flipped", this.isFlipped);
    };

    cardBox.addEventListener("click", (e) => {
      if (e.target.closest(".speaker-btn")) return;
      flipCard();
    });

    flipBtn.addEventListener("click", flipCard);

    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      speechService.speak(card.word, false);
    });

    if (exampleAudioBtn) {
      exampleAudioBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        speechService.speak(card.example, false);
      });
    }

    exitBtn.addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });

    hardBtn.addEventListener("click", () => {
      soundService.playWrong();
      storageService.recordCardReview(card.id, false);
      this.reviewCount++;
      // Reinsertar tarjeta al final del mazo para practicarla de nuevo
      this.deck.push(card);
      this.nextCard();
    });

    easyBtn.addEventListener("click", () => {
      soundService.playCorrect();
      storageService.recordCardReview(card.id, true);
      this.masteredCount++;
      this.nextCard();
    });
  }

  nextCard() {
    this.currentIndex++;
    this.renderCard();
  }

  renderSummary() {
    soundService.playFanfare();
    const earnedXp = this.masteredCount * 3 + 12;
    const earnedGems = 6;

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🃏</div>
        <h2>¡Sesión de Repaso Completada!</h2>
        <p class="summary-subtitle">Tu memoria a largo plazo se está fortaleciendo</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Aprendidas</span>
            <span class="stat-value text-green">✨ ${this.masteredCount}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Para Repasar</span>
            <span class="stat-value text-orange">🔄 ${this.reviewCount}</span>
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
          <button class="primary-btn success-btn" id="btn-repeat-fc">REPASAR OTRA VEZ</button>
          <button class="secondary-btn" id="btn-exit-fc-summary">VOLVER AL MENÚ</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-repeat-fc").addEventListener("click", () => {
      this.start(this.selectedCategory);
    });

    this.container.querySelector("#btn-exit-fc-summary").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }
}
