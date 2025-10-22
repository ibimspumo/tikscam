import { useState } from 'react';

interface DebugWidgetProps {
  roomInfo: any;
}

export function DebugWidget({ roomInfo }: DebugWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!roomInfo) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-yellow-800/50 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🔍</span>
          <h2 className="text-base sm:text-lg font-bold text-white">Debug: Room Info</h2>
        </div>
        <span className="text-gray-500 text-sm">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-3">
          <pre className="text-[10px] sm:text-xs bg-black text-green-400 p-3 sm:p-4 rounded overflow-auto max-h-64 sm:max-h-96">
            {JSON.stringify(roomInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
