'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift as GiftIcon, Gem } from 'lucide-react';
import type { Gift } from '@/types';

interface GiftsFeedProps {
  gifts: Gift[];
}

export const GiftsFeedWidget = React.memo(({ gifts }: GiftsFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && gifts.length > 0) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [gifts.length]);

  if (gifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GiftIcon className="h-5 w-5" />
            Live Gifts Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Waiting for gifts...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GiftIcon className="h-5 w-5" />
            Live Gifts Feed
          </CardTitle>
          <Badge variant="secondary">{gifts.length} Gifts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
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
                className="flex-shrink-0 w-[200px] border-border border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  {gift.avatar ? (
                    <img
                      src={gift.avatar}
                      alt={gift.user}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 text-xs">
                      {gift.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {gift.user}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {timeText}
                  </span>
                </div>

                {/* Gift Image */}
                <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
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
                    <GiftIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* Gift Name */}
                <p className="text-xs font-semibold text-center mb-1 truncate">
                  {gift.count > 1 ? `${gift.count}x ` : ''}
                  {gift.gift}
                </p>

                {/* Diamonds */}
                {totalDiamonds > 0 && (
                  <div className="flex items-center justify-center gap-1 bg-muted rounded px-2 py-1">
                    <Gem className="h-3 w-3 text-cyan-500" />
                    <span className="text-xs font-semibold">
                      {totalDiamonds.toLocaleString('en-US')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

GiftsFeedWidget.displayName = 'GiftsFeedWidget';
