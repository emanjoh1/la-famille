-- Run this SQL in your Supabase SQL Editor

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  host_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now - customize based on your needs)
CREATE POLICY "Allow all on listings" ON listings FOR ALL USING (true);
CREATE POLICY "Allow all on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all on favorites" ON favorites FOR ALL USING (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true);

-- =============================================================
-- MIGRATION: Add listing approval system
-- Run this block if you already created the tables above
-- =============================================================
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Approve any listings that were created before this migration
UPDATE listings SET status = 'approved' WHERE status = 'pending_review';
-- =============================================================

-- =============================================================
-- MIGRATION: Fix user identity columns UUID → TEXT
-- Clerk user IDs look like "user_3A5t01umAiUO43HxQpZxpjezuP8" and
-- are NOT valid UUIDs. If your tables were created with UUID type
-- for these columns, every booking / listing / message write will
-- fail with "invalid input syntax for type uuid".
--
-- NOTE: Postgres refuses to ALTER a column that any RLS policy
-- depends on. Step 1 dynamically drops ALL policies on the five
-- affected tables, Step 4 puts back simple "allow all" policies.
-- Run this entire block in your Supabase SQL Editor.
-- =============================================================

-- Step 1: Drop foreign key constraints referencing auth.users(id)
-- (Postgres can't change UUID → TEXT while an FK to a UUID column exists)
ALTER TABLE listings      DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
ALTER TABLE bookings      DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE favorites     DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_host_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_guest_id_fkey;
ALTER TABLE messages      DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Step 2: Drop ALL RLS policies on affected tables (any name)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename  IN ('listings','bookings','favorites','conversations','messages')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Step 3: Drop dependent indexes (recreated below)
DROP INDEX IF EXISTS idx_listings_user_id;
DROP INDEX IF EXISTS idx_bookings_user_id;
DROP INDEX IF EXISTS idx_favorites_user_id;
DROP INDEX IF EXISTS idx_conversations_host_id;
DROP INDEX IF EXISTS idx_conversations_guest_id;

-- Step 4: Alter column types UUID → TEXT
ALTER TABLE listings
  ALTER COLUMN user_id TYPE TEXT USING user_id::text;

ALTER TABLE bookings
  ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- favorites has a UNIQUE constraint — drop + recreate around the ALTER
ALTER TABLE favorites
  DROP CONSTRAINT IF EXISTS favorites_user_id_listing_id_key;
ALTER TABLE favorites
  ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE favorites
  ADD CONSTRAINT favorites_user_id_listing_id_key UNIQUE (user_id, listing_id);

ALTER TABLE conversations
  ALTER COLUMN host_id TYPE TEXT USING host_id::text,
  ALTER COLUMN guest_id TYPE TEXT USING guest_id::text;

ALTER TABLE messages
  ALTER COLUMN sender_id TYPE TEXT USING sender_id::text;

-- Step 5: Recreate permissive RLS policies
CREATE POLICY "Allow all on listings"      ON listings      FOR ALL USING (true);
CREATE POLICY "Allow all on bookings"      ON bookings      FOR ALL USING (true);
CREATE POLICY "Allow all on favorites"     ON favorites     FOR ALL USING (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all on messages"      ON messages      FOR ALL USING (true);

-- Step 6: Recreate performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id       ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id       ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id      ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_host_id  ON conversations(host_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_id ON conversations(guest_id);
-- =============================================================
