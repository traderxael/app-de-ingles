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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.example.lingoquest.data.RoleplayModel
import com.example.lingoquest.data.RoleplayOptionModel
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentPurple
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.DuolingoGreen

private data class ChatBubble(
    val speaker: String,
    val textEn: String,
    val textEs: String,
    val isUser: Boolean,
    val feedback: String = ""
)

@Composable
fun RoleplayScreen(
    roleplays: List<RoleplayModel>,
    onFinish: () -> Unit,
    onExit: () -> Unit,
    onPlayAudio: (String) -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedRoleplayIndex by remember { mutableIntStateOf(0) }
    val currentRoleplay = roleplays.getOrNull(selectedRoleplayIndex) ?: roleplays.firstOrNull()

    var currentStepIndex by remember { mutableIntStateOf(0) }
    val chatHistory = remember { mutableStateListOf<ChatBubble>() }
    var isFinished by remember { mutableStateOf(false) }

    val currentStep = currentRoleplay?.steps?.getOrNull(currentStepIndex)

    LaunchedEffect(currentRoleplay, currentStepIndex) {
        currentStep?.let { step ->
            chatHistory.add(
                ChatBubble(
                    speaker = step.speaker,
                    textEn = step.textEn,
                    textEs = step.textEs,
                    isUser = false
                )
            )
            onPlayAudio(step.textEn)
        }
    }

    if (isFinished || currentRoleplay == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("roleplay_celebration_view"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🎭", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Conversación Exitosa!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = AccentPurple
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Has dominado el escenario: ${currentRoleplay?.title}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(24.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Text(text = "+35 XP", fontWeight = FontWeight.Bold, color = AccentOrange, fontSize = 18.sp)
                Text(text = "+15 💎", fontWeight = FontWeight.Bold, color = DuolingoGreen, fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = onFinish,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_roleplay_finish"),
                colors = ButtonDefaults.buttonColors(containerColor = AccentPurple),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "FINALIZAR ESCENARIO", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .testTag("roleplay_screen")
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onExit) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Salir")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = currentRoleplay.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "Paso ${currentStepIndex + 1}/${currentRoleplay.steps.size}",
                fontSize = 13.sp,
                color = AccentPurple,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Chat conversation history
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(chatHistory) { bubble ->
                ChatBubbleItem(
                    bubble = bubble,
                    onPlayAudio = { onPlayAudio(bubble.textEn) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // User response options
        if (currentStep != null) {
            Text(
                text = "Tu respuesta:",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                currentStep.userOptions.forEach { opt ->
                    UserOptionButton(
                        option = opt,
                        onClick = {
                            onPopSound()
                            if (opt.isAppropriate) {
                                onCorrectSound()
                            } else {
                                onWrongSound()
                            }
                            chatHistory.add(
                                ChatBubble(
                                    speaker = "Tú",
                                    textEn = opt.textEn,
                                    textEs = opt.textEs,
                                    isUser = true,
                                    feedback = opt.feedback
                                )
                            )
                            if (currentStepIndex + 1 < currentRoleplay.steps.size) {
                                currentStepIndex++
                            } else {
                                isFinished = true
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ChatBubbleItem(
    bubble: ChatBubble,
    onPlayAudio: () -> Unit
) {
    val isUser = bubble.isUser

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isUser) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(AccentPurple.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "🧑‍💼", fontSize = 18.sp)
            }
            Spacer(modifier = Modifier.width(8.dp))
        }

        Surface(
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .clip(RoundedCornerShape(16.dp)),
            color = if (isUser) DuolingoGreen.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isUser) DuolingoGreen else MaterialTheme.colorScheme.surfaceVariant
            ),
            shadowElevation = 1.dp
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = bubble.speaker,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isUser) DuolingoGreen else AccentPurple
                    )
                    IconButton(
                        onClick = onPlayAudio,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Escuchar",
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Text(
                    text = bubble.textEn,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = bubble.textEs,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (bubble.feedback.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "💬 ${bubble.feedback}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AccentOrange
                    )
                }
            }
        }
    }
}

@Composable
private fun UserOptionButton(
    option: RoleplayOptionModel,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .border(1.dp, MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = option.textEn,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = option.textEs,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
