import { ethers } from "ethers";
import WuTangNFTABI from "@/contracts/abis/WuTangNFT.json";

export async function testContractConnection(contractAddress: string, rpcUrl: string) {
  console.log("🔍 Testing contract connection...");
  console.log("🔍 Contract address:", contractAddress);
  console.log("🔍 RPC URL:", rpcUrl);
  
  try {
    // Create a provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log("✅ Provider created");
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, WuTangNFTABI as ethers.InterfaceAbi, provider);
    console.log("✅ Contract instance created");
    
    // Test basic contract calls
    console.log("🔍 Testing contract.name()...");
    const name = await contract.name();
    console.log("✅ Contract name:", name);
    
    console.log("🔍 Testing contract.symbol()...");
    const symbol = await contract.symbol();
    console.log("✅ Contract symbol:", symbol);
    
    console.log("🔍 Testing contract.MINT_PRICE()...");
    const mintPrice = await contract.MINT_PRICE();
    console.log("✅ Mint price:", ethers.formatEther(mintPrice), "ETH");
    
    console.log("🔍 Testing contract.nextTokenId()...");
    const nextTokenId = await contract.nextTokenId();
    console.log("✅ Next token ID:", nextTokenId.toString());
    
    console.log("🔍 Testing contract.MAX_SUPPLY()...");
    const maxSupply = await contract.MAX_SUPPLY();
    console.log("✅ Max supply:", maxSupply.toString());
    
    console.log("🎉 All contract tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Contract test failed:", error);
    return false;
  }
}
