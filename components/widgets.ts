/**
 * Central exports for all components
 * All widgets are built with ShadCN UI
 *
 * Organized structure:
 * - widgets/ - Analytics widgets and feeds
 * - charts/ - Data visualization components
 * - layout/ - Page layout components
 * - dialogs/ - Modal dialogs
 * - ui/ - ShadCN base components
 */

// Error Boundary
export { ErrorBoundary, WidgetErrorBoundary } from './widgets/ErrorBoundary';

// Widgets
export { StreamInfoWidget } from './widgets/StreamInfoWidget';
export { ActivityWidget } from './widgets/ActivityWidget';
export { LikesPerSecondWidget } from './widgets/LikesPerSecondWidget';
export { GiftsFeedWidget } from './widgets/GiftsFeedWidget';
export { ViewerTrendWidget } from './widgets/ViewerTrendWidget';
export { GiftListWidget } from './widgets/GiftListWidget';
export { DebugWidget } from './widgets/DebugWidget';
export { ChatWidget } from './widgets/ChatWidget';
export { GiftsWidget } from './widgets/GiftsWidget';
export { TopUsersWidget } from './widgets/TopUsersWidget';

// Charts
export { LikesHistoryChart } from './charts/LikesHistoryChart';
export { ViewerHistoryChart } from './charts/ViewerHistoryChart';
export { FollowerHistoryChart } from './charts/FollowerHistoryChart';
export { DiamondHistoryChart } from './charts/DiamondHistoryChart';
export { EngagementRateChart } from './charts/EngagementRateChart';
export { CombinedTimelineChart } from './charts/CombinedTimelineChart';

// Layout
export { StreamMonitor } from './layout/StreamMonitor';
export { StreamTabs } from './layout/StreamTabs';
export { StatsCard } from './layout/StatsCard';

// Dialogs
export { AddStreamDialog } from './dialogs/AddStreamDialog';
