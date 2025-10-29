-- Finalize database schema for unified data fetch system
-- This migration ensures the items table matches the design specification exactly

-- Ensure all required columns exist with correct types and defaults
-- The items table should already exist, so we're just ensuring consistency

-- Verify score and comment_count have proper defaults
ALTER TABLE items ALTER COLUMN score SET DEFAULT 0;
ALTER TABLE items ALTER COLUMN comment_count SET DEFAULT 0;

-- Ensure the source constraint is correct for unified fetch
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_check;
ALTER TABLE items ADD CONSTRAINT items_source_check 
    CHECK (source IN ('hn', 'rss', 'newsapi'));

-- Ensure URL uniqueness constraint exists (critical for deduplication)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'items_url_key'
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_url_key UNIQUE (url);
    END IF;
END $$;

-- Ensure optimal indexes exist for feed queries
CREATE INDEX IF NOT EXISTS idx_items_published_at_desc ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_source_published ON items(source, published_at DESC);

-- Add helpful comments for documentation
COMMENT ON TABLE items IS 'Unified content items from multiple sources (Hacker News, RSS feeds, NewsAPI)';
COMMENT ON COLUMN items.source IS 'Content source: hn (Hacker News), rss (RSS feeds), newsapi (NewsAPI)';
COMMENT ON COLUMN items.url IS 'Unique URL for deduplication - enforced by unique constraint';
COMMENT ON COLUMN items.published_at IS 'Original publication timestamp from source';
COMMENT ON COLUMN items.score IS 'Engagement score (upvotes, likes, etc.) - defaults to 0';
COMMENT ON COLUMN items.comment_count IS 'Number of comments/discussions - defaults to 0';
COMMENT ON COLUMN items.author IS 'Content author/creator - optional';
COMMENT ON COLUMN items.excerpt IS 'Content excerpt/description - optional, max 1000 chars recommended';

-- Verify the schema matches requirements
DO $$
DECLARE
    missing_columns TEXT[];
BEGIN
    -- Check for required columns
    SELECT ARRAY_AGG(column_name)
    INTO missing_columns
    FROM (
        SELECT unnest(ARRAY['id', 'source', 'title', 'url', 'published_at', 
                            'author', 'excerpt', 'score', 'comment_count', 
                            'created_at', 'updated_at']) AS column_name
    ) required
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'items' 
        AND column_name = required.column_name
    );
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required columns in items table: %', array_to_string(missing_columns, ', ');
    END IF;
    
    RAISE NOTICE 'Schema verification complete: All required columns exist';
END $$;
