/**
 * Database type definitions (Supabase tables)
 */

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: "M" | "F" | "Other";
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  medical_history?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreatePatientInput {
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: "M" | "F" | "Other";
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  medical_history?: Record<string, any>;
}

export interface UpdatePatientInput {
  full_name?: string;
  date_of_birth?: string;
  gender?: "M" | "F" | "Other";
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  medical_history?: Record<string, any>;
}

export interface MRIScan {
  id: string;
  patient_id: string;
  scan_date: string;
  scan_type: string;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  dicom_metadata?: Record<string, any>;
  uploaded_by?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface CreateMRIScanInput {
  patient_id: string;
  scan_date: string;
  scan_type: string;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  dicom_metadata?: Record<string, any>;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface UpdateMRIScanInput {
  scan_date?: string;
  scan_type?: string;
  file_path?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  dicom_metadata?: Record<string, any>;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string | null;
}

export interface AnalysisResult {
  id: string;
  scan_id: string;
  model_version: string;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  volumetry?: Record<string, number> | null;
  features?: Record<string, number> | null;
  gradcam_image?: string | null;
  processing_time_ms?: number | null;
  analyzed_by?: string;
  created_at: string;
}

// Legacy alias for backward compatibility
export interface AnalysisResultDB extends AnalysisResult {}

export interface Report {
  id: string;
  analysis_id: string;
  report_type: 'clinical' | 'research';
  title: string;
  pdf_path?: string | null;
  file_size?: number | null;
  generated_by?: string;
  created_at: string;
  updated_at?: string;
}

export type UserRole = "admin" | "clinician" | "researcher";

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  role: UserRole;
  institution?: string;
  department?: string;
  contact_number?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}
