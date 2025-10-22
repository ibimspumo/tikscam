import { useMemo } from 'react';

interface StreamEvent {
  type: string;
  data: any;
  timestamp: number;
}

export function useStreamStats(events: StreamEvent[]) {
  const stats = useMemo(() => {
    let totalLikes = 0;
    let streamTotalLikes = 0; // Total likes from room stats
    let totalGifts = 0;
    let viewerCount = 0;
    let totalDiamonds = 0;
    let followCount = 0;
    const chatMessages: Array<{ user: string; message: string; timestamp: number; avatar?: string }> = [];
    const gifts: Array<{ user: string; gift: string; count: number; timestamp: number; avatar?: string }> = [];
    const joins: Array<{ user: string; timestamp: number }> = [];
    const follows: Array<{ user: string; timestamp: number }> = [];

    // Keep room info persistent
    let roomInfo: any = null;

    events.forEach((event) => {
      const messages = event.data.messages || [event.data];

      messages.forEach((msg: any) => {
        const data = msg.data || msg;
        const type = msg.type || event.type;

        // Room info - keep the most recent
        if (data.roomInfo || data.room) {
          roomInfo = data.roomInfo || data.room;
          viewerCount = roomInfo.userCount || roomInfo.viewerCount || viewerCount;
          streamTotalLikes = roomInfo.liveRoomStats?.totalLikeCount || roomInfo.stats?.totalLikeCount || streamTotalLikes;
        }

        // Also check top-level for room stats
        if (event.data.roomInfo) {
          roomInfo = event.data.roomInfo;
          viewerCount = roomInfo.userCount || roomInfo.viewerCount || viewerCount;
          streamTotalLikes = roomInfo.liveRoomStats?.totalLikeCount || roomInfo.stats?.totalLikeCount || streamTotalLikes;
        }

        // Chat messages
        if (type === 'WebcastChatMessage' || data.comment) {
          const user = data.uniqueId || data.user?.uniqueId || data.nickname || 'Anonymous';
          const message = data.comment || data.message || '';
          const avatar = data.user?.avatarThumb || data.user?.profilePictureUrl || data.profilePictureUrl || null;
          if (message) {
            chatMessages.push({
              user,
              message,
              avatar,
              timestamp: event.timestamp,
            });
          }
        }

        // Gifts
        if (type === 'WebcastGiftMessage' || data.giftName || data.gift) {
          const user = data.uniqueId || data.user?.uniqueId || data.nickname || 'Anonymous';
          const giftName = data.giftName || data.gift?.name || 'Geschenk';
          const count = data.repeatCount || data.count || 1;
          const diamonds = (data.gift?.diamondCount || 0) * count;
          const avatar = data.user?.avatarThumb || data.user?.profilePictureUrl || data.profilePictureUrl || null;

          totalGifts += count;
          totalDiamonds += diamonds;

          gifts.push({
            user,
            gift: giftName,
            count,
            avatar,
            timestamp: event.timestamp,
          });
        }

        // Likes
        if (type === 'WebcastLikeMessage' || data.likeCount) {
          totalLikes += data.likeCount || data.count || 1;
        }

        // Social (Follow/Share)
        if (type === 'WebcastSocialMessage') {
          if (data.action === 1 || data.followRole !== undefined) {
            // Follow
            followCount++;
            follows.push({
              user: data.uniqueId || data.user?.uniqueId || 'User',
              timestamp: event.timestamp,
            });
          }
        }

        // Member joins
        if (type === 'WebcastMemberMessage' && data.uniqueId) {
          joins.push({
            user: data.uniqueId,
            timestamp: event.timestamp,
          });
        }

        // Room stats updates
        if (data.viewerCount !== undefined) {
          viewerCount = data.viewerCount;
        }
        if (data.totalViewerCount !== undefined) {
          viewerCount = data.totalViewerCount;
        }
      });
    });

    return {
      totalLikes,
      streamTotalLikes,
      totalGifts,
      totalDiamonds,
      viewerCount,
      followCount,
      roomInfo,
      chatMessages: chatMessages.slice(-50), // Last 50 messages
      gifts: gifts.slice(-20), // Last 20 gifts
      joins: joins.slice(-20), // Last 20 joins
      follows: follows.slice(-20), // Last 20 follows
    };
  }, [events]);

  return stats;
}
