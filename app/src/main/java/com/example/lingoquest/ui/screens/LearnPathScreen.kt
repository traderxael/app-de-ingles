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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lingoquest.data.LessonModel
import com.example.lingoquest.data.UnitModel
import com.example.lingoquest.data.UserState
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.DuolingoGreen

@Composable
fun LearnPathScreen(
    units: List<UnitModel>,
    userState: UserState,
    onLessonClick: (UnitModel, LessonModel) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("learn_path_screen"),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Daily Goal Card
        item {
            Spacer(modifier = Modifier.height(8.dp))
            DailyGoalCard(isDone = userState.dailyGoalDone)
        }

        // 7 Units with Interactive Path
        items(units) { unit ->
            UnitSectionCard(
                unit = unit,
                userState = userState,
                onLessonClick = { lesson -> onLessonClick(unit, lesson) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun DailyGoalCard(isDone: Boolean) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("daily_goal_card"),
        colors = CardDefaults.cardColors(
            containerColor = if (isDone) DuolingoGreen.copy(alpha = 0.15f) else AccentOrange.copy(alpha = 0.12f)
        ),
        shape = RoundedCornerShape(16.dp),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.horizontalGradient(
                listOf(
                    if (isDone) DuolingoGreen else AccentOrange,
                    if (isDone) DuolingoGreen.copy(alpha = 0.6f) else AccentOrange.copy(alpha = 0.6f)
                )
            )
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = if (isDone) "¡Meta Diaria Cumplida! 🎉" else "¡Tu meta de hoy! 🎯",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (isDone) "Has mantenido tu racha activa hoy." else "Completa 1 lección para mantener tu racha activa.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isDone) DuolingoGreen else AccentOrange)
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = if (isDone) "Completada" else "+15 XP",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        }
    }
}

@Composable
private fun UnitSectionCard(
    unit: UnitModel,
    userState: UserState,
    onLessonClick: (LessonModel) -> Unit
) {
    val unitColor = try {
        Color(android.graphics.Color.parseColor(unit.colorHex))
    } catch (e: Exception) {
        DuolingoGreen
    }

    val isUnitUnlocked = userState.unlockedUnits.contains(unit.id)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("unit_card_${unit.id}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(20.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Unit Banner Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(
                            listOf(unitColor, unitColor.copy(alpha = 0.8f))
                        )
                    )
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = unit.icon,
                        fontSize = 36.sp,
                        modifier = Modifier.padding(end = 12.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = unit.title,
                            color = Color.White,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = unit.description,
                            color = Color.White.copy(alpha = 0.9f),
                            style = MaterialTheme.typography.bodySmall,
                            maxLines = 2
                        )
                    }
                }
            }

            // Lessons in this Unit
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                unit.lessons.forEachIndexed { index, lesson ->
                    val isCompleted = userState.completedLessons.contains(lesson.id)
                    // First lesson of unit or previous lesson completed
                    val isAvailable = isUnitUnlocked && (index == 0 || userState.completedLessons.contains(unit.lessons[index - 1].id))

                    LessonNodeItem(
                        lesson = lesson,
                        unitColor = unitColor,
                        isCompleted = isCompleted,
                        isAvailable = isAvailable,
                        onClick = {
                            if (isAvailable || isCompleted) {
                                onLessonClick(lesson)
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun LessonNodeItem(
    lesson: LessonModel,
    unitColor: Color,
    isCompleted: Boolean,
    isAvailable: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable(enabled = isAvailable || isCompleted) { onClick() }
            .border(
                width = 2.dp,
                color = when {
                    isCompleted -> DuolingoGreen
                    isAvailable -> unitColor
                    else -> MaterialTheme.colorScheme.surfaceVariant
                },
                shape = RoundedCornerShape(16.dp)
            )
            .testTag("lesson_node_${lesson.id}"),
        color = when {
            isCompleted -> DuolingoGreen.copy(alpha = 0.08f)
            isAvailable -> unitColor.copy(alpha = 0.05f)
            else -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
        }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Circle Node Icon
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .shadow(2.dp, CircleShape)
                        .clip(CircleShape)
                        .background(
                            when {
                                isCompleted -> DuolingoGreen
                                isAvailable -> unitColor
                                else -> Color.Gray
                            }
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = when {
                            isCompleted -> Icons.Default.Check
                            isAvailable -> Icons.Default.PlayArrow
                            else -> Icons.Default.Lock
                        },
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Column {
                    Text(
                        text = lesson.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isAvailable || isCompleted) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = if (isCompleted) "¡Completada! • ${lesson.xp} XP" else "${lesson.xp} XP • ${lesson.exercises.size} ejercicios",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isCompleted) DuolingoGreen else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (isCompleted) {
                Row {
                    repeat(3) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = AccentOrange,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}
