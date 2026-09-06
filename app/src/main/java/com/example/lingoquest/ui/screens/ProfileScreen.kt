package com.example.lingoquest.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.example.lingoquest.data.AchievementModel
import com.example.lingoquest.data.UserState
import com.example.lingoquest.theme.AccentBlue
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen

@Composable
fun ProfileScreen(
    userState: UserState,
    achievements: List<AchievementModel>,
    onSelectAvatar: (String) -> Unit,
    onBuyShield: () -> Boolean,
    onRefillHearts: () -> Unit,
    onResetProgress: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showAvatarDialog by remember { mutableStateOf(false) }
    var showResetDialog by remember { mutableStateOf(false) }
    var shieldMessage by remember { mutableStateOf<String?>(null) }

    val avatars = listOf("🦁", "🦉", "🦊", "🐱", "🐼", "🐨", "🐯", "🧑‍🚀", "🦄", "🐺")

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("profile_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            UserProfileHeader(
                userState = userState,
                onChangeAvatar = { showAvatarDialog = true }
            )
        }

        // Hearts & Streak Store
        item {
            ShopCard(
                userState = userState,
                onBuyShield = {
                    val ok = onBuyShield()
                    shieldMessage = if (ok) "¡Escudo de Racha adquirido! 🛡️" else "Gemas insuficientes (se necesitan 50 💎)"
                },
                onRefillHearts = onRefillHearts
            )
        }

        // General Stats
        item {
            StatsOverviewCard(userState = userState)
        }

        // Achievements Section
        item {
            Text(
                text = "Logros y Medallas 🏆",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        items(achievements.chunked(2)) { pair ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                pair.forEach { ach ->
                    AchievementCard(
                        achievement = ach,
                        modifier = Modifier.weight(1f)
                    )
                }
                if (pair.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }

        // Danger Zone: Reset Progress
        item {
            OutlinedButton(
                onClick = { showResetDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("btn_reset_progress"),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentRed),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(text = "Reiniciar Progreso de Aprendizaje")
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }

    // Avatar Picker Dialog
    if (showAvatarDialog) {
        AlertDialog(
            onDismissRequest = { showAvatarDialog = false },
            title = { Text(text = "Elige tu Avatar de Estudiante") },
            text = {
                Column {
                    Text(
                        text = "Selecciona el personaje que te representará en la liga semanal:",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        avatars.take(5).forEach { av ->
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(CircleShape)
                                    .background(if (userState.avatar == av) DuolingoGreen.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                    .clickable {
                                        onSelectAvatar(av)
                                        showAvatarDialog = false
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = av, fontSize = 26.sp)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        avatars.drop(5).take(5).forEach { av ->
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(CircleShape)
                                    .background(if (userState.avatar == av) DuolingoGreen.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                    .clickable {
                                        onSelectAvatar(av)
                                        showAvatarDialog = false
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = av, fontSize = 26.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showAvatarDialog = false }) {
                    Text("Cerrar")
                }
            }
        )
    }

    // Reset Progress Confirmation Dialog
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("¿Reiniciar progreso?") },
            text = {
                Text("Esta acción reiniciará tus lecciones completadas, estadísticas arcade y SRS. Las gemas y racha volverán al estado inicial.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        onResetProgress()
                        showResetDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentRed)
                ) {
                    Text("Sí, Reiniciar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    // Shield message toast
    shieldMessage?.let { msg ->
        AlertDialog(
            onDismissRequest = { shieldMessage = null },
            title = { Text("Tienda de Artículos") },
            text = { Text(msg) },
            confirmButton = {
                TextButton(onClick = { shieldMessage = null }) {
                    Text("Entendido")
                }
            }
        )
    }
}

@Composable
private fun UserProfileHeader(
    userState: UserState,
    onChangeAvatar: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(70.dp)
                    .clip(CircleShape)
                    .background(DuolingoGreen.copy(alpha = 0.15f))
                    .clickable { onChangeAvatar() },
                contentAlignment = Alignment.Center
            ) {
                Text(text = userState.avatar, fontSize = 42.sp)
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Estudiante LingoQuest",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Toca tu avatar para cambiarlo",
                    fontSize = 12.sp,
                    color = DuolingoGreen,
                    modifier = Modifier.clickable { onChangeAvatar() }
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "🔥 ${userState.streak} días",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentOrange
                    )
                    Text(
                        text = "💎 ${userState.gems} gemas",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentBlue
                    )
                }
            }
        }
    }
}

@Composable
private fun ShopCard(
    userState: UserState,
    onBuyShield: () -> Unit,
    onRefillHearts: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Potenciadores & Vidas 🛡️",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Escudo de racha
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Escudo de Racha (Congelador)",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "Te protege si no practicas un día. Tienes: ${userState.streakFreeze}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onBuyShield,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("btn_buy_shield")
                ) {
                    Text(text = "50 💎", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Refill Hearts
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Recargar Vidas",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "Vuelve a tener 5 vidas completas al instante.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = onRefillHearts,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                    shape = RoundedCornerShape(12.dp),
                    enabled = userState.hearts < userState.maxHearts,
                    modifier = Modifier.testTag("btn_refill_hearts")
                ) {
                    Text(text = "❤️ Llenar", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
private fun StatsOverviewCard(userState: UserState) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Estadísticas del Jugador",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                StatItem(label = "XP Total", value = "${userState.xp} XP", color = AccentOrange)
                StatItem(label = "Palabras", value = "${userState.stats.wordsLearned}", color = DuolingoGreen)
                StatItem(label = "Lecciones", value = "${userState.completedLessons.size}", color = AccentBlue)
                StatItem(label = "Tiempo", value = "${userState.stats.timeSpentMinutes} min", color = AccentRed)
            }
        }
    }
}

@Composable
private fun StatItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp,
            color = color
        )
        Text(
            text = label,
            fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun AchievementCard(
    achievement: AchievementModel,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.testTag("ach_card_${achievement.id}"),
        colors = CardDefaults.cardColors(
            containerColor = if (achievement.unlocked) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
        ),
        shape = RoundedCornerShape(16.dp),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                if (achievement.unlocked) DuolingoGreen else Color.Transparent
            )
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = achievement.icon,
                fontSize = 28.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )

            Text(
                text = achievement.title,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = if (achievement.unlocked) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 1
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = achievement.description,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 14.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = if (achievement.unlocked) "✓ Desbloqueado" else "🔒 Bloqueado",
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = if (achievement.unlocked) DuolingoGreen else Color.Gray
            )
        }
    }
}
