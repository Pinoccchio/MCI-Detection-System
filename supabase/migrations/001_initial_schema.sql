-- MCI Detection System Database Schema
-- Initial migration for MCI detection system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- PROFILES TABLE
-- ====================================
-- Extends Supabase auth.users with additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin_radiologist', 'clinician_neurologist', 'researcher')),
  institution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access';

-- ====================================
-- PATIENTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT UNIQUE NOT NULL,  -- Hospital/Institution patient ID
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  medical_history JSONB,  -- Additional medical information
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.patients IS 'Patient demographic and basic information';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);

-- ====================================
-- MRI SCANS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS public.mri_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  file_path TEXT NOT NULL,  -- Supabase Storage path
  file_size INTEGER,
  file_type TEXT,  -- DICOM, PNG, NIfTI, etc.
  metadata JSONB,  -- DICOM metadata, scan parameters, etc.
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.mri_scans IS 'MRI scan files and metadata';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_mri_scans_patient_id ON public.mri_scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_mri_scans_uploaded_by ON public.mri_scans(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_mri_scans_scan_date ON public.mri_scans(scan_date);

-- ====================================
-- ANALYSIS RESULTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES public.mri_scans(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  prediction TEXT NOT NULL CHECK (prediction IN ('Normal', 'MCI', 'Alzheimers')),
  confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  probabilities JSONB NOT NULL,  -- {Normal: 0.1, MCI: 0.7, Alzheimers: 0.2}
  volumetry JSONB,  -- Hippocampal volume measurements
  gradcam_path TEXT,  -- Storage path for Grad-CAM visualization
  additional_metrics JSONB,  -- Other metrics like atrophy scores
  analyzed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.analysis_results IS 'AI analysis results for MRI scans';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_analysis_results_scan_id ON public.analysis_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_prediction ON public.analysis_results(prediction);
CREATE INDEX IF NOT EXISTS idx_analysis_results_analyzed_by ON public.analysis_results(analyzed_by);

-- ====================================
-- PDF REPORTS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,  -- Storage path for PDF report
  file_size INTEGER,
  generated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.reports IS 'Generated PDF reports for analysis results';

-- Add index
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON public.reports(analysis_id);

-- ====================================
-- AUDIT LOG TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,  -- CREATE, UPDATE, DELETE, VIEW
  resource_type TEXT NOT NULL,  -- patient, scan, analysis, etc.
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all system actions';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mri_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Patients: Admin radiologists can manage all patients
CREATE POLICY "Admin radiologists can manage all patients"
  ON public.patients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_radiologist'
    )
  );

-- Patients: Clinicians and researchers can view patients
CREATE POLICY "Clinicians and researchers can view patients"
  ON public.patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('clinician_neurologist', 'researcher')
    )
  );

-- MRI Scans: Users can view scans they uploaded or have access to
CREATE POLICY "Users can view accessible scans"
  ON public.mri_scans
  FOR SELECT
  USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin_radiologist', 'clinician_neurologist', 'researcher')
    )
  );

-- MRI Scans: Authenticated users can upload scans
CREATE POLICY "Authenticated users can upload scans"
  ON public.mri_scans
  FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Analysis Results: Users can view results for scans they have access to
CREATE POLICY "Users can view analysis results"
  ON public.analysis_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mri_scans
      WHERE id = analysis_results.scan_id AND (
        uploaded_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin_radiologist', 'clinician_neurologist', 'researcher')
        )
      )
    )
  );

-- Analysis Results: Authenticated users can create analysis results
CREATE POLICY "Authenticated users can create analysis"
  ON public.analysis_results
  FOR INSERT
  WITH CHECK (analyzed_by = auth.uid());

-- Reports: Users can view reports for analyses they have access to
CREATE POLICY "Users can view reports"
  ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_results ar
      JOIN public.mri_scans ms ON ar.scan_id = ms.id
      WHERE ar.id = reports.analysis_id AND (
        ms.uploaded_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin_radiologist', 'clinician_neurologist', 'researcher')
        )
      )
    )
  );

-- Audit Logs: Only admins can view all logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_radiologist'
    )
  );

-- Audit Logs: Users can view their own logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- ====================================
-- TRIGGERS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to patients table
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- INITIAL DATA
-- ====================================

-- This will be populated when users sign up through the application

-- ====================================
-- STORAGE BUCKETS (Run separately in Supabase Dashboard)
-- ====================================

-- Storage bucket for MRI scans
-- INSERT INTO storage.buckets (id, name, public) VALUES ('mri-scans', 'mri-scans', false);

-- Storage bucket for Grad-CAM visualizations
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gradcam-images', 'gradcam-images', false);

-- Storage bucket for PDF reports
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
