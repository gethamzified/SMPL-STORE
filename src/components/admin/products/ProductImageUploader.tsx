/**
 * ProductImageUploader — Shopify-quality image upload component.
 *
 * Features:
 * - Drag & drop zone + click-to-select
 * - Instant preview from URL.createObjectURL
 * - Per-image upload progress with animated bar
 * - Error/retry state per image
 * - Drag-to-reorder gallery via @dnd-kit
 * - Crop integration via ImageCropper dialog
 * - Zoom preview on hover (desktop)
 * - Memory-safe: all blob URLs revoked on delete/unmount
 * - Responsive grid layout
 */

'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  Crop as CropIcon,
  ZoomIn,
  ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type UploadedImage } from '@/lib/upload-service';
import { type UseImageUploadReturn } from '@/hooks/use-image-upload';
import { ImageCropper } from '@/components/ui/image-cropper';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Props ───────────────────────────────────────────────────────────────

interface ProductImageUploaderProps {
  /** The image upload hook return */
  upload: UseImageUploadReturn;
  /** Maximum images allowed */
  maxImages?: number;
  /** Aspect ratio for the crop dialog */
  cropAspect?: number;
  /** Whether the form is in a submitting state */
  disabled?: boolean;
}

// ─── Sortable Image Tile ─────────────────────────────────────────────────

