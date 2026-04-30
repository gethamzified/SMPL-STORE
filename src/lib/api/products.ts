'use server'

import { ProductService } from '@/services/products';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Product, ProductVariant, ApiResponse, PaginatedResponse } from '@/lib/types';
import { AppError } from '@/services/errors';

// Helper to handle Service errors in Actions
function handleActionError(error: unknown): ApiResponse<any> {
  console.error('Action Error:', error);
  if (error instanceof AppError) {
    return { error: error.message };
  }
  return { error: 'An unexpected error occurred' };
}

// ==========================================
// PRODUCTS
// ==========================================

import { productSchema } from '@/lib/validations/product';

type ProductPayload = Partial<Product>;

function parseBooleanField(value: FormDataEntryValue | null): boolean | undefined {
  if (value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['true', 'on', '1'].includes(normalized)) return true;
    if (['false', 'off', '0'].includes(normalized)) return false;
  }
  return undefined;
}

function parseTagsCsv(tags: string | undefined) {
  if (!tags) return [] as string[];
  return tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

function extractImageFiles(formData: FormData): File[] {
  return formData
    .getAll('imageFiles')
    .filter((entry): entry is File => entry instanceof File);
}

function parseExistingImages(formData: FormData): string[] {
  const existing = formData.get('existing_images');
  if (!existing || typeof existing !== 'string') return [];
  try {
    const parsed = JSON.parse(existing);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
  } catch {
    return [];
  }
}

function parseJsonArray(formData: FormData, key: string): string[] {
  const value = formData.get(key);
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseVariants(formData: FormData): ProductVariant[] {
  const value = formData.get('variants');
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildProductPayload(formData: FormData): { data?: ProductPayload; error?: string } {
  const entries = Array.from(formData.entries()).filter(([, value]) => typeof value === 'string') as Array<[string, string]>;
  const rawData = Object.fromEntries(entries);

  delete rawData.imageFiles;
  delete rawData.existing_images;
  delete rawData.id;

  const status = rawData.status || 'draft';
  const categoryRaw = rawData.category_id;
  const category_id = !categoryRaw || categoryRaw === 'none' ? null : categoryRaw;

  // Ensure booleans are correctly parsed from FormData strings
  const isFeatured = parseBooleanField(formData.get('is_featured')) ?? false;
  const trackInventory = parseBooleanField(formData.get('track_inventory'));
  const allowBackorder = parseBooleanField(formData.get('allow_backorder'));

  const schemaInput: Record<string, unknown> = {
    ...rawData,
    status,
    category_id,
    is_featured: isFeatured,
  };

  if (typeof trackInventory === 'boolean') {
    schemaInput.track_inventory = trackInventory;
  }
  if (typeof allowBackorder === 'boolean') {
    schemaInput.allow_backorder = allowBackorder;
  }

  const validatedFields = productSchema.safeParse(schemaInput);

  if (!validatedFields.success) {
    console.error('Product validation failed:', validatedFields.error.flatten());
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const messages = Object.values(fieldErrors).flat().filter(Boolean);
    return { error: messages.join(', ') || 'Invalid inputs' };
  }

  const { tags: tagsCsv, sale_price, ...rest } = validatedFields.data;
  const payload: ProductPayload = {
    ...rest,
    sale_price: sale_price ?? null,
    tags: parseTagsCsv(tagsCsv),
  };

  // Add variant configuration if present
  const enableColorVariants = parseBooleanField(formData.get('enable_color_variants'));
  const enableSizeVariants = parseBooleanField(formData.get('enable_size_variants'));
  const availableColors = parseJsonArray(formData, 'available_colors');
  const availableSizes = parseJsonArray(formData, 'available_sizes');

  if (typeof enableColorVariants === 'boolean') {
    payload.enable_color_variants = enableColorVariants;
  }
  if (typeof enableSizeVariants === 'boolean') {
    payload.enable_size_variants = enableSizeVariants;
  }
  if (availableColors.length > 0) {
    payload.available_colors = availableColors;
  }
  if (availableSizes.length > 0) {
    payload.available_sizes = availableSizes;
  }

  return { data: payload };
}

function parseBlurDataUrls(formData: FormData): Record<string, string> {
  const value = formData.get('blur_data_urls');
  if (!value || typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function parseImageUrls(formData: FormData): string[] {
  const value = formData.get('image_urls');
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0) : [];
  } catch {
    return [];
  }
}

export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const { data: productData, error } = buildProductPayload(formData);
    if (!productData) {
      return { error: error || 'Invalid product data' };
    }

    const variants = parseVariants(formData);

    // New path: images already uploaded via background API, URLs passed directly
    const preUploadedUrls = parseImageUrls(formData);
    const blurDataUrls = parseBlurDataUrls(formData);

    // Legacy path: raw file uploads (fallback for backward compatibility)
    const imageFiles = extractImageFiles(formData);

    let product;
    if (preUploadedUrls.length > 0 || imageFiles.length === 0) {
      // Pre-uploaded path: images are already in storage
      product = await ProductService.createProductWithUrls(
        productData,
        preUploadedUrls,
        blurDataUrls
      );
    } else {
      // Legacy path: upload files server-side
      product = await ProductService.createProduct(productData, imageFiles);
    }

    // Sync variants to database
    if (variants.length > 0) {
      await ProductService.syncVariants(product.id, variants, product.price, product.sale_price);
    }

    revalidatePath('/admin/products');
    revalidatePath('/collection');
    revalidatePath('/shop');
    revalidatePath('/');
    (revalidateTag as any)('products');
    (revalidateTag as any)('collections');

    return { data: product };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateProduct(formData: FormData): Promise<ApiResponse<Product>> {
  try {
    const id = formData.get('id') as string;
    if (!id) return { error: 'Product ID is required' };

    const { data: productData, error } = buildProductPayload(formData);
    if (!productData) {
      return { error: error || 'Invalid product data' };
    }

    const variants = parseVariants(formData);

    // New path: pre-uploaded URLs
    const preUploadedUrls = parseImageUrls(formData);
    const blurDataUrls = parseBlurDataUrls(formData);

    // Legacy path
    const existingImages = parseExistingImages(formData);
    const imageFiles = extractImageFiles(formData);

    let product;
    if (preUploadedUrls.length > 0 || imageFiles.length === 0) {
      // Pre-uploaded path: all image URLs are already resolved
      product = await ProductService.updateProductWithUrls(
        id,
        productData,
        preUploadedUrls,
        blurDataUrls
      );
    } else {
      // Legacy path
      product = await ProductService.updateProduct(id, { ...productData, images: existingImages }, imageFiles);
    }

    // Sync variants to database
    await ProductService.syncVariants(id, variants, product.price, product.sale_price);

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(`/product/${productData.slug}`);
    revalidatePath('/collection');
    revalidatePath('/shop');
    revalidatePath('/');
    (revalidateTag as any)('products');
    (revalidateTag as any)('collections');

    return { data: product };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  try {
    await ProductService.deleteProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/collection');
    (revalidateTag as any)('products');
    (revalidateTag as any)('collections');
    return { message: 'Product deleted successfully' };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProducts(options?: any): Promise<ApiResponse<PaginatedResponse<Product>>> {
  try {
    const result = await ProductService.getProducts(options);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  try {
    const product = await ProductService.getProductBySlug(slug, { includeStock: true });
    return { data: product };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// VARIANTS
// ==========================================

export async function createVariant(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const result = await ProductService.createVariant(id, variant);
    revalidatePath(`/admin/products/${id}`);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateVariant(id: string, variant: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> {
  try {
    const result = await ProductService.updateVariant(id, variant);
    return { data: result };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteVariant(id: string): Promise<ApiResponse<null>> {
  try {
    await ProductService.deleteVariant(id);
    return { message: 'Variant deleted' };
  } catch (error) {
    return handleActionError(error);
  }
}

// ==========================================
// CART
// ==========================================

export async function validateCartItems(items: any[]): Promise<any> {
  try {
    return await ProductService.validateCartItems(items);
  } catch (error) {
    return { isValid: false, items: [], errors: ['Validation failed'] };
  }
}
