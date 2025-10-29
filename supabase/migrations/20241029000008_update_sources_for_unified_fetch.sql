-- Update database schema for unified data fetch system
-- This migration updates source enum to use shorter forms and ensures proper constraints

-- Update items table source constraint to use shorter source names
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_check;
ALTER TABLE items ADD CONSTRAINT items_source_check 
    CHECK (source IN ('hn', 'rss', 'newsapi'));

-- Update existing source values to use shorter form
UPDATE items SET source = 'hn' WHERE source = 'hackernews';

-- Update content_popularity table source constraint
ALTER TABLE content_popularity DROP CONSTRAINT IF EXISTS content_popularity_source_check;
ALTER TABLE content_popularity ADD CONSTRAINT content_popularity_source_check 
    CHECK (source IN ('hn', 'rss', 'newsapi'));

-- Update existing content_popularity source values
UPDATE content_popularity SET source = 'hn' WHERE source = 'hackernews';

-- Ensure URL uniqueness constraint exists (should already exist from initial schema)
-- This is idempotent and safe to run
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'items_url_key'
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_url_key UNIQUE (url);
    END IF;
END $$;

-- Create index on source and published_at for efficient feed queries
CREATE INDEX IF NOT EXISTS idx_items_source_published ON items(source, published_at DESC);

-- Add comment to items table for documentation
COMMENT ON TABLE items IS 'Unified content items from multiple sources (Hacker News, RSS feeds, NewsAPI)';
COMMENT ON COLUMN items.source IS 'Content source: hn (Hacker News), rss (RSS feeds), newsapi (NewsAPI)';
COMMENT ON COLUMN items.url IS 'Unique URL for deduplication';
COMMENT ON COLUMN items.published_at IS 'Original publication timestamp from source';
