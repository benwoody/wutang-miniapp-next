import { getContractConfig, SUPPORTED_CHAIN_IDS } from './contracts';

describe('Contract Configuration', () => {
  describe('SUPPORTED_CHAIN_IDS', () => {
    it('includes Base Mainnet and Base Sepolia', () => {
      expect(SUPPORTED_CHAIN_IDS).toContain(8453); // Base Mainnet
      expect(SUPPORTED_CHAIN_IDS).toContain(84532); // Base Sepolia
    });

    it('is an array of numbers', () => {
      expect(Array.isArray(SUPPORTED_CHAIN_IDS)).toBe(true);
      SUPPORTED_CHAIN_IDS.forEach(chainId => {
        expect(typeof chainId).toBe('number');
      });
    });
  });

  describe('getContractConfig', () => {
    it('returns Base Mainnet config for chain ID 8453', () => {
      const config = getContractConfig(8453);
      
      expect(config).toEqual({
        contractAddress: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
        name: 'Base Mainnet',
        explorerUrl: 'https://basescan.org',
      });
    });

    it('returns Base Sepolia config for chain ID 84532', () => {
      const config = getContractConfig(84532);
      
      expect(config).toEqual({
        contractAddress: expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
        name: 'Base Sepolia',
        explorerUrl: 'https://sepolia.basescan.org',
      });
    });

    it('returns undefined for unsupported chain ID', () => {
      const config = getContractConfig(1); // Ethereum Mainnet
      expect(config).toBeUndefined();
    });

    it('returns undefined for invalid chain ID', () => {
      const config = getContractConfig(999999);
      expect(config).toBeUndefined();
    });

    it('handles negative chain IDs', () => {
      const config = getContractConfig(-1);
      expect(config).toBeUndefined();
    });

    it('handles zero chain ID', () => {
      const config = getContractConfig(0);
      expect(config).toBeUndefined();
    });
  });

  describe('contract addresses', () => {
    it('Base Mainnet has valid contract address format', () => {
      const config = getContractConfig(8453);
      expect(config?.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      // Note: Currently using placeholder address, will be updated when deployed
    });

    it('Base Sepolia has valid contract address format', () => {
      const config = getContractConfig(84532);
      expect(config?.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      // Note: Currently using placeholder address, will be updated when deployed
    });

    it('mainnet uses placeholder, sepolia has deployed contract', () => {
      const mainnetConfig = getContractConfig(8453);
      const sepoliaConfig = getContractConfig(84532);
      
      // Mainnet still uses placeholder address
      expect(mainnetConfig?.contractAddress).toBe('0x0000000000000000000000000000000000000000');
      // Sepolia has deployed contract
      expect(sepoliaConfig?.contractAddress).toBe('0x18f2589406bda8202C979F5d9c79400d16Ff25C5');
    });
  });

  describe('explorer URLs', () => {
    it('Base Mainnet has correct explorer URL', () => {
      const config = getContractConfig(8453);
      expect(config?.explorerUrl).toBe('https://basescan.org');
    });

    it('Base Sepolia has correct explorer URL', () => {
      const config = getContractConfig(84532);
      expect(config?.explorerUrl).toBe('https://sepolia.basescan.org');
    });

    it('explorer URLs are valid HTTPS URLs', () => {
      const mainnetConfig = getContractConfig(8453);
      const sepoliaConfig = getContractConfig(84532);
      
      expect(mainnetConfig?.explorerUrl).toMatch(/^https:\/\/.+/);
      expect(sepoliaConfig?.explorerUrl).toMatch(/^https:\/\/.+/);
    });
  });

  describe('network names', () => {
    it('Base Mainnet has correct name', () => {
      const config = getContractConfig(8453);
      expect(config?.name).toBe('Base Mainnet');
    });

    it('Base Sepolia has correct name', () => {
      const config = getContractConfig(84532);
      expect(config?.name).toBe('Base Sepolia');
    });

    it('network names are non-empty strings', () => {
      const mainnetConfig = getContractConfig(8453);
      const sepoliaConfig = getContractConfig(84532);
      
      expect(typeof mainnetConfig?.name).toBe('string');
      expect(typeof sepoliaConfig?.name).toBe('string');
      expect(mainnetConfig?.name.length).toBeGreaterThan(0);
      expect(sepoliaConfig?.name.length).toBeGreaterThan(0);
    });
  });

  describe('configuration consistency', () => {
    it('all supported chain IDs have configurations', () => {
      SUPPORTED_CHAIN_IDS.forEach(chainId => {
        const config = getContractConfig(chainId);
        expect(config).not.toBeNull();
        expect(config).toHaveProperty('contractAddress');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('explorerUrl');
      });
    });

    it('configurations have all required properties', () => {
      SUPPORTED_CHAIN_IDS.forEach(chainId => {
        const config = getContractConfig(chainId);
        expect(config).toMatchObject({
          contractAddress: expect.any(String),
          name: expect.any(String),
          explorerUrl: expect.any(String),
        });
      });
    });

    it('contract addresses are different (mainnet placeholder, sepolia deployed)', () => {
      const addresses = SUPPORTED_CHAIN_IDS.map(chainId => {
        const config = getContractConfig(chainId);
        return config?.contractAddress;
      });

      // Now we have different addresses: mainnet placeholder, sepolia deployed
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(2);
      expect(addresses).toContain('0x0000000000000000000000000000000000000000'); // Mainnet placeholder
      expect(addresses).toContain('0x18f2589406bda8202C979F5d9c79400d16Ff25C5'); // Sepolia deployed
    });
  });

  describe('edge cases', () => {
    it('handles floating point chain IDs', () => {
      const config = getContractConfig(8453.5);
      expect(config).toBeUndefined();
    });

    it('handles string chain IDs', () => {
      // @ts-ignore - testing runtime behavior
      const config = getContractConfig('8453');
      // JavaScript coerces string '8453' to number 8453, so this actually works
      expect(config).toBeDefined();
      expect(config?.name).toBe('Base Mainnet');
    });

    it('handles null chain ID', () => {
      // @ts-ignore - testing runtime behavior
      const config = getContractConfig(null);
      expect(config).toBeUndefined();
    });

    it('handles undefined chain ID', () => {
      // @ts-ignore - testing runtime behavior
      const config = getContractConfig(undefined);
      expect(config).toBeUndefined();
    });
  });
});
