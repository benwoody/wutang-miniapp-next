import { useState, useEffect } from "react";
import { mintWuTangNFT } from "@/utils/mintWuTangNFT";
import { ethers } from "ethers";
import { getContractConfig, SUPPORTED_CHAIN_IDS } from "@/config/contracts";
import { sdk } from '@farcaster/frame-sdk';

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
  const [walletType, setWalletType] = useState<string | null>(null);

  const checkNetworkAndGetConfig = async (provider: ethers.BrowserProvider) => {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log(`🔍 Current wallet network: ${chainId}`);
    
    // Check if we're forcing testnet mode via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const forceTestnet = urlParams.get('testnet') === 'true';
    
    console.log(`🔍 Testnet mode from URL: ${forceTestnet}`);
    
    if (forceTestnet) {
      // Force use of testnet config (Base Sepolia)
      console.log(`✅ Testnet mode enabled - using Base Sepolia config (current network: ${chainId})`);
      const testnetConfig = getContractConfig(84532);
      console.log(`🔍 Testnet config:`, testnetConfig);
      
      if (!testnetConfig || testnetConfig.contractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error(`Testnet contract not deployed on Base Sepolia yet`);
      }
      
      console.log(`✅ Using ${testnetConfig.name} (84532) - Contract: ${testnetConfig.contractAddress}`);
      return { chainId: 84532, config: testnetConfig };
    }
    
    if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Please switch to Base network. Supported networks: Base Mainnet (8453) or Base Sepolia (84532). Current: ${chainId}`);
    }
    
    const config = getContractConfig(chainId);
    console.log(`🔍 Network config for ${chainId}:`, config);
    
    if (!config || config.contractAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Contract not deployed on ${config?.name || 'this network'} yet. Please use ?testnet=true for testing.`);
    }
    
    console.log(`✅ Using ${config.name} (${chainId}) - Contract: ${config.contractAddress}`);
    
    return { chainId, config };
  };

  const getWalletProvider = async () => {
    console.log("Starting Farcaster wallet detection...");
    
    try {
      console.log("Getting Farcaster context...");
      const context = await sdk.context;
      console.log("Farcaster context:", context);
      
      // Check if we're in Farcaster and have wallet access
      if (context.client && context.user) {
        console.log("✅ In Farcaster environment with client and user");
        
        console.log("Calling sdk.wallet.getEthereumProvider()...");
        const walletProvider = await sdk.wallet.getEthereumProvider();
        
        console.log("Farcaster wallet provider result:", walletProvider);
        
        if (walletProvider && typeof (walletProvider as any).request === 'function') {
          console.log("✅ Successfully got Farcaster wallet provider");
          setWalletType("Farcaster");
          return new ethers.BrowserProvider(walletProvider as any);
        } else {
          console.log("❌ Farcaster wallet provider invalid or missing request method");
          throw new Error("Farcaster wallet provider is not valid");
        }
      } else {
        console.log("❌ Not in Farcaster context or missing client/user");
        throw new Error("Please open this app in Farcaster");
      }
    } catch (error) {
      console.log("❌ Farcaster wallet failed:", error);
      throw new Error("Failed to connect to Farcaster wallet. Please try refreshing the app.");
    }
  };

  const checkIfUserHasMinted = async () => {
    try {
      // In Farcaster, we might not be able to check mint status without user interaction
      // So we'll skip the check and just show the mint button
      const context = await sdk.context;
      if (context.client && context.user) {
        console.log("In Farcaster environment - skipping mint status check");
        setIsCheckingMintStatus(false);
        return;
      }

      // Only check mint status for external wallets
      const provider = await getWalletProvider();
      const { chainId, config } = await checkNetworkAndGetConfig(provider);
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
      console.log("Could not check mint status:", error);
      // Don't set error status here, just allow the user to try minting
    } finally {
      setIsCheckingMintStatus(false);
    }
  };

  useEffect(() => {
    checkIfUserHasMinted();
  }, []);

  const handleMint = async () => {
    setStatus("Checking wallet...");
    try {
      const provider = await getWalletProvider();
      
      // Check network and get contract config
      const { chainId, config } = await checkNetworkAndGetConfig(provider);
      
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
        console.log(`View on explorer: ${config.explorerUrl}/tx/${tx.hash}`);
      } else {
        setStatus("NFT mint transaction sent! 🎉");
      }
      
      console.log("Transaction:", tx);
    } catch (err: any) {
      console.error("Mint error:", err);
      
      if (err.code === "ACTION_REJECTED" || err.code === 4001 || err.message.includes("user rejected") || err.message.includes("ethers-user-denied")) {
        setStatus("Transaction cancelled by user");
      } else if (err.message.includes("User has already minted")) {
        setStatus("You have already minted an NFT");
      } else if (err.message.includes("Incorrect ETH amount")) {
        setStatus("Incorrect ETH amount (need 0.002 ETH)");
      } else if (err.message.includes("switch to Base") || err.message.includes("Supported networks")) {
        setStatus(err.message);
      } else if (err.message.includes("Contract not deployed")) {
        setStatus(err.message);
      } else if (err.message.includes("No wallet found")) {
        setStatus("Please open in Farcaster app or connect external wallet");
      } else if (err.message.includes("UnsupportedMethodError") || err.message.includes("eth_estimateGas")) {
        setStatus("Farcaster wallet compatibility issue. Please try again.");
      } else if (err.message.includes("does not support the requested method")) {
        setStatus("Wallet method not supported. Please try again.");
      } else {
        setStatus("Mint failed: " + err.message);
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
