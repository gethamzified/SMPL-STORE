import { createClient } from '@/lib/supabase/server';
import { InventoryService } from '@/services/inventory';
import { createStaticClient } from '@/lib/supabase/static';
import { createAdminClient } from '@/lib/supabase/admin';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './errors';
import { Product, ProductVariant, PaginatedResponse } from '@/lib/types';
import { unstable_cache } from 'next/cache';
import { processImage, generateBlurDataURL, generateImageFilename, type ImageCategory } from '@/lib/image-processor';

type ProductInput = Partial<Product> & {
    track_quantity?: boolean;
    existing_images?: string[];
};

function normalizeProductPayload(data: ProductInput) {
    const now = new Date().toISOString();

    const price = typeof data.price === 'string' ? Number(data.price) : data.price;
    const saleRaw = data.sale_price;
    const sale_price = (saleRaw === null || saleRaw === undefined || (saleRaw as unknown) === '')
        ? null
        : typeof saleRaw === 'string'
            ? Number(saleRaw)
            : saleRaw;

    // Note: stock is now managed in inventory_levels, not on products
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];

    const coverImage = data.cover_image && images.includes(data.cover_image)
        ? data.cover_image
        : images[0] || null;

    const trackInventory = typeof data.track_inventory === 'boolean'
        ? data.track_inventory
        : (typeof data.track_quantity === 'boolean' ? data.track_quantity : true);

    return {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        short_description: data.short_description ?? null,
        price: price ?? 0,
        sale_price,
        cost_per_item: data.cost_per_item ?? null,
        cover_image: coverImage,
        images,
        sku: (data.sku && data.sku.trim() !== '') ? data.sku : null,
        barcode: (data.barcode && data.barcode.trim() !== '') ? data.barcode : null,
        // stock is now in inventory_levels, not here
        track_inventory: trackInventory,
        allow_backorder: data.allow_backorder ?? false,
        weight: data.weight ?? null,
        weight_unit: data.weight_unit ?? 'kg',
        tags,
        vendor: data.vendor ?? null,
        product_type: data.product_type ?? null,
        status: data.status ?? 'draft',
        is_featured: data.is_featured ?? false,
        seo_title: data.seo_title ?? null,
        seo_description: data.seo_description ?? null,
        metadata: data.metadata ?? {},
        lookbook_config: data.lookbook_config ?? {},
        updated_at: now,
        published_at: (data.status === 'active') ? (data.published_at ?? now) : null,
        // Variant configuration
        enable_color_variants: data.enable_color_variants ?? false,
        enable_size_variants: data.enable_size_variants ?? false,
        available_colors: data.available_colors ?? [],
        available_sizes: data.available_sizes ?? [],
    } as Partial<Product>;
}

const fetchProducts = async (options?: {
    status?: 'active' | 'draft' | 'archived';
    featured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
    orderBy?: 'created_at' | 'price' | 'title';
    order?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
}) => {
    // Normalize inputs for Consistent Cache Keys
    if (options?.sizes) {
        options.sizes.sort();
    }

    const supabase = createStaticClient();

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (options?.status) query = query.eq('status', options.status);
    if (options?.featured !== undefined) query = query.eq('is_featured', options.featured);
    if (options?.search) {
        const sanitized = options.search.replace(/[%_\\]/g, '\\$&');
        query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
    }

    // Price Filters
    if (options?.minPrice !== undefined) query = query.gte('price', options.minPrice);
    if (options?.maxPrice !== undefined) query = query.lte('price', options.maxPrice);

    // Size Filters (Array overlap)
    if (options?.sizes && options.sizes.length > 0) {
        query = query.overlaps('available_sizes', options.sizes);
    }

    const orderBy = options?.orderBy || 'created_at';
    const order = options?.order || 'desc';
    query = query.order(orderBy, { ascending: order === 'asc' });

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new AppError(error.message, 'DB_ERROR', 500);

    return {
        data: data as Product[],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil((count || 0) / limit),
    };
};

const fetchProductBySlug = async (slug: string) => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            variants:product_variants(*),
            options:product_options(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

    if (error) throw new AppError(error.message, 'DB_ERROR', 500);
    if (!data) return null;
    return data;
};

