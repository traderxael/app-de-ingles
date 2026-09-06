package com.example.lingoquest.ui.games

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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.lingoquest.data.SentenceScrambleModel
import com.example.lingoquest.theme.AccentYellow
import com.example.lingoquest.theme.DuolingoGreen

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SentenceScrambleScreen(
    pool: List<SentenceScrambleModel>,
    onFinish: (score: Int) -> Unit,
    onExit: () -> Unit,
    onPlayAudio: (String) -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    modifier: Modifier = Modifier
) {
    val items = remember { pool.shuffled() }
    var currentIndex by remember { mutableIntStateOf(0) }
    var score by remember { mutableIntStateOf(0) }
    var isChecking by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }
    var isFinished by remember { mutableStateOf(false) }

    val currentItem = items.getOrNull(currentIndex)
    val selectedWords = remember { mutableStateListOf<String>() }

    LaunchedEffect(currentIndex) {
        selectedWords.clear()
        isChecking = false
        isCorrect = false
    }

    if (isFinished || currentItem == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("scramble_finished_view"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🧩", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Desafío Completado!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = AccentYellow
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Puntos obtenidos: $score pts",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = { onFinish(score) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_scramble_claim"),
                colors = ButtonDefaults.buttonColors(containerColor = AccentYellow),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "RECLAMAR RECOMPENSA", fontWeight = FontWeight.Bold, color = Color.Black)
            }
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .testTag("sentence_scramble_screen")
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
            Text(
                text = "Frase ${currentIndex + 1}/${items.size}",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
            Text(
                text = "$score pts",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = AccentYellow
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Prompt Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(18.dp),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Ordena las palabras para traducir:",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = currentItem.prompt,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                if (currentItem.hint.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "💡 ${currentItem.hint}",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Sentence Construction Box
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(100.dp)
                .clip(RoundedCornerShape(14.dp))
                .border(1.dp, MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(14.dp)),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)
        ) {
            FlowRow(
                modifier = Modifier.padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                selectedWords.forEach { w ->
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable {
                                onPopSound()
                                selectedWords.remove(w)
                            }
                            .border(1.dp, AccentYellow, RoundedCornerShape(10.dp)),
                        color = MaterialTheme.colorScheme.surface
                    ) {
                        Text(
                            text = w,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Available Pool Chips
        FlowRow(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            currentItem.words.forEach { word ->
                val countInSelected = selectedWords.count { it == word }
                val countInPool = currentItem.words.count { it == word }
                val isAvailable = countInSelected < countInPool

                Surface(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable(enabled = isAvailable) {
                            if (isAvailable) {
                                onPopSound()
                                selectedWords.add(word)
                            }
                        }
                        .border(
                            1.dp,
                            if (isAvailable) AccentYellow else MaterialTheme.colorScheme.surfaceVariant,
                            RoundedCornerShape(12.dp)
                        ),
                    color = if (isAvailable) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                ) {
                    Text(
                        text = word,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = if (isAvailable) MaterialTheme.colorScheme.onSurface else Color.Gray
                    )
                }
            }
        }

        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            IconButton(
                onClick = { onPlayAudio(currentItem.sentence) },
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Icon(imageVector = Icons.Default.VolumeUp, contentDescription = "Escuchar")
            }

            Button(
                onClick = {
                    if (!isChecking) {
                        val built = selectedWords.joinToString(" ").trim()
                        val correct = currentItem.sentence.trim()
                        val pass = built.equals(correct, ignoreCase = true)
                        isCorrect = pass
                        isChecking = true
                        if (pass) {
                            onCorrectSound()
                            score += 20
                            onPlayAudio(correct)
                        } else {
                            onWrongSound()
                        }
                    } else {
                        if (currentIndex + 1 < items.size) {
                            currentIndex++
                        } else {
                            isFinished = true
                        }
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
                    .testTag("btn_check_scramble"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isChecking) (if (isCorrect) DuolingoGreen else Color.Red) else AccentYellow
                ),
                shape = RoundedCornerShape(16.dp),
                enabled = selectedWords.isNotEmpty() || isChecking
            ) {
                Text(
                    text = if (isChecking) "SIGUIENTE" else "COMPROBAR",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = if (isChecking) Color.White else Color.Black
                )
            }
        }
    }
}
