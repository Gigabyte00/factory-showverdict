'use client';
import '@/app/globals.css';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center font-sans bg-background text-foreground">
        <div className="text-center max-w-sm px-5">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-foreground text-background border-0 rounded-md cursor-pointer text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
