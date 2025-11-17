/**
 * Shared Type Definitions for Widget Components
 *
 * This file contains base types and patterns for widget components
 * to ensure consistency across the application.
 */

/**
 * Base props for all widget components
 */
export interface BaseWidgetProps {
  className?: string;
}

/**
 * Props for data-driven widgets with loading/error states
 */
export interface DataWidgetProps<T> extends BaseWidgetProps {
  data: T;
  loading?: boolean;
  error?: string | null;
}

/**
 * Props for chart widgets with common configuration
 */
export interface ChartWidgetProps extends BaseWidgetProps {
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
}
