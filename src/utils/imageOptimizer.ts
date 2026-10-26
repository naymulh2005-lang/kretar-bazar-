/**
 * Automatic Client-Side Image Optimizer for Kretar Bazar Kids & Baby
 * Compresses and resizes raw device/camera photos (up to 15MB) into ultra-lightweight
 * crisp WebP/JPEG format (~120KB - 250KB) before uploading to Firebase Cloud Storage.
 *
 * Saves 85-95% bandwidth and storage space, allowing 10,000+ photos to fit
 * completely within Firebase's 5GB free tier.
 */

export interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  savedPercent: number;
  dimensions: { width: number; height: number };
  format: 'webp' | 'jpeg';
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
}

export async function optimizeImageForUpload(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82
  } = options;

  const originalSize = file.size;

  // If not an image or SVG/GIF, pass through safely
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      savedPercent: 0,
      dimensions: { width: 0, height: 0 },
      format: 'jpeg'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Downscale if exceeds max bounds, maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback if canvas context fails
        return resolve({
          file,
          originalSize,
          optimizedSize: originalSize,
          savedPercent: 0,
          dimensions: { width: img.width, height: img.height },
          format: 'jpeg'
        });
      }

      // High-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // For transparent PNGs that will be exported to JPEG fallback, fill clean white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Try modern WebP first with JPEG fallback
      const tryExport = (format: 'image/webp' | 'image/jpeg') => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              if (format === 'image/webp') {
                return tryExport('image/jpeg');
              }
              return resolve({
                file,
                originalSize,
                optimizedSize: originalSize,
                savedPercent: 0,
                dimensions: { width, height },
                format: 'jpeg'
              });
            }

            const ext = format === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
            const optimizedFileName = `${baseName}_kb.${ext}`;

            const optimizedFile = new File([blob], optimizedFileName, {
              type: format,
              lastModified: Date.now()
            });

            const optimizedSize = optimizedFile.size;
            const savedPercent = originalSize > 0 
              ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100))
              : 0;

            resolve({
              file: optimizedFile,
              originalSize,
              optimizedSize,
              savedPercent,
              dimensions: { width, height },
              format: format === 'image/webp' ? 'webp' : 'jpeg'
            });
          },
          format,
          quality
        );
      };

      tryExport('image/webp');
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        file,
        originalSize,
        optimizedSize: originalSize,
        savedPercent: 0,
        dimensions: { width: 0, height: 0 },
        format: 'jpeg'
      });
    };

    img.src = objectUrl;
  });
}
