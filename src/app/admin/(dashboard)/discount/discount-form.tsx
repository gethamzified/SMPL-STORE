'use client';

import { useState, useTransition } from 'react';
import { updateGlobalDiscount, deleteDiscountImage } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Trash2, Percent, Clock, Eye, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { GlobalDiscountConfig } from '@/lib/types';
import { useImageUpload } from '@/hooks/use-image-upload';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DiscountFormProps {
    initialConfig: GlobalDiscountConfig;
}

export function DiscountForm({ initialConfig }: DiscountFormProps) {
    const [isPending, startTransition] = useTransition();
    const [config, setConfig] = useState<GlobalDiscountConfig>(initialConfig);
    const initialImages = initialConfig.imageUrl ? [{ url: initialConfig.imageUrl }] : [];

    const upload = useImageUpload({
        maxImages: 1,
        maxFileSize: 4 * 1024 * 1024, // 4MB
        initialImages,
        autoUpload: false
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            if (upload.images.length > 0) {
                upload.removeImage(upload.images[0].id);
            }
            upload.addFiles(files);
        }
        e.target.value = ''; // Reset input
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading('Saving discount settings...');

        // 1. Upload logic
        let currentImages = upload.images;
        const pending = upload.images.filter(img => img.status === 'pending');

        if (pending.length > 0) {
            toast.loading('Uploading popup image...', { id: toastId });
            try {
                currentImages = await upload.startUpload();
            } catch (err) {
                toast.error('Image upload failed', { id: toastId });
                return;
            }
        }

        if (upload.isUploading) {
            toast.error('Please wait for uploads to finish', { id: toastId });
            return;
        }

        // 2. Prepare URL
        const currentImage = currentImages[0];
        let finalImageUrl = '';

        if (currentImage) {
            if (currentImage.status === 'success') {
                finalImageUrl = currentImage.remoteUrl || '';
            } else if (currentImage.isExisting) {
                finalImageUrl = currentImage.previewUrl;
            } else if (currentImage.status === 'error') {
                toast.error('Image failed to upload', { id: toastId });
                return;
            }
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('enabled', String(config.enabled));
            formData.append('title', config.title);
            formData.append('percentage', String(config.percentage));
            formData.append('delaySeconds', String(config.delaySeconds));
            formData.append('showOncePerSession', String(config.showOncePerSession));
            formData.append('imageUrl', finalImageUrl); // Send URL, not file

            const result = await updateGlobalDiscount(formData);

            if (result.success) {
                toast.success('Discount settings saved', { id: toastId });
            } else {
                toast.error(result.error || 'Failed to save settings', { id: toastId });
            }
        });
    };

    const currentImage = upload.images[0];
    const isUploading = upload.isUploading;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable Toggle */}
            <Card className="bg-white border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 font-light tracking-tight flex items-center gap-3">
                        <Eye className="w-5 h-5 text-gray-500" />
                        Popup Status
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Enable or disable the discount popup for visitors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                        />
                        <Label className="text-gray-700">
                            {config.enabled ? 'Popup is Active' : 'Popup is Disabled'}
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Discount Details */}
            <Card className="bg-white border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 font-light tracking-tight flex items-center gap-3">
                        <Percent className="w-5 h-5 text-gray-500" />
                        Discount Details
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Configure the discount title and percentage to display.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                            Discount Title
                        </Label>
                        <Input
                            value={config.title}
                            onChange={(e) => setConfig({ ...config, title: e.target.value })}
                            placeholder="e.g. New Year Sale"
                            className="bg-white border-border text-gray-900 rounded-xl h-12"
                        />
                        <p className="text-[10px] text-gray-400">
                            This will be displayed as the main heading in the popup.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                            Discount Percentage
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={config.percentage}
                                onChange={(e) => setConfig({ ...config, percentage: parseInt(e.target.value) || 0 })}
                                className="bg-white border-border text-gray-900 w-32 rounded-xl h-12"
                            />
                            <span className="text-gray-500 text-lg font-bold">%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Popup Image */}
            <Card className="bg-white border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 font-light tracking-tight flex items-center gap-3">
                        <Upload className="w-5 h-5 text-gray-500" />
                        Popup Image
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Upload an attractive image to display in the popup.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentImage ? (
                        <div className="relative w-full max-w-md aspect-[1/1] rounded-xl overflow-hidden border border-border group bg-gray-50">
                            <Image
                                src={currentImage.previewUrl}
                                alt="Discount Preview"
                                fill
                                className={cn(
                                    "object-contain transition-all duration-300",
                                    isUploading && "blur-sm opacity-50 scale-105",
                                    currentImage.status === 'error' && "grayscale opacity-50"
                                )}
                                unoptimized
                            />

                            {/* Actions */}
                            {!isUploading && currentImage.status !== 'error' && (
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <label className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg cursor-pointer shadow-sm border border-gray-200 transition-colors backdrop-blur-sm">
                                        <RefreshCw className="w-4 h-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
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
                                    <div className="w-full max-w-[200px] space-y-3 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100">
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
                                            <p className="text-xs text-red-600 truncate max-w-[150px]">{currentImage.error || "Unknown error"}</p>
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
                        <label className="flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-input rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Drop image or click to upload</span>
                            <span className="text-[10px] text-gray-400 mt-1">
                                PNG, JPG, WebP • Max 4MB
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                    )}
                </CardContent>
            </Card>

            {/* Timing Settings */}
            <Card className="bg-white border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 font-light tracking-tight flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        Display Settings
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Control when and how the popup appears.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                            Delay (seconds)
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="60"
                                value={config.delaySeconds}
                                onChange={(e) => setConfig({ ...config, delaySeconds: parseInt(e.target.value) || 5 })}
                                className="bg-white border-border text-gray-900 w-32 rounded-xl h-12"
                            />
                            <span className="text-gray-500 text-sm">seconds after page load</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Switch
                            checked={config.showOncePerSession}
                            onCheckedChange={(checked) => setConfig({ ...config, showOncePerSession: checked })}
                        />
                        <div>
                            <Label className="text-gray-700">Show once per session</Label>
                            <p className="text-[10px] text-gray-400">
                                If enabled, the popup won't appear again after user closes it (until they return in a new session).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 h-10 font-medium disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Discount Settings'}
                </Button>
            </div>
        </form>
    );
}

