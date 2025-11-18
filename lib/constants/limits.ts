/**
 * Data Retention Limits
 *
 * Maximum number of items to keep in memory for different data types.
 * Prevents memory leaks and keeps UI performant.
 */

export const LIMITS = {
  /** Maximum chat messages to keep in history */
  CHAT_MESSAGES: 50,

  /** Maximum gifts to keep in feed */
  GIFTS: 100,

  /** Maximum join events to track */
  JOINS: 50,

  /** Maximum follow events to track */
  FOLLOWS: 50,

  /** Maximum number of top users to display */
  TOP_USERS: 10,

  /** Maximum gifts to show in horizontal feed */
  GIFT_FEED_DISPLAY: 50,

  /** Maximum number of like snapshots to keep for rate calculation */
  LIKE_SNAPSHOTS: 120, // 60 seconds ÷ 500ms throttle
} as const;
