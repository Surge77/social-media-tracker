-- Update database functions to handle new source types
-- This migration updates existing functions for hackernews, rss, and newsapi sources

-- Update upsert_item function to handle new sources and integrate with content_popularity
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
) RETURNS bigint AS $
DECLARE
    v_item_id bigint;
    v_existing_score int;
    v_existing_comment_count int;
    v_is_new_item boolean := false;
BEGIN
    -- Validate source
    IF p_source NOT IN ('hackernews', 'rss', 'newsapi') THEN
        RAISE EXCEPTION 'Invalid source: %. Must be one of: hackernews, rss, newsapi', p_source;
    END IF;
    
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
    ELSE
        -- Insert new item
        INSERT INTO items (
            source, external_id, title, url, excerpt, author, 
            score, comment_count, published_at, raw_data
        ) VALUES (
            p_source, p_external_id, p_title, p_url, p_excerpt, p_author,
            p_score, p_comment_count, p_published_at, p_raw
        ) RETURNING id INTO v_item_id;
        
        v_is_new_item := true;
    END IF;
    
    -- Update content popularity for this item
    PERFORM upsert_content_popularity(
        v_item_id,
        p_source,
        COALESCE(p_score, 0), -- engagement_count
        0, -- share_count (not available from most sources)
        COALESCE(p_comment_count, 0), -- comment_count
        0 -- view_count (not available from most sources)
    );
    
    RETURN v_item_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update calculate_trending_score function for new sources and enhanced algorithm
CREATE OR REPLACE FUNCTION calculate_trending_score(
    p_score int,
    p_comment_count int,
    p_published_at timestamptz,
    p_window text DEFAULT '24h',
    p_source text DEFAULT 'hackernews',
    p_algorithm_version text DEFAULT 'v2'
) RETURNS double precision AS $
DECLARE
    v_age_hours double precision;
    v_age_penalty double precision;
    v_base_score double precision;
    v_trending_score double precision;
    v_source_weight double precision;
    v_recency_boost double precision := 1.0;
BEGIN
    -- Calculate age in hours
    v_age_hours := EXTRACT(EPOCH FROM (now() - p_published_at)) / 3600.0;
    
    -- Source-specific weighting
    CASE p_source
        WHEN 'hackernews' THEN
            v_source_weight := 1.2; -- HN content tends to be high quality
        WHEN 'rss' THEN
            v_source_weight := 1.0; -- Neutral weighting
        WHEN 'newsapi' THEN
            v_source_weight := 0.9; -- Slightly lower due to volume
        ELSE
            v_source_weight := 1.0;
    END CASE;
    
    -- Enhanced base score calculation (v2 algorithm)
    IF p_algorithm_version = 'v2' THEN
        -- More sophisticated scoring that considers engagement ratio
        v_base_score := (
            (p_score * 0.6) + 
            (p_comment_count * 0.4) + 
            (CASE WHEN p_comment_count > 0 THEN (p_score::float / p_comment_count) * 0.1 ELSE 0 END)
        ) * v_source_weight;
        
        -- Recency boost for very new content (first 2 hours)
        IF v_age_hours < 2 THEN
            v_recency_boost := 1.0 + (0.3 * (2 - v_age_hours) / 2);
        END IF;
    ELSE
        -- Original algorithm (v1)
        v_base_score := ((p_score * 0.7) + (p_comment_count * 0.3)) * v_source_weight;
    END IF;
    
    -- Apply time-based penalty based on window
    CASE p_window
        WHEN '15m' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 0.25);
        WHEN '1h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 1.0);
        WHEN '6h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 6.0);
        WHEN '24h' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 24.0);
        WHEN '7d' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 168.0);
        WHEN '30d' THEN
            v_age_penalty := POWER(0.5, v_age_hours / 720.0);
        ELSE
            v_age_penalty := POWER(0.5, v_age_hours / 24.0);
    END CASE;
    
    -- Calculate final trending score with recency boost
    v_trending_score := v_base_score * v_age_penalty * v_recency_boost;
    
    RETURN GREATEST(v_trending_score, 0);
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Update update_trending_metrics function for new sources and enhanced trending
CREATE OR REPLACE FUNCTION update_trending_metrics(
    p_window text DEFAULT '24h',
    p_limit int DEFAULT 100,
    p_source text DEFAULT NULL,
    p_algorithm_version text DEFAULT 'v2'
) RETURNS int AS $
DECLARE
    v_processed_count int := 0;
    v_item_record RECORD;
    v_trending_score double precision;
    v_velocity double precision;
    v_previous_score double precision;
    v_trend_type text;
    v_confidence_score double precision;
    v_decay_factor double precision;
    v_source_weight double precision;
