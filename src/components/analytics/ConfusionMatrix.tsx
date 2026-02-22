'use client';

/**
 * Confusion Matrix Component
 * Visual representation of model prediction accuracy
 */

import { ConfusionMatrix } from '@/lib/api/analytics';

interface ConfusionMatrixProps {
  matrix: ConfusionMatrix;
}

export function ConfusionMatrixComponent({ matrix }: ConfusionMatrixProps) {
  const total = matrix.truePositive + matrix.trueNegative + matrix.falsePositive + matrix.falseNegative;

  const cells = [
    {
      label: 'True Positive',
      value: matrix.truePositive,
      percentage: total > 0 ? (matrix.truePositive / total) * 100 : 0,
      description: 'MCI correctly identified',
      color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'False Negative',
      value: matrix.falseNegative,
      percentage: total > 0 ? (matrix.falseNegative / total) * 100 : 0,
      description: 'MCI missed',
      color: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
      textColor: 'text-red-700 dark:text-red-300',
    },
    {
      label: 'False Positive',
      value: matrix.falsePositive,
      percentage: total > 0 ? (matrix.falsePositive / total) * 100 : 0,
      description: 'Normal misclassified as MCI',
      color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
      textColor: 'text-orange-700 dark:text-orange-300',
    },
    {
      label: 'True Negative',
      value: matrix.trueNegative,
      percentage: total > 0 ? (matrix.trueNegative / total) * 100 : 0,
      description: 'Normal correctly identified',
      color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
  ];

  // Calculate sensitivity and specificity
  const sensitivity = matrix.truePositive + matrix.falseNegative > 0
    ? (matrix.truePositive / (matrix.truePositive + matrix.falseNegative)) * 100
    : 0;

  const specificity = matrix.trueNegative + matrix.falsePositive > 0
    ? (matrix.trueNegative / (matrix.trueNegative + matrix.falsePositive)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Matrix Grid */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Confusion Matrix</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Model prediction performance breakdown
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cells.map((cell, index) => (
            <div
              key={cell.label}
              className={`border-2 ${cell.color} rounded-lg p-6 text-center`}
            >
              <p className={`text-sm font-medium ${cell.textColor} mb-2`}>
                {cell.label}
              </p>
              <p className={`text-4xl font-bold ${cell.textColor}`}>
                {cell.value}
              </p>
              <p className={`text-sm ${cell.textColor} mt-2`}>
                {cell.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {cell.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold mb-2">Sensitivity (Recall)</h4>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {sensitivity.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            True positive rate (MCI detection rate)
          </p>
          <div className="mt-4 w-full bg-muted rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${sensitivity}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-semibold mb-2">Specificity</h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {specificity.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            True negative rate (Normal detection rate)
          </p>
          <div className="mt-4 w-full bg-muted rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${specificity}%` }}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Understanding the Matrix</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">True Positive (TP):</span> Model correctly predicts MCI
          </div>
          <div>
            <span className="font-medium text-foreground">True Negative (TN):</span> Model correctly predicts Normal
          </div>
          <div>
            <span className="font-medium text-foreground">False Positive (FP):</span> Model incorrectly predicts MCI
          </div>
          <div>
            <span className="font-medium text-foreground">False Negative (FN):</span> Model misses MCI case
          </div>
        </div>
      </div>
    </div>
  );
}
