import { useState } from "react";
import { mintWuTangNFT } from "@/utils/mintWuTangNFT";
import { ethers } from "ethers";

export default function MintButton({
  wuName,
  base64Image,
  contractAddress,
}: {
  wuName: string;
  base64Image: string;
  contractAddress: string;
}) {
  const [status, setStatus] = useState<string | null>(null);

  const handleMint = async () => {
    setStatus("Waiting for wallet...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setStatus("Minting NFT...");
      await mintWuTangNFT({ signer, contractAddress, wuName, base64Image });
      setStatus("NFT minted!");
    } catch (err) {
      setStatus("Mint failed: " + (err as Error).message);
    }
  };

  return (
    <div>
      <button onClick={handleMint}>Mint as NFT</button>
      {status && <div>{status}</div>}
    </div>
  );
}