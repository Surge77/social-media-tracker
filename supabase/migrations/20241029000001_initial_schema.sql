-- Initial database schema for Social Media Tracker
-- This migration creates the core tables for content aggregation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create items table for storing social media content
CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(20) NOT NULL CHECK (source IN ('reddit', 'hackernews', 'twitter')),
    external_id VARCHAR(255),
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    author VARCHAR(255),
    score INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    raw_data JSONB,
    search_vector tsvector
);

-- Create indexes for performance optimization
CREATE INDEX idx_items_source ON items(source);
CREATE INDEX idx_items_published_at ON items(published_at DESC);
CREATE INDEX idx_items_score ON items(score DESC);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_search_vector ON items USING gin(search_vector);
CREATE INDEX idx_items_external_id ON items(source, external_id);

-- Create trigger to automatically update search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.excerpt, '') || ' ' || 
        COALESCE(NEW.author, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_search_vector_update
    BEFORE INSERT OR UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create users table for authentication
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookmarks table for user-item relationships
CREATE TABLE bookmarks (
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, item_id)
);

-- Create indexes for bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_item_id ON bookmarks(item_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Create trending_metrics table for popularity analysis
CREATE TABLE trending_metrics (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    time_window TEXT NOT NULL CHECK (time_window IN ('1h', '6h', '24h', '7d')),
    trending_score DOUBLE PRECISION NOT NULL,
    velocity DOUBLE PRECISION,
    peak_time TIMESTAMPTZ,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for trending_metrics
CREATE INDEX idx_trending_metrics_item_id ON trending_metrics(item_id);
CREATE INDEX idx_trending_metrics_time_window ON trending_metrics(time_window);
CREATE INDEX idx_trending_metrics_score ON trending_metrics(trending_score DESC);
CREATE INDEX idx_trending_metrics_created_at ON trending_metrics(created_at DESC);
CREATE INDEX idx_trending_metrics_window_score ON trending_metrics(time_window, trending_score DESC);
