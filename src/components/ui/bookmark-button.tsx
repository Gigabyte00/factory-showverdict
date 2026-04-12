'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks, type Bookmark as BookmarkData } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  bookmark: Omit<BookmarkData, 'savedAt'>;
  /** Visual style — "icon" for compact card corners, "labeled" for article toolbars */
  variant?: 'icon' | 'labeled';
  className?: string;
}

/**
 * Toggle a post or offer in/out of the reader's local bookmarks list.
 *
 * Uses localStorage only — nothing sent to the server. Keeps UI honest:
 * after hydration the button shows the current saved state; before hydration
 * it shows the unsaved state to avoid a SSR / CSR mismatch flash.
 */
export function BookmarkButton({ bookmark, variant = 'icon', className }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isHydrated } = useBookmarks();
  const saved = isHydrated && isBookmarked(bookmark.id);
  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? 'Saved' : 'Save';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(bookmark);
  };

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${bookmark.title} from bookmarks` : `Save ${bookmark.title} for later`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          'border',
          saved
            ? 'bg-primary/10 text-primary border-primary/40 hover:bg-primary/15'
            : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground',
          className
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${bookmark.title} from bookmarks` : `Save ${bookmark.title} for later`}
      className={cn(
        'inline-flex items-center justify-center rounded-full h-9 w-9 transition-colors',
        'bg-background/80 backdrop-blur border border-border',
        saved
          ? 'text-primary hover:bg-primary/10'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
