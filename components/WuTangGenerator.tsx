'use client';

import { useState, useEffect } from 'react';
import { generateWuTangName } from '@/lib/wu-names';
import WuTangCanvas from './WuTangCanvas';
import { sdk } from '@farcaster/frame-sdk';

export default function WuTangGenerator() {
  const [username, setUsername] = useState<string>('');
  const [wuName, setWuName] = useState<string>('');

  useEffect(() => {
    const initFarcaster = async () => {
      await sdk.actions.ready();
      const context = await sdk.context;
      setUsername(context.user.username);
    };

    initFarcaster();
  }, []);

  const handleGenerate = () => {
    if (!username) return;
    const generatedName = generateWuTangName(username);
    setWuName(generatedName);
  };

  return (
    <section className="generator">
      {username && (
        <div className="username-display">{username}</div>
      )}

      {!wuName && (
        <button
          onClick={handleGenerate}
          className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600"
        >
          Enter the Wu-Tang
        </button>
      )}

      {wuName && (
        <div className="mt-4">
          <div className="result">
            From this day forward,<br/>
            you will also be known as<br/><br/>
            <span className="text-2xl font-bold">{wuName}</span>
          </div>
          <WuTangCanvas
            wuName={wuName}
          />
        </div>
      )}
    </section>
  );
}
