package com.example.lingoquest.services

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class TtsService(context: Context) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isInitialized = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.US)
            if (result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED) {
                isInitialized = true
                tts?.setSpeechRate(0.95f)
                tts?.setPitch(1.0f)
            }
        }
    }

    fun speak(text: String, enabled: Boolean = true) {
        if (!enabled || !isInitialized || text.isBlank()) return
        try {
            tts?.stop()
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lingo_speech_${System.currentTimeMillis()}")
        } catch (e: Exception) {
            // Graceful fallback
        }
    }

    fun stop() {
        try {
            tts?.stop()
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun release() {
        try {
            tts?.stop()
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            // Ignore
        }
    }
}
