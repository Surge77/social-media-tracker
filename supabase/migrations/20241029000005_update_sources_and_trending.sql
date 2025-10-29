-- Update database schema for new content sources and trending architecture
-- This migration updates source enum and adds new trending tables

-- Update items table source constraint to include new sources
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_source_check;
ALTER TABLE items ADD CONSTRAINT items_source_check 
    CHECK (source IN ('hackernews', 'rss', 'newsapi'));

-- Update any existing source values (if any exist)
-- This is safe to run even if no data exists
UPDATE items SET source = 'hackernews' WHERE source = 'reddit';
UPDATE items SET source = 'hackernews' WHERE source = 'twitter';

-- Create content_popularity table for new trending architecture
CREATE TABLE IF NOT EXISTS content_popularity (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('hackernews', 'rss', 'newsapi')),
    engagement_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    popularity_score DOUBLE PRECISION DEFAULT 0,
    trending_velocity DOUBLE PRECISION DEFAULT 0,
    peak_engagement_time TIMESTAMPTZ,
    last_engagement_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(item_id, source)
);

-- Create indexes for content_popularity
CREATE INDEX idx_content_popularity_item_id ON content_popularity(item_id);
CREATE INDEX idx_content_popularity_source ON content_popularity(source);
CREATE INDEX idx_content_popularity_score ON content_popularity(popularity_score DESC);
CREATE INDEX idx_content_popularity_velocity ON content_popularity(trending_velocity DESC);
CREATE INDEX idx_content_popularity_updated_at ON content_popularity(updated_at DESC);
CREATE INDEX idx_content_popularity_source_score ON content_popularity(source, popularity_score DESC);

-- Update trending_metrics table structure for new trending algorithms
-- Add new columns for enhanced trending analysis
ALTER TABLE trending_metrics ADD COLUMN IF NOT EXISTS algorithm_version TEXT DEFAULT 'v1';
ALTER TABLE trending_metrics ADD COLUMN IF NOT EXISTS trend_type TEXT CHECK (trend_type IN ('rising', 'hot', 'viral', 'sustained'));
ALTER TABLE trending_metrics ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION DEFAULT 0;
ALTER TABLE trending_metrics ADD COLUMN IF NOT EXISTS decay_factor DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE trending_metrics ADD COLUMN IF NOT EXISTS source_weight DOUBLE PRECISION DEFAULT 1.0;

-- Rename time_window to window for consistency
ALTER TABLE trending_metrics RENAME COLUMN time_window TO window;

-- Update window constraint to include more granular options
ALTER TABLE trending_metrics DROP CONSTRAINT IF EXISTS trending_metrics_time_window_check;
ALTER TABLE trending_metrics DROP CONSTRAINT IF EXISTS trending_metrics_window_check;
ALTER TABLE trending_metrics ADD CONSTRAINT trending_metrics_window_check 
    CHECK (window IN ('15m', '1h', '6h', '24h', '7d', '30d'));

-- Add new indexes for trending_metrics
CREATE INDEX IF NOT EXISTS idx_trending_metrics_algorithm ON trending_metrics(algorithm_version);
CREATE INDEX IF NOT EXISTS idx_trending_metrics_trend_type ON trending_metrics(trend_type);
CREATE INDEX IF NOT EXISTS idx_trending_metrics_confidence ON trending_metrics(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_metrics_window_type ON trending_metrics(window, trend_type);

-- Create trigger to automatically update content_popularity updated_at
CREATE OR REPLACE FUNCTION update_content_popularity_updated_at()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER content_popularity_updated_at
    BEFORE UPDATE ON content_popularity
    FOR EACH ROW
    EXECUTE FUNCTION update_content_popularity_updated_at();

-- Create function to calculate popularity score
CREATE OR REPLACE FUNCTION calculate_popularity_score(
    p_engagement_count int DEFAULT 0,
    p_share_count int DEFAULT 0,
    p_comment_count int DEFAULT 0,
    p_view_count int DEFAULT 0,
    p_source text DEFAULT 'hackernews'
) RETURNS double precision AS $
DECLARE
    v_base_score double precision;
    v_source_multiplier double precision;
    v_engagement_weight double precision := 0.4;
    v_share_weight double precision := 0.3;
    v_comment_weight double precision := 0.2;
    v_view_weight double precision := 0.1;
BEGIN
    -- Calculate base score with weighted components
    v_base_score := (
        (p_engagement_count * v_engagement_weight) +
        (p_share_count * v_share_weight) +
        (p_comment_count * v_comment_weight) +
        (p_view_count * v_view_weight)
    );
    
    -- Apply source-specific multipliers
    CASE p_source
        WHEN 'hackernews' THEN
            v_source_multiplier := 1.2; -- HN content tends to be high quality
        WHEN 'rss' THEN
            v_source_multiplier := 1.0; -- Neutral weighting
        WHEN 'newsapi' THEN
            v_source_multiplier := 0.9; -- Slightly lower due to volume
        ELSE
            v_source_multiplier := 1.0;
    END CASE;
    
    RETURN v_base_score * v_source_multiplier;
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to upsert content popularity
CREATE OR REPLACE FUNCTION upsert_content_popularity(
    p_item_id bigint,
    p_source text,
    p_engagement_count int DEFAULT 0,
    p_share_count int DEFAULT 0,
    p_comment_count int DEFAULT 0,
    p_view_count int DEFAULT 0
) RETURNS bigint AS $
DECLARE
    v_popularity_id bigint;
    v_popularity_score double precision;
    v_previous_score double precision;
    v_velocity double precision;
BEGIN
    -- Calculate new popularity score
    v_popularity_score := calculate_popularity_score(
        p_engagement_count, p_share_count, p_comment_count, p_view_count, p_source
    );
    
    -- Get previous score for velocity calculation
    SELECT popularity_score INTO v_previous_score
    FROM content_popularity
    WHERE item_id = p_item_id AND source = p_source;
    
    -- Calculate velocity
    IF v_previous_score IS NOT NULL THEN
        v_velocity := v_popularity_score - v_previous_score;
    ELSE
        v_velocity := v_popularity_score; -- First time, velocity equals score
    END IF;
    
    -- Upsert content popularity
    INSERT INTO content_popularity (
        item_id, source, engagement_count, share_count, comment_count, view_count,
        popularity_score, trending_velocity, last_engagement_time
    ) VALUES (
        p_item_id, p_source, p_engagement_count, p_share_count, p_comment_count, p_view_count,
        v_popularity_score, v_velocity, now()
    )
    ON CONFLICT (item_id, source) DO UPDATE SET
        engagement_count = EXCLUDED.engagement_count,
        share_count = EXCLUDED.share_count,
        comment_count = EXCLUDED.comment_count,
        view_count = EXCLUDED.view_count,
        popularity_score = EXCLUDED.popularity_score,
        trending_velocity = EXCLUDED.trending_velocity,
        last_engagement_time = EXCLUDED.last_engagement_time,
        updated_at = now(),
        -- Update peak engagement time if this is a new peak
        peak_engagement_time = CASE 
            WHEN EXCLUDED.popularity_score > content_popularity.popularity_score 
            THEN now() 
            ELSE content_popularity.peak_engagement_time 
        END
    RETURNING id INTO v_popularity_id;
    
    RETURN v_popularity_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on new functions and tables
GRANT SELECT ON content_popularity TO authenticated, anon;
GRANT INSERT, UPDATE ON content_popularity TO service_role;
GRANT USAGE ON SEQUENCE content_popularity_id_seq TO service_role;

GRANT EXECUTE ON FUNCTION calculate_popularity_score TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION upsert_content_popularity TO service_role;