import { useRef, useEffect, useCallback, useState } from 'react';
import { PlayfieldInfo, Portal, Item, EditorState, CursorPosition } from '@/types/map';
import { cn } from '@/lib/utils';

const TILE_SIZE = 24;

interface MapCanvasProps {
  playfieldInfo: PlayfieldInfo;
  mapData: number[][];
  collisionData: number[];
  peacefulData: number[];
  triggerData: number[];
  editorState: EditorState;
  getTile: (tileId: number) => HTMLCanvasElement | null;
  onPaint: (x: number, y: number) => void;
  onFill: (x: number, y: number) => void;
  onToggleCollision: (x: number, y: number) => void;
  onToggleTrigger: (x: number, y: number) => void;
  onTogglePeaceful: (x: number, y: number) => void;
  onSaveHistory: () => void;
  onPortalSelect: (portal: Portal | null) => void;
  onSetSpawn: (x: number, y: number) => void;
  onPlacePortal: (x: number, y: number) => void;
  onPlaceItem: (x: number, y: number) => void;
  onCursorMove: (pos: CursorPosition | null) => void;
}

export function MapCanvas({
  playfieldInfo,
  mapData,
  collisionData,
  peacefulData,
  triggerData,
  editorState,
  getTile,
  onPaint,
  onFill,
  onToggleCollision,
  onToggleTrigger,
  onTogglePeaceful,
  onSaveHistory,
  onPortalSelect,
  onSetSpawn,
  onPlacePortal,
  onPlaceItem,
  onCursorMove,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const canvasWidth = playfieldInfo.width * TILE_SIZE;
  const canvasHeight = playfieldInfo.height * TILE_SIZE;

  // Render map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw layers
    for (let layer = 0; layer < 3; layer++) {
      for (let y = 0; y < playfieldInfo.height; y++) {
        for (let x = 0; x < playfieldInfo.width; x++) {
          const tileId = mapData[layer]?.[y * playfieldInfo.width + x];
          if (tileId > 0) {
            const tile = getTile(tileId);
            if (tile) {
              ctx.drawImage(tile, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }
    }

    // Draw collision overlay
    if (editorState.showCollision) {
      for (let y = 0; y < playfieldInfo.height; y++) {
        for (let x = 0; x < playfieldInfo.width; x++) {
          const index = y * playfieldInfo.width + x;
          const collision = collisionData[index] || 0;
          
          if (collision > 0) {
            // Blocked - red overlay
            ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // X mark
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x * TILE_SIZE + 4, y * TILE_SIZE + 4);
            ctx.lineTo(x * TILE_SIZE + TILE_SIZE - 4, y * TILE_SIZE + TILE_SIZE - 4);
            ctx.moveTo(x * TILE_SIZE + TILE_SIZE - 4, y * TILE_SIZE + 4);
            ctx.lineTo(x * TILE_SIZE + 4, y * TILE_SIZE + TILE_SIZE - 4);
            ctx.stroke();
          } else {
            // Walkable - small green dot
            ctx.fillStyle = 'rgba(50, 255, 100, 0.3)';
            ctx.beginPath();
            ctx.arc(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Draw zone overlay (safe = green, fight = red) - PER CELL from peacefulData
    if (editorState.showZones) {
      let peacefulCount = 0;
      let fightCount = 0;
      
      for (let y = 0; y < playfieldInfo.height; y++) {
        for (let x = 0; x < playfieldInfo.width; x++) {
          const index = y * playfieldInfo.width + x;
          const collision = collisionData[index] || 0;
          const peaceful = peacefulData[index] ?? 0;
          
          // Only show zone for non-blocked cells
          if (collision === 0) {
            if (peaceful > 0) {
              // Safe zone - green overlay
              ctx.fillStyle = 'rgba(50, 200, 100, 0.25)';
              ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              peacefulCount++;
            } else {
              // Fight zone - red overlay  
              ctx.fillStyle = 'rgba(200, 50, 50, 0.25)';
              ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              fightCount++;
            }
          }
        }
      }
      // Draw zone summary label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`🛡️ ${peacefulCount} safe | ⚔️ ${fightCount} fight`, 8, 8);
    }

    // Draw trigger overlay (portal animations) - PURPLE/MAGENTA
    if (editorState.showTriggers) {
      for (let y = 0; y < playfieldInfo.height; y++) {
        for (let x = 0; x < playfieldInfo.width; x++) {
          const index = y * playfieldInfo.width + x;
          const trigger = triggerData[index] || 0;
          
          if (trigger > 0) {
            // Trigger cell - magenta/purple overlay (portal animation)
            ctx.fillStyle = 'rgba(200, 50, 255, 0.5)';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Sparkle icon
            ctx.fillStyle = 'rgba(255, 200, 255, 0.9)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✦', x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
          }
        }
      }
    }

    // Draw grid
    if (editorState.showGrid) {
      ctx.strokeStyle = 'rgba(100, 255, 200, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= playfieldInfo.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE, 0);
        ctx.lineTo(x * TILE_SIZE, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= playfieldInfo.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE);
        ctx.lineTo(canvasWidth, y * TILE_SIZE);
        ctx.stroke();
      }
    }

    // Draw spawn point
    if (playfieldInfo.spawnX !== undefined && playfieldInfo.spawnY !== undefined) {
      const sx = playfieldInfo.spawnX * TILE_SIZE + TILE_SIZE / 2;
      const sy = playfieldInfo.spawnY * TILE_SIZE + TILE_SIZE / 2;
      ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw portals with lightning icon
    if (editorState.showPortals) {
      playfieldInfo.portals.forEach((portal) => {
        const px = portal.x * TILE_SIZE + TILE_SIZE / 2;
        const py = portal.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Draw lightning bolt shape
        ctx.fillStyle = 'rgba(255, 220, 50, 0.9)';
        ctx.beginPath();
        ctx.moveTo(px - 4, py - 10);
        ctx.lineTo(px + 6, py - 2);
        ctx.lineTo(px + 1, py - 2);
        ctx.lineTo(px + 4, py + 10);
        ctx.lineTo(px - 6, py + 2);
        ctx.lineTo(px - 1, py + 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw items
    if (editorState.showItems) {
      playfieldInfo.items.forEach((item) => {
        const ix = item.x * TILE_SIZE + TILE_SIZE / 2;
        const iy = item.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Draw item marker (package icon)
        ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
        ctx.fillRect(ix - 8, iy - 8, 16, 16);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(ix - 8, iy - 8, 16, 16);
        ctx.beginPath();
        ctx.moveTo(ix - 8, iy - 2);
        ctx.lineTo(ix + 8, iy - 2);
        ctx.stroke();
        
        // Item template ID
        ctx.fillStyle = '#000';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(item.tplId.toString(), ix, iy + 5);
      });
    }

    // Draw cursor highlight
    if (mousePos && (editorState.tool === 'brush' || editorState.tool === 'eraser' || editorState.tool === 'fill' || editorState.tool === 'portalPlace' || editorState.tool === 'itemPlace' || editorState.tool === 'block' || editorState.tool === 'trigger' || editorState.tool === 'zone')) {
      ctx.strokeStyle = editorState.tool === 'eraser' ? 'rgba(255, 100, 100, 0.8)' : 
                       editorState.tool === 'portalPlace' ? 'rgba(255, 220, 50, 0.8)' :
                       editorState.tool === 'itemPlace' ? 'rgba(100, 200, 255, 0.8)' :
                       editorState.tool === 'block' ? 'rgba(255, 50, 50, 0.8)' :
                       editorState.tool === 'trigger' ? 'rgba(200, 50, 255, 0.8)' :
                       editorState.tool === 'zone' ? 'rgba(50, 200, 100, 0.8)' :
                       'rgba(255, 255, 100, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(mousePos.x * TILE_SIZE, mousePos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }, [playfieldInfo, mapData, collisionData, peacefulData, triggerData, editorState, getTile, mousePos, canvasWidth, canvasHeight]);

  const getTileCoords = useCallback((e: React.MouseEvent): { x: number; y: number; pixelX: number; pixelY: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pixelX = Math.floor((e.clientX - rect.left) * scaleX);
    const pixelY = Math.floor((e.clientY - rect.top) * scaleY);
    const x = Math.floor(pixelX / TILE_SIZE);
    const y = Math.floor(pixelY / TILE_SIZE);

    if (x >= 0 && x < playfieldInfo.width && y >= 0 && y < playfieldInfo.height) {
      return { x, y, pixelX, pixelY };
    }
    return null;
  }, [playfieldInfo.width, playfieldInfo.height]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getTileCoords(e);
    if (!coords) return;

    if (editorState.tool === 'brush' || editorState.tool === 'eraser') {
      setIsPainting(true);
      onSaveHistory();
      onPaint(coords.x, coords.y);
    } else if (editorState.tool === 'fill') {
      onFill(coords.x, coords.y);
    } else if (editorState.tool === 'block') {
      onSaveHistory();
      onToggleCollision(coords.x, coords.y);
    } else if (editorState.tool === 'trigger') {
      onSaveHistory();
      onToggleTrigger(coords.x, coords.y);
    } else if (editorState.tool === 'zone') {
      onSaveHistory();
      onTogglePeaceful(coords.x, coords.y);
    } else if (editorState.tool === 'spawn') {
      onSetSpawn(coords.x, coords.y);
    } else if (editorState.tool === 'portalPlace') {
      onPlacePortal(coords.x, coords.y);
    } else if (editorState.tool === 'itemPlace') {
      onPlaceItem(coords.x, coords.y);
    } else if (editorState.tool === 'portal') {
      const clickedPortal = playfieldInfo.portals.find(
        p => coords.x >= p.x && coords.x < p.x + p.width && coords.y >= p.y && coords.y < p.y + p.height
      );
      onPortalSelect(clickedPortal || null);
    }
  }, [editorState.tool, getTileCoords, playfieldInfo.portals, onFill, onPaint, onToggleCollision, onToggleTrigger, onTogglePeaceful, onPortalSelect, onSaveHistory, onSetSpawn, onPlacePortal, onPlaceItem]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const coords = getTileCoords(e);
    if (coords) {
      setMousePos({ x: coords.x, y: coords.y });
      onCursorMove({
        tileX: coords.x,
        tileY: coords.y,
        pixelX: coords.pixelX,
        pixelY: coords.pixelY,
      });
    } else {
      setMousePos(null);
      onCursorMove(null);
    }

    if (isPainting && coords) {
      onPaint(coords.x, coords.y);
    }
  }, [getTileCoords, isDragging, isPainting, onPaint, onCursorMove]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPainting(false);
    setIsDragging(false);
    setMousePos(null);
    onCursorMove(null);
  }, [onCursorMove]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto bg-background scrollbar-thin relative"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="inline-block p-8"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${editorState.zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={cn(
            'border border-border cursor-crosshair',
            editorState.tool === 'select' && 'cursor-default',
            editorState.tool === 'portal' && 'cursor-pointer'
          )}
          style={{ imageRendering: 'pixelated' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
      </div>
    </div>
  );
}
