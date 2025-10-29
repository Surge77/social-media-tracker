-- Row Level Security policies for Social Media Tracker
-- This migration sets up security policies for data access control

-- Enable RLS on all tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_metrics ENABLE ROW LEVEL SECURITY;

-- Items table policies - public read access for anonymous users
CREATE POLICY "Items are publicly readable" ON items
    FOR SELECT USING (true);

-- Allow service role to insert/update items (for content collection)
CREATE POLICY "Service role can manage items" ON items
    FOR ALL USING (auth.role() = 'service_role');

-- Users table policies - users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookmarks table policies - users can only manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Trending metrics table policies - public read access
CREATE POLICY "Trending metrics are publicly readable" ON trending_metrics
    FOR SELECT USING (true);

-- Allow service role to manage trending metrics
CREATE POLICY "Service role can manage trending metrics" ON trending_metrics
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions for anonymous users
GRANT SELECT ON items TO anon;
GRANT SELECT ON trending_metrics TO anon;

-- Grant permissions for authenticated users
GRANT SELECT ON items TO authenticated;
GRANT SELECT ON trending_metrics TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON bookmarks TO authenticated;

-- Grant permissions for service role (already has full access by default)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;