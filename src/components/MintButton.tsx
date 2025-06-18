import { useState } from "react";
import { mintWuTangNFT } from "@/utils/mintWuTangNFT";
import { ethers } from "ethers";
import { getContractConfig, SUPPORTED_CHAIN_IDS } from "@/config/contracts";

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

  const handleMint = async () => {
    setStatus("Checking wallet...");
    try {
      // @ts-ignore
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Web3 wallet");
      }

      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      
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
        Mint as NFT (0.002 ETH)
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
