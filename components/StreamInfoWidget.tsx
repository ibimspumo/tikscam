interface StreamInfoWidgetProps {
  roomInfo: any;
  username: string;
  totalFollowers?: number;
}

export function StreamInfoWidget({ roomInfo, username, totalFollowers = 0 }: StreamInfoWidgetProps) {
  if (!roomInfo) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl sm:text-2xl">📺</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Stream Info</h2>
        </div>
        <div className="text-center py-6 text-gray-500 text-sm">
          Warte auf Stream-Informationen...
        </div>
      </div>
    );
  }

  const streamTitle = roomInfo.title || 'Kein Titel';
  const streamerName = roomInfo.owner?.displayName || roomInfo.owner?.nickname || username;
  const followerCount = totalFollowers || roomInfo.owner?.followerCount || roomInfo.owner?.stats?.followerCount || 0;

  // Use viewerCount from roomInfo (set from totalUser in roomUser events)
  const totalUsers = roomInfo.viewerCount || roomInfo.totalViewers || roomInfo.totalUserCount || roomInfo.userCount || roomInfo.currentViewers || 0;

  // Try multiple paths for total likes
  const streamTotalLikes =
    roomInfo.likeCount ||
    roomInfo.liveRoomStats?.totalLikeCount ||
    roomInfo.stats?.totalLikeCount ||
    roomInfo.totalLikeCount ||
    0;

  // Try multiple paths for avatar - prioritize profilePicture.url array
  const streamerAvatar =
    roomInfo.owner?.profilePicture?.url?.[0] ||
    roomInfo.owner?.avatarThumb ||
    roomInfo.owner?.avatarMedium ||
    roomInfo.owner?.avatarLarge ||
    roomInfo.owner?.avatar ||
    null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">📺</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Stream Info</h2>
      </div>

      <div className="space-y-3">
        {/* Streamer Info */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-800/50">
          {streamerAvatar ? (
            <img
              src={streamerAvatar}
              alt={streamerName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-purple-500">
              {streamerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-white truncate">
              {streamerName}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              @{username}
            </p>
          </div>
        </div>

        {/* Stream Title */}
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">
            Stream Titel
          </div>
          <p className="text-gray-200 text-xs sm:text-sm font-medium">
            {streamTitle}
          </p>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-pink-900/20 rounded-lg border border-pink-800/50">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
              💗 Likes
            </div>
            <div className="text-sm sm:text-base font-bold text-pink-400">
              {streamTotalLikes.toLocaleString('de-DE')}
            </div>
          </div>
          <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-800/50">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
              Follower
            </div>
            <div className="text-sm sm:text-base font-bold text-blue-400">
              {followerCount.toLocaleString('de-DE')}
            </div>
          </div>
          <div className="p-2 bg-green-900/20 rounded-lg border border-green-800/50">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
              Gesamt
            </div>
            <div className="text-sm sm:text-base font-bold text-green-400">
              {totalUsers.toLocaleString('de-DE')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
