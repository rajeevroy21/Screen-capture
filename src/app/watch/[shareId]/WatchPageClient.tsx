"use client";

import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  shareId: string;
  url: string;
  createdAt: string;
  viewCount: number;
  completionRate: number;
}

interface WatchPageClientProps {
  video: Video;
}

export function WatchPageClient({ video }: WatchPageClientProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" 
    ? window.location.href 
    : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.1),transparent_50%)]" />
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="font-semibold text-white group-hover:text-rose-400 transition-colors">
              ScreenCap
            </span>
          </Link>
          <Button
              size="sm"
              onClick={copyLink}
              className={`border-none text-white transition-all duration-300 shadow-md ${
                copied 
                  ? "bg-emerald-500" 
                  : "bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 hover:scale-105"
              }`}
            >
              {copied ? "Copied!" : "Share Link"}
            </Button>
        </header>

        <main className="space-y-6">
          <VideoPlayer
            videoId={video.id}
            videoUrl={video.url}
            title={video.title}
          />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{video.title}</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Shared on {formatDate(video.createdAt)}
              </p>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">{video.viewCount}</p>
                  <p className="text-zinc-500 text-xs">Views</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white">{video.completionRate}%</p>
                  <p className="text-zinc-500 text-xs">Completion</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-16 pt-8 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              Create your own screen recordings
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white">
                Start Recording
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