BEGIN
    -- Process items for trending calculation
    FOR v_item_record IN
        SELECT i.id, i.source, i.score, i.comment_count, i.published_at,
               cp.popularity_score, cp.trending_velocity
        FROM items i
        LEFT JOIN content_popularity cp ON i.id = cp.item_id AND i.source = cp.source
        WHERE i.published_at > (now() - CASE p_window
            WHEN '15m' THEN INTERVAL '30 minutes'
            WHEN '1h' THEN INTERVAL '2 hours'
            WHEN '6h' THEN INTERVAL '12 hours'
            WHEN '24h' THEN INTERVAL '48 hours'
            WHEN '7d' THEN INTERVAL '14 days'
            WHEN '30d' THEN INTERVAL '60 days'
            ELSE INTERVAL '48 hours'
        END)
        AND (p_source IS NULL OR i.source = p_source)
        ORDER BY (i.score + i.comment_count) DESC
        LIMIT p_limit
    LOOP
        -- Calculate trending score
        v_trending_score := calculate_trending_score(
            v_item_record.score,
            v_item_record.comment_count,
            v_item_record.published_at,
            p_window,
            v_item_record.source,
            p_algorithm_version
        );
        
        -- Get previous score for velocity calculation
        SELECT trending_score INTO v_previous_score
        FROM trending_metrics
        WHERE item_id = v_item_record.id 
          AND window = p_window
          AND algorithm_version = p_algorithm_version
          AND created_at > (now() - INTERVAL '2 hours')
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Calculate velocity
        IF v_previous_score IS NOT NULL THEN
            v_velocity := v_trending_score - v_previous_score;
        ELSE
            v_velocity := COALESCE(v_item_record.trending_velocity, 0);
        END IF;
        
        -- Determine trend type based on score and velocity
        IF v_trending_score > 50 AND v_velocity > 10 THEN
            v_trend_type := 'viral';
        ELSIF v_velocity > 5 THEN
            v_trend_type := 'rising';
        ELSIF v_trending_score > 20 THEN
            v_trend_type := 'hot';
        ELSE
            v_trend_type := 'sustained';
        END IF;
        
        -- Calculate confidence score (0-1) based on data quality
        v_confidence_score := LEAST(1.0, (
            CASE WHEN v_item_record.score > 0 THEN 0.3 ELSE 0 END +
            CASE WHEN v_item_record.comment_count > 0 THEN 0.3 ELSE 0 END +
            CASE WHEN v_item_record.popularity_score IS NOT NULL THEN 0.4 ELSE 0.2 END
        ));
        
        -- Calculate decay factor based on content age
        v_decay_factor := CASE p_window
            WHEN '15m' THEN 0.9
            WHEN '1h' THEN 0.8
            WHEN '6h' THEN 0.7
            WHEN '24h' THEN 0.6
            WHEN '7d' THEN 0.4
            WHEN '30d' THEN 0.2
            ELSE 0.6
        END;
        
        -- Source weight for trending calculation
        CASE v_item_record.source
            WHEN 'hackernews' THEN v_source_weight := 1.2;
            WHEN 'rss' THEN v_source_weight := 1.0;
            WHEN 'newsapi' THEN v_source_weight := 0.9;
            ELSE v_source_weight := 1.0;
        END CASE;
        
        -- Insert trending metric
        INSERT INTO trending_metrics (
            item_id, window, trending_score, velocity, algorithm_version,
            trend_type, confidence_score, decay_factor, source_weight, created_at
        ) VALUES (
            v_item_record.id, p_window, v_trending_score, v_velocity, p_algorithm_version,
            v_trend_type, v_confidence_score, v_decay_factor, v_source_weight, now()
        );
        
        v_processed_count := v_processed_count + 1;
    END LOOP;
    
    RETURN v_processed_count;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update search_items function to handle new sources
