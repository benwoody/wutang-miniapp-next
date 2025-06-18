# Farcaster Wallet Connection Guide

This guide explains how the Wu-Tang NFT miniapp connects to wallets and how to ensure you're using the Farcaster wallet.

## How Wallet Connection Works

The app follows this priority order when connecting to wallets:

1. **Farcaster Embedded Wallet** (Preferred)
2. **External Wallet** (MetaMask, etc.) (Fallback)

## Ensuring Farcaster Wallet Connection

### ✅ To Use Farcaster Wallet:

1. **Open the app within the Farcaster mobile app**
   - Use Warpcast or another Farcaster client
   - Navigate to the frame/miniapp from within the app
   - The app will automatically detect and use your Farcaster wallet

2. **Look for the wallet indicator**
   - The app shows "🔗 Connected: Farcaster Wallet" when using Farcaster
   - This appears above the mint button

### 🔄 If You See "External Wallet":

This means the app couldn't connect to your Farcaster wallet and is using an external wallet instead. This can happen if:

- You're accessing the app outside of a Farcaster client
- The Farcaster SDK couldn't detect your wallet
- You're in a browser instead of the Farcaster mobile app

### 📱 Best Practices:

1. **Use Farcaster Mobile App**: Always access the Wu-Tang miniapp through the Farcaster mobile app for the best experience
2. **Check the Indicator**: Look for the wallet connection indicator to confirm which wallet is being used
3. **Console Logs**: If you're a developer, check the browser console for detailed wallet detection logs

## Technical Details

The app uses the `@farcaster/frame-sdk` to detect and connect to Farcaster wallets:

```typescript
// The app checks for Farcaster context
const context = await sdk.context;
if (context.client && context.user) {
  // Farcaster wallet available
  const walletProvider = sdk.wallet.ethProvider;
  if (walletProvider) {
    // Use Farcaster wallet
  }
}
```

## Troubleshooting

### Problem: App shows "External Wallet" instead of "Farcaster Wallet"

**Solutions:**
1. Make sure you're accessing the app from within the Farcaster mobile app
2. Try refreshing the frame/miniapp
3. Ensure you have a Farcaster wallet set up in your client

### Problem: "No wallet found" error

**Solutions:**
1. If in Farcaster app: Make sure your wallet is properly set up
2. If in browser: Install MetaMask or another Web3 wallet
3. Try accessing the app through the Farcaster mobile app instead

## Support

If you continue to have wallet connection issues:
1. Check the browser console for error messages
2. Ensure you're using a supported network (Base Mainnet or Base Sepolia)
3. Try accessing the app through different Farcaster clients
