"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoUploaderProps {
  videoBlob: Blob;
  onUploadComplete: (result: {
    shareId: string;
    shareUrl: string;
    title: string;
  }) => void;
  onBack: () => void;
}

export function VideoUploader({
  videoBlob,
  onUploadComplete,
  onBack,
}: VideoUploaderProps) {
  const [title, setTitle] = useState("My Screen Recording");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoUrlRef = useRef(URL.createObjectURL(videoBlob));

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("video", videoBlob, "recording.webm");
      formData.append("title", title);

      setProgress(30);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setProgress(100);

      onUploadComplete({
        shareId: data.video.shareId,
        shareUrl: data.video.shareUrl,
        title: data.video.title,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <video
        src={videoUrlRef.current}
        controls
        className="w-full aspect-video bg-black rounded-xl"
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Video Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your video"
            disabled={isUploading}
          />
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isUploading}>
          Back to Trim
        </Button>
        <Button
          onClick={handleUpload}
          disabled={isUploading || !title.trim()}
          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
        >
          {isUploading ? "Uploading..." : "Upload & Share"}
        </Button>
      </div>
    </div>
  );
}
