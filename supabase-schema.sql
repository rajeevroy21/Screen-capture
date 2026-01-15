-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  share_id TEXT UNIQUE NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_analytics table
CREATE TABLE IF NOT EXISTS public.video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watch_events table for tracking watch progress
CREATE TABLE IF NOT EXISTS public.watch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  watch_percentage NUMERIC DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_share_id ON public.videos(share_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON public.video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_watch_events_video_id ON public.watch_events(video_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_events ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to videos" 
  ON public.videos FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to videos" 
  ON public.videos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to video_analytics" 
  ON public.video_analytics FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert to video_analytics" 
  ON public.video_analytics FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public insert to watch_events" 
  ON public.watch_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to watch_events" 
  ON public.watch_events FOR SELECT 
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_videos_updated_at 
  BEFORE UPDATE ON public.videos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_analytics_updated_at 
  BEFORE UPDATE ON public.video_analytics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
