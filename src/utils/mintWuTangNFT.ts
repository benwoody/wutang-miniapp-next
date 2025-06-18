import { ethers } from "ethers";
import WuTangNFTABI from "@/contracts/abis/WuTangNFT.json";

function toBase64(str: string) {
  if (typeof window === "undefined") {
    // Node.js
    return Buffer.from(str, "utf-8").toString("base64");
  } else {
    // Browser
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export async function mintWuTangNFT({
  signer,
  contractAddress,
  wuName,
  base64Image,
}: {
  signer: ethers.Signer;
  contractAddress: string;
  wuName: string;
  base64Image: string;
}) {
  const metadata = {
    name: wuName,
    description: "Wu-Tang Name Generator NFT",
    image: base64Image,
  };
  const metadataString = JSON.stringify(metadata);
  const metadataBase64 = toBase64(metadataString);
  const tokenURI = `data:application/json;base64,${metadataBase64}`;

  const contract = new ethers.Contract(contractAddress, WuTangNFTABI as any, signer);
  
  console.log("Sending transaction with params:", {
    to: await signer.getAddress(),
    tokenURI: tokenURI.substring(0, 100) + "...",
    value: "0.002 ETH",
    gasLimit: 300000
  });
  
  // Manually specify gas limit to avoid eth_estimateGas call which Farcaster doesn't support
  const tx = await contract.mintNFT(
    await signer.getAddress(),
    tokenURI,
    { 
      value: ethers.parseEther("0.002"),
      gasLimit: 300000 // Set a reasonable gas limit manually
    }
  );
  
  console.log("Transaction sent:", tx.hash);
  
  // For Farcaster wallet, we might not be able to wait for confirmation
  // So we'll try to wait with a timeout
  try {
    console.log("Waiting for transaction confirmation...");
    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 30000)
      )
    ]);
    console.log("Transaction confirmed:", receipt);
    return tx;
  } catch (waitError) {
    console.log("Could not wait for confirmation, but transaction was sent:", waitError);
    // Return the transaction anyway - it was successfully sent
    return tx;
  }
}
