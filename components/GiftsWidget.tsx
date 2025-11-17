'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftItem {
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
  gifts: GiftItem[];
  totalDiamonds: number;
  className?: string;
}

export const GiftsWidget= React.memo(({ gifts, totalDiamonds, className }: GiftsWidgetProps) => {
  const recentGifts = useMemo(() => {
    return [...gifts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [gifts]);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Gifts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {totalDiamonds.toLocaleString('en-US')}💎
            </Badge>
            <Badge>{gifts.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {recentGifts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No gifts received yet
            </p>
          ) : (
            recentGifts.map((gift, idx) => (
              <div
                key={`${gift.timestamp}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {gift.giftImage ? (
                  <img
                    src={gift.giftImage}
                    alt={gift.gift}
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">
                      {gift.user}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(gift.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-foreground/80">
                      {gift.gift} x{gift.count}
                    </span>
                    {gift.diamondCount !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {gift.diamondCount}💎
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

GiftsWidget.displayName = 'GiftsWidget';
