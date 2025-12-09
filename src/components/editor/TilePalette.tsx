import { Loader2 } from 'lucide-react';
import { LoadedTileset } from '@/lib/rhynnTiles';
import { cn } from '@/lib/utils';

interface TilePaletteProps {
  loadedTilesets: LoadedTileset[];
  isLoading: boolean;
  selectedTileId: number | null;
  onSelectTile: (localIndex: number) => void;
  graphicsIds: number[];
}

export function TilePalette({
  loadedTilesets,
  isLoading,
  selectedTileId,
  onSelectTile,
  graphicsIds,
}: TilePaletteProps) {
  // Calculate tile ID using the correct format: tilesetIndex * 32 + localIndex + 1
  // This matches the data.bin format where each tileset gets 32 tile slots (5 bits)
  
  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <span>Tiles</span>
        {isLoading && <Loader2 size={14} className="animate-spin text-primary" />}
      </div>

      {loadedTilesets.length > 0 && (
        <div className="px-2 py-1.5 border-b border-border text-xs text-muted-foreground">
          <span className="text-foreground">{loadedTilesets.length} tileset(s)</span>
          <br />
          <span>{loadedTilesets.reduce((acc, t) => acc + t.tiles.length, 0)} total tiles</span>
        </div>
      )}

      <div className="flex-1 overflow-auto scrollbar-thin p-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs text-center p-4">
            <Loader2 size={32} className="mb-2 animate-spin text-primary" />
            <p>Loading tilesets...</p>
            <p className="text-[10px] mt-1">ID: {graphicsIds.join(', ')}</p>
          </div>
        ) : loadedTilesets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs text-center p-4">
            <p>No tilesets loaded</p>
            <p className="text-[10px] mt-1">Import info.json</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loadedTilesets.map((tileset, tilesetIndex) => {
              return (
                <div key={tileset.definition.id}>
                  <div className="text-[10px] text-muted-foreground mb-1 truncate" title={tileset.definition.path}>
                    {tileset.definition.id}: {tileset.definition.path.replace('.png', '')} (tileset {tilesetIndex})
                  </div>
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(tileset.tilesPerRow, 8)}, 24px)`,
                    }}
                  >
                    {tileset.tiles.map((tile, localIndex) => {
                      // CORRECT FORMAT: tilesetIndex * 32 + localIndex + 1 (1-based)
                      // This matches data.bin format: upper 3 bits = tileset, lower 5 bits = tile
                      const tileId = tilesetIndex * 32 + localIndex + 1;
                      // For onSelectTile, pass the 0-based combined index
                      const combinedIndex = tilesetIndex * 32 + localIndex;
                      return (
                        <button
                          key={localIndex}
                          onClick={() => onSelectTile(combinedIndex)}
                          className={cn(
                            'tile-slot w-6 h-6 pixelated',
                            selectedTileId === tileId && 'selected'
                          )}
                          title={`Tile ${tileId} (tileset:${tilesetIndex} local:${localIndex})`}
                        >
                          <img
                            src={tile.toDataURL()}
                            alt={`Tile ${localIndex}`}
                            className="w-full h-full pixelated"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {loadedTilesets.length > 0 && (
        <div className="px-2 py-1.5 border-t border-border text-xs text-muted-foreground">
          <span>Selected: </span>
          <span className="text-accent">{selectedTileId ?? 'None'}</span>
        </div>
      )}
    </div>
  );
}
