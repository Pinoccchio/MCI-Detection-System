/**
 * Analyses API Route
 * Handles retrieving analysis results for scans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Default query limit to prevent memory overflow
const DEFAULT_LIMIT = 50;

// GET - Retrieve analyses with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const scanId = searchParams.get('scanId');
    const patientId = searchParams.get('patientId');
    const prediction = searchParams.get('prediction');
    const limitParam = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Parse limit with default
    const limit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;

    // Build query with default limit
    let query = supabase
      .from('analysis_results')
      .select(
        `
        *,
        mri_scans!inner(
          id,
          patient_id,
          scan_type,
          scan_date,
          patients!inner(
            patient_id,
            full_name
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by scan
    if (scanId) {
      query = query.eq('scan_id', scanId);
    }

    // Filter by patient
    if (patientId) {
      query = query.eq('mri_scans.patient_id', patientId);
    }

    // Filter by prediction
    if (prediction) {
      query = query.eq('prediction', prediction);
    }

    // Apply offset for pagination
    if (offset) {
      const offsetNum = parseInt(offset, 10);
      query = query.range(offsetNum, offsetNum + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Analyses API] Query error:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analyses: data || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('[Analyses API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
