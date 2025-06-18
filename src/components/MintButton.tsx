import { useState } from "react";
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
      const context = await sdk.context;
      // Check if we're in Farcaster and have wallet access
      if (context.client && context.user) {
        // Try to get the wallet provider from the Farcaster SDK
        const walletProvider = sdk.wallet.ethProvider;
        if (walletProvider) {
          console.log("Using Farcaster embedded wallet");
          return new ethers.BrowserProvider(walletProvider);
        }
      }
    } catch (error) {
      console.log("Farcaster wallet not available, trying external wallet:", error);
    }

    // Fallback to external wallet (MetaMask, etc.)
    // @ts-ignore
    if (window.ethereum) {
      console.log("Using external wallet (MetaMask, etc.)");
      // @ts-ignore
      return new ethers.BrowserProvider(window.ethereum);
    }

    throw new Error("No wallet found. Please use Farcaster app or install MetaMask");
  };

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

  return (
    <div>
      <button 
        onClick={handleMint}
        className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50"
        disabled={!!status && status.includes("...")}
      >
        <span>Mint as NFT</span>
        <span style={{ display: 'block' }}>(0.002 ETH)</span>
      </button>
      {status && (
        <div className={`text-sm mt-2 text-center ${
          status.includes("successfully") ? "text-green-600" : 
          status.includes("failed") || status.includes("error") || status.includes("cancelled") ? "text-red-600" : 
          "text-gray-600"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
