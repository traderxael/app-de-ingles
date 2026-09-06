package com.example.lingoquest.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.lingoquest.data.UserState
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentRed
import com.example.lingoquest.theme.AccentBlue

@Composable
fun AppHud(
    userState: UserState,
    onSoundToggle: () -> Unit,
    onThemeToggle: () -> Unit,
    onHeartsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "hud_pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .testTag("app_hud"),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 3.dp,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Stats Group: Streak, Gems, Hearts
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Streak
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(AccentOrange.copy(alpha = 0.12f))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                        .testTag("hud_streak_badge"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🔥",
                        fontSize = 17.sp,
                        modifier = Modifier.scale(pulseScale)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${userState.streak}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = AccentOrange
                    )
                }

                // Gems
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(AccentBlue.copy(alpha = 0.12f))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                        .testTag("hud_gems_badge"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "💎", fontSize = 17.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${userState.gems}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = AccentBlue
                    )
                }

                // Hearts
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(AccentRed.copy(alpha = 0.12f))
                        .clickable { onHeartsClick() }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                        .testTag("hud_hearts_badge"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "❤️",
                        fontSize = 17.sp,
                        modifier = Modifier.scale(if (userState.hearts <= 1) pulseScale else 1f)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${userState.hearts}/${userState.maxHearts}",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = AccentRed
                    )
                }
            }

            // Action Buttons: Sound & Theme
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onSoundToggle,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .testTag("btn_sound_toggle")
                ) {
                    Icon(
                        imageVector = if (userState.soundEnabled) Icons.Default.VolumeUp else Icons.Default.VolumeMute,
                        contentDescription = "Alternar sonido",
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                IconButton(
                    onClick = onThemeToggle,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .testTag("btn_theme_toggle")
                ) {
                    Icon(
                        imageVector = if (userState.theme == "dark") Icons.Default.LightMode else Icons.Default.DarkMode,
                        contentDescription = "Alternar tema",
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
