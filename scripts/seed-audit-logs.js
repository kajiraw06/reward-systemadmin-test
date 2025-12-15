const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleLogs = [
  {
    action: 'Approved',
    admin_user: 'Admin',
    claim_id: 'REQ-001',
    reward_name: 'Gaming Mouse',
    user_name: 'John Doe',
    details: 'Claim approved successfully',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    action: 'Rejected',
    admin_user: 'Admin',
    claim_id: 'REQ-002',
    reward_name: 'Keyboard',
    user_name: 'Jane Smith',
    details: 'Claim rejected - Insufficient verification',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    action: 'Processing',
    admin_user: 'Admin',
    claim_id: 'REQ-003',
    reward_name: 'Headphones',
    user_name: 'Bob Johnson',
    details: 'Claim moved to processing',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
  },
  {
    action: 'Shipped',
    admin_user: 'Admin',
    claim_id: 'REQ-004',
    reward_name: 'T-Shirt',
    user_name: 'Alice Brown',
    details: 'Claim shipped - Tracking: TRK12345',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
  },
  {
    action: 'Delivered',
    admin_user: 'Admin',
    claim_id: 'REQ-005',
    reward_name: 'USB Cable',
    user_name: 'Mike Wilson',
    details: 'Claim delivered successfully',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
  },
  {
    action: 'Approved',
    admin_user: 'Admin',
    claim_id: 'REQ-006',
    reward_name: 'Phone Case',
    user_name: 'Sarah Davis',
    details: 'Claim approved with voice verification',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
  },
  {
    action: 'Created',
    admin_user: 'Admin',
    claim_id: 'N/A',
    reward_name: 'New Gaming Mouse Pro',
    user_name: 'N/A',
    details: 'New reward added to inventory',
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() // 5 hours ago
  },
  {
    action: 'Updated',
    admin_user: 'Admin',
    claim_id: 'N/A',
    reward_name: 'Webcam HD',
    user_name: 'N/A',
    details: 'Reward quantity updated from 10 to 25',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString() // 6 hours ago
  }
]

async function seedAuditLogs() {
  try {
    console.log('🌱 Seeding audit logs...')
    
    // Check if audit_logs table exists
    const { error: checkError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('❌ audit_logs table does not exist!')
      console.log('📋 Please run the migration first:')
      console.log('   node scripts/run-audit-logs-migration.js')
      process.exit(1)
    }
    
    // Insert sample logs
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(sampleLogs)
      .select()
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Successfully seeded ${data.length} audit log entries`)
    console.log('📊 Sample actions:')
    sampleLogs.forEach(log => {
      console.log(`   - ${log.action}: ${log.reward_name} (${log.user_name})`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding audit logs:', error.message)
    process.exit(1)
  }
}

seedAuditLogs()
