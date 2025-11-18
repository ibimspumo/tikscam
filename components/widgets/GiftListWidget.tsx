'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Gift, Gem, ChevronDown, ChevronRight, ArrowUp, ArrowDown, BarChart2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface GiftType {
  id: number;
  name: string;
  diamondCount: number;
  icon?: string;
  image?: string;
  timesReceived: number;
}

interface GiftListWidgetProps {
  giftCatalog?: Map<number, GiftType>;
  availableGifts?: Map<number, GiftType>;
}

export const GiftListWidget= React.memo(({ giftCatalog, availableGifts }: GiftListWidgetProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'diamonds' | 'count'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const gifts = availableGifts || giftCatalog || new Map();

  const filteredAndSortedGifts = useMemo(() => {
    let giftArray = Array.from(gifts.values());

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      giftArray = giftArray.filter((gift) =>
        gift.name?.toLowerCase().includes(term)
      );
    }

    // Sort
    giftArray.sort((a, b) => {
      if (sortBy === 'name') {
        const comparison = (a.name || '').localeCompare(b.name || '');
        return sortOrder === 'asc' ? comparison : -comparison;
      } else if (sortBy === 'diamonds') {
        const comparison = (a.diamondCount || 0) - (b.diamondCount || 0);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else { // count
        const comparison = (a.timesReceived || 0) - (b.timesReceived || 0);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return giftArray;
  }, [gifts, searchTerm, sortBy, sortOrder]);

  const toggleSort = (newSortBy: 'name' | 'diamonds' | 'count') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'name' ? 'asc' : 'desc');
    }
  };

  const totalGiftsReceived = Array.from(gifts.values()).reduce((sum, gift) => sum + gift.timesReceived, 0);

  return (
    <Card className="border-purple-500/50">
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-500" />
              Gift Catalog
            </CardTitle>
            {gifts.size > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {gifts.size} Types
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {totalGiftsReceived} Received
                </Badge>
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          {gifts.size === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No gifts received yet
            </div>
          ) : (
            <>
              {/* Search and Sort Controls */}
              <div className="space-y-2">
                {/* Search */}
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search gifts..."
                  className="w-full"
                />

                {/* Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSort('name')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      sortBy === 'name'
                        ? 'bg-purple-600 text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Name
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSort('diamonds')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      sortBy === 'diamonds'
                        ? 'bg-purple-600 text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Gem className="h-3 w-3" />
                    {sortBy === 'diamonds' && (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSort('count')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                      sortBy === 'count'
                        ? 'bg-purple-600 text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <BarChart2 className="h-3 w-3" />
                    {sortBy === 'count' && (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Gift Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredAndSortedGifts.map((gift) => {
                  const imageUrl = gift.icon || gift.image;

                  return (
                    <div
                      key={gift.id}
                      className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-2 border border-purple-800/50 hover:border-purple-600/70 transition-all"
                    >
                      {/* Gift Image */}
                      <div className="aspect-square bg-muted rounded-lg mb-1.5 flex items-center justify-center overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={gift.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Gift className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Gift Name */}
                      <div className="text-[10px] sm:text-xs font-bold truncate text-center mb-1">
                        {gift.name}
                      </div>

                      {/* Diamond Value */}
                      <div className="flex items-center justify-center gap-1 bg-purple-900/30 rounded px-1.5 py-0.5 mb-1">
                        <Gem className="h-3 w-3 text-purple-400" />
                        <span className="text-[10px] sm:text-xs font-bold text-purple-400">
                          {gift.diamondCount?.toLocaleString('en-US') || 0}
                        </span>
                      </div>

                      {/* Times Received */}
                      <div className="flex items-center justify-center gap-1 bg-blue-900/30 rounded px-1.5 py-0.5">
                        <BarChart2 className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] sm:text-xs font-bold text-blue-400">
                          {gift.timesReceived}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedGifts.length === 0 && searchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  {t('search.noResultsFor')} &quot;{searchTerm}&quot;
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
});

GiftListWidget.displayName = 'GiftListWidget';
