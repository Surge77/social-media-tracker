import { supabase } from './client';
import { createSupabaseServerClient } from './server';

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  PREVIEWS: 'previews',
  ASSETS: 'assets',
} as const;

/**
 * Basic file upload function
 */
export async function uploadFile(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}

/**
 * Server-side file upload
 */
export async function uploadFileServer(file: File, bucket: string, path: string) {
  const serverClient = createSupabaseServerClient();

  const { data, error } = await serverClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}

/**
 * Get public URL for assets
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Generate signed URL for private files
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}