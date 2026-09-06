package com.example.lingoquest.ui.games

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Hearing
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
import com.example.lingoquest.data.AudioDetectiveModel
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen

@Composable
fun AudioDetectiveScreen(
    pool: List<AudioDetectiveModel>,
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
    var selectedOption by remember { mutableStateOf<String?>(null) }
    var isChecking by remember { mutableStateOf(false) }
    var isFinished by remember { mutableStateOf(false) }

    val currentItem = items.getOrNull(currentIndex)

    LaunchedEffect(currentIndex) {
        selectedOption = null
        isChecking = false
        currentItem?.let {
            onPlayAudio(it.audioWord)
        }
    }

    if (isFinished || currentItem == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("audio_detective_finished"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🕵️‍♂️", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Caso Resuelto!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = AccentRed
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Agudeza Lograda: $score pts",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = { onFinish(score) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_detective_claim"),
                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
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
            .testTag("audio_detective_screen")
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
                text = "Misterio ${currentIndex + 1}/${items.size}",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
            Text(
                text = "$score pts",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = AccentRed
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Detective Mystery Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(20.dp),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(AccentRed.copy(alpha = 0.15f))
                        .clickable { onPlayAudio(currentItem.audioWord) },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.VolumeUp,
                        contentDescription = "Escuchar audio misterioso",
                        tint = AccentRed,
                        modifier = Modifier.size(42.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Toca para escuchar la palabra misteriosa",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )

                if (currentItem.hint.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "💡 ${currentItem.hint}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "¿Cuál palabra se pronunció?",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Options: Option A vs Option B
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            DetectiveOptionCard(
                text = currentItem.optionA,
                isSelected = selectedOption == currentItem.optionA,
                isCorrect = isChecking && currentItem.correctOption == currentItem.optionA,
                isWrong = isChecking && selectedOption == currentItem.optionA && currentItem.correctOption != currentItem.optionA,
                onClick = {
                    if (!isChecking) {
                        onPopSound()
                        selectedOption = currentItem.optionA
                    }
                },
                modifier = Modifier.weight(1f)
            )

            DetectiveOptionCard(
                text = currentItem.optionB,
                isSelected = selectedOption == currentItem.optionB,
                isCorrect = isChecking && currentItem.correctOption == currentItem.optionB,
                isWrong = isChecking && selectedOption == currentItem.optionB && currentItem.correctOption != currentItem.optionB,
                onClick = {
                    if (!isChecking) {
                        onPopSound()
                        selectedOption = currentItem.optionB
                    }
                },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // Explanation text after checking
        if (isChecking && currentItem.explanation.isNotEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = "🔍 Análisis: ${currentItem.explanation}",
                    modifier = Modifier.padding(14.dp),
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }

        // Action Button
        Button(
            onClick = {
                if (!isChecking) {
                    val pass = selectedOption == currentItem.correctOption
                    isChecking = true
                    if (pass) {
                        onCorrectSound()
                        score += 20
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
                .fillMaxWidth()
                .height(52.dp)
                .testTag("btn_check_detective"),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isChecking) DuolingoGreen else AccentRed
            ),
            shape = RoundedCornerShape(16.dp),
            enabled = selectedOption != null || isChecking
        ) {
            Text(
                text = if (isChecking) "SIGUIENTE" else "CONFIRMAR RESPUESTA",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = Color.White
            )
        }
    }
}

@Composable
private fun DetectiveOptionCard(
    text: String,
    isSelected: Boolean,
    isCorrect: Boolean,
    isWrong: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .height(100.dp)
            .clip(RoundedCornerShape(18.dp))
            .clickable { onClick() }
            .border(
                width = if (isSelected || isCorrect || isWrong) 2.5.dp else 1.dp,
                color = when {
                    isCorrect -> DuolingoGreen
                    isWrong -> AccentRed
                    isSelected -> AccentRed
                    else -> MaterialTheme.colorScheme.surfaceVariant
                },
                shape = RoundedCornerShape(18.dp)
            ),
        color = when {
            isCorrect -> DuolingoGreen.copy(alpha = 0.15f)
            isWrong -> AccentRed.copy(alpha = 0.15f)
            isSelected -> AccentRed.copy(alpha = 0.12f)
            else -> MaterialTheme.colorScheme.surface
        },
        shadowElevation = 2.dp
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
