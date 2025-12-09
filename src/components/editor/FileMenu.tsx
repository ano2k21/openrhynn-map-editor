import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FileDown, 
  FilePlus, 
  Save,
  FileJson,
  Binary,
  Bug
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TILE_DEFINITIONS, loadTilesetImage } from '@/lib/rhynnTiles';

interface FileMenuProps {
  mapName: string;
  onNewMap: (width: number, height: number, name: string, graphicsIds: number[]) => void;
  onExportDataBin: () => ArrayBuffer;
  onExportInfoJson: () => string;
  onImportDataBin: (buffer: ArrayBuffer) => void;
  onImportInfoJson: (json: string) => Promise<void>;
}

interface TilesetPreview {
  id: number;
  path: string;
  image: HTMLImageElement | null;
}

export function FileMenu({
  mapName,
  onNewMap,
  onExportDataBin,
  onExportInfoJson,
  onImportDataBin,
  onImportInfoJson,
}: FileMenuProps) {
  const dataBinInputRef = useRef<HTMLInputElement>(null);
  const infoJsonInputRef = useRef<HTMLInputElement>(null);
  const [newMapDialog, setNewMapDialog] = useState(false);
  const [newMapData, setNewMapData] = useState({ width: 24, height: 24, name: 'New Map', graphicsIds: [100127] });
  const [tilesetPreviews, setTilesetPreviews] = useState<TilesetPreview[]>([]);

  // Load tileset previews when dialog opens
  useEffect(() => {
    if (newMapDialog) {
      const loadPreviews = async () => {
        const backgrounds = TILE_DEFINITIONS.filter(t => t.type === 'background');
        const previews: TilesetPreview[] = [];
        for (const def of backgrounds.slice(0, 20)) {
          try {
            const img = await loadTilesetImage(def.id);
            previews.push({ id: def.id, path: def.path, image: img });
          } catch {
            previews.push({ id: def.id, path: def.path, image: null });
          }
        }
        setTilesetPreviews(previews);
      };
      loadPreviews();
    }
  }, [newMapDialog]);

  const handleExportDataBin = () => {
    const buffer = onExportDataBin();
    
    // Parse exported buffer to count triggers
    const view = new Uint8Array(buffer);
    let triggerCount = 0;
    for (let i = 0; i < view.length; i += 2) {
      const triggerValue = (view[i] & 0xF0) >> 4;
      if (triggerValue > 0) triggerCount++;
    }
    
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.bin';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Eksportuota data.bin su ${triggerCount} trigger(iais)`);
  };

  const handleExportInfoJson = () => {
    const json = onExportInfoJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'info.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDataBin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        onImportDataBin(buffer);
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = '';
  };

  const handleImportInfoJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const json = event.target?.result as string;
        await onImportInfoJson(json);
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleCreateNewMap = () => {
    onNewMap(newMapData.width, newMapData.height, newMapData.name, newMapData.graphicsIds);
    setNewMapDialog(false);
  };

  const toggleGraphics = (id: number) => {
    setNewMapData(prev => {
      if (prev.graphicsIds.includes(id)) {
        if (prev.graphicsIds.length > 1) {
          return { ...prev, graphicsIds: prev.graphicsIds.filter(g => g !== id) };
        }
        return prev;
      }
      return { ...prev, graphicsIds: [...prev.graphicsIds, id] };
    });
  };

  // Debug: Analyze sample data.bin to see trigger format
  const handleAnalyzeSample = async () => {
    try {
      const response = await fetch('/sample/data.bin');
      const buffer = await response.arrayBuffer();
      const infoResponse = await fetch('/sample/info.json');
      const info = await infoResponse.json();
      
      const view = new Uint8Array(buffer);
      const width = info.info.width || 24;
      const height = info.info.height || 24;
      
      console.log(`📊 Sample Analysis: ${width}x${height} = ${width * height} tiles, buffer size: ${buffer.byteLength} bytes`);
      console.log(`📊 Portal coordinates from info.json:`, info.portals.map((p: any) => `(${p.cell.x}, ${p.cell.y})`));
      
      // Check portal positions specifically
      console.log('📊 Checking portal positions in data.bin:');
      for (const portal of info.portals) {
        const px = portal.cell.x;
        const py = portal.cell.y;
        const cellIndex = py * width + px;
        const dataIndex = cellIndex * 2;
        const byte0 = view[dataIndex];
        const byte1 = view[dataIndex + 1];
        const trigger = (byte0 & 0xF0) >> 4;
        const func = byte0 & 0x0F;
        console.log(`🚪 Portal (${px},${py}): index=${cellIndex}, byte0=0x${byte0.toString(16).padStart(2,'0')}, byte1=0x${byte1.toString(16).padStart(2,'0')}, trigger=${trigger}, func=${func}`);
      }
      
      const triggers: { x: number, y: number, byte: string, trigger: number }[] = [];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const cellIndex = y * width + x;
          const dataIndex = cellIndex * 2;
          
          if (dataIndex < view.length) {
            const byte0 = view[dataIndex];
            const trigger = (byte0 & 0xF0) >> 4;
            const func = byte0 & 0x0F;
            
            if (trigger > 0) {
              triggers.push({ x, y, byte: `0x${byte0.toString(16).padStart(2, '0')}`, trigger });
              console.log(`⚡ Sample trigger at (${x}, ${y}): byte0=0x${byte0.toString(16).padStart(2, '0')}, trigger=${trigger}, func=${func}`);
            }
          }
        }
      }
      
      console.log(`📊 Total triggers in sample: ${triggers.length}`);
      console.log(`📊 Portals count: ${info.portals.length}`);
      
      if (triggers.length === 0 && info.portals.length > 0) {
        console.warn('⚠️ WARNING: Sample data.bin has NO triggers stored! Triggers may need to be set from info.json portals!');
      }
      
      toast.info(`Sample: ${triggers.length} triggers in bin, ${info.portals.length} portals in json`);
    } catch (e) {
      console.error('Failed to analyze sample:', e);
      toast.error('Failed to analyze sample');
    }
  };
  
  // Debug: Analyze uploaded data_3-2.bin
  const handleAnalyzeUserBin = async () => {
    try {
      const response = await fetch('/debug/data_3-2.bin');
      const buffer = await response.arrayBuffer();
      const view = new Uint8Array(buffer);
      
      console.log(`📊 User data_3-2.bin: ${buffer.byteLength} bytes`);
      
      // Guess dimensions - check if it's square-ish
      const cellCount = buffer.byteLength / 2;
      console.log(`📊 Cell count: ${cellCount}`);
      
      // Show first 50 bytes raw
      console.log(`📊 First 50 bytes (raw):`, Array.from(view.slice(0, 50)).map(b => `0x${b.toString(16).padStart(2,'0')}`).join(' '));
      
      // Count triggers and blocks in file
      let triggerCount = 0;
      let blockCount = 0;
      const triggerPositions: string[] = [];
      
      // Assume common sizes: 24x24=576, 32x32=1024, 40x40=1600, 50x50=2500
      const possibleWidths = [24, 32, 40, 48, 50, 64];
      for (const width of possibleWidths) {
        const height = Math.floor(cellCount / width);
        if (width * height === cellCount) {
          console.log(`📊 Possible dimensions: ${width}x${height}`);
        }
      }
      
      for (let i = 0; i < view.length; i += 2) {
        const byte0 = view[i];
        const trigger = (byte0 & 0xF0) >> 4;
        const func = byte0 & 0x0F;
        
        if (trigger > 0) {
          triggerCount++;
          const cellIndex = i / 2;
          triggerPositions.push(`cell${cellIndex}:0x${byte0.toString(16).padStart(2,'0')}`);
        }
        if (func === 1) {
          blockCount++;
        }
      }
      
      console.log(`📊 User bin: ${triggerCount} triggers, ${blockCount} blocked cells`);
      console.log(`📊 Trigger positions:`, triggerPositions.slice(0, 20));
      
      toast.info(`User bin: ${triggerCount} triggers, ${blockCount} blocked, ${cellCount} cells`);
    } catch (e) {
      console.error('Failed to analyze user bin:', e);
      toast.error('Failed to analyze user bin');
    }
  };

  return (
    <>
      <input
        ref={dataBinInputRef}
        type="file"
        accept=".bin"
        className="hidden"
        onChange={handleImportDataBin}
      />
      <input
        ref={infoJsonInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportInfoJson}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-3 py-1.5 text-xs hover:bg-secondary rounded-sm transition-colors">
            File
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setNewMapDialog(true)}>
            <FilePlus size={14} className="mr-2" />
            New Map
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => infoJsonInputRef.current?.click()}>
            <FileJson size={14} className="mr-2" />
            Import info.json (first!)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dataBinInputRef.current?.click()}>
            <Binary size={14} className="mr-2" />
            Import data.bin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportInfoJson}>
            <FileDown size={14} className="mr-2" />
            Export info.json
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportDataBin}>
            <Save size={14} className="mr-2" />
            Export data.bin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAnalyzeSample}>
            <Bug size={14} className="mr-2" />
            Debug: Analyze Sample
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAnalyzeUserBin}>
            <Bug size={14} className="mr-2" />
            Debug: Analyze User Bin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={newMapDialog} onOpenChange={setNewMapDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={newMapData.name}
                onChange={(e) => setNewMapData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Width (tiles)</label>
                <input
                  type="number"
                  value={newMapData.width}
                  onChange={(e) => setNewMapData(prev => ({ ...prev, width: parseInt(e.target.value) || 10 }))}
                  className="input-field w-full"
                  min={1}
                  max={500}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Height (tiles)</label>
                <input
                  type="number"
                  value={newMapData.height}
                  onChange={(e) => setNewMapData(prev => ({ ...prev, height: parseInt(e.target.value) || 10 }))}
                  className="input-field w-full"
                  min={1}
                  max={500}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Select tileset</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto p-1">
                {tilesetPreviews.map((preview) => (
                  <button
                    key={preview.id}
                    onClick={() => toggleGraphics(preview.id)}
                    className={`relative border-2 rounded p-1 transition-all ${
                      newMapData.graphicsIds.includes(preview.id)
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    title={preview.path}
                  >
                    {preview.image ? (
                      <img
                        src={preview.image.src}
                        alt={preview.path}
                        className="w-full h-12 object-cover pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-full h-12 bg-muted flex items-center justify-center text-[8px]">
                        {preview.id}
                      </div>
                    )}
                    <div className="text-[8px] truncate mt-1">{preview.id}</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Selected: {newMapData.graphicsIds.join(', ')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMapDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewMap}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
