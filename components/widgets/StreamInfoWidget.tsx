'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Heart, Users as UsersIcon, Eye } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface StreamInfoWidgetProps {
  roomInfo: any;
  username?: string;
  totalFollowers?: number;
  stats?: any;
}

export const StreamInfoWidget= React.memo(({ roomInfo, username, totalFollowers = 0, stats }: StreamInfoWidgetProps) => {
  const { t } = useTranslation();
  if (!roomInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t('streamInfo.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            {t('streamInfo.waiting')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const streamTitle = roomInfo.title || t('streamInfo.noTitle');
  const streamerName = roomInfo.owner?.displayName || roomInfo.owner?.nickname || username || 'Unknown';
  const followerCount = totalFollowers || roomInfo.owner?.followerCount || roomInfo.owner?.stats?.followerCount || 0;
  const totalUsers = roomInfo.viewerCount || roomInfo.totalViewers || roomInfo.totalUserCount || roomInfo.userCount || roomInfo.currentViewers || 0;
  const streamTotalLikes =
    roomInfo.likeCount ||
    roomInfo.liveRoomStats?.totalLikeCount ||
    roomInfo.stats?.totalLikeCount ||
    roomInfo.totalLikeCount ||
    0;

  const streamerAvatar =
    roomInfo.owner?.profilePicture?.url?.[0] ||
    roomInfo.owner?.avatarThumb ||
    roomInfo.owner?.avatarMedium ||
    roomInfo.owner?.avatarLarge ||
    roomInfo.owner?.avatar ||
    null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          {t('streamInfo.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streamer Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg border-border border bg-muted/50">
          {streamerAvatar ? (
            <img
              src={streamerAvatar}
              alt={streamerName}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold border-2 border-primary">
              {streamerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {streamerName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              @{username}
            </p>
          </div>
        </div>

        {/* Stream Title */}
        <div className="p-3 rounded-lg border-border border bg-card">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
            {t('streamInfo.streamTitle')}
          </p>
          <p className="text-sm font-medium">
            {streamTitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg border-border border bg-card text-center">
            <Heart className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              {t('streamInfo.likes')}
            </div>
            <div className="text-sm font-bold">
              {streamTotalLikes.toLocaleString('en-US')}
            </div>
          </div>
          <div className="p-2 rounded-lg border-border border bg-card text-center">
            <UsersIcon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              {t('streamInfo.followers')}
            </div>
            <div className="text-sm font-bold">
              {followerCount.toLocaleString('en-US')}
            </div>
          </div>
          <div className="p-2 rounded-lg border-border border bg-card text-center">
            <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">
              {t('streamInfo.viewers')}
            </div>
            <div className="text-sm font-bold">
              {totalUsers.toLocaleString('en-US')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StreamInfoWidget.displayName = 'StreamInfoWidget';
