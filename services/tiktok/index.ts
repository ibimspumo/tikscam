/**
 * TikTok Live Service
 *
 * Unified service for TikTok Live integration
 * Combines WebSocket real-time events and REST API data fetching
 *
 * @example
 * ```typescript
 * const tiktok = new TikTokLiveService({ apiKey: 'YOUR_API_KEY', debug: true });
 *
 * // Subscribe to events
 * tiktok.on({
 *   onChat: (data) => console.log('Chat:', data.comment),
 *   onGift: (data) => console.log('Gift:', data.gift?.name),
 *   onRoomInfo: (info) => console.log('Room:', info.title),
 * });
 *
 * // Connect to stream
 * await tiktok.connect('username');
 *
 * // Fetch additional data
 * const userInfo = await tiktok.getUserInfo('username');
 * ```
 */

import { TikTokWebSocketService } from './websocket';
import { TikTokApiService } from './api';
import {
  TikTokConfig,
  EventHandlers,
  RoomInfo,
  StreamInfo,
  TikTokUser,
  ApiResponse,
} from './types';

export * from './types';
export { TikTokWebSocketService } from './websocket';
export { TikTokApiService } from './api';

export class TikTokLiveService {
  private config: TikTokConfig;
  private websocket: TikTokWebSocketService | null = null;
  private api: TikTokApiService;
  private currentUniqueId: string | null = null;
  private roomInfo: RoomInfo | null = null;
  private pendingHandlers: EventHandlers = {};

  constructor(config: TikTokConfig) {
    this.config = {
      ...config,
      debug: config.debug ?? false,
    };

    this.api = new TikTokApiService(this.config);
  }

  // ============================================================================
  // WebSocket Connection Management
  // ============================================================================

  /**
   * Connect to a TikTok Live stream
   *
   * @param uniqueId - TikTok username
   * @returns Promise that resolves when connected
   */
  public async connect(uniqueId: string): Promise<void> {
    this.currentUniqueId = uniqueId;

    // Disconnect existing connection
    if (this.websocket) {
      this.websocket.disconnect();
    }

    // Create new WebSocket connection
    this.websocket = new TikTokWebSocketService({
      apiKey: this.config.apiKey,
      uniqueId,
      debug: this.config.debug,
    });

    // Store room info internally
    this.websocket.on({
      onRoomInfo: (info) => {
        this.roomInfo = { ...this.roomInfo, ...info };
      },
    });

    // Apply any pending handlers
    if (Object.keys(this.pendingHandlers).length > 0) {
      this.websocket.on(this.pendingHandlers);
    }

    // Connect
    this.websocket.connect();
  }

  /**
   * Disconnect from current stream
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.disconnect();
      this.websocket = null;
    }

    this.currentUniqueId = null;
    this.roomInfo = null;
  }

  /**
   * Check if currently connected
   */
  public isConnected(): boolean {
    return this.websocket?.isConnected() ?? false;
  }

  /**
   * Subscribe to live events
   *
   * @param handlers - Event handler callbacks
   */
  public on(handlers: EventHandlers): void {
    // Store handlers for when connection is established
    this.pendingHandlers = { ...this.pendingHandlers, ...handlers };

    // If already connected, apply immediately
    if (this.websocket) {
      this.websocket.on(handlers);
    }
  }

  /**
   * Get currently cached room info
   */
  public getRoomInfo(): RoomInfo | null {
    return this.roomInfo;
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Fetch stream information
   *
   * @param uniqueId - TikTok username (optional, uses current if not provided)
   */
  public async fetchStreamInfo(uniqueId?: string): Promise<ApiResponse<StreamInfo>> {
    const username = uniqueId || this.currentUniqueId;
    if (!username) {
      return {
        success: false,
        error: 'No uniqueId provided and not connected to any stream',
      };
    }

    return this.api.getStreamInfo(username);
  }

  /**
   * Fetch room information
   *
   * @param uniqueId - TikTok username (optional, uses current if not provided)
   */
  public async fetchRoomInfo(uniqueId?: string): Promise<ApiResponse<RoomInfo>> {
    const username = uniqueId || this.currentUniqueId;
    if (!username) {
      return {
        success: false,
        error: 'No uniqueId provided and not connected to any stream',
      };
    }

    return this.api.getRoomInfo(username);
  }

  /**
   * Fetch user information
   *
   * @param uniqueId - TikTok username
   */
  public async fetchUserInfo(uniqueId: string): Promise<ApiResponse<TikTokUser>> {
    return this.api.getUserInfo(uniqueId);
  }

  /**
   * Check if a stream is live
   *
   * @param uniqueId - TikTok username
   */
  public async isLive(uniqueId: string): Promise<boolean> {
    return this.api.isLive(uniqueId);
  }

  /**
   * Validate API key
   */
  public async validateApiKey(): Promise<boolean> {
    return this.api.validateApiKey();
  }

  /**
   * Get API usage statistics
   */
  public async getUsageStats(): Promise<ApiResponse<any>> {
    return this.api.getUsageStats();
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get current connected username
   */
  public getCurrentUsername(): string | null {
    return this.currentUniqueId;
  }

  /**
   * Enable/disable debug logging
   */
  public setDebug(enabled: boolean): void {
    this.config.debug = enabled;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new TikTok Live Service instance
 *
 * @param apiKey - EulerStream API key
 * @param debug - Enable debug logging (default: false)
 */
export function createTikTokLiveService(apiKey: string, debug = false): TikTokLiveService {
  return new TikTokLiveService({ apiKey, debug });
}
