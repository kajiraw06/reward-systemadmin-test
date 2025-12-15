-- Add inventory management fields to rewards table
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS last_restocked_at TIMESTAMP WITH TIME ZONE;

-- Create restock history table
CREATE TABLE IF NOT EXISTS restock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  previous_quantity INTEGER NOT NULL,
  added_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  restocked_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_restock_history_reward_id ON restock_history(reward_id);
CREATE INDEX IF NOT EXISTS idx_restock_history_created_at ON restock_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE restock_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy for public access (adjust based on your auth needs)
CREATE POLICY "Allow public read access to restock history" ON restock_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert restock history" ON restock_history FOR INSERT WITH CHECK (true);

-- Create inventory alerts view for low stock items
CREATE OR REPLACE VIEW low_stock_rewards AS
SELECT 
  r.id,
  r.name,
  r.category,
  r.quantity,
  r.low_stock_threshold,
  r.tier,
  r.is_active,
  r.updated_at
FROM rewards r
WHERE r.quantity <= r.low_stock_threshold
  AND r.is_active = true
ORDER BY r.quantity ASC;

-- Create out of stock view
CREATE OR REPLACE VIEW out_of_stock_rewards AS
SELECT 
  r.id,
  r.name,
  r.category,
  r.quantity,
  r.tier,
  r.is_active,
  r.updated_at
FROM rewards r
WHERE r.quantity = 0
  AND r.is_active = true
ORDER BY r.updated_at DESC;

-- Function to automatically deactivate out-of-stock items
CREATE OR REPLACE FUNCTION auto_deactivate_out_of_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity = 0 AND NEW.is_active = true THEN
    NEW.is_active = false;
  ELSIF NEW.quantity > 0 AND OLD.quantity = 0 THEN
    -- Automatically reactivate when restocked
    NEW.is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-deactivation
DROP TRIGGER IF EXISTS trigger_auto_deactivate_out_of_stock ON rewards;
CREATE TRIGGER trigger_auto_deactivate_out_of_stock
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION auto_deactivate_out_of_stock();

-- Function to log restock history
CREATE OR REPLACE FUNCTION log_restock_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if quantity increased
  IF NEW.quantity > OLD.quantity THEN
    INSERT INTO restock_history (
      reward_id,
      previous_quantity,
      added_quantity,
      new_quantity,
      notes
    ) VALUES (
      NEW.id,
      OLD.quantity,
      NEW.quantity - OLD.quantity,
      NEW.quantity,
      'Automatic restock log'
    );
    
    -- Update last restocked timestamp
    NEW.last_restocked_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restock logging
DROP TRIGGER IF EXISTS trigger_log_restock_history ON rewards;
CREATE TRIGGER trigger_log_restock_history
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  WHEN (NEW.quantity > OLD.quantity)
  EXECUTE FUNCTION log_restock_history();
