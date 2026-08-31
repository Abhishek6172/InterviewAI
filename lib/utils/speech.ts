/**
 * Browser Web Speech API Abstraction Layer
 * Handles SpeechSynthesis (TTS) and SpeechRecognition (STT) gracefully
 */

export interface SpeechSynthesisOptions {
  pitch?: number;
  rate?: number;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class BrowserSpeechService {
  private static recognitionInstance: any = null;
  private static cachedVoice: SpeechSynthesisVoice | null = null;
  private static isInitialized = false;

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public static isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }

  /**
   * Resolve a consistent natural voice for Adya
   */
  public static getConsistentVoice(): SpeechSynthesisVoice | null {
    if (this.cachedVoice) return this.cachedVoice;
    if (!this.isSpeechSynthesisSupported()) return null;

    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Preference hierarchy for clear, professional female/natural voice (Adya)
    const priorityKeywords = [
      "Google US English",
      "Microsoft Jenny Online (Natural)",
      "Microsoft Aria Online (Natural)",
      "Microsoft Zira",
      "Samantha",
      "Victoria",
      "Karen",
      "en-US",
      "en-GB",
    ];

    for (const keyword of priorityKeywords) {
      const match = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes(keyword) || v.voiceURI.includes(keyword))
      );
      if (match) {
        this.cachedVoice = match;
        return match;
      }
    }

    // Fallback: any English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    if (anyEnglish) {
      this.cachedVoice = anyEnglish;
      return anyEnglish;
    }

    this.cachedVoice = voices[0] || null;
    return this.cachedVoice;
  }

  public static speak(text: string, options: SpeechSynthesisOptions = {}) {
    if (!this.isSpeechSynthesisSupported()) {
      options.onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;

        const voice = this.getConsistentVoice();
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onstart = () => options.onStart?.();
        utterance.onend = () => options.onEnd?.();
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis error:", e);
          options.onError?.(e);
          options.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        // Wait for voices to load asynchronously
        window.speechSynthesis.onvoiceschanged = () => {
          this.getConsistentVoice();
          doSpeak();
        };
        // Safety timeout
        setTimeout(() => {
          if (!this.cachedVoice) doSpeak();
        }, 150);
      } else {
        doSpeak();
      }
    } catch (err) {
      console.warn("Error triggering speech synthesis:", err);
      options.onEnd?.();
    }
  }

  public static stopSpeaking() {
    if (this.isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // ignore
      }
    }
  }

  public static startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): (() => void) | null {
    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onError("Speech recognition is not supported in this browser.");
      callbacks.onEnd();
      return null;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        callbacks.onResult(final || interim, Boolean(final));
      };

      recognition.onerror = (event: any) => {
        console.warn("SpeechRecognition error:", event.error);
        callbacks.onError(event.error);
      };

      recognition.onend = () => {
        callbacks.onEnd();
      };

      recognition.start();
      this.recognitionInstance = recognition;

      return () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      };
    } catch (err: any) {
      callbacks.onError(err?.message || "Failed to initialize microphone.");
      callbacks.onEnd();
      return null;
    }
  }

  public static stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (err) {
        // ignore
      }
      this.recognitionInstance = null;
    }
  }
}
