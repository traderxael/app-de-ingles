package com.example.lingoquest.services

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator

class AudioEffectsService(private val context: Context) {

    private var toneGen: ToneGenerator? = null

    init {
        try {
            toneGen = ToneGenerator(AudioManager.STREAM_MUSIC, 70)
        } catch (e: Exception) {
            toneGen = null
        }
    }

    fun playPop(enabled: Boolean = true) {
        if (!enabled) return
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_BEEP, 40)
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun playCorrect(enabled: Boolean = true) {
        if (!enabled) return
        try {
            toneGen?.startTone(ToneGenerator.TONE_CDMA_CONFIRM, 150)
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun playWrong(enabled: Boolean = true) {
        if (!enabled) return
        try {
            toneGen?.startTone(ToneGenerator.TONE_PROP_NACK, 250)
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun playLevelUp(enabled: Boolean = true) {
        if (!enabled) return
        try {
            toneGen?.startTone(ToneGenerator.TONE_CDMA_ALERT_NETWORK_LITE, 300)
        } catch (e: Exception) {
            // Ignore
        }
    }

    fun release() {
        toneGen?.release()
        toneGen = null
    }
}
