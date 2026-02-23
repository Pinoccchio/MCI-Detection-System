'use client';

/**
 * Tracing Toolbar Component
 * Provides tools for manual hippocampal tracing
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Pencil,
  Hexagon,
  Eraser,
  Undo,
  Redo,
  Trash2,
  Save,
  Download,
} from 'lucide-react';
import type { TracingTool, HippocampusSide } from './TracingCanvas';

interface TracingToolbarProps {
  activeTool: TracingTool;
  onToolChange: (tool: TracingTool) => void;
  activeSide: HippocampusSide;
  onSideChange: (side: HippocampusSide) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: () => void;
  onExport?: () => void;
  isSaving?: boolean;
  className?: string;
}

const BRUSH_SIZES = [2, 4, 8, 12, 16, 24];

export function TracingToolbar({
  activeTool,
  onToolChange,
  activeSide,
  onSideChange,
  brushSize,
  onBrushSizeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onExport,
  isSaving = false,
  className = '',
}: TracingToolbarProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Drawing Tools */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Tools</span>
          <div className="flex items-center gap-1">
            <Button
              variant={activeTool === 'pen' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('pen')}
              title="Pen tool (freehand drawing)"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'polygon' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('polygon')}
              title="Polygon tool (click to add points, double-click to complete)"
            >
              <Hexagon className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolChange('eraser')}
              title="Eraser tool"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-border" />

        {/* Hippocampus Side */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Region</span>
          <div className="flex items-center gap-1">
            <Button
              variant={activeSide === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSideChange('left')}
              className={activeSide === 'left' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              Left
            </Button>
            <Button
              variant={activeSide === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSideChange('right')}
              className={activeSide === 'right' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
              Right
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-border" />

        {/* Brush Size */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Brush Size: {brushSize}px
          </span>
          <div className="flex items-center gap-1">
            {BRUSH_SIZES.map((size) => (
              <Button
                key={size}
                variant={brushSize === size ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onBrushSizeChange(size)}
                title={`${size}px brush`}
              >
                <div
                  className="rounded-full bg-current"
                  style={{
                    width: Math.min(size / 2 + 2, 16),
                    height: Math.min(size / 2 + 2, 16),
                  }}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-border" />

        {/* Undo/Redo */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">History</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onClear}
              title="Clear all tracings"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save Actions */}
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" onClick={onExport} title="Export mask as image">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={onSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Tracing'}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          {activeTool === 'pen' && (
            <>
              <strong>Pen Tool:</strong> Click and drag to draw freehand. Use to outline
              hippocampal regions.
            </>
          )}
          {activeTool === 'polygon' && (
            <>
              <strong>Polygon Tool:</strong> Click to add vertices. Double-click to
              complete the shape. Press Escape to cancel.
            </>
          )}
          {activeTool === 'eraser' && (
            <>
              <strong>Eraser Tool:</strong> Click and drag to erase traced regions.
            </>
          )}
        </p>
      </div>
    </Card>
  );
}
