import { compressCanvasImage, getBase64SizeKB, validateImageSize } from './imageCompression';

// Mock canvas and context
const mockCanvas = {
  toDataURL: jest.fn(),
} as unknown as HTMLCanvasElement;

describe('imageCompression', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBase64SizeKB', () => {
    it('calculates size correctly for base64 string', () => {
      // A base64 string representing ~1KB of data
      const base64String = 'data:image/jpeg;base64,' + 'A'.repeat(1365); // ~1KB
      const sizeKB = getBase64SizeKB(base64String);
      expect(sizeKB).toBeCloseTo(1, 1);
    });

    it('handles base64 string without data URL prefix', () => {
      const base64String = 'A'.repeat(1365); // ~1KB
      const sizeKB = getBase64SizeKB(base64String);
      expect(sizeKB).toBeCloseTo(1, 1);
    });

    it('returns 0 for empty string', () => {
      const sizeKB = getBase64SizeKB('');
      expect(sizeKB).toBe(0);
    });
  });

  describe('validateImageSize', () => {
    it('validates image within size limit', () => {
      const smallImage = 'data:image/jpeg;base64,' + 'A'.repeat(100); // Very small
      const result = validateImageSize(smallImage, 100);
      
      expect(result.isValid).toBe(true);
      expect(result.sizeKB).toBeLessThan(1);
      expect(result.message).toBeUndefined();
    });

    it('rejects image exceeding size limit', () => {
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(200000); // ~150KB
      const result = validateImageSize(largeImage, 100);
      
      expect(result.isValid).toBe(false);
      expect(result.sizeKB).toBeGreaterThan(100);
      expect(result.message).toContain('exceeds maximum allowed size');
    });

    it('uses default max size when not specified', () => {
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(200000); // ~150KB
      const result = validateImageSize(largeImage);
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('(100KB)');
    });
  });

  describe('compressCanvasImage', () => {
    it('compresses image with JPEG format', () => {
      const mockJpegData = 'data:image/jpeg;base64,' + 'J'.repeat(1000);
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(mockJpegData);

      const result = compressCanvasImage(mockCanvas, {
        format: 'jpeg',
        quality: 0.8,
        maxSizeKB: 100
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(result).toBe(mockJpegData);
    });

    it('tries multiple quality levels if image is too large', () => {
      const largeImage = 'data:image/jpeg;base64,' + 'L'.repeat(200000); // Large
      const smallImage = 'data:image/jpeg;base64,' + 'S'.repeat(1000);   // Small

      (mockCanvas.toDataURL as jest.Mock)
        .mockReturnValueOnce(largeImage)  // First call (quality 0.8)
        .mockReturnValueOnce(largeImage)  // Second call (quality 0.7)
        .mockReturnValueOnce(smallImage); // Third call (quality 0.6)

      const result = compressCanvasImage(mockCanvas, {
        format: 'jpeg',
        quality: 0.8,
        maxSizeKB: 10 // Very small limit to force multiple attempts
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(3);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.6);
      expect(result).toBe(smallImage);
    });

    it('falls back to PNG if all JPEG attempts are too large', () => {
      const largeImage = 'data:image/jpeg;base64,' + 'L'.repeat(200000);
      const pngImage = 'data:image/png;base64,' + 'P'.repeat(1000);

      // Mock to return large image for all JPEG attempts, then small PNG for final call
      (mockCanvas.toDataURL as jest.Mock)
        .mockReturnValueOnce(largeImage) // quality 0.8
        .mockReturnValueOnce(largeImage) // quality 0.7
        .mockReturnValueOnce(largeImage) // quality 0.6
        .mockReturnValueOnce(largeImage) // quality 0.5
        .mockReturnValueOnce(largeImage) // quality 0.4
        .mockReturnValueOnce(pngImage);  // PNG fallback

      const result = compressCanvasImage(mockCanvas, {
        format: 'jpeg',
        maxSizeKB: 1 // Very small to force fallback
      });

      // Should try all quality levels (5 calls) plus PNG (1 call) = 6 total
      expect(mockCanvas.toDataURL).toHaveBeenCalledTimes(6);
      expect(mockCanvas.toDataURL).toHaveBeenLastCalledWith('image/png');
      expect(result).toBe(pngImage);
    });

    it('uses PNG format when specified', () => {
      const pngImage = 'data:image/png;base64,' + 'P'.repeat(1000);
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(pngImage);

      const result = compressCanvasImage(mockCanvas, {
        format: 'png',
        maxSizeKB: 100
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png');
      expect(result).toBe(pngImage);
    });

    it('uses WebP format when specified', () => {
      const webpImage = 'data:image/webp;base64,' + 'W'.repeat(1000);
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(webpImage);

      const result = compressCanvasImage(mockCanvas, {
        format: 'webp',
        quality: 0.8,
        maxSizeKB: 100
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp', 0.8);
      expect(result).toBe(webpImage);
    });

    it('uses default options when none provided', () => {
      const jpegImage = 'data:image/jpeg;base64,' + 'J'.repeat(1000);
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(jpegImage);

      const result = compressCanvasImage(mockCanvas);

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
      expect(result).toBe(jpegImage);
    });

    it('handles edge case with very small quality values', () => {
      const compressedImage = 'data:image/jpeg;base64,' + 'C'.repeat(500);
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(compressedImage);

      const result = compressCanvasImage(mockCanvas, {
        format: 'jpeg',
        quality: 0.1, // Very low quality
        maxSizeKB: 100
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.1);
      expect(result).toBe(compressedImage);
    });
  });

  describe('integration scenarios', () => {
    it('handles typical Wu-Tang canvas compression scenario', () => {
      // Simulate a typical Wu-Tang image
      const typicalImage = 'data:image/jpeg;base64,' + 'W'.repeat(50000); // ~37KB
      (mockCanvas.toDataURL as jest.Mock).mockReturnValue(typicalImage);

      const result = compressCanvasImage(mockCanvas, {
        maxSizeKB: 100,
        quality: 0.8,
        format: 'jpeg'
      });

      const validation = validateImageSize(result, 100);
      
      expect(validation.isValid).toBe(true);
      expect(validation.sizeKB).toBeLessThan(100);
      expect(result).toBe(typicalImage);
    });
  });
});
