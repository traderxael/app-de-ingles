package com.example.lingoquest.data

data class UnitModel(
    val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val colorHex: String,
    val lessons: List<LessonModel>
)

data class LessonModel(
    val id: String,
    val title: String,
    val xp: Int,
    val exercises: List<ExerciseModel>
)

data class ExerciseModel(
    val type: String, // "translate_to_en", "listen_choose", "multiple_choice", "word_pair"
    val prompt: String = "",
    val sentence: String = "",
    val translation: String = "",
    val solution: List<String> = emptyList(),
    val options: List<String> = emptyList(),
    val hint: String = "",
    val correctIndex: Int = 0,
    val explanation: String = "",
    val pairs: List<WordPair> = emptyList()
)

data class WordPair(
    val es: String,
    val en: String
)

data class FlashcardModel(
    val id: String,
    val en: String,
    val es: String,
    val phonetic: String,
    val category: String,
    val example: String
)

data class SpeedMatchPair(
    val id: String,
    val en: String,
    val es: String
)

data class SentenceScrambleModel(
    val id: String,
    val prompt: String,
    val sentence: String,
    val words: List<String>,
    val hint: String
)

data class AudioDetectiveModel(
    val id: String,
    val word: String,
    val audioWord: String,
    val optionA: String,
    val optionB: String,
    val correctOption: String,
    val hint: String,
    val explanation: String
)

data class RoleplayModel(
    val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val context: String,
    val steps: List<RoleplayStepModel>
)

data class RoleplayStepModel(
    val speaker: String,
    val textEn: String,
    val textEs: String,
    val userOptions: List<RoleplayOptionModel>
)

data class RoleplayOptionModel(
    val textEn: String,
    val textEs: String,
    val isAppropriate: Boolean,
    val feedback: String
)

data class CurriculumData(
    val units: List<UnitModel>,
    val flashcards: List<FlashcardModel>,
    val speedMatchPool: List<SpeedMatchPair>,
    val roleplays: List<RoleplayModel>,
    val sentenceScramblePool: List<SentenceScrambleModel>,
    val audioDetectivePool: List<AudioDetectiveModel>
)

data class SrsCardReview(
    val correct: Int = 0,
    val wrong: Int = 0,
    val level: Int = 0,
    val lastReview: String = ""
)

data class ArcadeStats(
    val maxCombo: Int = 0,
    val speedMatchesPlayed: Int = 0,
    val roleplaysCompleted: Int = 0,
    val wordFallHighScore: Int = 0,
    val scramblesCompleted: Int = 0,
    val audioDetectivesCompleted: Int = 0
)

data class UserGeneralStats(
    val wordsLearned: Int = 24,
    val perfectLessons: Int = 1,
    val timeSpentMinutes: Int = 15
)

data class UserState(
    val avatar: String = "🦁",
    val hearts: Int = 5,
    val maxHearts: Int = 5,
    val gems: Int = 120,
    val streak: Int = 1,
    val streakFreeze: Int = 0,
    val xp: Int = 45,
    val lastActiveDate: String = "",
    val dailyGoalDate: String = "",
    val dailyGoalDone: Boolean = false,
    val completedLessons: Set<String> = setOf("u1-l1"),
    val unlockedUnits: Set<String> = setOf("unit-1"),
    val soundEnabled: Boolean = true,
    val theme: String = "light",
    val cardReviews: Map<String, SrsCardReview> = emptyMap(),
    val arcadeStats: ArcadeStats = ArcadeStats(),
    val stats: UserGeneralStats = UserGeneralStats()
)

data class SrsStatsSummary(
    val mastered: Int,
    val pending: Int,
    val accuracy: Int
)

data class LeaderboardPlayer(
    val id: String,
    val name: String,
    val avatar: String,
    val xp: Int,
    val isUser: Boolean = false,
    val rank: Int = 0
)

data class AchievementModel(
    val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val unlocked: Boolean
)
