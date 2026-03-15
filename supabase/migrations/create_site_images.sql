CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hero', 'city')),
  label TEXT, -- city name for type=city, caption for type=hero
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Only service role can write, anyone can read
CREATE POLICY "Public read" ON site_images FOR SELECT USING (true);
CREATE POLICY "Service role write" ON site_images FOR ALL USING (auth.role() = 'service_role');
