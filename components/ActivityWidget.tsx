import { memo, useMemo } from 'react';

interface ActivityWidgetProps {
  joins: Array<{ user: string; timestamp: number }>;
  follows: Array<{ user: string; timestamp: number }>;
}

export const ActivityWidget = memo(function ActivityWidget({ joins, follows }: ActivityWidgetProps) {
  // Memoize expensive calculations
  const activities = useMemo(() => {
    return [
      ...joins.map(j => ({ ...j, type: 'join' as const, icon: '👋', color: 'green' })),
      ...follows.map(f => ({ ...f, type: 'follow' as const, icon: '➕', color: 'orange' })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  }, [joins, follows]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">📊</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Aktivitäten</h2>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {activities.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
            Keine Aktivität...
          </div>
        ) : (
          activities.map((activity, index) => {
            const textColor = activity.type === 'follow'
              ? 'text-orange-400'
              : 'text-green-400';

            return (
              <div
                key={`${activity.timestamp}-${index}`}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center gap-2"
              >
                <span className="text-base sm:text-lg">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold ${textColor} text-xs sm:text-sm`}>
                    {activity.user}
                  </span>
                  <span className="text-gray-400 text-[10px] sm:text-xs ml-1">
                    {activity.type === 'follow' ? 'folgt' : 'beigetreten'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-600 flex-shrink-0">
                  {new Date(activity.timestamp).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
