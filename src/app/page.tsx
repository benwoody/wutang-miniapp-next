'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import WuTangGenerator from '@/components/WuTangGenerator';
import { suppressSVGErrors } from '@/utils/suppressSVGErrors';

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    // Suppress SVG-related console errors from third-party libraries
    suppressSVGErrors();
    
    const load = async () => {
      try {
        const ctx = await sdk.context;
        setContext(ctx);
        setIsSDKLoaded(true);
        console.log('Farcaster SDK loaded:', ctx);
      } catch (error) {
        console.log('Not in Farcaster frame, continuing without SDK:', error);
        setIsSDKLoaded(true); // Still allow the app to work outside Farcaster
      }
    };
    
    load();
  }, []);

  if (!isSDKLoaded) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading Wu-Tang Generator...</p>
        </div>
      </main>
    );
  }

  // Check if testnet mode is enabled
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isTestnetMode = urlParams?.get('testnet') === 'true';

  return (
    <main>
      <header>
        <h1>Wu-Tang Name Generator</h1>
        {isTestnetMode && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4 text-center">
            🧪 <strong>Testnet Mode</strong> - Using Base Sepolia for testing
          </div>
        )}
      </header>
      <WuTangGenerator />
    </main>
  );
}
