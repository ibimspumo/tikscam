import { memo } from 'react';

interface StatsWidgetProps {
  totalLikes: number;
  streamTotalLikes: number;
  totalGifts: number;
  totalDiamonds: number;
  viewerCount: number;
  followCount: number;
  likesPerSecond?: {
    last10s: number;
    last20s: number;
    last30s: number;
    last45s: number;
    last60s: number;
  };
}

export const StatsWidget = memo(function StatsWidget({ totalLikes, streamTotalLikes, totalGifts, totalDiamonds, viewerCount, followCount, likesPerSecond }: StatsWidgetProps) {
  const stats = [
    { icon: '👥', label: 'Zuschauer', value: viewerCount.toLocaleString('de-DE'), color: 'text-blue-400' },
    { icon: '❤️', label: 'Likes', value: (streamTotalLikes || totalLikes).toLocaleString('de-DE'), color: 'text-pink-400' },
    { icon: '🎁', label: 'Geschenke', value: totalGifts.toLocaleString('de-DE'), color: 'text-purple-400' },
    { icon: '💎', label: 'Diamanten', value: totalDiamonds.toLocaleString('de-DE'), color: 'text-cyan-400' },
    { icon: '➕', label: 'Follower', value: followCount.toLocaleString('de-DE'), color: 'text-orange-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4"
        >
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            {stat.icon} {stat.label}
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
});
