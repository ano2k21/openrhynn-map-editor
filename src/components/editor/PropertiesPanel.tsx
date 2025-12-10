import { useState, useEffect, useRef } from 'react';
import { PlayfieldInfo, Portal, Item, MobSpawn } from '@/types/map';
import { ChevronDown, ChevronRight, Trash2, Package, Zap, Copy, Skull, Download, Plus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TILE_DEFINITIONS, loadTilesetImage } from '@/lib/rhynnTiles';
import { MOB_TEMPLATES, getMobTemplateName, getMobSpriteUrlByTplId } from '@/lib/mobTemplates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertiesPanelProps {
  playfieldInfo: PlayfieldInfo;
  onPlayfieldInfoChange: (info: PlayfieldInfo) => void;
  onResize: (width: number, height: number) => void;
  selectedPortal: Portal | null;
  onPortalUpdate: (id: string, updates: Partial<Portal>) => void;
  onPortalDelete: (id: string) => void;
  onPortalAdd: (portal: Omit<Portal, 'id'>) => void;
  onItemUpdate: (id: string, updates: Partial<Item>) => void;
  onItemDelete: (id: string) => void;
  onMobSpawnAdd: (mobSpawn: Omit<MobSpawn, 'id'>) => void;
  onMobSpawnUpdate: (id: string, updates: Partial<MobSpawn>) => void;
  onMobSpawnDelete: (id: string) => void;
  onExportMobSpawnsSql: (worldId: number) => string;
  onImportMobSpawnsSql: (sql: string, filterWorldId?: number) => number;
  onLoadTilesets: (graphicsIds: number[]) => void;
}

interface TilesetPreview {
  id: number;
  path: string;
  image: HTMLImageElement | null;
}

