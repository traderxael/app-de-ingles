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
import { SceneWordsGame } from "./games/sceneWords.js";
import { AudioDetectiveGame } from "./games/audioDetective.js";

class App {
  constructor() {
    this.currentView = "view-learn";
    this.activeExerciseRunner = null;
    this.activeArcadeGame = null;
    this.selectedVocabCategory = "all";
    this.init();
  }

  init() {
    this.applyTheme(storageService.getState().theme);
    this.updateHud();
    this.setupNavigation();
    this.setupHudControls();
    this.setupDesktopFrameToggle();
    this.renderLearningPath();
    this.setupArcadeCards();
    this.setupLeaderboardTab();
    this.setupReviewTab();
    this.setupProfileTab();
    this.setupAvatarPicker();
    this.setupModals();
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
    });
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
    document.getElementById('card-play-scene')?.addEventListener('click', () => {
      this.openArcadeOverlay((container, close) => {
        this.activeArcadeGame = new SceneWordsGame(container, close);
        this.activeArcadeGame.start();
      });
    });
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
            this.renderVocabPreview();
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

    this.setupVocabFilterPills();
    this.renderVocabPreview();
    this.updateReviewStats();
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

    let cards = [...CURRICULUM.flashcards, ...storageService.getSceneWords()];
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
        const scene = storageService.getSceneWords().some(w => w.word === pill.dataset.word);
        scene ? speechService.speakLocal(pill.dataset.word) : speechService.speak(pill.dataset.word, false);
      });
    });
  }

  updateReviewStats() {
    const srsStats = storageService.getSrsStats(CURRICULUM.flashcards.length + storageService.getSceneWords().length);
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
                this.renderVocabPreview();
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
