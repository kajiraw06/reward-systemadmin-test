-- Add requires_voice_verification column to rewards table
ALTER TABLE rewards 
ADD COLUMN IF NOT EXISTS requires_voice_verification BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN rewards.requires_voice_verification IS 'Flag for high-value items (>100k points) that require phone verification before approval';

-- Update existing high-value rewards (>100k points) to require voice verification
UPDATE rewards 
SET requires_voice_verification = TRUE 
WHERE points >= 100000;
