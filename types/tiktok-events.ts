/**
 * TikTok Live Event Types
 *
 * Proper TypeScript interfaces for TikTok Live events from tiktok-live-connector
 * Replaces 'any' types throughout the codebase for better type safety
 */

/**
 * User Profile Information (from tiktok-live-connector)
 * Flexible to accept all possible fields from the library
 */
export interface TikTokUserProfile {
  userId?: string;
  uniqueId?: string;
  nickname?: string;
  displayName?: string;
  profilePictureUrl?: string;
  profilePicture?: {
    url?: string[];
  };
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarge?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
  [key: string]: any; // Allow additional fields from TikTok library
}

/**
 * Room/Stream Information (from tiktok-live-connector)
 * Flexible to accept all possible fields from the library
 */
export interface TikTokRoomData {
  id?: string;
  title?: string;
  owner?: TikTokUserProfile;
  viewerCount?: number;
  likeCount?: number;
  startTime?: number;
  [key: string]: any; // Allow additional fields from TikTok library
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
  uniqueId?: string;
  userId?: string;
  nickname?: string;
  comment?: string;
  profilePictureUrl?: string;
  [key: string]: any;
}

/**
 * Gift Event (from tiktok-live-connector)
 */
export interface TikTokGiftEvent {
  uniqueId?: string;
  userId?: string;
  nickname?: string;
  profilePictureUrl?: string;
  giftId?: number;
  giftName?: string;
  repeatCount?: number;
  repeatEnd?: boolean;
  diamondCount?: number;
  giftPictureUrl?: string;
  [key: string]: any;
}

/**
 * Like Event (from tiktok-live-connector)
 */
export interface TikTokLikeEvent {
  uniqueId?: string;
  userId?: string;
  likeCount?: number;
  totalLikeCount?: number;
  [key: string]: any;
}

/**
 * Member Join Event (from tiktok-live-connector)
 */
export interface TikTokMemberEvent {
  uniqueId?: string;
  userId?: string;
  nickname?: string;
  profilePictureUrl?: string;
  [key: string]: any;
}

/**
 * Social Event (Follow/Share) (from tiktok-live-connector)
 */
export interface TikTokSocialEvent {
  uniqueId?: string;
  userId?: string;
  nickname?: string;
  profilePictureUrl?: string;
  displayType?: 'follow' | 'share' | 'pm_main_follow_message_viewer_2';
  [key: string]: any;
}

/**
 * Room User Event (Viewer Count Update) (from tiktok-live-connector)
 */
export interface TikTokRoomUserEvent {
  viewerCount?: number;
  [key: string]: any;
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
