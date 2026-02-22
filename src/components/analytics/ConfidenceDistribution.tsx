'use client';

/**
 * Confidence Distribution Component
 * Shows distribution of prediction confidence levels
 */

import { ConfidenceDistribution } from '@/lib/api/analytics';
import { Activity } from 'lucide-react';

interface ConfidenceDistributionProps {
  distribution: ConfidenceDistribution;
}

export function ConfidenceDistributionComponent({ distribution }: ConfidenceDistributionProps) {
  const maxCount = Math.max(...distribution.ranges.map(r => r.count));

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Confidence Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Prediction confidence levels
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {distribution.ranges.map((range, index) => {
          const barHeight = maxCount > 0 ? (range.count / maxCount) * 100 : 0;

          return (
            <div key={range.range} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{range.range}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {range.count} predictions
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {range.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-8 relative overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                    index >= 3
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : index >= 2
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${barHeight}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {range.count > 0 && (
                    <span className="text-xs font-medium text-white drop-shadow-md">
                      {range.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Low Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">High Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
