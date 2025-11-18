'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useChartTimeline, defaultValues } from '@/hooks/useChartTimeline';
import { CHART_INTERVALS } from '@/lib/constants';
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

// Tooltip removed due to Recharts + React 19 caching bug
// The values are already shown in the header (Current / Average)

export const LikesHistoryChart = ({ minuteHistory = [] }: LikesHistoryChartProps) => {
  const { t } = useTranslation();

  // Use shared timeline hook
  const last15Minutes = useChartTimeline({
    history: minuteHistory,
    totalIntervals: CHART_INTERVALS.FIFTEEN_MIN,
    defaultValue: defaultValues.likes,
  });

  // Memoize expensive calculations
  const chartData = useMemo(() => {

    // Prepare data for Recharts with additional fields
    const rechartsData = last15Minutes.map((stat, index) => {
      const secondsAgo = (last15Minutes.length - 1 - index) * 15;
      const minutesAgo = Math.floor(secondsAgo / 60);
      const remainingSeconds = secondsAgo % 60;
      const timeAgoText = minutesAgo > 0
        ? `vor ${minutesAgo} Min ${remainingSeconds}s`
        : `vor ${remainingSeconds}s`;

      const isRecent = index >= 40; // Last 10 minutes (40 intervals)

      const dataPoint = {
        interval: stat.interval,
        likesPerSecond: stat.likesPerSecond,
        timestamp: stat.timestamp,
        timeAgo: timeAgoText,
        isRecent,
        // For X-axis: show only every 15th point (every ~4 minutes)
        label: index % 15 === 0 ? `-${Math.floor(secondsAgo / 60)}m` : '',
      };


      return dataPoint;
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
  }, [last15Minutes]);

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
            <Bar
              dataKey="likesPerSecond"
              radius={[4, 4, 0, 0]}
              fill="url(#colorGradient)"
              isAnimationActive={false}
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
};

// Removed React.memo - causing tooltip issues
// LikesHistoryChart.displayName = 'LikesHistoryChart';
