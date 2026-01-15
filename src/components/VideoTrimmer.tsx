"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoTrimmerProps {
  videoBlob: Blob;
  onTrimComplete: (trimmedBlob: Blob) => void;
  onCancel: () => void;
}

export function VideoTrimmer({
  videoBlob,
  onTrimComplete,
  onCancel,
}: VideoTrimmerProps) {
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoBlob]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      // Check if duration is valid
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
        setTrimRange([0, dur]);
      } else {
        // Retry loading metadata
        setTimeout(() => {
          if (videoRef.current && isFinite(videoRef.current.duration)) {
            const validDur = videoRef.current.duration;
            setDuration(validDur);
            setTrimRange([0, validDur]);
          }
        }, 500);
      }
    }
  };

  const handleTrimRangeChange = (values: number[]) => {
    setTrimRange([values[0], values[1]]);
    if (videoRef.current && values[0] !== trimRange[0]) {
      videoRef.current.currentTime = values[0];
    }
  };

  const seekToStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimRange[0];
    }
  };

  const seekToEnd = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimRange[1];
    }
  };

  const handleTrim = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      onTrimComplete(videoBlob);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      onTrimComplete(videoBlob);
      return;
    }

    setIsProcessing(true);

    try {
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;

      const stream = canvas.captureStream(30);
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      destination.stream.getAudioTracks().forEach((track) => {
        stream.addTrack(track);
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const trimmedBlob = await new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          resolve(blob);
        };

        video.currentTime = trimRange[0];
        
        video.onseeked = () => {
          mediaRecorder.start(100);
          video.play();
        };

        video.ontimeupdate = () => {
          if (video.currentTime >= trimRange[1]) {
            video.pause();
            mediaRecorder.stop();
            audioContext.close();
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        };
      });

      onTrimComplete(trimmedBlob);
    } catch (error) {
      console.error("Trim failed:", error);
      onTrimComplete(videoBlob);
    } finally {
      setIsProcessing(false);
    }
  }, [videoBlob, trimRange, onTrimComplete]);

  const skipTrim = () => {
    onTrimComplete(videoBlob);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          controls
          preload="metadata"
          className="w-full aspect-video bg-black rounded-xl"
        />
        <canvas ref={canvasRef} className="hidden" />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm">Processing video...</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>Trim Range</span>
          <span className="font-mono">
            {formatTime(trimRange[0])} - {formatTime(trimRange[1])}
          </span>
        </div>

        <Slider
          value={trimRange}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleTrimRangeChange}
          disabled={isProcessing}
          className="my-4"
        />

        <div className="flex justify-between text-xs text-zinc-500">
          <button onClick={seekToStart} className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Go to start
          </button>
          <span className="font-mono">Duration: {formatTime(trimRange[1] - trimRange[0])}</span>
          <button onClick={seekToEnd} className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Go to end
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Back
        </Button>
        <Button variant="outline" onClick={skipTrim} disabled={isProcessing} className="flex-1">
          Skip Trim
        </Button>
        <Button
          onClick={handleTrim}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
        >
          {isProcessing ? "Processing..." : "Apply Trim"}
        </Button>
      </div>
    </div>
  );
}
