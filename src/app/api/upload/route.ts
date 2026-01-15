import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;
    const title = (formData.get("title") as string) || "Untitled Recording";

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const fileId = uuidv4();
    const shareId = uuidv4().split("-")[0];
    const fileName = `${fileId}.webm`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("video-recordings")
      .upload(fileName, buffer, {
        contentType: "video/webm",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
    }

    // Get public URL from Supabase Storage
    const { data: urlData } = supabase.storage.from("video-recordings").getPublicUrl(fileName);

    // Save metadata to Supabase database
    const { data: videoData, error: dbError } = await supabase
      .from("videos")
      .insert({
        title,
        share_id: shareId,
        file_path: fileName,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Cleanup: delete file from storage if DB insert fails
      await supabase.storage.from("video-recordings").remove([fileName]);
      return NextResponse.json({ error: "Failed to save video metadata" }, { status: 500 });
    }

    // Initialize analytics
    await supabase.from("video_analytics").insert({
      video_id: videoData.id,
      view_count: 0,
    });

    return NextResponse.json({
      success: true,
      video: {
        id: videoData.id,
        shareId: videoData.share_id,
        title: videoData.title,
        url: urlData.publicUrl,
        shareUrl: `/watch/${videoData.share_id}`,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
