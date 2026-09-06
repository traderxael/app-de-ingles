package com.example.lingoquest.ui.games

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lingoquest.data.ExerciseModel
import com.example.lingoquest.data.LessonModel
import com.example.lingoquest.data.WordPair
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LessonExerciseScreen(
    lesson: LessonModel,
    hearts: Int,
    soundEnabled: Boolean,
    onPlayAudio: (String) -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    onLevelUpSound: () -> Unit,
    onDeductHeart: () -> Unit,
    onLessonCompleted: (earnedXp: Int, earnedGems: Int) -> Unit,
    onExit: () -> Unit,
    modifier: Modifier = Modifier
) {
    val exercises = lesson.exercises
    var currentExerciseIndex by remember { mutableStateOf(0) }
    var isChecking by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf<Boolean?>(null) }
    var feedbackMessage by remember { mutableStateOf("") }
    var isLessonFinished by remember { mutableStateOf(false) }

    // State for builder types
    val selectedWords = remember { mutableStateListOf<String>() }
    var selectedMultipleChoiceIndex by remember { mutableStateOf<Int?>(null) }

    // State for word pairs
    var selectedEsWord by remember { mutableStateOf<String?>(null) }
    var selectedEnWord by remember { mutableStateOf<String?>(null) }
    val matchedPairs = remember { mutableStateListOf<String>() }

    val currentEx = exercises.getOrNull(currentExerciseIndex)

    // Reset local selections on exercise change
    LaunchedEffect(currentExerciseIndex) {
        selectedWords.clear()
        selectedMultipleChoiceIndex = null
        selectedEsWord = null
        selectedEnWord = null
        matchedPairs.clear()
        isChecking = false
        isCorrect = null
        feedbackMessage = ""

        currentEx?.let { ex ->
            if (ex.type == "listen_choose" && ex.sentence.isNotEmpty()) {
                onPlayAudio(ex.sentence)
            }
        }
    }

    if (isLessonFinished) {
        LessonCelebrationView(
            lesson = lesson,
            onContinue = {
                onLevelUpSound()
                onLessonCompleted(lesson.xp, 10)
                onExit()
            }
        )
        return
    }

    if (currentEx == null) {
        onExit()
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .testTag("lesson_exercise_screen")
    ) {
        // Top Header: Exit, Progress Bar, Hearts
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onExit,
                modifier = Modifier.testTag("btn_exit_lesson")
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Salir",
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            LinearProgressIndicator(
                progress = { (currentExerciseIndex.toFloat() / exercises.size.toFloat()).coerceIn(0f, 1f) },
                modifier = Modifier
                    .weight(1f)
                    .height(12.dp)
                    .clip(RoundedCornerShape(6.dp)),
                color = DuolingoGreen,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.width(12.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "❤️", fontSize = 16.sp)
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "$hearts",
                    fontWeight = FontWeight.Bold,
                    color = AccentRed,
                    fontSize = 15.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Exercise Content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            when (currentEx.type) {
                "translate_to_en" -> {
                    TranslateExerciseContent(
                        exercise = currentEx,
                        selectedWords = selectedWords,
                        onAddWord = { word ->
                            onPopSound()
                            selectedWords.add(word)
                        },
                        onRemoveWord = { word ->
                            onPopSound()
                            selectedWords.remove(word)
                        }
                    )
                }
                "listen_choose" -> {
                    ListenChooseExerciseContent(
                        exercise = currentEx,
                        selectedWords = selectedWords,
                        onAddWord = { word ->
                            onPopSound()
                            selectedWords.add(word)
                        },
                        onRemoveWord = { word ->
                            onPopSound()
                            selectedWords.remove(word)
                        },
                        onPlayAudio = { onPlayAudio(currentEx.sentence) }
                    )
                }
                "multiple_choice" -> {
                    MultipleChoiceContent(
                        exercise = currentEx,
                        selectedIndex = selectedMultipleChoiceIndex,
                        onSelectIndex = { idx ->
                            onPopSound()
                            selectedMultipleChoiceIndex = idx
                        }
                    )
                }
                "word_pair" -> {
                    WordPairContent(
                        exercise = currentEx,
                        selectedEs = selectedEsWord,
                        selectedEn = selectedEnWord,
                        matchedPairs = matchedPairs,
                        onSelectEs = { es ->
                            onPopSound()
                            selectedEsWord = es
                            checkPairMatch(
                                currentEx.pairs,
                                es,
                                selectedEnWord,
                                matchedPairs,
                                onMatch = { onCorrectSound() },
                                onClear = { selectedEsWord = null; selectedEnWord = null }
                            )
                        },
                        onSelectEn = { en ->
                            onPopSound()
                            selectedEnWord = en
                            checkPairMatch(
                                currentEx.pairs,
                                selectedEsWord,
                                en,
                                matchedPairs,
                                onMatch = { onCorrectSound() },
                                onClear = { selectedEsWord = null; selectedEnWord = null }
                            )
                        }
                    )
                }
            }
        }

        // Bottom Action / Feedback Area
        AnimatedVisibility(
            visible = isChecking,
            enter = slideInVertically { it } + fadeIn()
        ) {
            val correct = isCorrect == true
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
                    .testTag("exercise_feedback_card"),
                colors = CardDefaults.cardColors(
                    containerColor = if (correct) DuolingoGreen.copy(alpha = 0.15f) else AccentRed.copy(alpha = 0.15f)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = if (correct) "¡Excelente! 🎉" else "Solución correcta:",
                        fontWeight = FontWeight.Bold,
                        color = if (correct) DuolingoGreen else AccentRed,
                        fontSize = 17.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = feedbackMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }

        // Check or Next Button
        Button(
            onClick = {
                if (!isChecking) {
                    // Perform check
                    var pass = false
                    when (currentEx.type) {
                        "translate_to_en", "listen_choose" -> {
                            val userBuilt = selectedWords.joinToString(" ").trim()
                            val correct = currentEx.solution.joinToString(" ").trim()
                            pass = userBuilt.equals(correct, ignoreCase = true)
                            feedbackMessage = if (pass) "¡Correcto! Entonación perfecta." else correct
                        }
                        "multiple_choice" -> {
                            pass = selectedMultipleChoiceIndex == currentEx.correctIndex
                            feedbackMessage = if (pass) currentEx.explanation.ifEmpty { "¡Opción correcta!" } else currentEx.options.getOrNull(currentEx.correctIndex) ?: ""
                        }
                        "word_pair" -> {
                            pass = matchedPairs.size >= currentEx.pairs.size
                            feedbackMessage = "¡Todas las parejas conectadas correctamente!"
                        }
                    }

                    isCorrect = pass
                    isChecking = true
                    if (pass) {
                        onCorrectSound()
                    } else {
                        onWrongSound()
                        onDeductHeart()
                    }
                } else {
                    // Next Exercise or finish
                    if (currentExerciseIndex + 1 < exercises.size) {
                        currentExerciseIndex++
                    } else {
                        isLessonFinished = true
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("btn_check_exercise"),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isChecking) {
                    if (isCorrect == true) DuolingoGreen else AccentRed
                } else DuolingoGreen
            ),
            shape = RoundedCornerShape(16.dp),
            enabled = when (currentEx.type) {
                "translate_to_en", "listen_choose" -> selectedWords.isNotEmpty() || isChecking
                "multiple_choice" -> selectedMultipleChoiceIndex != null || isChecking
                "word_pair" -> matchedPairs.isNotEmpty() || isChecking
                else -> true
            }
        ) {
            Text(
                text = if (isChecking) "CONTINUAR" else "COMPROBAR",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = Color.White
            )
        }
    }
}

private fun checkPairMatch(
    pairs: List<WordPair>,
    selectedEs: String?,
    selectedEn: String?,
    matchedPairs: MutableList<String>,
    onMatch: () -> Unit,
    onClear: () -> Unit
) {
    if (selectedEs != null && selectedEn != null) {
        val found = pairs.find { it.es == selectedEs && it.en == selectedEn }
        if (found != null) {
            matchedPairs.add(selectedEs)
            onMatch()
        }
        onClear()
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TranslateExerciseContent(
    exercise: ExerciseModel,
    selectedWords: List<String>,
    onAddWord: (String) -> Unit,
    onRemoveWord: (String) -> Unit
) {
    Column {
        Text(
            text = "Traduce esta oración al inglés:",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(14.dp))

        // Target Spanish Prompt
        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Text(
                text = exercise.prompt,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp),
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        if (exercise.hint.isNotEmpty()) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "💡 Pista: ${exercise.hint}",
                fontSize = 12.sp,
                color = AccentOrange
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Sentence Construction Zone
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(90.dp)
                .clip(RoundedCornerShape(14.dp))
                .border(1.dp, MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(14.dp)),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
        ) {
            FlowRow(
                modifier = Modifier.padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                selectedWords.forEach { word ->
                    WordChip(
                        word = word,
                        isSelected = true,
                        onClick = { onRemoveWord(word) }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Available Options Pool
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            exercise.options.forEach { opt ->
                val countInSelected = selectedWords.count { it == opt }
                val countInOptions = exercise.options.count { it == opt }
                val isAvailable = countInSelected < countInOptions

                WordChip(
                    word = opt,
                    isSelected = !isAvailable,
                    onClick = {
                        if (isAvailable) onAddWord(opt)
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ListenChooseExerciseContent(
    exercise: ExerciseModel,
    selectedWords: List<String>,
    onAddWord: (String) -> Unit,
    onRemoveWord: (String) -> Unit,
    onPlayAudio: () -> Unit
) {
    Column {
        Text(
            text = "Escucha atentamente y construye la frase:",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(14.dp))

        // Big Audio Speaker Button
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(
                onClick = onPlayAudio,
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(DuolingoGreen)
                    .testTag("btn_play_exercise_audio")
            ) {
                Icon(
                    imageVector = Icons.Default.VolumeUp,
                    contentDescription = "Escuchar audio",
                    tint = Color.White,
                    modifier = Modifier.size(32.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = "Toca para escuchar",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                if (exercise.translation.isNotEmpty()) {
                    Text(
                        text = exercise.translation,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Answer Builder Area
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(90.dp)
                .clip(RoundedCornerShape(14.dp))
                .border(1.dp, MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(14.dp)),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
        ) {
            FlowRow(
                modifier = Modifier.padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                selectedWords.forEach { word ->
                    WordChip(
                        word = word,
                        isSelected = true,
                        onClick = { onRemoveWord(word) }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Options Pool
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            exercise.options.forEach { opt ->
                val countInSelected = selectedWords.count { it == opt }
                val countInOptions = exercise.options.count { it == opt }
                val isAvailable = countInSelected < countInOptions

                WordChip(
                    word = opt,
                    isSelected = !isAvailable,
                    onClick = {
                        if (isAvailable) onAddWord(opt)
                    }
                )
            }
        }
    }
}

@Composable
private fun MultipleChoiceContent(
    exercise: ExerciseModel,
    selectedIndex: Int?,
    onSelectIndex: (Int) -> Unit
) {
    Column {
        Text(
            text = "Selecciona la opción correcta:",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(12.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Text(
                text = exercise.prompt,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(16.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        exercise.options.forEachIndexed { idx, optionText ->
            val isSelected = selectedIndex == idx
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 5.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .clickable { onSelectIndex(idx) }
                    .border(
                        width = if (isSelected) 2.dp else 1.dp,
                        color = if (isSelected) DuolingoGreen else MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(14.dp)
                    ),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSelected) DuolingoGreen.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(if (isSelected) DuolingoGreen else MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(Color.White)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = optionText,
                        fontSize = 15.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
private fun WordPairContent(
    exercise: ExerciseModel,
    selectedEs: String?,
    selectedEn: String?,
    matchedPairs: List<String>,
    onSelectEs: (String) -> Unit,
    onSelectEn: (String) -> Unit
) {
    Column {
        Text(
            text = "Empareja las palabras equivalentes:",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Spanish Column
            Column(modifier = Modifier.weight(1f)) {
                exercise.pairs.forEach { pair ->
                    val isMatched = matchedPairs.contains(pair.es)
                    val isSelected = selectedEs == pair.es
                    PairItemCard(
                        text = pair.es,
                        isSelected = isSelected,
                        isMatched = isMatched,
                        onClick = { if (!isMatched) onSelectEs(pair.es) }
                    )
                }
            }

            // English Column (shuffled order)
            val shuffledEn = remember(exercise) { exercise.pairs.map { it.en }.shuffled() }
            Column(modifier = Modifier.weight(1f)) {
                shuffledEn.forEach { enText ->
                    val matchingPair = exercise.pairs.find { it.en == enText }
                    val isMatched = matchingPair != null && matchedPairs.contains(matchingPair.es)
                    val isSelected = selectedEn == enText
                    PairItemCard(
                        text = enText,
                        isSelected = isSelected,
                        isMatched = isMatched,
                        onClick = { if (!isMatched) onSelectEn(enText) }
                    )
                }
            }
        }
    }
}

@Composable
private fun PairItemCard(
    text: String,
    isSelected: Boolean,
    isMatched: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp)
            .clip(RoundedCornerShape(12.dp))
            .clickable(enabled = !isMatched) { onClick() }
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = when {
                    isMatched -> DuolingoGreen
                    isSelected -> AccentOrange
                    else -> MaterialTheme.colorScheme.surfaceVariant
                },
                shape = RoundedCornerShape(12.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isMatched -> DuolingoGreen.copy(alpha = 0.2f)
                isSelected -> AccentOrange.copy(alpha = 0.15f)
                else -> MaterialTheme.colorScheme.surface
            }
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp, horizontal = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp,
                color = if (isMatched) DuolingoGreen else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun WordChip(
    word: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .border(
                width = 1.dp,
                color = if (isSelected) MaterialTheme.colorScheme.surfaceVariant else DuolingoGreen,
                shape = RoundedCornerShape(12.dp)
            ),
        color = if (isSelected) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f) else MaterialTheme.colorScheme.surface,
        shadowElevation = if (isSelected) 0.dp else 2.dp
    ) {
        Text(
            text = word,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (isSelected) MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f) else MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun LessonCelebrationView(
    lesson: LessonModel,
    onContinue: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "🎉", fontSize = 72.sp)
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "¡Lección Completada!",
            style = MaterialTheme.typography.headlineLarge,
            color = DuolingoGreen,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = lesson.title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(28.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AccentOrange.copy(alpha = 0.15f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "+${lesson.xp} XP", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = AccentOrange)
                    Text(text = "Puntos de Experiencia", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DuolingoGreen.copy(alpha = 0.15f))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "+10 💎", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = DuolingoGreen)
                    Text(text = "Gemas de Bonificación", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = onContinue,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("btn_celebration_continue"),
            colors = ButtonDefaults.buttonColors(containerColor = DuolingoGreen),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(text = "CONTINUAR", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
        }
    }
}
