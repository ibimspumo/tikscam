/**
 * useChartTimeline Hook
 *
 * Shared timeline generation logic for all chart components.
 * This hook eliminates ~600 lines of duplicated code across 5 chart components.
 *
 * @example
 * ```ts
 * const timeline = useChartTimeline({
 *   history: stats.viewerHistory,
 *   totalIntervals: CHART_INTERVALS.FIFTEEN_MIN,
 *   defaultValue: { viewerCount: 0, followerCount: 0, diamondCount: 0 },
 * });
 * ```
 */

import { useMemo } from 'react';
import { CHART_INTERVALS } from '@/lib/constants';

/**
 * Base interface for all interval-based data
 */
export interface IntervalData {
  interval: number;
  timestamp: number;
}

export interface UseChartTimelineOptions<T extends IntervalData> {
  /** Historical data array */
  history: T[];

  /** Number of intervals to display (default: 60 = 15 minutes) */
  totalIntervals?: number;

  /** Default value for empty intervals */
  defaultValue: Omit<T, 'interval' | 'timestamp'>;
}

/**
 * Generates a complete timeline with filled gaps for chart visualization
 *
 * @param options - Configuration options
 * @returns Array of data points with guaranteed continuity
 */
export function useChartTimeline<T extends IntervalData>({
  history,
  totalIntervals = CHART_INTERVALS.FIFTEEN_MIN,
  defaultValue,
}: UseChartTimelineOptions<T>): T[] {
  return useMemo(() => {
    // Find the most recent data point to determine current interval
    const latestData = history.length > 0 ? history[history.length - 1] : null;
    const currentInterval = latestData
      ? latestData.interval
      : Math.floor(Date.now() / 15000);

    // Build complete timeline by filling gaps
    const timeline: T[] = [];

    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;
      const existing = history.find((item) => item.interval === interval);

      if (existing) {
        timeline.push(existing);
      } else {
        // Create placeholder data for missing intervals
        timeline.push({
          ...defaultValue,
          interval,
          timestamp: Date.now() - i * 15000,
        } as T);
      }
    }

    return timeline;
  }, [history, totalIntervals, defaultValue]);
}

/**
 * Helper to create default values for specific data types
 */
export const defaultValues = {
  /** Default for minute/likes history */
  likes: { likesPerSecond: 0 },

  /** Default for viewer history */
  viewer: { viewerCount: 0, followerCount: 0, diamondCount: 0 },

  /** Default for follower history */
  follower: { viewerCount: 0, followerCount: 0, diamondCount: 0 },

  /** Default for diamond history */
  diamond: { viewerCount: 0, followerCount: 0, diamondCount: 0 },

  /** Default for engagement history */
  engagement: { engagementRate: 0 },

  /** Default for chat activity */
  chatActivity: { messageCount: 0 },
} as const;
