'use client';

import { ReactNode } from 'react';
import { CheckCircle, Lightbulb, AlertTriangle, Star } from 'lucide-react';

type TakeawayVariant = 'default' | 'success' | 'tip' | 'warning' | 'highlight';

interface Takeaway {
  /**
   * The takeaway text content.
   */
  text: string;
  /**
   * Optional emphasis level (higher = more important).
   */
  emphasis?: 'normal' | 'high';
}

interface KeyTakeawaysProps {
  /**
   * List of takeaway items to display.
   */
  takeaways: (string | Takeaway)[];
  /**
   * Optional title for the section.
   * @default "Key Takeaways"
   */
  title?: string;
  /**
   * Visual variant for the component.
   */
  variant?: TakeawayVariant;
  /**
   * Optional CSS class for styling.
   */
  className?: string;
  /**
   * Custom icon to display (overrides variant icon).
   */
  icon?: ReactNode;
  /**
   * Whether to include the section in speakable content.
   * When true, adds data attributes for AI/voice extraction.
   */
  speakable?: boolean;
  /**
   * ID for the section (required if speakable is true).
   */
  id?: string;
}

const variantConfig: Record<TakeawayVariant, { icon: ReactNode; containerClass: string; iconClass: string }> = {
  default: {
    icon: <CheckCircle className="h-5 w-5" />,
    containerClass: 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700',
    iconClass: 'text-slate-600 dark:text-slate-400',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    containerClass: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    containerClass: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    containerClass: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  highlight: {
    icon: <Star className="h-5 w-5" />,
    containerClass: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
};

/**
 * KeyTakeaways Component
 *
 * Displays a visually prominent list of key points from an article.
 * Optimized for AI extraction and voice assistants with:
 * - Semantic HTML structure
 * - Clear visual hierarchy
 * - Optional speakable data attributes
 * - Answer-first formatting (great for featured snippets)
 *
 * Usage:
 * ```tsx
 * <KeyTakeaways
 *   id="article-takeaways"
 *   speakable
 *   takeaways={[
 *     "The RadCity 5 Plus offers the best value for commuters",
 *     "Battery range averages 45 miles on a single charge",
 *     { text: "Priced at $1,699", emphasis: "high" }
 *   ]}
 * />
 * ```
 */
export function KeyTakeaways({
  takeaways,
  title = 'Key Takeaways',
  variant = 'default',
  className = '',
  icon,
  speakable = false,
  id,
}: KeyTakeawaysProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  // Normalize takeaways to objects
  const normalizedTakeaways: Takeaway[] = takeaways.map((t) =>
    typeof t === 'string' ? { text: t, emphasis: 'normal' } : t
  );

  return (
    <aside
      id={id}
      className={`
        my-8 rounded-lg border-2 p-6
        ${config.containerClass}
        ${className}
      `}
      role="complementary"
      aria-labelledby={id ? `${id}-title` : undefined}
      {...(speakable && {
        'data-speakable': 'true',
        'data-speakable-priority': 'high',
      })}
    >
      <h3
        id={id ? `${id}-title` : undefined}
        className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
      >
        <span className={config.iconClass}>{displayIcon}</span>
        {title}
      </h3>

      <ul className="space-y-3">
        {normalizedTakeaways.map((takeaway, index) => (
          <li
            key={index}
            className={`
              flex items-start gap-3 text-slate-700 dark:text-slate-300
              ${takeaway.emphasis === 'high' ? 'font-medium' : ''}
            `}
          >
            <span
              className={`
                mt-1.5 h-2 w-2 flex-shrink-0 rounded-full
                ${takeaway.emphasis === 'high' ? 'bg-current' : 'bg-slate-400 dark:bg-slate-500'}
              `}
              aria-hidden="true"
            />
            <span>{takeaway.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * Generates the takeaways as plain text for AI extraction.
 * Useful for including in meta descriptions or structured data.
 *
 * @param takeaways - Array of takeaway strings or objects
 * @returns Formatted string of takeaways
 */
export function takeawaysToText(takeaways: (string | Takeaway)[]): string {
  return takeaways
    .map((t, i) => {
      const text = typeof t === 'string' ? t : t.text;
      return `${i + 1}. ${text}`;
    })
    .join(' ');
}

export default KeyTakeaways;
