/**
 * Central Constants Export
 *
 * All application constants are exported from this file for easy imports.
 *
 * @example
 * ```ts
 * import { INTERVALS, LIMITS, LIKES_PER_SECOND_THRESHOLDS } from '@/lib/constants';
 *
 * // Use constants instead of magic numbers
 * const throttle = INTERVALS.LIKE_THROTTLE; // 500
 * const maxMessages = LIMITS.CHAT_MESSAGES; // 50
 * ```
 */

export * from './intervals';
export * from './limits';
export * from './thresholds';
