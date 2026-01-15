"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

interface VideoPlayerProps {
  videoId: string;
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoId, videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionIdRef = useRef<string>(uuidv4());
  const viewTrackedRef = useRef(false);
  const lastReportedPercentageRef = useRef(0);
  const [watchPercentage, setWatchPercentage] = useState(0);

  const trackView = useCallback(async () => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    try {
      await fetch("/api/analytics/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
    } catch (err) {
      console.error("Failed to track view:", err);
    }
  }, [videoId]);

  const trackWatchProgress = useCallback(
    async (percentage: number, completed: boolean = false) => {
      if (percentage - lastReportedPercentageRef.current < 10 && !completed) {
        return;
      }

      lastReportedPercentageRef.current = percentage;

      try {
        await fetch("/api/analytics/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId,
            watchPercentage: percentage,
            completed,
            sessionId: sessionIdRef.current,
          }),
        });
      } catch (err) {
        console.error("Failed to track watch progress:", err);
      }
    },
    [videoId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      trackView();
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const percentage = Math.round((video.currentTime / video.duration) * 100);
        setWatchPercentage(percentage);
        trackWatchProgress(percentage);
      }
    };

    const handleEnded = () => {
      trackWatchProgress(100, true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [trackView, trackWatchProgress]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        className="w-full aspect-video bg-black rounded-xl shadow-2xl"
      />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/50">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300"
          style={{ width: `${watchPercentage}%` }}
        />
      </div>
    </div>
  );
}
