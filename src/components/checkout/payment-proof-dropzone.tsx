"use client";

import { useState, useCallback } from "react";
// import { useDropzone } from "react-dropzone"; // Removed as we use custom implementation
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

// Since I didn't see react-dropzone in package.json, I'll use a custom implementation or standard input if I can't verifying it.
// Checking package.json... user didn't have react-dropzone. They have @dnd-kit/core but that's different.
// I will implement a custom drag-and-drop zone to avoid installing new deps without permission, 
// OR I will ask user. But "SafeToAutoRun" isn't for deps. 
// I'll build a custom one using native onDragOver events.

interface PaymentProofDropzoneProps {
    onFileSelect: (file: File) => void;
    onRemove: () => void;
    selectedFile: File | null;
    uploadedUrl?: string | null;
    error?: string;
}

export function PaymentProofDropzone({
    onFileSelect,
    onRemove,
    selectedFile,
    uploadedUrl,
    error
}: PaymentProofDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = async (file: File) => {
        if (!file.type.startsWith("image/")) return;

        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onRemove();
        setPreviewUrl(null);
    };

    if (selectedFile || uploadedUrl) {
        return (
            <div className="relative group border border-dashed border-emerald-500/50 bg-emerald-50/50 rounded-lg p-4 flex items-center gap-4 transition-all">
                <div className="relative w-16 h-16 rounded overflow-hidden bg-white border border-neutral-200 flex-shrink-0">
                    {(previewUrl || uploadedUrl) && (
                        <Image
                            src={previewUrl || uploadedUrl!}
                            alt="Proof"
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-900 truncate">
                        {selectedFile?.name || "Payment Proof Uploaded"}
                    </p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3" /> Ready to submit
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemove}
                    className="text-neutral-400 hover:text-red-500"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-all text-center cursor-pointer",
                    isDragging
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50",
                    error && "border-red-300 bg-red-50/30"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('proof-upload')?.click()}
            >
                <input
                    id="proof-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileInput}
                />

                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5 text-neutral-400" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900">
                        Click to upload payment screenshot
                    </p>
                    <p className="text-xs text-neutral-500">
                        or drag and drop here (JPG, PNG)
                    </p>
                </div>
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-2 ml-1">{error}</p>
            )}
        </div>
    );
}
