// Contract configuration for different networks
export const CONTRACT_CONFIG = {
  // Base Mainnet - DEPLOYED!
  8453: {
    name: "Base Mainnet",
    contractAddress: "0xBF7Af03bbE41A9638c693f1BA0F320759ee6369F", // DEPLOYED TO MAINNET!
    explorerUrl: "https://basescan.org",
  },
  // Base Sepolia Testnet - DEPLOYED
  84532: {
    name: "Base Sepolia",
    contractAddress: "0x18604C6242b1995d4FcFD1bfa4311c60F28A3f74", // DEPLOYED HERE
    explorerUrl: "https://sepolia.basescan.org",
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CONTRACT_CONFIG).map(Number);

export const getContractConfig = (chainId: number) => {
  return CONTRACT_CONFIG[chainId as keyof typeof CONTRACT_CONFIG];
};
