/**
 * API Route: Start Stream Monitoring
 *
 * POST /api/streams/start
 * Body: { username: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStreamManager } from '@/lib/streamManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting stream for @${username}`);

    const streamManager = getStreamManager();
    const result = await streamManager.startStream(username.trim());

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully started monitoring @${username}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[API] Error starting stream:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start stream' },
      { status: 500 }
    );
  }
}
