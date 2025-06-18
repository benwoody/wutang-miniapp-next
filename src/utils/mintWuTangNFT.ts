import { ethers } from "ethers";
import WuTangNFTABI from "@/contracts/WuTangNFT.json";

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

  const contract = new ethers.Contract(contractAddress, WuTangNFTABI, signer);
  const tx = await contract.mintNFT(
    await signer.getAddress(),
    tokenURI,
    { value: ethers.parseEther("0.003") }
  );
  await tx.wait();
  return tx;
}