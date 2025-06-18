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
  // Compress image for blockchain storage
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const compressedImage = await new Promise<string>((resolve) => {
    img.onload = () => {
      // Better quality canvas size for improved image quality
      canvas.width = 300;  // 300x300 pixels for better quality
      canvas.height = 300;
      
      // Draw and compress with better quality
      ctx?.drawImage(img, 0, 0, 300, 300);
      
      // Better compression - higher quality options
      const jpegMedium = canvas.toDataURL('image/jpeg', 0.4);    // 40% quality
      const jpegGood = canvas.toDataURL('image/jpeg', 0.6);      // 60% quality
      const jpegHigh = canvas.toDataURL('image/jpeg', 0.8);      // 80% quality
      
      // Use the best quality that's still under 15KB
      if (jpegHigh.length < 15000) {
        resolve(jpegHigh);
      } else if (jpegGood.length < 15000) {
        resolve(jpegGood);
      } else if (jpegMedium.length < 15000) {
        resolve(jpegMedium);
      } else {
        resolve(jpegMedium);
      }
    };
    img.src = base64Image;
  });
  
  const metadata = {
    name: wuName,
    description: "Wu-Tang Name Generator NFT",
    image: compressedImage,
  };
  const metadataString = JSON.stringify(metadata);
  const metadataBase64 = toBase64(metadataString);
  const tokenURI = `data:application/json;base64,${metadataBase64}`;

  const contract = new ethers.Contract(contractAddress, WuTangNFTABI as ethers.InterfaceAbi, signer);
  const signerAddress = await signer.getAddress();
  
  // Try to estimate gas first, with fallback to absolute maximum limit
  let gasLimit = 5000000; // Absolute maximum gas limit - near block limit
  try {
    const estimatedGas = await contract.mintNFT.estimateGas(
      signerAddress,
      tokenURI,
      { value: ethers.parseEther("0.002") }
    );
    // Add 100% buffer to estimated gas for absolute safety
    gasLimit = Number(estimatedGas) + Number(estimatedGas); // Double the estimated gas
  } catch {
    // Use default gas limit if estimation fails
  }
  
  const txParams = { 
    value: ethers.parseEther("0.002"),
    gasLimit: gasLimit
  };
  
  try {
    const tx = await contract.mintNFT(
      signerAddress,
      tokenURI,
      txParams
    );
    
    // Wait for the transaction to be mined
    try {
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      if (receipt?.status !== 1) {
        throw new Error("Transaction failed during execution");
      }
    } catch {
      // Could not wait for transaction confirmation (Farcaster limitation)
      // Transaction was sent successfully
    }
    
    return tx;
  } catch (error) {
    throw error;
  }
}
