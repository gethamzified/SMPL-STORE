import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * On-demand revalidation endpoint.
 * 
 * Call this from the admin panel after product/collection/config updates
 * to immediately purge the ISR cache for affected pages.
 * 
 * Usage:
 *   POST /api/revalidate
 *   Body: { "secret": "...", "path": "/product/knit-sweater" }
 *   Body: { "secret": "...", "tag": "products" }
 *   Body: { "secret": "...", "paths": ["/", "/shop", "/collection/summer"] }
 * 
 * Set REVALIDATE_SECRET in your .env file.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { secret, path, paths, tag } = body;

    // Validate secret token
    const expectedSecret = process.env.REVALIDATE_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, message: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];

    // Revalidate a single path
    if (path) {
      revalidatePath(path);
      revalidated.push(`path:${path}`);
    }

    // Revalidate multiple paths
    if (paths && Array.isArray(paths)) {
      for (const p of paths) {
        revalidatePath(p);
        revalidated.push(`path:${p}`);
      }
    }

    // Revalidate by cache tag
    if (tag) {
      revalidateTag(tag, 'max');
      revalidated.push(`tag:${tag}`);
    }

    return NextResponse.json({
      revalidated: true,
      items: revalidated,
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, error: String(err) },
      { status: 500 }
    );
  }
}
