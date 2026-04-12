'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Bookmarks — localStorage-backed "save for later" feature.
 *
 * Privacy-first: all state lives in the browser, nothing sent to the server.
 * Syncs across tabs via the `storage` event.
 *
 * Storage key: `factory_bookmarks_v1` (bump version in the constant below if the
 * shape ever changes, so old bookmarks are ignored rather than crash the app).
 */

export interface Bookmark {
  /** Unique stable id — use post.slug or offer.slug prefixed with type. */
  id: string;
  type: 'post' | 'offer';
  title: string;
  /** Site-relative path, e.g. /blog/some-post or /offers/some-offer */
  url: string;
  image?: string;
  excerpt?: string;
  /** ISO timestamp when bookmarked. */
  savedAt: string;
}

const STORAGE_KEY = 'factory_bookmarks_v1';

function readStorage(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidBookmark) : [];
  } catch {
    return [];
  }
}

function writeStorage(bookmarks: Bookmark[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Storage quota exceeded or private mode — silently ignore.
  }
}

function isValidBookmark(b: unknown): b is Bookmark {
  if (!b || typeof b !== 'object') return false;
  const x = b as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    (x.type === 'post' || x.type === 'offer') &&
    typeof x.title === 'string' &&
    typeof x.url === 'string' &&
    typeof x.savedAt === 'string'
  );
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initial read
  useEffect(() => {
    setBookmarks(readStorage());
    setIsHydrated(true);
  }, []);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setBookmarks(readStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'savedAt'>) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === bookmark.id)) return prev;
      const next = [{ ...bookmark, savedAt: new Date().toISOString() }, ...prev];
      writeStorage(next);
      return next;
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback(
    (bookmark: Omit<Bookmark, 'savedAt'>) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.id === bookmark.id);
        const next = exists
          ? prev.filter((b) => b.id !== bookmark.id)
          : [{ ...bookmark, savedAt: new Date().toISOString() }, ...prev];
        writeStorage(next);
        return next;
      });
    },
    []
  );

  const clearAll = useCallback(() => {
    setBookmarks([]);
    writeStorage([]);
  }, []);

  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearAll,
    isHydrated,
  };
}
