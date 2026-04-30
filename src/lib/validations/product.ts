import { z } from "zod";

export const productSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").max(100),
    slug: z.string().min(1, "URL Handle is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    description: z.string().optional(),
    short_description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    sale_price: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : val,
        z.coerce.number().min(0, "Sale price must be positive").optional()
    ),
    cost_per_item: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : val,
        z.coerce.number().min(0).optional()
    ),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    // stock is now managed per-variant in inventory_levels
    track_inventory: z.boolean().default(true),
    allow_backorder: z.boolean().default(false),
    weight: z.preprocess(
        (val) => (val === "" || val === null || val === undefined) ? undefined : val,
        z.coerce.number().min(0).optional()
    ),
    weight_unit: z.string().optional().default("kg"),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    category_id: z.string().optional().nullable(),
    product_type: z.string().optional(),
    vendor: z.string().optional(),
    tags: z.string().optional(),
    is_featured: z.boolean().default(false),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
