-- Database functions and stored procedures for Social Media Tracker
-- This migration creates utility functions for efficient content management

-- Create upsert_item function for efficient content insertion/updates
CREATE OR REPLACE FUNCTION upsert_item(
    p_source text,
    p_external_id text,
    p_title text,
    p_url text,
    p_excerpt text DEFAULT NULL,
    p_author text DEFAULT NULL,
    p_score int DEFAULT 0,
    p_comment_count int DEFAULT 0,
    p_published_at timestamptz DEFAULT now(),
    p_raw jsonb DEFAULT NULL
) RETURNS bigint AS $$
DECLARE
    v_item_id bigint;
    v_existing_score int;
    v_existing_comment_count int;
BEGIN
    -- Try to find existing item by URL
    SELECT id, score, comment_count 
    INTO v_item_id, v_existing_score, v_existing_comment_count
    FROM items 
    WHERE url = p_url;
    
    IF v_item_id IS NOT NULL THEN
        -- Update existing item, preserving highest score and comment count
        UPDATE items SET
            source = p_source,
            external_id = COALESCE(p_external_id, external_id),
            title = p_title,
            excerpt = COALESCE(p_excerpt, excerpt),
            author = COALESCE(p_author, author),
            score = GREATEST(COALESCE(v_existing_score, 0), COALESCE(p_score, 0)),
            comment_count = GREATEST(COALESCE(v_existing_comment_count, 0), COALESCE(p_comment_count, 0)),
            published_at = COALESCE(p_published_at, published_at),
            raw_data = COALESCE(p_raw, raw_data),
            updated_at = now()
        WHERE id = v_item_id;
        
        RETURN v_item_id;
    ELSE
        -- Insert new item
        INSERT INTO items (
            source, external_id, title, url, excerpt, author, 
            score, comment_count, published_at, raw_data
        ) VALUES (
            p_source, p_external_id, p_title, p_url, p_excerpt, p_author,
            p_score, p_comment_count, p_published_at, p_raw
        ) RETURNING id INTO v_item_id;
        
        RETURN v_item_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate trending scores
CREATE OR REPLACE FUNCTION calculate_trending_score(
    p_score int,
    p_comment_count int,
    p_published_at timestamptz,
    p_window text DEFAULT '24h'
) RETURNS double precision AS $$
DECLARE
    v_age_hours double precision;
    v_age_penalty double precision;
    v_base_score double precision;
    v_trending_score double precision;
BEGIN
    -- Calculate age in hours
    v_age_hours := EXTRACT(EPOCH FROM (now() - p_published_at)) / 3600.0;
    
    -- Calculate base score (weighted combination of score and comments)
    v_base_score := (p_score * 0.7) + (p_comment_count * 0.3);
    
    -- Apply time-based penalty based on window
    CASE p_window
        WHEN '1h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 1.0);
        WHEN '6h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 6.0);
        WHEN '24h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 24.0);
        WHEN '7d' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 168.0);
        ELSE
            v_age_penalty := POWER(0.5, v_age_hours / 24.0);
    END CASE;
    
    -- Calculate final trending score
    v_trending_score := v_base_score * v_age_penalty;
    
    RETURN GREATEST(v_trending_score, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update trending metrics
CREATE OR REPLACE FUNCTION update_trending_metrics(
    p_window text DEFAULT '24h',
    p_limit int DEFAULT 100
) RETURNS int AS $$
DECLARE
    v_processed_count int := 0;
    v_item_record RECORD;
    v_trending_score double precision;
    v_velocity double precision;
    v_previous_score double precision;
BEGIN
    -- Process items for trending calculation
    FOR v_item_record IN
        SELECT id, score, comment_count, published_at
        FROM items
        WHERE published_at > (now() - CASE p_window
            WHEN '1h' THEN INTERVAL '2 hours'
            WHEN '6h' THEN INTERVAL '12 hours'
            WHEN '24h' THEN INTERVAL '48 hours'
            WHEN '7d' THEN INTERVAL '14 days'
            ELSE INTERVAL '48 hours'
        END)
        ORDER BY (score + comment_count) DESC
        LIMIT p_limit
    LOOP
        -- Calculate trending score
        v_trending_score := calculate_trending_score(
            v_item_record.score,
            v_item_record.comment_count,
            v_item_record.published_at,
            p_window
        );
        
        -- Get previous score for velocity calculation
        SELECT trending_score INTO v_previous_score
        FROM trending_metrics
        WHERE item_id = v_item_record.id 
          AND time_window = p_window
          AND DATE(created_at) = DATE(now() - INTERVAL '1 day')
        LIMIT 1;
        
        -- Calculate velocity
        IF v_previous_score IS NOT NULL THEN
            v_velocity := v_trending_score - v_previous_score;
        ELSE
            v_velocity := NULL;
        END IF;
        
        -- Insert trending metric (allow duplicates for now, can be cleaned up later)
        INSERT INTO trending_metrics (
            item_id, time_window, trending_score, velocity, created_at
        ) VALUES (
            v_item_record.id, p_window, v_trending_score, v_velocity, now()
        );
        
        v_processed_count := v_processed_count + 1;
    END LOOP;
    
    RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search items with full-text search
CREATE OR REPLACE FUNCTION search_items(
    p_query text,
    p_source text DEFAULT NULL,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0
) RETURNS TABLE (
    id bigint,
    source varchar(20),
    title text,
    url text,
    excerpt text,
    author varchar(255),
    score int,
    comment_count int,
    published_at timestamptz,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.source,
        i.title,
        i.url,
        i.excerpt,
        i.author,
        i.score,
        i.comment_count,
        i.published_at,
        ts_rank(i.search_vector, plainto_tsquery('english', p_query)) as rank
    FROM items i
    WHERE 
        i.search_vector @@ plainto_tsquery('english', p_query)
        AND (p_source IS NULL OR i.source = p_source)
    ORDER BY 
        ts_rank(i.search_vector, plainto_tsquery('english', p_query)) DESC,
        i.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get trending items
CREATE OR REPLACE FUNCTION get_trending_items(
    p_window text DEFAULT '24h',
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0
) RETURNS TABLE (
    id bigint,
    source varchar(20),
    title text,
    url text,
    excerpt text,
    author varchar(255),
    score int,
    comment_count int,
    published_at timestamptz,
    trending_score double precision,
    velocity double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.source,
        i.title,
        i.url,
        i.excerpt,
        i.author,
        i.score,
        i.comment_count,
        i.published_at,
        tm.trending_score,
        tm.velocity
    FROM items i
    INNER JOIN trending_metrics tm ON i.id = tm.item_id
    WHERE 
        tm.time_window = p_window
        AND DATE(tm.created_at) = DATE(now())
    ORDER BY tm.trending_score DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION upsert_item TO service_role;
GRANT EXECUTE ON FUNCTION calculate_trending_score TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION update_trending_metrics TO service_role;
GRANT EXECUTE ON FUNCTION search_items TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_trending_items TO authenticated, anon;