import { useState, useEffect, useCallback } from "react";
import { mintWuTangNFT } from "@/utils/mintWuTangNFT";
import { ethers } from "ethers";
import { getContractConfig, SUPPORTED_CHAIN_IDS } from "@/config/contracts";
import { sdk } from '@farcaster/frame-sdk';
import { logger } from "@/utils/logger";

export default function MintButton({
  wuName,
  base64Image,
}: {
  wuName: string;
  base64Image: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [hasAlreadyMinted, setHasAlreadyMinted] = useState<boolean>(false);
  const [isCheckingMintStatus, setIsCheckingMintStatus] = useState<boolean>(true);
  const [, setWalletType] = useState<string | null>(null);

  const checkNetworkAndGetConfig = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    logger.debug(`🔍 Current wallet network: ${chainId}`);
    
    // Check if we're forcing testnet mode via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceTestnet = urlParams.get('testnet') === 'true';
    
    logger.debug(`🔍 Testnet mode from URL: ${forceTestnet}`);
    
    if (forceTestnet) {
      // Force use of testnet config (Base Sepolia)
      logger.debug(`✅ Testnet mode enabled - using Base Sepolia config (current network: ${chainId})`);
      const testnetConfig = getContractConfig(84532);
      logger.debug(`🔍 Testnet config:`, testnetConfig);
      
      if (!testnetConfig || testnetConfig.contractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error(`Testnet contract not deployed on Base Sepolia yet`);
      }
      
      logger.debug(`✅ Using ${testnetConfig.name} (84532) - Contract: ${testnetConfig.contractAddress}`);
      return { chainId: 84532, config: testnetConfig };
    }
    
    if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Please switch to Base network. Supported networks: Base Mainnet (8453) or Base Sepolia (84532). Current: ${chainId}`);
    }
    
    const config = getContractConfig(chainId);
    logger.debug(`🔍 Network config for ${chainId}:`, config);
    
    if (!config || config.contractAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Contract not deployed on ${config?.name || 'this network'} yet. Please use ?testnet=true for testing.`);
    }
    
    logger.debug(`✅ Using ${config.name} (${chainId}) - Contract: ${config.contractAddress}`);
    
    return { chainId, config };
  };

  const getWalletProvider = async () => {
    logger.debug("Starting Farcaster wallet detection...");
    
    try {
      logger.debug("Getting Farcaster context...");
      const context = await sdk.context;
      logger.debug("Farcaster context:", context);
      
      // Check if we're in Farcaster and have wallet access
      if (context.client && context.user) {
        logger.debug("✅ In Farcaster environment with client and user");
        
        logger.debug("Calling sdk.wallet.getEthereumProvider()...");
        const walletProvider = await sdk.wallet.getEthereumProvider();
        
        logger.debug("Farcaster wallet provider result:", walletProvider);
        
        if (walletProvider && typeof (walletProvider as ethers.Eip1193Provider).request === 'function') {
          logger.debug("✅ Successfully got Farcaster wallet provider");
          setWalletType("Farcaster");
          return new ethers.BrowserProvider(walletProvider as ethers.Eip1193Provider);
        } else {
          logger.debug("❌ Farcaster wallet provider invalid or missing request method");
          throw new Error("Farcaster wallet provider is not valid");
        }
      } else {
        logger.debug("❌ Not in Farcaster context or missing client/user");
        throw new Error("Please open this app in Farcaster");
      }
    } catch (error) {
      logger.debug("❌ Farcaster wallet failed:", error);
      throw new Error("Failed to connect to Farcaster wallet. Please try refreshing the app.");
    }
  };

  const checkIfUserHasMinted = useCallback(async () => {
    try {
      // In Farcaster, we might not be able to check mint status without user interaction
      // So we'll skip the check and just show the mint button
      const context = await sdk.context;
      if (context.client && context.user) {
        logger.debug("In Farcaster environment - skipping mint status check");
        setIsCheckingMintStatus(false);
        return;
      }

      // Only check mint status for external wallets
      const provider = await getWalletProvider();
      const { config } = await checkNetworkAndGetConfig(provider);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Create contract instance
      const contract = new ethers.Contract(
        config.contractAddress,
        [
          "function hasMinted(address) view returns (bool)"
        ],
        provider
      );

      const hasMinted = await contract.hasMinted(userAddress);
      setHasAlreadyMinted(hasMinted);
      
      if (hasMinted) {
        setStatus("You have already minted an NFT");
      }
    } catch (error) {
      logger.debug("Could not check mint status:", error);
      // Don't set error status here, just allow the user to try minting
    } finally {
      setIsCheckingMintStatus(false);
    }
  }, []);

  useEffect(() => {
    checkIfUserHasMinted();
  }, [checkIfUserHasMinted]);

  const handleMint = async () => {
    setStatus("Checking wallet...");
    try {
      const provider = await getWalletProvider();
      
      // Check network and get contract config
      const { config } = await checkNetworkAndGetConfig(provider);
      
      setStatus(`Connecting to wallet on ${config.name}...`);
      const signer = await provider.getSigner();

      setStatus("Minting NFT...");
      const tx = await mintWuTangNFT({ 
        signer, 
        contractAddress: config.contractAddress, 
        wuName, 
        base64Image 
      });
      
      // Update state to reflect that user has now minted
      setHasAlreadyMinted(true);
      
      if (tx && tx.hash) {
        setStatus(`NFT minted successfully! 🎉 Transaction: ${tx.hash.substring(0, 10)}...`);
        logger.log(`View on explorer: ${config.explorerUrl}/tx/${tx.hash}`);
      } else {
        setStatus("NFT mint transaction sent! 🎉");
      }
      
      logger.debug("Transaction:", tx);
    } catch (err: unknown) {
      logger.error("Mint error:", err);
      
      const error = err as { code?: string | number; message?: string };
      const errorMessage = error.message || String(err);
      
      if (error.code === "ACTION_REJECTED" || error.code === 4001 || errorMessage.includes("user rejected") || errorMessage.includes("ethers-user-denied")) {
        setStatus("Transaction cancelled by user");
      } else if (errorMessage.includes("User has already minted")) {
        setStatus("You have already minted an NFT");
      } else if (errorMessage.includes("Incorrect ETH amount")) {
        setStatus("Incorrect ETH amount (need 0.002 ETH)");
      } else if (errorMessage.includes("switch to Base") || errorMessage.includes("Supported networks")) {
        setStatus(errorMessage);
      } else if (errorMessage.includes("Contract not deployed")) {
        setStatus(errorMessage);
      } else if (errorMessage.includes("No wallet found")) {
        setStatus("Please open in Farcaster app or connect external wallet");
      } else if (errorMessage.includes("UnsupportedMethodError") || errorMessage.includes("eth_estimateGas")) {
        setStatus("Farcaster wallet compatibility issue. Please try again.");
      } else if (errorMessage.includes("does not support the requested method")) {
        setStatus("Wallet method not supported. Please try again.");
      } else {
        setStatus("Mint failed: " + errorMessage);
      }
    }
  };

  const isDisabled = isCheckingMintStatus || hasAlreadyMinted || (!!status && status.includes("..."));
  const buttonText = isCheckingMintStatus ? "Checking..." : hasAlreadyMinted ? "Already Minted" : "Mint as NFT";

  return (
    <div>
      <button 
        onClick={handleMint}
        className={`px-6 py-2 text-white font-bold rounded disabled:opacity-50 ${
          hasAlreadyMinted ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={isDisabled}
      >
        <span>{buttonText}</span>
        {!hasAlreadyMinted && !isCheckingMintStatus && (
          <span style={{ display: 'block' }}>(0.002 ETH)</span>
        )}
      </button>
      {status && (
        <div className={`text-sm mt-2 text-center ${
          status.includes("successfully") ? "text-green-600" : 
          status.includes("failed") || status.includes("error") || status.includes("cancelled") ? "text-red-600" : 
          status.includes("already minted") ? "text-orange-600" :
          "text-gray-600"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
