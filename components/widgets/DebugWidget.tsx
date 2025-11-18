'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug, ChevronDown, ChevronRight } from 'lucide-react';
import type { RoomInfo } from '@/types';

interface DebugWidgetProps {
  roomInfo: RoomInfo | null;
}

export const DebugWidget= React.memo(({ roomInfo }: DebugWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!roomInfo) {
    return null;
  }

  return (
    <Card className="border-yellow-500/50">
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-4 w-4 text-yellow-500" />
            Debug: Room Info
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <pre className="text-[10px] sm:text-xs bg-black text-green-400 p-3 sm:p-4 rounded-lg overflow-auto max-h-64 sm:max-h-96 border border-green-500/20">
            {JSON.stringify(roomInfo, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
});

DebugWidget.displayName = 'DebugWidget';
