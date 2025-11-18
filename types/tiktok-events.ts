/**
 * TikTok Live Event Types
 *
 * Proper TypeScript interfaces for TikTok Live events from tiktok-live-connector
 * Replaces 'any' types throughout the codebase for better type safety
 */

/**
 * User Profile Information
 */
export interface TikTokUserProfile {
  userId: string;
  uniqueId: string;
  nickname: string;
  profilePictureUrl?: string;
  followerCount?: number;
  followingCount?: number;
}

/**
 * Room/Stream Information
 */
export interface TikTokRoomData {
  id: string;
  title: string;
  owner: TikTokUserProfile;
  viewerCount: number;
  likeCount: number;
  startTime?: number;
}

/**
 * Connection Options for tiktok-live-connector
 */
export interface TikTokConnectionOptions {
  processInitialData: boolean;
  enableExtendedGiftInfo: boolean;
  requestOptions: {
    timeout: number;
    headers: {
      'User-Agent': string;
      'x-eulerstream-api-key'?: string;
    };
  };
}

/**
 * Chat Message Event (from tiktok-live-connector)
 */
export interface TikTokChatEvent {
  uniqueId: string;
  userId: string;
  nickname?: string;
  comment: string;
  profilePictureUrl?: string;
}

/**
 * Gift Event (from tiktok-live-connector)
 */
export interface TikTokGiftEvent {
  uniqueId: string;
  userId: string;
  nickname?: string;
  profilePictureUrl?: string;
  giftId: number;
  giftName: string;
  repeatCount: number;
  repeatEnd?: boolean;
  diamondCount?: number;
  giftPictureUrl?: string;
}

/**
 * Like Event (from tiktok-live-connector)
 */
export interface TikTokLikeEvent {
  uniqueId: string;
  userId: string;
  likeCount: number;
  totalLikeCount?: number;
}

/**
 * Member Join Event (from tiktok-live-connector)
 */
export interface TikTokMemberEvent {
  uniqueId: string;
  userId: string;
  nickname?: string;
  profilePictureUrl?: string;
}

/**
 * Social Event (Follow/Share) (from tiktok-live-connector)
 */
export interface TikTokSocialEvent {
  uniqueId: string;
  userId: string;
  nickname?: string;
  profilePictureUrl?: string;
  displayType: 'follow' | 'share' | 'pm_main_follow_message_viewer_2';
}

/**
 * Room User Event (Viewer Count Update) (from tiktok-live-connector)
 */
export interface TikTokRoomUserEvent {
  viewerCount: number;
}

/**
 * Available Gift from Catalog
 */
export interface TikTokAvailableGift {
  id: number;
  name: string;
  diamond_count: number;
  icon?: {
    url_list?: string[];
  };
  image?: {
    url_list?: string[];
  };
  describe?: string;
}

/**
 * Available Gifts Response
 */
export interface TikTokAvailableGiftsEvent {
  gifts: TikTokAvailableGift[];
}

/**
 * Stream End Event
 */
export interface TikTokStreamEndEvent {
  reason?: string;
  timestamp: number;
}

/**
 * Error Event
 */
export interface TikTokErrorEvent {
  error: string;
  fatal: boolean;
  timestamp?: number;
}
