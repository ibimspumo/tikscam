'use client';

import { useState } from 'react';
import { StreamManagerProvider, useStreamManager } from '@/contexts/StreamManagerContext';
import { StreamTabs } from '@/components/StreamTabs';
import { StreamMonitor } from '@/components/StreamMonitor';
import { AddStreamDialog } from '@/components/AddStreamDialog';

function HomeContent() {
  const { tabs, activeTabId, addStream } = useStreamManager();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddStream = (username: string) => {
    addStream(username);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Mobile-optimized container */}
      <div className="w-full max-w-[2000px] mx-auto">
        {/* Compact Mobile Header */}
        <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-lg border-b border-gray-800 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl">🎮</div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TikScam
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Live Stream Analytics
                </p>
              </div>
            </div>

            {/* Stream count badge */}
            {tabs.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-300">{tabs.length} Stream{tabs.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-3 sm:p-6">
          {/* No Streams - Welcome Screen */}
          {tabs.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 sm:p-12 text-center mt-8">
              <div className="text-6xl sm:text-8xl mb-6 animate-pulse">🎥</div>
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Willkommen bei TikScam
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 max-w-md mx-auto">
                Monitore TikTok Live-Streams in Echtzeit mit detaillierten Analytics
              </p>
              <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8 text-xs sm:text-sm text-purple-400 font-medium">
                <span>⚡</span>
                <span>24/7 Server-Monitoring</span>
                <span>•</span>
                <span>📊 Live Analytics</span>
              </div>
              <button
                onClick={() => setShowAddDialog(true)}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 text-sm sm:text-lg"
              >
                ➕ Stream hinzufügen
              </button>
            </div>
          ) : (
            <>
              {/* Stream Tabs */}
              <StreamTabs onAddStream={() => setShowAddDialog(true)} />

              {/* Active Stream Monitor */}
              {tabs.map((tab) => (
                <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }}>
                  <StreamMonitor username={tab.username} isActive={tab.id === activeTabId} />
                </div>
              ))}
            </>
          )}
        </main>

        {/* Add Stream Dialog */}
        <AddStreamDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddStream}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <StreamManagerProvider>
      <HomeContent />
    </StreamManagerProvider>
  );
}
