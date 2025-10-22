'use client';

/**
 * StreamTabs Component
 *
 * Tab-Navigation für Multi-Stream Monitoring
 * - Zeigt alle aktiven Streams als Tabs
 * - Tab-Switching
 * - Close-Button pro Tab
 * - Add-Button für neue Streams
 */

import { useState } from 'react';
import { useStreamManager } from '@/contexts/StreamManagerContext';

interface StreamTabsProps {
  onAddStream?: () => void;
}

export function StreamTabs({ onAddStream }: StreamTabsProps) {
  const { tabs, activeTabId, switchTab, removeStream } = useStreamManager();

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeStream(tabId);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 mb-3 sm:mb-4 overflow-hidden">
      <div className="flex items-center gap-1 sm:gap-2 p-2 border-b border-gray-800 overflow-x-auto">
        {/* Stream Tabs */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={`group relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer text-xs sm:text-sm ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => switchTab(tab.id)}
            >
              {/* Live Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}

              {/* Username */}
              <span>@{tab.username}</span>

              {/* Close Button */}
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                className={`ml-0.5 sm:ml-1 rounded-full p-0.5 sm:p-1 transition-colors ${
                  isActive
                    ? 'hover:bg-purple-700'
                    : 'hover:bg-gray-600'
                }`}
                title="Stream schließen"
              >
                <svg
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add Stream Button */}
        <button
          onClick={onAddStream}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 text-gray-400 hover:bg-purple-900/30 hover:text-purple-400 transition-colors flex-shrink-0"
          title="Stream hinzufügen"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Tab Info */}
      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900/50 text-[10px] sm:text-xs text-gray-400">
        <span className="font-semibold">{tabs.length}</span> Stream{tabs.length !== 1 ? 's' : ''} aktiv
        {activeTabId && (
          <>
            {' • '}
            <span className="font-semibold">
              @{tabs.find(t => t.id === activeTabId)?.username}
            </span>
            {' wird angezeigt'}
          </>
        )}
      </div>
    </div>
  );
}
