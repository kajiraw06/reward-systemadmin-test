-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  admin_user VARCHAR(255),
  claim_id VARCHAR(100),
  reward_name VARCHAR(255),
  user_name VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON audit_logs(admin_user);
CREATE INDEX IF NOT EXISTS idx_audit_logs_claim_id ON audit_logs(claim_id);

-- Enable Row Level Security (optional, adjust based on your needs)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all logs
CREATE POLICY "Service role can access all audit logs" ON audit_logs
  FOR ALL
  TO service_role
  USING (true);

-- Create policy to allow authenticated users to read logs (adjust as needed)
CREATE POLICY "Authenticated users can read audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert logs
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
