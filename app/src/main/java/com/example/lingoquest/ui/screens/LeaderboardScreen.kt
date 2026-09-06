package com.example.lingoquest.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
import com.example.lingoquest.data.LeaderboardPlayer
import com.example.lingoquest.theme.AccentBlue
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.AccentYellow
import com.example.lingoquest.theme.DuolingoGreen

@Composable
fun LeaderboardScreen(
    players: List<LeaderboardPlayer>,
    modifier: Modifier = Modifier
) {
    val top3 = if (players.size >= 3) players.take(3) else emptyList()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("leaderboard_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            LeagueBannerCard()
        }

        // Podium Top 3
        if (top3.size == 3) {
            item {
                PodiumSection(top3 = top3)
            }
        }

        item {
            Text(
                text = "Clasificación General",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        // Full List
        items(players) { player ->
            PlayerLeaderboardRow(player = player)
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun LeagueBannerCard() {
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
                            AccentBlue.copy(alpha = 0.2f),
                            AccentBlue.copy(alpha = 0.05f)
                        )
                    )
                )
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(AccentBlue)
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "💎 LIGA ZAFIRO",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Clasificación Semanal",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onSurface
            )

            Text(
                text = "Compite con otros estudiantes. Los 3 primeros ascienden de liga.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "⏱️ Finaliza en: 3 días",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun PodiumSection(top3: List<LeaderboardPlayer>) {
    val first = top3[0]
    val second = top3[1]
    val third = top3[2]

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        // 2nd Place (Left)
        PodiumColumn(
            player = second,
            podiumHeight = 90.dp,
            crownIcon = "🥈",
            podiumColor = Color(0xFFC0C0C0),
            rankNum = 2
        )

        // 1st Place (Center)
        PodiumColumn(
            player = first,
            podiumHeight = 120.dp,
            crownIcon = "👑",
            podiumColor = AccentYellow,
            rankNum = 1
        )

        // 3rd Place (Right)
        PodiumColumn(
            player = third,
            podiumHeight = 70.dp,
            crownIcon = "🥉",
            podiumColor = Color(0xFFCD7F32),
            rankNum = 3
        )
    }
}

@Composable
private fun PodiumColumn(
    player: LeaderboardPlayer,
    podiumHeight: androidx.compose.ui.unit.Dp,
    crownIcon: String,
    podiumColor: Color,
    rankNum: Int
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(96.dp)
    ) {
        Text(text = crownIcon, fontSize = 20.sp)
        Text(text = player.avatar, fontSize = 32.sp)
        Text(
            text = if (player.isUser) "Tú" else player.name.split(" ").firstOrNull() ?: player.name,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = 1
        )
        Text(
            text = "${player.xp} XP",
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = AccentOrange
        )

        Spacer(modifier = Modifier.height(6.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(podiumHeight)
                .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                .background(
                    Brush.verticalGradient(
                        listOf(podiumColor, podiumColor.copy(alpha = 0.7f))
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$rankNum",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 24.sp,
                color = Color.White
            )
        }
    }
}

@Composable
private fun PlayerLeaderboardRow(player: LeaderboardPlayer) {
    val isUser = player.isUser
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .border(
                width = if (isUser) 2.dp else 1.dp,
                color = if (isUser) DuolingoGreen else MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(16.dp)
            )
            .testTag("leaderboard_row_${player.rank}"),
        color = if (isUser) DuolingoGreen.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Rank number
                Text(
                    text = "#${player.rank}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = when (player.rank) {
                        1 -> AccentYellow
                        2 -> Color.Gray
                        3 -> Color(0xFFCD7F32)
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    modifier = Modifier.width(36.dp)
                )

                // Avatar
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = player.avatar, fontSize = 22.sp)
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = player.name,
                            fontWeight = if (isUser) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (isUser) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(DuolingoGreen)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "TÚ",
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    if (player.rank <= 3) {
                        Text(
                            text = "🟢 Zona de ascenso",
                            fontSize = 11.sp,
                            color = DuolingoGreen
                        )
                    }
                }
            }

            Text(
                text = "${player.xp} XP",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp,
                color = AccentOrange
            )
        }
    }
}
