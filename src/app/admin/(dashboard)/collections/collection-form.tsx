"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createCollection, updateCollection } from "./actions";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useSearchParams, useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Loader2, AlertCircle, Trash2, Upload, RefreshCw, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function CollectionForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const aspectRatio = parseFloat(searchParams.get('ratio') || '0.8');

    // ─── Image Upload Hook ────────────────────────────────────────────────
    const initialImages: { url: string; blurDataUrl?: string }[] = initialData?.image_url ? [{ url: initialData.image_url }] : [];

    // Check if initialData has metadata with blur url
    const blurData = initialData?.metadata?.blurDataUrls?.[initialData.image_url];
    if (initialImages.length > 0 && blurData) {
        initialImages[0].blurDataUrl = blurData;
    }

    const upload = useImageUpload({
        maxImages: 1,
        maxFileSize: 6 * 1024 * 1024, // 6MB limit as per previous action
        initialImages,
        autoUpload: false
    });

    const [cropData, setCropData] = useState<{ id: string, imageUrl: string } | null>(null);

    // ─── Handlers ─────────────────────────────────────────────────────────

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // If we already have an image, we want to replace it
            // The hook's addFiles appends, so we should clear if maxImages=1 logic is strictly needed, 
            // but let's just remove existing if any.
            if (upload.images.length > 0) {
                upload.removeImage(upload.images[0].id);
            }
            upload.addFiles(files);
        }
        e.target.value = '';
    };

    // Watch for new images to trigger crop if needed? 
    // Actually, usually we crop BEFORE upload or standard flow. 
    // Existing flow: Select -> (Crop?) -> Preview.
    // New flow: Select -> Hook adds it -> We detect it's a new 'pending' file -> Show Crop Dialog? 
    // Or just provide a "Crop" button on the preview.
    // Let's stick to: Select -> Adds to hook -> User can click "Crop". 
    // OR: Auto-pop crop for new images?
    // Let's keep it simple: Select -> Preview shows. Crop button available.
    // Wait, the previous code had `tempImage` state for cropping loop.

    // Let's implement: When a new image is added, if it's not strictly "just added" we might not want to force crop.
    // But for a cover image, cropping is important.
    // Let's use the same pattern as ProductImageUploader: "Crop" button on the tile.

    const handleCropComplete = (blob: Blob) => {
        if (!cropData) return;

        const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
        upload.replaceImage(cropData.id, file);
        setCropData(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const toastId = toast.loading('Saving collection...');

        // 1. Upload Images
        let currentImages = upload.images;
        const pending = upload.images.filter(img => img.status === 'pending');
        if (pending.length > 0) {
            try {
                toast.loading('Uploading image...', { id: toastId });
                currentImages = await upload.startUpload();
            } catch (err) {
                toast.error('Upload failed', { id: toastId });
                return;
            }
        }

        if (upload.isUploading) {
            toast.error('Please wait for uploads to finish', { id: toastId });
            return;
        }

        // 2. Prepare Data
        const currentImage = currentImages[0];
        let imageUrl = '';
        let blurDataURL = '';

        if (currentImage && currentImage.status === 'success') {
            imageUrl = currentImage.remoteUrl || currentImage.previewUrl;
            blurDataURL = currentImage.blurDataUrl || '';
        } else if (currentImage && currentImage.isExisting) {
            imageUrl = currentImage.previewUrl;
            blurDataURL = currentImage.blurDataUrl || '';
        }

        // We send image_url string now
        formData.set('image_url', imageUrl);
        formData.set('blurDataURL', blurDataURL);

        // Remove legacy file input if present in formData
        formData.delete('imageFile');

        if (!formData.has('is_visible')) {
            formData.set('is_visible', 'off');
        }

        startTransition(async () => {
            try {
                let res;
                if (initialData?.id) {
                    formData.append('id', initialData.id);
                    res = await updateCollection(formData);
                } else {
                    res = await createCollection(formData);
                }

                if (res?.error) {
                    toast.error('Error saving collection', { id: toastId, description: res.error });
                } else {
                    toast.success(initialData?.id ? 'Collection updated' : 'Collection created', {
                        id: toastId,
                        description: `${formData.get('title')} has been saved.`
                    });
                    setTimeout(() => {
                        router.push('/admin/collections');
                        router.refresh();
                    }, 1000);
                }
            } catch (err) {
                console.error('Submission error:', err);
                toast.error('Something went wrong', { id: toastId, description: 'Please try again later' });
            }
        });
    };

    const currentImage = upload.images[0];
    const isUploading = upload.isUploading;

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Title</Label>
                        <Input name="title" required defaultValue={initialData?.title} className="bg-white border-border rounded-xl py-6 h-12 text-gray-900" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Slug</Label>
                        <Input name="slug" required defaultValue={initialData?.slug} className="bg-white border-border rounded-xl py-6 h-12 text-gray-900" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Cover Image (Display)</Label>
                            {currentImage?.fileSize ? (
                                <span className="text-xs text-gray-400">
                                    {(currentImage.fileSize / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            ) : null}
                        </div>

                        {currentImage ? (
                            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-border mb-2 bg-gray-50 group">
                                <Image
                                    src={currentImage.previewUrl}
                                    alt="Display Preview"
                                    fill
                                    className={cn(
                                        "object-cover transition-all duration-300",
                                        isUploading && "blur-sm opacity-50 scale-105",
                                        currentImage.status === 'error' && "grayscale opacity-50"
                                    )}
                                    unoptimized
                                />

                                {/* Actions */}
                                {!isUploading && currentImage.status !== 'error' && (
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        {/* Crop Button */}
                                        <button
                                            type="button"
                                            onClick={() => setCropData({ id: currentImage.id, imageUrl: currentImage.previewUrl })}
                                            className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg cursor-pointer shadow-sm border border-gray-200 transition-colors backdrop-blur-sm"
                                            title="Crop Image"
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center border-2 border-current rounded-sm text-[8px] font-bold">#</div>
                                        </button>

                                        {/* Replace Button */}
                                        <label className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg cursor-pointer shadow-sm border border-gray-200 transition-colors backdrop-blur-sm">
                                            <RefreshCw className="w-4 h-4" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => upload.removeImage(currentImage.id)}
                                            className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-lg shadow-sm border border-gray-200 transition-colors backdrop-blur-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Uploading Overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                                        <div className="w-full max-w-[80%] space-y-3 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                                                    Uploading...
                                                </span>
                                                <span>{currentImage.progress}%</span>
                                            </div>
                                            <Progress value={currentImage.progress} className="h-1.5" />
                                        </div>
                                    </div>
                                )}

                                {/* Error Overlay */}
                                {currentImage.status === 'error' && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-20">
                                        <div className="bg-white border border-red-100 rounded-xl p-4 text-center space-y-3 shadow-lg ring-1 ring-red-50">
                                            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-semibold text-gray-900">Upload Failed</h4>
                                                <p className="text-xs text-red-600 max-w-[150px] mx-auto truncate">{currentImage.error || "Unknown error"}</p>
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" variant="outline" onClick={() => upload.removeImage(currentImage.id)} className="h-7 text-xs">Remove</Button>
                                                <Button size="sm" onClick={() => upload.startUpload()} className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white border-none">Retry</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label className={cn(
                                "group flex flex-col items-center justify-center w-full aspect-[4/5] border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-gray-400 transition-all bg-gray-50 hover:bg-gray-100 relative overflow-hidden",
                                isUploading && "opacity-50 pointer-events-none"
                            )}>
                                <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none" />
                                <Upload className="w-8 h-8 text-gray-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                                <span className="text-sm text-gray-500 font-medium">Click to upload cover</span>
                                <span className="text-[10px] text-gray-400 mt-1">Max 6MB • Portrait</span>
                                <input name="imageFile" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                            </label>
                        )}
                        <input type="hidden" name="existing_image" value={initialData?.image_url || ''} />
                    </div>
                </div>

                <div className="space-y-6">


                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Description</Label>
                        <Textarea name="description" className="min-h-[150px] bg-white border-border rounded-xl resize-none p-4 text-gray-900" defaultValue={initialData?.description} />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-gray-800 text-sm font-semibold">SEO Metadata</h3>
                        <div className="space-y-2">
                            <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">SEO Title</Label>
                            <Input name="seo_title" defaultValue={initialData?.seo_title} className="bg-white border-border rounded-xl py-6 h-12 text-gray-900" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">SEO Description</Label>
                            <Textarea name="seo_description" defaultValue={initialData?.seo_description} className="bg-white border-border rounded-xl h-24 p-4 text-gray-900" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-gray-800 text-sm font-semibold">Display Settings</h3>

                        <div className="space-y-2">
                            <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Hero Tagline</Label>
                            <Input
                                name="tagline"
                                defaultValue={initialData?.metadata?.tagline || "Explore The Collection"}
                                className="bg-white border-border rounded-xl py-6 h-12 text-gray-900"
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="show_product_grid"
                                name="show_product_grid"
                                defaultChecked={initialData?.metadata?.show_product_grid !== false}
                            />
                            <Label htmlFor="show_product_grid" className="text-gray-900">Show Product Grid</Label>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="is_visible" name="is_visible" defaultChecked={initialData?.is_visible !== false} />
                            <Label htmlFor="is_visible" className="text-gray-900">Visible on site</Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button
                    type="submit"
                    disabled={isPending || isUploading}
                    className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 h-10 font-medium disabled:opacity-50"
                >
                    {isPending ? "Validating..." : isUploading ? "Uploading..." : "Save Collection"}
                </Button>
            </div>

            {cropData && (
                <ImageCropper
                    image={cropData.imageUrl}
                    aspect={aspectRatio}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropData(null)}
                />
            )}
        </form>
    );
}
