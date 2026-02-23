/**
 * Tracings API Route
 * Handles saving and retrieving hippocampal tracing data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Save a new tracing
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

    // Verify scan exists
    const { data: scan } = await supabase
      .from('mri_scans')
      .select('id')
      .eq('id', scan_id)
      .single();

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // If mask_data is provided as base64, upload to storage
    let mask_path = null;
    if (mask_data) {
      const fileName = `tracings/${scan_id}/${Date.now()}_slice${slice_index || 0}.png`;

      // Convert base64 to blob
      const base64Data = mask_data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mri-scans')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload mask data' },
          { status: 500 }
        );
      }

      mask_path = uploadData.path;
    }

    // For now, store tracing metadata in the mri_scans table's metadata field
    // In a full implementation, you would create a separate tracings table
    const { data: existingScan } = await supabase
      .from('mri_scans')
      .select('metadata')
      .eq('id', scan_id)
      .single();

    const existingMetadata = existingScan?.metadata || {};
    const tracings = existingMetadata.tracings || [];

    tracings.push({
      id: crypto.randomUUID(),
      traced_by: user.id,
      mask_path,
      slice_index,
      orientation,
      metadata,
      created_at: new Date().toISOString(),
    });

    const { error: updateError } = await supabase
      .from('mri_scans')
      .update({
        metadata: {
          ...existingMetadata,
          tracings,
        },
      })
      .eq('id', scan_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save tracing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tracing saved successfully',
      data: {
        scan_id,
        mask_path,
        slice_index,
        orientation,
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

// GET - Retrieve tracings for a scan
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

    // Get scan_id from query params
    const { searchParams } = new URL(request.url);
    const scan_id = searchParams.get('scan_id');

    if (!scan_id) {
      return NextResponse.json(
        { error: 'scan_id is required' },
        { status: 400 }
      );
    }

    // Get scan with tracing metadata
    const { data: scan, error } = await supabase
      .from('mri_scans')
      .select('id, metadata')
      .eq('id', scan_id)
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const tracings = scan.metadata?.tracings || [];

    return NextResponse.json({
      success: true,
      data: {
        scan_id,
        tracings,
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

// DELETE - Remove a tracing
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
        { error: 'Only administrators can delete tracings' },
        { status: 403 }
      );
    }

    // Get params from request
    const { searchParams } = new URL(request.url);
    const scan_id = searchParams.get('scan_id');
    const tracing_id = searchParams.get('tracing_id');

    if (!scan_id || !tracing_id) {
      return NextResponse.json(
        { error: 'scan_id and tracing_id are required' },
        { status: 400 }
      );
    }

    // Get scan
    const { data: scan, error: fetchError } = await supabase
      .from('mri_scans')
      .select('metadata')
      .eq('id', scan_id)
      .single();

    if (fetchError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const existingMetadata = scan.metadata || {};
    const tracings = (existingMetadata.tracings || []).filter(
      (t: any) => t.id !== tracing_id
    );

    // Update scan with removed tracing
    const { error: updateError } = await supabase
      .from('mri_scans')
      .update({
        metadata: {
          ...existingMetadata,
          tracings,
        },
      })
      .eq('id', scan_id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to delete tracing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tracing deleted successfully',
    });
  } catch (error: any) {
    console.error('Tracings API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
