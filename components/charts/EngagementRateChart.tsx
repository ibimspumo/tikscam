'use client';

/**
 * EngagementRateChart - Shows engagement rate (likes per viewer) over 15 minutes
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
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

interface EngagementStats {
  interval: number;
  engagementRate: number;
  timestamp: number;
}

interface EngagementRateChartProps {
  engagementHistory: EngagementStats[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.engagementRate || 0;

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
        <div className="font-bold text-base">{value.toFixed(2)} L/V</div>
        <div className="text-muted-foreground text-[10px] mt-1">
          {timeAgoText}
        </div>
      </div>
    );
  }
  return null;
};

export const EngagementRateChart= React.memo(({ engagementHistory = [] }: EngagementRateChartProps) => {
  const { t } = useTranslation();

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    const totalIntervals = 60; // 15 minutes in 15-second intervals

    // Use the most recent data point's interval as reference, or current time
    const latestData = engagementHistory.length > 0
      ? engagementHistory[engagementHistory.length - 1]
      : null;

    const currentInterval = latestData
      ? latestData.interval
      : Math.floor(Date.now() / 15000);

    // Create a complete timeline with all 60 intervals
    const last15Minutes: EngagementStats[] = [];
    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;

      // Find matching data point by interval number (exact match)
      const existing = engagementHistory.find(m => m.interval === interval);

      last15Minutes.push(existing || {
        interval,
        engagementRate: 0,
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
    const actualData = last15Minutes.filter(m => m.engagementRate > 0);
    const average = actualData.length > 0
      ? actualData.reduce((sum, m) => sum + m.engagementRate, 0) / actualData.length
      : 0;

    const currentValue = last15Minutes[last15Minutes.length - 1]?.engagementRate || 0;

    // Only calculate peak after minimum 30 seconds of data (2 intervals * 15s = 30s)
    const minIntervalsForPeak = 2;
    const peak = actualData.length >= minIntervalsForPeak
      ? Math.max(...actualData.map(m => m.engagementRate), 0)
      : 0;

    const dataRangeMinutes = actualData.length > 0
      ? Math.ceil((actualData.length * 15) / 60)
      : 0;

    return { rechartsData, average, currentValue, peak, dataRangeMinutes };
  }, [engagementHistory]);

  const { rechartsData, average, currentValue, peak, dataRangeMinutes } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('charts.engagementRateTitle')}
          </CardTitle>
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">{t('common.current')}</div>
              <div className="text-sm sm:text-base font-bold text-blue-500">
                {currentValue.toFixed(2)}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">Ø ({dataRangeMinutes}min)</div>
              <div className="text-sm sm:text-base font-bold text-purple-500">
                {average.toFixed(2)}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-muted-foreground">Peak</div>
              <div className="text-sm sm:text-base font-bold text-green-500">
                {peak.toFixed(2)}
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
              dataKey="engagementRate"
              stroke="hsl(260, 100%, 60%)"
              fill="url(#engagementGradient)"
              strokeWidth={2}
              animationDuration={500}
            />
            <defs>
              <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(260, 100%, 60%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>

        {/* Description */}
        <div className="mt-3 sm:mt-4 pt-3 border-t">
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            💡 <span className="font-semibold">{t('charts.engagementRate')}</span> = {t('charts.engagementRateFormula')}
            <br />
            {t('charts.engagementRateDescription')}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-b from-blue-600 to-purple-600"></div>
            <span className="text-muted-foreground">{t('charts.engagementRateLabel')} (letzte 15 Min)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

EngagementRateChart.displayName = 'EngagementRateChart';
