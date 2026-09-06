// Minijuego: Simulador de Conversación y Roleplay
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";
import { CURRICULUM } from "../data/lessons.js";
import { storageService } from "../services/storage.js";

export class RoleplayGame {
  constructor(container, onExit) {
    this.container = container;
    this.onExit = onExit;
    this.selectedScenario = null;
    this.stepIndex = 0;
    this.totalScore = 0;
    this.messages = [];
  }

  start() {
    this.renderScenarioPicker();
  }

  stop() {
    // Detener cualquier síntesis activa
    if (speechService.stopListening) speechService.stopListening();
  }

  renderScenarioPicker() {
    this.container.innerHTML = `
      <div class="roleplay-view animate-fade-in">
        <div class="roleplay-header">
          <button class="icon-back-btn" id="btn-exit-roleplay" title="Volver al menú">✕</button>
          <h2>Simulador de Conversación</h2>
        </div>
        <p class="roleplay-subtitle">Practica situaciones reales de inmersión conversacional con audio nativo en inglés</p>

        <div class="scenarios-list">
          ${CURRICULUM.roleplays.map(rp => `
            <div class="scenario-card" data-id="${rp.id}">
              <div class="scenario-top">
                <span class="scenario-badge">${rp.difficulty}</span>
                <span class="scenario-avatar">${rp.botAvatar}</span>
              </div>
              <h3 class="scenario-title">${rp.title}</h3>
              <p class="scenario-desc">${rp.scenario}</p>
              <button class="primary-btn start-scenario-btn" data-id="${rp.id}">
                COMENZAR DIÁLOGO 💬
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    this.container.querySelector("#btn-exit-roleplay").addEventListener("click", () => {
      soundService.playPop();
      this.stop();
      this.onExit();
    });

    this.container.querySelectorAll(".start-scenario-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        soundService.playPop();
        const id = btn.dataset.id;
        const scenario = CURRICULUM.roleplays.find(r => r.id === id);
        if (scenario) {
          this.initScenario(scenario);
        }
      });
    });
  }

  initScenario(scenario) {
    this.selectedScenario = scenario;
    this.stepIndex = 0;
    this.totalScore = 0;
    this.messages = [];

    this.container.innerHTML = `
      <div class="roleplay-chat-view animate-fade-in">
        <div class="chat-header">
          <button class="icon-back-btn" id="btn-back-scenarios" title="Volver a escenarios">←</button>
          <div class="bot-info">
            <span class="bot-avatar-circle">${this.selectedScenario.botAvatar}</span>
            <div>
              <h4>${this.selectedScenario.botName}</h4>
              <span class="online-indicator">● En línea</span>
            </div>
          </div>
          <div class="chat-score-badge">⚡ <span id="chat-score">0</span></div>
        </div>

        <div class="chat-messages-container" id="chat-messages"></div>

        <div class="chat-options-container" id="chat-options"></div>
      </div>
    `;

    this.container.querySelector("#btn-back-scenarios").addEventListener("click", () => {
      soundService.playPop();
      this.renderScenarioPicker();
    });

    this.playCurrentStep();
  }

  playCurrentStep() {
    const step = this.selectedScenario.steps[this.stepIndex];
    if (!step) {
      this.finishRoleplay();
      return;
    }

    // El Bot envía el mensaje
    this.addMessage({
      sender: "bot",
      text: step.text,
      translation: step.translation
    });

    // Pronunciar automáticamente con voz nativa
    setTimeout(() => {
      speechService.speak(step.text, false);
    }, 300);

    // Mostrar las opciones de respuesta del usuario
    this.renderUserOptions(step.options);
  }

  addMessage({ sender, text, translation }) {
    const messagesBox = this.container.querySelector("#chat-messages");
    if (!messagesBox) return;

    const msgEl = document.createElement("div");
    msgEl.className = `chat-bubble ${sender === "bot" ? "bot-bubble" : "user-bubble"} animate-pop`;
    msgEl.innerHTML = `
      <div class="bubble-content">
        <p class="bubble-text">${text}</p>
        <span class="bubble-translation">${translation}</span>
      </div>
      <button class="mini-audio-btn" title="Escuchar">🔊</button>
    `;

    msgEl.querySelector(".mini-audio-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      speechService.speak(text, false);
    });

    messagesBox.appendChild(msgEl);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  renderUserOptions(options) {
    const optionsBox = this.container.querySelector("#chat-options");
    if (!optionsBox) return;

    optionsBox.innerHTML = `
      <p class="options-label">Tu turno de responder:</p>
      <div class="options-buttons">
        ${options.map((opt, i) => `
          <div class="chat-option-card-wrapper">
            <button class="chat-option-card" data-idx="${i}">
              <p class="opt-en">${opt.text}</p>
              <span class="opt-es">${opt.translation}</span>
            </button>
            <button class="mini-listen-opt-btn" data-idx="${i}" title="Escuchar antes de responder">🔊</button>
          </div>
        `).join("")}
      </div>
    `;

    // Escuchar opción antes de responder
    optionsBox.querySelectorAll(".mini-listen-opt-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        speechService.speak(options[idx].text, false);
      });
    });

    // Seleccionar opción
    optionsBox.querySelectorAll(".chat-option-card").forEach(btn => {
      btn.addEventListener("click", () => {
        soundService.playPop();
        const idx = parseInt(btn.dataset.idx, 10);
        const choice = options[idx];
        this.handleUserChoice(choice);
      });
    });
  }

  handleUserChoice(choice) {
    const optionsBox = this.container.querySelector("#chat-options");
    optionsBox.innerHTML = ""; // Desactivar opciones mientras procesa

    // Agregar mensaje del usuario
    this.addMessage({
      sender: "user",
      text: choice.text,
      translation: choice.translation
    });

    this.totalScore += choice.score;
    const scoreEl = this.container.querySelector("#chat-score");
    if (scoreEl) scoreEl.textContent = this.totalScore;

    if (choice.score >= 8) {
      soundService.playCorrect();
    } else {
      soundService.playWrong();
      if (choice.warning) {
        const warnEl = document.createElement("div");
        warnEl.className = "roleplay-tip-banner animate-slide-up";
        warnEl.innerHTML = `💡 <strong>Consejo:</strong> ${choice.warning}`;
        const messagesBox = this.container.querySelector("#chat-messages");
        if (messagesBox) messagesBox.appendChild(warnEl);
      }
    }

    // Siguiente paso
    setTimeout(() => {
      if (choice.next === "finish") {
        this.finishRoleplay();
      } else {
        this.stepIndex = choice.next;
        this.playCurrentStep();
      }
    }, 1200);
  }

  finishRoleplay() {
    soundService.playFanfare();
    const earnedGems = 15;
    const earnedXp = this.totalScore + 10;

    storageService.addXp(earnedXp);
    storageService.addGems(earnedGems);
    storageService.recordRoleplayCompleted();

    this.container.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🎉</div>
        <h2>¡Conversación Exitosa!</h2>
        <p class="summary-subtitle">Has interactuado en un escenario real con fluidez y naturalidad</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Puntaje</span>
            <span class="stat-value">⚡ ${this.totalScore} XP</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Recompensa</span>
            <span class="stat-value">💎 +${earnedGems} Gemas</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Fluidez</span>
            <span class="stat-value text-green">⭐⭐⭐ Sobresaliente</span>
          </div>
        </div>

        <div class="action-buttons-column">
          <button class="primary-btn success-btn" id="btn-replay-rp">OTRO ESCENARIO</button>
          <button class="secondary-btn" id="btn-exit-rp-done">VOLVER AL MENÚ</button>
        </div>
      </div>
    `;

    this.container.querySelector("#btn-replay-rp").addEventListener("click", () => {
      this.renderScenarioPicker();
    });

    this.container.querySelector("#btn-exit-rp-done").addEventListener("click", () => {
      this.stop();
      this.onExit();
    });
  }
}
