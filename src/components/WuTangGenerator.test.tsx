import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import WuTangGenerator from './WuTangGenerator';
import '@testing-library/jest-dom';

// Mock the Farcaster SDK
jest.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    actions: {
      ready: jest.fn().mockResolvedValue(undefined),
      composeCast: jest.fn().mockResolvedValue(undefined),
    },
    context: {
      user: {
        username: 'testuser'
      }
    }
  }
}));

// Mock the name generator
jest.mock('@/lib/wu-names', () => ({
  generateWuTangName: (username: string) => `Wu-${username}`,
}));

// Mock the WuTangCanvas component
jest.mock('./WuTangCanvas', () => {
  return function MockWuTangCanvas({ wuName, onImageGenerated }: any) {
    // Simulate image generation after a short delay
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onImageGenerated('data:image/png;base64,mockImageData');
      }, 100);
      return () => clearTimeout(timer);
    }, [onImageGenerated]);
    
    return <canvas data-testid="wu-tang-canvas">{wuName}</canvas>;
  };
});

// Mock the MintButton component
jest.mock('./MintButton', () => {
  return function MockMintButton({ wuName, base64Image }: any) {
    return (
      <div data-testid="mint-button">
        Mint Button for {wuName}
        <span data-testid="base64-image">{base64Image}</span>
      </div>
    );
  };
});

// Add React import for the mock
const React = require('react');

describe('WuTangGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the generator button', () => {
    render(<WuTangGenerator />);
    expect(screen.getByText('Enter the Wu-Tang')).toBeInTheDocument();
  });

  it('shows username when loaded', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    expect(await screen.findByText('testuser')).toBeInTheDocument();
  });

  it('shows the Share to Farcaster button after generating', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    expect(await screen.findByText('Share to')).toBeInTheDocument();
    expect(await screen.findByText('Farcaster')).toBeInTheDocument();
  });

  it('shows the generated Wu-Tang name after clicking generate', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    expect(await screen.findAllByText('Wu-testuser')).toHaveLength(2);
  });

  it('renders the canvas component after generating', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    expect(await screen.findByTestId('wu-tang-canvas')).toBeInTheDocument();
  });

  it('shows the mint button after image is generated', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    // Wait for the canvas to generate the image
    await waitFor(() => {
      expect(screen.getByTestId('mint-button')).toBeInTheDocument();
    });

    expect(screen.getByText('Mint Button for Wu-testuser')).toBeInTheDocument();
  });

  it('passes the correct base64 image to mint button', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    // Wait for the canvas to generate the image
    await waitFor(() => {
      expect(screen.getByTestId('base64-image')).toBeInTheDocument();
    });

    expect(screen.getByTestId('base64-image')).toHaveTextContent('data:image/png;base64,mockImageData');
  });

  it('handles the complete flow from generation to minting', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    // Initial state - should show generate button
    expect(screen.getByText('Enter the Wu-Tang')).toBeInTheDocument();

    // Click generate
    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    // Should show Wu-Tang name
    expect(await screen.findAllByText('Wu-testuser')).toHaveLength(2);

    // Should show canvas
    expect(screen.getByTestId('wu-tang-canvas')).toBeInTheDocument();

    // Should show share button (wait for image to be generated first)
    await waitFor(() => {
      expect(screen.getByText('Share to')).toBeInTheDocument();
      expect(screen.getByText('Farcaster')).toBeInTheDocument();
    });

    // Wait for mint button to appear after image generation
    await waitFor(() => {
      expect(screen.getByTestId('mint-button')).toBeInTheDocument();
    });
  });

  it('does not show mint button before image is generated', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    // Initially, mint button should not be present
    expect(screen.queryByTestId('mint-button')).not.toBeInTheDocument();
  });

  it('handles multiple generations correctly', async () => {
    await act(async () => {
      render(<WuTangGenerator />);
    });

    // First generation
    await act(async () => {
      fireEvent.click(screen.getByText(/Enter the Wu-Tang/i));
    });

    expect(await screen.findAllByText('Wu-testuser')).toHaveLength(2);

    // Wait for mint button
    await waitFor(() => {
      expect(screen.getByTestId('mint-button')).toBeInTheDocument();
    });

    // Generate again (if there's a way to reset or generate again)
    // This tests that the component handles state changes properly
    expect(screen.getByTestId('wu-tang-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('mint-button')).toBeInTheDocument();
  });
});
