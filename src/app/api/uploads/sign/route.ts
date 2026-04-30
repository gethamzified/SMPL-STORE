/**
 * POST /api/uploads/sign
 * 
 * Generate a signed URL for direct-to-Supabase upload.
 * This is an advanced feature that allows the client to upload
 * directly to cloud storage, skipping the server as a proxy.
 * 
 * Flow:
 * 1. Client requests a signed URL with file metadata
 * 2. Server generates a signed upload URL from Supabase
 * 3. Client uploads directly to Supabase using the signed URL
 * 4. Client calls /api/uploads/process-remote to trigger Sharp processing
 * 
 * Note: This route is currently optional and not used by the default
 * ProductImageUploader. The default path uses /api/uploads/process
 * which proxies through the server for Sharp processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateImageFilename } from '@/lib/image-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Validate
    const maxSize = 12 * 1024 * 1024;
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const storagePath = generateImageFilename('products');

    const { data, error } = await supabase.storage
      .from('products')
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        signedUrl: data.signedUrl,
        path: storagePath,
        token: data.token,
      },
    });
  } catch (err) {
    console.error('Sign API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
