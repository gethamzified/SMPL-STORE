"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { ImagePlus, X, GripVertical } from "lucide-react";
import { CldUploadWidget } from 'next-cloudinary';

import { Switch } from "@/components/ui/switch";

type LookbookImage = {
  src: string;
  label?: string;
  span?: string;
};

type ProductLookbookFormProps = {
  config: {
    enabled?: boolean;
    marquee_text?: string;
    images?: LookbookImage[];
  };
  onChange: (config: { enabled?: boolean; marquee_text?: string; images?: LookbookImage[] }) => void;
};

const DEFAULT_SPANS = [
  "col-span-2 row-span-1", // Row 1
  "col-span-1 row-span-1", 
  "col-span-1 row-span-1",
  "col-span-1 row-span-1", // Row 2
  "col-span-1 row-span-1", 
  "col-span-2 row-span-1",
  "col-span-2 row-span-1", // Row 3
  "col-span-2 row-span-1"
];

export function ProductLookbookForm({ config, onChange }: ProductLookbookFormProps) {
  const [enabled, setEnabled] = useState(config.enabled ?? false);
  const [marquee, setMarquee] = useState(config.marquee_text || "IN_THE_WILD / IN_THE_WILD / IN_THE_WILD");
  const [images, setImages] = useState<LookbookImage[]>(config.images || []);

  // Sync state to parent via useEffect to avoid "updating during render" warning
  useEffect(() => {
    onChange({ enabled, marquee_text: marquee, images });
  }, [enabled, marquee, images]);

  const handleAddImage = (url: string) => {
    setImages(prev => {
      const nextIndex = prev.length;
      if (nextIndex >= 8) return prev;
      
      const newImage: LookbookImage = {
        src: url,
        label: `Shot_${nextIndex + 1}`,
        span: DEFAULT_SPANS[nextIndex] || "col-span-1 row-span-1"
      };
      return [...prev, newImage];
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLabelChange = (index: number, label: string) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index].label = label;
      return newImages;
    });
  };

  const handleMarqueeChange = (text: string) => {
    setMarquee(text);
  };

  const handleEnabledChange = (isEnabled: boolean) => {
    setEnabled(isEnabled);
  };

  return (
    <div className="space-y-8">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-xl">
        <div className="space-y-0.5">
          <FormLabel className="text-sm font-medium text-gray-900">Enable Lookbook</FormLabel>
          <p className="text-xs text-gray-500">Show the "In the Wild" lookbook section on the product page.</p>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={handleEnabledChange}
        />
      </div>

      {enabled && (
        <>
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Marquee Text</FormLabel>
            <Input 
              value={marquee} 
              onChange={(e) => handleMarqueeChange(e.target.value)}
              placeholder="IN_THE_WILD / IN_THE_WILD"
              className="bg-white border-border text-gray-900 rounded-xl h-12"
            />
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
          <FormLabel className="text-gray-500 text-xs font-medium uppercase tracking-widest">Lookbook Images (Max 8)</FormLabel>
          <span className="text-[10px] text-gray-400 font-mono">{images.length}/8</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl group relative">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 space-y-2">
                <Input 
                  value={img.label} 
                  onChange={(e) => handleLabelChange(idx, e.target.value)}
                  placeholder="Image label (e.g. Front_Profile)"
                  className="bg-white border-border text-xs h-8"
                />
                <div className="text-[9px] text-gray-400 font-mono">
                  Span: {img.span}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveImage(idx)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {images.length < 8 && (
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "smpl_products"}
              onSuccess={(result: any) => {
                if (result.info?.secure_url) {
                  handleAddImage(result.info.secure_url);
                }
              }}
              options={{
                multiple: true,
                maxFiles: 8 - images.length,
                folder: 'lookbooks',
                clientAllowedFormats: ['webp', 'jpg', 'png'],
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-brand-ascent/50 hover:bg-brand-ascent/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-ascent/10 transition-colors">
                    <ImagePlus className="w-5 h-5 text-gray-400 group-hover:text-brand-ascent" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900">Add Lookbook Image</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
