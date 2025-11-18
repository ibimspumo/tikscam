/**
 * Central export for all shared types
 *
 * Import types from this file throughout the application:
 * import { StreamStats, ChatMessage, BaseWidgetProps } from '@/types';
 */

// Stream data types
export type {
  ChatMessage,
  Gift,
  Activity,
  GiftType,
  LikeSnapshot,
  MinuteStats,
  IntervalStats,
  UserStats,
  EngagementStats,
  ChatActivityStats,
  LikesPerSecond,
  StreamStats,
  UserProfile,
  RoomInfo,
  ConnectionMode,
  UseTikTokLiveReturn,
} from './stream';

// Widget types
export type {
  BaseWidgetProps,
  DataWidgetProps,
  ChartWidgetProps,
} from './widgets';
