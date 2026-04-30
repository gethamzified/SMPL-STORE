"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PaymentProofDropzone } from "./payment-proof-dropzone";
import { Banknote, Building2, Smartphone, CreditCard } from "lucide-react";

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
            <div className="mt-6 border-t border-black/5 pt-6 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="bg-neutral-100 p-5 rounded-md mb-6 space-y-3 border border-neutral-200">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">{details.title}</h4>
                    {details.fields.map((field, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1">
                            <span className="text-neutral-500">{field.label}:</span>
                            <span className="font-mono font-medium select-all">{field.value}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">Transaction ID / Reference No.</Label>
                        <Input
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g. 8234XXXXXXX"
                            className="rounded-none border-black/20 focus:border-black h-12 uppercase text-xs tracking-widest font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] tracking-[0.1em] uppercase text-neutral-500">
                            Upload Payment Screenshot <span className="text-red-500">*</span>
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
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-8 border-b border-black/5 pb-4">
                Payment Method
            </h2>

            <RadioGroup value={selectedMethod} onValueChange={onSelect} className="space-y-4">

                {/* COD */}
                <div className={cn(
                    "relative border p-6 transition-all hover:bg-neutral-50",
                    selectedMethod === "COD"
                        ? "border-black bg-white ring-1 ring-black/5 shadow-sm"
                        : "border-neutral-200"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="COD" id="pay-cod" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-cod" className="flex-1 ml-4 cursor-pointer">
                            <div className="flex items-center gap-3 mb-1">
                                <Banknote className="w-4 h-4" />
                                <span className="font-semibold text-sm uppercase tracking-wide">Cash on Delivery</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide pl-7">
                                Pay in cash when your order arrives.
                            </p>
                        </Label>
                    </div>
                </div>

                {/* BANK TRANSFER */}
                <div className={cn(
                    "relative border p-6 transition-all",
                    selectedMethod === "bank_transfer"
                        ? "border-black bg-white ring-1 ring-black/5 shadow-sm"
                        : "border-neutral-200 hover:bg-neutral-50"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="bank_transfer" id="pay-bank" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-bank" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Building2 className="w-4 h-4" />
                                <span className="font-semibold text-sm uppercase tracking-wide">Bank Transfer</span>
                            </div>
                            <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide pl-7">
                                Direct transfer to our bank account.
                            </p>
                        </Label>
                    </div>
                    {selectedMethod === "bank_transfer" && renderPaymentDetails("bank_transfer")}
                </div>

                {/* EASYPAISA */}
                <div className={cn(
                    "relative border p-6 transition-all",
                    selectedMethod === "easypaisa"
                        ? "border-black bg-white ring-1 ring-black/5 shadow-sm"
                        : "border-neutral-200 hover:bg-neutral-50"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="easypaisa" id="pay-easy" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-easy" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Smartphone className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-sm uppercase tracking-wide">Easypaisa</span>
                            </div>
                        </Label>
                    </div>
                    {selectedMethod === "easypaisa" && renderPaymentDetails("easypaisa")}
                </div>

                {/* JAZZCASH */}
                <div className={cn(
                    "relative border p-6 transition-all",
                    selectedMethod === "jazzcash"
                        ? "border-black bg-white ring-1 ring-black/5 shadow-sm"
                        : "border-neutral-200 hover:bg-neutral-50"
                )}>
                    <div className="flex items-start">
                        <RadioGroupItem value="jazzcash" id="pay-jazz" className="mt-1 border-neutral-400 text-black" />
                        <Label htmlFor="pay-jazz" className="flex-1 ml-4 cursor-pointer w-full">
                            <div className="flex items-center gap-3 mb-1">
                                <Smartphone className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-sm uppercase tracking-wide">JazzCash</span>
                            </div>
                        </Label>
                    </div>
                    {selectedMethod === "jazzcash" && renderPaymentDetails("jazzcash")}
                </div>

            </RadioGroup>
        </div>
    );
}
