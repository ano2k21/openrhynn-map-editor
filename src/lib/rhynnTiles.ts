// Rhynn tile definitions and loader
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/steel-team/OpenrhynnServerContent/master/data/tiles';
const TILE_SIZE = 24;

export interface TileDefinition {
  id: number;
  type: 'background' | 'character';
  path: string;
}

export interface LoadedTileset {
  definition: TileDefinition;
  image: HTMLImageElement;
  tiles: HTMLCanvasElement[];
  tilesPerRow: number;
  tilesPerCol: number;
}

// Tile definition from OpenrhynnServerContent
export const TILE_DEFINITIONS: TileDefinition[] = [
  // Background tiles
  { id: 100110, type: 'background', path: 'back_plains_desert_harbour_01.png' },
  { id: 100111, type: 'background', path: 'back_plains_desert_harbour_02.png' },
  { id: 100112, type: 'background', path: 'back_desert_pyramids_01.png' },
  { id: 100121, type: 'background', path: 'back_rainforest_01.png' },
  { id: 100122, type: 'background', path: 'back_rainforest_02.png' },
  { id: 100123, type: 'background', path: 'back_rainforest_03.png' },
  { id: 100124, type: 'background', path: 'back_brick_dungeon_01.png' },
  { id: 100125, type: 'background', path: 'back_brick_dungeon_02.png' },
  { id: 100126, type: 'background', path: 'back_grass_dwarf_01.png' },
  { id: 100127, type: 'background', path: 'back_grass_human_01.png' },
  { id: 100128, type: 'background', path: 'back_grass_orc_01.png' },
  { id: 100129, type: 'background', path: 'back_indoor_hut_01.png' },
  { id: 100130, type: 'background', path: 'back_lava_pit_01.png' },
  { id: 100131, type: 'background', path: 'back_nebula_dungeon_01.png' },
  { id: 100132, type: 'background', path: 'back_plains_01.png' },
  { id: 100133, type: 'background', path: 'back_plains_desert_01.png' },
  { id: 100134, type: 'background', path: 'back_plains_desert_02.png' },
  { id: 100135, type: 'background', path: 'back_plains_harbour_01.png' },
  { id: 100136, type: 'background', path: 'back_plains_lake_01.png' },
  { id: 100137, type: 'background', path: 'back_plains_snow_01.png' },
  { id: 100138, type: 'background', path: 'back_plains_snow_02.png' },
  { id: 100139, type: 'background', path: 'back_ruins_01.png' },
  { id: 100140, type: 'background', path: 'back_ruins_02.png' },
  { id: 100141, type: 'background', path: 'back_town_human_01.png' },
  { id: 100142, type: 'background', path: 'back_town_human_02.png' },
  { id: 100143, type: 'background', path: 'back_violet_dungeon_01.png' },
  { id: 100144, type: 'background', path: 'back_violet_dungeon_02.png' },
  { id: 100145, type: 'background', path: 'back_indoor_pyramid_01.png' },
  { id: 100146, type: 'background', path: 'back_grass_elf_01.png' },
  { id: 100333, type: 'background', path: 'back_ruins_02.png' },
  { id: 100163, type: 'background', path: 'back_plains_harbour_01.png' }, // Assumption based on portal dest
];

// Cache for loaded tilesets
const tilesetCache: Map<number, LoadedTileset> = new Map();
const loadingPromises: Map<number, Promise<LoadedTileset | null>> = new Map();

export function getTileDefinition(graphicsId: number): TileDefinition | undefined {
  return TILE_DEFINITIONS.find(t => t.id === graphicsId);
}

export async function loadTilesetByGraphicsId(graphicsId: number): Promise<LoadedTileset | null> {
  // Check cache first
  if (tilesetCache.has(graphicsId)) {
    return tilesetCache.get(graphicsId)!;
  }

  // Check if already loading
  if (loadingPromises.has(graphicsId)) {
    return loadingPromises.get(graphicsId)!;
  }

  const definition = getTileDefinition(graphicsId);
  if (!definition) {
    console.warn(`No tile definition found for graphics_id: ${graphicsId}`);
    return null;
  }

  const loadPromise = new Promise<LoadedTileset | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const tilesPerRow = Math.floor(img.width / TILE_SIZE);
      const tilesPerCol = Math.floor(img.height / TILE_SIZE);
      
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

      const tileset: LoadedTileset = {
        definition,
        image: img,
        tiles,
        tilesPerRow,
        tilesPerCol,
      };

      tilesetCache.set(graphicsId, tileset);
      loadingPromises.delete(graphicsId);
      resolve(tileset);
    };

    img.onerror = () => {
      console.error(`Failed to load tileset: ${definition.path}`);
      loadingPromises.delete(graphicsId);
      resolve(null);
    };

    const folder = definition.type === 'background' ? 'background' : 'character';
    img.src = `${GITHUB_RAW_BASE}/${folder}/${definition.path}`;
  });

  loadingPromises.set(graphicsId, loadPromise);
  return loadPromise;
}

// Load multiple tilesets and combine them
export async function loadMultipleTilesets(graphicsIds: number[]): Promise<LoadedTileset[]> {
  const promises = graphicsIds.map(id => loadTilesetByGraphicsId(id));
  const results = await Promise.all(promises);
  return results.filter((t): t is LoadedTileset => t !== null);
}

export function getCachedTileset(graphicsId: number): LoadedTileset | undefined {
  return tilesetCache.get(graphicsId);
}

export function getAllCachedTilesets(): LoadedTileset[] {
  return Array.from(tilesetCache.values());
}

export function clearTilesetCache(): void {
  tilesetCache.clear();
}

// Load just the image for preview purposes
export async function loadTilesetImage(graphicsId: number): Promise<HTMLImageElement | null> {
  const definition = getTileDefinition(graphicsId);
  if (!definition) return null;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    const folder = definition.type === 'background' ? 'background' : 'character';
    img.src = `${GITHUB_RAW_BASE}/${folder}/${definition.path}`;
  });
}

// Get a specific tile from a tileset by local index
export function getTileFromTileset(tileset: LoadedTileset, localIndex: number): HTMLCanvasElement | null {
  if (localIndex < 0 || localIndex >= tileset.tiles.length) {
    return null;
  }
  return tileset.tiles[localIndex];
}

// Get combined tile from multiple tilesets
// tileIndex uses the format: tilesetIndex * 32 + localTileIndex + 1 (1-based)
export function getTileFromCombinedTilesets(tilesets: LoadedTileset[], tileIndex: number): HTMLCanvasElement | null {
  if (tileIndex <= 0 || tilesets.length === 0) return null;
  
  // Convert to 0-based index
  const zeroBasedIndex = tileIndex - 1;
  
  // Each tileset uses 32-tile blocks (5 bits = max 32 tiles)
  const tilesetIndex = Math.floor(zeroBasedIndex / 32);
  const localIndex = zeroBasedIndex % 32;
  
  if (tilesetIndex < 0 || tilesetIndex >= tilesets.length) return null;
  
  const tileset = tilesets[tilesetIndex];
  if (localIndex >= tileset.tiles.length) return null;
  
  return tileset.tiles[localIndex] || null;
}
