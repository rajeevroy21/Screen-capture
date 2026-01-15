import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: analytics, error: fetchError } = await supabase
      .from("video_analytics")
      .select("view_count")
      .eq("video_id", videoId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("video_analytics")
      .update({ 
        view_count: (analytics?.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("video_id", videoId);

    if (updateError) {
      console.error("Error updating view count:", updateError);
      return NextResponse.json({ error: "Failed to update view count" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      viewCount: (analytics?.view_count || 0) + 1 
    });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
