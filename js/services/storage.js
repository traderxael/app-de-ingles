// Servicio de Persistencia y Gestión del Progreso del Usuario - LingoQuest English
const STORAGE_KEY = "lingoquest_player_state_v3";

const DEFAULT_STATE = {
  avatar: "🦁",
  hearts: 5,
  maxHearts: 5,
  gems: 120,
  streak: 1,
  streakFreeze: 0,
  xp: 45,
  lastActiveDate: new Date().toISOString().split("T")[0],
  dailyGoalDate: "",
  dailyGoalDone: false,
  completedLessons: ["u1-l1"],
  unlockedUnits: ["unit-1"],
  soundEnabled: true,
  theme: "light",
  cardReviews: {}, // SRS: { [cardId]: { correct: 0, wrong: 0, level: 0, lastReview: string } }
  arcadeStats: {
    maxCombo: 0,
    speedMatchesPlayed: 0,
    roleplaysCompleted: 0,
    wordFallHighScore: 0,
    scramblesCompleted: 0,
    audioDetectivesCompleted: 0
  },
  stats: {
    wordsLearned: 24,
    perfectLessons: 1,
    timeSpentMinutes: 15
  }
};

class StorageService {
  constructor() {
    this.state = this.loadState();
    this.checkStreak();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Migración de v2 o v1 si existiera
        const legacyV2 = localStorage.getItem("lingoquest_player_state_v2");
        if (legacyV2) {
          return { ...DEFAULT_STATE, ...JSON.parse(legacyV2) };
        }
        const legacyV1 = localStorage.getItem("lingoquest_player_state_v1");
        if (legacyV1) {
          return { ...DEFAULT_STATE, ...JSON.parse(legacyV1) };
        }
        return { ...DEFAULT_STATE };
      }
      return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch (e) {
      console.warn("No se pudo cargar localStorage, usando estado base", e);
      return { ...DEFAULT_STATE };
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Error guardando en localStorage", e);
    }
  }

  getState() {
    return this.state;
  }

  setAvatar(avatarEmoji) {
    this.state.avatar = avatarEmoji;
    this.saveState();
    return this.state.avatar;
  }

  buyStreakFreeze() {
    if (this.state.gems >= 50) {
      this.state.gems -= 50;
      this.state.streakFreeze = (this.state.streakFreeze || 0) + 1;
      this.saveState();
      return { success: true, count: this.state.streakFreeze };
    }
    return { success: false, reason: "gems" };
  }

  // Verifica y actualiza la racha de días consecutivos
  checkStreak() {
    const today = new Date().toISOString().split("T")[0];
    const last = this.state.lastActiveDate;

    if (!last) {
      this.state.lastActiveDate = today;
      this.state.streak = 1;
      this.saveState();
      return;
    }

    if (last === today) {
      return;
    }

    const lastDate = new Date(last);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Día consecutivo: ¡Aumenta la racha!
      this.state.streak += 1;
    } else if (diffDays > 1) {
      // Se perdió un día: verificar si tiene un congelador de racha
      if (this.state.streakFreeze > 0) {
        this.state.streakFreeze -= 1;
        // Racha salvada por el escudo
      } else {
        this.state.streak = 1;
      }
    }

    // Reiniciar meta diaria para el nuevo día
    this.state.dailyGoalDate = today;
    this.state.dailyGoalDone = false;
    this.state.lastActiveDate = today;
    this.saveState();
  }

  deductHeart() {
    if (this.state.hearts > 0) {
      this.state.hearts -= 1;
      this.saveState();
    }
    return this.state.hearts;
  }

  addHeart(amount = 1) {
    this.state.hearts = Math.min(this.state.maxHearts, this.state.hearts + amount);
    this.saveState();
    return this.state.hearts;
  }

  refillHearts() {
    this.state.hearts = this.state.maxHearts;
    this.saveState();
  }

  addXp(points) {
    this.state.xp += points;
    this.saveState();
    return this.state.xp;
  }

  addGems(amount) {
    this.state.gems += amount;
    this.saveState();
    return this.state.gems;
  }

  isLessonCompleted(lessonId) {
    return this.state.completedLessons.includes(lessonId);
  }

  markLessonCompleted(lessonId, earnedXp = 15, earnedGems = 10) {
    if (!this.state.completedLessons.includes(lessonId)) {
      this.state.completedLessons.push(lessonId);
      this.state.stats.wordsLearned += 6;
    }
    this.state.xp += earnedXp;
    this.state.gems += earnedGems;
    
    // Cumplir meta del día
    const today = new Date().toISOString().split("T")[0];
    this.state.dailyGoalDate = today;
    this.state.dailyGoalDone = true;

    this.checkStreak();
    this.saveState();
  }

  isDailyGoalDone() {
    const today = new Date().toISOString().split("T")[0];
    return this.state.dailyGoalDate === today && this.state.dailyGoalDone;
  }

  recordCardReview(cardId, remembered) {
    if (!this.state.cardReviews[cardId]) {
      this.state.cardReviews[cardId] = { correct: 0, wrong: 0, level: 0, lastReview: "" };
    }
    const card = this.state.cardReviews[cardId];
    card.lastReview = new Date().toISOString();

    if (remembered) {
      card.correct += 1;
      card.level = Math.min(5, card.level + 1);
      this.state.xp += 3;
    } else {
      card.wrong += 1;
      card.level = Math.max(0, card.level - 1);
    }
    this.saveState();
  }

  recordSpeedMatch(score, maxCombo) {
    if (!this.state.arcadeStats) {
      this.state.arcadeStats = { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };
    }
    this.state.arcadeStats.speedMatchesPlayed += 1;
    if (maxCombo > this.state.arcadeStats.maxCombo) {
      this.state.arcadeStats.maxCombo = maxCombo;
    }
    this.saveState();
  }

  recordRoleplayCompleted() {
    if (!this.state.arcadeStats) {
      this.state.arcadeStats = { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };
    }
    this.state.arcadeStats.roleplaysCompleted += 1;
    this.saveState();
  }

  recordWordFall(score) {
    if (!this.state.arcadeStats) {
      this.state.arcadeStats = { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };
    }
    if (score > (this.state.arcadeStats.wordFallHighScore || 0)) {
      this.state.arcadeStats.wordFallHighScore = score;
    }
    this.saveState();
  }

  recordSentenceScramble(score) {
    if (!this.state.arcadeStats) {
      this.state.arcadeStats = { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };
    }
    this.state.arcadeStats.scramblesCompleted = (this.state.arcadeStats.scramblesCompleted || 0) + 1;
    this.saveState();
  }

  recordAudioDetective(score) {
    if (!this.state.arcadeStats) {
      this.state.arcadeStats = { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };
    }
    this.state.arcadeStats.audioDetectivesCompleted = (this.state.arcadeStats.audioDetectivesCompleted || 0) + 1;
    this.saveState();
  }

  // Cálculos estadísticos reales del sistema SRS
  getSrsStats(totalDeckCount = 45) {
    const reviews = Object.values(this.state.cardReviews || {});
    let mastered = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    reviews.forEach(c => {
      if (c.level >= 2 || c.correct >= 2) mastered++;
      totalCorrect += (c.correct || 0);
      totalWrong += (c.wrong || 0);
    });

    const totalActions = totalCorrect + totalWrong;
    const accuracy = totalActions > 0 ? Math.round((totalCorrect / totalActions) * 100) : 94;
    const pending = Math.max(4, totalDeckCount - mastered);

    return {
      mastered: Math.max(this.state.stats.wordsLearned, mastered),
      pending,
      accuracy
    };
  }

  // Generador dinámico de la Liga Semanal (Zafiro)
  getWeeklyLeaderboard() {
    const userXp = this.state.xp || 45;
    const userAvatar = this.state.avatar || "🦁";

    // Estudiantes virtuales de la liga con puntuaciones escalonadas
    const bots = [
      { id: "b1", name: "Sofia Ramirez", avatar: "🦉", xp: 390 },
      { id: "b2", name: "Lucas Vance", avatar: "🧑‍🚀", xp: 320 },
      { id: "b3", name: "Mateo Gomez", avatar: "🦊", xp: 265 },
      { id: "b4", name: "Elena Chen", avatar: "🐱", xp: 210 },
      { id: "b5", name: "Carlos Mendez", avatar: "🐼", xp: 175 },
      { id: "b6", name: "Valeria Diaz", avatar: "🐨", xp: 130 },
      { id: "b7", name: "David Miller", avatar: "🐯", xp: 95 },
      { id: "b8", name: "Camila Torres", avatar: "🦄", xp: 60 }
    ];

    const players = [
      ...bots,
      { id: "user", name: "Tú (Estudiante LingoQuest)", avatar: userAvatar, xp: userXp, isUser: true }
    ];

    players.sort((a, b) => b.xp - a.xp);

    return players.map((p, index) => ({
      ...p,
      rank: index + 1
    }));
  }

  // Evaluación dinámica de logros y medallas ampliada
  getAchievements(totalUnitsCount = 7) {
    const state = this.state;
    const srsStats = this.getSrsStats();
    const arcade = state.arcadeStats || { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 };

    return [
      {
        id: "ach-first-step",
        title: "Primer Paso",
        description: "Completa tu primera lección",
        icon: "🚀",
        unlocked: (state.completedLessons && state.completedLessons.length > 0)
      },
      {
        id: "ach-streak",
        title: "En Racha",
        description: "Mantén una racha de al menos 1 día",
        icon: "🔥",
        unlocked: state.streak >= 1
      },
      {
        id: "ach-speed",
        title: "Rayo Veloz",
        description: "Haz un combo x3 en Speed Match",
        icon: "⚡",
        unlocked: arcade.maxCombo >= 3
      },
      {
        id: "ach-wordfall",
        title: "Lluvia Precisa",
        description: "Alcanza 100 puntos en Word Fall",
        icon: "🌧️",
        unlocked: (arcade.wordFallHighScore || 0) >= 100
      },
      {
        id: "ach-scramble",
        title: "Maestro Sintáctico",
        description: "Completa un desafío de Sentence Scramble",
        icon: "🧩",
        unlocked: (arcade.scramblesCompleted || 0) >= 1
      },
      {
        id: "ach-detective",
        title: "Oído Detective",
        description: "Supera un desafío de Audio Detective",
        icon: "🎧",
        unlocked: (arcade.audioDetectivesCompleted || 0) >= 1
      },
      {
        id: "ach-speaker",
        title: "Hablante Confiado",
        description: "Completa un escenario de conversación",
        icon: "🎭",
        unlocked: arcade.roleplaysCompleted >= 1
      },
      {
        id: "ach-srs-master",
        title: "Mente Brillante",
        description: "Domina al menos 15 palabras en Flashcards",
        icon: "🧠",
        unlocked: srsStats.mastered >= 15
      },
      {
        id: "ach-polyglot",
        title: "Políglota",
        description: "Completa todas las unidades del curso",
        icon: "👑",
        unlocked: state.completedLessons.length >= totalUnitsCount * 2
      }
    ];
  }

  toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    this.saveState();
    return this.state.soundEnabled;
  }

  toggleTheme() {
    this.state.theme = this.state.theme === "dark" ? "light" : "dark";
    this.saveState();
    return this.state.theme;
  }

  resetAll() {
    this.state = { 
      ...DEFAULT_STATE, 
      completedLessons: [], 
      cardReviews: {},
      arcadeStats: { maxCombo: 0, speedMatchesPlayed: 0, roleplaysCompleted: 0, wordFallHighScore: 0, scramblesCompleted: 0, audioDetectivesCompleted: 0 }
    };
    this.saveState();
  }
}

export const storageService = new StorageService();
