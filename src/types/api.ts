/**
 * API type definitions for MCI Detection System
 */

export interface PredictionResponse {
  class_name: "Cognitively Normal" | "Mild Cognitive Impairment";
  confidence: number;
  probabilities: {
    "Cognitively Normal": number;
    "Mild Cognitive Impairment": number;
  };
  volumetry?: {
    left_hippocampus: number;
    right_hippocampus: number;
    total_volume: number;
  };
  gradcam_image?: string; // Base64 encoded
  model_version: string;
}

export interface AnalysisResult {
  id: string;
  scan_id: string;
  prediction: "Cognitively Normal" | "Mild Cognitive Impairment";
  confidence: number;
  probabilities: {
    normal: number;
    mci: number;
  };
  volumetry?: {
    left_hippocampus: number;
    right_hippocampus: number;
    total_volume: number;
  };
  model_version: string;
  created_at: string;
}

export interface ModelInfo {
  model_version: string;
  model_loaded: boolean;
  model_type: string;
  model_path: string;
  n_features: number;
  feature_names: string[];
  class_names: string[];
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string;
}

export interface UploadProgress {
  progress: number; // 0-100
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  message?: string;
}
