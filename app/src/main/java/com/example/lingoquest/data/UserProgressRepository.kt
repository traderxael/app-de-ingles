package com.example.lingoquest.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class UserProgressRepository(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("lingoquest_player_state_prefs", Context.MODE_PRIVATE)

    private val _userState = MutableStateFlow(loadState())
    val userState: StateFlow<UserState> = _userState.asStateFlow()

    init {
        checkStreak()
    }

    private fun getCurrentDateString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    private fun loadState(): UserState {
        val rawJson = prefs.getString("player_state_json", null)
        if (rawJson.isNullOrEmpty()) {
            val defaultState = UserState(
                avatar = "🦁",
                hearts = 5,
                maxHearts = 5,
                gems = 120,
                streak = 1,
                streakFreeze = 0,
                xp = 45,
                lastActiveDate = getCurrentDateString(),
                dailyGoalDate = getCurrentDateString(),
                dailyGoalDone = false,
                completedLessons = setOf("u1-l1"),
                unlockedUnits = setOf("unit-1"),
                soundEnabled = true,
                theme = "light",
                cardReviews = emptyMap(),
                arcadeStats = ArcadeStats(),
                stats = UserGeneralStats(wordsLearned = 24, perfectLessons = 1, timeSpentMinutes = 15)
            )
            saveStateInternal(defaultState)
            return defaultState
        }

        return try {
            val root = JSONObject(rawJson)
            val completedArr = root.optJSONArray("completedLessons") ?: JSONArray()
            val completedSet = mutableSetOf<String>()
            for (i in 0 until completedArr.length()) {
                completedSet.add(completedArr.getString(i))
            }

            val unlockedArr = root.optJSONArray("unlockedUnits") ?: JSONArray()
            val unlockedSet = mutableSetOf<String>()
            for (i in 0 until unlockedArr.length()) {
                unlockedSet.add(unlockedArr.getString(i))
            }
            if (unlockedSet.isEmpty()) unlockedSet.add("unit-1")

            val cardReviewsObj = root.optJSONObject("cardReviews") ?: JSONObject()
            val cardReviewsMap = mutableMapOf<String, SrsCardReview>()
            val keys = cardReviewsObj.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val cObj = cardReviewsObj.getJSONObject(key)
                cardReviewsMap[key] = SrsCardReview(
                    correct = cObj.optInt("correct", 0),
                    wrong = cObj.optInt("wrong", 0),
                    level = cObj.optInt("level", 0),
                    lastReview = cObj.optString("lastReview", "")
                )
            }

            val arcadeObj = root.optJSONObject("arcadeStats") ?: JSONObject()
            val arcadeStats = ArcadeStats(
                maxCombo = arcadeObj.optInt("maxCombo", 0),
                speedMatchesPlayed = arcadeObj.optInt("speedMatchesPlayed", 0),
                roleplaysCompleted = arcadeObj.optInt("roleplaysCompleted", 0),
                wordFallHighScore = arcadeObj.optInt("wordFallHighScore", 0),
                scramblesCompleted = arcadeObj.optInt("scramblesCompleted", 0),
                audioDetectivesCompleted = arcadeObj.optInt("audioDetectivesCompleted", 0)
            )

            val statsObj = root.optJSONObject("stats") ?: JSONObject()
            val generalStats = UserGeneralStats(
                wordsLearned = statsObj.optInt("wordsLearned", 24),
                perfectLessons = statsObj.optInt("perfectLessons", 1),
                timeSpentMinutes = statsObj.optInt("timeSpentMinutes", 15)
            )

            UserState(
                avatar = root.optString("avatar", "🦁"),
                hearts = root.optInt("hearts", 5),
                maxHearts = root.optInt("maxHearts", 5),
                gems = root.optInt("gems", 120),
                streak = root.optInt("streak", 1),
                streakFreeze = root.optInt("streakFreeze", 0),
                xp = root.optInt("xp", 45),
                lastActiveDate = root.optString("lastActiveDate", getCurrentDateString()),
                dailyGoalDate = root.optString("dailyGoalDate", getCurrentDateString()),
                dailyGoalDone = root.optBoolean("dailyGoalDone", false),
                completedLessons = completedSet,
                unlockedUnits = unlockedSet,
                soundEnabled = root.optBoolean("soundEnabled", true),
                theme = root.optString("theme", "light"),
                cardReviews = cardReviewsMap,
                arcadeStats = arcadeStats,
                stats = generalStats
            )
        } catch (e: Exception) {
            UserState()
        }
    }

    private fun saveStateInternal(state: UserState) {
        try {
            val root = JSONObject()
            root.put("avatar", state.avatar)
            root.put("hearts", state.hearts)
            root.put("maxHearts", state.maxHearts)
            root.put("gems", state.gems)
            root.put("streak", state.streak)
            root.put("streakFreeze", state.streakFreeze)
            root.put("xp", state.xp)
            root.put("lastActiveDate", state.lastActiveDate)
            root.put("dailyGoalDate", state.dailyGoalDate)
            root.put("dailyGoalDone", state.dailyGoalDone)

            val compArr = JSONArray()
            state.completedLessons.forEach { compArr.put(it) }
            root.put("completedLessons", compArr)

            val unlArr = JSONArray()
            state.unlockedUnits.forEach { unlArr.put(it) }
            root.put("unlockedUnits", unlArr)

            root.put("soundEnabled", state.soundEnabled)
            root.put("theme", state.theme)

            val cardRevObj = JSONObject()
            state.cardReviews.forEach { (k, v) ->
                val c = JSONObject()
                c.put("correct", v.correct)
                c.put("wrong", v.wrong)
                c.put("level", v.level)
                c.put("lastReview", v.lastReview)
                cardRevObj.put(k, c)
            }
            root.put("cardReviews", cardRevObj)

            val arcObj = JSONObject()
            arcObj.put("maxCombo", state.arcadeStats.maxCombo)
            arcObj.put("speedMatchesPlayed", state.arcadeStats.speedMatchesPlayed)
            arcObj.put("roleplaysCompleted", state.arcadeStats.roleplaysCompleted)
            arcObj.put("wordFallHighScore", state.arcadeStats.wordFallHighScore)
            arcObj.put("scramblesCompleted", state.arcadeStats.scramblesCompleted)
            arcObj.put("audioDetectivesCompleted", state.arcadeStats.audioDetectivesCompleted)
            root.put("arcadeStats", arcObj)

            val stObj = JSONObject()
            stObj.put("wordsLearned", state.stats.wordsLearned)
            stObj.put("perfectLessons", state.stats.perfectLessons)
            stObj.put("timeSpentMinutes", state.stats.timeSpentMinutes)
            root.put("stats", stObj)

            prefs.edit().putString("player_state_json", root.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun mutateState(reducer: (UserState) -> UserState) {
        val newState = reducer(_userState.value)
        _userState.value = newState
        saveStateInternal(newState)
    }

    fun checkStreak() {
        val today = getCurrentDateString()
        mutateState { current ->
            val last = current.lastActiveDate
            if (last.isEmpty()) {
                current.copy(lastActiveDate = today, streak = 1)
            } else if (last == today) {
                current
            } else {
                try {
                    val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    val dLast = sdf.parse(last)
                    val dToday = sdf.parse(today)
                    val diffDays = ((dToday.time - dLast.time) / (1000 * 60 * 60 * 24)).toInt()

                    if (diffDays == 1) {
                        current.copy(
                            streak = current.streak + 1,
                            lastActiveDate = today,
                            dailyGoalDate = today,
                            dailyGoalDone = false
                        )
                    } else if (diffDays > 1) {
                        if (current.streakFreeze > 0) {
                            current.copy(
                                streakFreeze = current.streakFreeze - 1,
                                lastActiveDate = today,
                                dailyGoalDate = today,
                                dailyGoalDone = false
                            )
                        } else {
                            current.copy(
                                streak = 1,
                                lastActiveDate = today,
                                dailyGoalDate = today,
                                dailyGoalDone = false
                            )
                        }
                    } else {
                        current
                    }
                } catch (e: Exception) {
                    current.copy(lastActiveDate = today)
                }
            }
        }
    }

    fun setAvatar(avatarEmoji: String) {
        mutateState { it.copy(avatar = avatarEmoji) }
    }

    fun toggleSound(): Boolean {
        var result = false
        mutateState {
            result = !it.soundEnabled
            it.copy(soundEnabled = result)
        }
        return result
    }

    fun toggleTheme(): String {
        var next = "light"
        mutateState {
            next = if (it.theme == "dark") "light" else "dark"
            it.copy(theme = next)
        }
        return next
    }

    fun deductHeart(): Int {
        var heartsLeft = 0
        mutateState {
            heartsLeft = (it.hearts - 1).coerceAtLeast(0)
            it.copy(hearts = heartsLeft)
        }
        return heartsLeft
    }

    fun addHeart(amount: Int = 1) {
        mutateState {
            it.copy(hearts = (it.hearts + amount).coerceAtMost(it.maxHearts))
        }
    }

    fun refillHearts() {
        mutateState {
            it.copy(hearts = it.maxHearts)
        }
    }

    fun addXp(amount: Int) {
        mutateState {
            it.copy(xp = it.xp + amount)
        }
    }

    fun addGems(amount: Int) {
        mutateState {
            it.copy(gems = it.gems + amount)
        }
    }

    fun buyStreakFreeze(): Boolean {
        var success = false
        mutateState {
            if (it.gems >= 50) {
                success = true
                it.copy(
                    gems = it.gems - 50,
                    streakFreeze = it.streakFreeze + 1
                )
            } else {
                it
            }
        }
        return success
    }

    fun markLessonCompleted(lessonId: String, earnedXp: Int = 15, earnedGems: Int = 10) {
        val today = getCurrentDateString()
        mutateState { current ->
            val isNew = !current.completedLessons.contains(lessonId)
            val newLessons = current.completedLessons + lessonId
            val newWords = if (isNew) current.stats.wordsLearned + 6 else current.stats.wordsLearned
            val newStats = current.stats.copy(wordsLearned = newWords)

            // Unlock next units if applicable
            val newUnlocked = current.unlockedUnits.toMutableSet()
            if (newLessons.size >= 2) newUnlocked.add("unit-2")
            if (newLessons.size >= 4) newUnlocked.add("unit-3")
            if (newLessons.size >= 6) newUnlocked.add("unit-4")
            if (newLessons.size >= 8) newUnlocked.add("unit-5")
            if (newLessons.size >= 10) newUnlocked.add("unit-6")
            if (newLessons.size >= 12) newUnlocked.add("unit-7")

            current.copy(
                completedLessons = newLessons,
                unlockedUnits = newUnlocked,
                xp = current.xp + earnedXp,
                gems = current.gems + earnedGems,
                dailyGoalDate = today,
                dailyGoalDone = true,
                stats = newStats
            )
        }
    }

    fun recordCardReview(cardId: String, remembered: Boolean) {
        val now = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).format(Date())
        mutateState { current ->
            val existing = current.cardReviews[cardId] ?: SrsCardReview()
            val updated = if (remembered) {
                existing.copy(
                    correct = existing.correct + 1,
                    level = (existing.level + 1).coerceAtMost(5),
                    lastReview = now
                )
            } else {
                existing.copy(
                    wrong = existing.wrong + 1,
                    level = (existing.level - 1).coerceAtLeast(0),
                    lastReview = now
                )
            }
            val newReviews = current.cardReviews + (cardId to updated)
            val xpGain = if (remembered) 3 else 0
            current.copy(
                cardReviews = newReviews,
                xp = current.xp + xpGain
            )
        }
    }

    fun recordSpeedMatch(score: Int, maxCombo: Int) {
        mutateState { current ->
            val currentArcade = current.arcadeStats
            val updated = currentArcade.copy(
                speedMatchesPlayed = currentArcade.speedMatchesPlayed + 1,
                maxCombo = maxOf(currentArcade.maxCombo, maxCombo)
            )
            current.copy(
                arcadeStats = updated,
                xp = current.xp + (score / 5).coerceAtLeast(10)
            )
        }
    }

    fun recordRoleplayCompleted() {
        mutateState { current ->
            val updated = current.arcadeStats.copy(
                roleplaysCompleted = current.arcadeStats.roleplaysCompleted + 1
            )
            current.copy(
                arcadeStats = updated,
                xp = current.xp + 35,
                gems = current.gems + 15
            )
        }
    }

    fun recordWordFall(score: Int) {
        mutateState { current ->
            val updated = current.arcadeStats.copy(
                wordFallHighScore = maxOf(current.arcadeStats.wordFallHighScore, score)
            )
            current.copy(
                arcadeStats = updated,
                xp = current.xp + (score / 4).coerceAtLeast(15)
            )
        }
    }

    fun recordSentenceScramble(score: Int) {
        mutateState { current ->
            val updated = current.arcadeStats.copy(
                scramblesCompleted = current.arcadeStats.scramblesCompleted + 1
            )
            current.copy(
                arcadeStats = updated,
                xp = current.xp + 40,
                gems = current.gems + 10
            )
        }
    }

    fun recordAudioDetective(score: Int) {
        mutateState { current ->
            val updated = current.arcadeStats.copy(
                audioDetectivesCompleted = current.arcadeStats.audioDetectivesCompleted + 1
            )
            current.copy(
                arcadeStats = updated,
                xp = current.xp + 35,
                gems = current.gems + 10
            )
        }
    }

    fun getSrsStats(totalDeckCount: Int = 45): SrsStatsSummary {
        val state = _userState.value
        val reviews = state.cardReviews.values
        var mastered = 0
        var totalCorrect = 0
        var totalWrong = 0

        reviews.forEach { c ->
            if (c.level >= 2 || c.correct >= 2) mastered++
            totalCorrect += c.correct
            totalWrong += c.wrong
        }

        val totalActions = totalCorrect + totalWrong
        val accuracy = if (totalActions > 0) ((totalCorrect.toFloat() / totalActions) * 100).toInt() else 94
        val pending = (totalDeckCount - mastered).coerceAtLeast(4)

        return SrsStatsSummary(
            mastered = maxOf(state.stats.wordsLearned, mastered),
            pending = pending,
            accuracy = accuracy
        )
    }

    fun getWeeklyLeaderboard(): List<LeaderboardPlayer> {
        val state = _userState.value
        val bots = listOf(
            LeaderboardPlayer(id = "b1", name = "Sofia Ramirez", avatar = "🦉", xp = 390),
            LeaderboardPlayer(id = "b2", name = "Lucas Vance", avatar = "🧑‍🚀", xp = 320),
            LeaderboardPlayer(id = "b3", name = "Mateo Gomez", avatar = "🦊", xp = 265),
            LeaderboardPlayer(id = "b4", name = "Elena Chen", avatar = "🐱", xp = 210),
            LeaderboardPlayer(id = "b5", name = "Carlos Mendez", avatar = "🐼", xp = 175),
            LeaderboardPlayer(id = "b6", name = "Valeria Diaz", avatar = "🐨", xp = 130),
            LeaderboardPlayer(id = "b7", name = "David Miller", avatar = "🐯", xp = 95),
            LeaderboardPlayer(id = "b8", name = "Camila Torres", avatar = "🦄", xp = 60)
        )

        val allPlayers = bots + LeaderboardPlayer(
            id = "user",
            name = "Tú (Estudiante LingoQuest)",
            avatar = state.avatar,
            xp = state.xp,
            isUser = true
        )

        return allPlayers
            .sortedByDescending { it.xp }
            .mapIndexed { index, player -> player.copy(rank = index + 1) }
    }

    fun getAchievements(totalUnitsCount: Int = 7): List<AchievementModel> {
        val state = _userState.value
        val srs = getSrsStats()
        val arcade = state.arcadeStats

        return listOf(
            AchievementModel(
                id = "ach-first-step",
                title = "Primer Paso",
                description = "Completa tu primera lección",
                icon = "🚀",
                unlocked = state.completedLessons.isNotEmpty()
            ),
            AchievementModel(
                id = "ach-streak",
                title = "En Racha",
                description = "Mantén una racha de al menos 1 día",
                icon = "🔥",
                unlocked = state.streak >= 1
            ),
            AchievementModel(
                id = "ach-speed",
                title = "Rayo Veloz",
                description = "Haz un combo x3 en Speed Match",
                icon = "⚡",
                unlocked = arcade.maxCombo >= 3
            ),
            AchievementModel(
                id = "ach-wordfall",
                title = "Lluvia Precisa",
                description = "Alcanza 100 puntos en Word Fall",
                icon = "🌧️",
                unlocked = arcade.wordFallHighScore >= 100
            ),
            AchievementModel(
                id = "ach-scramble",
                title = "Maestro Sintáctico",
                description = "Completa un desafío de Sentence Scramble",
                icon = "🧩",
                unlocked = arcade.scramblesCompleted >= 1
            ),
            AchievementModel(
                id = "ach-detective",
                title = "Oído Detective",
                description = "Supera un desafío de Audio Detective",
                icon = "🎧",
                unlocked = arcade.audioDetectivesCompleted >= 1
            ),
            AchievementModel(
                id = "ach-speaker",
                title = "Hablante Confiado",
                description = "Completa un escenario de conversación",
                icon = "🎭",
                unlocked = arcade.roleplaysCompleted >= 1
            ),
            AchievementModel(
                id = "ach-srs-master",
                title = "Mente Brillante",
                description = "Domina al menos 15 palabras en Flashcards",
                icon = "🧠",
                unlocked = srs.mastered >= 15
            ),
            AchievementModel(
                id = "ach-polyglot",
                title = "Políglota",
                description = "Completa todas las unidades del curso",
                icon = "👑",
                unlocked = state.completedLessons.size >= totalUnitsCount * 2
            )
        )
    }

    fun resetAll() {
        val defaultState = UserState(
            avatar = "🦁",
            hearts = 5,
            maxHearts = 5,
            gems = 120,
            streak = 1,
            streakFreeze = 0,
            xp = 45,
            lastActiveDate = getCurrentDateString(),
            dailyGoalDate = getCurrentDateString(),
            dailyGoalDone = false,
            completedLessons = emptySet(),
            unlockedUnits = setOf("unit-1"),
            soundEnabled = true,
            theme = "light",
            cardReviews = emptyMap(),
            arcadeStats = ArcadeStats(),
            stats = UserGeneralStats(wordsLearned = 0, perfectLessons = 0, timeSpentMinutes = 0)
        )
        _userState.value = defaultState
        saveStateInternal(defaultState)
    }
}
