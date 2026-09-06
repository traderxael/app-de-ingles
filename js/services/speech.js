// Servicio de Síntesis de Voz (Text-to-Speech) y Reconocimiento de Voz (Speech-to-Text)
import { storageService } from "./storage.js";

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.rate = 0.95; // Velocidad de lectura natural
    this.recognition = null;
    this.isListening = false;
    
    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;

    const load = () => {
      this.voices = this.synth.getVoices();
      if (this.voices.length > 0) {
        // Priorizar voces nativas naturales en inglés (EE.UU. o Reino Unido)
        this.selectedVoice = 
          this.voices.find(v => v.lang === "en-US" && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Siri") || v.name.includes("Samantha") || v.name.includes("Jenny"))) ||
          this.voices.find(v => v.lang === "en-US") ||
          this.voices.find(v => v.lang.startsWith("en")) ||
          null;
      }
    };

    load();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = load;
    }
  }

  speak(text, slow = false, force = false) {
    if (!this.synth) {
      console.warn("SpeechSynthesis no está soportado en este navegador.");
      return;
    }

    // Respetar el estado de sonido global a menos que se fuerce explícitamente
    const state = storageService.getState();
    if (!force && state && state.soundEnabled === false) {
      return;
    }

    // Reintentar cargar voces si la lista estaba vacía
    if (!this.selectedVoice && this.synth.getVoices().length > 0) {
      this.initVoices();
    }

    // Cancelar cualquier locución anterior en cola
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = slow ? 0.65 : this.rate; // 0.65 para modo tortuga / desglose fonético
    utterance.pitch = 1.02;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Error al sintetizar voz:", e);
    }
  }

  isSupported() {
    return !!this.synth;
  }

  // =========================================================================
  // Reconocimiento de Voz (Web Speech Recognition) para Práctica Oral
  // =========================================================================
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 3;
    }
  }

  isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening({ onResult, onError, onEnd, lang = "en-US" }) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      if (onError) onError(new Error("El reconocimiento de voz no está soportado en este navegador."));
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      if (onResult) {
        onResult({ transcript, confidence });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("No se pudo iniciar el micrófono:", e);
      this.isListening = false;
      if (onError) onError(e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignorar si ya está detenido
      }
      this.isListening = false;
    }
  }

  // Compara la pronunciación del usuario con la frase objetivo
  evaluatePronunciation(spoken, target) {
    const clean = str => (str || "").toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, "").trim();
    const spokenClean = clean(spoken);
    const targetClean = clean(target);

    if (spokenClean === targetClean) {
      return { score: 100, isMatch: true };
    }

    const spokenWords = spokenClean.split(/\s+/).filter(Boolean);
    const targetWords = targetClean.split(/\s+/).filter(Boolean);

    if (targetWords.length === 0) return { score: 0, isMatch: false };

    let matches = 0;
    targetWords.forEach(w => {
      if (spokenWords.includes(w)) matches++;
    });

    const matchRatio = matches / targetWords.length;
    const score = Math.round(matchRatio * 100);

    return {
      score,
      isMatch: score >= 70,
      matchedWords: matches,
      totalWords: targetWords.length
    };
  }
}

export const speechService = new SpeechService();
