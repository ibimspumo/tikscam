'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface MinuteStats {
  interval: number;
  likesPerSecond: number;
  timestamp: number;
}

interface LikesHistoryChartProps {
  minuteHistory: MinuteStats[];
}

export const LikesHistoryChart= React.memo(({ minuteHistory = [] }: LikesHistoryChartProps) => {
  const { t } = useTranslation();
  // Memoize expensive calculations
  const chartData = useMemo(() => {
    // Fill in missing 15-second intervals for the last 60 minutes
    const now = Date.now();
    const currentInterval = Math.floor(now / 15000);
    const totalIntervals = 60; // REDUZIERT: 15 minutes / 15 seconds = 60 intervals (statt 240)

    const last15Minutes: MinuteStats[] = [];
    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;
      const existing = minuteHistory.find(m => m.interval === interval);

      last15Minutes.push(existing || {
        interval,
        likesPerSecond: 0,
        timestamp: now - (i * 15000),
      });
    }

    // Find max value for scaling
    const maxValue = Math.max(...last15Minutes.map(m => m.likesPerSecond), 1);

    // Calculate average only from actual data (not empty intervals)
    const actualData = last15Minutes.filter(m => m.likesPerSecond > 0);
    const average = actualData.length > 0
      ? actualData.reduce((sum, m) => sum + m.likesPerSecond, 0) / actualData.length
      : 0;

    // Get current value (last interval)
    const currentValue = last15Minutes[last15Minutes.length - 1]?.likesPerSecond || 0;

    // Calculate time range
    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { last15Minutes, maxValue, average, currentValue, dataRangeMinutes };
  }, [minuteHistory]);

  const { last15Minutes, maxValue, average, currentValue, dataRangeMinutes } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            {t('charts.likesHistoryTitle')}
          </CardTitle>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('common.current')}</div>
              <div className="text-sm sm:text-base font-bold text-blue-500">
                {currentValue.toFixed(1)} L/s
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">Ø ({dataRangeMinutes}min)</div>
              <div className="text-sm sm:text-base font-bold text-green-500">
                {average.toFixed(1)} L/s
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <div className="relative h-48 sm:h-64 flex items-end gap-[0.5px] bg-muted/50 rounded-lg p-3 sm:p-4">
          {last15Minutes.map((stat, index) => {
            const heightPercent = maxValue > 0 ? (stat.likesPerSecond / maxValue) * 100 : 0;
            const isRecent = index >= 40; // Last 10 minutes (40 intervals)

            // Calculate time ago in minutes and seconds
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
                {/* Bar */}
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-all duration-300 ${
                    isRecent
                      ? 'bg-gradient-to-t from-purple-500 to-pink-500'
                      : 'bg-gradient-to-t from-blue-500 to-cyan-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover border text-popover-foreground text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                    <div className="font-bold">{stat.likesPerSecond.toFixed(1)} L/s</div>
                    <div className="text-muted-foreground text-[10px]">
                      {timeAgoText}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-muted-foreground">
          <span>-15 Min</span>
          <span>-7.5 Min</span>
          <span>{t('common.now')}</span>
        </div>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <span className="text-muted-foreground">{t('charts.olderThan10Min')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <span className="text-muted-foreground">{t('charts.last10Min')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LikesHistoryChart.displayName = 'LikesHistoryChart';
