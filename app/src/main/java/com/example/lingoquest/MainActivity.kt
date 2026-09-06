package com.example.lingoquest

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.example.lingoquest.data.CurriculumData
import com.example.lingoquest.data.CurriculumRepository
import com.example.lingoquest.data.LessonModel
import com.example.lingoquest.data.UnitModel
import com.example.lingoquest.data.UserProgressRepository
import com.example.lingoquest.services.AudioEffectsService
import com.example.lingoquest.services.TtsService
import com.example.lingoquest.theme.LingoQuestTheme
import com.example.lingoquest.ui.components.AppHud
import com.example.lingoquest.ui.components.AppTab
import com.example.lingoquest.ui.components.BottomNavBar
import com.example.lingoquest.ui.games.AudioDetectiveScreen
import com.example.lingoquest.ui.games.FlashcardsGameScreen
import com.example.lingoquest.ui.games.LessonExerciseScreen
import com.example.lingoquest.ui.games.RoleplayScreen
import com.example.lingoquest.ui.games.SentenceScrambleScreen
import com.example.lingoquest.ui.games.SpeedMatchScreen
import com.example.lingoquest.ui.games.WordFallScreen
import com.example.lingoquest.ui.screens.ArcadeGameType
import com.example.lingoquest.ui.screens.ArcadeMenuScreen
import com.example.lingoquest.ui.screens.LeaderboardScreen
import com.example.lingoquest.ui.screens.LearnPathScreen
import com.example.lingoquest.ui.screens.ProfileScreen
import com.example.lingoquest.ui.screens.ReviewSrsScreen

class MainActivity : ComponentActivity() {

    private lateinit var curriculumRepository: CurriculumRepository
    private lateinit var userProgressRepository: UserProgressRepository
    private lateinit var audioEffectsService: AudioEffectsService
    private lateinit var ttsService: TtsService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        curriculumRepository = CurriculumRepository(this)
        userProgressRepository = UserProgressRepository(this)
        audioEffectsService = AudioEffectsService(this)
        ttsService = TtsService(this)

        val curriculumData = curriculumRepository.getCurriculum()

