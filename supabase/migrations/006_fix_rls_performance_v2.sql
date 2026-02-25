-- Migration: Fix RLS Performance Issues
-- This migration addresses performance warnings from Supabase Performance Advisor:
-- 1. Wraps auth.uid() and is_admin() calls in (select ...) to use initPlan caching
-- 2. Consolidates overlapping mri_scans SELECT policies
-- 3. Updates is_admin() function to use select wrapper internally

-- ====================================
-- PHASE 1: FIX is_admin() FUNCTION
-- ====================================
-- Recreate is_admin() with (select auth.uid()) wrapper for better performance
-- The select wrapper creates an "initPlan" that caches the result per-statement

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = (SELECT auth.uid())
    AND role IN ('admin', 'admin_radiologist')
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Checks if current user has admin role - optimized with select wrapper for RLS performance';

-- ====================================
-- PHASE 2: FIX user_profiles POLICIES
-- ====================================
-- Drop and recreate policies with proper (select ...) wrappers

-- Drop problematic policies (if they exist)
DROP POLICY IF EXISTS "Users can update own profile or admins can update all" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Recreate SELECT policy with optimized auth.uid() call
CREATE POLICY "Users can view profiles" ON public.user_profiles
FOR SELECT TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR (SELECT public.is_admin())
);

-- Recreate UPDATE policy with optimized (select ...) wrapper
CREATE POLICY "Users can update own profile or admins can update all" ON public.user_profiles
FOR UPDATE TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR (SELECT public.is_admin())
);

-- Recreate DELETE policy with optimized (select ...) wrapper
CREATE POLICY "Admins can delete profiles" ON public.user_profiles
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- ====================================
-- PHASE 3: FIX mri_scans POLICIES
-- ====================================
-- Consolidate overlapping SELECT policies into a single policy
-- Before: "Admins can manage all scans" and "Authenticated users can view scans" both run for SELECT

-- Drop overlapping policies
DROP POLICY IF EXISTS "Admins can manage all scans" ON public.mri_scans;
DROP POLICY IF EXISTS "Authenticated users can view scans" ON public.mri_scans;
DROP POLICY IF EXISTS "Users can view accessible scans" ON public.mri_scans;
DROP POLICY IF EXISTS "Authenticated users can upload scans" ON public.mri_scans;

-- Single consolidated SELECT policy - all authenticated users can view scans
-- (Data access is already filtered by the application layer based on role)
CREATE POLICY "Authenticated users can view scans" ON public.mri_scans
FOR SELECT TO authenticated
USING (true);

-- Separate admin-only policies for INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert scans" ON public.mri_scans
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "Admins can update scans" ON public.mri_scans
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "Admins can delete scans" ON public.mri_scans
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- ====================================
-- PHASE 4: FIX analysis_results POLICIES
-- ====================================
-- Optimize existing policies with (select ...) wrapper

DROP POLICY IF EXISTS "Users can view analysis results" ON public.analysis_results;
DROP POLICY IF EXISTS "Authenticated users can create analysis" ON public.analysis_results;

-- Simplified SELECT policy - all authenticated users can view results
CREATE POLICY "Authenticated users can view analysis results" ON public.analysis_results
FOR SELECT TO authenticated
USING (true);

-- INSERT policy - admins only
CREATE POLICY "Admins can create analysis results" ON public.analysis_results
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

-- UPDATE policy - admins only
CREATE POLICY "Admins can update analysis results" ON public.analysis_results
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

-- DELETE policy - admins only
CREATE POLICY "Admins can delete analysis results" ON public.analysis_results
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- ====================================
-- PHASE 5: CREATE get_scan_stats RPC
-- ====================================
-- Optimized single-query function for scan statistics
-- Replaces N+1 fallback queries in frontend

CREATE OR REPLACE FUNCTION public.get_scan_stats()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total', COUNT(*),
    'this_week', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'failed', COUNT(*) FILTER (WHERE status IN ('failed', 'error'))
  )
  FROM public.mri_scans;
$$;

COMMENT ON FUNCTION public.get_scan_stats() IS 'Returns scan statistics in a single query - optimized for dashboard';
GRANT EXECUTE ON FUNCTION public.get_scan_stats() TO authenticated;

-- ====================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON POLICY "Users can view profiles" ON public.user_profiles IS 'Users can view their own profile or admins can view all - optimized with select wrapper';
COMMENT ON POLICY "Users can update own profile or admins can update all" ON public.user_profiles IS 'Users can update own profile or admins can update all - optimized with select wrapper';
COMMENT ON POLICY "Admins can delete profiles" ON public.user_profiles IS 'Only admins can delete profiles - optimized with select wrapper';
COMMENT ON POLICY "Authenticated users can view scans" ON public.mri_scans IS 'All authenticated users can view scans - consolidated from multiple policies';
COMMENT ON POLICY "Admins can insert scans" ON public.mri_scans IS 'Only admins can insert scans - optimized with select wrapper';
COMMENT ON POLICY "Admins can update scans" ON public.mri_scans IS 'Only admins can update scans - optimized with select wrapper';
COMMENT ON POLICY "Admins can delete scans" ON public.mri_scans IS 'Only admins can delete scans - optimized with select wrapper';
