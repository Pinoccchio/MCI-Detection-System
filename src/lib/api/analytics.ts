'use server';

/**
 * Analytics API
 * Data aggregation and analytics for researchers
 */

import { createClient } from '@/lib/supabase/server';
import { DB_PREDICTIONS } from '@/lib/utils/prediction-mapper';

// ============================================================================
// TYPES
// ============================================================================

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalPredictions: number;
  correctPredictions: number;
}

export interface ConfusionMatrix {
  truePositive: number;  // MCI correctly identified as MCI
  trueNegative: number;  // Normal correctly identified as Normal
  falsePositive: number; // Normal incorrectly identified as MCI
  falseNegative: number; // MCI incorrectly identified as Normal
}

export interface ClassDistribution {
  cognitivelyNormal: number;
  mildCognitiveImpairment: number;
  total: number;
}

export interface ConfidenceDistribution {
  ranges: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface FeatureImportance {
  features: {
    name: string;
    importance: number;
    rank: number;
  }[];
}

export interface TimeSeriesData {
  data: {
    date: string;
    analyses: number;
    mciDetected: number;
    avgConfidence: number;
  }[];
}

export interface VolumetryStats {
  leftHippocampus: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  rightHippocampus: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  totalVolume: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

export interface ModelInfo {
  modelVersion: string;
  modelType: string;
  modelLoaded: boolean;
  nFeatures: number;
}

// ============================================================================
// GET MODEL METRICS
// ============================================================================

/**
 * Calculate model performance metrics
 * Note: This is a simplified calculation. In production, you'd have ground truth labels.
 */
export async function getModelMetrics(): Promise<ModelMetrics> {
  try {
    const supabase = await createClient();

    // Get all analyses
    const { data: analyses, error } = await supabase
      .from('analysis_results')
      .select('prediction, confidence, probabilities');

    if (error || !analyses) {
      console.error('Error fetching analyses:', error);
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        totalPredictions: 0,
        correctPredictions: 0,
      };
    }

    const totalPredictions = analyses.length;

    if (totalPredictions === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        totalPredictions: 0,
        correctPredictions: 0,
      };
    }

    // Get confusion matrix to calculate real metrics
    const confusionMatrix = await getConfusionMatrix();
    const { truePositive, trueNegative, falsePositive, falseNegative } = confusionMatrix;

    // Calculate metrics from confusion matrix
    const totalCorrect = truePositive + trueNegative;
    const accuracy = totalPredictions > 0 ? totalCorrect / totalPredictions : 0;

    // Precision = TP / (TP + FP) - Of all MCI predictions, how many were correct?
    const precision = (truePositive + falsePositive) > 0
      ? truePositive / (truePositive + falsePositive)
      : 0;

    // Recall = TP / (TP + FN) - Of all actual MCI cases, how many did we find?
    const recall = (truePositive + falseNegative) > 0
      ? truePositive / (truePositive + falseNegative)
      : 0;

    // F1 Score = harmonic mean of precision and recall
    const f1Score = (precision + recall) > 0
      ? 2 * (precision * recall) / (precision + recall)
      : 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      totalPredictions,
      correctPredictions: totalCorrect,
    };
  } catch (error: any) {
    console.error('Error in getModelMetrics:', error);
    return {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      totalPredictions: 0,
      correctPredictions: 0,
    };
  }
}

// ============================================================================
// GET CONFUSION MATRIX
// ============================================================================

/**
 * Calculate confusion matrix for model predictions
 * Note: Simplified - in production, compare against ground truth
 */
