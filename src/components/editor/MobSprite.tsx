import { useEffect, useRef, useState } from 'react';
import { getMobSpriteUrlByTplId } from '@/lib/mobTemplates';

interface MobSpriteProps {
  tplId: number;
  size?: number;
  className?: string;
}

// Displays only the front-facing 24x24 sprite from a mob sprite sheet
export function MobSprite({ tplId, size = 24, className = '' }: MobSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const url = getMobSpriteUrlByTplId(tplId);
    if (!url) {
      setLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Front-facing sprite is typically at y=0 (first row), first frame
      // Most OpenRhynn sprites are 24x24 per frame, 4 directions
      const frameSize = 24;
      const srcX = 0;
      const srcY = 0; // Front facing is first row
      
      // Enable pixelated rendering
      ctx.imageSmoothingEnabled = false;
      
      // Draw the cropped sprite scaled to size
      ctx.drawImage(
        img,
        srcX, srcY, frameSize, frameSize,
        0, 0, size, size
      );
      
      setLoaded(true);
    };
    img.onerror = () => {
      setLoaded(false);
    };
    img.src = url;
  }, [tplId, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`bg-black/20 rounded ${className}`}
      style={{ 
        imageRendering: 'pixelated',
        display: loaded ? 'block' : 'none'
      }}
    />
  );
}
