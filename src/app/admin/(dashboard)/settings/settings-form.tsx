"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSiteConfig } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, X, Loader2, AlertCircle, RefreshCw, Trash2, ImageIcon } from "lucide-react";
import { useImageUpload } from "@/hooks/use-image-upload";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type SettingsFormProps = {
  hero: Record<string, any>;
  theme: Record<string, any>;
  brand: Record<string, any>;
};

export function SettingsForm({ hero, theme, brand }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  // ─── Image Upload System ──────────────────────────────────────────────
  const initialImages = hero.image ? [{ url: hero.image, blurDataUrl: hero.blurDataURL }] : [];

  const upload = useImageUpload({
    maxImages: 1,
    maxFileSize: 10 * 1024 * 1024,
    maxConcurrent: 1,
    initialImages,
    autoUpload: false, // Wait for save
  });

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (upload.images.length > 0) {
        upload.removeImage(upload.images[0].id);
      }
      upload.addFiles(files);
    }
    e.target.value = '';
  };

  const clearHeroImage = () => {
    if (upload.images.length > 0) {
      upload.removeImage(upload.images[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading('Saving settings...');

    // 1. Upload if needed
    let currentImages = upload.images;
    const pendingImages = upload.images.filter(img => img.status === 'pending');

    if (pendingImages.length > 0) {
      try {
        toast.loading('Uploading hero image...', { id: toastId });
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

    // 2. Get the URL
    const currentImage = currentImages[0];
    let heroImageUrl = '';
    let heroBlurUrl = '';

    if (currentImage && currentImage.status === 'success') {
      heroImageUrl = currentImage.remoteUrl || currentImage.previewUrl;
      heroBlurUrl = currentImage.blurDataUrl || '';
    } else if (currentImage && currentImage.isExisting) {
      heroImageUrl = currentImage.previewUrl;
      heroBlurUrl = currentImage.blurDataUrl || '';
    }

    formData.set('heroImage', heroImageUrl);
    formData.set('heroBlurDataURL', heroBlurUrl);
    formData.delete('heroImageFile');

    startTransition(async () => {
      try {
        await updateSiteConfig(formData);
        toast.success('Settings saved', {
          id: toastId,
          description: 'Your store preferences have been updated.',
        });
      } catch (error) {
        toast.error('Error saving settings', {
          id: toastId,
          description: 'Failed to update store configuration. Please try again.',
        });
      }
    });
  };

  const heroPreview = upload.images.length > 0 ? upload.images[0].previewUrl : null;
  const isUploading = upload.isUploading;
  const currentImage = upload.images.length > 0 ? upload.images[0] : null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-10">
        <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Brand Identity</CardTitle>
            <CardDescription className="text-gray-500">Basic info that appears across your storefront.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Store Name</Label>
              <Input id="brandName" name="brandName" defaultValue={brand.name}
                className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Announcement Bar Text</Label>
              <Input id="announcement" name="announcement" defaultValue={brand.announcement}
                className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Hero Section</CardTitle>
            <CardDescription className="text-gray-500">Customize the initial impact of your homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heroHeading" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary Heading</Label>
                <Input id="heroHeading" name="heroHeading" defaultValue={hero.heading}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSub" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Supportive Tagline</Label>
                <Input id="heroSub" name="heroSub" defaultValue={hero.subheading}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="heroCtaText" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">CTA Button Text</Label>
                <Input id="heroCtaText" name="heroCtaText" defaultValue={hero.ctaText || 'Shop Now'}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroCtaLink" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">CTA Button Link</Label>
                <Input id="heroCtaLink" name="heroCtaLink" defaultValue={hero.ctaLink || '/collection'}
                  className="bg-white border-border rounded-xl focus:border-gray-400 focus:ring-0 transition-all py-6 h-12 text-gray-900" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Hero Background Image</Label>
                {currentImage?.fileSize ? (
                  <span className="text-xs text-gray-400">
                    {(currentImage.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                ) : null}
              </div>

              {heroPreview ? (
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border group bg-gray-50">
                  <Image
                    src={heroPreview}
                    alt="Hero preview"
                    fill
                    className={cn(
                      "object-cover transition-all duration-300",
                      isUploading ? "blur-sm scale-105 opacity-50" : "group-hover:scale-105",
                      currentImage?.status === 'error' && "grayscale opacity-25"
                    )}
                    unoptimized
                  />

                  {/* Actions */}
                  {!isUploading && currentImage?.status !== 'error' && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <label className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg cursor-pointer shadow-sm border border-gray-200 transition-colors backdrop-blur-sm">
                        <RefreshCw className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={clearHeroImage}
                        className="bg-white/90 hover:bg-red-50 text-red-600 p-2 rounded-lg shadow-sm border border-gray-200 transition-colors backdrop-blur-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Uploading State */}
                  {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 transition-all duration-300">
                      <div className="w-full max-w-xs space-y-3 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                            Uploading...
                          </span>
                          <span>{currentImage?.progress || 0}%</span>
                        </div>
                        <Progress value={currentImage?.progress || 0} className="h-1.5" />
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {currentImage?.status === 'error' && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
                      <div className="bg-white border border-red-100 rounded-xl p-5 max-w-sm text-center space-y-3 shadow-xl ring-1 ring-red-50">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-gray-900">Upload Failed</h4>
                          <p className="text-xs text-red-600">{currentImage.error || "Something went wrong"}</p>
                        </div>
                        <div className="flex gap-2 justify-center pt-2">
                          <Button size="sm" variant="outline" onClick={clearHeroImage} className="h-8 text-xs px-4">
                            Remove
                          </Button>
                          <Button size="sm" onClick={() => upload.startUpload()} className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white border-none px-4">
                            Retry
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className={cn(
                  "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group overflow-hidden",
                  "border-gray-200 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400"
                )}>
                  <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center space-y-3 group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700 transition-colors">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        High resolution • Max 10MB
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    name="heroImageFile"
                    accept="image/*"
                    onChange={handleHeroImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-border rounded-xl overflow-hidden shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-8 py-6">
            <CardTitle className="text-lg text-gray-900">Brand Palette</CardTitle>
            <CardDescription className="text-gray-500">Global color configuration for your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="themeColor" className="text-gray-500 text-xs font-medium uppercase tracking-widest pl-1">Primary Accent</Label>
              <div className="flex gap-4">
                <Input type="color" id="themeColor" name="themeColor" className="w-16 h-12 p-1 bg-white border-border rounded-xl cursor-pointer" defaultValue={theme.primaryColor || '#000000'} />
                <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 text-gray-500 text-sm">
                  Current: {theme.primaryColor || '#000000'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 h-10 font-medium disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </form>
  );
}
