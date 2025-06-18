# Testnet Testing Guide

## Overview
The Wu-Tang NFT app supports both Base Mainnet and Base Sepolia testnet. The contract is already deployed on Base Sepolia for testing purposes.

## Contract Addresses
- **Base Mainnet (8453)**: Not deployed yet (placeholder address)
- **Base Sepolia (84532)**: `0x18f2589406bda8202C979F5d9c79400d16Ff25C5`

## How to Test on Testnet

### Method 1: URL Parameter (Recommended)
Add `?testnet=true` to the URL to force testnet mode:
```
https://wutang.llyxx.me?testnet=true
```

When testnet mode is enabled:
- ✅ Shows orange banner: "🧪 Testnet Mode - Using Base Sepolia for testing"
- ✅ Automatically uses Base Sepolia contract regardless of wallet network
- ✅ No need to manually switch networks in your wallet
- ✅ Uses the deployed testnet contract address

### Method 2: Switch Network in Farcaster Wallet
1. Open the app in Farcaster
2. In your Farcaster wallet settings, switch to Base Sepolia network
3. The app will automatically detect and use the testnet contract

## Testing Steps

1. **Access Testnet Mode**:
   ```
   https://wutang.llyxx.me?testnet=true
   ```

2. **Verify Testnet Banner**:
   - Look for orange banner at top: "🧪 Testnet Mode - Using Base Sepolia for testing"

3. **Generate Wu-Tang Name**:
   - Enter your Farcaster username
   - Click "Generate Wu-Tang Name"
   - Verify canvas image is generated

4. **Test Minting**:
   - Click "Mint as NFT (0.002 ETH)"
   - Wallet should connect to Base Sepolia
   - Console should show: "Using Base Sepolia (84532) - Contract: 0x18f2589406bda8202C979F5d9c79400d16Ff25C5"

5. **Get Testnet ETH**:
   - Use Base Sepolia faucet: https://www.alchemy.com/faucets/base-sepolia
   - Or Coinbase faucet: https://docs.base.org/tools/network-faucets

## Expected Console Output (Testnet)
```
Starting Farcaster wallet detection...
Getting Farcaster context...
Farcaster context: { client: {...}, user: {...} }
✅ In Farcaster environment with client and user
Calling sdk.wallet.getEthereumProvider()...
✅ Successfully got Farcaster wallet provider
Using Base Sepolia (84532) - Contract: 0x18f2589406bda8202C979F5d9c79400d16Ff25C5
```

## Troubleshooting

### Wrong Network Error
If you see: "Testnet mode enabled. Please switch to Base Sepolia (84532)"
- Switch your Farcaster wallet to Base Sepolia network
- Or remove `?testnet=true` to use any supported network

### Contract Not Found
If you see: "Contract not deployed on this network yet"
- Verify you're on Base Sepolia (84532)
- Check the contract address in console logs

### Wallet Connection Issues
If wallet hangs on "Checking wallet...":
- Refresh the app
- Ensure you're in Farcaster environment
- Check console for detailed error logs

## Network Information

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Contract**: 0x18f2589406bda8202C979F5d9c79400d16Ff25C5
- **Faucet**: https://www.alchemy.com/faucets/base-sepolia

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Contract**: Not deployed yet

## Farcaster Configuration
The app is configured to support both networks in `public/.well-known/farcaster.json`:
```json
"requiredChains": [
  "eip155:8453",   // Base Mainnet
  "eip155:84532"   // Base Sepolia
]
