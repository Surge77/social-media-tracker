import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabaseItems() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total count:', totalError);
    process.exit(1);
  }

  console.log(`\nTotal items in database: ${totalCount}\n`);

  // Get count by source
  const { data: sourceData, error: sourceError } = await supabase
    .from('items')
    .select('source');

  if (sourceError) {
    console.error('Error fetching source data:', sourceError);
  } else {
    const sourceCounts = sourceData?.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Items by source:');
    Object.entries(sourceCounts || {}).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`);
    });
  }

  // Get recent items (last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount, error: recentError } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .gte('published_at', oneDayAgo);

  if (recentError) {
    console.error('Error fetching recent count:', recentError);
  } else {
    console.log(`\nItems published in last 24h: ${recentCount}`);
  }

  // Get sample of latest items
  const { data: latestItems, error: latestError } = await supabase
    .from('items')
    .select('id, title, source, published_at, score')
    .order('published_at', { ascending: false })
    .limit(10);

  if (latestError) {
    console.error('Error fetching latest items:', latestError);
  } else {
    console.log('\nLatest 10 items:');
    latestItems?.forEach((item, i) => {
      console.log(`  ${i + 1}. [${item.source}] ${item.title.substring(0, 50)}... (score: ${item.score})`);
    });
  }
}

checkDatabaseItems().catch(console.error);
