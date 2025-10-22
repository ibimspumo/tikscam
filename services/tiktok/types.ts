/**
 * TikTok Live API Type Definitions
 *
 * Complete type definitions for TikTok Live streams using EulerStream API
 * Documentation: https://www.eulerstream.com/docs
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface TikTokUser {
  id?: string;
  userId?: string;
  uniqueId: string;
  nickname: string;
  displayName?: string;
  profilePicture?: {
    url?: string[];
    mUri?: string;
  };
  profilePictureUrl?: string;
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarge?: string;
  followerCount?: number;
  followingCount?: number;
  followInfo?: {
    followerCount?: string;
    followingCount?: string;
  };
  bioDescription?: string;
  verified?: boolean;
}

// ============================================================================
// ROOM / STREAM TYPES
// ============================================================================

export interface RoomStats {
  totalLikeCount?: number;
  totalViewerCount?: number;
  likeCount?: number;
  viewerCount?: number;
}

export interface RoomOwner {
  id?: string;
  uniqueId: string;
  displayName: string;
  nickname?: string;
  avatarThumb?: string;
  avatarMedium?: string;
  avatarLarge?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
}

export interface RoomInfo {
  id?: string;
  title?: string;
  streamTitle?: string;
  ownerNickname?: string;
  userCount?: number;
  totalUserCount?: number;
  viewerCount?: number;
  totalViewerCount?: number;
  liveRoomStats?: RoomStats;
  stats?: RoomStats;
  owner?: RoomOwner;
  startTime?: number;
  status?: number;
  coverUrl?: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * WebcastChatMessage - User sends a text message in chat
 */
export interface ChatMessage {
  type: 'WebcastChatMessage';
  data: {
    uniqueId: string;
    nickname?: string;
    comment: string;
    user?: TikTokUser;
    profilePictureUrl?: string;
    timestamp?: number;
  };
}

/**
 * WebcastGiftMessage - User sends a gift
 */
export interface GiftMessage {
  type: 'WebcastGiftMessage';
  data: {
    uniqueId: string;
    nickname?: string;
    user?: TikTokUser;
    giftId?: number;
    giftName?: string;
    gift?: {
      id: number;
      name: string;
      diamondCount: number;
      icon?: string;
      type?: number;
    };
    repeatCount?: number;
    count?: number;
    profilePictureUrl?: string;
    timestamp?: number;
  };
}

/**
 * WebcastMemberMessage - User joins the live stream
 */
export interface MemberMessage {
  type: 'WebcastMemberMessage';
  data: {
    uniqueId: string;
    nickname?: string;
    user?: TikTokUser;
    profilePictureUrl?: string;
    timestamp?: number;
  };
}

/**
 * WebcastLikeMessage - User sends likes
 */
export interface LikeMessage {
  type: 'WebcastLikeMessage';
  data: {
    uniqueId?: string;
    nickname?: string;
    likeCount: number;
    count?: number;
    totalLikeCount?: number;
    user?: TikTokUser;
    timestamp?: number;
  };
}

/**
 * WebcastSocialMessage - User follows/shares the stream
 */
export interface SocialMessage {
  type: 'WebcastSocialMessage';
  data: {
    uniqueId: string;
    nickname?: string;
    user?: TikTokUser;
    action?: number; // 1 = follow, 2 = share
    followRole?: number;
    profilePictureUrl?: string;
    timestamp?: number;
  };
}

/**
 * WebcastRoomUserSeqMessage - Room statistics update
 */
export interface RoomUserMessage {
  type: 'WebcastRoomUserSeqMessage';
  data: {
    viewerCount?: number;
    totalViewerCount?: number;
    topViewers?: TikTokUser[];
    timestamp?: number;
  };
}

/**
 * WebcastEmoteChatMessage - User sends an emote/sticker
 */
export interface EmoteMessage {
  type: 'WebcastEmoteChatMessage';
  data: {
    uniqueId: string;
    nickname?: string;
    user?: TikTokUser;
    emoteId?: string;
    emoteImage?: string;
    timestamp?: number;
  };
}

/**
 * WebcastControlMessage - Stream control events (end, etc.)
 */
export interface ControlMessage {
  type: 'WebcastControlMessage';
  data: {
    action?: number; // 3 = stream ended
    timestamp?: number;
  };
}

// Union type for all possible event types
export type TikTokLiveEvent =
  | ChatMessage
  | GiftMessage
  | MemberMessage
  | LikeMessage
  | SocialMessage
  | RoomUserMessage
  | EmoteMessage
  | ControlMessage;

// ============================================================================
// WEBSOCKET MESSAGE STRUCTURE
// ============================================================================

export interface WebSocketMessage {
  roomInfo?: RoomInfo;
  messages?: Array<{
    type: string;
    data: any;
  }>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StreamInfo {
  uniqueId: string;
  isLive: boolean;
  roomInfo?: RoomInfo;
  viewerCount?: number;
  title?: string;
}

// ============================================================================
// WEBSOCKET CLOSE CODES
// ============================================================================

export enum WebSocketCloseCode {
  NORMAL = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  INVALID_DATA = 1003,
  POLICY_VIOLATION = 1008,
  MESSAGE_TOO_BIG = 1009,
  INTERNAL_ERROR = 1011,
}

export const WebSocketCloseReason: Record<number, string> = {
  1000: 'Normale Verbindungstrennung',
  1001: 'Client geht offline',
  1002: 'Protokollfehler',
  1003: 'Ungültige Daten',
  1008: 'Stream nicht live oder nicht gefunden',
  1009: 'Nachricht zu groß',
  1011: 'Interner Server-Fehler',
};

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface TikTokConfig {
  apiKey: string;
  debug?: boolean;
}

export interface WebSocketConfig extends TikTokConfig {
  uniqueId: string;
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Error) => void;
  onMessage?: (event: TikTokLiveEvent) => void;
  onRoomInfo?: (roomInfo: RoomInfo) => void;
}

// ============================================================================
// AGGREGATED STATS TYPES
// ============================================================================

export interface StreamStats {
  totalLikes: number;
  streamTotalLikes: number;
  totalGifts: number;
  totalDiamonds: number;
  viewerCount: number;
  followCount: number;
  roomInfo: RoomInfo | null;
  chatMessages: Array<{
    user: string;
    message: string;
    timestamp: number;
    avatar?: string;
  }>;
  gifts: Array<{
    user: string;
    gift: string;
    count: number;
    timestamp: number;
    avatar?: string;
  }>;
  joins: Array<{
    user: string;
    timestamp: number;
  }>;
  follows: Array<{
    user: string;
    timestamp: number;
  }>;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type EventHandler<T = any> = (data: T) => void;

export interface EventHandlers {
  onChat?: EventHandler<ChatMessage['data']>;
  onGift?: EventHandler<GiftMessage['data']>;
  onMember?: EventHandler<MemberMessage['data']>;
  onLike?: EventHandler<LikeMessage['data']>;
  onSocial?: EventHandler<SocialMessage['data']>;
  onRoomUser?: EventHandler<RoomUserMessage['data']>;
  onEmote?: EventHandler<EmoteMessage['data']>;
  onControl?: EventHandler<ControlMessage['data']>;
  onRoomInfo?: EventHandler<RoomInfo>;
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Error) => void;
}
