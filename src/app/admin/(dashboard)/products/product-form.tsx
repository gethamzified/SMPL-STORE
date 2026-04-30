"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProduct, createProduct } from "./actions";
import { useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { Product } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { VariantConfigSection } from "@/components/admin/products/VariantConfigSection";
import { ProductImageUploader } from "@/components/admin/products/ProductImageUploader";
import { useImageUpload } from "@/hooks/use-image-upload";
import type { ProductVariant } from "@/lib/types";
import { useState } from "react";

type ProductFormProps = {
  initialData?: Partial<Product>
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { currency } = useStoreConfig();
  const [isPending, startTransition] = useTransition();

  // ─── Image Upload System ──────────────────────────────────────────────
  // Prepare initial images for edit mode (with blur data URLs from metadata)
  const existingBlurMap = (initialData?.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> || {};

  const initialImages = (() => {
    const urls = initialData?.images?.length
      ? initialData.images
      : (initialData?.cover_image ? [initialData.cover_image] : []);
    return urls.map(url => ({
      url,
      blurDataUrl: existingBlurMap[url] || undefined,
    }));
  })();

  const upload = useImageUpload({
    maxImages: 10,
    maxFileSize: 10 * 1024 * 1024,
    maxConcurrent: 3, // Increased concurrency now that we use direct uploads
    initialImages,
    onValidationError: (errors) => {
      errors.forEach(err => toast.error(err));
    },
    autoUpload: false, // Wait for save
  });

  // Variant configuration state
  const [enableColorVariants, setEnableColorVariants] = useState(initialData?.enable_color_variants ?? false);
  const [enableSizeVariants, setEnableSizeVariants] = useState(initialData?.enable_size_variants ?? false);
  const [availableColors, setAvailableColors] = useState<string[]>(initialData?.available_colors ?? []);
  const [availableSizes, setAvailableSizes] = useState<string[]>(initialData?.available_sizes ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants ?? []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      sale_price: initialData?.sale_price ?? undefined,
      sku: initialData?.sku || `SMPL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: (initialData?.status as any) || "draft",
      product_type: initialData?.product_type || "",
      tags: initialData?.tags?.join(", ") || "",
      is_featured: initialData?.is_featured || false,
      seo_title: initialData?.seo_title || "",
      seo_description: initialData?.seo_description || "",
      track_inventory: initialData?.track_inventory ?? true,
    },
  });

  // ─── Cleanup orphaned uploads if user navigates away ──────────────────
  useEffect(() => {
    // Warn user if they have unsaved uploaded images
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (upload.isUploading) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [upload.isUploading]);

  // ─── Submit Handler ───────────────────────────────────────────────────
  async function onSubmit(data: ProductFormValues) {
    // 1. Trigger Image Uploads
    // 1. Trigger Image Uploads
    let latestImages = upload.images;
    const pendingImages = upload.images.filter(img => img.status === 'pending');

    if (pendingImages.length > 0) {
      toast.info(`Uploading ${pendingImages.length} new images...`);
      try {
        latestImages = await upload.startUpload();
      } catch (err: any) {
        toast.error("Image upload failed", { description: err.message || "Please try again" });
        return;
      }
    }

    // 2. Block submission if images are still uploading
    if (upload.isUploading) {
      toast.error("Please wait for all images to finish uploading");
      return;
    }

    // 3. Check for failed uploads using fresh state
    const failedImages = latestImages.filter(img => img.status === 'error');
    if (failedImages.length > 0) {
      toast.error(`${failedImages.length} image(s) failed to upload.`, {
        description: "Please remove failed images or try again."
      });
      return;
    }

    const formData = new FormData();

    // Append validated form fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'is_featured') {
          if (value) formData.append(key, 'on');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append pre-uploaded image URLs (in display order)
    // Append pre-uploaded image URLs (in display order)
    const imageUrls = latestImages
      .filter(img => img.status === 'success' && img.remoteUrl)
      .map(img => img.remoteUrl!);
    formData.set('image_urls', JSON.stringify(imageUrls));

    // Append blur data URLs for LQIP placeholders
    const blurDataUrls: Record<string, string> = {};
    latestImages.forEach(img => {
      if (img.remoteUrl && img.blurDataUrl) {
        blurDataUrls[img.remoteUrl] = img.blurDataUrl;
      }
    });
    formData.set('blur_data_urls', JSON.stringify(blurDataUrls));

    // Append variant configuration
    formData.set('enable_color_variants', String(enableColorVariants));
    formData.set('enable_size_variants', String(enableSizeVariants));
    formData.set('available_colors', JSON.stringify(availableColors));
    formData.set('available_sizes', JSON.stringify(availableSizes));
    formData.set('variants', JSON.stringify(variants));

    startTransition(async () => {
      const toastId = toast.loading('Saving product...');
      try {
        let res;
        if (initialData?.id) {
          formData.append('id', initialData.id);
          res = await updateProduct(formData);
        } else {
          res = await createProduct(formData);
        }

        if (res?.error) {
          toast.error("Error saving product", { id: toastId, description: res.error });
        } else {
          toast.success(initialData?.id ? "Product updated" : "Product created", { id: toastId });

          // Clear upload state to free memory
          upload.cleanup();

          setTimeout(() => {
            router.push("/admin/products");
            router.refresh();
          }, 1500);
        }
      } catch (error) {
        console.error("Submit Error", error);
        toast.error("Something went wrong", { id: toastId });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Info */}
            <div className="bg-white border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Product Details</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Premium Linen Shirt" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">URL Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="premium-linen-shirt" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description..."
                        {...field}
                        className="bg-white border-border text-gray-900 rounded-xl min-h-[160px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Media — New Background Upload System */}
            <div className="bg-white border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-light tracking-tight text-gray-900">Media</h3>
                {upload.isUploading && (
                  <span className="text-xs text-blue-600 font-medium animate-pulse">
                    Uploading...
                  </span>
                )}
              </div>

              <ProductImageUploader
                upload={upload}
                maxImages={10}
                cropAspect={3 / 4}
                disabled={isPending}
              />
            </div>

            {/* Pricing */}
            <div className="bg-white border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                        Price ({currency?.code || 'PKR'} {currency?.symbol || 'Rs.'})
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sale_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                        Sale Price ({currency?.code || 'PKR'} {currency?.symbol || 'Rs.'})
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} value={field.value || ''} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white border border-border rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 mb-4 border-b border-gray-100 pb-4">Inventory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">SKU</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white border-border text-gray-900 rounded-xl h-12 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Stock is now managed per-variant in inventory_levels */}
                <div className="flex items-center">
                  <p className="text-xs text-gray-500">Stock is managed per-variant below</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="track_inventory"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900">Track Inventory</FormLabel>
                      <p className="text-[10px] text-gray-500">Enable stock management for this product</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Variant Configuration */}
            <VariantConfigSection
              enableColor={enableColorVariants}
              enableSize={enableSizeVariants}
              availableColors={availableColors}
              availableSizes={availableSizes}
              variants={variants}
              basePrice={form.watch('price') || 0}
              baseSku={form.watch('sku') || form.watch('slug')?.replace(/-/g, '').substring(0, 8).toUpperCase() || 'PROD'}
              currencySymbol={currency?.symbol || 'Rs.'}
              onEnableColorChange={setEnableColorVariants}
              onEnableSizeChange={setEnableSizeVariants}
              onColorsChange={setAvailableColors}
              onSizesChange={setAvailableSizes}
              onVariantsChange={setVariants}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white border border-border rounded-xl p-6 space-y-6 lg:sticky lg:top-24 shadow-sm">
              <h3 className="text-lg font-light tracking-tight text-gray-900 border-b border-gray-100 pb-4">Status & Organization</h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-border text-gray-900 h-12">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-white shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium text-gray-900">Feature Product</FormLabel>
                      <p className="text-[10px] text-gray-500">Show on homepage</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />



              <div className="pt-4 border-t border-gray-100 space-y-3">
                {/* Upload status warning */}
                {upload.isUploading && (
                  <p className="text-xs text-amber-600 text-center">
                    Wait for image uploads to complete
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isPending || upload.isUploading}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-lg h-10 font-medium disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {upload.isUploading
                    ? `Uploading ${upload.uploadingCount} image${upload.uploadingCount > 1 ? 's' : ''}...`
                    : initialData?.id ? "Update Product" : "Create Product"
                  }
                </Button>
              </div>
            </div>
          </div>

        </div>
      </form>
    </Form>
  );
}
