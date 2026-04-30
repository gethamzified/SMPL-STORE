/**
 * DELETE /api/uploads/cleanup
 * 
 * Removes an uploaded image from Cloudinary.
 * Called when:
 * - Admin removes an image before saving product
 * - Admin cancels product creation (cleanup orphaned uploads)
 * - Admin replaces an image
 * 
 * Accepts JSON body: { url: string } or { urls: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = [];

    if (body.url && typeof body.url === 'string') {
      urls.push(body.url);
    }
    if (Array.isArray(body.urls)) {
      urls.push(...body.urls.filter((u: unknown): u is string => typeof u === 'string'));
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided' },
        { status: 400 }
      );
    }

    const results: { url: string; deleted: boolean; error?: string }[] = [];

    for (const url of urls) {
      try {
        const publicId = extractPublicId(url);
        if (!publicId) {
          results.push({ url, deleted: false, error: 'Invalid URL format' });
          continue;
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok' && result.result !== 'not found') {
          console.error(`Failed to delete ${publicId}:`, result);
          results.push({ url, deleted: false, error: result.result });
        } else {
          results.push({ url, deleted: true });
        }
      } catch (err: any) {
        console.error(`Error deleting ${url}:`, err);
        results.push({ url, deleted: false, error: err.message || 'Unexpected error' });
      }
    }

    const allDeleted = results.every(r => r.deleted);

    return NextResponse.json(
      {
        message: allDeleted ? 'All images deleted' : 'Some deletions failed',
        results,
      },
      { status: allDeleted ? 200 : 207 }
    );

  } catch (err) {
    console.error('Cleanup API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractPublicId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.includes('cloudinary.com')) return null;

        const parts = urlObj.pathname.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        let idParts = parts.slice(uploadIndex + 1);
        if (idParts[0] && /^v\d+$/.test(idParts[0])) {
            idParts = idParts.slice(1);
        }
        
        const fullPath = idParts.join('/');
        const lastDotIndex = fullPath.lastIndexOf('.');
        return lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
    } catch {
        return null;
    }
}
