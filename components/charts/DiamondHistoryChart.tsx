'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from 'lucide-react';
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
} from 'recharts';

interface IntervalStats {
  interval: number;
  viewerCount: number;
  followerCount: number;
  diamondCount: number;
  timestamp: number;
}

interface DiamondHistoryChartProps {
  diamondHistory: IntervalStats[];
}

// Tooltip removed due to Recharts + React 19 caching bug

export const DiamondHistoryChart= React.memo(({ diamondHistory = [] }: DiamondHistoryChartProps) => {
  const { t } = useTranslation();

  // Use shared timeline hook
  const last15Minutes = useChartTimeline({
    history: diamondHistory,
    totalIntervals: CHART_INTERVALS.FIFTEEN_MIN,
    defaultValue: defaultValues.diamond,
  });

  // Memoize expensive calculations
  const chartData = useMemo(() => {

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
    const actualData = last15Minutes.filter(m => m.diamondCount > 0);
    const total = actualData.reduce((sum, m) => sum + m.diamondCount, 0);

    const currentValue = last15Minutes[last15Minutes.length - 1]?.diamondCount || 0;

    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { rechartsData, total, currentValue, dataRangeMinutes };
  }, [last15Minutes]);

  const { rechartsData, total, currentValue, dataRangeMinutes } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gem className="h-4 w-4" />
            {t('charts.diamondHistoryTitle')}
          </CardTitle>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('charts.lastInterval')}</div>
              <div className="text-sm sm:text-base font-bold text-cyan-500">
                {currentValue.toLocaleString('en-US')}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('charts.total')} ({dataRangeMinutes}min)</div>
              <div className="text-sm sm:text-base font-bold text-purple-500">
                {total.toLocaleString('en-US')}
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
            />
            <Bar
              dataKey="diamondCount"
              radius={[4, 4, 0, 0]}
              fill="url(#diamondGradient)"
              animationDuration={500}
            />
            <defs>
              <linearGradient id="diamondGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(189, 94%, 43%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-cyan-500 to-blue-600"></div>
            <span className="text-muted-foreground">{t('charts.diamondsLabel')} (letzte 15 Min)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DiamondHistoryChart.displayName = 'DiamondHistoryChart';
