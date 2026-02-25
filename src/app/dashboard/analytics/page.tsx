/**
 * Analytics Dashboard Page
 * Researcher-only page for model performance analytics
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import {
  getModelMetrics,
  getConfusionMatrix,
  getClassDistribution,
  getConfidenceDistribution,
  getFeatureImportance,
  getVolumetryStats,
  getModelInfo,
  getROCCurveData,
  getAnalysisTrends,
} from '@/lib/api/analytics';
import { ModelMetricsComponent } from '@/components/analytics/ModelMetrics';
import { ConfusionMatrixComponent } from '@/components/analytics/ConfusionMatrix';
import { ClassDistributionComponent } from '@/components/analytics/ClassDistribution';
import { ConfidenceDistributionComponent } from '@/components/analytics/ConfidenceDistribution';
import { FeatureImportanceComponent } from '@/components/analytics/FeatureImportance';
import { ROCCurveComponent } from '@/components/analytics/ROCCurve';
import { AnalysisTrendsComponent } from '@/components/analytics/AnalysisTrends';
import { BarChart3, Brain, TrendingUp } from 'lucide-react';

export default async function AnalyticsPage() {
  // Check authentication and authorization
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only researchers and admins can access analytics
  if (user.profile.role !== 'researcher' && user.profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all analytics data
  const [
    metrics,
    confusionMatrix,
    classDistribution,
    confidenceDistribution,
    featureImportance,
    volumetryStats,
    modelInfo,
    rocData,
    trendData,
  ] = await Promise.all([
    getModelMetrics(),
    getConfusionMatrix(),
    getClassDistribution(),
    getConfidenceDistribution(),
    getFeatureImportance(),
    getVolumetryStats(),
    getModelInfo(),
    getROCCurveData(),
    getAnalysisTrends(30),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Model performance metrics and insights
          </p>
        </div>
      </div>

      {/* Model Information Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Brain className="h-8 w-8 text-primary mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold">{modelInfo.modelType}</h2>
              {modelInfo.modelLoaded ? (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700">
                  Model Loaded
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                  Offline Mode
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Model Version</p>
                <p className="font-medium">{modelInfo.modelVersion}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Features</p>
                <p className="font-medium">{modelInfo.nFeatures} hippocampal features</p>
              </div>
              <div>
                <p className="text-muted-foreground">Training Accuracy</p>
                <p className="font-medium text-green-600 dark:text-green-400">87-91%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Classes</p>
                <p className="font-medium">Normal / MCI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <ModelMetricsComponent metrics={metrics} />
      </div>

      {/* Analysis Trends */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Analysis Trends (Last 30 Days)</h2>
        <AnalysisTrendsComponent data={trendData} period="daily" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div>
          <ConfusionMatrixComponent matrix={confusionMatrix} />
        </div>

        {/* Class Distribution */}
        <div>
          <ClassDistributionComponent distribution={classDistribution} />
        </div>
      </div>

      {/* ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Model Discrimination</h2>
          <ROCCurveComponent data={rocData} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Confidence Analysis</h2>
          <ConfidenceDistributionComponent distribution={confidenceDistribution} />
        </div>
      </div>

      {/* Feature Importance */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Feature Analysis</h2>
        <FeatureImportanceComponent data={featureImportance} />
      </div>

      {/* Volumetry Statistics */}
      {volumetryStats && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hippocampal Volumetry Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Hippocampus */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Left Hippocampus</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mean:</span>
                  <span className="font-medium">{volumetryStats.leftHippocampus.mean.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median:</span>
                  <span className="font-medium">{volumetryStats.leftHippocampus.median.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Std Dev:</span>
                  <span className="font-medium">{volumetryStats.leftHippocampus.stdDev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-medium">
                    {volumetryStats.leftHippocampus.min.toFixed(2)} - {volumetryStats.leftHippocampus.max.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hippocampus */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Right Hippocampus</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mean:</span>
                  <span className="font-medium">{volumetryStats.rightHippocampus.mean.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median:</span>
                  <span className="font-medium">{volumetryStats.rightHippocampus.median.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Std Dev:</span>
                  <span className="font-medium">{volumetryStats.rightHippocampus.stdDev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-medium">
                    {volumetryStats.rightHippocampus.min.toFixed(2)} - {volumetryStats.rightHippocampus.max.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Volume */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Total Volume</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mean:</span>
                  <span className="font-medium">{volumetryStats.totalVolume.mean.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Median:</span>
                  <span className="font-medium">{volumetryStats.totalVolume.median.toFixed(2)} mm³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Std Dev:</span>
                  <span className="font-medium">{volumetryStats.totalVolume.stdDev.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Range:</span>
                  <span className="font-medium">
                    {volumetryStats.totalVolume.min.toFixed(2)} - {volumetryStats.totalVolume.max.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex gap-3">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Key Insights</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
              <li>• The model achieves {(metrics.accuracy * 100).toFixed(1)}% accuracy on current predictions</li>
              <li>• Estimated correct predictions: {metrics.correctPredictions} out of {metrics.totalPredictions} total analyses ({(metrics.accuracy * 100).toFixed(1)}%)</li>
              <li>• Hippocampal volume features are the strongest predictors of MCI</li>
              <li>• {classDistribution.mildCognitiveImpairment} MCI cases detected out of {classDistribution.total} total analyses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
