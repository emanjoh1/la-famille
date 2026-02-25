-- Add 'snoozed' status to listings table
-- Run this in your Supabase SQL Editor

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('pending_review', 'approved', 'rejected', 'snoozed'));
