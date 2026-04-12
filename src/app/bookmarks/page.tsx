import type { Metadata } from 'next';
import { BookmarksList } from './BookmarksList';

export const metadata: Metadata = {
  title: 'Saved Articles',
  description: 'Articles and offers you have saved for later. Your bookmarks live locally on this device and are never sent to our servers.',
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved for Later</h1>
        <p className="text-muted-foreground">
          Your bookmarks are stored on this device only — we don&apos;t sync or track them. Clear them any time.
        </p>
      </header>
      <BookmarksList />
    </div>
  );
}
