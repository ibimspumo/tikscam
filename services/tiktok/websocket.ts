/**
 * TikTok Live WebSocket Service
 *
 * Manages WebSocket connections to EulerStream for TikTok Live events
 * Handles reconnection, event parsing, and error handling
 *
 * @see https://www.eulerstream.com/docs/sign-server/websockets
 */

import {
  WebSocketConfig,
  WebSocketMessage,
  TikTokLiveEvent,
  RoomInfo,
  EventHandlers,
  WebSocketCloseReason,
} from './types';

export class TikTokWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private handlers: EventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionalClose = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }
    if (!this.config.uniqueId) {
      throw new Error('uniqueId is required');
    }
  }

  /**
   * Connect to TikTok Live stream
   */
  public connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    this.isIntentionalClose = false;
    const url = this.buildWebSocketUrl();
    this.log(`Connecting to: ${url.replace(this.config.apiKey, '***API_KEY***')}`);

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Disconnect from stream
   */
  public disconnect(): void {
    this.isIntentionalClose = true;
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Register event handlers
   */
  public on(handlers: EventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Build WebSocket URL
   */
  private buildWebSocketUrl(): string {
    const baseUrl = 'wss://ws.eulerstream.com';
    const params = new URLSearchParams({
      uniqueId: this.config.uniqueId,
      apiKey: this.config.apiKey,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (event) => this.handleError(new Error('WebSocket error'));
    this.ws.onclose = (event) => this.handleClose(event);
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    this.log('WebSocket connected successfully');
    this.reconnectAttempts = 0;

    if (this.handlers.onConnect) {
      this.handlers.onConnect();
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log('[WebSocket] Full message received:', JSON.stringify(data, null, 2));
      this.log('Received message:', data);

      // Extract and handle room info
      if (data.roomInfo) {
        this.handleRoomInfo(data.roomInfo);
      }

      // Process event messages
      if (data.messages && Array.isArray(data.messages)) {
        data.messages.forEach((message) => {
          // Check for nested roomInfo
          if (message.data?.roomInfo) {
            this.handleRoomInfo(message.data.roomInfo);
          }

          // Route event to appropriate handler
          this.routeEvent(message);
        });
      }
    } catch (error) {
      this.log('Error parsing message:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Handle room info updates
   */
  private handleRoomInfo(roomInfo: RoomInfo): void {
    this.log('Room info received:', roomInfo);

    if (this.handlers.onRoomInfo) {
      this.handlers.onRoomInfo(roomInfo);
    }
  }

  /**
   * Route event to appropriate handler
   */
  private routeEvent(message: any): void {
    const type = message.type;
    const data = message.data;

    switch (type) {
      case 'WebcastChatMessage':
        this.handlers.onChat?.(data);
        break;

      case 'WebcastGiftMessage':
        this.handlers.onGift?.(data);
        break;

      case 'WebcastMemberMessage':
        this.handlers.onMember?.(data);
        break;

      case 'WebcastLikeMessage':
        this.handlers.onLike?.(data);
        break;

      case 'WebcastSocialMessage':
        this.handlers.onSocial?.(data);
        break;

      case 'WebcastRoomUserSeqMessage':
        this.handlers.onRoomUser?.(data);
        break;

      case 'WebcastEmoteChatMessage':
        this.handlers.onEmote?.(data);
        break;

      case 'WebcastControlMessage':
        this.handlers.onControl?.(data);
        break;

      default:
        this.log(`Unhandled event type: ${type}`, data);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(error: Error): void {
    this.log('WebSocket error:', error);

    if (this.handlers.onError) {
      this.handlers.onError(error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);

    const reason = this.getCloseReason(event.code, event.reason);

    if (this.handlers.onDisconnect) {
      this.handlers.onDisconnect(event.code, reason);
    }

    // Attempt reconnection if not intentional
    if (!this.isIntentionalClose && this.shouldReconnect(event.code)) {
      this.attemptReconnect();
    }
  }

  /**
   * Get human-readable close reason
   */
  private getCloseReason(code: number, reason: string): string {
    if (reason) {
      // Parse EulerStream error messages
      if (reason.includes('504')) {
        return 'Stream ist offline oder nicht erreichbar';
      }
      if (reason.includes('500')) {
        return 'TikTok-Server nicht erreichbar';
      }
      return reason;
    }

    return WebSocketCloseReason[code] || `Unbekannter Fehler (Code: ${code})`;
  }

  /**
   * Determine if reconnection should be attempted
   */
  private shouldReconnect(code: number): boolean {
    // Don't reconnect on policy violations or stream not found
    if (code === 1008 || code === 1003) {
      return false;
    }

    return this.reconnectAttempts < this.maxReconnectAttempts;
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isIntentionalClose) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Debug logging
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[TikTokWebSocket] ${message}`, ...args);
    }
  }
}
