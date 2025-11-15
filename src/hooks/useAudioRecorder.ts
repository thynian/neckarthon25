import { useState, useRef, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0); // in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Timer updater
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(pausedTimeRef.current + elapsed);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setRecordingState("stopped");
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setRecordingTime(0);
      setRecordingState("recording");
    } catch (err) {
      setError("Mikrofon-Zugriff verweigert oder nicht verfügbar");
      console.error("Error starting recording:", err);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      pausedTimeRef.current = recordingTime;
      setRecordingState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      setRecordingState("recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== "idle") {
      mediaRecorderRef.current.stop();
    }
  };

  const resetRecording = () => {
    setRecordingState("idle");
    setRecordingTime(0);
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
    pausedTimeRef.current = 0;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    recordingState,
    recordingTime,
    audioBlob,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatTime,
  };
};
