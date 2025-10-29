-- Create storage buckets and policies for file management
-- This migration creates the necessary storage infrastructure for the Social Media Tracker

-- Create private previews bucket for content thumbnails and user-generated previews
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'previews',
  'previews',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
);

-- Create public assets bucket for static assets, logos, and public media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm']
);

-- Storage policies for previews bucket (private)
-- Allow authenticated users to upload their own previews
CREATE POLICY "Users can upload previews" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'previews' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their own previews
CREATE POLICY "Users can view own previews" ON storage.objects
FOR SELECT USING (
  bucket_id = 'previews' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own previews
CREATE POLICY "Users can delete own previews" ON storage.objects
FOR DELETE USING (
  bucket_id = 'previews' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role to manage all previews (for cleanup operations)
CREATE POLICY "Service role can manage all previews" ON storage.objects
FOR ALL USING (
  bucket_id = 'previews' 
  AND auth.jwt() ->> 'role' = 'service_role'
);

-- Storage policies for assets bucket (public)
-- Allow anyone to view public assets
CREATE POLICY "Anyone can view public assets" ON storage.objects
FOR SELECT USING (bucket_id = 'assets');

-- Allow authenticated users to upload public assets
CREATE POLICY "Authenticated users can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete assets they uploaded
CREATE POLICY "Users can delete own assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'assets' 
  AND auth.role() = 'authenticated'
  AND owner = auth.uid()
);

-- Allow service role to manage all assets
CREATE POLICY "Service role can manage all assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'assets' 
  AND auth.jwt() ->> 'role' = 'service_role'
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;