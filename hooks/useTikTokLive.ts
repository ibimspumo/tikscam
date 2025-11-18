/**
 * TikTok Live Stream Hook
 *
 * Connects to TikTok Live via Server-Sent Events (SSE)
 * Aggregates stream statistics and provides real-time updates
 *
 * Simple Connection Logic:
 * - Default: Free mode (no API key)
 * - Optional: API key mode (user provides key)
 * - ONE connection attempt
 * - On error: Show error, let user retry
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  UseTikTokLiveReturn,
  StreamStats,
  RoomInfo,
  ChatMessage,
  Gift,
  Activity,
  GiftType,
  UserStats,
  LikeSnapshot,
  MinuteStats,
  IntervalStats,
  EngagementStats,
  ChatActivityStats,
  ConnectionMode,
} from '@/types';
import { INTERVALS, LIMITS, CHART_INTERVALS } from '@/lib/constants';

const EMPTY_STATS: StreamStats = {
  viewerCount: 0,
  totalLikes: 0,
  streamTotalLikes: 0,
  totalGifts: 0,
  totalDiamonds: 0,
  followCount: 0,
  totalFollowers: 0,
  chatMessages: [],
  gifts: [],
  joins: [],
  follows: [],
  giftCatalog: new Map(),
  availableGifts: new Map(),
  likesPerSecond: {
    last10s: 0,
    last20s: 0,
    last30s: 0,
    last45s: 0,
    last60s: 0,
  },
  minuteHistory: [],
  viewerHistory: [],
  followerHistory: [],
  diamondHistory: [],
  userStats: new Map(),
  engagementHistory: [],
  chatActivityHistory: [],
  peakViewers: 0,
  peakLikesPerSecond: 0,
};

export function useTikTokLive(): UseTikTokLiveReturn {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('free');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Stream data
  const [stats, setStats] = useState<StreamStats>(EMPTY_STATS);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);

  // Refs for current username and throttling
  const currentUsernameRef = useRef<string>('');
  const likeSnapshotsRef = useRef<LikeSnapshot[]>([]);
  const lastLikeUpdateRef = useRef<number>(0);
  const intervalCountersRef = useRef<{
    followers: number;
    diamonds: number;
    chatMessages: number;
  }>({
    followers: 0,
    diamonds: 0,
    chatMessages: 0,
  });

  // Connect function
  const connect = useCallback(async (uniqueId: string) => {
    if (!uniqueId || isConnecting) return;

    setIsConnecting(true);
    setError(null);
    currentUsernameRef.current = uniqueId;

    // Close existing connection
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }

    // Build URL with API key if in API mode
    const params = new URLSearchParams();
    if (connectionMode === 'api-key' && apiKey) {
      params.append('apiKey', apiKey);
    }
    const url = `/api/tiktok-live/${uniqueId}${params.toString() ? `?${params}` : ''}`;

    // Create EventSource
    const es = new EventSource(url);
    setEventSource(es);

    // Handle connection status
    es.addEventListener('connectionStatus', ((event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('[TikTok Live] Status:', data.status);
    }) as EventListener);

    // Handle successful connection
    es.addEventListener('connected', ((event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('[TikTok Live] Connected:', data.roomInfo);

      setRoomInfo(data.roomInfo);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // Initialize stats with room data
      setStats(prev => ({
        ...prev,
        viewerCount: data.roomInfo.viewerCount || 0,
        streamTotalLikes: data.roomInfo.likeCount || 0,
        totalFollowers: data.roomInfo.owner?.followerCount || 0,
      }));
    }) as EventListener);

    // Handle connection error
    es.addEventListener('connectionError', ((event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.warn('[TikTok Live] Connection failed:', data.error);

      setError(data.error);
      setIsConnecting(false);
      setIsConnected(false);
      es.close();
      setEventSource(null);
    }) as EventListener);

    // Handle disconnection
    es.addEventListener('disconnected', ((event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('[TikTok Live] Disconnected:', data.reason);

      setIsConnected(false);
      setIsConnecting(false);
      es.close();
      setEventSource(null);
    }) as EventListener);

    // Handle stream end
    es.addEventListener('streamEnd', ((event: MessageEvent) => {
      console.log('[TikTok Live] Stream ended');

      setError('Stream has ended');
      setIsConnected(false);
      setIsConnecting(false);
      es.close();
      setEventSource(null);
    }) as EventListener);

    // Handle chat messages
    es.addEventListener('chat', ((event: MessageEvent) => {
      const chatData = JSON.parse(event.data);

      setStats(prev => {
        const newMessage: ChatMessage = {
          user: chatData.user,
          message: chatData.message,
          timestamp: chatData.timestamp,
          avatar: chatData.avatar,
        };

        // Keep last N messages
        const messages = [newMessage, ...prev.chatMessages].slice(0, LIMITS.CHAT_MESSAGES);

        // Track interval chat messages
        intervalCountersRef.current.chatMessages++;

        // Update user stats
        const userStats = new Map(prev.userStats);
        const existing = userStats.get(chatData.user) || {
          userId: chatData.user,
          username: chatData.user,
          avatar: chatData.avatar,
          totalDiamonds: 0,
          totalGifts: 0,
          chatMessages: 0,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        };
        existing.chatMessages++;
        existing.lastSeen = Date.now();
        userStats.set(chatData.user, existing);

        return {
          ...prev,
          chatMessages: messages,
          userStats,
        };
      });
    }) as EventListener);

    // Handle gifts
    es.addEventListener('gift', ((event: MessageEvent) => {
      const giftData = JSON.parse(event.data);

      setStats(prev => {
        const newGift: Gift = {
          user: giftData.user,
          gift: giftData.gift,
          count: giftData.count,
          timestamp: giftData.timestamp,
          avatar: giftData.avatar,
          diamondCount: giftData.diamondCount,
          giftIcon: giftData.giftIcon,
          giftImage: giftData.giftImage,
        };

        // Keep last N gifts
        const gifts = [newGift, ...prev.gifts].slice(0, LIMITS.GIFTS);

        const diamonds = giftData.diamondCount || 0;
        intervalCountersRef.current.diamonds += diamonds;

        // Update user stats
        const userStats = new Map(prev.userStats);
        const existing = userStats.get(giftData.user) || {
          userId: giftData.user,
          username: giftData.user,
          avatar: giftData.avatar,
          totalDiamonds: 0,
          totalGifts: 0,
          chatMessages: 0,
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        };
        existing.totalDiamonds += diamonds;
        existing.totalGifts += giftData.count;
        existing.lastSeen = Date.now();
        userStats.set(giftData.user, existing);

        return {
          ...prev,
          gifts,
          totalGifts: prev.totalGifts + giftData.count,
          totalDiamonds: prev.totalDiamonds + diamonds,
          userStats,
        };
      });
    }) as EventListener);

    // Handle likes (throttled)
    es.addEventListener('like', ((event: MessageEvent) => {
      const likeData = JSON.parse(event.data);
      const now = Date.now();

      // Throttle like updates
      if (now - lastLikeUpdateRef.current < INTERVALS.LIKE_THROTTLE) {
        return;
      }
      lastLikeUpdateRef.current = now;

      setStats(prev => {
        const newTotalLikes = prev.totalLikes + (likeData.count || 1);

        // Add snapshot for rate calculation
        const snapshots = [...likeSnapshotsRef.current, {
          timestamp: now,
          totalLikes: newTotalLikes,
        }];

        // Keep only last 60 seconds of snapshots
        const recentSnapshots = snapshots.filter(s => now - s.timestamp < INTERVALS.MINUTE);
        likeSnapshotsRef.current = recentSnapshots;

        // Calculate likes per second for different intervals
        const calculateRate = (seconds: number): number => {
          const cutoff = now - (seconds * 1000);
          const oldSnapshots = recentSnapshots.filter(s => s.timestamp < cutoff);

          if (oldSnapshots.length === 0) return 0;

          const oldestSnapshot = oldSnapshots[oldSnapshots.length - 1];
          const likesDiff = newTotalLikes - oldestSnapshot.totalLikes;
          const timeDiff = (now - oldestSnapshot.timestamp) / 1000;

          return timeDiff > 0 ? likesDiff / timeDiff : 0;
        };

        const likesPerSecond = {
          last10s: calculateRate(10),
          last20s: calculateRate(20),
          last30s: calculateRate(30),
          last45s: calculateRate(45),
          last60s: calculateRate(60),
        };

        const peakLikesPerSecond = Math.max(
          prev.peakLikesPerSecond,
          likesPerSecond.last10s
        );

        return {
          ...prev,
          totalLikes: newTotalLikes,
          likesPerSecond,
          peakLikesPerSecond,
        };
      });
    }) as EventListener);

    // Handle member joins
    es.addEventListener('member', ((event: MessageEvent) => {
      const memberData = JSON.parse(event.data);

      setStats(prev => {
        const newJoin: Activity = {
          user: memberData.user,
          timestamp: memberData.timestamp,
          type: 'join',
        };

        // Keep last N joins
        const joins = [newJoin, ...prev.joins].slice(0, LIMITS.JOINS);

        // Update user stats
        const userStats = new Map(prev.userStats);
        if (!userStats.has(memberData.user)) {
          userStats.set(memberData.user, {
            userId: memberData.user,
            username: memberData.user,
            avatar: memberData.avatar,
            totalDiamonds: 0,
            totalGifts: 0,
            chatMessages: 0,
            firstSeen: memberData.timestamp,
            lastSeen: memberData.timestamp,
          });
        }

        return {
          ...prev,
          joins,
          userStats,
        };
      });
    }) as EventListener);

    // Handle follows/shares
    es.addEventListener('social', ((event: MessageEvent) => {
      const socialData = JSON.parse(event.data);

      if (socialData.type === 'follow' || socialData.type === 'pm_main_follow_message_viewer_2') {
        setStats(prev => {
          const newFollow: Activity = {
            user: socialData.user,
            timestamp: socialData.timestamp,
            type: 'follow',
          };

          // Keep last N follows
          const follows = [newFollow, ...prev.follows].slice(0, LIMITS.FOLLOWS);
          intervalCountersRef.current.followers++;

          return {
            ...prev,
            follows,
            followCount: prev.followCount + 1,
          };
        });
      }
    }) as EventListener);

    // Handle viewer count updates
    es.addEventListener('roomUser', ((event: MessageEvent) => {
      const roomUserData = JSON.parse(event.data);

      setStats(prev => {
        const viewerCount = roomUserData.viewerCount || 0;
        const peakViewers = Math.max(prev.peakViewers, viewerCount);

        return {
          ...prev,
          viewerCount,
          peakViewers,
        };
      });
    }) as EventListener);

    // Handle available gifts catalog
    es.addEventListener('availableGifts', ((event: MessageEvent) => {
      const giftsData = JSON.parse(event.data);

      setStats(prev => {
        const availableGifts = new Map<number, GiftType>();

        if (Array.isArray(giftsData.gifts)) {
          giftsData.gifts.forEach((gift: any) => {
            availableGifts.set(gift.id, {
              id: gift.id,
              name: gift.name,
              diamondCount: gift.diamond_count || 0,
              icon: gift.icon?.url_list?.[0],
              image: gift.image?.url_list?.[0],
              timesReceived: 0,
            });
          });
        }

        return {
          ...prev,
          availableGifts,
        };
      });
    }) as EventListener);

    // Handle errors
    es.addEventListener('streamError', ((event: MessageEvent) => {
      const errorData = JSON.parse(event.data);
      console.warn('[TikTok Live] Stream error:', errorData.error);
    }) as EventListener);

    // Handle EventSource errors
    es.onerror = () => {
      console.error('[TikTok Live] EventSource error');
      setError('Connection lost');
      setIsConnected(false);
      setIsConnecting(false);
      es.close();
      setEventSource(null);
    };

  }, [connectionMode, apiKey, eventSource, isConnecting]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
    setStats(EMPTY_STATS);
    setRoomInfo(null);
    likeSnapshotsRef.current = [];
    intervalCountersRef.current = { followers: 0, diamonds: 0, chatMessages: 0 };
  }, [eventSource]);

  // Retry function
  const retry = useCallback(() => {
    if (currentUsernameRef.current) {
      connect(currentUsernameRef.current);
    }
  }, [connect]);

  // Interval tracking (every 15 seconds)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      const currentInterval = Math.floor(Date.now() / INTERVALS.SNAPSHOT);
      const timestamp = Date.now();

      setStats(prev => {
        // Likes per second snapshot
        const minuteHistory = [...prev.minuteHistory, {
          interval: currentInterval,
          likesPerSecond: prev.likesPerSecond.last10s,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN); // Keep last 60 minutes

        // Viewer count snapshot
        const viewerHistory = [...prev.viewerHistory, {
          interval: currentInterval,
          viewerCount: prev.viewerCount,
          followerCount: 0,
          diamondCount: 0,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN);

        // Follower snapshot
        const followerHistory = [...prev.followerHistory, {
          interval: currentInterval,
          viewerCount: 0,
          followerCount: intervalCountersRef.current.followers,
          diamondCount: 0,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN);

        // Diamond snapshot
        const diamondHistory = [...prev.diamondHistory, {
          interval: currentInterval,
          viewerCount: 0,
          followerCount: 0,
          diamondCount: intervalCountersRef.current.diamonds,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN);

        // Engagement rate
        const engagementRate = prev.viewerCount > 0
          ? prev.likesPerSecond.last10s / prev.viewerCount
          : 0;
        const engagementHistory = [...prev.engagementHistory, {
          interval: currentInterval,
          engagementRate,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN);

        // Chat activity
        const chatActivityHistory = [...prev.chatActivityHistory, {
          interval: currentInterval,
          messageCount: intervalCountersRef.current.chatMessages,
          timestamp,
        }].slice(-CHART_INTERVALS.SIXTY_MIN);

        // Reset interval counters
        intervalCountersRef.current = {
          followers: 0,
          diamonds: 0,
          chatMessages: 0,
        };

        return {
          ...prev,
          minuteHistory,
          viewerHistory,
          followerHistory,
          diamondHistory,
          engagementHistory,
          chatActivityHistory,
        };
      });
    }, INTERVALS.SNAPSHOT);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return {
    connect,
    disconnect,
    retry,
    setConnectionMode,
    setApiKey,
    isConnected,
    isConnecting,
    connectionMode,
    apiKey,
    stats,
    roomInfo,
    error,
    eventSource,
  };
}
