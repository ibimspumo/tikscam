'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Users, Eye, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface IntervalStats {
  interval: number;
  viewerCount: number;
  followerCount: number;
  diamondCount: number;
  timestamp: number;
}

interface ViewerTrendWidgetProps {
  viewerHistory: IntervalStats[];
  peakViewers: number;
  currentViewers: number;
}

export const ViewerTrendWidget= React.memo(({
  viewerHistory = [],
  peakViewers = 0,
  currentViewers = 0,
}: ViewerTrendWidgetProps) => {
  const { t } = useTranslation();
  const { avgViewers, trend, trendPercent, trendColor } = useMemo(() => {
    // Calculate average viewers from actual data
    const actualData = viewerHistory.filter(v => v.viewerCount > 0);
    const avg = actualData.length > 0
      ? Math.round(actualData.reduce((sum, v) => sum + v.viewerCount, 0) / actualData.length)
      : 0;

    // Calculate trend: compare last 5 minutes vs previous 5 minutes
    const recentData = viewerHistory.slice(-20); // Last 5 minutes (20 * 15s)
    const previousData = viewerHistory.slice(-40, -20); // Previous 5 minutes

    const recentAvg = recentData.length > 0
      ? recentData.reduce((sum, v) => sum + v.viewerCount, 0) / recentData.length
      : 0;
    const previousAvg = previousData.length > 0
      ? previousData.reduce((sum, v) => sum + v.viewerCount, 0) / previousData.length
      : 0;

    let calculatedTrend: 'up' | 'down' | 'stable' = 'stable';
    let calculatedTrendPercent = 0;

    if (previousAvg > 0) {
      const change = ((recentAvg - previousAvg) / previousAvg) * 100;
      calculatedTrendPercent = Math.abs(change);

      if (change > 5) calculatedTrend = 'up';
      else if (change < -5) calculatedTrend = 'down';
    }

    const color = calculatedTrend === 'up'
      ? 'text-green-500'
      : calculatedTrend === 'down'
      ? 'text-red-500'
      : 'text-muted-foreground';

    return {
      avgViewers: avg,
      trend: calculatedTrend,
      trendPercent: calculatedTrendPercent,
      trendColor: color,
    };
  }, [viewerHistory]);

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendText = () => {
    if (trend === 'up') return 'Steigend';
    if (trend === 'down') return 'Fallend';
    return 'Stabil';
  };

  const TrendIcon = getTrendIcon();

  // Calculate sparkline data
  const sparklineData = useMemo(() => {
    const last60 = viewerHistory.slice(-60);
    const maxInView = Math.max(...last60.map(v => v.viewerCount), 1);

    return last60.map(stat => ({
      height: (stat.viewerCount / maxInView) * 100,
      interval: stat.interval,
    }));
  }, [viewerHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {t('viewerTrend.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current */}
          <div className="p-3 rounded-lg border-border border bg-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              {t('common.current')}
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {currentViewers.toLocaleString('en-US')}
            </div>
          </div>

          {/* Peak */}
          <div className="p-3 rounded-lg border-border border bg-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Peak
            </div>
            <div className="text-2xl font-bold text-green-500">
              {peakViewers.toLocaleString('en-US')}
            </div>
          </div>

          {/* Average */}
          <div className="p-3 rounded-lg border-border border bg-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              {t('common.average')}
            </div>
            <div className="text-2xl font-bold text-purple-500">
              {avgViewers.toLocaleString('en-US')}
            </div>
          </div>

          {/* Trend */}
          <div className="p-3 rounded-lg border-border border bg-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              Trend (5min)
            </div>
            <div className={`text-xl font-bold ${trendColor} flex items-center gap-1`}>
              <TrendIcon className="h-5 w-5" />
              {getTrendText()}
              {trendPercent > 0 && (
                <span className="text-sm">
                  ({trendPercent.toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini Sparkline */}
        <div className="pt-3 border-t">
          <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">
            Verlauf (15 Min)
          </div>
          <div className="h-12 flex items-end gap-[1px]">
            {sparklineData.map((data, index) => (
              <div
                key={data.interval}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-700 rounded-t transition-all"
                style={{ height: `${data.height}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ViewerTrendWidget.displayName = 'ViewerTrendWidget';
