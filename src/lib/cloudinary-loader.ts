export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If it's not a Cloudinary URL, return as is
  if (!src.includes('res.cloudinary.com')) {
    return src;
  }

  // Extract base URL and options
  // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[transformations]/[version]/[public_id].[ext]
  
  // We want to inject or replace transformations
  // Standard optimizations: f_auto (format), q_auto (quality), w_[width] (width), c_limit (fit)
  const params = [
    `w_${width}`,
    'c_limit',
    `q_${quality || 'auto'}`,
    'f_auto',
    'g_auto',
  ].join(',');

  // If the URL already has transformations, we need to be careful
  // But usually, we just want to replace the /upload/ part with /upload/[params]/
  if (src.includes('/upload/')) {
    return src.replace('/upload/', `/upload/${params}/`);
  }

  return src;
}
