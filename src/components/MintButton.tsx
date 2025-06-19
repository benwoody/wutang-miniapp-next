import { useState, useEffect, useCallback } from "react";
import { mintWuTangNFT } from "@/utils/mintWuTangNFT";
import { testContractConnection } from "@/utils/testContract";
import { getBase64SizeKB, validateImageSize } from "@/utils/imageCompression";
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
  const [isMinting, setIsMinting] = useState<boolean>(false);
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
          
          // Test the provider before returning
          try {
            logger.debug("Testing provider...");
            const accounts = await (walletProvider as ethers.Eip1193Provider).request({ method: 'eth_accounts' });
            logger.debug("Provider accounts:", accounts);
            
            const chainId = await (walletProvider as ethers.Eip1193Provider).request({ method: 'eth_chainId' });
            logger.debug("Provider chainId:", chainId);
            
            const browserProvider = new ethers.BrowserProvider(walletProvider as ethers.Eip1193Provider);
            logger.debug("✅ BrowserProvider created successfully");
            return browserProvider;
          } catch (testError) {
            logger.error("❌ Provider test failed:", testError);
            throw new Error(`Farcaster wallet provider test failed: ${testError}`);
          }
        } else {
          logger.debug("❌ Farcaster wallet provider invalid or missing request method");
          throw new Error("Farcaster wallet provider is not valid");
        }
      } else {
        logger.debug("❌ Not in Farcaster context or missing client/user");
        throw new Error("Please open this app in Farcaster");
      }
    } catch (error) {
      logger.error("❌ Farcaster wallet failed:", error);
      throw new Error(`Failed to connect to Farcaster wallet: ${error}`);
    }
  };

  const checkIfUserHasMinted = useCallback(async () => {
    try {
      logger.debug("Checking if user has already minted...");
      
      const provider = await getWalletProvider();
      const { config } = await checkNetworkAndGetConfig(provider);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      logger.debug(`Checking mint status for address: ${userAddress}`);

      // Use a public RPC provider for reading to avoid Farcaster Wallet compatibility issues
      const rpcUrl = config.name.includes("Sepolia") ? 
        "https://sepolia.base.org" : 
        "https://mainnet.base.org";
      
      const publicProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Create a contract instance using the public provider for reading
      const contract = new ethers.Contract(
        config.contractAddress,
        [
          "function hasMinted(address) view returns (bool)"
        ],
        publicProvider
      );

      logger.debug(`Calling hasMinted(${userAddress}) on contract ${config.contractAddress}`);
      const hasMinted = await contract.hasMinted(userAddress);
      logger.debug(`Has minted result: ${hasMinted}`);
      
      setHasAlreadyMinted(hasMinted);
    } catch (error) {
      logger.error("Could not check mint status:", error);
      // If we can't check, assume they haven't minted (allow them to try)
      setHasAlreadyMinted(false);
    } finally {
      setIsCheckingMintStatus(false);
    }
  }, []);

  useEffect(() => {
    checkIfUserHasMinted();
  }, [checkIfUserHasMinted]);

  const handleMint = async () => {
    const imageSizeKB = getBase64SizeKB(base64Image);
    
    if (imageSizeKB > 200) {
      setStatus(`Image too large (${imageSizeKB.toFixed(1)}KB). Max 200KB allowed.`);
      return;
    }
    
    const validation = validateImageSize(base64Image, 200);
    if (!validation.isValid) {
      setStatus(validation.message || "Image validation failed");
      return;
    }
    
    setIsMinting(true);
    setStatus("Checking wallet...");
    
    try {
      const provider = await getWalletProvider();
      const { chainId, config } = await checkNetworkAndGetConfig(provider);
      
      setStatus(`Connecting to wallet on ${config.name}...`);
      const signer = await provider.getSigner();

      setStatus("Testing contract connection...");
      const rpcUrl = chainId === 8453 ? 
        "https://mainnet.base.org" : 
        "https://sepolia.base.org";
      
      const contractTest = await testContractConnection(config.contractAddress, rpcUrl);
      if (!contractTest) {
        throw new Error("Contract connection test failed");
      }

      setStatus("Minting NFT...");
      const tx = await mintWuTangNFT({ 
        signer, 
        contractAddress: config.contractAddress, 
        wuName, 
        base64Image 
      });
      
      setHasAlreadyMinted(true);
      
      if (tx && tx.hash) {
        // Log the BaseScan URL for easy access
        const explorerUrl = config.explorerUrl;
        const transactionUrl = `${explorerUrl}/tx/${tx.hash}`;
        console.log(`🎉 NFT Minted Successfully!`);
        console.log(`📋 Transaction Hash: ${tx.hash}`);
        console.log(`🔗 View on BaseScan: ${transactionUrl}`);
        
        setStatus(`NFT mint transaction submitted! 🎉 Hash: ${tx.hash.substring(0, 10)}...`);
      } else {
        setStatus("NFT mint transaction sent! 🎉");
      }
    } catch (err: unknown) {
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
    } finally {
      setIsMinting(false);
    }
  };

  const isDisabled = isCheckingMintStatus || hasAlreadyMinted || isMinting || (!!status && status.includes("..."));
  const buttonText = isCheckingMintStatus ? "Checking..." : 
                     isMinting ? "Minting..." : 
                     hasAlreadyMinted ? "Already Minted" : 
                     "Mint as NFT";

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
        {!hasAlreadyMinted && !isCheckingMintStatus && !isMinting && (
          <span style={{ display: 'block' }}>(0.002 ETH)</span>
        )}
      </button>
    </div>
  );
}
