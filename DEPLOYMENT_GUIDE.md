# Wu-Tang NFT Deployment Guide for Base

This guide will help you deploy your Wu-Tang NFT contract to Base (Layer 2) and configure your frontend to work with it.

## Prerequisites

1. **Foundry** - Install from [getfoundry.sh](https://getfoundry.sh/)
2. **Base wallet with ETH** - You'll need ETH on Base for deployment
3. **Private key** - Your wallet's private key for deployment

## Step 1: Environment Setup

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Edit `.env` and add your values:
```bash
# Your wallet's private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Base network RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional: Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Step 2: Deploy to Base Sepolia (Testnet)

First, deploy to testnet to test everything works:

```bash
# Deploy to Base Sepolia testnet
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify

# Or without verification:
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

## Step 3: Deploy to Base Mainnet

Once tested, deploy to mainnet:

```bash
# Deploy to Base mainnet
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_RPC_URL --broadcast --verify

# Or without verification:
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_RPC_URL --broadcast
```

## Step 4: Update Frontend Configuration

After deployment, you'll get a contract address. Update your frontend:

1. Open `src/components/WuTangGenerator.tsx`
2. Replace the placeholder contract address:

```typescript
<MintButton
  wuName={wuName}
  base64Image={imageData}
  contractAddress="0xYourActualDeployedContractAddress" // Replace this
/>
```

## Step 5: Configure Wallet for Base

Your users will need to add Base network to their wallets:

### Base Mainnet Network Details:
- **Network Name**: Base
- **RPC URL**: https://mainnet.base.org
- **Chain ID**: 8453
- **Currency Symbol**: ETH
- **Block Explorer**: https://basescan.org

### Base Sepolia Testnet Network Details:
- **Network Name**: Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.basescan.org

## Step 6: Test the Application

1. Start your Next.js development server:
```bash
npm run dev
```

2. Connect your wallet to Base network
3. Test generating a Wu-Tang name
4. Test minting an NFT (costs 0.002 ETH + gas)

## Contract Features

- **Mint Price**: 0.002 ETH
- **One mint per address**: Each address can only mint one NFT
- **Owner functions**: Contract owner can withdraw collected ETH
- **Metadata**: Stored on-chain as base64 encoded JSON

## Troubleshooting

### Common Issues:

1. **"Insufficient funds"**: Make sure you have enough ETH for gas + mint price
2. **"User has already minted"**: Each address can only mint once
3. **"Wrong network"**: Ensure your wallet is connected to Base
4. **"Transaction failed"**: Check gas settings and try again

### Getting Base ETH:

- **Mainnet**: Bridge ETH from Ethereum using [Base Bridge](https://bridge.base.org/)
- **Testnet**: Use [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

## Contract Verification

If you want to verify your contract manually:

```bash
forge verify-contract \
  --chain-id 8453 \
  --num-of-optimizations 200 \
  --watch \
  --constructor-args $(cast abi-encode "constructor(address)" "YOUR_DEPLOYER_ADDRESS") \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --compiler-version v0.8.17+commit.8df45f5f \
  YOUR_CONTRACT_ADDRESS \
  src/WuTangNFT.sol:WuTangNFT
```

## Next Steps

1. Deploy to testnet first
2. Test all functionality
3. Deploy to mainnet
4. Update frontend with real contract address
5. Test on mainnet with small amounts
6. Launch your Wu-Tang NFT generator!

## Support

- [Base Documentation](https://docs.base.org/)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Base Discord](https://discord.gg/buildonbase)
