/**
 * Next.js API Route: TikTok User Data Proxy
 *
 * Fetches user profile data from TikTok's public page
 * Avoids CORS issues by running server-side
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for API routes
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
    console.log(`[TikTok Proxy] Fetching user data for: ${uniqueId}`);

    const response = await fetch(`https://www.tiktok.com/@${uniqueId}`, {
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
    const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/);

    if (!match) {
      // Try alternative pattern
      const altMatch = html.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/);

      if (!altMatch) {
        throw new Error('Could not find user data in page');
      }

      const data = JSON.parse(altMatch[1]);
      console.log('[TikTok Proxy] Found SIGI_STATE data');

      // Extract user info from SIGI_STATE
      const userInfo = data?.UserModule?.users?.[Object.keys(data.UserModule?.users || {})[0]];

      if (!userInfo) {
        throw new Error('User data not found in SIGI_STATE');
      }

      return NextResponse.json({
        success: true,
        data: {
          uniqueId: userInfo.uniqueId,
          nickname: userInfo.nickname,
          avatarThumb: userInfo.avatarThumb,
          avatarMedium: userInfo.avatarMedium,
          avatarLarge: userInfo.avatarLarger,
          followerCount: userInfo.followerCount,
          followingCount: userInfo.followingCount,
          verified: userInfo.verified,
          signature: userInfo.signature,
        },
      });
    }

    const data = JSON.parse(match[1]);
    const userDetail = data?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo?.user;

    if (!userDetail) {
      throw new Error('User data not found in page');
    }

    console.log('[TikTok Proxy] Successfully extracted user data');

    return NextResponse.json({
      success: true,
      data: {
        uniqueId: userDetail.uniqueId,
        nickname: userDetail.nickname,
        avatarThumb: userDetail.avatarThumb,
        avatarMedium: userDetail.avatarMedium,
        avatarLarge: userDetail.avatarLarge,
        followerCount: userDetail.followerCount,
        followingCount: userDetail.followingCount,
        verified: userDetail.verified,
        signature: userDetail.signature,
      },
    });

  } catch (error) {
    console.error('[TikTok Proxy] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user data'
      },
      { status: 500 }
    );
  }
}
