"use client";

import { useState, useCallback } from "react";
import { ScreenRecorder } from "@/components/ScreenRecorder";
import { VideoTrimmer } from "@/components/VideoTrimmer";
import { VideoUploader } from "@/components/VideoUploader";
import { ShareResult } from "@/components/ShareResult";

type Step = "record" | "trim" | "upload" | "share";

interface ShareData {
  shareId: string;
  shareUrl: string;
  title: string;
}

export function RecordingFlow() {
  const [step, setStep] = useState<Step>("record");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setRecordedBlob(blob);
    setStep("trim");
  }, []);

  const handleTrimComplete = useCallback((blob: Blob) => {
    setTrimmedBlob(blob);
    setStep("upload");
  }, []);

  const handleUploadComplete = useCallback((data: ShareData) => {
    setShareData(data);
    setStep("share");
  }, []);

  const handleRecordAnother = useCallback(() => {
    setStep("record");
    setRecordedBlob(null);
    setTrimmedBlob(null);
    setShareData(null);
  }, []);

  const handleBackToRecord = useCallback(() => {
    setStep("record");
    setRecordedBlob(null);
  }, []);

  const handleBackToTrim = useCallback(() => {
    setStep("trim");
    setTrimmedBlob(null);
  }, []);

  return (
    <>
      {step === "record" && (
        <ScreenRecorder onRecordingComplete={handleRecordingComplete} />
      )}

      {step === "trim" && recordedBlob && (
        <VideoTrimmer
          videoBlob={recordedBlob}
          onTrimComplete={handleTrimComplete}
          onCancel={handleBackToRecord}
        />
      )}

      {step === "upload" && trimmedBlob && (
        <VideoUploader
          videoBlob={trimmedBlob}
          onUploadComplete={handleUploadComplete}
          onBack={handleBackToTrim}
        />
      )}

      {step === "share" && shareData && (
        <ShareResult
          shareId={shareData.shareId}
          shareUrl={shareData.shareUrl}
          title={shareData.title}
          onRecordAnother={handleRecordAnother}
        />
      )}
    </>
  );
}
