// Módulo de Juego: Constructor de Oraciones, Ejercicios Interactivos y Práctica de Pronunciación
import { soundService } from "../services/audio.js";
import { speechService } from "../services/speech.js";

export class ExerciseRunner {
  constructor(options) {
    this.container = options.container;
    this.exercises = options.exercises || [];
    this.currentIndex = 0;
    this.onComplete = options.onComplete || (() => {});
    this.onHeartLost = options.onHeartLost || (() => {});
    this.onProgressUpdate = options.onProgressUpdate || (() => {});

    this.selectedWords = [];
    this.availableWords = [];
    this.isAnswerChecked = false;
    this.isMicListening = false;
  }

  start() {
    this.currentIndex = 0;
    this.renderCurrentExercise();
  }

  renderCurrentExercise() {
    this.isAnswerChecked = false;
    this.selectedWords = [];
    this.isMicListening = false;
    if (speechService.stopListening) {
      speechService.stopListening();
    }

    const exercise = this.exercises[this.currentIndex];
    if (!exercise) {
      this.onComplete();
      return;
    }

    this.onProgressUpdate(this.currentIndex, this.exercises.length);

    if (exercise.type === "translate_to_en" || exercise.type === "listen_choose") {
      this.renderWordBuilder(exercise);
    } else if (exercise.type === "multiple_choice") {
      this.renderMultipleChoice(exercise);
    } else if (exercise.type === "word_pair") {
      this.renderWordPair(exercise);
    }
  }

  renderWordBuilder(exercise) {
    const isAudio = exercise.type === "listen_choose";
    const targetSolution = exercise.solution.join(" ");
    this.availableWords = [...exercise.options].sort(() => Math.random() - 0.5);

    const micSupported = speechService.isRecognitionSupported();

    this.container.innerHTML = `
      <div class="exercise-card animate-fade-in">
        <div class="exercise-header">
          <span class="exercise-badge">${isAudio ? "🎧 Desafío Auditivo" : "✍️ Traduce la oración"}</span>
          <div class="header-tools">
            ${micSupported ? `<button class="mic-tool-btn" id="btn-mic-pronounce" title="Practicar pronunciación con tu voz">🎙️ Pronunciar</button>` : ""}
            ${exercise.hint ? `<button class="hint-btn" id="btn-hint" title="Ver pista">💡 Pista</button>` : ""}
          </div>
        </div>

        <div class="prompt-box">
          ${isAudio ? `
            <div class="audio-challenge-row">
              <button class="speaker-btn big-speaker" id="btn-play-normal" title="Escuchar pronunciación">
                🔊 Escuchar
              </button>
              <button class="speaker-btn turtle-speaker" id="btn-play-slow" title="Modo tortuga (lento)">
                🐢 Despacio
              </button>
            </div>
            <p class="prompt-subtext">Selecciona las palabras que escuchas o pronúncialas con tu voz</p>
          ` : `
            <div class="prompt-phrase-row">
              <button class="speaker-btn mini-speaker" id="btn-play-prompt" title="Escuchar pronunciación en inglés">
                🔊
              </button>
              <h3 class="prompt-text">"${exercise.prompt}"</h3>
            </div>
          `}
        </div>

        <div id="hint-alert" class="hint-alert hidden">
          <span>💡 <strong>Pista:</strong> ${exercise.hint || ""}</span>
        </div>

        <!-- Banner de retroalimentación de micrófono / pronunciación -->
        <div id="mic-feedback-box" class="mic-feedback-box hidden">
          <span class="mic-pulse-indicator">🎙️</span>
          <span class="mic-status-text">Escuchando tu voz... Habla en inglés.</span>
        </div>

        <!-- Área de respuesta (donde se colocan las palabras elegidas) -->
        <div class="word-slots-container" id="selected-slot">
          <p class="slot-placeholder" id="slot-placeholder">Toca las palabras de abajo para formar la frase...</p>
        </div>

        <!-- Banco de palabras disponibles -->
        <div class="word-chips-pool" id="words-pool">
          ${this.availableWords.map((word, idx) => `
            <button class="word-chip" data-idx="${idx}" data-word="${word}">${word}</button>
          `).join("")}
        </div>

        <!-- Barra inferior de verificación -->
        <div class="exercise-footer">
          <div id="feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn check-btn" id="btn-check" disabled>
            COMPROBAR
          </button>
        </div>
      </div>
    `;

    // Si es ejercicio de escucha, reproducir pronunciación inicial
    if (isAudio && exercise.sentence) {
      setTimeout(() => {
        speechService.speak(exercise.sentence, false);
      }, 350);
    }

    this.attachWordBuilderEvents(exercise);
  }

