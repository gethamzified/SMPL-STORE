import { z } from 'zod';

export const addressSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    address1: z.string().min(5, 'Address is too short'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().optional(),
    province_code: z.string().optional(),
    zip: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    country_code: z.string().min(2, 'Country code is required').max(3),
    phone: z.string().optional(),
});

export const orderItemSchema = z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().optional().nullable().transform(val => val === null ? undefined : val),
    quantity: z.number().int().positive().min(1),
});

export const createOrderSchema = z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().nullable().transform(val => val === null ? undefined : val),
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
    shipping_address: addressSchema,
    billing_address: addressSchema.optional(),
    shipping_method: z.enum(['standard', 'express']).default('standard'),
    customer_note: z.string().optional().nullable(),
    payment_method: z.enum(['card', 'COD', 'bank_transfer', 'easypaisa', 'jazzcash']).default('card'),
    payment_proof_url: z.string().optional().nullable(),
    transaction_id: z.string().optional().nullable(),
    payment_proof: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const sendOtpSchema = z.object({
    email: z.string().email(),
});

export const verifyOtpSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, 'OTP must be 6 digits'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
