/**
 * Application Constants
 *
 * Centralized configuration for timing intervals, data limits, and chart settings
 * Eliminates magic numbers throughout the codebase
 */

/**
 * Time intervals (in milliseconds)
 */
export const INTERVALS = {
  /** SSE keep-alive heartbeat interval (30 seconds) */
  KEEPALIVE: 30000,

  /** TikTok connection timeout (10 seconds) */
  CONNECTION_TIMEOUT: 10000,

  /** Like event throttle interval (500ms) */
  LIKE_THROTTLE: 500,

  /** One minute in milliseconds (60 seconds) */
  MINUTE: 60000,

  /** Snapshot interval for chart data (15 seconds) */
  SNAPSHOT: 15000,
} as const;

/**
 * Data retention limits
 */
export const LIMITS = {
  /** Maximum chat messages to retain */
  CHAT_MESSAGES: 50,

  /** Maximum gifts to retain in feed */
  GIFTS: 100,

  /** Maximum join events to retain */
  JOINS: 50,

  /** Maximum follow events to retain */
  FOLLOWS: 50,
} as const;

/**
 * Chart interval settings
 */
export const CHART_INTERVALS = {
  /** 60 minutes of history (240 data points @ 15s intervals) */
  SIXTY_MIN: 240,
} as const;
