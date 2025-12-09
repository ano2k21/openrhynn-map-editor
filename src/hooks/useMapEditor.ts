import { useState, useCallback, useRef, useEffect } from 'react';
import { PlayfieldInfo, Portal, Item, EditorState, Tool } from '@/types/map';
import { loadMultipleTilesets, LoadedTileset, getTileFromCombinedTilesets } from '@/lib/rhynnTiles';

const TILE_SIZE = 24;

export function useMapEditor() {
  const [playfieldInfo, setPlayfieldInfo] = useState<PlayfieldInfo>({
    id: 1,
    name: 'Naujas žemėlapis',
    width: 40,
    height: 30,
    graphicsIds: [100127], // Default: back_grass_human_01.png
    portals: [],
    items: [],
    spawnX: 5,
    spawnY: 5,
    pvpEnabled: false,
    musicId: 0,
  });

  const [mapData, setMapData] = useState<number[][]>(() => {
    const data: number[][] = [];
    for (let layer = 0; layer < 3; layer++) {
      data[layer] = new Array(40 * 30).fill(0);
    }
    return data;
  });

  const [collisionData, setCollisionData] = useState<number[]>(() => {
    return new Array(40 * 30).fill(0);
  });

  // Trigger data: 0 = none, 15 (0x0F) = default trigger (portal animation)
  // CLIENT uses hasTrigger(15) which checks if (triggerValue & 15) == 15
  // So we need to store 15 (all 4 bits set) for portal animations to show
  const TRIGGER_DEFAULT = 15; // 0x0F - required for client animation
  
  const [triggerData, setTriggerData] = useState<number[]>(() => {
    return new Array(40 * 30).fill(0);
  });

  // Refs to always have latest data in export (avoids stale closures)
  const mapDataRef = useRef(mapData);
  const collisionDataRef = useRef(collisionData);
  const triggerDataRef = useRef(triggerData);
  const playfieldInfoRef = useRef(playfieldInfo);

  // Synchronously update refs when state changes
  mapDataRef.current = mapData;
  collisionDataRef.current = collisionData;
  triggerDataRef.current = triggerData;
  playfieldInfoRef.current = playfieldInfo;

  const [editorState, setEditorState] = useState<EditorState>({
    tool: 'brush',
    selectedTileId: 0,
    selectedLayer: 0,
    zoom: 1,
    showGrid: true,
    showPortals: true,
    showItems: true,
    showCollision: false,
    showTriggers: true,
  });

  const [loadedTilesets, setLoadedTilesets] = useState<LoadedTileset[]>([]);
  const [isLoadingTileset, setIsLoadingTileset] = useState(false);

  const [history, setHistory] = useState<{ mapData: number[][]; collisionData: number[]; triggerData: number[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load tilesets by graphics IDs array
  const loadTilesets = useCallback(async (graphicsIds: number[]) => {
    setIsLoadingTileset(true);
    try {
      const tilesets = await loadMultipleTilesets(graphicsIds);
      setLoadedTilesets(tilesets);
      console.log(`Loaded ${tilesets.length} tilesets with total ${tilesets.reduce((acc, t) => acc + t.tiles.length, 0)} tiles`);
    } catch (error) {
      console.error('Failed to load tilesets:', error);
    }
    setIsLoadingTileset(false);
  }, []);

  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      mapData: mapData.map(layer => [...layer]),
      collisionData: [...collisionData],
      triggerData: [...triggerData],
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, mapData, collisionData, triggerData]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prev = history[historyIndex - 1];
      setMapData(prev.mapData.map(layer => [...layer]));
      setCollisionData([...prev.collisionData]);
      setTriggerData([...prev.triggerData]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const next = history[historyIndex + 1];
      setMapData(next.mapData.map(layer => [...layer]));
      setCollisionData([...next.collisionData]);
      setTriggerData([...next.triggerData]);
    }
  }, [history, historyIndex]);

  const setTool = useCallback((tool: Tool) => {
    setEditorState(prev => ({ ...prev, tool }));
  }, []);

  const setSelectedTile = useCallback((tileId: number) => {
    setEditorState(prev => ({ ...prev, selectedTileId: tileId }));
  }, []);

  const setSelectedLayer = useCallback((layer: number) => {
    setEditorState(prev => ({ ...prev, selectedLayer: layer }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setEditorState(prev => ({ ...prev, zoom: Math.max(0.5, Math.min(4, zoom)) }));
  }, []);

  const toggleGrid = useCallback(() => {
    setEditorState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const togglePortals = useCallback(() => {
    setEditorState(prev => ({ ...prev, showPortals: !prev.showPortals }));
  }, []);

  const toggleItems = useCallback(() => {
    setEditorState(prev => ({ ...prev, showItems: !prev.showItems }));
  }, []);

  const toggleCollision = useCallback(() => {
    setEditorState(prev => ({ ...prev, showCollision: !prev.showCollision }));
  }, []);

  const toggleTriggers = useCallback(() => {
    setEditorState(prev => ({ ...prev, showTriggers: !prev.showTriggers }));
  }, []);

  const toggleCollisionAt = useCallback((x: number, y: number) => {
    if (x < 0 || x >= playfieldInfo.width || y < 0 || y >= playfieldInfo.height) return;
    const index = y * playfieldInfo.width + x;
    setCollisionData(prev => {
      const newData = [...prev];
      newData[index] = newData[index] > 0 ? 0 : 1;
      return newData;
    });
  }, [playfieldInfo.width, playfieldInfo.height]);

  const toggleTriggerAt = useCallback((x: number, y: number) => {
    // Get current dimensions directly from state via ref
    const width = playfieldInfoRef.current.width;
    const height = playfieldInfoRef.current.height;
    const expectedSize = width * height;
    const index = y * width + x;
    
    console.log(`⚡ TOGGLE: (${x},${y}) width=${width} height=${height} index=${index}`);
    
    if (x < 0 || x >= width || y < 0 || y >= height) {
      console.log(`⚡ OUT OF BOUNDS`);
      return;
    }
    
    // Use functional update to ensure we have latest state
    setTriggerData(currentTriggerData => {
      // Make a copy
      const newData = [...currentTriggerData];
      
      // Resize if needed
      while (newData.length < expectedSize) {
        newData.push(0);
      }
      
      // Toggle the value - use TRIGGER_DEFAULT (15) for animations to show in client
      const oldValue = newData[index] || 0;
      const newValue = oldValue > 0 ? 0 : 15; // Use 15 (0x0F) for client compatibility
      newData[index] = newValue;
      
      console.log(`⚡ TOGGLE RESULT: index=${index} was=${oldValue} now=${newValue} total=${newData.filter(v => v > 0).length}`);
      
      return newData;
    });
  }, []);

  const paintTile = useCallback((x: number, y: number) => {
    if (x < 0 || x >= playfieldInfo.width || y < 0 || y >= playfieldInfo.height) return;
    if (editorState.selectedTileId === null) return;

    const index = y * playfieldInfo.width + x;
    setMapData(prev => {
      const newData = prev.map(layer => [...layer]);
      if (editorState.tool === 'brush') {
        newData[editorState.selectedLayer][index] = editorState.selectedTileId;
      } else if (editorState.tool === 'eraser') {
        newData[editorState.selectedLayer][index] = 0;
      }
      return newData;
    });
  }, [playfieldInfo.width, playfieldInfo.height, editorState]);

  const floodFill = useCallback((startX: number, startY: number) => {
    if (editorState.selectedTileId === null) return;

    const targetTile = mapData[editorState.selectedLayer][startY * playfieldInfo.width + startX];
    const fillTile = editorState.selectedTileId;
    if (targetTile === fillTile) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();
    const newData = mapData.map(layer => [...layer]);

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= playfieldInfo.width || y < 0 || y >= playfieldInfo.height) continue;

      const index = y * playfieldInfo.width + x;
      if (newData[editorState.selectedLayer][index] !== targetTile) continue;

      visited.add(key);
      newData[editorState.selectedLayer][index] = fillTile;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    setMapData(newData);
    saveToHistory();
  }, [mapData, playfieldInfo.width, playfieldInfo.height, editorState, saveToHistory]);

  const addPortal = useCallback((portal: Omit<Portal, 'id'>) => {
    // Get latest dimensions from ref
    const width = playfieldInfoRef.current.width;
    const height = playfieldInfoRef.current.height;
    const expectedSize = width * height;
    
    console.log(`🚪 ADD PORTAL: (${portal.x}, ${portal.y}) size=${portal.width || 1}x${portal.height || 1}, map=${width}x${height}, expectedSize=${expectedSize}`);
    
    const newPortal: Portal = {
      ...portal,
      id: `portal_${Date.now()}`,
    };
    
    // Calculate trigger indices BEFORE any state updates
    const triggerIndices: number[] = [];
    for (let dy = 0; dy < (portal.height || 1); dy++) {
      for (let dx = 0; dx < (portal.width || 1); dx++) {
        const px = portal.x + dx;
        const py = portal.y + dy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          const index = py * width + px;
          triggerIndices.push(index);
          console.log(`🚪 Portal cell (${px}, ${py}) -> index ${index}`);
        }
      }
    }
    
    // Update portals list
    setPlayfieldInfo(prev => ({
      ...prev,
      portals: [...prev.portals, newPortal],
    }));
    
    // CRITICAL FIX: Update trigger data AND ref synchronously
    const currentTriggers = triggerDataRef.current;
    const newTriggers = new Array(expectedSize).fill(0);
    
    // Copy existing triggers
    for (let i = 0; i < Math.min(currentTriggers.length, expectedSize); i++) {
      newTriggers[i] = currentTriggers[i];
    }
    
    // Set triggers for new portal - use 15 (0x0F) for client animation compatibility
    for (const idx of triggerIndices) {
      if (idx >= 0 && idx < expectedSize) {
        console.log(`✅ Setting trigger at index ${idx} = 15 (0x0F)`);
        newTriggers[idx] = 15; // 0x0F - required for client hasTrigger(15) check
      }
    }
    
    // Update BOTH state AND ref immediately
    triggerDataRef.current = newTriggers;
    setTriggerData(newTriggers);
    
    console.log(`🚪 After addPortal: ${newTriggers.filter(t => t > 0).length} total triggers`);
  }, []);

  const updatePortal = useCallback((id: string, updates: Partial<Portal>) => {
    setPlayfieldInfo(prev => {
      const oldPortal = prev.portals.find(p => p.id === id);
      const newPortals = prev.portals.map(p => p.id === id ? { ...p, ...updates } : p);
      
      // If position changed, update triggers
      if (oldPortal && (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined)) {
        const newPortal = newPortals.find(p => p.id === id)!;
        
        // Remove old triggers
        setTriggerData(triggerPrev => {
          const width = prev.width;
          const newData = [...triggerPrev];
          for (let dy = 0; dy < (oldPortal.height || 1); dy++) {
            for (let dx = 0; dx < (oldPortal.width || 1); dx++) {
              const oldIndex = (oldPortal.y + dy) * width + (oldPortal.x + dx);
              if (oldIndex >= 0 && oldIndex < newData.length) {
                newData[oldIndex] = 0;
              }
            }
          }
          // Add new triggers - use 15 (0x0F) for client animation compatibility
          for (let dy = 0; dy < (newPortal.height || 1); dy++) {
            for (let dx = 0; dx < (newPortal.width || 1); dx++) {
              const newIndex = (newPortal.y + dy) * width + (newPortal.x + dx);
              if (newIndex >= 0 && newIndex < newData.length) {
                newData[newIndex] = 15; // 0x0F
                console.log(`🚪 Auto-moved trigger to (${newPortal.x + dx}, ${newPortal.y + dy}) index=${newIndex}`);
              }
            }
          }
          return newData;
        });
      }
      
      return { ...prev, portals: newPortals };
    });
  }, []);

  const deletePortal = useCallback((id: string) => {
    setPlayfieldInfo(prev => {
      const portal = prev.portals.find(p => p.id === id);
      if (portal) {
        // Remove trigger at portal coordinates
        setTriggerData(triggerPrev => {
          const width = prev.width;
          const newData = [...triggerPrev];
          for (let dy = 0; dy < (portal.height || 1); dy++) {
            for (let dx = 0; dx < (portal.width || 1); dx++) {
              const index = (portal.y + dy) * width + (portal.x + dx);
              if (index >= 0 && index < newData.length) {
                newData[index] = 0;
                console.log(`🚪 Auto-removed trigger at (${portal.x + dx}, ${portal.y + dy}) index=${index}`);
              }
            }
          }
          return newData;
        });
      }
      return { ...prev, portals: prev.portals.filter(p => p.id !== id) };
    });
  }, []);

  const addItem = useCallback((item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: `item_${Date.now()}`,
    };
    setPlayfieldInfo(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    setPlayfieldInfo(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, ...updates } : i),
    }));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setPlayfieldInfo(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }));
  }, []);

  const resizeMap = useCallback((newWidth: number, newHeight: number) => {
    const newMapData = mapData.map(layer => {
      const newLayer = new Array(newWidth * newHeight).fill(0);
      for (let y = 0; y < Math.min(playfieldInfo.height, newHeight); y++) {
        for (let x = 0; x < Math.min(playfieldInfo.width, newWidth); x++) {
          newLayer[y * newWidth + x] = layer[y * playfieldInfo.width + x] || 0;
        }
      }
      return newLayer;
    });
    
    const newCollisionData = new Array(newWidth * newHeight).fill(0);
    const newTriggerData = new Array(newWidth * newHeight).fill(0);
    for (let y = 0; y < Math.min(playfieldInfo.height, newHeight); y++) {
      for (let x = 0; x < Math.min(playfieldInfo.width, newWidth); x++) {
        newCollisionData[y * newWidth + x] = collisionData[y * playfieldInfo.width + x] || 0;
        newTriggerData[y * newWidth + x] = triggerData[y * playfieldInfo.width + x] || 0;
      }
    }
    
    setMapData(newMapData);
    setCollisionData(newCollisionData);
    setTriggerData(newTriggerData);
    setPlayfieldInfo(prev => ({ ...prev, width: newWidth, height: newHeight }));
    saveToHistory();
  }, [mapData, collisionData, triggerData, playfieldInfo.width, playfieldInfo.height, saveToHistory]);

  // Export data.bin - OpenRhynn format: 2 bytes per cell
  // FORMAT (compatible with both server and client):
  // Byte 0: (trigger << 4) | (function & 0x0F) - trigger TOP 4 bits, function BOTTOM 4 bits
  // Byte 1: (tilesetIndex << 5) | (tileIndex & 0x1F) - tileset upper 3 bits, tile lower 5 bits
  // function: 0x01 = blocked, 0x02 = peaceful
  // trigger: 0x01 = default trigger (portal animation/lightning)
  const exportDataBin = useCallback((): ArrayBuffer => {
    // Get state directly (refs are updated synchronously)
    const currentMapData = mapDataRef.current;
    const currentCollisionData = collisionDataRef.current;
    const currentTriggerData = triggerDataRef.current;
    const currentPlayfieldInfo = playfieldInfoRef.current;
    
    // Debug: Check triggerData content
    const nonZeroTriggers = currentTriggerData.filter(t => t > 0);
    console.log(`🔍 Export Debug: triggerData has ${nonZeroTriggers.length} non-zero values`);
    
    const totalTiles = currentPlayfieldInfo.width * currentPlayfieldInfo.height;
    const bytesPerCell = 2;
    const buffer = new ArrayBuffer(totalTiles * bytesPerCell);
    const view = new Uint8Array(buffer);
    
    let triggerCount = 0;
    let blockedCount = 0;
    
    console.log(`📦 Export starting: ${currentPlayfieldInfo.width}x${currentPlayfieldInfo.height}`);
    
    for (let y = 0; y < currentPlayfieldInfo.height; y++) {
      for (let x = 0; x < currentPlayfieldInfo.width; x++) {
        const cellIndex = y * currentPlayfieldInfo.width + x;
        const dataIndex = cellIndex * bytesPerCell;
        
        // RHYNN FORMAT (4-bit trigger for client animation compatibility):
        // Byte 0: trigger (top 4 bits) + function (bottom 4 bits)
        // function: 0x01 = blocked, 0x02 = peaceful
        // trigger: value 1 = portal animation (lightning)
        const collision = currentCollisionData[cellIndex] || 0;
        const trigger = currentTriggerData[cellIndex] || 0;
        const functionValue = collision > 0 ? 0x01 : 0x00;
        
        // Format: (trigger << 4) | (function & 0x0F) - 4-bit trigger for client compatibility
        view[dataIndex] = ((trigger & 0x0F) << 4) | (functionValue & 0x0F);
        
        if (trigger > 0) {
          triggerCount++;
          console.log(`⚡ Export trigger at (${x}, ${y}): trigger=${trigger}, byte=0x${view[dataIndex].toString(16).padStart(2, '0')}`);
        }
        if (collision > 0) blockedCount++;
        
        // Second byte: tileset data (same format)
        const combinedValue = currentMapData[0][cellIndex] || 0;
        if (combinedValue > 0) {
          const zeroBasedValue = combinedValue - 1;
          const tilesetIndex = Math.floor(zeroBasedValue / 32);
          const tileIndex = zeroBasedValue % 32;
          const tilesetByte = ((tilesetIndex & 0x07) << 5) | (tileIndex & 0x1F);
          view[dataIndex + 1] = tilesetByte;
        } else {
          view[dataIndex + 1] = 0;
        }
      }
    }
    console.log(`✅ Exported data.bin: ${totalTiles} tiles, ${triggerCount} triggers, ${blockedCount} blocked`);
    return buffer;
  }, []);

  // Import data.bin - OpenRhynn format: 2 bytes per cell
  // FORMAT (4-bit trigger for client animation compatibility):
  // Byte 0: (trigger << 4) | (function & 0x0F) - trigger TOP 4 bits, function BOTTOM 4 bits
  // Byte 1: (tilesetIndex << 5) | (tileIndex & 0x1F) - tileset upper 3 bits, tile lower 5 bits
  // NOTE: This MERGES with existing trigger data (from portals) instead of replacing
  const importDataBin = useCallback((buffer: ArrayBuffer, width: number, height: number) => {
    const view = new Uint8Array(buffer);
    const totalTiles = width * height;
    const bytesPerCell = 2;
    const newMapData: number[][] = [[], [], []];
    const newCollisionData: number[] = new Array(totalTiles).fill(0);
    
    // Get existing triggers (from portals) and merge with bin data
    const currentTriggers = triggerDataRef.current;
    const newTriggerData: number[] = new Array(totalTiles).fill(0);
    
    // Copy existing portal triggers first
    for (let i = 0; i < Math.min(currentTriggers.length, totalTiles); i++) {
      newTriggerData[i] = currentTriggers[i];
    }
    
    // Initialize all layers
    for (let layer = 0; layer < 3; layer++) {
      newMapData[layer] = new Array(totalTiles).fill(0);
    }
    
    let blockedCount = 0;
    let triggerCount = 0;
    let binTriggerCount = 0;
    
    // Read tiles - row major order, 2 bytes per cell
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellIndex = y * width + x;
        const dataIndex = cellIndex * bytesPerCell;
        
        if (dataIndex + 1 < view.length) {
          const functionByte = view[dataIndex];
          const tilesetByte = view[dataIndex + 1];
          
          // RHYNN FORMAT (4-bit trigger):
          // trigger = top 4 bits (>> 4), function = bottom 4 bits (& 0x0F)
          const functionValue = functionByte & 0x0F;
          const triggerValue = (functionByte & 0xF0) >> 4;
          
          const isBlocked = functionValue === 0x01;
          newCollisionData[cellIndex] = isBlocked ? 1 : 0;
          
          // MERGE: if bin has trigger OR existing portal has trigger -> keep trigger
          if (triggerValue > 0) {
            newTriggerData[cellIndex] = triggerValue;
            binTriggerCount++;
          }
          // Keep portal triggers as-is if already set
          
          if (isBlocked) blockedCount++;
          if (newTriggerData[cellIndex] > 0) triggerCount++;
          
          // Decode: upper 3 bits = tileset index, lower 5 bits = tile index
          const tilesetIndex = (tilesetByte & 0xE0) >> 5;
          const tileIndex = tilesetByte & 0x1F;
          
          // Combine into a single value: tileset * 32 + tileIndex + 1 (1-based for rendering)
          newMapData[0][cellIndex] = tilesetIndex * 32 + tileIndex + 1;
        }
      }
    }
    
    setMapData(newMapData);
    setCollisionData(newCollisionData);
    setTriggerData(newTriggerData);
    triggerDataRef.current = newTriggerData; // Sync ref immediately
    saveToHistory();
    console.log(`📥 Imported ${view.length} bytes, ${totalTiles} tiles, ${blockedCount} blocked, ${binTriggerCount} triggers from bin, ${triggerCount} total triggers`);
  }, [saveToHistory]);

  // Export info.json - Rhynn playfield format
  const exportInfoJson = useCallback((): string => {
    const exportData = {
      info: {
        map_name: playfieldInfo.name,
        width: playfieldInfo.width,
        height: playfieldInfo.height,
        pvp_zone: playfieldInfo.pvpEnabled || false,
        spawn: {
          x: playfieldInfo.spawnX || 0,
          y: playfieldInfo.spawnY || 0,
        },
      },
      items: playfieldInfo.items.map(item => ({
        tpl_id: item.tplId,
        x: item.x,
        y: item.y,
        respawn_delay: item.respawnDelay,
        units: item.units,
      })),
      portals: playfieldInfo.portals.map(p => ({
        cell: { x: p.x, y: p.y },
        dest: {
          world_id: p.targetPlayfieldId,
          x: p.targetX,
          y: p.targetY,
        },
        required_quest: p.requiredQuest || '',
        required_level: p.requiredLevel || 0,
      })),
      triggers: [],
      graphics: playfieldInfo.graphicsIds, // Keep original order
    };
    return JSON.stringify(exportData, null, 2);
  }, [playfieldInfo]);

  // Import info.json and auto-load tilesets
  // NOTE: Triggers will be loaded from data.bin via importDataBin
  // But we also need to ensure portals have triggers set
  const importInfoJson = useCallback(async (json: string): Promise<{ width: number; height: number }> => {
    try {
      const data = JSON.parse(json);
      
      // Parse the actual Rhynn format
      const info = data.info || {};
      const graphics = data.graphics || [100127];
      
      // Spawn and items use PIXEL coordinates, portals use CELL/tile coordinates
      const TILE_SIZE = 24;
      
      const width = info.width || 24;
      const height = info.height || 24;
      
      const portals = (data.portals || []).map((p: any, i: number) => ({
        id: `portal_${i}`,
        x: p.cell?.x || 0, // Already tile coordinates
        y: p.cell?.y || 0,
        width: 1,
        height: 1,
        targetPlayfieldId: p.dest?.world_id || 0,
        targetX: p.dest?.x || 0,
        targetY: p.dest?.y || 0,
        name: `Portalas į ${p.dest?.world_id || 'nežinoma'}`,
        requiredLevel: p.required_level || 0,
        requiredQuest: p.required_quest || '',
      }));
      
      const newInfo: PlayfieldInfo = {
        id: Date.now(),
        name: info.map_name || 'Importuotas žemėlapis',
        width,
        height,
        graphicsIds: graphics,
        pvpEnabled: info.pvp_zone || false,
        // Convert spawn from pixel to tile coordinates
        spawnX: Math.floor((info.spawn?.x || 0) / TILE_SIZE),
        spawnY: Math.floor((info.spawn?.y || 0) / TILE_SIZE),
        portals,
        // Convert items from pixel to tile coordinates
        items: (data.items || []).map((item: any, i: number) => ({
          id: `item_${i}`,
          tplId: item.tpl_id || 0,
          x: Math.floor((item.x || 0) / TILE_SIZE),
          y: Math.floor((item.y || 0) / TILE_SIZE),
          respawnDelay: item.respawn_delay || 0,
          units: item.units || 1,
        })),
      };
      
      console.log(`📥 Parsed: ${newInfo.portals.length} portals, ${newInfo.items.length} items, spawn at (${newInfo.spawnX}, ${newInfo.spawnY})`);
      
      setPlayfieldInfo(newInfo);
      
      // Initialize empty map data with correct dimensions
      const newMapData: number[][] = [];
      for (let layer = 0; layer < 3; layer++) {
        newMapData[layer] = new Array(width * height).fill(0);
      }
      setMapData(newMapData);
      
      // Initialize collision to zeros - actual values come from data.bin
      setCollisionData(new Array(width * height).fill(0));
      
      // Initialize triggers - set to 1 for all portal cells
      // This ensures triggers are set even if data.bin doesn't have them
      const newTriggerData = new Array(width * height).fill(0);
      for (const portal of portals) {
        for (let dy = 0; dy < (portal.height || 1); dy++) {
          for (let dx = 0; dx < (portal.width || 1); dx++) {
            const px = portal.x + dx;
            const py = portal.y + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const index = py * width + px;
              newTriggerData[index] = 15; // 0x0F - required for client hasTrigger(15) check
              console.log(`📥 Auto-set trigger for portal at (${px}, ${py}) index=${index} = 15`);
            }
          }
        }
      }
      setTriggerData(newTriggerData);
      triggerDataRef.current = newTriggerData; // Sync ref
      console.log(`📥 Initialized ${newTriggerData.filter(t => t > 0).length} triggers for portals (value=15)`);
      
      // Load all tilesets from graphics array in original order
      console.log('Loading tilesets:', graphics);
      await loadTilesets(graphics);
      
      return { width, height };
    } catch (e) {
      console.error('Failed to parse info.json:', e);
      return { width: 24, height: 24 };
    }
  }, [loadTilesets]);

  const newMap = useCallback((width: number, height: number, name: string, graphicsIds: number[] = [100127]) => {
    const totalCells = width * height;
    console.log(`🗺️ NEW MAP: ${name}, ${width}x${height} = ${totalCells} cells`);
    
    setPlayfieldInfo({
      id: Date.now(),
      name,
      width,
      height,
      graphicsIds,
      portals: [],
      items: [],
      spawnX: Math.floor(width / 2),
      spawnY: Math.floor(height / 2),
      pvpEnabled: false,
      musicId: 0,
    });
    
    // Reset all map data arrays to correct size
    const newMapData: number[][] = [];
    for (let layer = 0; layer < 3; layer++) {
      newMapData[layer] = new Array(totalCells).fill(0);
    }
    setMapData(newMapData);
    setCollisionData(new Array(totalCells).fill(0));
    setTriggerData(new Array(totalCells).fill(0));
    
    setHistory([]);
    setHistoryIndex(-1);
    loadTilesets(graphicsIds);
    
    console.log(`🗺️ NEW MAP DONE: triggerData should be ${totalCells} zeros`);
  }, [loadTilesets]);

  // Get tile canvas from combined tilesets
  const getTile = useCallback((tileIndex: number): HTMLCanvasElement | null => {
    return getTileFromCombinedTilesets(loadedTilesets, tileIndex);
  }, [loadedTilesets]);

  // Get total tile count across all loaded tilesets
  const getTotalTileCount = useCallback((): number => {
    return loadedTilesets.reduce((acc, t) => acc + t.tiles.length, 0);
  }, [loadedTilesets]);

  return {
    playfieldInfo,
    setPlayfieldInfo,
    mapData,
    setMapData,
    collisionData,
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
    paintTile,
    floodFill,
    toggleCollisionAt,
    toggleTriggerAt,
    addPortal,
    updatePortal,
    deletePortal,
    addItem,
    updateItem,
    deleteItem,
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
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
