'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  BarChart,
  Bar,
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

interface FollowerHistoryChartProps {
  followerHistory: IntervalStats[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.followerCount || 0;

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
        <div className="font-bold text-base">+{value.toLocaleString('en-US')}</div>
        <div className="text-muted-foreground text-[10px] mt-1">
          {timeAgoText}
        </div>
      </div>
    );
  }
  return null;
};

export const FollowerHistoryChart= React.memo(({ followerHistory = [] }: FollowerHistoryChartProps) => {
  const { t } = useTranslation();

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    const now = Date.now();
    const cutoffTime = now - (15 * 60 * 1000); // 15 minutes ago

    // Use the ACTUAL data from followerHistory, filtered to last 15 minutes
    const recentData = followerHistory
      .filter(m => m.timestamp >= cutoffTime)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Use the actual data we have, or empty array if none
    const last15Minutes = recentData.length > 0 ? recentData : Array.from({ length: 60 }, (_, i) => ({
      interval: Math.floor(now / 15000) - (59 - i),
      viewerCount: 0,
      followerCount: 0,
      diamondCount: 0,
      timestamp: now - ((59 - i) * 15000),
    }));

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
    const actualData = last15Minutes.filter(m => m.followerCount > 0);
    const average = actualData.length > 0
      ? actualData.reduce((sum, m) => sum + m.followerCount, 0) / actualData.length
      : 0;

    const currentValue = last15Minutes[last15Minutes.length - 1]?.followerCount || 0;

    // Calculate total new followers (sum of all deltas)
    const totalNewFollowers = actualData.reduce((sum, m) => sum + m.followerCount, 0);

    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { rechartsData, average, currentValue, totalNewFollowers, dataRangeMinutes };
  }, [followerHistory]);

  const { rechartsData, average, currentValue, totalNewFollowers, dataRangeMinutes } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {t('charts.followerHistoryTitle')}
          </CardTitle>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('charts.lastInterval')}</div>
              <div className="text-sm sm:text-base font-bold text-orange-500">
                +{currentValue.toLocaleString('en-US')}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('charts.total')} ({dataRangeMinutes}min)</div>
              <div className="text-sm sm:text-base font-bold text-green-500">
                +{totalNewFollowers.toLocaleString('en-US')}
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
              tickFormatter={(value) => `+${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
            <Bar
              dataKey="followerCount"
              radius={[4, 4, 0, 0]}
              fill="url(#followerGradient)"
              animationDuration={500}
            />
            <defs>
              <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(45, 93%, 47%)" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-orange-500 to-yellow-600"></div>
            <span className="text-muted-foreground">{t('charts.newFollowersLabel')} (letzte 15 Min)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FollowerHistoryChart.displayName = 'FollowerHistoryChart';