  attachWordBuilderEvents(exercise) {
    const hintBtn = this.container.querySelector("#btn-hint");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => {
        soundService.playPop();
        const hintAlert = this.container.querySelector("#hint-alert");
        hintAlert.classList.toggle("hidden");
      });
    }

    const playNormal = this.container.querySelector("#btn-play-normal");
    if (playNormal) {
      playNormal.addEventListener("click", () => {
        speechService.speak(exercise.sentence || exercise.solution.join(" "), false);
      });
    }

    const playSlow = this.container.querySelector("#btn-play-slow");
    if (playSlow) {
      playSlow.addEventListener("click", () => {
        speechService.speak(exercise.sentence || exercise.solution.join(" "), true);
      });
    }

    const playPrompt = this.container.querySelector("#btn-play-prompt");
    if (playPrompt) {
      playPrompt.addEventListener("click", () => {
        speechService.speak(exercise.solution.join(" "), false);
      });
    }

    // Soporte para micrófono y reconocimiento de voz
    const micBtn = this.container.querySelector("#btn-mic-pronounce");
    const micBox = this.container.querySelector("#mic-feedback-box");
    if (micBtn && micBox) {
      micBtn.addEventListener("click", () => {
        soundService.playPop();
        const targetPhrase = exercise.solution.join(" ");

        micBox.classList.remove("hidden");
        micBox.className = "mic-feedback-box listening animate-pop";
        micBox.innerHTML = `
          <span class="mic-pulse-indicator">🔴</span>
          <span class="mic-status-text">Escuchando... Di en voz alta: "<strong>${targetPhrase}</strong>"</span>
        `;

        speechService.startListening({
          lang: "en-US",
          onResult: ({ transcript }) => {
            const evalResult = speechService.evaluatePronunciation(transcript, targetPhrase);
            if (evalResult.isMatch) {
              soundService.playCorrect();
              micBox.className = "mic-feedback-box success animate-pop";
              micBox.innerHTML = `
                <span>🎉</span>
                <span>¡Excelente pronunciación! Dijiste: "<em>${transcript}</em>" (${evalResult.score}%)</span>
              `;
              // Rellenar automáticamente la respuesta correcta
              this.selectedWords = exercise.solution.map((w, idx) => ({ word: w, poolIdx: idx }));
              this.updateSelectedSlot();
              const pool = this.container.querySelector("#words-pool");
              if (pool) {
                pool.querySelectorAll(".word-chip").forEach(c => c.classList.add("used"));
              }
              const checkBtn = this.container.querySelector("#btn-check");
              if (checkBtn) checkBtn.disabled = false;
            } else {
              soundService.playWrong();
              micBox.className = "mic-feedback-box try-again animate-pop";
              micBox.innerHTML = `
                <span>🔄</span>
                <span>Dijiste: "<em>${transcript}</em>". ¡Intenta de nuevo o selecciona las palabras!</span>
              `;
            }
          },
          onError: () => {
            micBox.className = "mic-feedback-box error animate-pop";
            micBox.innerHTML = `
              <span>⚠️</span>
              <span>No se pudo acceder al micrófono o no hubo audio.</span>
            `;
            setTimeout(() => micBox.classList.add("hidden"), 3000);
          }
        });
      });
    }

    const pool = this.container.querySelector("#words-pool");
    const slot = this.container.querySelector("#selected-slot");
    const checkBtn = this.container.querySelector("#btn-check");

    // Click en palabras del banco inferior -> van a la respuesta
    pool.addEventListener("click", (e) => {
      const chip = e.target.closest(".word-chip");
      if (!chip || chip.classList.contains("used") || this.isAnswerChecked) return;

      soundService.playPop();
      const word = chip.dataset.word;
      const idx = chip.dataset.idx;

      chip.classList.add("used");
      this.selectedWords.push({ word, poolIdx: idx });
      this.updateSelectedSlot();
    });

    // Click en palabras ya seleccionadas -> vuelven al banco inferior
    slot.addEventListener("click", (e) => {
      const chip = e.target.closest(".word-chip-selected");
      if (!chip || this.isAnswerChecked) return;

      soundService.playPop();
      const removeIdx = parseInt(chip.dataset.pos, 10);
      const item = this.selectedWords[removeIdx];
      
      const originalChip = pool.querySelector(`.word-chip[data-idx="${item.poolIdx}"]`);
      if (originalChip) {
        originalChip.classList.remove("used");
      }

      this.selectedWords.splice(removeIdx, 1);
      this.updateSelectedSlot();
    });

    checkBtn.addEventListener("click", () => {
      if (!this.isAnswerChecked) {
        this.verifyWordBuilderAnswer(exercise);
      } else {
        this.nextExercise();
      }
    });
  }

  updateSelectedSlot() {
    const slot = this.container.querySelector("#selected-slot");
    const checkBtn = this.container.querySelector("#btn-check");

    if (this.selectedWords.length === 0) {
      slot.innerHTML = `<p class="slot-placeholder" id="slot-placeholder">Toca las palabras de abajo para formar la frase...</p>`;
      checkBtn.disabled = true;
    } else {
      slot.innerHTML = this.selectedWords.map((item, pos) => `
        <button class="word-chip-selected animate-pop" data-pos="${pos}">${item.word}</button>
      `).join("");
      checkBtn.disabled = false;
    }
  }

  verifyWordBuilderAnswer(exercise) {
    this.isAnswerChecked = true;
    const answer = this.selectedWords.map(s => s.word.toLowerCase().replace(/[.,?!]/g, ""));
    const correct = exercise.solution.map(s => s.toLowerCase().replace(/[.,?!]/g, ""));

    const isCorrect = answer.length === correct.length && answer.every((w, i) => w === correct[i]);
    const banner = this.container.querySelector("#feedback-banner");
    const checkBtn = this.container.querySelector("#btn-check");
    banner.classList.remove("hidden");

    if (isCorrect) {
      soundService.playCorrect();
      banner.className = "feedback-banner feedback-success animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">🎉</div>
        <div class="feedback-text">
          <strong>¡Excelente trabajo!</strong>
          <span>"${exercise.solution.join(" ")}"</span>
        </div>
      `;
      speechService.speak(exercise.solution.join(" "), false);
      checkBtn.textContent = "CONTINUAR";
      checkBtn.className = "primary-btn continue-btn success-btn";
    } else {
      soundService.playWrong();
      this.onHeartLost();
      banner.className = "feedback-banner feedback-error animate-slide-up";
      banner.innerHTML = `
        <div class="feedback-icon">💔</div>
        <div class="feedback-text">
          <strong>Solución correcta:</strong>
          <span>${exercise.solution.join(" ")}</span>
        </div>
      `;
      checkBtn.textContent = "ENTENDIDO";
      checkBtn.className = "primary-btn continue-btn error-btn";
    }
  }

  renderMultipleChoice(exercise) {
    this.container.innerHTML = `
      <div class="exercise-card animate-fade-in">
        <div class="exercise-header">
          <span class="exercise-badge">🧠 Opción Múltiple</span>
        </div>

        <div class="prompt-box">
          <h3 class="prompt-text">${exercise.prompt}</h3>
        </div>

        <div class="mc-options-grid" id="mc-options">
          ${exercise.options.map((opt, i) => `
            <button class="mc-option-btn" data-index="${i}">
              <span class="mc-index">${String.fromCharCode(65 + i)}</span>
              <span class="mc-label">${opt}</span>
            </button>
          `).join("")}
        </div>

        <div class="exercise-footer">
          <div id="feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn check-btn" id="btn-check" disabled>
            COMPROBAR
          </button>
        </div>
      </div>
    `;

    let selectedIndex = null;
    const optionsGrid = this.container.querySelector("#mc-options");
    const checkBtn = this.container.querySelector("#btn-check");

    optionsGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".mc-option-btn");
      if (!btn || this.isAnswerChecked) return;

      soundService.playPop();
      optionsGrid.querySelectorAll(".mc-option-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex = parseInt(btn.dataset.index, 10);
      checkBtn.disabled = false;
    });

    checkBtn.addEventListener("click", () => {
      if (!this.isAnswerChecked) {
        this.isAnswerChecked = true;
        const banner = this.container.querySelector("#feedback-banner");
        banner.classList.remove("hidden");

        const isCorrect = selectedIndex === exercise.correctIndex;
        const selectedBtn = optionsGrid.querySelector(`.mc-option-btn[data-index="${selectedIndex}"]`);

        if (isCorrect) {
          soundService.playCorrect();
          selectedBtn.classList.add("correct-choice");
          banner.className = "feedback-banner feedback-success animate-slide-up";
          banner.innerHTML = `
            <div class="feedback-icon">🎉</div>
            <div class="feedback-text">
              <strong>¡Correcto!</strong>
              <span>${exercise.explanation || ""}</span>
            </div>
          `;
          checkBtn.textContent = "CONTINUAR";
          checkBtn.className = "primary-btn continue-btn success-btn";
        } else {
          soundService.playWrong();
          this.onHeartLost();
          selectedBtn.classList.add("wrong-choice");
          const correctBtn = optionsGrid.querySelector(`.mc-option-btn[data-index="${exercise.correctIndex}"]`);
          if (correctBtn) correctBtn.classList.add("correct-choice");

          banner.className = "feedback-banner feedback-error animate-slide-up";
          banner.innerHTML = `
            <div class="feedback-icon">💔</div>
            <div class="feedback-text">
              <strong>Incorrecto.</strong>
              <span>${exercise.explanation || ""}</span>
            </div>
          `;
          checkBtn.textContent = "ENTENDIDO";
          checkBtn.className = "primary-btn continue-btn error-btn";
        }
      } else {
        this.nextExercise();
      }
    });
  }

  renderWordPair(exercise) {
    const pairs = exercise.pairs;
    const esWords = pairs.map(p => p.es).sort(() => Math.random() - 0.5);
    const enWords = pairs.map(p => p.en).sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="exercise-card animate-fade-in">
        <div class="exercise-header">
          <span class="exercise-badge">⚡ Empareja las palabras</span>
        </div>

        <div class="prompt-box">
          <h3 class="prompt-text">${exercise.prompt}</h3>
        </div>

        <div class="pairs-game-container" id="pairs-container">
          <div class="pairs-column" id="col-es">
            ${esWords.map(w => `<button class="pair-tile" data-lang="es" data-word="${w}">${w}</button>`).join("")}
          </div>
          <div class="pairs-column" id="col-en">
            ${enWords.map(w => `<button class="pair-tile" data-lang="en" data-word="${w}">${w}</button>`).join("")}
          </div>
        </div>

        <div class="exercise-footer">
          <div id="feedback-banner" class="feedback-banner hidden"></div>
          <button class="primary-btn check-btn" id="btn-check" disabled>
            CONTINUAR
          </button>
        </div>
      </div>
    `;

    let selectedTile = null;
    let matchesCount = 0;
    const container = this.container.querySelector("#pairs-container");
    const checkBtn = this.container.querySelector("#btn-check");
    const banner = this.container.querySelector("#feedback-banner");

    container.addEventListener("click", (e) => {
      const tile = e.target.closest(".pair-tile");
      if (!tile || tile.classList.contains("matched")) return;

      soundService.playPop();

      if (!selectedTile) {
        selectedTile = tile;
        tile.classList.add("selected");
        if (tile.dataset.lang === "en") {
          speechService.speak(tile.dataset.word, false);
        }
        return;
      }

      if (selectedTile === tile) {
        selectedTile.classList.remove("selected");
        selectedTile = null;
        return;
      }

      if (selectedTile.dataset.lang === tile.dataset.lang) {
        selectedTile.classList.remove("selected");
        selectedTile = tile;
        tile.classList.add("selected");
        if (tile.dataset.lang === "en") {
          speechService.speak(tile.dataset.word, false);
        }
        return;
      }

      // Verificar si forman pareja
      const wordA = selectedTile.dataset.word;
      const wordB = tile.dataset.word;
      const isMatch = pairs.some(p => 
        (p.es === wordA && p.en === wordB) || (p.es === wordB && p.en === wordA)
      );

      if (isMatch) {
        soundService.playComboMatch(matchesCount + 1);
        selectedTile.classList.remove("selected");
        selectedTile.classList.add("matched");
        tile.classList.add("matched");
        selectedTile = null;
        matchesCount++;

        if (matchesCount === pairs.length) {
          soundService.playCorrect();
          banner.classList.remove("hidden");
          banner.className = "feedback-banner feedback-success animate-slide-up";
          banner.innerHTML = `
            <div class="feedback-icon">🎉</div>
            <div class="feedback-text">
              <strong>¡Excelente!</strong>
              <span>Has emparejado todas las palabras correctamente.</span>
            </div>
          `;
          checkBtn.disabled = false;
          checkBtn.className = "primary-btn continue-btn success-btn";
        }
      } else {
        soundService.playWrong();
        tile.classList.add("mismatch");
        selectedTile.classList.add("mismatch");
        setTimeout(() => {
          tile.classList.remove("mismatch", "selected");
          if (selectedTile) selectedTile.classList.remove("mismatch", "selected");
          selectedTile = null;
        }, 500);
      }
    });

    checkBtn.addEventListener("click", () => {
      this.nextExercise();
    });
  }

  nextExercise() {
    this.currentIndex++;
    this.renderCurrentExercise();
  }
}
