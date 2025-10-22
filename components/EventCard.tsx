interface EventCardProps {
  event: {
    type: string;
    data: any;
    timestamp: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'chat':
      case 'comment':
        return '💬';
      case 'gift':
        return '🎁';
      case 'member':
      case 'join':
        return '👋';
      case 'like':
        return '❤️';
      case 'share':
      case 'social':
        return '🔄';
      case 'follow':
        return '➕';
      case 'emote':
        return '😊';
      case 'roomUser':
        return '👥';
      default:
        return '📢';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'chat':
      case 'comment':
        return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700';
      case 'gift':
        return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700';
      case 'member':
      case 'join':
        return 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700';
      case 'like':
        return 'border-pink-300 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-700';
      case 'share':
      case 'social':
      case 'follow':
        return 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  const formatEventContent = () => {
    const data = event.data;

    // Chat/Comment
    if (data.comment) {
      return (
        <div>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {data.uniqueId || data.nickname || 'User'}
          </span>
          <span className="text-gray-600 dark:text-gray-400">: </span>
          <span className="text-gray-800 dark:text-gray-200">{data.comment}</span>
        </div>
      );
    }

    // Gift
    if (data.giftName || data.gift) {
      const giftName = data.giftName || data.gift?.name || 'Gift';
      const count = data.repeatCount || data.count || 1;
      const user = data.uniqueId || data.nickname || 'User';
      return (
        <div>
          <span className="font-semibold text-purple-600 dark:text-purple-400">{user}</span>
          <span className="text-gray-600 dark:text-gray-400"> sent </span>
          <span className="font-semibold text-purple-800 dark:text-purple-300">
            {count}x {giftName}
          </span>
        </div>
      );
    }

    // Member Join
    if (data.uniqueId && (event.type === 'member' || event.type === 'join')) {
      return (
        <div>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {data.uniqueId}
          </span>
          <span className="text-gray-600 dark:text-gray-400"> joined the stream!</span>
        </div>
      );
    }

    // Follow/Share
    if (data.uniqueId && (event.type === 'follow' || event.type === 'share')) {
      const action = event.type === 'follow' ? 'followed' : 'shared';
      return (
        <div>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {data.uniqueId}
          </span>
          <span className="text-gray-600 dark:text-gray-400"> {action} the stream!</span>
        </div>
      );
    }

    // Room stats
    if (data.viewerCount !== undefined || data.totalViewerCount !== undefined) {
      return (
        <div className="text-gray-700 dark:text-gray-300">
          👥 Viewers: {data.viewerCount || data.totalViewerCount || 0}
        </div>
      );
    }

    // Raw data fallback
    return (
      <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto max-h-32">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getEventColor(event.type)} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEventIcon(event.type)}</span>
          <span className="font-semibold text-sm uppercase text-gray-600 dark:text-gray-400">
            {event.type}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(event.timestamp).toLocaleTimeString('de-DE')}
        </span>
      </div>
      {formatEventContent()}
    </div>
  );
}
