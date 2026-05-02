"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { CheckCircle, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/UserAuthContext";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth";
import { ShippingMethodStep } from "./shipping-method-step";
import { PaymentMethodStep } from "./payment-method-step";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema } from "@/lib/validators";
import { outlinedPanel } from "@/lib/outline";

interface CheckoutWizardProps {
    user: AuthUser | null;
    customer?: any;
    savedAddress?: any;
    deliveryConfig: {
        standard: { price: number; time: string; description: string };
        express: { price: number; time: string; description: string };
        freeThreshold: number;
    };
}

type CheckoutStep = 'email' | 'otp' | 'address' | 'shipping' | 'payment' | 'success';

// Extend address schema for form
const formSchema = addressSchema.extend({
    email: z.string().email(),
});

type FormData = z.infer<typeof formSchema>;

export default function CheckoutWizard({ user: initialUser, customer, savedAddress, deliveryConfig }: CheckoutWizardProps) {
    const formatCurrency = useFormatCurrency();
    const { items, cartTotal, clearCart } = useCart();
    const { sendOTP, verifyOTP, user: authUser } = useAuth();

    // State
    const [step, setStep] = useState<CheckoutStep>(initialUser ? 'address' : 'email');
    const [email, setEmail] = useState(initialUser?.email || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [otp, setOtp] = useState("");

    // Wizard Data State
    const [shippingAddress, setShippingAddress] = useState<FormData | null>(null);
    const [shippingMethod, setShippingMethod] = useState("standard");
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Payment Proof State
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [transactionId, setTransactionId] = useState("");

    const activeUser = authUser || (initialUser as any);
    const router = useRouter();
    const [isDataPreFilled, setIsDataPreFilled] = useState(!!customer);

    // React Hook Form
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: savedAddress?.first_name || customer?.first_name || "",
            last_name: savedAddress?.last_name || customer?.last_name || "",
            address1: savedAddress?.address1 || "",
            city: savedAddress?.city || "",
            zip: savedAddress?.zip || customer?.zip || "",
            country: "Pakistan",
            country_code: "PK",
            phone: customer?.phone || savedAddress?.phone || "",
            email: activeUser?.email || "",
        }
    });

    // Client-side pre-fill for logged-in users who didn't have customer prop from server
    useEffect(() => {
        const fetchProfile = async () => {
            if (activeUser && !customer && !isDataPreFilled) {
                const supabase = createClient();
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('user_id', activeUser.id)
                    .single();

                if (customerData) {
                    form.reset({
                        first_name: customerData.first_name || "",
                        last_name: customerData.last_name || "",
                        address1: customerData.address1 || "",
                        city: customerData.city || "",
                        zip: customerData.zip || "",
                        country: customerData.country || "Pakistan",
                        country_code: "PK",
                        phone: customerData.phone || "",
                        email: activeUser.email || "",
                    });
                    setIsDataPreFilled(true);
                }
            }
        };

        fetchProfile();
    }, [activeUser, customer, isDataPreFilled, form]);

    useEffect(() => {
        if (activeUser) {
            if (step === 'email' || step === 'otp') setStep('address');
            setEmail(activeUser.email || '');
            form.setValue("email", activeUser.email || "");
        }
    }, [activeUser]);

    // Derived Totals - Dynamic based on admin settings
    const { standard, express, freeThreshold } = deliveryConfig;

    // Calculate shipping cost based on selected method and free threshold
    const shippingCost = (() => {
        if (shippingMethod === "express") return express.price;
        // Standard shipping is free if total >= threshold
        return cartTotal >= freeThreshold ? 0 : standard.price;
    })();

    const finalTotal = cartTotal + shippingCost;

    // --- HANDLERS ---

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        const result = await sendOTP(email);
        setIsProcessing(false);
        if (result.success) {
            setStep('otp');
            toast.success("Code sent", { description: "Please check your inbox." });
        } else {
            toast.error("Error", { description: result.error });
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        const result = await verifyOTP(email, otp);
        if (result.success) {
            setStep('address');
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
            toast.error("Invalid Code", { description: "Try again." });
        }
    };

    const onAddressSubmit = (data: FormData) => {
        setShippingAddress(data);
        setStep('shipping');
    };

    const uploadPaymentProof = async (): Promise<string | null> => {
        if (!proofFile) return null;

        const formData = new FormData();
        formData.append('file', proofFile);

        const res = await fetch('/api/upload/payment-proof', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload proof");

        const data = await res.json();
        return data.url; // Assuming API returns public URL
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        try {
            // 1. Upload Proof if needed
            let proofUrl = null;
            if (paymentMethod !== 'COD') {
                if (!proofFile) {
                    toast.error("Proof Missing", { description: "Please upload payment receipt" });
                    setIsProcessing(false);
                    return;
                }
                proofUrl = await uploadPaymentProof();
            }

            // 2. Prepare Payload
            const orderItems = items.map(item => ({
                product_id: item.productId || item.id,
                variant_id: item.variantId,
                quantity: item.quantity,
                price: item.price
            }));

            const payload = {
                email: email || shippingAddress?.email,
                items: orderItems,
                shipping_address: shippingAddress,
                billing_address: shippingAddress,
                phone: shippingAddress?.phone,
                shipping_method: shippingMethod,
                payment_method: paymentMethod,
                payment_proof_url: proofUrl,
                transaction_id: transactionId,
            };

            // 3. API Call
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                clearCart();
                router.push(`/account/orders/${result.orderId}`);
            } else {
                toast.error("Order Failed", { description: result.error || "Unknown error" });
            }

        } catch (err) {
            console.error(err);
            toast.error("Error", { description: "Something went wrong processing your order." });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- RENDER ---

    if (items.length === 0) {
        return (
            <div className="pt-24 md:pt-28 pb-16 md:pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-3xl font-display mb-4">Your cart is empty</h1>
                <Button asChild variant="outline"><Link href="/shop">Continue Shopping</Link></Button>
            </div>
        );
    }

    return (
        <div className="pt-24 md:pt-28 pb-16 md:pb-20 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                {/* LEFT: WIZARD */}
                <div>
                    {/* BREADCRUMBS */}
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-400 mb-8 font-medium">
                        <span className={step === 'address' ? "text-black" : ""}>Information</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className={step === 'shipping' ? "text-black" : ""}>Shipping</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className={step === 'payment' ? "text-black" : ""}>Payment</span>
                    </div>

                    <h1 className="text-5xl font-display font-black tracking-tighter uppercase mb-8 text-brand-ascent">CHECKOUT</h1>

                    {/* 1. EMAIL */}
                    {step === 'email' && (
                        <div key="email" className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className={`p-8 ${outlinedPanel}`}>
                                <h2 className="text-xl font-display font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">CONTACT</h2>
                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Email</Label>
                                        <Input
                                            id="email" type="email" required
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white"
                                        />
                                    </div>
                                    <Button type="submit" variant="cta" size="xl" className="w-full bg-brand-ascent text-white hover:bg-black border-2 border-black rounded-none uppercase font-black tracking-widest text-sm transition-all" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : "CONTINUE"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* 2. OTP */}
                    {step === 'otp' && (
                        <div key="otp" className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className={`p-8 ${outlinedPanel}`}>
                                <h2 className="text-xl font-display font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">VERIFY</h2>
                                <p className="text-xs font-bold text-black uppercase tracking-widest mb-8">CODE SENT TO <span className="text-brand-ascent">{email}</span></p>
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <Input
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        className="text-center tracking-[0.8em] text-2xl font-black h-16 rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 bg-white"
                                        placeholder="••••••" maxLength={6}
                                    />
                                    <Button type="submit" variant="cta" size="xl" className="w-full bg-brand-ascent text-white hover:bg-black border-2 border-black rounded-none uppercase font-black tracking-widest text-sm transition-all" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : "VERIFY"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* 3. ADDRESS */}
                    {step === 'address' && (
                        <div key="address" className={`animate-in fade-in slide-in-from-right-8 duration-500 p-8 ${outlinedPanel}`}>
                            <h2 className="text-xl font-display font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">ADDRESS</h2>
                            {activeUser && (
                                <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-black bg-white p-4 border-2 border-black mb-8">
                                    <CheckCircle className="w-4 h-4 text-brand-ascent" />
                                    <span>LOGGED IN AS <span className="text-brand-ascent">{activeUser.email}</span></span>
                                </div>
                            )}
                            <form onSubmit={form.handleSubmit(onAddressSubmit)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <Label className="text-[10px] uppercase text-neutral-500">First Name</Label>
                                        <Input {...form.register("first_name")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" />
                                        {form.formState.errors.first_name && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ascent">{form.formState.errors.first_name.message}</p>}
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Last Name</Label>
                                        <Input {...form.register("last_name")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" />
                                        {form.formState.errors.last_name && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ascent">{form.formState.errors.last_name.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Address</Label>
                                    <Input {...form.register("address1")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" placeholder="STREET ADDRESS" />
                                    {form.formState.errors.address1 && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ascent">{form.formState.errors.address1.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-black">City</Label>
                                        <Input {...form.register("city")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" />
                                        {form.formState.errors.city && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ascent">{form.formState.errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Postal Code</Label>
                                        <Input {...form.register("zip")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" />
                                        {form.formState.errors.zip && <p className="text-[10px] font-bold uppercase tracking-widest text-brand-ascent">{form.formState.errors.zip.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-black">Phone</Label>
                                    <Input {...form.register("phone")} className="rounded-none border-2 border-black focus:border-brand-ascent focus:ring-0 h-12 font-bold uppercase text-xs tracking-widest bg-white" placeholder="+92..." />
                                    {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                                </div>

                                <Button type="submit" variant="cta" size="xl" className="w-full bg-brand-ascent text-white hover:bg-black border-2 border-black rounded-none uppercase font-black tracking-widest text-sm transition-all mt-6">CONTINUE TO SHIPPING</Button>
                            </form>
                        </div>
                    )}

                    {/* 4. SHIPPING */}
                    {step === 'shipping' && (
                        <div key="shipping" className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-8">
                                <div className={`p-4 text-xs space-y-2 bg-white font-bold uppercase tracking-widest ${outlinedPanel}`}>
                                    <div className="flex justify-between border-b-2 border-[#1a1a1a] pb-2">
                                        <span className="text-black">CONTACT</span>
                                        <span className="text-brand-ascent">{email || shippingAddress?.email}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-black/5 pb-2">
                                        <span className="text-neutral-500">Ship to</span>
                                        <span className="text-right truncate max-w-[200px]">{shippingAddress?.address1}, {shippingAddress?.city}</span>
                                    </div>
                                    <div className="pt-2 text-[10px] uppercase tracking-widest text-neutral-400 cursor-pointer hover:text-black underline" onClick={() => setStep('address')}>
                                        Change
                                    </div>
                                </div>

                                <ShippingMethodStep
                                    selectedMethod={shippingMethod}
                                    onSelect={setShippingMethod}
                                    deliveryConfig={deliveryConfig}
                                    cartTotal={cartTotal}
                                />

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 rounded-none border-2 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all" onClick={() => setStep('address')}>
                                        <ArrowLeft className="w-4 h-4 mr-2" /> BACK
                                    </Button>
                                    <Button variant="cta" className="flex-[2] bg-brand-ascent text-white hover:bg-black border-2 border-black rounded-none uppercase font-black tracking-widest text-sm transition-all" onClick={() => setStep('payment')}>
                                        CONTINUE TO PAYMENT
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 5. PAYMENT */}
                    {step === 'payment' && (
                        <div key="payment" className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-8">
                                <PaymentMethodStep
                                    selectedMethod={paymentMethod}
                                    onSelect={setPaymentMethod}
                                    proofFile={proofFile}
                                    setProofFile={setProofFile}
                                    transactionId={transactionId}
                                    setTransactionId={setTransactionId}
                                />

                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 rounded-none border-2 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all" onClick={() => setStep('shipping')} disabled={isProcessing}>
                                        <ArrowLeft className="w-4 h-4 mr-2" /> BACK
                                    </Button>
                                    <Button
                                        variant="cta"
                                        size="xl"
                                        className="flex-[2] bg-brand-ascent text-white hover:bg-black border-2 border-black rounded-none uppercase font-black tracking-widest text-sm transition-all"
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing || (paymentMethod !== 'COD' && !proofFile)}
                                    >
                                        {isProcessing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : `PAY ${formatCurrency(finalTotal)}`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: SUMMARY */}
                <div className={`bg-white p-8 h-fit sticky top-32 hidden lg:block ${outlinedPanel}`}>
                    <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-6 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">ORDER SUMMARY</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                                <div className="relative w-16 h-20 bg-white border-2 border-black shrink-0">
                                    {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" quality={80} sizes="64px" />}
                                    <span className="absolute -top-2 -right-2 bg-brand-ascent text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-none border-2 border-black z-10">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display font-black text-sm uppercase tracking-tighter leading-none">{item.name}</h3>
                                    <p className="text-[10px] font-bold text-brand-ascent uppercase tracking-widest mt-1">SIZE: {item.size}</p>
                                </div>
                                <p className="text-lg font-display font-black tracking-tighter">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-6 bg-black border-black border-b-2" />
                    <div className="space-y-2 text-[10px] font-bold uppercase tracking-widest">
                        <div className="flex justify-between text-black">
                            <span>SUBTOTAL</span>
                            <span className="text-brand-ascent">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-black">
                            <span>SHIPPING</span>
                            <span className={shippingCost === 0 ? "text-brand-ascent font-black" : "text-brand-ascent"}>
                                {step === 'shipping' || step === 'payment'
                                    ? (shippingCost === 0 ? "FREE" : formatCurrency(shippingCost))
                                    : "CALCULATED NEXT STEP"}
                            </span>
                        </div>
                    </div>
                    <Separator className="my-6 bg-black border-black border-b-2" />
                    <div className="flex justify-between items-center font-display font-black text-3xl tracking-tighter">
                        <span>TOTAL</span>
                        <span className="text-brand-ascent">{formatCurrency(step === 'shipping' || step === 'payment' ? finalTotal : cartTotal)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
