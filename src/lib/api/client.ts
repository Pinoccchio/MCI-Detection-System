/**
 * API client for MCI Detection backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PredictionResponse {
  class_name: string;
  confidence: number;
  probabilities: {
    Normal: number;
    MCI: number;
    Alzheimers: number;
  };
  volumetry?: {
    left_hippocampus: number;
    right_hippocampus: number;
    total_volume: number;
  };
  gradcam_image?: string;
  model_version: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string;
}

export interface ClassesResponse {
  classes: string[];
  num_classes: number;
}

export interface ModelInfoResponse {
  model_version: string;
  model_path: string;
  architecture: string;
  input_size: number[];
  num_classes: number;
}

export class MCIApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  /**
   * Check API health status.
   */
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  /**
   * Predict MCI classification for a single image.
   */
  async predict(file: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Prediction failed');
    }

    return response.json();
  }

  /**
   * Batch predict for multiple images.
   */
  async batchPredict(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/api/v1/batch-predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Batch prediction failed');
    }

    return response.json();
  }

  /**
   * Get available classification classes.
   */
  async getClasses(): Promise<ClassesResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/classes`);

    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }

    return response.json();
  }

  /**
   * Get model information.
   */
  async getModelInfo(): Promise<ModelInfoResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/model-info`);

    if (!response.ok) {
      throw new Error('Failed to fetch model info');
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new MCIApiClient();
