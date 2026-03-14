-- Add blocked dates table for host availability management
CREATE TABLE IF NOT EXISTS listing_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_listing_id ON listing_blocked_dates(listing_id);

ALTER TABLE listing_blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage blocked dates" ON listing_blocked_dates FOR ALL USING (true);
