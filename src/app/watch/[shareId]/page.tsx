import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";
import { WatchPageClient } from "./WatchPageClient";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

async function getVideo(shareId: string) {
  const supabase = getSupabaseServerClient();

  const { data: video, error } = await supabase
    .from("videos")
    .select(`
      *,
      video_analytics(view_count)
    `)
    .eq("share_id", shareId)
    .single();

  if (error || !video) {
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("video-recordings")
    .getPublicUrl(video.file_path);

  const { data: watchEvents } = await supabase
    .from("watch_events")
    .select("watch_percentage, completed")
    .eq("video_id", video.id);

  const completedCount = watchEvents?.filter((e) => e.completed).length || 0;
  const totalViews = video.video_analytics?.[0]?.view_count || 0;
  const completionRate = totalViews > 0 
    ? Math.round((completedCount / totalViews) * 100) 
    : 0;

  return {
    id: video.id,
    title: video.title,
    shareId: video.share_id,
    url: urlData.publicUrl,
    createdAt: video.created_at,
    viewCount: totalViews,
    completionRate,
  };
}

export default async function WatchPage({ params }: PageProps) {
  const { shareId } = await params;
  const video = await getVideo(shareId);

  if (!video) {
    notFound();
  }

  return <WatchPageClient video={video} />;
}
