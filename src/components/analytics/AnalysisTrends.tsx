'use client';

/**
 * Analysis Trends Component
 * Displays time-series data for analyses over time
 */

import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  count: number;
  normalCount: number;
  mciCount: number;
}

interface AnalysisTrendsProps {
  data: TrendDataPoint[];
  period: 'daily' | 'weekly' | 'monthly';
}

export function AnalysisTrendsComponent({ data, period }: AnalysisTrendsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Analysis Trends</h3>
            <p className="text-xs text-muted-foreground">
              No trend data available yet
            </p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Perform more analyses to see trends over time
        </div>
      </Card>
    );
  }

  // Calculate stats
  const totalAnalyses = data.reduce((sum, d) => sum + d.count, 0);
  const totalNormal = data.reduce((sum, d) => sum + d.normalCount, 0);
  const totalMCI = data.reduce((sum, d) => sum + d.mciCount, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // SVG dimensions
  const width = 700;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points for total analyses line
  const getX = (index: number) =>
    padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (count: number) =>
    padding.top + chartHeight - (count / maxCount) * chartHeight;

  // Create paths for the three lines
  const totalPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.count)}`)
    .join(' ');
  const normalPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.normalCount)}`)
    .join(' ');
  const mciPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.mciCount)}`)
    .join(' ');

  // Area under total line
  const areaPath = `${totalPath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Analysis Trends</h3>
            <p className="text-xs text-muted-foreground">
              {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} analysis counts
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{totalAnalyses}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Normal</p>
            <p className="text-lg font-bold text-green-600">{totalNormal}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">MCI</p>
            <p className="text-lg font-bold text-orange-600">{totalMCI}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="min-w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((value) => (
            <g key={value}>
              <line
                x1={padding.left}
                y1={padding.top + (1 - value) * chartHeight}
                x2={padding.left + chartWidth}
                y2={padding.top + (1 - value) * chartHeight}
                stroke="currentColor"
                strokeOpacity={0.1}
              />
              <text
                x={padding.left - 10}
                y={padding.top + (1 - value) * chartHeight}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {Math.round(value * maxCount)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            // Only show every few labels to avoid crowding
            const showLabel = data.length <= 7 || i % Math.ceil(data.length / 7) === 0;
            if (!showLabel) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 20}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
                transform={`rotate(-45, ${getX(i)}, ${height - 20})`}
              >
                {d.date}
              </text>
            );
          })}

          {/* Area under curve */}
          <path
            d={areaPath}
            fill="currentColor"
            fillOpacity={0.05}
            className="text-primary"
          />

          {/* MCI line */}
          <path
            d={mciPath}
            fill="none"
            stroke="#f97316"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Normal line */}
          <path
            d={normalPath}
            fill="none"
            stroke="#22c55e"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Total line */}
          <path
            d={totalPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.count)}
                r={4}
                fill="currentColor"
                className="text-primary"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.normalCount)}
                r={3}
                fill="#22c55e"
              />
              <circle
                cx={getX(i)}
                cy={getY(d.mciCount)}
                r={3}
                fill="#f97316"
              />
            </g>
          ))}

          {/* Y-axis label */}
          <text
            x={15}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
            className="text-sm fill-muted-foreground font-medium"
          >
            Analyses
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span className="text-muted-foreground">Total Analyses</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-muted-foreground">Cognitively Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-muted-foreground">Mild Cognitive Impairment</span>
        </div>
      </div>
    </Card>
  );
}
