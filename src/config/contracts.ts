// Contract configuration for different networks
export const CONTRACT_CONFIG = {
  // Base Mainnet
  8453: {
    name: "Base Mainnet",
    contractAddress: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    explorerUrl: "https://basescan.org",
  },
  // Base Sepolia Testnet
  84532: {
    name: "Base Sepolia",
    contractAddress: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
    explorerUrl: "https://sepolia.basescan.org",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CONTRACT_CONFIG).map(Number);

export const getContractConfig = (chainId: number) => {
  return CONTRACT_CONFIG[chainId as keyof typeof CONTRACT_CONFIG];
};
