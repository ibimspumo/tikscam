'use client';

/**
 * EngagementRateChart - Shows engagement rate (likes per viewer) over 15 minutes
 */

import { memo, useMemo } from 'react';

interface EngagementStats {
  interval: number;
  engagementRate: number;
  timestamp: number;
}

interface EngagementRateChartProps {
  engagementHistory: EngagementStats[];
}

export const EngagementRateChart = memo(function EngagementRateChart({ engagementHistory = [] }: EngagementRateChartProps) {
  const chartData = useMemo(() => {
    const now = Date.now();
    const currentInterval = Math.floor(now / 15000);
    const totalIntervals = 60; // REDUZIERT: 15 minutes in 15-second intervals

    // Fill in missing intervals with 0
    const last15Minutes: EngagementStats[] = [];
    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;
      const existing = engagementHistory.find(m => m.interval === interval);

      last15Minutes.push(existing || {
        interval,
        engagementRate: 0,
        timestamp: now - (i * 15000),
      });
    }

    const maxValue = Math.max(...last15Minutes.map(m => m.engagementRate), 1);

    // Calculate average only from actual data (not empty intervals)
    const actualData = last15Minutes.filter(m => m.engagementRate > 0);
    const average = actualData.length > 0
      ? actualData.reduce((sum, m) => sum + m.engagementRate, 0) / actualData.length
      : 0;

    const currentValue = last15Minutes[last15Minutes.length - 1]?.engagementRate || 0;

    // Only calculate peak after minimum 30 seconds of data (2 intervals * 15s = 30s)
    // This prevents unrealistic high values at the very start
    const minIntervalsForPeak = 2; // 30 seconds
    const peak = actualData.length >= minIntervalsForPeak
      ? Math.max(...actualData.map(m => m.engagementRate), 0)
      : 0;

    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { last15Minutes, maxValue, average, currentValue, peak, dataRangeMinutes };
  }, [engagementHistory]);

  const { last15Minutes, maxValue, average, currentValue, peak, dataRangeMinutes } = chartData;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📊</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Engagement-Rate - 15 Min</h2>
        </div>
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="text-left sm:text-right">
            <div className="text-gray-500">Aktuell</div>
            <div className="text-sm sm:text-base font-bold text-blue-400">
              {currentValue.toFixed(2)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-gray-500">Ø ({dataRangeMinutes}min)</div>
            <div className="text-sm sm:text-base font-bold text-purple-400">
              {average.toFixed(2)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-gray-500">Peak</div>
            <div className="text-sm sm:text-base font-bold text-green-400">
              {peak.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-48 sm:h-64 flex items-end gap-[0.5px] bg-gray-950/50 rounded-lg p-3 sm:p-4">
        {last15Minutes.map((stat, index) => {
          const heightPercent = maxValue > 0 ? (stat.engagementRate / maxValue) * 100 : 0;
          const isRecent = index >= 40; // Last 10 minutes (40 intervals * 15s = 600s = 10min)

          const secondsAgo = (last15Minutes.length - 1 - index) * 15;
          const minutesAgo = Math.floor(secondsAgo / 60);
          const remainingSeconds = secondsAgo % 60;
          const timeAgoText = minutesAgo > 0
            ? `vor ${minutesAgo} Min ${remainingSeconds}s`
            : `vor ${remainingSeconds}s`;

          return (
            <div
              key={stat.interval}
              className="relative flex-1 group"
              style={{ height: '100%' }}
            >
              <div
                className={`absolute bottom-0 w-full rounded-t transition-all duration-300 ${
                  isRecent
                    ? 'bg-gradient-to-t from-blue-500 to-purple-500'
                    : 'bg-gradient-to-t from-blue-600 to-blue-800'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 border border-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                  <div className="font-bold">{stat.engagementRate.toFixed(2)} Likes/Zuschauer</div>
                  <div className="text-gray-400 text-[10px]">{timeAgoText}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
        <span>-15 Min</span>
        <span>-7 Min</span>
        <span>Jetzt</span>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-800">
        <div className="text-[10px] sm:text-xs text-gray-400">
          💡 <span className="font-semibold">Engagement-Rate</span> = Neue Likes pro Zuschauer pro Interval (15s)
          <br />
          Höhere Werte bedeuten aktivere Zuschauer
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-800 flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-blue-800"></div>
          <span className="text-gray-400">Älter 10 Min</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <span className="text-gray-400">Letzte 10 Min</span>
        </div>
      </div>
    </div>
  );
});
