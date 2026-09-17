// Controlador Principal de la Aplicación Móvil LingoQuest English Pro
import { CURRICULUM } from "./data/lessons.js";
import { soundService } from "./services/audio.js";
import { speechService } from "./services/speech.js";
import { storageService } from "./services/storage.js";
import { ExerciseRunner } from "./games/wordBuilder.js";
import { SpeedMatchGame } from "./games/speedMatch.js";
import { FlashcardsGame } from "./games/flashcards.js";
import { RoleplayGame } from "./games/roleplay.js";
import { WordFallGame } from "./games/wordFall.js";
import { SentenceScrambleGame } from "./games/sentenceScramble.js";
import { AudioDetectiveGame } from "./games/audioDetective.js";
import { ExamRunner } from "./games/examRunner.js";
import { notificationService } from "./services/notifications.js";

class App {
  constructor() {
    this.currentView = "view-learn";
    this.activeExerciseRunner = null;
    this.activeArcadeGame = null;
    this.selectedVocabCategory = "all";
    this.examDifficultyFilter = "all";
    this.examSortOrder = "recent";
    this.examSearchQuery = "";
    this.init();
  }

  init() {
    this.applyTheme(storageService.getState().theme);
    this.updateHud();
    this.setupNavigation();
    this.setupHudControls();
    this.setupDesktopFrameToggle();
    this.renderLearningPath();
    this.setupExamCenter();
    this.setupArcadeCards();
    this.setupLeaderboardTab();
    this.setupReviewTab();
    this.setupProfileTab();
    this.setupAvatarPicker();
    this.setupModals();
    this.setupDashboard();
    this.setupNotifications();
    notificationService.init();
  }

  setupNotifications() {
    const toggle = document.getElementById("notif-toggle-input");
    if (!toggle) return;

    const state = storageService.getState();
    toggle.checked = state.notificationsEnabled === true;

    toggle.addEventListener("change", async () => {
      if (toggle.checked) {
        const result = await notificationService.requestPermission();
        if (!result.granted) {
          toggle.checked = false;
          alert("No se pudieron activar las notificaciones. Revisa los permisos del navegador para este sitio.");
          return;
        }
        storageService.setNotificationsEnabled(true);
        soundService.playCorrect();
        alert("¡Notificaciones activadas! Te recordaremos diariamente completar tus exámenes. 🔔");
      } else {
        storageService.setNotificationsEnabled(false);
        soundService.playPop();
      }
    });
  }

  // =========================================================================
  // Control de HUD y Estado
  // =========================================================================
  updateHud() {
    const state = storageService.getState();
    const streakEl = document.getElementById("hud-streak-val");
    const gemsEl = document.getElementById("hud-gems-val");
    const heartsEl = document.getElementById("hud-hearts-val");
    const overlayHeartsEl = document.getElementById("overlay-hearts-val");

    if (streakEl) streakEl.textContent = state.streak;
    if (gemsEl) gemsEl.textContent = state.gems;
    if (heartsEl) heartsEl.textContent = `${state.hearts}/${state.maxHearts}`;
    if (overlayHeartsEl) overlayHeartsEl.textContent = `❤️ ${state.hearts}`;
  }

