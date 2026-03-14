-- Create host_kyc table for KYC verification
CREATE TABLE IF NOT EXISTS host_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  id_card_front_url TEXT NOT NULL,
  id_card_back_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_host_kyc_user_id ON host_kyc(user_id);

-- Create index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_host_kyc_status ON host_kyc(status);

-- Enable RLS
ALTER TABLE host_kyc ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own KYC data
CREATE POLICY "Users can view own KYC"
  ON host_kyc
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own KYC data
CREATE POLICY "Users can insert own KYC"
  ON host_kyc
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own KYC data (only if rejected)
CREATE POLICY "Users can update own rejected KYC"
  ON host_kyc
  FOR UPDATE
  USING (auth.uid()::text = user_id AND status = 'rejected');
