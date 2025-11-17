'use client';

/**
 * CombinedTimelineChart - THE HIGHLIGHT
 * Shows multiple metrics combined in one timeline:
 * - Viewers (line, blue)
 * - Likes/Second (line, pink)
 * - New Followers (bars, orange)
 * - Diamonds (bars, cyan)
 * - Chat Messages (bars, gray)
 *
 * All on the same X-axis (15-second intervals over 60 minutes)
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart as LineChartIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IntervalStats {
  interval: number;
  viewerCount: number;
  followerCount: number;
  diamondCount: number;
  timestamp: number;
}

interface MinuteStats {
  interval: number;
  likesPerSecond: number;
  timestamp: number;
}

interface ChatActivityStats {
  interval: number;
  messageCount: number;
  timestamp: number;
}

interface CombinedTimelineChartProps {
  viewerHistory: IntervalStats[];
  minuteHistory: MinuteStats[];
  followerHistory: IntervalStats[];
  diamondHistory: IntervalStats[];
  chatActivityHistory: ChatActivityStats[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    // Calculate time ago from timestamp
    const now = Date.now();
    const secondsAgo = Math.floor((now - data.timestamp) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const remainingSeconds = secondsAgo % 60;
    const timeAgoText = minutesAgo > 0
      ? `vor ${minutesAgo} Min ${remainingSeconds}s`
      : `vor ${remainingSeconds}s`;

    return (
      <div className="bg-popover border text-popover-foreground text-xs rounded py-2 px-3 shadow-xl max-w-xs">
        <div className="font-bold text-muted-foreground mb-2">{timeAgoText}</div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-blue-400">👥 Viewers:</span>
            <span className="font-semibold">{data.viewers.toLocaleString('en-US')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-pink-400">❤️ Likes/s:</span>
            <span className="font-semibold">{data.likesPerSecond.toFixed(1)}</span>
          </div>
          {data.newFollowers > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-orange-400">➕ Followers:</span>
              <span className="font-semibold">+{data.newFollowers}</span>
            </div>
          )}
          {data.diamonds > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-cyan-400">💎 Diamonds:</span>
              <span className="font-semibold">{data.diamonds}</span>
            </div>
          )}
          {data.chatMessages > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400">💬 Messages:</span>
              <span className="font-semibold">{data.chatMessages}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const CombinedTimelineChart = React.memo(({
  viewerHistory = [],
  minuteHistory = [],
  followerHistory = [],
  diamondHistory = [],
  chatActivityHistory = [],
}: CombinedTimelineChartProps) => {
  const { t } = useTranslation();

  // Memoize expensive calculations
  const chartData = useMemo(() => {
    const now = Date.now();
    const currentInterval = Math.floor(now / 15000);
    const totalIntervals = 240; // 60 minutes in 15-second intervals

    // Create a complete timeline with all intervals
    const timeline: Array<{
      timestamp: number;
      viewers: number;
      likesPerSecond: number;
      newFollowers: number;
      diamonds: number;
      chatMessages: number;
    }> = [];

    for (let i = totalIntervals - 1; i >= 0; i--) {
      const interval = currentInterval - i;
      const timestamp = now - (i * 15000);

      // Find matching data points by timestamp (within 1 second tolerance)
      const viewerData = viewerHistory.find(v => Math.abs(v.timestamp - timestamp) < 1000);
      const likesData = minuteHistory.find(l => Math.abs(l.timestamp - timestamp) < 1000);
      const followerData = followerHistory.find(f => Math.abs(f.timestamp - timestamp) < 1000);
      const diamondData = diamondHistory.find(d => Math.abs(d.timestamp - timestamp) < 1000);
      const chatData = chatActivityHistory.find(c => Math.abs(c.timestamp - timestamp) < 1000);

      timeline.push({
        timestamp,
        viewers: viewerData?.viewerCount || 0,
        likesPerSecond: likesData?.likesPerSecond || 0,
        newFollowers: followerData?.followerCount || 0,
        diamonds: diamondData?.diamondCount || 0,
        chatMessages: chatData?.messageCount || 0,
      });
    }

    // Prepare data for Recharts
    const rechartsData = timeline.map((point, index) => {
      const secondsAgo = Math.floor((now - point.timestamp) / 1000);
      const minutesAgo = Math.floor(secondsAgo / 60);

      return {
        ...point,
        label: index % 20 === 0 ? `-${minutesAgo}m` : '', // Show label every 20 points
      };
    });

    return { rechartsData };
  }, [viewerHistory, minuteHistory, followerHistory, diamondHistory, chatActivityHistory]);

  const { rechartsData } = chartData;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            {t('charts.combinedTimelineTitle')}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {t('common.duration60Min')}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Recharts Combined Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={rechartsData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Bars (background layer) */}
            <Bar
              yAxisId="right"
              dataKey="chatMessages"
              fill="hsl(220, 9%, 46%)"
              opacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="diamonds"
              fill="hsl(189, 94%, 43%)"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="newFollowers"
              fill="hsl(25, 95%, 53%)"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
            />

            {/* Lines (foreground layer) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="viewers"
              stroke="hsl(200, 100%, 50%)"
              strokeWidth={2}
              dot={false}
              animationDuration={500}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="likesPerSecond"
              stroke="hsl(330, 100%, 71%)"
              strokeWidth={2}
              dot={false}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-muted-foreground">{t('charts.viewersLine')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <span className="text-muted-foreground">{t('charts.likesPerSecondLine')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-muted-foreground">{t('charts.newFollowers')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-500"></div>
            <span className="text-muted-foreground">Diamonds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500"></div>
            <span className="text-muted-foreground">Chat Messages</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CombinedTimelineChart.displayName = 'CombinedTimelineChart';
