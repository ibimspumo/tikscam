/**
 * Next.js API Route: TikTok Live Stream Stats
 *
 * Fetches live stream statistics from TikTok's public live stream page
 * including total likes which are not available via tiktok-live-connector
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uniqueId = searchParams.get('uniqueId');

  if (!uniqueId) {
    return NextResponse.json(
      { error: 'uniqueId parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log(`[TikTok Live Stats] Fetching live stream data for: ${uniqueId}`);

    const response = await fetch(`https://www.tiktok.com/@${uniqueId}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`TikTok returned ${response.status}`);
    }

    const html = await response.text();

    // Extract JSON data from the page
    const match = html.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);

    if (!match) {
      console.warn('[TikTok Live Stats] Could not find SIGI_STATE data');
      return NextResponse.json({
        success: false,
        error: 'Live stream data not found'
      });
    }

    const data = JSON.parse(match[1]);
    console.log('[TikTok Live Stats] Found SIGI_STATE data');

    // Extract live room info
    const liveRoomModule = data?.LiveRoom;
    const roomId = Object.keys(liveRoomModule || {})[0];
    const roomData = liveRoomModule?.[roomId];

    if (!roomData) {
      return NextResponse.json({
        success: false,
        error: 'Live room not found or stream is offline'
      });
    }

    const liveRoomInfo = roomData.liveRoomUserInfo?.liveRoom;
    const liveRoomStats = liveRoomInfo?.stats;

    // Debug: Log what we found
    console.log('[TikTok Live Stats] Live room stats:', {
      userCount: liveRoomStats?.userCount,
      totalUser: liveRoomStats?.totalUser,
      likeCount: liveRoomStats?.likeCount,
      status: liveRoomInfo?.status,
    });

    return NextResponse.json({
      success: true,
      data: {
        roomId: liveRoomInfo?.id,
        title: liveRoomInfo?.title,
        totalViewers: liveRoomStats?.totalUser || liveRoomStats?.userCount || 0,
        totalLikes: liveRoomStats?.likeCount || 0,
        viewerCount: liveRoomStats?.userCount || 0,
        status: liveRoomInfo?.status, // 2 = live, 4 = ended
      },
    });

  } catch (error) {
    console.error('[TikTok Live Stats] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch live stream data'
      },
      { status: 500 }
    );
  }
}
