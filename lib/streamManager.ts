/**
 * Server-Side Stream Manager
 *
 * Verwaltet TikTok Live Connections im Backend
 * - Läuft unabhängig vom Browser
 * - Ermöglicht 24/7 Monitoring
 */

import { WebcastPushConnection } from 'tiktok-live-connector';

interface ActiveStream {
  username: string;
  connection: WebcastPushConnection;
  startedAt: number;
  stats: {
    viewerCount: number;
    totalLikes: number;
    totalGifts: number;
    totalDiamonds: number;
    peakViewers: number;
  };
  likeSnapshots: Array<{ timestamp: number; totalLikes: number }>;
  lastMinuteSave: number;
}

class StreamManager {
  private streams: Map<string, ActiveStream> = new Map();
  private likeHistoryInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start like history saver (every minute)
    this.likeHistoryInterval = setInterval(() => {
      this.saveLikesHistoryForAllStreams();
    }, 60000); // Every 60 seconds

    console.log('[StreamManager] Initialized');
  }

  /**
   * Start monitoring a TikTok stream
   */
  async startStream(username: string): Promise<{ success: boolean; error?: string }> {
    // Check if already monitoring
    if (this.streams.has(username)) {
      return {
        success: false,
        error: `Already monitoring @${username}`,
      };
    }

    try {
      console.log(`[StreamManager] Starting stream for @${username}`);

      // Create TikTok connection
      const connection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 1000,
      });

      // Initialize stream data
      const streamData: ActiveStream = {
        username,
        connection,
        startedAt: Date.now(),
        stats: {
          viewerCount: 0,
          totalLikes: 0,
          totalGifts: 0,
          totalDiamonds: 0,
          peakViewers: 0,
        },
        likeSnapshots: [],
        lastMinuteSave: Math.floor(Date.now() / 60000),
      };

      // Set up event listeners
      this.setupEventListeners(streamData);

      // Connect to TikTok
      await connection.connect();

      // Store in active streams
      this.streams.set(username, streamData);

      console.log(`[StreamManager] ✅ Successfully started monitoring @${username}`);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(`[StreamManager] Failed to start stream for @${username}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to start stream',
      };
    }
  }

  /**
   * Stop monitoring a TikTok stream
   */
  async stopStream(username: string): Promise<{ success: boolean; error?: string }> {
    const streamData = this.streams.get(username);

    if (!streamData) {
      return {
        success: false,
        error: `Not monitoring @${username}`,
      };
    }

    try {
      console.log(`[StreamManager] Stopping stream for @${username}`);

      // Disconnect TikTok connection
      streamData.connection.disconnect();

      // Remove from active streams
      this.streams.delete(username);

      console.log(`[StreamManager] ✅ Stopped monitoring @${username}`);

      return { success: true };
    } catch (error: any) {
      console.error(`[StreamManager] Failed to stop stream for @${username}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to stop stream',
      };
    }
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): Array<{ username: string; stats: any }> {
    return Array.from(this.streams.entries()).map(([username, data]) => ({
      username,
      stats: data.stats,
    }));
  }

  /**
   * Get specific stream info
   */
  getStream(username: string): ActiveStream | null {
    return this.streams.get(username) || null;
  }

  /**
   * Setup event listeners for a stream
   */
  private setupEventListeners(streamData: ActiveStream) {
    const { connection } = streamData;

    // Connected event
    connection.on('connected', (state) => {
      console.log(`[StreamManager] @${streamData.username} connected!`, state);
    });

    // Disconnected event
    connection.on('disconnected', () => {
      console.log(`[StreamManager] @${streamData.username} disconnected`);
    });

    // Error event
    connection.on('error', (err) => {
      console.error(`[StreamManager] @${streamData.username} error:`, err);
    });

    // Room info (initial data)
    connection.on('roomUser', (data) => {
      streamData.stats.viewerCount = data.viewerCount || 0;
      streamData.stats.totalLikes = data.likeCount || 0;

      if (streamData.stats.viewerCount > streamData.stats.peakViewers) {
        streamData.stats.peakViewers = streamData.stats.viewerCount;
      }
    });

    // Like event
    connection.on('like', (data) => {
      streamData.stats.totalLikes += data.likeCount || 1;

      // Add like snapshot for likes/second calculation
      streamData.likeSnapshots.push({
        timestamp: Date.now(),
        totalLikes: streamData.stats.totalLikes,
      });

      // Keep only last 60 seconds
      const cutoff = Date.now() - 60000;
      streamData.likeSnapshots = streamData.likeSnapshots.filter((s) => s.timestamp >= cutoff);
    });

    // Chat event
    connection.on('chat', (data) => {
      // Chat message received - no persistence
      console.log(`[StreamManager] @${streamData.username} chat: ${data.uniqueId}: ${data.comment}`);
    });

    // Gift event
    connection.on('gift', (data) => {
      if (data.giftType === 1 && !data.repeatEnd) {
        return; // Ignore repeat gifts until they end
      }

      const diamonds = data.diamondCount || 0;
      streamData.stats.totalGifts++;
      streamData.stats.totalDiamonds += diamonds;

      console.log(`[StreamManager] @${streamData.username} gift: ${data.uniqueId} sent ${data.giftName} (${diamonds} diamonds)`);
    });

    // Member join event
    connection.on('member', (data) => {
      console.log(`[StreamManager] @${streamData.username} member joined: ${data.uniqueId}`);
    });

    // Follow event
    connection.on('social', (data) => {
      console.log(`[StreamManager] @${streamData.username} social event: ${data.uniqueId}`);
    });
  }

  /**
   * Log likes history for all active streams (called every minute)
   */
  private async saveLikesHistoryForAllStreams() {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);

    for (const [username, streamData] of this.streams.entries()) {
      // Only log once per minute
      if (streamData.lastMinuteSave === currentMinute) {
        continue;
      }

      // Calculate likes per second
      const likesPerSecond = this.calculateLikesPerSecond(streamData);

      streamData.lastMinuteSave = currentMinute;

      console.log(
        `[StreamManager] @${username} stats: ${likesPerSecond.toFixed(2)} L/s, ${streamData.stats.totalLikes} total likes`
      );
    }
  }

  /**
   * Calculate likes per second for last 60 seconds
   */
  private calculateLikesPerSecond(streamData: ActiveStream): number {
    const now = Date.now();
    const cutoff = now - 60000;

    const snapshotsInWindow = streamData.likeSnapshots.filter((s) => s.timestamp >= cutoff);

    if (snapshotsInWindow.length < 2) {
      return 0;
    }

    const oldest = snapshotsInWindow[0];
    const newest = snapshotsInWindow[snapshotsInWindow.length - 1];

    const likeDiff = newest.totalLikes - oldest.totalLikes;
    const timeDiff = (newest.timestamp - oldest.timestamp) / 1000;

    return timeDiff > 0 ? likeDiff / timeDiff : 0;
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown() {
    console.log('[StreamManager] Shutting down...');

    // Stop interval
    if (this.likeHistoryInterval) {
      clearInterval(this.likeHistoryInterval);
    }

    // Disconnect all streams
    for (const username of this.streams.keys()) {
      await this.stopStream(username);
    }

    console.log('[StreamManager] Shutdown complete');
  }
}

// Singleton instance
let streamManagerInstance: StreamManager | null = null;

export function getStreamManager(): StreamManager {
  if (!streamManagerInstance) {
    streamManagerInstance = new StreamManager();
  }
  return streamManagerInstance;
}

export default getStreamManager;
