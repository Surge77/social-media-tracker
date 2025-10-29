import { NextRequest, NextResponse } from 'next/server';
import { uploadFileServer, STORAGE_BUCKETS } from '@/lib/supabase/storage';

/**
 * POST /api/files/upload
 * Simple file upload endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || STORAGE_BUCKETS.ASSETS;
    const path = formData.get('path') as string || file.name;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload file
    const result = await uploadFileServer(file, bucket, path);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}