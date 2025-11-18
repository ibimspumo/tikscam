/**
 * Display Thresholds and Visual Indicators
 *
 * Thresholds used for color coding, alerts, and UI state changes.
 */

/**
 * Likes per second thresholds for visual indicators
 */
export const LIKES_PER_SECOND_THRESHOLDS = {
  /** Very high activity - exceptional engagement */
  VERY_HIGH: 100,

  /** High activity - strong engagement */
  HIGH: 50,

  /** Medium activity - normal engagement */
  MEDIUM: 20,

  /** Low activity - minimal engagement */
  LOW: 5,
} as const;

/**
 * Viewer count thresholds for stream size classification
 */
export const VIEWER_THRESHOLDS = {
  /** Mega stream - viral content */
  MEGA: 10000,

  /** Large stream - popular content */
  LARGE: 1000,

  /** Medium stream - growing audience */
  MEDIUM: 100,

  /** Small stream - starting out */
  SMALL: 10,
} as const;

/**
 * Gift value thresholds (in diamonds)
 */
export const GIFT_VALUE_THRESHOLDS = {
  /** High value gift */
  HIGH: 1000,

  /** Medium value gift */
  MEDIUM: 100,

  /** Low value gift */
  LOW: 10,
} as const;
