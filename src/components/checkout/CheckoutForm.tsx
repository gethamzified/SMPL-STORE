"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createOrderAction } from "@/actions/order";
import { checkVariantStock } from "@/actions/stock";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useFormatCurrency } from "@/context/StoreConfigContext";

interface CheckoutFormProps {
    user: User | null;
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
    const formatCurrency = useFormatCurrency();
    const { items, cartTotal, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        // Construct order items
        const orderItems = items.map(item => ({
            product_id: item.productId || item.id, // Fallback for old items
            variant_id: item.variantId,
            quantity: item.quantity,
            price: item.price
        }));

        // Pre-validate Stock
        try {
            const validationItems = orderItems.map(item => ({
                id: item.product_id, // Use product ID or unique item ref
                variantId: item.variant_id,
                quantity: item.quantity
            }));

            // Check all items at once
            const { isValid, errors } = await import("@/actions/stock").then(mod => mod.validateCart(validationItems));

            if (!isValid) {
                const firstError = errors[0];
                toast.error("Stock Issue", {
                    description: `Item ${firstError.itemId} issue: ${firstError.message}. Available: ${firstError.available}`
                });
                setIsProcessing(false);
                return;
            }
        } catch (e) {
            console.error("Stock pre-validation failed", e);
            toast.error("System Error", {
                description: "Failed to validate stock. Please try again."
            });
            setIsProcessing(false);
            return;
        }

        try {
            const payload = {
                email,
                items: orderItems,
                shipping_address: {
                    first_name: formData.get("firstName") as string,
                    last_name: formData.get("lastName") as string,
                    address1: formData.get("address") as string,
                    city: formData.get("city") as string,
                    zip: formData.get("postalCode") as string,
                    country: "Pakistan"
                },
                billing_address: {
                    first_name: formData.get("firstName") as string,
                    last_name: formData.get("lastName") as string,
                    address1: formData.get("address") as string,
                    city: formData.get("city") as string,
                    zip: formData.get("postalCode") as string,
                    country: "Pakistan"
                },
                payment_status: "paid", // Simulation
                fulfillment_status: "unfulfilled",
                total: cartTotal
            };

            const result = await createOrderAction(payload as any);

            if (result.success) {
                clearCart();
                toast.success("Order placed successfully!", {
                    description: `Order #${result.orderId} created.`,
                });
                // Redirect to Account order detail if logged in, else Home
                if (user) {
                    router.push(`/account/orders/${result.orderId}`);
                } else {
                    router.push("/");
                }
            } else {
                toast.error("Order failed", {
                    description: result.error
                });
            }
        } catch (err) {
            toast.error("Error", {
                description: "Something went wrong."
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-display mb-4">Your cart is empty</h1>
                <Button asChild>
                    <Link href="/collection">Continue Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
            <h1 className="text-4xl font-display mb-12">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Checkout Form */}
                <div>
                    <form onSubmit={handleCheckout} className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium uppercase tracking-wide">Contact Information</h2>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    defaultValue={user?.email || ''}
                                    readOnly={!!user?.email}
                                    className={user?.email ? "bg-neutral-800/50 text-white/60 cursor-not-allowed" : ""}
                                />
                                {user && <p className="text-xs text-green-500">Logged in as {user.email}</p>}
                            </div>
                        </div>

                        <Separator />

                        {/* Shipping Address */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium uppercase tracking-wide">Shipping Address</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input id="firstName" name="firstName" required />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" name="lastName" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" placeholder="123 Main St" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal code</Label>
                                    <Input id="postalCode" name="postalCode" required />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment Method */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium uppercase tracking-wide">Payment</h2>
                            <RadioGroup defaultValue="card">
                                <div className="flex items-center space-x-2 border p-4 rounded-md">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label htmlFor="card">Credit Card</Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-4 rounded-md">
                                    <RadioGroupItem value="paypal" id="paypal" />
                                    <Label htmlFor="paypal">PayPal</Label>
                                </div>
                            </RadioGroup>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card number</Label>
                                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry date</Label>
                                        <Input id="expiry" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={isProcessing}>
                            {isProcessing ? "Processing..." : `Pay ${formatCurrency(cartTotal)}`}
                        </Button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="bg-secondary/20 p-8 rounded-lg h-fit">
                    <h2 className="text-xl font-medium uppercase tracking-wide mb-6">Order Summary</h2>
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4">
                                <div className="relative w-16 h-20 bg-secondary/30 flex-shrink-0 overflow-hidden rounded-md">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-200" />
                                    )}
                                    <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs w-5 h-5 flex items-center justify-center rounded-bl-md">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-sm">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                                </div>
                                <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>Free</span>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-between items-center">
                        <span className="font-body font-black uppercase tracking-widest">Total</span>
                        <span className="font-body font-black text-2xl">{formatCurrency(cartTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
