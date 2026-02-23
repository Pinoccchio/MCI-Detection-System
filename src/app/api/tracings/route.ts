/**
 * Tracings API Route
 * Handles saving and retrieving hippocampal tracing data
 * Uses the mask_corrections table for proper data management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Save a new tracing correction
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can create tracings' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { scan_id, mask_data, slice_index, orientation, metadata } = body;

    if (!scan_id) {
      return NextResponse.json(
        { error: 'scan_id is required' },
        { status: 400 }
      );
    }

    if (slice_index === undefined || slice_index === null) {
      return NextResponse.json(
        { error: 'slice_index is required' },
        { status: 400 }
      );
    }

    if (!orientation) {
      return NextResponse.json(
        { error: 'orientation is required' },
        { status: 400 }
      );
    }

    // Verify scan exists and get patient info for response
    const { data: scan } = await supabase
      .from('mri_scans')
      .select('id, scan_type, patients(full_name)')
      .eq('id', scan_id)
      .single();

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // Store mask_data as base64 in the actions JSONB field
    // This avoids storage bucket MIME type restrictions for small correction masks
    const actionsData = {
      mask_base64: mask_data || null,
      tool: metadata?.tool || null,
      brushSize: metadata?.brushSize || null,
      timestamp: Date.now(),
    };

    // Determine side from metadata or default to 'both'
    const side = metadata?.side || 'both';

    // Insert into mask_corrections table
    const { data: correction, error: insertError } = await supabase
      .from('mask_corrections')
      .insert({
        scan_id,
        slice_index,
        orientation,
        side,
        mask_path: null, // Not using storage for now
        actions: actionsData,
        corrected_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save correction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Correction saved successfully',
      data: {
        id: correction.id,
        scan_id,
        slice_index,
        orientation,
        side,
        patient_name: (scan as any).patients?.full_name || 'Unknown',
        scan_type: scan.scan_type,
        created_at: correction.created_at,
      },
    });
  } catch (error: any) {
    console.error('Tracings API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve corrections for a scan
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
    const scan_id = searchParams.get('scan_id');
    const slice_index = searchParams.get('slice_index');
    const orientation = searchParams.get('orientation');

    if (!scan_id) {
      return NextResponse.json(
        { error: 'scan_id is required' },
        { status: 400 }
      );
    }

    // Build query for mask_corrections table
    let query = supabase
      .from('mask_corrections')
      .select('*')
      .eq('scan_id', scan_id)
      .order('created_at', { ascending: false });

    // Optional filters
    if (slice_index !== null && slice_index !== undefined) {
      query = query.eq('slice_index', parseInt(slice_index, 10));
    }
    if (orientation) {
      query = query.eq('orientation', orientation);
    }

    const { data: corrections, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch corrections' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        scan_id,
        corrections: corrections || [],
      },
    });
  } catch (error: any) {
    console.error('Tracings API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a correction
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete corrections' },
        { status: 403 }
      );
    }

    // Get correction_id from request
    const { searchParams } = new URL(request.url);
    const correction_id = searchParams.get('correction_id');

    if (!correction_id) {
      return NextResponse.json(
        { error: 'correction_id is required' },
        { status: 400 }
      );
    }

    // Get correction to find mask_path for cleanup
    const { data: correction, error: fetchError } = await supabase
      .from('mask_corrections')
      .select('mask_path')
      .eq('id', correction_id)
      .single();

    if (fetchError || !correction) {
      return NextResponse.json({ error: 'Correction not found' }, { status: 404 });
    }

    // Delete the mask file from storage if it exists
    if (correction.mask_path) {
      const { error: deleteStorageError } = await supabase.storage
        .from('mri-scans')
        .remove([correction.mask_path]);

      if (deleteStorageError) {
        console.warn('Failed to delete mask file:', deleteStorageError);
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Delete from mask_corrections table
    const { error: deleteError } = await supabase
      .from('mask_corrections')
      .delete()
      .eq('id', correction_id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete correction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Correction deleted successfully',
    });
  } catch (error: any) {
    console.error('Tracings API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