export const ProductService = {
    getProducts: unstable_cache(
        fetchProducts,
        ['products-list'],
        { tags: ['products'], revalidate: 3600 }
    ),

    async getProductBySlug(slug: string, options: { includeStock?: boolean } = { includeStock: false }): Promise<Product> {
        // 1. Fetch static product data (Cached)
        const getCachedProduct = unstable_cache(
            fetchProductBySlug,
            ['product-base-by-slug'],
            { tags: ['products'], revalidate: 3600 }
        );

        const productData = await getCachedProduct(slug);
        if (!productData) throw AppError.notFound(`Product with slug "${slug}" not found`);



        // 2. Fetch fresh inventory (Live) via Centralized Service (OPTIONAL)
        if (options.includeStock && productData.variants && productData.variants.length > 0) {
            const variantIds = productData.variants.map((v: any) => v.id);
            const inventoryMap = await InventoryService.getVariantsStock(variantIds);

            productData.variants = productData.variants.map((v: any) => ({
                ...v,
                inventory_quantity: inventoryMap[v.id] || 0
            }));
        }

        return productData as Product;
    },

    async deleteProduct(id: string): Promise<void> {
        const supabase = await createAdminClient();
        if (!id) throw AppError.badRequest('Product ID is required');

        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('images')
            .eq('id', id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw new AppError(fetchError.message, 'DB_ERROR', 500);
        }

        // Delete from database
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            if (error.code === 'PGRST116') return; // Already deleted or doesn't exist
            throw new AppError(error.message, 'DB_ERROR', 500);
        }

        // Delete all associated images from Cloudinary
        if (product?.images && Array.isArray(product.images)) {
            cloudinary.config({
                cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
                api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
            });

            for (const imageUrl of product.images) {
                if (!imageUrl) continue;
                try {
                    const url = new URL(imageUrl);
                    if (url.hostname.includes('cloudinary.com')) {
                        const parts = url.pathname.split('/');
                        const uploadIndex = parts.indexOf('upload');
                        if (uploadIndex !== -1) {
                            let idParts = parts.slice(uploadIndex + 1);
                            if (idParts[0] && /^v\d+$/.test(idParts[0])) idParts = idParts.slice(1);
                            const fullPath = idParts.join('/');
                            const lastDotIndex = fullPath.lastIndexOf('.');
                            const publicId = lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;
                            
                            await cloudinary.uploader.destroy(publicId);
                        }
                    }
                } catch (err) {
                    console.error('Failed to delete product image from Cloudinary:', err);
                }
            }
        }
    },

    async createProduct(data: Partial<Product>, imageFiles: File[]): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
            }
        }

        const existingImages = Array.isArray(data.images) ? data.images : [];
        const { urls: imageUrls, blurDataUrls } = await this.handleImageUploads(imageFiles, existingImages);

        // Merge blur placeholders into metadata.blurDataUrls
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });
        productData.created_at = new Date().toISOString();

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return newProduct as Product;
    },

    async updateProduct(id: string, data: Partial<Product>, imageFiles: File[]): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness if changing
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .neq('id', id)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Another product with slug "${data.slug}" already exists`);
            }
        }

        const existingImages = Array.isArray(data.images) ? data.images : [];
        const { urls: imageUrls, blurDataUrls } = await this.handleImageUploads(imageFiles, existingImages);

        // Merge blur placeholders into metadata.blurDataUrls
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw AppError.notFound(`Product with ID "${id}" not found`);
            }
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return updatedProduct as Product;
    },

    // Variant Management
    async createVariant(productId: string, variant: Partial<ProductVariant>): Promise<ProductVariant> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('product_variants').insert({ product_id: productId, ...variant }).select().single();
        if (error) throw new AppError(error.message, 'DB_ERROR');
        return data as ProductVariant;
    },

    async updateVariant(id: string, variant: Partial<ProductVariant>): Promise<ProductVariant> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('product_variants').update(variant).eq('id', id).select().single();
        if (error) {
            if (error.code === 'PGRST116') throw AppError.notFound(`Variant with ID "${id}" not found`);
            throw new AppError(error.message, 'DB_ERROR');
        }
        return data as ProductVariant;
    },

    async deleteVariant(id: string): Promise<void> {
        const supabase = await createAdminClient();
        const { error } = await supabase.from('product_variants').delete().eq('id', id);
        if (error) throw new AppError(error.message, 'DB_ERROR');
    },

    /**
     * Sync variants for a product
     * Deletes all existing variants and creates new ones
     */
    async syncVariants(
        productId: string,
        variants: Partial<ProductVariant>[],
        basePrice: number,
        baseSalePrice?: number | null
    ): Promise<ProductVariant[]> {
        const supabase = await createAdminClient();

        // 1. Get existing variants to determine what to update vs insert vs delete
        const { data: existingVariants, error: fetchError } = await supabase
            .from('product_variants')
            .select('id, inventory_levels(available)') // basic info needed
            .eq('product_id', productId);

        if (fetchError) {
            console.error('Error fetching existing variants:', fetchError);
            throw new AppError(fetchError.message, 'DB_ERROR');
        }

        const existingIds = new Set(existingVariants?.map(v => v.id) || []);

        // 2. Classify Input Variants
        const variantsToUpdate = variants.filter(v => v.id && existingIds.has(v.id));
        const variantsToInsert = variants.filter(v => !v.id || !existingIds.has(v.id));

        // 3. Determine Deletions (Existing - Updated)
        // IDs present in DB but NOT in the update list should be deleted
        const updateIds = new Set(variantsToUpdate.map(v => v.id));
        const idsToDelete = existingVariants?.filter(v => !updateIds.has(v.id)).map(v => v.id) || [];

        // 4. Execute Deletions
        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('product_variants')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error('Error deleting variants:', deleteError);
                throw new AppError(deleteError.message, 'DB_ERROR');
            }
        }

        // 5. Execute Updates
        const updatedVariants = [];
        for (const v of variantsToUpdate) {
            const { data: updated, error: updateError } = await supabase
                .from('product_variants')
                .update({
                    title: v.title || null,
                    color: v.color || null,
                    size: v.size || null,
                    price: basePrice, // Enforce base price or allow strict override? Following previous logic: basePrice
                    sale_price: baseSalePrice ?? null,
                    sku: (v.sku && v.sku.trim() !== '') ? v.sku : null,
                    status: v.status || 'active',
                    position: v.position,
                    image_url: v.image_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', v.id!)
                .select()
                .single();

            if (updateError) {
                console.error(`Error updating variant ${v.id}:`, updateError);
                if (updateError.code === '23505') {
                    throw AppError.badRequest(`Variant SKU "${v.sku}" already exists. Please ensure variant SKUs are unique.`);
                }
                throw new AppError(updateError.message, 'DB_ERROR');
            }
            if (updated) updatedVariants.push(updated);
        }

        // 6. Execute Inserts
        const variantsPayload = variantsToInsert.map((v, index) => ({
            product_id: productId,
            title: v.title || null,
            color: v.color || null,
            size: v.size || null,
            price: basePrice,
            sale_price: baseSalePrice ?? null,
            sku: (v.sku && v.sku.trim() !== '') ? v.sku : null,
            status: v.status || 'active',
            position: v.position ?? (existingVariants?.length || 0) + index,
            image_url: v.image_url
        }));

        let insertedVariants: ProductVariant[] = [];
        if (variantsPayload.length > 0) {
            const { data: inserted, error: insertError } = await supabase
                .from('product_variants')
                .insert(variantsPayload)
                .select();

            if (insertError) {
                console.error('Error inserting variants:', insertError);
                if (insertError.code === '23505') {
                    throw AppError.badRequest('One or more variant SKUs already exist. If you left the product SKU blank, please assign one to prevent duplicate variants.');
                }
                throw new AppError(insertError.message, 'DB_ERROR');
            }
            insertedVariants = (inserted || []) as ProductVariant[];
        }

        // 7. Handle Inventory Updates (for BOTH updated and inserted variants)
        // We need to sync the 'inventory_quantity' field from input to 'inventory_levels' table
        const allProcessedVariants = [...updatedVariants, ...insertedVariants];
        const variantsMap = new Map([...variantsToUpdate, ...variantsToInsert].map(v => [v.id || 'new', v]));

        // For inserted variants, we need to map by index since they didn't have IDs before
        // Strategy: iterate over allProcessedVariants. 
        // If it was an update, we look up by ID.
        // If it was an insert, we look up by index in variantsPayload -> variantsToInsert

        // Easier approach: Just re-iterate inputs? No, inputs don't have new IDs.

        // Let's get the default location first
        let locationId: string | null = null;
        const { data: location } = await supabase
            .from('inventory_locations')
            .select('id')
            .eq('is_default', true)
            .maybeSingle();

        if (location) {
            locationId = location.id;
        } else {
            // Fallback to any location
            const { data: anyLocation } = await supabase.from('inventory_locations').select('id').limit(1).maybeSingle();
            locationId = anyLocation?.id || null;
        }

        // Create default location if absolutely needed (and we have variants to set stock for)
        if (!locationId && allProcessedVariants.length > 0) {
            const { data: newLocation } = await supabase
                .from('inventory_locations')
                .insert({ name: 'Default Warehouse', is_default: true })
                .select('id')
                .single();
            locationId = newLocation?.id || null;
        }

        if (locationId) {
            // Prepare upsert payload for inventory
            const inventoryUpserts = [];

            // 1. For Updated Variants
            for (const v of variantsToUpdate) {
                if (v.inventory_quantity !== undefined && v.id) {
                    inventoryUpserts.push({
                        location_id: locationId,
                        variant_id: v.id,
                        available: v.inventory_quantity
                    });
                }
            }

            // 2. For Inserted Variants
            // We need to match inserted outputs back to inputs to get quantity
            // insertedVariants corresponds to variantsToInsert by index (usually, but parallel inserts might scramble? Supabase returns in order usually)
            // To be safe, we can try to match by sku/options, but let's assume index order for now as it's standard.
            // Or better: Supabase insert returns rows in order of insertion.

            if (insertedVariants.length === variantsToInsert.length) {
                for (let i = 0; i < insertedVariants.length; i++) {
                    const inputV = variantsToInsert[i];
                    const outputV = insertedVariants[i];
                    if (inputV.inventory_quantity !== undefined) {
                        inventoryUpserts.push({
                            location_id: locationId,
                            variant_id: outputV.id,
                            available: inputV.inventory_quantity
                        });
                    }
                }
            }

            if (inventoryUpserts.length > 0) {
                // Upserting inventory levels
                // We need a unique constraint on (location_id, variant_id) for upsert to work
                const { error: invError } = await supabase
                    .from('inventory_levels')
                    .upsert(inventoryUpserts, { onConflict: 'location_id,variant_id' });

                if (invError) {
                    console.error('Error updating inventory levels:', invError);
                    throw new AppError(invError.message, 'DB_ERROR');
                }
            }
        }

        return allProcessedVariants as ProductVariant[];
    },

    // Cart Validation
    // Extended to support variant-aware cart items
    // Stock is now queried from inventory_levels (single source of truth)
    async validateCartItems(items: { id: string; productId?: string; variantId?: string; quantity: number; size?: string; color?: string }[]): Promise<any> {
        const supabase = await createClient();
        if (!items || items.length === 0) return { isValid: true, items: [], errors: [] };

        // Extract unique product IDs and variant IDs
        const productIds = [...new Set(items.map(i => i.productId || i.id))];
        const variantIds = [...new Set(items.filter(i => i.variantId).map(i => i.variantId!))];

        // Fetch products with variants
        const { data: products, error } = await supabase
            .from('products')
            .select(`id, title, price, sale_price, slug, cover_image, status, variants:product_variants(id, title, price, sale_price, image_url, color, size)`)
            .in('id', productIds);

        if (error || !products) return { isValid: false, items: [], errors: ['Failed to validate items'] };

        // Fetch inventory levels for all variants AND products (for simple products)
        let inventoryMap: Record<string, number> = {};
        const { data: inventory } = await supabase
            .from('inventory_levels')
            .select('variant_id, product_id, available')
            .or(`variant_id.in.(${variantIds.length > 0 ? variantIds.join(',') : '00000000-0000-0000-0000-000000000000'}),product_id.in.(${productIds.join(',')})`);

        if (inventory) {
            // Sum available stock across all locations
            for (const inv of inventory) {
                const key = inv.variant_id || inv.product_id;
                if (key) {
                    inventoryMap[key] = (inventoryMap[key] || 0) + (inv.available || 0);
                }
            }
        }

        const validatedItems = [];
        const errors = [];
        let allValid = true;

        for (const item of items) {
            const productId = item.productId || item.id;
            const product = products.find(p => p.id === productId);
            if (!product || product.status !== 'active') {
                errors.push(`Product "${productId}" is unavailable`);
                allValid = false;
                continue;
            }

            // Find matching variant
            let variant = null;
            if (item.variantId && product.variants) {
                variant = (product.variants as any[]).find(v => v.id === item.variantId);
            }

            // Stock validation from inventory_levels
            const inventoryKey = item.variantId || productId;
            const availableStock = inventoryMap[inventoryKey] || 0;
            if (availableStock < item.quantity) {
                errors.push(`Insufficient stock for "${product.title}". Available: ${availableStock}`);
                allValid = false;
                continue;
            }

            // Calculate final price (variant price takes precedence)
            const basePrice = variant?.price ?? product.price;
            const salePrice = variant?.sale_price ?? product.sale_price;
            const finalPrice = (salePrice !== null && salePrice !== undefined && salePrice < basePrice)
                ? salePrice
                : basePrice;

            validatedItems.push({
                id: item.id,
                productId: productId,
                variantId: item.variantId,
                quantity: item.quantity,
                currentPrice: finalPrice,
                slug: product.slug,
                name: product.title,
                image: variant?.image_url || product.cover_image,
                size: item.size,
                color: item.color
            });
        }

        return { isValid: allValid, items: validatedItems, errors };
    },

    // Helper for image uploads — now with Cloudinary
    async handleImageUploads(files: File[], existingUrls: string[]): Promise<{
        urls: string[];
        blurDataUrls: Record<string, string>;
        errors: string[];
    }> {
        console.log('handleImageUploads: Starting', { fileCount: files.length, existingCount: existingUrls.length });
        const preservedUrls = Array.isArray(existingUrls) ? existingUrls.filter(Boolean) : [];
        const validFiles = files.filter(f => f && f.size > 0);
        const newUrls: string[] = [];
        const blurMap: Record<string, string> = {};
        const errors: string[] = [];

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
            api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
        });

        for (const file of validFiles) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const result = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });

                const publicUrl = result.secure_url;
                newUrls.push(publicUrl);
                blurMap[publicUrl] = publicUrl.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/');
                console.log('Upload successful:', publicUrl);
            } catch (err: any) {
                console.error('Image processing/upload error:', err);
                errors.push(`Failed to upload ${file.name}: ${err.message || 'Unknown error'}`);
            }
        }

        const allUrls = Array.from(new Set([...preservedUrls, ...newUrls]));

        return { urls: allUrls, blurDataUrls: blurMap, errors };
    },

    /**
     * Create product with pre-uploaded image URLs (background upload path).
     * Images are already processed and stored — we just save references.
     */
    async createProductWithUrls(
        data: Partial<Product>,
        imageUrls: string[],
        blurDataUrls: Record<string, string>
    ): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
            }
        }

        // Merge blur placeholders into metadata
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });
        productData.created_at = new Date().toISOString();

        const { data: newProduct, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return newProduct as Product;
    },

    /**
     * Update product with pre-uploaded image URLs (background upload path).
     * Images are already processed and stored — we just update references.
     */
    async updateProductWithUrls(
        id: string,
        data: Partial<Product>,
        imageUrls: string[],
        blurDataUrls: Record<string, string>
    ): Promise<Product> {
        const supabase = await createAdminClient();

        // Validate slug uniqueness if changing
        if (data.slug) {
            const { data: existing, error: existsError } = await supabase
                .from('products')
                .select('id')
                .eq('slug', data.slug)
                .neq('id', id)
                .maybeSingle();

            if (existsError && existsError.code !== 'PGRST116') {
                throw new AppError('Failed to validate product slug', 'DB_ERROR', 500);
            }

            if (existing) {
                throw AppError.badRequest(`Another product with slug "${data.slug}" already exists`);
            }
        }

        // Merge blur placeholders into metadata
        const existingBlurs = (data.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};
        const productData = normalizeProductPayload({
            ...data,
            images: imageUrls,
            metadata: {
                ...(data.metadata || {}),
                blurDataUrls: { ...existingBlurs, ...blurDataUrls },
            },
        });

        const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw AppError.notFound(`Product with ID "${id}" not found`);
            }
            if (error.code === '23505') {
                throw AppError.badRequest('Product with this slug or SKU already exists');
            }
            throw new AppError(error.message, 'DB_ERROR', 500);
        }
        return updatedProduct as Product;
    },
};
