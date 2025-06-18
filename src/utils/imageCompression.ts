/**
 * Utility functions for image compression and optimization
 */

export interface CompressionOptions {
  maxSizeKB?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compresses a canvas to the smallest possible base64 string while maintaining quality
 */
export function compressCanvasImage(
  canvas: HTMLCanvasElement,
  options: CompressionOptions = {}
): string {
  const {
    maxSizeKB = 100, // Default max 100KB
    quality = 0.8,   // Default 80% quality
    format = 'jpeg'  // Default to JPEG for better compression
  } = options;

  // Try different compression levels
  const compressionLevels = [quality, 0.7, 0.6, 0.5, 0.4];
  
  for (const currentQuality of compressionLevels) {
    let compressedImage: string;
    
    if (format === 'jpeg') {
      compressedImage = canvas.toDataURL('image/jpeg', currentQuality);
    } else if (format === 'webp') {
      compressedImage = canvas.toDataURL('image/webp', currentQuality);
    } else {
      compressedImage = canvas.toDataURL('image/png');
    }
    
    // Calculate size in KB
    const sizeKB = (compressedImage.length * 3) / 4 / 1024; // Base64 size estimation
    
    if (sizeKB <= maxSizeKB) {
      return compressedImage;
    }
  }
  
  // If still too large, try PNG as last resort
  const pngImage = canvas.toDataURL('image/png');
  return pngImage;
}

/**
 * Gets the estimated size of a base64 image in KB
 */
export function getBase64SizeKB(base64String: string): number {
  // Remove data URL prefix if present
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate actual size (base64 is ~33% larger than binary)
  return (base64Data.length * 3) / 4 / 1024;
}

/**
 * Validates if an image meets size requirements
 */
export function validateImageSize(
  base64Image: string,
  maxSizeKB: number = 100
): { isValid: boolean; sizeKB: number; message?: string } {
  const sizeKB = getBase64SizeKB(base64Image);
  
  if (sizeKB <= maxSizeKB) {
    return { isValid: true, sizeKB };
  }
  
  return {
    isValid: false,
    sizeKB,
    message: `Image size (${sizeKB.toFixed(1)}KB) exceeds maximum allowed size (${maxSizeKB}KB)`
  };
}
