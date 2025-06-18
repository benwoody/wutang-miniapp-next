import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import MintButton from './MintButton';
import '@testing-library/jest-dom';

// Mock the minting utility
jest.mock('@/utils/mintWuTangNFT', () => ({
  mintWuTangNFT: jest.fn(),
}));

import { mintWuTangNFT } from '@/utils/mintWuTangNFT';
const mockMintWuTangNFT = mintWuTangNFT as jest.MockedFunction<typeof mintWuTangNFT>;

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({ chainId: 8453 }),
      getSigner: jest.fn().mockResolvedValue({
        getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
      }),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      hasMinted: jest.fn().mockResolvedValue(false),
    })),
  },
}));

// Mock the contract config
jest.mock('@/config/contracts', () => ({
  getContractConfig: jest.fn().mockReturnValue({
    contractAddress: '0x1234567890123456789012345678901234567890',
    name: 'Base Mainnet',
    explorerUrl: 'https://basescan.org',
  }),
  SUPPORTED_CHAIN_IDS: [8453, 84532],
}));

// Mock Farcaster SDK
jest.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    context: Promise.resolve({
      client: { id: 'test-client' },
      user: { fid: 12345 },
    }),
    wallet: {
      getEthereumProvider: jest.fn().mockResolvedValue({
        request: jest.fn(),
      }),
    },
  },
}));

describe('MintButton', () => {
  const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const mockWuName = 'Ghostface Killah';

  beforeEach(() => {
    jest.clearAllMocks();
    mockMintWuTangNFT.mockResolvedValue({
      hash: '0xabcdef123456789',
    });
  });

  it('renders mint NFT button', async () => {
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for the initial mint status check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    expect(screen.getByText('(0.002 ETH)')).toBeInTheDocument();
  });

  it('calls mint function when clicked', async () => {
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for the initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    expect(mockMintWuTangNFT).toHaveBeenCalledWith({
      signer: expect.objectContaining({
        getAddress: expect.any(Function),
      }),
      contractAddress: '0x1234567890123456789012345678901234567890',
      wuName: mockWuName,
      base64Image: mockBase64Image,
    });
  });

  it('shows loading state during minting', async () => {
    mockMintWuTangNFT.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    act(() => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Minting NFT...')).toBeInTheDocument();
    });
  });

  it('shows success message after successful mint', async () => {
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('NFT minted successfully! 🎉')).toBeInTheDocument();
    });
  });

  it('shows error message when user already minted', async () => {
    const mockError = new Error('User has already minted');
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('You have already minted an NFT')).toBeInTheDocument();
    });
  });

  it('shows error message when incorrect ETH amount', async () => {
    const mockError = new Error('Incorrect ETH amount');
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Incorrect ETH amount (need 0.002 ETH)')).toBeInTheDocument();
    });
  });

  it('shows error message when transaction is cancelled', async () => {
    const mockError = { code: 'ACTION_REJECTED' };
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Transaction cancelled by user')).toBeInTheDocument();
    });
  });

  it('shows network error message', async () => {
    const mockError = new Error('Please switch to Base network. Supported networks: Base Mainnet (8453) or Base Sepolia (84532). Current: 1');
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Please switch to Base network. Supported networks: Base Mainnet (8453) or Base Sepolia (84532). Current: 1')).toBeInTheDocument();
    });
  });

  it('shows wallet not found error', async () => {
    const mockError = new Error('No wallet found');
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Please open in Farcaster app or connect external wallet')).toBeInTheDocument();
    });
  });

  it('shows generic error message for unknown errors', async () => {
    const mockError = new Error('Unknown error');
    mockMintWuTangNFT.mockRejectedValue(mockError);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    await waitFor(() => {
      expect(screen.getByText('Mint failed: Unknown error')).toBeInTheDocument();
    });
  });

  it('disables button during minting', async () => {
    mockMintWuTangNFT.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    const button = screen.getByRole('button');
    
    act(() => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
  });

  it('shows different status messages during the process', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    mockMintWuTangNFT.mockReturnValue(promise);

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    act(() => {
      fireEvent.click(screen.getByText('Mint as NFT'));
    });

    // Should show checking wallet first
    expect(screen.getByText('Checking wallet...')).toBeInTheDocument();

    // Resolve the promise to complete the flow
    act(() => {
      resolvePromise!({ hash: '0xabcdef123456789' });
    });

    await waitFor(() => {
      expect(screen.getByText('NFT minted successfully! 🎉')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty base64Image', async () => {
      render(<MintButton base64Image="" wuName={mockWuName} />);
      await waitFor(() => {
        expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
      });
    });

    it('handles empty wuName', async () => {
      render(<MintButton base64Image={mockBase64Image} wuName="" />);
      await waitFor(() => {
        expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
      });
    });
  });
});
