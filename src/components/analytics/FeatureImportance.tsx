'use client';

/**
 * Feature Importance Component
 * Displays feature importance rankings for the ML model
 */

import { FeatureImportance } from '@/lib/api/analytics';
import { BarChart3 } from 'lucide-react';

interface FeatureImportanceProps {
  data: FeatureImportance;
}

export function FeatureImportanceComponent({ data }: FeatureImportanceProps) {
  const maxImportance = Math.max(...data.features.map(f => f.importance));

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Feature Importance</h3>
          <p className="text-sm text-muted-foreground">
            Top features contributing to MCI prediction
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.features.map((feature) => (
          <div key={feature.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-6">
                  #{feature.rank}
                </span>
                <span className="text-sm font-medium">
                  {feature.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {(feature.importance * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all"
                style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4 mt-0.5" />
          <p>
            These features are extracted from MRI scans using advanced volumetry analysis.
            Higher importance indicates stronger contribution to the prediction model.
          </p>
        </div>
      </div>
    </div>
  );
}