  setupHudControls() {
    const soundBtn = document.getElementById("btn-sound-toggle");
    const themeBtn = document.getElementById("btn-theme-toggle");
    const heartsBtn = document.getElementById("hud-hearts-btn");

    const state = storageService.getState();
    if (soundBtn) soundBtn.textContent = state.soundEnabled ? "🔊" : "🔇";

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        const enabled = storageService.toggleSound();
        soundService.toggle(enabled);
        soundBtn.textContent = enabled ? "🔊" : "🔇";
        if (enabled) soundService.playPop();
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        soundService.playPop();
        const nextTheme = storageService.toggleTheme();
        this.applyTheme(nextTheme);
      });
    }

    if (heartsBtn) {
      heartsBtn.addEventListener("click", () => {
        soundService.playPop();
        this.switchView("view-profile");
      });
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeBtn = document.getElementById("btn-theme-toggle");
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }

  setupDesktopFrameToggle() {
    const btn = document.getElementById("btn-toggle-frame");
    const wrapper = document.getElementById("device-wrapper");
    if (btn && wrapper) {
      btn.addEventListener("click", () => {
        soundService.playPop();
        wrapper.classList.toggle("full-screen-mode");
      });
    }
  }

  // =========================================================================
  // Navegación entre Vistas (Bottom Nav)
  // =========================================================================
  setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const targetView = item.dataset.view;
        soundService.playPop();
        this.switchView(targetView);
      });
    });
  }

  switchView(viewId) {
    this.currentView = viewId;
    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active-view"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const activeViewEl = document.getElementById(viewId);
    const activeNavBtn = document.querySelector(`.nav-item[data-view="${viewId}"]`);

    if (activeViewEl) activeViewEl.classList.add("active-view");
    if (activeNavBtn) activeNavBtn.classList.add("active");

    if (viewId === "view-profile") {
      this.updateProfileStats();
    } else if (viewId === "view-review") {
      this.updateReviewStats();
    } else if (viewId === "view-learn") {
      this.updateDailyGoalBanner();
    } else if (viewId === "view-leaderboard") {
      this.renderLeaderboard();
    } else if (viewId === "view-dashboard") {
      this.renderDashboard();
    }
  }

  // =========================================================================
  // VISTA 1: RUTA DE APRENDIZAJE (LEARNING PATH)
  // =========================================================================
  renderLearningPath() {
    const container = document.getElementById("learning-path-container");
    if (!container) return;

    container.innerHTML = "";
    const state = storageService.getState();
    this.updateDailyGoalBanner();

    CURRICULUM.units.forEach((unit, unitIdx) => {
      const unitSection = document.createElement("div");
      unitSection.className = "unit-section";
      unitSection.style.setProperty("--unit-color", unit.color);

      unitSection.innerHTML = `
        <div class="unit-banner">
          <div class="unit-info">
            <h4>${unit.title}</h4>
            <p>${unit.description}</p>
          </div>
          <span class="unit-icon-badge">${unit.icon}</span>
        </div>
        <div class="path-nodes-flow" id="nodes-flow-${unit.id}"></div>
      `;

      const nodesFlow = unitSection.querySelector(`#nodes-flow-${unit.id}`);

      unit.lessons.forEach((lesson, lessonIdx) => {
        const isCompleted = state.completedLessons.includes(lesson.id);
        const isUnlocked = isCompleted || (unitIdx === 0 && lessonIdx === 0) || (lessonIdx > 0 && state.completedLessons.includes(unit.lessons[lessonIdx - 1].id)) || (lessonIdx === 0 && unitIdx > 0 && state.completedLessons.includes(CURRICULUM.units[unitIdx - 1].lessons.slice(-1)[0].id));

        const nodeWrapper = document.createElement("div");
        nodeWrapper.className = "path-node-wrapper";

        let nodeClass = "node-btn";
        let icon = "⭐";

        if (isCompleted) {
          nodeClass += " completed";
          icon = "👑";
        } else if (!isUnlocked) {
          nodeClass += " locked";
          icon = "🔒";
        }

        nodeWrapper.innerHTML = `
          ${isCompleted ? `<span class="node-crown">👑</span>` : ""}
          <button class="${nodeClass}" data-lesson-id="${lesson.id}" data-unlocked="${isUnlocked}">
            ${icon}
          </button>
          <span class="node-label">${lesson.title}</span>
        `;

        const btn = nodeWrapper.querySelector(".node-btn");
        btn.addEventListener("click", () => {
          if (!isUnlocked) {
            soundService.playWrong();
            alert("🔒 Completa las lecciones anteriores para desbloquear esta unidad.");
            return;
          }
          this.startLesson(lesson);
        });

        nodesFlow.appendChild(nodeWrapper);
      });

      container.appendChild(unitSection);

      // Nodo de Examen al final de cada unidad
      const unitExamId = `exam-${unit.id}`;
      const examUnlocked = unit.lessons.every(l => storageService.isLessonCompleted(l.id));
      const examPassed = storageService.isExamCompleted(unitExamId);

      const examNode = document.createElement("div");
      examNode.className = "path-node-wrapper exam-node";
      examNode.innerHTML = `
        ${examPassed ? `<span class="node-crown">👑</span>` : ""}
        <button class="node-btn ${examPassed ? "completed" : ""} ${!examUnlocked ? "locked" : ""}"
          style="--node-color: var(--color-purple); --node-shadow: var(--color-purple-dark);">
          ${examPassed ? "👑" : examUnlocked ? "📝" : "🔒"}
        </button>
        <span class="node-label">Examen</span>
      `;

      examNode.querySelector(".node-btn").addEventListener("click", () => {
        if (!examUnlocked) {
          soundService.playWrong();
          alert("🔒 Completa todas las lecciones de la unidad para desbloquear el examen.");
          return;
        }
        this.startUnitExam(unit);
      });

      nodesFlow.appendChild(examNode);
    });

    // Examen Final del Curso
    const finalPassed = storageService.isExamCompleted("exam-final");
    const finalUnlocked = CURRICULUM.units.every(u => storageService.isExamCompleted(`exam-${u.id}`));

    const finalSection = document.createElement("div");
    finalSection.className = "unit-section final-exam-section";
    finalSection.innerHTML = `
      <div class="final-exam-card ${finalPassed ? "passed" : ""} ${!finalUnlocked ? "locked" : ""}">
        <div class="final-exam-icon">${finalPassed ? "👑" : finalUnlocked ? "🎓" : "🔒"}</div>
        <div class="final-exam-info">
          <h4>Examen Final del Curso</h4>
          <p>${finalUnlocked ? "¡Estás listo! Demuestra tu dominio completo del inglés." : "Supera los 7 exámenes de unidad para desbloquear el examen final."}</p>
        </div>
        <button class="primary-btn" id="btn-start-final-exam">${finalPassed ? "Repasar" : "Comenzar"}</button>
      </div>
    `;

    finalSection.querySelector("#btn-start-final-exam").addEventListener("click", () => {
      if (!finalUnlocked) {
        soundService.playWrong();
        alert("🔒 Supera los 7 exámenes de unidad para desbloquear el examen final.");
        return;
      }
      this.startFinalExam();
    });

    container.appendChild(finalSection);
  }

  // =========================================================================
  // EXÁMENES (POR UNIDAD Y FINAL)
  // =========================================================================
  _shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  _buildExamQuestions(exercises, flashcards, count) {
    const pool = [];
    const allSolutions = exercises.filter(e => e.solution).map(e => e.solution.join(" "));
    const allTranslations = [
      ...flashcards.map(c => c.translation),
      ...exercises.filter(e => e.type === "listen_choose" && e.translation).map(e => e.translation)
    ];

    exercises.forEach(ex => {
      if (ex.type === "multiple_choice") {
        pool.push({
          prompt: ex.prompt,
          options: [...ex.options],
          correctIndex: ex.correctIndex,
          explanation: ex.explanation || ""
        });
      } else if (ex.type === "translate_to_en") {
        const correct = ex.solution.join(" ");
        const distractors = this._shuffleArray(allSolutions.filter(s => s !== correct)).slice(0, 3);
        const opts = this._shuffleArray([correct, ...distractors]);
        pool.push({
          prompt: `¿Cómo se dice "${ex.prompt}" en inglés?`,
          options: opts,
          correctIndex: opts.indexOf(correct),
          explanation: `Respuesta correcta: "${correct}"`
        });
      } else if (ex.type === "listen_choose") {
        const correct = ex.translation;
        const distractors = this._shuffleArray(allTranslations.filter(t => t !== correct)).slice(0, 3);
        const opts = this._shuffleArray([correct, ...distractors]);
        pool.push({
          prompt: `¿Cuál es el significado de "${ex.sentence}"?`,
          options: opts,
          correctIndex: opts.indexOf(correct),
          explanation: `"${ex.sentence}" significa ${correct}`
        });
      }
    });

    // Complementar con preguntas de vocabulario (flashcards) si faltan
    if (pool.length < count) {
      flashcards.forEach(c => {
        const distractors = this._shuffleArray(allTranslations.filter(t => t !== c.translation)).slice(0, 3);
        const opts = this._shuffleArray([c.translation, ...distractors]);
        pool.push({
          prompt: `¿Qué significa "${c.word}"?`,
          options: opts,
          correctIndex: opts.indexOf(c.translation),
          explanation: `"${c.word}" significa ${c.translation}`
        });
      });
    }

    return this._shuffleArray(pool).slice(0, count);
  }

  startUnitExam(unit) {
    const exercises = unit.lessons.flatMap(l => l.exercises);
    const questions = this._buildExamQuestions(exercises, CURRICULUM.flashcards, 10);
    if (questions.length === 0) {
      alert("No hay preguntas disponibles para este examen.");
      return;
    }
    this._launchExam(`Examen: ${unit.title.split(":")[0]}`, questions, `exam-${unit.id}`, 30, 15);
  }

  startFinalExam() {
    const exercises = CURRICULUM.units.flatMap(u => u.lessons.flatMap(l => l.exercises));
    const questions = this._buildExamQuestions(exercises, CURRICULUM.flashcards, 15);
    this._launchExam("Examen Final del Curso", questions, "exam-final", 100, 50);
  }

  _launchExam(title, questions, examId, xpReward, gemsReward) {
    soundService.playPop();
    const modal = document.getElementById("game-overlay-modal");
    const modalHeader = document.getElementById("modal-overlay-header");
    const body = document.getElementById("game-modal-body");
    const progressFill = document.getElementById("lesson-progress-fill");

    if (modalHeader) modalHeader.classList.remove("hidden");
    modal.classList.remove("hidden");
    progressFill.style.width = "0%";
    this.updateHud();

    this.activeArcadeGame = new ExamRunner({
      container: body,
      title,
      questions,
      onProgressUpdate: (curr, total) => {
        progressFill.style.width = `${Math.round((curr / total) * 100)}%`;
      },
      onComplete: ({ score, total, pct, passed, wrongQuestions }) => {
        storageService.recordExamResult(examId, passed, score, total);
        if (wrongQuestions && wrongQuestions.length > 0) {
          storageService.recordWrongQuestions(wrongQuestions);
        }
        if (passed) {
          storageService.addXp(xpReward);
          storageService.addGems(gemsReward);
          this.triggerConfetti();
        } else {
          storageService.addXp(Math.round(xpReward * 0.2));
        }
        this.updateHud();
        this.renderLearningPath();
        this.renderExamList();
        this.renderWrongQuestionsReview();
        modal.classList.add("hidden");
        this.activeArcadeGame = null;
      }
    });

    this.activeArcadeGame.start();
  }

  // =========================================================================
  // CENTRO DE EXÁMENES (FILTROS Y BÚSQUEDA)
  // =========================================================================
  setupExamCenter() {
    const search = document.getElementById("exam-search-input");
    if (search) {
      search.addEventListener("input", () => {
        this.examSearchQuery = search.value;
        this.renderExamList();
      });
    }

    const filters = document.getElementById("exam-difficulty-filters");
    if (filters) {
      filters.addEventListener("click", (e) => {
        const pill = e.target.closest(".exam-filter-pill");
        if (!pill) return;
        soundService.playPop();
        filters.querySelectorAll(".exam-filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.examDifficultyFilter = pill.dataset.difficulty;
        this.renderExamList();
      });
    }

    const sortRow = document.querySelector(".exam-sort-row");
    if (sortRow) {
      sortRow.addEventListener("click", (e) => {
        const btn = e.target.closest(".exam-sort-btn");
        if (!btn) return;
        soundService.playPop();
        sortRow.querySelectorAll(".exam-sort-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.examSortOrder = btn.dataset.sort;
        this.renderExamList();
      });
    }

    this.renderExamList();
  }

  _getAllExams() {
    const difficultyMap = { "unit-1": "A1", "unit-2": "A1", "unit-3": "A2", "unit-4": "A2", "unit-5": "B1", "unit-6": "B1", "unit-7": "B2" };
    const scores = storageService.getState().examScores || {};

    const exams = CURRICULUM.units.map(u => {
      const id = `exam-${u.id}`;
      const result = scores[id];
      return {
        id,
        title: `Examen ${u.title}`,
        icon: u.icon,
        difficulty: difficultyMap[u.id] || "A1",
        unlocked: u.lessons.every(l => storageService.isLessonCompleted(l.id)),
        passed: storageService.isExamCompleted(id),
        date: (result && result.date) || null,
        xp: 30
      };
    });

    const finalResult = scores["exam-final"];
    exams.push({
      id: "exam-final",
      title: "Examen Final del Curso",
      icon: "🎓",
      difficulty: "B2",
      unlocked: CURRICULUM.units.every(u => storageService.isExamCompleted(`exam-${u.id}`)),
      passed: storageService.isExamCompleted("exam-final"),
      date: (finalResult && finalResult.date) || null,
      xp: 100
    });

    return exams;
  }

  _formatExamDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  renderExamList() {
    const list = document.getElementById("exam-list-container");
    const countBadge = document.getElementById("exam-count-badge");
    if (!list) return;

    const exams = this._getAllExams();
    let filtered = exams.filter(e => {
      if (this.examDifficultyFilter !== "all" && e.difficulty !== this.examDifficultyFilter) return false;
      if (this.examSearchQuery && !e.title.toLowerCase().includes(this.examSearchQuery.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (this.examSortOrder === "recent") {
        return (b.date || "").localeCompare(a.date || "");
      }
      return (a.date || "").localeCompare(b.date || "");
    });

    if (countBadge) countBadge.textContent = `${filtered.length} examen(es)`;

    if (filtered.length === 0) {
      list.innerHTML = `<p class="empty-vocab-msg">No se encontraron exámenes con estos filtros.</p>`;
      return;
    }

    list.innerHTML = filtered.map(e => `
      <div class="exam-list-item ${e.passed ? "passed" : ""} ${!e.unlocked ? "locked" : ""}">
        <div class="exam-item-icon">${e.passed ? "👑" : e.unlocked ? e.icon : "🔒"}</div>
        <div class="exam-item-info">
          <strong class="exam-item-title">${e.title}</strong>
          <div class="exam-item-meta">
            <span class="exam-difficulty-pill diff-${e.difficulty}">${e.difficulty}</span>
            <span class="exam-item-status">${e.passed ? "✓ Aprobado" : e.unlocked ? "Pendiente" : "Bloqueado"}</span>
            ${e.date ? `<span class="exam-item-date">📅 ${this._formatExamDate(e.date)}</span>` : ""}
          </div>
        </div>
        <button class="mini-store-btn" data-exam-id="${e.id}">${e.passed ? "Repasar" : "Iniciar"}</button>
      </div>
    `).join("");

    list.querySelectorAll("[data-exam-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.examId;
        if (id === "exam-final") {
          if (!CURRICULUM.units.every(u => storageService.isExamCompleted(`exam-${u.id}`))) {
            soundService.playWrong();
            alert("🔒 Supera los 7 exámenes de unidad para desbloquear el examen final.");
            return;
          }
          this.startFinalExam();
        } else {
          const unit = CURRICULUM.units.find(u => `exam-${u.id}` === id);
          if (!unit) return;
          if (!unit.lessons.every(l => storageService.isLessonCompleted(l.id))) {
            soundService.playWrong();
            alert("🔒 Completa todas las lecciones de la unidad para desbloquear el examen.");
            return;
          }
          this.startUnitExam(unit);
        }
      });
    });
  }

  // =========================================================================
  // VISTA 6: PANEL DE RENDIMIENTO (DASHBOARD)
  // =========================================================================
  setupDashboard() {
    this.renderDashboard();
  }

  renderDashboard() {
    const container = document.getElementById("view-dashboard");
    if (!container) return;

    const exams = this._getAllExams();
    const totalExams = exams.length;
    const passedExams = exams.filter(e => e.passed);
    const passedCount = passedExams.length;
    const passRate = totalExams ? Math.round((passedCount / totalExams) * 100) : 0;

    // Nivel promedio de dificultad alcanzado (solo exámenes aprobados)
    const diffMap = { A1: 1, A2: 2, B1: 3, B2: 4 };
    const diffLabels = { 1: "A1", 2: "A2", 3: "B1", 4: "B2" };
    let avgLevel = "—";
    if (passedCount > 0) {
      const sum = passedExams.reduce((s, e) => s + (diffMap[e.difficulty] || 1), 0);
      avgLevel = diffLabels[Math.round(sum / passedCount)];
    }

    // Conteo de aprobados por nivel
    const levels = ["A1", "A2", "B1", "B2"];
    const counts = levels.map(l => ({ level: l, count: passedExams.filter(e => e.difficulty === l).length }));
    const maxCount = Math.max(1, ...counts.map(c => c.count));

    // Historial de exámenes intentados (con fecha)
    const scores = storageService.getState().examScores || {};
    const attempted = exams
      .filter(e => scores[e.id])
      .map(e => ({ ...e, result: scores[e.id] }))
      .sort((a, b) => (b.result.date || "").localeCompare(a.result.date || ""));

    // Donut de aprobación
    const donutFg = document.getElementById("dash-donut-fg");
    const donutText = document.getElementById("dash-donut-text");
    if (donutFg) {
      donutFg.style.strokeDasharray = `${passRate} ${100 - passRate}`;
      donutFg.style.strokeDashoffset = "25";
    }
    if (donutText) donutText.textContent = `${passRate}%`;

    const passedValueEl = document.getElementById("dash-passed-value");
    if (passedValueEl) passedValueEl.textContent = `${passedCount} / ${totalExams}`;

    const avgLevelEl = document.getElementById("dash-avg-level");
    if (avgLevelEl) avgLevelEl.textContent = avgLevel;

    const avgValueEl = document.getElementById("dash-avg-value");
    if (avgValueEl) avgValueEl.textContent = passedCount > 0 ? `Dificultad ${avgLevel}` : "Sin exámenes";

    // Gráfico de barras por nivel
    const barChart = document.getElementById("dash-bar-chart");
    if (barChart) {
      barChart.innerHTML = counts.map(c => `
        <div class="bar-col">
          <div class="bar-fill-wrap">
            <div class="bar-fill diff-${c.level}" style="height: ${(c.count / maxCount) * 100}%"></div>
            <span class="bar-value">${c.count}</span>
          </div>
          <span class="bar-label">${c.level}</span>
        </div>
      `).join("");
    }

    // Historial
    const resultsList = document.getElementById("dash-results-list");
    if (resultsList) {
      resultsList.innerHTML = attempted.length
        ? attempted.map(e => `
          <div class="dash-result-item ${e.passed ? "passed" : "failed"}">
            <span class="dash-result-icon">${e.passed ? "✓" : "✗"}</span>
            <div class="dash-result-info">
              <strong>${e.title}</strong>
              <span>${e.result.score}/${e.result.total} • ${this._formatExamDate(e.result.date)}</span>
            </div>
            <span class="exam-difficulty-pill diff-${e.difficulty}">${e.difficulty}</span>
          </div>
        `).join("")
        : `<p class="empty-vocab-msg">Aún no has realizado ningún examen.</p>`;
    }
  }

  updateDailyGoalBanner() {
    const title = document.getElementById("daily-goal-title");
    const desc = document.getElementById("daily-goal-desc");
    const badge = document.getElementById("daily-goal-badge");

    if (storageService.isDailyGoalDone()) {
      if (title) title.textContent = "¡Meta de hoy cumplida! 🌟";
      if (desc) desc.textContent = "¡Excelente constancia! Tu racha está protegida hoy.";
      if (badge) badge.innerHTML = `<span class="xp-val" style="background:#58CC02; color:#fff;">✓ Listo</span>`;
    } else {
      if (title) title.textContent = "¡Tu meta de hoy! 🎯";
      if (desc) desc.textContent = "Completa 1 lección para mantener tu racha activa.";
      if (badge) badge.innerHTML = `<span class="xp-val">+15 XP</span>`;
    }
  }

  // =========================================================================
  // EJECUCIÓN DE LECCIÓN (EXERCISE RUNNER)
  // =========================================================================
  startLesson(lesson, isPractice = false) {
    const state = storageService.getState();
    if (!isPractice && state.hearts <= 0) {
      this.showNoHeartsModal();
      return;
    }

    if (this.activeArcadeGame && this.activeArcadeGame.stop) {
      this.activeArcadeGame.stop();
    }
    this.activeArcadeGame = null;

    soundService.playPop();
    const modal = document.getElementById("game-overlay-modal");
    const modalHeader = document.getElementById("modal-overlay-header");
    const body = document.getElementById("game-modal-body");
    const progressFill = document.getElementById("lesson-progress-fill");
    
    if (modalHeader) modalHeader.classList.remove("hidden");
    modal.classList.remove("hidden");
    progressFill.style.width = "0%";
    this.updateHud();

    this.activeExerciseRunner = new ExerciseRunner({
      container: body,
      exercises: lesson.exercises,
      onProgressUpdate: (curr, total) => {
        const pct = Math.round(((curr) / total) * 100);
        progressFill.style.width = `${pct}%`;
      },
      onHeartLost: () => {
        if (!isPractice) {
          const remHearts = storageService.deductHeart();
          this.updateHud();
          if (remHearts <= 0) {
            setTimeout(() => {
              this.showNoHeartsModal();
            }, 600);
          }
        }
      },
      onComplete: () => {
        this.handleLessonFinished(lesson, isPractice);
      }
    });

    this.activeExerciseRunner.start();
  }

  handleLessonFinished(lesson, isPractice) {
    soundService.playFanfare();
    this.triggerConfetti();

    const earnedXp = lesson.xp || 20;
    const earnedGems = isPractice ? 5 : 10;

    if (isPractice) {
      storageService.addHeart(2);
      storageService.addXp(earnedXp);
      storageService.addGems(earnedGems);
    } else {
      storageService.markLessonCompleted(lesson.id, earnedXp, earnedGems);
    }

    this.updateHud();
    this.renderLearningPath();

    const body = document.getElementById("game-modal-body");
    body.innerHTML = `
      <div class="game-over-modal animate-scale-up">
        <div class="trophy-badge">🏆</div>
        <h2>${isPractice ? "¡Práctica Exitosa!" : "¡Lección Completada!"}</h2>
        <p class="summary-subtitle">${isPractice ? "Has recuperado 2 corazones de vida ❤️" : "¡Has dominado este módulo de inglés!"}</p>

        <div class="score-summary-card">
          <div class="summary-stat">
            <span class="stat-label">Experiencia</span>
            <span class="stat-value">⚡ +${earnedXp} XP</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Gemas</span>
            <span class="stat-value">💎 +${earnedGems}</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Racha</span>
            <span class="stat-value text-orange">🔥 ${storageService.getState().streak} días</span>
          </div>
          <div class="summary-stat">
            <span class="stat-label">Vidas</span>
            <span class="stat-value text-green">❤️ ${storageService.getState().hearts}</span>
          </div>
        </div>

        <div class="action-buttons-column">
          <button class="primary-btn success-btn" id="btn-finish-lesson-view">CONTINUAR</button>
        </div>
      </div>
    `;

    body.querySelector("#btn-finish-lesson-view").addEventListener("click", () => {
      document.getElementById("game-overlay-modal").classList.add("hidden");
      this.activeExerciseRunner = null;
    });
  }

  // =========================================================================
  // VISTA 2: ARCADE DE JUEGOS (6 MINIJUEGOS)
  // =========================================================================
  setupArcadeCards() {
    // 1. Speed Match
    const smBtn = document.getElementById("card-play-speedmatch");
    if (smBtn) {
      smBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new SpeedMatchGame(container, close);
          this.activeArcadeGame.start();
        });
      });
    }

    // 2. Word Fall (Lluvia de Palabras)
    const wfBtn = document.getElementById("card-play-wordfall");
    if (wfBtn) {
      wfBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new WordFallGame(container, close);
          this.activeArcadeGame.start();
        });
      });
    }

    // 3. Sentence Scramble (Desafío Sintáctico)
    const scBtn = document.getElementById("card-play-scramble");
    if (scBtn) {
      scBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new SentenceScrambleGame(container, close);
          this.activeArcadeGame.start();
        });
      });
    }

    // 4. Audio Detective (Discriminación Auditiva)
    const adBtn = document.getElementById("card-play-audiodetective");
    if (adBtn) {
      adBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new AudioDetectiveGame(container, close);
          this.activeArcadeGame.start();
        });
      });
    }

    // 5. Roleplay Chat
    const rpBtn = document.getElementById("card-play-roleplay");
    if (rpBtn) {
      rpBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new RoleplayGame(container, close);
          this.activeArcadeGame.start();
        });
      });
    }

    // 6. Flashcards 3D
    const fcBtn = document.getElementById("card-play-flashcards");
    if (fcBtn) {
      fcBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new FlashcardsGame(container, close, "all");
          this.activeArcadeGame.start();
        });
      });
    }
  }

  openArcadeOverlay(initGameFn) {
    if (this.activeExerciseRunner && speechService.stopListening) {
      speechService.stopListening();
    }
    this.activeExerciseRunner = null;

    const modal = document.getElementById("game-overlay-modal");
    const modalHeader = document.getElementById("modal-overlay-header");
    const body = document.getElementById("game-modal-body");

    if (modalHeader) modalHeader.classList.add("hidden");
    modal.classList.remove("hidden");

    const closeFn = () => {
      if (this.activeArcadeGame && this.activeArcadeGame.stop) {
        this.activeArcadeGame.stop();
      }
      this.activeArcadeGame = null;
      modal.classList.add("hidden");
      if (modalHeader) modalHeader.classList.remove("hidden");
      this.updateHud();
      this.updateReviewStats();
      this.updateProfileStats();
    };

    initGameFn(body, closeFn);
  }

  // =========================================================================
  // VISTA 3: LIGA SEMANAL (LEADERBOARD)
  // =========================================================================
  setupLeaderboardTab() {
    this.renderLeaderboard();
  }

  renderLeaderboard() {
    const players = storageService.getWeeklyLeaderboard();
    const podiumBox = document.getElementById("league-podium");
    const list = document.getElementById("leaderboard-players-list");
    if (!podiumBox || !list) return;

    // Top 3 Podio
    const top1 = players[0];
    const top2 = players[1];
    const top3 = players[2];

    podiumBox.innerHTML = `
      <div class="podium-step step-2 animate-slide-up">
        <span class="podium-medal">🥈</span>
        <span class="podium-avatar">${top2 ? top2.avatar : "👤"}</span>
        <strong class="podium-name">${top2 ? top2.name.split(" ")[0] : "-"}</strong>
        <span class="podium-xp">${top2 ? top2.xp : 0} XP</span>
        <div class="podium-pillar pillar-2">2</div>
      </div>
      <div class="podium-step step-1 animate-slide-up">
        <span class="podium-crown">👑</span>
        <span class="podium-medal">🥇</span>
        <span class="podium-avatar">${top1 ? top1.avatar : "👤"}</span>
        <strong class="podium-name">${top1 ? top1.name.split(" ")[0] : "-"}</strong>
        <span class="podium-xp">${top1 ? top1.xp : 0} XP</span>
        <div class="podium-pillar pillar-1">1</div>
      </div>
      <div class="podium-step step-3 animate-slide-up">
        <span class="podium-medal">🥉</span>
        <span class="podium-avatar">${top3 ? top3.avatar : "👤"}</span>
        <strong class="podium-name">${top3 ? top3.name.split(" ")[0] : "-"}</strong>
        <span class="podium-xp">${top3 ? top3.xp : 0} XP</span>
        <div class="podium-pillar pillar-3">3</div>
      </div>
    `;

    // Tabla con el resto y el jugador
    list.innerHTML = players.map(p => `
      <div class="leaderboard-row ${p.isUser ? 'user-row' : ''} animate-pop">
        <span class="lb-rank">#${p.rank}</span>
        <span class="lb-avatar">${p.avatar}</span>
        <div class="lb-info">
          <strong class="lb-name">${p.name}</strong>
          ${p.isUser ? '<span class="lb-you-tag">¡Eres tú!</span>' : ''}
        </div>
        <span class="lb-xp">⚡ ${p.xp} XP</span>
      </div>
    `).join("");
  }

  // =========================================================================
  // VISTA 4: REPASO SRS (REVIEW)
  // =========================================================================
  setupReviewTab() {
    const startSrsBtn = document.getElementById("btn-start-srs-session");
    if (startSrsBtn) {
      startSrsBtn.addEventListener("click", () => {
        soundService.playPop();
        this.openArcadeOverlay((container, close) => {
          this.activeArcadeGame = new FlashcardsGame(container, close, this.selectedVocabCategory);
          this.activeArcadeGame.start(this.selectedVocabCategory);
        });
      });
    }

    const wrongReviewBtn = document.getElementById("btn-start-wrong-review");
    if (wrongReviewBtn) {
      wrongReviewBtn.addEventListener("click", () => {
        this.startWrongQuestionsReview();
      });
    }

    this.setupVocabFilterPills();
    this.renderVocabPreview();
    this.updateReviewStats();
    this.renderWrongQuestionsReview();
  }

  renderWrongQuestionsReview() {
    const card = document.getElementById("wrong-questions-card");
    const countEl = document.getElementById("wrong-questions-count");
    const listEl = document.getElementById("wrong-questions-list");
    const btn = document.getElementById("btn-start-wrong-review");
    if (!card || !countEl || !btn) return;

    const wrong = storageService.getWrongQuestions();
    countEl.textContent = `${wrong.length} pregunta(s) fallada(s)`;

    if (listEl) {
      listEl.innerHTML = wrong.length
        ? wrong.slice(0, 10).map(q => `
          <div class="wrong-question-item">
            <span class="wrong-q-prompt">❓ ${q.prompt.length > 60 ? q.prompt.substring(0, 60) + "…" : q.prompt}</span>
          </div>
        `).join("") + (wrong.length > 10 ? `<div class="wrong-q-more">+${wrong.length - 10} más…</div>` : "")
        : `<p class="empty-vocab-msg">¡Aún no has fallado ninguna pregunta! Sigue practicando. 🎉</p>`;
    }

    btn.disabled = wrong.length === 0;
    btn.textContent = wrong.length > 0 ? `REPASAR ${wrong.length} PREGUNTA(S) FALLADA(S) 🔁` : "NO HAY PREGUNTAS PARA REPASAR";
  }

  startWrongQuestionsReview() {
    const wrong = storageService.getWrongQuestions();
    if (wrong.length === 0) return;

    const questions = this._shuffleArray(wrong).map(q => ({
      prompt: q.prompt,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation || ""
    }));

    soundService.playPop();
    const modal = document.getElementById("game-overlay-modal");
    const modalHeader = document.getElementById("modal-overlay-header");
    const body = document.getElementById("game-modal-body");
    const progressFill = document.getElementById("lesson-progress-fill");

    if (modalHeader) modalHeader.classList.remove("hidden");
    modal.classList.remove("hidden");
    progressFill.style.width = "0%";
    this.updateHud();

    this.activeArcadeGame = new ExamRunner({
      container: body,
      title: "Repaso de Errores",
      questions,
      onProgressUpdate: (curr, total) => {
        progressFill.style.width = `${Math.round((curr / total) * 100)}%`;
      },
      onComplete: ({ score, total, pct, wrongQuestions }) => {
        // Remove questions that were answered correctly this time
        const correctPrompts = questions
          .filter(q => !wrongQuestions.some(wq => wq.prompt === q.prompt))
          .map(q => q.prompt);
        if (correctPrompts.length > 0) {
          storageService.removeWrongQuestions(correctPrompts);
        }
        if (pct >= 70) {
          storageService.addXp(20);
          storageService.addGems(10);
          this.triggerConfetti();
        } else {
          storageService.addXp(5);
        }
        this.updateHud();
        this.renderWrongQuestionsReview();
        modal.classList.add("hidden");
        this.activeArcadeGame = null;
      }
    });

    this.activeArcadeGame.start();
  }

  setupVocabFilterPills() {
    const row = document.getElementById("vocab-filter-row");
    if (!row) return;

    row.addEventListener("click", (e) => {
      const pill = e.target.closest(".vocab-filter-pill");
      if (!pill) return;

      soundService.playPop();
      row.querySelectorAll(".vocab-filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      this.selectedVocabCategory = pill.dataset.category || "all";
      this.renderVocabPreview();
    });
  }

  renderVocabPreview() {
    const list = document.getElementById("vocab-preview-list");
    const badge = document.getElementById("vocab-total-badge");
    if (!list) return;

    let cards = [...CURRICULUM.flashcards];
    if (this.selectedVocabCategory !== "all") {
      cards = cards.filter(c => c.category.toLowerCase() === this.selectedVocabCategory.toLowerCase());
    }

    if (badge) badge.textContent = `${cards.length} palabras`;

    if (cards.length === 0) {
      list.innerHTML = `<p class="empty-vocab-msg">No hay palabras en esta categoría.</p>`;
      return;
    }

    list.innerHTML = cards.map(c => `
      <div class="vocab-preview-pill animate-pop" data-word="${c.word}" title="Toca para escuchar pronunciación">
        <span class="vocab-pill-word">🔊 ${c.word}</span>
        <small class="vocab-pill-trans">(${c.translation})</small>
      </div>
    `).join("");

    list.querySelectorAll(".vocab-preview-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        soundService.playPop();
        speechService.speak(pill.dataset.word, false);
      });
    });
  }

  updateReviewStats() {
    const srsStats = storageService.getSrsStats(CURRICULUM.flashcards.length);
    const learnedEl = document.getElementById("srs-learned-count");
    const reviewEl = document.getElementById("srs-review-count");
    const accuracyEl = document.getElementById("srs-accuracy");

    if (learnedEl) learnedEl.textContent = srsStats.mastered;
    if (reviewEl) reviewEl.textContent = srsStats.pending;
    if (accuracyEl) accuracyEl.textContent = `${srsStats.accuracy}%`;
  }

  // =========================================================================
  // VISTA 5: PERFIL, AVATARES & TIENDA (PROFILE)
  // =========================================================================
  setupProfileTab() {
    const refillGemsBtn = document.getElementById("btn-refill-gems");
    const practiceHeartBtn = document.getElementById("btn-practice-heart");
    const buyFreezeBtn = document.getElementById("btn-buy-freeze");
    const resetBtn = document.getElementById("btn-reset-progress");

    if (refillGemsBtn) {
      refillGemsBtn.addEventListener("click", () => {
        soundService.playPop();
        const state = storageService.getState();
        if (state.gems >= 30) {
          storageService.addGems(-30);
          storageService.refillHearts();
          soundService.playCorrect();
          this.updateHud();
          this.updateProfileStats();
          alert("¡Tus vidas han sido recargadas al máximo! ❤️❤️❤️❤️❤️");
        } else {
          soundService.playWrong();
          alert("No tienes suficientes gemas. Completa lecciones o juega en el Arcade para ganar más.");
        }
      });
    }

    if (buyFreezeBtn) {
      buyFreezeBtn.addEventListener("click", () => {
        soundService.playPop();
        const res = storageService.buyStreakFreeze();
        if (res.success) {
          soundService.playCorrect();
          this.updateHud();
          this.updateProfileStats();
          alert(`¡Escudo de Racha adquirido! Tienes ${res.count} escudo(s) activo(s). 🛡️`);
        } else {
          soundService.playWrong();
          alert("Necesitas 50 gemas para adquirir un Escudo de Racha.");
        }
      });
    }

    if (practiceHeartBtn) {
      practiceHeartBtn.addEventListener("click", () => {
        soundService.playPop();
        const firstLesson = CURRICULUM.units[0].lessons[0];
        this.startLesson(firstLesson, true);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que deseas reiniciar todo tu progreso? Se restablecerán lecciones, gemas y racha.")) {
          soundService.playPop();
          storageService.resetAll();
          this.updateHud();
          this.renderLearningPath();
          this.updateReviewStats();
          this.updateProfileStats();
          alert("Progreso reiniciado correctamente.");
        }
      });
    }

    this.updateProfileStats();
  }

  setupAvatarPicker() {
    const row = document.getElementById("avatar-options-row");
    if (!row) return;

    const currentAvatar = storageService.getState().avatar || "🦁";
    row.querySelectorAll(".avatar-option-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.avatar === currentAvatar);
      chip.addEventListener("click", () => {
        soundService.playPop();
        row.querySelectorAll(".avatar-option-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");

        const nextAvatar = chip.dataset.avatar;
        storageService.setAvatar(nextAvatar);

        const profileAvatar = document.getElementById("profile-user-avatar");
        if (profileAvatar) profileAvatar.textContent = nextAvatar;

        this.renderLeaderboard();
      });
    });
  }

  updateProfileStats() {
    const state = storageService.getState();
    const xpEl = document.getElementById("profile-xp");
    const streakEl = document.getElementById("profile-streak");
    const gemsEl = document.getElementById("profile-gems");
    const wordsEl = document.getElementById("profile-words");
    const levelTag = document.getElementById("profile-level-tag");
    const freezeCount = document.getElementById("streak-freeze-count");
    const avatarEl = document.getElementById("profile-user-avatar");

    if (xpEl) xpEl.textContent = state.xp;
    if (streakEl) streakEl.textContent = state.streak;
    if (gemsEl) gemsEl.textContent = state.gems;
    if (wordsEl) wordsEl.textContent = state.stats.wordsLearned;
    if (freezeCount) freezeCount.textContent = state.streakFreeze || 0;
    if (avatarEl) avatarEl.textContent = state.avatar || "🦁";

    if (levelTag) {
      let levelText = "Nivel A1 Inicial";
      if (state.xp >= 1000) levelText = "Nivel B2 Avanzado 🌟";
      else if (state.xp >= 500) levelText = "Nivel B1 Intermedio ⚡";
      else if (state.xp >= 200) levelText = "Nivel A2 Elemental 🚀";
      levelTag.textContent = levelText;
    }

    this.renderAchievements();
  }

  renderAchievements() {
    const container = document.getElementById("achievements-container");
    if (!container) return;

    const achievements = storageService.getAchievements(CURRICULUM.units.length);
    container.innerHTML = achievements.map(ach => `
      <div class="badge-card ${ach.unlocked ? 'unlocked' : 'locked'}">
        <span class="badge-icon">${ach.icon}</span>
        <strong>${ach.title}</strong>
        <p>${ach.description}</p>
        <span class="badge-status-tag">${ach.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}</span>
      </div>
    `).join("");
  }

  // =========================================================================
  // MODALES & CONFETI
  // =========================================================================
  setupModals() {
    const closeLessonBtn = document.getElementById("btn-close-lesson");
    const noHeartsModal = document.getElementById("no-hearts-modal");
    const recoverPracticeBtn = document.getElementById("btn-recover-by-practice");
    const recoverGemsBtn = document.getElementById("btn-recover-by-gems");

    if (closeLessonBtn) {
      closeLessonBtn.addEventListener("click", () => {
        soundService.playPop();
        if (confirm("¿Salir de la lección? Se perderá el progreso de esta ronda.")) {
          if (speechService.stopListening) speechService.stopListening();
          document.getElementById("game-overlay-modal").classList.add("hidden");
          this.activeExerciseRunner = null;
          if (this.activeArcadeGame && this.activeArcadeGame.stop) {
            this.activeArcadeGame.stop();
          }
          this.activeArcadeGame = null;
        }
      });
    }

    if (recoverPracticeBtn) {
      recoverPracticeBtn.addEventListener("click", () => {
        noHeartsModal.classList.add("hidden");
        const firstLesson = CURRICULUM.units[0].lessons[0];
        this.startLesson(firstLesson, true);
      });
    }

    if (recoverGemsBtn) {
      recoverGemsBtn.addEventListener("click", () => {
        const state = storageService.getState();
        if (state.gems >= 30) {
          storageService.addGems(-30);
          storageService.refillHearts();
          noHeartsModal.classList.add("hidden");
          this.updateHud();
          soundService.playCorrect();
          alert("¡Vidas recargadas con éxito! ❤️");
        } else {
          soundService.playWrong();
          alert("No tienes suficientes gemas. Puedes practicar gratis para ganar vidas.");
        }
      });
    }
  }

  showNoHeartsModal() {
    const modal = document.getElementById("no-hearts-modal");
    if (modal) modal.classList.remove("hidden");
  }

  triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
    const h = (canvas.height = canvas.parentElement.offsetHeight || window.innerHeight);

    const colors = ["#58CC02", "#1CB0F6", "#FF9600", "#CE82FF", "#FF4B4B", "#FFC800", "#20C997"];
    const particles = Array.from({ length: 70 }).map(() => ({
      x: w / 2,
      y: h / 2 + 50,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12
    }));

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.alpha -= 0.012;
        p.rotation += p.rotSpeed;

        if (p.alpha > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frames++;
      if (frames < 95) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    requestAnimationFrame(animate);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.lingoApp = new App();
});
