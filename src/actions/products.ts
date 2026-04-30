'use server';

import { ProductService } from '@/services/products';
import { Product } from '@/lib/types';

export async function getFreshProduct(slug: string): Promise<Product | null> {
    try {
        return await ProductService.getProductBySlug(slug);
    } catch (error) {
        console.error('Error fetching fresh product:', error);
        return null;
    }
}
