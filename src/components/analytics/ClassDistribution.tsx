'use client';

/**
 * Class Distribution Component
 * Pie chart showing distribution of predictions
 */

import { ClassDistribution } from '@/lib/api/analytics';
import { PieChart } from 'lucide-react';

interface ClassDistributionProps {
  distribution: ClassDistribution;
}

export function ClassDistributionComponent({ distribution }: ClassDistributionProps) {
  const mciPercentage = distribution.total > 0
    ? (distribution.mildCognitiveImpairment / distribution.total) * 100
    : 0;

  const normalPercentage = distribution.total > 0
    ? (distribution.cognitivelyNormal / distribution.total) * 100
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Class Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Breakdown of prediction outcomes
          </p>
        </div>
      </div>

      {/* Visual Representation */}
      <div className="space-y-6">
        {/* Stacked Bar */}
        <div className="w-full h-16 bg-muted rounded-lg overflow-hidden flex">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${normalPercentage}%` }}
          >
            {normalPercentage > 15 && `${normalPercentage.toFixed(1)}%`}
          </div>
          <div
            className="bg-orange-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${mciPercentage}%` }}
          >
            {mciPercentage > 15 && `${mciPercentage.toFixed(1)}%`}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Cognitively Normal
              </p>
            </div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">
              {distribution.cognitivelyNormal}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {normalPercentage.toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                MCI Detected
              </p>
            </div>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
              {distribution.mildCognitiveImpairment}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              {mciPercentage.toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              Total Predictions
            </span>
            <span className="text-2xl font-bold">
              {distribution.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
