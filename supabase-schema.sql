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
-- MIGRATION: Fix user identity columns + create any missing tables
-- Run this entire block in your Supabase SQL Editor.
-- Safe to run even if some tables already have TEXT columns.
-- =============================================================

-- ── 1. Fix listings.user_id ──────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='listings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON listings', r.policyname);
  END LOOP;
  DROP INDEX IF EXISTS idx_listings_user_id;
  ALTER TABLE listings ALTER COLUMN user_id TYPE TEXT USING user_id::text;
END $$;

-- ── 2. Fix bookings.user_id ──────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='bookings'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', r.policyname);
  END LOOP;
  DROP INDEX IF EXISTS idx_bookings_user_id;
  ALTER TABLE bookings ALTER COLUMN user_id TYPE TEXT USING user_id::text;
END $$;

-- ── 3. Fix favorites.user_id ─────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
  ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_listing_id_key;
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname='public' AND tablename='favorites'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON favorites', r.policyname);
  END LOOP;
  DROP INDEX IF EXISTS idx_favorites_user_id;
  ALTER TABLE favorites ALTER COLUMN user_id TYPE TEXT USING user_id::text;
  ALTER TABLE favorites
    ADD CONSTRAINT favorites_user_id_listing_id_key UNIQUE (user_id, listing_id);
END $$;

-- ── 4. Create conversations (with correct TEXT columns) ──────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  host_id    TEXT NOT NULL,
  guest_id   TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix conversations if it existed with UUID columns
DO $$
DECLARE r RECORD;
BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='conversations'
        AND column_name='host_id') = 'uuid' THEN
    ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_host_id_fkey;
    ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_guest_id_fkey;
    FOR r IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='conversations'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', r.policyname);
    END LOOP;
    DROP INDEX IF EXISTS idx_conversations_host_id;
    DROP INDEX IF EXISTS idx_conversations_guest_id;
    ALTER TABLE conversations
      ALTER COLUMN host_id  TYPE TEXT USING host_id::text,
      ALTER COLUMN guest_id TYPE TEXT USING guest_id::text;
  END IF;
END $$;

-- ── 5. Create messages (with correct TEXT columns) ───────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix messages if it existed with UUID sender_id
DO $$
DECLARE r RECORD;
BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='messages'
        AND column_name='sender_id') = 'uuid' THEN
    ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
    FOR r IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='messages'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON messages', r.policyname);
    END LOOP;
    ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT USING sender_id::text;
  END IF;
END $$;

-- ── 6. Enable RLS on all five tables ─────────────────────────────
ALTER TABLE listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- ── 7. Recreate permissive policies (idempotent) ─────────────────
DROP POLICY IF EXISTS "Allow all on listings"      ON listings;
DROP POLICY IF EXISTS "Allow all on bookings"      ON bookings;
DROP POLICY IF EXISTS "Allow all on favorites"     ON favorites;
DROP POLICY IF EXISTS "Allow all on conversations" ON conversations;
DROP POLICY IF EXISTS "Allow all on messages"      ON messages;

CREATE POLICY "Allow all on listings"      ON listings      FOR ALL USING (true);
CREATE POLICY "Allow all on bookings"      ON bookings      FOR ALL USING (true);
CREATE POLICY "Allow all on favorites"     ON favorites     FOR ALL USING (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all on messages"      ON messages      FOR ALL USING (true);

-- ── 8. Recreate performance indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_user_id        ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id        ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id       ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_host_id   ON conversations(host_id);
CREATE INDEX IF NOT EXISTS idx_conversations_guest_id  ON conversations(guest_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
-- =============================================================
