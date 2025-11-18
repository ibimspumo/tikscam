/**
 * Time Interval Constants
 *
 * All timing-related constants used throughout the application.
 * Values are in milliseconds unless otherwise specified.
 */

/**
 * Data snapshot and aggregation intervals
 */
export const INTERVALS = {
  /** 15 seconds - Main data snapshot interval */
  SNAPSHOT: 15000,

  /** 500ms - Like event throttle delay */
  LIKE_THROTTLE: 500,

  /** 1 minute (60 seconds) */
  MINUTE: 60000,

  /** 30 seconds - SSE keep-alive interval */
  KEEPALIVE: 30000,

  /** 10 seconds - Connection timeout */
  CONNECTION_TIMEOUT: 10000,
} as const;

/**
 * Chart time window configurations
 * Values represent number of intervals (each interval = 15 seconds)
 */
export const CHART_INTERVALS = {
  /** 60 intervals × 15s = 15 minutes */
  FIFTEEN_MIN: 60,

  /** 240 intervals × 15s = 60 minutes (1 hour) */
  SIXTY_MIN: 240,
} as const;

/**
 * Likes per second calculation windows (in seconds)
 */
export const LIKES_WINDOWS = {
  LAST_10S: 10,
  LAST_20S: 20,
  LAST_30S: 30,
  LAST_45S: 45,
  LAST_60S: 60,
} as const;
