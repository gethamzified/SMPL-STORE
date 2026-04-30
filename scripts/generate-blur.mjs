#!/usr/bin/env node
/**
 * Backfill script: Generate blurDataURLs for all existing products & collections.
 *
 * Reads all products and collections from Supabase, fetches each image,
 * generates a tiny LQIP blur placeholder via Sharp, and saves the result
 * back into the row's `metadata.blurDataUrls` JSONB field.
 *
 * Usage:
 *   node scripts/generate-blur.mjs
 *
 * Environment variables (reads from .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL   – Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  – Service-role key (bypasses RLS)
 *
 * Options:
 *   --dry-run     Print what would be updated without writing to DB
 *   --force       Regenerate blur even for images that already have one
 *   --products    Only process products
 *   --collections Only process collections
 *   --concurrency N  Number of parallel image fetches (default 5)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Load .env.local manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.warn('⚠️  Could not read .env.local — relying on existing environment variables');
}

// ─── Configuration ───────────────────────────────────────────────────────────
const BLUR_WIDTH = 20;
const BLUR_QUALITY = 40;
const DEFAULT_CONCURRENCY = 5;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const ONLY_PRODUCTS = args.includes('--products');
const ONLY_COLLECTIONS = args.includes('--collections');
const concurrencyIdx = args.indexOf('--concurrency');
const CONCURRENCY = concurrencyIdx !== -1 ? parseInt(args[concurrencyIdx + 1], 10) : DEFAULT_CONCURRENCY;

// ─── Supabase Client ─────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure .env.local is present with these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Blur Generator ─────────────────────────────────────────────────────────
async function generateBlur(imageUrl) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${imageUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const blurBuffer = await sharp(buffer)
    .resize(BLUR_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
    .blur(2)
    .jpeg({ quality: BLUR_QUALITY })
    .toBuffer();

  return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
}

// ─── Batch processor with concurrency ────────────────────────────────────────
async function processBatch(items, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ─── Products ────────────────────────────────────────────────────────────────
async function backfillProducts() {
  console.log('\n📦 Fetching products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, cover_image, images, metadata')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch products:', error.message);
    return { processed: 0, skipped: 0, failed: 0 };
  }

  console.log(`   Found ${products.length} products`);

  let processed = 0, skipped = 0, failed = 0;

  for (const product of products) {
    const allImages = [
      product.cover_image,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    const uniqueImages = [...new Set(allImages)];
    if (uniqueImages.length === 0) {
      skipped++;
      continue;
    }

    const existingBlurs = product.metadata?.blurDataUrls || {};

    // Determine which images need blur
    const imagesToProcess = FORCE
      ? uniqueImages
      : uniqueImages.filter(url => !existingBlurs[url]);

    if (imagesToProcess.length === 0) {
      skipped++;
      continue;
    }

    console.log(`   🔄 ${product.title || product.id}: ${imagesToProcess.length} image(s) to process`);

    const newBlurs = { ...existingBlurs };
    let productFailed = false;

    const results = await processBatch(imagesToProcess, async (url) => {
      const blur = await generateBlur(url);
      return { url, blur };
    });

    for (const result of results) {
      if (result.status === 'fulfilled') {
        newBlurs[result.value.url] = result.value.blur;
      } else {
        console.error(`      ⚠️  Failed: ${result.reason?.message || result.reason}`);
        productFailed = true;
        failed++;
      }
    }

    if (DRY_RUN) {
      console.log(`      [DRY RUN] Would update metadata.blurDataUrls with ${Object.keys(newBlurs).length} entries`);
      processed++;
      continue;
    }

    // Merge into existing metadata
    const updatedMetadata = {
      ...(product.metadata || {}),
      blurDataUrls: newBlurs,
    };

    const { error: updateError } = await supabase
      .from('products')
      .update({ metadata: updatedMetadata })
      .eq('id', product.id);

    if (updateError) {
      console.error(`      ❌ DB update failed: ${updateError.message}`);
      failed++;
    } else {
      processed++;
      if (!productFailed) {
        console.log(`      ✅ Updated with ${Object.keys(newBlurs).length} blur(s)`);
      }
    }
  }

  return { processed, skipped, failed };
}

// ─── Collections ─────────────────────────────────────────────────────────────
async function backfillCollections() {
  console.log('\n🗂️  Fetching collections...');
  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, title, image_url, metadata')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch collections:', error.message);
    return { processed: 0, skipped: 0, failed: 0 };
  }

  console.log(`   Found ${collections.length} collections`);

  let processed = 0, skipped = 0, failed = 0;

  for (const collection of collections) {
    if (!collection.image_url) {
      skipped++;
      continue;
    }

    const existingBlurs = collection.metadata?.blurDataUrls || {};

    if (!FORCE && existingBlurs[collection.image_url]) {
      skipped++;
      continue;
    }

    console.log(`   🔄 ${collection.title || collection.id}`);

    try {
      const blur = await generateBlur(collection.image_url);

      if (DRY_RUN) {
        console.log(`      [DRY RUN] Would set blur for ${collection.image_url}`);
        processed++;
        continue;
      }

      const updatedMetadata = {
        ...(collection.metadata || {}),
        blurDataUrls: {
          ...existingBlurs,
          [collection.image_url]: blur,
        },
      };

      const { error: updateError } = await supabase
        .from('collections')
        .update({ metadata: updatedMetadata })
        .eq('id', collection.id);

      if (updateError) {
        console.error(`      ❌ DB update failed: ${updateError.message}`);
        failed++;
      } else {
        processed++;
        console.log(`      ✅ Updated`);
      }
    } catch (err) {
      console.error(`      ⚠️  Failed: ${err.message}`);
      failed++;
    }
  }

  return { processed, skipped, failed };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🖼️  SMPL Blur Placeholder Backfill');
  console.log('━'.repeat(50));
  if (DRY_RUN) console.log('🔍 DRY RUN MODE — no database writes');
  if (FORCE) console.log('⚡ FORCE MODE — regenerating all blurs');
  console.log(`   Concurrency: ${CONCURRENCY}`);

  const stats = { products: null, collections: null };

  if (!ONLY_COLLECTIONS) {
    stats.products = await backfillProducts();
  }

  if (!ONLY_PRODUCTS) {
    stats.collections = await backfillCollections();
  }

  console.log('\n━'.repeat(50));
  console.log('📊 Summary:');
  if (stats.products) {
    console.log(`   Products:    ${stats.products.processed} updated, ${stats.products.skipped} skipped, ${stats.products.failed} failed`);
  }
  if (stats.collections) {
    console.log(`   Collections: ${stats.collections.processed} updated, ${stats.collections.skipped} skipped, ${stats.collections.failed} failed`);
  }
  console.log('━'.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
