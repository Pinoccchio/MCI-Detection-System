'use client';

/**
 * ROC Curve Component
 * Displays Receiver Operating Characteristic curve with AUC metric
 */

import { Card } from '@/components/ui/card';
import { TrendingUp, Info } from 'lucide-react';

interface ROCPoint {
  fpr: number; // False Positive Rate
  tpr: number; // True Positive Rate
  threshold: number;
}

interface ROCCurveProps {
  data: {
    points: ROCPoint[];
    auc: number;
  };
}

export function ROCCurveComponent({ data }: ROCCurveProps) {
  const { points, auc } = data;

  // SVG dimensions
  const width = 400;
  const height = 400;
  const padding = 50;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Convert points to SVG path
  const pathData = points
    .map((point, index) => {
      const x = padding + point.fpr * chartWidth;
      const y = padding + (1 - point.tpr) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Diagonal line (random classifier)
  const diagonalPath = `M ${padding} ${padding + chartHeight} L ${padding + chartWidth} ${padding}`;

  // Calculate AUC color
  const getAUCColor = (auc: number) => {
    if (auc >= 0.9) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (auc >= 0.8) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    if (auc >= 0.7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getAUCLabel = (auc: number) => {
    if (auc >= 0.9) return 'Excellent';
    if (auc >= 0.8) return 'Good';
    if (auc >= 0.7) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">ROC Curve</h3>
            <p className="text-xs text-muted-foreground">
              Receiver Operating Characteristic
            </p>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-lg ${getAUCColor(auc)}`}>
          <p className="text-xs font-medium">AUC Score</p>
          <p className="text-2xl font-bold">{auc.toFixed(3)}</p>
          <p className="text-xs">{getAUCLabel(auc)}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <g key={value}>
              {/* Horizontal grid lines */}
              <line
                x1={padding}
                y1={padding + (1 - value) * chartHeight}
                x2={padding + chartWidth}
                y2={padding + (1 - value) * chartHeight}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray="4,4"
              />
              {/* Vertical grid lines */}
              <line
                x1={padding + value * chartWidth}
                y1={padding}
                x2={padding + value * chartWidth}
                y2={padding + chartHeight}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeDasharray="4,4"
              />
              {/* Y-axis labels */}
              <text
                x={padding - 10}
                y={padding + (1 - value) * chartHeight}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {value.toFixed(2)}
              </text>
              {/* X-axis labels */}
              <text
                x={padding + value * chartWidth}
                y={padding + chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {value.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + chartHeight}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <line
            x1={padding}
            y1={padding + chartHeight}
            x2={padding + chartWidth}
            y2={padding + chartHeight}
            stroke="currentColor"
            strokeOpacity={0.3}
          />

          {/* Diagonal line (random classifier) */}
          <path
            d={diagonalPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeDasharray="6,6"
            strokeWidth={1}
          />

          {/* Fill area under ROC curve */}
          <path
            d={`${pathData} L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`}
            fill="currentColor"
            fillOpacity={0.1}
            className="text-primary"
          />

          {/* ROC Curve */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="text-primary"
          />

          {/* Axis labels */}
          <text
            x={padding + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm fill-muted-foreground font-medium"
          >
            False Positive Rate
          </text>
          <text
            x={15}
            y={padding + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${padding + chartHeight / 2})`}
            className="text-sm fill-muted-foreground font-medium"
          >
            True Positive Rate
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-primary"></div>
          <span className="text-muted-foreground">ROC Curve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 border-t-2 border-dashed border-muted-foreground"></div>
          <span className="text-muted-foreground">Random Classifier (AUC = 0.5)</span>
        </div>
      </div>

      {/* Info tooltip */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          The ROC curve plots True Positive Rate against False Positive Rate at various threshold settings.
          An AUC of 1.0 represents perfect classification, while 0.5 represents random guessing.
        </p>
      </div>
    </Card>
  );
}