export function PropertiesPanel({
  playfieldInfo,
  onPlayfieldInfoChange,
  onResize,
  selectedPortal,
  onPortalUpdate,
  onPortalDelete,
  onPortalAdd,
  onItemUpdate,
  onItemDelete,
  onMobSpawnAdd,
  onMobSpawnUpdate,
  onMobSpawnDelete,
  onExportMobSpawnsSql,
  onImportMobSpawnsSql,
  onLoadTilesets,
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    map: true,
    graphics: true,
    portals: true,
    spawn: true,
    items: false,
    mobs: true,
  });
  const [tilesetPreviews, setTilesetPreviews] = useState<TilesetPreview[]>([]);
  const [worldIdForExport, setWorldIdForExport] = useState(100130);
  const sqlImportRef = useRef<HTMLInputElement>(null);

  // Load tileset previews
  useEffect(() => {
    const loadPreviews = async () => {
      const backgrounds = TILE_DEFINITIONS.filter(t => t.type === 'background');
      const previews: TilesetPreview[] = [];
      for (const def of backgrounds.slice(0, 30)) {
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
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddPortal = () => {
    onPortalAdd({
      x: Math.floor(playfieldInfo.width / 2),
      y: Math.floor(playfieldInfo.height / 2),
      width: 1,
      height: 1,
      targetPlayfieldId: 0,
      targetX: 0,
      targetY: 0,
      name: 'New portal',
    });
  };

  const handleAddGraphics = (graphicsId: number) => {
    if (!playfieldInfo.graphicsIds.includes(graphicsId)) {
      const newIds = [...playfieldInfo.graphicsIds, graphicsId];
      onPlayfieldInfoChange({ ...playfieldInfo, graphicsIds: newIds });
      onLoadTilesets(newIds);
    }
  };

  const handleRemoveGraphics = (graphicsId: number) => {
    const newIds = playfieldInfo.graphicsIds.filter(id => id !== graphicsId);
    if (newIds.length > 0) {
      onPlayfieldInfoChange({ ...playfieldInfo, graphicsIds: newIds });
      onLoadTilesets(newIds);
    }
  };

  const copyPortalJson = (portal: Portal) => {
    const json = JSON.stringify({
      cell: { x: portal.x, y: portal.y },
      dest: {
        world_id: portal.targetPlayfieldId,
        x: portal.targetX,
        y: portal.targetY,
      },
      required_quest: portal.requiredQuest || '',
      required_level: portal.requiredLevel || 0,
    }, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('Portal JSON copied!');
  };

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">Properties</div>

      <div className="flex-1 overflow-auto scrollbar-thin">
        {/* Map Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('map')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Map Settings</span>
            {expandedSections.map ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.map && (
            <div className="px-3 pb-3 space-y-2">
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={playfieldInfo.name}
                  onChange={(e) => onPlayfieldInfoChange({ ...playfieldInfo, name: e.target.value })}
                  className="input-field w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">Width</label>
                  <input
                    type="number"
                    value={playfieldInfo.width}
                    onChange={(e) => onResize(parseInt(e.target.value) || 10, playfieldInfo.height)}
                    className="input-field w-full text-xs"
                    min={1}
                    max={500}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">Height</label>
                  <input
                    type="number"
                    value={playfieldInfo.height}
                    onChange={(e) => onResize(playfieldInfo.width, parseInt(e.target.value) || 10)}
                    className="input-field w-full text-xs"
                    min={1}
                    max={500}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={playfieldInfo.pvpEnabled || false}
                    onChange={(e) => onPlayfieldInfoChange({ ...playfieldInfo, pvpEnabled: e.target.checked })}
                    className="rounded border-border"
                  />
                  PvP Zone
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Graphics Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('graphics')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Graphics ({playfieldInfo.graphicsIds.length})</span>
            {expandedSections.graphics ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.graphics && (
            <div className="px-3 pb-3 space-y-2">
              {/* Current graphics */}
              <div className="space-y-1">
                {playfieldInfo.graphicsIds.map((id) => {
                  const preview = tilesetPreviews.find(p => p.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded-sm">
                      {preview?.image && (
                        <img 
                          src={preview.image.src} 
                          alt="" 
                          className="w-8 h-8 object-cover pixelated border border-border"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      <span className="truncate flex-1" title={preview?.path}>{id}</span>
                      {playfieldInfo.graphicsIds.length > 1 && (
                        <button
                          onClick={() => handleRemoveGraphics(id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Add graphics */}
              <div>
                <label className="block text-[10px] text-muted-foreground mb-1">Add tileset</label>
                <div className="grid grid-cols-4 gap-1 max-h-32 overflow-auto">
                  {tilesetPreviews
                    .filter(p => !playfieldInfo.graphicsIds.includes(p.id))
                    .map((preview) => (
                      <button
                        key={preview.id}
                        onClick={() => handleAddGraphics(preview.id)}
                        className="border border-border rounded p-0.5 hover:border-primary transition-colors"
                        title={`${preview.id}: ${preview.path}`}
                      >
                        {preview.image ? (
                          <img
                            src={preview.image.src}
                            alt=""
                            className="w-full h-6 object-cover pixelated"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="w-full h-6 bg-muted flex items-center justify-center text-[6px]">
                            {preview.id}
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spawn Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('spawn')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Spawn Point</span>
            {expandedSections.spawn ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.spawn && (
            <div className="px-3 pb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">X</label>
                  <input
                    type="number"
                    value={playfieldInfo.spawnX || 0}
                    onChange={(e) => onPlayfieldInfoChange({ ...playfieldInfo, spawnX: parseInt(e.target.value) || 0 })}
                    className="input-field w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted-foreground mb-1">Y</label>
                  <input
                    type="number"
                    value={playfieldInfo.spawnY || 0}
                    onChange={(e) => onPlayfieldInfoChange({ ...playfieldInfo, spawnY: parseInt(e.target.value) || 0 })}
                    className="input-field w-full text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('items')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Items ({playfieldInfo.items.length})</span>
            {expandedSections.items ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.items && (
            <div className="px-3 pb-3 space-y-2">
              <p className="text-[10px] text-muted-foreground mb-2">Use "Dėti daiktą" tool</p>
              {playfieldInfo.items.map((item) => (
                <div key={item.id} className="p-2 rounded-sm border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Package size={12} className="text-blue-400" />
                      <span className="text-xs">Item #{item.tplId}</span>
                    </div>
                    <button
                      onClick={() => onItemDelete(item.id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <label className="text-muted-foreground">Template ID</label>
                      <input
                        type="number"
                        value={item.tplId}
                        onChange={(e) => onItemUpdate(item.id, { tplId: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Units</label>
                      <input
                        type="number"
                        value={item.units}
                        onChange={(e) => onItemUpdate(item.id, { units: parseInt(e.target.value) || 1 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">X</label>
                      <input
                        type="number"
                        value={item.x}
                        onChange={(e) => onItemUpdate(item.id, { x: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Y</label>
                      <input
                        type="number"
                        value={item.y}
                        onChange={(e) => onItemUpdate(item.id, { y: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-muted-foreground">Respawn (s)</label>
                      <input
                        type="number"
                        value={item.respawnDelay}
                        onChange={(e) => onItemUpdate(item.id, { respawnDelay: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {playfieldInfo.items.length === 0 && (
                <p className="text-xs text-muted-foreground">No items</p>
              )}
            </div>
          )}
        </div>

        {/* Portals Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('portals')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Portals ({playfieldInfo.portals.length})</span>
            {expandedSections.portals ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.portals && (
            <div className="px-3 pb-3 space-y-2">
              <p className="text-[10px] text-muted-foreground mb-2">Use "Dėti portalą" tool</p>

              {playfieldInfo.portals.map((portal) => (
                <div
                  key={portal.id}
                  className={cn(
                    'p-2 rounded-sm border transition-colors',
                    selectedPortal?.id === portal.id
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Zap size={12} className="text-yellow-400" />
                      <input
                        type="text"
                        value={portal.name}
                        onChange={(e) => onPortalUpdate(portal.id, { name: e.target.value })}
                        className="input-field text-xs py-0.5 px-1 w-20"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyPortalJson(portal)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Kopijuoti JSON"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => onPortalDelete(portal.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <label className="text-muted-foreground">Cell X</label>
                      <input
                        type="number"
                        value={portal.x}
                        onChange={(e) => onPortalUpdate(portal.id, { x: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Cell Y</label>
                      <input
                        type="number"
                        value={portal.y}
                        onChange={(e) => onPortalUpdate(portal.id, { y: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] mt-1">
                    <div>
                      <label className="text-muted-foreground">Target ID</label>
                      <input
                        type="number"
                        value={portal.targetPlayfieldId}
                        onChange={(e) => onPortalUpdate(portal.id, { targetPlayfieldId: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Target X</label>
                      <input
                        type="number"
                        value={portal.targetX}
                        onChange={(e) => onPortalUpdate(portal.id, { targetX: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Target Y</label>
                      <input
                        type="number"
                        value={portal.targetY}
                        onChange={(e) => onPortalUpdate(portal.id, { targetY: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {playfieldInfo.portals.length === 0 && (
                <p className="text-xs text-muted-foreground">No portals</p>
              )}
            </div>
          )}
        </div>

        {/* Mob Spawns Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('mobs')}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Mob Spawns ({playfieldInfo.mobSpawns.length})</span>
            {expandedSections.mobs ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expandedSections.mobs && (
            <div className="px-3 pb-3 space-y-2">
              {/* Add mob button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7"
                onClick={() => onMobSpawnAdd({
                  objectId: 100000 + playfieldInfo.mobSpawns.length,
                  tplId: 100000,
                  x: Math.floor(playfieldInfo.width / 2),
                  y: Math.floor(playfieldInfo.height / 2),
                  respawnDelay: 60000,
                })}
              >
                <Plus size={12} className="mr-1" />
                Pridėti mobą
              </Button>

              {/* Import/Export SQL */}
              <div className="flex items-center gap-1">
                <div className="flex-1">
                  <label className="block text-[10px] text-muted-foreground mb-1">World ID</label>
                  <input
                    type="number"
                    value={worldIdForExport}
                    onChange={(e) => setWorldIdForExport(parseInt(e.target.value) || 100130)}
                    className="input-field w-full text-[10px] py-0.5 px-1"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 mt-4"
                  onClick={() => sqlImportRef.current?.click()}
                  title="Importuoti mobus iš SQL"
                >
                  <Upload size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7 mt-4"
                  onClick={() => {
                    const sql = onExportMobSpawnsSql(worldIdForExport);
                    const blob = new Blob([sql], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `mob_spawning_${worldIdForExport}.sql`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(`Eksportuota ${playfieldInfo.mobSpawns.length} mobų SQL`);
                  }}
                  disabled={playfieldInfo.mobSpawns.length === 0}
                >
                  <Download size={12} />
                </Button>
              </div>

              {/* Hidden SQL file input */}
              <input
                ref={sqlImportRef}
                type="file"
                accept=".sql,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const sqlContent = event.target?.result as string;
                      const count = onImportMobSpawnsSql(sqlContent, worldIdForExport);
                      if (count > 0) {
                        toast.success(`Importuota ${count} mobų iš SQL (world_id: ${worldIdForExport})`);
                      } else {
                        toast.warning(`Nerasta mobų su world_id: ${worldIdForExport}`);
                      }
                    };
                    reader.readAsText(file);
                    e.target.value = '';
                  }
                }}
              />

              {/* Mob list */}
              {playfieldInfo.mobSpawns.map((mob) => (
                <div key={mob.id} className="p-2 rounded-sm border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={getMobSpriteUrlByTplId(mob.tplId)} 
                        alt="" 
                        className="w-8 h-8 object-contain bg-black/20 rounded"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{getMobTemplateName(mob.tplId)}</span>
                        <span className="text-[9px] text-muted-foreground">ID: {mob.tplId}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onMobSpawnDelete(mob.id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div>
                      <label className="text-muted-foreground">Mob Type</label>
                      <Select
                        value={mob.tplId.toString()}
                        onValueChange={(value) => onMobSpawnUpdate(mob.id, { tplId: parseInt(value) })}
                      >
                        <SelectTrigger className="h-6 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {MOB_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()} className="text-xs">
                              <div className="flex items-center gap-2">
                                <img 
                                  src={getMobSpriteUrlByTplId(template.id)} 
                                  alt="" 
                                  className="w-6 h-6 object-contain"
                                  style={{ imageRendering: 'pixelated' }}
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <span>{template.name} (Lv.{template.level})</span>
                                {template.legendary && <span className="text-yellow-500 text-[8px]">★</span>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="text-muted-foreground">Object ID</label>
                        <input
                          type="number"
                          value={mob.objectId}
                          onChange={(e) => onMobSpawnUpdate(mob.id, { objectId: parseInt(e.target.value) || 0 })}
                          className="input-field w-full text-[10px] py-0.5 px-1"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground">Template ID</label>
                        <input
                          type="number"
                          value={mob.tplId}
                          onChange={(e) => onMobSpawnUpdate(mob.id, { tplId: parseInt(e.target.value) || 0 })}
                          className="input-field w-full text-[10px] py-0.5 px-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="text-muted-foreground">X (tile)</label>
                        <input
                          type="number"
                          value={mob.x}
                          onChange={(e) => onMobSpawnUpdate(mob.id, { x: parseInt(e.target.value) || 0 })}
                          className="input-field w-full text-[10px] py-0.5 px-1"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground">Y (tile)</label>
                        <input
                          type="number"
                          value={mob.y}
                          onChange={(e) => onMobSpawnUpdate(mob.id, { y: parseInt(e.target.value) || 0 })}
                          className="input-field w-full text-[10px] py-0.5 px-1"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-muted-foreground">Respawn (ms)</label>
                      <input
                        type="number"
                        value={mob.respawnDelay}
                        onChange={(e) => onMobSpawnUpdate(mob.id, { respawnDelay: parseInt(e.target.value) || 0 })}
                        className="input-field w-full text-[10px] py-0.5 px-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {playfieldInfo.mobSpawns.length === 0 && (
                <p className="text-xs text-muted-foreground">Nėra mobų</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
