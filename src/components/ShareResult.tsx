"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ShareResultProps {
  shareId: string;
  shareUrl: string;
  title: string;
  onRecordAnother: () => void;
}

export function ShareResult({
  shareId,
  shareUrl,
  title,
  onRecordAnother,
}: ShareResultProps) {
  const [copied, setCopied] = useState(false);

  const fullShareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}${shareUrl}` 
    : shareUrl;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Video Uploaded!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          &quot;{title}&quot; is now ready to share
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <label className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Share Link
          </label>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {fullShareUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={shareUrl} className="w-full">
            <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
              View Video Page
            </Button>
          </Link>
          <Button variant="outline" onClick={onRecordAnother} className="w-full">
            Record Another Video
          </Button>
        </div>
      </div>
    </div>
  );
}
