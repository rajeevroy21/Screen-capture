"use client";

import { useState, useRef, useCallback, useEffect } from "react";
type PipelineStatus = "idle" | "recording" | "processing" | "ready" | "error";

export default function VideoPipeline() {
  //State
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //Refs for Media Handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  //Logic: Start Capture
  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true
      });

      //Standard Web MediaRecorder API
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'video/webm;codecs=vp9' 
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(finalBlob);
        setVideoUrl(url);
        setStatus("ready");
        
        // Cleanup: Stop the screen share tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus("recording");
    } catch (err) {
      console.error("Capture Error:", err);
      setError("Permission denied or capture failed.");
      setStatus("error");
    }
  }, []);

  //Logic: Stop Capture ---
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && status === "recording") {
      setStatus("processing");
      mediaRecorderRef.current.stop();
    }
  }, [status]);

  //Logic: Reset
  const resetPipeline = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus("idle");
    setError(null);
  };
}