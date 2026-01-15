"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function ScreenRecorder({ onRecordingComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      let combinedStream = displayStream;

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        const audioTracks = audioStream.getAudioTracks();
        const displayAudioTracks = displayStream.getAudioTracks();

        const allTracks = [
          ...displayStream.getVideoTracks(),
          ...displayAudioTracks,
          ...audioTracks,
        ];

        combinedStream = new MediaStream(allTracks);
      } catch {
        console.log("No microphone access, recording screen audio only");
      }

      streamRef.current = combinedStream;

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onRecordingComplete(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const discardRecording = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordingTime(0);
    chunksRef.current = [];
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-6">
      {previewUrl ? (
        <div className="flex flex-col gap-4">
          <video
            ref={previewVideoRef}
            src={previewUrl}
            controls
            className="w-full aspect-video bg-black rounded-xl"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={discardRecording} className="flex-1">
              Discard & Re-record
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 py-12 px-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
          {isRecording ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatTime(recordingTime)}
                </span>
                {isPaused && (
                  <span className="text-sm text-amber-500 font-medium">PAUSED</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={pauseRecording}>
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button variant="destructive" onClick={stopRecording}>
                  Stop Recording
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Screen Recording
                </h3>
                <p className="text-sm text-zinc-900 dark:text-zinc-900 mt-1">
                  Record your screen with optional microphone audio
                </p>
              </div>
              <Button
                size="lg"
                onClick={startRecording}
                className="cursor-pointer bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
              >
                Start Recording
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
