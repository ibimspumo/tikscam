'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, UserPlus, Users } from 'lucide-react';

interface ActivityWidgetProps {
  joins: Array<{ user: string; timestamp: number }>;
  follows: Array<{ user: string; timestamp: number }>;
}

export const ActivityWidget= React.memo(({ joins, follows }: ActivityWidgetProps) => {
  const activities = useMemo(() => {
    return [
      ...joins.map(j => ({ ...j, type: 'join' as const })),
      ...follows.map(f => ({ ...f, type: 'follow' as const })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  }, [joins, follows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet...
            </p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={`${activity.timestamp}-${index}`}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                {activity.type === 'follow' ? (
                  <UserPlus className="h-4 w-4 text-orange-500 flex-shrink-0" />
                ) : (
                  <Users className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-sm ${
                    activity.type === 'follow' ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {activity.user}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {activity.type === 'follow' ? 'followed' : 'joined'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ActivityWidget.displayName = 'ActivityWidget';
