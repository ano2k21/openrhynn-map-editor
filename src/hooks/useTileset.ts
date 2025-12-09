import { useState, useCallback } from 'react';

const TILE_SIZE = 24;

export interface TilesetImage {
  id: number;
  name: string;
  image: HTMLImageElement;
  tiles: HTMLCanvasElement[];
  tilesPerRow: number;
  tilesPerCol: number;
  totalTiles: number;
}

export function useTileset() {
  const [tilesets, setTilesets] = useState<TilesetImage[]>([]);
  const [activeTilesetId, setActiveTilesetId] = useState<number | null>(null);

  const loadTileset = useCallback((file: File): Promise<TilesetImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const tilesPerRow = Math.floor(img.width / TILE_SIZE);
          const tilesPerCol = Math.floor(img.height / TILE_SIZE);
          const totalTiles = tilesPerRow * tilesPerCol;
          
          // Extract individual tiles
          const tiles: HTMLCanvasElement[] = [];
          for (let y = 0; y < tilesPerCol; y++) {
            for (let x = 0; x < tilesPerRow; x++) {
              const canvas = document.createElement('canvas');
              canvas.width = TILE_SIZE;
              canvas.height = TILE_SIZE;
              const ctx = canvas.getContext('2d')!;
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(
                img,
                x * TILE_SIZE,
                y * TILE_SIZE,
                TILE_SIZE,
                TILE_SIZE,
                0,
                0,
                TILE_SIZE,
                TILE_SIZE
              );
              tiles.push(canvas);
            }
          }

          const tileset: TilesetImage = {
            id: Date.now(),
            name: file.name,
            image: img,
            tiles,
            tilesPerRow,
            tilesPerCol,
            totalTiles,
          };

          setTilesets(prev => [...prev, tileset]);
          setActiveTilesetId(tileset.id);
          resolve(tileset);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const removeTileset = useCallback((id: number) => {
    setTilesets(prev => prev.filter(t => t.id !== id));
    if (activeTilesetId === id) {
      setActiveTilesetId(null);
    }
  }, [activeTilesetId]);

  const getTile = useCallback((tileId: number): HTMLCanvasElement | null => {
    if (tileId <= 0) return null;
    
    let offset = 0;
    for (const tileset of tilesets) {
      if (tileId <= offset + tileset.totalTiles) {
        const localIndex = tileId - offset - 1;
        return tileset.tiles[localIndex] || null;
      }
      offset += tileset.totalTiles;
    }
    return null;
  }, [tilesets]);

  const getGlobalTileId = useCallback((tilesetId: number, localIndex: number): number => {
    let offset = 0;
    for (const tileset of tilesets) {
      if (tileset.id === tilesetId) {
        return offset + localIndex + 1;
      }
      offset += tileset.totalTiles;
    }
    return 0;
  }, [tilesets]);

  const activeTileset = tilesets.find(t => t.id === activeTilesetId) || null;

  return {
    tilesets,
    activeTileset,
    activeTilesetId,
    setActiveTilesetId,
    loadTileset,
    removeTileset,
    getTile,
    getGlobalTileId,
  };
}
