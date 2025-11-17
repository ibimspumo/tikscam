'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MinuteStats {
  interval: number;
  likesPerSecond: number;
  timestamp: number;
}

interface LikesHistoryChartProps {
  minuteHistory: MinuteStats[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.likesPerSecond || 0;

    // Calculate time ago from timestamp
    const now = Date.now();
    const secondsAgo = Math.floor((now - data.timestamp) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const remainingSeconds = secondsAgo % 60;
    const timeAgoText = minutesAgo > 0
      ? `vor ${minutesAgo} Min ${remainingSeconds}s`
      : `vor ${remainingSeconds}s`;

    return (
      <div className="bg-popover border text-popover-foreground text-xs rounded py-2 px-3 shadow-xl">
        <div className="font-bold text-base">{value.toFixed(1)} L/s</div>
        <div className="text-muted-foreground text-[10px] mt-1">
          {timeAgoText}
        </div>
      </div>
    );
  }
  return null;
};

export const LikesHistoryChart = React.memo(({ minuteHistory = [] }: LikesHistoryChartProps) => {
  const { t } = useTranslation();

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    const now = Date.now();
    const cutoffTime = now - (15 * 60 * 1000); // 15 minutes ago
    const currentInterval = Math.floor(now / 15000);
    const totalIntervals = 60; // 15 minutes in 15-second intervals

    // Create a complete timeline with all 60 intervals
    const last15Minutes: MinuteStats[] = [];
    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;
      const timestamp = now - (i * 15000);

      // Find matching data point by timestamp (within 1 second tolerance)
      const existing = minuteHistory.find(m => Math.abs(m.timestamp - timestamp) < 1000);

      last15Minutes.push(existing || {
        interval,
        likesPerSecond: 0,
        timestamp,
      });
    }

    // Prepare data for Recharts with additional fields
    const rechartsData = last15Minutes.map((stat, index) => {
      const secondsAgo = (last15Minutes.length - 1 - index) * 15;
      const minutesAgo = Math.floor(secondsAgo / 60);
      const remainingSeconds = secondsAgo % 60;
      const timeAgoText = minutesAgo > 0
        ? `vor ${minutesAgo} Min ${remainingSeconds}s`
        : `vor ${remainingSeconds}s`;

      const isRecent = index >= 40; // Last 10 minutes (40 intervals)

      return {
        interval: stat.interval,
        likesPerSecond: stat.likesPerSecond,
        timestamp: stat.timestamp,
        timeAgo: timeAgoText,
        isRecent,
        // For X-axis: show only every 15th point (every ~4 minutes)
        label: index % 15 === 0 ? `-${Math.floor(secondsAgo / 60)}m` : '',
      };
    });

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

    return { rechartsData, average, currentValue, dataRangeMinutes };
  }, [minuteHistory]);

  const { rechartsData, average, currentValue, dataRangeMinutes } = chartData;

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
        {/* Recharts Bar Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={rechartsData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
            <Bar
              dataKey="likesPerSecond"
              radius={[4, 4, 0, 0]}
              fill="url(#colorGradient)"
              animationDuration={500}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(280, 100%, 70%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(200, 100%, 50%)" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-purple-500 to-blue-500"></div>
            <span className="text-muted-foreground">{t('charts.likesPerSecondLabel')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LikesHistoryChart.displayName = 'LikesHistoryChart';
