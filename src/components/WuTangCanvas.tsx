'use client';

import { useEffect, useRef } from 'react';

interface WuTangCanvasProps {
  wuName: string;
  onImageGenerated?: (imageData: string) => void;
}

export default function WuTangCanvas({ wuName, onImageGenerated }: WuTangCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wuName || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = '/assets/wu-logo.png';

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 32px Impact, Arial Black, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#181818";
      ctx.fillStyle = "#f1c40f";

      ctx.strokeText(wuName, canvas.width / 2, canvas.height / 2 + 3);
      ctx.fillText(wuName, canvas.width / 2, canvas.height / 2 + 3);

      if (onImageGenerated) {
        onImageGenerated(canvas.toDataURL("image/png"));
      }
    };
  }, [wuName, onImageGenerated]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className={`mt-4 ${!wuName ? 'hidden' : ''}`}
    />
  );
}
