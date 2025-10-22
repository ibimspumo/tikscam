import { useState, useMemo } from 'react';

interface GiftType {
  id: number;
  name: string;
  diamondCount: number;
  icon?: string;
  image?: string;
  timesReceived: number;
}

interface GiftListWidgetProps {
  giftCatalog: Map<number, GiftType>;
}

export function GiftListWidget({ giftCatalog }: GiftListWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'diamonds' | 'count'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredAndSortedGifts = useMemo(() => {
    let giftArray = Array.from(giftCatalog.values());

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
  }, [giftCatalog, searchTerm, sortBy, sortOrder]);

  const toggleSort = (newSortBy: 'name' | 'diamonds' | 'count') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'name' ? 'asc' : 'desc');
    }
  };

  const totalGiftsReceived = Array.from(giftCatalog.values()).reduce((sum, gift) => sum + gift.timesReceived, 0);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-purple-800/50 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl sm:text-2xl">🎁</span>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Geschenke Katalog
          </h2>
          {giftCatalog.size > 0 && (
            <div className="flex gap-2">
              <span className="text-[10px] sm:text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                {giftCatalog.size} Typen
              </span>
              <span className="text-[10px] sm:text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                {totalGiftsReceived} erhalten
              </span>
            </div>
          )}
        </div>
        <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {giftCatalog.size === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Noch keine Geschenke empfangen
            </div>
          ) : (
            <>
              {/* Search and Sort Controls */}
              <div className="space-y-2">
                {/* Search */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Geschenk suchen..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                {/* Sort Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSort('name')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      sortBy === 'name'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => toggleSort('diamonds')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      sortBy === 'diamonds'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    💎 {sortBy === 'diamonds' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => toggleSort('count')}
                    className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      sortBy === 'count'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    # {sortBy === 'count' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                      <div className="aspect-square bg-gray-800/50 rounded-lg mb-1.5 flex items-center justify-center overflow-hidden">
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
                          <span className="text-2xl sm:text-3xl">🎁</span>
                        )}
                      </div>

                      {/* Gift Name */}
                      <div className="text-[10px] sm:text-xs font-bold text-white truncate text-center mb-1">
                        {gift.name}
                      </div>

                      {/* Diamond Value */}
                      <div className="flex items-center justify-center gap-1 bg-purple-900/30 rounded px-1.5 py-0.5 mb-1">
                        <span className="text-[10px]">💎</span>
                        <span className="text-[10px] sm:text-xs font-bold text-purple-400">
                          {gift.diamondCount?.toLocaleString('de-DE') || 0}
                        </span>
                      </div>

                      {/* Times Received */}
                      <div className="flex items-center justify-center gap-1 bg-blue-900/30 rounded px-1.5 py-0.5">
                        <span className="text-[10px]">📊</span>
                        <span className="text-[10px] sm:text-xs font-bold text-blue-400">
                          {gift.timesReceived}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedGifts.length === 0 && searchTerm && (
                <div className="text-center py-8 text-gray-400">
                  Keine Geschenke gefunden für "{searchTerm}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
