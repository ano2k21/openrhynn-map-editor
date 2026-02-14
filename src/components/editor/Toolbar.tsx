import { 
  MousePointer2, 
  Paintbrush, 
  Eraser, 
  PaintBucket, 
  MapPin, 
  Target,
  Grid3X3,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Zap,
  Package,
  Ban,
  Sparkles,
  Shield,
  Skull
} from 'lucide-react';
import { Tool } from '@/types/map';
import { cn } from '@/lib/utils';
import { MOB_TEMPLATES } from '@/lib/mobTemplates';
import { MobSprite } from './MobSprite';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showPortals: boolean;
  onTogglePortals: () => void;
  showItems: boolean;
  onToggleItems: () => void;
  showCollision: boolean;
  onToggleCollision: () => void;
  showTriggers: boolean;
  onToggleTriggers: () => void;
  showZones: boolean;
  onToggleZones: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedLayer: number;
  onLayerChange: (layer: number) => void;
  selectedMobTplId: number;
  onMobTplChange: (tplId: number) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut?: string }[] = [
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select', shortcut: 'V' },
  { id: 'brush', icon: <Paintbrush size={18} />, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser', shortcut: 'E' },
  { id: 'fill', icon: <PaintBucket size={18} />, label: 'Fill', shortcut: 'F' },
  { id: 'block', icon: <Ban size={18} />, label: 'Block/Unblock', shortcut: 'X' },
  { id: 'trigger', icon: <Sparkles size={18} />, label: 'Trigger (animation)', shortcut: 'T' },
  { id: 'zone', icon: <Shield size={18} />, label: 'Safe/Fight Zone', shortcut: 'Z' },
  { id: 'portal', icon: <MapPin size={18} />, label: 'Select Portal', shortcut: 'P' },
  { id: 'portalPlace', icon: <Zap size={18} />, label: 'Place Portal' },
  { id: 'itemPlace', icon: <Package size={18} />, label: 'Place Item' },
  { id: 'mobPlace', icon: <Skull size={18} />, label: 'Place Mob', shortcut: 'M' },
  { id: 'spawn', icon: <Target size={18} />, label: 'Spawn Point', shortcut: 'S' },
];

const layers = ['Ground', 'Objects', 'Top'];

export function Toolbar({
  currentTool,
  onToolChange,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showPortals,
  onTogglePortals,
  showItems,
  onToggleItems,
  showCollision,
  onToggleCollision,
  showTriggers,
  onToggleTriggers,
  showZones,
  onToggleZones,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedLayer,
  onLayerChange,
  selectedMobTplId,
  onMobTplChange,
}: ToolbarProps) {
  return (
    <div className="panel flex items-center gap-1 p-1 flex-wrap">
      {/* Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn('tool-button', currentTool === tool.id && 'active')}
            title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Mob selector - show when mob tool is active */}
      {currentTool === 'mobPlace' && (
        <div className="flex items-center gap-2 border-r border-border pr-2 mr-1">
          <MobSprite tplId={selectedMobTplId} size={28} />
          <Select
            value={selectedMobTplId.toString()}
            onValueChange={(value) => onMobTplChange(parseInt(value))}
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue placeholder="Pasirink mobą" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {MOB_TEMPLATES.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()} className="text-xs">
                  <div className="flex items-center gap-2">
                    <MobSprite tplId={template.id} size={20} />
                    <span>{template.name} (Lv.{template.level})</span>
                    {template.legendary && <span className="text-yellow-500 text-[10px]">★</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn('tool-button', !canUndo && 'opacity-50 cursor-not-allowed')}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn('tool-button', !canRedo && 'opacity-50 cursor-not-allowed')}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
        <button
          onClick={() => onZoomChange(zoom - 0.25)}
          className="tool-button"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(zoom + 0.25)}
          className="tool-button"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
      </div>

      {/* View Toggles */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
        <button
          onClick={onToggleGrid}
          className={cn('tool-button', showGrid && 'active')}
          title="Show/Hide Grid (G)"
        >
          <Grid3X3 size={18} />
        </button>
        <button
          onClick={onToggleCollision}
          className={cn('tool-button', showCollision && 'active')}
          title="Show/Hide Collision (C)"
        >
          <Ban size={18} />
        </button>
        <button
          onClick={onToggleTriggers}
          className={cn('tool-button', showTriggers && 'active')}
          title="Show/Hide Triggers (T)"
        >
          <Sparkles size={18} />
        </button>
        <button
          onClick={onTogglePortals}
          className={cn('tool-button', showPortals && 'active')}
          title="Show/Hide Portals"
        >
          <Zap size={18} />
        </button>
        <button
          onClick={onToggleItems}
          className={cn('tool-button', showItems && 'active')}
          title="Show/Hide Items"
        >
          <Package size={18} />
        </button>
        <button
          onClick={onToggleZones}
          className={cn('tool-button', showZones && 'active')}
          title="Show/Hide Safe/Fight Zones (Z)"
        >
          <Shield size={18} />
        </button>
      </div>

      {/* Layer Selection */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">Layer:</span>
        {layers.map((layer, index) => (
          <button
            key={index}
            onClick={() => onLayerChange(index)}
            className={cn(
              'px-2 py-1 text-xs rounded-sm border transition-colors',
              selectedLayer === index
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-transparent hover:border-border text-muted-foreground'
            )}
          >
            {layer}
          </button>
        ))}
      </div>
    </div>
  );
}