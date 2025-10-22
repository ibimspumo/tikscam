'use client';

import { useEffect, useRef } from 'react';

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

interface GiftsFeedProps {
  gifts: Gift[];
}

export function GiftsFeed({ gifts }: GiftsFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest gift (left side)
  useEffect(() => {
    if (scrollRef.current && gifts.length > 0) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [gifts.length]);

  if (gifts.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
          <span className="text-xl sm:text-2xl">🎁</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Live Geschenke Feed</h2>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          Warte auf Geschenke...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">🎁</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Live Geschenke Feed</h2>
        <span className="text-xs text-gray-500 ml-auto">
          {gifts.length} Geschenke
        </span>
      </div>

      {/* Horizontal Scrollable Feed */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {gifts.slice().reverse().slice(0, 50).map((gift, index) => {
          const giftImageUrl = gift.giftIcon || gift.giftImage;
          const totalDiamonds = (gift.diamondCount || 0) * gift.count;
          const timeAgo = Date.now() - gift.timestamp;
          const secondsAgo = Math.floor(timeAgo / 1000);

          let timeText = '';
          if (secondsAgo < 60) {
            timeText = `${secondsAgo}s`;
          } else if (secondsAgo < 3600) {
            timeText = `${Math.floor(secondsAgo / 60)}m`;
          } else {
            timeText = `${Math.floor(secondsAgo / 3600)}h`;
          }

          return (
            <div
              key={`${gift.timestamp}-${index}`}
              className="flex-shrink-0 w-[200px] bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-800/50 p-3 hover:border-purple-600/70 transition-all"
            >
              {/* Header: User + Time */}
              <div className="flex items-center gap-2 mb-2">
                {gift.avatar ? (
                  <img
                    src={gift.avatar}
                    alt={gift.user}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-[10px]">
                    {gift.user.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-purple-400 truncate">
                    {gift.user}
                  </div>
                </div>
                <span className="text-[9px] text-gray-600 flex-shrink-0">
                  {timeText}
                </span>
              </div>

              {/* Gift Image */}
              <div className="aspect-square bg-gray-800/50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
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
                  <span className="text-4xl">🎁</span>
                )}
              </div>

              {/* Gift Name */}
              <div className="text-[11px] font-bold text-white text-center mb-1 truncate">
                {gift.count > 1 ? `${gift.count}x ` : ''}
                {gift.gift}
              </div>

              {/* Diamond Value */}
              {totalDiamonds > 0 && (
                <div className="flex items-center justify-center gap-1 bg-cyan-900/30 rounded px-2 py-1">
                  <span className="text-[10px]">💎</span>
                  <span className="text-[11px] font-bold text-cyan-400">
                    {totalDiamonds.toLocaleString('de-DE')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
