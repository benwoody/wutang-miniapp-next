# Deploying Wu-Tang NFT with Alchemy

This guide shows how to deploy your Wu-Tang NFT contract using Alchemy as your RPC provider.

## Why Use Alchemy?

- **Better Reliability**: More stable than public RPC endpoints
- **Higher Rate Limits**: Supports more transactions per second
- **Analytics**: Dashboard to monitor your app's usage
- **Enhanced APIs**: Additional features like NFT API, Webhooks, etc.

## Setup Steps

### 1. Create Alchemy Account

1. Go to [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/)
2. Sign up for a free account
3. Create a new app:
   - **Chain**: Base
   - **Network**: Base Mainnet (for production) or Base Sepolia (for testing)
   - **Name**: "Wu-Tang NFT"

### 2. Get Your API Keys

1. From your Alchemy dashboard, copy your API key
2. You'll need separate apps/keys for:
   - **Base Mainnet**: Production deployment
   - **Base Sepolia**: Testing deployment

### 3. Configure Environment

1. Copy the example environment file:
   ```bash
   cd contracts
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```bash
   # Your wallet private key (get from MetaMask: Account Details > Export Private Key)
   PRIVATE_KEY=your_actual_private_key_without_0x_prefix
   
   # Alchemy RPC URLs with your API keys
   BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_MAINNET_API_KEY
   BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_SEPOLIA_API_KEY
   
   # BaseScan API key (optional, for contract verification)
   ETHERSCAN_API_KEY=your_basescan_api_key
   ```

### 4. Fund Your Wallet

**For Base Sepolia (Testnet):**
- Get free testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- You need ~0.01 ETH for deployment

**For Base Mainnet:**
- Bridge ETH to Base using [Base Bridge](https://bridge.base.org/)
- You need ~0.005-0.01 ETH for deployment

### 5. Deploy Contract

**Deploy to Base Sepolia (Testnet) first:**
```bash
cd contracts
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
```

**Deploy to Base Mainnet (Production):**
```bash
cd contracts
forge script script/WuTangNFT.s.sol:WuTangNFTScript --rpc-url $BASE_RPC_URL --broadcast --verify
```

### 6. Update Frontend Configuration

After successful deployment, update `src/config/contracts.ts` with your deployed contract address:

```typescript
export const CONTRACT_ADDRESSES = {
  // Base Sepolia (testnet)
  84532: "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_ON_SEPOLIA",
  // Base Mainnet
  8453: "0xYOUR_DEPLOYED_CONTRACT_ADDRESS_ON_MAINNET",
};
```

## Deployment Output Example

```bash
== Logs ==
  WuTangNFT deployed to: 0x1234567890123456789012345678901234567890
  Owner: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd

## Setting up 1 EVM.
==========================
Chain 84532

Estimated gas price: 1.000000007 gwei

Estimated total gas used for script: 1234567

Estimated amount required: 0.001234567 ETH

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
```

## Verification

Your contract will be automatically verified on BaseScan if you include the `--verify` flag and have a valid `ETHERSCAN_API_KEY`.

You can view your deployed contract at:
- **Base Sepolia**: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`
- **Base Mainnet**: `https://basescan.org/address/YOUR_CONTRACT_ADDRESS`

## Testing Your Deployment

1. **Start your Next.js app**: `npm run dev`
2. **Open in browser**: `http://localhost:3000`
3. **Test the flow**:
   - Generate Wu-Tang name
   - Try minting NFT
   - Check transaction on BaseScan

## Troubleshooting

### Common Issues:

1. **"insufficient funds for intrinsic transaction cost"**
   - Your wallet needs more ETH for gas fees
   - Add more ETH to your wallet

2. **"nonce too low" or "nonce too high"**
   - Reset your MetaMask account: Settings > Advanced > Reset Account

3. **"execution reverted"**
   - Check if contract is already deployed
   - Verify your private key is correct

4. **RPC connection issues**
   - Verify your Alchemy API key is correct
   - Check if you're using the right network (mainnet vs sepolia)

### Getting Help:

- **Alchemy Discord**: [https://discord.gg/alchemy](https://discord.gg/alchemy)
- **Base Discord**: [https://discord.gg/buildonbase](https://discord.gg/buildonbase)
- **Foundry Book**: [https://book.getfoundry.sh/](https://book.getfoundry.sh/)

## Security Notes

- **Never commit your `.env` file** - it contains your private key
- **Use a separate wallet** for deployment (not your main wallet)
- **Test on Sepolia first** before deploying to mainnet
- **Keep your private key secure** - anyone with it can control your wallet

## Next Steps

After deployment:
1. Update your frontend with the contract address
2. Test minting functionality
3. Deploy your Next.js app to Vercel/Netlify
4. Share your Wu-Tang generator with the world! 🎉
