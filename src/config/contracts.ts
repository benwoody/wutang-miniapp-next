// Contract configuration for different networks
export const CONTRACT_CONFIG = {
  // Base Mainnet
  8453: {
    name: "Base Mainnet",
    contractAddress: "0x18f2589406bda8202C979F5d9c79400d16Ff25C5", // Deployed!
    explorerUrl: "https://basescan.org",
  },
  // Base Sepolia Testnet
  84532: {
    name: "Base Sepolia",
    contractAddress: "0x18f2589406bda8202C979F5d9c79400d16Ff25C5", // Same contract deployed to both networks
    explorerUrl: "https://sepolia.basescan.org",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CONTRACT_CONFIG).map(Number);

export const getContractConfig = (chainId: number) => {
  return CONTRACT_CONFIG[chainId as keyof typeof CONTRACT_CONFIG];
};
