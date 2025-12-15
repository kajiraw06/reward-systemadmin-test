-- Add voice_verification_completed column to claims table
ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS voice_verification_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS voice_verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voice_verified_by VARCHAR(255);

-- Add comment to explain the columns
COMMENT ON COLUMN claims.voice_verification_completed IS 'Whether admin has completed phone verification for high-value items';
COMMENT ON COLUMN claims.voice_verification_date IS 'Timestamp when voice verification was completed';
COMMENT ON COLUMN claims.voice_verified_by IS 'Admin username who completed the verification';
