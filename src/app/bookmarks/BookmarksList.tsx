'use client';

import Link from 'next/link';
import { BookmarkX, BookOpen, Tag } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BookmarksList() {
  const { bookmarks, removeBookmark, clearAll, isHydrated } = useBookmarks();

  if (!isHydrated) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">Loading your bookmarks…</div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Tap the bookmark icon on any article or product page to save it here for later. Great for comparison shopping or coming back to a long read.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Browse articles →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const posts = bookmarks.filter((b) => b.type === 'post');
  const offers = bookmarks.filter((b) => b.type === 'offer');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {bookmarks.length} saved {bookmarks.length === 1 ? 'item' : 'items'}
        </p>
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive">
          <BookmarkX className="h-4 w-4 mr-1" aria-hidden="true" />
          Clear all
        </Button>
      </div>

      {posts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" /> Articles ({posts.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((bookmark) => (
              <Card key={bookmark.id} className="group overflow-hidden transition hover:border-primary/30">
                <CardContent className="p-0">
                  <Link href={bookmark.url} className="block">
                    {bookmark.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bookmark.image}
                        alt=""
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-muted">
                        <BookOpen className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition">
                        {bookmark.title}
                      </h3>
                      {bookmark.excerpt && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{bookmark.excerpt}</p>
                      )}
                      <p className="mt-3 text-xs text-muted-foreground">
                        Saved {new Date(bookmark.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${bookmark.title} from bookmarks`}
                    >
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" aria-hidden="true" /> Products ({offers.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((bookmark) => (
              <Card key={bookmark.id} className="group overflow-hidden transition hover:border-primary/30">
                <CardContent className="p-4 flex items-start gap-3">
                  {bookmark.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bookmark.image}
                      alt=""
                      className="h-20 w-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={bookmark.url} className="block">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition">
                        {bookmark.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Saved {new Date(bookmark.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.id)}
                      className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${bookmark.title} from bookmarks`}
                    >
                      Remove
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
