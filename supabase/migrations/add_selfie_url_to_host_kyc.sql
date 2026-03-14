-- Add selfie_url column to existing host_kyc table
ALTER TABLE host_kyc ADD COLUMN IF NOT EXISTS selfie_url TEXT NOT NULL DEFAULT '';
