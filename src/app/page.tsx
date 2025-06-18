'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import WuTangGenerator from '@/components/WuTangGenerator';

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
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

  return (
    <main>
      <header>
        <h1>Wu-Tang Name Generator</h1>
      </header>
      <WuTangGenerator />
    </main>
  );
}
