/**
 * Shared Type Definitions for TikTok Live Stream Data
 *
 * This file contains all core types used across the application for
 * stream data, user stats, and analytics.
 */

/**
 * Chat message from a TikTok Live stream
 */
export interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

/**
 * Gift sent during a TikTok Live stream
 */
export interface Gift {
  user: string;
  gift: string;
  count: number;
  timestamp: number;
  avatar?: string;
  diamondCount?: number;
  giftIcon?: string;
  giftImage?: string;
}

/**
 * User activity (join/follow) in a stream
 */
export interface Activity {
  user: string;
  timestamp: number;
  type: 'join' | 'follow';
}

/**
 * Gift type information from TikTok's catalog
 */
export interface GiftType {
  id: number;
  name: string;
  diamondCount: number;
  icon?: string;
  image?: string;
  timesReceived: number;
}

/**
 * Snapshot of likes at a specific timestamp (for rate calculation)
 */
export interface LikeSnapshot {
  timestamp: number;
  totalLikes: number;
}

/**
 * Likes per second statistics for a 15-second interval
 */
export interface MinuteStats {
  interval: number; // 15-second interval timestamp
  likesPerSecond: number;
  timestamp: number;
}

/**
 * Statistics for a 15-second interval (viewers, followers, diamonds)
 */
export interface IntervalStats {
  interval: number;
  viewerCount: number;
  followerCount: number;
  diamondCount: number;
  timestamp: number;
}

/**
 * Per-user statistics (gifts, chat, activity)
 */
export interface UserStats {
  userId: string;
  username: string;
  avatar?: string;
  totalDiamonds: number;
  totalGifts: number;
  chatMessages: number;
  firstSeen: number;
  lastSeen: number;
}

/**
 * Engagement rate statistics for a 15-second interval
 */
export interface EngagementStats {
  interval: number;
  engagementRate: number; // likes per viewer
  timestamp: number;
}

/**
 * Chat activity statistics for a 15-second interval
 */
export interface ChatActivityStats {
  interval: number;
  messageCount: number;
  timestamp: number;
}

/**
 * Likes per second for different time windows
 */
export interface LikesPerSecond {
  last10s: number;
  last20s: number;
  last30s: number;
  last45s: number;
  last60s: number;
}

/**
 * Comprehensive stream statistics
 */
export interface StreamStats {
  viewerCount: number;
  totalLikes: number;
  streamTotalLikes: number; // Total likes from roomInfo
  totalGifts: number;
  totalDiamonds: number;
  followCount: number; // Number of new follows during this session
  totalFollowers: number; // Total followers of the account (absolute)
  chatMessages: ChatMessage[];
  gifts: Gift[];
  joins: Activity[];
  follows: Activity[];
  giftCatalog: Map<number, GiftType>;
  availableGifts: Map<number, GiftType>; // All available gifts from TikTok
  likesPerSecond: LikesPerSecond;
  minuteHistory: MinuteStats[]; // History of likes/second for last 60 minutes
  viewerHistory: IntervalStats[]; // History of viewers for last 60 minutes
  followerHistory: IntervalStats[]; // History of followers for last 60 minutes
  diamondHistory: IntervalStats[]; // History of diamonds for last 60 minutes
  userStats: Map<string, UserStats>; // Per-user statistics
  engagementHistory: EngagementStats[]; // Engagement rate over time
  chatActivityHistory: ChatActivityStats[]; // Chat messages per interval
  peakViewers: number; // Highest viewer count
  peakLikesPerSecond: number; // Highest likes/second rate
}

/**
 * User profile information
 */
export interface UserProfile {
  uniqueId?: string;
  nickname?: string;
  displayName?: string;
  profilePicture?: {
    url?: string[];
  };
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarge?: string;
  followerCount?: number;
  verified?: boolean;
}

/**
 * TikTok Live room information
 */
export interface RoomInfo {
  id?: string;
  title?: string;
  owner?: UserProfile;
  viewerCount?: number;
  likeCount?: number;
}

/**
 * Connection mode for TikTok Live
 */
export type ConnectionMode = 'free' | 'api-key';

/**
 * Connection state for TikTok Live hook
 */
export interface UseTikTokLiveReturn {
  connect: (uniqueId: string) => Promise<void>;
  disconnect: () => void;
  retry: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
  setApiKey: (key: string) => void;
  isConnected: boolean;
  isConnecting: boolean;
  connectionMode: ConnectionMode;
  apiKey: string;
  stats: StreamStats;
  roomInfo: RoomInfo | null;
  error: string | null;
  eventSource: EventSource | null;
}
