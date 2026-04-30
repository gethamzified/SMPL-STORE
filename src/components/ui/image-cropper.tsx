"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/crop-image";

interface ImageCropperProps {
  image: string;
  aspect?: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({
  image,
  aspect: initialAspect = 4 / 5,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [originalAspect, setOriginalAspect] = useState<number>(1);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onMediaLoaded = (mediaSize: { width: number; height: number }) => {
    setOriginalAspect(mediaSize.width / mediaSize.height);
  };

  const onCropCompleteInternal = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      onCropComplete(blob);
    } catch (e) {
      console.error("Failed to skip crop", e);
      onCancel();
    }
  };

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] bg-black border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        {/* Aspect Ratio Controls */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto">
          <Button
            variant={aspect === originalAspect ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAspect(originalAspect)}
            className="text-xs h-8 border border-white/10"
          >
            Original
          </Button>
          <Button
            variant={aspect === 1 ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAspect(1)}
            className="text-xs h-8 border border-white/10"
          >
            Square (1:1)
          </Button>
          <Button
            variant={aspect === 4 / 5 ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAspect(4 / 5)}
            className="text-xs h-8 border border-white/10"
          >
            Portrait (4:5)
          </Button>
          <Button
            variant={aspect === 16 / 9 ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAspect(16 / 9)}
            className="text-xs h-8 border border-white/10"
          >
            Landscape (16:9)
          </Button>
        </div>

        <div className="relative w-full h-[400px] bg-neutral-900 rounded-lg overflow-hidden border border-white/5 mt-2">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect || originalAspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
            onMediaLoaded={onMediaLoaded}
          />
        </div>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium uppercase tracking-wider text-white/50 min-w-[50px]">Zoom</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
              className="flex-1"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip} className="hover:bg-white/10 text-white/70">
              Skip (Use Original)
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel} className="hover:bg-white/10 text-white/70">
              Cancel
            </Button>
            <Button onClick={handleDone} className="bg-white text-black hover:bg-white/90">
              Apply Crop
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
