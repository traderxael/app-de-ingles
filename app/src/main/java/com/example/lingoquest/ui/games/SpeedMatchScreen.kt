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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.example.lingoquest.data.SpeedMatchPair
import com.example.lingoquest.theme.AccentOrange
import com.example.lingoquest.theme.DuolingoGreen
import kotlinx.coroutines.delay

private data class MatchTile(
    val id: String,
    val text: String,
    val isEnglish: Boolean,
    val pairKey: String
)

@Composable
fun SpeedMatchScreen(
    pool: List<SpeedMatchPair>,
    onFinish: (score: Int, maxCombo: Int) -> Unit,
    onExit: () -> Unit,
    onCorrectSound: () -> Unit,
    onWrongSound: () -> Unit,
    onPopSound: () -> Unit,
    modifier: Modifier = Modifier
) {
    var timeLeft by remember { mutableIntStateOf(45) }
    var score by remember { mutableIntStateOf(0) }
    var currentCombo by remember { mutableIntStateOf(1) }
    var maxCombo by remember { mutableIntStateOf(1) }
    var isGameOver by remember { mutableStateOf(false) }

    val activeTiles = remember { mutableStateListOf<MatchTile>() }
    var selectedTile by remember { mutableStateOf<MatchTile?>(null) }
    var remainingPool by remember { mutableStateOf(pool.shuffled()) }

    fun refillTiles() {
        activeTiles.clear()
        val needed = 4
        val batch = remainingPool.take(needed)
        remainingPool = remainingPool.drop(needed)
        if (batch.size < needed) {
            remainingPool = pool.shuffled()
        }

        val tiles = mutableListOf<MatchTile>()
        batch.forEach { p ->
            tiles.add(MatchTile(id = "${p.id}-en", text = p.en, isEnglish = true, pairKey = p.id))
            tiles.add(MatchTile(id = "${p.id}-es", text = p.es, isEnglish = false, pairKey = p.id))
        }
        activeTiles.addAll(tiles.shuffled())
    }

    LaunchedEffect(Unit) {
        refillTiles()
        while (timeLeft > 0 && !isGameOver) {
            delay(1000)
            timeLeft--
        }
        isGameOver = true
    }

    if (isGameOver) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
                .testTag("speed_match_game_over"),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "⚡", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "¡Tiempo Agotado!",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.ExtraBold,
                color = AccentOrange
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Puntaje Final: $score pts",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Combo Máximo: x$maxCombo",
                fontSize = 15.sp,
                color = DuolingoGreen,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(32.dp))
            Button(
                onClick = { onFinish(score, maxCombo) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("btn_speed_match_claim"),
                colors = ButtonDefaults.buttonColors(containerColor = DuolingoGreen),
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
            .testTag("speed_match_screen")
    ) {
        // Top Bar: Exit, Timer, Score, Combo
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(onClick = onExit) {
                Icon(imageVector = Icons.Default.Close, contentDescription = "Salir")
            }

            // Timer
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (timeLeft <= 10) Color.Red.copy(alpha = 0.15f) else AccentOrange.copy(alpha = 0.15f))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "⏱️ ${timeLeft}s",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = if (timeLeft <= 10) Color.Red else AccentOrange
                )
            }

            // Score & Combo
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "$score pts",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Combo x$currentCombo",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = DuolingoGreen
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        LinearProgressIndicator(
            progress = { (timeLeft / 45f).coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = AccentOrange,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Empareja cada palabra en inglés con su traducción en español:",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Grid of 8 tiles
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(activeTiles) { tile ->
                val isSelected = selectedTile?.id == tile.id
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable {
                            onPopSound()
                            if (selectedTile == null) {
                                selectedTile = tile
                            } else if (selectedTile?.id == tile.id) {
                                selectedTile = null
                            } else {
                                val first = selectedTile!!
                                if (first.pairKey == tile.pairKey && first.isEnglish != tile.isEnglish) {
                                    // Match!
                                    onCorrectSound()
                                    score += 10 * currentCombo
                                    currentCombo++
                                    if (currentCombo > maxCombo) maxCombo = currentCombo
                                    activeTiles.removeAll { it.id == first.id || it.id == tile.id }
                                    selectedTile = null
                                    if (activeTiles.isEmpty()) {
                                        refillTiles()
                                    }
                                } else {
                                    // Wrong
                                    onWrongSound()
                                    currentCombo = 1
                                    selectedTile = null
                                }
                            }
                        }
                        .border(
                            width = if (isSelected) 2.5.dp else 1.dp,
                            color = if (isSelected) AccentOrange else MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(16.dp)
                        ),
                    color = if (isSelected) AccentOrange.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface,
                    shadowElevation = 2.dp
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = tile.text,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