CREATE OR REPLACE FUNCTION search_items(
    p_query text,
    p_source text DEFAULT NULL,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_include_popularity boolean DEFAULT false
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
    rank real,
    popularity_score double precision,
    trending_velocity double precision
) AS $
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
        ts_rank(i.search_vector, plainto_tsquery('english', p_query)) as rank,
        CASE WHEN p_include_popularity THEN cp.popularity_score ELSE NULL END,
        CASE WHEN p_include_popularity THEN cp.trending_velocity ELSE NULL END
    FROM items i
    LEFT JOIN content_popularity cp ON i.id = cp.item_id AND i.source = cp.source
    WHERE 
        i.search_vector @@ plainto_tsquery('english', p_query)
        AND (p_source IS NULL OR i.source = p_source)
        AND i.source IN ('hackernews', 'rss', 'newsapi')
    ORDER BY 
        ts_rank(i.search_vector, plainto_tsquery('english', p_query)) DESC,
        i.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$ LANGUAGE plpgsql STABLE;

-- Update get_trending_items function for new sources and enhanced data
CREATE OR REPLACE FUNCTION get_trending_items(
    p_window text DEFAULT '24h',
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_source text DEFAULT NULL,
    p_trend_type text DEFAULT NULL,
    p_algorithm_version text DEFAULT 'v2'
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
    velocity double precision,
    trend_type text,
    confidence_score double precision,
    popularity_score double precision
) AS $
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
        tm.velocity,
        tm.trend_type,
        tm.confidence_score,
        cp.popularity_score
    FROM items i
    INNER JOIN trending_metrics tm ON i.id = tm.item_id
    LEFT JOIN content_popularity cp ON i.id = cp.item_id AND i.source = cp.source
    WHERE 
        tm.window = p_window
        AND tm.algorithm_version = p_algorithm_version
        AND DATE(tm.created_at) = DATE(now())
        AND (p_source IS NULL OR i.source = p_source)
        AND (p_trend_type IS NULL OR tm.trend_type = p_trend_type)
        AND i.source IN ('hackernews', 'rss', 'newsapi')
    ORDER BY tm.trending_score DESC, tm.confidence_score DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$ LANGUAGE plpgsql STABLE;

-- Create new function to get content by popularity
CREATE OR REPLACE FUNCTION get_popular_content(
    p_source text DEFAULT NULL,
    p_limit int DEFAULT 50,
    p_offset int DEFAULT 0,
    p_min_score double precision DEFAULT 0
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
    popularity_score double precision,
    trending_velocity double precision,
    peak_engagement_time timestamptz
) AS $
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
        cp.popularity_score,
        cp.trending_velocity,
        cp.peak_engagement_time
    FROM items i
    INNER JOIN content_popularity cp ON i.id = cp.item_id AND i.source = cp.source
    WHERE 
        (p_source IS NULL OR i.source = p_source)
        AND cp.popularity_score >= p_min_score
        AND i.source IN ('hackernews', 'rss', 'newsapi')
    ORDER BY cp.popularity_score DESC, cp.updated_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$ LANGUAGE plpgsql STABLE;

-- Grant execute permissions on updated and new functions
GRANT EXECUTE ON FUNCTION upsert_item TO service_role;
GRANT EXECUTE ON FUNCTION calculate_trending_score TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION update_trending_metrics TO service_role;
GRANT EXECUTE ON FUNCTION search_items TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_trending_items TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_popular_content TO authenticated, anon;