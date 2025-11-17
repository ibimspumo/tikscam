'use client';

import { useEffect } from 'react';
import { useTikTokLive } from '@/hooks/useTikTokLive';
import { useTranslation } from '@/lib/i18n';
import {
  StreamInfoWidget,
  ActivityWidget,
  DebugWidget,
  GiftListWidget,
  LikesPerSecondWidget,
  LikesHistoryChart,
  ViewerHistoryChart,
  FollowerHistoryChart,
  DiamondHistoryChart,
  GiftsFeedWidget,
  EngagementRateChart,
  ViewerTrendWidget,
  CombinedTimelineChart,
  StatsCard,
  ChatWidget,
  TopUsersWidget,
  WidgetErrorBoundary,
} from '@/components/widgets';
import { ApiKeyDialog } from '@/components/dialogs/ApiKeyDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Heart,
  Gift,
  Gem,
  UserPlus,
  Wifi,
  WifiOff,
  AlertCircle,
  Key,
  ExternalLink
} from 'lucide-react';

interface StreamMonitorProps {
  username: string;
  isActive: boolean;
}

export function StreamMonitor({ username, isActive }: StreamMonitorProps) {
  const { t } = useTranslation();
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
    needsUserApiKey,
    setUserApiKey,
    userApiKey,
    connectionStatus,
    permanentError,
    currentPhase,
    currentAttempt,
    maxAttempts,
    lastError,
  } = useTikTokLive();

  // Helper to get phase display info
  const getPhaseInfo = (phase: typeof currentPhase) => {
    switch (phase) {
      case 'direct':
        return { icon: '📡', label: 'Phase 1: Direct Connection', color: 'text-blue-500' };
      case 'server-api':
        return { icon: '🔑', label: 'Phase 2: Server API Key', color: 'text-yellow-500' };
      case 'user-api':
        return { icon: '👤', label: 'Phase 3: Your API Key', color: 'text-green-500' };
      case 'needs-user-api':
        return { icon: '💬', label: 'Waiting for API Key', color: 'text-orange-500' };
      default:
        return { icon: '⚡', label: 'Connecting', color: 'text-primary' };
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);

  // Auto-connect when component mounts (ONLY on username change)
  useEffect(() => {
    // ONLY auto-connect when username changes (component mount or tab switch)
    // All other cases (reconnection) should be handled manually by user clicking "Reconnect"
    console.log(`[StreamMonitor] ✅ Mounting for username: @${username}`);
    connect(username);

    return () => {
      console.log(`[StreamMonitor] 🧹 Unmounting for @${username}`);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]); // ONLY username - prevents reconnection loops!

  // Auto-Reconnect (DISABLED - we use 5-phase system now, no auto-reconnect)
  // The backend will go through all phases automatically:
  // Phase 1: 5x direct -> Phase 2: 5x server API -> Phase 3: ask user for API key
  // No need for auto-reconnect, the connection logic is handled entirely by the backend
  useEffect(() => {
    // Auto-reconnect is DISABLED - permanent errors should NOT reconnect
    // The user must manually click "Reconnect" button
    if (permanentError) {
      console.log(`[StreamMonitor] 🛑 Permanent error detected - auto-reconnect DISABLED`);
    }
  }, [permanentError]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Connection Status */}
      <Card className={isConnected ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
        <CardContent className="p-4">
          {retryingWithApiKey ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">
                  <Key className="inline h-4 w-4 mr-1" />
                  {t('streamMonitor.activatingApi')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {t('streamMonitor.rateLimitReached')}
              </p>
            </div>
          ) : isConnecting ? (
            <div className="flex flex-col gap-4 py-2">
              {/* Phase Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">{t('streamMonitor.connectingTo')} @{username}</span>
                </div>
                {currentPhase && (
                  <span className={`text-sm font-medium ${phaseInfo.color}`}>
                    {phaseInfo.icon} {phaseInfo.label}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {currentAttempt > 0 && maxAttempts > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Attempt {currentAttempt} of {maxAttempts}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round((currentAttempt / maxAttempts) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${(currentAttempt / maxAttempts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {connectionStatus && (
                <div className="text-sm text-center p-2 bg-muted/50 rounded-md">
                  {connectionStatus}
                </div>
              )}

              {/* Last Error (if any) */}
              {lastError && (
                <div className="text-xs p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="font-semibold text-destructive mb-1">Last Error:</div>
                  <div className="text-muted-foreground line-clamp-2">{lastError}</div>
                </div>
              )}
            </div>
          ) : isConnected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t('streamMonitor.connectedTo')} @{username}</span>
                    {usingApiKey && (
                      <Badge variant="secondary" className="gap-1">
                        <Key className="h-3 w-3" /> API
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usingApiKey ? t('streamMonitor.apiActive') : t('streamMonitor.liveDataActive')}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnect}
                aria-label={`Disconnect from @${username}`}
              >
                {t('streamMonitor.disconnect')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">{t('streamMonitor.disconnected')} @{username}</span>
              </div>
              <Button
                size="sm"
                onClick={() => connect(username)}
                aria-label={`Reconnect to @${username}`}
              >
                {t('streamMonitor.reconnect')}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                {t('streamMonitor.error')}
              </div>
              <p className="text-sm whitespace-pre-line">{error}</p>
              {error.includes('eulerstream') && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <a
                      href="https://www.eulerstream.com/pricing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                      aria-label="Get free EulerStream API key"
                    >
                      <Key className="h-4 w-4" />
                      Kostenlosen API-Key holen
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard */}
      {isConnected && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatsCard
              title="Viewers"
              value={stats.viewerCount.toLocaleString('en-US')}
              icon={Users}
            />
            <StatsCard
              title="Likes"
              value={(stats.streamTotalLikes || stats.totalLikes).toLocaleString('en-US')}
              icon={Heart}
            />
            <StatsCard
              title="Gifts"
              value={stats.totalGifts.toLocaleString('en-US')}
              icon={Gift}
            />
            <StatsCard
              title="Diamonds"
              value={stats.totalDiamonds.toLocaleString('en-US')}
              icon={Gem}
            />
            <StatsCard
              title="Follower"
              value={stats.followCount.toLocaleString('en-US')}
              icon={UserPlus}
            />
            <LikesPerSecondWidget likesPerSecond={stats.likesPerSecond} />
          </div>

          {/* Live Gifts Feed */}
          <WidgetErrorBoundary>
            <GiftsFeedWidget gifts={stats.gifts} />
          </WidgetErrorBoundary>

          {/* Top Users */}
          <TopUsersWidget userStats={stats.userStats} />

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <StreamInfoWidget
                roomInfo={roomInfo}
                username={username}
                totalFollowers={stats.totalFollowers}
              />
              <ActivityWidget joins={stats.joins} follows={stats.follows} />
              <ViewerTrendWidget
                viewerHistory={stats.viewerHistory}
                peakViewers={stats.peakViewers}
                currentViewers={stats.viewerCount}
              />
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <LikesHistoryChart minuteHistory={stats.minuteHistory} />
              <ViewerHistoryChart viewerHistory={stats.viewerHistory} />
              <EngagementRateChart engagementHistory={stats.engagementHistory} />
              <WidgetErrorBoundary>
              <ChatWidget messages={stats.chatMessages} />
            </WidgetErrorBoundary>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <FollowerHistoryChart followerHistory={stats.followerHistory} />
              <DiamondHistoryChart diamondHistory={stats.diamondHistory} />
              <GiftListWidget giftCatalog={stats.availableGifts} />
              <DebugWidget roomInfo={roomInfo} />
            </div>
          </div>

          {/* Combined Timeline Chart */}
          <CombinedTimelineChart
            viewerHistory={stats.viewerHistory}
            minuteHistory={stats.minuteHistory}
            followerHistory={stats.followerHistory}
            diamondHistory={stats.diamondHistory}
            chatActivityHistory={stats.chatActivityHistory}
          />
        </>
      )}

      {/* API Key Dialog */}
      <ApiKeyDialog
        isOpen={needsUserApiKey}
        onClose={() => {
          // User cancelled - just close the dialog
        }}
        onSubmit={(apiKey) => {
          setUserApiKey(apiKey);
          // Reconnect with the user's API key
          connect(username, apiKey);
        }}
        error={error}
      />
    </div>
  );
}
