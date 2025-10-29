#!/usr/bin/env node

/**
 * Script to test public read access to content tables
 * This verifies that anonymous users can read items and trending_metrics
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client with anonymous key (public access)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicAccess() {
  try {
    console.log('Testing public read access...');
    
    // Test reading from items table
    console.log('\n📋 Testing items table access...');
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, title, source, score')
      .limit(5);
    
    if (itemsError) {
      console.error('❌ Error reading items:', itemsError);
    } else {
      console.log(`✅ Successfully read ${items.length} items`);
      if (items.length > 0) {
        console.log('   Sample item:', items[0]);
      }
    }
    
    // Test reading from trending_metrics table
    console.log('\n📈 Testing trending_metrics table access...');
    const { data: metrics, error: metricsError } = await supabase
      .from('trending_metrics')
      .select('id, item_id, time_window, trending_score')
      .limit(5);
    
    if (metricsError) {
      console.error('❌ Error reading trending_metrics:', metricsError);
    } else {
      console.log(`✅ Successfully read ${metrics.length} trending metrics`);
      if (metrics.length > 0) {
        console.log('   Sample metric:', metrics[0]);
      }
    }
    
    // Test that user tables are gone (should fail)
    console.log('\n👤 Testing that user tables are removed...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('✅ Users table correctly removed or inaccessible');
    } else {
      console.log('⚠️  Users table still exists - this may need attention');
    }
    
    console.log('\n🎉 Public access test completed!');
    
  } catch (error) {
    console.error('Error testing public access:', error);
    process.exit(1);
  }
}

// Run the test
testPublicAccess();