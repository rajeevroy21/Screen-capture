import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
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
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const { data: urlData } = supabase.storage
      .from("video-recordings")
      .getPublicUrl(video.file_path);

    return NextResponse.json({
      id: video.id,
      title: video.title,
      shareId: video.share_id,
      url: urlData.publicUrl,
      createdAt: video.created_at,
      viewCount: video.video_analytics?.[0]?.view_count || 0,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
