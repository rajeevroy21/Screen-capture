import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { videoId, watchPercentage, completed, sessionId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    await supabase.from("watch_events").insert({
      video_id: videoId,
      watch_percentage: watchPercentage || 0,
      completed: completed || false,
      session_id: sessionId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking watch:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
