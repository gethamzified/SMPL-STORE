# Implementation Plan - Critical Fixes

## 1. Zero-Transaction Order Creation (Ghost Orders)

**Goal:** Ensure Order, Customer, and Order Items are saved atomically, and Stock is decremented correctly without race conditions.

### Database Changes
Create a Supabase RPC function `create_order` that handles:
1.  **Stock Validation:** Checks if `products.stock` or `product_variants.inventory_quantity` >= requested quantity. Aborts if not.
2.  **Stock Update:** Decrements values atomically.
3.  **Customer Upsert:** Updates or creates the customer record from the user ID/Email.
4.  **Order Insertion:** Creates the main order record.
5.  **Items Insertion:** Inserts all order items linked to the order.

### Code Changes (`src/services/orders.ts`)
- Refactor `createOrder` to prepare the data payload.
- Call `supabase.rpc('create_order', { payload })`.
- Remove manual "rollback" logic.

## 2. Hanging Checkout (Blocking Emails)

**Goal:** Prevent email sending from delaying the checkout success response.

### Code Changes (`src/services/orders.ts`)
- Remove `await` from `EmailService.sendOrderConfirmation`.
- Wrap in a `try/catch` block that logs errors but does **not** throw strings up the stack.
- *Note:* In a Vercel/Serverless environment, simply removing `await` can be risky (process might freeze). For now, strict fire-and-forget is the requested step ("Asynchronous").

## 3. Type Safety (The "any" issue)

**Goal:** Remove strict `any` usage in `orders.ts` to reveal hidden bugs.

### Code Changes
- Define `CreateOrderParams` interface mapping to the RPC payload.
- update `OrderService` to use these types.

---

## Verification
- **Manual Test:** Create an order. Verify Order, Items, and Customer exist in DB. Verify Stock is -1.
- **Performance:** Checkout should return immediately, not waiting for email.
