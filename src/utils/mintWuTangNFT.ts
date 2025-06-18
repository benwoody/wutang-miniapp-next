import { ethers } from "ethers";
import WuTangNFTABI from "@/contracts/WuTangNFT.json";

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
  const metadataBase64 = btoa(unescape(encodeURIComponent(metadataString)));
  const tokenURI = `data:application/json;base64,${metadataBase64}`;

  const contract = new ethers.Contract(contractAddress, WuTangNFTABI, signer);
  const tx = await contract.mintNFT(await signer.getAddress(), tokenURI);
  await tx.wait();
  return tx;
}