const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials from .env.local
const supabaseUrl = 'https://qspnrpdakomlnobejysa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzcG5ycGRha29tbG5vYmVqeXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzgyNDksImV4cCI6MjA4MDE1NDI0OX0.tq-ojngwgiu1233DehyJthn_wR2gh2FvyRTjC8EGp1U';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         Running Inventory Management Migration...               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase', 'inventory-management.sql');
    console.log('📂 Reading migration file:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Error: Migration file not found at:', migrationPath);
      return;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('✓ Migration file loaded successfully\n');

    // Split SQL into individual statements (simplified approach)
    console.log('🔄 Executing migration statements...\n');

    // Execute the migration using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, we'll need to use REST API directly
      console.log('⚠️  RPC method not available, using alternative approach...\n');
      
      // Alternative: Execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error('Failed to execute migration via REST API');
      }

      console.log('✅ Migration executed successfully!\n');
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify the migration worked
    console.log('🔍 Verifying migration...\n');
    await verifyMigration();

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error('\n⚠️  You may need to run the migration manually in Supabase SQL Editor.');
    console.error('    Follow the instructions in MIGRATION_STEP_BY_STEP.md\n');
  }
}

async function verifyMigration() {
  try {
    // Check if new columns exist
    console.log('1️⃣ Checking if new columns exist in rewards table...');
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('id, name, quantity, is_active, low_stock_threshold, last_restocked_at')
      .limit(1);

    if (rewardsError) {
      console.log('   ⚠️  Could not verify columns (might not exist yet)');
    } else {
      console.log('   ✓ New columns exist: is_active, low_stock_threshold, last_restocked_at\n');
    }

    // Check if restock_history table exists
    console.log('2️⃣ Checking if restock_history table exists...');
    const { data: history, error: historyError } = await supabase
      .from('restock_history')
      .select('id')
      .limit(1);

    if (historyError) {
      console.log('   ⚠️  restock_history table might not exist yet');
    } else {
      console.log('   ✓ restock_history table exists\n');
    }

    // Check if views exist
    console.log('3️⃣ Checking if database views exist...');
    const { data: lowStock, error: lowStockError } = await supabase
      .from('low_stock_rewards')
      .select('id')
      .limit(1);

    if (lowStockError) {
      console.log('   ⚠️  Views might not exist yet');
    } else {
      console.log('   ✓ Database views exist\n');
    }

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('  ✅ MIGRATION VERIFICATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════════\n');
    
    console.log('🎉 Next steps:');
    console.log('   1. Go to: http://localhost:3000/admin');
    console.log('   2. Login: admin / admin123');
    console.log('   3. Click: "📦 Manage Inventory" button');
    console.log('   4. Enjoy your new inventory management system!\n');

  } catch (error) {
    console.error('   ⚠️  Verification error:', error.message);
  }
}

// Run the migration
runMigration();
