-- Add Flutterwave payment fields to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS flutterwave_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe'
    CHECK (payment_provider IN ('stripe', 'flutterwave'));
