#!/usr/bin/env node

/**
 * Script to set up database security for public read access
 * This script configures Row Level Security policies for anonymous access
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabaseSecurity() {
  try {
    console.log('Setting up database security policies...');
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setup-public-access.sql'), 
      'utf8'
    );
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('Error executing SQL script:', error);
      process.exit(1);
    }
    
    console.log('✅ Database security policies configured successfully!');
    console.log('✅ Public read access enabled for items and trending_metrics tables');
    console.log('✅ User-specific tables (users, bookmarks) removed');
    
  } catch (error) {
    console.error('Error setting up database security:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabaseSecurity();