package com.example.lingoquest.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = DuolingoGreen,
    onPrimary = Color.White,
    primaryContainer = DuolingoGreenDark,
    secondary = AccentBlue,
    onSecondary = Color.White,
    tertiary = AccentOrange,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = DarkTextPrimary,
    onSurface = DarkTextPrimary,
    error = AccentRed
)

private val LightColorScheme = lightColorScheme(
    primary = DuolingoGreen,
    onPrimary = Color.White,
    primaryContainer = DuolingoGreenLight,
    secondary = AccentBlue,
    onSecondary = Color.White,
    tertiary = AccentOrange,
    background = LightBackground,
    surface = LightSurface,
    surfaceVariant = LightSurfaceVariant,
    onBackground = LightTextPrimary,
    onSurface = LightTextPrimary,
    error = AccentRed
)

@Composable
fun LingoQuestTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