function SortableImageTile({
  image,
  index,
  onRemove,
  onCrop,
  onZoom,
  onRetry,
  disabled,
}: {
  image: UploadedImage;
  index: number;
  onRemove: (id: string) => void;
  onCrop: (id: string, url: string) => void;
  onZoom: (url: string) => void;
  onRetry: (id: string) => void;
  disabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const isUploading = image.status === 'uploading';
  const isError = image.status === 'error';
  const isSuccess = image.status === 'success';
  const isPending = image.status === 'pending'; // New constant for cleanliness

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative aspect-square rounded-xl overflow-hidden border bg-gray-50 group transition-all',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-2xl ring-2 ring-gray-900/20',
        isError && 'border-red-300 bg-red-50',
        isSuccess && 'border-border',
        isUploading && 'border-blue-200',
        isPending && 'border-amber-200 bg-amber-50/30',
        !isError && !isUploading && !isPending && 'border-border',
      )}
      {...attributes}
      {...listeners}
    >
      {/* Image preview */}
      <Image
        src={image.previewUrl}
        alt={image.fileName}
        fill
        className={cn(
          'object-cover transition-all duration-300',
          isUploading && 'opacity-70',
          isError && 'opacity-50 grayscale',
          !isDragging && 'group-hover:scale-110'
        )}
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized // blob: URLs can't go through next/image optimizer
      />

      {/* Grid overlay for better contrast */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

      {/* First image badge */}
      {index === 0 && (
        <div className="absolute bottom-2.5 left-2.5 z-20">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-900 text-white px-2.5 py-1 rounded-md backdrop-blur-md shadow-lg border border-white/10">
            Cover
          </span>
        </div>
      )}

      {/* Upload progress overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px] flex flex-col items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <span className="text-sm font-bold text-blue-700">
            {image.progress > 0 ? `${image.progress}%` : 'Waiting...'}
          </span>
          {/* Progress bar */}
          <div className="w-[80%] h-1.5 bg-blue-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${image.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Pending (Ready to upload) overlay */}
      {isPending && !isUploading && (
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-sm">
            Pending
          </span>
        </div>
      )}

      {/* Error overlay */}
      {isError && (
        <div className="absolute inset-0 bg-red-50/90 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-3 pointer-events-none">
          <AlertCircle className="w-6 h-6 text-red-500 mb-1.5" />
          <span className="text-xs font-bold text-red-600 text-center leading-tight line-clamp-3">
            {image.error || 'Upload failed'}
          </span>
        </div>
      )}

      {/* Success indicator (brief flash) */}
      {isSuccess && !image.isExisting && (
        <div className="absolute top-2.5 left-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle2 className="w-5 h-5 text-green-500 drop-shadow-md" />
        </div>
      )}

      {/* Action buttons */}
      <div
        className={cn(
          'absolute top-2.5 right-2.5 flex flex-col gap-2 z-20',
          'opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity',
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zoom button (desktop) */}
        {(isSuccess || isPending) && (
          <button
            type="button"
            onClick={() => onZoom(image.previewUrl)}
            className="bg-white text-gray-900 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors shadow-xl border border-gray-100"
            title="Zoom preview"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {/* Crop button */}
        {(isSuccess || image.isExisting || isPending) && (
          <button
            type="button"
            onClick={() => onCrop(image.id, image.previewUrl)}
            className="bg-white text-gray-900 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors shadow-xl border border-gray-100"
            title="Crop image"
          >
            <CropIcon className="w-4 h-4" />
          </button>
        )}

        {/* Retry button (error state only) */}
        {isError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry(image.id);
            }}
            className="bg-white text-amber-600 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-amber-50 transition-colors shadow-xl border border-amber-100"
            title="Retry upload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(image.id)}
          className="bg-white text-red-500 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors shadow-xl border border-red-100"
          title="Remove image"
          disabled={disabled}
        >
          <X className="w-4 h-4 stroke-[2.5px]" />
        </button>
      </div>

      {/* Visual drag handle hint (centered, subtle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical className="w-10 h-10 text-white drop-shadow-lg" />
      </div>

      {/* File size indicator */}
      {image.fileSize > 0 && !image.isExisting && (
        <div className="absolute bottom-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-md">
            {formatFileSize(image.fileSize)}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Zoom Preview Modal ──────────────────────────────────────────────────

function ZoomModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <Image
          src={src}
          alt="Zoom preview"
          fill
          className="object-contain"
          sizes="90vw"
          unoptimized
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function ProductImageUploader({
  upload,
  maxImages = 10,
  cropAspect = 3 / 4,
  disabled = false,
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropData, setCropData] = useState<{ id: string; image: string } | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const { images, addFiles, removeImage, reorderImages, replaceImage, totalCount } = upload;

  // ─── DnD Kit sensors ──────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      // Long press (250ms) to start dragging on mobile, allows scrolling normally
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderImages(oldIndex, newIndex);
      }
    }
  }, [images, reorderImages]);

  // ─── File Input Handler ───────────────────────────────────────────────

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  // ─── Drag & Drop Handlers ────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only leave if we're actually leaving the drop zone
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, [addFiles, disabled]);

  // ─── Crop Handler ────────────────────────────────────────────────────

  const handleCropComplete = useCallback((blob: Blob) => {
    if (!cropData) return;

    const file = new File([blob], `cropped-${Date.now()}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    replaceImage(cropData.id, file);
    setCropData(null);
  }, [cropData, replaceImage]);

  // ─── Render ───────────────────────────────────────────────────────────

  const hasImages = images.length > 0;
  const canAddMore = totalCount < maxImages;

  return (
    <>
      <div className="space-y-4">
        {/* Upload status summary */}
        {upload.isUploading && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              Uploading {upload.uploadingCount} image{upload.uploadingCount > 1 ? 's' : ''}...
            </span>
          </div>
        )}

        {/* Pending status summary */}
        {!upload.isUploading && upload.images.some(img => img.status === 'pending') && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>
              {upload.images.filter(img => img.status === 'pending').length} image(s) ready to upload. Save product to start.
            </span>
          </div>
        )}

        {/* Image gallery (sortable) */}
        {hasImages && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map(img => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, idx) => (
                  <SortableImageTile
                    key={image.id}
                    image={image}
                    index={idx}
                    onRemove={removeImage}
                    onCrop={(id, url) => setCropData({ id, image: url })}
                    onZoom={(url) => setZoomSrc(url)}
                    onRetry={upload.retryImage}
                    disabled={disabled}
                  />
                ))}

                {/* Inline "add more" tile */}
                {canAddMore && (
                  <label
                    className={cn(
                      'relative aspect-square rounded-xl overflow-hidden border-2 border-dashed',
                      'flex flex-col items-center justify-center cursor-pointer transition-all',
                      'bg-gray-50/50 hover:bg-gray-100 hover:border-gray-400',
                      'border-gray-200',
                      disabled && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-bold">Add more</span>
                    <input
                      ref={images.length > 0 ? undefined : fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={disabled}
                    />
                  </label>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Main drop zone (shown when no images or always as secondary) */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl transition-all',
            hasImages ? 'h-24' : 'h-40',
            isDragOver
              ? 'border-blue-400 bg-blue-50/50 scale-[1.01]'
              : 'border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <Upload className={cn(
              'text-gray-400 mb-2 transition-colors',
              hasImages ? 'w-5 h-5' : 'w-8 h-8',
              isDragOver && 'text-blue-500',
            )} />
            <span className={cn(
              'text-gray-500 font-light',
              hasImages ? 'text-xs' : 'text-sm',
            )}>
              {isDragOver
                ? 'Drop images here'
                : hasImages
                  ? `Add more images (${totalCount}/${maxImages})`
                  : 'Drop images or click to upload'
              }
            </span>
            {!hasImages && (
              <span className="text-[10px] text-gray-400 mt-1">
                JPEG, PNG, WebP — Max {maxImages} images, 10MB each
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
          </label>
        </div>

        {/* Image count */}
        {hasImages && (
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {totalCount} image{totalCount !== 1 ? 's' : ''} · Drag to reorder · First image is the cover
            </span>
            <span>
              {upload.successCount}/{totalCount} uploaded
            </span>
          </div>
        )}
      </div>

      {/* Crop dialog */}
      {cropData && (
        <ImageCropper
          image={cropData.image}
          aspect={cropAspect}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropData(null)}
        />
      )}

      {/* Zoom modal */}
      {zoomSrc && (
        <ZoomModal src={zoomSrc} onClose={() => setZoomSrc(null)} />
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
