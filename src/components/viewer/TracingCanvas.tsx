'use client';

/**
 * Tracing Canvas Component
 * Provides drawing tools for manual hippocampal segmentation
 */

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

export type TracingTool = 'pen' | 'polygon' | 'eraser' | 'fill';
export type HippocampusSide = 'left' | 'right';

interface Point {
  x: number;
  y: number;
}

interface TracingAction {
  type: 'stroke' | 'polygon' | 'fill' | 'erase';
  points: Point[];
  side: HippocampusSide;
  brushSize: number;
}

export interface TracingCanvasRef {
  getTracingData: () => ImageData | null;
  getMaskData: () => { left: ImageData | null; right: ImageData | null };
  clearTracing: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

interface TracingCanvasProps {
  width: number;
  height: number;
  tool: TracingTool;
  brushSize: number;
  side: HippocampusSide;
  zoom: number;
  pan: { x: number; y: number };
  onTracingChange?: () => void;
  className?: string;
}

const COLORS = {
  left: { main: 'rgba(59, 130, 246, 0.6)', border: '#3b82f6' }, // Blue
  right: { main: 'rgba(249, 115, 22, 0.6)', border: '#f97316' }, // Orange
};

export const TracingCanvas = forwardRef<TracingCanvasRef, TracingCanvasProps>(
  (
    {
      width,
      height,
      tool,
      brushSize,
      side,
      zoom,
      pan,
      onTracingChange,
      className = '',
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
    const [actions, setActions] = useState<TracingAction[]>([]);
    const [redoStack, setRedoStack] = useState<TracingAction[]>([]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getTracingData: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        return ctx?.getImageData(0, 0, width, height) || null;
      },
      getMaskData: () => {
        const canvas = canvasRef.current;
        if (!canvas) return { left: null, right: null };
        const ctx = canvas.getContext('2d');
        if (!ctx) return { left: null, right: null };

        const fullData = ctx.getImageData(0, 0, width, height);

        // Separate left and right masks
        const leftData = ctx.createImageData(width, height);
        const rightData = ctx.createImageData(width, height);

        for (let i = 0; i < fullData.data.length; i += 4) {
          const r = fullData.data[i];
          const g = fullData.data[i + 1];
          const b = fullData.data[i + 2];
          const a = fullData.data[i + 3];

          // Blue channel dominant = left, Red/Orange dominant = right
          if (b > r && a > 0) {
            leftData.data[i] = 255;
            leftData.data[i + 1] = 255;
            leftData.data[i + 2] = 255;
            leftData.data[i + 3] = 255;
          } else if (r > b && a > 0) {
            rightData.data[i] = 255;
            rightData.data[i + 1] = 255;
            rightData.data[i + 2] = 255;
            rightData.data[i + 3] = 255;
          }
        }

        return { left: leftData, right: rightData };
      },
      clearTracing: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        setActions([]);
        setRedoStack([]);
        setPolygonPoints([]);
        onTracingChange?.();
      },
      undo: () => {
        if (actions.length === 0) return;
        const lastAction = actions[actions.length - 1];
        setActions((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, lastAction]);
        redrawCanvas(actions.slice(0, -1));
        onTracingChange?.();
      },
      redo: () => {
        if (redoStack.length === 0) return;
        const nextAction = redoStack[redoStack.length - 1];
        setRedoStack((prev) => prev.slice(0, -1));
        setActions((prev) => [...prev, nextAction]);
        redrawCanvas([...actions, nextAction]);
        onTracingChange?.();
      },
      canUndo: () => actions.length > 0,
      canRedo: () => redoStack.length > 0,
    }));

    // Redraw all actions
    const redrawCanvas = useCallback(
      (actionList: TracingAction[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        actionList.forEach((action) => {
          const color = COLORS[action.side];

          if (action.type === 'erase') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            action.points.forEach((point, idx) => {
              if (idx === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.lineWidth = action.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
          } else if (action.type === 'stroke') {
            ctx.beginPath();
            ctx.strokeStyle = color.main;
            ctx.lineWidth = action.brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            action.points.forEach((point, idx) => {
              if (idx === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.stroke();
          } else if (action.type === 'polygon' || action.type === 'fill') {
            ctx.beginPath();
            ctx.fillStyle = color.main;
            action.points.forEach((point, idx) => {
              if (idx === 0) {
                ctx.moveTo(point.x, point.y);
              } else {
                ctx.lineTo(point.x, point.y);
              }
            });
            ctx.closePath();
            ctx.fill();
          }
        });
      },
      [width, height]
    );

    // Setup canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = width;
      canvas.height = height;
      redrawCanvas(actions);
    }, [width, height, redrawCanvas, actions]);

    // Get mouse position relative to canvas
    const getCanvasPoint = (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    // Handle mouse down
    const handleMouseDown = (e: React.MouseEvent) => {
      const point = getCanvasPoint(e);

      if (tool === 'polygon') {
        setPolygonPoints((prev) => [...prev, point]);
        drawPolygonPreview([...polygonPoints, point]);
        return;
      }

      setIsDrawing(true);
      setCurrentPoints([point]);
      setRedoStack([]); // Clear redo stack on new action
    };

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDrawing) return;
      const point = getCanvasPoint(e);
      setCurrentPoints((prev) => [...prev, point]);
      drawCurrentStroke([...currentPoints, point]);
    };

    // Handle mouse up
    const handleMouseUp = () => {
      if (!isDrawing || tool === 'polygon') return;

      if (currentPoints.length > 0) {
        const newAction: TracingAction = {
          type: tool === 'eraser' ? 'erase' : 'stroke',
          points: currentPoints,
          side,
          brushSize,
        };
        setActions((prev) => [...prev, newAction]);
        onTracingChange?.();
      }

      setIsDrawing(false);
      setCurrentPoints([]);
    };

    // Handle double click for polygon completion
    const handleDoubleClick = () => {
      if (tool !== 'polygon' || polygonPoints.length < 3) return;

      const newAction: TracingAction = {
        type: 'polygon',
        points: polygonPoints,
        side,
        brushSize,
      };
      setActions((prev) => [...prev, newAction]);
      setPolygonPoints([]);
      redrawCanvas([...actions, newAction]);
      onTracingChange?.();
    };

    // Draw current stroke preview
    const drawCurrentStroke = (points: Point[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw existing actions
      redrawCanvas(actions);

      // Draw current stroke
      const color = COLORS[side];

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        points.forEach((point, idx) => {
          if (idx === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.beginPath();
        ctx.strokeStyle = color.main;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        points.forEach((point, idx) => {
          if (idx === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    };

    // Draw polygon preview
    const drawPolygonPreview = (points: Point[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw existing actions
      redrawCanvas(actions);

      if (points.length === 0) return;

      const color = COLORS[side];

      // Draw polygon outline
      ctx.beginPath();
      ctx.strokeStyle = color.border;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      points.forEach((point, idx) => {
        if (idx === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      // Connect to first point if we have enough points
      if (points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertices
      points.forEach((point) => {
        ctx.beginPath();
        ctx.fillStyle = color.border;
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Handle escape to cancel polygon
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && tool === 'polygon') {
          setPolygonPoints([]);
          redrawCanvas(actions);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [tool, actions, redrawCanvas]);

    // Get cursor style based on tool
    const getCursor = () => {
      switch (tool) {
        case 'pen':
          return 'crosshair';
        case 'eraser':
          return 'cell';
        case 'polygon':
          return 'crosshair';
        case 'fill':
          return 'cell';
        default:
          return 'default';
      }
    };

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{
          cursor: getCursor(),
          width: '100%',
          height: '100%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
    );
  }
);

TracingCanvas.displayName = 'TracingCanvas';
