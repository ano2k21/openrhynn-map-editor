import { useState, useCallback, useEffect } from 'react';
import { useMapEditor } from '@/hooks/useMapEditor';
import { Toolbar } from './Toolbar';
import { TilePalette } from './TilePalette';
import { MapCanvas } from './MapCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { FileMenu } from './FileMenu';
import { StatusBar } from './StatusBar';
import { Portal, MobSpawn, CursorPosition, Tool } from '@/types/map';
import { Map } from 'lucide-react';

export function MapEditor() {
  const {
    playfieldInfo,
    setPlayfieldInfo,
    mapData,
    collisionData,
    peacefulData,
    triggerData,
    editorState,
    loadedTilesets,
    isLoadingTileset,
    loadTilesets,
    setTool,
    setSelectedTile,
    setSelectedLayer,
    setZoom,
    toggleGrid,
    togglePortals,
    toggleItems,
    toggleCollision,
    toggleTriggers,
    toggleZones,
    paintTile,
    floodFill,
    toggleCollisionAt,
    toggleTriggerAt,
    togglePeacefulAt,
    addPortal,
    updatePortal,
    deletePortal,
    addItem,
    updateItem,
    deleteItem,
    addMobSpawn,
    updateMobSpawn,
    deleteMobSpawn,
    exportMobSpawnsSql,
    importMobSpawnsSql,
    resizeMap,
    exportDataBin,
    importDataBin,
    exportInfoJson,
    importInfoJson,
    newMap,
    undo,
    redo,
    saveToHistory,
    getTile,
    getTotalTileCount,
    setSelectedMobTplId,
    canUndo,
    canRedo,
  } = useMapEditor();

  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [pendingDataBin, setPendingDataBin] = useState<ArrayBuffer | null>(null);
  const [infoJsonLoaded, setInfoJsonLoaded] = useState(false);

  // Auto-load default tileset on mount
  useEffect(() => {
    loadTilesets(playfieldInfo.graphicsIds);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
        return;
      }

      const keyToolMap: Record<string, Tool> = {
        'v': 'select',
        'b': 'brush',
        'e': 'eraser',
        'f': 'fill',
        'p': 'portal',
        's': 'spawn',
        'x': 'block',
        't': 'trigger',
        'm': 'mobPlace',
        'z': 'zone',
      };

      const tool = keyToolMap[e.key.toLowerCase()];
      if (tool) {
        setTool(tool);
        return;
      }

      if (e.key.toLowerCase() === 'g') {
        toggleGrid();
      } else if (e.key.toLowerCase() === 'c') {
        toggleCollision();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, toggleGrid, toggleCollision, undo, redo]);

  const handleSetSpawn = useCallback((x: number, y: number) => {
    setPlayfieldInfo(prev => ({ ...prev, spawnX: x, spawnY: y }));
  }, [setPlayfieldInfo]);

  const handlePlacePortal = useCallback((x: number, y: number) => {
    addPortal({
      x,
      y,
      width: 1,
      height: 1,
      targetPlayfieldId: 0,
      targetX: 0,
      targetY: 0,
      name: `Portalas ${playfieldInfo.portals.length + 1}`,
    });
    setTool('portal');
  }, [addPortal, playfieldInfo.portals.length, setTool]);

  const handlePlaceItem = useCallback((x: number, y: number) => {
    addItem({
      tplId: 1,
      x,
      y,
      respawnDelay: 60,
      units: 1,
    });
  }, [addItem]);

  const handlePlaceMob = useCallback((x: number, y: number) => {
    addMobSpawn({
      objectId: 100000 + playfieldInfo.mobSpawns.length,
      tplId: editorState.selectedMobTplId,
      x,
      y,
      respawnDelay: 60000,
    });
  }, [addMobSpawn, playfieldInfo.mobSpawns.length, editorState.selectedMobTplId]);

  const handleSelectTile = useCallback((localIndex: number) => {
    // localIndex is 0-based, we store 1-based for tiles (0 = empty)
    setSelectedTile(localIndex + 1);
  }, [setSelectedTile]);

  // Handle importing info.json first, then data.bin
  const handleImportInfoJson = useCallback(async (json: string) => {
    const { width, height } = await importInfoJson(json);
    setInfoJsonLoaded(true);
    console.log(`Info.json loaded: ${width}x${height}`);
    // If we have pending data.bin, import it now with correct dimensions
    if (pendingDataBin) {
      console.log('Importing pending data.bin with correct dimensions');
      importDataBin(pendingDataBin, width, height);
      setPendingDataBin(null);
    }
  }, [importInfoJson, importDataBin, pendingDataBin]);

  const handleImportDataBin = useCallback((buffer: ArrayBuffer) => {
    // IMPORTANT: Only import if info.json was loaded first
    if (infoJsonLoaded) {
      console.log(`Importing data.bin with dimensions: ${playfieldInfo.width}x${playfieldInfo.height}`);
      importDataBin(buffer, playfieldInfo.width, playfieldInfo.height);
    } else {
      // Store for later when info.json is loaded
      console.log('Storing data.bin, waiting for info.json...');
      setPendingDataBin(buffer);
    }
  }, [importDataBin, playfieldInfo.width, playfieldInfo.height, infoJsonLoaded]);

  const handleNewMap = useCallback((width: number, height: number, name: string, graphicsIds: number[]) => {
    newMap(width, height, name, graphicsIds);
    setInfoJsonLoaded(false); // Reset for new map
    setPendingDataBin(null);
  }, [newMap]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-10 border-b border-border bg-card flex items-center px-2 gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Map size={18} />
          <span className="font-pixel text-[10px]">RHYNN</span>
          <span className="text-xs text-muted-foreground">Žemėlapių redaktorius</span>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        <FileMenu
          mapName={playfieldInfo.name}
          onNewMap={handleNewMap}
          onExportDataBin={exportDataBin}
          onExportInfoJson={exportInfoJson}
          onImportDataBin={handleImportDataBin}
          onImportInfoJson={handleImportInfoJson}
        />
      </header>

      {/* Toolbar */}
      <div className="px-2 py-1.5 border-b border-border bg-card/50">
        <Toolbar
          currentTool={editorState.tool}
          onToolChange={setTool}
          zoom={editorState.zoom}
          onZoomChange={setZoom}
          showGrid={editorState.showGrid}
          onToggleGrid={toggleGrid}
          showPortals={editorState.showPortals}
          onTogglePortals={togglePortals}
          showItems={editorState.showItems}
          onToggleItems={toggleItems}
          showCollision={editorState.showCollision}
          onToggleCollision={toggleCollision}
          showTriggers={editorState.showTriggers}
          onToggleTriggers={toggleTriggers}
          showZones={editorState.showZones}
          onToggleZones={toggleZones}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          selectedLayer={editorState.selectedLayer}
          onLayerChange={setSelectedLayer}
          selectedMobTplId={editorState.selectedMobTplId}
          onMobTplChange={setSelectedMobTplId}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Tile Palette */}
        <div className="w-56 border-r border-border flex flex-col">
          <TilePalette
            loadedTilesets={loadedTilesets}
            isLoading={isLoadingTileset}
            selectedTileId={editorState.selectedTileId}
            onSelectTile={handleSelectTile}
            graphicsIds={playfieldInfo.graphicsIds}
          />
        </div>

        {/* Canvas area */}
        <MapCanvas
          playfieldInfo={playfieldInfo}
          mapData={mapData}
          collisionData={collisionData}
          peacefulData={peacefulData}
          triggerData={triggerData}
          editorState={editorState}
          getTile={getTile}
          onPaint={paintTile}
          onFill={floodFill}
          onToggleCollision={toggleCollisionAt}
          onToggleTrigger={toggleTriggerAt}
          onTogglePeaceful={togglePeacefulAt}
          onSaveHistory={saveToHistory}
          onPortalSelect={setSelectedPortal}
          onSetSpawn={handleSetSpawn}
          onPlacePortal={handlePlacePortal}
          onPlaceItem={handlePlaceItem}
          onPlaceMob={handlePlaceMob}
          onCursorMove={setCursorPosition}
        />

        {/* Right sidebar - Properties */}
        <div className="w-64 border-l border-border flex flex-col">
          <PropertiesPanel
            playfieldInfo={playfieldInfo}
            onPlayfieldInfoChange={setPlayfieldInfo}
            onResize={resizeMap}
            selectedPortal={selectedPortal}
            onPortalUpdate={updatePortal}
            onPortalDelete={deletePortal}
            onPortalAdd={addPortal}
            onItemUpdate={updateItem}
            onItemDelete={deleteItem}
            onMobSpawnAdd={addMobSpawn}
            onMobSpawnUpdate={updateMobSpawn}
            onMobSpawnDelete={deleteMobSpawn}
            onExportMobSpawnsSql={exportMobSpawnsSql}
            onImportMobSpawnsSql={importMobSpawnsSql}
            onLoadTilesets={loadTilesets}
          />
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        playfieldInfo={playfieldInfo}
        editorState={editorState}
        cursorPosition={cursorPosition}
        isLoadingTileset={isLoadingTileset}
        totalTiles={getTotalTileCount()}
        triggerCount={triggerData.filter(t => t > 0).length}
      />
    </div>
  );
}
