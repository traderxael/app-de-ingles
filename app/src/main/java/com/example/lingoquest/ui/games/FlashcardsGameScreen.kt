package com.example.lingoquest.ui.games

import androidx.compose.animation.core.FastOutSlowInEasing
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lingoquest.data.FlashcardModel
import com.example.lingoquest.theme.AccentBlue
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen

@Composable
fun FlashcardsGameScreen(
    cards: List<FlashcardModel>,
    onCardReviewed: (cardId: String, remembered: Boolean) -> Unit,
    onFinish: () -> Unit,
    onExit: () -> Unit,
    onPlayAudio: (String) -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    modifier: Modifier = Modifier
) {
    val deck = remember { cards.shuffled().take(15) }
    var currentIndex by remember { mutableIntStateOf(0) }
    var isFlipped by remember { mutableStateOf(false) }
    var rememberedCount by remember { mutableIntStateOf(0) }
    var reviewAgainCount by remember { mutableIntStateOf(0) }
    var isFinished by remember { mutableStateOf(false) }

    val currentCard = deck.getOrNull(currentIndex)

    LaunchedEffect(currentIndex) {
        isFlipped = false
        currentCard?.let { onPlayAudio(it.en) }
    }

    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 400, easing = FastOutSlowInEasing),
        label = "card_flip_rotation"
    )

    if (isFinished || currentCard == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("flashcards_session_finished"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🧠", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Repaso SRS Completado!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = AccentBlue
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = DuolingoGreen.copy(alpha = 0.15f))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "$rememberedCount", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = DuolingoGreen)
                        Text(text = "Recordadas", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = AccentRed.copy(alpha = 0.15f))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "$reviewAgainCount", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = AccentRed)
                        Text(text = "Por Repasar", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            Button(
                onClick = onFinish,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_finish_srs_session"),
                colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "GUARDAR Y VOLVER", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .testTag("flashcards_game_screen")
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
                text = "Tarjeta ${currentIndex + 1}/${deck.size}",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(AccentBlue.copy(alpha = 0.15f))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = currentCard.category,
                    color = AccentBlue,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 3D Flippable Card
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .graphicsLayer {
                    rotationY = rotation
                    cameraDistance = 12f * density
                }
                .clickable {
                    onPopSound()
                    isFlipped = !isFlipped
                },
            contentAlignment = Alignment.Center
        ) {
            if (rotation <= 90f) {
                // Front Side (English)
                Card(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(24.dp),
                    elevation = CardDefaults.cardElevation(4.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AccentBlue.copy(alpha = 0.5f)))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        IconButton(
                            onClick = { onPlayAudio(currentCard.en) },
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(AccentBlue.copy(alpha = 0.15f))
                        ) {
                            Icon(
                                imageVector = Icons.Default.VolumeUp,
                                contentDescription = "Escuchar",
                                tint = AccentBlue,
                                modifier = Modifier.size(36.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = currentCard.en,
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = currentCard.phonetic,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        Text(
                            text = "Toca para voltear 🔄",
                            fontSize = 12.sp,
                            color = AccentBlue,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            } else {
                // Back Side (Spanish & Example)
                Card(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(8.dp)
                        .graphicsLayer { rotationY = 180f },
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(24.dp),
                    elevation = CardDefaults.cardElevation(4.dp),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DuolingoGreen.copy(alpha = 0.5f)))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = currentCard.es,
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.ExtraBold,
                            color = DuolingoGreen
                        )

                        if (currentCard.example.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "“${currentCard.example}”",
                                    modifier = Modifier.padding(12.dp),
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Text(
                            text = "Toca para voltear 🔄",
                            fontSize = 12.sp,
                            color = DuolingoGreen,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // SRS Rating Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Button(
                onClick = {
                    onWrongSound()
                    reviewAgainCount++
                    onCardReviewed(currentCard.id, false)
                    if (currentIndex + 1 < deck.size) {
                        currentIndex++
                    } else {
                        isFinished = true
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
                    .testTag("btn_srs_wrong"),
                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "🔄 NO LO SABÍA", fontWeight = FontWeight.Bold, color = Color.White)
            }

            Button(
                onClick = {
                    onCorrectSound()
                    rememberedCount++
                    onCardReviewed(currentCard.id, true)
                    if (currentIndex + 1 < deck.size) {
                        currentIndex++
                    } else {
                        isFinished = true
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
                    .testTag("btn_srs_correct"),
                colors = ButtonDefaults.buttonColors(containerColor = DuolingoGreen),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "🧠 LO RECORDÉ", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}
