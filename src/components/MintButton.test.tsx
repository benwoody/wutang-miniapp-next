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

// Mock test contract utility
jest.mock('@/utils/testContract', () => ({
  testContractConnection: jest.fn().mockResolvedValue(true),
}));

// Mock image compression utility
jest.mock('@/utils/imageCompression', () => ({
  getBase64SizeKB: jest.fn().mockReturnValue(50), // 50KB - under limit
  validateImageSize: jest.fn().mockReturnValue({ isValid: true }),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock ethers
const mockSigner = {
  getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
};

const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ chainId: 8453 }),
  getSigner: jest.fn().mockResolvedValue(mockSigner),
};

const mockContract = {
  hasMinted: jest.fn().mockResolvedValue(false),
};

jest.mock('ethers', () => ({
  ethers: {
    BrowserProvider: jest.fn().mockImplementation(() => mockProvider),
    JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
    Contract: jest.fn().mockImplementation(() => mockContract),
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
        request: jest.fn().mockImplementation((params) => {
          if (params.method === 'eth_accounts') {
            return Promise.resolve(['0x1234567890123456789012345678901234567890']);
          }
          if (params.method === 'eth_chainId') {
            return Promise.resolve('0x2105'); // 8453 in hex
          }
          return Promise.resolve();
        }),
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
    mockContract.hasMinted.mockResolvedValue(false);
  });

  it('renders mint NFT button', async () => {
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for the initial mint status check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    expect(screen.getByText('(0.002 ETH)')).toBeInTheDocument();
  });

  it('shows checking status initially', async () => {
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Should show checking initially
    expect(screen.getByText('Checking...')).toBeInTheDocument();
    
    // Then should show mint button after check completes
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
  });

  it('shows already minted when user has minted', async () => {
    mockContract.hasMinted.mockResolvedValue(true);
    
    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    await waitFor(() => {
      expect(screen.getByText('Already Minted')).toBeInTheDocument();
    });
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
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
      expect(screen.getByText('Minting...')).toBeInTheDocument();
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

    // After successful mint, the button should show "Already Minted"
    await waitFor(() => {
      expect(screen.getByText('Already Minted')).toBeInTheDocument();
    });
  });

  it('disables button during minting', async () => {
    mockMintWuTangNFT.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<MintButton base64Image={mockBase64Image} wuName={mockWuName} />);
    
    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByText('Mint as NFT')).toBeInTheDocument();
    });
    
    const button = screen.getByRole('button');
    
    act(() => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(button).toBeDisabled();
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
