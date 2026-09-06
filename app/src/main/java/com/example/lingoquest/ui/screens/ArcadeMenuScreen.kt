package com.example.lingoquest.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lingoquest.theme.AccentBlue
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentPurple
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.AccentYellow
import com.example.lingoquest.theme.EmeraldHealth

enum class ArcadeGameType {
    SPEED_MATCH,
    WORD_FALL,
    SENTENCE_SCRAMBLE,
    AUDIO_DETECTIVE,
    ROLEPLAY,
    FLASHCARDS
}

@Composable
fun ArcadeMenuScreen(
    onSelectGame: (ArcadeGameType) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("arcade_menu_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            ArcadeHeroHeader()
        }

        item {
            ArcadeCard(
                title = "Speed Match Contrarreloj",
                badge = "🔥 Más Popular",
                icon = "⏱️",
                description = "Empareja parejas de palabras en inglés y español contra el reloj con combos continuos.",
                xpTag = "⚡ Hasta +50 XP",
                btnText = "¡JUGAR YA!",
                color = AccentOrange,
                tag = "card_speed_match",
                onPlay = { onSelectGame(ArcadeGameType.SPEED_MATCH) }
            )
        }

        item {
            ArcadeCard(
                title = "Word Fall: Lluvia de Palabras",
                badge = "🌧️ Reflejos Rápidos",
                icon = "🎈",
                description = "Atrapa las burbujas flotantes con la traducción correcta antes de que toquen el suelo.",
                xpTag = "⚡ +45 XP",
                btnText = "ATRAPAR BURBUJAS",
                color = EmeraldHealth,
                tag = "card_word_fall",
                onPlay = { onSelectGame(ArcadeGameType.WORD_FALL) }
            )
        }

        item {
            ArcadeCard(
                title = "Sentence Scramble",
                badge = "🧩 Gramática Viva",
                icon = "🧩",
                description = "Ordena las fichas de oraciones en inglés contra el reloj y escucha su entonación nativa.",
                xpTag = "⚡ +40 XP",
                btnText = "ORDENAR FRASES",
                color = AccentYellow,
                tag = "card_sentence_scramble",
                onPlay = { onSelectGame(ArcadeGameType.SENTENCE_SCRAMBLE) }
            )
        }

        item {
            ArcadeCard(
                title = "Audio Detective",
                badge = "🎧 Agudeza Auditiva",
                icon = "🕵️‍♂️",
                description = "Distingue palabras de pronunciación similar (sheep/ship, tree/three) en audios misteriosos.",
                xpTag = "⚡ +35 XP",
                btnText = "INVESTIGAR",
                color = AccentRed,
                tag = "card_audio_detective",
                onPlay = { onSelectGame(ArcadeGameType.AUDIO_DETECTIVE) }
            )
        }

        item {
            ArcadeCard(
                title = "Simulador de Conversación",
                badge = "💬 Inmersión Total",
                icon = "🎭",
                description = "Habla en escenarios de la vida real (cafetería, aduanas, compras y hoteles).",
                xpTag = "⚡ +35 XP",
                btnText = "PRACTICAR",
                color = AccentPurple,
                tag = "card_roleplay",
                onPlay = { onSelectGame(ArcadeGameType.ROLEPLAY) }
            )
        }

        item {
            ArcadeCard(
                title = "Tarjetas Inteligentes 3D",
                badge = "🧠 Retención SRS",
                icon = "🃏",
                description = "Memoriza más de 45 palabras clave con repetición espaciada y pronunciación nativa.",
                xpTag = "⚡ +30 XP",
                btnText = "REPASAR",
                color = AccentBlue,
                tag = "card_flashcards",
                onPlay = { onSelectGame(ArcadeGameType.FLASHCARDS) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun ArcadeHeroHeader() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            AccentPurple.copy(alpha = 0.15f),
                            AccentBlue.copy(alpha = 0.08f)
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Text(
                text = "Arcade de Aprendizaje ⚡",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "6 dinámicas gamificadas para dominar vocabulario, oído, reflejos y sintaxis.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ArcadeCard(
    title: String,
    badge: String,
    icon: String,
    description: String,
    xpTag: String,
    btnText: String,
    color: Color,
    tag: String,
    onPlay: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag(tag),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Badge & XP Tag Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(color.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = badge,
                        color = color,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = xpTag,
                    color = AccentOrange,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Icon + Title + Description
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(color.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = icon, fontSize = 28.sp)
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Play Button
            Button(
                onClick = onPlay,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("btn_play_$tag"),
                colors = ButtonDefaults.buttonColors(containerColor = color),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = btnText,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 14.sp
                )
            }
        }
    }
}
