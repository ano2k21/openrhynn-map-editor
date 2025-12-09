import { useState, useEffect, useRef } from 'react';
import { PlayfieldInfo, Portal, Item, MobSpawn } from '@/types/map';
import { ChevronDown, ChevronRight, Trash2, Package, Zap, Copy, Skull, Download, Plus, Upload, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TILE_DEFINITIONS, loadTilesetImage } from '@/lib/rhynnTiles';
import { MOB_TEMPLATES, getMobTemplateName } from '@/lib/mobTemplates';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    graphics: false,
    portals: false,
    spawn: false,
    items: false,
    mobs: true,
  });
  const [expandedMobs, setExpandedMobs] = useState<Set<string>>(new Set());
  const [expandedPortals, setExpandedPortals] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

  const toggleMobExpand = (id: string) => {
    setExpandedMobs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePortalExpand = (id: string) => {
    setExpandedPortals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItemExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="panel flex flex-col h-full overflow-hidden">
      <div className="panel-header flex-shrink-0">Properties</div>

      <ScrollArea className="flex-1">
        <div className="space-y-0">
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

        {/* Items Section - Compact */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('items')}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Items ({playfieldInfo.items.length})</span>
            {expandedSections.items ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {expandedSections.items && (
            <div className="px-2 pb-2 space-y-1">
              {playfieldInfo.items.map((item) => (
                <Collapsible key={item.id} open={expandedItems.has(item.id)} onOpenChange={() => toggleItemExpand(item.id)}>
                  <div className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-[10px]">
                    <CollapsibleTrigger className="flex items-center gap-1 flex-1 text-left">
                      {expandedItems.has(item.id) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      <Package size={10} className="text-blue-400" />
                      <span className="truncate">#{item.tplId} ({item.x},{item.y})</span>
                    </CollapsibleTrigger>
                    <button onClick={() => onItemDelete(item.id)} className="text-destructive hover:text-destructive/80 p-0.5">
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <CollapsibleContent>
                    <div className="pl-4 pr-1 pb-1 grid grid-cols-3 gap-1 text-[9px]">
                      <div>
                        <label className="text-muted-foreground">TplID</label>
                        <input type="number" value={item.tplId} onChange={(e) => onItemUpdate(item.id, { tplId: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" />
                      </div>
                      <div>
                        <label className="text-muted-foreground">X</label>
                        <input type="number" value={item.x} onChange={(e) => onItemUpdate(item.id, { x: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" />
                      </div>
                      <div>
                        <label className="text-muted-foreground">Y</label>
                        <input type="number" value={item.y} onChange={(e) => onItemUpdate(item.id, { y: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {playfieldInfo.items.length === 0 && <p className="text-[10px] text-muted-foreground px-1">No items</p>}
            </div>
          )}
        </div>

        {/* Portals Section - Compact */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('portals')}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Portals ({playfieldInfo.portals.length})</span>
            {expandedSections.portals ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {expandedSections.portals && (
            <div className="px-2 pb-2 space-y-1">
              {playfieldInfo.portals.map((portal) => (
                <Collapsible key={portal.id} open={expandedPortals.has(portal.id)} onOpenChange={() => togglePortalExpand(portal.id)}>
                  <div className={cn(
                    "flex items-center gap-1 px-1 py-0.5 rounded text-[10px]",
                    selectedPortal?.id === portal.id ? 'bg-yellow-400/20' : 'hover:bg-muted/50'
                  )}>
                    <CollapsibleTrigger className="flex items-center gap-1 flex-1 text-left">
                      {expandedPortals.has(portal.id) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      <Zap size={10} className="text-yellow-400" />
                      <span className="truncate">{portal.name} → {portal.targetPlayfieldId}</span>
                    </CollapsibleTrigger>
                    <button onClick={() => copyPortalJson(portal)} className="text-muted-foreground hover:text-foreground p-0.5" title="Copy JSON">
                      <Copy size={10} />
                    </button>
                    <button onClick={() => onPortalDelete(portal.id)} className="text-destructive hover:text-destructive/80 p-0.5">
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <CollapsibleContent>
                    <div className="pl-4 pr-1 pb-1 space-y-1 text-[9px]">
                      <input type="text" value={portal.name} onChange={(e) => onPortalUpdate(portal.id, { name: e.target.value })} className="input-field w-full text-[9px] py-0 px-1 h-5" placeholder="Name" />
                      <div className="grid grid-cols-3 gap-1">
                        <div><label className="text-muted-foreground">X</label><input type="number" value={portal.x} onChange={(e) => onPortalUpdate(portal.id, { x: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                        <div><label className="text-muted-foreground">Y</label><input type="number" value={portal.y} onChange={(e) => onPortalUpdate(portal.id, { y: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                        <div><label className="text-muted-foreground">Target</label><input type="number" value={portal.targetPlayfieldId} onChange={(e) => onPortalUpdate(portal.id, { targetPlayfieldId: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {playfieldInfo.portals.length === 0 && <p className="text-[10px] text-muted-foreground px-1">No portals</p>}
            </div>
          )}
        </div>

        {/* Mob Spawns Section - Compact */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('mobs')}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <span className="text-xs font-medium">Mobs ({playfieldInfo.mobSpawns.length})</span>
            {expandedSections.mobs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          {expandedSections.mobs && (
            <div className="px-2 pb-2 space-y-1">
              {/* Controls row */}
              <div className="flex items-center gap-1 mb-1">
                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 flex-1" onClick={() => onMobSpawnAdd({
                  objectId: 100000 + playfieldInfo.mobSpawns.length,
                  tplId: 100000,
                  x: Math.floor(playfieldInfo.width / 2),
                  y: Math.floor(playfieldInfo.height / 2),
                  respawnDelay: 60000,
                })}>
                  <Plus size={10} className="mr-1" />Add
                </Button>
                <input
                  type="number"
                  value={worldIdForExport}
                  onChange={(e) => setWorldIdForExport(parseInt(e.target.value) || 100130)}
                  className="input-field w-16 text-[10px] py-0 px-1 h-6"
                  title="World ID"
                />
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => sqlImportRef.current?.click()} title="Import SQL">
                  <Upload size={12} />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => {
                  const sql = onExportMobSpawnsSql(worldIdForExport);
                  const blob = new Blob([sql], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `mob_spawning_${worldIdForExport}.sql`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Exported ${playfieldInfo.mobSpawns.length} mobs`);
                }} disabled={playfieldInfo.mobSpawns.length === 0} title="Export SQL">
                  <Download size={12} />
                </Button>
              </div>

              <input ref={sqlImportRef} type="file" accept=".sql,.txt" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const sqlContent = event.target?.result as string;
                    const count = onImportMobSpawnsSql(sqlContent, worldIdForExport);
                    if (count > 0) toast.success(`Imported ${count} mobs (world_id: ${worldIdForExport})`);
                    else toast.warning(`No mobs found for world_id: ${worldIdForExport}`);
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                }
              }} />

              {/* Mob list - compact */}
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                {playfieldInfo.mobSpawns.map((mob) => (
                  <Collapsible key={mob.id} open={expandedMobs.has(mob.id)} onOpenChange={() => toggleMobExpand(mob.id)}>
                    <div className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted/50 text-[10px]">
                      <CollapsibleTrigger className="flex items-center gap-1 flex-1 text-left">
                        {expandedMobs.has(mob.id) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        <Skull size={10} className="text-red-400" />
                        <span className="truncate">{getMobTemplateName(mob.tplId)}</span>
                        <span className="text-muted-foreground">({mob.x},{mob.y})</span>
                      </CollapsibleTrigger>
                      <button onClick={() => onMobSpawnDelete(mob.id)} className="text-destructive hover:text-destructive/80 p-0.5">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <CollapsibleContent>
                      <div className="pl-4 pr-1 pb-1 space-y-1 text-[9px]">
                        <Select value={mob.tplId.toString()} onValueChange={(value) => onMobSpawnUpdate(mob.id, { tplId: parseInt(value) })}>
                          <SelectTrigger className="h-5 text-[9px]"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-40 bg-popover">
                            {MOB_TEMPLATES.map((t) => (
                              <SelectItem key={t.id} value={t.id.toString()} className="text-[10px]">{t.name} (Lv.{t.level})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="grid grid-cols-4 gap-1">
                          <div><label className="text-muted-foreground">ObjID</label><input type="number" value={mob.objectId} onChange={(e) => onMobSpawnUpdate(mob.id, { objectId: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                          <div><label className="text-muted-foreground">X</label><input type="number" value={mob.x} onChange={(e) => onMobSpawnUpdate(mob.id, { x: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                          <div><label className="text-muted-foreground">Y</label><input type="number" value={mob.y} onChange={(e) => onMobSpawnUpdate(mob.id, { y: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                          <div><label className="text-muted-foreground">Resp</label><input type="number" value={mob.respawnDelay} onChange={(e) => onMobSpawnUpdate(mob.id, { respawnDelay: parseInt(e.target.value) || 0 })} className="input-field w-full text-[9px] py-0 px-1 h-5" /></div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
              {playfieldInfo.mobSpawns.length === 0 && <p className="text-[10px] text-muted-foreground px-1">No mobs</p>}
            </div>
          )}
        </div>
        </div>
      </ScrollArea>
    </div>
  );
}
