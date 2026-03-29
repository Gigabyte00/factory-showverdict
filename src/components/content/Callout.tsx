import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  type LucideIcon
} from 'lucide-react';

type CalloutVariant = 'info' | 'tip' | 'warning' | 'success' | 'danger';

interface CalloutProps {
  children: React.ReactNode;
  variant?: CalloutVariant;
  title?: string;
  className?: string;
  /** Custom icon to override the default */
  icon?: LucideIcon;
}

const variantConfig: Record<CalloutVariant, {
  icon: LucideIcon;
  containerClass: string;
  iconClass: string;
  titleClass: string;
}> = {
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-800 dark:text-blue-200',
  },
  tip: {
    icon: Lightbulb,
    containerClass: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900',
    iconClass: 'text-purple-600 dark:text-purple-400',
    titleClass: 'text-purple-800 dark:text-purple-200',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900',
    iconClass: 'text-yellow-600 dark:text-yellow-500',
    titleClass: 'text-yellow-800 dark:text-yellow-200',
  },
  success: {
    icon: CheckCircle2,
    containerClass: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-800 dark:text-green-200',
  },
  danger: {
    icon: XCircle,
    containerClass: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-200',
  },
};

/**
 * Callout component for highlighting important information.
 * Supports multiple variants for different use cases.
 *
 * @example
 * <Callout variant="warning" title="Important">
 *   This is a warning message.
 * </Callout>
 *
 * @example
 * <Callout variant="tip">
 *   Pro tip: Use this for helpful hints.
 * </Callout>
 */
export function Callout({
  children,
  variant = 'info',
  title,
  className,
  icon: CustomIcon,
}: CalloutProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        config.containerClass,
        className
      )}
      role="note"
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClass)} />
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('font-semibold mb-1', config.titleClass)}>
              {title}
            </p>
          )}
          <div className="text-sm text-foreground/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
