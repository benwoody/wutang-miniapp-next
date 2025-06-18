'use client';

import { useState, useEffect } from 'react';
import { generateWuTangName } from '@/lib/wu-names';
import WuTangCanvas from './WuTangCanvas';
import MintButton from "@/components/MintButton";
import { sdk } from '@farcaster/frame-sdk';

export default function WuTangGenerator() {
  const [username, setUsername] = useState<string>('');
  const [wuName, setWuName] = useState<string>('');
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const initFarcaster = async () => {
      await sdk.actions.ready();
      const context = await sdk.context;
      if (context.user.username) {
        setUsername(context.user.username);
      }
    };

    initFarcaster();
  }, []);

  const handleGenerate = () => {
    if (!username) return;
    const generatedName = generateWuTangName(username);
    setWuName(generatedName);
  };

  const handleShare = async () => {
    try {
      await sdk.actions.composeCast({
        text: `My Wu-Tang name is ${wuName}! Find out what yours is: `,
        embeds: [`https://farcaster.xyz/miniapps/dYyE0Wmqs08J/wu-tang-name-generator`]
      });
    } catch (error) {
      console.error('Error sharing to Farcaster:', error);
    }
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
            onImageGenerated={setImageData}
          />
          {imageData && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
              <button
                onClick={handleShare}
                className="px-6 py-2 bg-purple-600 text-white font-bold rounded hover:bg-purple-700"
              >
                <span>Share to</span>
                <span style={{ display: 'block' }}>Farcaster</span>
              </button>
            <MintButton
              wuName={wuName}
              base64Image={imageData}
            />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
