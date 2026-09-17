// Módulo de Juego: Exámenes (por unidad y final global) - LingoQuest English
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";

export class ExamRunner {
  constructor(options) {
    this.container = options.container;
    this.title = options.title || "Examen";
    this.questions = options.questions || [];
    this.passThreshold = options.passThreshold || 0.7;
    this.currentIndex = 0;
    this.score = 0;
    this.isAnswerChecked = false;
    this.wrongQuestions = [];
    this.onComplete = options.onComplete || (() => {});
    this.onProgressUpdate = options.onProgressUpdate || (() => {});
  }

  start() {
    this.currentIndex = 0;
    this.score = 0;
    this.renderQuestion();
  }

  stop() {
    if (speechService && speechService.stopListening) speechService.stopListening();
  }

  renderQuestion() {
    this.isAnswerChecked = false;
    const q = this.questions[this.currentIndex];
    if (!q) {
      this.showResults();
      return;
    }
    this.onProgressUpdate(this.currentIndex, this.questions.length);

    this.container.innerHTML = `
      <div class="exercise-card animate-fade-in">
        <div class="exercise-header">
          <span class="exercise-badge">📝 ${this.title}</span>
          <span class="exercise-badge" style="background:rgba(255,200,0,.15);color:#B8860B;">Pregunta ${this.currentIndex + 1}/${this.questions.length}</span>
        </div>

        <div class="prompt-box">
          <h3 class="prompt-text">${q.prompt}</h3>
        </div>

        <div class="mc-options-grid" id="mc-options">
          ${q.options.map((opt, i) => `
            <button class="mc-option-btn" data-index="${i}">
              <span class="mc-index">${String.fromCharCode(65 + i)}</span>
              <span class="mc-label">${opt}</span>
            </button>
          `).join("")}
        </div>

        <div class="exercise-footer">
          <div id="feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn check-btn" id="btn-check" disabled>COMPROBAR</button>
        </div>
      </div>
    `;

    let selectedIndex = null;
    const grid = this.container.querySelector("#mc-options");
    const checkBtn = this.container.querySelector("#btn-check");

    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".mc-option-btn");
      if (!btn || this.isAnswerChecked) return;
      soundService.playPop();
      grid.querySelectorAll(".mc-option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex = parseInt(btn.dataset.index, 10);
      checkBtn.disabled = false;
    });

    checkBtn.addEventListener("click", () => {
      if (!this.isAnswerChecked) {
        this.isAnswerChecked = true;
        const banner = this.container.querySelector("#feedback-banner");
        banner.classList.remove("hidden");
        const isCorrect = selectedIndex === q.correctIndex;
        const selBtn = grid.querySelector(`.mc-option-btn[data-index="${selectedIndex}"]`);

        if (isCorrect) {
          this.score++;
          soundService.playCorrect();
          selBtn.classList.add("correct-choice");
          banner.className = "feedback-banner feedback-success animate-slide-up";
          banner.innerHTML = `
            <div class="feedback-icon">🎉</div>
            <div class="feedback-text">
              <strong>¡Correcto!</strong>
              <span>${q.explanation || ""}</span>
            </div>
          `;
        } else {
          soundService.playWrong();
          selBtn.classList.add("wrong-choice");
          const corrBtn = grid.querySelector(`.mc-option-btn[data-index="${q.correctIndex}"]`);
          if (corrBtn) corrBtn.classList.add("correct-choice");
          banner.className = "feedback-banner feedback-error animate-slide-up";
          banner.innerHTML = `
            <div class="feedback-icon">💔</div>
            <div class="feedback-text">
              <strong>Incorrecto.</strong>
              <span>${q.explanation || ""}</span>
            </div>
          `;
          this.wrongQuestions.push({
            prompt: q.prompt,
            options: [...q.options],
            correctIndex: q.correctIndex,
            explanation: q.explanation || ""
          });
        }
        const isLast = this.currentIndex === this.questions.length - 1;
        checkBtn.textContent = isLast ? "VER RESULTADOS" : "CONTINUAR";
        checkBtn.className = "primary-btn continue-btn " + (isCorrect ? "success-btn" : "error-btn");
      } else {
        this.nextQuestion();
      }
    });
  }

  nextQuestion() {
    this.currentIndex++;
    this.renderQuestion();
  }

  showResults() {
    const total = this.questions.length;
    const score = this.score;
    const pct = total ? Math.round((score / total) * 100) : 0;
    const passed = pct >= this.passThreshold * 100;
    this.onProgressUpdate(total, total);

    if (passed) {
      soundService.playFanfare();
    } else {
      soundService.playWrong();
    }

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">${passed ? "🏆" : "📚"}</div>
        <h2>${passed ? "¡Examen Aprobado!" : "Sigue practicando"}</h2>
        <p class="summary-subtitle">${passed ? "¡Demostraste que dominas este contenido!" : "Necesitas 70% para aprobar. ¡Inténtalo de nuevo!"}</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Aciertos</span>
            <span class="stat-value">${score}/${total}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Calificación</span>
            <span class="stat-value">${pct}%</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Estado</span>
            <span class="stat-value ${passed ? "text-green" : "text-orange"}">${passed ? "Aprobado" : "Reprobado"}</span>
          </div>
        </div>

        <div class="action-buttons-column">
          <button class="primary-btn ${passed ? "success-btn" : ""}" id="btn-finish-exam">CONTINUAR</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-finish-exam").addEventListener("click", () => {
      this.onComplete({ score, total, pct, passed, wrongQuestions: this.wrongQuestions });
    });
  }
}
