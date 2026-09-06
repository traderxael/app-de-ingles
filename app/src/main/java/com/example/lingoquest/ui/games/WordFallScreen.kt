package com.example.lingoquest.ui.games

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.lingoquest.data.SpeedMatchPair
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen
import com.example.lingoquest.theme.EmeraldHealth
import kotlinx.coroutines.delay

@Composable
fun WordFallScreen(
    pool: List<SpeedMatchPair>,
    onFinish: (score: Int) -> Unit,
    onExit: () -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    modifier: Modifier = Modifier
) {
    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var isGameOver by remember { mutableStateOf(false) }

    val shuffledPool = remember { pool.shuffled() }
    var currentIndex by remember { mutableIntStateOf(0) }

    val currentPair = shuffledPool.getOrNull(currentIndex % shuffledPool.size) ?: SpeedMatchPair("1", "Water", "Agua")

    // Generate 3 options (1 correct, 2 distractors)
    val options = remember(currentIndex) {
        val correct = currentPair.en
        val distractors = shuffledPool.filter { it.en != correct }.map { it.en }.shuffled().take(2)
        (listOf(correct) + distractors).shuffled()
    }

    // Timer per question (6 seconds)
    var questionTimeLeft by remember(currentIndex) { mutableIntStateOf(60) }

    LaunchedEffect(currentIndex, isGameOver) {
        if (isGameOver) return@LaunchedEffect
        questionTimeLeft = 60
        while (questionTimeLeft > 0 && !isGameOver) {
            delay(100)
            questionTimeLeft--
        }
        if (questionTimeLeft <= 0 && !isGameOver) {
            // Time out on this word!
            onWrongSound()
            lives--
            if (lives <= 0) {
                isGameOver = true
            } else {
                currentIndex++
            }
        }
    }

    if (isGameOver) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("word_fall_game_over"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🎈", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Juego Terminado!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = EmeraldHealth
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Puntaje Logrado: $score pts",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = { onFinish(score) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_word_fall_claim"),
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldHealth),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "RECLAMAR RECOMPENSA", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .testTag("word_fall_screen")
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(onClick = onExit) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Salir")
            }

            // Lives
            Row(verticalAlignment = Alignment.CenterVertically) {
                repeat(3) { idx ->
                    Text(
                        text = if (idx < lives) "❤️" else "🖤",
                        fontSize = 20.sp,
                        modifier = Modifier.padding(horizontal = 2.dp)
                    )
                }
            }

            Text(
                text = "$score pts",
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        LinearProgressIndicator(
            progress = { (questionTimeLeft / 60f).coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = EmeraldHealth,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Target Prompt
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = EmeraldHealth.copy(alpha = 0.12f)),
            shape = RoundedCornerShape(20.dp),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(EmeraldHealth))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Traduce rápidamente:",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = currentPair.es,
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        Spacer(modifier = Modifier.height(30.dp))

        Text(
            text = "Toca la burbuja con la traducción correcta en inglés:",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Bubbles options
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            options.forEach { opt ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(68.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .clickable {
                            onPopSound()
                            if (opt == currentPair.en) {
                                onCorrectSound()
                                score += 15
                                currentIndex++
                            } else {
                                onWrongSound()
                                lives--
                                if (lives <= 0) {
                                    isGameOver = true
                                } else {
                                    currentIndex++
                                }
                            }
                        }
                        .border(1.5.dp, EmeraldHealth, RoundedCornerShape(24.dp)),
                    color = MaterialTheme.colorScheme.surface,
                    shadowElevation = 3.dp
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = opt,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
