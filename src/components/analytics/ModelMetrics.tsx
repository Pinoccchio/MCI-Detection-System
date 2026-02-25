'use client';

/**
 * Model Metrics Component
 * Displays model performance metrics with visual indicators
 */

import { ModelMetrics } from '@/lib/api/analytics';
import { TrendingUp, Target, CheckCircle, Zap } from 'lucide-react';

interface ModelMetricsProps {
  metrics: ModelMetrics;
}

export function ModelMetricsComponent({ metrics }: ModelMetricsProps) {
  const metricsData = [
    {
      label: 'Accuracy',
      value: (metrics.accuracy * 100).toFixed(2),
      icon: Target,
      color: 'blue',
      description: 'Overall prediction accuracy',
    },
    {
      label: 'Precision',
      value: (metrics.precision * 100).toFixed(2),
      icon: CheckCircle,
      color: 'green',
      description: 'Positive prediction accuracy',
    },
    {
      label: 'Recall',
      value: (metrics.recall * 100).toFixed(2),
      icon: TrendingUp,
      color: 'purple',
      description: 'True positive detection rate',
    },
    {
      label: 'F1 Score',
      value: (metrics.f1Score * 100).toFixed(2),
      icon: Zap,
      color: 'orange',
      description: 'Harmonic mean of precision & recall',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          const colors = colorClasses[metric.color as keyof typeof colorClasses];

          return (
            <div
              key={metric.label}
              className={`bg-card border ${colors.border} rounded-lg p-6 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <h3 className="text-3xl font-bold">{metric.value}%</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Prediction Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
            <p className="text-2xl font-bold">{metrics.totalPredictions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Est. Correct</p>
            <p className="text-2xl font-bold">{metrics.correctPredictions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalPredictions > 0
                ? ((metrics.correctPredictions / metrics.totalPredictions) * 100).toFixed(1)
                : 0}% accuracy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
