import { mintWuTangNFT } from './mintWuTangNFT';
import { ethers } from 'ethers';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    parseEther: jest.fn().mockReturnValue('2000000000000000'),
    formatEther: jest.fn().mockReturnValue('0.002'),
  },
}));

// Mock DOM APIs
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn().mockReturnValue({
    drawImage: jest.fn(),
  }),
  toDataURL: jest.fn().mockReturnValue('data:image/jpeg;base64,mockCompressedImage'),
};

const mockImage = {
  onload: null as (() => void) | null,
  src: '',
};

// Mock global DOM objects
global.Image = jest.fn().mockImplementation(() => mockImage);

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = jest.fn().mockImplementation((tagName) => {
  if (tagName === 'canvas') {
    return mockCanvas;
  }
  return originalCreateElement.call(document, tagName);
});

describe('mintWuTangNFT', () => {
  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  };

  const mockContract = {
    mintNFT: jest.fn(),
  };

  const mockParams = {
    signer: mockSigner as unknown as ethers.Signer,
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    wuName: 'Ghostface Killah',
    base64Image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ethers.Contract as jest.Mock).mockReturnValue(mockContract);
    mockContract.mintNFT.mockResolvedValue({
      hash: '0xabcdef123456789',
      wait: jest.fn().mockResolvedValue({
        status: 1,
        transactionHash: '0xabcdef123456789',
      }),
    });

    // Reset image mock
    mockImage.onload = null;
    mockImage.src = '';
  });

  afterAll(() => {
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('creates contract with correct parameters', async () => {
    // Trigger image load immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await mintWuTangNFT(mockParams);

    expect(ethers.Contract).toHaveBeenCalledWith(
      mockParams.contractAddress,
      expect.any(Array), // ABI
      mockParams.signer
    );
  });

  it('calls mintNFT with correct parameters', async () => {
    // Trigger image load immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await mintWuTangNFT(mockParams);

    expect(mockContract.mintNFT).toHaveBeenCalledWith(
      '0x1234567890123456789012345678901234567890',
      expect.stringContaining('data:application/json;base64,'),
      { value: '2000000000000000', gasLimit: 30000000 }
    );
  });

  it('creates correct NFT metadata', async () => {
    // Trigger image load immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await mintWuTangNFT(mockParams);

    const callArgs = mockContract.mintNFT.mock.calls[0];
    const tokenURI = callArgs[1];
    
    // Decode the base64 metadata
    const base64Data = tokenURI.split(',')[1];
    const decodedData = Buffer.from(base64Data, 'base64').toString();
    const metadata = JSON.parse(decodedData);

    expect(metadata).toEqual({
      name: 'Ghostface Killah',
      description: 'Wu-Tang Name Generator NFT',
      image: 'data:image/jpeg;base64,mockCompressedImage',
    });
  });

  it('returns transaction object on success', async () => {
    // Trigger image load immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    const result = await mintWuTangNFT(mockParams);

    expect(result).toEqual({
      hash: '0xabcdef123456789',
      wait: expect.any(Function),
    });
  });

  it('throws error when contract call fails', async () => {
    const error = new Error('Contract call failed');
    mockContract.mintNFT.mockRejectedValue(error);

    // Trigger image load immediately
    setTimeout(() => {
      if (mockImage.onload) mockImage.onload();
    }, 0);

    await expect(mintWuTangNFT(mockParams)).rejects.toThrow('Contract call failed');
  });
});
