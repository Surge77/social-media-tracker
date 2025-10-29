-- Configure public read access for content tables
-- This migration removes user-specific tables and sets up public read policies

-- Drop user-specific tables since we don't need authentication
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable Row Level Security on content tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_metrics ENABLE ROW LEVEL SECURITY;

-- Create public read policy for items table
-- Allow anonymous users to read all items
CREATE POLICY "Public read access for items" ON items
    FOR SELECT
    TO anon
    USING (true);

-- Create public read policy for trending_metrics table
-- Allow anonymous users to read all trending metrics
CREATE POLICY "Public read access for trending_metrics" ON trending_metrics
    FOR SELECT
    TO anon
    USING (true);

-- Grant necessary permissions to anonymous role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON items TO anon;
GRANT SELECT ON trending_metrics TO anon;

-- Grant usage on sequences for potential future insert operations via API
GRANT USAGE ON SEQUENCE items_id_seq TO anon;
GRANT USAGE ON SEQUENCE trending_metrics_id_seq TO anon;