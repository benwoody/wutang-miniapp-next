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

describe('mintWuTangNFT', () => {
  const mockSigner = {
    getAddress: jest.fn().mockResolvedValue('0x1234567890123456789012345678901234567890'),
  };

  const mockContract = {
    mintNFT: jest.fn(),
  };

  const mockParams = {
    signer: mockSigner as any,
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
  });

  it('creates contract with correct parameters', async () => {
    await mintWuTangNFT(mockParams);

    expect(ethers.Contract).toHaveBeenCalledWith(
      mockParams.contractAddress,
      expect.any(Array), // ABI
      mockParams.signer
    );
  });

  it('calls mintNFT with correct parameters', async () => {
    await mintWuTangNFT(mockParams);

    expect(mockContract.mintNFT).toHaveBeenCalledWith(
      '0x1234567890123456789012345678901234567890',
      expect.stringContaining('data:application/json;base64,'),
      { value: '2000000000000000' }
    );
  });

  it('creates correct NFT metadata', async () => {
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
      image: mockParams.base64Image,
    });
  });

  it('returns transaction object on success', async () => {
    const result = await mintWuTangNFT(mockParams);

    expect(result).toEqual({
      hash: '0xabcdef123456789',
      wait: expect.any(Function),
    });
  });

  it('throws error when contract call fails', async () => {
    const error = new Error('Contract call failed');
    mockContract.mintNFT.mockRejectedValue(error);

    await expect(mintWuTangNFT(mockParams)).rejects.toThrow('Contract call failed');
  });

  it('handles user rejection error', async () => {
    const error = { code: 'ACTION_REJECTED', message: 'User rejected transaction' };
    mockContract.mintNFT.mockRejectedValue(error);

    await expect(mintWuTangNFT(mockParams)).rejects.toEqual(error);
  });

  it('handles insufficient funds error', async () => {
    const error = new Error('insufficient funds for intrinsic transaction cost');
    mockContract.mintNFT.mockRejectedValue(error);

    await expect(mintWuTangNFT(mockParams)).rejects.toThrow('insufficient funds for intrinsic transaction cost');
  });

  it('handles already minted error', async () => {
    const error = new Error('User has already minted');
    mockContract.mintNFT.mockRejectedValue(error);

    await expect(mintWuTangNFT(mockParams)).rejects.toThrow('User has already minted');
  });

  it('handles incorrect ETH amount error', async () => {
    const error = new Error('Incorrect ETH amount sent');
    mockContract.mintNFT.mockRejectedValue(error);

    await expect(mintWuTangNFT(mockParams)).rejects.toThrow('Incorrect ETH amount sent');
  });

  describe('edge cases', () => {
    it('handles empty wu name', async () => {
      const paramsWithEmptyName = { ...mockParams, wuName: '' };
      
      await mintWuTangNFT(paramsWithEmptyName);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(metadata.name).toBe('');
    });

    it('handles empty base64 image', async () => {
      const paramsWithEmptyImage = { ...mockParams, base64Image: '' };
      
      await mintWuTangNFT(paramsWithEmptyImage);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(metadata.image).toBe('');
    });

    it('handles special characters in wu name', async () => {
      const specialName = 'Ghostface "The Killer" Killah & Co.';
      const paramsWithSpecialName = { ...mockParams, wuName: specialName };
      
      await mintWuTangNFT(paramsWithSpecialName);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(metadata.name).toBe(specialName);
    });

    it('handles very long wu name', async () => {
      const longName = 'A'.repeat(1000);
      const paramsWithLongName = { ...mockParams, wuName: longName };
      
      await mintWuTangNFT(paramsWithLongName);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(metadata.name).toBe(longName);
    });
  });

  describe('metadata validation', () => {
    it('creates valid JSON metadata', async () => {
      await mintWuTangNFT(mockParams);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      
      expect(tokenURI).toMatch(/^data:application\/json;base64,/);
      
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      
      // Should not throw when parsing JSON
      expect(() => JSON.parse(decodedData)).not.toThrow();
    });

    it('includes all required metadata fields', async () => {
      await mintWuTangNFT(mockParams);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('image');
    });

    it('has correct metadata structure', async () => {
      await mintWuTangNFT(mockParams);

      const callArgs = mockContract.mintNFT.mock.calls[0];
      const tokenURI = callArgs[1];
      const base64Data = tokenURI.split(',')[1];
      const decodedData = Buffer.from(base64Data, 'base64').toString();
      const metadata = JSON.parse(decodedData);

      expect(typeof metadata.name).toBe('string');
      expect(typeof metadata.description).toBe('string');
      expect(typeof metadata.image).toBe('string');
    });
  });
});
