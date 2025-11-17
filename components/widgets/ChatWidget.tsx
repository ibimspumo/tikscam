'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface ChatWidgetProps {
  messages: ChatMessage[];
  className?: string;
}

export const ChatWidget= React.memo(({ messages, className }: ChatWidgetProps) => {
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  }, [messages]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
          <Badge variant="secondary">{messages.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {sortedMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chat messages yet
            </p>
          ) : (
            sortedMessages.map((msg, idx) => (
              <div key={`${msg.timestamp}-${idx}`} className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                {msg.avatar ? (
                  <img
                    src={msg.avatar}
                    alt={msg.user}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {msg.user.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">
                      {msg.user}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ChatWidget.displayName = 'ChatWidget';
