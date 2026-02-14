import { PlayfieldInfo, EditorState, CursorPosition } from '@/types/map';

interface StatusBarProps {
  playfieldInfo: PlayfieldInfo;
  editorState: EditorState;
  cursorPosition: CursorPosition | null;
  isLoadingTileset?: boolean;
  totalTiles: number;
  triggerCount: number;
}

const toolNames: Record<string, string> = {
  select: 'Select',
  brush: 'Brush',
  eraser: 'Eraser',
  fill: 'Fill',
  portal: 'Portal',
  portalPlace: 'Place Portal',
  itemPlace: 'Place Item',
  spawn: 'Spawn',
  item: 'Item',
  block: 'Block',
};

const layerNames = ['Ground', 'Objects', 'Top'];

export function StatusBar({ playfieldInfo, editorState, cursorPosition, isLoadingTileset, totalTiles, triggerCount }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span>
        <span className="text-muted-foreground">Map:</span>{' '}
        <span className="text-foreground">{playfieldInfo.name}</span>
      </span>
      <span>
        <span className="text-muted-foreground">Size:</span>{' '}
        <span className="text-foreground">{playfieldInfo.width}×{playfieldInfo.height}</span>
      </span>
      <span>
        <span className="text-muted-foreground">Graphics:</span>{' '}
        <span className="text-accent">{playfieldInfo.graphicsIds.join(', ')}</span>
        {isLoadingTileset && <span className="text-primary ml-1 animate-pulse">loading...</span>}
      </span>
      <span>
        <span className="text-muted-foreground">Tiles:</span>{' '}
        <span className="text-foreground">{totalTiles}</span>
      </span>
      <span>
        <span className="text-muted-foreground">Tool:</span>{' '}
        <span className="text-primary">{toolNames[editorState.tool]}</span>
      </span>
      <span>
        <span className="text-muted-foreground">Layer:</span>{' '}
        <span className="text-foreground">{layerNames[editorState.selectedLayer]}</span>
      </span>
      {cursorPosition && (
        <>
          <span>
            <span className="text-muted-foreground">Tile:</span>{' '}
            <span className="text-foreground">{cursorPosition.tileX}, {cursorPosition.tileY}</span>
          </span>
          <span>
            <span className="text-muted-foreground">Pixel:</span>{' '}
            <span className="text-accent">{cursorPosition.pixelX}, {cursorPosition.pixelY}</span>
          </span>
        </>
      )}
      <span>
        <span className="text-muted-foreground">Selected:</span>{' '}
        <span className="text-accent">{editorState.selectedTileId ?? 'None'}</span>
      </span>
      <span className="ml-auto">
        <span className="text-muted-foreground">Portals:</span>{' '}
        <span className="text-portal">{playfieldInfo.portals.length}</span>
        <span className="text-muted-foreground ml-2">Triggers:</span>{' '}
        <span className="text-purple-400">{triggerCount}</span>
        <span className="text-muted-foreground ml-2">Items:</span>{' '}
        <span className="text-blue-400">{playfieldInfo.items.length}</span>
      </span>
    </div>
  );
}