        setContent {
            val userState by userProgressRepository.userState.collectAsState()
            val isDark = when (userState.theme) {
                "dark" -> true
                "light" -> false
                else -> isSystemInDarkTheme()
            }

            LingoQuestTheme(darkTheme = isDark) {
                LingoQuestMainApp(
                    curriculum = curriculumData,
                    progressRepo = userProgressRepository,
                    audioService = audioEffectsService,
                    ttsService = ttsService
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioEffectsService.release()
        ttsService.release()
    }
}

private sealed class ActiveScreen {
    data object MainTabs : ActiveScreen()
    data class ActiveLesson(val unit: UnitModel, val lesson: LessonModel) : ActiveScreen()
    data class ActiveArcade(val gameType: ArcadeGameType) : ActiveScreen()
}

@Composable
fun LingoQuestMainApp(
    curriculum: CurriculumData,
    progressRepo: UserProgressRepository,
    audioService: AudioEffectsService,
    ttsService: TtsService
) {
    val userState by progressRepo.userState.collectAsState()
    var selectedTab by remember { mutableStateOf(AppTab.LEARN) }
    var activeScreen by remember { mutableStateOf<ActiveScreen>(ActiveScreen.MainTabs) }

    val soundEnabled = userState.soundEnabled

    // Back handling
    BackHandler(enabled = activeScreen !is ActiveScreen.MainTabs) {
        activeScreen = ActiveScreen.MainTabs
    }

    when (val screen = activeScreen) {
        is ActiveScreen.ActiveLesson -> {
            LessonExerciseScreen(
                lesson = screen.lesson,
                hearts = userState.hearts,
                soundEnabled = soundEnabled,
                onPlayAudio = { text -> ttsService.speak(text, soundEnabled) },
                onCorrectSound = { audioService.playCorrect(soundEnabled) },
                onWrongSound = { audioService.playWrong(soundEnabled) },
                onPopSound = { audioService.playPop(soundEnabled) },
                onLevelUpSound = { audioService.playLevelUp(soundEnabled) },
                onDeductHeart = { progressRepo.deductHeart() },
                onLessonCompleted = { xp, gems ->
                    progressRepo.markLessonCompleted(screen.lesson.id, xp, gems)
                },
                onExit = { activeScreen = ActiveScreen.MainTabs }
            )
        }
        is ActiveScreen.ActiveArcade -> {
            when (screen.gameType) {
                ArcadeGameType.SPEED_MATCH -> {
                    SpeedMatchScreen(
                        pool = curriculum.speedMatchPool,
                        onFinish = { score, maxCombo ->
                            audioService.playLevelUp(soundEnabled)
                            progressRepo.recordSpeedMatch(score, maxCombo)
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
                ArcadeGameType.WORD_FALL -> {
                    WordFallScreen(
                        pool = curriculum.speedMatchPool,
                        onFinish = { score ->
                            audioService.playLevelUp(soundEnabled)
                            progressRepo.recordWordFall(score)
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
                ArcadeGameType.SENTENCE_SCRAMBLE -> {
                    SentenceScrambleScreen(
                        pool = curriculum.sentenceScramblePool,
                        onFinish = { score ->
                            audioService.playLevelUp(soundEnabled)
                            progressRepo.recordSentenceScramble(score)
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onPlayAudio = { ttsService.speak(it, soundEnabled) },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
                ArcadeGameType.AUDIO_DETECTIVE -> {
                    AudioDetectiveScreen(
                        pool = curriculum.audioDetectivePool,
                        onFinish = { score ->
                            audioService.playLevelUp(soundEnabled)
                            progressRepo.recordAudioDetective(score)
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onPlayAudio = { ttsService.speak(it, soundEnabled) },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
                ArcadeGameType.ROLEPLAY -> {
                    RoleplayScreen(
                        roleplays = curriculum.roleplays,
                        onFinish = {
                            audioService.playLevelUp(soundEnabled)
                            progressRepo.recordRoleplayCompleted()
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onPlayAudio = { ttsService.speak(it, soundEnabled) },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
                ArcadeGameType.FLASHCARDS -> {
                    FlashcardsGameScreen(
                        cards = curriculum.flashcards,
                        onCardReviewed = { cardId, remembered ->
                            progressRepo.recordCardReview(cardId, remembered)
                        },
                        onFinish = {
                            audioService.playLevelUp(soundEnabled)
                            activeScreen = ActiveScreen.MainTabs
                        },
                        onExit = { activeScreen = ActiveScreen.MainTabs },
                        onPlayAudio = { ttsService.speak(it, soundEnabled) },
                        onCorrectSound = { audioService.playCorrect(soundEnabled) },
                        onWrongSound = { audioService.playWrong(soundEnabled) },
                        onPopSound = { audioService.playPop(soundEnabled) }
                    )
                }
            }
        }
        is ActiveScreen.MainTabs -> {
            Scaffold(
                topBar = {
                    AppHud(
                        userState = userState,
                        onSoundToggle = { progressRepo.toggleSound() },
                        onThemeToggle = { progressRepo.toggleTheme() },
                        onHeartsClick = { selectedTab = AppTab.PROFILE }
                    )
                },
                bottomBar = {
                    BottomNavBar(
                        selectedTab = selectedTab,
                        onTabSelected = { selectedTab = it }
                    )
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    when (selectedTab) {
                        AppTab.LEARN -> {
                            LearnPathScreen(
                                units = curriculum.units,
                                userState = userState,
                                onLessonClick = { unit, lesson ->
                                    activeScreen = ActiveScreen.ActiveLesson(unit, lesson)
                                }
                            )
                        }
                        AppTab.ARCADE -> {
                            ArcadeMenuScreen(
                                onSelectGame = { gameType ->
                                    activeScreen = ActiveScreen.ActiveArcade(gameType)
                                }
                            )
                        }
                        AppTab.LEADERBOARD -> {
                            LeaderboardScreen(
                                players = progressRepo.getWeeklyLeaderboard()
                            )
                        }
                        AppTab.REVIEW -> {
                            ReviewSrsScreen(
                                stats = progressRepo.getSrsStats(curriculum.flashcards.size),
                                flashcards = curriculum.flashcards,
                                onStartSrsSession = {
                                    activeScreen = ActiveScreen.ActiveArcade(ArcadeGameType.FLASHCARDS)
                                },
                                onPlayAudio = { text -> ttsService.speak(text, soundEnabled) }
                            )
                        }
                        AppTab.PROFILE -> {
                            ProfileScreen(
                                userState = userState,
                                achievements = progressRepo.getAchievements(curriculum.units.size),
                                onSelectAvatar = { progressRepo.setAvatar(it) },
                                onBuyShield = { progressRepo.buyStreakFreeze() },
                                onRefillHearts = { progressRepo.refillHearts() },
                                onResetProgress = { progressRepo.resetAll() }
                            )
                        }
                    }
                }
            }
        }
    }
}
