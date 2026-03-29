import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProseProps {
  children: React.ReactNode;
  className?: string;
  /** Size variant - affects font size and spacing */
  size?: 'sm' | 'base' | 'lg';
}

/**
 * Prose wrapper component for rich text content.
 * Applies Tailwind Typography styles with dark mode support.
 *
 * @example
 * <Prose>
 *   <ReactMarkdown>{content}</ReactMarkdown>
 * </Prose>
 */
export function Prose({ children, className, size = 'lg' }: ProseProps) {
  const sizeClasses = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
  };

  return (
    <div
      className={cn(
        'prose max-w-none',
        sizeClasses[size],
        // Dark mode
        'dark:prose-invert',
        // Headings
        'prose-headings:font-bold prose-headings:tracking-tight',
        // Links - use primary color
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        // Images
        'prose-img:rounded-lg prose-img:shadow-md',
        // Code blocks
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
        // Blockquotes
        'prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic',
        // Tables
        'prose-table:border prose-table:border-border',
        'prose-th:bg-muted prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2',
        'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2',
        // Lists
        'prose-li:marker:text-muted-foreground',
        // HR
        'prose-hr:border-border',
        className
      )}
    >
      {children}
    </div>
  );
}
