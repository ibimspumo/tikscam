/**
 * English translations for TikScam
 * This is the default and currently only language
 */

export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    noData: 'No data available',
    current: 'Current',
    average: 'Average',
    peak: 'Peak',
    now: 'Now',
    duration60Min: '60 Minutes History',
  },

  // Stream Tabs
  streamTabs: {
    welcome: 'Welcome to TikScam',
    welcomeDescription: 'Start your first stream monitoring to see live analytics',
    addStream: 'Add Stream',
    removeStream: 'Remove stream',
  },

  // Add Stream Dialog
  addStreamDialog: {
    title: 'Add Stream',
    description: 'Enter a TikTok username to monitor their stream',
    usernameLabel: 'TikTok Username',
    usernamePlaceholder: 'e.g. johndoe (without @)',
    important: 'Important:',
    requirement1: 'Stream must be LIVE',
    requirement2: 'Enter username without @',
    requirement3: 'Account must be public',
    cancel: 'Cancel',
    startStream: 'Start Stream',
  },

  // Stream Monitor
  streamMonitor: {
    connecting: 'Connecting to stream...',
    connectingTo: 'Connecting to',
    connected: 'Connected',
    connectedTo: 'Connected:',
    disconnect: 'Disconnect',
    disconnected: 'Disconnected:',
    reconnect: 'Reconnect',
    reconnecting: 'Reconnecting...',
    error: 'Error',
    activatingApi: 'Activating EulerStream API...',
    rateLimitReached: 'Rate limit reached - Switching to API (unlimited connections)',
    liveDataActive: 'Live data collection active',
    apiActive: 'EulerStream API active (no rate limit)',
  },

  // Stream Info Widget
  streamInfo: {
    title: 'Stream Info',
    waiting: 'Waiting for stream information...',
    noTitle: 'No Title',
    streamTitle: 'Stream Title',
    likes: 'Likes',
    followers: 'Followers',
    viewers: 'Viewers',
  },

  // Activity Widget
  activity: {
    title: 'Activity',
    noActivity: 'No activity yet...',
    followed: 'followed',
    joined: 'joined',
  },

  // Likes Per Second Widget
  likesPerSecond: {
    title: 'Likes/Second',
    current: 'Current',
    average: 'Average',
    peak: 'Peak',
    last10s: 'Last 10s',
    last20s: 'Last 20s',
    last30s: 'Last 30s',
    last45s: 'Last 45s',
    last60s: 'Last 60s',
  },

  // Gifts
  gifts: {
    title: 'Gifts',
    feedTitle: 'Live Gifts Feed',
    catalogTitle: 'Gift Catalog',
    waiting: 'Waiting for gifts...',
    noGifts: 'No gifts received yet',
    searchPlaceholder: 'Search gifts...',
    types: 'Types',
    received: 'Received',
    sortByName: 'Name',
    sortByDiamonds: 'Diamonds',
    sortByCount: 'Count',
  },

  // Viewer Trend Widget
  viewerTrend: {
    title: 'Viewer Trend',
    current: 'Current',
    peak: 'Peak',
    average: 'Average',
    trend: 'Trend',
  },

  // Debug Widget
  debug: {
    title: 'Debug Info',
    rawData: 'Raw Stream Data',
  },

  // Chat Widget
  chat: {
    title: 'Live Chat',
    noMessages: 'No chat messages yet',
  },

  // Top Users Widget
  topUsers: {
    title: 'Top Users',
    noData: 'No data available yet',
    gifters: 'Gifters',
    chatters: 'Chatters',
    active: 'Active',
    messages: 'Messages',
  },

  // Charts
  charts: {
    likesHistory: 'Likes History',
    likesHistoryTitle: 'Likes/Second - 15 Min',
    viewerHistory: 'Viewer History',
    viewerHistoryTitle: 'Viewers - 15 Min',
    followerHistory: 'Follower History',
    followerHistoryTitle: 'New Followers/Interval - 15 Min',
    diamondHistory: 'Diamond History',
    diamondHistoryTitle: 'Diamonds/Interval - 15 Min',
    engagementRate: 'Engagement Rate',
    engagementRateTitle: 'Engagement Rate - 15 Min',
    engagementRateFormula: 'New Likes per Viewer per Interval (15s)',
    engagementRateDescription: 'Higher values mean more active viewers',
    combinedTimeline: 'Stream Timeline',
    combinedTimelineTitle: 'Stream Timeline - All Metrics',
    noData: 'No data yet',
    viewersLabel: 'Viewers',
    viewersLine: 'Viewers (Line)',
    likesLabel: 'Likes',
    likesPerSecondLine: 'Likes/s (Line)',
    followersLabel: 'Followers',
    newFollowers: 'New Followers',
    diamondsLabel: 'Diamonds',
    chatLabel: 'Chat',
    likesPerSecondLabel: 'Likes/Second',
    likesPerViewer: 'Likes/Viewer',
    lastInterval: 'Last Interval',
    total: 'Total',
    olderThan10Min: 'Older than 10 min',
    last10Min: 'Last 10 min',
  },

  // Stats Card
  stats: {
    totalLikes: 'Total Likes',
    currentViewers: 'Current Viewers',
    peakViewers: 'Peak Viewers',
    totalFollowers: 'Total Followers',
    newFollowers: 'New Followers',
    totalDiamonds: 'Total Diamonds',
    totalGifts: 'Total Gifts',
    chatMessages: 'Chat Messages',
  },

  // Error messages and connection
  connection: {
    failed: '⏰ Connection failed',
    possibleReasons: 'Possible reasons:',
    dailyLimitReached: '• Daily limit reached - Try again tomorrow',
    streamOffline: '• Stream is offline',
    networkProblem: '• Network problem',
    moreConnections: 'For more connections: eulerstream.com/pricing',
  },

  // Search and filters
  search: {
    noResultsFor: 'No gifts found for',
    messagesCount: 'messages',
    gift: 'Gift',
  },
} as const;

export type TranslationKey = typeof en;
