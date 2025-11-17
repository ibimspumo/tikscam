/**
 * useTikTokLive Hook (v2 - Direct TikTok Connection)
 *
 * React hook for TikTok Live integration using tiktok-live-connector
 * Connects via Server-Sent Events to backend API
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
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
  StreamStats,
  RoomInfo,
  UseTikTokLiveReturn,
} from '@/types';

export function useTikTokLive(): UseTikTokLiveReturn {
  const eventSourceRef = useRef<EventSource | null>(null);
  const processedGiftsRef = useRef<Map<string, number>>(new Map());
  const likeSnapshotsRef = useRef<LikeSnapshot[]>([]);
  const minuteHistoryRef = useRef<MinuteStats[]>([]);
  const viewerHistoryRef = useRef<IntervalStats[]>([]);
  const followerHistoryRef = useRef<IntervalStats[]>([]);
  const diamondHistoryRef = useRef<IntervalStats[]>([]);
  const engagementHistoryRef = useRef<EngagementStats[]>([]);
  const chatActivityHistoryRef = useRef<ChatActivityStats[]>([]);
  const userStatsRef = useRef<Map<string, UserStats>>(new Map());
  const lastMinuteUpdateRef = useRef<number>(0);
  const lastIntervalDiamondsRef = useRef<number>(0); // Track diamonds from last interval
  const lastIntervalFollowersRef = useRef<number>(0); // Track followers from last interval
  const lastIntervalLikesRef = useRef<number>(0); // Track likes from last interval for engagement
  const chatMessagesThisIntervalRef = useRef<number>(0); // Count chat messages in current interval
  const lastIntervalNumberRef = useRef<number>(0); // Track which interval we're in

  // PERFORMANCE: Throttle state updates to max 2 updates per second
  const lastStateUpdateRef = useRef<number>(0);
  const pendingStatsUpdateRef = useRef<Partial<StreamStats> | null>(null);
  const historySnapshotIntervalRef = useRef<NodeJS.Timeout | null>(null); // Timer for regular history snapshots
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timer for auto-reconnect

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [usingApiKey, setUsingApiKey] = useState<boolean>(false);
  const [retryingWithApiKey, setRetryingWithApiKey] = useState<boolean>(false);
  const [needsUserApiKey, setNeedsUserApiKey] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>('');

  const [stats, setStats] = useState<StreamStats>({
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
  });

  // Calculate likes per second for different time windows based on total likes
  const calculateLikesPerSecond = useCallback((currentTotalLikes: number) => {
    const now = Date.now();

    // Add current snapshot
    likeSnapshotsRef.current.push({
      timestamp: now,
      totalLikes: currentTotalLikes,
    });

    // Remove snapshots older than 60 seconds
    const cutoff60s = now - 60000;
    likeSnapshotsRef.current = likeSnapshotsRef.current.filter(s => s.timestamp >= cutoff60s);

    // Calculate for each time window
    const windows = [
      { duration: 10000, key: 'last10s' },
      { duration: 20000, key: 'last20s' },
      { duration: 30000, key: 'last30s' },
      { duration: 45000, key: 'last45s' },
      { duration: 60000, key: 'last60s' },
    ];

    const results: Record<string, number> = {};

    windows.forEach(window => {
      const cutoff = now - window.duration;
      const snapshotsInWindow = likeSnapshotsRef.current.filter(s => s.timestamp >= cutoff);

      if (snapshotsInWindow.length < 2) {
        // Not enough data points
        results[window.key] = 0;
      } else {
        // Get oldest and newest snapshot in this window
        const oldest = snapshotsInWindow[0];
        const newest = snapshotsInWindow[snapshotsInWindow.length - 1];

        const likeDiff = newest.totalLikes - oldest.totalLikes;
        const timeDiff = (newest.timestamp - oldest.timestamp) / 1000; // convert to seconds

        results[window.key] = timeDiff > 0 ? likeDiff / timeDiff : 0;
      }
    });

    return {
      last10s: results.last10s,
      last20s: results.last20s,
      last30s: results.last30s,
      last45s: results.last45s,
      last60s: results.last60s,
    };
  }, []);

  // Update or create user stats
  const updateUserStats = useCallback((
    userId: string,
    username: string,
    avatar: string | undefined,
    action: 'chat' | 'gift',
    diamonds: number = 0,
    giftCount: number = 0
  ) => {
    const now = Date.now();
    const currentStats = userStatsRef.current.get(userId);

    if (currentStats) {
      // Update existing user
      currentStats.lastSeen = now;
      if (action === 'chat') {
        currentStats.chatMessages++;
      } else if (action === 'gift') {
        currentStats.totalGifts += giftCount;
        currentStats.totalDiamonds += diamonds;
      }
      userStatsRef.current.set(userId, currentStats);
    } else {
      // Create new user
      const newUserStats: UserStats = {
        userId,
        username,
        avatar,
        totalDiamonds: action === 'gift' ? diamonds : 0,
        totalGifts: action === 'gift' ? giftCount : 0,
        chatMessages: action === 'chat' ? 1 : 0,
        firstSeen: now,
        lastSeen: now,
      };
      userStatsRef.current.set(userId, newUserStats);
    }

    // Update state
    setStats(prev => ({
      ...prev,
      userStats: new Map(userStatsRef.current),
    }));
  }, []);

  // Update history every 15 seconds
  const updateMinuteHistory = useCallback((currentLikesPerSecond: number) => {
    const now = Date.now();
    const currentInterval = Math.floor(now / 15000); // Current 15-second interval

    // Only update once per 15-second interval
    if (currentInterval === lastMinuteUpdateRef.current) {
      return minuteHistoryRef.current;
    }

    lastMinuteUpdateRef.current = currentInterval;

    // Add new interval data
    const newIntervalData: MinuteStats = {
      interval: currentInterval,
      likesPerSecond: currentLikesPerSecond,
      timestamp: now,
    };

    minuteHistoryRef.current.push(newIntervalData);

    // PERFORMANCE: Keep only last 15 minutes (60 intervals of 15 seconds each)
    const cutoff = now - (15 * 60 * 1000); // 15 minutes
    minuteHistoryRef.current = minuteHistoryRef.current.filter(m => m.timestamp >= cutoff);

    return minuteHistoryRef.current;
  }, []);

  // Update interval history for viewers, followers (absolute), diamonds, engagement, chat activity
  const updateIntervalHistory = useCallback((
    viewerCount: number,
    totalFollowers: number,
    totalDiamonds: number,
    totalLikes: number,
    chatMessagesInInterval: number
  ) => {
    const now = Date.now();
    const currentInterval = Math.floor(now / 15000);

    // Check if we already updated this interval
    if (viewerHistoryRef.current.length > 0 && viewerHistoryRef.current[viewerHistoryRef.current.length - 1].interval === currentInterval) {
      return;
    }

    // Calculate diamonds earned in this interval (delta)
    const diamondsThisInterval = totalDiamonds - lastIntervalDiamondsRef.current;
    lastIntervalDiamondsRef.current = totalDiamonds;

    // Calculate new followers in this interval (delta)
    const followersThisInterval = totalFollowers - lastIntervalFollowersRef.current;
    lastIntervalFollowersRef.current = totalFollowers;

    // Calculate likes in this interval (delta)
    const likesThisInterval = totalLikes - lastIntervalLikesRef.current;
    lastIntervalLikesRef.current = totalLikes;

    // Calculate engagement rate (likes per viewer)
    const engagementRate = viewerCount > 0 ? likesThisInterval / viewerCount : 0;

    const newIntervalData: IntervalStats = {
      interval: currentInterval,
      viewerCount,
      followerCount: followersThisInterval, // New followers in THIS interval only
      diamondCount: diamondsThisInterval, // Diamonds earned in THIS interval only
      timestamp: now,
    };

    const engagementData: EngagementStats = {
      interval: currentInterval,
      engagementRate,
      timestamp: now,
    };

    const chatActivityData: ChatActivityStats = {
      interval: currentInterval,
      messageCount: chatMessagesInInterval,
      timestamp: now,
    };

    // Add to all histories
    viewerHistoryRef.current.push(newIntervalData);
    followerHistoryRef.current.push(newIntervalData);
    diamondHistoryRef.current.push(newIntervalData);
    engagementHistoryRef.current.push(engagementData);
    chatActivityHistoryRef.current.push(chatActivityData);

    // PERFORMANCE: Keep only last 15 minutes
    const cutoff = now - (15 * 60 * 1000); // 15 minutes
    viewerHistoryRef.current = viewerHistoryRef.current.filter(m => m.timestamp >= cutoff);
    followerHistoryRef.current = followerHistoryRef.current.filter(m => m.timestamp >= cutoff);
    diamondHistoryRef.current = diamondHistoryRef.current.filter(m => m.timestamp >= cutoff);
    engagementHistoryRef.current = engagementHistoryRef.current.filter(m => m.timestamp >= cutoff);
    chatActivityHistoryRef.current = chatActivityHistoryRef.current.filter(m => m.timestamp >= cutoff);
  }, []);

  const connect = useCallback(async (uniqueId: string, customApiKey?: string) => {
    setIsConnecting(true);
    setCurrentUsername(uniqueId);

    // Disconnect existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Clear existing history snapshot timer
    if (historySnapshotIntervalRef.current) {
      clearInterval(historySnapshotIntervalRef.current);
      historySnapshotIntervalRef.current = null;
    }

    // Reset state
    setError(null);
    setRoomInfo(null);
    setNeedsUserApiKey(false); // Reset API key dialog flag
    setStats({
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
    });
    processedGiftsRef.current.clear();
    likeSnapshotsRef.current = [];
    minuteHistoryRef.current = [];
    viewerHistoryRef.current = [];
    followerHistoryRef.current = [];
    diamondHistoryRef.current = [];
    lastMinuteUpdateRef.current = 0;
    lastIntervalDiamondsRef.current = 0;
    lastIntervalFollowersRef.current = 0;

    // Connect to SSE stream IMMEDIATELY (don't wait for other data)
    // Include custom API key in URL if provided
    const sseUrl = customApiKey
      ? `/api/tiktok-live/${uniqueId}?apiKey=${encodeURIComponent(customApiKey)}`
      : `/api/tiktok-live/${uniqueId}`;
    console.log(`⚡ Connecting to TikTok Live SSE: ${sseUrl}${customApiKey ? ' (with user API key)' : ''}`);

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Fetch user data from TikTok (non-blocking)
    fetch(`/api/tiktok-user?uniqueId=${uniqueId}`)
      .then(async (response) => {
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const userData = result.data;
            const totalFollowers = parseInt(userData.followerCount) || 0;

            setRoomInfo({
              owner: {
                uniqueId: userData.uniqueId || uniqueId,
                nickname: userData.nickname,
                displayName: userData.nickname,
                profilePicture: userData.avatarMedium ? {
                  url: [userData.avatarMedium],
                } : undefined,
                avatarThumb: userData.avatarThumb,
                avatarMedium: userData.avatarMedium,
                avatarLarge: userData.avatarLarge,
                followerCount: totalFollowers,
                verified: userData.verified,
              },
            });

            // Update stats with absolute follower count
            setStats((prev) => ({
              ...prev,
              totalFollowers,
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch user data:', err);
      });

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      console.log('✅ Connected to TikTok Live');
      setIsConnecting(false);

      // Check if we're using the API key (fallback mode)
      if (data.usingApiKey) {
        console.log('🔑 Connected using EulerStream API Key (Rate Limit Fallback)');
        setUsingApiKey(true);
        setRetryingWithApiKey(false); // Clear retry state
      } else {
        setUsingApiKey(false);
        setRetryingWithApiKey(false);
      }

      setIsConnected(true);
      setError(null);

      // Update room info from connection state
      if (data.state) {
        console.log('🔍 DEBUG - streamTitle from server:', data.streamTitle);

        const likeCount =
          data.state.roomInfo?.like_count ||
          data.state.roomInfo?.stats?.like_count ||
          data.state.like_count ||
          0;

        const viewerCount = data.state.roomInfo?.user_count ||
                           data.state.roomInfo?.stats?.user_count ||
                           data.state.viewerCount ||
                           0;

        setRoomInfo((prev) => ({
          ...prev,
          id: data.roomId,
          title: data.streamTitle || `@${uniqueId}'s Live`,
          viewerCount: viewerCount,
          likeCount: likeCount,
        }));

        setStats((prev) => ({
          ...prev,
          streamTotalLikes: likeCount,
        }));
      }

      // Load available gifts catalog
      if (data.availableGifts && Array.isArray(data.availableGifts)) {
        console.log(`Loading ${data.availableGifts.length} available gifts`);
        const giftsMap = new Map<number, GiftType>();

        data.availableGifts.forEach((gift: { id: number; name?: string; diamond_count?: number; image?: { url_list?: string[] }; icon?: { url_list?: string[] } }) => {
          giftsMap.set(gift.id, {
            id: gift.id,
            name: gift.name || `Gift ${gift.id}`,
            diamondCount: gift.diamond_count || 0,
            icon: gift.image?.url_list?.[0] || gift.icon?.url_list?.[0],
            image: gift.image?.url_list?.[0],
            timesReceived: 0,
          });
        });

        setStats((prev) => ({
          ...prev,
          availableGifts: giftsMap,
        }));
      }
    });

    eventSource.addEventListener('disconnected', () => {
      console.log('Disconnected from TikTok Live');
      setIsConnected(false);
    });

    // Handle retry notification (e.g., when switching to API key fallback)
    eventSource.addEventListener('retrying', (e: Event) => {
      try {
        const messageEvent = e as MessageEvent;
        const data = JSON.parse(messageEvent.data);
        console.log('[TikTok Live] ⏳ Backend is retrying connection...', data.message);
        setRetryingWithApiKey(data.usingApiKey || false);
        setError(data.message || '⏳ Retrying connection...');
        // Keep isConnecting true
      } catch (err) {
        console.warn('[TikTok Live] Failed to parse retrying event');
      }
    });

    // Handle needsApiKey event (server API key failed after 3 retries)
    eventSource.addEventListener('needsApiKey', (e: Event) => {
      try {
        const messageEvent = e as MessageEvent;
        const data = JSON.parse(messageEvent.data);
        console.log('[TikTok Live] 🔑 Server API key failed, requesting user API key');
        setNeedsUserApiKey(true);
        setError(data.message || 'Connection failed. Please provide your EulerStream API key.');
        setIsConnecting(false);
      } catch (err) {
        console.warn('[TikTok Live] Failed to parse needsApiKey event');
      }
    });

    // Handle fatal connection errors (sent as custom event from backend)
    eventSource.addEventListener('connectionError', (e: Event) => {
      const messageEvent = e as MessageEvent;
      let data = {};
      try {
        if (messageEvent.data) {
          data = JSON.parse(messageEvent.data);
        }
      } catch (err) {
        // Silently handle parse errors
      }

      console.log('[TikTok Live] Connection error detected');

      // Check if this is a rate limit error - trigger automatic retry with API key
      let errorMessage = (data as any).message || 'Connection lost';
      const isRateLimitError = errorMessage.includes('Rate Limited') ||
                               errorMessage.includes('rate limit') ||
                               errorMessage.includes('rate_limit');

      if (isRateLimitError) {
        console.log('[TikTok Live] ⚠️ Rate Limit detected! Backend is retrying with API key...');
        // The backend will handle the fallback, we just show a transitional message
        setRetryingWithApiKey(true);
        setError('⏰ Rate limit reached - Switching to EulerStream API...');
        // Keep isConnecting true so user sees "Connecting..." state
      } else if (errorMessage.includes('Failed to connect even with API key')) {
        // This is a final failure after retry
        errorMessage = '❌ Connection failed\n\nPossible reasons:\n• Stream is offline\n• Username is incorrect\n• Network problem';
        setError(errorMessage);
        setIsConnected(false);
        setIsConnecting(false);
      } else {
        // Unknown error - keep trying (don't stop connecting state immediately)
        setError(`⏳ Connection issue - Retrying...\n\n${errorMessage}`);
        // Don't set isConnecting to false yet - give backend a chance to retry
      }
    });

    // Handle non-fatal stream errors (e.g., parsing errors in tiktok-live-connector)
    eventSource.addEventListener('streamError', (e: Event) => {
      try {
        const messageEvent = e as MessageEvent;
        const errorData = JSON.parse(messageEvent.data);
        console.warn('[TikTok Live] Stream error (recoverable):', errorData);

        // Log but don't disconnect - these are recoverable errors
        // Examples: "b.mask is not a function", parsing errors, etc.
        // The connection will stay open and continue receiving events
      } catch (err) {
        console.warn('[TikTok Live] Failed to parse streamError event');
      }
    });

    eventSource.addEventListener('roomUser', (e) => {
      const data = JSON.parse(e.data);
      console.log('Room user update:', data);

      // Update room info with total stream viewers if available
      if (data.totalUser) {
        setRoomInfo((prev) => ({
          ...prev,
          viewerCount: data.totalUser,
        }));
      }

      setStats((prev) => ({
        ...prev,
        viewerCount: data.viewerCount || prev.viewerCount,
      }));
    });

    eventSource.addEventListener('chat', (e) => {
      const data = JSON.parse(e.data);

      const userId = data.userId || data.secUid || 'unknown';
      const username = data.uniqueId || data.nickname || 'Anonymous';
      const avatar = data.profilePictureUrl;

      const message: ChatMessage = {
        user: username,
        message: data.comment || '',
        avatar: avatar,
        timestamp: Date.now(),
      };

      // Track user stats
      updateUserStats(userId, username, avatar, 'chat');

      // Track chat messages per interval
      const currentInterval = Math.floor(Date.now() / 15000);
      if (currentInterval !== lastIntervalNumberRef.current) {
        chatMessagesThisIntervalRef.current = 0;
        lastIntervalNumberRef.current = currentInterval;
      }
      chatMessagesThisIntervalRef.current++;

      setStats((prev) => ({
        ...prev,
        chatMessages: [...prev.chatMessages.slice(-49), message],
      }));
    });

    eventSource.addEventListener('gift', (e) => {
      const data = JSON.parse(e.data);

      const giftId = data.giftId;
      const userId = data.uniqueId;
      const repeatCount = data.repeatCount || 1;
      const diamondCount = data.diamondCount || 0;
      const giftName = data.giftName || `Gift ${giftId}`;
      const giftIcon = data.giftPictureUrl;

      // 🔥 FIX: Only skip giftType=1 (streakable) with repeatEnd=false
      //
      // TikTok Gift Event Behavior:
      // - giftType 1 (streakable like Rose, etc.): ALWAYS sends 2+ events:
      //   Event 1: repeatEnd=false, x1 ❌ SKIP (wait for final)
      //   Event 2: repeatEnd=true, x1 ✅ PROCESS
      //   OR for streaks:
      //   Events 1-49: repeatEnd=false ❌ SKIP
      //   Event 50: repeatEnd=true, x50 ✅ PROCESS
      //
      // - giftType ≠ 1 (non-streakable like Galaxy, etc.): Sends ONLY 1 event:
      //   Event 1: repeatEnd=false OR true OR undefined ✅ PROCESS IMMEDIATELY
      //   (No second event comes!)
      //
      // Solution: ONLY skip giftType=1 with repeatEnd=false
      if (data.giftType === 1 && (data.repeatEnd === false || data.repeatEnd === 0)) {
        console.log(`[Gift] ⏭️ Skipping giftType=1 (waiting for repeatEnd=true): ${giftName} x${repeatCount}`);
        return;
      }

      // Enhanced debug logging for ALL processed gifts
      console.log(`[Gift] ✅ Processing: ${userId} sent ${giftName} x${repeatCount} = ${diamondCount * repeatCount} diamonds`, {
        repeatEnd: data.repeatEnd,
        repeatCount: repeatCount,
        diamondCount: diamondCount,
        giftType: data.giftType,
        giftId: giftId,
      });

      // Track gift streak
      const timestampWindow = Math.floor(Date.now() / 5000);
      const giftKey = `${userId}_${giftId}_${timestampWindow}`;
      const lastProcessedCount = processedGiftsRef.current.get(giftKey) || 0;

      if (repeatCount <= lastProcessedCount) {
        return;
      }

      const deltaCount = repeatCount - lastProcessedCount;
      processedGiftsRef.current.set(giftKey, repeatCount);

      // Clean old entries
      const cutoffWindow = timestampWindow - 6;
      for (const [key] of processedGiftsRef.current.entries()) {
        const keyWindow = parseInt(key.split('_')[2]);
        if (keyWindow < cutoffWindow) {
          processedGiftsRef.current.delete(key);
        }
      }

      const deltaDiamonds = diamondCount * deltaCount;

      // Debug: Show delta calculation (for streak tracking)
      if (deltaCount !== repeatCount) {
        console.log(`[Gift] 📊 Delta calculation: ${giftName} delta=${deltaCount} (was ${lastProcessedCount}, now ${repeatCount}) = ${deltaDiamonds} diamonds`);
      }

      // Track user stats for gift
      updateUserStats(userId, userId, data.profilePictureUrl, 'gift', deltaDiamonds, deltaCount);

      setStats((prev) => {
        // Update gift catalog (received gifts)
        const newCatalog = new Map(prev.giftCatalog);
        const existing = newCatalog.get(giftId);
        newCatalog.set(giftId, {
          id: giftId,
          name: giftName,
          diamondCount: diamondCount,
          icon: giftIcon,
          image: giftIcon,
          timesReceived: (existing?.timesReceived || 0) + deltaCount,
        });

        // Also update available gifts catalog to show it was received
        const newAvailableGifts = new Map(prev.availableGifts);
        if (newAvailableGifts.has(giftId)) {
          const availableGift = newAvailableGifts.get(giftId)!;
          newAvailableGifts.set(giftId, {
            ...availableGift,
            timesReceived: (availableGift.timesReceived || 0) + deltaCount,
          });
        }

        // Update gifts list - check if this is a streak update
        const newGifts = [...prev.gifts];
        const now = Date.now();

        // Check if the last gift is from the same user and same gift type within 5 seconds (streak)
        const lastGift = newGifts[newGifts.length - 1];
        const isStreak = lastGift &&
          lastGift.user === userId &&
          lastGift.gift === giftName &&
          (now - lastGift.timestamp) < 5000;

        if (isStreak) {
          // Update the existing gift with new count and timestamp
          newGifts[newGifts.length - 1] = {
            ...lastGift,
            count: repeatCount, // Use the total count from the streak
            timestamp: now, // Update timestamp to keep it fresh
          };
        } else {
          // Add new gift entry
          const gift: Gift = {
            user: userId,
            gift: giftName,
            count: repeatCount,
            avatar: data.profilePictureUrl,
            diamondCount: diamondCount,
            giftIcon: giftIcon,
            giftImage: giftIcon,
            timestamp: now,
          };
          newGifts.push(gift);
        }

        return {
          ...prev,
          totalGifts: prev.totalGifts + deltaCount,
          totalDiamonds: prev.totalDiamonds + deltaDiamonds,
          gifts: newGifts.slice(-50), // Keep last 50 gifts
          giftCatalog: newCatalog,
          availableGifts: newAvailableGifts,
        };
      });
    });

    eventSource.addEventListener('member', (e) => {
      const data = JSON.parse(e.data);

      const join: Activity = {
        user: data.uniqueId || data.nickname || 'Anonymous',
        timestamp: Date.now(),
        type: 'join',
      };

      setStats((prev) => ({
        ...prev,
        joins: [...prev.joins.slice(-19), join],
      }));
    });

    eventSource.addEventListener('like', (e) => {
      const data = JSON.parse(e.data);

      const likeCount = data.likeCount || 1;
      const totalLikeCount = data.totalLikeCount || 0;

      // PERFORMANCE: Throttle state updates to max 2 updates per second (500ms)
      const now = Date.now();
      const timeSinceLastUpdate = now - lastStateUpdateRef.current;

      // Store pending update
      if (!pendingStatsUpdateRef.current) {
        pendingStatsUpdateRef.current = {};
      }

      // Update refs immediately (no throttling for calculations)
      const newStreamTotalLikes = totalLikeCount > 0 ? totalLikeCount : 0;
      const likesPerSecond = calculateLikesPerSecond(newStreamTotalLikes);
      const minuteHistory = updateMinuteHistory(likesPerSecond.last60s);

      // Only update state every 500ms max
      if (timeSinceLastUpdate >= 500) {
        lastStateUpdateRef.current = now;

        setStats((prev) => {
          // Update interval history with all metrics including chat activity
          updateIntervalHistory(
            prev.viewerCount,
            prev.totalFollowers,
            prev.totalDiamonds,
            newStreamTotalLikes,
            chatMessagesThisIntervalRef.current
          );

          // Track peak values
          const newPeakViewers = Math.max(prev.peakViewers, prev.viewerCount);
          const newPeakLikesPerSecond = Math.max(prev.peakLikesPerSecond, likesPerSecond.last10s);

          return {
            ...prev,
            totalLikes: prev.totalLikes + likeCount,
            streamTotalLikes: newStreamTotalLikes,
            likesPerSecond,
            minuteHistory: [...minuteHistory],
            viewerHistory: [...viewerHistoryRef.current],
            followerHistory: [...followerHistoryRef.current],
            diamondHistory: [...diamondHistoryRef.current],
            engagementHistory: [...engagementHistoryRef.current],
            chatActivityHistory: [...chatActivityHistoryRef.current],
            peakViewers: newPeakViewers,
            peakLikesPerSecond: newPeakLikesPerSecond,
          };
        });

        // Also update roomInfo with total likes
        if (totalLikeCount > 0) {
          setRoomInfo((prev) => ({
            ...prev,
            likeCount: totalLikeCount,
          }));
        }

        pendingStatsUpdateRef.current = null;
      }
    });

    eventSource.addEventListener('social', (e) => {
      const data = JSON.parse(e.data);

      // Check if it's a follow event
      if (data.displayType && data.displayType.includes('follow')) {
        const follow: Activity = {
          user: data.uniqueId || 'Anonymous',
          timestamp: Date.now(),
          type: 'follow',
        };

        setStats((prev) => ({
          ...prev,
          followCount: prev.followCount + 1,
          totalFollowers: prev.totalFollowers + 1, // Increment absolute follower count
          follows: [...prev.follows.slice(-19), follow],
        }));
      }
    });

    eventSource.addEventListener('streamEnd', () => {
      console.log('Stream ended');
      setError('Stream wurde beendet');
      setIsConnected(false);
    });

    // 🔄 Start regular history snapshots (every 15 seconds)
    // This ensures continuous data points even when events are throttled or missing
    console.log('⏰ Starting history snapshot timer (15s intervals)');
    historySnapshotIntervalRef.current = setInterval(() => {
      setStats((prev) => {
        const now = Date.now();

        // Update interval history with current stats
        updateIntervalHistory(
          prev.viewerCount,
          prev.totalFollowers,
          prev.totalDiamonds,
          prev.streamTotalLikes,
          chatMessagesThisIntervalRef.current
        );

        // Calculate current likes/second and update minute history
        const likesPerSecond = calculateLikesPerSecond(prev.streamTotalLikes);
        updateMinuteHistory(likesPerSecond.last60s);

        // Return updated state with fresh history arrays
        return {
          ...prev,
          viewerHistory: [...viewerHistoryRef.current],
          followerHistory: [...followerHistoryRef.current],
          diamondHistory: [...diamondHistoryRef.current],
          minuteHistory: [...minuteHistoryRef.current],
          engagementHistory: [...engagementHistoryRef.current],
          chatActivityHistory: [...chatActivityHistoryRef.current],
        };
      });
    }, 15000); // Every 15 seconds

    eventSource.onopen = () => {
      console.log('📡 EventSource opened');
    };

    eventSource.onerror = () => {
      // Handle connection errors silently - the backend will send proper error events
      // This handler is triggered during normal reconnection attempts

      // If connection failed permanently
      if (eventSource.readyState === EventSource.CLOSED) {
        setIsConnected(false);
        setIsConnecting(false);

        // Set a helpful error message if we don't have one yet
        setError((prevError) => {
          if (prevError) return prevError; // Keep existing error message
          return '⏰ Connection failed\n\nPossible reasons:\n• Daily limit reached - Try again tomorrow\n• Stream is offline\n• Network problem\n\nFor more connections: eulerstream.com/pricing';
        });
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    // Clear history snapshot timer
    if (historySnapshotIntervalRef.current) {
      console.log('⏰ Stopping history snapshot timer');
      clearInterval(historySnapshotIntervalRef.current);
      historySnapshotIntervalRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      console.log('⏰ Clearing reconnect timeout');
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setRoomInfo(null);
    setCurrentUsername('');
    setStats({
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
    });
    processedGiftsRef.current.clear();
    likeSnapshotsRef.current = [];
    minuteHistoryRef.current = [];
    viewerHistoryRef.current = [];
    followerHistoryRef.current = [];
    diamondHistoryRef.current = [];
    engagementHistoryRef.current = [];
    chatActivityHistoryRef.current = [];
    userStatsRef.current.clear();
    lastMinuteUpdateRef.current = 0;
    lastIntervalDiamondsRef.current = 0;
    lastIntervalFollowersRef.current = 0;
    lastIntervalLikesRef.current = 0;
    chatMessagesThisIntervalRef.current = 0;
    lastIntervalNumberRef.current = 0;
    lastIntervalFollowersRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear history snapshot timer
      if (historySnapshotIntervalRef.current) {
        clearInterval(historySnapshotIntervalRef.current);
        historySnapshotIntervalRef.current = null;
      }

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Close EventSource connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    stats,
    roomInfo,
    error,
    eventSource: eventSourceRef.current,
    usingApiKey,
    retryingWithApiKey,
    needsUserApiKey,
    setUserApiKey,
    userApiKey,
  };
}
