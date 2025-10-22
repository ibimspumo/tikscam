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

export function CombinedTimelineChart({
  viewerHistory = [],
  minuteHistory = [],
  followerHistory = [],
  diamondHistory = [],
  chatActivityHistory = [],
}: CombinedTimelineChartProps) {
  const now = Date.now();
  const currentInterval = Math.floor(now / 15000);
  const totalIntervals = 240; // 60 minutes

  // Fill in missing intervals
  const timeline: Array<{
    interval: number;
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

    const viewerData = viewerHistory.find(v => v.interval === interval);
    const likesData = minuteHistory.find(l => l.interval === interval);
    const followerData = followerHistory.find(f => f.interval === interval);
    const diamondData = diamondHistory.find(d => d.interval === interval);
    const chatData = chatActivityHistory.find(c => c.interval === interval);

    timeline.push({
      interval,
      timestamp,
      viewers: viewerData?.viewerCount || 0,
      likesPerSecond: likesData?.likesPerSecond || 0,
      newFollowers: followerData?.followerCount || 0,
      diamonds: diamondData?.diamondCount || 0,
      chatMessages: chatData?.messageCount || 0,
    });
  }

  // Calculate max values for scaling
  const maxViewers = Math.max(...timeline.map(t => t.viewers), 1);
  const maxLikesPerSecond = Math.max(...timeline.map(t => t.likesPerSecond), 1);
  const maxFollowers = Math.max(...timeline.map(t => t.newFollowers), 1);
  const maxDiamonds = Math.max(...timeline.map(t => t.diamonds), 1);
  const maxChat = Math.max(...timeline.map(t => t.chatMessages), 1);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📊</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Stream Timeline - Alle Metriken</h2>
        </div>
        <div className="text-xs text-gray-500">
          60 Minuten Verlauf
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative bg-gray-950/50 rounded-lg p-4" style={{ height: '400px' }}>
        {/* Grid Lines */}
        <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="border-t border-gray-800/50" />
          ))}
        </div>

        {/* Main Chart */}
        <div className="relative h-full flex items-end gap-[1px]">
          {timeline.map((point, index) => {
            const isRecent = index >= 200; // Last 10 minutes

            // Calculate heights as percentages
            const viewerHeight = (point.viewers / maxViewers) * 100;
            const likesHeight = (point.likesPerSecond / maxLikesPerSecond) * 100;
            const followerHeight = (point.newFollowers / maxFollowers) * 40; // Max 40% of chart
            const diamondHeight = (point.diamonds / maxDiamonds) * 40;
            const chatHeight = (point.chatMessages / maxChat) * 30;

            const secondsAgo = (timeline.length - 1 - index) * 15;
            const minutesAgo = Math.floor(secondsAgo / 60);
            const remainingSeconds = secondsAgo % 60;
            const timeAgoText = minutesAgo > 0
              ? `vor ${minutesAgo} Min ${remainingSeconds}s`
              : `vor ${remainingSeconds}s`;

            return (
              <div
                key={point.interval}
                className="relative flex-1 h-full group"
              >
                {/* Bars (background layer) */}
                <div className="absolute bottom-0 w-full h-full flex flex-col justify-end gap-[1px]">
                  {/* Chat Messages (gray bars) */}
                  {point.chatMessages > 0 && (
                    <div
                      className={`w-full ${isRecent ? 'bg-gray-500' : 'bg-gray-600'} rounded-t`}
                      style={{ height: `${chatHeight}%` }}
                    />
                  )}

                  {/* Diamonds (cyan bars) */}
                  {point.diamonds > 0 && (
                    <div
                      className={`w-full ${isRecent ? 'bg-cyan-500' : 'bg-cyan-600'} rounded-t`}
                      style={{ height: `${diamondHeight}%` }}
                    />
                  )}

                  {/* New Followers (orange bars) */}
                  {point.newFollowers > 0 && (
                    <div
                      className={`w-full ${isRecent ? 'bg-orange-500' : 'bg-orange-600'} rounded-t`}
                      style={{ height: `${followerHeight}%` }}
                    />
                  )}
                </div>

                {/* Lines (foreground layer) */}
                {/* Viewers Line (blue) */}
                {index < timeline.length - 1 && point.viewers > 0 && (
                  <div
                    className="absolute w-[2px] bg-blue-400"
                    style={{
                      bottom: `${viewerHeight}%`,
                      height: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}

                {/* Likes/Second Line (pink) */}
                {index < timeline.length - 1 && point.likesPerSecond > 0 && (
                  <div
                    className="absolute w-[2px] bg-pink-400"
                    style={{
                      bottom: `${likesHeight}%`,
                      height: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                  <div className="bg-gray-800 border border-gray-700 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-xl">
                    <div className="font-bold text-gray-300 mb-1">{timeAgoText}</div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">👥</span>
                        <span>{point.viewers} Zuschauer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400">❤️</span>
                        <span>{point.likesPerSecond.toFixed(1)} Likes/s</span>
                      </div>
                      {point.newFollowers > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">➕</span>
                          <span>+{point.newFollowers} Follower</span>
                        </div>
                      )}
                      {point.diamonds > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400">💎</span>
                          <span>{point.diamonds} Diamonds</span>
                        </div>
                      )}
                      {point.chatMessages > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💬</span>
                          <span>{point.chatMessages} Nachrichten</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
        <span>-60 Min</span>
        <span>-30 Min</span>
        <span>Jetzt</span>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-[10px] sm:text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-gray-400">Zuschauer (Linie)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-400"></div>
          <span className="text-gray-400">Likes/s (Linie)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-gray-400">Neue Follower</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500"></div>
          <span className="text-gray-400">Diamonds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className="text-gray-400">Chat Messages</span>
        </div>
      </div>
    </div>
  );
}