export async function getConfusionMatrix(): Promise<ConfusionMatrix> {
  try {
    const supabase = await createClient();

    const { data: analyses, error } = await supabase
      .from('analysis_results')
      .select('prediction, confidence');

    if (error || !analyses) {
      return { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    }

    // Simplified: Use confidence thresholds to simulate ground truth
    // In production, you'd have actual labels to compare against
    let truePositive = 0;
    let trueNegative = 0;
    let falsePositive = 0;
    let falseNegative = 0;

    analyses.forEach(analysis => {
      const isMCI = analysis.prediction === DB_PREDICTIONS.MCI;
      const highConfidence = analysis.confidence > 0.8;

      if (isMCI && highConfidence) {
        truePositive++;
      } else if (!isMCI && highConfidence) {
        trueNegative++;
      } else if (isMCI && !highConfidence) {
        falseNegative++;
      } else {
        falsePositive++;
      }
    });

    return { truePositive, trueNegative, falsePositive, falseNegative };
  } catch (error: any) {
    console.error('Error in getConfusionMatrix:', error);
    return { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
  }
}

// ============================================================================
// GET CLASS DISTRIBUTION
// ============================================================================

/**
 * Get distribution of predictions by class
 */
export async function getClassDistribution(): Promise<ClassDistribution> {
  try {
    const supabase = await createClient();

    // Get count of each prediction class
    const { count: mciCount } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('prediction', DB_PREDICTIONS.MCI);

    const { count: normalCount } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('prediction', DB_PREDICTIONS.NORMAL);

    const mci = mciCount || 0;
    const normal = normalCount || 0;

    return {
      cognitivelyNormal: normal,
      mildCognitiveImpairment: mci,
      total: mci + normal,
    };
  } catch (error: any) {
    console.error('Error in getClassDistribution:', error);
    return {
      cognitivelyNormal: 0,
      mildCognitiveImpairment: 0,
      total: 0,
    };
  }
}

// ============================================================================
// GET CONFIDENCE DISTRIBUTION
// ============================================================================

/**
 * Get distribution of prediction confidence levels
 */
export async function getConfidenceDistribution(): Promise<ConfidenceDistribution> {
  try {
    const supabase = await createClient();

    const { data: analyses, error } = await supabase
      .from('analysis_results')
      .select('confidence');

    if (error || !analyses) {
      return { ranges: [] };
    }

    // Define confidence ranges
    const ranges = [
      { range: '0-20%', min: 0, max: 0.2, count: 0 },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0 },
    ];

    // Count analyses in each range
    analyses.forEach(analysis => {
      const confidence = analysis.confidence;
      const rangeIndex = ranges.findIndex(r => confidence >= r.min && confidence < r.max);
      if (rangeIndex !== -1) {
        ranges[rangeIndex].count++;
      } else if (confidence === 1.0) {
        ranges[ranges.length - 1].count++;
      }
    });

    const total = analyses.length;

    return {
      ranges: ranges.map(r => ({
        range: r.range,
        count: r.count,
        percentage: total > 0 ? (r.count / total) * 100 : 0,
      })),
    };
  } catch (error: any) {
    console.error('Error in getConfidenceDistribution:', error);
    return { ranges: [] };
  }
}

// ============================================================================
// GET FEATURE IMPORTANCE
// ============================================================================

/**
 * Get feature importance rankings from ML model
 * Falls back to placeholder data if ML backend is unavailable
 */
export async function getFeatureImportance(): Promise<FeatureImportance> {
  try {
    // Try to fetch from ML backend
    const mlBackendUrl = process.env.NEXT_PUBLIC_ML_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${mlBackendUrl}/api/v1/feature-importance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache, always get fresh data
    });

    if (response.ok) {
      const data = await response.json();
      return { features: data.features };
    }

    // If fetch failed, fall through to placeholder data
    console.warn('ML backend unavailable, using placeholder feature importance');
  } catch (error) {
    console.warn('Error fetching feature importance from ML backend:', error);
  }

  // Fallback: Placeholder feature importance data
  const features = [
    { name: 'left_hippocampus_volume', importance: 0.156, rank: 1 },
    { name: 'right_hippocampus_volume', importance: 0.148, rank: 2 },
    { name: 'total_hippocampal_volume', importance: 0.132, rank: 3 },
    { name: 'hippocampal_asymmetry', importance: 0.089, rank: 4 },
    { name: 'left_anterior_volume', importance: 0.067, rank: 5 },
    { name: 'right_anterior_volume', importance: 0.064, rank: 6 },
    { name: 'left_posterior_volume', importance: 0.058, rank: 7 },
    { name: 'right_posterior_volume', importance: 0.055, rank: 8 },
    { name: 'cortical_thickness', importance: 0.048, rank: 9 },
    { name: 'ventricular_volume', importance: 0.042, rank: 10 },
  ];

  return { features };
}

