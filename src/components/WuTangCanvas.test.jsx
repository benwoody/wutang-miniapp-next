import { render, waitFor, screen } from '@testing-library/react';
import WuTangCanvas from './WuTangCanvas';
import '@testing-library/jest-dom';

// Mock HTMLCanvasElement methods
const mockGetContext = jest.fn();
const mockToDataURL = jest.fn();
const mockClearRect = jest.fn();
const mockDrawImage = jest.fn();
const mockFillText = jest.fn();
const mockStrokeText = jest.fn();

// Mock Image constructor
let mockImageOnLoad = null;
const mockImage = {
  set onload(callback) {
    mockImageOnLoad = callback;
    // Automatically trigger onload after a short delay
    setTimeout(() => {
      if (callback) callback();
    }, 10);
  },
  get onload() {
    return mockImageOnLoad;
  },
  src: '',
};

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = mockGetContext;
  HTMLCanvasElement.prototype.toDataURL = mockToDataURL;
  
  // Mock Image constructor
  global.Image = jest.fn(() => mockImage);
});

describe('WuTangCanvas', () => {
  const mockOnImageGenerated = jest.fn();
  const mockWuName = 'Ghostface Killah';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock canvas context
    const mockContext = {
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      lineWidth: 0,
      strokeStyle: '',
      clearRect: mockClearRect,
      fillRect: jest.fn(),
      fillText: mockFillText,
      strokeText: mockStrokeText,
      measureText: jest.fn().mockReturnValue({ width: 100 }),
      drawImage: mockDrawImage,
    };
    
    mockGetContext.mockReturnValue(mockContext);
    mockToDataURL.mockReturnValue('data:image/png;base64,mockImageData');
    
    // Reset image mock
    mockImageOnLoad = null;
  });

  it('renders a canvas element', () => {
    const { container } = render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('sets correct canvas dimensions', () => {
    const { container } = render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveAttribute('width', '400');
    expect(canvas).toHaveAttribute('height', '300');
  });

  it('calls onImageGenerated with base64 data after image loads', async () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    await waitFor(() => {
      expect(mockOnImageGenerated).toHaveBeenCalledWith('data:image/png;base64,mockImageData');
    }, { timeout: 1000 });
  });

  it('gets 2d context from canvas', () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('calls toDataURL to generate image after drawing', async () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    await waitFor(() => {
      expect(mockToDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    }, { timeout: 1000 });
  });

  it('draws on canvas after image loads', async () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    await waitFor(() => {
      expect(mockClearRect).toHaveBeenCalled();
      expect(mockDrawImage).toHaveBeenCalled();
      expect(mockStrokeText).toHaveBeenCalledWith(mockWuName, 200, 153);
      expect(mockFillText).toHaveBeenCalledWith(mockWuName, 200, 153);
    }, { timeout: 1000 });
  });

  it('does not render canvas when wu name is empty', () => {
    const { container } = render(
      <WuTangCanvas wuName="" onImageGenerated={mockOnImageGenerated} />
    );
    
    const canvas = container.querySelector('canvas');
    expect(canvas).toHaveClass('hidden');
  });

  it('handles canvas context not available', () => {
    mockGetContext.mockReturnValue(null);
    
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    // Should not crash when context is not available
    expect(mockGetContext).toHaveBeenCalledWith('2d');
  });

  it('creates new Image instance', () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    expect(global.Image).toHaveBeenCalled();
  });

  it('sets image source to wu-logo.png', () => {
    render(
      <WuTangCanvas wuName={mockWuName} onImageGenerated={mockOnImageGenerated} />
    );

    expect(mockImage.src).toBe('/assets/wu-logo.png');
  });

  describe('component lifecycle', () => {
    it('regenerates image when wu name changes', async () => {
      const { rerender } = render(
        <WuTangCanvas wuName="First Name" onImageGenerated={mockOnImageGenerated} />
      );

      await waitFor(() => {
        expect(mockOnImageGenerated).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Clear mocks and rerender with new name
      jest.clearAllMocks();
      mockGetContext.mockReturnValue({
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 0,
        strokeStyle: '',
        clearRect: mockClearRect,
        fillRect: jest.fn(),
        fillText: mockFillText,
        strokeText: mockStrokeText,
        measureText: jest.fn().mockReturnValue({ width: 100 }),
        drawImage: mockDrawImage,
      });

      rerender(
        <WuTangCanvas wuName="Second Name" onImageGenerated={mockOnImageGenerated} />
      );

      await waitFor(() => {
        expect(global.Image).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('handles callback changes without regenerating image', async () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();

      const { rerender, container } = render(
        <WuTangCanvas wuName={mockWuName} onImageGenerated={firstCallback} />
      );

      await waitFor(() => {
        expect(firstCallback).toHaveBeenCalled();
      }, { timeout: 1000 });

      rerender(
        <WuTangCanvas wuName={mockWuName} onImageGenerated={secondCallback} />
      );

      // Component should handle callback changes gracefully
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles very long wu name', async () => {
      const longName = 'A'.repeat(100);
      render(
        <WuTangCanvas wuName={longName} onImageGenerated={mockOnImageGenerated} />
      );

      await waitFor(() => {
        expect(mockFillText).toHaveBeenCalledWith(longName, 200, 153);
      }, { timeout: 1000 });
    });

    it('handles special characters in wu name', async () => {
      const specialName = 'Ghostface "The Killer" Killah & Co. 🎤';
      render(
        <WuTangCanvas wuName={specialName} onImageGenerated={mockOnImageGenerated} />
      );

      await waitFor(() => {
        expect(mockFillText).toHaveBeenCalledWith(specialName, 200, 153);
      }, { timeout: 1000 });
    });

    it('handles missing onImageGenerated callback', async () => {
      render(
        <WuTangCanvas wuName={mockWuName} />
      );

      // Should not crash when callback is not provided
      await waitFor(() => {
        expect(mockDrawImage).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });
});
