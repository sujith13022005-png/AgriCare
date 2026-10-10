import { useState, useRef, useEffect, useCallback } from 'react';

interface UseVoiceInputOptions {
  onTranscribed?: (text: string) => void;
  onError?: (errorMsg: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  // Clear timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setStatusMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Select supported mime type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setStatusMessage('Listening to your voice... Speak now');

        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        clearTimer();

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        if (audioBlob.size === 0) {
          setStatusMessage(null);
          return;
        }

        setIsTranscribing(true);
        setStatusMessage('Transcribing speech with gemini-3.5-transcribe...');

        try {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Data = (reader.result as string).split(',')[1];
              const cleanMime = audioBlob.type.split(';')[0] || 'audio/webm';

              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: cleanMime,
                }),
              });

              if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error ${response.status}`);
              }

              const data = await response.json();
              const text = (data.text || '').trim();

              if (text) {
                setStatusMessage(null);
                if (options.onTranscribed) {
                  options.onTranscribed(text);
                }
              } else {
                setStatusMessage('No clear speech detected. Please try speaking again.');
                setTimeout(() => setStatusMessage(null), 3000);
              }
            } catch (err: any) {
              console.error('Transcription error:', err);
              const errMsg = err?.message || 'Could not transcribe audio';
              setStatusMessage(`Transcription failed: ${errMsg}`);
              if (options.onError) {
                options.onError(errMsg);
              }
              setTimeout(() => setStatusMessage(null), 4000);
            } finally {
              setIsTranscribing(false);
            }
          };
        } catch (err: any) {
          console.error('Error reading audio data:', err);
          setIsTranscribing(false);
          setStatusMessage('Error preparing audio');
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
    } catch (err: any) {
      console.error('Microphone start error:', err);
      setIsRecording(false);
      clearTimer();
      const message =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : err.message || 'Unable to access microphone.';
      setStatusMessage(message);
      if (options.onError) {
        options.onError(message);
      }
      setTimeout(() => setStatusMessage(null), 4000);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Discard chunks
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setIsTranscribing(false);
    setStatusMessage(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    recordingSeconds,
    statusMessage,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
