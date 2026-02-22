/**
 * Database type definitions (Supabase tables)
 */

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: "M" | "F" | "Other";
  medical_history?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface MRIScan {
  id: string;
  patient_id: string;
  scan_date: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface AnalysisResultDB {
  id: string;
  scan_id: string;
  model_version: string;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  volumetry?: Record<string, number>;
  analyzed_by: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "clinician" | "researcher";
  created_at: string;
  updated_at?: string;
}
