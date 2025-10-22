'use client';

/**
 * StreamMonitor Component - Mobile First, Dark Mode Only
 *
 * Main Dashboard für einen einzelnen TikTok Stream
 * - Automatische Verbindung beim Mount
 * - Alle Widgets für diesen Stream
 * - Responsive Mobile-First Design
 */

import { useEffect } from 'react';
import { useTikTokLive } from '@/hooks/useTikTokLive';
import { StatsWidget } from '@/components/StatsWidget';
import { ChatWidget } from '@/components/ChatWidget';
import { GiftsWidget } from '@/components/GiftsWidget';
import { StreamInfoWidget } from '@/components/StreamInfoWidget';
import { ActivityWidget } from '@/components/ActivityWidget';
import { DebugWidget } from '@/components/DebugWidget';
import { GiftListWidget } from '@/components/GiftListWidget';
import { LikesPerSecondWidget } from '@/components/LikesPerSecondWidget';
import { LikesHistoryChart } from '@/components/LikesHistoryChart';
import { ViewerHistoryChart } from '@/components/ViewerHistoryChart';
import { FollowerHistoryChart } from '@/components/FollowerHistoryChart';
import { DiamondHistoryChart } from '@/components/DiamondHistoryChart';
import { GiftsFeed } from '@/components/GiftsFeed';
import { TopUsersWidget } from '@/components/TopUsersWidget';
import { EngagementRateChart } from '@/components/EngagementRateChart';
import { ViewerTrendWidget } from '@/components/ViewerTrendWidget';
import { CombinedTimelineChart } from '@/components/CombinedTimelineChart';

interface StreamMonitorProps {
  username: string;
  isActive: boolean;
}

export function StreamMonitor({ username, isActive }: StreamMonitorProps) {
  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    stats,
    roomInfo,
    error,
    usingApiKey,
    retryingWithApiKey,
  } = useTikTokLive();

  // Auto-connect when component mounts
  useEffect(() => {
    if (username && !isConnected && !isConnecting) {
      console.log(`[StreamMonitor] Auto-connecting to @${username}`);
      connect(username);
    }

    return () => {
      if (isConnected) {
        console.log(`[StreamMonitor] Disconnecting from @${username}`);
        disconnect();
      }
    };
  }, [username]);

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
      {/* Connection Status - Mobile Optimized */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4">
        {retryingWithApiKey ? (
          <div className="flex flex-col items-center justify-center gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base font-semibold text-purple-300">
                🔑 Aktiviere EulerStream API...
              </span>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Rate Limit erreicht - Wechsle zu API (unbegrenzte Verbindungen)
            </div>
          </div>
        ) : isConnecting ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm sm:text-base font-semibold text-gray-200">
              Verbinde mit @{username}...
            </span>
          </div>
        ) : isConnected ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-white">
                    Verbunden: @{username}
                  </span>
                  {usingApiKey && (
                    <span className="px-2 py-0.5 bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded text-xs font-medium">
                      🔑 API
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {usingApiKey ? 'EulerStream API aktiv (kein Rate Limit)' : 'Live Datenerfassung aktiv'}
                </div>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="w-full sm:w-auto px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 rounded-lg font-semibold transition-colors text-sm"
            >
              Trennen
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-gray-600 rounded-full"></div>
              <span className="text-sm sm:text-base font-semibold text-gray-400">
                Getrennt: @{username}
              </span>
            </div>
            <button
              onClick={() => connect(username)}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-sm"
            >
              Neu verbinden
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 p-4 bg-red-900/30 border border-red-800/50 text-red-300 rounded-lg text-xs sm:text-sm">
            <div className="font-bold text-red-400 mb-2 flex items-center gap-2">
              ⚠️ Fehler
            </div>
            <div className="whitespace-pre-line leading-relaxed">
              {error}
            </div>
            {error.includes('eulerstream') && (
              <div className="mt-3 pt-3 border-t border-red-800/50">
                <a
                  href="https://www.eulerstream.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium"
                >
                  🔑 Kostenlosen API-Key holen
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dashboard - Mobile First Grid */}
      {isConnected && (
        <>
          {/* Stats Overview + Like Rate in one unified grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {/* Zuschauer */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                👥 Zuschauer
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">
                {stats.viewerCount.toLocaleString('de-DE')}
              </div>
            </div>

            {/* Likes */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                ❤️ Likes
              </div>
              <div className="text-xl sm:text-2xl font-bold text-pink-400">
                {(stats.streamTotalLikes || stats.totalLikes).toLocaleString('de-DE')}
              </div>
            </div>

            {/* Geschenke */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                🎁 Geschenke
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-400">
                {stats.totalGifts.toLocaleString('de-DE')}
              </div>
            </div>

            {/* Diamanten */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                💎 Diamanten
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {stats.totalDiamonds.toLocaleString('de-DE')}
              </div>
            </div>

            {/* Follower */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-3 sm:p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                ➕ Follower
              </div>
              <div className="text-xl sm:text-2xl font-bold text-orange-400">
                {stats.followCount.toLocaleString('de-DE')}
              </div>
            </div>

            {/* Like-Rate Widget */}
            <LikesPerSecondWidget likesPerSecond={stats.likesPerSecond} />
          </div>

          {/* Live Gifts Feed - Full Width */}
          <GiftsFeed gifts={stats.gifts} />

          {/* Top Users Widget - Full Width */}
          <TopUsersWidget userStats={stats.userStats} />

          {/* 3-Column Layout: Mobile stack, Tablet 2-col, Desktop 3-col */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Column 1 - Stream Info & Activity (mobile: first, desktop: left) */}
            <div className="space-y-3 sm:space-y-4 lg:order-1 order-first">
              <StreamInfoWidget
                roomInfo={roomInfo}
                username={username}
                totalFollowers={stats.totalFollowers}
              />

              <ActivityWidget joins={stats.joins} follows={stats.follows} />

              {/* Viewer Trend Widget */}
              <ViewerTrendWidget
                viewerHistory={stats.viewerHistory}
                peakViewers={stats.peakViewers}
                currentViewers={stats.viewerCount}
              />
            </div>

            {/* Column 2 - Charts & Chat (middle) */}
            <div className="space-y-3 sm:space-y-4 lg:order-2">
              {/* Likes History Chart */}
              <LikesHistoryChart minuteHistory={stats.minuteHistory} />

              {/* Viewer History Chart */}
              <ViewerHistoryChart viewerHistory={stats.viewerHistory} />

              {/* Engagement Rate Chart */}
              <EngagementRateChart engagementHistory={stats.engagementHistory} />

              {/* Chat Widget */}
              <ChatWidget messages={stats.chatMessages} />
            </div>

            {/* Column 3 - Charts & Other (right) */}
            <div className="space-y-3 sm:space-y-4 lg:order-3">
              {/* Follower History Chart */}
              <FollowerHistoryChart followerHistory={stats.followerHistory} />

              {/* Diamond History Chart */}
              <DiamondHistoryChart diamondHistory={stats.diamondHistory} />

              {/* Gift List Widget */}
              <GiftListWidget giftCatalog={stats.availableGifts} />

              {/* Debug Widget */}
              <DebugWidget roomInfo={roomInfo} />
            </div>
          </div>

          {/* Combined Timeline Chart - Full Width HIGHLIGHT */}
          <CombinedTimelineChart
            viewerHistory={stats.viewerHistory}
            minuteHistory={stats.minuteHistory}
            followerHistory={stats.followerHistory}
            diamondHistory={stats.diamondHistory}
            chatActivityHistory={stats.chatActivityHistory}
          />
        </>
      )}
    </div>
  );
}
