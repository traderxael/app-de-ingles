// Sistema de Medallas y Logros - LingoQuest English Pro

export const BADGE_CATEGORIES = [
  { id: "all", label: "Todas", icon: "🏅" },
  { id: "lessons", label: "Lecciones", icon: "📚" },
  { id: "units", label: "Unidades", icon: "🧭" },
  { id: "exams", label: "Exámenes", icon: "📝" },
  { id: "streak", label: "Racha", icon: "🔥" },
  { id: "study", label: "Estudio", icon: "⚡" },
  { id: "arcade", label: "Arcade", icon: "🎮" }
];

// Definición de todas las medallas del sistema
export const BADGE_DEFINITIONS = [
  // --- Lecciones ---
  { id: "b-first-lesson", title: "Primer Paso", description: "Completa tu primera lección", icon: "🚀", category: "lessons",
    check: (s, ctx) => s.completedLessons.length >= 1 },
  { id: "b-5-lessons", title: "Lector Constante", description: "Completa 5 lecciones", icon: "📚", category: "lessons",
    check: (s, ctx) => s.completedLessons.length >= 5 },
  { id: "b-10-lessons", title: "Erudito", description: "Completa 10 lecciones", icon: "📖", category: "lessons",
    check: (s, ctx) => s.completedLessons.length >= 10 },

  // --- Unidades ---
  { id: "b-unit-1", title: "Explorador", description: "Completa la Unidad 1", icon: "🧭", category: "units",
    check: (s, ctx) => ctx.completedUnitCount >= 1 },
  { id: "b-unit-3", title: "Aventurero", description: "Completa 3 unidades", icon: "🗺️", category: "units",
    check: (s, ctx) => ctx.completedUnitCount >= 3 },
  { id: "b-unit-5", title: "Montañista", description: "Completa 5 unidades", icon: "🧗", category: "units",
    check: (s, ctx) => ctx.completedUnitCount >= 5 },
  { id: "b-unit-7", title: "Conquistador", description: "Completa las 7 unidades", icon: "🏔️", category: "units",
    check: (s, ctx) => ctx.completedUnitCount >= ctx.totalUnits },

  // --- Exámenes ---
  { id: "b-first-exam", title: "Examinado", description: "Aprueba tu primer examen", icon: "📝", category: "exams",
    check: (s, ctx) => (s.completedExams || []).length >= 1 },
  { id: "b-3-exams", title: "Puntería", description: "Aprueba 3 exámenes de unidad", icon: "🎯", category: "exams",
    check: (s, ctx) => (s.completedExams || []).filter(id => id !== "exam-final").length >= 3 },
  { id: "b-final-exam", title: "Graduado", description: "Aprueba el examen final", icon: "🎓", category: "exams",
    check: (s, ctx) => (s.completedExams || []).includes("exam-final") },
  { id: "b-perfect-exam", title: "Perfeccionista", description: "Aprueba un examen con 100%", icon: "💯", category: "exams",
    check: (s, ctx) => Object.values(s.examScores || {}).some(r => r.passed && r.score === r.total) },

  // --- Racha ---
  { id: "b-streak-3", title: "En Racha", description: "Mantén una racha de 3 días", icon: "🔥", category: "streak",
    check: (s, ctx) => s.streak >= 3 },
  { id: "b-streak-7", title: "Imparable", description: "Mantén una racha de 7 días", icon: "⚡", category: "streak",
    check: (s, ctx) => s.streak >= 7 },
  { id: "b-streak-14", title: "Maratonista", description: "Mantén una racha de 14 días", icon: "🌅", category: "streak",
    check: (s, ctx) => s.streak >= 14 },

  // --- Estudio ---
  { id: "b-100-xp", title: "Cargado", description: "Alcanza 100 XP", icon: "⚡", category: "study",
    check: (s, ctx) => s.xp >= 100 },
  { id: "b-300-xp", title: "Llama de Conocimiento", description: "Alcanza 300 XP", icon: "🌟", category: "study",
    check: (s, ctx) => s.xp >= 300 },
  { id: "b-200-gems", title: "Coleccionista", description: "Acumula 200 gemas", icon: "💎", category: "study",
    check: (s, ctx) => s.gems >= 200 },
  { id: "b-30-words", title: "Bilingüe", description: "Domina 30 palabras", icon: "🗣️", category: "study",
    check: (s, ctx) => (s.stats?.wordsLearned || 0) >= 30 },

  // --- Arcade ---
  { id: "b-arcade-3", title: "Jugador", description: "Juega 3 minijuegos del arcade", icon: "🎮", category: "arcade",
    check: (s, ctx) => {
      const a = s.arcadeStats || {};
      return (a.speedMatchesPlayed || 0) + (a.scramblesCompleted || 0) + (a.audioDetectivesCompleted || 0) + (a.roleplaysCompleted || 0) >= 3;
    }},
  { id: "b-wordfall-100", title: "Lluvia Precisa", description: "Alcanza 100 puntos en Word Fall", icon: "🌧️", category: "arcade",
    check: (s, ctx) => (s.arcadeStats?.wordFallHighScore || 0) >= 100 },
  { id: "b-speed-combo", title: "Rayo Veloz", description: "Haz un combo x3 en Speed Match", icon: "⚡", category: "arcade",
    check: (s, ctx) => (s.arcadeStats?.maxCombo || 0) >= 3 },
  { id: "b-scramble", title: "Maestro Sintáctico", description: "Completa un Sentence Scramble", icon: "🧩", category: "arcade",
    check: (s, ctx) => (s.arcadeStats?.scramblesCompleted || 0) >= 1 },
  { id: "b-detective", title: "Oído Detective", description: "Supera un Audio Detective", icon: "🎧", category: "arcade",
    check: (s, ctx) => (s.arcadeStats?.audioDetectivesCompleted || 0) >= 1 },
  { id: "b-roleplay", title: "Hablante Confiado", description: "Completa un escenario de conversación", icon: "🎭", category: "arcade",
    check: (s, ctx) => (s.arcadeStats?.roleplaysCompleted || 0) >= 1 },
  { id: "b-srs-master", title: "Mente Brillante", description: "Domina 15 palabras en Flashcards", icon: "🧠", category: "arcade",
    check: (s, ctx) => ctx.srsMastered >= 15 }
];

