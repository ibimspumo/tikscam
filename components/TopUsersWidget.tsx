'use client';

/**
 * TopUsersWidget - Shows top users in various categories
 * - Top Gifters (by diamonds)
 * - Top Chatters (by message count)
 * - Most Active (combined score)
 */

interface UserStats {
  userId: string;
  username: string;
  avatar?: string;
  totalDiamonds: number;
  totalGifts: number;
  chatMessages: number;
  firstSeen: number;
  lastSeen: number;
}

interface TopUsersWidgetProps {
  userStats: Map<string, UserStats>;
}

export function TopUsersWidget({ userStats }: TopUsersWidgetProps) {
  // Convert Map to Array for sorting
  const users = Array.from(userStats.values());

  // Top 5 Gifters (by diamonds)
  const topGifters = users
    .filter(u => u.totalDiamonds > 0)
    .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
    .slice(0, 5);

  // Top 5 Chatters (by messages)
  const topChatters = users
    .filter(u => u.chatMessages > 0)
    .sort((a, b) => b.chatMessages - a.chatMessages)
    .slice(0, 5);

  // Top 3 Most Active (combined score: diamonds/100 + messages)
  const mostActive = users
    .map(u => ({
      ...u,
      activityScore: (u.totalDiamonds / 100) + u.chatMessages,
    }))
    .filter(u => u.activityScore > 0)
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 3);

  if (users.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
          <span className="text-xl sm:text-2xl">🏆</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Top User</h2>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          Warte auf Aktivität...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">🏆</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Top User</h2>
        <span className="text-xs text-gray-500 ml-auto">
          {users.length} User
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Gifters */}
        <div>
          <h3 className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide flex items-center gap-1">
            <span>💎</span> Top Gifters
          </h3>
          {topGifters.length === 0 ? (
            <div className="text-center py-4 text-gray-600 text-xs">
              Noch keine Geschenke
            </div>
          ) : (
            <div className="space-y-1.5">
              {topGifters.map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-5 h-5 flex items-center justify-center bg-cyan-600 text-white rounded-full text-[10px] font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cyan-700 flex items-center justify-center text-white font-bold flex-shrink-0 text-[10px]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-200 flex-1 truncate">
                    {user.username}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 flex-shrink-0">
                    💎 {user.totalDiamonds.toLocaleString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Chatters */}
        <div>
          <h3 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide flex items-center gap-1">
            <span>💬</span> Top Chatters
          </h3>
          {topChatters.length === 0 ? (
            <div className="text-center py-4 text-gray-600 text-xs">
              Noch keine Chat Messages
            </div>
          ) : (
            <div className="space-y-1.5">
              {topChatters.map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full text-[10px] font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold flex-shrink-0 text-[10px]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-gray-200 flex-1 truncate">
                    {user.username}
                  </span>
                  <span className="text-[10px] font-bold text-purple-400 flex-shrink-0">
                    {user.chatMessages} 💬
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Active */}
        <div>
          <h3 className="text-xs font-semibold text-yellow-400 mb-2 uppercase tracking-wide flex items-center gap-1">
            <span>⚡</span> Most Active
          </h3>
          {mostActive.length === 0 ? (
            <div className="text-center py-4 text-gray-600 text-xs">
              Noch keine Aktivität
            </div>
          ) : (
            <div className="space-y-1.5">
              {mostActive.map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={user.userId}
                    className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-lg flex-shrink-0">
                      {medals[index] || '🏅'}
                    </div>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-yellow-700 flex items-center justify-center text-white font-bold flex-shrink-0 text-[10px]">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-200 truncate">
                        {user.username}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        💎 {user.totalDiamonds.toLocaleString('de-DE')} · 💬 {user.chatMessages}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
