/**
 * TikTok Live API Service
 *
 * REST API wrapper for EulerStream API endpoints
 * Provides methods for fetching stream info, user data, and more
 *
 * @see https://www.eulerstream.com/docs
 */

import { TikTokConfig, ApiResponse, StreamInfo, RoomInfo, TikTokUser } from './types';

export class TikTokApiService {
  private config: TikTokConfig;
  private baseUrl = 'https://api.eulerstream.com';

  constructor(config: TikTokConfig) {
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
  }

  /**
   * Get stream information by username
   *
   * @param uniqueId - TikTok username
   * @returns Stream info including live status, viewer count, etc.
   */
  public async getStreamInfo(uniqueId: string): Promise<ApiResponse<StreamInfo>> {
    try {
      const response = await this.fetch(`/stream/${uniqueId}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get room/stream details
   *
   * @param uniqueId - TikTok username
   * @returns Detailed room information
   */
  public async getRoomInfo(uniqueId: string): Promise<ApiResponse<RoomInfo>> {
    try {
      const response = await this.fetch(`/room/${uniqueId}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user profile information
   *
   * @param uniqueId - TikTok username
   * @returns User profile data
   */
  public async getUserInfo(uniqueId: string): Promise<ApiResponse<TikTokUser>> {
    try {
      const response = await this.fetch(`/user/${uniqueId}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Check if a stream is currently live
   *
   * @param uniqueId - TikTok username
   * @returns Boolean indicating if stream is live
   */
  public async isLive(uniqueId: string): Promise<boolean> {
    try {
      const result = await this.getStreamInfo(uniqueId);
      return result.data?.isLive ?? false;
    } catch (error) {
      this.log('Error checking live status:', error);
      return false;
    }
  }

  /**
   * Validate API key
   *
   * @returns Whether the API key is valid
   */
  public async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.fetch('/validate');
      return response.valid === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get account usage statistics
   *
   * @returns API usage stats (requests remaining, etc.)
   */
  public async getUsageStats(): Promise<ApiResponse<any>> {
    try {
      const response = await this.fetch('/usage');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generic fetch wrapper with authentication
   */
  private async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      ...options.headers,
    };

    this.log(`Fetching: ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Handle and format errors
   */
  private handleError(error: any): ApiResponse<never> {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    this.log('API Error:', message);

    return {
      success: false,
      error: message,
    };
  }

  /**
   * Debug logging
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`[TikTokAPI] ${message}`, ...args);
    }
  }
}
