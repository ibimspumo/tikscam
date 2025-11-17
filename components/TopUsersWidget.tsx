'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, MessageSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className?: string;
}

export const TopUsersWidget= React.memo(({ userStats, className }: TopUsersWidgetProps) => {
  const topGifters = useMemo(() => {
    return Array.from(userStats.values())
      .filter(user => user.totalDiamonds > 0)
      .sort((a, b) => b.totalDiamonds - a.totalDiamonds)
      .slice(0, 10);
  }, [userStats]);

  const topChatters = useMemo(() => {
    return Array.from(userStats.values())
      .filter(user => user.chatMessages > 0)
      .sort((a, b) => b.chatMessages - a.chatMessages)
      .slice(0, 10);
  }, [userStats]);

  const mostActive = useMemo(() => {
    return Array.from(userStats.values())
      .sort((a, b) => {
        const scoreA = a.totalDiamonds * 2 + a.chatMessages;
        const scoreB = b.totalDiamonds * 2 + b.chatMessages;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [userStats]);

  const renderUserList = (users: UserStats[], type: 'gifter' | 'chatter' | 'active') => {
    if (users.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No data available yet
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((user, idx) => (
          <div
            key={user.userId}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
              {idx + 1}
            </div>

            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                {type === 'gifter' && (
                  <Badge variant="outline" className="text-xs">
                    {user.totalDiamonds.toLocaleString('en-US')}💎
                  </Badge>
                )}
                {type === 'chatter' && (
                  <Badge variant="outline" className="text-xs">
                    {user.chatMessages} Messages
                  </Badge>
                )}
                {type === 'active' && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      {user.totalDiamonds}💎
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.chatMessages} Chat
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gifters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gifters" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              Gifters
            </TabsTrigger>
            <TabsTrigger value="chatters" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chatters
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gifters" className="mt-4 max-h-[400px] overflow-y-auto">
            {renderUserList(topGifters, 'gifter')}
          </TabsContent>

          <TabsContent value="chatters" className="mt-4 max-h-[400px] overflow-y-auto">
            {renderUserList(topChatters, 'chatter')}
          </TabsContent>

          <TabsContent value="active" className="mt-4 max-h-[400px] overflow-y-auto">
            {renderUserList(mostActive, 'active')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

TopUsersWidget.displayName = 'TopUsersWidget';
