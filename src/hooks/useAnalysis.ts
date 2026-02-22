"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AnalysisResult, PredictionResponse } from "@/types/api";
import { AnalysisResultDB } from "@/types/database";

export function useAnalysis() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const saveAnalysis = async (
    scanId: string,
    prediction: PredictionResponse,
    analyzedBy: string
  ): Promise<AnalysisResultDB | null> => {
    setIsSaving(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('analysis_results')
        .insert({
          scan_id: scanId,
          model_version: prediction.model_version,
          prediction: prediction.class_name,
          confidence: prediction.confidence,
          probabilities: {
            normal: prediction.probabilities["Cognitively Normal"],
            mci: prediction.probabilities["Mild Cognitive Impairment"]
          },
          volumetry: prediction.volumetry ? {
            left_hippocampus: prediction.volumetry.left_hippocampus,
            right_hippocampus: prediction.volumetry.right_hippocampus,
            total_volume: prediction.volumetry.total_volume
          } : null,
          analyzed_by: analyzedBy
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save analysis';
      setError(errorMessage);
      console.error('Error saving analysis:', err);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const getAnalysisHistory = async (scanId: string): Promise<AnalysisResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transform to AnalysisResult format
      const results: AnalysisResult[] = (data || []).map((item: AnalysisResultDB) => ({
        id: item.id,
        scan_id: item.scan_id,
        prediction: item.prediction as "Cognitively Normal" | "Mild Cognitive Impairment",
        confidence: item.confidence,
        probabilities: {
          normal: item.probabilities.normal || 0,
          mci: item.probabilities.mci || 0
        },
        volumetry: item.volumetry ? {
          left_hippocampus: item.volumetry.left_hippocampus || 0,
          right_hippocampus: item.volumetry.right_hippocampus || 0,
          total_volume: item.volumetry.total_volume || 0
        } : undefined,
        model_version: item.model_version,
        created_at: item.created_at
      }));

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis history';
      setError(errorMessage);
      console.error('Error fetching analysis history:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestAnalysis = async (scanId: string): Promise<AnalysisResult | null> => {
    const history = await getAnalysisHistory(scanId);
    return history.length > 0 ? history[0] : null;
  };

  return {
    saveAnalysis,
    getAnalysisHistory,
    getLatestAnalysis,
    isSaving,
    isLoading,
    error
  };
}
