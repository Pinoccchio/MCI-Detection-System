/**
 * File Upload API Route
 * Handles large file uploads (up to 50MB) via API route instead of Server Actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Configure body parser for large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const patientId = formData.get('patientId') as string;
    const scanId = formData.get('scanId') as string;

    if (!file || !patientId || !scanId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Generate storage path
    const extension = file.name.split('.').pop();
    const path = `${patientId}/${scanId}/scan.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('mri-scans')
      .upload(path, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (error) {
      console.error('[Upload API] Storage error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      path: data.path,
    });
  } catch (error: any) {
    console.error('[Upload API] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
