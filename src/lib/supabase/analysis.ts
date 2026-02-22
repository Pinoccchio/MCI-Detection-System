import { createClient } from '@/lib/supabase/server';
import { AnalysisResultDB } from '@/types/database';

export interface SaveAnalysisData {
  scan_id: string;
  model_version: string;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  volumetry?: Record<string, number>;
  analyzed_by: string;
}

/**
 * Save an analysis result to the database
 */
export async function saveAnalysisResult(data: SaveAnalysisData): Promise<AnalysisResultDB> {
  const supabase = createClient();

  const { data: result, error } = await supabase
    .from('analysis_results')
    .insert({
      scan_id: data.scan_id,
      model_version: data.model_version,
      prediction: data.prediction,
      confidence: data.confidence,
      probabilities: data.probabilities,
      volumetry: data.volumetry,
      analyzed_by: data.analyzed_by,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving analysis result:', error);
    throw new Error(`Failed to save analysis: ${error.message}`);
  }

  return result as AnalysisResultDB;
}

/**
 * Get analysis history for a specific scan
 */
export async function getAnalysisHistory(scanId: string): Promise<AnalysisResultDB[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('scan_id', scanId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analysis history:', error);
    throw new Error(`Failed to fetch analysis history: ${error.message}`);
  }

  return (data || []) as AnalysisResultDB[];
}

/**
 * Get the latest analysis for a scan
 */
export async function getLatestAnalysis(scanId: string): Promise<AnalysisResultDB | null> {
  const history = await getAnalysisHistory(scanId);
  return history.length > 0 ? history[0] : null;
}

/**
 * Get all analyses by a specific user
 */
export async function getUserAnalyses(userId: string): Promise<AnalysisResultDB[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('analyzed_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user analyses:', error);
    throw new Error(`Failed to fetch user analyses: ${error.message}`);
  }

  return (data || []) as AnalysisResultDB[];
}

/**
 * Delete an analysis result
 */
export async function deleteAnalysis(analysisId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('analysis_results')
    .delete()
    .eq('id', analysisId);

  if (error) {
    console.error('Error deleting analysis:', error);
    throw new Error(`Failed to delete analysis: ${error.message}`);
  }
}
