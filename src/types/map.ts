export interface Portal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetPlayfieldId: number;
  targetX: number;
  targetY: number;
  name: string;
  requiredLevel?: number;
  requiredQuest?: string;
}

export interface Item {
  id: string;
  tplId: number;
  x: number;
  y: number;
  respawnDelay: number;
  units: number;
}

export interface MobSpawn {
  id: string;
  objectId: number;      // object_id - unique mob instance ID
  tplId: number;         // tpl_id - mob template ID
  x: number;             // spawn_x - pixel X coordinate
  y: number;             // spawn_y - pixel Y coordinate
  respawnDelay: number;  // respawn_delay - in milliseconds
}

// Rhynn playfield info.json format
export interface PlayfieldInfo {
  id: number;
  name: string;
  width: number;
  height: number;
  graphicsIds: number[]; // Array of graphics IDs (multiple tilesets)
  requiredLevel?: number;
  pvpEnabled?: boolean;
  musicId?: number;
  ambientLight?: number;
  spawnX?: number;
  spawnY?: number;
  portals: Portal[];
  items: Item[];
  mobSpawns: MobSpawn[];
}

export interface Tile {
  id: number;
  walkable: boolean;
  layer: number;
}

export interface TilesetTile {
  id: number;
  x: number;
  y: number;
  image: ImageData | null;
}

export type Tool = 'select' | 'brush' | 'eraser' | 'fill' | 'portal' | 'spawn' | 'item' | 'portalPlace' | 'itemPlace' | 'mobPlace' | 'block' | 'trigger' | 'zone';

export interface EditorState {
  tool: Tool;
  selectedTileId: number | null;
  selectedLayer: number;
  zoom: number;
  showGrid: boolean;
  showPortals: boolean;
  showItems: boolean;
  showCollision: boolean;
  showTriggers: boolean;
  showZones: boolean;
}

export interface CursorPosition {
  tileX: number;
  tileY: number;
  pixelX: number;
  pixelY: number;
}
