/**
 * API Route: Update Scan
 * POST /api/scans/update
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateScan } from '@/lib/api/scans';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Scan ID is required' },
        { status: 400 }
      );
    }

    const result = await updateScan(id, updates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update scan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error('[API] Update scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
