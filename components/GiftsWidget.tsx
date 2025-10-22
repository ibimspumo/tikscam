import { memo, useMemo } from 'react';

interface Gift {
  user: string;
  gift: string;
  count: number;
  timestamp: number;
  avatar?: string;
  diamondCount?: number;
  giftIcon?: string;
  giftImage?: string;
}

interface GiftsWidgetProps {
  gifts: Gift[];
}

export const GiftsWidget = memo(function GiftsWidget({ gifts }: GiftsWidgetProps) {
  // Memoize expensive calculations
  const topGiftersList = useMemo(() => {
    const topGifters = gifts.reduce((acc, gift) => {
      const key = gift.user;
      if (!acc[key]) {
        acc[key] = { user: gift.user, total: 0 };
      }
      acc[key].total += gift.count;
      return acc;
    }, {} as Record<string, { user: string; total: number }>);

    return Object.values(topGifters)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [gifts]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">🎁</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Geschenke</h2>
      </div>

      {/* Top Gifters */}
      {topGiftersList.length > 0 && (
        <div className="mb-3">
          <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Top Schenker
          </h3>
          <div className="space-y-1.5">
            {topGiftersList.map((gifter, index) => (
              <div
                key={gifter.user}
                className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-purple-600 text-white rounded-full text-[10px] sm:text-xs font-bold">
                  {index + 1}
                </div>
                <span className="font-semibold text-purple-400 flex-1 text-xs sm:text-sm truncate">
                  {gifter.user}
                </span>
                <span className="text-xs text-gray-400">
                  {gifter.total} 🎁
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Gifts */}
      <div>
        <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          Letzte Geschenke
        </h3>
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {gifts.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Noch keine Geschenke...
            </div>
          ) : (
            gifts.slice().reverse().slice(0, 10).map((gift, index) => {
              const giftImageUrl = gift.giftIcon || gift.giftImage;
              const totalDiamonds = (gift.diamondCount || 0) * gift.count;

              return (
                <div
                  key={`${gift.timestamp}-${index}`}
                  className="flex gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50"
                >
                  {/* User Avatar */}
                  {gift.avatar ? (
                    <img
                      src={gift.avatar}
                      alt={gift.user}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                      {gift.user.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Gift Icon */}
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    {giftImageUrl ? (
                      <img
                        src={giftImageUrl}
                        alt={gift.gift}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-lg">🎁</span>
                    )}
                  </div>

                  {/* Gift Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-purple-400 text-xs truncate">
                        {gift.user}
                      </span>
                      <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2">
                        {new Date(gift.timestamp).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-gray-300 text-[10px] sm:text-xs truncate">
                        {gift.count > 1 ? `${gift.count}x ` : ''}
                        {gift.gift}
                      </p>
                      {totalDiamonds > 0 && (
                        <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-0.5 flex-shrink-0">
                          💎 {totalDiamonds.toLocaleString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
