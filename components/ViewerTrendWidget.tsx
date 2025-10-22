'use client';

/**
 * ViewerTrendWidget - Shows viewer trend instead of retention
 * (We don't have leave events, so we can't calculate retention)
 */

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

export function ViewerTrendWidget({
  viewerHistory = [],
  peakViewers = 0,
  currentViewers = 0,
}: ViewerTrendWidgetProps) {
  // Calculate average viewers from actual data
  const actualData = viewerHistory.filter(v => v.viewerCount > 0);
  const avgViewers = actualData.length > 0
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

  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendPercent = 0;

  if (previousAvg > 0) {
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    trendPercent = Math.abs(change);

    if (change > 5) trend = 'up';
    else if (change < -5) trend = 'down';
  }

  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  const trendText = trend === 'up' ? 'Steigend' : trend === 'down' ? 'Fallend' : 'Stabil';

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">{trendIcon}</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Zuschauer-Trend</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Current */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Aktuell
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {currentViewers.toLocaleString('de-DE')}
          </div>
        </div>

        {/* Peak */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Peak
          </div>
          <div className="text-2xl font-bold text-green-400">
            {peakViewers.toLocaleString('de-DE')}
          </div>
        </div>

        {/* Average */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Durchschnitt
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {avgViewers.toLocaleString('de-DE')}
          </div>
        </div>

        {/* Trend */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Trend (5min)
          </div>
          <div className={`text-xl font-bold ${trendColor} flex items-center gap-1`}>
            {trendIcon} {trendText}
            {trendPercent > 0 && (
              <span className="text-sm">
                ({trendPercent.toFixed(0)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wide">
          Verlauf (15 Min)
        </div>
        <div className="h-12 flex items-end gap-[1px]">
          {viewerHistory.slice(-60).map((stat, index) => {
            const maxInView = Math.max(...viewerHistory.slice(-60).map(v => v.viewerCount), 1);
            const heightPercent = (stat.viewerCount / maxInView) * 100;

            return (
              <div
                key={stat.interval}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-700 rounded-t"
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
