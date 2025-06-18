# Wu-Tang NFT Miniapp - Base Integration Setup

## Overview

Your Wu-Tang name generator miniapp is now fully configured to mint NFTs on Base (Layer 2). The application automatically detects the user's network and uses the appropriate contract address.

## What's Been Set Up

### 1. Smart Contract
- **Location**: `contracts/src/WuTangNFT.sol`
- **Features**:
  - ERC721 NFT with URI storage
  - 0.002 ETH mint price
  - One mint per address limit
  - Owner withdrawal functionality
  - On-chain metadata storage

### 2. Deployment Infrastructure
- **Script**: `contracts/script/WuTangNFT.s.sol`
- **Environment**: `contracts/.env.example` (copy to `.env`)
- **Networks**: Base Mainnet (8453) and Base Sepolia (84532)

### 3. Frontend Integration
- **Network Detection**: Automatically detects Base networks
- **Dynamic Contract**: Uses different addresses per network
- **Error Handling**: User-friendly error messages
- **Status Updates**: Real-time minting progress

### 4. Configuration System
- **File**: `src/config/contracts.ts`
- **Purpose**: Centralized network and contract management
- **Easy Updates**: Change contract addresses in one place

## Quick Start

### 1. Deploy Contract

```bash
# Navigate to contracts directory
cd contracts

# Copy environment file
cp .env.example .env

# Edit .env with your private key and RPC URLs
# Deploy to Base Sepolia (testnet)
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast

# Deploy to Base Mainnet
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_RPC_URL --broadcast
```

### 2. Update Contract Addresses

Edit `src/config/contracts.ts` and replace the placeholder addresses:

```typescript
export const CONTRACT_CONFIG = {
  // Base Mainnet
  8453: {
    name: "Base Mainnet",
    contractAddress: "0xYourMainnetContractAddress", // Replace this
    explorerUrl: "https://basescan.org",
  },
  // Base Sepolia Testnet
  84532: {
    name: "Base Sepolia",
    contractAddress: "0xYourTestnetContractAddress", // Replace this
    explorerUrl: "https://sepolia.basescan.org",
  },
};
```

### 3. Test the Application

```bash
# Start development server
npm run dev

# Test with Base Sepolia first
# Then test with Base Mainnet
```

## User Flow

1. **Generate Wu-Tang Name**: User clicks "Enter the Wu-Tang"
2. **View Generated Image**: Canvas displays personalized Wu-Tang image
3. **Share to Farcaster**: Purple button shares to social media
4. **Mint NFT**: Green button mints NFT on Base
   - Checks wallet connection
   - Verifies Base network
   - Validates contract deployment
   - Executes mint transaction (0.002 ETH + gas)

## Network Support

### Base Mainnet (Chain ID: 8453)
- **RPC**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Currency**: ETH

### Base Sepolia (Chain ID: 84532)
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Currency**: ETH (testnet)

## Error Handling

The application handles common scenarios:
- **No Wallet**: Prompts to install MetaMask
- **Wrong Network**: Asks to switch to Base
- **Already Minted**: Prevents duplicate mints
- **Insufficient Funds**: Clear error message
- **Contract Not Deployed**: Warns if address not set

## File Structure

```
├── contracts/
│   ├── src/WuTangNFT.sol          # Main NFT contract
│   ├── script/WuTangNFT.s.sol     # Deployment script
│   └── .env.example               # Environment template
├── src/
│   ├── components/
│   │   ├── MintButton.tsx         # NFT minting component
│   │   └── WuTangGenerator.tsx    # Main generator
│   ├── config/
│   │   └── contracts.ts           # Network configuration
│   └── utils/
│       └── mintWuTangNFT.ts       # Minting logic
├── DEPLOYMENT_GUIDE.md            # Detailed deployment steps
└── README_BASE_SETUP.md           # This file
```

## Next Steps

1. **Deploy to Testnet**: Test everything on Base Sepolia
2. **Update Config**: Add your contract addresses
3. **Test Thoroughly**: Verify all functionality
4. **Deploy to Mainnet**: Go live on Base
5. **Monitor**: Watch for transactions and user feedback

## Support Resources

- [Base Documentation](https://docs.base.org/)
- [Base Bridge](https://bridge.base.org/) - Bridge ETH to Base
- [Base Faucet](https://www.alchemy.com/faucets/base-sepolia) - Testnet ETH
- [Foundry Book](https://book.getfoundry.sh/) - Smart contract development

## Contract Features Summary

- **Mint Price**: 0.002 ETH (fixed)
- **Supply**: Unlimited (but one per address)
- **Metadata**: Stored on-chain as base64 JSON
- **Ownership**: Deployer is initial owner
- **Withdrawals**: Owner can withdraw collected ETH

Your Wu-Tang NFT miniapp is now ready for Base! 🎉
