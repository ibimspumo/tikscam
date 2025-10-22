/**
 * API Route: List Active Streams
 *
 * GET /api/streams/list
 */

import { NextResponse } from 'next/server';
import { getStreamManager } from '@/lib/streamManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const streamManager = getStreamManager();
    const activeStreams = streamManager.getActiveStreams();

    return NextResponse.json({
      success: true,
      streams: activeStreams,
      count: activeStreams.length,
    });
  } catch (error: any) {
    console.error('[API] Error listing streams:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to list streams' },
      { status: 500 }
    );
  }
}