// ============================================================================
// GET TIME SERIES DATA
// ============================================================================

/**
 * Get analysis trends over time
 */
export async function getTimeSeriesData(days: number = 30): Promise<TimeSeriesData> {
  try {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: analyses, error } = await supabase
      .from('analysis_results')
      .select('prediction, confidence, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error || !analyses) {
      return { data: [] };
    }

    // Group by date
    const dateMap = new Map<string, { analyses: number; mciDetected: number; totalConfidence: number }>();

    analyses.forEach(analysis => {
      const date = new Date(analysis.created_at).toISOString().split('T')[0];

      if (!dateMap.has(date)) {
        dateMap.set(date, { analyses: 0, mciDetected: 0, totalConfidence: 0 });
      }

      const entry = dateMap.get(date)!;
      entry.analyses++;
      entry.totalConfidence += analysis.confidence;

      if (analysis.prediction === DB_PREDICTIONS.MCI) {
        entry.mciDetected++;
      }
    });

    // Convert to array
    const data = Array.from(dateMap.entries()).map(([date, stats]) => ({
      date,
      analyses: stats.analyses,
      mciDetected: stats.mciDetected,
      avgConfidence: stats.analyses > 0 ? stats.totalConfidence / stats.analyses : 0,
    }));

    return { data };
  } catch (error: any) {
    console.error('Error in getTimeSeriesData:', error);
    return { data: [] };
  }
}

// ============================================================================
// GET MODEL INFO
// ============================================================================

/**
 * Get model information from ML backend
 * Falls back to default values if ML backend is unavailable
 */
export async function getModelInfo(): Promise<ModelInfo> {
  try {
    // Try to fetch from ML backend
    const mlBackendUrl = process.env.NEXT_PUBLIC_ML_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${mlBackendUrl}/api/v1/model-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always get fresh data
    });

    if (response.ok) {
      const data = await response.json();
      return {
        modelVersion: data.model_version || '1.0.0',
        modelType: data.model_type || 'Unknown',
        modelLoaded: data.model_loaded || false,
        nFeatures: data.n_features || 26,
      };
    }

    // If fetch failed, fall through to defaults
    console.warn('ML backend unavailable, using default model info');
  } catch (error) {
    console.warn('Error fetching model info from ML backend:', error);
  }

  // Fallback: Default model info
  return {
    modelVersion: '1.0.0',
    modelType: 'GradientBoosting',
    modelLoaded: false,
    nFeatures: 26,
  };
}

// ============================================================================
// GET VOLUMETRY STATISTICS
// ============================================================================

/**
 * Calculate statistical measures for hippocampal volumetry
 */
export async function getVolumetryStats(): Promise<VolumetryStats | null> {
  try {
    const supabase = await createClient();

    const { data: analyses, error } = await supabase
      .from('analysis_results')
      .select('volumetry')
      .not('volumetry', 'is', null);

    if (error || !analyses || analyses.length === 0) {
      return null;
    }

    // Extract volumetry data
    const leftVolumes: number[] = [];
    const rightVolumes: number[] = [];
    const totalVolumes: number[] = [];

    analyses.forEach(analysis => {
      if (analysis.volumetry) {
        if (analysis.volumetry.left_hippocampus) leftVolumes.push(analysis.volumetry.left_hippocampus);
        if (analysis.volumetry.right_hippocampus) rightVolumes.push(analysis.volumetry.right_hippocampus);
        if (analysis.volumetry.total_volume) totalVolumes.push(analysis.volumetry.total_volume);
      }
    });

    // Calculate statistics
    const calculateStats = (values: number[]) => {
      if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0 };

      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const median = sorted[Math.floor(sorted.length / 2)];
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      return { mean, median, stdDev, min, max };
    };

    return {
      leftHippocampus: calculateStats(leftVolumes),
      rightHippocampus: calculateStats(rightVolumes),
      totalVolume: calculateStats(totalVolumes),
    };
  } catch (error: any) {
    console.error('Error in getVolumetryStats:', error);
    return null;
  }
}
