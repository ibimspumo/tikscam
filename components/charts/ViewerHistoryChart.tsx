'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface IntervalStats {
  interval: number;
  viewerCount: number;
  followerCount: number;
  diamondCount: number;
  timestamp: number;
}

interface ViewerHistoryChartProps {
  viewerHistory: IntervalStats[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.viewerCount || 0;

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
        <div className="font-bold text-base">{value.toLocaleString('en-US')}</div>
        <div className="text-muted-foreground text-[10px] mt-1">
          {timeAgoText}
        </div>
      </div>
    );
  }
  return null;
};

export const ViewerHistoryChart = React.memo(({ viewerHistory = [] }: ViewerHistoryChartProps) => {
  const { t } = useTranslation();

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    const totalIntervals = 60; // 15 minutes in 15-second intervals

    // Use the most recent data point's interval as reference, or current time
    const latestData = viewerHistory.length > 0
      ? viewerHistory[viewerHistory.length - 1]
      : null;

    const currentInterval = latestData
      ? latestData.interval
      : Math.floor(Date.now() / 15000);

    // Create a complete timeline with all 60 intervals
    const last15Minutes: IntervalStats[] = [];
    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;

      // Find matching data point by interval number (exact match)
      const existing = viewerHistory.find(m => m.interval === interval);

      last15Minutes.push(existing || {
        interval,
        viewerCount: 0,
        followerCount: 0,
        diamondCount: 0,
        timestamp: existing?.timestamp || Date.now() - (i * 15000),
      });
    }

    // Prepare data for Recharts
    const rechartsData = last15Minutes.map((stat, index) => {
      const secondsAgo = (last15Minutes.length - 1 - index) * 15;
      const timeAgoText = secondsAgo > 60
        ? `vor ${Math.floor(secondsAgo / 60)} Min`
        : `vor ${secondsAgo}s`;

      return {
        ...stat,
        timeAgo: timeAgoText,
        label: index % 15 === 0 ? `-${Math.floor(secondsAgo / 60)}m` : '',
      };
    });

    // Calculate statistics
    const actualData = last15Minutes.filter(m => m.viewerCount > 0);
    const average = actualData.length > 0
      ? actualData.reduce((sum, m) => sum + m.viewerCount, 0) / actualData.length
      : 0;

    const currentValue = last15Minutes[last15Minutes.length - 1]?.viewerCount || 0;
    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { rechartsData, average, currentValue, dataRangeMinutes };
  }, [viewerHistory]);

  const { rechartsData, average, currentValue, dataRangeMinutes } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('charts.viewerHistoryTitle')}
          </CardTitle>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('common.current')}</div>
              <div className="text-sm sm:text-base font-bold text-blue-500">
                {currentValue.toLocaleString('en-US')}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('common.average')} ({dataRangeMinutes}min)</div>
              <div className="text-sm sm:text-base font-bold text-green-500">
                {Math.round(average).toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Recharts Area Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="viewerCount"
              stroke="hsl(200, 100%, 50%)"
              fill="url(#viewerGradient)"
              strokeWidth={2}
              animationDuration={500}
            />
            <defs>
              <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(220, 100%, 60%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-cyan-500 to-blue-600"></div>
            <span className="text-muted-foreground">{t('charts.viewersLabel')} (letzte 15 Min)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ViewerHistoryChart.displayName = 'ViewerHistoryChart';
