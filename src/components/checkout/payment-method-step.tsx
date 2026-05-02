"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PaymentProofDropzone } from "./payment-proof-dropzone";
import { Banknote, Building2, Smartphone, CreditCard } from "lucide-react";
import { outlinedPanel } from "@/lib/outline";

interface PaymentMethodStepProps {
    selectedMethod: string;
    onSelect: (method: string) => void;
    // Payment Proof State
    proofFile: File | null;
    setProofFile: (file: File | null) => void;
    transactionId: string;
    setTransactionId: (id: string) => void;
}

export function PaymentMethodStep({
    selectedMethod,
    onSelect,
    proofFile,
    setProofFile,
    transactionId,
    setTransactionId
}: PaymentMethodStepProps) {

    const renderPaymentDetails = (method: string) => {
        if (method === 'COD') return null;

        let details = {
            title: "",
            fields: [] as { label: string, value: string }[]
        };

        switch (method) {
            case 'bank_transfer':
                details = {
                    title: "Bank Account Details",
                    fields: [
                        { label: "Bank Name", value: "Meezan Bank" }, // Placeholder
                        { label: "Account Title", value: "SMPL Official" }, // Placeholder
                        { label: "IBAN", value: "PK00 MEZN 0000 0000 0000 0000" } // Placeholder
                    ]
                };
                break;
            case 'easypaisa':
                details = {
                    title: "Easypaisa Details",
                    fields: [
                        { label: "Account Title", value: "SMPL Official" },
                        { label: "Account Number", value: "0300 1234567" }
                    ]
                };
                break;
            case 'jazzcash':
                details = {
                    title: "JazzCash Details",
                    fields: [
                        { label: "Account Title", value: "SMPL Official" },
                        { label: "Account Number", value: "0300 1234567" }
                    ]
                };
                break;
        }

        return (
            <div className="mt-6 border-t border-[#1a1a1a] pt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className={cn("mb-6 space-y-3 p-5", outlinedPanel)}>
                    <h4 className="text-sm font-black uppercase tracking-tighter text-black mb-2">{details.title}</h4>
                    {details.fields.map((field, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                            <span className="text-black font-bold tracking-widest text-[10px]">{field.label}:</span>
                            <span className="font-mono font-black select-all text-brand-ascent text-xs">{field.value}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest text-black">Transaction ID / Reference No.</Label>
                        <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 8234XXXXXXX"
                            className="rounded-none border-2 border-black focus:border-red-600 focus:ring-0 h-12 text-sm tracking-widest font-mono bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest text-black">
                            Upload Payment Screenshot <span className="text-brand-ascent">*</span>
                        </Label>
                        <PaymentProofDropzone
                            selectedFile={proofFile}
                            onFileSelect={setProofFile}
                            onRemove={() => setProofFile(null)}
                            error={!proofFile ? "Proof is required" : undefined}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-display font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">
                PAYMENT METHOD
            </h2>

            <RadioGroup value={selectedMethod} onValueChange={onSelect} className="space-y-4">

                {/* COD */}
                <div className={cn(
                    "relative p-6 transition-all",
                    outlinedPanel,
                    selectedMethod === "COD" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="COD" id="pay-cod" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-cod" className="flex-1 ml-4 cursor-pointer">
                            <div className="flex items-center gap-3 mb-1">
                                <Banknote className={cn("w-4 h-4", selectedMethod === "COD" ? "text-brand-ascent" : "text-black")} />
                                <span className="font-black text-sm uppercase tracking-widest text-black">CASH ON DELIVERY</span>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-7">
                                Pay in cash when your order arrives.
                            </p>
                        </Label>
                    </div>
                </div>

                {/* BANK TRANSFER */}
                <div className={cn(
                    "relative p-6 transition-all",
                    outlinedPanel,
                    selectedMethod === "bank_transfer" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="bank_transfer" id="pay-bank" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-bank" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Building2 className={cn("w-4 h-4", selectedMethod === "bank_transfer" ? "text-brand-ascent" : "text-black")} />
                                <span className="font-black text-sm uppercase tracking-widest text-black">BANK TRANSFER</span>
                            </div>
                            <p className="text-[10px] font-bold text-neutral-500 leading-relaxed uppercase tracking-widest pl-7">
                                Direct transfer to our bank account.
                            </p>
                        </Label>
                    </div>
                    {selectedMethod === "bank_transfer" && renderPaymentDetails("bank_transfer")}
                </div>

                {/* EASYPAISA */}
                <div className={cn(
                    "relative p-6 transition-all",
                    outlinedPanel,
                    selectedMethod === "easypaisa" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="easypaisa" id="pay-easy" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-easy" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Smartphone className="w-4 h-4 text-green-600" />
                                <span className="font-black text-sm uppercase tracking-widest text-black">EASYPAISA</span>
                            </div>
                        </Label>
                    </div>
                    {selectedMethod === "easypaisa" && renderPaymentDetails("easypaisa")}
                </div>

                {/* JAZZCASH */}
                <div className={cn(
                    "relative p-6 transition-all",
                    outlinedPanel,
                    selectedMethod === "jazzcash" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="jazzcash" id="pay-jazz" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-jazz" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Smartphone className="w-4 h-4 text-brand-ascent" />
                                <span className="font-black text-sm uppercase tracking-widest text-black">JAZZCASH</span>
                            </div>
                        </Label>
                    </div>
                    {selectedMethod === "jazzcash" && renderPaymentDetails("jazzcash")}
                </div>

            </RadioGroup>
        </div>
    );
}