export class BadgeService {
  // Calcula el contexto necesario para evaluar las medallas
  buildContext(state, curriculum) {
    if (!curriculum || !curriculum.units) {
      return { completedUnitCount: 0, totalUnits: 7, srsMastered: state.stats?.wordsLearned || 0 };
    }

    const completedUnitCount = curriculum.units.filter(unit =>
      unit.lessons.every(l => state.completedLessons.includes(l.id))
    ).length;

    // SRS mastered count
    const reviews = Object.values(state.cardReviews || {});
    let srsMastered = reviews.filter(c => (c.level >= 2 || c.correct >= 2)).length;
    srsMastered = Math.max(state.stats?.wordsLearned || 0, srsMastered);

    return {
      completedUnitCount,
      totalUnits: curriculum.units.length,
      srsMastered
    };
  }

  // Devuelve todas las medallas con su estado de desbloqueo
  getAllBadges(state, curriculum) {
    const ctx = this.buildContext(state, curriculum);
    return BADGE_DEFINITIONS.map(def => ({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      unlocked: def.check(state, ctx)
    }));
  }

  // Comprueba qué medallas nuevas se han desbloqueado
  getNewlyUnlocked(state, curriculum, alreadyUnlocked) {
    const allBadges = this.getAllBadges(state, curriculum);
    return allBadges.filter(b => b.unlocked && !alreadyUnlocked.includes(b.id));
  }

  // Estadísticas de progreso
  getProgress(state, curriculum) {
    const allBadges = this.getAllBadges(state, curriculum);
    const unlockedCount = allBadges.filter(b => b.unlocked).length;
    return {
      total: allBadges.length,
      unlocked: unlockedCount,
      percentage: Math.round((unlockedCount / allBadges.length) * 100)
    };
  }
}

export const badgeService = new BadgeService();
