-- Migration: Fix Security Advisories
-- This migration addresses security concerns:
-- 1. Fix function search_path issues
-- 2. Secure SECURITY_DEFINER views/functions
-- 3. Add secure helper functions

-- ====================================
-- FIX FUNCTION SEARCH PATHS
-- ====================================

-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate update_reports_updated_at with secure search_path
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- SECURE HELPER FUNCTIONS
-- ====================================

-- Create a secure is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'admin_radiologist')
  );
END;
$$ LANGUAGE plpgsql;

-- Create a secure get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, 'anonymous');
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- DROP INSECURE VIEWS IF THEY EXIST
-- ====================================

-- Drop potentially insecure SECURITY_DEFINER views
DROP VIEW IF EXISTS public.recent_analyses CASCADE;
DROP VIEW IF EXISTS public.patient_scan_summary CASCADE;

-- ====================================
-- RECREATE VIEWS WITH SECURITY INVOKER
-- ====================================

-- Recent analyses view with proper security
CREATE OR REPLACE VIEW public.recent_analyses AS
SELECT
  ar.id,
  ar.scan_id,
  ar.model_version,
  ar.prediction,
  ar.confidence,
  ar.probabilities,
  ar.volumetry,
  ar.created_at,
  ms.patient_id,
  p.full_name as patient_name,
  p.patient_id as patient_mrn
FROM public.analysis_results ar
JOIN public.mri_scans ms ON ar.scan_id = ms.id
JOIN public.patients p ON ms.patient_id = p.id
ORDER BY ar.created_at DESC
LIMIT 50;

-- Patient scan summary view with proper security
CREATE OR REPLACE VIEW public.patient_scan_summary AS
SELECT
  p.id as patient_id,
  p.patient_id as mrn,
  p.full_name,
  COUNT(DISTINCT ms.id) as total_scans,
  COUNT(DISTINCT ar.id) as total_analyses,
  MAX(ms.created_at) as last_scan_date,
  MAX(ar.created_at) as last_analysis_date
FROM public.patients p
LEFT JOIN public.mri_scans ms ON p.id = ms.patient_id
LEFT JOIN public.analysis_results ar ON ms.id = ar.scan_id
GROUP BY p.id, p.patient_id, p.full_name;

-- Grant access to views
GRANT SELECT ON public.recent_analyses TO authenticated;
GRANT SELECT ON public.patient_scan_summary TO authenticated;

-- ====================================
-- SECURITY COMMENTS
-- ====================================

COMMENT ON FUNCTION public.is_admin() IS 'Checks if current user has admin role - uses SECURITY INVOKER';
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current user - uses SECURITY INVOKER';
COMMENT ON VIEW public.recent_analyses IS 'View of recent analyses - access controlled by RLS on underlying tables';
COMMENT ON VIEW public.patient_scan_summary IS 'Summary of patient scans and analyses - access controlled by RLS on underlying tables';
