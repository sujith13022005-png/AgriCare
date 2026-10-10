let currentAudio: HTMLAudioElement | null = null;
let isSpeakingFallback = false;

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export async function speakText(
  text: string,
  onStateChange?: (state: TTSState) => void
): Promise<void> {
  // Stop any currently playing audio
  stopSpeaking();

  if (!text || !text.trim()) return;

  onStateChange?.({ isPlaying: false, isLoading: true, error: null });

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        onStateChange?.({ isPlaying: true, isLoading: false, error: null });
      };

      audio.onended = () => {
        currentAudio = null;
        onStateChange?.({ isPlaying: false, isLoading: false, error: null });
      };

      audio.onerror = () => {
        fallbackWebSpeech(text, onStateChange);
      };

      await audio.play();
      return;
    }

    // Fallback if no audioUrl returned
    fallbackWebSpeech(text, onStateChange);
  } catch (err: any) {
    console.warn('TTS fetch failed, falling back to browser speech synthesis:', err);
    fallbackWebSpeech(text, onStateChange);
  }
}

function fallbackWebSpeech(
  text: string,
  onStateChange?: (state: TTSState) => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onStateChange?.({
      isPlaying: false,
      isLoading: false,
      error: 'Audio playback is not supported on this device.',
    });
    return;
  }

  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#_`]/g, '').slice(0, 300);
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 0.95; // Slightly slower for agricultural technical clarity

  utterance.onstart = () => {
    isSpeakingFallback = true;
    onStateChange?.({ isPlaying: true, isLoading: false, error: null });
  };

  utterance.onend = () => {
    isSpeakingFallback = false;
    onStateChange?.({ isPlaying: false, isLoading: false, error: null });
  };

  utterance.onerror = (e) => {
    isSpeakingFallback = false;
    onStateChange?.({
      isPlaying: false,
      isLoading: false,
      error: 'Speech playback error: ' + (e.error || 'Unknown'),
    });
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      isSpeakingFallback = false;
    } catch {}
  }
}
