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
    
    if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
      throw new Error(`Please switch to Base network. Supported networks: Base Mainnet (8453) or Base Sepolia (84532). Current: ${chainId}`);
    }
    
    const config = getContractConfig(chainId);
    if (!config || config.contractAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Contract not deployed on ${config?.name || 'this network'} yet`);
    }
    
    return { chainId, config };
  };

  const getWalletProvider = async () => {
    // Try Farcaster embedded wallet first
    try {
      console.log("Checking for Farcaster wallet...");
      const context = await sdk.context;
      console.log("Farcaster context:", context);
      
      // Check if we're in Farcaster and have wallet access
      if (context.client && context.user) {
        console.log("Farcaster client and user detected");
        
        // Try to get the wallet provider from the Farcaster SDK
        const walletProvider = sdk.wallet.ethProvider;
        console.log("Farcaster wallet provider:", walletProvider);
        
        if (walletProvider) {
          console.log("✅ Using Farcaster embedded wallet");
          setWalletType("Farcaster");
          return new ethers.BrowserProvider(walletProvider);
        } else {
          console.log("Farcaster wallet provider not available");
        }
      } else {
        console.log("Not in Farcaster context or missing client/user");
      }
    } catch (error) {
      console.log("Farcaster wallet not available, trying external wallet:", error);
    }

    // Fallback to external wallet (MetaMask, etc.)
    // @ts-ignore
    if (window.ethereum) {
      console.log("✅ Using external wallet (MetaMask, etc.)");
      setWalletType("External");
      // @ts-ignore
      return new ethers.BrowserProvider(window.ethereum);
    }

    throw new Error("No wallet found. Please use Farcaster app or install MetaMask");
  };

  const checkIfUserHasMinted = async () => {
    try {
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
      setStatus("NFT minted successfully! 🎉");
      console.log("Transaction:", tx);
      console.log(`View on explorer: ${config.explorerUrl}/tx/${tx.hash}`);
    } catch (err: any) {
      console.error("Mint error:", err);
      
      if (err.code === "ACTION_REJECTED") {
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
