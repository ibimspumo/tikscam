'use client';

import { useEffect, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Heart,
  Gift as GiftIcon,
  Gem,
  UserPlus,
  Wifi,
  WifiOff,
  AlertCircle,
  Key,
  RefreshCw,
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
    retry,
    setConnectionMode,
    setApiKey,
    isConnected,
    isConnecting,
    connectionMode,
    apiKey,
    stats,
    roomInfo,
    error,
  } = useTikTokLive();

  // Local state for API key input
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Auto-connect when username changes
  useEffect(() => {
    if (isActive && username) {
      connect(username);
    }

    return () => {
      if (isActive) {
        disconnect();
      }
    };
  }, [username, isActive]); // Only reconnect when username or active status changes

  const handleModeToggle = () => {
    if (connectionMode === 'free') {
      setShowApiKeyInput(true);
    } else {
      setConnectionMode('free');
      setApiKey('');
      setApiKeyInput('');
      setShowApiKeyInput(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setConnectionMode('api-key');
      setShowApiKeyInput(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Connection Status */}
      <Card className={isConnected ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Status Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-semibold">
                      {connectionMode === 'api-key' ? 'Connecting with API key...' : 'Connecting (free mode)...'}
                    </span>
                  </>
                ) : isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-500">Connected to @{username}</span>
                  </>
                ) : error ? (
                  <>
                    <WifiOff className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-red-500">Disconnected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">Not connected</span>
                  </>
                )}
              </div>

              {/* Mode Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {connectionMode === 'api-key' ? 'API Key Mode' : 'Free Mode'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleModeToggle}
                  disabled={isConnecting}
                >
                  <Key className="h-3 w-3 mr-1" />
                  {connectionMode === 'api-key' ? 'Switch to Free' : 'Use API Key'}
                </Button>
              </div>
            </div>

            {/* API Key Input */}
            {showApiKeyInput && (
              <div className="flex gap-2 p-3 bg-muted rounded-lg">
                <Input
                  type="password"
                  placeholder="Enter your EulerStream API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                  className="flex-1"
                />
                <Button onClick={handleApiKeySubmit} disabled={!apiKeyInput.trim()}>
                  Connect
                </Button>
                <Button variant="ghost" onClick={() => setShowApiKeyInput(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && !isConnecting && (
              <div className="flex flex-col gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-destructive">Connection Error</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>

                    {/* Contextual hints based on error type */}
                    {error.includes('EulerStream') && connectionMode === 'free' && (
                      <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        Tip: Try switching to API key mode for more reliable connections
                      </p>
                    )}
                    {error.includes('rate limit') && connectionMode === 'free' && (
                      <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        Tip: Use an API key to bypass rate limits
                      </p>
                    )}
                    {error.includes('not live') && (
                      <p className="text-xs text-yellow-400 mt-2">
                        Make sure the user is currently streaming on TikTok
                      </p>
                    )}
                    {error.includes('User not found') && (
                      <p className="text-xs text-yellow-400 mt-2">
                        Double-check the username spelling (without @)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={retry}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </Button>
                  {connectionMode === 'free' && (error.includes('EulerStream') || error.includes('rate limit') || error.includes('blocked')) && (
                    <Button
                      onClick={() => setShowApiKeyInput(true)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Use API Key
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Connected Info */}
            {isConnected && roomInfo && (
              <div className="text-sm text-muted-foreground">
                <p>Stream: {roomInfo.title || 'Untitled'}</p>
                {connectionMode === 'api-key' && (
                  <p className="text-xs text-green-600 mt-1">Using API key connection</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards (only when connected) */}
      {isConnected && (
        <>
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatsCard
              icon={<Users className="h-4 w-4 text-blue-500" />}
              label={t('stats.viewers')}
              value={stats.viewerCount.toLocaleString('en-US')}
              color="blue"
            />
            <StatsCard
              icon={<Heart className="h-4 w-4 text-pink-500" />}
              label={t('stats.totalLikes')}
              value={stats.totalLikes.toLocaleString('en-US')}
              color="pink"
            />
            <StatsCard
              icon={<GiftIcon className="h-4 w-4 text-purple-500" />}
              label={t('stats.gifts')}
              value={stats.totalGifts.toLocaleString('en-US')}
              color="purple"
            />
            <StatsCard
              icon={<Gem className="h-4 w-4 text-cyan-500" />}
              label={t('stats.diamonds')}
              value={stats.totalDiamonds.toLocaleString('en-US')}
              color="cyan"
            />
            <StatsCard
              icon={<UserPlus className="h-4 w-4 text-orange-500" />}
              label={t('stats.newFollowers')}
              value={stats.followCount.toLocaleString('en-US')}
              color="orange"
            />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column - Widgets */}
            <div className="lg:col-span-1 space-y-4">
              <StreamInfoWidget roomInfo={roomInfo} username={username} stats={stats} />
              <LikesPerSecondWidget likesPerSecond={stats.likesPerSecond} />
              <ViewerTrendWidget
                viewerCount={stats.viewerCount}
                peakViewers={stats.peakViewers}
              />
              <ActivityWidget
                joins={stats.joins}
                follows={stats.follows}
              />
            </div>

            {/* Middle Column - Charts */}
            <div className="lg:col-span-2 space-y-4">
              <WidgetErrorBoundary>
                <CombinedTimelineChart
                  viewerHistory={stats.viewerHistory}
                  minuteHistory={stats.minuteHistory}
                  followerHistory={stats.followerHistory}
                  diamondHistory={stats.diamondHistory}
                  chatActivityHistory={stats.chatActivityHistory}
                />
              </WidgetErrorBoundary>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LikesHistoryChart minuteHistory={stats.minuteHistory} />
                <ViewerHistoryChart viewerHistory={stats.viewerHistory} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FollowerHistoryChart followerHistory={stats.followerHistory} />
                <DiamondHistoryChart diamondHistory={stats.diamondHistory} />
              </div>

              <EngagementRateChart engagementHistory={stats.engagementHistory} />
            </div>
          </div>

          {/* Bottom Section - Gifts, Chat, Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WidgetErrorBoundary>
              <GiftsFeedWidget
                gifts={stats.gifts}
                availableGifts={stats.availableGifts}
              />
            </WidgetErrorBoundary>

            <WidgetErrorBoundary>
              <ChatWidget chatMessages={stats.chatMessages} />
            </WidgetErrorBoundary>
          </div>

          {/* Top Users & Gift List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopUsersWidget userStats={stats.userStats} />
            <GiftListWidget availableGifts={stats.availableGifts} />
          </div>

          {/* Debug Widget (collapsed by default) */}
          <DebugWidget
            stats={stats}
            roomInfo={roomInfo}
            isConnected={isConnected}
          />
        </>
      )}
    </div>
  );
}
