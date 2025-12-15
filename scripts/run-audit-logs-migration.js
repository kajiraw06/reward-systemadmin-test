const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('🚀 Starting audit logs table migration...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../supabase/audit-logs-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 SQL file loaded')
    console.log('⚠️  Please run this SQL in your Supabase SQL Editor:')
    console.log('\n' + '='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80) + '\n')
    
    console.log('✅ Migration SQL is ready!')
    console.log('📋 Instructions:')
    console.log('   1. Go to your Supabase Dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Copy and paste the SQL above')
    console.log('   4. Click "Run" to execute')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

runMigration()
